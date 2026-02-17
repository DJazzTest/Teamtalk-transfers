import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { API_FEEDS, ApiFeedEntry, ApiFeedEndpoint } from '@/data/apiFeeds';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, ExternalLink, PlusCircle, RefreshCcw, TestTube, CheckCircle, XCircle, Clock, MinusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CustomFeedForm {
  name: string;
  url: string;
  description: string;
  category: ApiFeedEntry['category'];
}

type TestStatus = 'idle' | 'testing' | 'success' | 'error' | 'skipped';

interface EndpointTestResult {
  status: TestStatus;
  responseTime?: number;
  error?: string;
  skipReason?: string;
}

const LOCAL_STORAGE_KEY = 'cms.customFeeds';

/** Build a testable URL by replacing known placeholders; returns null if URL requires auth or unknown params. */
function getTestUrl(endpoint: ApiFeedEndpoint): { url: string; skipped?: string } | null {
  let u = endpoint.url;
  const method = endpoint.method ?? 'GET';

  // Replacements that allow a real request
  const replacements: [RegExp | string, string][] = [
    ['{season}', '2024/25'],
    ['{window}', 'Summer'],
    ['{ISO}', new Date().toISOString()],
    ['{query}', 'arsenal'],
    ['{player}', 'messi'],
    ['{offset}', '0'],
    ['{topic}', 'transfers'],
    ['{type}', 'article'],
    ['{matchId}', '2999249'],
    ['{n}', '5'],
  ];
  for (const [key, value] of replacements) {
    u = u.split(key).join(encodeURIComponent(value));
  }
  // Relative URLs (Netlify functions) - prepend origin for fetch
  if (u.startsWith('/')) {
    u = window.location.origin + u;
  }

  // Skip if still has placeholders we can't fill
  if (/\{[^}]+\}/.test(u)) {
    return null;
  }
  return { url: u };
}

async function testEndpoint(endpoint: ApiFeedEndpoint): Promise<EndpointTestResult> {
  const testable = getTestUrl(endpoint);
  if (!testable) {
    return { status: 'skipped', skipReason: 'Requires auth or params' };
  }
  const method = endpoint.method ?? 'GET';
  const start = Date.now();
  try {
    const res = await fetch(testable.url, {
      method,
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15000),
    });
    const elapsed = Date.now() - start;
    if (!res.ok) {
      return { status: 'error', responseTime: elapsed, error: `HTTP ${res.status}` };
    }
    return { status: 'success', responseTime: elapsed };
  } catch (err) {
    const elapsed = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    return { status: 'error', responseTime: elapsed, error: message };
  }
}

function endpointKey(feedId: string, endpointId: string): string {
  return `${feedId}:${endpointId}`;
}

export const ApiFeedManager: React.FC = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [customFeeds, setCustomFeeds] = useState<ApiFeedEntry[]>([]);
  const [testResults, setTestResults] = useState<Record<string, EndpointTestResult>>({});
  const [testingKeys, setTestingKeys] = useState<Set<string>>(new Set());
  const [form, setForm] = useState<CustomFeedForm>({
    name: '',
    url: '',
    description: '',
    category: 'Transfers'
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setCustomFeeds(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to read custom feeds from storage', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customFeeds));
    } catch (error) {
      console.error('Failed to persist custom feeds', error);
    }
  }, [customFeeds]);

  const categories = useMemo(() => Array.from(new Set(API_FEEDS.map(feed => feed.category))), []);

  const feeds = useMemo(() => {
    const dataset = [...API_FEEDS, ...customFeeds];
    return dataset
      .filter(feed => {
        if (!query.trim()) return true;
        const search = query.toLowerCase();
        return (
          feed.name.toLowerCase().includes(search) ||
          feed.provider.toLowerCase().includes(search) ||
          feed.description.toLowerCase().includes(search) ||
          feed.endpoints.some(endpoint =>
            endpoint.label.toLowerCase().includes(search) ||
            endpoint.url.toLowerCase().includes(search)
          ) ||
          feed.tags?.some(tag => tag.toLowerCase().includes(search)) ||
          feed.usedBy.some(item => item.toLowerCase().includes(search))
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [query, customFeeds]);

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: 'Copied to clipboard',
        description: value,
      });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Unable to copy, please copy manually.',
        variant: 'destructive'
      });
      console.error('Clipboard copy failed', error);
    }
  };

  const handleFormChange = (field: keyof CustomFeedForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddCustomFeed = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.url.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Name and URL are required to add a custom feed.',
        variant: 'destructive'
      });
      return;
    }

    const newEntry: ApiFeedEntry = {
      id: `custom-${Date.now()}`,
      name: form.name.trim(),
      provider: 'Custom',
      category: form.category,
      environment: 'public',
      description: form.description.trim() || 'Custom feed added via CMS',
      usedBy: ['Manual'],
      endpoints: [
        {
          id: 'custom-endpoint',
          label: form.name.trim(),
          url: form.url.trim()
        }
      ]
    };

    setCustomFeeds(prev => [...prev, newEntry]);
    setForm({
      name: '',
      url: '',
      description: '',
      category: form.category
    });
    toast({
      title: 'Feed added',
      description: `${newEntry.name} saved locally.`
    });
  };

  const handleClearCustomFeeds = () => {
    setCustomFeeds([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    toast({
      title: 'Custom feeds cleared',
      description: 'All locally added feeds were removed.'
    });
  };

  const allFeedsForTest = useMemo(() => [...API_FEEDS, ...customFeeds], [customFeeds]);

  const testOne = useCallback(async (feedId: string, endpoint: ApiFeedEndpoint) => {
    const key = endpointKey(feedId, endpoint.id);
    setTestingKeys(prev => new Set(prev).add(key));
    setTestResults(prev => ({ ...prev, [key]: { status: 'testing' } }));
    const result = await testEndpoint(endpoint);
    setTestResults(prev => ({ ...prev, [key]: result }));
    setTestingKeys(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    return result;
  }, []);

  const testAllFeeds = useCallback(async () => {
    const keys: string[] = [];
    for (const feed of allFeedsForTest) {
      for (const ep of feed.endpoints) {
        keys.push(endpointKey(feed.id, ep.id));
      }
    }
    setTestingKeys(new Set(keys));
    const results: Record<string, EndpointTestResult> = {};
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    for (const feed of allFeedsForTest) {
      for (const ep of feed.endpoints) {
        const key = endpointKey(feed.id, ep.id);
        results[key] = { status: 'testing' };
      }
    }
    setTestResults(results);

    for (const feed of allFeedsForTest) {
      for (const ep of feed.endpoints) {
        const key = endpointKey(feed.id, ep.id);
        const result = await testEndpoint(ep);
        results[key] = result;
        setTestResults(prev => ({ ...prev, [key]: result }));
        if (result.status === 'success') passed++;
        else if (result.status === 'error') failed++;
        else skipped++;
      }
    }
    setTestingKeys(new Set());
    toast({
      title: 'Test all feeds complete',
      description: `Passed: ${passed}, Failed: ${failed}, Skipped: ${skipped}`,
      variant: failed > 0 ? 'destructive' : undefined,
    });
  }, [allFeedsForTest, toast]);

  const getTestIcon = (key: string) => {
    const r = testResults[key];
    if (!r) return null;
    if (r.status === 'testing' || testingKeys.has(key)) {
      return <Clock className="h-4 w-4 animate-spin text-blue-500" />;
    }
    if (r.status === 'success') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (r.status === 'error') return <XCircle className="h-4 w-4 text-red-500" />;
    if (r.status === 'skipped') return <MinusCircle className="h-4 w-4 text-slate-500" />;
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-xl">API & Feed Inventory</CardTitle>
            <Button
              onClick={testAllFeeds}
              disabled={testingKeys.size > 0}
              variant="outline"
              className="gap-2"
            >
              <TestTube className="h-4 w-4" />
              Test all feeds
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Search by name, provider, tag, or endpoint URL..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
              />
            </div>
          </div>

          <ScrollArea className="h-[60vh] rounded-md border border-slate-800 p-4">
            <div className="space-y-4">
              {feeds.map(feed => (
                <Card key={feed.id} className="bg-slate-900 border-slate-800">
                  <CardHeader className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg text-white">{feed.name}</CardTitle>
                        <p className="text-sm text-slate-400">{feed.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{feed.provider}</Badge>
                        <Badge variant="outline">{feed.category}</Badge>
                        {feed.environment && (
                          <Badge variant="outline" className="capitalize">
                            {feed.environment}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {feed.tags && (
                      <div className="flex flex-wrap gap-2">
                        {feed.tags.map(tag => (
                          <Badge key={tag} className="bg-slate-800 text-slate-200" variant="secondary">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs uppercase text-slate-500 mb-1">Used by</p>
                      <div className="flex flex-wrap gap-2">
                        {feed.usedBy.map(item => (
                          <Badge key={item} variant="outline" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {feed.endpoints.map(endpoint => {
                        const testKey = endpointKey(feed.id, endpoint.id);
                        const result = testResults[testKey];
                        const isTesting = testingKeys.has(testKey);
                        return (
                          <div key={endpoint.id} className="rounded-lg border border-slate-800 p-3 bg-slate-950">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                {endpoint.method && (
                                  <Badge variant="outline" className="text-xs uppercase">{endpoint.method}</Badge>
                                )}
                                <p className="font-semibold text-white">{endpoint.label}</p>
                                {getTestIcon(testKey)}
                                {result?.status === 'success' && result.responseTime != null && (
                                  <span className="text-xs text-green-500">{result.responseTime}ms</span>
                                )}
                                {result?.status === 'error' && (
                                  <span className="text-xs text-red-500">{result.error}</span>
                                )}
                                {result?.status === 'skipped' && result.skipReason && (
                                  <span className="text-xs text-slate-500">{result.skipReason}</span>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => testOne(feed.id, endpoint)}
                                  disabled={isTesting}
                                  className="gap-1"
                                >
                                  <TestTube className="h-3 w-3" />
                                  Test
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => handleCopy(endpoint.url)}>
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" asChild>
                                  <a href={endpoint.url.replace('{token}', '').replace('{season}', '2024/25')} target="_blank" rel="noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 break-all mt-1">{endpoint.url}</p>
                            {endpoint.notes && (
                              <p className="text-xs text-slate-500 mt-1">{endpoint.notes}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {feeds.length === 0 && (
                <div className="text-center text-slate-400 py-12">
                  No feeds match your filters.
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Add custom feed (local only)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleAddCustomFeed}>
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Feed name</label>
              <Input
                value={form.name}
                onChange={(event) => handleFormChange('name', event.target.value)}
                placeholder="e.g. Internal Transfers API"
                className="bg-slate-900 border-slate-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Category</label>
              <select
                value={form.category}
                onChange={(event) => handleFormChange('category', event.target.value as ApiFeedEntry['category'])}
                className="bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
                <option value="Utilities">Utilities</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm text-slate-400">Endpoint URL</label>
              <Input
                value={form.url}
                onChange={(event) => handleFormChange('url', event.target.value)}
                placeholder="https://api.example.com/v1/resource"
                className="bg-slate-900 border-slate-800"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm text-slate-400">Description</label>
              <textarea
                value={form.description}
                onChange={(event) => handleFormChange('description', event.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-white"
                placeholder="What is this feed used for?"
              />
            </div>
            <div className="md:col-span-2 flex flex-wrap gap-3">
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500">
                Save feed
              </Button>
              {customFeeds.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300"
                  onClick={handleClearCustomFeeds}
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Clear custom feeds
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};


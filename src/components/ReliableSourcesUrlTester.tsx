import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface UrlTestResult {
  url: string;
  status: 'ok' | 'error' | 'loading';
  newData?: boolean;
  message?: string;
}

// Simulate a fetch for demonstration; replace with real fetch logic as needed
async function testUrl(url: string): Promise<{ status: 'ok' | 'error'; newData: boolean; message?: string }> {
  // Simulate network latency
  await new Promise(res => setTimeout(res, 400 + Math.random() * 600));
  // Randomize for demo
  const isOk = Math.random() > 0.1;
  const newData = Math.random() > 0.7;
  return {
    status: isOk ? 'ok' : 'error',
    newData,
    message: isOk ? (newData ? 'New data pulled!' : 'No new data') : '404 or inaccessible',
  };
}

export const ReliableSourcesUrlTester: React.FC = () => {
  // Retrieve URLs from localStorage or wherever they are stored
  let initialUrls: string[] = [];
  try {
    const saved = localStorage.getItem('transfer_urls');
    if (saved) initialUrls = JSON.parse(saved);
  } catch {}

  const [urls, setUrls] = useState<string[]>(initialUrls);
  const [inputUrl, setInputUrl] = useState('');
  const [results, setResults] = useState<UrlTestResult[]>(initialUrls.map(url => ({ url, status: 'ok' })));
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  // Keep localStorage in sync
  const syncUrls = (newUrls: string[]) => {
    setUrls(newUrls);
    localStorage.setItem('transfer_urls', JSON.stringify(newUrls));
    setResults(newUrls.map(url => ({ url, status: 'ok' })));
  };

  const handleAddUrl = () => {
    const trimmed = inputUrl.trim();
    if (!trimmed || urls.includes(trimmed)) return;
    const newUrls = [...urls, trimmed];
    syncUrls(newUrls);
    setInputUrl('');
  };

  const handleRemoveUrl = (url: string) => {
    const newUrls = urls.filter(u => u !== url);
    syncUrls(newUrls);
  };

  const handleRefresh = async () => {
    setLoading(true);
    setSummary(null);
    setResults(urls.map(url => ({ url, status: 'loading' })));
    const newResults: UrlTestResult[] = [];
    let anyNewData = false;
    for (const url of urls) {
      const res = await testUrl(url);
      if (res.newData) anyNewData = true;
      newResults.push({ url, status: res.status, newData: res.newData, message: res.message });
    }
    setResults(newResults);
    setLoading(false);
    if (urls.length === 0) {
      setSummary('No URLs have been added yet.');
    } else if (anyNewData) {
      setSummary('Some URLs returned new data!');
    } else {
      setSummary('No new data was pulled from any URL.');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-1">URL Test</h2>
      <h3 className="text-lg font-semibold text-blue-300 mb-1">Reliable Sources URL Tester</h3>
      <p className="text-gray-300 mb-4 text-sm">Test all reliable source URLs for accessibility and 404 errors</p>
      <div className="bg-slate-800/60 rounded-lg p-6 border border-slate-700">
        {/* Notification Bar for New Content */}
        {summary === 'Some URLs returned new data!' && (
          <div className="mb-4 px-4 py-2 rounded bg-green-700/80 text-green-100 font-semibold text-center">
            New content found on one or more URLs!
          </div>
        )}
        <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
          <span className="font-medium text-white text-lg">Test All URLs</span>
          <Button onClick={handleRefresh} disabled={loading || urls.length === 0} variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-900/30">
            {loading ? 'Testing...' : 'Pull to Refresh'}
          </Button>
        </div>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            className="flex-1 rounded bg-slate-900/70 border border-slate-700 px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            placeholder="Add new source URL..."
            value={inputUrl}
            onChange={e => setInputUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddUrl(); }}
            disabled={loading}
          />
          <Button onClick={handleAddUrl} disabled={loading || !inputUrl.trim() || urls.includes(inputUrl.trim())}>Add</Button>
        </div>
        <div className="space-y-2">
          {urls.length === 0 && <div className="text-gray-400">No URLs added yet.</div>}
          {urls.map((url, idx) => {
            const res = results.find(r => r.url === url);
            return (
              <div key={url + idx} className="flex items-center justify-between bg-slate-900/60 rounded px-3 py-2">
                <span className="truncate text-gray-200" style={{ maxWidth: 220 }}>{url}</span>
                <div className="flex items-center gap-2">
                  <span className={
                    res?.status === 'loading' ? 'text-blue-400' :
                    res?.status === 'ok' ? (res?.newData ? 'text-green-400' : 'text-gray-400') :
                    'text-red-400'
                  }>
                    {res?.status === 'loading' ? 'Testing...' : res?.message || ''}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:bg-red-900/40"
                    onClick={() => handleRemoveUrl(url)}
                    disabled={loading}
                    aria-label={`Remove ${url}`}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        {/* Show other summary messages if not new content */}
        {summary && summary !== 'Some URLs returned new data!' && (
          <div className="mt-4 text-center text-blue-300 font-semibold">{summary}</div>
        )}
      </div>
    </div>
  );
};

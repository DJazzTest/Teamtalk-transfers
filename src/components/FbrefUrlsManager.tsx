/**
 * CMS panel: FBref comp URL + all club squad URLs + all player URLs per club.
 * Data is loaded from public/fbref-urls.json (populated by scripts/scrapeFbrefUrls.mjs).
 * Use "Run scrape" instructions to pull all data via Playwright.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  loadFbrefUrls,
  clearFbrefUrlsCache,
  FBREF_COMP_URL,
  type FbrefUrlsConfig,
  type FbrefClubUrls,
} from '@/data/fbrefUrls';
import { ChevronDown, ChevronRight, ExternalLink, RefreshCw, Users } from 'lucide-react';
import { toast } from 'sonner';

const COMP_URL_STORAGE_KEY = 'fbref-comp-url-override';

export const FbrefUrlsManager: React.FC = () => {
  const [config, setConfig] = useState<FbrefUrlsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [compUrlOverride, setCompUrlOverride] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(COMP_URL_STORAGE_KEY) || FBREF_COMP_URL;
  });
  const [openClubs, setOpenClubs] = useState<Set<string>>(new Set());

  const compUrl = compUrlOverride || FBREF_COMP_URL;

  const load = useCallback(async () => {
    setLoading(true);
    clearFbrefUrlsCache();
    try {
      const data = await loadFbrefUrls();
      setConfig(data);
      if (!data?.clubs?.length) {
        toast.info('No club data yet. Run: npm run scrape:fbref-urls');
      }
    } catch (e) {
      toast.error('Failed to load fbref-urls.json');
      setConfig(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    try {
      if (compUrlOverride) {
        localStorage.setItem(COMP_URL_STORAGE_KEY, compUrlOverride);
      } else {
        localStorage.removeItem(COMP_URL_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [compUrlOverride]);

  const toggleClub = (slug: string) => {
    setOpenClubs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <span>FBref URLs (pull data)</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => load()}
            disabled={loading}
            className="gap-1"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Reload
          </Button>
        </CardTitle>
        <p className="text-sm text-gray-400">
          Comp and club/player URLs for pull/scrape. Leeds is pre-filled. For Arsenal run{' '}
          <code className="bg-slate-700 px-1 rounded">npm run scrape:fbref-arsenal</code> (after{' '}
          <code className="bg-slate-700 px-1 rounded">npx playwright install chromium</code>). For all clubs:{' '}
          <code className="bg-slate-700 px-1 rounded">npm run scrape:fbref-urls</code>.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-gray-300">Premier League comp URL</Label>
          <div className="flex gap-2 mt-1 items-center">
            <input
              type="url"
              value={compUrlOverride}
              onChange={(e) => setCompUrlOverride(e.target.value)}
              placeholder={FBREF_COMP_URL}
              className="flex-1 rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder:text-gray-500 text-sm"
            />
            <a
              href={compUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-10 h-10 rounded border border-slate-600 text-slate-400 hover:text-white"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading fbref-urls.json…</p>
        ) : !config?.clubs?.length ? (
          <div className="rounded-lg border border-dashed border-slate-600 p-4 text-center text-gray-400 text-sm">
            <p>No clubs in <code>public/fbref-urls.json</code> yet.</p>
            <p className="mt-2">Run from project root:</p>
            <pre className="mt-2 bg-slate-900 rounded p-3 text-left text-xs overflow-x-auto">
              npm run scrape:fbref-urls
            </pre>
            <p className="mt-2">This scrapes the comp page for all teams, then each team for all player links.</p>
          </div>
        ) : (
          <div className="space-y-1">
            <Label className="text-gray-300">Clubs ({config.clubs.length}) — click to expand players</Label>
            {config.clubs.map((club: FbrefClubUrls) => (
              <Collapsible
                key={club.slug}
                open={openClubs.has(club.slug)}
                onOpenChange={() => toggleClub(club.slug)}
              >
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-left text-white hover:bg-slate-700 transition-colors"
                  >
                    {openClubs.has(club.slug) ? (
                      <ChevronDown className="w-4 h-4 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    )}
                    <span className="font-medium">{club.name}</span>
                    <span className="text-gray-400 text-sm">({club.players?.length ?? 0} players)</span>
                    {club.error && (
                      <span className="text-amber-400 text-xs ml-auto">Error when scraping</span>
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-6 mt-2 mb-4 space-y-2 pl-2 border-l-2 border-slate-600">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">Squad:</span>
                      <a
                        href={club.squadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:underline truncate max-w-md"
                      >
                        {club.squadUrl}
                      </a>
                      <a
                        href={club.squadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-slate-400 hover:text-white"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(club.players || []).map((p, i) => (
                        <a
                          key={`${p.url}-${i}`}
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded bg-slate-700 px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-slate-600"
                        >
                          <Users className="w-3 h-3" />
                          {p.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FbrefUrlsManager;

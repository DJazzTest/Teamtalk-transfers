/**
 * CMS panel to view and override TEAMtalk source URLs per club.
 * Overrides are saved to localStorage; "Export JSON" downloads teamtalk-source-urls.json
 * for use by scripts/pull-teamtalk-data.mjs (place in public/teamtalk-source-urls.json).
 *
 * @see docs/TEAMTALK_LOOK_AND_DATA.md
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getTeamsByLeague } from '@/data/teamApiConfig';
import { DEFAULT_TEAMTALK_SOURCE_URLS, getDefaultTeamtalkUrls } from '@/data/teamtalkSourceUrls';
import { Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const STORAGE_KEY = 'teamtalk-source-urls-overrides';

type UrlKey = 'overview' | 'results' | 'fixtures' | 'squad' | 'stats';

export const TeamtalkUrlsManager: React.FC = () => {
  const teams = getTeamsByLeague('Premier League');
  const [selectedSlug, setSelectedSlug] = useState<string>(teams[0]?.slug ?? 'leeds-united');
  const [overrides, setOverrides] = useState<Record<string, Partial<Record<UrlKey, string>>>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      return s ? JSON.parse(s) : {};
    } catch {
      return {};
    }
  });

  const persistOverrides = useCallback((next: Record<string, Partial<Record<UrlKey, string>>>) => {
    setOverrides(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      toast.error('Could not save to localStorage');
    }
  }, []);

  const defaults = selectedSlug
    ? (DEFAULT_TEAMTALK_SOURCE_URLS[selectedSlug] ?? getDefaultTeamtalkUrls(selectedSlug))
    : {};
  const current = {
    overview: overrides[selectedSlug]?.overview ?? defaults.overview ?? '',
    results: overrides[selectedSlug]?.results ?? defaults.results ?? '',
    fixtures: overrides[selectedSlug]?.fixtures ?? defaults.fixtures ?? '',
    squad: overrides[selectedSlug]?.squad ?? defaults.squad ?? '',
    stats: overrides[selectedSlug]?.stats ?? defaults.stats ?? '',
  };

  const setUrl = (key: UrlKey, value: string) => {
    const next = { ...overrides };
    if (!next[selectedSlug]) next[selectedSlug] = {};
    next[selectedSlug][key] = value.trim() || undefined;
    persistOverrides(next);
  };

  const exportJson = () => {
    const out: Record<string, Partial<Record<UrlKey, string>>> = {};
    teams.forEach((t) => {
      const def = DEFAULT_TEAMTALK_SOURCE_URLS[t.slug] ?? getDefaultTeamtalkUrls(t.slug);
      const ov = overrides[t.slug];
      if (ov && Object.keys(ov).length) {
        out[t.slug] = { ...def, ...ov };
      } else {
        out[t.slug] = { ...def };
      }
    });
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'teamtalk-source-urls.json';
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success('Downloaded teamtalk-source-urls.json. Place in public/ for pull script.');
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>TEAMtalk source URLs</span>
          <Button variant="outline" size="sm" onClick={exportJson} className="gap-1">
            <Download className="w-4 h-4" />
            Export JSON
          </Button>
        </CardTitle>
        <p className="text-sm text-gray-400">
          Paste TEAMtalk URLs per club. Export JSON and put in <code className="bg-slate-700 px-1 rounded">public/teamtalk-source-urls.json</code> so{' '}
          <code className="bg-slate-700 px-1 rounded">scripts/pull-teamtalk-data.mjs</code> uses them.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-gray-300">Club</Label>
          <Select value={selectedSlug} onValueChange={setSelectedSlug}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {teams.map((t) => (
                <SelectItem key={t.slug} value={t.slug}>
                  {t.teamName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {(['overview', 'results', 'fixtures', 'squad', 'stats'] as UrlKey[]).map((key) => (
          <div key={key}>
            <Label className="text-gray-300 capitalize">{key}</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={current[key] ?? ''}
                onChange={(e) => setUrl(key, e.target.value)}
                placeholder={getDefaultTeamtalkUrls(selectedSlug)[key]}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-500"
              />
              {current[key] && (
                <a
                  href={current[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 rounded border border-slate-600 text-slate-400 hover:text-white"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TeamtalkUrlsManager;

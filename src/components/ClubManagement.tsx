import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DEFAULT_TEAM_BIOS, TeamBioEntry, TeamBioMap, TEAM_BIO_TEAMS, sanitizeTeamBioMap } from '@/data/teamBios';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

const CLUB_STATS_STORAGE_KEY = 'club-stats-data';
const CLUB_BADGE_OVERRIDES_KEY = 'club-badge-overrides';

interface ClubStats {
  currentSpend?: number;
  currentEarned?: number;
}

type ClubStatsMap = Record<string, ClubStats>;

const createEmptyStats = (): ClubStats => ({
  currentSpend: undefined,
  currentEarned: undefined,
});

export const ClubManagement: React.FC = () => {
  const [selectedClub, setSelectedClub] = useState<string>('Leeds United');
  const [teamBios, setTeamBios] = useState<TeamBioMap>(DEFAULT_TEAM_BIOS);
  const [clubStats, setClubStats] = useState<ClubStatsMap>({});
  const [badgeOverrides, setBadgeOverrides] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentBio: TeamBioEntry = useMemo(() => {
    return {
      intro: '',
      history: '',
      honoursHeading: 'Major honours',
      honours: [],
      facts: [],
      website: '',
      twitter: '',
      ...teamBios[selectedClub],
    };
  }, [selectedClub, teamBios]);

  const currentStats: ClubStats = useMemo(() => {
    return {
      ...createEmptyStats(),
      ...(clubStats[selectedClub] || {}),
    };
  }, [selectedClub, clubStats]);

  const currentBadgeUrl = badgeOverrides[selectedClub] ?? '';

  const loadClubStats = (): ClubStatsMap => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return {};
    try {
      const stored = localStorage.getItem(CLUB_STATS_STORAGE_KEY);
      if (!stored) return {};
      const parsed = JSON.parse(stored);
      if (!parsed || typeof parsed !== 'object') return {};
      return parsed as ClubStatsMap;
    } catch {
      return {};
    }
  };

  const persistClubStats = (data: ClubStatsMap) => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(CLUB_STATS_STORAGE_KEY, JSON.stringify(data));
      }
    } catch {
      // ignore storage errors
    }
  };

  const loadBadgeOverrides = (): Record<string, string> => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return {};
    try {
      const stored = localStorage.getItem(CLUB_BADGE_OVERRIDES_KEY);
      if (!stored) return {};
      const parsed = JSON.parse(stored);
      if (!parsed || typeof parsed !== 'object') return {};
      return parsed as Record<string, string>;
    } catch {
      return {};
    }
  };

  const persistBadgeOverrides = (data: Record<string, string>) => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(CLUB_BADGE_OVERRIDES_KEY, JSON.stringify(data));
      }
    } catch {
      // ignore storage errors
    }
  };

  const loadTeamBiosFromLocalStorage = () => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
    try {
      const stored = localStorage.getItem('team-bios-data');
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_TEAM_BIOS, ...sanitizeTeamBioMap(parsed) };
      }
    } catch {
      // ignore parse errors
    }
    return null;
  };

  const fetchRemoteBios = async () => {
    setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/team-bios', {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const payload = await response.json();
      const sanitized = sanitizeTeamBioMap(payload);
      const merged = Object.keys(sanitized).length
        ? { ...DEFAULT_TEAM_BIOS, ...sanitized }
        : DEFAULT_TEAM_BIOS;
      setTeamBios(merged);
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('team-bios-data', JSON.stringify(merged));
      }
    } catch (error) {
      console.warn('Failed to load team bios for club manager:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const localBios = loadTeamBiosFromLocalStorage();
    if (localBios) {
      setTeamBios(localBios);
    }
    setClubStats(loadClubStats());
    setBadgeOverrides(loadBadgeOverrides());
    fetchRemoteBios();
  }, []);

  const updateCurrentBio = (updates: Partial<TeamBioEntry>) => {
    setTeamBios((prev) => ({
      ...prev,
      [selectedClub]: {
        intro: '',
        history: '',
        honoursHeading: 'Major honours',
        honours: [],
        facts: [],
        website: '',
        twitter: '',
        ...prev[selectedClub],
        ...updates,
      },
    }));
  };

  const updateCurrentStats = (updates: Partial<ClubStats>) => {
    setClubStats((prev) => ({
      ...prev,
      [selectedClub]: {
        ...createEmptyStats(),
        ...(prev[selectedClub] || {}),
        ...updates,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save team bios (bio intro) through existing function
      const biosResponse = await fetch('/.netlify/functions/team-bios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamBios),
      });
      if (!biosResponse.ok) {
        throw new Error(`Failed to save team bios: HTTP ${biosResponse.status}`);
      }
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('team-bios-data', JSON.stringify(teamBios));
      }

      // Save club stats locally
      persistClubStats(clubStats);

      // Save badge overrides locally
      persistBadgeOverrides(badgeOverrides);

      // Let frontend know that club data has changed
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('clubDataUpdated'));
        window.dispatchEvent(new Event('teamBiosUpdated'));
      }

      toast.success(`${selectedClub} updated and published`);
    } catch (error: any) {
      console.error('Failed to save club data:', error);
      toast.error(error?.message || 'Unable to save club changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-slate-800/60 border-slate-700">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-white">Club Management</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchRemoteBios}
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Loader2 className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Publish
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-sm text-gray-200">Club</Label>
            <Select value={selectedClub} onValueChange={setSelectedClub}>
              <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                <SelectValue placeholder="Select club" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-white max-h-60">
                {TEAM_BIO_TEAMS.sort((a, b) => a.localeCompare(b)).map((club) => (
                  <SelectItem key={club} value={club}>
                    {club}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-gray-200">Current Spend (£m)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="e.g. 90.1"
              value={currentStats.currentSpend ?? ''}
              onChange={(e) =>
                updateCurrentStats({
                  currentSpend: e.target.value === '' ? undefined : Number(e.target.value),
                })
              }
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-gray-200">Current Earnings (£m)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="e.g. 5.2"
              value={currentStats.currentEarned ?? ''}
              onChange={(e) =>
                updateCurrentStats({
                  currentEarned: e.target.value === '' ? undefined : Number(e.target.value),
                })
              }
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-gray-200">Club Badge URL</Label>
          <Input
            placeholder="https://... or /badges/club.png"
            value={currentBadgeUrl}
            onChange={(e) => {
              const next = { ...badgeOverrides, [selectedClub]: e.target.value };
              setBadgeOverrides(next);
            }}
            className="bg-slate-900 border-slate-700 text-white"
          />
          <p className="text-xs text-gray-400">
            Example (Leeds United): `/lovable-uploads/f1403919-509d-469c-8455-d3b11b3d5cb6.png`. This overrides the
            default badge map on the frontend.
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-gray-200">Club Intro / Bio (short)</Label>
          <Textarea
            value={currentBio.intro}
            onChange={(e) => updateCurrentBio({ intro: e.target.value })}
            className="min-h-[120px] bg-slate-900 border-slate-700 text-white"
            placeholder="Short club overview that appears in the club bio modal."
          />
          <p className="text-xs text-gray-400">
            For full bio, honours and facts editing, you can also use the Team Bio Manager above. Changes published here
            update the same underlying data.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClubManagement;



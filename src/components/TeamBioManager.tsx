import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DEFAULT_TEAM_BIOS, TeamBioEntry, TeamBioMap, TEAM_BIO_TEAMS, sanitizeTeamBioMap } from '@/data/teamBios';
import { toast } from 'sonner';
import { Loader2, Plus, RefreshCw, Save, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'team-bios-data';

const createEmptyEntry = (): TeamBioEntry => ({
  intro: '',
  history: '',
  honoursHeading: 'Major honours',
  honours: [],
  facts: [],
  website: '',
  twitter: '',
});

export const TeamBioManager: React.FC = () => {
  const [teamBios, setTeamBios] = useState<TeamBioMap>(DEFAULT_TEAM_BIOS);
  const [selectedTeam, setSelectedTeam] = useState<string>(TEAM_BIO_TEAMS[0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentBio = useMemo<TeamBioEntry>(() => {
    return {
      ...createEmptyEntry(),
      ...teamBios[selectedTeam],
    };
  }, [selectedTeam, teamBios]);

  const persistLocally = (data: TeamBioMap) => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch {
      // ignore storage errors
    }
  };

  const loadFromLocalStorage = () => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_TEAM_BIOS, ...sanitizeTeamBioMap(parsed) };
      }
    } catch (error) {
      console.warn('Failed to parse cached team bios:', error);
    }
    return null;
  };

  const fetchRemote = async () => {
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
      persistLocally(merged);
      toast.success('Team bios synced from cloud');
    } catch (error: any) {
      console.error('Failed to load team bios:', error);
      toast.error('Unable to load team bios from cloud');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const local = loadFromLocalStorage();
    if (local) {
      setTeamBios(local);
    }
    fetchRemote();
  }, []);

  const updateCurrentBio = (updates: Partial<TeamBioEntry>) => {
    setTeamBios((prev) => ({
      ...prev,
      [selectedTeam]: {
        ...createEmptyEntry(),
        ...prev[selectedTeam],
        ...updates,
      },
    }));
  };

  const handleHonoursChange = (value: string) => {
    const honours = value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    updateCurrentBio({ honours });
  };

  const handleFactChange = (index: number, field: 'label' | 'value', value: string) => {
    const facts = [...(currentBio.facts || [])];
    facts[index] = { ...facts[index], [field]: value };
    updateCurrentBio({ facts });
  };

  const addFact = () => {
    updateCurrentBio({ facts: [...(currentBio.facts || []), { label: '', value: '' }] });
  };

  const removeFact = (index: number) => {
    const nextFacts = (currentBio.facts || []).filter((_, i) => i !== index);
    updateCurrentBio({ facts: nextFacts });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/.netlify/functions/team-bios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamBios),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      persistLocally(teamBios);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('teamBiosUpdated'));
      }
      toast.success(`${selectedTeam} bio saved`);
    } catch (error: any) {
      console.error('Failed to save team bios:', error);
      toast.error('Unable to save bio. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const honoursText = (currentBio.honours || []).join('\n');

  return (
    <Card className="bg-slate-800/60 border-slate-700">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-white">Team Bio Manager</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={fetchRemote} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Sync
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-sm text-gray-200">Team</Label>
            <Select value={selectedTeam} onValueChange={(value) => setSelectedTeam(value)}>
              <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-white max-h-60">
                {Object.keys(teamBios)
                  .sort((a, b) => a.localeCompare(b))
                  .map((team) => (
                    <SelectItem key={team} value={team}>
                      {team}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-gray-200">Official Website</Label>
            <Input
              placeholder="https://"
              value={currentBio.website || ''}
              onChange={(e) => updateCurrentBio({ website: e.target.value })}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-gray-200">Twitter / X URL</Label>
            <Input
              placeholder="https://x.com/club"
              value={currentBio.twitter || ''}
              onChange={(e) => updateCurrentBio({ twitter: e.target.value })}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-gray-200">Key Facts</Label>
          <div className="rounded-lg border border-slate-700 divide-y divide-slate-700">
            {(currentBio.facts && currentBio.facts.length > 0 ? currentBio.facts : [{ label: '', value: '' }]).map(
              (fact, index) => (
                <div
                  key={`${fact.label}-${index}`}
                  className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:gap-4"
                >
                  <Input
                    placeholder="Label"
                    value={fact.label}
                    onChange={(e) => handleFactChange(index, 'label', e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                  <Input
                    placeholder="Value"
                    value={fact.value}
                    onChange={(e) => handleFactChange(index, 'value', e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFact(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            )}
          </div>
          <Button variant="outline" size="sm" onClick={addFact} className="border-blue-400 text-blue-200 hover:text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add fact
          </Button>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-gray-200">Intro</Label>
          <Textarea
            value={currentBio.intro}
            onChange={(e) => updateCurrentBio({ intro: e.target.value })}
            className="min-h-[120px] bg-slate-900 border-slate-700 text-white"
            placeholder="Short overview paragraph"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-gray-200">
            {currentBio.honoursHeading || 'Major honours'} (one per line)
          </Label>
          <Textarea
            value={honoursText}
            onChange={(e) => handleHonoursChange(e.target.value)}
            className="min-h-[120px] bg-slate-900 border-slate-700 text-white"
            placeholder="e.g. Premier League: 3 (1998, 2002, 2004)"
          />
          <Input
            value={currentBio.honoursHeading || 'Major honours'}
            onChange={(e) => updateCurrentBio({ honoursHeading: e.target.value })}
            className="bg-slate-900 border-slate-700 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-gray-200">History / Narrative</Label>
          <Textarea
            value={currentBio.history}
            onChange={(e) => updateCurrentBio({ history: e.target.value })}
            className="min-h-[140px] bg-slate-900 border-slate-700 text-white"
            placeholder="Key milestones, rivalries, eras..."
          />
        </div>
      </CardContent>
    </Card>
  );
};


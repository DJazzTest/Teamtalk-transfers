import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getPlayerImage, handlePlayerImageError } from '@/utils/playerImageUtils';

interface ArsenalPlayerProfile {
  name: string;
  fullName?: string;
  position?: string;
  primaryPosition?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  nationality?: string;
  club?: string;
  bio?: string;
}

interface ArsenalPlayer {
  slug: string;
  profile?: ArsenalPlayerProfile;
  currentSeasonSummary?: any;
}

interface SeasonStatsSummary {
  minutes: number;
  goals: number;
  assists: number;
}

const computeSeasonSummary = (player: ArsenalPlayer): SeasonStatsSummary => {
  const summary: SeasonStatsSummary = { minutes: 0, goals: 0, assists: 0 };
  const data = player.currentSeasonSummary;
  if (!data) return summary;

  // Shape 1: { season, club, domesticLeague, internationalCups? }
  if (data.domesticLeague || data.internationalCups) {
    const comps = [data.domesticLeague, data.internationalCups].filter(Boolean);
    for (const comp of comps) {
      summary.minutes += comp.min || comp.minutes || 0;
      summary.goals += comp.gls || comp.goals || 0;
      summary.assists += comp.ast || comp.assists || 0;
    }
    return summary;
  }

  // Shape 2: { [season]: { [competition]: { mp, min, gls, ast } } }
  for (const season of Object.values<any>(data)) {
    if (!season) continue;

    // Nested domesticLeague / internationalCups inside season (e.g. Zubimendi)
    if (season.domesticLeague || season.internationalCups) {
      const comps = [season.domesticLeague, season.internationalCups].filter(Boolean);
      for (const comp of comps) {
        summary.minutes += comp.min || comp.minutes || 0;
        summary.goals += comp.gls || comp.goals || comp.goalsScored || 0;
        summary.assists += comp.ast || comp.assists || 0;
      }
      continue;
    }

    // Otherwise iterate competitions directly
    for (const comp of Object.values<any>(season)) {
      if (!comp) continue;
      summary.minutes += comp.min || comp.minutes || 0;
      summary.goals += comp.gls || comp.goals || 0;
      summary.assists += comp.ast || comp.assists || 0;
    }
  }

  return summary;
};

const calculateAge = (dob?: string): number | null => {
  if (!dob) return null;
  const date = new Date(dob);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const m = now.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < date.getDate())) {
    age--;
  }
  return age;
};

const formatPosition = (pos?: string): string => {
  if (!pos) return 'N/A';
  return pos;
};

const ArsenalSquad: React.FC = () => {
  const [players, setPlayers] = useState<ArsenalPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/arsenal-squad.json', { cache: 'no-cache' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as ArsenalPlayer[];
        if (!isMounted) return;

        // Only keep players whose club is Arsenal or Arsenal U21
        const filtered = data.filter((p) => {
          const club = p.profile?.club || '';
          return /arsenal/i.test(club);
        });

        setPlayers(filtered);
      } catch (e: any) {
        console.error('Failed to load arsenal-squad.json', e);
        if (isMounted) setError('Unable to load Arsenal squad data from local JSON.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const enrichedPlayers = players.map((p) => {
    const stats = computeSeasonSummary(p);
    return { player: p, stats };
  });

  const chartData = enrichedPlayers
    .slice()
    .sort((a, b) => b.stats.minutes - a.stats.minutes)
    .slice(0, 12)
    .map(({ player, stats }) => ({
      name: player.profile?.name || player.slug,
      minutes: stats.minutes,
      goals: stats.goals,
    }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">Arsenal squad – local scouting data</h1>
          <p className="text-sm text-slate-400">
            Visualising the current Arsenal squad using your locally curated data and existing player images.
          </p>
        </header>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-40 rounded-xl bg-slate-800" />
            ))}
          </div>
        )}

        {error && !loading && (
          <Alert variant="destructive">
            <AlertTitle>Failed to load Arsenal data</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && players.length > 0 && (
          <>
            {/* Minutes / goals bar chart */}
            <Card className="p-4 bg-slate-900 border-slate-800">
              <h2 className="text-lg font-semibold mb-3">Season workload & goals (top 12 by minutes)</h2>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 80, right: 16, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#64748b"
                    width={140}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: 8 }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar dataKey="minutes" name="Minutes" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, idx) => (
                      <Cell key={`min-${idx}`} fill="#38bdf8" />
                    ))}
                  </Bar>
                  <Bar dataKey="goals" name="Goals" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, idx) => (
                      <Cell key={`gol-${idx}`} fill="#f97316" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Player grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrichedPlayers.map(({ player, stats }) => {
                const profile = player.profile;
                const name = profile?.name || player.slug;
                const age = calculateAge(profile?.dateOfBirth);
                const position = formatPosition(profile?.primaryPosition || profile?.position);
                const nationality = profile?.nationality;
                const imageSrc = getPlayerImage(name, 'Arsenal');

                return (
                  <Card
                    key={player.slug}
                    className="p-4 bg-slate-900 border border-slate-800 flex gap-3 items-start"
                  >
                    <Avatar className="w-14 h-14 shrink-0">
                      <AvatarImage
                        src={imageSrc}
                        alt={name}
                        onError={handlePlayerImageError}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-slate-800 text-slate-200">
                        {name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h3 className="font-semibold leading-tight">{name}</h3>
                          {profile?.club && (
                            <p className="text-xs text-slate-400">{profile.club}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {position}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">
                        {age !== null && <span>{age} yrs</span>}
                        {age !== null && (nationality || profile?.dateOfBirth) && <span> • </span>}
                        {nationality && <span>{nationality}</span>}
                        {nationality && profile?.dateOfBirth && <span> • </span>}
                        {profile?.dateOfBirth && <span>{new Date(profile.dateOfBirth).toLocaleDateString('en-GB')}</span>}
                      </p>
                      <p className="text-xs text-slate-300 line-clamp-3">
                        {profile?.bio || 'No short bio available yet.'}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                          Minutes: <span className="font-semibold">{stats.minutes || 0}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                          Goals: <span className="font-semibold">{stats.goals || 0}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                          Assists: <span className="font-semibold">{stats.assists || 0}</span>
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ArsenalSquad;


import React, { useEffect, useMemo, useState } from 'react';
import { teamResultsFixturesService, Match } from '@/services/teamResultsFixturesService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface TeamFixturesProps {
  teamName: string;
  seasonStart?: string; // ISO date
  seasonEnd?: string;   // ISO date
}

function formatMonth(dateIso: string): string {
  const d = new Date(dateIso);
  return d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
}

function formatDay(dateIso: string): string {
  const d = new Date(dateIso);
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric' });
}

function formatTime(dateIso: string): string {
  const d = new Date(dateIso);
  return d.toLocaleString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export const TeamFixtures: React.FC<TeamFixturesProps> = ({ teamName, seasonStart, seasonEnd }) => {
  const [fixtures, setFixtures] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const data = await teamResultsFixturesService.getTeamFixtures(teamName, seasonStart, seasonEnd);
      if (mounted) setFixtures(data);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [teamName, seasonStart, seasonEnd]);

  const grouped = useMemo(() => {
    const groups = new Map<string, Match[]>();
    for (const m of fixtures) {
      const key = formatMonth(m.date);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(m);
    }
    // Sort months by date asc (upcoming)
    return Array.from(groups.entries())
      .sort((a, b) => new Date(a[1][0].date).getTime() - new Date(b[1][0].date).getTime());
  }, [fixtures]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{teamName} 2025–26 Season Fixtures</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <div className="text-sm text-gray-400">Loading fixtures…</div>}
        {!loading && grouped.length === 0 && (
          <div className="text-sm text-gray-400">No upcoming fixtures found.</div>
        )}
        {!loading && grouped.map(([month, matches]) => (
          <div key={month} className="mb-6">
            <div className="font-semibold mb-2">{month}</div>
            <ul className="space-y-2 text-sm">
              {matches
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((m) => {
                  const isHome = (m.homeTeam || '').toLowerCase().includes(teamName.toLowerCase());
                  const opponent = isHome ? m.awayTeam : m.homeTeam;
                  const venue = isHome ? teamName : opponent;
                  const comp = m.competition ? ` (${m.competition})` : '';
                  const time = formatTime(m.date);
                  const statusBadge = m.status === 'live' ? ' [LIVE]' : '';
                  
                  return (
                    <li key={`${m.id}-${m.date}`}>
                      •  {formatDay(m.date)} {time}: {venue} vs {opponent}{comp}{statusBadge}
                    </li>
                  );
                })}
            </ul>
            <Separator className="mt-4" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};


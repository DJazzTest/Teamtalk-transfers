import React, { useEffect, useMemo, useState } from 'react';
import { teamResultsFixturesService, Match } from '@/services/teamResultsFixturesService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

interface TeamResultsProps {
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

function formatScore(match: Match): string {
  if (typeof match.homeScore === 'number' && typeof match.awayScore === 'number') {
    return `${match.homeScore}–${match.awayScore}`;
  }
  return 'vs';
}

export const TeamResults: React.FC<TeamResultsProps> = ({ teamName, seasonStart, seasonEnd }) => {
  const [results, setResults] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [details, setDetails] = useState<Record<string, { loading: boolean; text?: string }>>({});
  const [topScorer, setTopScorer] = useState<{ name: string; goals: number } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const data = await teamResultsFixturesService.getTeamResults(teamName, seasonStart, seasonEnd);
      if (mounted) setResults(data);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [teamName, seasonStart, seasonEnd]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (results.length === 0) { setTopScorer(null); return; }
      const tally = new Map<string, number>();
      for (const match of results) {
        if (!match.id) continue;
        const det = await teamResultsFixturesService.getMatchDetails(match.id);
        if (!det.goalScorers) continue;
        for (const g of det.goalScorers) {
          if (!g.name) continue;
          const teamOk = !g.team || g.team.toLowerCase().includes(teamName.toLowerCase()) || teamName.toLowerCase().includes((g.team || '').toLowerCase());
          if (teamOk) tally.set(g.name, (tally.get(g.name) || 0) + 1);
        }
      }
      if (!mounted) return;
      const arr = Array.from(tally.entries()).map(([name, goals]) => ({ name, goals })).sort((a, b) => b.goals - a.goals);
      setTopScorer(arr[0] || null);
    })();
    return () => { mounted = false; };
  }, [results, teamName]);

  const grouped = useMemo(() => {
    const groups = new Map<string, Match[]>();
    for (const m of results) {
      const key = formatMonth(m.date);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(m);
    }
    // Sort months by date desc
    return Array.from(groups.entries())
      .sort((a, b) => new Date(b[1][0].date).getTime() - new Date(a[1][0].date).getTime());
  }, [results]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle>{teamName} 2025–26 Season Results</CardTitle>
          {topScorer && (
            <div className="text-sm text-white/80">
              Top scorer: <span className="font-semibold">{topScorer.name}</span> ({topScorer.goals})
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading && <div className="text-sm text-gray-400">Loading results…</div>}
        {!loading && grouped.length === 0 && (
          <div className="text-sm text-gray-400">No results found.</div>
        )}
        {!loading && grouped.map(([month, matches]) => (
          <div key={month} className="mb-6">
            <div className="font-semibold mb-2">{month}</div>
            <ul className="space-y-2 text-sm">
              {matches
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((m) => {
                  const isHome = (m.homeTeam || '').toLowerCase().includes(teamName.toLowerCase());
                  const opponent = isHome ? m.awayTeam : m.homeTeam;
                  const score = formatScore(m);
                  const line = isHome
                    ? `${teamName} ${score} ${opponent}`
                    : `${opponent} ${score} ${teamName}`;
                  const comp = m.competition ? ` (${m.competition})` : '';
                  const isExpanded = !!expanded[m.id];
                  const det = details[m.id];
                  return (
                    <li key={`${m.id}-${m.date}`}>
                      •  {formatDay(m.date)}: {line}{comp}
                      {score !== 'vs' && (
                        <div className="mt-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                              setExpanded(prev => ({ ...prev, [m.id]: !isExpanded }));
                              if (!isExpanded && !det) {
                                setDetails(prev => ({ ...prev, [m.id]: { loading: true } }));
                                const full = await teamResultsFixturesService.getMatchDetails(m.id);
                                let text: string | undefined;
                                if (full.goalScorers && full.goalScorers.length > 0) {
                                  const groupedByTeam = new Map<string, string[]>();
                                  for (const g of full.goalScorers) {
                                    const key = g.team || 'Goals';
                                    const entry = `${g.name}${g.minute ? ` (${g.minute})` : ''}`;
                                    if (!groupedByTeam.has(key)) groupedByTeam.set(key, []);
                                    groupedByTeam.get(key)!.push(entry);
                                  }
                                  const lines: string[] = [];
                                  groupedByTeam.forEach((arr, team) => {
                                    lines.push(`${team}: ${arr.join(', ')}`);
                                  });
                                  text = `Goals: ${lines.join(' | ')}`;
                                }
                                setDetails(prev => ({ ...prev, [m.id]: { loading: false, text } }));
                              }
                            }}
                          >
                            {isExpanded ? 'Hide details' : 'Show details'}
                          </Button>
                          {isExpanded && (
                            <div className="text-xs text-gray-300 mt-1 ml-2">
                              {det?.loading && 'Loading…'}
                              {!det?.loading && det?.text}
                              {!det?.loading && !det?.text && 'No goal details available'}
                            </div>
                          )}
                        </div>
                      )}
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

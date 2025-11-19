import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, LineChart, Line, Cell, AreaChart, Area } from 'recharts';
import { getSquad } from '@/data/squadWages';
import { TeamResultsFixturesService } from '@/services/teamResultsFixturesService';
import { ShirtNumberIcon } from './ShirtNumberIcon';
import { getPremierLeagueClubs } from '@/utils/teamMapping';
import { getPlayerComparisonData, DetailedPlayerStats } from '@/data/playerComparisonData';

interface Player {
  name: string;
  position?: string;
  age?: number;
  shirtNumber?: number;
  imageUrl?: string;
  seasonStats?: any;
  bio?: {
    height?: string;
    weight?: string;
    nationality?: string;
    preferredFoot?: string;
  };
  weeklyWage?: number;
  yearlyWage?: number;
  previousMatches?: Array<{
    competition: string;
    date: string;
    team: string;
    opponent: string;
    score: string;
    outcome?: 'Win' | 'Draw' | 'Loss';
    venue?: string;
    rating?: number;
  }>;
}

interface PlayerComparisonModalProps {
  player1: Player | null;
  team1: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PlayerComparisonModal: React.FC<PlayerComparisonModalProps> = ({
  player1,
  team1,
  isOpen,
  onClose
}) => {
  const [team2, setTeam2] = useState<string>('');
  const [player2, setPlayer2] = useState<Player | null>(null);

  const isGoalkeeper = player1?.position?.toLowerCase().includes('goalkeeper');
  const [upcomingFixtures, setUpcomingFixtures] = useState<Array<{ opponent: string; date: string }>>([]);
  const [loadingFixtures, setLoadingFixtures] = useState(false);

  // Fetch upcoming fixtures to suggest opponent teams
  useEffect(() => {
    if (!team1 || !isOpen) return;
    
    const loadFixtures = async () => {
      setLoadingFixtures(true);
      try {
        const now = new Date();
        const seasonStart = new Date().toISOString();
        const seasonEnd = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
        
        const service = TeamResultsFixturesService.getInstance();
        const fixtures = await service.getTeamFixtures(team1, seasonStart, seasonEnd);
        
        const opponents = fixtures
          .slice(0, 5)
          .map(fixture => {
            const isHome = (fixture.homeTeam || '').toLowerCase().includes(team1.toLowerCase());
            const opponent = isHome ? fixture.awayTeam : fixture.homeTeam;
            return {
              opponent: opponent || '',
              date: fixture.date || ''
            };
          })
          .filter(f => f.opponent);
        
        setUpcomingFixtures(opponents);
        
        if (opponents.length > 0 && !team2) {
          setTeam2(opponents[0].opponent);
        }
      } catch (error) {
        console.error('Error loading fixtures:', error);
      } finally {
        setLoadingFixtures(false);
      }
    };
    
    loadFixtures();
  }, [team1, isOpen]);

  // Load player2 when team2 is selected
  useEffect(() => {
    if (!team2) {
      setPlayer2(null);
      return;
    }
    
    const squad = getSquad(team2);
    if (player1?.position && squad.length > 0) {
      const samePosition = squad.find(p => 
        p.position?.toLowerCase() === player1.position?.toLowerCase()
      );
      if (samePosition) {
        setPlayer2(samePosition);
      }
    }
  }, [team2, player1?.position]);

  const team2Players = useMemo(() => {
    if (!team2) return [];
    return getSquad(team2);
  }, [team2]);

  const filteredTeam2Players = useMemo(() => {
    if (!player1?.position) return team2Players;
    const samePosition = team2Players.filter(p => 
      p.position?.toLowerCase() === player1.position?.toLowerCase()
    );
    return samePosition.length > 0 ? samePosition : team2Players;
  }, [team2Players, player1?.position]);

  // Get detailed stats for both players
  const p1Stats = useMemo(() => getPlayerComparisonData(player1?.name || '', player1), [player1]);
  const p2Stats = useMemo(() => getPlayerComparisonData(player2?.name || '', player2), [player2]);

  const parseNumericValue = (value: unknown): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = parseFloat(value.replace(/[^0-9.-]/g, ''));
      return Number.isNaN(cleaned) ? NaN : cleaned;
    }
    return NaN;
  };

  const formatMetricValue = (
    value: number,
    options: { unit?: string; decimals?: number; percent?: boolean } = {}
  ): string => {
    const { unit, percent, decimals } = options;
    const precision = decimals !== undefined ? decimals : (Math.abs(value) >= 10 ? 0 : 1);
    const formatted = Number.isInteger(value) && !percent && decimals === undefined
      ? value.toString()
      : value.toFixed(precision);
    if (percent) {
      return `${formatted}%`;
    }
    if (unit) {
      return `${formatted}${unit}`;
    }
    return formatted;
  };

  const computeComparisonInsights = (
    primaryStats: DetailedPlayerStats,
    secondaryStats: DetailedPlayerStats,
    isKeeper: boolean
  ) => {
    const summary = {
      player1: [] as string[],
      player2: [] as string[]
    };

    const compare = (
      label: string,
      a: unknown,
      b: unknown,
      options: {
        higherIsBetter?: boolean;
        unit?: string;
        decimals?: number;
        percent?: boolean;
        threshold?: number;
      } = {}
    ) => {
      const value1 = parseNumericValue(a);
      const value2 = parseNumericValue(b);
      if (!Number.isFinite(value1) || !Number.isFinite(value2)) return;
      const diff = Math.abs(value1 - value2);
      if (diff < (options.threshold ?? 0.01)) return;

      const formatted1 = formatMetricValue(value1, options);
      const formatted2 = formatMetricValue(value2, options);
      const descriptor = `${label}: ${formatted1} vs ${formatted2}`;
      const higherIsBetter = options.higherIsBetter ?? true;

      if (higherIsBetter ? value1 > value2 : value1 < value2) {
        if (!summary.player1.includes(descriptor)) summary.player1.push(descriptor);
      } else if (higherIsBetter ? value2 > value1 : value2 < value1) {
        if (!summary.player2.includes(descriptor)) summary.player2.push(descriptor);
      }
    };

    compare('Goals scored', primaryStats.goals, secondaryStats.goals, { higherIsBetter: true, decimals: 0, threshold: 0.1 });
    compare('Assists provided', primaryStats.assists, secondaryStats.assists, { higherIsBetter: true, decimals: 0, threshold: 0.1 });
    compare('Average rating', primaryStats.sofascoreRating, secondaryStats.sofascoreRating, { higherIsBetter: true, decimals: 2, threshold: 0.05 });
    compare('Minutes per game', primaryStats.minutesPerGame, secondaryStats.minutesPerGame, { higherIsBetter: true, decimals: 0, threshold: 1 });
    compare('Total minutes played', primaryStats.totalMinutes, secondaryStats.totalMinutes, { higherIsBetter: true, decimals: 0, threshold: 50 });

    if (isKeeper) {
      compare('Saves per game', primaryStats.saves, secondaryStats.saves, { higherIsBetter: true, decimals: 1, threshold: 0.2 });
      compare('Goals prevented', primaryStats.goalsPrevented, secondaryStats.goalsPrevented, { higherIsBetter: true, decimals: 2, threshold: 0.2 });
      compare('Clean sheets', primaryStats.cleanSheets, secondaryStats.cleanSheets, { higherIsBetter: true, decimals: 0, threshold: 0.1 });
      compare('Goals conceded per game', primaryStats.goalsConceded, secondaryStats.goalsConceded, { higherIsBetter: false, decimals: 1, threshold: 0.1 });
      compare('Accurate passes per game', primaryStats.accuratePasses, secondaryStats.accuratePasses, { higherIsBetter: true, decimals: 1, threshold: 0.5 });
      compare('Accurate long balls per game', primaryStats.accurateLongBalls, secondaryStats.accurateLongBalls, { higherIsBetter: true, decimals: 1, threshold: 0.5 });
    } else {
      compare('Successful dribbles %', primaryStats.successfulDribblesPercentage, secondaryStats.successfulDribblesPercentage, { higherIsBetter: true, percent: true, threshold: 1 });
      compare('Ground duels won %', primaryStats.groundDuelsWonPercentage, secondaryStats.groundDuelsWonPercentage, { higherIsBetter: true, percent: true, threshold: 1 });
      compare('Aerial duels won %', primaryStats.aerialDuelsWonPercentage, secondaryStats.aerialDuelsWonPercentage, { higherIsBetter: true, percent: true, threshold: 1 });
      compare('Was fouled per game', primaryStats.wasFouled, secondaryStats.wasFouled, { higherIsBetter: true, decimals: 2, threshold: 0.05 });
      compare('Possession lost per game', primaryStats.possessionLost, secondaryStats.possessionLost, { higherIsBetter: false, decimals: 1, threshold: 0.3 });
      compare('Interceptions per game', primaryStats.interceptions, secondaryStats.interceptions, { higherIsBetter: true, decimals: 2, threshold: 0.1 });
      compare('Tackles per game', primaryStats.tackles, secondaryStats.tackles, { higherIsBetter: true, decimals: 2, threshold: 0.1 });
      compare('Big chances created', primaryStats.bigChancesCreated, secondaryStats.bigChancesCreated, { higherIsBetter: true, decimals: 0, threshold: 0.1 });
    }

    return {
      player1: Array.from(new Set(summary.player1)).slice(0, 4),
      player2: Array.from(new Set(summary.player2)).slice(0, 4)
    };
  };

  const formatMatchDate = (value: string): string => {
    if (!value) return 'N/A';
    const isoDate = Date.parse(value);
    if (!Number.isNaN(isoDate)) {
      return new Date(isoDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
    }
    const fallbackMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{2,4})$/);
    if (fallbackMatch) {
      const [, day, month, year] = fallbackMatch;
      const fullYear = year.length === 2 ? 2000 + parseInt(year, 10) : parseInt(year, 10);
      const parsed = new Date(fullYear, parseInt(month, 10) - 1, parseInt(day, 10));
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
      }
    }
    return value;
  };

  const getOutcomeStyles = (outcome?: string) => {
    switch (outcome) {
      case 'Win':
        return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
      case 'Draw':
        return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
      case 'Loss':
        return 'bg-rose-500/15 text-rose-300 border border-rose-500/30';
      default:
        return 'bg-slate-600/30 text-slate-200 border border-slate-500/30';
    }
  };

  const recentMatches1 = useMemo(
    () => (player1?.previousMatches || []).slice(0, 5),
    [player1?.previousMatches]
  );
  const recentMatches2 = useMemo(
    () => (player2?.previousMatches || []).slice(0, 5),
    [player2?.previousMatches]
  );

  const insights = useMemo(() => {
    if (!player2) {
      return { player1: [] as string[], player2: [] as string[] };
    }
    return computeComparisonInsights(p1Stats, p2Stats, isGoalkeeper);
  }, [player2, p1Stats, p2Stats, isGoalkeeper]);

  const formatStatWithPercentage = (value: number | undefined, percentage: number | undefined): string | null => {
    if (value === undefined || value === null) return null;
    const pct = percentage !== undefined && percentage !== null ? percentage : 0;
    return `${value} (${pct}%)`;
  };

  // Helper to create gradient definitions for charts
  const createGradientDefs = (id1: string, color1: string, id2: string, color2: string) => (
    <defs>
      <linearGradient id={id1} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color1} stopOpacity={0.9} />
        <stop offset="100%" stopColor={color1} stopOpacity={0.3} />
      </linearGradient>
      <linearGradient id={id2} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color2} stopOpacity={0.9} />
        <stop offset="100%" stopColor={color2} stopOpacity={0.3} />
      </linearGradient>
      <filter id="shadow">
        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
      </filter>
    </defs>
  );

  const renderStatRow = (label: string, value: any) => {
    if (value === undefined || value === null || value === '') return null;
    try {
      const displayValue = typeof value === 'number' 
        ? (Number.isInteger(value) ? value.toString() : value.toFixed(2))
        : String(value);
      return (
        <div className="flex justify-between py-1 border-b border-slate-600">
          <span className="text-gray-400">{label}</span>
          <span className="text-white font-medium">{displayValue}</span>
        </div>
      );
    } catch (error) {
      console.error(`Error rendering stat row for ${label}:`, error);
      return null;
    }
  };

  const renderComparisonRow = (
    label: string,
    value1: string | number | undefined,
    value2: string | number | undefined,
    suffix?: string,
    higherIsBetter: boolean = true
  ) => {
    if (value1 === undefined && value2 === undefined) return null;
    
    const v1 = typeof value1 === 'number' ? value1 : parseFloat(String(value1).replace(/[^\d.-]/g, '')) || 0;
    const v2 = typeof value2 === 'number' ? value2 : parseFloat(String(value2).replace(/[^\d.-]/g, '')) || 0;
    
    let comparison: 'better' | 'worse' | 'equal' = 'equal';
    if (typeof v1 === 'number' && typeof v2 === 'number' && !isNaN(v1) && !isNaN(v2)) {
      if (v1 > v2) comparison = higherIsBetter ? 'better' : 'worse';
      else if (v1 < v2) comparison = higherIsBetter ? 'worse' : 'better';
    }
    
    return (
      <div className="grid grid-cols-3 gap-4 py-2 border-b border-slate-700/50">
        <div className="text-right flex items-center justify-end gap-1">
          <span className="text-white font-medium">{value1 ?? '-'} {suffix || ''}</span>
          {comparison === 'better' && <TrendingUp className="w-4 h-4 text-green-400" />}
          {comparison === 'worse' && <TrendingDown className="w-4 h-4 text-red-400" />}
          {comparison === 'equal' && <Minus className="w-4 h-4 text-gray-400" />}
        </div>
        <div className="text-center text-gray-400 text-sm font-semibold">{label}</div>
        <div className="text-left flex items-center gap-1">
          <span className="text-white font-medium">{value2 ?? '-'} {suffix || ''}</span>
          {comparison === 'better' && <TrendingDown className="w-4 h-4 text-red-400" />}
          {comparison === 'worse' && <TrendingUp className="w-4 h-4 text-green-400" />}
          {comparison === 'equal' && <Minus className="w-4 h-4 text-gray-400" />}
        </div>
      </div>
    );
  };

  if (!player1) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700 p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6" />
            Head-to-Head Comparison
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Player Selection */}
          <Card className="p-4 bg-slate-700/50 border-slate-600">
            {/* Dropdowns at the top */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Player 1 Team</label>
                  <div className="text-white font-semibold text-sm bg-slate-600/50 px-3 py-2 rounded border border-slate-500">
                    {team1}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Select Opponent Team</label>
                  <Select value={team2} onValueChange={setTeam2}>
                    <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                      <SelectValue placeholder="Choose team..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 text-white max-h-60">
                      {loadingFixtures && upcomingFixtures.length === 0 && (
                        <SelectItem value="loading" disabled>Loading upcoming fixtures...</SelectItem>
                      )}
                      {upcomingFixtures.length > 0 && (
                        <>
                          <div className="px-2 py-1 text-xs text-gray-400 font-semibold">Upcoming Fixtures</div>
                          {upcomingFixtures.map((fixture, idx) => (
                            <SelectItem key={idx} value={fixture.opponent}>
                              {fixture.opponent} (Next match)
                            </SelectItem>
                          ))}
                          <div className="px-2 py-1 text-xs text-gray-400 font-semibold mt-2">All Teams</div>
                        </>
                      )}
                      {getPremierLeagueClubs()
                        .filter(club => club !== team1)
                        .map(club => (
                          <SelectItem key={club} value={club}>{club}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {team2 && (
                <div className="mt-4">
                  <label className="text-sm text-gray-400 mb-2 block">Select Player</label>
                  <Select
                    value={player2?.name || ''}
                    onValueChange={(playerName) => {
                      const selected = team2Players.find(p => p.name === playerName);
                      setPlayer2(selected || null);
                    }}
                  >
                    <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                      <SelectValue placeholder="Choose player..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 text-white max-h-60">
                      {filteredTeam2Players.map((player) => (
                        <SelectItem key={player.name} value={player.name}>
                          {player.shirtNumber && (
                            <ShirtNumberIcon number={player.shirtNumber} size="sm" className="inline mr-2 text-blue-400" />
                          )}
                          {player.name} {player.position && `(${player.position})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Both Players Displayed Side-by-Side at Bottom */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-600">
              {/* Player 1 */}
              <div className="flex items-end gap-3">
                <Avatar className="w-16 h-16 border-2 border-blue-500">
                  <AvatarImage src={player1.imageUrl} alt={player1.name} />
                  <AvatarFallback className="bg-blue-600 text-white text-lg">{player1.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {player1.shirtNumber && (
                      <ShirtNumberIcon number={player1.shirtNumber} size="sm" className="text-blue-400" />
                    )}
                    <h3 className="text-white font-semibold text-lg">{player1.name}</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{team1}</p>
                  {player1.position && (
                    <Badge className="bg-blue-600 text-white">{player1.position}</Badge>
                  )}
                </div>
              </div>

              {/* Player 2 */}
              <div className="flex items-end gap-3">
                {player2 ? (
                  <>
                    <Avatar className="w-16 h-16 border-2 border-purple-500">
                      <AvatarImage src={player2.imageUrl} alt={player2.name} />
                      <AvatarFallback className="bg-purple-600 text-white text-lg">{player2.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {player2.shirtNumber && (
                          <ShirtNumberIcon number={player2.shirtNumber} size="sm" className="text-purple-400" />
                        )}
                        <h3 className="text-white font-semibold text-lg">{player2.name}</h3>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{team2}</p>
                      {player2.position && (
                        <Badge className="bg-purple-600 text-white">{player2.position}</Badge>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 text-center py-4 text-gray-500 text-sm">
                    Select a player to compare
                  </div>
                )}
              </div>
            </div>
          </Card>

          {player2 && (
            <>
              {/* Key Insights */}
              <Card className="p-4 bg-slate-700/50 border-slate-600">
                <h3 className="text-lg font-semibold text-white mb-4">Key Advantages</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm uppercase tracking-wide text-blue-300 mb-3">{player1.name}</h4>
                    {insights.player1.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {insights.player1.map((text, index) => (
                          <Badge
                            key={`p1-insight-${index}`}
                            className="bg-blue-500/15 text-blue-200 border border-blue-400/30 font-normal whitespace-normal py-1 px-2"
                          >
                            {text}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No clear statistical edge recorded yet.</p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm uppercase tracking-wide text-purple-300 mb-3">{player2.name}</h4>
                    {insights.player2.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {insights.player2.map((text, index) => (
                          <Badge
                            key={`p2-insight-${index}`}
                            className="bg-purple-500/15 text-purple-200 border border-purple-400/30 font-normal whitespace-normal py-1 px-2"
                          >
                            {text}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No clear statistical edge recorded yet.</p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Season Statistics - Side by Side */}
              <Card className="p-4 bg-slate-700/50 border-slate-600">
                <h3 className="text-lg font-semibold text-white mb-4">Season Statistics</h3>
                <div className="grid grid-cols-2 gap-6">
                  {/* Player 1 Stats */}
                  <div>
                    <h4 className="text-sm font-semibold text-blue-300 mb-3">{player1.name}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1 border-b border-slate-600">
                        <span className="text-gray-400">Matches</span>
                        <span className="text-white font-medium">{p1Stats.matchesPlayed ?? '-'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-600">
                        <span className="text-gray-400">Appearances</span>
                        <span className="text-white font-medium">{p1Stats.matchesPlayed ?? '-'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-600">
                        <span className="text-gray-400">Started</span>
                        <span className="text-white font-medium">{player1.seasonStats?.competitions?.[0]?.started ?? '-'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-600">
                        <span className="text-gray-400">Minutes per game</span>
                        <span className="text-white font-medium">{p1Stats.minutesPerGame ?? '-'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-600">
                        <span className="text-gray-400">Total minutes</span>
                        <span className="text-white font-medium">{p1Stats.totalMinutes ? p1Stats.totalMinutes.toLocaleString() : '-'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-600">
                        <span className="text-gray-400">Team of the week</span>
                        <span className="text-white font-medium">{player1.seasonStats?.competitions?.[0]?.teamOfTheWeek ?? 0}</span>
                      </div>
                    </div>
                  </div>
                  {/* Player 2 Stats */}
                  <div>
                    <h4 className="text-sm font-semibold text-purple-300 mb-3">{player2.name}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1 border-b border-slate-600">
                        <span className="text-gray-400">Matches</span>
                        <span className="text-white font-medium">{p2Stats.matchesPlayed ?? '-'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-600">
                        <span className="text-gray-400">Appearances</span>
                        <span className="text-white font-medium">{p2Stats.matchesPlayed ?? '-'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-600">
                        <span className="text-gray-400">Started</span>
                        <span className="text-white font-medium">{player2.seasonStats?.competitions?.[0]?.started ?? '-'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-600">
                        <span className="text-gray-400">Minutes per game</span>
                        <span className="text-white font-medium">{p2Stats.minutesPerGame ?? '-'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-600">
                        <span className="text-gray-400">Total minutes</span>
                        <span className="text-white font-medium">{p2Stats.totalMinutes ? p2Stats.totalMinutes.toLocaleString() : '-'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-600">
                        <span className="text-gray-400">Team of the week</span>
                        <span className="text-white font-medium">{player2.seasonStats?.competitions?.[0]?.teamOfTheWeek ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Average Rating - Side by Side */}
              {(() => {
                const p1Rating = typeof p1Stats.sofascoreRating === 'number' ? p1Stats.sofascoreRating : 
                                 (typeof player1.seasonStats?.competitions?.[0]?.averageRating === 'number' ? player1.seasonStats.competitions[0].averageRating : null);
                const p2Rating = typeof p2Stats.sofascoreRating === 'number' ? p2Stats.sofascoreRating : 
                                 (typeof player2.seasonStats?.competitions?.[0]?.averageRating === 'number' ? player2.seasonStats.competitions[0].averageRating : null);
                
                if (!p1Rating && !p2Rating) return null;
                
                return (
                  <Card className="p-4 bg-slate-700/50 border-slate-600">
                    <h3 className="text-lg font-semibold text-white mb-4">Average Rating</h3>
                    <div className="grid grid-cols-2 gap-6">
                      {/* Player 1 Rating */}
                      <div>
                        <h4 className="text-sm font-semibold text-blue-300 mb-3">{player1.name}</h4>
                        <div className="text-center mb-4">
                          <div className="text-3xl font-bold text-blue-400">
                            {p1Rating ? p1Rating.toFixed(2) : '-'}
                          </div>
                        </div>
                        {(() => {
                          const matchDates = player1.seasonStats?.competitions?.[0]?.matchDates;
                          const matchRatings = player1.seasonStats?.competitions?.[0]?.matchRatings;
                          const avgRating = p1Rating;
                          
                          if (Array.isArray(matchDates) && matchDates.length > 0) {
                            try {
                              const chartData = matchDates.map((date: string, idx: number) => {
                                const rating = (Array.isArray(matchRatings) && matchRatings[idx] !== undefined) 
                                  ? matchRatings[idx] 
                                  : (avgRating || 0);
                                return {
                                  date: typeof date === 'string' ? date.split(' ')[0] : String(date),
                                  rating: typeof rating === 'number' ? rating : (typeof avgRating === 'number' ? avgRating : 0)
                                };
                              });
                              
                              return (
                                <div className="h-48">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                      <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                      <YAxis domain={[5, 10]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                      <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff' }} />
                                      <Line type="monotone" dataKey="rating" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
                                    </LineChart>
                                  </ResponsiveContainer>
                                </div>
                              );
                            } catch (error) {
                              console.error('Error rendering player1 rating chart:', error);
                              return null;
                            }
                          }
                          return null;
                        })()}
                      </div>
                      {/* Player 2 Rating */}
                      <div>
                        <h4 className="text-sm font-semibold text-purple-300 mb-3">{player2.name}</h4>
                        <div className="text-center mb-4">
                          <div className="text-3xl font-bold text-purple-400">
                            {p2Rating ? p2Rating.toFixed(2) : '-'}
                          </div>
                        </div>
                        {(() => {
                          const matchDates = player2.seasonStats?.competitions?.[0]?.matchDates;
                          const matchRatings = player2.seasonStats?.competitions?.[0]?.matchRatings;
                          const avgRating = p2Rating;
                          
                          if (Array.isArray(matchDates) && matchDates.length > 0) {
                            try {
                              const chartData = matchDates.map((date: string, idx: number) => {
                                const rating = (Array.isArray(matchRatings) && matchRatings[idx] !== undefined) 
                                  ? matchRatings[idx] 
                                  : (avgRating || 0);
                                return {
                                  date: typeof date === 'string' ? date.split(' ')[0] : String(date),
                                  rating: typeof rating === 'number' ? rating : (typeof avgRating === 'number' ? avgRating : 0)
                                };
                              });
                              
                              return (
                                <div className="h-48">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                      <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                      <YAxis domain={[5, 10]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                      <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff' }} />
                                      <Line type="monotone" dataKey="rating" stroke="#a855f7" strokeWidth={2} dot={{ fill: '#a855f7', r: 3 }} />
                                    </LineChart>
                                  </ResponsiveContainer>
                                </div>
                              );
                            } catch (error) {
                              console.error('Error rendering player2 rating chart:', error);
                              return null;
                            }
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  </Card>
                );
              })()}

              {/* Recent Form */}
              {(recentMatches1.length > 0 || recentMatches2.length > 0) && (
                <Card className="p-4 bg-slate-700/50 border-slate-600">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Form (Last 5 matches)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm uppercase tracking-wide text-blue-300 mb-3">{player1.name}</h4>
                      <div className="space-y-2">
                        {recentMatches1.length > 0 ? recentMatches1.map((match, index) => (
                          <div
                            key={`p1-match-${index}-${match.date}`}
                            className="p-3 rounded-lg border border-slate-600/60 bg-slate-700/30"
                          >
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                              <span>{formatMatchDate(match.date)}</span>
                              <span className="truncate">{match.competition}</span>
                              <span className="text-white font-semibold">{match.score}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-300">
                              <span className="truncate">
                                {(match.team || team1) && (match.opponent)
                                  ? `${match.team || team1} vs ${match.opponent}`
                                  : match.team || match.opponent || 'N/A'}
                              </span>
                              <div className="flex items-center gap-2">
                                {match.outcome && (
                                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${getOutcomeStyles(match.outcome)}`}>
                                    {match.outcome}
                                  </span>
                                )}
                                {typeof match.rating === 'number' && !isNaN(match.rating) && (
                                  <span className="text-amber-300 font-semibold">
                                    {match.rating.toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )) : (
                          <p className="text-sm text-gray-400">No recent matches available.</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm uppercase tracking-wide text-purple-300 mb-3">{player2.name}</h4>
                      <div className="space-y-2">
                        {recentMatches2.length > 0 ? recentMatches2.map((match, index) => (
                          <div
                            key={`p2-match-${index}-${match.date}`}
                            className="p-3 rounded-lg border border-slate-600/60 bg-slate-700/30"
                          >
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                              <span>{formatMatchDate(match.date)}</span>
                              <span className="truncate">{match.competition}</span>
                              <span className="text-white font-semibold">{match.score}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-300">
                              <span className="truncate">
                                {(match.team || team2) && (match.opponent)
                                  ? `${match.team || team2} vs ${match.opponent}`
                                  : match.team || match.opponent || 'N/A'}
                              </span>
                              <div className="flex items-center gap-2">
                                {match.outcome && (
                                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${getOutcomeStyles(match.outcome)}`}>
                                    {match.outcome}
                                  </span>
                                )}
                                {typeof match.rating === 'number' && !isNaN(match.rating) && (
                                  <span className="text-amber-300 font-semibold">
                                    {match.rating.toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )) : (
                          <p className="text-sm text-gray-400">No recent matches available.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Detailed Comparison Stats */}
              {/* General - Bar Chart */}
              <Card className="p-4 bg-slate-700/50 border-slate-600">
                <h3 className="text-lg font-semibold text-white mb-4">General</h3>
                <div className="h-64 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { 
                          name: 'Age', 
                          [player1.name]: p1Stats.age || 0, 
                          [player2.name]: p2Stats.age || 0 
                        },
                        { 
                          name: 'Height (cm)', 
                          [player1.name]: p1Stats.height ? parseFloat(p1Stats.height.replace(/\D/g, '')) : 0, 
                          [player2.name]: p2Stats.height ? parseFloat(p2Stats.height.replace(/\D/g, '')) : 0 
                        },
                        { 
                          name: 'Average Rating', 
                          [player1.name]: (p1Stats.sofascoreRating || 0) * 10, 
                          [player2.name]: (p2Stats.sofascoreRating || 0) * 10 
                        }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <Tooltip
                        formatter={(value: number, name: string) => {
                          if (name === 'Average Rating') {
                            return [(value / 10).toFixed(1), name];
                          }
                          return [value, name];
                        }}
                        contentStyle={{
                          backgroundColor: 'rgba(30, 41, 59, 0.95)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                      <Bar dataKey={player1.name} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey={player2.name} fill="#a855f7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1 text-sm">
                  {renderComparisonRow('Market value', p1Stats.marketValue, p2Stats.marketValue)}
                  {renderComparisonRow('Team', team1, team2)}
                </div>
              </Card>

              {/* Matches - Bar Chart */}
              <Card className="p-4 bg-slate-700/50 border-slate-600">
                <h3 className="text-lg font-semibold text-white mb-4">Matches</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { 
                          name: 'Minutes/Game', 
                          [player1.name]: p1Stats.minutesPerGame || 0, 
                          [player2.name]: p2Stats.minutesPerGame || 0 
                        },
                        { 
                          name: 'Total Minutes', 
                          [player1.name]: (p1Stats.totalMinutes || 0) / 100, 
                          [player2.name]: (p2Stats.totalMinutes || 0) / 100 
                        },
                        { 
                          name: 'Matches', 
                          [player1.name]: p1Stats.matchesPlayed || 0, 
                          [player2.name]: p2Stats.matchesPlayed || 0 
                        }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <Tooltip
                        formatter={(value: number, name: string) => {
                          if (name === 'Total Minutes') {
                            return [`${(value * 100).toLocaleString()}`, name];
                          }
                          return [value, name];
                        }}
                        contentStyle={{
                          backgroundColor: 'rgba(30, 41, 59, 0.95)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                      <Bar dataKey={player1.name} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey={player2.name} fill="#a855f7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Goalkeeping (for goalkeepers) - Visual Charts */}
              {isGoalkeeper && (
                <>
                  <Card className="p-4 bg-slate-700/50 border-slate-600">
                    <h3 className="text-lg font-semibold text-white mb-4">Goalkeeping</h3>
                    <div className="h-72 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            {
                              name: 'Saves',
                              [player1.name]: player1.seasonStats?.competitions?.[0]?.saves ?? p1Stats.saves ?? 0,
                              [player2.name]: player2.seasonStats?.competitions?.[0]?.saves ?? p2Stats.saves ?? 0
                            },
                            {
                              name: 'Clean Sheets',
                              [player1.name]: player1.seasonStats?.competitions?.[0]?.cleanSheets ?? p1Stats.cleanSheets ?? 0,
                              [player2.name]: player2.seasonStats?.competitions?.[0]?.cleanSheets ?? p2Stats.cleanSheets ?? 0
                            },
                            {
                              name: 'Saves/Game',
                              [player1.name]: player1.seasonStats?.competitions?.[0]?.savesPerGame ?? 0,
                              [player2.name]: player2.seasonStats?.competitions?.[0]?.savesPerGame ?? 0
                            },
                            {
                              name: 'Goals Prevented',
                              [player1.name]: Math.max(0, (player1.seasonStats?.competitions?.[0]?.goalsPrevented ?? p1Stats.goalsPrevented ?? 0) * 10),
                              [player2.name]: Math.max(0, (player2.seasonStats?.competitions?.[0]?.goalsPrevented ?? p2Stats.goalsPrevented ?? 0) * 10)
                            },
                            {
                              name: 'Saves Inside Box',
                              [player1.name]: player1.seasonStats?.competitions?.[0]?.savesFromInsideBox ?? 0,
                              [player2.name]: player2.seasonStats?.competitions?.[0]?.savesFromInsideBox ?? 0
                            },
                            {
                              name: 'Saves Outside Box',
                              [player1.name]: player1.seasonStats?.competitions?.[0]?.savesFromOutsideBox ?? 0,
                              [player2.name]: player2.seasonStats?.competitions?.[0]?.savesFromOutsideBox ?? 0
                            }
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        >
                          {createGradientDefs('gradientBlue', '#3b82f6', 'gradientPurple', '#a855f7')}
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(30, 41, 59, 0.95)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '8px',
                              color: '#fff'
                            }}
                            formatter={(value: number, name: string) => {
                              if (name === 'Goals Prevented') {
                                return [(value / 10).toFixed(2), name];
                              }
                              return [value, name];
                            }}
                          />
                          <Legend />
                          <Bar dataKey={player1.name} fill="url(#gradientBlue)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey={player2.name} fill="url(#gradientPurple)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                        <div className="text-blue-300 font-semibold mb-1">{player1.name}</div>
                        <div className="text-white">Goals Conceded: <span className="font-bold">{player1.seasonStats?.competitions?.[0]?.goalsConceded ?? p1Stats.goalsConceded ?? 0}</span></div>
                        <div className="text-white">Goals Conceded/Game: <span className="font-bold">{player1.seasonStats?.competitions?.[0]?.goalsConcededPerGame?.toFixed(2) ?? '-'}</span></div>
                      </div>
                      <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                        <div className="text-purple-300 font-semibold mb-1">{player2.name}</div>
                        <div className="text-white">Goals Conceded: <span className="font-bold">{player2.seasonStats?.competitions?.[0]?.goalsConceded ?? p2Stats.goalsConceded ?? 0}</span></div>
                        <div className="text-white">Goals Conceded/Game: <span className="font-bold">{player2.seasonStats?.competitions?.[0]?.goalsConcededPerGame?.toFixed(2) ?? '-'}</span></div>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Attacking (Distribution) for Goalkeepers */}
                  <Card className="p-4 bg-slate-700/50 border-slate-600">
                    <h3 className="text-lg font-semibold text-white mb-4">Attacking (Distribution)</h3>
                    <div className="h-64 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            {
                              name: 'Goal Kicks/Game',
                              [player1.name]: player1.seasonStats?.competitions?.[0]?.goalKicksPerGame ?? 0,
                              [player2.name]: player2.seasonStats?.competitions?.[0]?.goalKicksPerGame ?? 0
                            },
                            {
                              name: 'Long Balls',
                              [player1.name]: player1.seasonStats?.competitions?.[0]?.accurateLongBalls ?? 0,
                              [player2.name]: player2.seasonStats?.competitions?.[0]?.accurateLongBalls ?? 0
                            },
                            {
                              name: 'Accurate Passes',
                              [player1.name]: player1.seasonStats?.competitions?.[0]?.accuratePasses ?? p1Stats.accuratePasses ?? 0,
                              [player2.name]: player2.seasonStats?.competitions?.[0]?.accuratePasses ?? p2Stats.accuratePasses ?? 0
                            },
                            {
                              name: 'Touches/Game',
                              [player1.name]: player1.seasonStats?.competitions?.[0]?.touches ?? 0,
                              [player2.name]: player2.seasonStats?.competitions?.[0]?.touches ?? 0
                            }
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        >
                          {createGradientDefs('gradientBlue2', '#3b82f6', 'gradientPurple2', '#a855f7')}
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(30, 41, 59, 0.95)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '8px',
                              color: '#fff'
                            }}
                          />
                          <Legend />
                          <Bar dataKey={player1.name} fill="url(#gradientBlue2)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey={player2.name} fill="url(#gradientPurple2)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="text-center p-2 bg-blue-500/10 rounded border border-blue-500/30">
                        <div className="text-blue-300 font-semibold">{player1.name}</div>
                        <div className="text-gray-300">Long Balls Accuracy: <span className="font-bold text-white">{player1.seasonStats?.competitions?.[0]?.accurateLongBallsPercentage ?? 0}%</span></div>
                      </div>
                      <div className="text-center p-2 bg-purple-500/10 rounded border border-purple-500/30">
                        <div className="text-purple-300 font-semibold">{player2.name}</div>
                        <div className="text-gray-300">Long Balls Accuracy: <span className="font-bold text-white">{player2.seasonStats?.competitions?.[0]?.accurateLongBallsPercentage ?? 0}%</span></div>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Passing for Goalkeepers */}
                  <Card className="p-4 bg-slate-700/50 border-slate-600">
                    <h3 className="text-lg font-semibold text-white mb-4">Passing</h3>
                    <div className="h-96 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={[
                          {
                            category: 'Acc. Passes %',
                            [player1.name]: player1.seasonStats?.competitions?.[0]?.accuratePassesPercentage ?? 0,
                            [player2.name]: player2.seasonStats?.competitions?.[0]?.accuratePassesPercentage ?? 0
                          },
                          {
                            category: 'Acc. Own Half %',
                            [player1.name]: player1.seasonStats?.competitions?.[0]?.accuratePassesOwnHalfPercentage ?? 0,
                            [player2.name]: player2.seasonStats?.competitions?.[0]?.accuratePassesOwnHalfPercentage ?? 0
                          },
                          {
                            category: 'Acc. Opp Half %',
                            [player1.name]: player1.seasonStats?.competitions?.[0]?.accuratePassesOppositionHalfPercentage ?? 0,
                            [player2.name]: player2.seasonStats?.competitions?.[0]?.accuratePassesOppositionHalfPercentage ?? 0
                          },
                          {
                            category: 'Long Balls %',
                            [player1.name]: player1.seasonStats?.competitions?.[0]?.accurateLongBallsPercentage ?? 0,
                            [player2.name]: player2.seasonStats?.competitions?.[0]?.accurateLongBallsPercentage ?? 0
                          },
                          {
                            category: 'Chip Passes %',
                            [player1.name]: player1.seasonStats?.competitions?.[0]?.accurateChipPassesPercentage ?? 0,
                            [player2.name]: player2.seasonStats?.competitions?.[0]?.accurateChipPassesPercentage ?? 0
                          },
                          {
                            category: 'Crosses %',
                            [player1.name]: player1.seasonStats?.competitions?.[0]?.accurateCrossesPercentage ?? 0,
                            [player2.name]: player2.seasonStats?.competitions?.[0]?.accurateCrossesPercentage ?? 0
                          }
                        ]}>
                          <PolarGrid stroke="rgba(255,255,255,0.2)" />
                          <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <Radar name={player1.name} dataKey={player1.name} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                          <Radar name={player2.name} dataKey={player2.name} stroke="#a855f7" fill="#a855f7" fillOpacity={0.6} />
                          <Legend />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(30, 41, 59, 0.95)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '8px',
                              color: '#fff'
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="text-center p-2 bg-blue-500/10 rounded border border-blue-500/30">
                        <div className="text-blue-300 font-semibold">{player1.name}</div>
                        <div className="text-white">Touches: <span className="font-bold">{player1.seasonStats?.competitions?.[0]?.touches?.toFixed(1) ?? '-'}</span></div>
                        <div className="text-white">Key Passes: <span className="font-bold">{player1.seasonStats?.competitions?.[0]?.keyPasses?.toFixed(1) ?? '-'}</span></div>
                        <div className="text-white">xA: <span className="font-bold">{player1.seasonStats?.competitions?.[0]?.expectedAssists?.toFixed(2) ?? '-'}</span></div>
                      </div>
                      <div className="text-center p-2 bg-purple-500/10 rounded border border-purple-500/30">
                        <div className="text-purple-300 font-semibold">{player2.name}</div>
                        <div className="text-white">Touches: <span className="font-bold">{player2.seasonStats?.competitions?.[0]?.touches?.toFixed(1) ?? '-'}</span></div>
                        <div className="text-white">Key Passes: <span className="font-bold">{player2.seasonStats?.competitions?.[0]?.keyPasses?.toFixed(1) ?? '-'}</span></div>
                        <div className="text-white">xA: <span className="font-bold">{player2.seasonStats?.competitions?.[0]?.expectedAssists?.toFixed(2) ?? '-'}</span></div>
                      </div>
                      <div className="text-center p-2 bg-slate-600/50 rounded border border-slate-500/30">
                        <div className="text-gray-300 font-semibold mb-1">Comparison</div>
                        <div className="text-white text-[10px]">Higher percentages indicate better passing accuracy</div>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Defending for Goalkeepers */}
                  <Card className="p-4 bg-slate-700/50 border-slate-600">
                    <h3 className="text-lg font-semibold text-white mb-4">Defending</h3>
                    <div className="h-80 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            {
                              name: 'Balls Recovered',
                              [player1.name]: player1.seasonStats?.competitions?.[0]?.ballsRecovered ?? 0,
                              [player2.name]: player2.seasonStats?.competitions?.[0]?.ballsRecovered ?? 0
                            },
                            {
                              name: 'Clean Sheets',
                              [player1.name]: player1.seasonStats?.competitions?.[0]?.cleanSheets ?? p1Stats.cleanSheets ?? 0,
                              [player2.name]: player2.seasonStats?.competitions?.[0]?.cleanSheets ?? p2Stats.cleanSheets ?? 0
                            },
                            {
                              name: 'Clearances',
                              [player1.name]: (player1.seasonStats?.competitions?.[0]?.clearances ?? 0) * 10,
                              [player2.name]: (player2.seasonStats?.competitions?.[0]?.clearances ?? 0) * 10
                            },
                            {
                              name: 'Interceptions',
                              [player1.name]: (player1.seasonStats?.competitions?.[0]?.interceptions ?? 0) * 10,
                              [player2.name]: (player2.seasonStats?.competitions?.[0]?.interceptions ?? 0) * 10
                            },
                            {
                              name: 'Tackles',
                              [player1.name]: (player1.seasonStats?.competitions?.[0]?.tackles ?? 0) * 10,
                              [player2.name]: (player2.seasonStats?.competitions?.[0]?.tackles ?? 0) * 10
                            }
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          {createGradientDefs('gradientBlue3', '#10b981', 'gradientPurple3', '#06b6d4')}
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(30, 41, 59, 0.95)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '8px',
                              color: '#fff'
                            }}
                            formatter={(value: number, name: string) => {
                              if (['Clearances', 'Interceptions', 'Tackles'].includes(name)) {
                                return [(value / 10).toFixed(1), 'per game'];
                              }
                              return [value, name];
                            }}
                          />
                          <Legend />
                          <Bar dataKey={player1.name} fill="url(#gradientBlue3)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey={player2.name} fill="url(#gradientPurple3)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="text-center p-2 bg-green-500/10 rounded border border-green-500/30">
                        <div className="text-green-300 font-semibold">{player1.name}</div>
                        <div className="text-white">Errors to Shot: <span className="font-bold">{player1.seasonStats?.competitions?.[0]?.errorsLeadingToShot ?? 0}</span></div>
                        <div className="text-white">Dribbled Past: <span className="font-bold">{(player1.seasonStats?.competitions?.[0]?.dribbledPast ?? 0).toFixed(1)}</span></div>
                      </div>
                      <div className="text-center p-2 bg-cyan-500/10 rounded border border-cyan-500/30">
                        <div className="text-cyan-300 font-semibold">{player2.name}</div>
                        <div className="text-white">Errors to Shot: <span className="font-bold">{player2.seasonStats?.competitions?.[0]?.errorsLeadingToShot ?? 0}</span></div>
                        <div className="text-white">Dribbled Past: <span className="font-bold">{(player2.seasonStats?.competitions?.[0]?.dribbledPast ?? 0).toFixed(1)}</span></div>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Other for Goalkeepers */}
                  <Card className="p-4 bg-slate-700/50 border-slate-600">
                    <h3 className="text-lg font-semibold text-white mb-4">Other</h3>
                    <div className="h-96 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={[
                          {
                            category: 'Total Duels %',
                            [player1.name]: player1.seasonStats?.competitions?.[0]?.totalDuelsWonPercentage ?? 0,
                            [player2.name]: player2.seasonStats?.competitions?.[0]?.totalDuelsWonPercentage ?? 0
                          },
                          {
                            category: 'Aerial Duels %',
                            [player1.name]: player1.seasonStats?.competitions?.[0]?.aerialDuelsWonPercentage ?? 0,
                            [player2.name]: player2.seasonStats?.competitions?.[0]?.aerialDuelsWonPercentage ?? 0
                          },
                          {
                            category: 'Ground Duels %',
                            [player1.name]: player1.seasonStats?.competitions?.[0]?.groundDuelsWonPercentage ?? 0,
                            [player2.name]: player2.seasonStats?.competitions?.[0]?.groundDuelsWonPercentage ?? 0
                          },
                          {
                            category: 'Was Fouled',
                            [player1.name]: ((player1.seasonStats?.competitions?.[0]?.wasFouled ?? 0) * 20),
                            [player2.name]: ((player2.seasonStats?.competitions?.[0]?.wasFouled ?? 0) * 20)
                          },
                          {
                            category: 'Possession Lost',
                            [player1.name]: 100 - ((player1.seasonStats?.competitions?.[0]?.possessionLost ?? 0) * 5),
                            [player2.name]: 100 - ((player2.seasonStats?.competitions?.[0]?.possessionLost ?? 0) * 5)
                          }
                        ]}>
                          <PolarGrid stroke="rgba(255,255,255,0.2)" />
                          <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <Radar name={player1.name} dataKey={player1.name} stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                          <Radar name={player2.name} dataKey={player2.name} stroke="#ec4899" fill="#ec4899" fillOpacity={0.6} />
                          <Legend />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(30, 41, 59, 0.95)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '8px',
                              color: '#fff'
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="text-center p-2 bg-amber-500/10 rounded border border-amber-500/30">
                        <div className="text-amber-300 font-semibold">{player1.name}</div>
                        <div className="text-white">Possession Lost: <span className="font-bold">{player1.seasonStats?.competitions?.[0]?.possessionLost?.toFixed(1) ?? '-'}</span></div>
                        <div className="text-white">Fouls/Game: <span className="font-bold">{player1.seasonStats?.competitions?.[0]?.fouls?.toFixed(1) ?? '-'}</span></div>
                      </div>
                      <div className="text-center p-2 bg-pink-500/10 rounded border border-pink-500/30">
                        <div className="text-pink-300 font-semibold">{player2.name}</div>
                        <div className="text-white">Possession Lost: <span className="font-bold">{player2.seasonStats?.competitions?.[0]?.possessionLost?.toFixed(1) ?? '-'}</span></div>
                        <div className="text-white">Fouls/Game: <span className="font-bold">{player2.seasonStats?.competitions?.[0]?.fouls?.toFixed(1) ?? '-'}</span></div>
                      </div>
                      <div className="text-center p-2 bg-slate-600/50 rounded border border-slate-500/30">
                        <div className="text-gray-300 font-semibold mb-1">Duel Stats</div>
                        <div className="text-white text-[10px]">Higher percentages = better duel success rate</div>
                      </div>
                    </div>
                  </Card>
                </>
              )}

              {/* Attacking - Visual Charts */}
              {!isGoalkeeper && (
                <Card className="p-4 bg-slate-700/50 border-slate-600">
                  <h3 className="text-lg font-semibold text-white mb-4">Attacking</h3>
                  <div className="h-96 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          {
                            name: 'Goals',
                            [player1.name]: player1.seasonStats?.competitions?.[0]?.goals ?? p1Stats.goals ?? 0,
                            [player2.name]: player2.seasonStats?.competitions?.[0]?.goals ?? p2Stats.goals ?? 0
                          },
                          {
                            name: 'Goals/Game',
                            [player1.name]: (player1.seasonStats?.competitions?.[0]?.goalsPerGame ?? p1Stats.goalsPerGame ?? 0) * 10,
                            [player2.name]: (player2.seasonStats?.competitions?.[0]?.goalsPerGame ?? p2Stats.goalsPerGame ?? 0) * 10
                          },
                          {
                            name: 'Total Shots',
                            [player1.name]: (player1.seasonStats?.competitions?.[0]?.totalShots ?? 0) * 10,
                            [player2.name]: (player2.seasonStats?.competitions?.[0]?.totalShots ?? 0) * 10
                          },
                          {
                            name: 'Shots on Target',
                            [player1.name]: (player1.seasonStats?.competitions?.[0]?.shotsOnTargetPerGame ?? 0) * 10,
                            [player2.name]: (player2.seasonStats?.competitions?.[0]?.shotsOnTargetPerGame ?? 0) * 10
                          },
                          {
                            name: 'Goal Conversion %',
                            [player1.name]: player1.seasonStats?.competitions?.[0]?.goalConversion ?? 0,
                            [player2.name]: player2.seasonStats?.competitions?.[0]?.goalConversion ?? 0
                          },
                          {
                            name: 'Penalty Goals',
                            [player1.name]: player1.seasonStats?.competitions?.[0]?.penaltyGoals ?? 0,
                            [player2.name]: player2.seasonStats?.competitions?.[0]?.penaltyGoals ?? 0
                          },
                          {
                            name: 'Free Kick Goals',
                            [player1.name]: player1.seasonStats?.competitions?.[0]?.freeKickGoals ?? 0,
                            [player2.name]: player2.seasonStats?.competitions?.[0]?.freeKickGoals ?? 0
                          }
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        {createGradientDefs('gradientAttBlue', '#ef4444', 'gradientAttPurple', '#f97316')}
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(30, 41, 59, 0.95)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                          formatter={(value: number, name: string) => {
                            if (['Goals/Game', 'Total Shots', 'Shots on Target'].includes(name)) {
                              return [(value / 10).toFixed(1), name];
                            }
                            return [value, name];
                          }}
                        />
                        <Legend />
                        <Bar dataKey={player1.name} fill="url(#gradientAttBlue)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey={player2.name} fill="url(#gradientAttPurple)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="text-center p-2 bg-red-500/10 rounded border border-red-500/30">
                      <div className="text-red-300 font-semibold">{player1.name}</div>
                      <div className="text-white">Big Chances Missed: <span className="font-bold">{player1.seasonStats?.competitions?.[0]?.bigChancesMissed ?? p1Stats.bigChancesMissed ?? 0}</span></div>
                      <div className="text-white">Inside Box: <span className="font-bold">{player1.seasonStats?.competitions?.[0]?.goalsFromInsideBox ?? '-'}</span></div>
                      <div className="text-white">Outside Box: <span className="font-bold">{player1.seasonStats?.competitions?.[0]?.goalsFromOutsideBox ?? '-'}</span></div>
                    </div>
                    <div className="text-center p-2 bg-orange-500/10 rounded border border-orange-500/30">
                      <div className="text-orange-300 font-semibold">{player2.name}</div>
                      <div className="text-white">Big Chances Missed: <span className="font-bold">{player2.seasonStats?.competitions?.[0]?.bigChancesMissed ?? p2Stats.bigChancesMissed ?? 0}</span></div>
                      <div className="text-white">Inside Box: <span className="font-bold">{player2.seasonStats?.competitions?.[0]?.goalsFromInsideBox ?? '-'}</span></div>
                      <div className="text-white">Outside Box: <span className="font-bold">{player2.seasonStats?.competitions?.[0]?.goalsFromOutsideBox ?? '-'}</span></div>
                    </div>
                    <div className="text-center p-2 bg-slate-600/50 rounded border border-slate-500/30">
                      <div className="text-gray-300 font-semibold mb-1">Goal Types</div>
                      <div className="text-white text-[10px]">Headed: P1: {player1.seasonStats?.competitions?.[0]?.headedGoals ?? 0} | P2: {player2.seasonStats?.competitions?.[0]?.headedGoals ?? 0}</div>
                      <div className="text-white text-[10px]">Left: P1: {player1.seasonStats?.competitions?.[0]?.leftFootedGoals ?? 0} | P2: {player2.seasonStats?.competitions?.[0]?.leftFootedGoals ?? 0}</div>
                      <div className="text-white text-[10px]">Right: P1: {player1.seasonStats?.competitions?.[0]?.rightFootedGoals ?? 0} | P2: {player2.seasonStats?.competitions?.[0]?.rightFootedGoals ?? 0}</div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Passing - Visual Charts */}
              {!isGoalkeeper && (
                <Card className="p-4 bg-slate-700/50 border-slate-600">
                  <h3 className="text-lg font-semibold text-white mb-4">Passing</h3>
                  <div className="h-96 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={[
                        {
                          category: 'Acc. Passes %',
                          [player1.name]: player1.seasonStats?.competitions?.[0]?.accuratePassesPercentage ?? 0,
                          [player2.name]: player2.seasonStats?.competitions?.[0]?.accuratePassesPercentage ?? 0
                        },
                        {
                          category: 'Acc. Own Half %',
                          [player1.name]: player1.seasonStats?.competitions?.[0]?.accuratePassesOwnHalfPercentage ?? 0,
                          [player2.name]: player2.seasonStats?.competitions?.[0]?.accuratePassesOwnHalfPercentage ?? 0
                        },
                        {
                          category: 'Acc. Opp Half %',
                          [player1.name]: player1.seasonStats?.competitions?.[0]?.accuratePassesOppositionHalfPercentage ?? 0,
                          [player2.name]: player2.seasonStats?.competitions?.[0]?.accuratePassesOppositionHalfPercentage ?? 0
                        },
                        {
                          category: 'Long Balls %',
                          [player1.name]: player1.seasonStats?.competitions?.[0]?.accurateLongBallsPercentage ?? 0,
                          [player2.name]: player2.seasonStats?.competitions?.[0]?.accurateLongBallsPercentage ?? 0
                        },
                        {
                          category: 'Chip Passes %',
                          [player1.name]: player1.seasonStats?.competitions?.[0]?.accurateChipPassesPercentage ?? 0,
                          [player2.name]: player2.seasonStats?.competitions?.[0]?.accurateChipPassesPercentage ?? 0
                        },
                        {
                          category: 'Crosses %',
                          [player1.name]: player1.seasonStats?.competitions?.[0]?.accurateCrossesPercentage ?? 0,
                          [player2.name]: player2.seasonStats?.competitions?.[0]?.accurateCrossesPercentage ?? 0
                        }
                      ]}>
                        <PolarGrid stroke="rgba(255,255,255,0.2)" />
                        <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <Radar name={player1.name} dataKey={player1.name} stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
                        <Radar name={player2.name} dataKey={player2.name} stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                        <Legend />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(30, 41, 59, 0.95)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="text-center p-2 bg-cyan-500/10 rounded border border-cyan-500/30">
                      <div className="text-cyan-300 font-semibold">{player1.name}</div>
                      <div className="text-white">Assists: <span className="font-bold">{player1.seasonStats?.competitions?.[0]?.assists ?? p1Stats.assists ?? 0}</span></div>
                      <div className="text-white">xA: <span className="font-bold">{player1.seasonStats?.competitions?.[0]?.expectedAssists?.toFixed(2) ?? p1Stats.expectedAssists?.toFixed(2) ?? '-'}</span></div>
                      <div className="text-white">Key Passes: <span className="font-bold">{player1.seasonStats?.competitions?.[0]?.keyPasses?.toFixed(1) ?? '-'}</span></div>
                      <div className="text-white">Big Chances: <span className="font-bold">{player1.seasonStats?.competitions?.[0]?.bigChancesCreated ?? p1Stats.bigChancesCreated ?? 0}</span></div>
                    </div>
                    <div className="text-center p-2 bg-purple-500/10 rounded border border-purple-500/30">
                      <div className="text-purple-300 font-semibold">{player2.name}</div>
                      <div className="text-white">Assists: <span className="font-bold">{player2.seasonStats?.competitions?.[0]?.assists ?? p2Stats.assists ?? 0}</span></div>
                      <div className="text-white">xA: <span className="font-bold">{player2.seasonStats?.competitions?.[0]?.expectedAssists?.toFixed(2) ?? p2Stats.expectedAssists?.toFixed(2) ?? '-'}</span></div>
                      <div className="text-white">Key Passes: <span className="font-bold">{player2.seasonStats?.competitions?.[0]?.keyPasses?.toFixed(1) ?? '-'}</span></div>
                      <div className="text-white">Big Chances: <span className="font-bold">{player2.seasonStats?.competitions?.[0]?.bigChancesCreated ?? p2Stats.bigChancesCreated ?? 0}</span></div>
                    </div>
                    <div className="text-center p-2 bg-slate-600/50 rounded border border-slate-500/30">
                      <div className="text-gray-300 font-semibold mb-1">Passing Stats</div>
                      <div className="text-white text-[10px]">Touches: P1: {player1.seasonStats?.competitions?.[0]?.touches?.toFixed(1) ?? '-'} | P2: {player2.seasonStats?.competitions?.[0]?.touches?.toFixed(1) ?? '-'}</div>
                      <div className="text-white text-[10px]">Higher percentages = better accuracy</div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Defending - Visual Charts */}
              {!isGoalkeeper && (
                <Card className="p-4 bg-slate-700/50 border-slate-600">
                  <h3 className="text-lg font-semibold text-white mb-4">Defending</h3>
                  <div className="h-80 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          {
                            name: 'Interceptions',
                            [player1.name]: (player1.seasonStats?.competitions?.[0]?.interceptions ?? p1Stats.interceptions ?? 0) * 10,
                            [player2.name]: (player2.seasonStats?.competitions?.[0]?.interceptions ?? p2Stats.interceptions ?? 0) * 10
                          },
                          {
                            name: 'Tackles',
                            [player1.name]: (player1.seasonStats?.competitions?.[0]?.tackles ?? p1Stats.tackles ?? 0) * 10,
                            [player2.name]: (player2.seasonStats?.competitions?.[0]?.tackles ?? p2Stats.tackles ?? 0) * 10
                          },
                          {
                            name: 'Clearances',
                            [player1.name]: (player1.seasonStats?.competitions?.[0]?.clearances ?? p1Stats.clearances ?? 0) * 10,
                            [player2.name]: (player2.seasonStats?.competitions?.[0]?.clearances ?? p2Stats.clearances ?? 0) * 10
                          },
                          {
                            name: 'Blocked Shots',
                            [player1.name]: (player1.seasonStats?.competitions?.[0]?.blockedShots ?? p1Stats.blockedShots ?? 0) * 10,
                            [player2.name]: (player2.seasonStats?.competitions?.[0]?.blockedShots ?? p2Stats.blockedShots ?? 0) * 10
                          },
                          {
                            name: 'Balls Recovered',
                            [player1.name]: (player1.seasonStats?.competitions?.[0]?.ballsRecovered ?? 0) * 10,
                            [player2.name]: (player2.seasonStats?.competitions?.[0]?.ballsRecovered ?? 0) * 10
                          }
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        {createGradientDefs('gradientDefBlue', '#10b981', 'gradientDefPurple', '#06b6d4')}
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(30, 41, 59, 0.95)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                          formatter={(value: number) => [(value / 10).toFixed(1), 'per game']}
                        />
                        <Legend />
                        <Bar dataKey={player1.name} fill="url(#gradientDefBlue)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey={player2.name} fill="url(#gradientDefPurple)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="text-center p-2 bg-green-500/10 rounded border border-green-500/30">
                      <div className="text-green-300 font-semibold">{player1.name}</div>
                      <div className="text-white">Clean Sheets: <span className="font-bold">{player1.seasonStats?.competitions?.[0]?.cleanSheets ?? 0}</span></div>
                      <div className="text-white">Dribbled Past: <span className="font-bold">{(player1.seasonStats?.competitions?.[0]?.dribbledPast ?? p1Stats.dribbledPast ?? 0).toFixed(1)}</span></div>
                      <div className="text-white">Errors to Shot: <span className="font-bold">{player1.seasonStats?.competitions?.[0]?.errorsLeadingToShot ?? 0}</span></div>
                    </div>
                    <div className="text-center p-2 bg-cyan-500/10 rounded border border-cyan-500/30">
                      <div className="text-cyan-300 font-semibold">{player2.name}</div>
                      <div className="text-white">Clean Sheets: <span className="font-bold">{player2.seasonStats?.competitions?.[0]?.cleanSheets ?? 0}</span></div>
                      <div className="text-white">Dribbled Past: <span className="font-bold">{(player2.seasonStats?.competitions?.[0]?.dribbledPast ?? p2Stats.dribbledPast ?? 0).toFixed(1)}</span></div>
                      <div className="text-white">Errors to Shot: <span className="font-bold">{player2.seasonStats?.competitions?.[0]?.errorsLeadingToShot ?? 0}</span></div>
                    </div>
                    <div className="text-center p-2 bg-slate-600/50 rounded border border-slate-500/30">
                      <div className="text-gray-300 font-semibold mb-1">Defensive Stats</div>
                      <div className="text-white text-[10px]">Lower dribbled past = better</div>
                      <div className="text-white text-[10px]">Higher interceptions/tackles = better</div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Other - Visual Charts */}
              {!isGoalkeeper && (
                <Card className="p-4 bg-slate-700/50 border-slate-600">
                  <h3 className="text-lg font-semibold text-white mb-4">Other</h3>
                  <div className="h-96 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={[
                        {
                          category: 'Dribbles %',
                          [player1.name]: player1.seasonStats?.competitions?.[0]?.successfulDribblesPercentage ?? 0,
                          [player2.name]: player2.seasonStats?.competitions?.[0]?.successfulDribblesPercentage ?? 0
                        },
                        {
                          category: 'Total Duels %',
                          [player1.name]: player1.seasonStats?.competitions?.[0]?.totalDuelsWonPercentage ?? 0,
                          [player2.name]: player2.seasonStats?.competitions?.[0]?.totalDuelsWonPercentage ?? 0
                        },
                        {
                          category: 'Ground Duels %',
                          [player1.name]: player1.seasonStats?.competitions?.[0]?.groundDuelsWonPercentage ?? 0,
                          [player2.name]: player2.seasonStats?.competitions?.[0]?.groundDuelsWonPercentage ?? 0
                        },
                        {
                          category: 'Aerial Duels %',
                          [player1.name]: player1.seasonStats?.competitions?.[0]?.aerialDuelsWonPercentage ?? 0,
                          [player2.name]: player2.seasonStats?.competitions?.[0]?.aerialDuelsWonPercentage ?? 0
                        },
                        {
                          category: 'Was Fouled',
                          [player1.name]: ((player1.seasonStats?.competitions?.[0]?.wasFouled ?? p1Stats.wasFouled ?? 0) * 10),
                          [player2.name]: ((player2.seasonStats?.competitions?.[0]?.wasFouled ?? p2Stats.wasFouled ?? 0) * 10)
                        }
                      ]}>
                        <PolarGrid stroke="rgba(255,255,255,0.2)" />
                        <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <Radar name={player1.name} dataKey={player1.name} stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                        <Radar name={player2.name} dataKey={player2.name} stroke="#ec4899" fill="#ec4899" fillOpacity={0.6} />
                        <Legend />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(30, 41, 59, 0.95)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="text-center p-2 bg-amber-500/10 rounded border border-amber-500/30">
                      <div className="text-amber-300 font-semibold">{player1.name}</div>
                      <div className="text-white">Possession Lost: <span className="font-bold">{player1.seasonStats?.competitions?.[0]?.possessionLost?.toFixed(1) ?? p1Stats.possessionLost?.toFixed(1) ?? '-'}</span></div>
                      <div className="text-white">Fouls/Game: <span className="font-bold">{player1.seasonStats?.competitions?.[0]?.fouls?.toFixed(1) ?? p1Stats.fouls?.toFixed(1) ?? '-'}</span></div>
                      <div className="text-white">Offsides: <span className="font-bold">{player1.seasonStats?.competitions?.[0]?.offsides ?? 0}</span></div>
                    </div>
                    <div className="text-center p-2 bg-pink-500/10 rounded border border-pink-500/30">
                      <div className="text-pink-300 font-semibold">{player2.name}</div>
                      <div className="text-white">Possession Lost: <span className="font-bold">{player2.seasonStats?.competitions?.[0]?.possessionLost?.toFixed(1) ?? p2Stats.possessionLost?.toFixed(1) ?? '-'}</span></div>
                      <div className="text-white">Fouls/Game: <span className="font-bold">{player2.seasonStats?.competitions?.[0]?.fouls?.toFixed(1) ?? p2Stats.fouls?.toFixed(1) ?? '-'}</span></div>
                      <div className="text-white">Offsides: <span className="font-bold">{player2.seasonStats?.competitions?.[0]?.offsides ?? 0}</span></div>
                    </div>
                    <div className="text-center p-2 bg-slate-600/50 rounded border border-slate-500/30">
                      <div className="text-gray-300 font-semibold mb-1">Duel Stats</div>
                      <div className="text-white text-[10px]">Higher percentages = better success rate</div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Cards - Visual Chart */}
              <Card className="p-4 bg-slate-700/50 border-slate-600">
                <h3 className="text-lg font-semibold text-white mb-4">Cards</h3>
                <div className="h-64 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          name: 'Yellow',
                          [player1.name]: player1.seasonStats?.competitions?.[0]?.yellowCards ?? p1Stats.yellowCards ?? 0,
                          [player2.name]: player2.seasonStats?.competitions?.[0]?.yellowCards ?? p2Stats.yellowCards ?? 0
                        },
                        {
                          name: 'Red (2Y)',
                          [player1.name]: player1.seasonStats?.competitions?.[0]?.yellowRedCards ?? p1Stats.yellowRedCards ?? 0,
                          [player2.name]: player2.seasonStats?.competitions?.[0]?.yellowRedCards ?? p2Stats.yellowRedCards ?? 0
                        },
                        {
                          name: 'Red',
                          [player1.name]: player1.seasonStats?.competitions?.[0]?.redCards ?? p1Stats.redCards ?? 0,
                          [player2.name]: player2.seasonStats?.competitions?.[0]?.redCards ?? p2Stats.redCards ?? 0
                        }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(30, 41, 59, 0.95)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                      <Legend />
                      <Bar dataKey={player1.name} fill="#fbbf24" radius={[4, 4, 0, 0]} />
                      <Bar dataKey={player2.name} fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="text-center p-2 bg-yellow-500/10 rounded border border-yellow-500/30">
                    <div className="text-yellow-300 font-semibold">{player1.name}</div>
                    <div className="text-white">Total Cards: <span className="font-bold">{(player1.seasonStats?.competitions?.[0]?.yellowCards ?? p1Stats.yellowCards ?? 0) + (player1.seasonStats?.competitions?.[0]?.yellowRedCards ?? p1Stats.yellowRedCards ?? 0) + (player1.seasonStats?.competitions?.[0]?.redCards ?? p1Stats.redCards ?? 0)}</span></div>
                  </div>
                  <div className="text-center p-2 bg-orange-500/10 rounded border border-orange-500/30">
                    <div className="text-orange-300 font-semibold">{player2.name}</div>
                    <div className="text-white">Total Cards: <span className="font-bold">{(player2.seasonStats?.competitions?.[0]?.yellowCards ?? p2Stats.yellowCards ?? 0) + (player2.seasonStats?.competitions?.[0]?.yellowRedCards ?? p2Stats.yellowRedCards ?? 0) + (player2.seasonStats?.competitions?.[0]?.redCards ?? p2Stats.redCards ?? 0)}</span></div>
                  </div>
                </div>
              </Card>
            </>
          )}

          {!player2 && (
            <Card className="p-4 bg-slate-700/50 border-slate-600">
              <p className="text-gray-400 text-center py-8">
                Select an opponent team and player to compare
              </p>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

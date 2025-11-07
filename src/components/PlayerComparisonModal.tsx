import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
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

  const isGoalkeeper = player1.position?.toLowerCase().includes('goalkeeper');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6" />
              Head-to-Head Comparison
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Player Selection */}
          <Card className="p-4 bg-slate-700/50 border-slate-600">
            <div className="grid grid-cols-2 gap-6">
              {/* Player 1 */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={player1.imageUrl} alt={player1.name} />
                    <AvatarFallback>{player1.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      {player1.shirtNumber && (
                        <ShirtNumberIcon number={player1.shirtNumber} size="sm" className="text-blue-400" />
                      )}
                      <h3 className="text-white font-semibold">{player1.name}</h3>
                    </div>
                    <p className="text-gray-400 text-sm">{team1}</p>
                    {player1.position && (
                      <Badge className="bg-blue-600 mt-1">{player1.position}</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Player 2 Selection */}
              <div>
                <div className="mb-3">
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

                {team2 && (
                  <div className="mb-3">
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

                {player2 && (
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={player2.imageUrl} alt={player2.name} />
                      <AvatarFallback>{player2.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        {player2.shirtNumber && (
                          <ShirtNumberIcon number={player2.shirtNumber} size="sm" className="text-blue-400" />
                        )}
                        <h3 className="text-white font-semibold">{player2.name}</h3>
                      </div>
                      <p className="text-gray-400 text-sm">{team2}</p>
                      {player2.position && (
                        <Badge className="bg-purple-600 mt-1">{player2.position}</Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Detailed Comparison Stats */}
          {player2 && (
            <>
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
                          name: 'Sofascore Rating', 
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
                          if (name === 'Sofascore Rating') {
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

              {/* Goalkeeping (for goalkeepers) - Radar Chart */}
              {isGoalkeeper && (
                <Card className="p-4 bg-slate-700/50 border-slate-600">
                  <h3 className="text-lg font-semibold text-white mb-4">Goalkeeping</h3>
                  <div className="h-80 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={[
                        {
                          category: 'Clean Sheets',
                          [player1.name]: p1Stats.cleanSheets || 0,
                          [player2.name]: p2Stats.cleanSheets || 0
                        },
                        {
                          category: 'Saves',
                          [player1.name]: (p1Stats.saves || 0) / 10,
                          [player2.name]: (p2Stats.saves || 0) / 10
                        },
                        {
                          category: 'Goals Prevented',
                          [player1.name]: ((p1Stats.goalsPrevented || 0) + 5) * 2,
                          [player2.name]: ((p2Stats.goalsPrevented || 0) + 5) * 2
                        },
                        {
                          category: 'Acc. Passes',
                          [player1.name]: ((p1Stats.accuratePasses || 0) / 100),
                          [player2.name]: ((p2Stats.accuratePasses || 0) / 100)
                        },
                        {
                          category: 'Acc. Long Balls',
                          [player1.name]: p1Stats.accurateLongBalls || 0,
                          [player2.name]: p2Stats.accurateLongBalls || 0
                        },
                        {
                          category: 'Goals Conceded',
                          [player1.name]: 100 - ((p1Stats.goalsConceded || 0) * 3),
                          [player2.name]: 100 - ((p2Stats.goalsConceded || 0) * 3)
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
                  <div className="space-y-1 text-sm">
                    {renderComparisonRow('Goals conceded', p1Stats.goalsConceded, p2Stats.goalsConceded, undefined, false)}
                    {renderComparisonRow('Saves', p1Stats.saves, p2Stats.saves)}
                    {renderComparisonRow('Goals prevented', p1Stats.goalsPrevented, p2Stats.goalsPrevented)}
                    {renderComparisonRow('Clean sheets', p1Stats.cleanSheets, p2Stats.cleanSheets)}
                    {renderComparisonRow('Accurate passes', p1Stats.accuratePasses, p2Stats.accuratePasses)}
                    {renderComparisonRow('Acc. long balls', p1Stats.accurateLongBalls, p2Stats.accurateLongBalls, '%')}
                  </div>
                </Card>
              )}

              {/* Attacking - Bar Chart */}
              <Card className="p-4 bg-slate-700/50 border-slate-600">
                <h3 className="text-lg font-semibold text-white mb-4">Attacking</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { 
                          name: 'Goals', 
                          [player1.name]: p1Stats.goals || 0, 
                          [player2.name]: p2Stats.goals || 0 
                        },
                        { 
                          name: 'Goals/Game', 
                          [player1.name]: p1Stats.goalsPerGame || 0, 
                          [player2.name]: p2Stats.goalsPerGame || 0 
                        },
                        { 
                          name: 'Shots Off Target', 
                          [player1.name]: p1Stats.shotsOffTarget || 0, 
                          [player2.name]: p2Stats.shotsOffTarget || 0 
                        },
                        { 
                          name: 'Shots On Target', 
                          [player1.name]: p1Stats.shotsOnTarget || 0, 
                          [player2.name]: p2Stats.shotsOnTarget || 0 
                        },
                        { 
                          name: 'Big Chances Missed', 
                          [player1.name]: p1Stats.bigChancesMissed || 0, 
                          [player2.name]: p2Stats.bigChancesMissed || 0 
                        }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
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
                      />
                      <Bar dataKey={player1.name} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey={player2.name} fill="#a855f7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Passes - Bar Chart */}
              <Card className="p-4 bg-slate-700/50 border-slate-600">
                <h3 className="text-lg font-semibold text-white mb-4">Passes</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { 
                          name: 'Assists', 
                          [player1.name]: p1Stats.assists || 0, 
                          [player2.name]: p2Stats.assists || 0 
                        },
                        { 
                          name: 'Assists/Game', 
                          [player1.name]: p1Stats.assistsPerGame || 0, 
                          [player2.name]: p2Stats.assistsPerGame || 0 
                        },
                        { 
                          name: 'Expected Assists', 
                          [player1.name]: (p1Stats.expectedAssists || 0) * 10, 
                          [player2.name]: (p2Stats.expectedAssists || 0) * 10 
                        },
                        { 
                          name: 'Big Chances Created', 
                          [player1.name]: p1Stats.bigChancesCreated || 0, 
                          [player2.name]: p2Stats.bigChancesCreated || 0 
                        },
                        { 
                          name: 'Long Balls', 
                          [player1.name]: p1Stats.longBalls || 0, 
                          [player2.name]: p2Stats.longBalls || 0 
                        },
                        { 
                          name: 'Crosses', 
                          [player1.name]: p1Stats.crosses || 0, 
                          [player2.name]: p2Stats.crosses || 0 
                        }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <Tooltip
                        formatter={(value: number, name: string) => {
                          if (name === 'Expected Assists') {
                            return [(value / 10).toFixed(2), name];
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
                <div className="mt-4 space-y-1 text-sm">
                  {renderComparisonRow('Long balls', 
                    p1Stats.longBalls ? `${p1Stats.longBalls} (${p1Stats.longBallsPercentage}%)` : undefined,
                    p2Stats.longBalls ? `${p2Stats.longBalls} (${p2Stats.longBallsPercentage}%)` : undefined
                  )}
                  {renderComparisonRow('Crosses', 
                    p1Stats.crosses !== undefined ? `${p1Stats.crosses} (${p1Stats.crossesPercentage}%)` : undefined,
                    p2Stats.crosses !== undefined ? `${p2Stats.crosses} (${p2Stats.crossesPercentage}%)` : undefined
                  )}
                </div>
              </Card>

              {/* Defending - Bar Chart */}
              <Card className="p-4 bg-slate-700/50 border-slate-600">
                <h3 className="text-lg font-semibold text-white mb-4">Defending</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { 
                          name: 'Interceptions', 
                          [player1.name]: (p1Stats.interceptions || 0) * 10, 
                          [player2.name]: (p2Stats.interceptions || 0) * 10 
                        },
                        { 
                          name: 'Tackles', 
                          [player1.name]: (p1Stats.tackles || 0) * 10, 
                          [player2.name]: (p2Stats.tackles || 0) * 10 
                        },
                        { 
                          name: 'Clearances', 
                          [player1.name]: (p1Stats.clearances || 0) * 10, 
                          [player2.name]: (p2Stats.clearances || 0) * 10 
                        },
                        { 
                          name: 'Blocked Shots', 
                          [player1.name]: (p1Stats.blockedShots || 0) * 10, 
                          [player2.name]: (p2Stats.blockedShots || 0) * 10 
                        }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <Tooltip
                        formatter={(value: number) => [(value / 10).toFixed(1), 'per game']}
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
                <div className="mt-4 space-y-1 text-sm">
                  {renderComparisonRow('Dribbled past', p1Stats.dribbledPast, p2Stats.dribbledPast, undefined, false)}
                </div>
              </Card>

              {/* Other (per game) - Radar Chart */}
              <Card className="p-4 bg-slate-700/50 border-slate-600">
                <h3 className="text-lg font-semibold text-white mb-4">Other (per game)</h3>
                <div className="h-80 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={[
                      {
                        category: 'Succ. Dribbles',
                        [player1.name]: p1Stats.successfulDribblesPercentage || 0,
                        [player2.name]: p2Stats.successfulDribblesPercentage || 0
                      },
                      {
                        category: 'Ground Duels',
                        [player1.name]: p1Stats.groundDuelsWonPercentage || 0,
                        [player2.name]: p2Stats.groundDuelsWonPercentage || 0
                      },
                      {
                        category: 'Aerial Duels',
                        [player1.name]: p1Stats.aerialDuelsWonPercentage || 0,
                        [player2.name]: p2Stats.aerialDuelsWonPercentage || 0
                      },
                      {
                        category: 'Was Fouled',
                        [player1.name]: ((p1Stats.wasFouled || 0) * 20),
                        [player2.name]: ((p2Stats.wasFouled || 0) * 20)
                      },
                      {
                        category: 'Possession Lost',
                        [player1.name]: 100 - ((p1Stats.possessionLost || 0) * 5),
                        [player2.name]: 100 - ((p2Stats.possessionLost || 0) * 5)
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
                <div className="space-y-1 text-sm">
                  {renderComparisonRow('Possession lost', p1Stats.possessionLost, p2Stats.possessionLost, undefined, false)}
                  {renderComparisonRow('Fouls', p1Stats.fouls, p2Stats.fouls, undefined, false)}
                </div>
              </Card>

              {/* Cards - Bar Chart */}
              <Card className="p-4 bg-slate-700/50 border-slate-600">
                <h3 className="text-lg font-semibold text-white mb-4">Cards</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { 
                          name: 'Yellow', 
                          [player1.name]: p1Stats.yellowCards || 0, 
                          [player2.name]: p2Stats.yellowCards || 0 
                        },
                        { 
                          name: 'Yellow-Red', 
                          [player1.name]: p1Stats.yellowRedCards || 0, 
                          [player2.name]: p2Stats.yellowRedCards || 0 
                        },
                        { 
                          name: 'Red', 
                          [player1.name]: p1Stats.redCards || 0, 
                          [player2.name]: p2Stats.redCards || 0 
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
                      <Bar dataKey={player1.name} fill="#fbbf24" radius={[4, 4, 0, 0]} />
                      <Bar dataKey={player2.name} fill="#f87171" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
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

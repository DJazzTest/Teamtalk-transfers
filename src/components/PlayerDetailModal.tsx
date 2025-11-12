import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { X, Calendar, Globe, Footprints, Trophy, Users, History, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlayerSeasonStats } from '@/data/squadWages';
import { PlayerStatsHexagon } from './PlayerStatsHexagon';
import { ShirtNumberIcon } from './ShirtNumberIcon';
import { PlayerComparisonModal } from './PlayerComparisonModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, Cell, Legend } from 'recharts';

interface Player {
  name: string;
  position?: string;
  age?: number;
  shirtNumber?: number;
  imageUrl?: string;
  seasonStats?: PlayerSeasonStats;
  bio?: {
    height?: string;
    weight?: string;
    nationality?: string;
    dateOfBirth?: string;
    placeOfBirth?: string;
    preferredFoot?: string;
    description?: string;
    contractUntil?: string;
    nationalTeam?: string;
    nationalTeamAppearances?: number;
    nationalTeamGoals?: number;
  };
  transferHistory?: Array<{
    date: string;
    from?: string;
    to: string;
    fee: string;
    type?: string;
    notes?: string;
  }>;
  previousMatches?: Array<{
    competition: string;
    date: string;
    team: string;
    opponent: string;
    score: string;
    outcome?: 'Win' | 'Draw' | 'Loss';
    venue?: 'Home' | 'Away' | 'Neutral';
  }>;
}

interface PlayerDetailModalProps {
  player: Player | null;
  teamName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({ 
  player, 
  teamName, 
  isOpen, 
  onClose 
}) => {
  const [stats, setStats] = useState<{ goals: number; appearances: number }>({ goals: 0, appearances: 0 });
  const [competitionStats, setCompetitionStats] = useState<Array<{
    competition: string;
    matches: number;
    minutes: number;
    cleanSheets?: number;
    goalsConceded?: number;
    goals?: number;
  }>>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [expandedTransferHistory, setExpandedTransferHistory] = useState(false);
  const [expandedRecentMatches, setExpandedRecentMatches] = useState(false);

  useEffect(() => {
    if (!player || !isOpen) {
      setStats({ appearances: 0, goals: 0 });
      setCompetitionStats([]);
      return;
    }

    if (player.seasonStats?.competitions && Array.isArray(player.seasonStats.competitions) && player.seasonStats.competitions.length > 0) {
      const totalMatches = player.seasonStats.competitions.reduce((sum, c) => sum + (c.matches || 0), 0);
      const totalGoals = player.seasonStats.competitions.reduce((sum, c) => sum + (c.goals || 0), 0);
      setStats({ appearances: totalMatches, goals: totalGoals });
      setCompetitionStats(player.seasonStats.competitions);
    } else {
      setStats({ appearances: 0, goals: 0 });
      setCompetitionStats([]);
    }
  }, [player, isOpen]);

  // Early return if no player (after hooks)
  if (!player || !player.name) {
    return null;
  }

  // Safety check - ensure player exists before accessing properties
  if (!isOpen) {
    return null;
  }

  const playerCompetitions = Array.isArray(player.seasonStats?.competitions) ? player.seasonStats.competitions : undefined;
  const competitions = playerCompetitions && playerCompetitions.length > 0
    ? playerCompetitions
    : competitionStats;
  const primaryCompetition = competitions && competitions.length > 0 ? competitions[0] : undefined;
  const isGoalkeeper = !!player.position?.toLowerCase().includes('goalkeeper');

  const formatNumber = (value: number | null | undefined, decimals = 1): string | null => {
    if (value === undefined || value === null) return null;
    if (Number.isInteger(value)) return value.toString();
    return value.toFixed(decimals);
  };

  const formatPercentage = (value: number | null | undefined, decimals = 0): string | null => {
    if (value === undefined || value === null) return null;
    const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(decimals);
    return `${formatted}%`;
  };

  const formatWithPercentage = (
    value: number | null | undefined,
    percentage: number | null | undefined,
    decimals = 1
  ): string | null => {
    const base = formatNumber(value, decimals);
    if (!base) return null;
    if (percentage === undefined || percentage === null) return base;
    const pct = Number.isInteger(percentage) ? percentage.toString() : percentage.toFixed(1);
    return `${base} (${pct}%)`;
  };

  const formatStringOrNumber = (
    value: string | number | null | undefined,
    decimals = 1,
    suffix = ''
  ): string | null => {
    if (value === undefined || value === null) return null;
    if (typeof value === 'number') {
      const formatted = formatNumber(value, decimals);
      return formatted ? `${formatted}${suffix}` : null;
    }
    return value;
  };

  const formatDate = (isoString?: string): string | null => {
    if (!isoString) return null;
    const parsed = new Date(isoString);
    if (Number.isNaN(parsed.getTime())) {
      return isoString;
    }
    return parsed.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const quickStats = primaryCompetition ? [
    { label: 'Matches', value: formatStringOrNumber(primaryCompetition.matches, 0) },
    { label: 'Appearances', value: formatStringOrNumber(primaryCompetition.appearances ?? stats.appearances, 0) },
    { label: 'Started', value: formatStringOrNumber(primaryCompetition.started, 0) },
    { label: 'Minutes per game', value: formatStringOrNumber(primaryCompetition.minutesPerGame, 0) },
    { label: 'Total minutes', value: formatStringOrNumber(primaryCompetition.totalMinutes ?? primaryCompetition.minutes, 0) },
    { label: 'Team of the week', value: formatStringOrNumber(primaryCompetition.teamOfTheWeek, 0) },
  ] : [];

  const averageRating = primaryCompetition?.averageRating;
  const ratingTimeline = primaryCompetition?.matchDates && primaryCompetition?.opponents
    ? primaryCompetition.matchDates.map((date, index) => ({
        date,
        opponent: primaryCompetition.opponents?.[index] ?? ''
      }))
    : [];

  const goalkeepingStats = [
    { label: 'Goals conceded per game', value: formatNumber(primaryCompetition?.goalsConcededPerGame, 2) },
    { label: 'Goals conceded', value: formatStringOrNumber(primaryCompetition?.goalsConceded, 0) },
    { label: 'Clean sheets', value: formatStringOrNumber(primaryCompetition?.cleanSheets, 0) },
    { label: 'Penalties saved', value: primaryCompetition?.penaltiesSaved ?? null },
    { label: 'Saves per game', value: formatWithPercentage(primaryCompetition?.savesPerGame, primaryCompetition?.savesPerGamePercentage) },
    { label: 'Successful runs out per game', value: formatWithPercentage(primaryCompetition?.succRunsOutPerGame, primaryCompetition?.succRunsOutPercentage) },
    { label: 'Saves', value: formatStringOrNumber(primaryCompetition?.saves, 0) },
    { label: 'Goals prevented', value: formatNumber(primaryCompetition?.goalsPrevented, 2) },
    { label: 'Saves from inside box', value: formatStringOrNumber(primaryCompetition?.savesFromInsideBox, 0) },
    { label: 'Saves from outside box', value: formatStringOrNumber(primaryCompetition?.savesFromOutsideBox, 0) },
    { label: 'Saves caught', value: formatStringOrNumber(primaryCompetition?.savesCaught, 0) },
    { label: 'Saves parried', value: formatStringOrNumber(primaryCompetition?.savesParried, 0) },
  ];

  const attackingStats = [
    { label: 'Goals', value: formatStringOrNumber(primaryCompetition?.goals ?? stats.goals, 0) },
    { label: 'Scoring frequency (min)', value: formatStringOrNumber(primaryCompetition?.scoringFrequency, 0) },
    { label: 'Goals per game', value: formatNumber(primaryCompetition?.goalsPerGame, 2) },
    { label: 'Total shots', value: formatNumber(primaryCompetition?.totalShots, 1) },
    { label: 'Shots on target per game', value: formatNumber(primaryCompetition?.shotsOnTargetPerGame, 2) },
    { label: 'Big chances missed', value: formatStringOrNumber(primaryCompetition?.bigChancesMissed, 0) },
    { label: 'Goal conversion', value: formatPercentage(primaryCompetition?.goalConversion, 0) },
    { label: 'Penalty goals', value: formatStringOrNumber(primaryCompetition?.penaltyGoals, 0) },
    { label: 'Penalty conversion', value: formatPercentage(primaryCompetition?.penaltyConversion, 0) },
    { label: 'Free kick goals', value: formatStringOrNumber(primaryCompetition?.freeKickGoals, 0) },
    { label: 'Free kick conversion', value: formatPercentage(primaryCompetition?.freeKickConversion, 0) },
    { label: 'Goals from inside the box', value: formatStringOrNumber(primaryCompetition?.goalsFromInsideBox, 0) },
    { label: 'Goals from outside the box', value: formatStringOrNumber(primaryCompetition?.goalsFromOutsideBox, 0) },
    { label: 'Headed goals', value: formatStringOrNumber(primaryCompetition?.headedGoals, 0) },
    { label: 'Left-footed goals', value: formatStringOrNumber(primaryCompetition?.leftFootedGoals, 0) },
    { label: 'Right-footed goals', value: formatStringOrNumber(primaryCompetition?.rightFootedGoals, 0) },
    { label: 'Penalty won', value: formatStringOrNumber(primaryCompetition?.penaltyWon, 0) },
  ];

  const passingStats = [
    { label: 'Assists', value: formatStringOrNumber(primaryCompetition?.assists, 0) },
    { label: 'Expected assists (xA)', value: formatNumber(primaryCompetition?.expectedAssists, 2) },
    { label: 'Touches', value: formatNumber(primaryCompetition?.touches, 1) },
    { label: 'Big chances created', value: formatStringOrNumber(primaryCompetition?.bigChancesCreated, 0) },
    { label: 'Key passes', value: formatNumber(primaryCompetition?.keyPasses, 2) },
    { label: 'Accurate passes', value: formatWithPercentage(primaryCompetition?.accuratePasses, primaryCompetition?.accuratePassesPercentage, 1) },
    { label: 'Acc. own half', value: formatWithPercentage(primaryCompetition?.accOwnHalf, primaryCompetition?.accOwnHalfPercentage, 1) },
    { label: 'Acc. opposition half', value: formatWithPercentage(primaryCompetition?.accOppositionHalf, primaryCompetition?.accOppositionHalfPercentage, 1) },
    { label: 'Long balls (accurate)', value: formatWithPercentage(primaryCompetition?.longBallsAccurate, primaryCompetition?.longBallsPercentage, 1) },
    { label: 'Accurate chip passes', value: formatWithPercentage(primaryCompetition?.accurateChipPasses, primaryCompetition?.accurateChipPassesPercentage, 1) },
    { label: 'Accurate crosses', value: formatStringOrNumber(primaryCompetition?.accurateCrosses, 1) },
  ];

  const defendingStats = [
    { label: 'Clean sheets', value: formatStringOrNumber(primaryCompetition?.cleanSheets, 0) },
    { label: 'Interceptions', value: formatNumber(primaryCompetition?.interceptions, 1) },
    { label: 'Tackles per game', value: formatNumber(primaryCompetition?.tacklesPerGame, 2) },
    { label: 'Possession won (final third)', value: formatNumber(primaryCompetition?.possessionWonFinalThird, 2) },
    { label: 'Balls recovered per game', value: formatNumber(primaryCompetition?.ballsRecoveredPerGame, 2) },
    { label: 'Dribbled past per game', value: formatNumber(primaryCompetition?.dribbledPastPerGame, 2) },
    { label: 'Clearances per game', value: formatNumber(primaryCompetition?.clearancesPerGame, 2) },
    { label: 'Blocked shots per game', value: formatNumber(primaryCompetition?.blockedShotsPerGame, 2) },
    { label: 'Errors leading to shot', value: formatStringOrNumber(primaryCompetition?.errorsLeadingToShot, 0) },
    { label: 'Errors leading to goal', value: formatStringOrNumber(primaryCompetition?.errorsLeadingToGoal, 0) },
    { label: 'Penalties committed', value: formatStringOrNumber(primaryCompetition?.penaltiesCommitted, 0) },
  ];

  const otherStats = [
    { label: 'Successful dribbles', value: formatWithPercentage(primaryCompetition?.succDribbles, primaryCompetition?.succDribblesPercentage, 2) },
    { label: 'Total duels won', value: formatWithPercentage(primaryCompetition?.totalDuelsWon, primaryCompetition?.totalDuelsWonPercentage, 2) },
    { label: 'Ground duels won', value: formatWithPercentage(primaryCompetition?.groundDuelsWon, primaryCompetition?.groundDuelsWonPercentage, 2) },
    { label: 'Aerial duels won', value: formatWithPercentage(primaryCompetition?.aerialDuelsWon, primaryCompetition?.aerialDuelsWonPercentage, 2) },
    { label: 'Possession lost', value: formatNumber(primaryCompetition?.possessionLost, 2) },
    { label: 'Fouls per game', value: formatNumber(primaryCompetition?.foulsPerGame, 2) },
    { label: 'Was fouled', value: formatNumber(primaryCompetition?.wasFouled, 2) },
    { label: 'Offsides', value: formatNumber(primaryCompetition?.offsides, 2) },
    { label: 'Goal kicks per game', value: formatNumber(primaryCompetition?.goalKicksPerGame, 2) },
  ];

  const cardStats = [
    { label: 'Yellow cards', value: formatStringOrNumber(primaryCompetition?.yellowCards, 0) },
    { label: 'Red (2 yellows)', value: formatStringOrNumber(primaryCompetition?.redCards2Yellows, 0) },
    { label: 'Red cards', value: formatStringOrNumber(primaryCompetition?.redCards, 0) },
  ];

  const filterStats = (statsGroup: { label: string; value: string | null }[]) =>
    statsGroup.filter(stat => stat.value !== null);

  // Helper to extract numeric value from stat (handles percentages, formatted strings, etc.)
  const extractNumericValue = (value: string | null): number => {
    if (!value) return 0;
    const str = value.toString();
    // Handle percentage values like "1.5 (76%)" - extract the first number
    const match = str.match(/[\d.]+/);
    if (match) {
      const num = parseFloat(match[0]);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  // Render Bar Chart for stats with custom colors
  const renderBarChart = (title: string, statsGroup: { label: string; value: string | null }[], colorMap?: Record<string, string>, defaultColor?: string) => {
    const filtered = filterStats(statsGroup);
    if (!filtered.length) return null;
    
    // Generate gradient colors if no color map provided
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316', '#ef4444'];
    
    const chartData = filtered.map((stat, index) => ({
      name: stat.label.length > 20 ? stat.label.substring(0, 20) + '...' : stat.label,
      fullName: stat.label,
      value: extractNumericValue(stat.value),
      color: colorMap?.[stat.label] || defaultColor || colors[index % colors.length]
    }));

    return (
      <Card className="p-4 bg-slate-700/50 border-slate-600">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={Math.max(300, filtered.length * 40)}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis type="number" stroke="#94a3b8" />
            <YAxis dataKey="name" type="category" stroke="#94a3b8" width={140} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value: any) => {
                const stat = chartData.find(d => d.value === value);
                return [stat?.fullName ? `${stat.fullName}: ${value}` : value, ''];
              }}
              labelFormatter={(label) => ''}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    );
  };

  // Render Radar Chart for stats with gradient colors
  const renderRadarChart = (title: string, statsGroup: { label: string; value: string | null }[], colors?: { stroke: string; fill: string; fillOpacity?: number }) => {
    const filtered = filterStats(statsGroup);
    if (!filtered.length) {
      return (
        <Card className="p-4 bg-slate-700/50 border-slate-600">
          <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
          <p className="text-sm text-gray-400 text-center py-8">No data available</p>
        </Card>
      );
    }
    
    // Filter out zero values but keep at least top stats
    const statsWithValues = filtered
      .map(stat => ({
        ...stat,
        numericValue: extractNumericValue(stat.value)
      }))
      .filter(stat => stat.numericValue > 0 || stat.value === '0' || stat.value === '0.0');
    
    // If no stats with values, show message
    if (statsWithValues.length === 0) {
      return (
        <Card className="p-4 bg-slate-700/50 border-slate-600">
          <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
          <p className="text-sm text-gray-400 text-center py-8">No data available</p>
        </Card>
      );
    }
    
    // Limit to top 8 stats for readability, prioritize non-zero values
    const topStats = statsWithValues
      .sort((a, b) => b.numericValue - a.numericValue)
      .slice(0, 8);
    
    const chartData = topStats.map(stat => ({
      stat: stat.label.length > 15 ? stat.label.substring(0, 15) + '...' : stat.label,
      fullName: stat.label,
      value: stat.numericValue,
      originalValue: stat.value
    }));

    // Normalize values to 0-100 scale for radar chart, but ensure minimum visibility
    const maxValue = Math.max(...chartData.map(d => d.value), 1);
    const normalizedData = chartData.map(d => ({
      ...d,
      value: maxValue > 0 ? Math.max((d.value / maxValue) * 100, 5) : 5 // Minimum 5% for visibility
    }));

    const defaultColors = colors || { stroke: '#3b82f6', fill: '#3b82f6', fillOpacity: 0.6 };

    return (
      <Card className="p-4 bg-slate-700/50 border-slate-600">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={normalizedData}>
            <PolarGrid stroke="#475569" />
            <PolarAngleAxis 
              dataKey="stat" 
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              tick={{ fill: '#64748b', fontSize: 10 }}
            />
            <Radar
              name="Stats"
              dataKey="value"
              stroke={defaultColors.stroke}
              fill={defaultColors.fill}
              fillOpacity={defaultColors.fillOpacity || 0.6}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value: any, name: string, props: any) => {
                const index = normalizedData.findIndex(d => Math.abs(d.value - value) < 0.1);
                if (index >= 0) {
                  const originalValue = chartData[index]?.originalValue || chartData[index]?.value || 0;
                  return [originalValue, ''];
                }
                return [value?.toFixed(1) || '0', ''];
              }}
              labelFormatter={(label) => {
                const match = chartData.find(d => d.stat === label);
                return match?.fullName || label;
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </Card>
    );
  };

  // Render Line Chart for rating timeline with goals
  const renderRatingLineChart = (title: string, timeline: Array<{ date: string; opponent: string }>, averageRating?: number) => {
    if (!timeline.length && !averageRating) return null;

    // Extract goals scored and conceded from previousMatches
    const matchData = player.previousMatches?.slice(0, timeline.length).map((match) => {
      const scoreParts = match.score?.split('-') || [];
      const teamScore = parseInt(scoreParts[0]) || 0;
      const opponentScore = parseInt(scoreParts[1]) || 0;
      // Determine if player's team is home or away based on match data
      const isHome = match.venue === 'Home' || match.team === teamName;
      return {
        goalsFor: isHome ? teamScore : opponentScore,
        goalsAgainst: isHome ? opponentScore : teamScore
      };
    }) || [];

    // Try to extract ratings from previousMatches if available
    const matchRatings = player.previousMatches?.slice(0, timeline.length).map((match, idx) => {
      return averageRating || 0;
    }) || [];

    // Create data points from timeline
    const chartData = timeline.map((item, index) => ({
      match: `M${index + 1}`,
      date: item.date,
      opponent: item.opponent,
      rating: matchRatings[index] || averageRating || 0,
      goalsFor: matchData[index]?.goalsFor || 0,
      goalsAgainst: matchData[index]?.goalsAgainst || 0
    }));

    return (
      <Card className="p-4 bg-slate-700/50 border-slate-600">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {averageRating && (
            <p className="text-2xl font-bold text-emerald-400">{formatNumber(averageRating, 2)}</p>
          )}
        </div>
        {timeline.length > 0 ? (
          <div className="space-y-3">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis 
                  dataKey="match" 
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <YAxis 
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                  formatter={(value: any, name: string) => {
                    if (name === 'goalsFor') return [value, 'Goals Scored'];
                    if (name === 'goalsAgainst') return [value, 'Goals Conceded'];
                    return [value?.toFixed(1) || averageRating?.toFixed(1) || 'N/A', 'Rating'];
                  }}
                  labelFormatter={(label) => {
                    const match = chartData.find(d => d.match === label);
                    return match ? `${match.date} vs ${match.opponent}` : label;
                  }}
                />
                <Legend />
                <Bar dataKey="goalsFor" fill="#10b981" name="Goals Scored" />
                <Bar dataKey="goalsAgainst" fill="#ef4444" name="Goals Conceded" />
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {timeline.slice(0, 6).map((item, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/40 px-2 py-1">
                  <span className="text-gray-400">{item.date}</span>
                  <span className="text-white font-medium">{item.opponent}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Rating timeline not available</p>
        )}
      </Card>
    );
  };

  const playerDetailModal = (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={player?.imageUrl || ''} alt={player?.name || 'Player'} />
                <AvatarFallback>{(player?.name && player.name.length > 0) ? player.name[0].toUpperCase() : '?'}</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-3">
                {player?.shirtNumber && (
                  <ShirtNumberIcon 
                    number={player.shirtNumber} 
                    size="lg"
                    className="text-blue-300 drop-shadow-[0_0_6px_rgba(96,165,250,0.9)]"
                  />
                )}
                <span>{player?.name || 'Unknown Player'}</span>
              </div>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsComparisonOpen(true)}
                className="text-blue-400 border-blue-500 hover:bg-blue-500 hover:text-white"
              >
                <Users className="w-4 h-4 mr-1.5" />
                Compare
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Basic Info - Floating Bubble Design */}
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {teamName && (
              <Card className="p-2.5 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full hover:border-blue-400/60 transition-all duration-300 shadow-[0_8px_30px_rgb(59,130,246,0.3)] hover:shadow-[0_12px_40px_rgb(59,130,246,0.5)] hover:scale-105">
                <p className="text-[9px] uppercase tracking-widest font-bold text-blue-300 mb-1 text-center">Club</p>
                <p className="text-white font-semibold text-sm text-center">{teamName}</p>
              </Card>
            )}
            {player.shirtNumber && (
              <Card className="p-2.5 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full hover:border-purple-400/60 transition-all duration-300 shadow-[0_8px_30px_rgb(168,85,247,0.3)] hover:shadow-[0_12px_40px_rgb(168,85,247,0.5)] hover:scale-105 flex flex-col items-center justify-center">
                <p className="text-[9px] uppercase tracking-widest font-bold text-purple-300 mb-1">Shirt</p>
                <div className="flex items-center justify-center">
                  <ShirtNumberIcon 
                    number={player.shirtNumber} 
                    size="md"
                    className="text-purple-200 drop-shadow-[0_0_4px_rgba(196,181,253,0.8)]"
                  />
                </div>
              </Card>
            )}
            {player.position && (
              <Card className="p-2.5 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-full hover:border-emerald-400/60 transition-all duration-300 shadow-[0_8px_30px_rgb(16,185,129,0.3)] hover:shadow-[0_12px_40px_rgb(16,185,129,0.5)] hover:scale-105">
                <p className="text-[9px] uppercase tracking-widest font-bold text-emerald-300 mb-1 text-center">Position</p>
                <Badge className="bg-emerald-500/40 text-white font-semibold px-2 py-0.5 rounded-full text-xs mx-auto block w-fit">{player.position}</Badge>
              </Card>
            )}
            {player.age && (
              <Card className="p-2.5 bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 rounded-full hover:border-orange-400/60 transition-all duration-300 shadow-[0_8px_30px_rgb(249,115,22,0.3)] hover:shadow-[0_12px_40px_rgb(249,115,22,0.5)] hover:scale-105">
                <p className="text-[9px] uppercase tracking-widest font-bold text-orange-300 mb-1 text-center flex items-center justify-center gap-1">
                  <Calendar className="w-2.5 h-2.5" />
                  Age
                </p>
                <p className="text-white font-bold text-sm text-center">{player.age}</p>
              </Card>
            )}
            {player.bio?.contractUntil && (
              <Card className="p-2.5 bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/30 rounded-full hover:border-cyan-400/60 transition-all duration-300 shadow-[0_8px_30px_rgb(6,182,212,0.3)] hover:shadow-[0_12px_40px_rgb(6,182,212,0.5)] hover:scale-105">
                <p className="text-[9px] uppercase tracking-widest font-bold text-cyan-300 mb-1 text-center">Contract</p>
                <p className="text-white font-semibold text-xs text-center">{player.bio.contractUntil}</p>
              </Card>
            )}
            {player.bio?.height && (
              <Card className="p-2.5 bg-pink-500/20 backdrop-blur-sm border border-pink-400/30 rounded-full hover:border-pink-400/60 transition-all duration-300 shadow-[0_8px_30px_rgb(236,72,153,0.3)] hover:shadow-[0_12px_40px_rgb(236,72,153,0.5)] hover:scale-105">
                <p className="text-[9px] uppercase tracking-widest font-bold text-pink-300 mb-1 text-center">Height</p>
                <p className="text-white font-semibold text-sm text-center">{player.bio.height}</p>
              </Card>
            )}
            {player.bio?.dateOfBirth && (
              <Card className="p-2.5 bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-full hover:border-yellow-400/60 transition-all duration-300 shadow-[0_8px_30px_rgb(234,179,8,0.3)] hover:shadow-[0_12px_40px_rgb(234,179,8,0.5)] hover:scale-105">
                <p className="text-[9px] uppercase tracking-widest font-bold text-yellow-300 mb-1 text-center">D.O.B</p>
                <p className="text-white font-semibold text-xs text-center">
                  {formatDate(player.bio.dateOfBirth)}
                </p>
              </Card>
            )}
            {player.bio?.preferredFoot && (
              <Card className="p-2.5 bg-indigo-500/20 backdrop-blur-sm border border-indigo-400/30 rounded-full hover:border-indigo-400/60 transition-all duration-300 shadow-[0_8px_30px_rgb(99,102,241,0.3)] hover:shadow-[0_12px_40px_rgb(99,102,241,0.5)] hover:scale-105">
                <p className="text-[9px] uppercase tracking-widest font-bold text-indigo-300 mb-1 text-center flex items-center justify-center gap-1">
                  <Footprints className="w-2.5 h-2.5" />
                  Foot
                </p>
                <p className="text-white font-semibold text-sm text-center">{player.bio.preferredFoot}</p>
              </Card>
            )}
            {player.bio?.nationality && (
              <Card className="p-2.5 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-full hover:border-red-400/60 transition-all duration-300 shadow-[0_8px_30px_rgb(239,68,68,0.3)] hover:shadow-[0_12px_40px_rgb(239,68,68,0.5)] hover:scale-105">
                <p className="text-[9px] uppercase tracking-widest font-bold text-red-300 mb-1 text-center flex items-center justify-center gap-1">
                  <Globe className="w-2.5 h-2.5" />
                  Nation
                </p>
                <p className="text-white font-semibold text-sm text-center">{player.bio.nationality}</p>
              </Card>
            )}
            {player.bio?.nationalTeam && (
              <Card className="p-2.5 bg-violet-500/20 backdrop-blur-sm border border-violet-400/30 rounded-full hover:border-violet-400/60 transition-all duration-300 shadow-[0_8px_30px_rgb(139,92,246,0.3)] hover:shadow-[0_12px_40px_rgb(139,92,246,0.5)] hover:scale-105">
                <p className="text-[9px] uppercase tracking-widest font-bold text-violet-300 mb-1 text-center">N.Team</p>
                <p className="text-white font-semibold text-xs text-center">
                  {player.bio.nationalTeam}
                  {player.bio.nationalTeamAppearances !== undefined && (
                    <span className="block text-[10px] text-gray-300 mt-0.5 font-normal">
                      {player.bio.nationalTeamAppearances} apps
                      {player.bio.nationalTeamGoals !== undefined ? `, ${player.bio.nationalTeamGoals} g` : ''}
                    </span>
                  )}
                </p>
              </Card>
            )}
          </div>

          {/* Season Heatmap - Soccer Field Visualization */}
          {quickStats.filter(stat => stat.value !== null).length > 0 && (
            <Card className="p-4 bg-slate-700/50 border-slate-600">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Season heatmap
              </h3>
              <div className="space-y-4">
                {/* Soccer Field Heatmap */}
                <div className="relative w-full" style={{ aspectRatio: '3/2' }}>
                  <svg viewBox="0 0 300 200" className="w-full h-full">
                    {/* Field background - darker lime green */}
                    <rect x="0" y="0" width="300" height="200" fill="#B8D020" />
                    
                    {/* Center line */}
                    <line x1="150" y1="0" x2="150" y2="200" stroke="#ffffff" strokeWidth="2" />
                    
                    {/* Center circle */}
                    <circle cx="150" cy="100" r="30" fill="none" stroke="#ffffff" strokeWidth="2" />
                    <circle cx="150" cy="100" r="2" fill="#ffffff" />
                    
                    {/* Left penalty area */}
                    <rect x="0" y="60" width="50" height="80" fill="none" stroke="#ffffff" strokeWidth="2" />
                    <rect x="0" y="75" width="20" height="50" fill="none" stroke="#ffffff" strokeWidth="2" />
                    
                    {/* Right penalty area */}
                    <rect x="250" y="60" width="50" height="80" fill="none" stroke="#ffffff" strokeWidth="2" />
                    <rect x="280" y="75" width="20" height="50" fill="none" stroke="#ffffff" strokeWidth="2" />
                    
                    {/* Goals */}
                    <rect x="0" y="85" width="5" height="30" fill="#ffffff" />
                    <rect x="295" y="85" width="5" height="30" fill="#ffffff" />
                    
                    {/* Heatmap dots - granular brown and red dots for realistic heatmap */}
                    {(() => {
                      const matches = extractNumericValue(quickStats.find(s => s.label === 'Matches')?.value || null);
                      const appearances = extractNumericValue(quickStats.find(s => s.label === 'Appearances')?.value || null);
                      const minutes = extractNumericValue(quickStats.find(s => s.label === 'Total minutes')?.value || null);
                      
                      // Color palette: light brown, dark brown, light red, dark red
                      const colors = [
                        { name: 'lightBrown', fill: '#D4A574', opacity: 0.6 },
                        { name: 'darkBrown', fill: '#8B6F47', opacity: 0.7 },
                        { name: 'lightRed', fill: '#FF6B6B', opacity: 0.7 },
                        { name: 'darkRed', fill: '#C92A2A', opacity: 0.8 },
                      ];
                      
                      // Generate many small dots
                      const numDots = Math.min(200, Math.max(50, appearances * 10));
                      const dots = [];
                      
                      if (isGoalkeeper) {
                        // Goalkeeper - concentrated in penalty area
                        for (let i = 0; i < numDots; i++) {
                          const angle = Math.random() * Math.PI * 2;
                          const distance = Math.random() * 40; // Concentrated in penalty area
                          const x = 20 + Math.cos(angle) * distance;
                          const y = 100 + Math.sin(angle) * distance;
                          
                          // Clamp to field bounds
                          if (x >= 0 && x <= 60 && y >= 60 && y <= 140) {
                            const colorIndex = Math.floor(Math.random() * colors.length);
                            const color = colors[colorIndex];
                            // Higher intensity in center
                            const centerDistance = Math.sqrt((x - 20) ** 2 + (y - 100) ** 2);
                            const intensity = 1 - (centerDistance / 50);
                            const opacity = color.opacity * Math.max(0.3, intensity);
                            
                            dots.push(
                              <circle
                                key={`dot-${i}`}
                                cx={x}
                                cy={y}
                                r={1.5 + Math.random() * 1}
                                fill={color.fill}
                                opacity={opacity}
                              />
                            );
                          }
                        }
                      } else {
                        // Outfield player - spread across field with concentration in certain areas
                        const hotSpots = [
                          { x: 80, y: 60, weight: 0.3 },
                          { x: 150, y: 100, weight: 0.4 },
                          { x: 220, y: 140, weight: 0.25 },
                          { x: 100, y: 120, weight: 0.2 },
                          { x: 180, y: 80, weight: 0.15 },
                        ];
                        
                        for (let i = 0; i < numDots; i++) {
                          // Pick a hotspot or random location
                          const useHotspot = Math.random() < 0.7;
                          let x, y;
                          
                          if (useHotspot) {
                            const spot = hotSpots[Math.floor(Math.random() * hotSpots.length)];
                            const angle = Math.random() * Math.PI * 2;
                            const distance = Math.random() * 35;
                            x = spot.x + Math.cos(angle) * distance;
                            y = spot.y + Math.sin(angle) * distance;
                          } else {
                            x = Math.random() * 300;
                            y = Math.random() * 200;
                          }
                          
                          // Clamp to field bounds
                          if (x >= 0 && x <= 300 && y >= 0 && y <= 200) {
                            const colorIndex = Math.floor(Math.random() * colors.length);
                            const color = colors[colorIndex];
                            const opacity = color.opacity * (0.4 + Math.random() * 0.4);
                            
                            dots.push(
                              <circle
                                key={`dot-${i}`}
                                cx={x}
                                cy={y}
                                r={1.2 + Math.random() * 1.3}
                                fill={color.fill}
                                opacity={opacity}
                              />
                            );
                          }
                        }
                      }
                      
                      return dots;
                    })()}
                  </svg>
                </div>
                
                {/* Stats summary below field */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {quickStats.filter(stat => stat.value !== null).slice(0, 6).map((stat) => (
                    <div key={stat.label} className="text-center p-2 bg-slate-800/50 rounded">
                      <p className="text-lg font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Average Rating - Bar Chart with Goals */}
          {renderRatingLineChart('Average Rating', ratingTimeline, averageRating)}

          {/* Goalkeeping - Enhanced visualization */}
          {isGoalkeeper && (() => {
            // Create a comprehensive goalkeeping bar chart showing key metrics
            const keyGoalkeepingStats = [
              { label: 'Saves', value: formatStringOrNumber(primaryCompetition?.saves, 0) },
              { label: 'Goals conceded', value: formatStringOrNumber(primaryCompetition?.goalsConceded, 0) },
              { label: 'Clean sheets', value: formatStringOrNumber(primaryCompetition?.cleanSheets, 0) },
              { label: 'Saves per game', value: formatWithPercentage(primaryCompetition?.savesPerGame, primaryCompetition?.savesPerGamePercentage) },
              { label: 'Goals conceded per game', value: formatNumber(primaryCompetition?.goalsConcededPerGame, 2) },
              { label: 'Saves from inside box', value: formatStringOrNumber(primaryCompetition?.savesFromInsideBox, 0) },
              { label: 'Saves from outside box', value: formatStringOrNumber(primaryCompetition?.savesFromOutsideBox, 0) },
              { label: 'Goals prevented', value: formatNumber(primaryCompetition?.goalsPrevented, 2) },
            ].filter(stat => stat.value !== null);
            
            // Use bar chart with yellow/gold colors for goalkeeping
            const gkColorMap: Record<string, string> = {
              'Saves': '#10b981',
              'Goals conceded': '#ef4444',
              'Clean sheets': '#3b82f6',
              'Saves per game': '#f59e0b',
              'Goals conceded per game': '#f97316',
              'Saves from inside box': '#22c55e',
              'Saves from outside box': '#84cc16',
              'Goals prevented': '#06b6d4'
            };
            return renderBarChart('Goalkeeping', keyGoalkeepingStats, gkColorMap);
          })()}

          {/* Attacking - Enhanced for goalkeepers */}
          {(() => {
            if (isGoalkeeper) {
              // For goalkeepers, show distribution stats as a bar chart instead
              const gkAttacking = [
                { label: 'Goal kicks per game', value: formatNumber(primaryCompetition?.goalKicksPerGame, 2) },
                { label: 'Long balls (accurate)', value: formatWithPercentage(primaryCompetition?.longBallsAccurate, primaryCompetition?.longBallsPercentage, 1) },
                { label: 'Accurate passes', value: formatWithPercentage(primaryCompetition?.accuratePasses, primaryCompetition?.accuratePassesPercentage, 1) },
                { label: 'Touches per game', value: formatNumber(primaryCompetition?.touches, 1) }
              ];
              const gkAttackingColors: Record<string, string> = {
                'Goal kicks per game': '#8b5cf6',
                'Long balls (accurate)': '#a78bfa',
                'Accurate passes': '#c084fc',
                'Touches per game': '#d8b4fe'
              };
              return renderBarChart('Attacking (Distribution)', gkAttacking, gkAttackingColors);
            }
            // For outfield players, use radar chart with better colors
            return renderRadarChart('Attacking', attackingStats, { 
              stroke: '#ec4899', 
              fill: '#f472b6', 
              fillOpacity: 0.6 
            });
          })()}

          {/* Passing - Enhanced Radar Chart */}
          {renderRadarChart('Passing', passingStats, { 
            stroke: '#06b6d4', 
            fill: '#22d3ee', 
            fillOpacity: 0.5 
          })}

          {/* Defending - Radar Chart with no data message */}
          {renderRadarChart('Defending', defendingStats, { 
            stroke: '#10b981', 
            fill: '#34d399', 
            fillOpacity: 0.5 
          })}

          {/* Other - Enhanced Radar Chart with gradient colors */}
          {renderRadarChart('Other', otherStats, { 
            stroke: '#3b82f6', 
            fill: 'url(#otherGradient)', 
            fillOpacity: 0.6 
          })}

          {/* Cards - Bar Chart with color coding */}
          {(() => {
            const cardColorMap: Record<string, string> = {
              'Yellow cards': '#eab308',
              'Red (2 yellows)': '#f97316', // Orange/red-yellow mix
              'Red cards': '#ef4444'
            };
            return renderBarChart('Cards', cardStats, cardColorMap);
          })()}

          {/* About - Description */}
          {player.bio?.description && (
            <Card className="p-4 bg-slate-700/50 border-slate-600">
              <h3 className="text-lg font-semibold text-white mb-3">About</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{player.bio?.description || ''}</p>
            </Card>
          )}

          {/* Competition Breakdown - Visual Hexagon Chart */}
          {((player.seasonStats?.competitions && Array.isArray(player.seasonStats.competitions) && player.seasonStats.competitions.length > 0) || (Array.isArray(competitionStats) && competitionStats.length > 0)) && (() => {
            try {
              const isGoalkeeper = player.position?.toLowerCase().includes('goalkeeper');
              const statsToUse = (Array.isArray(player.seasonStats?.competitions) && player.seasonStats.competitions.length > 0)
                ? player.seasonStats.competitions
                : (Array.isArray(competitionStats) ? competitionStats : []);
              
              if (!Array.isArray(statsToUse) || statsToUse.length === 0) {
                return null;
              }
              
              const totalMatches = statsToUse.reduce((sum, c) => sum + (c.matches || 0), 0);
              const totalMinutes = statsToUse.reduce((sum, c) => sum + (c.minutes || 0), 0);
              const totalCleanSheets = isGoalkeeper 
                ? statsToUse.reduce((sum, c) => sum + (c.cleanSheets || 0), 0)
                : 0;
              const totalGoalsConceded = isGoalkeeper
                ? statsToUse.reduce((sum, c) => sum + (c.goalsConceded || 0), 0)
                : 0;
              const totalGoals = !isGoalkeeper
                ? statsToUse.reduce((sum, c) => sum + (c.goals || 0), 0)
                : 0;
              const injuriesText = player.seasonStats?.injuries?.timeOut || player.seasonStats?.injuries?.description;

              return (
                <PlayerStatsHexagon
                  competitions={statsToUse}
                  isGoalkeeper={isGoalkeeper}
                  injuries={injuriesText}
                  totalMatches={totalMatches}
                  totalMinutes={totalMinutes}
                  totalCleanSheets={totalCleanSheets}
                  totalGoalsConceded={totalGoalsConceded}
                  totalGoals={totalGoals}
                />
              );
            } catch (error) {
              console.error('Error rendering hexagon chart:', error);
              return null;
            }
          })()}

          {/* Transfer History */}
          {player.transferHistory && player.transferHistory.length > 0 && (
            <Card className="p-4 bg-slate-700/50 border-slate-600">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-emerald-400" />
                  Transfer History
                </h3>
                {player.transferHistory.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedTransferHistory(!expandedTransferHistory)}
                    className="text-gray-400 hover:text-white"
                  >
                    {expandedTransferHistory ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" />
                        Show All ({player.transferHistory.length})
                      </>
                    )}
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {(expandedTransferHistory ? player.transferHistory : player.transferHistory.slice(0, 3)).map((entry, index) => (
                  <div
                    key={`${entry.date}-${entry.to}-${index}`}
                    className="flex items-start justify-between gap-4 rounded-lg border border-slate-700/50 bg-slate-800/40 p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400">{entry.date}</p>
                      <p className="text-sm font-semibold text-white">
                        {entry.from ? `${entry.from} → ${entry.to}` : entry.to}
                      </p>
                      {entry.type && (
                        <p className="text-xs uppercase tracking-wide text-gray-400">{entry.type}</p>
                      )}
                      {entry.notes && (
                        <p className="text-xs text-gray-500">{entry.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{entry.fee}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recent Matches */}
          {player.previousMatches && player.previousMatches.length > 0 && (
            <Card className="p-4 bg-slate-700/50 border-slate-600">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-sky-400" />
                  Recent Matches
                </h3>
                {player.previousMatches.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedRecentMatches(!expandedRecentMatches)}
                    className="text-gray-400 hover:text-white"
                  >
                    {expandedRecentMatches ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" />
                        Show All ({player.previousMatches.length})
                      </>
                    )}
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {(expandedRecentMatches ? player.previousMatches : player.previousMatches.slice(0, 3)).map((match, index) => {
                  const outcomeColor =
                    match.outcome === 'Win'
                      ? 'text-emerald-400'
                      : match.outcome === 'Loss'
                        ? 'text-red-400'
                        : 'text-yellow-300';

                  return (
                    <div
                      key={`${match.date}-${match.competition}-${index}`}
                      className="flex items-start justify-between gap-4 rounded-lg border border-slate-700/50 bg-slate-800/40 p-3"
                    >
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">
                          {match.date} • {match.competition}
                        </p>
                        <p className="text-sm font-semibold text-white">
                          {match.team} {match.score} {match.opponent}
                        </p>
                        <p className="text-xs text-gray-400">
                          {match.venue ? `${match.venue} • ` : ''}
                          {match.outcome}
                        </p>
                      </div>
                      {match.outcome && (
                        <span className={`text-sm font-semibold ${outcomeColor}`}>
                          {match.outcome}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
  
  return (
    <>
      {playerDetailModal}
      <PlayerComparisonModal
        player1={player}
        team1={teamName}
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
      />
    </>
  );
};

export default PlayerDetailModal;


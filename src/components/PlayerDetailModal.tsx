import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Footprints, Trophy, Users, User, History, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlayerSeasonStats } from '@/data/squadWages';
import { PlayerStatsHexagon } from './PlayerStatsHexagon';
import { ShirtNumberIcon } from './ShirtNumberIcon';
import { PlayerComparisonModal } from './PlayerComparisonModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, Cell, Legend } from 'recharts';
import { getPlayerImage, handlePlayerImageError } from '@/utils/playerImageUtils';
import { FbrefStandardRow, getPlayerStandardStatsForClub, createEmptyStandardRow } from '@/utils/fbrefStandardStats';
import { getFbrefPlayerProfile, FbrefPlayerProfileRecord } from '@/utils/fbrefPlayerProfiles';

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
  interface ArsenalFbProfile {
    name?: string;
    fullName?: string;
    position?: string;
    primaryPosition?: string;
    dateOfBirth?: string;
    placeOfBirth?: string;
    nationality?: string;
    club?: string;
    bio?: string;
    heightCm?: number;
    weightKg?: number;
    footed?: string;
    preferredFoot?: string;
  }

  interface ArsenalPlayingTimeRow {
    comp?: string;
    unSub?: number | null;
    subs?: number | null;
  }
  interface ArsenalCurrentSeasonCompetition {
    competition?: string;
    mp?: number;
    min?: number;
    gls?: number;
    ast?: number;
    xG?: number;
    npxG?: number;
    xAG?: number;
    sca?: number;
    gca?: number;
  }

  interface ArsenalCurrentSeasonSummary {
    season?: string;
    club?: string;
    domesticLeague?: ArsenalCurrentSeasonCompetition;
    internationalCups?: ArsenalCurrentSeasonCompetition;
  }

  interface ArsenalLastFiveMatchRow {
    date: string;
    day?: string;
    round?: string;
    venue?: string;
    result?: string;
    squad?: string;
    opponent?: string;
    started?: boolean;
    position?: string;
    minutes?: number;
  }

  interface ArsenalFbPlayerRecord {
    slug: string;
    profile?: ArsenalFbProfile;
    currentSeasonSummary?: ArsenalCurrentSeasonSummary;
    playingTimeDomesticLeagues?: { rows?: ArsenalPlayingTimeRow[] };
    lastFiveMatchesDomesticLeagues?: ArsenalLastFiveMatchRow[];
  }

  const [stats, setStats] = useState<{ goals: number; appearances: number }>({ goals: 0, appearances: 0 });
  const [competitionStats, setCompetitionStats] = useState<Array<{
    competition: string;
    matches: number;
    minutes: number;
    cleanSheets?: number;
    goalsConceded?: number;
    goals?: number;
  }>>([]);
  const [fbrefStandardStats, setFbrefStandardStats] = useState<FbrefStandardRow | null>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [expandedTransferHistory, setExpandedTransferHistory] = useState(false);
  const [expandedRecentMatches, setExpandedRecentMatches] = useState(false);
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [arsenalProfile, setArsenalProfile] = useState<ArsenalFbPlayerRecord | null>(null);
  const [fbrefProfile, setFbrefProfile] = useState<FbrefPlayerProfileRecord | null>(null);

  useEffect(() => {
    if (!player || !isOpen) {
      setStats({ appearances: 0, goals: 0 });
      setCompetitionStats([]);
      setFbrefStandardStats(null);
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

  // Load FBref standard stats for supported clubs (starting with Leeds United)
  useEffect(() => {
    let cancelled = false;

    const loadStandardStats = async () => {
      if (!isOpen || !player?.name) {
        if (!cancelled) setFbrefStandardStats(null);
        return;
      }

      const standard = await getPlayerStandardStatsForClub(teamName, player.name);
      if (!cancelled) {
        if (standard) {
          setFbrefStandardStats(standard);
        } else {
          // Fallback: safe empty row so visuals still render
          const guessedPosition = player.position || 'MF';
          setFbrefStandardStats(createEmptyStandardRow(player.name, guessedPosition));
        }
      }
    };

    loadStandardStats();

    return () => {
      cancelled = true;
    };
  }, [player?.name, teamName, isOpen]);

  // Load richer FBref player profile (for clubs we have scraped: uses club slug)
  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      if (!isOpen || !player?.name) {
        if (!cancelled) setFbrefProfile(null);
        return;
      }
      // Map teamName -> fbref club slug used in fbref-urls.json
      const slugMap: Record<string, string> = {
        'Arsenal': 'arsenal',
        'Leeds United': 'leeds-united',
        'Manchester United': 'manchester-united',
      };
      const clubSlug = slugMap[teamName];
      if (!clubSlug) {
        if (!cancelled) setFbrefProfile(null);
        return;
      }
      const profile = await getFbrefPlayerProfile(clubSlug, player.name);
      if (!cancelled) {
        setFbrefProfile(profile);
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [player?.name, teamName, isOpen]);

  // Load local Arsenal scouting profile when viewing an Arsenal player
  useEffect(() => {
    let cancelled = false;

    const loadArsenalProfile = async () => {
      if (!isOpen || !player?.name || teamName !== 'Arsenal') {
        setArsenalProfile(null);
        return;
      }
      try {
        const res = await fetch('/arsenal-squad.json', { cache: 'no-cache' });
        if (!res.ok) {
          if (!cancelled) setArsenalProfile(null);
          return;
        }
        const data = (await res.json()) as ArsenalFbPlayerRecord[];
        const targetName = player.name.toLowerCase();
        const record =
          data.find(p => p.profile?.name?.toLowerCase() === targetName) ||
          data.find(p => p.slug?.replace(/-/g, ' ').toLowerCase() === targetName) ||
          null;
        if (!cancelled) {
          setArsenalProfile(record);
        }
      } catch {
        if (!cancelled) {
          setArsenalProfile(null);
        }
      }
    };

    loadArsenalProfile();

    return () => {
      cancelled = true;
    };
  }, [player?.name, teamName, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setShowFullProfile(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (player?.name) {
      setShowFullProfile(false);
    }
  }, [player?.name]);

  // Early return if no player (after hooks)
  if (!player || !player.name) {
    return null;
  }

  // Safety check - ensure player exists before accessing properties
  if (!isOpen) {
    return null;
  }

  const playerCompetitions = Array.isArray(player.seasonStats?.competitions)
    ? player.seasonStats.competitions
    : undefined;
  const competitions = playerCompetitions && playerCompetitions.length > 0 ? playerCompetitions : competitionStats;

  // Fallback primary competition for Arsenal players using arsenal-squad.json
  const arsenalDomesticForPrimary =
    teamName === 'Arsenal' ? arsenalProfile?.currentSeasonSummary?.domesticLeague : undefined;

  const primaryCompetition =
    competitions && competitions.length > 0
      ? competitions[0]
      : arsenalDomesticForPrimary
      ? {
          competition: arsenalDomesticForPrimary.competition ?? 'Premier League',
          matches: arsenalDomesticForPrimary.mp ?? 0,
          minutes: arsenalDomesticForPrimary.min ?? 0,
          goals: arsenalDomesticForPrimary.gls ?? 0,
          assists: arsenalDomesticForPrimary.ast ?? 0,
          expectedGoals: arsenalDomesticForPrimary.xG,
          expectedAssists: arsenalDomesticForPrimary.xAG,
          totalShots: arsenalDomesticForPrimary.sca,
        }
      : undefined;
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
    : (() => {
        // Fallback to Arsenal last-five-matches data if no matchDates on primary competition
        if (teamName === 'Arsenal' && arsenalProfile?.lastFiveMatchesDomesticLeagues) {
          return arsenalProfile.lastFiveMatchesDomesticLeagues.map((m) => ({
            date: m.date,
            opponent: m.opponent || '',
          }));
        }
        return [];
      })();

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

  // Unused sub (time on bench without playing) – Arsenal only, from arsenal-squad.json
  const arsenalUnusedSub =
    teamName === 'Arsenal' && arsenalProfile?.playingTimeDomesticLeagues?.rows
      ? arsenalProfile.playingTimeDomesticLeagues.rows
          .filter((r) => r.comp?.includes('Premier League'))
          .reduce((sum, r) => sum + (typeof r.unSub === 'number' ? r.unSub : 0), 0)
      : null;

  // Arsenal-only: compact scouting snapshot from arsenal-squad.json (domestic league)
  const arsenalDomestic =
    teamName === 'Arsenal' ? arsenalProfile?.currentSeasonSummary?.domesticLeague : undefined;

  const arsenalScoutingGroup = arsenalDomestic
    ? [
        { label: 'Matches', value: formatStringOrNumber(arsenalDomestic.mp, 0) },
        { label: 'Minutes', value: formatStringOrNumber(arsenalDomestic.min, 0) },
        { label: 'Goals', value: formatStringOrNumber(arsenalDomestic.gls, 0) },
        { label: 'Assists', value: formatStringOrNumber(arsenalDomestic.ast, 0) },
        { label: 'xG', value: formatNumber(arsenalDomestic.xG, 2) },
        { label: 'xAG', value: formatNumber(arsenalDomestic.xAG, 2) },
        { label: 'Shot creating actions', value: formatStringOrNumber(arsenalDomestic.sca, 0) },
        { label: 'Goal creating actions', value: formatStringOrNumber(arsenalDomestic.gca, 0) },
      ].filter((stat) => stat.value !== null)
    : [];

  // FBref standard stats for league play (25/26 season); subAppearances = matches - starts (times came on from bench)
  const fbrefStandardGroup = (() => {
    const base = fbrefStandardStats
      ? [
          { label: 'Matches', value: formatStringOrNumber(fbrefStandardStats.matches, 0) },
          { label: 'Starts', value: formatStringOrNumber(fbrefStandardStats.starts, 0) },
          { label: 'Sub appearances', value: formatStringOrNumber(fbrefStandardStats.subAppearances ?? (fbrefStandardStats.matches - fbrefStandardStats.starts), 0) },
          ...(arsenalUnusedSub !== null ? [{ label: 'Unused sub', value: formatStringOrNumber(arsenalUnusedSub, 0) }] : []),
          { label: 'Minutes', value: formatStringOrNumber(fbrefStandardStats.minutes, 0) },
          { label: 'Goals', value: formatStringOrNumber(fbrefStandardStats.goals, 0) },
          { label: 'Assists', value: formatStringOrNumber(fbrefStandardStats.assists, 0) },
          { label: 'Goals/90', value: formatNumber(fbrefStandardStats.goalsPer90, 2) },
          { label: 'Assists/90', value: formatNumber(fbrefStandardStats.assistsPer90, 2) },
          { label: 'G+A/90', value: formatNumber(fbrefStandardStats.gaPer90, 2) },
          { label: 'G-no-pen/90', value: formatNumber(fbrefStandardStats.gNoPenPer90, 2) },
        ]
      : [];
    return base;
  })();

  const filterStats = (statsGroup: { label: string; value: string | null }[]) =>
    statsGroup.filter(stat => stat.value !== null);

  // Overlay profile fields for Arsenal players using local scouting data
  const overlayProfile = arsenalProfile?.profile;
  const displayNationality = overlayProfile?.nationality || player.bio?.nationality;
  const displayDateOfBirth = overlayProfile?.dateOfBirth || player.bio?.dateOfBirth;
  const displayHeight =
    (overlayProfile?.heightCm ? `${overlayProfile.heightCm} cm` : undefined) || player.bio?.height;
  const displayPreferredFoot = overlayProfile?.footed || overlayProfile?.preferredFoot || player.bio?.preferredFoot;
  const displayBioDescription = overlayProfile?.bio || player.bio?.description;

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

    // Extract goals scored and conceded from recent matches (squad data or Arsenal overlay)
    const baseMatches = player.previousMatches && player.previousMatches.length > 0
      ? player.previousMatches
      : teamName === 'Arsenal' && arsenalProfile?.lastFiveMatchesDomesticLeagues
      ? arsenalProfile.lastFiveMatchesDomesticLeagues.map((m) => {
          const score = m.result ? m.result.replace(/^[WD L]\s*/, '') : '';
          const scoreParts = score.split('–').map((s) => s.trim());
          const teamScore = parseInt(scoreParts[0]) || 0;
          const opponentScore = parseInt(scoreParts[1]) || 0;
          const isHome = m.venue === 'Home';
          return {
            score,
            team: m.squad || teamName,
            opponent: m.opponent || '',
            venue: isHome ? 'Home' : 'Away' as 'Home' | 'Away',
            teamScore: isHome ? teamScore : opponentScore,
            opponentScore: isHome ? opponentScore : teamScore,
          };
        })
      : [];

    const matchData = baseMatches.slice(0, timeline.length).map((match) => {
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

    // Try to extract ratings per match if available (currently we just show average)
    const matchRatings = baseMatches.slice(0, timeline.length).map(() => {
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
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700 p-4 sm:p-6">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={player?.imageUrl || getPlayerImage(player?.name || '', teamName)}
                  alt={player?.name || 'Player'}
                  onError={handlePlayerImageError}
                />
                <AvatarFallback className="bg-green-100 text-green-600">
                  <img src="/player-placeholder.png" alt="Player placeholder" className="w-full h-full object-cover" />
                </AvatarFallback>
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
                variant={showFullProfile ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowFullProfile(true)}
                className={showFullProfile ? 'bg-blue-600 text-white hover:bg-blue-500' : 'text-blue-300 border-blue-500 hover:bg-blue-500/10'}
              >
                <User className="w-4 h-4 mr-1.5" />
                Player
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsComparisonOpen(true)}
                className="text-blue-400 border-blue-500 hover:bg-blue-500 hover:text-white"
              >
                <Users className="w-4 h-4 mr-1.5" />
                Compare
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Basic Info - Single Line Format */}
          <div className="flex flex-wrap items-center gap-1.5 text-sm text-gray-300 font-medium">
            {/* Nationality Code - Nationality */}
            {displayNationality && (
              <>
                <span className="text-white font-semibold">
                  {(() => {
                    // Get country code from nationality
                    const countryCodes: Record<string, string> = {
                      'Spain': 'ES', 'France': 'FR', 'England': 'EN', 'Brazil': 'BR', 'Argentina': 'AR',
                      'Portugal': 'PT', 'Germany': 'DE', 'Italy': 'IT', 'Netherlands': 'NL', 'Belgium': 'BE',
                      'Croatia': 'HR', 'Denmark': 'DK', 'Sweden': 'SE', 'Norway': 'NO', 'Poland': 'PL',
                      'Czech Republic': 'CZ', 'Austria': 'AT', 'Switzerland': 'CH', 'Greece': 'GR', 'Turkey': 'TR',
                      'Ukraine': 'UA', 'Russia': 'RU', 'Serbia': 'RS', 'Slovakia': 'SK', 'Slovenia': 'SI',
                      'Romania': 'RO', 'Bulgaria': 'BG', 'Hungary': 'HU', 'Finland': 'FI', 'Ireland': 'IE',
                      'Wales': 'WAL', 'Scotland': 'SCO', 'Northern Ireland': 'NIR', 'Iceland': 'IS', 'Estonia': 'EE',
                      'Latvia': 'LV', 'Lithuania': 'LT', 'Luxembourg': 'LU', 'Malta': 'MT', 'Cyprus': 'CY',
                      'Albania': 'AL', 'Bosnia and Herzegovina': 'BA', 'Macedonia': 'MK', 'Montenegro': 'ME',
                      'Kosovo': 'XK', 'Moldova': 'MD', 'Georgia': 'GE', 'Armenia': 'AM', 'Azerbaijan': 'AZ',
                      'Kazakhstan': 'KZ', 'Uzbekistan': 'UZ', 'Israel': 'IL', 'Saudi Arabia': 'SA', 'UAE': 'AE',
                      'Qatar': 'QA', 'Kuwait': 'KW', 'Oman': 'OM', 'Bahrain': 'BH', 'Jordan': 'JO', 'Lebanon': 'LB',
                      'Syria': 'SY', 'Iraq': 'IQ', 'Iran': 'IR', 'Egypt': 'EG', 'Morocco': 'MA', 'Algeria': 'DZ',
                      'Tunisia': 'TN', 'Senegal': 'SN', 'Ghana': 'GH', 'Nigeria': 'NG', 'Cameroon': 'CM', 'Ivory Coast': 'CI',
                      'Mali': 'ML', 'Burkina Faso': 'BF', 'Guinea': 'GN', 'DR Congo': 'CD', 'Congo': 'CG', 'Gabon': 'GA',
                      'Togo': 'TG', 'Benin': 'BJ', 'Niger': 'NE', 'Chad': 'TD', 'Central African Republic': 'CF',
                      'Equatorial Guinea': 'GQ', 'São Tomé and Príncipe': 'ST', 'Cape Verde': 'CV', 'Gambia': 'GM',
                      'Guinea-Bissau': 'GW', 'Sierra Leone': 'SL', 'Liberia': 'LR', 'Mauritania': 'MR', 'Mauritius': 'MU',
                      'Madagascar': 'MG', 'Comoros': 'KM', 'Seychelles': 'SC', 'Djibouti': 'DJ', 'Eritrea': 'ER',
                      'Ethiopia': 'ET', 'Somalia': 'SO', 'Kenya': 'KE', 'Uganda': 'UG', 'Tanzania': 'TZ', 'Rwanda': 'RW',
                      'Burundi': 'BI', 'South Sudan': 'SS', 'Sudan': 'SD', 'Libya': 'LY', 'Mozambique': 'MZ', 'Malawi': 'MW',
                      'Zambia': 'ZM', 'Zimbabwe': 'ZW', 'Botswana': 'BW', 'Namibia': 'NA', 'Angola': 'AO', 'South Africa': 'ZA',
                      'Lesotho': 'LS', 'Eswatini': 'SZ', 'Maldives': 'MV', 'Sri Lanka': 'LK', 'Bangladesh': 'BD', 'India': 'IN',
                      'Pakistan': 'PK', 'Afghanistan': 'AF', 'Nepal': 'NP', 'Bhutan': 'BT', 'Myanmar': 'MM', 'Thailand': 'TH',
                      'Laos': 'LA', 'Cambodia': 'KH', 'Vietnam': 'VN', 'Malaysia': 'MY', 'Singapore': 'SG', 'Brunei': 'BN',
                      'Indonesia': 'ID', 'Philippines': 'PH', 'East Timor': 'TL', 'Papua New Guinea': 'PG', 'Fiji': 'FJ',
                      'Samoa': 'WS', 'Tonga': 'TO', 'Vanuatu': 'VU', 'Solomon Islands': 'SB', 'New Caledonia': 'NC', 'Tahiti': 'PF',
                      'New Zealand': 'NZ', 'Australia': 'AU', 'Japan': 'JP', 'South Korea': 'KR', 'North Korea': 'KP',
                      'China': 'CN', 'Taiwan': 'TW', 'Hong Kong': 'HK', 'Macau': 'MO', 'Mongolia': 'MN', 'Kyrgyzstan': 'KG',
                      'Tajikistan': 'TJ', 'Turkmenistan': 'TM', 'Canada': 'CA', 'United States': 'US', 'Mexico': 'MX',
                      'Guatemala': 'GT', 'Belize': 'BZ', 'El Salvador': 'SV', 'Honduras': 'HN', 'Nicaragua': 'NI',
                      'Costa Rica': 'CR', 'Panama': 'PA', 'Cuba': 'CU', 'Jamaica': 'JM', 'Haiti': 'HT', 'Dominican Republic': 'DO',
                      'Puerto Rico': 'PR', 'Trinidad and Tobago': 'TT', 'Barbados': 'BB', 'Bahamas': 'BS', 'Guyana': 'GY',
                      'Suriname': 'SR', 'French Guiana': 'GF', 'Venezuela': 'VE', 'Colombia': 'CO', 'Ecuador': 'EC',
                      'Peru': 'PE', 'Bolivia': 'BO', 'Paraguay': 'PY', 'Uruguay': 'UY', 'Chile': 'CL'
                    };
                    return countryCodes[displayNationality] || displayNationality.substring(0, 2).toUpperCase();
                  })()}
                </span>
                <span className="text-gray-400">-</span>
                <span className="text-white">{displayNationality}</span>
                <span className="text-gray-400">-</span>
              </>
            )}
            
            {/* Date of Birth with Age */}
            {displayDateOfBirth && (
              <>
                <span className="text-white">
                  {(() => {
                    const dob = displayDateOfBirth;
                    // Try to parse date - handle formats like "15 Sept 1995" or "1995-09-15"
                    let day = '', month = '', year = '';
                    const age = player.age || 0;
                    
                    // Try ISO format first
                    if (dob.includes('-')) {
                      const parts = dob.split('-');
                      if (parts.length >= 3) {
                        year = parts[0];
                        month = parts[1];
                        day = parts[2].split(' ')[0];
                      }
                    } else {
                      // Try "DD MMM YYYY" format
                      const match = dob.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
                      if (match) {
                        const months: Record<string, string> = {
                          'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'Jun': '06',
                          'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12',
                          'January': '01', 'February': '02', 'March': '03', 'April': '04', 'June': '06',
                          'July': '07', 'August': '08', 'September': '09', 'October': '10', 'November': '11', 'December': '12',
                          'May': '05' // Add May after to avoid duplicate key
                        };
                        day = match[1].padStart(2, '0');
                        month = months[match[2]] || '01';
                        year = match[3];
                      } else {
                        // Try to parse as Date object
                        const date = new Date(dob);
                        if (!isNaN(date.getTime())) {
                          day = String(date.getDate()).padStart(2, '0');
                          month = String(date.getMonth() + 1).padStart(2, '0');
                          year = String(date.getFullYear());
                        }
                      }
                    }
                    
                    if (day && month && year) {
                      return `${day}/${month}/${year}(${age})`;
                    }
                    return `${dob}(${age})`;
                  })()}
                </span>
                <span className="text-gray-400">-</span>
              </>
            )}
            
            {/* Position */}
            {player.position && (
              <>
                <span className="text-white font-semibold">{player.position}</span>
                <span className="text-gray-400">-</span>
              </>
            )}
            
            {/* Height */}
            {displayHeight && (
              <>
                <span className="text-white">{displayHeight}</span>
                <span className="text-gray-400">-</span>
              </>
            )}
            
            {/* Preferred Foot with Boot Icon */}
            {displayPreferredFoot && (
              <>
                <span className="text-white inline-flex items-center gap-1">
                  <Footprints className="w-3.5 h-3.5" />
                  {displayPreferredFoot}
                </span>
                <span className="text-gray-400">-</span>
              </>
            )}
            
            {/* Shirt Number */}
            {player.shirtNumber && (
              <span className="text-white font-semibold">No {player.shirtNumber}</span>
            )}
          </div>

          {showFullProfile ? (
            <>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullProfile(false)}
                  className="text-gray-300 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Back
                </Button>
                <span className="text-xs uppercase tracking-wide text-gray-400">Player profile</span>
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

          {/* Player visual maps – approximate from season stats (not true event maps) */}
          <div className="grid grid-cols-2 gap-3">
            {['Touch map', 'Shot map', 'Pass map', 'Duel map'].map((label) => {
              const comp = primaryCompetition;

              // If we have no season stats at all, keep the old placeholder
              if (!comp) {
                return (
                  <Card key={label} className="p-4 bg-slate-700/50 border-slate-600 border-dashed">
                    <h4 className="text-sm font-medium text-white mb-2">{label}</h4>
                    <p className="text-xs text-gray-400">
                      Data not yet available. Requires detailed match events from external feeds.
                    </p>
                  </Card>
                );
              }

              // Derive a simple intensity score per visual from available aggregates
              let intensity = 0;
              if (label === 'Touch map') {
                intensity = (comp.touches ?? comp.minutes ?? 0) / 10;
              } else if (label === 'Shot map') {
                const shots = comp.totalShots ?? 0;
                const xg = comp.expectedGoals ?? comp.xG ?? 0;
                intensity = shots + xg * 5;
              } else if (label === 'Pass map') {
                const passes = comp.accuratePasses ?? 0;
                const key = comp.keyPasses ?? 0;
                intensity = passes / 5 + key * 3;
              } else if (label === 'Duel map') {
                const duels =
                  (comp.totalDuelsWon ?? 0) +
                  (comp.groundDuelsWon ?? 0) +
                  (comp.aerialDuelsWon ?? 0);
                intensity = duels * 2;
              }

              // Clamp to a reasonable range of dots
              const baseDots = Math.max(15, Math.min(80, Math.round(intensity)));

              // Simple position-based bias: defenders deeper, forwards higher, etc.
              const position = player.position?.toLowerCase() || '';
              const verticalBias =
                position.includes('goalkeeper') ? 0.15
                : position.includes('defender') ? 0.3
                : position.includes('midfielder') ? 0.5
                : position.includes('forward') || position.includes('fw')
                ? 0.7
                : 0.5;

              // Seeded pseudo-random based on player name + label so pattern is stable
              const seedBase = `${player.name}-${label}`;
              const seededRandom = (index: number) => {
                let hash = 0;
                for (let i = 0; i < seedBase.length; i += 1) {
                  hash = (hash * 31 + seedBase.charCodeAt(i)) >>> 0;
                }
                const value = (hash + index * 1013904223) % 2147483647;
                return value / 2147483647;
              };

              const dots = Array.from({ length: baseDots }).map((_, i) => {
                const randX = seededRandom(i);
                const randY = seededRandom(i + 100);

                // Bias vertically toward the relevant band of the pitch
                const y =
                  verticalBias * 0.6 +
                  (randY - 0.5) * 0.8; // spread around the bias line

                const clampedY = Math.max(0.05, Math.min(0.95, y));

                // Avoid drawing in penalty boxes for midfield/duel maps to keep some structure
                const x = Math.max(0.05, Math.min(0.95, randX));

                return { x, y: clampedY };
              });

              return (
                <Card key={label} className="p-4 bg-slate-700/50 border-slate-600">
                  <h4 className="text-sm font-medium text-white mb-2">{label}</h4>
                  <div className="aspect-[3/4] rounded-md bg-slate-900/80 border border-slate-600 overflow-hidden mb-2">
                    <svg viewBox="0 0 60 80" className="w-full h-full">
                      {/* Pitch outline */}
                      <rect x="5" y="5" width="50" height="70" rx="4" ry="4" fill="#020617" stroke="#1e293b" strokeWidth="1" />
                      {/* Halfway line */}
                      <line x1="5" y1="40" x2="55" y2="40" stroke="#1e293b" strokeWidth="0.7" strokeDasharray="2 3" />
                      {/* Centre circle */}
                      <circle cx="30" cy="40" r="6" fill="none" stroke="#1e293b" strokeWidth="0.7" />
                      {/* Penalty boxes */}
                      <rect x="15" y="5" width="30" height="12" fill="none" stroke="#1e293b" strokeWidth="0.7" />
                      <rect x="15" y="63" width="30" height="12" fill="none" stroke="#1e293b" strokeWidth="0.7" />

                      {/* Activity dots */}
                      {dots.map((dot, index) => {
                        const px = 5 + dot.x * 50;
                        const py = 5 + dot.y * 70;

                        let color = '#38bdf8'; // default cyan
                        if (label === 'Shot map') color = '#f97316'; // orange
                        if (label === 'Pass map') color = '#22c55e'; // green
                        if (label === 'Duel map') color = '#eab308'; // amber
                        if (label === 'Touch map') color = '#6366f1'; // indigo

                        const radius = 0.6 + seededRandom(index + 200) * 0.9;
                        const opacity = 0.35 + seededRandom(index + 300) * 0.4;

                        return (
                          <circle
                            key={index}
                            cx={px}
                            cy={py}
                            r={radius}
                            fill={color}
                            opacity={opacity}
                          />
                        );
                      })}
                    </svg>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    Approximate distribution based on season totals (not exact event coordinates).
                  </p>
                </Card>
              );
            })}
          </div>

          {/* FBref League Standard Stats (Premier League 2025-26) */}
          {fbrefStandardStats && fbrefStandardGroup.length > 0 && (
            renderBarChart(
              'Premier League 2025-26 (FBref standard)',
              fbrefStandardGroup,
              {
                Matches: '#3b82f6',
                Starts: '#0ea5e9',
                'Sub appearances': '#64748b',
                'Unused sub': '#94a3b8',
                Minutes: '#22c55e',
                Goals: '#f97316',
                Assists: '#eab308',
                'Goals/90': '#ec4899',
                'Assists/90': '#8b5cf6',
                'G+A/90': '#06b6d4',
                'G-no-pen/90': '#14b8a6',
              }
            )
          )}

          {/* Arsenal-only compact scouting snapshot from local squad data */}
          {teamName === 'Arsenal' && arsenalScoutingGroup.length > 0 && (
            <Card className="p-4 bg-slate-800/60 border-slate-700">
              <h3 className="text-sm font-semibold text-slate-100 mb-2">
                Arsenal scouting snapshot (domestic league)
              </h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-200">
                {arsenalScoutingGroup.map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between gap-2">
                    <dt className="text-slate-400">{stat.label}</dt>
                    <dd className="font-semibold text-slate-50">{stat.value}</dd>
                  </div>
                ))}
              </dl>
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
          {displayBioDescription && (
            <Card className="p-4 bg-slate-700/50 border-slate-600">
              <h3 className="text-lg font-semibold text-white mb-3">About</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{displayBioDescription}</p>
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

          {/* Recent Matches – by competition type (League, Cup, European, International, Friendly) */}
          {(() => {
            const baseMatches = player.previousMatches && player.previousMatches.length > 0
              ? player.previousMatches
              : teamName === 'Arsenal' && arsenalProfile?.lastFiveMatchesDomesticLeagues
              ? arsenalProfile.lastFiveMatchesDomesticLeagues.map((m) => {
                  const outcome =
                    m.result && /W /.test(m.result)
                      ? 'Win'
                      : m.result && /L /.test(m.result)
                      ? 'Loss'
                      : 'Draw';
                  const score = m.result ? m.result.replace(/^[WD L]\s*/, '') : '';
                  return {
                    competition: 'Premier League',
                    date: m.date,
                    team: m.squad || teamName,
                    opponent: m.opponent || '',
                    score,
                    outcome: outcome as 'Win' | 'Draw' | 'Loss',
                    venue: m.venue === 'Home' || m.venue === 'Away' ? (m.venue as 'Home' | 'Away') : undefined,
                  };
                })
              : [];

            if (!baseMatches.length) return null;

            const matchesToShow = expandedRecentMatches ? baseMatches : baseMatches.slice(0, 3);

            return (
            <Card className="p-4 bg-slate-700/50 border-slate-600">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-sky-400" />
                  Recent Matches
                </h3>
                {baseMatches.length > 3 && (
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
                        Show All ({baseMatches.length})
                      </>
                    )}
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {matchesToShow.map((match, index) => {
                  const outcomeColor =
                    match.outcome === 'Win'
                      ? 'text-emerald-400'
                      : match.outcome === 'Loss'
                        ? 'text-red-400'
                        : 'text-yellow-300';
                  const compType =
                    /premier league|championship|league one|la liga|serie a|bundesliga|ligue 1/i.test(match.competition) ? 'League'
                    : /fa cup|league cup|efl cup|carabao|domestic cup/i.test(match.competition) ? 'Cup'
                    : /champions league|europa|europa league|conference league|european/i.test(match.competition) ? 'European'
                    : /world cup|euro |international|qualifier|nations league/i.test(match.competition) ? 'International'
                    : /friendly|friendlies/i.test(match.competition) ? 'Friendly'
                    : null;

                  return (
                    <div
                      key={`${match.date}-${match.competition}-${index}`}
                      className="flex items-start justify-between gap-4 rounded-lg border border-slate-700/50 bg-slate-800/40 p-3"
                    >
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 flex items-center gap-2 flex-wrap">
                          {match.date} • {match.competition}
                          {compType && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-600 text-slate-300 text-[10px] uppercase tracking-wide">
                              {compType}
                            </span>
                          )}
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
            );
          })()}
            </>
          ) : (
            <Card className="p-4 bg-slate-700/40 border-slate-600/70">
              <h3 className="text-lg font-semibold text-white mb-2">Player overview</h3>
              <p className="text-sm text-gray-300">
                Tap the Player button to open the full profile with stats, transfer history, and match logs while keeping this basic bio view clean.
              </p>
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


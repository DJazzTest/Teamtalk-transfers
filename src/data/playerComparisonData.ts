// Fallback player comparison data when API data is not available
// This provides detailed statistics similar to SofaScore

export interface DetailedPlayerStats {
  // General
  age?: number;
  height?: string; // in cm
  marketValue?: string; // in €
  sofascoreRating?: number;
  
  // Matches
  minutesPerGame?: number;
  totalMinutes?: number;
  matchesPlayed?: number;
  
  // Goalkeeping (for goalkeepers)
  goalsConceded?: number;
  saves?: number;
  goalsPrevented?: number;
  cleanSheets?: number;
  accuratePasses?: number;
  accurateLongBalls?: number; // percentage
  
  // Attacking
  goals?: number;
  goalsPerGame?: number;
  shotsOffTarget?: number;
  shotsOnTarget?: number;
  bigChancesMissed?: number;
  
  // Passes
  assists?: number;
  assistsPerGame?: number;
  expectedAssists?: number;
  bigChancesCreated?: number;
  longBalls?: number; // per game with percentage
  longBallsPercentage?: number;
  crosses?: number; // per game with percentage
  crossesPercentage?: number;
  
  // Defending
  interceptions?: number; // per game
  tackles?: number; // per game
  dribbledPast?: number; // per game
  clearances?: number; // per game
  blockedShots?: number; // per game
  
  // Other
  successfulDribbles?: number; // per game with percentage
  successfulDribblesPercentage?: number;
  groundDuelsWon?: number; // per game with percentage
  groundDuelsWonPercentage?: number;
  aerialDuelsWon?: number; // per game with percentage
  aerialDuelsWonPercentage?: number;
  possessionLost?: number; // per game
  fouls?: number; // per game
  wasFouled?: number; // per game
  
  // Cards
  yellowCards?: number;
  yellowRedCards?: number;
  redCards?: number;
  
  // Heatmap
  heatmapUrl?: string;
}

// Fallback data for known players
export const playerComparisonFallback: Record<string, DetailedPlayerStats> = {
  'David Raya': {
    age: 30,
    height: '183 cm',
    marketValue: '43M €',
    sofascoreRating: 7.2,
    minutesPerGame: 90,
    totalMinutes: 900,
    matchesPlayed: 10,
    goalsConceded: 3,
    saves: 16,
    goalsPrevented: 0.7,
    cleanSheets: 7,
    accuratePasses: 209,
    accurateLongBalls: 41.8,
    goals: 0,
    goalsPerGame: 0.0,
    shotsOffTarget: 0.0,
    shotsOnTarget: 0.0,
    bigChancesMissed: 0,
    assists: 0,
    assistsPerGame: 0.0,
    expectedAssists: 0.05,
    bigChancesCreated: 0,
    longBalls: 5.7,
    longBallsPercentage: 36.1,
    crosses: 0.0,
    crossesPercentage: 0,
    interceptions: 0.0,
    tackles: 0.0,
    dribbledPast: 0.0,
    clearances: 0.9,
    blockedShots: 0.0,
    successfulDribbles: 0.0,
    successfulDribblesPercentage: 0,
    groundDuelsWon: 0.1,
    groundDuelsWonPercentage: 100.0,
    aerialDuelsWon: 0.2,
    aerialDuelsWonPercentage: 100.0,
    possessionLost: 10.5,
    fouls: 0.0,
    wasFouled: 0.1,
    yellowCards: 1,
    yellowRedCards: 0,
    redCards: 0
  },
  'Illan Meslier': {
    age: 25,
    height: '196 cm',
    marketValue: '13.1M €',
    sofascoreRating: 6.8,
    minutesPerGame: 90,
    totalMinutes: 3510,
    matchesPlayed: 39,
    goalsConceded: 27,
    saves: 65,
    goalsPrevented: -2.7,
    cleanSheets: 21,
    accuratePasses: 881,
    accurateLongBalls: 29.8,
    goals: 0,
    goalsPerGame: 0.0,
    shotsOffTarget: 0.0,
    shotsOnTarget: 0.0,
    bigChancesMissed: 0,
    assists: 0,
    assistsPerGame: 0.0,
    expectedAssists: 0.03,
    bigChancesCreated: 0,
    longBalls: 2.5,
    longBallsPercentage: 27.3,
    crosses: 0.0,
    crossesPercentage: 0,
    interceptions: 0.0,
    tackles: 0.0,
    dribbledPast: 0.0,
    clearances: 0.9,
    blockedShots: 0.0,
    successfulDribbles: 0.0,
    successfulDribblesPercentage: 100.0,
    groundDuelsWon: 0.3,
    groundDuelsWonPercentage: 100.0,
    aerialDuelsWon: 0.5,
    aerialDuelsWonPercentage: 100.0,
    possessionLost: 7.1,
    fouls: 0.0,
    wasFouled: 0.3,
    yellowCards: 0,
    yellowRedCards: 0,
    redCards: 0
  },
  'Illan Meslier': {
    age: 25,
    height: '196 cm',
    marketValue: '13.1M €',
    sofascoreRating: 6.8,
    minutesPerGame: 90,
    totalMinutes: 3510,
    matchesPlayed: 39,
    goalsConceded: 27,
    saves: 65,
    goalsPrevented: -2.7,
    cleanSheets: 21,
    accuratePasses: 881,
    accurateLongBalls: 29.8,
    goals: 0,
    goalsPerGame: 0.0,
    shotsOffTarget: 0.0,
    shotsOnTarget: 0.0,
    bigChancesMissed: 0,
    assists: 0,
    assistsPerGame: 0.0,
    expectedAssists: 0.03,
    bigChancesCreated: 0,
    longBalls: 2.5,
    longBallsPercentage: 27.3,
    crosses: 0.0,
    crossesPercentage: 0,
    interceptions: 0.0,
    tackles: 0.0,
    dribbledPast: 0.0,
    clearances: 0.9,
    blockedShots: 0.0,
    successfulDribbles: 0.0,
    successfulDribblesPercentage: 100.0,
    groundDuelsWon: 0.3,
    groundDuelsWonPercentage: 100.0,
    aerialDuelsWon: 0.5,
    aerialDuelsWonPercentage: 100.0,
    possessionLost: 7.1,
    fouls: 0.0,
    wasFouled: 0.3,
    yellowCards: 0,
    yellowRedCards: 0,
    redCards: 0
  }
};

export const getPlayerComparisonData = (playerName: string, playerData: any): DetailedPlayerStats => {
  // First check fallback data
  const fallback = playerComparisonFallback[playerName];
  if (fallback) {
    return fallback;
  }
  
  // Otherwise, try to extract from playerData
  const stats: DetailedPlayerStats = {};
  
  if (playerData?.age) stats.age = playerData.age;
  if (playerData?.bio?.height) stats.height = playerData.bio.height;
  
  // Extract from seasonStats if available
  if (playerData?.seasonStats?.competitions) {
    const competitions = playerData.seasonStats.competitions;
    stats.matchesPlayed = competitions.reduce((sum: number, c: any) => sum + (c.matches || 0), 0);
    stats.totalMinutes = competitions.reduce((sum: number, c: any) => sum + (c.minutes || 0), 0);
    stats.minutesPerGame = stats.matchesPlayed > 0 ? Math.round(stats.totalMinutes / stats.matchesPlayed) : 0;
    
    if (playerData.position?.toLowerCase().includes('goalkeeper')) {
      stats.goalsConceded = competitions.reduce((sum: number, c: any) => sum + (c.goalsConceded || 0), 0);
      stats.cleanSheets = competitions.reduce((sum: number, c: any) => sum + (c.cleanSheets || 0), 0);
    } else {
      stats.goals = competitions.reduce((sum: number, c: any) => sum + (c.goals || 0), 0);
      stats.goalsPerGame = stats.matchesPlayed > 0 ? parseFloat((stats.goals / stats.matchesPlayed).toFixed(1)) : 0;
    }
  }
  
  return stats;
};


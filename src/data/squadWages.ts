export interface CompetitionStats {
  competition: string;
  matches: number;
  minutes: number;
  cleanSheets?: number;
  goalsConceded?: number;
  goals?: number;
  assists?: number;
  // Detailed stats (optional, for comprehensive data like Kepa's 2025-26 season)
  averageRating?: number;
  appearances?: number;
  started?: number;
  minutesPerGame?: number;
  totalMinutes?: number;
  teamOfTheWeek?: number;
  // Goalkeeping
  goalsConcededPerGame?: number;
  penaltiesSaved?: string; // Format: "saved/total"
  savesPerGame?: number;
  savesPerGamePercentage?: number;
  succRunsOutPerGame?: number;
  succRunsOutPercentage?: number;
  concededFromInsideBox?: number;
  concededFromOutsideBox?: number;
  saves?: number;
  goalsPrevented?: number;
  savesFromInsideBox?: number;
  savesFromOutsideBox?: number;
  savesCaught?: number;
  savesParried?: number;
  // Attacking
  expectedGoals?: number;
  scoringFrequency?: number;
  goalsPerGame?: number;
  totalShots?: number;
  shotsOnTargetPerGame?: number;
  bigChancesMissed?: number;
  goalConversion?: number;
  penaltyGoals?: number;
  penaltyConversion?: number;
  freeKickGoals?: number;
  freeKickConversion?: number;
  goalsFromInsideBox?: string; // Format: "goals/shots"
  goalsFromOutsideBox?: number;
  headedGoals?: number;
  leftFootedGoals?: number;
  rightFootedGoals?: number;
  penaltyWon?: number;
  // Passing
  expectedAssists?: number;
  touches?: number;
  bigChancesCreated?: number;
  keyPasses?: number;
  accuratePasses?: number;
  accuratePassesPercentage?: number;
  accOwnHalf?: number;
  accOwnHalfPercentage?: number;
  accOppositionHalf?: number;
  accOppositionHalfPercentage?: number;
  longBallsAccurate?: number;
  longBallsPercentage?: number;
  accurateChipPasses?: number;
  accurateChipPassesPercentage?: number;
  accurateCrosses?: number;
  // Defending
  interceptions?: number;
  tacklesPerGame?: number;
  possessionWonFinalThird?: number;
  ballsRecoveredPerGame?: number;
  dribbledPastPerGame?: number;
  clearancesPerGame?: number;
  blockedShotsPerGame?: number;
  errorsLeadingToShot?: number;
  errorsLeadingToGoal?: number;
  penaltiesCommitted?: number;
  // Other
  succDribbles?: number;
  succDribblesPercentage?: number;
  totalDuelsWon?: number;
  totalDuelsWonPercentage?: number;
  groundDuelsWon?: number;
  groundDuelsWonPercentage?: number;
  aerialDuelsWon?: number;
  aerialDuelsWonPercentage?: number;
  possessionLost?: number;
  foulsPerGame?: number;
  wasFouled?: number;
  offsides?: number;
  goalKicksPerGame?: number;
  // Cards
  yellowCards?: number;
  redCards2Yellows?: number;
  redCards?: number;
  // Match info
  matchDates?: string[];
  opponents?: string[];
}

export interface PlayerSeasonStats {
  season: string;
  competitions: CompetitionStats[];
  injuries?: {
    timeOut?: string;
    description?: string;
  };
}

interface PlayerTransferHistoryEntry {
  date: string;
  from?: string;
  to: string;
  fee: string;
  type?: string;
  notes?: string;
}

type MatchOutcome = 'Win' | 'Draw' | 'Loss';

interface PlayerMatchEntry {
  competition: string;
  date: string;
  team: string;
  opponent: string;
  score: string;
  outcome: MatchOutcome;
  venue?: 'Home' | 'Away' | 'Neutral';
}

export interface Player {
  name: string;
  weeklyWage: number;
  yearlyWage: number;
  position?: string;
  imageUrl?: string;
  age?: number;
  shirtNumber?: number;
  seasonStats?: PlayerSeasonStats;
  bio?: {
    height?: string;
    weight?: string;
    nationality?: string;
    dateOfBirth?: string;
    placeOfBirth?: string;
    preferredFoot?: string;
    description?: string;
    nationalTeam?: string;
    nationalTeamDebut?: string;
    nationalTeamAppearances?: number;
    nationalTeamGoals?: number;
    contractUntil?: string;
  };
  transferHistory?: PlayerTransferHistoryEntry[];
  previousMatches?: PlayerMatchEntry[];
}

const sanitizePlayerImageName = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Base wage multipliers for each club tier
const wageTiers = {
  'top6': 1.0,      // Man City, Liverpool, Chelsea, etc.
  'european': 0.8,  // Teams regularly in Europe
  'midtable': 0.6,  // Mid-table teams
  'lower': 0.4,     // Lower table teams
  'promoted': 0.3   // Newly promoted teams
};

// Helper function to generate realistic player names based on club
const generatePlayerName = (club: string, index: number): string => {
  const firstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  
  // For top clubs, include some international-sounding names
  const isTopClub = ['Arsenal', 'Manchester City', 'Chelsea', 'Liverpool', 'Manchester United', 'Tottenham'].includes(club);
  
  if (isTopClub && Math.random() > 0.5) {
    const intlFirst = ['Mohamed', 'Kevin', 'Bruno', 'Heung-min', 'Virgil', 'Ruben', 'Rodri', 'Bernardo', 'Jack', 'Phil'];
    const intlLast = ['Salah', 'De Bruyne', 'Fernandes', 'Son', 'van Dijk', 'Dias', 'Silva', 'Grealish', 'Foden', 'Nunes'];
    return `${intlFirst[Math.floor(Math.random() * intlFirst.length)]} ${intlLast[Math.floor(Math.random() * intlLast.length)]}`;
  }
  
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

// Generate a squad of players with realistic wage distribution
const generateSquad = (club: string, size: number, wageMultiplier: number): Player[] => {
  const squad: Player[] = [];
  
  // Generate players with decreasing wages
  for (let i = 0; i < size; i++) {
    // Base wage decreases with player position in squad
    const positionFactor = Math.pow(0.9, i);
    const baseWage = 300000 * wageMultiplier * positionFactor;
    
    // Add some randomness
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
    const weeklyWage = Math.round(baseWage * randomFactor / 1000) * 1000; // Round to nearest £1k
    
    // Calculate yearly wage in millions with 2 decimal places
    const yearlyWage = Math.round((weeklyWage * 52 / 1000000) * 100) / 100;
    
    squad.push({
      name: generatePlayerName(club, i),
      weeklyWage,
      yearlyWage
    });
  }
  
  return squad;
};

const createImageOnlySquad = (teamSlug: string, names: string[]): Player[] => {
  return names.map((name, index) => {
    const baseWeekly = 55000;
    const weeklyWage = Math.max(20000, baseWeekly - index * 1500);
    const yearlyWage = parseFloat(((weeklyWage * 52) / 1_000_000).toFixed(2));
    return {
      name,
      weeklyWage,
      yearlyWage,
      imageUrl: `/player-images/${teamSlug}/${sanitizePlayerImageName(name)}.png`
    };
  });
};

export const clubSquads: Record<string, Player[]> = {
  'Arsenal': [
    // Goalkeepers
    { 
      name: 'David Raya', 
      position: 'Goalkeeper', 
      shirtNumber: 1, 
      weeklyWage: 85000, 
      yearlyWage: 4.42,
      age: 30,
      bio: {
        height: '183 cm',
        nationality: 'Spain',
        dateOfBirth: '1995-09-15',
        preferredFoot: 'Right',
        contractUntil: '30 Jun 2028',
        nationalTeam: 'Spain',
        nationalTeamAppearances: 6,
        nationalTeamGoals: 0,
        description: 'David Raya is 30 years old (Sep 15, 1995), 183 cm tall and plays for Arsenal. David Raya prefers to play with right foot and his jersey number is 1. David Raya career statistics, match ratings, heatmap and goals are available for current and previous seasons. Last player match was Sunderland - Arsenal (2 - 2) and David Raya received 5.9 rating.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 11,
            minutes: 990,
            appearances: 11,
            started: 11,
            minutesPerGame: 90,
            totalMinutes: 990,
            teamOfTheWeek: 1,
            averageRating: 7.1,
            matchDates: ['21 Sept', '28 Sept', '04 Oct', '18 Oct', '26 Oct', '01 Nov', '08 Nov'],
            opponents: ['Manchester City', 'Newcastle United', 'West Ham United', 'Fulham', 'Crystal Palace', 'Burnley', 'Sunderland'],
            cleanSheets: 7,
            goalsConceded: 5,
            // Goalkeeping
            goalsConcededPerGame: 0.5,
            penaltiesSaved: '0/0',
            savesPerGame: 1.5,
            savesPerGamePercentage: 76,
            succRunsOutPerGame: 0.6,
            succRunsOutPercentage: 100,
            concededFromInsideBox: 4,
            concededFromOutsideBox: 1,
            saves: 16,
            goalsPrevented: -0.44,
            savesFromInsideBox: 13,
            savesFromOutsideBox: 3,
            savesCaught: 0,
            savesParried: 3,
            // Attacking
            goals: 0,
            expectedGoals: 0,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 0.0,
            shotsOnTargetPerGame: 0.0,
            bigChancesMissed: 0,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '0/0',
            goalsFromOutsideBox: 0,
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0.05,
            touches: 37.7,
            bigChancesCreated: 0,
            keyPasses: 0.09,
            accuratePasses: 20.0,
            accuratePassesPercentage: 66,
            accOwnHalf: 15.4,
            accOwnHalfPercentage: 96,
            accOppositionHalf: 4.6,
            accOppositionHalfPercentage: 32,
            longBallsAccurate: 5.5,
            longBallsPercentage: 35,
            accurateChipPasses: 1.5,
            accurateChipPassesPercentage: 68,
            accurateCrosses: 0.0,
            // Defending
            interceptions: 0.0,
            tacklesPerGame: 0.0,
            possessionWonFinalThird: 0.0,
            ballsRecoveredPerGame: 8.0,
            dribbledPastPerGame: 0.0,
            clearancesPerGame: 0.8,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 1,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.0,
            succDribblesPercentage: 0,
            totalDuelsWon: 0.3,
            totalDuelsWonPercentage: 100,
            groundDuelsWon: 0.09,
            groundDuelsWonPercentage: 100,
            aerialDuelsWon: 0.2,
            aerialDuelsWonPercentage: 100,
            possessionLost: 10.5,
            foulsPerGame: 0.0,
            wasFouled: 0.09,
            offsides: 0.0,
            goalKicksPerGame: 3.0,
            // Cards
            yellowCards: 1,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      },
      transferHistory: [
        {
          date: '4 Jul 2024',
          from: 'Brentford',
          to: 'Arsenal',
          fee: '£31.9M',
          type: 'Permanent transfer'
        },
        {
          date: '30 Jun 2024',
          from: 'Arsenal',
          to: 'Brentford',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '15 Aug 2023',
          from: 'Brentford',
          to: 'Arsenal',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '6 Jul 2019',
          from: 'Blackburn Rovers',
          to: 'Brentford',
          fee: '£3.4M',
          type: 'Permanent transfer'
        },
        {
          date: '19 Oct 2014',
          from: 'Southport',
          to: 'Blackburn Rovers',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '19 Sept 2014',
          from: 'Blackburn Rovers',
          to: 'Southport',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '1 Jul 2013',
          from: 'Blackburn U18',
          to: 'Blackburn Rovers',
          fee: '-',
          type: 'Youth promotion'
        }
      ],
      previousMatches: [
        {
          competition: 'Premier League',
          date: '08 Nov 2025',
          team: 'Arsenal',
          opponent: 'Sunderland',
          score: '2-2',
          outcome: 'Draw',
          venue: 'Away'
        },
        {
          competition: 'UEFA Champions League',
          date: '04 Nov 2025',
          team: 'Arsenal',
          opponent: 'SK Slavia Praha',
          score: '3-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '01 Nov 2025',
          team: 'Arsenal',
          opponent: 'Burnley',
          score: '2-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'EFL Cup',
          date: '29 Oct 2025',
          team: 'Arsenal',
          opponent: 'Brighton & Hove Albion',
          score: '2-0',
          outcome: 'Win',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '26 Oct 2025',
          team: 'Arsenal',
          opponent: 'Crystal Palace',
          score: '1-0',
          outcome: 'Win',
          venue: 'Home'
        },
        {
          competition: 'UEFA Champions League',
          date: '21 Oct 2025',
          team: 'Arsenal',
          opponent: 'Atlético Madrid',
          score: '4-0',
          outcome: 'Win',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '18 Oct 2025',
          team: 'Arsenal',
          opponent: 'Fulham',
          score: '1-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'World Cup Qual. UEFA',
          date: '14 Oct 2025',
          team: 'Spain',
          opponent: 'Bulgaria',
          score: '4-0',
          outcome: 'Win',
          venue: 'Home'
        },
        {
          competition: 'World Cup Qual. UEFA',
          date: '11 Oct 2025',
          team: 'Spain',
          opponent: 'Georgia',
          score: '2-0',
          outcome: 'Win',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '04 Oct 2025',
          team: 'Arsenal',
          opponent: 'West Ham United',
          score: '2-0',
          outcome: 'Win',
          venue: 'Home'
        }
      ]
    },
    { 
      name: 'Kepa Arrizabalaga', 
      position: 'Goalkeeper', 
      shirtNumber: 13, 
      weeklyWage: 85000, 
      yearlyWage: 4.42,
      age: 31,
      bio: {
        height: '188 cm',
        nationality: 'Spain',
        dateOfBirth: '1994-10-03',
        preferredFoot: 'Right',
        nationalTeam: 'Spain',
        description: 'Kepa Arrizabalaga is 31 years old (3 Oct 1994), 188 cm tall and plays for Arsenal. Kepa Arrizabalaga prefers to play with right foot. His jersey number is 13.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 31,
            minutes: 2790,
            appearances: 31,
            started: 31,
            minutesPerGame: 90,
            totalMinutes: 2790,
            teamOfTheWeek: 1,
            averageRating: 7.14,
            // Goalkeeping
            goalsConcededPerGame: 1.3,
            penaltiesSaved: '0/4',
            savesPerGame: 3.1,
            savesPerGamePercentage: 71,
            succRunsOutPerGame: 0.6,
            succRunsOutPercentage: 90,
            goalsConceded: 39,
            concededFromInsideBox: 37,
            concededFromOutsideBox: 2,
            saves: 97,
            goalsPrevented: 2.14,
            savesFromInsideBox: 62,
            savesFromOutsideBox: 35,
            savesCaught: 0,
            savesParried: 15,
            cleanSheets: 8,
            // Attacking
            goals: 0,
            expectedGoals: 0.061,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 1,
            shotsOnTargetPerGame: 0.0,
            bigChancesMissed: 0,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '0/1',
            goalsFromOutsideBox: 0,
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0.046,
            touches: 0,
            bigChancesCreated: 0,
            keyPasses: 1,
            accuratePasses: 634,
            accuratePassesPercentage: 70.37,
            accOwnHalf: 17.0,
            accOwnHalfPercentage: 91,
            accOppositionHalf: 3.4,
            accOppositionHalfPercentage: 33,
            longBallsAccurate: 175,
            longBallsPercentage: 40.14,
            accurateChipPasses: 1.5,
            accurateChipPassesPercentage: 61,
            accurateCrosses: 0.0,
            // Defending
            interceptions: 0.0,
            tacklesPerGame: 0.03,
            possessionWonFinalThird: 0.0,
            ballsRecoveredPerGame: 8.1,
            dribbledPastPerGame: 0.06,
            clearancesPerGame: 1.2,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 1,
            penaltiesCommitted: 2,
            // Other
            succDribbles: 1,
            succDribblesPercentage: 100,
            totalDuelsWon: 0.5,
            totalDuelsWonPercentage: 75,
            groundDuelsWon: 0.2,
            groundDuelsWonPercentage: 64,
            aerialDuelsWon: 8,
            aerialDuelsWonPercentage: 89,
            possessionLost: 8.9,
            foulsPerGame: 0.06,
            wasFouled: 0.2,
            offsides: 0.0,
            goalKicksPerGame: 6.2,
            // Cards
            yellowCards: 3,
            redCards2Yellows: 0,
            redCards: 0,
            // Match info
            matchDates: ['14 Apr', '19 Apr', '27 Apr', '3 May', '10 May', '20 May', '25 May'],
            opponents: ['Fulham', 'Crystal Palace', 'Manchester United', 'Arsenal', 'Aston Villa', 'Manchester City', 'Leicester City']
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      },
      transferHistory: [
        {
          date: '8 Jul 2024',
          from: 'Chelsea',
          to: 'Arsenal',
          fee: '£24.0M',
          type: 'Permanent transfer'
        },
        {
          date: '30 Jun 2024',
          from: 'Real Madrid',
          to: 'Chelsea',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '14 Aug 2023',
          from: 'Chelsea',
          to: 'Real Madrid',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '8 Aug 2018',
          from: 'Athletic Club',
          to: 'Chelsea',
          fee: '£71.6M',
          type: 'Permanent transfer'
        },
        {
          date: '30 Jun 2017',
          from: 'Real Valladolid',
          to: 'Athletic Club',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '11 Jan 2017',
          from: 'Athletic Club',
          to: 'Real Valladolid',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '5 Sep 2014',
          from: 'Athletic Bilbao B',
          to: 'Ponferradina',
          fee: '-',
          type: 'Loan'
        }
      ],
      previousMatches: [
        {
          competition: 'Premier League',
          date: '08 Nov 2025',
          team: 'Arsenal',
          opponent: 'Sunderland',
          score: '2-2',
          outcome: 'Draw',
          venue: 'Away'
        },
        {
          competition: 'UEFA Champions League',
          date: '04 Nov 2025',
          team: 'Arsenal',
          opponent: 'SK Slavia Praha',
          score: '3-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '01 Nov 2025',
          team: 'Arsenal',
          opponent: 'Burnley',
          score: '2-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'EFL Cup',
          date: '29 Oct 2025',
          team: 'Arsenal',
          opponent: 'Brighton & Hove Albion',
          score: '2-0',
          outcome: 'Win',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '26 Oct 2025',
          team: 'Arsenal',
          opponent: 'Crystal Palace',
          score: '1-0',
          outcome: 'Win',
          venue: 'Home'
        },
        {
          competition: 'UEFA Champions League',
          date: '21 Oct 2025',
          team: 'Arsenal',
          opponent: 'Atlético Madrid',
          score: '4-0',
          outcome: 'Win',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '18 Oct 2025',
          team: 'Arsenal',
          opponent: 'Fulham',
          score: '1-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '04 Oct 2025',
          team: 'Arsenal',
          opponent: 'West Ham United',
          score: '2-0',
          outcome: 'Win',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '28 Sep 2025',
          team: 'Arsenal',
          opponent: 'Nottingham Forest',
          score: '3-1',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'UEFA Champions League',
          date: '24 Sep 2025',
          team: 'Arsenal',
          opponent: 'Bayer Leverkusen',
          score: '2-2',
          outcome: 'Draw',
          venue: 'Away'
        }
      ]
    },
    { 
      name: 'Tommy Setford', 
      position: 'Goalkeeper', 
      shirtNumber: 35, 
      weeklyWage: 30000, 
      yearlyWage: 1.56,
      age: 19,
      bio: {
        height: '185 cm',
        nationality: 'England',
        dateOfBirth: '2006-03-13',
        preferredFoot: 'Right',
        contractUntil: '30 Jun 2028',
        nationalTeam: 'England',
        description: 'Tommy Setford is 19 years old (Mar 13, 2006), 185 cm tall and plays for Arsenal U21. Tommy Setford prefers to play with right foot. His jersey number is 35.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 2,
            minutes: 180,
            appearances: 2,
            started: 2,
            minutesPerGame: 90,
            totalMinutes: 180,
            teamOfTheWeek: 0,
            matchDates: ['23 Sept', '28 Oct'],
            opponents: ['Newport County', 'Exeter City'],
            // Goalkeeping
            goalsConcededPerGame: 2.5,
            penaltiesSaved: '0/0',
            savesPerGame: 2.0,
            savesPerGamePercentage: 44,
            succRunsOutPerGame: 1.0,
            succRunsOutPercentage: 100,
            goalsConceded: 5,
            concededFromInsideBox: 5,
            concededFromOutsideBox: 0,
            saves: 4,
            savesFromInsideBox: 3,
            savesFromOutsideBox: 1,
            savesCaught: 0,
            savesParried: 3,
            cleanSheets: 0,
            // Attacking
            goals: 0,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 0.0,
            shotsOnTargetPerGame: 0.0,
            bigChancesMissed: 0,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: 0,
            goalsFromOutsideBox: 0,
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            touches: 72.5,
            bigChancesCreated: 0,
            keyPasses: 0.0,
            accuratePasses: 41.0,
            accuratePassesPercentage: 71,
            accOwnHalf: 38.0,
            accOwnHalfPercentage: 92,
            accOppositionHalf: 3.0,
            accOppositionHalfPercentage: 18,
            longBallsAccurate: 6.5,
            longBallsPercentage: 28,
            accurateChipPasses: 2.0,
            accurateChipPassesPercentage: 80,
            accurateCrosses: 0.0,
            // Defending
            interceptions: 0.0,
            tacklesPerGame: 0.0,
            possessionWonFinalThird: 0.0,
            ballsRecoveredPerGame: 9.5,
            dribbledPastPerGame: 0.0,
            clearancesPerGame: 4.0,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 1,
            errorsLeadingToGoal: 2,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.0,
            totalDuelsWon: 2.0,
            totalDuelsWonPercentage: 80,
            groundDuelsWon: 1.5,
            groundDuelsWonPercentage: 75,
            aerialDuelsWon: 0.5,
            aerialDuelsWonPercentage: 100,
            possessionLost: 18.0,
            foulsPerGame: 0.0,
            wasFouled: 1.5,
            offsides: 0.0,
            goalKicksPerGame: 4.0,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      }
    },
    { 
      name: 'Alexei Rojas', 
      position: 'Goalkeeper', 
      shirtNumber: 51, 
      weeklyWage: 15000, 
      yearlyWage: 0.78,
      age: 20,
      bio: {
        height: '186 cm',
        nationality: 'Colombia',
        dateOfBirth: '2005-09-28',
        preferredFoot: 'Right',
        contractUntil: '30 Jun 2026',
        nationalTeam: 'Colombia',
        description: 'Alexei Rojas is 20 years old (Sep 28, 2005), 186 cm tall and plays for Arsenal U21. Alexei Rojas prefers to play with right foot. His jersey number is 51.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'U20 CONMEBOL Championship',
            matches: 1,
            minutes: 90,
            appearances: 1,
            started: 1,
            minutesPerGame: 90,
            totalMinutes: 90,
            teamOfTheWeek: 0,
            matchDates: ['1 Feb'],
            opponents: ['Brazil U20'],
            // Goalkeeping
            goalsConcededPerGame: 0.0,
            penaltiesSaved: '0/0',
            savesPerGame: 6.0,
            savesPerGamePercentage: 100,
            succRunsOutPerGame: 0.0,
            succRunsOutPercentage: 0,
            goalsConceded: 0,
            concededFromInsideBox: 0,
            concededFromOutsideBox: 0,
            saves: 6,
            savesFromInsideBox: 4,
            savesFromOutsideBox: 2,
            savesCaught: 1,
            savesParried: 0,
            cleanSheets: 1,
            // Attacking
            goals: 0,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 0.0,
            shotsOnTargetPerGame: 0.0,
            bigChancesMissed: 0,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: 0,
            goalsFromOutsideBox: 0,
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            touches: 34.0,
            bigChancesCreated: 0,
            keyPasses: 0.0,
            accuratePasses: 13.0,
            accuratePassesPercentage: 52,
            accOwnHalf: 11.0,
            accOwnHalfPercentage: 79,
            accOppositionHalf: 2.0,
            accOppositionHalfPercentage: 18,
            longBallsAccurate: 5.0,
            longBallsPercentage: 29,
            accurateChipPasses: 1.0,
            accurateChipPassesPercentage: 17,
            accurateCrosses: 0.0,
            // Defending
            interceptions: 0.0,
            tacklesPerGame: 0.0,
            possessionWonFinalThird: 0.0,
            ballsRecoveredPerGame: 10.0,
            dribbledPastPerGame: 0.0,
            clearancesPerGame: 0.0,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.0,
            totalDuelsWon: 0.0,
            totalDuelsWonPercentage: 0,
            groundDuelsWon: 0.0,
            groundDuelsWonPercentage: 0,
            aerialDuelsWon: 0.0,
            aerialDuelsWonPercentage: 0,
            possessionLost: 12.0,
            foulsPerGame: 0.0,
            wasFouled: 0.0,
            offsides: 0.0,
            goalKicksPerGame: 7.0,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      }
    },
    
    // Defenders
    { 
      name: 'William Saliba', 
      position: 'Defender', 
      shirtNumber: 2, 
      weeklyWage: 190000, 
      yearlyWage: 9.88,
      age: 24,
      bio: {
        height: '193 cm',
        nationality: 'France',
        dateOfBirth: '2001-03-24',
        preferredFoot: 'Right',
        contractUntil: '30 Jun 2030',
        nationalTeam: 'France',
        nationalTeamAppearances: 30,
        nationalTeamGoals: 0,
        nationalTeamDebut: '25 Mar 2022',
        description: 'William Saliba is 24 years old (Mar 24, 2001), 193 cm tall and plays for Arsenal. William Saliba prefers to play with right foot. His jersey number is 2. William Saliba career statistics, match ratings, heatmap and goals are available for current and previous seasons. Last player match was Sunderland - Arsenal (2 - 2).'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 2,
            minutes: 180,
            appearances: 2,
            started: 2,
            minutesPerGame: 90,
            totalMinutes: 180,
            teamOfTheWeek: 0,
            matchDates: ['10 Oct', '13 Oct'],
            opponents: ['Azerbaijan', 'Iceland'],
            // Attacking
            goals: 0,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 0.0,
            shotsOnTargetPerGame: 0.0,
            bigChancesMissed: 0,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: 0,
            goalsFromOutsideBox: 0,
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            touches: 86.0,
            bigChancesCreated: 0,
            keyPasses: 0.5,
            accuratePasses: 76.0,
            accuratePassesPercentage: 96,
            accOwnHalf: 27.0,
            accOwnHalfPercentage: 93,
            accOppositionHalf: 49.0,
            accOppositionHalfPercentage: 97,
            longBallsAccurate: 2.0,
            longBallsPercentage: 67,
            accurateChipPasses: 0.5,
            accurateChipPassesPercentage: 33,
            accurateCrosses: 0.0,
            // Defending
            cleanSheets: 1,
            interceptions: 1.0,
            tacklesPerGame: 0.5,
            possessionWonFinalThird: 0.0,
            ballsRecoveredPerGame: 3.0,
            dribbledPastPerGame: 0.0,
            clearancesPerGame: 3.5,
            blockedShotsPerGame: 0.5,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.0,
            totalDuelsWon: 2.0,
            totalDuelsWonPercentage: 36,
            groundDuelsWon: 0.5,
            groundDuelsWonPercentage: 20,
            aerialDuelsWon: 1.5,
            aerialDuelsWonPercentage: 50,
            possessionLost: 3.5,
            foulsPerGame: 2.0,
            wasFouled: 0.0,
            offsides: 0.0,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'Injured'
        }
      },
      transferHistory: [
        {
          date: '30 Jun 2022',
          from: 'Olympique de Marseille',
          to: 'Arsenal',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '15 Jul 2021',
          from: 'Arsenal',
          to: 'Olympique de Marseille',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '30 Jun 2021',
          from: 'Nice',
          to: 'Arsenal',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '4 Jan 2021',
          from: 'Arsenal',
          to: 'Nice',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '30 Jun 2020',
          from: 'Saint-Étienne',
          to: 'Arsenal',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '26 Jul 2019',
          from: 'Arsenal',
          to: 'Saint-Étienne',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '25 Jul 2019',
          from: 'Saint-Étienne',
          to: 'Arsenal',
          fee: '£30M',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jul 2018',
          from: 'AS Saint-Étienne 2',
          to: 'Saint-Étienne',
          fee: '-',
          type: 'Promotion'
        },
        {
          date: '11 May 2018',
          from: 'Saint-Étienne U19',
          to: 'AS Saint-Étienne 2',
          fee: '-',
          type: 'Promotion'
        }
      ]
    },
    { 
      name: 'Cristhian Mosquera', 
      position: 'Defender', 
      shirtNumber: 3, 
      weeklyWage: 55000, 
      yearlyWage: 2.86,
      age: 21,
      bio: {
        height: '191 cm',
        nationality: 'Spain',
        dateOfBirth: '2004-06-27',
        preferredFoot: 'Right',
        contractUntil: '30 Jun 2030',
        description: 'Cristhian Mosquera is 21 years old (Jun 27, 2004), 191 cm tall and plays for Arsenal. Cristhian Mosquera prefers to play with right foot. His jersey number is 3. Cristhian Mosquera career statistics, match ratings, heatmap and goals are available for current and previous seasons. Last player match was Sunderland - Arsenal (2 - 2) and Cristhian Mosquera received 6.3 rating.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 7,
            minutes: 303,
            appearances: 7,
            started: 2,
            minutesPerGame: 43,
            totalMinutes: 303,
            teamOfTheWeek: 0,
            matchDates: ['23 Aug', '31 Aug', '13 Sept', '28 Sept', '26 Oct', '8 Nov'],
            opponents: ['Leeds United', 'Liverpool', 'Nottingham Forest', 'Newcastle United', 'Crystal Palace', 'Sunderland'],
            // Attacking
            goals: 0,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 0.0,
            shotsOnTargetPerGame: 0.0,
            bigChancesMissed: 0,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: 0,
            goalsFromOutsideBox: 0,
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0.10,
            touches: 34.0,
            bigChancesCreated: 0,
            keyPasses: 0.1,
            accuratePasses: 25.6,
            accuratePassesPercentage: 91,
            accOwnHalf: 19.4,
            accOwnHalfPercentage: 94,
            accOppositionHalf: 6.1,
            accOppositionHalfPercentage: 83,
            longBallsAccurate: 0.3,
            longBallsPercentage: 25,
            accurateChipPasses: 0.1,
            accurateChipPassesPercentage: 25,
            accurateCrosses: 0.0,
            // Defending
            cleanSheets: 1,
            interceptions: 0.7,
            tacklesPerGame: 1.1,
            possessionWonFinalThird: 0.0,
            ballsRecoveredPerGame: 1.7,
            dribbledPastPerGame: 0.1,
            clearancesPerGame: 1.9,
            blockedShotsPerGame: 0.3,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.0,
            totalDuelsWon: 1.9,
            totalDuelsWonPercentage: 59,
            groundDuelsWon: 1.3,
            groundDuelsWonPercentage: 82,
            aerialDuelsWon: 0.6,
            aerialDuelsWonPercentage: 36,
            possessionLost: 3.1,
            foulsPerGame: 0.0,
            wasFouled: 0.1,
            offsides: 0.1,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      },
      transferHistory: [
        {
          date: '24 Jul 2025',
          from: 'Valencia',
          to: 'Arsenal',
          fee: '£15M',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jan 2023',
          from: 'Valencia Mestalla U21',
          to: 'Valencia',
          fee: '-',
          type: 'Promotion'
        },
        {
          date: '1 Jul 2022',
          from: 'Valencia U18',
          to: 'Valencia Mestalla U21',
          fee: '-',
          type: 'Promotion'
        }
      ]
    },
    { 
      name: 'Ben White', 
      position: 'Defender', 
      shirtNumber: 4, 
      weeklyWage: 150000, 
      yearlyWage: 7.8,
      age: 28,
      bio: {
        height: '186 cm',
        nationality: 'England',
        dateOfBirth: '1997-10-08',
        preferredFoot: 'Right',
        contractUntil: '30 Jun 2028',
        nationalTeam: 'England',
        nationalTeamDebut: '2 Jun 2021',
        nationalTeamAppearances: 4,
        nationalTeamGoals: 0,
        description: 'Ben White is 28 years old (Oct 8, 1997), 186 cm tall and plays for Arsenal. Ben White prefers to play with right foot. His jersey number is 4. Arsenal is playing their next match on Nov 23, 2025, 4:30:00 PM UTC against Arsenal - Tottenham Hotspur in Premier League. Ben White football player profile displays all matches and competitions with statistics for all the matches Ben White played in. Most important stats for each competition, including average rating, matches played, goals, assists, cards and other relevant data are also displayed.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 1,
            minutes: 71,
            appearances: 1,
            started: 1,
            minutesPerGame: 71,
            totalMinutes: 71,
            teamOfTheWeek: 0,
            matchDates: ['17 Aug'],
            opponents: ['Manchester United'],
            // Attacking
            goals: 0,
            expectedGoals: 0.01,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 1.0,
            shotsOnTargetPerGame: 0.0,
            bigChancesMissed: 0,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: 0,
            goalsFromOutsideBox: 0,
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0.01,
            touches: 40.0,
            bigChancesCreated: 0,
            keyPasses: 1.0,
            accuratePasses: 17.0,
            accuratePassesPercentage: 81,
            accOwnHalf: 7.0,
            accOwnHalfPercentage: 100,
            accOppositionHalf: 10.0,
            accOppositionHalfPercentage: 67,
            longBallsAccurate: 1.0,
            longBallsPercentage: 33,
            accurateChipPasses: 2.0,
            accurateChipPassesPercentage: 100,
            accurateCrosses: 0.0,
            accurateCrossesPercentage: 0,
            // Defending
            cleanSheets: 0,
            interceptions: 1.0,
            tacklesPerGame: 2.0,
            possessionWonFinalThird: 0.0,
            ballsRecoveredPerGame: 4.0,
            dribbledPastPerGame: 1.0,
            clearancesPerGame: 4.0,
            blockedShotsPerGame: 1.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 1.0,
            succDribblesPercentage: 100,
            totalDuelsWon: 5.0,
            totalDuelsWonPercentage: 56,
            groundDuelsWon: 3.0,
            groundDuelsWonPercentage: 50,
            aerialDuelsWon: 2.0,
            aerialDuelsWonPercentage: 67,
            possessionLost: 6.0,
            foulsPerGame: 2.0,
            wasFouled: 0.0,
            offsides: 0.0,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'Currently injured'
        }
      },
      transferHistory: [
        {
          date: '30 Jul 2021',
          from: 'Brighton & Hove Albion',
          to: 'Arsenal',
          fee: '£58M',
          type: 'Permanent transfer'
        },
        {
          date: '31 Jul 2020',
          from: 'Leeds United',
          to: 'Brighton & Hove Albion',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '1 Jul 2019',
          from: 'Brighton & Hove Albion',
          to: 'Leeds United',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '3 Jan 2019',
          from: 'Brighton & Hove Albion',
          to: 'Peterborough United',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '1 Jul 2018',
          from: 'Newport County',
          to: 'Brighton & Hove Albion',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '1 Aug 2017',
          from: 'Brighton & Hove Albion U21',
          to: 'Newport County',
          fee: '-',
          type: 'Loan'
        }
      ]
    },
    { 
      name: 'Piero Hincapie', 
      position: 'Defender', 
      shirtNumber: 5, 
      weeklyWage: 50000, 
      yearlyWage: 2.6,
      age: 23,
      bio: {
        height: '184 cm',
        nationality: 'Ecuador',
        dateOfBirth: '2002-01-09',
        preferredFoot: 'Left',
        contractUntil: '30 Jun 2026',
        nationalTeam: 'Ecuador',
        nationalTeamDebut: '14 Jun 2021',
        nationalTeamAppearances: 48,
        nationalTeamGoals: 3,
        description: 'Piero Hincapié is 23 years old (Jan 9, 2002), 184 cm tall and plays for Arsenal. Piero Hincapié prefers to play with left foot. His jersey number is 5. Piero Hincapié football player profile displays all matches and competitions with statistics for all the matches Piero Hincapié played in. Most important stats for each competition, including average rating, matches played, goals, assists, cards and other relevant data are also displayed.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 2,
            minutes: 26,
            appearances: 2,
            started: 0,
            minutesPerGame: 13,
            totalMinutes: 26,
            teamOfTheWeek: 0,
            matchDates: ['26 Oct', '1 Nov'],
            opponents: ['Crystal Palace', 'Burnley'],
            // Attacking
            goals: 0,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 0.0,
            shotsOnTargetPerGame: 0.0,
            bigChancesMissed: 0,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: 0,
            goalsFromOutsideBox: 0,
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0.00,
            touches: 7.5,
            bigChancesCreated: 0,
            keyPasses: 0.0,
            accuratePasses: 5.0,
            accuratePassesPercentage: 100,
            accOwnHalf: 3.5,
            accOwnHalfPercentage: 100,
            accOppositionHalf: 1.5,
            accOppositionHalfPercentage: 100,
            longBallsAccurate: 0.5,
            longBallsPercentage: 100,
            accurateChipPasses: 0.0,
            accurateCrosses: 0.0,
            // Defending
            cleanSheets: 0,
            interceptions: 0.0,
            tacklesPerGame: 0.0,
            possessionWonFinalThird: 0.0,
            ballsRecoveredPerGame: 0.0,
            dribbledPastPerGame: 1.0,
            clearancesPerGame: 0.0,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.0,
            totalDuelsWon: 0.5,
            totalDuelsWonPercentage: 25,
            groundDuelsWon: 0.5,
            groundDuelsWonPercentage: 33,
            aerialDuelsWon: 0.0,
            possessionLost: 1.0,
            foulsPerGame: 0.0,
            wasFouled: 0.5,
            offsides: 0.0,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      },
      transferHistory: [
        {
          date: '1 Jul 2026',
          from: 'Bayer 04 Leverkusen',
          to: 'Arsenal',
          fee: '£52M',
          type: 'Permanent transfer'
        },
        {
          date: '30 Jun 2026',
          from: 'Arsenal',
          to: 'Bayer 04 Leverkusen',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '1 Sept 2025',
          from: 'Bayer 04 Leverkusen',
          to: 'Arsenal',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '16 Aug 2021',
          from: 'Talleres',
          to: 'Bayer 04 Leverkusen',
          fee: '£6.4M',
          type: 'Permanent transfer'
        },
        {
          date: '20 Aug 2020',
          from: 'Independiente del Valle',
          to: 'Talleres',
          fee: '£845K',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jan 2020',
          from: 'Independiente del Valle U19',
          to: 'Independiente del Valle',
          fee: '-',
          type: 'Promotion'
        }
      ]
    },
    { 
      name: 'Gabriel Magalhães', 
      position: 'Defender', 
      shirtNumber: 6, 
      weeklyWage: 150000, 
      yearlyWage: 7.8,
      age: 27,
      bio: {
        height: '190 cm',
        nationality: 'Brazil',
        dateOfBirth: '1997-12-19',
        preferredFoot: 'Left',
        contractUntil: '30 Jun 2029',
        nationalTeam: 'Brazil',
        nationalTeamDebut: '9 Sept 2023',
        nationalTeamAppearances: 16,
        nationalTeamGoals: 1,
        description: 'Gabriel Magalhães is 27 years old (Dec 19, 1997), 190 cm tall and plays for Arsenal. Gabriel Magalhães prefers to play with left foot. His jersey number is 6. Gabriel Magalhães career statistics, match ratings, heatmap and goals are available for current and previous seasons. Last player match was Sunderland - Arsenal (2 - 2) and Gabriel Magalhães received 7 rating.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 11,
            minutes: 990,
            appearances: 11,
            started: 11,
            minutesPerGame: 90,
            totalMinutes: 990,
            teamOfTheWeek: 2,
            matchDates: ['21 Sept', '28 Sept', '4 Oct', '18 Oct', '26 Oct', '1 Nov', '8 Nov'],
            opponents: ['Manchester City', 'Newcastle United', 'West Ham United', 'Fulham', 'Crystal Palace', 'Burnley', 'Sunderland'],
            // Attacking
            goals: 1,
            expectedGoals: 0.81,
            scoringFrequency: 990,
            goalsPerGame: 0.09,
            totalShots: 0.7,
            shotsOnTargetPerGame: 0.09,
            bigChancesMissed: 2,
            goalConversion: 13,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '1/6',
            goalsFromOutsideBox: '0/2',
            headedGoals: 1,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 2,
            expectedAssists: 0.77,
            touches: 77.1,
            bigChancesCreated: 3,
            keyPasses: 0.4,
            accuratePasses: 57.0,
            accuratePassesPercentage: 90,
            accOwnHalf: 35.6,
            accOwnHalfPercentage: 95,
            accOppositionHalf: 21.2,
            accOppositionHalfPercentage: 82,
            longBallsAccurate: 1.8,
            longBallsPercentage: 39,
            accurateChipPasses: 1.2,
            accurateChipPassesPercentage: 50,
            accurateCrosses: 0.0,
            accurateCrossesPercentage: 0,
            // Defending
            cleanSheets: 7,
            interceptions: 0.9,
            tacklesPerGame: 1.1,
            possessionWonFinalThird: 0.0,
            ballsRecoveredPerGame: 1.4,
            dribbledPastPerGame: 0.3,
            clearancesPerGame: 5.9,
            blockedShotsPerGame: 1.2,
            errorsLeadingToShot: 2,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.09,
            succDribblesPercentage: 50,
            totalDuelsWon: 5.7,
            totalDuelsWonPercentage: 66,
            groundDuelsWon: 2.3,
            groundDuelsWonPercentage: 78,
            aerialDuelsWon: 3.5,
            aerialDuelsWonPercentage: 60,
            possessionLost: 7.3,
            foulsPerGame: 0.4,
            wasFouled: 1.1,
            offsides: 0.0,
            // Cards
            yellowCards: 1,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'Currently injured'
        }
      },
      transferHistory: [
        {
          date: '1 Sept 2020',
          from: 'Lille',
          to: 'Arsenal',
          fee: '£26M',
          type: 'Permanent transfer'
        },
        {
          date: '30 Jun 2018',
          from: 'GNK Dinamo Zagreb II',
          to: 'Lille',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '15 Feb 2018',
          from: 'Lille',
          to: 'GNK Dinamo Zagreb II',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '14 Feb 2018',
          from: 'Troyes',
          to: 'Lille',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '1 Jul 2017',
          from: 'Lille',
          to: 'Troyes',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '31 Jan 2017',
          from: 'Avaí',
          to: 'Lille',
          fee: '£3M',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jan 2016',
          from: 'Avaí U19',
          to: 'Avaí',
          fee: '-',
          type: 'Promotion'
        }
      ]
    },
    { 
      name: 'Jurriën Timber', 
      position: 'Defender', 
      shirtNumber: 12, 
      weeklyWage: 80000, 
      yearlyWage: 4.16,
      age: 24,
      bio: {
        height: '179 cm',
        nationality: 'Netherlands',
        dateOfBirth: '2001-06-17',
        preferredFoot: 'Right',
        contractUntil: '30 Jun 2028',
        nationalTeam: 'Netherlands',
        nationalTeamDebut: '2 Jun 2021',
        nationalTeamAppearances: 21,
        nationalTeamGoals: 0,
        description: 'Jurriën Timber is 24 years old (Jun 17, 2001), 179 cm tall and plays for Arsenal. Jurriën Timber prefers to play with right foot. His jersey number is 12. Jurriën Timber career statistics, match ratings, heatmap and goals are available for current and previous seasons. Last player match was Sunderland - Arsenal (2 - 2) and Jurriën Timber received 6.4 rating.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 11,
            minutes: 883,
            appearances: 11,
            started: 10,
            minutesPerGame: 80,
            totalMinutes: 883,
            teamOfTheWeek: 1,
            matchDates: ['21 Sept', '28 Sept', '4 Oct', '18 Oct', '26 Oct', '1 Nov', '8 Nov'],
            opponents: ['Manchester City', 'Newcastle United', 'West Ham United', 'Fulham', 'Crystal Palace', 'Burnley', 'Sunderland'],
            // Attacking
            goals: 2,
            expectedGoals: 2.08,
            scoringFrequency: 442,
            goalsPerGame: 0.2,
            totalShots: 1.0,
            shotsOnTargetPerGame: 0.5,
            bigChancesMissed: 1,
            goalConversion: 18,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '2/11',
            goalsFromOutsideBox: '0',
            headedGoals: 1,
            leftFootedGoals: 0,
            rightFootedGoals: 1,
            penaltyWon: 1,
            // Passing
            assists: 1,
            expectedAssists: 0.70,
            touches: 59.9,
            bigChancesCreated: 2,
            keyPasses: 1.1,
            accuratePasses: 32.2,
            accuratePassesPercentage: 87,
            accOwnHalf: 12.4,
            accOwnHalfPercentage: 95,
            accOppositionHalf: 19.8,
            accOppositionHalfPercentage: 78,
            longBallsAccurate: 0.5,
            longBallsPercentage: 40,
            accurateChipPasses: 0.5,
            accurateChipPassesPercentage: 40,
            accurateCrosses: 0.2,
            accurateCrossesPercentage: 13,
            // Defending
            cleanSheets: 5,
            interceptions: 0.5,
            tacklesPerGame: 3.1,
            possessionWonFinalThird: 0.2,
            ballsRecoveredPerGame: 3.0,
            dribbledPastPerGame: 0.4,
            clearancesPerGame: 1.9,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.6,
            succDribblesPercentage: 39,
            totalDuelsWon: 5.7,
            totalDuelsWonPercentage: 56,
            groundDuelsWon: 4.8,
            groundDuelsWonPercentage: 59,
            aerialDuelsWon: 0.9,
            aerialDuelsWonPercentage: 45,
            possessionLost: 10.6,
            foulsPerGame: 1.2,
            wasFouled: 1.2,
            offsides: 0.0,
            // Cards
            yellowCards: 2,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'Currently injured'
        }
      },
      transferHistory: [
        {
          date: '14 Jul 2023',
          from: 'AFC Ajax',
          to: 'Arsenal',
          fee: '£40M',
          type: 'Permanent transfer'
        },
        {
          date: '18 Sept 2020',
          from: 'Jong Ajax',
          to: 'AFC Ajax',
          fee: '-',
          type: 'Promotion'
        },
        {
          date: '1 Jul 2014',
          from: 'Feyenoord Youth',
          to: 'Jong Ajax',
          fee: 'Free',
          type: 'Free transfer'
        }
      ]
    },
    { 
      name: 'Riccardo Calafiori', 
      position: 'Defender', 
      shirtNumber: 33, 
      weeklyWage: 120000, 
      yearlyWage: 6.24,
      age: 23,
      bio: {
        height: '188 cm',
        nationality: 'Italy',
        dateOfBirth: '2002-05-19',
        preferredFoot: 'Left',
        contractUntil: '30 Jun 2029',
        nationalTeam: 'Italy',
        nationalTeamDebut: '4 Jun 2024',
        nationalTeamAppearances: 12,
        nationalTeamGoals: 0,
        description: 'Riccardo Calafiori is 23 years old (May 19, 2002), 188 cm tall and plays for Arsenal. Riccardo Calafiori prefers to play with left foot. His jersey number is 33. Riccardo Calafiori career statistics, match ratings, heatmap and goals are available for current and previous seasons. Last player match was Sunderland - Arsenal (2 - 2) and Riccardo Calafiori received 6.1 rating.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'World Cup Qual. UEFA',
            matches: 3,
            minutes: 270,
            appearances: 3,
            started: 3,
            minutesPerGame: 90,
            totalMinutes: 270,
            teamOfTheWeek: 0,
            matchDates: ['5 Sept', '11 Oct', '14 Oct'],
            opponents: ['Estonia', 'Estonia', 'Israel'],
            // Attacking
            goals: 0,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 2.0,
            shotsOnTargetPerGame: 0.3,
            bigChancesMissed: 0,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '0/5',
            goalsFromOutsideBox: '0/1',
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            touches: 97.7,
            bigChancesCreated: 0,
            keyPasses: 1.3,
            accuratePasses: 75.7,
            accuratePassesPercentage: 91,
            accOwnHalf: 40.0,
            accOwnHalfPercentage: 95,
            accOppositionHalf: 36.0,
            accOppositionHalfPercentage: 86,
            longBallsAccurate: 1.7,
            longBallsPercentage: 38,
            accurateChipPasses: 0.7,
            accurateChipPassesPercentage: 25,
            accurateCrosses: 0.3,
            accurateCrossesPercentage: 50,
            // Defending
            cleanSheets: 2,
            interceptions: 2.0,
            tacklesPerGame: 1.0,
            possessionWonFinalThird: 0.0,
            ballsRecoveredPerGame: 4.3,
            dribbledPastPerGame: 0.3,
            clearancesPerGame: 3.0,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.3,
            succDribblesPercentage: 100,
            totalDuelsWon: 5.7,
            totalDuelsWonPercentage: 55,
            groundDuelsWon: 1.7,
            groundDuelsWonPercentage: 45,
            aerialDuelsWon: 4.0,
            aerialDuelsWonPercentage: 60,
            possessionLost: 9.3,
            foulsPerGame: 1.3,
            wasFouled: 0.3,
            offsides: 0.0,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'Currently injured'
        }
      },
      transferHistory: [
        {
          date: '29 Jul 2024',
          from: 'Bologna',
          to: 'Arsenal',
          fee: '£45M',
          type: 'Permanent transfer'
        },
        {
          date: '31 Aug 2023',
          from: 'Basel',
          to: 'Bologna',
          fee: '£4M',
          type: 'Permanent transfer'
        },
        {
          date: '31 Aug 2022',
          from: 'Roma',
          to: 'Basel',
          fee: '£1M',
          type: 'Permanent transfer'
        },
        {
          date: '30 Jun 2022',
          from: 'Genoa',
          to: 'Roma',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '14 Jan 2022',
          from: 'Roma',
          to: 'Genoa',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '1 Sept 2020',
          from: 'Roma U20',
          to: 'Roma',
          fee: '-',
          type: 'Promotion'
        }
      ]
    },
    { 
      name: 'Myles Lewis-Skelly', 
      position: 'Defender', 
      shirtNumber: 49, 
      weeklyWage: 20000, 
      yearlyWage: 1.04,
      age: 19,
      bio: {
        height: '178 cm',
        nationality: 'England',
        dateOfBirth: '2006-09-26',
        preferredFoot: 'Left',
        contractUntil: '30 Jun 2030',
        nationalTeam: 'England',
        nationalTeamDebut: '21 Mar 2025',
        nationalTeamAppearances: 6,
        nationalTeamGoals: 1,
        description: 'Myles Lewis-Skelly is 19 years old (Sep 26, 2006), 178 cm tall and plays for Arsenal. Myles Lewis-Skelly prefers to play with left foot. His jersey number is 49. Myles Lewis-Skelly football player profile displays all matches and competitions with statistics for all the matches Myles Lewis-Skelly played in. Most important stats for each competition, including average rating, matches played, goals, assists, cards and other relevant data are also displayed.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'World Cup Qual. UEFA',
            matches: 4,
            minutes: 348,
            appearances: 4,
            started: 4,
            minutesPerGame: 87,
            totalMinutes: 348,
            teamOfTheWeek: 0,
            matchDates: ['21 Mar', '24 Mar', '6 Sept', '14 Oct'],
            opponents: ['Albania', 'Latvia', 'Andorra', 'Latvia'],
            // Attacking
            goals: 1,
            scoringFrequency: 348,
            goalsPerGame: 0.3,
            totalShots: 0.5,
            shotsOnTargetPerGame: 0.3,
            bigChancesMissed: 0,
            goalConversion: 50,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '1/1',
            goalsFromOutsideBox: '0/1',
            headedGoals: 0,
            leftFootedGoals: 1,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            touches: 81.5,
            bigChancesCreated: 0,
            keyPasses: 0.3,
            accuratePasses: 64.0,
            accuratePassesPercentage: 95,
            accOwnHalf: 14.0,
            accOwnHalfPercentage: 95,
            accOppositionHalf: 50.0,
            accOppositionHalfPercentage: 93,
            longBallsAccurate: 0.5,
            longBallsPercentage: 50,
            accurateChipPasses: 1.3,
            accurateChipPassesPercentage: 83,
            accurateCrosses: 0.0,
            accurateCrossesPercentage: 0,
            // Defending
            cleanSheets: 2,
            interceptions: 0.3,
            tacklesPerGame: 0.0,
            possessionWonFinalThird: 0.8,
            ballsRecoveredPerGame: 4.8,
            dribbledPastPerGame: 0.5,
            clearancesPerGame: 0.3,
            blockedShotsPerGame: 0.3,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.3,
            succDribblesPercentage: 33,
            totalDuelsWon: 1.8,
            totalDuelsWonPercentage: 41,
            groundDuelsWon: 1.8,
            groundDuelsWonPercentage: 44,
            aerialDuelsWon: 0.0,
            possessionLost: 7.0,
            foulsPerGame: 1.0,
            wasFouled: 1.5,
            offsides: 0.3,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'Currently injured'
        }
      },
      transferHistory: [
        {
          date: '1 Jul 2024',
          from: 'Arsenal U21',
          to: 'Arsenal',
          fee: '-',
          type: 'Promotion'
        }
      ]
    },
    
    // Midfielders
    { 
      name: 'Martin Ødegaard', 
      position: 'Midfielder', 
      shirtNumber: 8, 
      weeklyWage: 240000, 
      yearlyWage: 12.48,
      age: 26,
      bio: {
        height: '178 cm',
        nationality: 'Norway',
        dateOfBirth: '1998-12-17',
        preferredFoot: 'Left',
        contractUntil: '30 Jun 2028',
        nationalTeam: 'Norway',
        nationalTeamDebut: '27 Aug 2014',
        nationalTeamAppearances: 67,
        nationalTeamGoals: 4,
        description: 'Martin Ødegaard is 26 years old (Dec 17, 1998), 178 cm tall and plays for Arsenal. Martin Ødegaard prefers to play with left foot. His jersey number is 8. Arsenal is playing their next match on Nov 23, 2025, 4:30:00 PM UTC against Arsenal - Tottenham Hotspur in Premier League. Martin Ødegaard football player profile displays all matches and competitions with statistics for all the matches Martin Ødegaard played in. Most important stats for each competition, including average rating, matches played, goals, assists, cards and other relevant data are also displayed.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 6,
            minutes: 204,
            appearances: 6,
            started: 4,
            minutesPerGame: 34,
            totalMinutes: 204,
            teamOfTheWeek: 0,
            matchDates: ['17 Aug', '23 Aug', '31 Aug', '13 Sept', '28 Sept', '4 Oct'],
            opponents: ['Manchester United', 'Leeds United', 'Liverpool', 'Nottingham Forest', 'Newcastle United', 'West Ham United'],
            // Attacking
            goals: 0,
            expectedGoals: 0.14,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 0.7,
            shotsOnTargetPerGame: 0.2,
            bigChancesMissed: 0,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '0/1',
            goalsFromOutsideBox: '0/3',
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 1,
            expectedAssists: 0.82,
            touches: 27.7,
            bigChancesCreated: 1,
            keyPasses: 0.5,
            accuratePasses: 18.2,
            accuratePassesPercentage: 82,
            accOwnHalf: 4.3,
            accOwnHalfPercentage: 90,
            accOppositionHalf: 14.0,
            accOppositionHalfPercentage: 77,
            longBallsAccurate: 1.3,
            longBallsPercentage: 57,
            accurateChipPasses: 0.8,
            accurateChipPassesPercentage: 45,
            accurateCrosses: 0.2,
            accurateCrossesPercentage: 20,
            // Defending
            interceptions: 0.2,
            tacklesPerGame: 0.5,
            possessionWonFinalThird: 0.3,
            ballsRecoveredPerGame: 1.7,
            dribbledPastPerGame: 0.0,
            clearancesPerGame: 0.8,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.5,
            succDribblesPercentage: 60,
            totalDuelsWon: 1.7,
            totalDuelsWonPercentage: 67,
            groundDuelsWon: 1.5,
            groundDuelsWonPercentage: 69,
            aerialDuelsWon: 0.2,
            aerialDuelsWonPercentage: 50,
            possessionLost: 5.5,
            foulsPerGame: 0.3,
            wasFouled: 0.5,
            offsides: 0.0,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'Currently injured'
        }
      },
      transferHistory: [
        {
          date: '20 Aug 2021',
          from: 'Real Madrid',
          to: 'Arsenal',
          fee: '£35M',
          type: 'Permanent transfer'
        },
        {
          date: '30 Jun 2021',
          from: 'Arsenal',
          to: 'Real Madrid',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '27 Jan 2021',
          from: 'Real Madrid',
          to: 'Arsenal',
          fee: '£2.8M',
          type: 'Loan'
        },
        {
          date: '20 Jul 2020',
          from: 'Real Sociedad',
          to: 'Real Madrid',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '5 Jul 2019',
          from: 'Real Madrid',
          to: 'Real Sociedad',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '30 Jun 2019',
          from: 'Vitesse',
          to: 'Real Madrid',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '21 Aug 2018',
          from: 'Real Madrid',
          to: 'Vitesse',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '1 Jul 2018',
          from: 'SC Heerenveen',
          to: 'Real Madrid',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '30 Jun 2018',
          from: 'Real Madrid Castilla U21',
          to: 'Real Madrid',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '9 Jan 2017',
          from: 'Real Madrid',
          to: 'SC Heerenveen',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '8 Jan 2017',
          from: 'Real Madrid Castilla U21',
          to: 'Real Madrid',
          fee: '-',
          type: 'Promotion'
        },
        {
          date: '22 Jan 2015',
          from: 'Strømsgodset',
          to: 'Real Madrid Castilla U21',
          fee: '£2.8M',
          type: 'Permanent transfer'
        },
        {
          date: '5 May 2014',
          from: 'Strømsgodset II',
          to: 'Strømsgodset',
          fee: '-',
          type: 'Promotion'
        },
        {
          date: '1 Jan 2014',
          from: 'Strømsgodset IF',
          to: 'Strømsgodset II',
          fee: '-',
          type: 'Promotion'
        }
      ]
    },
    { 
      name: 'Christian Nørgaard', 
      position: 'Midfielder', 
      shirtNumber: 16, 
      weeklyWage: 60000, 
      yearlyWage: 3.12,
      age: 31,
      bio: {
        height: '185 cm',
        nationality: 'Denmark',
        dateOfBirth: '1994-03-10',
        preferredFoot: 'Right',
        contractUntil: '30 Jun 2027',
        nationalTeam: 'Denmark',
        nationalTeamDebut: '8 Sept 2020',
        nationalTeamAppearances: 37,
        nationalTeamGoals: 1,
        description: 'Christian Nørgaard is 31 years old (Mar 10, 1994), 185 cm tall and plays for Arsenal. Christian Nørgaard prefers to play with right foot. His jersey number is 16. Christian Nørgaard football player profile displays all matches and competitions with statistics for all the matches Christian Nørgaard played in. Most important stats for each competition, including average rating, matches played, goals, assists, cards and other relevant data are also displayed.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 2,
            minutes: 14,
            appearances: 2,
            started: 0,
            minutesPerGame: 7,
            totalMinutes: 14,
            teamOfTheWeek: 0,
            matchDates: ['1 Nov'],
            opponents: ['Burnley'],
            // Attacking
            goals: 0,
            expectedGoals: 0.05,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 0.5,
            shotsOnTargetPerGame: 0.5,
            bigChancesMissed: 0,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: 0,
            goalsFromOutsideBox: '0/1',
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0.00,
            touches: 7.0,
            bigChancesCreated: 0,
            keyPasses: 0.0,
            accuratePasses: 2.5,
            accuratePassesPercentage: 83,
            accOwnHalf: 2.0,
            accOwnHalfPercentage: 80,
            accOppositionHalf: 0.5,
            accOppositionHalfPercentage: 100,
            longBallsAccurate: 0.0,
            accurateChipPasses: 0.5,
            accurateChipPassesPercentage: 100,
            accurateCrosses: 0.0,
            // Defending
            interceptions: 0.0,
            tacklesPerGame: 0.0,
            possessionWonFinalThird: 0.5,
            ballsRecoveredPerGame: 1.0,
            dribbledPastPerGame: 0.0,
            clearancesPerGame: 1.0,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.0,
            totalDuelsWon: 1.0,
            totalDuelsWonPercentage: 50,
            groundDuelsWon: 0.0,
            aerialDuelsWon: 1.0,
            aerialDuelsWonPercentage: 67,
            possessionLost: 1.0,
            foulsPerGame: 0.5,
            wasFouled: 0.0,
            offsides: 0.0,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'Currently injured'
        }
      },
      transferHistory: [
        {
          date: '10 Jul 2025',
          from: 'Brentford',
          to: 'Arsenal',
          fee: '£11.6M',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jul 2019',
          from: 'Fiorentina',
          to: 'Brentford',
          fee: '£3.6M',
          type: 'Permanent transfer'
        },
        {
          date: '19 Jul 2018',
          from: 'Brøndby IF',
          to: 'Fiorentina',
          fee: '£3.2M',
          type: 'Permanent transfer'
        },
        {
          date: '21 Aug 2013',
          from: 'Hamburger SV',
          to: 'Brøndby IF',
          fee: '£350K',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jul 2012',
          from: 'Hamburger SV II U23',
          to: 'Hamburger SV',
          fee: '-',
          type: 'Promotion'
        }
      ]
    },
    { 
      name: 'Mikel Merino', 
      position: 'Midfielder', 
      shirtNumber: 23, 
      weeklyWage: 130000, 
      yearlyWage: 6.76,
      age: 29,
      bio: {
        height: '188 cm',
        nationality: 'Spain',
        dateOfBirth: '1996-06-22',
        preferredFoot: 'Left',
        contractUntil: '30 Jun 2028',
        nationalTeam: 'Spain',
        nationalTeamDebut: '3 Sept 2020',
        nationalTeamAppearances: 39,
        nationalTeamGoals: 10,
        description: 'Mikel Merino is 29 years old (Jun 22, 1996), 188 cm tall and plays for Arsenal. Mikel Merino prefers to play with left foot. His jersey number is 23. Mikel Merino career statistics, match ratings, heatmap and goals are available for current and previous seasons. Last player match was Sunderland - Arsenal (2 - 2) and Mikel Merino received 6.1 rating.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 10,
            minutes: 415,
            appearances: 10,
            started: 4,
            minutesPerGame: 42,
            totalMinutes: 415,
            teamOfTheWeek: 0,
            matchDates: ['21 Sept', '28 Sept', '4 Oct', '18 Oct', '26 Oct', '1 Nov', '8 Nov'],
            opponents: ['Manchester City', 'Newcastle United', 'West Ham United', 'Fulham', 'Crystal Palace', 'Burnley', 'Sunderland'],
            // Attacking
            goals: 1,
            expectedGoals: 0.71,
            scoringFrequency: 415,
            goalsPerGame: 0.1,
            totalShots: 0.5,
            shotsOnTargetPerGame: 0.2,
            bigChancesMissed: 2,
            goalConversion: 20,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '1/5',
            goalsFromOutsideBox: '0',
            headedGoals: 1,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 1,
            expectedAssists: 0.24,
            touches: 22.7,
            bigChancesCreated: 1,
            keyPasses: 0.4,
            accuratePasses: 11.8,
            accuratePassesPercentage: 78,
            accOwnHalf: 4.8,
            accOwnHalfPercentage: 89,
            accOppositionHalf: 7.0,
            accOppositionHalfPercentage: 70,
            longBallsAccurate: 0.1,
            longBallsPercentage: 14,
            accurateChipPasses: 0.2,
            accurateChipPassesPercentage: 29,
            accurateCrosses: 0.0,
            accurateCrossesPercentage: 0,
            // Defending
            interceptions: 0.3,
            tacklesPerGame: 0.7,
            possessionWonFinalThird: 0.4,
            ballsRecoveredPerGame: 2.6,
            dribbledPastPerGame: 0.4,
            clearancesPerGame: 0.7,
            blockedShotsPerGame: 0.1,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.4,
            succDribblesPercentage: 67,
            totalDuelsWon: 2.7,
            totalDuelsWonPercentage: 41,
            groundDuelsWon: 1.8,
            groundDuelsWonPercentage: 46,
            aerialDuelsWon: 0.9,
            aerialDuelsWonPercentage: 33,
            possessionLost: 5.5,
            foulsPerGame: 0.8,
            wasFouled: 0.7,
            offsides: 0.0,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'Currently injured'
        }
      },
      transferHistory: [
        {
          date: '27 Aug 2024',
          from: 'Real Sociedad',
          to: 'Arsenal',
          fee: '£32M',
          type: 'Permanent transfer'
        },
        {
          date: '12 Jul 2018',
          from: 'Newcastle United',
          to: 'Real Sociedad',
          fee: '£12M',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jul 2018',
          from: 'Borussia Dortmund',
          to: 'Newcastle United',
          fee: '£7M',
          type: 'Permanent transfer'
        },
        {
          date: '30 Jun 2018',
          from: 'Newcastle United',
          to: 'Borussia Dortmund',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '28 Jul 2017',
          from: 'Borussia Dortmund',
          to: 'Newcastle United',
          fee: '£3M',
          type: 'Loan'
        },
        {
          date: '1 Jul 2016',
          from: 'Osasuna',
          to: 'Borussia Dortmund',
          fee: '£3.8M',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jul 2014',
          from: 'Osasuna B',
          to: 'Osasuna',
          fee: '-',
          type: 'Promotion'
        },
        {
          date: '1 Jul 2013',
          from: 'Osasuna U19',
          to: 'Osasuna B',
          fee: '-',
          type: 'Promotion'
        }
      ]
    },
    { 
      name: 'Martín Zubimendi', 
      position: 'Midfielder', 
      shirtNumber: 36, 
      weeklyWage: 60000, 
      yearlyWage: 3.12,
      age: 26,
      bio: {
        height: '180 cm',
        nationality: 'Spain',
        dateOfBirth: '1999-02-02',
        preferredFoot: 'Right',
        contractUntil: '30 Jun 2030',
        nationalTeam: 'Spain',
        nationalTeamDebut: '8 Jun 2021',
        nationalTeamAppearances: 23,
        nationalTeamGoals: 2,
        description: 'Martín Zubimendi is 26 years old (Feb 2, 1999), 180 cm tall and plays for Arsenal. Martín Zubimendi prefers to play with right foot. His jersey number is 36. Martín Zubimendi career statistics, match ratings, heatmap and goals are available for current and previous seasons. Last player match was Sunderland - Arsenal (2 - 2) and Martín Zubimendi received 7.1 rating.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 11,
            minutes: 938,
            appearances: 11,
            started: 10,
            minutesPerGame: 85,
            totalMinutes: 938,
            teamOfTheWeek: 1,
            matchDates: ['21 Sept', '28 Sept', '4 Oct', '18 Oct', '26 Oct', '1 Nov', '8 Nov'],
            opponents: ['Manchester City', 'Newcastle United', 'West Ham United', 'Fulham', 'Crystal Palace', 'Burnley', 'Sunderland'],
            // Attacking
            goals: 2,
            expectedGoals: 0.55,
            scoringFrequency: 469,
            goalsPerGame: 0.2,
            totalShots: 0.8,
            shotsOnTargetPerGame: 0.3,
            bigChancesMissed: 0,
            goalConversion: 22,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '1/6',
            goalsFromOutsideBox: '1/3',
            headedGoals: 1,
            leftFootedGoals: 0,
            rightFootedGoals: 1,
            penaltyWon: 0,
            // Passing
            assists: 1,
            expectedAssists: 1.00,
            touches: 74.4,
            bigChancesCreated: 1,
            keyPasses: 0.8,
            accuratePasses: 56.7,
            accuratePassesPercentage: 89,
            accOwnHalf: 25.2,
            accOwnHalfPercentage: 94,
            accOppositionHalf: 31.6,
            accOppositionHalfPercentage: 85,
            longBallsAccurate: 2.2,
            longBallsPercentage: 56,
            accurateChipPasses: 2.3,
            accurateChipPassesPercentage: 58,
            accurateCrosses: 0.09,
            accurateCrossesPercentage: 33,
            // Defending
            interceptions: 1.1,
            tacklesPerGame: 1.9,
            possessionWonFinalThird: 0.2,
            ballsRecoveredPerGame: 3.1,
            dribbledPastPerGame: 0.7,
            clearancesPerGame: 1.7,
            blockedShotsPerGame: 0.09,
            errorsLeadingToShot: 1,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.2,
            succDribblesPercentage: 50,
            totalDuelsWon: 4.2,
            totalDuelsWonPercentage: 56,
            groundDuelsWon: 2.2,
            groundDuelsWonPercentage: 49,
            aerialDuelsWon: 2.0,
            aerialDuelsWonPercentage: 67,
            possessionLost: 8.8,
            foulsPerGame: 1.3,
            wasFouled: 0.3,
            offsides: 0.0,
            // Cards
            yellowCards: 2,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      },
      transferHistory: [
        {
          date: '6 Jul 2025',
          from: 'Real Sociedad',
          to: 'Arsenal',
          fee: '£70M',
          type: 'Permanent transfer'
        },
        {
          date: '10 Sept 2020',
          from: 'Real Sociedad B U21',
          to: 'Real Sociedad',
          fee: '-',
          type: 'Promotion'
        },
        {
          date: '1 Jul 2018',
          from: 'Real Sociedad C',
          to: 'Real Sociedad B U21',
          fee: '-',
          type: 'Promotion'
        },
        {
          date: '1 Jul 2017',
          from: 'R. Sociedad U19',
          to: 'Real Sociedad C',
          fee: '-',
          type: 'Promotion'
        }
      ]
    },
    { 
      name: 'Declan Rice', 
      position: 'Midfielder', 
      shirtNumber: 41, 
      weeklyWage: 240000, 
      yearlyWage: 12.48,
      age: 26,
      bio: {
        height: '188 cm',
        nationality: 'England',
        dateOfBirth: '1999-01-14',
        preferredFoot: 'Right',
        contractUntil: '30 Jun 2028',
        nationalTeam: 'England',
        nationalTeamDebut: '22 Mar 2019',
        nationalTeamAppearances: 70,
        nationalTeamGoals: 6,
        description: 'Declan Rice is 26 years old (Jan 14, 1999), 188 cm tall and plays for Arsenal. Declan Rice prefers to play with right foot. His jersey number is 41. Declan Rice career statistics, match ratings, heatmap and goals are available for current and previous seasons. Last player match was Sunderland - Arsenal (2 - 2) and Declan Rice received 7.6 rating.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'World Cup Qual. UEFA',
            matches: 6,
            minutes: 379,
            appearances: 6,
            started: 5,
            minutesPerGame: 63,
            totalMinutes: 379,
            teamOfTheWeek: 0,
            matchDates: ['21 Mar', '24 Mar', '7 Jun', '6 Sept', '9 Sept', '14 Oct'],
            opponents: ['Albania', 'Latvia', 'Andorra', 'Andorra', 'Serbia', 'Latvia'],
            // Attacking
            goals: 1,
            scoringFrequency: 379,
            goalsPerGame: 0.2,
            totalShots: 1.5,
            shotsOnTargetPerGame: 0.7,
            bigChancesMissed: 0,
            goalConversion: 11,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '1/5',
            goalsFromOutsideBox: '0/4',
            headedGoals: 1,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 4,
            touches: 61.7,
            bigChancesCreated: 3,
            keyPasses: 2.3,
            accuratePasses: 48.3,
            accuratePassesPercentage: 96,
            accOwnHalf: 11.0,
            accOwnHalfPercentage: 97,
            accOppositionHalf: 39.2,
            accOppositionHalfPercentage: 89,
            longBallsAccurate: 0.8,
            longBallsPercentage: 83,
            accurateChipPasses: 1.3,
            accurateChipPassesPercentage: 80,
            accurateCrosses: 1.8,
            accurateCrossesPercentage: 39,
            // Defending
            interceptions: 1.0,
            tacklesPerGame: 0.7,
            possessionWonFinalThird: 0.7,
            ballsRecoveredPerGame: 2.5,
            dribbledPastPerGame: 0.2,
            clearancesPerGame: 0.2,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.0,
            totalDuelsWon: 1.8,
            totalDuelsWonPercentage: 55,
            groundDuelsWon: 1.0,
            groundDuelsWonPercentage: 55,
            aerialDuelsWon: 0.8,
            aerialDuelsWonPercentage: 56,
            possessionLost: 6.2,
            foulsPerGame: 0.2,
            wasFouled: 0.3,
            offsides: 0.0,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      },
      transferHistory: [
        {
          date: '15 Jul 2023',
          from: 'West Ham United',
          to: 'Arsenal',
          fee: '£116.6M',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jul 2017',
          from: 'West Ham U21',
          to: 'West Ham United',
          fee: '-',
          type: 'Promotion'
        }
      ]
    },
    { 
      name: 'Ethan Nwaneri', 
      position: 'Midfielder', 
      shirtNumber: 22, 
      weeklyWage: 25000, 
      yearlyWage: 1.3,
      age: 18,
      bio: {
        height: '176 cm',
        nationality: 'England',
        dateOfBirth: '2007-03-21',
        preferredFoot: 'Left',
        contractUntil: '30 Jun 2030',
        description: 'Ethan Nwaneri is 18 years old (Mar 21, 2007), 176 cm tall and plays for Arsenal. Ethan Nwaneri prefers to play with left foot. His jersey number is 22. Ethan Nwaneri football player profile displays all matches and competitions with statistics for all the matches Ethan Nwaneri played in. Most important stats for each competition, including average rating, matches played, goals, assists, cards and other relevant data are also displayed.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 5,
            minutes: 173,
            appearances: 5,
            started: 0,
            minutesPerGame: 35,
            totalMinutes: 173,
            teamOfTheWeek: 0,
            matchDates: ['23 Aug', '13 Sept', '21 Sept', '4 Oct', '1 Nov'],
            opponents: ['Leeds United', 'Nottingham Forest', 'Manchester City', 'West Ham United', 'Burnley'],
            // Attacking
            goals: 0,
            expectedGoals: 0.23,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 1.2,
            shotsOnTargetPerGame: 0.0,
            bigChancesMissed: 0,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '0/4',
            goalsFromOutsideBox: '0/2',
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0.08,
            touches: 24.0,
            bigChancesCreated: 0,
            keyPasses: 0.2,
            accuratePasses: 15.6,
            accuratePassesPercentage: 91,
            accOwnHalf: 7.4,
            accOwnHalfPercentage: 95,
            accOppositionHalf: 8.2,
            accOppositionHalfPercentage: 84,
            longBallsAccurate: 1.0,
            longBallsPercentage: 56,
            accurateChipPasses: 0.6,
            accurateChipPassesPercentage: 60,
            accurateCrosses: 0.0,
            accurateCrossesPercentage: 0,
            // Defending
            interceptions: 0.0,
            tacklesPerGame: 0.2,
            possessionWonFinalThird: 0.4,
            ballsRecoveredPerGame: 2.0,
            dribbledPastPerGame: 0.6,
            clearancesPerGame: 0.2,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.6,
            succDribblesPercentage: 38,
            totalDuelsWon: 1.0,
            totalDuelsWonPercentage: 26,
            groundDuelsWon: 0.8,
            groundDuelsWonPercentage: 27,
            aerialDuelsWon: 0.2,
            aerialDuelsWonPercentage: 25,
            possessionLost: 4.0,
            foulsPerGame: 0.4,
            wasFouled: 0.0,
            offsides: 0.0,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'Currently injured'
        }
      },
      transferHistory: [
        {
          date: '1 Jul 2024',
          from: 'Arsenal U21',
          to: 'Arsenal',
          fee: '-',
          type: 'Promotion'
        }
      ]
    },
    { 
      name: 'Max Dowman', 
      position: 'Midfielder', 
      shirtNumber: 56, 
      weeklyWage: 5000, 
      yearlyWage: 0.26,
      bio: {
        height: '183 cm',
        nationality: 'England',
        preferredFoot: 'Left',
        description: 'Max Dowman prefers to play with left foot. His jersey number is 56. Max Dowman football player profile displays all matches and competitions with statistics for all the matches Max Dowman played in. Most important stats for each competition, including average rating, matches played, goals, assists, cards and other relevant data are also displayed.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 2,
            minutes: 36,
            appearances: 2,
            started: 0,
            minutesPerGame: 18,
            totalMinutes: 36,
            teamOfTheWeek: 0,
            matchDates: ['23 Aug', '31 Aug'],
            opponents: ['Leeds United', 'Liverpool'],
            // Attacking
            goals: 0,
            expectedGoals: 0.14,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 1.5,
            shotsOnTargetPerGame: 0.0,
            bigChancesMissed: 0,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '0/2',
            goalsFromOutsideBox: '0/1',
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 1,
            // Passing
            assists: 0,
            expectedAssists: 0.03,
            touches: 11.5,
            bigChancesCreated: 0,
            keyPasses: 0.0,
            accuratePasses: 2.0,
            accuratePassesPercentage: 100,
            accOwnHalf: 0.5,
            accOwnHalfPercentage: 100,
            accOppositionHalf: 1.5,
            accOppositionHalfPercentage: 100,
            longBallsAccurate: 0.0,
            accurateChipPasses: 0.0,
            accurateCrosses: 0.0,
            // Defending
            interceptions: 0.0,
            tacklesPerGame: 1.0,
            possessionWonFinalThird: 0.5,
            ballsRecoveredPerGame: 0.5,
            dribbledPastPerGame: 0.5,
            clearancesPerGame: 0.0,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.5,
            succDribblesPercentage: 17,
            totalDuelsWon: 2.5,
            totalDuelsWonPercentage: 38,
            groundDuelsWon: 2.5,
            groundDuelsWonPercentage: 38,
            aerialDuelsWon: 0.0,
            possessionLost: 4.0,
            foulsPerGame: 0.0,
            wasFouled: 1.0,
            offsides: 0.0,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      },
      transferHistory: [
        {
          date: '1 Jul 2025',
          from: 'Arsenal U18',
          to: 'Arsenal',
          fee: '-',
          type: 'Promotion'
        }
      ]
    },
    
    // Forwards
    { 
      name: 'Gabriel Jesus', 
      position: 'Forward', 
      shirtNumber: 9, 
      weeklyWage: 265000, 
      yearlyWage: 13.78,
      age: 28,
      bio: {
        height: '175 cm',
        nationality: 'Brazil',
        dateOfBirth: '1997-04-03',
        preferredFoot: 'Right',
        contractUntil: '30 Jun 2027',
        nationalTeam: 'Brazil',
        nationalTeamDebut: '1 Sept 2016',
        nationalTeamAppearances: 64,
        nationalTeamGoals: 19,
        description: 'Gabriel Jesus is 28 years old (Apr 3, 1997), 175 cm tall and plays for Arsenal. Gabriel Jesus prefers to play with right foot. His jersey number is 9. Arsenal is playing their next match on Nov 23, 2025, 4:30:00 PM UTC against Arsenal - Tottenham Hotspur in Premier League. Gabriel Jesus football player profile displays all matches and competitions with statistics for all the matches Gabriel Jesus played in. Most important stats for each competition, including average rating, matches played, goals, assists, cards and other relevant data are also displayed.'
      },
      seasonStats: {
        season: '2024-25',
        competitions: [
          {
            competition: 'Premier League',
            matches: 17,
            minutes: 627,
            appearances: 17,
            started: 6,
            minutesPerGame: 37,
            totalMinutes: 627,
            teamOfTheWeek: 0,
            matchDates: ['30 Nov', '8 Dec', '14 Dec', '21 Dec', '27 Dec', '1 Jan', '4 Jan'],
            opponents: ['West Ham United', 'Fulham', 'Everton', 'Crystal Palace', 'Ipswich Town', 'Brentford', 'Brighton & Hove Albion'],
            // Attacking
            goals: 3,
            expectedGoals: 2.99,
            scoringFrequency: 209,
            goalsPerGame: 0.2,
            totalShots: 1.2,
            shotsOnTargetPerGame: 0.5,
            bigChancesMissed: 3,
            goalConversion: 15,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '3/18',
            goalsFromOutsideBox: '0/2',
            headedGoals: 1,
            leftFootedGoals: 0,
            rightFootedGoals: 2,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0.52,
            touches: 19.3,
            bigChancesCreated: 1,
            keyPasses: 0.5,
            accuratePasses: 8.9,
            accuratePassesPercentage: 80,
            accOwnHalf: 2.6,
            accOwnHalfPercentage: 85,
            accOppositionHalf: 6.4,
            accOppositionHalfPercentage: 75,
            longBallsAccurate: 0.1,
            longBallsPercentage: 50,
            accurateChipPasses: 0.2,
            accurateChipPassesPercentage: 38,
            accurateCrosses: 0.06,
            accurateCrossesPercentage: 14,
            // Defending
            interceptions: 0.2,
            tacklesPerGame: 0.6,
            possessionWonFinalThird: 0.4,
            ballsRecoveredPerGame: 1.6,
            dribbledPastPerGame: 0.3,
            clearancesPerGame: 0.4,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.5,
            succDribblesPercentage: 47,
            totalDuelsWon: 2.2,
            totalDuelsWonPercentage: 39,
            groundDuelsWon: 1.7,
            groundDuelsWonPercentage: 42,
            aerialDuelsWon: 0.5,
            aerialDuelsWonPercentage: 32,
            possessionLost: 5.0,
            foulsPerGame: 0.8,
            wasFouled: 0.6,
            offsides: 0.5,
            // Cards
            yellowCards: 4,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'Currently injured'
        }
      },
      transferHistory: [
        {
          date: '4 Jul 2022',
          from: 'Manchester City',
          to: 'Arsenal',
          fee: '£52M',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jan 2017',
          from: 'Palmeiras',
          to: 'Manchester City',
          fee: '£32M',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jan 2015',
          from: 'Palmeiras U17',
          to: 'Palmeiras',
          fee: '-',
          type: 'Promotion'
        }
      ]
    },
    { 
      name: 'Viktor Gyökeres', 
      position: 'Forward', 
      shirtNumber: 14, 
      weeklyWage: 200000, 
      yearlyWage: 10.4,
      age: 27,
      bio: {
        height: '187 cm',
        nationality: 'Sweden',
        dateOfBirth: '1998-06-04',
        preferredFoot: 'Right',
        contractUntil: '30 Jun 2030',
        nationalTeam: 'Sweden',
        nationalTeamDebut: '8 Jan 2019',
        nationalTeamAppearances: 30,
        nationalTeamGoals: 15,
        description: 'Viktor Gyökeres is 27 years old (Jun 4, 1998), 187 cm tall and plays for Arsenal. Viktor Gyökeres prefers to play with right foot. His jersey number is 14. Viktor Gyökeres football player profile displays all matches and competitions with statistics for all the matches Viktor Gyökeres played in. Most important stats for each competition, including average rating, matches played, goals, assists, cards and other relevant data are also displayed.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 10,
            minutes: 802,
            appearances: 10,
            started: 10,
            minutesPerGame: 80,
            totalMinutes: 802,
            teamOfTheWeek: 1,
            matchDates: ['13 Sept', '21 Sept', '28 Sept', '4 Oct', '18 Oct', '26 Oct', '1 Nov'],
            opponents: ['Nottingham Forest', 'Manchester City', 'Newcastle United', 'West Ham United', 'Fulham', 'Crystal Palace', 'Burnley'],
            // Attacking
            goals: 4,
            expectedGoals: 4.56,
            scoringFrequency: 201,
            goalsPerGame: 0.4,
            totalShots: 2.0,
            shotsOnTargetPerGame: 0.8,
            bigChancesMissed: 5,
            goalConversion: 20,
            penaltyGoals: 1,
            penaltyConversion: 100,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '4/20',
            goalsFromOutsideBox: '0',
            headedGoals: 1,
            leftFootedGoals: 0,
            rightFootedGoals: 3,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0.66,
            touches: 23.3,
            bigChancesCreated: 2,
            keyPasses: 0.8,
            accuratePasses: 6.6,
            accuratePassesPercentage: 61,
            accOwnHalf: 1.3,
            accOwnHalfPercentage: 76,
            accOppositionHalf: 5.5,
            accOppositionHalfPercentage: 59,
            longBallsAccurate: 0.1,
            longBallsPercentage: 50,
            accurateChipPasses: 0.2,
            accurateChipPassesPercentage: 50,
            accurateCrosses: 0.2,
            accurateCrossesPercentage: 67,
            // Defending
            interceptions: 0.0,
            tacklesPerGame: 0.2,
            possessionWonFinalThird: 0.5,
            ballsRecoveredPerGame: 2.0,
            dribbledPastPerGame: 0.2,
            clearancesPerGame: 0.7,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.4,
            succDribblesPercentage: 29,
            totalDuelsWon: 3.3,
            totalDuelsWonPercentage: 37,
            groundDuelsWon: 1.6,
            groundDuelsWonPercentage: 36,
            aerialDuelsWon: 1.7,
            aerialDuelsWonPercentage: 39,
            possessionLost: 9.6,
            foulsPerGame: 0.9,
            wasFouled: 1.1,
            offsides: 0.2,
            // Cards
            yellowCards: 1,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'Currently injured'
        }
      },
      transferHistory: [
        {
          date: '26 Jul 2025',
          from: 'Sporting CP',
          to: 'Arsenal',
          fee: '£65.8M',
          type: 'Permanent transfer'
        },
        {
          date: '13 Jul 2023',
          from: 'Coventry City',
          to: 'Sporting CP',
          fee: '£20M',
          type: 'Permanent transfer'
        },
        {
          date: '9 Jul 2021',
          from: 'Brighton & Hove Albion',
          to: 'Coventry City',
          fee: 'Unknown',
          type: 'Permanent transfer'
        },
        {
          date: '31 May 2021',
          from: 'Coventry City',
          to: 'Brighton & Hove Albion',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '15 Jan 2021',
          from: 'Brighton & Hove Albion',
          to: 'Coventry City',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '14 Jan 2021',
          from: 'Swansea City',
          to: 'Brighton & Hove Albion',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '2 Oct 2020',
          from: 'Brighton & Hove Albion',
          to: 'Swansea City',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '30 Jun 2020',
          from: 'FC St. Pauli',
          to: 'Brighton & Hove Albion',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '25 Jul 2019',
          from: 'Brighton & Hove Albion',
          to: 'FC St. Pauli',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '1 Jan 2018',
          from: 'IF Brommapojkarna',
          to: 'Brighton & Hove Albion',
          fee: '£1M',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jan 2016',
          from: 'IF Brommapojkarna U19',
          to: 'IF Brommapojkarna',
          fee: '-',
          type: 'Promotion'
        }
      ]
    },
    { 
      name: 'Leandro Trossard', 
      position: 'Forward', 
      shirtNumber: 19, 
      weeklyWage: 90000, 
      yearlyWage: 4.68,
      age: 30,
      bio: {
        height: '172 cm',
        nationality: 'Belgium',
        dateOfBirth: '1994-12-04',
        preferredFoot: 'Right',
        contractUntil: '30 Jun 2027',
        nationalTeam: 'Belgium',
        nationalTeamDebut: '5 Sept 2020',
        nationalTeamAppearances: 48,
        nationalTeamGoals: 11,
        description: 'Leandro Trossard is 30 years old (Dec 4, 1994), 172 cm tall and plays for Arsenal. Leandro Trossard prefers to play with right foot. His jersey number is 19. Leandro Trossard career statistics, match ratings, heatmap and goals are available for current and previous seasons. Last player match was Sunderland - Arsenal (2 - 2) and Leandro Trossard received 7.4 rating. Leandro Trossard football player profile displays all matches and competitions with statistics for all the matches Leandro Trossard played in. Most important stats for each competition, including average rating, matches played, goals, assists, cards and other relevant data are also displayed.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 9,
            minutes: 645,
            appearances: 9,
            started: 7,
            minutesPerGame: 72,
            totalMinutes: 645,
            teamOfTheWeek: 0,
            matchDates: ['21 Sept', '28 Sept', '4 Oct', '18 Oct', '26 Oct', '1 Nov', '8 Nov'],
            opponents: ['Manchester City', 'Newcastle United', 'West Ham United', 'Fulham', 'Crystal Palace', 'Burnley', 'Sunderland'],
            // Attacking
            goals: 2,
            expectedGoals: 1.76,
            scoringFrequency: 323,
            goalsPerGame: 0.2,
            totalShots: 1.7,
            shotsOnTargetPerGame: 0.6,
            bigChancesMissed: 2,
            goalConversion: 13,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '1/13',
            goalsFromOutsideBox: '1/2',
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 2,
            penaltyWon: 0,
            // Passing
            assists: 2,
            expectedAssists: 1.13,
            touches: 41.9,
            bigChancesCreated: 1,
            keyPasses: 1.0,
            accuratePasses: 21.1,
            accuratePassesPercentage: 76,
            accOwnHalf: 5.0,
            accOwnHalfPercentage: 87,
            accOppositionHalf: 16.3,
            accOppositionHalfPercentage: 67,
            longBallsAccurate: 1.4,
            longBallsPercentage: 46,
            accurateChipPasses: 1.4,
            accurateChipPassesPercentage: 45,
            accurateCrosses: 0.7,
            accurateCrossesPercentage: 22,
            // Defending
            interceptions: 0.4,
            tacklesPerGame: 0.4,
            possessionWonFinalThird: 0.2,
            ballsRecoveredPerGame: 2.3,
            dribbledPastPerGame: 0.4,
            clearancesPerGame: 0.2,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.8,
            succDribblesPercentage: 47,
            totalDuelsWon: 2.3,
            totalDuelsWonPercentage: 42,
            groundDuelsWon: 2.1,
            groundDuelsWonPercentage: 41,
            aerialDuelsWon: 0.2,
            aerialDuelsWonPercentage: 50,
            possessionLost: 13.1,
            foulsPerGame: 0.4,
            wasFouled: 0.9,
            offsides: 0.2,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ]
      },
      transferHistory: [
        {
          date: '20 Jan 2023',
          from: 'Brighton & Hove Albion',
          to: 'Arsenal',
          fee: '£24M',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jul 2019',
          from: 'KRC Genk',
          to: 'Brighton & Hove Albion',
          fee: '£20M',
          type: 'Permanent transfer'
        },
        {
          date: '30 Jun 2016',
          from: 'Oud-Heverlee Leuven',
          to: 'KRC Genk',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '6 Jul 2015',
          from: 'KRC Genk',
          to: 'Oud-Heverlee Leuven',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '30 Jun 2015',
          from: 'Lommel SK',
          to: 'KRC Genk',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '1 Jul 2014',
          from: 'KRC Genk',
          to: 'Lommel SK',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '30 Jun 2014',
          from: 'KVC Westerlo',
          to: 'KRC Genk',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '1 Jul 2013',
          from: 'KRC Genk',
          to: 'KVC Westerlo',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '30 Jun 2013',
          from: 'Lommel SK',
          to: 'KRC Genk',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '29 Jan 2013',
          from: 'KRC Genk',
          to: 'Lommel SK',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '1 Jul 2012',
          from: 'KRC Genk U19',
          to: 'KRC Genk',
          fee: '-',
          type: 'Promotion'
        }
      ]
    },
    { 
      name: 'Kai Havertz', 
      position: 'Forward', 
      shirtNumber: 29, 
      weeklyWage: 280000, 
      yearlyWage: 14.56,
      age: 26,
      bio: {
        height: '193 cm',
        nationality: 'Germany',
        dateOfBirth: '1999-06-11',
        preferredFoot: 'Left',
        contractUntil: '30 Jun 2028',
        nationalTeam: 'Germany',
        nationalTeamDebut: '9 Sept 2018',
        nationalTeamAppearances: 55,
        nationalTeamGoals: 20,
        description: 'Kai Havertz is 26 years old (Jun 11, 1999), 193 cm tall and plays for Arsenal. Kai Havertz prefers to play with left foot. His jersey number is 29. Arsenal is playing their next match on Nov 23, 2025, 4:30:00 PM UTC against Arsenal - Tottenham Hotspur in Premier League. Kai Havertz football player profile displays all matches and competitions with statistics for all the matches Kai Havertz played in. Most important stats for each competition, including average rating, matches played, goals, assists, cards and other relevant data are also displayed.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 1,
            minutes: 30,
            appearances: 1,
            started: 0,
            minutesPerGame: 30,
            totalMinutes: 30,
            teamOfTheWeek: 0,
            matchDates: ['17 Aug'],
            opponents: ['Manchester United'],
            // Attacking
            goals: 0,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 0.0,
            shotsOnTargetPerGame: 0.0,
            bigChancesMissed: 0,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '0',
            goalsFromOutsideBox: '0',
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0.01,
            touches: 19.0,
            bigChancesCreated: 0,
            keyPasses: 0.0,
            accuratePasses: 5.0,
            accuratePassesPercentage: 56,
            accOwnHalf: 1.0,
            accOwnHalfPercentage: 100,
            accOppositionHalf: 4.0,
            accOppositionHalfPercentage: 50,
            longBallsAccurate: 0.0,
            accurateChipPasses: 1.0,
            accurateChipPassesPercentage: 100,
            accurateCrosses: 0.0,
            // Defending
            interceptions: 0.0,
            tacklesPerGame: 0.0,
            possessionWonFinalThird: 1.0,
            ballsRecoveredPerGame: 2.0,
            dribbledPastPerGame: 1.0,
            clearancesPerGame: 1.0,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 1.0,
            succDribblesPercentage: 50,
            totalDuelsWon: 5.0,
            totalDuelsWonPercentage: 50,
            groundDuelsWon: 3.0,
            groundDuelsWonPercentage: 50,
            aerialDuelsWon: 2.0,
            aerialDuelsWonPercentage: 50,
            possessionLost: 7.0,
            foulsPerGame: 0.0,
            wasFouled: 2.0,
            offsides: 0.0,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'Currently injured'
        }
      },
      transferHistory: [
        {
          date: '1 Jul 2023',
          from: 'Chelsea',
          to: 'Arsenal',
          fee: '£75M',
          type: 'Permanent transfer'
        },
        {
          date: '4 Sept 2020',
          from: 'Bayer 04 Leverkusen',
          to: 'Chelsea',
          fee: '£80M',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jul 2016',
          from: 'Leverkusen U17',
          to: 'Bayer 04 Leverkusen',
          fee: '-',
          type: 'Promotion'
        }
      ]
    },
    { 
      name: 'Noni Madueke', 
      position: 'Midfielder', 
      shirtNumber: 20, 
      weeklyWage: 65000, 
      yearlyWage: 3.38,
      age: 23,
      bio: {
        height: '182 cm',
        nationality: 'England',
        dateOfBirth: '2002-03-10',
        preferredFoot: 'Left',
        contractUntil: '30 Jun 2030',
        nationalTeam: 'England',
        nationalTeamDebut: '10 Sept 2024',
        nationalTeamAppearances: 9,
        nationalTeamGoals: 1,
        description: 'Noni Madueke is 23 years old (Mar 10, 2002), 182 cm tall and plays for Arsenal. Noni Madueke prefers to play with left foot. His jersey number is 20. Arsenal is playing their next match on Nov 23, 2025, 4:30:00 PM UTC against Arsenal - Tottenham Hotspur in Premier League. Noni Madueke football player profile displays all matches and competitions with statistics for all the matches Noni Madueke played in. Most important stats for each competition, including average rating, matches played, goals, assists, cards and other relevant data are also displayed.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 5,
            minutes: 306,
            appearances: 5,
            started: 4,
            minutesPerGame: 61,
            totalMinutes: 306,
            teamOfTheWeek: 1,
            matchDates: ['17 Aug', '23 Aug', '31 Aug', '13 Sept', '21 Sept'],
            opponents: ['Manchester United', 'Leeds United', 'Liverpool', 'Nottingham Forest', 'Manchester City'],
            // Attacking
            goals: 0,
            expectedGoals: 0.29,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 1.0,
            shotsOnTargetPerGame: 0.4,
            bigChancesMissed: 1,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '0/5',
            goalsFromOutsideBox: '0',
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0.85,
            touches: 34.4,
            bigChancesCreated: 1,
            keyPasses: 1.6,
            accuratePasses: 13.4,
            accuratePassesPercentage: 71,
            accOwnHalf: 4.2,
            accOwnHalfPercentage: 84,
            accOppositionHalf: 10.2,
            accOppositionHalfPercentage: 54,
            longBallsAccurate: 0.6,
            longBallsPercentage: 60,
            accurateChipPasses: 0.8,
            accurateChipPassesPercentage: 80,
            accurateCrosses: 1.0,
            accurateCrossesPercentage: 19,
            // Defending
            interceptions: 0.2,
            tacklesPerGame: 0.6,
            possessionWonFinalThird: 1.2,
            ballsRecoveredPerGame: 2.0,
            dribbledPastPerGame: 1.2,
            clearancesPerGame: 0.0,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 1.4,
            succDribblesPercentage: 50,
            totalDuelsWon: 3.4,
            totalDuelsWonPercentage: 41,
            groundDuelsWon: 2.8,
            groundDuelsWonPercentage: 39,
            aerialDuelsWon: 0.6,
            aerialDuelsWonPercentage: 60,
            possessionLost: 14.2,
            foulsPerGame: 1.0,
            wasFouled: 0.8,
            offsides: 0.0,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'Currently injured'
        }
      },
      transferHistory: [
        {
          date: '18 Jul 2025',
          from: 'Chelsea',
          to: 'Arsenal',
          fee: '£55.4M',
          type: 'Permanent transfer'
        },
        {
          date: '20 Jan 2023',
          from: 'PSV Eindhoven',
          to: 'Chelsea',
          fee: '£35M',
          type: 'Permanent transfer'
        },
        {
          date: '1 Aug 2020',
          from: 'Jong PSV Eindhoven',
          to: 'PSV Eindhoven',
          fee: '-',
          type: 'Promotion'
        },
        {
          date: '26 Aug 2019',
          from: 'PSV U19',
          to: 'Jong PSV Eindhoven',
          fee: '-',
          type: 'Promotion'
        }
      ]
    },
    { 
      name: 'Eberechi Eze', 
      position: 'Forward', 
      shirtNumber: 10, 
      weeklyWage: 90000, 
      yearlyWage: 4.68,
      age: 27,
      bio: {
        height: '178 cm',
        nationality: 'England',
        dateOfBirth: '1998-06-29',
        preferredFoot: 'Right',
        contractUntil: '30 Jun 2029',
        nationalTeam: 'England',
        nationalTeamDebut: '16 Jun 2023',
        nationalTeamAppearances: 14,
        nationalTeamGoals: 2,
        description: 'Eberechi Eze is 27 years old (Jun 29, 1998), 178 cm tall and plays for Arsenal. Eberechi Eze prefers to play with right foot. His jersey number is 10. Eberechi Eze career statistics, match ratings, heatmap and goals are available for current and previous seasons. Last player match was Sunderland - Arsenal (2 - 2) and Eberechi Eze received 6.7 rating. Eberechi Eze football player profile displays all matches and competitions with statistics for all the matches Eberechi Eze played in. Most important stats for each competition, including average rating, matches played, goals, assists, cards and other relevant data are also displayed.'
      },
      seasonStats: {
        season: '2026',
        competitions: [
          {
            competition: 'World Cup Qual. UEFA',
            matches: 4,
            minutes: 163,
            appearances: 4,
            started: 1,
            minutesPerGame: 41,
            totalMinutes: 163,
            teamOfTheWeek: 0,
            matchDates: ['24 Mar', '7 Jun', '6 Sept', '14 Oct'],
            opponents: ['Latvia', 'Andorra', 'Andorra', 'Latvia'],
            // Attacking
            goals: 2,
            scoringFrequency: 82,
            goalsPerGame: 0.5,
            totalShots: 2.3,
            shotsOnTargetPerGame: 1.8,
            bigChancesMissed: 1,
            goalConversion: 22,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '2/5',
            goalsFromOutsideBox: '0/4',
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 2,
            penaltyWon: 0,
            // Passing
            assists: 0,
            touches: 28.5,
            bigChancesCreated: 1,
            keyPasses: 1.3,
            accuratePasses: 16.5,
            accuratePassesPercentage: 93,
            accOwnHalf: 3.3,
            accOwnHalfPercentage: 100,
            accOppositionHalf: 14.5,
            accOppositionHalfPercentage: 88,
            longBallsAccurate: 0.0,
            accurateChipPasses: 0.3,
            accurateChipPassesPercentage: 100,
            accurateCrosses: 1.3,
            accurateCrossesPercentage: 63,
            // Defending
            interceptions: 0.3,
            tacklesPerGame: 0.8,
            possessionWonFinalThird: 0.3,
            ballsRecoveredPerGame: 1.0,
            dribbledPastPerGame: 0.0,
            clearancesPerGame: 0.0,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.5,
            succDribblesPercentage: 33,
            totalDuelsWon: 2.8,
            totalDuelsWonPercentage: 55,
            groundDuelsWon: 2.0,
            groundDuelsWonPercentage: 50,
            aerialDuelsWon: 0.8,
            aerialDuelsWonPercentage: 75,
            possessionLost: 4.0,
            foulsPerGame: 0.5,
            wasFouled: 0.8,
            offsides: 0.3,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'Currently injured'
        }
      },
      transferHistory: [
        {
          date: '23 Aug 2025',
          from: 'Crystal Palace',
          to: 'Arsenal',
          fee: '£69.3M',
          type: 'Permanent transfer'
        },
        {
          date: '28 Aug 2020',
          from: 'Queens Park Rangers',
          to: 'Crystal Palace',
          fee: '£17.8M',
          type: 'Permanent transfer'
        },
        {
          date: '2 Jan 2018',
          from: 'Wycombe Wanderers',
          to: 'Queens Park Rangers',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '30 Aug 2017',
          from: 'Queens Park Rangers',
          to: 'Wycombe Wanderers',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '1 Jul 2017',
          from: 'Queens Park Rangers U21',
          to: 'Queens Park Rangers',
          fee: '-',
          type: 'Promotion'
        }
      ]
    },
    { 
      name: 'Gabriel Martinelli', 
      position: 'Forward', 
      shirtNumber: 11, 
      weeklyWage: 180000, 
      yearlyWage: 9.36,
      age: 24,
      bio: {
        height: '180 cm',
        nationality: 'Brazil',
        dateOfBirth: '2001-06-18',
        preferredFoot: 'Right',
        contractUntil: '30 Jun 2027',
        nationalTeam: 'Brazil',
        nationalTeamDebut: '25 Mar 2022',
        nationalTeamAppearances: 20,
        nationalTeamGoals: 3,
        description: 'Gabriel Martinelli is 24 years old (Jun 18, 2001), 180 cm tall and plays for Arsenal. Gabriel Martinelli prefers to play with right foot. His jersey number is 11. Gabriel Martinelli football player profile displays all matches and competitions with statistics for all the matches Gabriel Martinelli played in. Most important stats for each competition, including average rating, matches played, goals, assists, cards and other relevant data are also displayed.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 8,
            minutes: 216,
            appearances: 8,
            started: 2,
            minutesPerGame: 27,
            totalMinutes: 216,
            teamOfTheWeek: 0,
            matchDates: ['31 Aug', '13 Sept', '21 Sept', '28 Sept', '4 Oct', '18 Oct', '26 Oct'],
            opponents: ['Liverpool', 'Nottingham Forest', 'Manchester City', 'Newcastle United', 'West Ham United', 'Fulham', 'Crystal Palace'],
            // Attacking
            goals: 1,
            expectedGoals: 0.78,
            scoringFrequency: 216,
            goalsPerGame: 0.1,
            totalShots: 0.6,
            shotsOnTargetPerGame: 0.4,
            bigChancesMissed: 1,
            goalConversion: 20,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '1/4',
            goalsFromOutsideBox: '0/1',
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 1,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0.08,
            touches: 9.9,
            bigChancesCreated: 0,
            keyPasses: 0.3,
            accuratePasses: 2.6,
            accuratePassesPercentage: 66,
            accOwnHalf: 1.0,
            accOwnHalfPercentage: 80,
            accOppositionHalf: 1.9,
            accOppositionHalfPercentage: 54,
            longBallsAccurate: 0.0,
            longBallsPercentage: 0,
            accurateChipPasses: 0.1,
            accurateChipPassesPercentage: 33,
            accurateCrosses: 0.3,
            accurateCrossesPercentage: 33,
            // Defending
            interceptions: 0.0,
            tacklesPerGame: 0.4,
            possessionWonFinalThird: 0.1,
            ballsRecoveredPerGame: 1.3,
            dribbledPastPerGame: 0.1,
            clearancesPerGame: 0.4,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.1,
            succDribblesPercentage: 33,
            totalDuelsWon: 1.0,
            totalDuelsWonPercentage: 53,
            groundDuelsWon: 0.8,
            groundDuelsWonPercentage: 50,
            aerialDuelsWon: 0.3,
            aerialDuelsWonPercentage: 67,
            possessionLost: 4.1,
            foulsPerGame: 0.1,
            wasFouled: 0.4,
            offsides: 0.0,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'Currently injured'
        }
      },
      transferHistory: [
        {
          date: '2 Jul 2019',
          from: 'Ituano',
          to: 'Arsenal',
          fee: '£6.7M',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jan 2018',
          from: 'Ituano U20',
          to: 'Ituano',
          fee: '-',
          type: 'Promotion'
        }
      ]
    },
    { 
      name: 'Bukayo Saka', 
      position: 'Forward', 
      shirtNumber: 7, 
      weeklyWage: 195000, 
      yearlyWage: 10.14,
      age: 24,
      bio: {
        height: '178 cm',
        nationality: 'England',
        dateOfBirth: '2001-09-05',
        preferredFoot: 'Left',
        contractUntil: '30 Jun 2027',
        nationalTeam: 'England',
        nationalTeamDebut: '8 Oct 2020',
        nationalTeamAppearances: 46,
        nationalTeamGoals: 13,
        description: 'Bukayo Saka is 24 years old (Sep 5, 2001), 178 cm tall and plays for Arsenal. Bukayo Saka prefers to play with left foot. His jersey number is 7. Bukayo Saka career statistics, match ratings, heatmap and goals are available for current and previous seasons. Last player match was Sunderland - Arsenal (2 - 2) and Bukayo Saka received 7.8 rating. Bukayo Saka football player profile displays all matches and competitions with statistics for all the matches Bukayo Saka played in. Most important stats for each competition, including average rating, matches played, goals, assists, cards and other relevant data are also displayed.'
      },
      seasonStats: {
        season: '2026',
        competitions: [
          {
            competition: 'World Cup Qual. UEFA',
            matches: 1,
            minutes: 60,
            appearances: 1,
            started: 1,
            minutesPerGame: 60,
            totalMinutes: 60,
            teamOfTheWeek: 0,
            matchDates: ['14 Oct'],
            opponents: ['Latvia'],
            // Attacking
            goals: 0,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 2.0,
            shotsOnTargetPerGame: 0.0,
            bigChancesMissed: 0,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '0/1',
            goalsFromOutsideBox: '0/1',
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 1,
            touches: 66.0,
            bigChancesCreated: 0,
            keyPasses: 2.0,
            accuratePasses: 43.0,
            accuratePassesPercentage: 88,
            accOwnHalf: 1.0,
            accOwnHalfPercentage: 100,
            accOppositionHalf: 42.0,
            accOppositionHalfPercentage: 82,
            longBallsAccurate: 0.0,
            accurateChipPasses: 2.0,
            accurateChipPassesPercentage: 100,
            accurateCrosses: 0.0,
            accurateCrossesPercentage: 0,
            // Defending
            interceptions: 0.0,
            tacklesPerGame: 1.0,
            possessionWonFinalThird: 1.0,
            ballsRecoveredPerGame: 2.0,
            dribbledPastPerGame: 0.0,
            clearancesPerGame: 2.0,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 2.0,
            succDribblesPercentage: 100,
            totalDuelsWon: 4.0,
            totalDuelsWonPercentage: 80,
            groundDuelsWon: 4.0,
            groundDuelsWonPercentage: 80,
            aerialDuelsWon: 0.0,
            aerialDuelsWonPercentage: 0,
            possessionLost: 10.0,
            foulsPerGame: 0.0,
            wasFouled: 1.0,
            offsides: 1.0,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'Currently injured'
        }
      },
      transferHistory: [
        {
          date: '1 Jul 2019',
          from: 'Arsenal U21',
          to: 'Arsenal',
          fee: '-',
          type: 'Promotion'
        }
      ]
    }
  ].map(player => ({
    ...player,
    imageUrl: `/player-images/arsenal/${sanitizePlayerImageName(player.name)}.png`
  })),
  'Aston Villa': [
    { name: 'Boubacar Kamara', position: 'Midfielder', weeklyWage: 150000, yearlyWage: 7.8 },
    { name: 'Youri Tielemans', position: 'Midfielder', weeklyWage: 150000, yearlyWage: 7.8 },
    { name: 'Emiliano Martínez', position: 'Goalkeeper', weeklyWage: 150000, yearlyWage: 7.8 },
    { name: 'Donyell Malen', position: 'Forward', weeklyWage: 140000, yearlyWage: 7.28 },
    { name: 'Amadou Onana', position: 'Midfielder', weeklyWage: 140000, yearlyWage: 7.28 },
    { name: 'Ollie Watkins', position: 'Forward', weeklyWage: 130000, yearlyWage: 6.76 },
    { name: 'Philippe Coutinho', position: 'Midfielder', weeklyWage: 125000, yearlyWage: 6.5 },
    { name: 'Lucas Digne', position: 'Defender', weeklyWage: 120000, yearlyWage: 6.24 },
    { name: 'John McGinn', position: 'Midfielder', weeklyWage: 120000, yearlyWage: 6.24 },
    { name: 'Tyrone Mings', position: 'Defender', weeklyWage: 100000, yearlyWage: 5.2 },
    { name: 'Ian Maatsen', position: 'Defender', weeklyWage: 100000, yearlyWage: 5.2 },
    { name: 'Pau Torres', position: 'Defender', weeklyWage: 95000, yearlyWage: 4.94 },
    { name: 'Ezri Konsa', position: 'Defender', weeklyWage: 90000, yearlyWage: 4.68 },
    { name: 'Matty Cash', position: 'Defender', weeklyWage: 85000, yearlyWage: 4.42 },
    { name: 'Samuel Iling-Junior', position: 'Midfielder', weeklyWage: 80000, yearlyWage: 4.16 },
    { name: 'Morgan Rogers', position: 'Forward', weeklyWage: 75000, yearlyWage: 3.9 },
    { name: 'Evann Guessand', position: 'Forward', weeklyWage: 70000, yearlyWage: 3.64 },
    { name: 'Ross Barkley', position: 'Midfielder', weeklyWage: 65000, yearlyWage: 3.38 },
    { name: 'Marco Bizot', position: 'Goalkeeper', weeklyWage: 60000, yearlyWage: 3.12 },
    { name: 'Andres Garcia', position: 'Defender', weeklyWage: 55000, yearlyWage: 2.86 },
    { name: 'Lino Sousa', position: 'Defender', weeklyWage: 50000, yearlyWage: 2.6 },
    { name: 'Lamare Bogarde', position: 'Midfielder', weeklyWage: 45000, yearlyWage: 2.34 },
    { name: 'Travis Patterson', position: 'Midfielder', weeklyWage: 40000, yearlyWage: 2.08 },
    { name: 'James Wright', position: 'Midfielder', weeklyWage: 35000, yearlyWage: 1.82 },
    { name: 'Jamaldeen Jimoh', position: 'Midfielder', weeklyWage: 30000, yearlyWage: 1.56 },
    { name: 'Bradley Burrowes', position: 'Midfielder', weeklyWage: 25000, yearlyWage: 1.3 },
    { name: 'George Hemmings', position: 'Forward', weeklyWage: 20000, yearlyWage: 1.04 },
    { name: 'Sam Proctor', position: 'Midfielder', weeklyWage: 15000, yearlyWage: 0.78 },
    { name: 'Triston Rowe', position: 'Midfielder', weeklyWage: 10000, yearlyWage: 0.52 }
  ].map(player => ({
    ...player,
    imageUrl: `/player-images/aston-villa/${sanitizePlayerImageName(player.name)}.png`
  })),
  'Chelsea': createImageOnlySquad('chelsea', [
    'Robert Sánchez',
    'Gabriel Slonina',
    'Axel Disasi',
    'Josh Acheampong',
    'Malo Gusto',
    'Marc Cucurella',
    'Reece James',
    'Tosin Adarabioyo',
    'Benoît Badiashile',
    'Jorrel Hato',
    'Levi Colwill',
    'Trevoh Chalobah',
    'Wesley Fofana',
    'Andrey Santos',
    'Cole Palmer',
    'Roméo Lavia',
    'Facundo Buonanotte',
    'Filip Jørgensen',
    'Dário Essugo',
    'Enzo Fernández',
    'Moisés Caicedo',
    'Alejandro Garnacho',
    'Estêvão Willian',
    'Marc Guiu',
    'Tyrique George',
    'Jamie Gittens',
    'Mykhaylo Mudryk',
    'Raheem Sterling',
    'Pedro Neto',
    'João Pedro',
    'Liam Delap'
  ]),
  'Liverpool': createImageOnlySquad('liverpool', [
    'Ármin Pécsi',
    'Kornel Misciur',
    'Giorgi Mamardashvili',
    'Alisson',
    'Freddie Woodman',
    'Andrew Robertson',
    'Giovanni Leoni',
    'Jeremie Frimpong',
    'Joe Gomez',
    'Milos Kerkez',
    'Ibrahima Konaté',
    'Rhys Williams',
    'Virgil van Dijk',
    'Conor Bradley',
    'Curtis Jones',
    'Stefan Bajcetic',
    'Trey Nyoni',
    'Wataru Endo',
    'Dominik Szoboszlai',
    'Ryan Gravenberch',
    'Alexis Mac Allister',
    'Florian Wirtz',
    'Hugo Ekitiké',
    'Rio Ngumoha',
    'Alexander Isak',
    'Mohamed Salah',
    'Cody Gakpo',
    'Federico Chiesa'
  ]),
  'Manchester City': createImageOnlySquad('man-city', [
    'Gianluigi Donnarumma',
    'Stefan Ortega',
    'James Trafford',
    'Marcus Bettinelli',
    'Matheus Nunes',
    'Nico O\'Reilly',
    'Rayan Aït-Nouri',
    'Rico Lewis',
    'Abdukodir Khusanov',
    'John Stones',
    'Josko Gvardiol',
    'Nathan Aké',
    'Rúben Dias',
    'Nico González',
    'Kalvin Phillips',
    'Tijjani Reijnders',
    'Bernardo Silva',
    'Mateo Kovacic',
    'Rodri',
    'Oscar Bobb',
    'Erling Haaland',
    'Omar Marmoush',
    'Phil Foden',
    'Jérémy Doku',
    'Savinho',
    'Rayan Cherki'
  ]),
  'Manchester United': createImageOnlySquad('man-utd', [
    'Altay Bayındır',
    'Senne Lammens',
    'Tom Heaton',
    'Diogo Dalot',
    'Leny Yoro',
    'Luke Shaw',
    'Noussair Mazraoui',
    'Tyler Fredricson',
    'Patrick Dorgu',
    'Tyrell Malacia',
    'Ayden Heaven',
    'Harry Maguire',
    'Lisandro Martínez',
    'Matthijs de Ligt',
    'Kobbie Mainoo',
    'Manuel Ugarte',
    'Mason Mount',
    'Casemiro',
    'Bruno Fernandes',
    'Chido Obi',
    'Benjamin Sesko',
    'Amad Diallo',
    'Bryan Mbeumo',
    'Joshua Zirkzee',
    'Matheus Cunha'
  ]),
  'Tottenham Hotspur': createImageOnlySquad('tottenham', [
    'Antonín Kinský',
    'Brandon Austin',
    'Guglielmo Vicario',
    'Luca Gunter',
    'Pedro Porro',
    'Destiny Udogie',
    'Djed Spence',
    'Ben Davies',
    'Cristian Romero',
    'Kevin Danso',
    'Kota Takai',
    'Micky van de Ven',
    'Radu Drăgușin',
    'Pape Matar Sarr',
    'Rodrigo Bentancur',
    'Yves Bissouma',
    'Archie Gray',
    'James Maddison',
    'Xavi Simons',
    'João Palhinha',
    'Lucas Bergvall',
    'Dejan Kulusevski',
    'Mathys Tel',
    'Randal Kolo Muani',
    'Dane Scarlett',
    'Dominic Solanke',
    'Mohammed Kudus',
    'Richarlison',
    'Wilson Odobert',
    'Brennan Johnson'
  ]),
  
  // European Competition Teams
  'Newcastle United': createImageOnlySquad('newcastle-utd', [
    'Nick Pope',
    'Aaron Ramsdale',
    'John Ruddy',
    'Mark Gillespie',
    'Alex Murphy',
    'Kieran Trippier',
    'Lewis Hall',
    'Sven Botman',
    'Tino Livramento',
    'Fabian Schär',
    'Jamaal Lascelles',
    'Dan Burn',
    'Harrison Ashby',
    'Malick Thiaw',
    'Emil Krafth',
    'Lewis Miley',
    'Jacob Ramsey',
    'Joe Willock',
    'Sandro Tonali',
    'Bruno Guimarães',
    'Joelinton',
    'William Osula',
    'Nick Woltemade',
    'Anthony Elanga',
    'Harvey Barnes',
    'Anthony Gordon',
    'Jacob Murphy',
    'Yoane Wissa'
  ]),
  'West Ham United': createImageOnlySquad('west-ham', [
    'Alphonse Areola',
    'Łukasz Fabiański',
    'Mads Hermansen',
    'El Hadji Malick Diouf',
    'Konstantinos Mavropanos',
    'Kyle Walker-Peters',
    'Oliver Scarles',
    'Aaron Wan-Bissaka',
    'Igor Julio',
    'Jean-Clair Todibo',
    'Maximilian Kilman',
    'Freddie Potts',
    'Guido Rodríguez',
    'Soungoutou Magassa',
    'Tomas Soucek',
    'Lucas Paquetá',
    'George Earthy',
    'Andrew Irving',
    'James Ward-Prowse',
    'Mateus Fernandes',
    'Callum Marshall',
    'Luis Guilherme',
    'Crysencio Summerville',
    'Jarrod Bowen',
    'Niclas Füllkrug'
  ]),
  'Brighton & Hove Albion': createImageOnlySquad('brighton', [
    'Bart Verbruggen',
    'Tom McGill',
    'Jason Steele',
    'Adam Webster',
    'Ferdi Kadıoğlu',
    'Jan Paul van Hecke',
    'Lewis Dunk',
    'Maxim De Cuyper',
    'Olivier Boscagli',
    'Joël Veltman',
    'Diego Coppola',
    'Carlos Baleba',
    'Jack Hinshelwood',
    'Mats Wieffer',
    'Yasin Ayari',
    'Diego Gómez',
    'James Milner',
    'Brajan Gruda',
    'Charalampos Kostoulas',
    'Stefanos Tzimas',
    'Tom Watson',
    'Danny Welbeck',
    'Kaoru Mitoma',
    'Solly March',
    'Yankuba Minteh',
    'Georginio Rutter'
  ]),
  
  // Mid-table Teams
  'Brentford': [
    ...createImageOnlySquad('brentford', [
      'Caoimhín Kelleher',
      'Julian Eyestone',
      'Ellery Balcombe',
      'Hákon Valdimarsson',
      'Matthew Cox',
      'Benjamin Arthur',
      'Michael Kayode',
      'Nathan Collins',
      'Rico Henry',
      'Aaron Hickey',
      'Ethan Pinnock',
      'Sepp van den Berg',
      'Kristoffer Ajer',
      'Antoni Milambo',
      'Mikkel Damsgaard',
      'Nikolaj Kirk',
      'Paris Maghoma',
      'Vitaly Janelt',
      'Yegor Yarmolyuk',
      'Yunus Konak',
      'Frank Onyeka',
      'Joshua Dasilva',
      'Myles Peart-Harris',
      'Fábio Carvalho',
      'Keane Lewis-Potter',
      'Jordan Henderson',
      'Gustavo Nunes',
      'Romelle Donovan',
      'Igor Thiago',
      'Dango Ouattara',
      'Kevin Schade'
    ]),
    { 
      name: 'Reiss Nelson', 
      position: 'Forward', 
      shirtNumber: 24, 
      weeklyWage: 100000, 
      yearlyWage: 5.2,
      transferHistory: [
        {
          date: '1 Jul 2025',
          from: 'Arsenal',
          to: 'Brentford',
          fee: 'Undisclosed',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jul 2017',
          from: 'Arsenal U21',
          to: 'Arsenal',
          fee: '-',
          type: 'Promotion'
        }
      ]
    }
  ],
  'Crystal Palace': createImageOnlySquad('crystal-palace', [
    'Remi Matthews',
    'Dean Henderson',
    'Walter Benítez',
    'Borna Sosa',
    'Caleb Kporha',
    'Jaydee Canvot',
    'Marc Guéhi',
    'Daniel Muñoz',
    'Chadi Riad',
    'Joel Ward',
    'Nathaniel Clyne',
    'Tyrick Mitchell',
    'Chris Richards',
    'Maxence Lacroix',
    'Cheick Doucouré',
    'Rio Cardines',
    'Adam Wharton',
    'Jefferson Lerma',
    'Will Hughes',
    'Justin Devenny',
    'Daichi Kamada',
    'Naouirou Ahamada',
    'Christantus Uche',
    'Romain Esse',
    'Eddie Nketiah',
    'Jean-Philippe Mateta',
    'Yéremy Pino',
    'Ismaïla Sarr'
  ]),
  'Wolverhampton Wanderers': createImageOnlySquad('wolverhampton', [
    'Daniel Bentley',
    'José Sá',
    'Sam Johnstone',
    'Emmanuel Agbadou',
    'Matt Doherty',
    'David Møller Wolfe',
    'Craig Dawson',
    'Ladislav Krejci',
    'Santiago Bueno',
    'Toti',
    'Yerson Mosquera',
    'Hugo Bueno',
    'Jackson Tchatchoua',
    'Ki-Jana Hoever',
    'Fer López',
    'Tawanda Chirewa',
    'Jean-Ricner Bellegarde',
    'Marshall Munetsi',
    'André',
    'João Gomes',
    'Mateus Mané',
    'Jörgen Strand Larsen',
    'Tolu Arokodare',
    'Enso González',
    'Jhon Arias',
    'Hee-chan Hwang'
  ]),
  'Fulham': createImageOnlySquad('fulham', [
    'Benjamin Lecomte',
    'Bernd Leno',
    'Antonee Robinson',
    'Calvin Bassey',
    'Jorge Cuenca',
    'Kenny Tete',
    'Ryan Sessegnon',
    'Timothy Castagne',
    'Joachim Andersen',
    'Issa Diop',
    'Emile Smith Rowe',
    'Josh King',
    'Sander Berge',
    'Saša Lukić',
    'Tom Cairney',
    'Harrison Reed',
    'Jonah Kusi-Asare',
    'Raúl Jiménez',
    'Adama Traoré',
    'Samuel Chukwueze',
    'Alex Iwobi',
    'Rodrigo Muniz'
  ]),
  
  // Lower Table Teams
  'Nottingham Forest': [
    ...createImageOnlySquad('nottingham', [
      'Angus Gunn',
      'Matz Sels',
      'John Victor',
      'Jair Cunha',
      'Murillo',
      'Neco Williams',
      'Ola Aina',
      'Morato',
      'Nicolò Savona',
      'Willy Boly',
      'Nikola Milenković',
      'Zach Abbott',
    ]),
    { 
      name: 'Oleksandr Zinchenko', 
      position: 'Defender', 
      shirtNumber: 17, 
      weeklyWage: 150000, 
      yearlyWage: 7.8,
      transferHistory: [
        {
          date: '1 Jul 2025',
          from: 'Arsenal',
          to: 'Nottingham Forest',
          fee: 'Undisclosed',
          type: 'Permanent transfer'
        },
        {
          date: '15 Jul 2022',
          from: 'Manchester City',
          to: 'Arsenal',
          fee: '£32M',
          type: 'Permanent transfer'
        },
        {
          date: '4 Jul 2016',
          from: 'Ufa',
          to: 'Manchester City',
          fee: '£1.7M',
          type: 'Permanent transfer'
        }
      ]
    },
    ...createImageOnlySquad('nottingham', [
      'Ryan Yates',
      'James McAtee',
      'Douglas Luiz',
      'Elliot Anderson',
      'Omari Hutchinson',
      'Nicolás Domínguez',
      'Morgan Gibbs-White',
      'Igor Jesus',
      'Taiwo Awoniyi',
      'Arnaud Kalimuendo',
      'Callum Hudson-Odoi',
      'Dan Ndoye',
      'Dilane Bakwa',
      'Ibrahima Sangaré',
      'Chris Wood'
    ])
  ],
  'Everton': createImageOnlySquad('everton', [
    'Harry Tyrer',
    'Jordan Pickford',
    'Mark Travers',
    'Tom King',
    'Adam Aznou',
    'Jarrad Branthwaite',
    'Vitaliy Mykolenko',
    'Nathan Patterson',
    'Jake O\'Brien',
    'James Tarkowski',
    'Michael Keane',
    'Séamus Coleman',
    'Idrissa Gueye',
    'James Garner',
    'Tim Iroegbunam',
    'Carlos Alcaraz',
    'Kiernan Dewsbury-Hall',
    'Merlin Röhl',
    'Iliman Ndiaye',
    'Tyler Dibling',
    'Beto',
    'Thierno Barry',
    'Dwight McNeil',
    'Jack Grealish'
  ]),
  'Bournemouth': createImageOnlySquad('bournemouth', [
    'Djordje Petrovic',
    'Will Dennis',
    'Adrien Truffert',
    'Álex Jiménez',
    'Julio Soler',
    'Marcos Senesi',
    'Matai Akinmboni',
    'Veljko Milosavljevic',
    'Bafodé Diakité',
    'James Hill',
    'Julián Araujo',
    'Ryan Christie',
    'Lewis Cook',
    'Justin Kluivert',
    'Marcus Tavernier',
    'Tyler Adams',
    'Alex Scott',
    'Ben Gannon Doak',
    'Eli Kroupi',
    'Enes Ünal',
    'Evanilson',
    'Antoine Semenyo',
    'David Brooks',
    'Adam Smith',
    'Amine Adli'
  ]),
  'Burnley': createImageOnlySquad('burnley', [
    'Max Weiß',
    'Martin Dúbravka',
    'Václav Hladký',
    'Hannes Delcroix',
    'Kyle Walker',
    'Maxime Estève',
    'Oliver Sonne',
    'Quilindschy Hartman',
    'Connor Roberts',
    'Lucas Pires',
    'Axel Tuanzebe',
    'Bashir Humphreys',
    'Hjalmar Ekdal',
    'Joe Worrall',
    'Jordan Beyer',
    'Josh Laurent',
    'Lesley Ugochukwu',
    'Hannibal',
    'Mike Tresor',
    'Florentino',
    'Josh Cullen',
    'Zeki Amdouni',
    'Zian Flemming',
    'Jacob Bruun Larsen',
    'Jaidon Anthony',
    'Marcus Edwards',
    'Enock Agyei',
    'Jaydon Banel',
    'Loum Tchaouna',
    'Lyle Foster',
    'Armando Broja',
    'Ashley Barnes'
  ]),
  
  // Newly Promoted Teams
  'Ipswich Town': generateSquad('Ipswich Town', 25, wageTiers.promoted),
  'Sunderland': createImageOnlySquad('sunderland', [
    'Robin Roefs',
    'Simon Moore',
    'Anthony Patterson',
    'Blondy Nna Noukeu',
    'Arthur Masuaku',
    'Joe Anderson',
    'Nordi Mukiele',
    'Timothée Pembélé',
    'Lutsharel Geertruida',
    'Trai Hume',
    'Aji Alese',
    'Dennis Cirkin',
    'Leo Fuhr Hjelde',
    'Omar Alderete',
    'Daniel George Ballard',
    'Luke O\'Nien',
    'Reinildo Mandava',
    'Chris Rigg',
    'Noah Sadiki',
    'Granit Xhaka',
    'Habib Diarra',
    'Harrison Jones',
    'Abdoullah Ba',
    'Dan Neil',
    'Enzo Le Fée',
    'Jay Matete',
    'Ahmed Abdullahi',
    'Eliezer Mayenda',
    'Romaine Mundle',
    'Simon Adingra',
    'Wilson Isidor',
    'Brian Brobbey',
    'Chemsdine Talbi',
    'Bertrand Traoré',
    'Ian Poveda'
  ]),
  'Sheffield United': generateSquad('Sheffield United', 25, wageTiers.promoted),
  
  // Premier League Team (Leeds United)
  'Leeds United': [
    { 
      name: 'Illan Meslier', 
      position: 'Goalkeeper', 
      shirtNumber: 16,
      weeklyWage: 35000, 
      yearlyWage: 1.82,
      age: 25,
      bio: {
        height: '196 cm',
        nationality: 'France',
        dateOfBirth: '2000-03-02',
        preferredFoot: 'Left'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 39,
            minutes: 3510,
            appearances: 39,
            started: 39,
            minutesPerGame: 90,
            totalMinutes: 3510,
            teamOfTheWeek: 1,
            cleanSheets: 21,
            goalsConceded: 27,
            // Goalkeeping
            goalsConcededPerGame: 0.7,
            penaltiesSaved: '1/4',
            savesPerGame: 1.7,
            savesPerGamePercentage: 71,
            succRunsOutPerGame: 0.5,
            succRunsOutPercentage: 100,
            concededFromInsideBox: 23,
            concededFromOutsideBox: 4,
            saves: 65,
            goalsPrevented: -2.73,
            savesFromInsideBox: 35,
            savesFromOutsideBox: 29,
            savesCaught: 1,
            savesParried: 13,
            // Attacking
            goals: 0,
            expectedGoals: 0,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 0.0,
            shotsOnTargetPerGame: 0.0,
            bigChancesMissed: 0,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '0/0',
            goalsFromOutsideBox: 0,
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0.03,
            touches: 37.8,
            bigChancesCreated: 0,
            keyPasses: 0.03,
            accuratePasses: 22.6,
            accuratePassesPercentage: 77,
            accOwnHalf: 21.4,
            accOwnHalfPercentage: 93,
            accOppositionHalf: 1.2,
            accOppositionHalfPercentage: 18,
            longBallsAccurate: 2.5,
            longBallsPercentage: 27,
            accurateChipPasses: 0.6,
            accurateChipPassesPercentage: 55,
            accurateCrosses: 0.0,
            // Defending
            interceptions: 0.0,
            tacklesPerGame: 0.0,
            possessionWonFinalThird: 0.0,
            ballsRecoveredPerGame: 6.9,
            dribbledPastPerGame: 0.0,
            clearancesPerGame: 0.9,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 3,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.03,
            succDribblesPercentage: 100,
            totalDuelsWon: 0.7,
            totalDuelsWonPercentage: 100,
            groundDuelsWon: 0.3,
            groundDuelsWonPercentage: 100,
            aerialDuelsWon: 0.5,
            aerialDuelsWonPercentage: 100,
            possessionLost: 7.1,
            foulsPerGame: 0.0,
            wasFouled: 0.3,
            offsides: 0.0,
            goalKicksPerGame: 3.1,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      },
      transferHistory: [
        {
          date: '8 Jul 2020',
          from: 'Lorient',
          to: 'Leeds United',
          fee: '£5.0M',
          type: 'Permanent transfer'
        },
        {
          date: '30 Jun 2020',
          from: 'Leeds United',
          to: 'Lorient',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '8 Aug 2019',
          from: 'Lorient',
          to: 'Leeds United',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '1 Jul 2018',
          from: 'Lorient B',
          to: 'Lorient',
          fee: '-',
          type: 'Youth promotion'
        }
      ],
      previousMatches: [
        {
          competition: 'Premier League',
          date: '04 Oct 2025',
          team: 'Leeds United',
          opponent: 'Tottenham Hotspur',
          score: '1-2',
          outcome: 'Loss',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '27 Sep 2025',
          team: 'Leeds United',
          opponent: 'Bournemouth',
          score: '2-2',
          outcome: 'Draw',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '20 Sep 2025',
          team: 'Leeds United',
          opponent: 'Wolverhampton Wanderers',
          score: '3-1',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '13 Sep 2025',
          team: 'Leeds United',
          opponent: 'Fulham',
          score: '0-1',
          outcome: 'Loss',
          venue: 'Away'
        },
        {
          competition: 'Club Friendly Games',
          date: '02 Aug 2025',
          team: 'Leeds United',
          opponent: 'Villarreal',
          score: '1-1',
          outcome: 'Draw',
          venue: 'Home'
        },
        {
          competition: 'Club Friendly Games',
          date: '19 Jul 2025',
          team: 'Leeds United',
          opponent: 'Manchester United',
          score: '0-0',
          outcome: 'Draw',
          venue: 'Away'
        },
        {
          competition: 'Championship',
          date: '03 May 2025',
          team: 'Leeds United',
          opponent: 'Plymouth Argyle',
          score: '2-1',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Championship',
          date: '28 Apr 2025',
          team: 'Leeds United',
          opponent: 'Bristol City',
          score: '4-0',
          outcome: 'Win',
          venue: 'Home'
        },
        {
          competition: 'Championship',
          date: '21 Apr 2025',
          team: 'Leeds United',
          opponent: 'Stoke City',
          score: '6-0',
          outcome: 'Win',
          venue: 'Home'
        },
        {
          competition: 'Championship',
          date: '18 Apr 2025',
          team: 'Leeds United',
          opponent: 'Oxford United',
          score: 'N/A',
          outcome: 'Draw',
          venue: 'Away'
        }
      ]
    },
    // Goalkeepers
    { 
      name: 'Karl Darlow', 
      position: 'Goalkeeper', 
      shirtNumber: 26, 
      weeklyWage: 40000, 
      yearlyWage: 2.08,
      age: 35,
      bio: {
        height: '185 cm',
        nationality: 'Wales',
        dateOfBirth: '1990-10-08',
        preferredFoot: 'Right'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 5,
            minutes: 450,
            appearances: 5,
            started: 5,
            minutesPerGame: 90,
            totalMinutes: 450,
            teamOfTheWeek: 0,
            cleanSheets: 0,
            goalsConceded: 8,
            // Goalkeeping
            goalsConcededPerGame: 1.6,
            penaltiesSaved: '0/0',
            savesPerGame: 2.6,
            savesPerGamePercentage: 62,
            succRunsOutPerGame: 0.2,
            succRunsOutPercentage: 100,
            concededFromInsideBox: 5,
            concededFromOutsideBox: 3,
            saves: 13,
            goalsPrevented: -2.69,
            savesFromInsideBox: 8,
            savesFromOutsideBox: 5,
            savesCaught: 0,
            savesParried: 3,
            // Attacking
            goals: 0,
            expectedGoals: 0,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 0.0,
            shotsOnTargetPerGame: 0.0,
            bigChancesMissed: 0,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '0/0',
            goalsFromOutsideBox: 0,
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0.01,
            touches: 47.4,
            bigChancesCreated: 0,
            keyPasses: 0.0,
            accuratePasses: 21.0,
            accuratePassesPercentage: 59,
            accOwnHalf: 16.0,
            accOwnHalfPercentage: 87,
            accOppositionHalf: 5.0,
            accOppositionHalfPercentage: 29,
            longBallsAccurate: 6.6,
            longBallsPercentage: 31,
            accurateChipPasses: 1.8,
            accurateChipPassesPercentage: 43,
            accurateCrosses: 0.0,
            // Defending
            interceptions: 0.0,
            tacklesPerGame: 0.0,
            possessionWonFinalThird: 0.0,
            ballsRecoveredPerGame: 10.6,
            dribbledPastPerGame: 0.0,
            clearancesPerGame: 1.2,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.0,
            succDribblesPercentage: 0,
            totalDuelsWon: 1.2,
            totalDuelsWonPercentage: 100,
            groundDuelsWon: 0.6,
            groundDuelsWonPercentage: 100,
            aerialDuelsWon: 0.6,
            aerialDuelsWonPercentage: 100,
            possessionLost: 15.0,
            foulsPerGame: 0.0,
            wasFouled: 0.8,
            offsides: 0.0,
            goalKicksPerGame: 5.2,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      },
      transferHistory: [
        {
          date: '29 Jul 2023',
          from: 'Newcastle United',
          to: 'Leeds United',
          fee: '£400K',
          type: 'Permanent transfer'
        },
        {
          date: '31 May 2023',
          from: 'Hull City',
          to: 'Newcastle United',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '31 Jan 2023',
          from: 'Newcastle United',
          to: 'Hull City',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '31 May 2015',
          from: 'Nottingham Forest',
          to: 'Newcastle United',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '10 Aug 2014',
          from: 'Newcastle United',
          to: 'Nottingham Forest',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '9 Aug 2014',
          from: 'Nottingham Forest',
          to: 'Newcastle United',
          fee: '£5.0M',
          type: 'Permanent transfer'
        },
        {
          date: '10 Jan 2013',
          from: 'Walsall',
          to: 'Nottingham Forest',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '1 Jan 2013',
          from: 'Nottingham Forest',
          to: 'Walsall',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '26 Oct 2012',
          from: 'Walsall',
          to: 'Nottingham Forest',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '21 Sept 2012',
          from: 'Nottingham Forest',
          to: 'Walsall',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '1 May 2012',
          from: 'Newport County',
          to: 'Nottingham Forest',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '1 Mar 2012',
          from: 'Nottingham Forest',
          to: 'Newport County',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '1 Jul 2010',
          from: 'Nottingham Forest U18',
          to: 'Nottingham Forest',
          fee: '-',
          type: 'Youth promotion'
        }
      ],
      previousMatches: [
        {
          competition: 'Premier League',
          date: '09 Nov 2025',
          team: 'Leeds United',
          opponent: 'Nottingham Forest',
          score: '1-3',
          outcome: 'Loss',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '01 Nov 2025',
          team: 'Leeds United',
          opponent: 'Brighton & Hove Albion',
          score: '0-3',
          outcome: 'Loss',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '24 Oct 2025',
          team: 'Leeds United',
          opponent: 'West Ham United',
          score: '2-1',
          outcome: 'Win',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '18 Oct 2025',
          team: 'Leeds United',
          opponent: 'Burnley',
          score: '0-2',
          outcome: 'Loss',
          venue: 'Away'
        },
        {
          competition: 'World Cup Qual. UEFA',
          date: '13 Oct 2025',
          team: 'Wales',
          opponent: 'Belgium',
          score: '2-4',
          outcome: 'Loss',
          venue: 'Home'
        },
        {
          competition: 'International Friendly Games',
          date: '09 Oct 2025',
          team: 'Wales',
          opponent: 'England',
          score: '0-3',
          outcome: 'Loss',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '04 Oct 2025',
          team: 'Leeds United',
          opponent: 'Tottenham Hotspur',
          score: '1-2',
          outcome: 'Loss',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '27 Sep 2025',
          team: 'Leeds United',
          opponent: 'Bournemouth',
          score: '2-2',
          outcome: 'Draw',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '20 Sep 2025',
          team: 'Leeds United',
          opponent: 'Wolverhampton Wanderers',
          score: '3-1',
          outcome: 'Win',
          venue: 'Away'
        }
      ]
    },
    { 
      name: 'Lucas Perri', 
      position: 'Goalkeeper', 
      shirtNumber: 1, 
      weeklyWage: 35000, 
      yearlyWage: 1.82,
      age: 27,
      bio: {
        height: '196 cm',
        nationality: 'Brazil',
        dateOfBirth: '1997-12-10',
        preferredFoot: 'Right',
        description: 'Lucas Perri is 27 years old (Dec 10, 1997), 196 cm tall and plays for Leeds United. Lucas Perri prefers to play with right foot. His jersey number is 1. Lucas Perri career statistics, match ratings, heatmap and goals are available on  for current and previous seasons. Last player match was Nottingham Forest - Leeds United (3 - 1) and Lucas Perri received 6.6  rating.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 6,
            minutes: 540,
            appearances: 6,
            started: 6,
            minutesPerGame: 90,
            totalMinutes: 540,
            teamOfTheWeek: 0,
            cleanSheets: 2,
            goalsConceded: 12,
            // Goalkeeping
            goalsConcededPerGame: 2.0,
            penaltiesSaved: '0/2',
            savesPerGame: 2.0,
            savesPerGamePercentage: 50,
            succRunsOutPerGame: 0.2,
            succRunsOutPercentage: 100,
            concededFromInsideBox: 12,
            concededFromOutsideBox: 0,
            saves: 12,
            goalsPrevented: -0.06,
            savesFromInsideBox: 9,
            savesFromOutsideBox: 3,
            savesCaught: 0,
            savesParried: 3,
            // Attacking
            goals: 0,
            expectedGoals: 0,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 0.0,
            shotsOnTargetPerGame: 0.0,
            bigChancesMissed: 0,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '0/0',
            goalsFromOutsideBox: 0,
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0.01,
            touches: 43.7,
            bigChancesCreated: 0,
            keyPasses: 0.0,
            accuratePasses: 20.5,
            accuratePassesPercentage: 58,
            accOwnHalf: 16.8,
            accOwnHalfPercentage: 89,
            accOppositionHalf: 3.7,
            accOppositionHalfPercentage: 22,
            longBallsAccurate: 6.3,
            longBallsPercentage: 30,
            accurateChipPasses: 2.2,
            accurateChipPassesPercentage: 54,
            accurateCrosses: 0.0,
            // Defending
            interceptions: 0.0,
            tacklesPerGame: 0.0,
            possessionWonFinalThird: 0.0,
            ballsRecoveredPerGame: 6.7,
            dribbledPastPerGame: 0.0,
            clearancesPerGame: 1.2,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.0,
            succDribblesPercentage: 0,
            totalDuelsWon: 0.3,
            totalDuelsWonPercentage: 100,
            groundDuelsWon: 0.0,
            groundDuelsWonPercentage: 0,
            aerialDuelsWon: 0.3,
            aerialDuelsWonPercentage: 100,
            possessionLost: 15.3,
            foulsPerGame: 0.0,
            wasFouled: 0.0,
            offsides: 0.0,
            goalKicksPerGame: 5.2,
            // Cards
            yellowCards: 1,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      },
      transferHistory: [
        {
          date: '26 Jul 2025',
          from: 'Olympique Lyonnais',
          to: 'Leeds United',
          fee: 'Undisclosed',
          type: 'Permanent transfer'
        },
        {
          date: '5 Jan 2024',
          from: 'São Paulo',
          to: 'Olympique Lyonnais',
          fee: '£3.3M',
          type: 'Permanent transfer'
        },
        {
          date: '31 Dec 2022',
          from: 'Botafogo',
          to: 'São Paulo',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '17 Aug 2022',
          from: 'São Paulo',
          to: 'Botafogo',
          fee: '£350K',
          type: 'Permanent transfer'
        },
        {
          date: '16 Aug 2022',
          from: 'Náutico',
          to: 'São Paulo',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '20 May 2022',
          from: 'São Paulo',
          to: 'Náutico',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '1 Jan 2022',
          from: 'São Paulo',
          to: 'Náutico',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '30 Jun 2019',
          from: 'Crystal Palace',
          to: 'São Paulo',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '25 Jan 2019',
          from: 'São Paulo',
          to: 'Crystal Palace',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '1 Jan 2018',
          from: 'São Paulo U20',
          to: 'São Paulo',
          fee: '-',
          type: 'Youth promotion'
        }
      ],
      previousMatches: [
        {
          competition: 'Premier League',
          date: '09 Nov 2025',
          team: 'Leeds United',
          opponent: 'Nottingham Forest',
          score: '1-3',
          outcome: 'Loss',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '01 Nov 2025',
          team: 'Leeds United',
          opponent: 'Brighton & Hove Albion',
          score: '0-3',
          outcome: 'Loss',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '24 Oct 2025',
          team: 'Leeds United',
          opponent: 'West Ham United',
          score: '2-1',
          outcome: 'Win',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '18 Oct 2025',
          team: 'Leeds United',
          opponent: 'Burnley',
          score: '0-2',
          outcome: 'Loss',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '30 Aug 2025',
          team: 'Leeds United',
          opponent: 'Newcastle United',
          score: '0-0',
          outcome: 'Draw',
          venue: 'Home'
        },
        {
          competition: 'EFL Cup',
          date: '26 Aug 2025',
          team: 'Leeds United',
          opponent: 'Sheffield Wednesday',
          score: '1(3)-1(0)',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '23 Aug 2025',
          team: 'Leeds United',
          opponent: 'Arsenal',
          score: '0-5',
          outcome: 'Loss',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '18 Aug 2025',
          team: 'Leeds United',
          opponent: 'Everton',
          score: '1-0',
          outcome: 'Win',
          venue: 'Home'
        },
        {
          competition: 'Club Friendly Games',
          date: '09 Aug 2025',
          team: 'Leeds United',
          opponent: 'Milan',
          score: '1-1',
          outcome: 'Draw',
          venue: 'Home'
        },
        {
          competition: 'Ligue 1',
          date: '17 May 2025',
          team: 'Olympique Lyonnais',
          opponent: 'Angers',
          score: '2-0',
          outcome: 'Win',
          venue: 'Home'
        }
      ]
    },
    { 
      name: 'Alex Cairns', 
      position: 'Goalkeeper', 
      shirtNumber: 21, 
      weeklyWage: 15000, 
      yearlyWage: 0.78,
      age: 32,
      bio: {
        height: '183 cm',
        nationality: 'England',
        dateOfBirth: '1993-01-04',
        preferredFoot: 'Right',
        description: 'Alex Cairns is 32 years old (Jan 4, 1993), 183 cm tall and plays for Leeds United. Alex Cairns prefers to play with right foot. His jersey number is 21.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 3,
            minutes: 270,
            appearances: 3,
            started: 3,
            minutesPerGame: 90,
            totalMinutes: 270,
            teamOfTheWeek: 0,
            cleanSheets: 0,
            goalsConceded: 7,
            // Goalkeeping
            goalsConcededPerGame: 2.3,
            penaltiesSaved: '0/0',
            savesPerGame: 6.7,
            savesPerGamePercentage: 74,
            succRunsOutPerGame: 0.0,
            succRunsOutPercentage: 0,
            concededFromInsideBox: 7,
            concededFromOutsideBox: 0,
            saves: 20,
            goalsPrevented: null,
            savesFromInsideBox: 12,
            savesFromOutsideBox: 7,
            savesCaught: 0,
            savesParried: 4,
            // Attacking
            goals: 0,
            expectedGoals: 0,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 0.0,
            shotsOnTargetPerGame: 0.0,
            bigChancesMissed: 0,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '0/0',
            goalsFromOutsideBox: 0,
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0,
            touches: 54.7,
            bigChancesCreated: 0,
            keyPasses: 0.0,
            accuratePasses: 26.7,
            accuratePassesPercentage: 65,
            accOwnHalf: 18.7,
            accOwnHalfPercentage: 86,
            accOppositionHalf: 8.0,
            accOppositionHalfPercentage: 41,
            longBallsAccurate: 12.3,
            longBallsPercentage: 46,
            accurateChipPasses: 6.7,
            accurateChipPassesPercentage: 40,
            accurateCrosses: 0.0,
            // Defending
            interceptions: 0.0,
            tacklesPerGame: 0.0,
            possessionWonFinalThird: 0.0,
            ballsRecoveredPerGame: 6.0,
            dribbledPastPerGame: 0.0,
            clearancesPerGame: 1.0,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 1,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.0,
            succDribblesPercentage: 0,
            totalDuelsWon: 0.0,
            totalDuelsWonPercentage: 0,
            groundDuelsWon: 0.0,
            groundDuelsWonPercentage: 0,
            aerialDuelsWon: 0.0,
            aerialDuelsWonPercentage: 0,
            possessionLost: 15.7,
            foulsPerGame: 0.0,
            wasFouled: 0.0,
            offsides: 0.0,
            goalKicksPerGame: 14.7,
            // Cards
            yellowCards: 1,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      },
      transferHistory: [
        {
          date: '8 Jul 2024',
          from: 'Salford City',
          to: 'Leeds United',
          fee: 'Free',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jul 2023',
          from: 'Fleetwood Town',
          to: 'Salford City',
          fee: 'Free',
          type: 'Permanent transfer'
        },
        {
          date: '31 May 2023',
          from: 'Salford City',
          to: 'Fleetwood Town',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '4 Jan 2023',
          from: 'Fleetwood Town',
          to: 'Salford City',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '3 Dec 2022',
          from: 'Hartlepool United',
          to: 'Fleetwood Town',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '26 Nov 2022',
          from: 'Fleetwood Town',
          to: 'Hartlepool United',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '1 Jul 2016',
          from: 'Rotherham United',
          to: 'Fleetwood Town',
          fee: 'Free',
          type: 'Permanent transfer'
        },
        {
          date: '8 Jan 2016',
          from: 'Chesterfield',
          to: 'Rotherham United',
          fee: 'Free',
          type: 'Permanent transfer'
        },
        {
          date: '6 Aug 2015',
          from: 'Leeds United',
          to: 'Chesterfield',
          fee: 'Free',
          type: 'Permanent transfer'
        },
        {
          date: '28 Feb 2013',
          from: 'Stalybridge Celtic',
          to: 'Leeds United',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '1 Jan 2013',
          from: 'Leeds United',
          to: 'Stalybridge Celtic',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '1 Jan 2012',
          from: 'Leeds United U18',
          to: 'Leeds United',
          fee: '-',
          type: 'Youth promotion'
        }
      ]
    },
    // Defenders
    { 
      name: 'Ethan Ampadu', 
      position: 'Defender', 
      shirtNumber: 4, 
      weeklyWage: 50000, 
      yearlyWage: 2.6,
      age: 25,
      bio: {
        height: '182 cm',
        nationality: 'Wales',
        dateOfBirth: '2000-09-14',
        preferredFoot: 'Right',
        description: 'Ethan Ampadu is 25 years old (Sep 14, 2000), 182 cm tall and plays for Leeds United. Ethan Ampadu prefers to play with right foot. His jersey number is 4. Ethan Ampadu career statistics, match ratings, heatmap and goals are available on  for current and previous seasons. Last player match was Nottingham Forest - Leeds United (3 - 1) and Ethan Ampadu received 6.4  rating.',
        nationalTeam: 'Wales',
        nationalTeamDebut: '10 Nov 2017',
        nationalTeamAppearances: 58,
        nationalTeamGoals: 0
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 9,
            minutes: 789,
            appearances: 9,
            started: 9,
            minutesPerGame: 88,
            totalMinutes: 789,
            teamOfTheWeek: 0,
            cleanSheets: 0,
            goalsConceded: null,
            // Attacking
            goals: 0,
            expectedGoals: 0.41,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 0.6,
            shotsOnTargetPerGame: 0.0,
            bigChancesMissed: 0,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '0/2',
            goalsFromOutsideBox: '0/3',
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0.22,
            touches: 71.0,
            bigChancesCreated: 0,
            keyPasses: 0.2,
            accuratePasses: 48.3,
            accuratePassesPercentage: 86,
            accOwnHalf: 28.0,
            accOwnHalfPercentage: 92,
            accOppositionHalf: 20.6,
            accOppositionHalfPercentage: 78,
            longBallsAccurate: 2.1,
            longBallsPercentage: 45,
            accurateChipPasses: 0.8,
            accurateChipPassesPercentage: 37,
            accurateCrosses: 0.3,
            // Defending
            interceptions: 1.2,
            tacklesPerGame: 2.6,
            possessionWonFinalThird: 0.2,
            ballsRecoveredPerGame: 4.6,
            dribbledPastPerGame: 0.4,
            clearancesPerGame: 2.3,
            blockedShotsPerGame: 0.3,
            errorsLeadingToShot: 1,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.3,
            succDribblesPercentage: 75,
            totalDuelsWon: 4.3,
            totalDuelsWonPercentage: 57,
            groundDuelsWon: 3.4,
            groundDuelsWonPercentage: 60,
            aerialDuelsWon: 0.9,
            aerialDuelsWonPercentage: 50,
            possessionLost: 11.2,
            foulsPerGame: 1.8,
            wasFouled: 0.7,
            offsides: 0.0,
            goalKicksPerGame: null,
            // Cards
            yellowCards: 3,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      },
      transferHistory: [
        {
          date: '19 Jul 2023',
          from: 'Chelsea',
          to: 'Leeds United',
          fee: '£7.0M',
          type: 'Permanent transfer'
        },
        {
          date: '30 Jun 2023',
          from: 'Spezia',
          to: 'Chelsea',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '1 Sept 2022',
          from: 'Chelsea',
          to: 'Spezia',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '30 Jun 2022',
          from: 'Venezia',
          to: 'Chelsea',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '31 Aug 2021',
          from: 'Chelsea',
          to: 'Venezia',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '31 May 2021',
          from: 'Sheffield United',
          to: 'Chelsea',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '7 Sept 2020',
          from: 'Chelsea',
          to: 'Sheffield United',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '30 Jun 2020',
          from: 'RB Leipzig',
          to: 'Chelsea',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '22 Jul 2019',
          from: 'Chelsea',
          to: 'RB Leipzig',
          fee: '£550K',
          type: 'Loan'
        },
        {
          date: '1 Jul 2017',
          from: 'Exeter City',
          to: 'Chelsea',
          fee: '£2.4M',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jul 2016',
          from: 'Exeter City U18',
          to: 'Exeter City',
          fee: '-',
          type: 'Youth promotion'
        }
      ],
      previousMatches: [
        {
          competition: 'Premier League',
          date: '09 Nov 2025',
          team: 'Leeds United',
          opponent: 'Nottingham Forest',
          score: '3-1',
          outcome: 'Loss',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '01 Nov 2025',
          team: 'Leeds United',
          opponent: 'Brighton & Hove Albion',
          score: '1-1',
          outcome: 'Draw',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '24 Oct 2025',
          team: 'Leeds United',
          opponent: 'West Ham United',
          score: '2-1',
          outcome: 'Win',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '18 Oct 2025',
          team: 'Leeds United',
          opponent: 'Burnley',
          score: '2-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '04 Oct 2025',
          team: 'Leeds United',
          opponent: 'Tottenham Hotspur',
          score: '1-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '27 Sept 2025',
          team: 'Leeds United',
          opponent: 'Bournemouth',
          score: '2-2',
          outcome: 'Draw',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '20 Sept 2025',
          team: 'Leeds United',
          opponent: 'Wolverhampton',
          score: '1-3',
          outcome: 'Loss',
          venue: 'Away'
        }
      ]
    },
    { 
      name: 'James Justin', 
      position: 'Defender', 
      shirtNumber: 24, 
      weeklyWage: 45000, 
      yearlyWage: 2.34,
      age: 27,
      bio: {
        height: '183 cm',
        nationality: 'England',
        dateOfBirth: '1998-02-23',
        preferredFoot: 'Right',
        description: 'James Justin is 27 years old (Feb 23, 1998), 183 cm tall and plays for Leeds United. James Justin prefers to play with right foot. His jersey number is 24.',
        nationalTeam: 'England',
        nationalTeamDebut: '4 Jun 2022',
        nationalTeamAppearances: 1,
        nationalTeamGoals: 0
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 5,
            minutes: 90,
            appearances: 5,
            started: 0,
            minutesPerGame: 18,
            totalMinutes: 90,
            teamOfTheWeek: 0,
            cleanSheets: 0,
            goalsConceded: null,
            // Attacking
            goals: 0,
            expectedGoals: 0,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 0.0,
            shotsOnTargetPerGame: 0.0,
            bigChancesMissed: 0,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '0/0',
            goalsFromOutsideBox: 0,
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0.01,
            touches: 12.8,
            bigChancesCreated: 0,
            keyPasses: 0.0,
            accuratePasses: 5.0,
            accuratePassesPercentage: 78,
            accOwnHalf: 3.0,
            accOwnHalfPercentage: 94,
            accOppositionHalf: 2.0,
            accOppositionHalfPercentage: 59,
            longBallsAccurate: 0.6,
            longBallsPercentage: 60,
            accurateChipPasses: 0.8,
            accurateChipPassesPercentage: 67,
            accurateCrosses: 0.0,
            // Defending
            interceptions: 0.6,
            tacklesPerGame: 0.2,
            possessionWonFinalThird: 0.0,
            ballsRecoveredPerGame: 1.4,
            dribbledPastPerGame: 0.0,
            clearancesPerGame: 1.2,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.0,
            succDribblesPercentage: 0,
            totalDuelsWon: 0.6,
            totalDuelsWonPercentage: 33,
            groundDuelsWon: 0.6,
            groundDuelsWonPercentage: 50,
            aerialDuelsWon: 0.0,
            aerialDuelsWonPercentage: 0,
            possessionLost: 2.4,
            foulsPerGame: 0.2,
            wasFouled: 0.4,
            offsides: 0.0,
            goalKicksPerGame: null,
            // Cards
            yellowCards: 1,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      },
      transferHistory: [
        {
          date: '25 Aug 2025',
          from: 'Leicester City',
          to: 'Leeds United',
          fee: '£8.5M',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jul 2019',
          from: 'Luton Town',
          to: 'Leicester City',
          fee: '£5.7M',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jul 2016',
          from: 'Luton Town U18',
          to: 'Luton Town',
          fee: '-',
          type: 'Youth promotion'
        }
      ],
      previousMatches: [
        {
          competition: 'Premier League',
          date: '01 Nov 2025',
          team: 'Leeds United',
          opponent: 'Brighton & Hove Albion',
          score: '1-1',
          outcome: 'Draw',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '24 Oct 2025',
          team: 'Leeds United',
          opponent: 'West Ham United',
          score: '2-1',
          outcome: 'Win',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '04 Oct 2025',
          team: 'Leeds United',
          opponent: 'Tottenham Hotspur',
          score: '1-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '20 Sept 2025',
          team: 'Leeds United',
          opponent: 'Wolverhampton',
          score: '1-3',
          outcome: 'Loss',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '30 Aug 2025',
          team: 'Leeds United',
          opponent: 'Newcastle United',
          score: '2-1',
          outcome: 'Win',
          venue: 'Away'
        }
      ]
    },
    { 
      name: 'Sam Byram', 
      position: 'Defender', 
      shirtNumber: 25, 
      weeklyWage: 35000, 
      yearlyWage: 1.82,
      age: 32,
      bio: {
        height: '183 cm',
        nationality: 'England',
        dateOfBirth: '1993-09-16',
        preferredFoot: 'Right',
        description: 'Sam Byram is 32 years old (Sep 16, 1993), 183 cm tall and plays for Leeds United. Sam Byram prefers to play with right foot. His jersey number is 25.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 1,
            minutes: 8,
            appearances: 1,
            started: 0,
            minutesPerGame: 8,
            totalMinutes: 8,
            teamOfTheWeek: 0,
            cleanSheets: 0,
            goalsConceded: null,
            // Attacking
            goals: 0,
            expectedGoals: 0,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 0.0,
            shotsOnTargetPerGame: 0.0,
            bigChancesMissed: 0,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '0/0',
            goalsFromOutsideBox: 0,
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0.00,
            touches: 1.0,
            bigChancesCreated: 0,
            keyPasses: 0.0,
            accuratePasses: 1.0,
            accuratePassesPercentage: 100,
            accOwnHalf: 1.0,
            accOwnHalfPercentage: 100,
            accOppositionHalf: 0.0,
            accOppositionHalfPercentage: 0,
            longBallsAccurate: 0.0,
            longBallsPercentage: 0,
            accurateChipPasses: 0.0,
            accurateChipPassesPercentage: 0,
            accurateCrosses: 0.0,
            // Defending
            interceptions: 0.0,
            tacklesPerGame: 0.0,
            possessionWonFinalThird: 0.0,
            ballsRecoveredPerGame: 0.0,
            dribbledPastPerGame: 0.0,
            clearancesPerGame: 0.0,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.0,
            succDribblesPercentage: 0,
            totalDuelsWon: 0.0,
            totalDuelsWonPercentage: 0,
            groundDuelsWon: 0.0,
            groundDuelsWonPercentage: 0,
            aerialDuelsWon: 0.0,
            aerialDuelsWonPercentage: 0,
            possessionLost: 0.0,
            foulsPerGame: 1.0,
            wasFouled: 0.0,
            offsides: 0.0,
            goalKicksPerGame: null,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      },
      transferHistory: [
        {
          date: '5 Aug 2023',
          from: 'Norwich City',
          to: 'Leeds United',
          fee: 'Free',
          type: 'Permanent transfer'
        },
        {
          date: '16 Jul 2019',
          from: 'West Ham United',
          to: 'Norwich City',
          fee: '£710K',
          type: 'Permanent transfer'
        },
        {
          date: '31 May 2019',
          from: 'Nottingham Forest',
          to: 'West Ham United',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '10 Aug 2018',
          from: 'West Ham United',
          to: 'Nottingham Forest',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '20 Jan 2016',
          from: 'Leeds United',
          to: 'West Ham United',
          fee: '£4.1M',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jul 2012',
          from: 'Leeds United U18',
          to: 'Leeds United',
          fee: '-',
          type: 'Youth promotion'
        }
      ],
      previousMatches: [
        {
          competition: 'Premier League',
          date: '23 Aug 2025',
          team: 'Leeds United',
          opponent: 'Arsenal',
          score: '2-1',
          outcome: 'Win',
          venue: 'Home'
        }
      ]
    },
    { 
      name: 'Joe Rodon', 
      position: 'Defender', 
      shirtNumber: 6, 
      weeklyWage: 50000, 
      yearlyWage: 2.6,
      age: 28,
      bio: {
        height: '193 cm',
        nationality: 'Wales',
        dateOfBirth: '1997-10-22',
        preferredFoot: 'Right',
        description: 'Joe Rodon is 28 years old (Oct 22, 1997), 193 cm tall and plays for Leeds United. Joe Rodon prefers to play with right foot. His jersey number is 6. Joe Rodon career statistics, match ratings, heatmap and goals are available on  for current and previous seasons. Last player match was Nottingham Forest - Leeds United (3 - 1) and Joe Rodon received 6.6  rating.',
        nationalTeam: 'Wales',
        nationalTeamDebut: '6 Sept 2019',
        nationalTeamAppearances: 56,
        nationalTeamGoals: 2
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 11,
            minutes: 990,
            appearances: 11,
            started: 11,
            minutesPerGame: 90,
            totalMinutes: 990,
            teamOfTheWeek: 0,
            cleanSheets: 2,
            goalsConceded: null,
            // Attacking
            goals: 2,
            expectedGoals: 0.69,
            scoringFrequency: 495,
            goalsPerGame: 0.2,
            totalShots: 0.7,
            shotsOnTargetPerGame: 0.4,
            bigChancesMissed: 1,
            goalConversion: 25,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '2/8',
            goalsFromOutsideBox: 0,
            headedGoals: 2,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0.10,
            touches: 69.9,
            bigChancesCreated: 0,
            keyPasses: 0.2,
            accuratePasses: 51.0,
            accuratePassesPercentage: 90,
            accOwnHalf: 35.2,
            accOwnHalfPercentage: 94,
            accOppositionHalf: 15.8,
            accOppositionHalfPercentage: 81,
            longBallsAccurate: 1.5,
            longBallsPercentage: 45,
            accurateChipPasses: 0.5,
            accurateChipPassesPercentage: 33,
            accurateCrosses: 0.0,
            // Defending
            interceptions: 0.9,
            tacklesPerGame: 0.9,
            possessionWonFinalThird: 0.0,
            ballsRecoveredPerGame: 2.8,
            dribbledPastPerGame: 0.2,
            clearancesPerGame: 6.4,
            blockedShotsPerGame: 0.5,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.09,
            succDribblesPercentage: 100,
            totalDuelsWon: 5.3,
            totalDuelsWonPercentage: 60,
            groundDuelsWon: 1.5,
            groundDuelsWonPercentage: 68,
            aerialDuelsWon: 3.7,
            aerialDuelsWonPercentage: 57,
            possessionLost: 6.2,
            foulsPerGame: 0.6,
            wasFouled: 0.7,
            offsides: 0.0,
            goalKicksPerGame: null,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      },
      transferHistory: [
        {
          date: '2 Jul 2024',
          from: 'Tottenham Hotspur',
          to: 'Leeds United',
          fee: '£10.0M',
          type: 'Permanent transfer'
        },
        {
          date: '31 May 2024',
          from: 'Leeds United',
          to: 'Tottenham Hotspur',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '10 Aug 2023',
          from: 'Tottenham Hotspur',
          to: 'Leeds United',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '30 Jun 2023',
          from: 'Stade Rennais',
          to: 'Tottenham Hotspur',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '1 Aug 2022',
          from: 'Tottenham Hotspur',
          to: 'Stade Rennais',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '16 Oct 2020',
          from: 'Swansea City',
          to: 'Tottenham Hotspur',
          fee: '£10.3M',
          type: 'Permanent transfer'
        },
        {
          date: '30 Jan 2018',
          from: 'Swansea City',
          to: 'Cheltenham Town',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '1 Jul 2018',
          from: 'Swansea City U21',
          to: 'Swansea City',
          fee: '-',
          type: 'Youth promotion'
        }
      ],
      previousMatches: [
        {
          competition: 'Premier League',
          date: '09 Nov 2025',
          team: 'Leeds United',
          opponent: 'Nottingham Forest',
          score: '3-1',
          outcome: 'Loss',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '01 Nov 2025',
          team: 'Leeds United',
          opponent: 'Brighton & Hove Albion',
          score: '1-1',
          outcome: 'Draw',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '24 Oct 2025',
          team: 'Leeds United',
          opponent: 'West Ham United',
          score: '2-1',
          outcome: 'Win',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '18 Oct 2025',
          team: 'Leeds United',
          opponent: 'Burnley',
          score: '2-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '04 Oct 2025',
          team: 'Leeds United',
          opponent: 'Tottenham Hotspur',
          score: '1-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '27 Sept 2025',
          team: 'Leeds United',
          opponent: 'Bournemouth',
          score: '2-2',
          outcome: 'Draw',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '20 Sept 2025',
          team: 'Leeds United',
          opponent: 'Wolverhampton',
          score: '1-3',
          outcome: 'Loss',
          venue: 'Away'
        }
      ]
    },
    { 
      name: 'Pascal Struijk', 
      position: 'Defender', 
      shirtNumber: 5, 
      weeklyWage: 40000, 
      yearlyWage: 2.08,
      age: 26,
      bio: {
        height: '190 cm',
        nationality: 'Netherlands',
        dateOfBirth: '1999-08-11',
        preferredFoot: 'Left',
        description: 'Pascal Struijk is 26 years old (Aug 11, 1999), 190 cm tall and plays for Leeds United. Pascal Struijk prefers to play with left foot. His jersey number is 5. Pascal Struijk career statistics, match ratings, heatmap and goals are available on  for current and previous seasons. Last player match was Nottingham Forest - Leeds United (3 - 1) and Pascal Struijk received 6.4  rating.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 9,
            minutes: 728,
            appearances: 9,
            started: 8,
            minutesPerGame: 81,
            totalMinutes: 728,
            teamOfTheWeek: 0,
            cleanSheets: 2,
            goalsConceded: null,
            // Attacking
            goals: 0,
            expectedGoals: 0.78,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 0.9,
            shotsOnTargetPerGame: 0.1,
            bigChancesMissed: 0,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '0/8',
            goalsFromOutsideBox: 0,
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0.09,
            touches: 69.0,
            bigChancesCreated: 0,
            keyPasses: 0.2,
            accuratePasses: 54.0,
            accuratePassesPercentage: 92,
            accOwnHalf: 34.1,
            accOwnHalfPercentage: 95,
            accOppositionHalf: 19.9,
            accOppositionHalfPercentage: 89,
            longBallsAccurate: 2.0,
            longBallsPercentage: 53,
            accurateChipPasses: 1.7,
            accurateChipPassesPercentage: 47,
            accurateCrosses: 0.0,
            // Defending
            interceptions: 0.2,
            tacklesPerGame: 0.7,
            possessionWonFinalThird: 0.0,
            ballsRecoveredPerGame: 2.3,
            dribbledPastPerGame: 0.1,
            clearancesPerGame: 5.9,
            blockedShotsPerGame: 0.3,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.0,
            succDribblesPercentage: 0,
            totalDuelsWon: 3.4,
            totalDuelsWonPercentage: 49,
            groundDuelsWon: 1.2,
            groundDuelsWonPercentage: 50,
            aerialDuelsWon: 2.2,
            aerialDuelsWonPercentage: 49,
            possessionLost: 5.3,
            foulsPerGame: 0.7,
            wasFouled: 0.6,
            offsides: 0.1,
            goalKicksPerGame: null,
            // Cards
            yellowCards: 1,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      },
      transferHistory: [
        {
          date: '1 Jan 2020',
          from: 'Leeds United U21',
          to: 'Leeds United',
          fee: '-',
          type: 'Youth promotion'
        }
      ],
      previousMatches: [
        {
          competition: 'Premier League',
          date: '09 Nov 2025',
          team: 'Leeds United',
          opponent: 'Nottingham Forest',
          score: '3-1',
          outcome: 'Loss',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '18 Oct 2025',
          team: 'Leeds United',
          opponent: 'Burnley',
          score: '2-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '04 Oct 2025',
          team: 'Leeds United',
          opponent: 'Tottenham Hotspur',
          score: '1-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '27 Sept 2025',
          team: 'Leeds United',
          opponent: 'Bournemouth',
          score: '2-2',
          outcome: 'Draw',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '20 Sept 2025',
          team: 'Leeds United',
          opponent: 'Wolverhampton',
          score: '1-3',
          outcome: 'Loss',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '13 Sept 2025',
          team: 'Leeds United',
          opponent: 'Fulham',
          score: '1-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '30 Aug 2025',
          team: 'Leeds United',
          opponent: 'Newcastle United',
          score: '2-1',
          outcome: 'Win',
          venue: 'Away'
        }
      ]
    },
    { 
      name: 'Jaka Bijol', 
      position: 'Defender', 
      shirtNumber: 15, 
      weeklyWage: 40000, 
      yearlyWage: 2.08,
      age: 26,
      bio: {
        height: '192 cm',
        nationality: 'Slovenia',
        dateOfBirth: '1999-02-05',
        preferredFoot: 'Right',
        description: 'Jaka Bijol is 26 years old (Feb 5, 1999), 192 cm tall and plays for Leeds United. Jaka Bijol prefers to play with right foot. His jersey number is 15. Jaka Bijol career statistics, match ratings, heatmap and goals are available on  for current and previous seasons. Last player match was Nottingham Forest - Leeds United (3 - 1) and Jaka Bijol received 6.7  rating.',
        nationalTeam: 'Slovenia',
        nationalTeamDebut: '13 Oct 2018',
        nationalTeamAppearances: 67,
        nationalTeamGoals: 1
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 3,
            minutes: 262,
            appearances: 3,
            started: 3,
            minutesPerGame: 87,
            totalMinutes: 262,
            teamOfTheWeek: 0,
            cleanSheets: 0,
            goalsConceded: null,
            // Attacking
            goals: 0,
            expectedGoals: 0,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 0.0,
            shotsOnTargetPerGame: 0.0,
            bigChancesMissed: 0,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '0/0',
            goalsFromOutsideBox: 0,
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0.01,
            touches: 81.0,
            bigChancesCreated: 0,
            keyPasses: 0.3,
            accuratePasses: 66.3,
            accuratePassesPercentage: 93,
            accOwnHalf: 54.7,
            accOwnHalfPercentage: 98,
            accOppositionHalf: 11.7,
            accOppositionHalfPercentage: 76,
            longBallsAccurate: 3.0,
            longBallsPercentage: 50,
            accurateChipPasses: 3.0,
            accurateChipPassesPercentage: 60,
            accurateCrosses: 0.0,
            // Defending
            interceptions: 1.0,
            tacklesPerGame: 1.0,
            possessionWonFinalThird: 0.0,
            ballsRecoveredPerGame: 4.0,
            dribbledPastPerGame: 0.7,
            clearancesPerGame: 5.7,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.3,
            succDribblesPercentage: 100,
            totalDuelsWon: 3.7,
            totalDuelsWonPercentage: 58,
            groundDuelsWon: 1.7,
            groundDuelsWonPercentage: 45,
            aerialDuelsWon: 2.0,
            aerialDuelsWonPercentage: 75,
            possessionLost: 5.3,
            foulsPerGame: 1.3,
            wasFouled: 0.3,
            offsides: 0.0,
            goalKicksPerGame: null,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      },
      transferHistory: [
        {
          date: '1 Jul 2025',
          from: 'Udinese',
          to: 'Leeds United',
          fee: 'Undisclosed',
          type: 'Permanent transfer'
        },
        {
          date: '14 Jul 2022',
          from: 'CSKA Moscow',
          to: 'Udinese',
          fee: '£3.4M',
          type: 'Permanent transfer'
        },
        {
          date: '30 Jun 2021',
          from: 'Hannover 96',
          to: 'CSKA Moscow',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '18 Sept 2020',
          from: 'CSKA Moscow',
          to: 'Hannover 96',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '1 Jul 2018',
          from: 'Rudar Velenje',
          to: 'CSKA Moscow',
          fee: '£340K',
          type: 'Permanent transfer'
        },
        {
          date: '6 Jul 2017',
          from: 'NK Bravo U19',
          to: 'Rudar Velenje',
          fee: 'Free',
          type: 'Permanent transfer'
        }
      ],
      previousMatches: [
        {
          competition: 'Premier League',
          date: '09 Nov 2025',
          team: 'Leeds United',
          opponent: 'Nottingham Forest',
          score: '3-1',
          outcome: 'Loss',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '01 Nov 2025',
          team: 'Leeds United',
          opponent: 'Brighton & Hove Albion',
          score: '1-1',
          outcome: 'Draw',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '24 Oct 2025',
          team: 'Leeds United',
          opponent: 'West Ham United',
          score: '2-1',
          outcome: 'Win',
          venue: 'Home'
        }
      ]
    },
    { 
      name: 'Sebastiaan Bornauw', 
      position: 'Defender', 
      shirtNumber: 23, 
      weeklyWage: 45000, 
      yearlyWage: 2.34,
      age: 26,
      bio: {
        height: '190 cm',
        nationality: 'Belgium',
        dateOfBirth: '1999-03-22',
        preferredFoot: 'Right',
        description: 'Sebastiaan Bornauw is 26 years old (Mar 22, 1999), 190 cm tall and plays for Leeds United. Sebastiaan Bornauw prefers to play with right foot. His jersey number is 23.',
        nationalTeam: 'Belgium',
        nationalTeamDebut: '8 Oct 2020',
        nationalTeamAppearances: 4,
        nationalTeamGoals: 0
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'EFL Cup',
            matches: 1,
            minutes: 90,
            appearances: 1,
            started: 1,
            minutesPerGame: 90,
            totalMinutes: 90,
            teamOfTheWeek: 0,
            cleanSheets: 0,
            goalsConceded: null,
            // Attacking
            goals: 0,
            expectedGoals: 0,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 0.0,
            shotsOnTargetPerGame: 0.0,
            bigChancesMissed: 0,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '0/0',
            goalsFromOutsideBox: 0,
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0,
            touches: 105.0,
            bigChancesCreated: 0,
            keyPasses: 0.0,
            accuratePasses: 94.0,
            accuratePassesPercentage: 95,
            accOwnHalf: 45.0,
            accOwnHalfPercentage: 98,
            accOppositionHalf: 49.0,
            accOppositionHalfPercentage: 92,
            longBallsAccurate: 2.0,
            longBallsPercentage: 67,
            accurateChipPasses: 0.0,
            accurateChipPassesPercentage: 0,
            accurateCrosses: 0.0,
            // Defending
            interceptions: 2.0,
            tacklesPerGame: 1.0,
            possessionWonFinalThird: 1.0,
            ballsRecoveredPerGame: 7.0,
            dribbledPastPerGame: 0.0,
            clearancesPerGame: 3.0,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.0,
            succDribblesPercentage: 0,
            totalDuelsWon: 3.0,
            totalDuelsWonPercentage: 50,
            groundDuelsWon: 1.0,
            groundDuelsWonPercentage: 50,
            aerialDuelsWon: 2.0,
            aerialDuelsWonPercentage: 50,
            possessionLost: 5.0,
            foulsPerGame: 2.0,
            wasFouled: 0.0,
            offsides: 0.0,
            goalKicksPerGame: null,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      },
      transferHistory: [
        {
          date: '1 Jul 2025',
          from: 'VfL Wolfsburg',
          to: 'Leeds United',
          fee: 'Undisclosed',
          type: 'Permanent transfer'
        },
        {
          date: '16 Jul 2021',
          from: '1. FC Köln',
          to: 'VfL Wolfsburg',
          fee: '£11.5M',
          type: 'Permanent transfer'
        },
        {
          date: '6 Aug 2019',
          from: 'RSC Anderlecht',
          to: '1. FC Köln',
          fee: '£5.9M',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jul 2018',
          from: 'Anderlecht Reserve U21',
          to: 'RSC Anderlecht',
          fee: '-',
          type: 'Youth promotion'
        },
        {
          date: '1 Jul 2016',
          from: 'Anderlecht U17',
          to: 'Anderlecht Reserve U21',
          fee: '-',
          type: 'Youth promotion'
        }
      ],
      previousMatches: [
        {
          competition: 'EFL Cup',
          date: '26 Aug 2025',
          team: 'Leeds United',
          opponent: 'Sheffield Wednesday',
          score: 'N/A',
          outcome: 'N/A',
          venue: 'Home'
        }
      ]
    },
    { 
      name: 'Gabriel Gudmundsson', 
      position: 'Defender', 
      shirtNumber: 3, 
      weeklyWage: 35000, 
      yearlyWage: 1.82,
      age: 26,
      bio: {
        height: '181 cm',
        nationality: 'Sweden',
        dateOfBirth: '1999-04-29',
        preferredFoot: 'Left',
        description: 'Gabriel Gudmundsson is 26 years old (Apr 29, 1999), 181 cm tall and plays for Leeds United. Gabriel Gudmundsson prefers to play with left foot. His jersey number is 3. Gabriel Gudmundsson career statistics, match ratings, heatmap and goals are available on  for current and previous seasons. Last player match was Nottingham Forest - Leeds United (3 - 1) and Gabriel Gudmundsson received 6.2  rating.',
        nationalTeam: 'Sweden',
        nationalTeamDebut: '9 Jun 2022',
        nationalTeamAppearances: 19,
        nationalTeamGoals: 0
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 11,
            minutes: 915,
            appearances: 11,
            started: 11,
            minutesPerGame: 83,
            totalMinutes: 915,
            teamOfTheWeek: 0,
            cleanSheets: 1,
            goalsConceded: null,
            // Attacking
            goals: 0,
            expectedGoals: 0.18,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 0.4,
            shotsOnTargetPerGame: 0.0,
            bigChancesMissed: 0,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '0/3',
            goalsFromOutsideBox: '0/1',
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 1.05,
            touches: 58.9,
            bigChancesCreated: 2,
            keyPasses: 0.9,
            accuratePasses: 27.9,
            accuratePassesPercentage: 81,
            accOwnHalf: 14.8,
            accOwnHalfPercentage: 86,
            accOppositionHalf: 14.2,
            accOppositionHalfPercentage: 72,
            longBallsAccurate: 0.9,
            longBallsPercentage: 31,
            accurateChipPasses: 0.8,
            accurateChipPassesPercentage: 60,
            accurateCrosses: 1.1,
            // Defending
            interceptions: 1.0,
            tacklesPerGame: 1.8,
            possessionWonFinalThird: 0.3,
            ballsRecoveredPerGame: 3.5,
            dribbledPastPerGame: 0.6,
            clearancesPerGame: 3.4,
            blockedShotsPerGame: 0.3,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 1,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 1.4,
            succDribblesPercentage: 52,
            totalDuelsWon: 4.9,
            totalDuelsWonPercentage: 48,
            groundDuelsWon: 4.5,
            groundDuelsWonPercentage: 53,
            aerialDuelsWon: 0.5,
            aerialDuelsWonPercentage: 25,
            possessionLost: 13.2,
            foulsPerGame: 0.8,
            wasFouled: 1.3,
            offsides: 0.09,
            goalKicksPerGame: null,
            // Cards
            yellowCards: 1,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      },
      transferHistory: [
        {
          date: '8 Jul 2025',
          from: 'Lille',
          to: 'Leeds United',
          fee: '£9.9M',
          type: 'Permanent transfer'
        },
        {
          date: '31 Aug 2021',
          from: 'FC Groningen',
          to: 'Lille',
          fee: '£5.1M',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jul 2019',
          from: 'Halmstads BK',
          to: 'FC Groningen',
          fee: 'Undisclosed',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jul 2016',
          from: 'Halmstads U19',
          to: 'Halmstads BK',
          fee: '-',
          type: 'Youth promotion'
        }
      ],
      previousMatches: [
        {
          competition: 'Premier League',
          date: '09 Nov 2025',
          team: 'Leeds United',
          opponent: 'Nottingham Forest',
          score: '3-1',
          outcome: 'Loss',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '01 Nov 2025',
          team: 'Leeds United',
          opponent: 'Brighton & Hove Albion',
          score: '1-1',
          outcome: 'Draw',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '24 Oct 2025',
          team: 'Leeds United',
          opponent: 'West Ham United',
          score: '2-1',
          outcome: 'Win',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '18 Oct 2025',
          team: 'Leeds United',
          opponent: 'Burnley',
          score: '2-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '04 Oct 2025',
          team: 'Leeds United',
          opponent: 'Tottenham Hotspur',
          score: '1-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '27 Sept 2025',
          team: 'Leeds United',
          opponent: 'Bournemouth',
          score: '2-2',
          outcome: 'Draw',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '20 Sept 2025',
          team: 'Leeds United',
          opponent: 'Wolverhampton',
          score: '1-3',
          outcome: 'Loss',
          venue: 'Away'
        }
      ]
    },
    { 
      name: 'Jayden Bogle', 
      position: 'Defender', 
      shirtNumber: 2, 
      weeklyWage: 40000, 
      yearlyWage: 2.08,
      age: 25,
      bio: {
        height: '178 cm',
        nationality: 'England',
        dateOfBirth: '2000-07-27',
        preferredFoot: 'Right',
        description: 'Jayden Bogle is 25 years old (Jul 27, 2000), 178 cm tall and plays for Leeds United. Jayden Bogle prefers to play with right foot. His jersey number is 2. Jayden Bogle career statistics, match ratings, heatmap and goals are available on  for current and previous seasons. Last player match was Nottingham Forest - Leeds United (3 - 1) and Jayden Bogle received 6.5  rating.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 11,
            minutes: 962,
            appearances: 11,
            started: 11,
            minutesPerGame: 87,
            totalMinutes: 962,
            teamOfTheWeek: 0,
            cleanSheets: 2,
            goalsConceded: null,
            // Attacking
            goals: 0,
            expectedGoals: 0.68,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 0.7,
            shotsOnTargetPerGame: 0.2,
            bigChancesMissed: 2,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '0/4',
            goalsFromOutsideBox: '0/4',
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0.45,
            touches: 50.9,
            bigChancesCreated: 1,
            keyPasses: 0.3,
            accuratePasses: 21.5,
            accuratePassesPercentage: 76,
            accOwnHalf: 12.6,
            accOwnHalfPercentage: 87,
            accOppositionHalf: 9.3,
            accOppositionHalfPercentage: 59,
            longBallsAccurate: 0.9,
            longBallsPercentage: 29,
            accurateChipPasses: 0.7,
            accurateChipPassesPercentage: 40,
            accurateCrosses: 0.5,
            // Defending
            interceptions: 1.2,
            tacklesPerGame: 2.5,
            possessionWonFinalThird: 0.2,
            ballsRecoveredPerGame: 4.3,
            dribbledPastPerGame: 1.1,
            clearancesPerGame: 2.5,
            blockedShotsPerGame: 0.2,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 1,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.7,
            succDribblesPercentage: 38,
            totalDuelsWon: 4.5,
            totalDuelsWonPercentage: 45,
            groundDuelsWon: 3.9,
            groundDuelsWonPercentage: 47,
            aerialDuelsWon: 0.5,
            aerialDuelsWonPercentage: 38,
            possessionLost: 12.8,
            foulsPerGame: 1.1,
            wasFouled: 0.6,
            offsides: 0.3,
            goalKicksPerGame: null,
            // Cards
            yellowCards: 2,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      },
      transferHistory: [
        {
          date: '20 Jul 2024',
          from: 'Sheffield United',
          to: 'Leeds United',
          fee: '£5.1M',
          type: 'Permanent transfer'
        },
        {
          date: '7 Sept 2020',
          from: 'Derby County',
          to: 'Sheffield United',
          fee: 'Undisclosed',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jul 2018',
          from: 'Derby County U18',
          to: 'Derby County',
          fee: '-',
          type: 'Youth promotion'
        }
      ],
      previousMatches: [
        {
          competition: 'Premier League',
          date: '09 Nov 2025',
          team: 'Leeds United',
          opponent: 'Nottingham Forest',
          score: '3-1',
          outcome: 'Loss',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '01 Nov 2025',
          team: 'Leeds United',
          opponent: 'Brighton & Hove Albion',
          score: '1-1',
          outcome: 'Draw',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '24 Oct 2025',
          team: 'Leeds United',
          opponent: 'West Ham United',
          score: '2-1',
          outcome: 'Win',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '18 Oct 2025',
          team: 'Leeds United',
          opponent: 'Burnley',
          score: '2-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '04 Oct 2025',
          team: 'Leeds United',
          opponent: 'Tottenham Hotspur',
          score: '1-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '27 Sept 2025',
          team: 'Leeds United',
          opponent: 'Bournemouth',
          score: '2-2',
          outcome: 'Draw',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '20 Sept 2025',
          team: 'Leeds United',
          opponent: 'Wolverhampton',
          score: '1-3',
          outcome: 'Loss',
          venue: 'Away'
        }
      ]
    },
    // Midfielders
    { 
      name: 'Sean Longstaff', 
      position: 'Midfielder', 
      shirtNumber: 8, 
      weeklyWage: 60000, 
      yearlyWage: 3.12,
      age: 28,
      bio: {
        height: '187 cm',
        nationality: 'England',
        dateOfBirth: '1997-10-30',
        preferredFoot: 'Right',
        description: 'Sean Longstaff is 28 years old (Oct 30, 1997), 187 cm tall and plays for Leeds United. Sean Longstaff prefers to play with right foot. His jersey number is 8. Sean Longstaff career statistics, match ratings, heatmap and goals are available on  for current and previous seasons. Last player match was Nottingham Forest - Leeds United (3 - 1) and Sean Longstaff received 6.5  rating.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 11,
            minutes: 790,
            appearances: 11,
            started: 9,
            minutesPerGame: 72,
            totalMinutes: 790,
            teamOfTheWeek: 1,
            cleanSheets: null,
            goalsConceded: null,
            // Attacking
            goals: 1,
            expectedGoals: 0.68,
            scoringFrequency: 790,
            goalsPerGame: 0.09,
            totalShots: 0.9,
            shotsOnTargetPerGame: 0.2,
            bigChancesMissed: 0,
            goalConversion: 10,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: '0/1',
            freeKickConversion: 0,
            goalsFromInsideBox: '1/3',
            goalsFromOutsideBox: '0/7',
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 1,
            penaltyWon: 0,
            // Passing
            assists: 2,
            expectedAssists: 0.93,
            touches: 46.3,
            bigChancesCreated: 5,
            keyPasses: 1.6,
            accuratePasses: 26.6,
            accuratePassesPercentage: 85,
            accOwnHalf: 14.8,
            accOwnHalfPercentage: 91,
            accOppositionHalf: 13.3,
            accOppositionHalfPercentage: 74,
            longBallsAccurate: 0.7,
            longBallsPercentage: 35,
            accurateChipPasses: 0.5,
            accurateChipPassesPercentage: 33,
            accurateCrosses: 1.8,
            // Defending
            interceptions: 0.7,
            tacklesPerGame: 2.9,
            possessionWonFinalThird: 0.4,
            ballsRecoveredPerGame: 2.9,
            dribbledPastPerGame: 1.5,
            clearancesPerGame: 0.6,
            blockedShotsPerGame: 0.5,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.0,
            succDribblesPercentage: 0,
            totalDuelsWon: 5.0,
            totalDuelsWonPercentage: 56,
            groundDuelsWon: 4.3,
            groundDuelsWonPercentage: 57,
            aerialDuelsWon: 0.7,
            aerialDuelsWonPercentage: 50,
            possessionLost: 8.2,
            foulsPerGame: 0.5,
            wasFouled: 1.4,
            offsides: 0.09,
            goalKicksPerGame: null,
            // Cards
            yellowCards: 1,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      },
      transferHistory: [
        {
          date: '18 Jul 2025',
          from: 'Newcastle United',
          to: 'Leeds United',
          fee: '£11.7M',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jan 2019',
          from: 'Blackpool',
          to: 'Newcastle United',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '21 Jul 2017',
          from: 'Newcastle United',
          to: 'Blackpool',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '9 Jan 2017',
          from: 'Kilmarnock',
          to: 'Newcastle United',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '1 Jul 2016',
          from: 'Newcastle United',
          to: 'Kilmarnock',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '1 Jul 2015',
          from: 'Newcastle United U21',
          to: 'Newcastle United',
          fee: '-',
          type: 'Youth promotion'
        }
      ],
      previousMatches: [
        {
          competition: 'Premier League',
          date: '09 Nov 2025',
          team: 'Leeds United',
          opponent: 'Nottingham Forest',
          score: '3-1',
          outcome: 'Loss',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '01 Nov 2025',
          team: 'Leeds United',
          opponent: 'Brighton & Hove Albion',
          score: '1-1',
          outcome: 'Draw',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '24 Oct 2025',
          team: 'Leeds United',
          opponent: 'West Ham United',
          score: '2-1',
          outcome: 'Win',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '18 Oct 2025',
          team: 'Leeds United',
          opponent: 'Burnley',
          score: '2-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '04 Oct 2025',
          team: 'Leeds United',
          opponent: 'Tottenham Hotspur',
          score: '1-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '27 Sept 2025',
          team: 'Leeds United',
          opponent: 'Bournemouth',
          score: '2-2',
          outcome: 'Draw',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '20 Sept 2025',
          team: 'Leeds United',
          opponent: 'Wolverhampton',
          score: '1-3',
          outcome: 'Loss',
          venue: 'Away'
        }
      ]
    },
    { 
      name: 'Anton Stach', 
      position: 'Midfielder', 
      shirtNumber: 18, 
      weeklyWage: 50000, 
      yearlyWage: 2.6,
      age: 26,
      bio: {
        height: '192 cm',
        nationality: 'Germany',
        dateOfBirth: '1998-11-15',
        preferredFoot: 'Both',
        description: 'Anton Stach is 26 years old (Nov 15, 1998), 192 cm tall and plays for Leeds United. Anton Stach prefers to play with both feet. His jersey number is 18. Anton Stach career statistics, match ratings, heatmap and goals are available on  for current and previous seasons. Last player match was Nottingham Forest - Leeds United (3 - 1) and Anton Stach received 7  rating.',
        nationalTeam: 'Germany',
        nationalTeamDebut: '26 Mar 2022',
        nationalTeamAppearances: 2,
        nationalTeamGoals: 0
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 10,
            minutes: 800,
            appearances: 10,
            started: 9,
            minutesPerGame: 80,
            totalMinutes: 800,
            teamOfTheWeek: 1,
            cleanSheets: null,
            goalsConceded: null,
            // Attacking
            goals: 1,
            expectedGoals: 0.88,
            scoringFrequency: 800,
            goalsPerGame: 0.1,
            totalShots: 1.5,
            shotsOnTargetPerGame: 0.4,
            bigChancesMissed: 1,
            goalConversion: 7,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: '1/3',
            freeKickConversion: 33,
            goalsFromInsideBox: '0/8',
            goalsFromOutsideBox: '1/7',
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 1,
            penaltyWon: 0,
            // Passing
            assists: 1,
            expectedAssists: 0.77,
            touches: 51.5,
            bigChancesCreated: 2,
            keyPasses: 1.6,
            accuratePasses: 29.1,
            accuratePassesPercentage: 79,
            accOwnHalf: 12.8,
            accOwnHalfPercentage: 84,
            accOppositionHalf: 16.9,
            accOppositionHalfPercentage: 71,
            longBallsAccurate: 1.9,
            longBallsPercentage: 61,
            accurateChipPasses: 1.6,
            accurateChipPassesPercentage: 64,
            accurateCrosses: 0.7,
            // Defending
            interceptions: 0.5,
            tacklesPerGame: 1.5,
            possessionWonFinalThird: 0.8,
            ballsRecoveredPerGame: 3.3,
            dribbledPastPerGame: 0.1,
            clearancesPerGame: 2.0,
            blockedShotsPerGame: 0.2,
            errorsLeadingToShot: 1,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 1,
            // Other
            succDribbles: 0.6,
            succDribblesPercentage: 40,
            totalDuelsWon: 4.9,
            totalDuelsWonPercentage: 60,
            groundDuelsWon: 3.2,
            groundDuelsWonPercentage: 52,
            aerialDuelsWon: 1.7,
            aerialDuelsWonPercentage: 85,
            possessionLost: 11.8,
            foulsPerGame: 1.4,
            wasFouled: 1.2,
            offsides: 0.0,
            goalKicksPerGame: null,
            // Cards
            yellowCards: 1,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      },
      transferHistory: [
        {
          date: '22 Jul 2025',
          from: 'TSG Hoffenheim',
          to: 'Leeds United',
          fee: '£17.0M',
          type: 'Permanent transfer'
        },
        {
          date: '1 Sept 2023',
          from: '1. FSV Mainz 05',
          to: 'TSG Hoffenheim',
          fee: '£9.4M',
          type: 'Permanent transfer'
        },
        {
          date: '31 Jul 2021',
          from: 'SpVgg Greuther Fürth',
          to: '1. FSV Mainz 05',
          fee: '£3.8M',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jul 2020',
          from: 'SSV Jeddeloh',
          to: 'SpVgg Greuther Fürth',
          fee: 'Free',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jul 2017',
          from: 'VfL Osnabrück U19',
          to: 'SSV Jeddeloh',
          fee: 'Free',
          type: 'Permanent transfer'
        }
      ],
      previousMatches: [
        {
          competition: 'Premier League',
          date: '09 Nov 2025',
          team: 'Leeds United',
          opponent: 'Nottingham Forest',
          score: '3-1',
          outcome: 'Loss',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '01 Nov 2025',
          team: 'Leeds United',
          opponent: 'Brighton & Hove Albion',
          score: '1-1',
          outcome: 'Draw',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '18 Oct 2025',
          team: 'Leeds United',
          opponent: 'Burnley',
          score: '2-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '04 Oct 2025',
          team: 'Leeds United',
          opponent: 'Tottenham Hotspur',
          score: '1-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '27 Sept 2025',
          team: 'Leeds United',
          opponent: 'Bournemouth',
          score: '2-2',
          outcome: 'Draw',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '20 Sept 2025',
          team: 'Leeds United',
          opponent: 'Wolverhampton',
          score: '1-3',
          outcome: 'Loss',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '13 Sept 2025',
          team: 'Leeds United',
          opponent: 'Fulham',
          score: '1-0',
          outcome: 'Win',
          venue: 'Away'
        }
      ]
    },
    { 
      name: 'Ao Tanaka', 
      position: 'Midfielder', 
      shirtNumber: 22, 
      weeklyWage: 40000, 
      yearlyWage: 2.08,
      age: 27,
      bio: {
        height: '180 cm',
        nationality: 'Japan',
        dateOfBirth: '1998-09-10',
        preferredFoot: 'Right',
        description: 'Ao Tanaka is 27 years old (Sep 10, 1998), 180 cm tall and plays for Leeds United. Ao Tanaka prefers to play with right foot. His jersey number is 22.',
        nationalTeam: 'Japan',
        nationalTeamDebut: '14 Dec 2019',
        nationalTeamAppearances: 34,
        nationalTeamGoals: 8
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 8,
            minutes: 334,
            appearances: 8,
            started: 4,
            minutesPerGame: 42,
            totalMinutes: 334,
            teamOfTheWeek: 0,
            cleanSheets: null,
            goalsConceded: null,
            // Attacking
            goals: 0,
            expectedGoals: 0.16,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 0.4,
            shotsOnTargetPerGame: 0.0,
            bigChancesMissed: 0,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '0/1',
            goalsFromOutsideBox: '0/2',
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0.12,
            touches: 30.3,
            bigChancesCreated: 0,
            keyPasses: 0.5,
            accuratePasses: 22.0,
            accuratePassesPercentage: 88,
            accOwnHalf: 12.5,
            accOwnHalfPercentage: 93,
            accOppositionHalf: 9.6,
            accOppositionHalfPercentage: 79,
            longBallsAccurate: 0.5,
            longBallsPercentage: 50,
            accurateChipPasses: 0.6,
            accurateChipPassesPercentage: 38,
            accurateCrosses: 0.1,
            // Defending
            interceptions: 0.9,
            tacklesPerGame: 0.3,
            possessionWonFinalThird: 0.3,
            ballsRecoveredPerGame: 2.3,
            dribbledPastPerGame: 0.8,
            clearancesPerGame: 0.0,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 1,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.0,
            succDribblesPercentage: 0,
            totalDuelsWon: 0.9,
            totalDuelsWonPercentage: 28,
            groundDuelsWon: 0.5,
            groundDuelsWonPercentage: 22,
            aerialDuelsWon: 0.4,
            aerialDuelsWonPercentage: 43,
            possessionLost: 4.8,
            foulsPerGame: 0.4,
            wasFouled: 0.3,
            offsides: 0.0,
            goalKicksPerGame: null,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      },
      transferHistory: [
        {
          date: '30 Aug 2024',
          from: 'Fortuna Düsseldorf',
          to: 'Leeds United',
          fee: '£3.4M',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jul 2022',
          from: 'Kawasaki Frontale',
          to: 'Fortuna Düsseldorf',
          fee: '£850K',
          type: 'Permanent transfer'
        },
        {
          date: '30 Jun 2022',
          from: 'Fortuna Düsseldorf',
          to: 'Kawasaki Frontale',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '1 Jul 2021',
          from: 'Kawasaki Frontale',
          to: 'Fortuna Düsseldorf',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '1 Jan 2017',
          from: 'KF Youth',
          to: 'Kawasaki Frontale',
          fee: '-',
          type: 'Youth promotion'
        }
      ],
      previousMatches: [
        {
          competition: 'Premier League',
          date: '01 Nov 2025',
          team: 'Leeds United',
          opponent: 'Brighton & Hove Albion',
          score: '1-1',
          outcome: 'Draw',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '24 Oct 2025',
          team: 'Leeds United',
          opponent: 'West Ham United',
          score: '2-1',
          outcome: 'Win',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '18 Oct 2025',
          team: 'Leeds United',
          opponent: 'Burnley',
          score: '2-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '04 Oct 2025',
          team: 'Leeds United',
          opponent: 'Tottenham Hotspur',
          score: '1-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '27 Sept 2025',
          team: 'Leeds United',
          opponent: 'Bournemouth',
          score: '2-2',
          outcome: 'Draw',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '20 Sept 2025',
          team: 'Leeds United',
          opponent: 'Wolverhampton',
          score: '1-3',
          outcome: 'Loss',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '23 Aug 2025',
          team: 'Leeds United',
          opponent: 'Arsenal',
          score: '2-1',
          outcome: 'Win',
          venue: 'Away'
        }
      ]
    },
    { 
      name: 'Jack Harrison', 
      position: 'Midfielder', 
      shirtNumber: 20, 
      weeklyWage: 55000, 
      yearlyWage: 2.86,
      age: 28,
      bio: {
        height: '175 cm',
        nationality: 'England',
        dateOfBirth: '1996-11-20',
        preferredFoot: 'Left',
        description: 'Jack Harrison is 28 years old (Nov 20, 1996), 175 cm tall and plays for Leeds United. Jack Harrison prefers to play with left foot. His jersey number is 20.'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 10,
            minutes: 262,
            appearances: 10,
            started: 1,
            minutesPerGame: 26,
            totalMinutes: 262,
            teamOfTheWeek: 0,
            cleanSheets: null,
            goalsConceded: null,
            // Attacking
            goals: 0,
            expectedGoals: 0.28,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 0.6,
            shotsOnTargetPerGame: 0.2,
            bigChancesMissed: 1,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '0/2',
            goalsFromOutsideBox: '0/4',
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0.24,
            touches: 18.2,
            bigChancesCreated: 1,
            keyPasses: 0.2,
            accuratePasses: 9.2,
            accuratePassesPercentage: 79,
            accOwnHalf: 3.6,
            accOwnHalfPercentage: 84,
            accOppositionHalf: 5.6,
            accOppositionHalfPercentage: 64,
            longBallsAccurate: 0.3,
            longBallsPercentage: 27,
            accurateChipPasses: 0.4,
            accurateChipPassesPercentage: 44,
            accurateCrosses: 0.2,
            // Defending
            interceptions: 0.4,
            tacklesPerGame: 0.5,
            possessionWonFinalThird: 0.2,
            ballsRecoveredPerGame: 1.3,
            dribbledPastPerGame: 0.3,
            clearancesPerGame: 0.2,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 1,
            // Other
            succDribbles: 0.3,
            succDribblesPercentage: 43,
            totalDuelsWon: 1.3,
            totalDuelsWonPercentage: 54,
            groundDuelsWon: 1.2,
            groundDuelsWonPercentage: 60,
            aerialDuelsWon: 0.1,
            aerialDuelsWonPercentage: 25,
            possessionLost: 5.3,
            foulsPerGame: 0.1,
            wasFouled: 0.4,
            offsides: 0.0,
            goalKicksPerGame: null,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      },
      transferHistory: [
        {
          date: '30 Jun 2025',
          from: 'Everton',
          to: 'Leeds United',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '14 Aug 2023',
          from: 'Leeds United',
          to: 'Everton',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '2 Jul 2021',
          from: 'Manchester City',
          to: 'Leeds United',
          fee: '£10.9M',
          type: 'Permanent transfer'
        },
        {
          date: '31 May 2021',
          from: 'Leeds United',
          to: 'Manchester City',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '30 Jul 2018',
          from: 'Manchester City',
          to: 'Leeds United',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '31 May 2018',
          from: 'Middlesbrough',
          to: 'Manchester City',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '31 Jan 2018',
          from: 'Manchester City',
          to: 'Middlesbrough',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '30 Jan 2018',
          from: 'New York City FC',
          to: 'Manchester City',
          fee: '£3.4M',
          type: 'Permanent transfer'
        },
        {
          date: '15 Jan 2016',
          from: 'Chicago Fire',
          to: 'New York City FC',
          fee: 'Undisclosed',
          type: 'Permanent transfer'
        },
        {
          date: '14 Jan 2016',
          from: 'Wake Forest',
          to: 'Chicago Fire',
          fee: '-',
          type: 'Permanent transfer'
        },
        {
          date: '1 Aug 2015',
          from: 'Manhattan SC',
          to: 'Wake Forest',
          fee: 'Free',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jul 2013',
          from: 'Black Rock FC',
          to: 'Manhattan SC',
          fee: 'Free',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jul 2010',
          from: 'Man Utd Youth',
          to: 'Black Rock FC',
          fee: 'Free',
          type: 'Permanent transfer'
        }
      ],
      previousMatches: [
        {
          competition: 'Premier League',
          date: '09 Nov 2025',
          team: 'Leeds United',
          opponent: 'Nottingham Forest',
          score: '3-1',
          outcome: 'Loss',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '01 Nov 2025',
          team: 'Leeds United',
          opponent: 'Brighton & Hove Albion',
          score: '1-1',
          outcome: 'Draw',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '24 Oct 2025',
          team: 'Leeds United',
          opponent: 'West Ham United',
          score: '2-1',
          outcome: 'Win',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '18 Oct 2025',
          team: 'Leeds United',
          opponent: 'Burnley',
          score: '2-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '04 Oct 2025',
          team: 'Leeds United',
          opponent: 'Tottenham Hotspur',
          score: '1-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '27 Sept 2025',
          team: 'Leeds United',
          opponent: 'Bournemouth',
          score: '2-2',
          outcome: 'Draw',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '20 Sept 2025',
          team: 'Leeds United',
          opponent: 'Wolverhampton',
          score: '1-3',
          outcome: 'Loss',
          venue: 'Away'
        }
      ]
    },
    // Forwards
    { 
      name: 'Dominic Calvert-Lewin', 
      position: 'Forward', 
      shirtNumber: 9, 
      weeklyWage: 70000, 
      yearlyWage: 3.64,
      age: 28,
      bio: {
        height: '187 cm',
        nationality: 'England',
        dateOfBirth: '1997-03-16',
        preferredFoot: 'Right',
        description: 'Dominic Calvert-Lewin is 28 years old (Mar 16, 1997), 187 cm tall and plays for Leeds United. Dominic Calvert-Lewin prefers to play with right foot. His jersey number is 9. Dominic Calvert-Lewin career statistics, match ratings, heatmap and goals are available on  for current and previous seasons. Last player match was Nottingham Forest - Leeds United (3 - 1) and Dominic Calvert-Lewin received 6.3  rating.',
        nationalTeam: 'England',
        nationalTeamDebut: '8 Oct 2020',
        nationalTeamAppearances: 11,
        nationalTeamGoals: 4
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 9,
            minutes: 615,
            appearances: 9,
            started: 7,
            minutesPerGame: 68,
            totalMinutes: 615,
            teamOfTheWeek: 0,
            cleanSheets: null,
            goalsConceded: null,
            // Attacking
            goals: 1,
            expectedGoals: 2.02,
            scoringFrequency: 615,
            goalsPerGame: 0.1,
            totalShots: 1.9,
            shotsOnTargetPerGame: 0.9,
            bigChancesMissed: 6,
            goalConversion: 6,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '1/15',
            goalsFromOutsideBox: '0/2',
            headedGoals: 1,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0.48,
            touches: 22.7,
            bigChancesCreated: 1,
            keyPasses: 0.9,
            accuratePasses: 7.9,
            accuratePassesPercentage: 69,
            accOwnHalf: 2.3,
            accOwnHalfPercentage: 88,
            accOppositionHalf: 5.6,
            accOppositionHalfPercentage: 63,
            longBallsAccurate: 0.2,
            longBallsPercentage: 67,
            accurateChipPasses: 0.2,
            accurateChipPassesPercentage: 40,
            accurateCrosses: 0.0,
            // Defending
            interceptions: 0.1,
            tacklesPerGame: 0.3,
            possessionWonFinalThird: 0.6,
            ballsRecoveredPerGame: 1.3,
            dribbledPastPerGame: 0.1,
            clearancesPerGame: 0.4,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.2,
            succDribblesPercentage: 18,
            totalDuelsWon: 4.7,
            totalDuelsWonPercentage: 38,
            groundDuelsWon: 1.6,
            groundDuelsWonPercentage: 33,
            aerialDuelsWon: 3.1,
            aerialDuelsWonPercentage: 41,
            possessionLost: 8.4,
            foulsPerGame: 1.1,
            wasFouled: 1.0,
            offsides: 0.4,
            goalKicksPerGame: null,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      },
      transferHistory: [
        {
          date: '15 Aug 2025',
          from: 'Everton',
          to: 'Leeds United',
          fee: 'Free',
          type: 'Permanent transfer'
        },
        {
          date: '31 Aug 2016',
          from: 'Sheffield United',
          to: 'Everton',
          fee: '£1.5M',
          type: 'Permanent transfer'
        },
        {
          date: '3 Jan 2016',
          from: 'Northampton Town',
          to: 'Sheffield United',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '7 Aug 2015',
          from: 'Sheffield United',
          to: 'Northampton Town',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '3 Feb 2015',
          from: 'Stalybridge Celtic',
          to: 'Sheffield United',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '23 Dec 2014',
          from: 'Sheffield United',
          to: 'Stalybridge Celtic',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '1 Jul 2014',
          from: 'Sheff Utd U18',
          to: 'Sheffield United',
          fee: '-',
          type: 'Youth promotion'
        }
      ],
      previousMatches: [
        {
          competition: 'Premier League',
          date: '09 Nov 2025',
          team: 'Leeds United',
          opponent: 'Nottingham Forest',
          score: '3-1',
          outcome: 'Loss',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '01 Nov 2025',
          team: 'Leeds United',
          opponent: 'Brighton & Hove Albion',
          score: '1-1',
          outcome: 'Draw',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '24 Oct 2025',
          team: 'Leeds United',
          opponent: 'West Ham United',
          score: '2-1',
          outcome: 'Win',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '18 Oct 2025',
          team: 'Leeds United',
          opponent: 'Burnley',
          score: '2-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '04 Oct 2025',
          team: 'Leeds United',
          opponent: 'Tottenham Hotspur',
          score: '1-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '27 Sept 2025',
          team: 'Leeds United',
          opponent: 'Bournemouth',
          score: '2-2',
          outcome: 'Draw',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '20 Sept 2025',
          team: 'Leeds United',
          opponent: 'Wolverhampton',
          score: '1-3',
          outcome: 'Loss',
          venue: 'Away'
        }
      ]
    },
    { 
      name: 'Noah Okafor', 
      position: 'Forward', 
      shirtNumber: 19, 
      weeklyWage: 60000, 
      yearlyWage: 3.12,
      age: 25,
      bio: {
        height: '185 cm',
        nationality: 'Switzerland',
        dateOfBirth: '2000-05-24',
        preferredFoot: 'Right',
        description: 'Noah Okafor is 25 years old (May 24, 2000), 185 cm tall and plays for Leeds United. Noah Okafor prefers to play with right foot. His jersey number is 19. Noah Okafor career statistics, match ratings, heatmap and goals are available on  for current and previous seasons. Last player match was Nottingham Forest - Leeds United (3 - 1) and Noah Okafor received 6.5  rating.',
        nationalTeam: 'Switzerland',
        nationalTeamDebut: '9 Jun 2019',
        nationalTeamAppearances: 24,
        nationalTeamGoals: 2
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 8,
            minutes: 520,
            appearances: 8,
            started: 7,
            minutesPerGame: 65,
            totalMinutes: 520,
            teamOfTheWeek: 0,
            cleanSheets: null,
            goalsConceded: null,
            // Attacking
            goals: 2,
            expectedGoals: 1.36,
            scoringFrequency: 260,
            goalsPerGame: 0.3,
            totalShots: 1.0,
            shotsOnTargetPerGame: 0.4,
            bigChancesMissed: 1,
            goalConversion: 25,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '2/7',
            goalsFromOutsideBox: '0/1',
            headedGoals: 0,
            leftFootedGoals: 1,
            rightFootedGoals: 1,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0.47,
            touches: 30.6,
            bigChancesCreated: 2,
            keyPasses: 0.6,
            accuratePasses: 10.0,
            accuratePassesPercentage: 73,
            accOwnHalf: 3.1,
            accOwnHalfPercentage: 78,
            accOppositionHalf: 7.0,
            accOppositionHalfPercentage: 62,
            longBallsAccurate: 1.3,
            longBallsPercentage: 77,
            accurateChipPasses: 1.4,
            accurateChipPassesPercentage: 73,
            accurateCrosses: 0.3,
            // Defending
            interceptions: 0.5,
            tacklesPerGame: 1.3,
            possessionWonFinalThird: 0.3,
            ballsRecoveredPerGame: 2.9,
            dribbledPastPerGame: 0.5,
            clearancesPerGame: 0.4,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 2.1,
            succDribblesPercentage: 45,
            totalDuelsWon: 4.8,
            totalDuelsWonPercentage: 45,
            groundDuelsWon: 4.3,
            groundDuelsWonPercentage: 44,
            aerialDuelsWon: 0.5,
            aerialDuelsWonPercentage: 57,
            possessionLost: 12.5,
            foulsPerGame: 1.0,
            wasFouled: 0.9,
            offsides: 0.0,
            goalKicksPerGame: null,
            // Cards
            yellowCards: 2,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      },
      transferHistory: [
        {
          date: '21 Aug 2025',
          from: 'Napoli',
          to: 'Leeds United',
          fee: '£16.2M',
          type: 'Permanent transfer'
        },
        {
          date: '3 Feb 2025',
          from: 'Milan',
          to: 'Napoli',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '22 Jul 2023',
          from: 'Red Bull Salzburg',
          to: 'Milan',
          fee: '£11.9M',
          type: 'Permanent transfer'
        },
        {
          date: '31 Jan 2020',
          from: 'Basel',
          to: 'Red Bull Salzburg',
          fee: '£9.5M',
          type: 'Permanent transfer'
        },
        {
          date: '31 Jan 2018',
          from: 'Basel II U21',
          to: 'Basel',
          fee: '-',
          type: 'Youth promotion'
        },
        {
          date: '17 Oct 2017',
          from: 'FC Basel U18',
          to: 'Basel II U21',
          fee: '-',
          type: 'Youth promotion'
        }
      ],
      previousMatches: [
        {
          competition: 'Premier League',
          date: '09 Nov 2025',
          team: 'Leeds United',
          opponent: 'Nottingham Forest',
          score: '3-1',
          outcome: 'Loss',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '01 Nov 2025',
          team: 'Leeds United',
          opponent: 'Brighton & Hove Albion',
          score: '1-1',
          outcome: 'Draw',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '24 Oct 2025',
          team: 'Leeds United',
          opponent: 'West Ham United',
          score: '2-1',
          outcome: 'Win',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '18 Oct 2025',
          team: 'Leeds United',
          opponent: 'Burnley',
          score: '2-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '04 Oct 2025',
          team: 'Leeds United',
          opponent: 'Tottenham Hotspur',
          score: '1-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '27 Sept 2025',
          team: 'Leeds United',
          opponent: 'Bournemouth',
          score: '2-2',
          outcome: 'Draw',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '20 Sept 2025',
          team: 'Leeds United',
          opponent: 'Wolverhampton',
          score: '1-3',
          outcome: 'Loss',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '13 Sept 2025',
          team: 'Leeds United',
          opponent: 'Fulham',
          score: '1-0',
          outcome: 'Win',
          venue: 'Away'
        }
      ]
    },
    { 
      name: 'Daniel James', 
      position: 'Forward', 
      shirtNumber: 7, 
      weeklyWage: 50000, 
      yearlyWage: 2.6,
      age: 28,
      bio: {
        height: '172 cm',
        nationality: 'Wales',
        dateOfBirth: '1997-11-10',
        preferredFoot: 'Right',
        description: 'Daniel James is 28 years old (Nov 10, 1997), 172 cm tall and plays for Leeds United. Daniel James prefers to play with right foot. His jersey number is 7.',
        nationalTeam: 'Wales',
        nationalTeamDebut: '20 Nov 2018',
        nationalTeamAppearances: 59,
        nationalTeamGoals: 8
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 8,
            minutes: 293,
            appearances: 8,
            started: 3,
            minutesPerGame: 37,
            totalMinutes: 293,
            teamOfTheWeek: 0,
            cleanSheets: null,
            goalsConceded: null,
            // Attacking
            goals: 0,
            expectedGoals: 0.49,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 0.9,
            shotsOnTargetPerGame: 0.1,
            bigChancesMissed: 1,
            goalConversion: 0,
            penaltyGoals: 0,
            penaltyConversion: 0,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '0/3',
            goalsFromOutsideBox: '0/4',
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 0,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0.53,
            touches: 14.6,
            bigChancesCreated: 1,
            keyPasses: 0.8,
            accuratePasses: 3.6,
            accuratePassesPercentage: 54,
            accOwnHalf: 1.3,
            accOwnHalfPercentage: 67,
            accOppositionHalf: 2.8,
            accOppositionHalfPercentage: 37,
            longBallsAccurate: 0.1,
            longBallsPercentage: 25,
            accurateChipPasses: 0.3,
            accurateChipPassesPercentage: 33,
            accurateCrosses: 0.5,
            // Defending
            interceptions: 0.0,
            tacklesPerGame: 0.3,
            possessionWonFinalThird: 0.1,
            ballsRecoveredPerGame: 1.3,
            dribbledPastPerGame: 0.4,
            clearancesPerGame: 0.1,
            blockedShotsPerGame: 0.0,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.1,
            succDribblesPercentage: 13,
            totalDuelsWon: 1.1,
            totalDuelsWonPercentage: 41,
            groundDuelsWon: 0.9,
            groundDuelsWonPercentage: 37,
            aerialDuelsWon: 0.3,
            aerialDuelsWonPercentage: 67,
            possessionLost: 7.3,
            foulsPerGame: 0.1,
            wasFouled: 0.5,
            offsides: 0.0,
            goalKicksPerGame: null,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      },
      transferHistory: [
        {
          date: '31 May 2023',
          from: 'Fulham',
          to: 'Leeds United',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '1 Sept 2022',
          from: 'Leeds United',
          to: 'Fulham',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '31 Aug 2021',
          from: 'Manchester United',
          to: 'Leeds United',
          fee: '£23.8M',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jul 2019',
          from: 'Swansea City',
          to: 'Manchester United',
          fee: '£14.5M',
          type: 'Permanent transfer'
        },
        {
          date: '1 Jul 2018',
          from: 'Shrewsbury Town',
          to: 'Swansea City',
          fee: '-',
          type: 'End of loan'
        },
        {
          date: '1 Jul 2017',
          from: 'Swansea City U21',
          to: 'Shrewsbury Town',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '1 Jul 2016',
          from: 'Swansea City U18',
          to: 'Swansea City U21',
          fee: '-',
          type: 'Youth promotion'
        }
      ],
      previousMatches: [
        {
          competition: 'Premier League',
          date: '09 Nov 2025',
          team: 'Leeds United',
          opponent: 'Nottingham Forest',
          score: '3-1',
          outcome: 'Loss',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '01 Nov 2025',
          team: 'Leeds United',
          opponent: 'Brighton & Hove Albion',
          score: '1-1',
          outcome: 'Draw',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '24 Oct 2025',
          team: 'Leeds United',
          opponent: 'West Ham United',
          score: '2-1',
          outcome: 'Win',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '18 Oct 2025',
          team: 'Leeds United',
          opponent: 'Burnley',
          score: '2-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '13 Sept 2025',
          team: 'Leeds United',
          opponent: 'Fulham',
          score: '1-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '30 Aug 2025',
          team: 'Leeds United',
          opponent: 'Newcastle United',
          score: '2-1',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '23 Aug 2025',
          team: 'Leeds United',
          opponent: 'Arsenal',
          score: '2-1',
          outcome: 'Win',
          venue: 'Away'
        }
      ]
    },
    { 
      name: 'Lukas Nmecha', 
      position: 'Forward', 
      shirtNumber: 14, 
      weeklyWage: 55000, 
      yearlyWage: 2.86,
      age: 26,
      bio: {
        height: '185 cm',
        nationality: 'Germany',
        dateOfBirth: '1998-12-14',
        preferredFoot: 'Right',
        description: 'Lukas Nmecha is 26 years old (Dec 14, 1998), 185 cm tall and plays for Leeds United. Lukas Nmecha prefers to play with right foot. His jersey number is 14.',
        nationalTeam: 'Germany',
        nationalTeamDebut: '11 Nov 2021',
        nationalTeamAppearances: 7,
        nationalTeamGoals: 0
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 11,
            minutes: 279,
            appearances: 11,
            started: 2,
            minutesPerGame: 25,
            totalMinutes: 279,
            teamOfTheWeek: 0,
            cleanSheets: null,
            goalsConceded: null,
            // Attacking
            goals: 2,
            expectedGoals: 2.17,
            scoringFrequency: 140,
            goalsPerGame: 0.2,
            totalShots: 0.7,
            shotsOnTargetPerGame: 0.4,
            bigChancesMissed: 2,
            goalConversion: 25,
            penaltyGoals: 1,
            penaltyConversion: 100,
            freeKickGoals: 0,
            freeKickConversion: 0,
            goalsFromInsideBox: '2/8',
            goalsFromOutsideBox: '0/0',
            headedGoals: 0,
            leftFootedGoals: 0,
            rightFootedGoals: 2,
            penaltyWon: 0,
            // Passing
            assists: 0,
            expectedAssists: 0.05,
            touches: 9.2,
            bigChancesCreated: 0,
            keyPasses: 0.0,
            accuratePasses: 3.1,
            accuratePassesPercentage: 71,
            accOwnHalf: 1.2,
            accOwnHalfPercentage: 93,
            accOppositionHalf: 1.7,
            accOppositionHalfPercentage: 54,
            longBallsAccurate: 0.0,
            longBallsPercentage: 0,
            accurateChipPasses: 0.0,
            accurateChipPassesPercentage: 0,
            accurateCrosses: 0.0,
            // Defending
            interceptions: 0.09,
            tacklesPerGame: 0.09,
            possessionWonFinalThird: 0.09,
            ballsRecoveredPerGame: 0.6,
            dribbledPastPerGame: 0.09,
            clearancesPerGame: 0.6,
            blockedShotsPerGame: 0.09,
            errorsLeadingToShot: 0,
            errorsLeadingToGoal: 0,
            penaltiesCommitted: 0,
            // Other
            succDribbles: 0.0,
            succDribblesPercentage: 0,
            totalDuelsWon: 1.3,
            totalDuelsWonPercentage: 38,
            groundDuelsWon: 0.5,
            groundDuelsWonPercentage: 30,
            aerialDuelsWon: 0.7,
            aerialDuelsWonPercentage: 47,
            possessionLost: 3.1,
            foulsPerGame: 0.5,
            wasFouled: 0.5,
            offsides: 0.0,
            goalKicksPerGame: null,
            // Cards
            yellowCards: 0,
            redCards2Yellows: 0,
            redCards: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      },
      transferHistory: [
        {
          date: '1 Jul 2025',
          from: 'VfL Wolfsburg',
          to: 'Leeds United',
          fee: 'Free',
          type: 'Permanent transfer'
        },
        {
          date: '16 Jul 2021',
          from: 'RSC Anderlecht',
          to: 'VfL Wolfsburg',
          fee: '£6.8M',
          type: 'Permanent transfer'
        },
        {
          date: '20 Aug 2020',
          from: 'VfL Wolfsburg',
          to: 'RSC Anderlecht',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '3 Jan 2020',
          from: 'VfL Wolfsburg',
          to: 'Middlesbrough',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '3 Aug 2019',
          from: 'Manchester City',
          to: 'VfL Wolfsburg',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '9 Aug 2018',
          from: 'Manchester City U21',
          to: 'Preston North End',
          fee: '-',
          type: 'Loan'
        },
        {
          date: '1 Jul 2017',
          from: 'Manchester City U18',
          to: 'Manchester City U21',
          fee: '-',
          type: 'Youth promotion'
        }
      ],
      previousMatches: [
        {
          competition: 'Premier League',
          date: '09 Nov 2025',
          team: 'Leeds United',
          opponent: 'Nottingham Forest',
          score: '3-1',
          outcome: 'Loss',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '01 Nov 2025',
          team: 'Leeds United',
          opponent: 'Brighton & Hove Albion',
          score: '1-1',
          outcome: 'Draw',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '24 Oct 2025',
          team: 'Leeds United',
          opponent: 'West Ham United',
          score: '2-1',
          outcome: 'Win',
          venue: 'Home'
        },
        {
          competition: 'Premier League',
          date: '18 Oct 2025',
          team: 'Leeds United',
          opponent: 'Burnley',
          score: '2-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '04 Oct 2025',
          team: 'Leeds United',
          opponent: 'Tottenham Hotspur',
          score: '1-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '13 Sept 2025',
          team: 'Leeds United',
          opponent: 'Fulham',
          score: '1-0',
          outcome: 'Win',
          venue: 'Away'
        },
        {
          competition: 'Premier League',
          date: '30 Aug 2025',
          team: 'Leeds United',
          opponent: 'Newcastle United',
          score: '2-1',
          outcome: 'Win',
          venue: 'Away'
        }
      ]
    }
  ].map(player => ({
    ...player,
    // Use local image if available, otherwise fallback to avatar
    imageUrl: `/player-images/leeds-united/${sanitizePlayerImageName(player.name)}.png`
  }))
};

// Get player edits from localStorage
const getPlayerEdits = (club: string): Record<string, { 
  position?: string; 
  age?: number; 
  shirtNumber?: number; 
  imageUrl?: string; 
  seasonStats?: PlayerSeasonStats; 
  bio?: any;
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
}> => {
  try {
    const savedPlayers = JSON.parse(localStorage.getItem('playerEdits') || '{}');
    return savedPlayers[club] || {};
  } catch {
    return {};
  }
};

// Get player images from localStorage
const getPlayerImages = (club: string): Record<string, string> => {
  try {
    const imageData = localStorage.getItem('playerImages') || '{}';
    const images = JSON.parse(imageData);
    return images[club] || {};
  } catch {
    return {};
  }
};

export const getSquad = (club: string): Player[] => {
  // Get base squad data
  const baseSquad = clubSquads[club] || generateSquad(club, 25, wageTiers.midtable);
  
  // Get edits and images from localStorage
  const edits = getPlayerEdits(club);
  const images = getPlayerImages(club);

  // Merge localStorage data with base squad data
  return baseSquad.map(player => {
    const edit = edits[player.name];
    const image = images[player.name];
    
    // Merge bio objects properly, preserving all fields
    const mergedBio = edit?.bio && Object.keys(edit.bio).length > 0
      ? { ...player.bio, ...edit.bio }
      : player.bio;
    
    return {
      ...player,
      position: edit?.position || player.position,
      age: edit?.age || player.age,
      shirtNumber: edit?.shirtNumber !== undefined ? edit.shirtNumber : player.shirtNumber,
      imageUrl: image || edit?.imageUrl || player.imageUrl,
      // Prefer base player seasonStats if it exists and has content, otherwise use edit data
      seasonStats: (player.seasonStats && player.seasonStats.competitions && player.seasonStats.competitions.length > 0)
        ? player.seasonStats
        : (edit?.seasonStats && edit.seasonStats.competitions && edit.seasonStats.competitions.length > 0)
          ? edit.seasonStats
          : player.seasonStats,
      bio: mergedBio,
      // Prefer base player data if it exists and has content, otherwise use edit data
      transferHistory: (player.transferHistory && player.transferHistory.length > 0)
        ? player.transferHistory
        : (edit?.transferHistory && edit.transferHistory.length > 0)
          ? edit.transferHistory
          : player.transferHistory,
      previousMatches: (player.previousMatches && player.previousMatches.length > 0)
        ? player.previousMatches
        : (edit?.previousMatches && edit.previousMatches.length > 0)
          ? edit.previousMatches
          : player.previousMatches
    };
  });
};

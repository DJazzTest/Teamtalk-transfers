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

interface Player {
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
  };
}

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

export const clubSquads: Record<string, Player[]> = {
  'Arsenal': [
    // Goalkeepers
    { 
      name: 'David Raya', 
      position: 'Goalkeeper', 
      shirtNumber: 1, 
      weeklyWage: 85000, 
      yearlyWage: 4.42,
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 10,
            minutes: 900,
            cleanSheets: 7,
            goalsConceded: 3
          },
          {
            competition: 'Champions League',
            matches: 4,
            minutes: 360,
            cleanSheets: 4,
            goalsConceded: 0
          }
        ],
        injuries: {
          timeOut: 'No time out this season for injuries'
        }
      }
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
        preferredFoot: 'Right'
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
            savesFromOutsideBox: 33,
            savesCaught: 0,
            savesParried: 15,
            cleanSheets: 8,
            // Attacking
            goals: 0,
            expectedGoals: 0.06,
            scoringFrequency: 0,
            goalsPerGame: 0.0,
            totalShots: 0.03,
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
            expectedAssists: 0.05,
            touches: 38.6,
            bigChancesCreated: 0,
            keyPasses: 0.03,
            accuratePasses: 20.5,
            accuratePassesPercentage: 70,
            accOwnHalf: 17.0,
            accOwnHalfPercentage: 91,
            accOppositionHalf: 3.4,
            accOppositionHalfPercentage: 33,
            longBallsAccurate: 5.6,
            longBallsPercentage: 40,
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
            errorsLeadingToShot: 2,
            errorsLeadingToGoal: 1,
            penaltiesCommitted: 2,
            // Other
            succDribbles: 0.03,
            succDribblesPercentage: 100,
            totalDuelsWon: 0.5,
            totalDuelsWonPercentage: 75,
            groundDuelsWon: 0.2,
            groundDuelsWonPercentage: 64,
            aerialDuelsWon: 0.3,
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
      }
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
        preferredFoot: 'Right'
      },
      seasonStats: {
        season: '2025-26',
        competitions: [
          {
            competition: 'Premier League',
            matches: 4,
            minutes: 312,
            appearances: 4,
            started: 4,
            minutesPerGame: 78,
            totalMinutes: 312,
            // Goalkeeping
            goalsConcededPerGame: 1.8,
            goalsConceded: 7,
            cleanSheets: 1,
            // Attacking
            goals: 0,
            goalsPerGame: 0.0,
            penaltyGoals: 0,
            // Passing
            assists: 0,
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
    { name: 'Alexei Rojas', position: 'Goalkeeper', shirtNumber: 51, weeklyWage: 15000, yearlyWage: 0.78 },
    
    // Defenders
    { name: 'William Saliba', position: 'Defender', shirtNumber: 2, weeklyWage: 190000, yearlyWage: 9.88 },
    { name: 'Cristhian Mosquera', position: 'Defender', shirtNumber: 3, weeklyWage: 55000, yearlyWage: 2.86 },
    { name: 'Ben White', position: 'Defender', shirtNumber: 4, weeklyWage: 150000, yearlyWage: 7.8 },
    { name: 'Piero Hincapie', position: 'Defender', shirtNumber: 5, weeklyWage: 50000, yearlyWage: 2.6 },
    { name: 'Gabriel Magalhães', position: 'Defender', shirtNumber: 6, weeklyWage: 150000, yearlyWage: 7.8 },
    { name: 'Jurrien Timber', position: 'Defender', shirtNumber: 12, weeklyWage: 80000, yearlyWage: 4.16 },
    { name: 'Oleksandr Zinchenko', position: 'Defender', shirtNumber: 17, weeklyWage: 150000, yearlyWage: 7.8 },
    { name: 'Riccardo Calafiori', position: 'Defender', shirtNumber: 33, weeklyWage: 120000, yearlyWage: 6.24 },
    { name: 'Myles Lewis-Skelly', position: 'Defender', shirtNumber: 49, weeklyWage: 20000, yearlyWage: 1.04 },
    
    // Midfielders
    { name: 'Martin Ødegaard', position: 'Midfielder', shirtNumber: 8, weeklyWage: 240000, yearlyWage: 12.48 },
    { name: 'Christian Norgaard', position: 'Midfielder', shirtNumber: 16, weeklyWage: 60000, yearlyWage: 3.12 },
    { name: 'Mikel Merino', position: 'Midfielder', shirtNumber: 23, weeklyWage: 130000, yearlyWage: 6.76 },
    { name: 'Martin Zubimendi', position: 'Midfielder', shirtNumber: 36, weeklyWage: 60000, yearlyWage: 3.12 },
    { name: 'Declan Rice', position: 'Midfielder', shirtNumber: 41, weeklyWage: 240000, yearlyWage: 12.48 },
    { name: 'Ethan Nwaneri', position: 'Midfielder', shirtNumber: 53, weeklyWage: 25000, yearlyWage: 1.3 },
    { name: 'Max Dowman', position: 'Midfielder', shirtNumber: 56, weeklyWage: 5000, yearlyWage: 0.26 },
    
    // Forwards
    { name: 'Gabriel Jesus', position: 'Forward', shirtNumber: 9, weeklyWage: 265000, yearlyWage: 13.78 },
    { name: 'Viktor Gyökeres', position: 'Forward', shirtNumber: 14, weeklyWage: 200000, yearlyWage: 10.4 },
    { name: 'Leandro Trossard', position: 'Forward', shirtNumber: 19, weeklyWage: 90000, yearlyWage: 4.68 },
    { name: 'Reiss Nelson', position: 'Forward', shirtNumber: 24, weeklyWage: 100000, yearlyWage: 5.2 },
    { name: 'Kai Havertz', position: 'Forward', shirtNumber: 29, weeklyWage: 280000, yearlyWage: 14.56 },
    { name: 'Noni Madueke', position: 'Forward', shirtNumber: 43, weeklyWage: 65000, yearlyWage: 3.38 },
    { name: 'Eberechi Eze', position: 'Forward', shirtNumber: 45, weeklyWage: 90000, yearlyWage: 4.68 },
    { name: 'Gabriel Martinelli', position: 'Forward', shirtNumber: 11, weeklyWage: 180000, yearlyWage: 9.36 },
    { name: 'Bukayo Saka', position: 'Forward', shirtNumber: 7, weeklyWage: 195000, yearlyWage: 10.14 }
  ].map(player => ({
    ...player,
    imageUrl: `/player-images/arsenal/${player.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.png`
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
    imageUrl: `/player-images/aston-villa/${player.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.png`
  })),
  'Chelsea': generateSquad('Chelsea', 25, wageTiers.top6),
  'Liverpool': generateSquad('Liverpool', 25, wageTiers.top6),
  'Manchester City': generateSquad('Manchester City', 25, wageTiers.top6),
  'Manchester United': generateSquad('Manchester United', 25, wageTiers.top6),
  'Tottenham Hotspur': generateSquad('Tottenham Hotspur', 25, wageTiers.top6),
  
  // European Competition Teams
  'Newcastle United': generateSquad('Newcastle United', 25, wageTiers.european),
  'West Ham United': generateSquad('West Ham United', 25, wageTiers.european),
  'Brighton & Hove Albion': generateSquad('Brighton', 25, wageTiers.european),
  
  // Mid-table Teams
  'Brentford': generateSquad('Brentford', 25, wageTiers.midtable),
  'Crystal Palace': generateSquad('Crystal Palace', 25, wageTiers.midtable),
  'Wolverhampton Wanderers': generateSquad('Wolves', 25, wageTiers.midtable),
  'Fulham': generateSquad('Fulham', 25, wageTiers.midtable),
  
  // Lower Table Teams
  'Nottingham Forest': generateSquad('Nottingham Forest', 25, wageTiers.lower),
  'Everton': generateSquad('Everton', 25, wageTiers.lower),
  'Bournemouth': generateSquad('Bournemouth', 25, wageTiers.lower),
  
  // Newly Promoted Teams
  'Ipswich Town': generateSquad('Ipswich Town', 25, wageTiers.promoted),
  'Sunderland': generateSquad('Sunderland', 25, wageTiers.promoted),
  'Sheffield United': generateSquad('Sheffield United', 25, wageTiers.promoted),
  
  // Championship Team (Leeds United)
  'Leeds United': [
    { name: 'Illan Meslier', position: 'Goalkeeper', weeklyWage: 35000, yearlyWage: 1.82 },
    { name: 'Kristoffer Klaesson', position: 'Goalkeeper', weeklyWage: 15000, yearlyWage: 0.78 },
    { name: 'Robin Koch', position: 'Defender', weeklyWage: 45000, yearlyWage: 2.34 },
    { name: 'Liam Cooper', position: 'Defender', weeklyWage: 40000, yearlyWage: 2.08 },
    { name: 'Pascal Struijk', position: 'Defender', weeklyWage: 30000, yearlyWage: 1.56 },
    { name: 'Junior Firpo', position: 'Defender', weeklyWage: 50000, yearlyWage: 2.6 },
    { name: 'Rasmus Kristensen', position: 'Defender', weeklyWage: 40000, yearlyWage: 2.08 },
    { name: 'Cody Drameh', position: 'Defender', weeklyWage: 20000, yearlyWage: 1.04 },
    { name: 'Leo Hjelde', position: 'Defender', weeklyWage: 15000, yearlyWage: 0.78 },
    { name: 'Tyler Adams', position: 'Midfielder', weeklyWage: 60000, yearlyWage: 3.12 },
    { name: 'Marc Roca', position: 'Midfielder', weeklyWage: 55000, yearlyWage: 2.86 },
    { name: 'Weston McKennie', position: 'Midfielder', weeklyWage: 70000, yearlyWage: 3.64 },
    { name: 'Brenden Aaronson', position: 'Midfielder', weeklyWage: 60000, yearlyWage: 3.12 },
    { name: 'Jack Harrison', position: 'Midfielder', weeklyWage: 55000, yearlyWage: 2.86 },
    { name: 'Luis Sinisterra', position: 'Midfielder', weeklyWage: 65000, yearlyWage: 3.38 },
    { name: 'Crysencio Summerville', position: 'Midfielder', weeklyWage: 30000, yearlyWage: 1.56 },
    { name: 'Sam Greenwood', position: 'Midfielder', weeklyWage: 20000, yearlyWage: 1.04 },
    { name: 'Patrick Bamford', position: 'Forward', weeklyWage: 70000, yearlyWage: 3.64 },
    { name: 'Rodrigo', position: 'Forward', weeklyWage: 100000, yearlyWage: 5.2 },
    { name: 'Georginio Rutter', position: 'Forward', weeklyWage: 45000, yearlyWage: 2.34 },
    { name: 'Joe Gelhardt', position: 'Forward', weeklyWage: 25000, yearlyWage: 1.3 },
    { name: 'Wilfried Gnonto', position: 'Forward', weeklyWage: 30000, yearlyWage: 1.56 },
    { name: 'Sonny Perkins', position: 'Forward', weeklyWage: 10000, yearlyWage: 0.52 },
    { name: 'Darko Gyabi', position: 'Midfielder', weeklyWage: 15000, yearlyWage: 0.78 },
    { name: 'Archie Gray', position: 'Midfielder', weeklyWage: 10000, yearlyWage: 0.52 }
  ].map(player => ({
    ...player,
    // Use local image if available, otherwise fallback to avatar
    imageUrl: `/player-images/leeds-united/${player.name.toLowerCase().replace(/\s+/g, '-')}.png`
  }))
};

// Get player edits from localStorage
const getPlayerEdits = (club: string): Record<string, { position?: string; age?: number; shirtNumber?: number; imageUrl?: string; seasonStats?: PlayerSeasonStats; bio?: any }> => {
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
    
    return {
      ...player,
      position: edit?.position || player.position,
      age: edit?.age || player.age,
      shirtNumber: edit?.shirtNumber !== undefined ? edit.shirtNumber : player.shirtNumber,
      imageUrl: image || edit?.imageUrl || player.imageUrl,
      seasonStats: edit?.seasonStats || player.seasonStats,
      bio: edit?.bio || player.bio
    };
  });
};

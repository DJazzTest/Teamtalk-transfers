export interface TeamComparisonMetric {
  label: string;
  value: string;
}

export interface TeamComparisonSection {
  title: string;
  metrics: TeamComparisonMetric[];
}

export interface TeamComparisonEntry {
  club: string;
  averageRating: number;
  matches: number;
  goalsScored: number;
  goalsConceded: number;
  assists: number;
  radarScores: {
    category: string;
    value: number;
  }[];
  sections: TeamComparisonSection[];
}

export const teamComparisonData: Record<string, TeamComparisonEntry> = {
  'Leeds United': {
    club: 'Leeds United',
    averageRating: 6.86,
    matches: 11,
    goalsScored: 10,
    goalsConceded: 20,
    assists: 4,
    radarScores: [
      { category: 'Attacking', value: 62 },
      { category: 'Passing', value: 58 },
      { category: 'Defending', value: 55 },
      { category: 'Other', value: 51 },
    ],
    sections: [
      {
        title: 'Attacking',
        metrics: [
          { label: 'Goals per game', value: '0.9' },
          { label: 'Shots on target per game', value: '3.5' },
          { label: 'Big chances per game', value: '2.0' },
          { label: 'Big chances missed per game', value: '1.5' },
        ],
      },
      {
        title: 'Passing',
        metrics: [
          { label: 'Ball possession', value: '48.3%' },
          { label: 'Accurate passes per game', value: '353.7 (82.3%)' },
          { label: 'Accurate long balls per game', value: '13.1 (45.9%)' },
        ],
      },
      {
        title: 'Defending',
        metrics: [
          { label: 'Clean sheets', value: '2' },
          { label: 'Goals conceded per game', value: '1.8' },
          { label: 'Interceptions per game', value: '8.7' },
          { label: 'Tackles per game', value: '17.8' },
          { label: 'Clearances per game', value: '26.8' },
          { label: 'Penalty goals conceded', value: '2' },
          { label: 'Saves per game', value: '2.3' },
        ],
      },
      {
        title: 'Other',
        metrics: [
          { label: 'Duels won per game', value: '50.4 (49.1%)' },
          { label: 'Fouls per game', value: '10.0' },
          { label: 'Offsides per game', value: '1.0' },
          { label: 'Goal kicks per game', value: '8.3' },
          { label: 'Throw-ins per game', value: '17.2' },
          { label: 'Yellow cards per game', value: '1.5' },
          { label: 'Red cards', value: '0' },
        ],
      },
    ],
  },
  'Manchester United': {
    club: 'Manchester United',
    averageRating: 7.08,
    matches: 11,
    goalsScored: 19,
    goalsConceded: 18,
    assists: 13,
    radarScores: [
      { category: 'Attacking', value: 78 },
      { category: 'Passing', value: 66 },
      { category: 'Defending', value: 60 },
      { category: 'Other', value: 58 },
    ],
    sections: [
      {
        title: 'Attacking',
        metrics: [
          { label: 'Goals per game', value: '1.7' },
          { label: 'Shots on target per game', value: '5.1' },
          { label: 'Big chances per game', value: '2.5' },
          { label: 'Big chances missed per game', value: '1.6' },
        ],
      },
      {
        title: 'Passing',
        metrics: [
          { label: 'Ball possession', value: '50.6%' },
          { label: 'Accurate passes per game', value: '352.7 (80.6%)' },
          { label: 'Accurate long balls per game', value: '19.1 (55.0%)' },
        ],
      },
      {
        title: 'Defending',
        metrics: [
          { label: 'Clean sheets', value: '1' },
          { label: 'Goals conceded per game', value: '1.6' },
          { label: 'Interceptions per game', value: '7.7' },
          { label: 'Tackles per game', value: '18.3' },
          { label: 'Clearances per game', value: '23.2' },
          { label: 'Penalty goals conceded', value: '0' },
          { label: 'Saves per game', value: '2.5' },
        ],
      },
      {
        title: 'Other',
        metrics: [
          { label: 'Duels won per game', value: '53.5 (50.8%)' },
          { label: 'Fouls per game', value: '9.4' },
          { label: 'Offsides per game', value: '1.6' },
          { label: 'Goal kicks per game', value: '7.7' },
          { label: 'Throw-ins per game', value: '19.4' },
          { label: 'Yellow cards per game', value: '1.2' },
          { label: 'Red cards', value: '1' },
        ],
      },
    ],
  },
  Arsenal: {
    club: 'Arsenal',
    averageRating: 7.25,
    matches: 11,
    goalsScored: 20,
    goalsConceded: 5,
    assists: 14,
    radarScores: [
      { category: 'Attacking', value: 72 },
      { category: 'Passing', value: 79 },
      { category: 'Defending', value: 83 },
      { category: 'Other', value: 70 },
    ],
    sections: [
      {
        title: 'Attacking',
        metrics: [
          { label: 'Goals per game', value: '1.8' },
          { label: 'Shots on target per game', value: '4.7' },
          { label: 'Big chances per game', value: '2.9' },
          { label: 'Big chances missed per game', value: '1.8' },
        ],
      },
      {
        title: 'Passing',
        metrics: [
          { label: 'Ball possession', value: '58.9%' },
          { label: 'Accurate passes per game', value: '428.7 (85.8%)' },
          { label: 'Accurate long balls per game', value: '13.5 (48.1%)' },
        ],
      },
      {
        title: 'Defending',
        metrics: [
          { label: 'Clean sheets', value: '7' },
          { label: 'Goals conceded per game', value: '0.5' },
          { label: 'Interceptions per game', value: '5.7' },
          { label: 'Tackles per game', value: '14.7' },
          { label: 'Clearances per game', value: '23.2' },
          { label: 'Penalty goals conceded', value: '0' },
          { label: 'Saves per game', value: '1.5' },
        ],
      },
      {
        title: 'Other',
        metrics: [
          { label: 'Duels won per game', value: '49.3 (52.1%)' },
          { label: 'Fouls per game', value: '10.5' },
          { label: 'Offsides per game', value: '1.3' },
          { label: 'Goal kicks per game', value: '4.7' },
          { label: 'Throw-ins per game', value: '18.4' },
          { label: 'Yellow cards per game', value: '1.0' },
          { label: 'Red cards', value: '0' },
        ],
      },
    ],
  },
  'Aston Villa': {
    club: 'Aston Villa',
    averageRating: 7.0,
    matches: 11,
    goalsScored: 13,
    goalsConceded: 10,
    assists: 10,
    radarScores: [
      { category: 'Attacking', value: 48 },
      { category: 'Passing', value: 70 },
      { category: 'Defending', value: 70 },
      { category: 'Other', value: 60 },
    ],
    sections: [
      {
        title: 'Attacking',
        metrics: [
          { label: 'Goals per game', value: '1.2' },
          { label: 'Shots on target per game', value: '3.5' },
          { label: 'Big chances per game', value: '1.4' },
          { label: 'Big chances missed per game', value: '1.1' },
        ],
      },
      {
        title: 'Passing',
        metrics: [
          { label: 'Ball possession', value: '53.9%' },
          { label: 'Accurate passes per game', value: '370.7 (85.0%)' },
          { label: 'Accurate long balls per game', value: '14.5 (47.8%)' },
        ],
      },
      {
        title: 'Defending',
        metrics: [
          { label: 'Clean sheets', value: '4' },
          { label: 'Goals conceded per game', value: '0.9' },
          { label: 'Interceptions per game', value: '5.6' },
          { label: 'Tackles per game', value: '14.6' },
          { label: 'Clearances per game', value: '21.9' },
          { label: 'Penalty goals conceded', value: '1' },
          { label: 'Saves per game', value: '2.2' },
        ],
      },
      {
        title: 'Other',
        metrics: [
          { label: 'Duels won per game', value: '45.5 (48.4%)' },
          { label: 'Fouls per game', value: '9.5' },
          { label: 'Offsides per game', value: '1.3' },
          { label: 'Goal kicks per game', value: '8.6' },
          { label: 'Throw-ins per game', value: '15.8' },
          { label: 'Yellow cards per game', value: '1.7' },
          { label: 'Red cards', value: '1' },
        ],
      },
    ],
  },
  Bournemouth: {
    club: 'Bournemouth',
    averageRating: 6.95,
    matches: 11,
    goalsScored: 17,
    goalsConceded: 18,
    assists: 11,
    radarScores: [
      { category: 'Attacking', value: 60 },
      { category: 'Passing', value: 65 },
      { category: 'Defending', value: 47 },
      { category: 'Other', value: 55 },
    ],
    sections: [
      {
        title: 'Attacking',
        metrics: [
          { label: 'Goals per game', value: '1.5' },
          { label: 'Shots on target per game', value: '4.5' },
          { label: 'Big chances per game', value: '1.5' },
          { label: 'Big chances missed per game', value: '0.8' },
        ],
      },
      {
        title: 'Passing',
        metrics: [
          { label: 'Ball possession', value: '50.6%' },
          { label: 'Accurate passes per game', value: '342.8 (81.5%)' },
          { label: 'Accurate long balls per game', value: '17.3 (42.8%)' },
        ],
      },
      {
        title: 'Defending',
        metrics: [
          { label: 'Clean sheets', value: '4' },
          { label: 'Goals conceded per game', value: '1.6' },
          { label: 'Interceptions per game', value: '9.1' },
          { label: 'Tackles per game', value: '17.5' },
          { label: 'Clearances per game', value: '31.7' },
          { label: 'Penalty goals conceded', value: '1' },
          { label: 'Saves per game', value: '3.2' },
        ],
      },
      {
        title: 'Other',
        metrics: [
          { label: 'Duels won per game', value: '49.9 (47.1%)' },
          { label: 'Fouls per game', value: '13.1' },
          { label: 'Offsides per game', value: '2.4' },
          { label: 'Goal kicks per game', value: '7.4' },
          { label: 'Throw-ins per game', value: '19.5' },
          { label: 'Yellow cards per game', value: '2.5' },
          { label: 'Red cards', value: '0' },
        ],
      },
    ],
  },
  Brentford: {
    club: 'Brentford',
    averageRating: 6.9,
    matches: 11,
    goalsScored: 17,
    goalsConceded: 17,
    assists: 8,
    radarScores: [
      { category: 'Attacking', value: 60 },
      { category: 'Passing', value: 50 },
      { category: 'Defending', value: 50 },
      { category: 'Other', value: 58 },
    ],
    sections: [
      {
        title: 'Attacking',
        metrics: [
          { label: 'Goals per game', value: '1.5' },
          { label: 'Shots on target per game', value: '4.5' },
          { label: 'Big chances per game', value: '2.8' },
          { label: 'Big chances missed per game', value: '1.5' },
        ],
      },
      {
        title: 'Passing',
        metrics: [
          { label: 'Ball possession', value: '43.1%' },
          { label: 'Accurate passes per game', value: '275.4 (78.0%)' },
          { label: 'Accurate long balls per game', value: '14.6 (41.8%)' },
        ],
      },
      {
        title: 'Defending',
        metrics: [
          { label: 'Clean sheets', value: '2' },
          { label: 'Goals conceded per game', value: '1.5' },
          { label: 'Interceptions per game', value: '7.6' },
          { label: 'Tackles per game', value: '16.0' },
          { label: 'Clearances per game', value: '28.2' },
          { label: 'Penalty goals conceded', value: '1' },
          { label: 'Saves per game', value: '2.3' },
        ],
      },
      {
        title: 'Other',
        metrics: [
          { label: 'Duels won per game', value: '49.9 (49.5%)' },
          { label: 'Fouls per game', value: '11.5' },
          { label: 'Offsides per game', value: '1.6' },
          { label: 'Goal kicks per game', value: '6.9' },
          { label: 'Throw-ins per game', value: '19.5' },
          { label: 'Yellow cards per game', value: '2.1' },
          { label: 'Red cards', value: '0' },
        ],
      },
    ],
  },
  'Brighton & Hove Albion': {
    club: 'Brighton & Hove Albion',
    averageRating: 6.98,
    matches: 11,
    goalsScored: 17,
    goalsConceded: 15,
    assists: 11,
    radarScores: [
      { category: 'Attacking', value: 60 },
      { category: 'Passing', value: 68 },
      { category: 'Defending', value: 53 },
      { category: 'Other', value: 59 },
    ],
    sections: [
      {
        title: 'Attacking',
        metrics: [
          { label: 'Goals per game', value: '1.5' },
          { label: 'Shots on target per game', value: '4.5' },
          { label: 'Big chances per game', value: '2.1' },
          { label: 'Big chances missed per game', value: '0.9' },
        ],
      },
      {
        title: 'Passing',
        metrics: [
          { label: 'Ball possession', value: '48.8%' },
          { label: 'Accurate passes per game', value: '356.5 (83.4%)' },
          { label: 'Accurate long balls per game', value: '15.6 (49.4%)' },
        ],
      },
      {
        title: 'Defending',
        metrics: [
          { label: 'Clean sheets', value: '2' },
          { label: 'Goals conceded per game', value: '1.4' },
          { label: 'Interceptions per game', value: '7.1' },
          { label: 'Tackles per game', value: '19.7' },
          { label: 'Clearances per game', value: '23.8' },
          { label: 'Penalty goals conceded', value: '1' },
          { label: 'Saves per game', value: '2.3' },
        ],
      },
      {
        title: 'Other',
        metrics: [
          { label: 'Duels won per game', value: '51.7 (48.5%)' },
          { label: 'Fouls per game', value: '12.4' },
          { label: 'Offsides per game', value: '2.2' },
          { label: 'Goal kicks per game', value: '8.0' },
          { label: 'Throw-ins per game', value: '17.3' },
          { label: 'Yellow cards per game', value: '2.5' },
          { label: 'Red cards', value: '0' },
        ],
      },
    ],
  },
  Burnley: {
    club: 'Burnley',
    averageRating: 6.85,
    matches: 11,
    goalsScored: 14,
    goalsConceded: 22,
    assists: 11,
    radarScores: [
      { category: 'Attacking', value: 52 },
      { category: 'Passing', value: 44 },
      { category: 'Defending', value: 33 },
      { category: 'Other', value: 45 },
    ],
    sections: [
      {
        title: 'Attacking',
        metrics: [
          { label: 'Goals per game', value: '1.3' },
          { label: 'Shots on target per game', value: '3.2' },
          { label: 'Big chances per game', value: '1.4' },
          { label: 'Big chances missed per game', value: '0.5' },
        ],
      },
      {
        title: 'Passing',
        metrics: [
          { label: 'Ball possession', value: '38.4%' },
          { label: 'Accurate passes per game', value: '272.8 (77.9%)' },
          { label: 'Accurate long balls per game', value: '15.2 (46.1%)' },
        ],
      },
      {
        title: 'Defending',
        metrics: [
          { label: 'Clean sheets', value: '2' },
          { label: 'Goals conceded per game', value: '2.0' },
          { label: 'Interceptions per game', value: '9.9' },
          { label: 'Tackles per game', value: '16.8' },
          { label: 'Clearances per game', value: '32.7' },
          { label: 'Penalty goals conceded', value: '3' },
          { label: 'Saves per game', value: '4.2' },
        ],
      },
      {
        title: 'Other',
        metrics: [
          { label: 'Duels won per game', value: '46.2 (49.2%)' },
          { label: 'Fouls per game', value: '9.9' },
          { label: 'Offsides per game', value: '1.7' },
          { label: 'Goal kicks per game', value: '10.8' },
          { label: 'Throw-ins per game', value: '15.6' },
          { label: 'Yellow cards per game', value: '1.5' },
          { label: 'Red cards', value: '1' },
        ],
      },
    ],
  },
  Chelsea: {
    club: 'Chelsea',
    averageRating: 7.05,
    matches: 11,
    goalsScored: 21,
    goalsConceded: 11,
    assists: 15,
    radarScores: [
      { category: 'Attacking', value: 76 },
      { category: 'Passing', value: 82 },
      { category: 'Defending', value: 67 },
      { category: 'Other', value: 66 },
    ],
    sections: [
      {
        title: 'Attacking',
        metrics: [
          { label: 'Goals per game', value: '1.9' },
          { label: 'Shots on target per game', value: '5.6' },
          { label: 'Big chances per game', value: '3.4' },
          { label: 'Big chances missed per game', value: '1.7' },
        ],
      },
      {
        title: 'Passing',
        metrics: [
          { label: 'Ball possession', value: '59.7%' },
          { label: 'Accurate passes per game', value: '463.1 (86.8%)' },
          { label: 'Accurate long balls per game', value: '16.3 (51.7%)' },
        ],
      },
      {
        title: 'Defending',
        metrics: [
          { label: 'Clean sheets', value: '5' },
          { label: 'Goals conceded per game', value: '1.0' },
          { label: 'Interceptions per game', value: '10.6' },
          { label: 'Tackles per game', value: '16.0' },
          { label: 'Clearances per game', value: '19.0' },
          { label: 'Penalty goals conceded', value: '0' },
          { label: 'Saves per game', value: '1.7' },
        ],
      },
      {
        title: 'Other',
        metrics: [
          { label: 'Duels won per game', value: '49.6 (51.4%)' },
          { label: 'Fouls per game', value: '11.5' },
          { label: 'Offsides per game', value: '1.9' },
          { label: 'Goal kicks per game', value: '7.1' },
          { label: 'Throw-ins per game', value: '17.5' },
          { label: 'Yellow cards per game', value: '2.0' },
          { label: 'Red cards', value: '0' },
        ],
      },
    ],
  },
  'Crystal Palace': {
    club: 'Crystal Palace',
    averageRating: 6.92,
    matches: 11,
    goalsScored: 14,
    goalsConceded: 9,
    assists: 6,
    radarScores: [
      { category: 'Attacking', value: 52 },
      { category: 'Passing', value: 45 },
      { category: 'Defending', value: 68 },
      { category: 'Other', value: 62 },
    ],
    sections: [
      {
        title: 'Attacking',
        metrics: [
          { label: 'Goals per game', value: '1.3' },
          { label: 'Shots on target per game', value: '4.5' },
          { label: 'Big chances per game', value: '3.1' },
          { label: 'Big chances missed per game', value: '2.1' },
        ],
      },
      {
        title: 'Passing',
        metrics: [
          { label: 'Ball possession', value: '41.7%' },
          { label: 'Accurate passes per game', value: '274.9 (76.9%)' },
          { label: 'Accurate long balls per game', value: '14.9 (41.7%)' },
        ],
      },
      {
        title: 'Defending',
        metrics: [
          { label: 'Clean sheets', value: '5' },
          { label: 'Goals conceded per game', value: '0.8' },
          { label: 'Interceptions per game', value: '9.7' },
          { label: 'Tackles per game', value: '20.2' },
          { label: 'Clearances per game', value: '33.5' },
          { label: 'Penalty goals conceded', value: '1' },
          { label: 'Saves per game', value: '2.3' },
        ],
      },
      {
        title: 'Other',
        metrics: [
          { label: 'Duels won per game', value: '53.0 (51.8%)' },
          { label: 'Fouls per game', value: '10.4' },
          { label: 'Offsides per game', value: '1.5' },
          { label: 'Goal kicks per game', value: '9.0' },
          { label: 'Throw-ins per game', value: '18.2' },
          { label: 'Yellow cards per game', value: '1.7' },
          { label: 'Red cards', value: '0' },
        ],
      },
    ],
  },
  Everton: {
    club: 'Everton',
    averageRating: 6.88,
    matches: 11,
    goalsScored: 12,
    goalsConceded: 13,
    assists: 9,
    radarScores: [
      { category: 'Attacking', value: 44 },
      { category: 'Passing', value: 55 },
      { category: 'Defending', value: 60 },
      { category: 'Other', value: 64 },
    ],
    sections: [
      {
        title: 'Attacking',
        metrics: [
          { label: 'Goals per game', value: '1.1' },
          { label: 'Shots on target per game', value: '3.2' },
          { label: 'Big chances per game', value: '2.1' },
          { label: 'Big chances missed per game', value: '1.5' },
        ],
      },
      {
        title: 'Passing',
        metrics: [
          { label: 'Ball possession', value: '44.9%' },
          { label: 'Accurate passes per game', value: '306.0 (80.0%)' },
          { label: 'Accurate long balls per game', value: '13.1 (45.4%)' },
        ],
      },
      {
        title: 'Defending',
        metrics: [
          { label: 'Clean sheets', value: '3' },
          { label: 'Goals conceded per game', value: '1.2' },
          { label: 'Interceptions per game', value: '7.5' },
          { label: 'Tackles per game', value: '16.7' },
          { label: 'Clearances per game', value: '29.9' },
          { label: 'Penalty goals conceded', value: '1' },
          { label: 'Saves per game', value: '2.6' },
        ],
      },
      {
        title: 'Other',
        metrics: [
          { label: 'Duels won per game', value: '56.3 (51.7%)' },
          { label: 'Fouls per game', value: '10.7' },
          { label: 'Offsides per game', value: '1.3' },
          { label: 'Goal kicks per game', value: '7.0' },
          { label: 'Throw-ins per game', value: '20.6' },
          { label: 'Yellow cards per game', value: '2.4' },
          { label: 'Red cards', value: '0' },
        ],
      },
    ],
  },
  Fulham: {
    club: 'Fulham',
    averageRating: 6.9,
    matches: 11,
    goalsScored: 12,
    goalsConceded: 16,
    assists: 6,
    radarScores: [
      { category: 'Attacking', value: 44 },
      { category: 'Passing', value: 65 },
      { category: 'Defending', value: 50 },
      { category: 'Other', value: 52 },
    ],
    sections: [
      {
        title: 'Attacking',
        metrics: [
          { label: 'Goals per game', value: '1.1' },
          { label: 'Shots on target per game', value: '3.5' },
          { label: 'Big chances per game', value: '1.5' },
          { label: 'Big chances missed per game', value: '0.8' },
        ],
      },
      {
        title: 'Passing',
        metrics: [
          { label: 'Ball possession', value: '50.2%' },
          { label: 'Accurate passes per game', value: '359.7 (83.0%)' },
          { label: 'Accurate long balls per game', value: '18.0 (49.7%)' },
        ],
      },
      {
        title: 'Defending',
        metrics: [
          { label: 'Clean sheets', value: '2' },
          { label: 'Goals conceded per game', value: '1.5' },
          { label: 'Interceptions per game', value: '7.0' },
          { label: 'Tackles per game', value: '16.9' },
          { label: 'Clearances per game', value: '26.7' },
          { label: 'Penalty goals conceded', value: '2' },
          { label: 'Saves per game', value: '3.0' },
        ],
      },
      {
        title: 'Other',
        metrics: [
          { label: 'Duels won per game', value: '46.0 (48.5%)' },
          { label: 'Fouls per game', value: '14.0' },
          { label: 'Offsides per game', value: '1.7' },
          { label: 'Goal kicks per game', value: '7.9' },
          { label: 'Throw-ins per game', value: '20.7' },
          { label: 'Yellow cards per game', value: '1.9' },
          { label: 'Red cards', value: '0' },
        ],
      },
    ],
  },
  Liverpool: {
    club: 'Liverpool',
    averageRating: 7.1,
    matches: 11,
    goalsScored: 18,
    goalsConceded: 17,
    assists: 12,
    radarScores: [
      { category: 'Attacking', value: 68 },
      { category: 'Passing', value: 82 },
      { category: 'Defending', value: 55 },
      { category: 'Other', value: 62 },
    ],
    sections: [
      {
        title: 'Attacking',
        metrics: [
          { label: 'Goals per game', value: '1.6' },
          { label: 'Shots on target per game', value: '4.2' },
          { label: 'Big chances per game', value: '3.0' },
          { label: 'Big chances missed per game', value: '2.2' },
        ],
      },
      {
        title: 'Passing',
        metrics: [
          { label: 'Ball possession', value: '60.6%' },
          { label: 'Accurate passes per game', value: '440.7 (85.3%)' },
          { label: 'Accurate long balls per game', value: '15.3 (45.7%)' },
        ],
      },
      {
        title: 'Defending',
        metrics: [
          { label: 'Clean sheets', value: '3' },
          { label: 'Goals conceded per game', value: '1.5' },
          { label: 'Interceptions per game', value: '6.8' },
          { label: 'Tackles per game', value: '13.2' },
          { label: 'Clearances per game', value: '30.1' },
          { label: 'Penalty goals conceded', value: '1' },
          { label: 'Saves per game', value: '2.4' },
        ],
      },
      {
        title: 'Other',
        metrics: [
          { label: 'Duels won per game', value: '48.2 (51.0%)' },
          { label: 'Fouls per game', value: '10.1' },
          { label: 'Offsides per game', value: '2.2' },
          { label: 'Goal kicks per game', value: '7.5' },
          { label: 'Throw-ins per game', value: '20.6' },
          { label: 'Yellow cards per game', value: '2.1' },
          { label: 'Red cards', value: '0' },
        ],
      },
    ],
  },
  'Manchester City': {
    club: 'Manchester City',
    averageRating: 7.4,
    matches: 11,
    goalsScored: 23,
    goalsConceded: 8,
    assists: 19,
    radarScores: [
      { category: 'Attacking', value: 85 },
      { category: 'Passing', value: 90 },
      { category: 'Defending', value: 78 },
      { category: 'Other', value: 72 },
    ],
    sections: [
      {
        title: 'Attacking',
        metrics: [
          { label: 'Goals per game', value: '2.1' },
          { label: 'Shots on target per game', value: '5.2' },
          { label: 'Big chances per game', value: '3.1' },
          { label: 'Big chances missed per game', value: '2.0' },
        ],
      },
      {
        title: 'Passing',
        metrics: [
          { label: 'Ball possession', value: '56.5%' },
          { label: 'Accurate passes per game', value: '476.9 (87.7%)' },
          { label: 'Accurate long balls per game', value: '12.2 (49.8%)' },
        ],
      },
      {
        title: 'Defending',
        metrics: [
          { label: 'Clean sheets', value: '5' },
          { label: 'Goals conceded per game', value: '0.7' },
          { label: 'Interceptions per game', value: '7.4' },
          { label: 'Tackles per game', value: '14.3' },
          { label: 'Clearances per game', value: '25.8' },
          { label: 'Penalty goals conceded', value: '1' },
          { label: 'Saves per game', value: '2.4' },
        ],
      },
      {
        title: 'Other',
        metrics: [
          { label: 'Duels won per game', value: '49.3 (53.6%)' },
          { label: 'Fouls per game', value: '9.4' },
          { label: 'Offsides per game', value: '0.9' },
          { label: 'Goal kicks per game', value: '5.5' },
          { label: 'Throw-ins per game', value: '20.2' },
          { label: 'Yellow cards per game', value: '1.6' },
          { label: 'Red cards', value: '0' },
        ],
      },
    ],
  },
  'Newcastle United': {
    club: 'Newcastle United',
    averageRating: 6.85,
    matches: 11,
    goalsScored: 11,
    goalsConceded: 14,
    assists: 6,
    radarScores: [
      { category: 'Attacking', value: 45 },
      { category: 'Passing', value: 62 },
      { category: 'Defending', value: 60 },
      { category: 'Other', value: 54 },
    ],
    sections: [
      {
        title: 'Attacking',
        metrics: [
          { label: 'Goals per game', value: '1.0' },
          { label: 'Shots on target per game', value: '3.6' },
          { label: 'Big chances per game', value: '1.8' },
          { label: 'Big chances missed per game', value: '1.3' },
        ],
      },
      {
        title: 'Passing',
        metrics: [
          { label: 'Ball possession', value: '51.2%' },
          { label: 'Accurate passes per game', value: '352.5 (81.6%)' },
          { label: 'Accurate long balls per game', value: '16.7 (45.7%)' },
        ],
      },
      {
        title: 'Defending',
        metrics: [
          { label: 'Clean sheets', value: '5' },
          { label: 'Goals conceded per game', value: '1.3' },
          { label: 'Interceptions per game', value: '7.9' },
          { label: 'Tackles per game', value: '12.5' },
          { label: 'Clearances per game', value: '25.3' },
          { label: 'Penalty goals conceded', value: '1' },
          { label: 'Saves per game', value: '3.4' },
        ],
      },
      {
        title: 'Other',
        metrics: [
          { label: 'Duels won per game', value: '45.9 (48.5%)' },
          { label: 'Fouls per game', value: '11.8' },
          { label: 'Offsides per game', value: '0.5' },
          { label: 'Goal kicks per game', value: '5.8' },
          { label: 'Throw-ins per game', value: '21.6' },
          { label: 'Yellow cards per game', value: '1.2' },
          { label: 'Red cards', value: '2' },
        ],
      },
    ],
  },
  'Nottingham Forest': {
    club: 'Nottingham Forest',
    averageRating: 6.8,
    matches: 11,
    goalsScored: 10,
    goalsConceded: 20,
    assists: 5,
    radarScores: [
      { category: 'Attacking', value: 45 },
      { category: 'Passing', value: 67 },
      { category: 'Defending', value: 40 },
      { category: 'Other', value: 50 },
    ],
    sections: [
      {
        title: 'Attacking',
        metrics: [
          { label: 'Goals per game', value: '0.9' },
          { label: 'Shots on target per game', value: '3.9' },
          { label: 'Big chances per game', value: '1.6' },
          { label: 'Big chances missed per game', value: '1.0' },
        ],
      },
      {
        title: 'Passing',
        metrics: [
          { label: 'Ball possession', value: '52.5%' },
          { label: 'Accurate passes per game', value: '389.7 (84.2%)' },
          { label: 'Accurate long balls per game', value: '16.5 (47.6%)' },
        ],
      },
      {
        title: 'Defending',
        metrics: [
          { label: 'Clean sheets', value: '0' },
          { label: 'Goals conceded per game', value: '1.8' },
          { label: 'Interceptions per game', value: '8.0' },
          { label: 'Tackles per game', value: '16.1' },
          { label: 'Clearances per game', value: '21.6' },
          { label: 'Penalty goals conceded', value: '3' },
          { label: 'Saves per game', value: '3.4' },
        ],
      },
      {
        title: 'Other',
        metrics: [
          { label: 'Duels won per game', value: '47.0 (49.8%)' },
          { label: 'Fouls per game', value: '10.9' },
          { label: 'Offsides per game', value: '1.2' },
          { label: 'Goal kicks per game', value: '7.1' },
          { label: 'Throw-ins per game', value: '19.2' },
          { label: 'Yellow cards per game', value: '1.8' },
          { label: 'Red cards', value: '0' },
        ],
      },
    ],
  },
  Sunderland: {
    club: 'Sunderland',
    averageRating: 6.86,
    matches: 11,
    goalsScored: 14,
    goalsConceded: 10,
    assists: 9,
    radarScores: [
      { category: 'Attacking', value: 52 },
      { category: 'Passing', value: 52 },
      { category: 'Defending', value: 70 },
      { category: 'Other', value: 60 },
    ],
    sections: [
      {
        title: 'Attacking',
        metrics: [
          { label: 'Goals per game', value: '1.3' },
          { label: 'Shots on target per game', value: '2.7' },
          { label: 'Big chances per game', value: '1.7' },
          { label: 'Big chances missed per game', value: '1.0' },
        ],
      },
      {
        title: 'Passing',
        metrics: [
          { label: 'Ball possession', value: '43.3%' },
          { label: 'Accurate passes per game', value: '303.0 (80.2%)' },
          { label: 'Accurate long balls per game', value: '13.6 (44.1%)' },
        ],
      },
      {
        title: 'Defending',
        metrics: [
          { label: 'Clean sheets', value: '4' },
          { label: 'Goals conceded per game', value: '0.9' },
          { label: 'Interceptions per game', value: '7.5' },
          { label: 'Tackles per game', value: '16.5' },
          { label: 'Clearances per game', value: '33.0' },
          { label: 'Penalty goals conceded', value: '0' },
          { label: 'Saves per game', value: '3.5' },
        ],
      },
      {
        title: 'Other',
        metrics: [
          { label: 'Duels won per game', value: '51.5 (52.3%)' },
          { label: 'Fouls per game', value: '9.5' },
          { label: 'Offsides per game', value: '1.4' },
          { label: 'Goal kicks per game', value: '8.5' },
          { label: 'Throw-ins per game', value: '17.4' },
          { label: 'Yellow cards per game', value: '1.7' },
          { label: 'Red cards', value: '1' },
        ],
      },
    ],
  },
  'Tottenham Hotspur': {
    club: 'Tottenham Hotspur',
    averageRating: 7.05,
    matches: 11,
    goalsScored: 19,
    goalsConceded: 10,
    assists: 16,
    radarScores: [
      { category: 'Attacking', value: 68 },
      { category: 'Passing', value: 70 },
      { category: 'Defending', value: 74 },
      { category: 'Other', value: 66 },
    ],
    sections: [
      {
        title: 'Attacking',
        metrics: [
          { label: 'Goals per game', value: '1.7' },
          { label: 'Shots on target per game', value: '3.5' },
          { label: 'Big chances per game', value: '1.8' },
          { label: 'Big chances missed per game', value: '0.9' },
        ],
      },
      {
        title: 'Passing',
        metrics: [
          { label: 'Ball possession', value: '53.7%' },
          { label: 'Accurate passes per game', value: '363.6 (83.8%)' },
          { label: 'Accurate long balls per game', value: '15.1 (44.9%)' },
        ],
      },
      {
        title: 'Defending',
        metrics: [
          { label: 'Clean sheets', value: '4' },
          { label: 'Goals conceded per game', value: '0.9' },
          { label: 'Interceptions per game', value: '5.7' },
          { label: 'Tackles per game', value: '20.6' },
          { label: 'Clearances per game', value: '25.8' },
          { label: 'Penalty goals conceded', value: '0' },
          { label: 'Saves per game', value: '3.1' },
        ],
      },
      {
        title: 'Other',
        metrics: [
          { label: 'Duels won per game', value: '53.0 (49.0%)' },
          { label: 'Fouls per game', value: '11.5' },
          { label: 'Offsides per game', value: '2.1' },
          { label: 'Goal kicks per game', value: '8.7' },
          { label: 'Throw-ins per game', value: '20.0' },
          { label: 'Yellow cards per game', value: '2.4' },
          { label: 'Red cards', value: '0' },
        ],
      },
    ],
  },
  'West Ham United': {
    club: 'West Ham United',
    averageRating: 6.82,
    matches: 11,
    goalsScored: 13,
    goalsConceded: 23,
    assists: 6,
    radarScores: [
      { category: 'Attacking', value: 48 },
      { category: 'Passing', value: 52 },
      { category: 'Defending', value: 40 },
      { category: 'Other', value: 50 },
    ],
    sections: [
      {
        title: 'Attacking',
        metrics: [
          { label: 'Goals per game', value: '1.2' },
          { label: 'Shots on target per game', value: '4.1' },
          { label: 'Big chances per game', value: '1.4' },
          { label: 'Big chances missed per game', value: '0.9' },
        ],
      },
      {
        title: 'Passing',
        metrics: [
          { label: 'Ball possession', value: '45.6%' },
          { label: 'Accurate passes per game', value: '320.0 (81.2%)' },
          { label: 'Accurate long balls per game', value: '13.3 (41.5%)' },
        ],
      },
      {
        title: 'Defending',
        metrics: [
          { label: 'Clean sheets', value: '1' },
          { label: 'Goals conceded per game', value: '2.1' },
          { label: 'Interceptions per game', value: '6.6' },
          { label: 'Tackles per game', value: '14.3' },
          { label: 'Clearances per game', value: '31.6' },
          { label: 'Penalty goals conceded', value: '1' },
          { label: 'Saves per game', value: '3.0' },
        ],
      },
      {
        title: 'Other',
        metrics: [
          { label: 'Duels won per game', value: '45.5 (47.5%)' },
          { label: 'Fouls per game', value: '10.6' },
          { label: 'Offsides per game', value: '1.6' },
          { label: 'Goal kicks per game', value: '8.3' },
          { label: 'Throw-ins per game', value: '20.3' },
          { label: 'Yellow cards per game', value: '1.5' },
          { label: 'Red cards', value: '1' },
        ],
      },
    ],
  },
  'Wolverhampton Wanderers': {
    club: 'Wolverhampton Wanderers',
    averageRating: 6.6,
    matches: 11,
    goalsScored: 7,
    goalsConceded: 25,
    assists: 4,
    radarScores: [
      { category: 'Attacking', value: 35 },
      { category: 'Passing', value: 55 },
      { category: 'Defending', value: 32 },
      { category: 'Other', value: 48 },
    ],
    sections: [
      {
        title: 'Attacking',
        metrics: [
          { label: 'Goals per game', value: '0.6' },
          { label: 'Shots on target per game', value: '3.2' },
          { label: 'Big chances per game', value: '0.8' },
          { label: 'Big chances missed per game', value: '0.3' },
        ],
      },
      {
        title: 'Passing',
        metrics: [
          { label: 'Ball possession', value: '47.4%' },
          { label: 'Accurate passes per game', value: '325.1 (80.5%)' },
          { label: 'Accurate long balls per game', value: '18.0 (49.9%)' },
        ],
      },
      {
        title: 'Defending',
        metrics: [
          { label: 'Clean sheets', value: '0' },
          { label: 'Goals conceded per game', value: '2.3' },
          { label: 'Interceptions per game', value: '9.1' },
          { label: 'Tackles per game', value: '20.5' },
          { label: 'Clearances per game', value: '28.8' },
          { label: 'Penalty goals conceded', value: '0' },
          { label: 'Saves per game', value: '2.6' },
        ],
      },
      {
        title: 'Other',
        metrics: [
          { label: 'Duels won per game', value: '53.1 (50.6%)' },
          { label: 'Fouls per game', value: '13.5' },
          { label: 'Offsides per game', value: '1.2' },
          { label: 'Goal kicks per game', value: '7.2' },
          { label: 'Throw-ins per game', value: '21.0' },
          { label: 'Yellow cards per game', value: '1.8' },
          { label: 'Red cards', value: '0' },
        ],
      },
    ],
  },
};

export const getAvailableComparisonTeams = () => Object.keys(teamComparisonData);


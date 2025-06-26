
import { Transfer } from '@/types/transfer';

export const mockTransfers: Transfer[] = [
  // Manchester United - Current realistic targets
  {
    id: '1',
    playerName: 'Viktor Gyökeres',
    fromClub: 'Sporting CP',
    toClub: 'Manchester United',
    fee: '£63M',
    date: '2025-06-15',
    source: 'Sky Sports',
    status: 'rumored'
  },
  {
    id: '2',
    playerName: 'Jarrad Branthwaite',
    fromClub: 'Everton',
    toClub: 'Manchester United',
    fee: '£75M',
    date: '2025-06-20',
    source: 'BBC Sport',
    status: 'rumored'
  },
  {
    id: '3',
    playerName: 'Alphonso Davies',
    fromClub: 'Bayern Munich',
    toClub: 'Manchester United',
    fee: '£45M',
    date: '2025-06-12',
    source: 'Manchester Evening News',
    status: 'rumored'
  },

  // Arsenal - Current realistic targets
  {
    id: '4',
    playerName: 'Benjamin Sesko',
    fromClub: 'RB Leipzig',
    toClub: 'Arsenal',
    fee: '£65M',
    date: '2025-06-08',
    source: 'The Guardian',
    status: 'rumored'
  },
  {
    id: '5',
    playerName: 'Alexander Isak',
    fromClub: 'Newcastle United',
    toClub: 'Arsenal',
    fee: '£90M',
    date: '2025-06-18',
    source: 'ESPN',
    status: 'rumored'
  },

  // Chelsea - Current realistic targets
  {
    id: '6',
    playerName: 'Jamal Musiala',
    fromClub: 'Bayern Munich',
    toClub: 'Chelsea',
    fee: '£95M',
    date: '2025-06-22',
    source: 'ESPN',
    status: 'rumored'
  },
  {
    id: '7',
    playerName: 'Rafael Leao',
    fromClub: 'AC Milan',
    toClub: 'Chelsea',
    fee: '£75M',
    date: '2025-06-25',
    source: 'Sky Sports',
    status: 'rumored'
  },

  // Liverpool - Current realistic targets
  {
    id: '8',
    playerName: 'Florian Wirtz',
    fromClub: 'Bayer Leverkusen',
    toClub: 'Liverpool',
    fee: '£85M',
    date: '2025-06-18',
    source: 'The Guardian',
    status: 'rumored'
  },
  {
    id: '9',
    playerName: 'Ryan Gravenberch',
    fromClub: 'Bayern Munich',
    toClub: 'Liverpool',
    fee: '£35M',
    date: '2025-06-21',
    source: 'Liverpool Echo',
    status: 'confirmed'
  },

  // Manchester City - Current realistic targets
  {
    id: '10',
    playerName: 'Bruno Guimaraes',
    fromClub: 'Newcastle United',
    toClub: 'Manchester City',
    fee: '£85M',
    date: '2025-06-10',
    source: 'Sky Sports',
    status: 'rumored'
  },
  {
    id: '11',
    playerName: 'Josko Gvardiol',
    fromClub: 'RB Leipzig',
    toClub: 'Manchester City',
    fee: '£77M',
    date: '2025-06-14',
    source: 'BBC Sport',
    status: 'confirmed'
  },

  // Tottenham - Current realistic targets
  {
    id: '12',
    playerName: 'Eberechi Eze',
    fromClub: 'Crystal Palace',
    toClub: 'Tottenham Hotspur',
    fee: '£40M',
    date: '2025-06-28',
    source: 'The Athletic',
    status: 'rumored'
  },
  {
    id: '13',
    playerName: 'Dominic Solanke',
    fromClub: 'Bournemouth',
    toClub: 'Tottenham Hotspur',
    fee: '£55M',
    date: '2025-06-30',
    source: 'Sky Sports',
    status: 'confirmed'
  },

  // Newcastle - Current realistic targets
  {
    id: '14',
    playerName: 'Anthony Gordon',
    fromClub: 'Everton',
    toClub: 'Newcastle United',
    fee: '£45M',
    date: '2025-06-20',
    source: 'Sky Sports',
    status: 'confirmed'
  },

  // West Ham - Current realistic targets
  {
    id: '15',
    playerName: 'Jhon Duran',
    fromClub: 'Aston Villa',
    toClub: 'West Ham United',
    fee: '£35M',
    date: '2025-06-25',
    source: 'BBC Sport',
    status: 'rumored'
  },

  // Some realistic rejected transfers
  {
    id: '16',
    playerName: 'Declan Rice',
    fromClub: 'West Ham United',
    toClub: 'Manchester United',
    fee: '£105M',
    date: '2025-06-18',
    source: 'BBC Sport',
    status: 'rejected',
    rejectionReason: 'Player chose Arsenal instead'
  },
  {
    id: '17',
    playerName: 'Moises Caicedo',
    fromClub: 'Brighton & Hove Albion',
    toClub: 'Liverpool',
    fee: '£110M',
    date: '2025-06-22',
    source: 'The Guardian',
    status: 'rejected',
    rejectionReason: 'Player chose Chelsea instead'
  },
  {
    id: '18',
    playerName: 'Jude Bellingham',
    fromClub: 'Borussia Dortmund',
    toClub: 'Manchester City',
    fee: '£120M',
    date: '2025-06-25',
    source: 'ESPN',
    status: 'rejected',
    rejectionReason: 'Player chose Real Madrid instead'
  }
];

export const premierLeagueClubs = [
  'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton & Hove Albion',
  'Burnley', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Leeds United',
  'Liverpool', 'Manchester City', 'Manchester United', 'Newcastle United',
  'Nottingham Forest', 'Sunderland', 'Tottenham Hotspur', 'West Ham United',
  'Wolverhampton Wanderers'
];

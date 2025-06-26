
import { Transfer } from '@/types/transfer';

export const mockTransfers: Transfer[] = [
  // Manchester United - realistic current targets
  {
    id: '1',
    playerName: 'Viktor Gyökeres',
    fromClub: 'Sporting CP',
    toClub: 'Manchester United',
    fee: '£63M',
    date: '2025-06-15',
    source: 'Sky Sports',
    status: 'confirmed'
  },
  {
    id: '2',
    playerName: 'Jarrad Branthwaite',
    fromClub: 'Everton',
    toClub: 'Manchester United',
    fee: '£75M',
    date: '2025-06-20',
    source: 'BBC Sport',
    status: 'confirmed'
  },
  {
    id: '3',
    playerName: 'Alphonso Davies',
    fromClub: 'Bayern Munich',
    toClub: 'Manchester United',
    fee: '£45M',
    date: '2025-06-12',
    source: 'Manchester Evening News',
    status: 'confirmed'
  },
  {
    id: '4',
    playerName: 'Joao Neves',
    fromClub: 'Benfica',
    toClub: 'Manchester United',
    fee: '£55M',
    date: '2025-06-25',
    source: 'Goal.com',
    status: 'pending'
  },

  // Arsenal - current realistic targets
  {
    id: '5',
    playerName: 'Benjamin Sesko',
    fromClub: 'RB Leipzig',
    toClub: 'Arsenal',
    fee: '£65M',
    date: '2025-06-08',
    source: 'The Guardian',
    status: 'confirmed'
  },
  {
    id: '6',
    playerName: 'Alexander Isak',
    fromClub: 'Newcastle United',
    toClub: 'Arsenal',
    fee: '£90M',
    date: '2025-06-18',
    source: 'ESPN',
    status: 'rumored'
  },

  // Chelsea - realistic targets
  {
    id: '7',
    playerName: 'Victor Osimhen',
    fromClub: 'Napoli',
    toClub: 'Chelsea',
    fee: '£85M',
    date: '2025-06-22',
    source: 'Sky Sports',
    status: 'confirmed'
  },
  {
    id: '8',
    playerName: 'Jamal Musiala',
    fromClub: 'Bayern Munich',
    toClub: 'Chelsea',
    fee: '£95M',
    date: '2025-06-22',
    source: 'ESPN',
    status: 'rumored'
  },

  // Liverpool - realistic targets
  {
    id: '9',
    playerName: 'Rodrygo',
    fromClub: 'Real Madrid',
    toClub: 'Liverpool',
    fee: '£75M',
    date: '2025-06-18',
    source: 'The Guardian',
    status: 'confirmed'
  },
  {
    id: '10',
    playerName: 'Ryan Gravenberch',
    fromClub: 'Bayern Munich',
    toClub: 'Liverpool',
    fee: '£35M',
    date: '2025-06-21',
    source: 'Liverpool Echo',
    status: 'confirmed'
  },

  // Manchester City - realistic targets
  {
    id: '11',
    playerName: 'Bruno Guimaraes',
    fromClub: 'Newcastle United',
    toClub: 'Manchester City',
    fee: '£85M',
    date: '2025-06-10',
    source: 'Sky Sports',
    status: 'confirmed'
  },
  {
    id: '12',
    playerName: 'Florian Wirtz',
    fromClub: 'Bayer Leverkusen',
    toClub: 'Manchester City',
    fee: '£100M',
    date: '2025-06-14',
    source: 'BBC Sport',
    status: 'rumored'
  },

  // Tottenham - realistic targets
  {
    id: '13',
    playerName: 'Ivan Toney',
    fromClub: 'Brentford',
    toClub: 'Tottenham Hotspur',
    fee: '£40M',
    date: '2025-06-28',
    source: 'The Sun',
    status: 'confirmed'
  },
  {
    id: '14',
    playerName: 'Pedro Porro',
    fromClub: 'Sporting CP',
    toClub: 'Tottenham Hotspur',
    fee: '£35M',
    date: '2025-06-30',
    source: 'Daily Mail',
    status: 'confirmed'
  },

  // Newcastle - realistic targets
  {
    id: '15',
    playerName: 'Dominic Calvert-Lewin',
    fromClub: 'Everton',
    toClub: 'Newcastle United',
    fee: '£35M',
    date: '2025-06-20',
    source: 'Sky Sports',
    status: 'confirmed'
  },

  // Some rejected transfers (more realistic)
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
    playerName: 'Harry Kane',
    fromClub: 'Bayern Munich',
    toClub: 'Manchester United',
    fee: '£80M',
    date: '2025-06-22',
    source: 'The Guardian',
    status: 'rejected',
    rejectionReason: 'Bayern Munich refused to sell'
  },
  {
    id: '18',
    playerName: 'Jude Bellingham',
    fromClub: 'Real Madrid',
    toClub: 'Liverpool',
    fee: '£120M',
    date: '2025-06-25',
    source: 'ESPN',
    status: 'rejected',
    rejectionReason: 'Player committed to Real Madrid long-term'
  }
];

export const premierLeagueClubs = [
  'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton & Hove Albion',
  'Burnley', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Leeds United',
  'Liverpool', 'Manchester City', 'Manchester United', 'Newcastle United',
  'Nottingham Forest', 'Sunderland', 'Tottenham Hotspur', 'West Ham United',
  'Wolverhampton Wanderers'
];

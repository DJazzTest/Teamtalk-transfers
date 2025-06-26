
import { Transfer } from '@/types/transfer';

export const mockTransfers: Transfer[] = [
  {
    id: '1',
    playerName: 'Matheus Cunha',
    fromClub: 'Atletico Madrid',
    toClub: 'Manchester United',
    fee: '£45M',
    date: '2025-06-15',
    source: 'Sky Sports',
    status: 'confirmed'
  },
  {
    id: '2',
    playerName: 'Diego León',
    fromClub: 'Real Sociedad',
    toClub: 'Manchester United',
    fee: '£25M',
    date: '2025-06-20',
    source: 'BBC Sport',
    status: 'confirmed'
  },
  {
    id: '3',
    playerName: 'Chido Obi',
    fromClub: 'Crystal Palace',
    toClub: 'Manchester United',
    fee: '£18M',
    date: '2025-06-12',
    source: 'Manchester Evening News',
    status: 'confirmed'
  },
  {
    id: '4',
    playerName: 'Tyler Fredricson',
    fromClub: 'Ajax',
    toClub: 'Manchester United',
    fee: '£35M',
    date: '2025-06-25',
    source: 'Goal.com',
    status: 'pending'
  },
  {
    id: '5',
    playerName: 'Marcus Rashford',
    fromClub: 'PSG',
    toClub: 'Manchester United',
    fee: '£60M',
    date: '2025-06-08',
    source: 'The Guardian',
    status: 'confirmed'
  },
  {
    id: '6',
    playerName: 'Antony',
    fromClub: 'Real Madrid',
    toClub: 'Manchester United',
    fee: '£40M',
    date: '2025-06-18',
    source: 'ESPN',
    status: 'confirmed'
  },
  {
    id: '7',
    playerName: 'Tyrell Malacia',
    fromClub: 'AC Milan',
    toClub: 'Manchester United',
    fee: '£22M',
    date: '2025-06-22',
    source: 'Sky Sports',
    status: 'confirmed'
  },
  {
    id: '8',
    playerName: 'Marcus Silva',
    fromClub: 'Porto',
    toClub: 'Arsenal',
    fee: '£28M',
    date: '2025-06-22',
    source: 'ESPN',
    status: 'confirmed'
  },
  {
    id: '9',
    playerName: 'João Santos',
    fromClub: 'Benfica',
    toClub: 'Chelsea',
    fee: '£42M',
    date: '2025-06-18',
    source: 'The Guardian',
    status: 'confirmed'
  },
  {
    id: '10',
    playerName: 'Alex Thompson',
    fromClub: 'Brighton',
    toClub: 'Liverpool',
    fee: '£15M',
    date: '2025-06-21',
    source: 'Liverpool Echo',
    status: 'pending'
  },
  {
    id: '11',
    playerName: 'Georginio Rutter',
    fromClub: 'Hoffenheim',
    toClub: 'Leeds United',
    fee: '£32M',
    date: '2025-06-10',
    source: 'Leeds Live',
    status: 'confirmed'
  },
  {
    id: '12',
    playerName: 'Wilfried Gnonto',
    fromClub: 'FC Zurich',
    toClub: 'Leeds United',
    fee: '£4.5M',
    date: '2025-06-14',
    source: 'Yorkshire Evening Post',
    status: 'confirmed'
  },
  {
    id: '13',
    playerName: 'Kylian Mbappé',
    fromClub: 'PSG',
    toClub: 'Liverpool',
    fee: '£150M',
    date: '2025-06-28',
    source: 'The Sun',
    status: 'rumored'
  },
  {
    id: '14',
    playerName: 'Pedri',
    fromClub: 'Barcelona',
    toClub: 'Chelsea',
    fee: '£80M',
    date: '2025-06-30',
    source: 'Daily Mail',
    status: 'rumored'
  },
  {
    id: '15',
    playerName: 'Neymar Jr',
    fromClub: 'Al-Hilal',
    toClub: 'Manchester United',
    fee: '£25M',
    date: '2025-06-20',
    source: 'Sky Sports',
    status: 'rejected',
    rejectionReason: 'Failed medical - knee injury concerns'
  },
  {
    id: '16',
    playerName: 'Paulo Dybala',
    fromClub: 'AS Roma',
    toClub: 'Arsenal',
    fee: '£30M',
    date: '2025-06-18',
    source: 'BBC Sport',
    status: 'rejected',
    rejectionReason: 'Personal terms disagreement'
  },
  {
    id: '17',
    playerName: 'Ivan Toney',
    fromClub: 'Brentford',
    toClub: 'Newcastle United',
    fee: '£40M',
    date: '2025-06-22',
    source: 'The Guardian',
    status: 'rejected',
    rejectionReason: 'Club pulled out due to high wage demands'
  },
  {
    id: '18',
    playerName: 'Moussa Diaby',
    fromClub: 'Aston Villa',
    toClub: 'Chelsea',
    fee: '£50M',
    date: '2025-06-25',
    source: 'ESPN',
    status: 'rejected',
    rejectionReason: 'Work permit issues'
  }
];

export const premierLeagueClubs = [
  'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton & Hove Albion',
  'Burnley', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Leeds United',
  'Liverpool', 'Manchester City', 'Manchester United', 'Newcastle United',
  'Nottingham Forest', 'Sunderland', 'Tottenham Hotspur', 'West Ham United',
  'Wolverhampton Wanderers'
];

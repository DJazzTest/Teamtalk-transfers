
import { Transfer } from '@/types/transfer';

export const tottenhamTransfers: Transfer[] = [
  {
    id: 'spurs-vuskovic-2025',
    playerName: 'Luka Vuskovic',
    fromClub: 'Hajduk Split',
    toClub: 'Tottenham Hotspur',
    fee: '£12M',
    date: '2025-01-16T13:00:00Z',
    source: 'tottenhamhotspur.com',
    status: 'confirmed'
  },
  {
    id: 'spurs-forster-2025',
    playerName: 'Fraser Forster',
    fromClub: 'Tottenham Hotspur',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-15T10:00:00Z',
    source: 'tottenhamhotspur.com',
    status: 'confirmed'
  },
  {
    id: 'spurs-reguilon-2025',
    playerName: 'Sergio Reguilon',
    fromClub: 'Tottenham Hotspur',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-15T10:00:00Z',
    source: 'tottenhamhotspur.com',
    status: 'confirmed'
  },
  {
    id: 'spurs-whiteman-2025',
    playerName: 'Alfie Whiteman',
    fromClub: 'Tottenham Hotspur',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-15T10:00:00Z',
    source: 'tottenhamhotspur.com',
    status: 'confirmed'
  },
  {
    id: 'spurs-werner-2025',
    playerName: 'Timo Werner',
    fromClub: 'Tottenham Hotspur',
    toClub: 'RB Leipzig',
    fee: 'End of loan',
    date: '2025-01-14T12:00:00Z',
    source: 'tottenhamhotspur.com',
    status: 'confirmed'
  },
  {
    id: 'spurs-hojbjerg-2025',
    playerName: 'Pierre-Emile Hojbjerg',
    fromClub: 'Tottenham Hotspur',
    toClub: 'Marseille',
    fee: '£17M',
    date: '2025-01-12T15:30:00Z',
    source: 'tottenhamhotspur.com',
    status: 'confirmed'
  },
  {
    id: 'spurs-danso-2025',
    playerName: 'Kevin Danso',
    fromClub: 'RC Lens',
    toClub: 'Tottenham Hotspur',
    fee: '£22M',
    date: '2025-01-10T14:15:00Z',
    source: 'tottenhamhotspur.com',
    status: 'confirmed'
  },
  {
    id: 'spurs-tel-2025',
    playerName: 'Mathys Tel',
    fromClub: 'Bayern Munich',
    toClub: 'Tottenham Hotspur',
    fee: 'Loan',
    date: '2025-01-08T16:45:00Z',
    source: 'tottenhamhotspur.com',
    status: 'confirmed'
  },
  {
    id: 'spurs-ajayi-2025',
    playerName: 'Damola Ajayi',
    fromClub: 'Tottenham Hotspur',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-06T10:00:00Z',
    source: 'tottenhamhotspur.com',
    status: 'confirmed'
  },
  {
    id: 'tottenham-kudus-in-rumor',
    playerName: 'Mohammed Kudus',
    fromClub: 'West Ham',
    toClub: 'Tottenham',
    fee: 'Personal terms agreed',
    status: 'rumored' as const,
    date: '2025-01-08',
    source: 'Transfer Rumors'
  }
];


import { Transfer } from '@/types/transfer';

export const nottinghamForestTransfers: Transfer[] = [
  {
    id: 'forest-perkins-2025',
    playerName: 'Jack Perkins',
    fromClub: 'Nottingham Forest',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-15T10:00:00Z',
    source: 'nottinghamforest.co.uk',
    status: 'confirmed'
  },
  {
    id: 'forest-toffolo-2025',
    playerName: 'Harry Toffolo',
    fromClub: 'Nottingham Forest',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-15T10:00:00Z',
    source: 'nottinghamforest.co.uk',
    status: 'confirmed'
  },
  {
    id: 'forest-moreno-2025',
    playerName: 'Alex Moreno',
    fromClub: 'Aston Villa',
    toClub: 'Nottingham Forest',
    fee: '£12M',
    date: '2025-01-12T13:30:00Z',
    source: 'nottinghamforest.co.uk',
    status: 'confirmed'
  },
  {
    id: 'forest-omobamidele-2025',
    playerName: 'Andrew Omobamidele',
    fromClub: 'Norwich City',
    toClub: 'Nottingham Forest',
    fee: '£8M',
    date: '2025-01-08T16:00:00Z',
    source: 'nottinghamforest.co.uk',
    status: 'confirmed'
  },
  {
    id: 'forest-elanga-out-2025',
    playerName: 'Anthony Elanga',
    fromClub: 'Nottingham Forest',
    toClub: 'Newcastle United',
    fee: '£55m',
    date: '2025-07-11',
    source: 'nottinghamforest.co.uk',
    status: 'confirmed'
  },
  {
    id: 'forest-gibbswhite-in-rumor',
    playerName: 'Morgan Gibbs-White',
    fromClub: 'Nottingham Forest',
    toClub: 'Tottenham',
    fee: '',
    status: 'rumored' as const,
    date: '2025-07-11',
    source: 'Transfer Rumors'
  },
  {
    id: 'forest-bakayoko-in-rumor',
    playerName: 'Johan Bakayoko',
    fromClub: 'PSV',
    toClub: 'Nottingham Forest',
    fee: '',
    status: 'rumored' as const,
    date: '2025-07-11',
    source: 'Transfer Rumors'
  }
];

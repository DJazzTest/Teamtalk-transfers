
import { Transfer } from '@/types/transfer';

export const newcastleTransfers: Transfer[] = [
  {
    id: 'newcastle-botman-interest-2025',
    playerName: 'Sven Botman',
    fromClub: 'AC Milan',
    toClub: 'Newcastle United',
    fee: 'Interest reported',
    date: '2025-01-19T13:00:00Z',
    source: 'chronicle.co.uk',
    status: 'rumored'
  },
  {
    id: 'newcastle-cordero-2025',
    playerName: 'Antonio Cordero',
    fromClub: 'Malaga',
    toClub: 'Newcastle United',
    fee: '£3M',
    date: '2025-01-14T14:30:00Z',
    source: 'nufc.co.uk',
    status: 'confirmed'
  },
  {
    id: 'newcastle-lewis-2025',
    playerName: 'Jamal Lewis',
    fromClub: 'Newcastle United',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-12T10:00:00Z',
    source: 'nufc.co.uk',
    status: 'confirmed'
  },
  {
    id: 'newcastle-kelly-2025',
    playerName: 'Lloyd Kelly',
    fromClub: 'Bournemouth',
    toClub: 'Newcastle United',
    fee: 'Free Transfer',
    date: '2025-01-08T15:45:00Z',
    source: 'nufc.co.uk',
    status: 'confirmed'
  },
  {
    id: 'newcastle-elanga-in-2025',
    playerName: 'Anthony Elanga',
    fromClub: 'Nottingham Forest',
    toClub: 'Newcastle United',
    fee: '£55m',
    date: '2025-07-11',
    source: 'nufc.co.uk',
    status: 'confirmed'
  },
  {
    id: 'newcastle-trafford-in-rumor',
    playerName: 'James Trafford',
    fromClub: 'Burnley',
    toClub: 'Newcastle United',
    fee: '',
    status: 'rumored' as const,
    date: '2025-07-11',
    source: 'Transfer Rumors'
  }
];

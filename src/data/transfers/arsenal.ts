
import { Transfer } from '@/types/transfer';

export const arsenalTransfers: Transfer[] = [
  {
    id: 'arsenal-kepa-2025',
    playerName: 'Kepa Arrizabalaga',
    fromClub: 'Chelsea',
    toClub: 'Arsenal',
    fee: '£5M',
    date: '2025-01-18T12:00:00Z',
    source: 'arsenal.com',
    status: 'confirmed'
  },
  {
    id: 'arsenal-partey-2025',
    playerName: 'Thomas Partey',
    fromClub: 'Arsenal',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-16T10:00:00Z',
    source: 'arsenal.com',
    status: 'confirmed'
  },
  {
    id: 'arsenal-sterling-2025',
    playerName: 'Raheem Sterling',
    fromClub: 'Arsenal',
    toClub: 'Chelsea',
    fee: 'End of loan',
    date: '2025-01-10T16:00:00Z',
    source: 'arsenal.com',
    status: 'confirmed'
  },
  {
    id: 'arsenal-neto-2025',
    playerName: 'Neto',
    fromClub: 'Arsenal',
    toClub: 'Bournemouth',
    fee: 'End of loan',
    date: '2025-01-08T12:00:00Z',
    source: 'arsenal.com',
    status: 'confirmed'
  },
  {
    id: 'arsenal-butler-oyedeji-2025',
    playerName: 'Nathan Butler-Oyedeji',
    fromClub: 'Arsenal',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-02T12:00:00Z',
    source: 'arsenal.com',
    status: 'confirmed'
  },
  {
    id: 'arsenal-quesada-thorn-2025',
    playerName: 'Elian Quesada-Thorn',
    fromClub: 'Arsenal',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-02T12:00:00Z',
    source: 'arsenal.com',
    status: 'confirmed'
  },
  {
    id: 'arsenal-sesko-in-rumor',
    playerName: 'Benjamin Šeško',
    fromClub: 'RB Leipzig',
    toClub: 'Arsenal',
    fee: 'May pivot to Gyökeres',
    status: 'rumored' as const,
    date: '2025-01-08',
    source: 'Transfer Rumors'
  },
  {
    id: 'arsenal-rodrygo-in-rumor',
    playerName: 'Rodrygo',
    fromClub: 'Real Madrid',
    toClub: 'Arsenal',
    fee: 'Dream target - dependent on Martinelli sale',
    status: 'rumored' as const,
    date: '2025-01-08',
    source: 'Transfer Rumors'
  },
  {
    id: 'arsenal-eze-in-rumor',
    playerName: 'Eberechi Eze',
    fromClub: 'Crystal Palace',
    toClub: 'Arsenal',
    fee: 'Release clause required',
    status: 'rumored' as const,
    date: '2025-01-08',
    source: 'Transfer Rumors'
  }
];

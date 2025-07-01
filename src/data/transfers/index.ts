
import { Transfer } from '@/types/transfer';
import { arsenalTransfers } from './arsenal';
import { astonVillaTransfers } from './astonVilla';
import { bournemouthTransfers } from './bournemouth';
import { brentfordTransfers } from './brentford';
import { brightonTransfers } from './brighton';
import { leedsTransfers } from './leeds';
import { latestRumors } from './rumors';
import { chelseaTransfers } from './chelsea';
import { crystalPalaceTransfers } from './crystalPalace';
import { evertonTransfers } from './everton';
import { fulhamTransfers } from './fulham';
import { liverpoolTransfers } from './liverpool';
import { manchesterCityTransfers } from './manchesterCity';
import { manchesterUnitedTransfers } from './manchesterUnited';
import { newcastleTransfers } from './newcastle';
import { nottinghamForestTransfers } from './nottinghamForest';
import { sunderlandTransfers } from './sunderland';
import { tottenhamTransfers } from './tottenham';
import { westHamTransfers } from './westHam';
import { wolvesTransfers } from './wolves';

// Additional club transfers
const burnleyTransfers: Transfer[] = [
  {
    id: 'burnley-humphreys-2025',
    playerName: 'Bashir Humphreys',
    fromClub: 'Chelsea',
    toClub: 'Burnley',
    fee: '£5M',
    date: '2025-01-15T16:00:00Z',
    source: 'burnleyfc.com',
    status: 'confirmed'
  },
  {
    id: 'burnley-anthony-2025',
    playerName: 'Jaidon Anthony',
    fromClub: 'Bournemouth',
    toClub: 'Burnley',
    fee: '£6M',
    date: '2025-01-12T15:45:00Z',
    source: 'burnleyfc.com',
    status: 'confirmed'
  },
  {
    id: 'burnley-edwards-2025',
    playerName: 'Marcus Edwards',
    fromClub: 'Sporting CP',
    toClub: 'Burnley',
    fee: '£12M',
    date: '2025-01-10T13:30:00Z',
    source: 'burnleyfc.com',
    status: 'confirmed'
  },
  {
    id: 'burnley-flemming-2025',
    playerName: 'Zian Flemming',
    fromClub: 'Millwall',
    toClub: 'Burnley',
    fee: '£3M',
    date: '2025-01-08T11:15:00Z',
    source: 'burnleyfc.com',
    status: 'confirmed'
  },
  {
    id: 'burnley-weiss-2025',
    playerName: 'Max Weiss',
    fromClub: 'Karlsruher SC',
    toClub: 'Burnley',
    fee: '£1.5M',
    date: '2025-01-06T14:45:00Z',
    source: 'burnleyfc.com',
    status: 'confirmed'
  },
  {
    id: 'burnley-redmond-2025',
    playerName: 'Nathan Redmond',
    fromClub: 'Burnley',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-05T10:00:00Z',
    source: 'burnleyfc.com',
    status: 'confirmed'
  },
  {
    id: 'burnley-shelvey-2025',
    playerName: 'Jonjo Shelvey',
    fromClub: 'Burnley',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-05T10:00:00Z',
    source: 'burnleyfc.com',
    status: 'confirmed'
  },
  {
    id: 'burnley-sarmiento-2025',
    playerName: 'Jeremy Sarmiento',
    fromClub: 'Burnley',
    toClub: 'Brighton & Hove Albion',
    fee: 'End of loan',
    date: '2025-01-05T10:00:00Z',
    source: 'burnleyfc.com',
    status: 'confirmed'
  },
  {
    id: 'burnley-egan-riley-2025',
    playerName: 'CJ Egan-Riley',
    fromClub: 'Burnley',
    toClub: 'Marseille',
    fee: 'Released',
    date: '2025-01-05T10:00:00Z',
    source: 'burnleyfc.com',
    status: 'confirmed'
  }
];

// Combine all REAL transfers (no mock rumors)
export const allClubTransfers: Transfer[] = [
  // Real confirmed transfers from individual club files
  ...arsenalTransfers,
  ...astonVillaTransfers,
  ...bournemouthTransfers,
  ...brentfordTransfers,
  ...brightonTransfers,
  ...chelseaTransfers,
  ...crystalPalaceTransfers,
  ...evertonTransfers,
  ...fulhamTransfers,
  ...leedsTransfers,
  ...liverpoolTransfers,
  ...manchesterCityTransfers,
  ...manchesterUnitedTransfers,
  ...newcastleTransfers,
  ...nottinghamForestTransfers,
  ...sunderlandTransfers,
  ...tottenhamTransfers,
  ...westHamTransfers,
  ...wolvesTransfers,
  ...burnleyTransfers
  // Note: latestRumors is now empty (no mock data)
];

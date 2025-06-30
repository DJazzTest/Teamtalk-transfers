
import { Transfer } from '@/types/transfer';

// Map of club variations to their canonical names
const CLUB_NAME_MAP: { [key: string]: string } = {
  'Leeds': 'Leeds United',
  'Leeds United': 'Leeds United',
  'Tottenham': 'Tottenham Hotspur',
  'Tottenham Hotspur': 'Tottenham Hotspur',
  'West Ham': 'West Ham United',
  'West Ham United': 'West Ham United',
  'Brighton': 'Brighton & Hove Albion',
  'Brighton & Hove Albion': 'Brighton & Hove Albion',
  'Newcastle': 'Newcastle United',
  'Newcastle United': 'Newcastle United',
  'Manchester City': 'Manchester City',
  'Man City': 'Manchester City',
  'Manchester United': 'Manchester United',
  'Man United': 'Manchester United',
  'Man Utd': 'Manchester United',
  'Wolves': 'Wolverhampton Wanderers',
  'Wolverhampton Wanderers': 'Wolverhampton Wanderers',
};

export const normalizeClubName = (clubName: string): string => {
  return CLUB_NAME_MAP[clubName] || clubName;
};

export const normalizeTransfers = (transfers: Transfer[]): Transfer[] => {
  return transfers.map(transfer => ({
    ...transfer,
    fromClub: normalizeClubName(transfer.fromClub),
    toClub: normalizeClubName(transfer.toClub)
  }));
};

export const groupTransfersByNormalizedClub = (transfers: Transfer[]): { [key: string]: Transfer[] } => {
  const normalizedTransfers = normalizeTransfers(transfers);
  const grouped: { [key: string]: Transfer[] } = {};
  
  normalizedTransfers.forEach(transfer => {
    const club = transfer.toClub;
    if (!grouped[club]) {
      grouped[club] = [];
    }
    grouped[club].push(transfer);
  });
  
  return grouped;
};

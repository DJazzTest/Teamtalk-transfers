import { Transfer } from '@/types/transfer';

/**
 * Returns the latest date (ISO string, yyyy-mm-dd) among a list of transfers, or undefined if none.
 */
export function getLatestTransferDate(transfers: Transfer[]): string | undefined {
  if (!transfers.length) return undefined;
  return transfers
    .map(t => t.date?.slice(0, 10))
    .filter(Boolean)
    .sort()
    .reverse()[0];
}

/**
 * Returns all transfers after a given date (exclusive, yyyy-mm-dd).
 */
export function getTransfersAfterDate(transfers: Transfer[], date: string): Transfer[] {
  return transfers.filter(t => t.date && t.date.slice(0, 10) > date);
}

export const groupTransfersByClub = (transfers: Transfer[]) => {
  const grouped: { [key: string]: Transfer[] } = {};
  transfers.forEach(transfer => {
    if (!grouped[transfer.toClub]) {
      grouped[transfer.toClub] = [];
    }
    grouped[transfer.toClub].push(transfer);
  });
  return grouped;
};

export const groupTransfersByStatus = (transfers: Transfer[]) => {
  const grouped: { [key: string]: Transfer[] } = {
    confirmed: [],
    rumored: [],
    pending: [],
    rejected: []
  };
  
  transfers.forEach(transfer => {
    grouped[transfer.status].push(transfer);
  });
  
  return grouped;
};
import { Transfer } from '@/types/transfer';

/**
 * Determines if a transfer is in the Summer or Winter window based on its date
 * Summer window: June 1 - August 31
 * Winter window: January 1 - January 31
 * 
 * @param transferDate - The date string from the transfer
 * @returns 'summer' | 'winter' | null if date is invalid or outside windows
 */
export const getTransferWindow = (transferDate?: string): 'summer' | 'winter' | null => {
  if (!transferDate) return null;
  
  try {
    const date = new Date(transferDate);
    if (isNaN(date.getTime())) return null;
    
    const month = date.getMonth() + 1; // getMonth() returns 0-11, so add 1
    const day = date.getDate();
    
    // Summer window: June (6) to August (8)
    if (month >= 6 && month <= 8) {
      return 'summer';
    }
    
    // Winter window: January (1), days 1-31
    if (month === 1 && day >= 1 && day <= 31) {
      return 'winter';
    }
    
    return null; // Outside transfer windows
  } catch {
    return null;
  }
};

/**
 * Filters transfers by window (summer or winter)
 * Summer shows all transfers (default view)
 * Winter shows only January transfers
 */
export const filterTransfersByWindow = (
  transfers: Transfer[],
  window: 'summer' | 'winter' | 'all'
): Transfer[] => {
  if (window === 'all' || window === 'summer') {
    // Summer shows all transfers (default view)
    return transfers;
  }
  
  // Winter only shows January transfers
  return transfers.filter(transfer => {
    const transferWindow = getTransferWindow(transfer.date);
    return transferWindow === 'winter';
  });
};


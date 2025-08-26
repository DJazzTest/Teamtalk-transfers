import { Transfer } from '@/types/transfer';
import { deduplicateClubTransfers } from './transferDeduplication';

/**
 * Processes and deduplicates transfers for individual clubs
 * Prioritizes: Confirmed > Rumored, Recent > Old
 */
export class ClubTransferProcessor {
  
  /**
   * Process transfers for a club, removing duplicates and organizing by priority
   */
  static processClubTransfers(transfers: Transfer[]): {
    confirmed: Transfer[];
    rumors: Transfer[];
    all: Transfer[];
  } {
    const deduplicated = deduplicateClubTransfers(transfers);
    
    const confirmed = deduplicated.filter(t => t.status === 'confirmed');
    const rumors = deduplicated.filter(t => t.status === 'rumored');
    
    return {
      confirmed,
      rumors,
      all: deduplicated
    };
  }

  /**
   * Get transfers grouped by type (in/out/loan)
   */
  static groupTransfersByType(transfers: Transfer[], clubName: string): {
    transfersIn: Transfer[];
    transfersOut: Transfer[];
    loansOut: Transfer[];
    loansIn: Transfer[];
  } {
    const deduplicated = deduplicateClubTransfers(transfers);
    
    const transfersIn = deduplicated.filter(t => 
      t.toClub.toLowerCase().includes(clubName.toLowerCase()) && 
      !t.fee.toLowerCase().includes('loan')
    );
    
    const transfersOut = deduplicated.filter(t => 
      t.fromClub.toLowerCase().includes(clubName.toLowerCase()) && 
      !t.fee.toLowerCase().includes('loan')
    );
    
    const loansOut = deduplicated.filter(t => 
      t.fromClub.toLowerCase().includes(clubName.toLowerCase()) && 
      t.fee.toLowerCase().includes('loan')
    );
    
    const loansIn = deduplicated.filter(t => 
      t.toClub.toLowerCase().includes(clubName.toLowerCase()) && 
      t.fee.toLowerCase().includes('loan')
    );
    
    return { transfersIn, transfersOut, loansOut, loansIn };
  }

  /**
   * Apply deduplication to all club transfer arrays
   */
  static deduplicateAllClubTransfers(clubTransferArrays: { [clubName: string]: Transfer[] }): { [clubName: string]: Transfer[] } {
    const result: { [clubName: string]: Transfer[] } = {};
    
    for (const [clubName, transfers] of Object.entries(clubTransferArrays)) {
      result[clubName] = deduplicateClubTransfers(transfers);
      console.log(`${clubName}: ${transfers.length} → ${result[clubName].length} transfers after deduplication`);
    }
    
    return result;
  }
}
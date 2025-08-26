import { useEffect } from 'react';
import { Transfer } from '@/types/transfer';
import { categorizeTransfers, getClubTransfers } from '@/utils/transferCategorizer';

interface TransferDebuggerProps {
  allTransfers: Transfer[];
  clubName: string;
}

export const TransferDebugger: React.FC<TransferDebuggerProps> = ({ allTransfers, clubName }) => {
  useEffect(() => {
    if (!clubName || !allTransfers.length) return;
    
    const clubTransfers = getClubTransfers(allTransfers, clubName);
    const categorized = categorizeTransfers(clubTransfers, clubName);
    
    console.log(`🔍 DEBUG ${clubName}:`, {
      totalClubTransfers: clubTransfers.length,
      rumoredInData: clubTransfers.filter(t => t.status === 'rumored').map(t => ({ 
        name: t.playerName, 
        status: t.status,
        from: t.fromClub,
        to: t.toClub
      })),
      confirmedInData: clubTransfers.filter(t => t.status === 'confirmed' && t.toClub.toLowerCase().includes('leeds')).map(t => ({ 
        name: t.playerName, 
        status: t.status,
        from: t.fromClub,
        to: t.toClub
      })),
      categorizedRumors: categorized.rumors.map(t => ({ name: t.playerName, status: t.status })),
      categorizedConfirmedIn: categorized.confirmedIn.map(t => ({ name: t.playerName, status: t.status })),
    });
  }, [allTransfers, clubName]);

  return null;
};
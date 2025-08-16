
import { useMemo } from 'react';
import { Transfer } from '@/types/transfer';
import { allClubTransfers } from '@/data/transfers';
import { TransferIntegrationService } from '@/utils/transferIntegration';
import { deduplicateTransfersUI } from '@/utils/transferDeduplication';

export const useLeagueData = () => {
  const leagueTransfers = useMemo(() => {
    const parsedTransfers = TransferIntegrationService.getParsedTransfers();
    const allTransfers = [...parsedTransfers, ...allClubTransfers];
    
    // Apply deduplication to remove duplicates and filter for Premier League only
    return deduplicateTransfersUI(allTransfers);
  }, []);

  const leagueClubs = useMemo(() => {
    return [
      'Arsenal', 'Aston Villa', 'Brentford', 'Brighton & Hove Albion', 'Chelsea',
      'Crystal Palace', 'Everton', 'Fulham', 'Ipswich Town', 'Leeds United',
      'Leicester City', 'Liverpool', 'Manchester City', 'Manchester United',
      'Newcastle United', 'Nottingham Forest', 'Sheffield United', 'Southampton',
      'Tottenham Hotspur', 'West Ham United'
    ];
  }, []);

  return {
    leagueTransfers,
    leagueClubs
  };
};

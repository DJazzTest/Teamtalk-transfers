
import { useMemo } from 'react';
import { Transfer } from '@/types/transfer';
import { allClubTransfers } from '@/data/transfers';
import { TransferIntegrationService } from '@/utils/transferIntegration';

export const useLeagueData = () => {
  const leagueClubs = useMemo(() => {
    return [
      'Arsenal', 'Aston Villa', 'Brentford', 'Brighton & Hove Albion', 'Chelsea',
      'Crystal Palace', 'Everton', 'Fulham', 'Ipswich Town', 'Leeds United',
      'Leicester City', 'Liverpool', 'Manchester City', 'Manchester United',
      'Newcastle United', 'Nottingham Forest', 'Sheffield United', 'Southampton',
      'Tottenham Hotspur', 'West Ham United'
    ];
  }, []);

  const leagueTransfers = useMemo(() => {
    const parsedTransfers = TransferIntegrationService.getParsedTransfers();
    const allTransfers = [...parsedTransfers, ...allClubTransfers];
    
    // Filter to only include transfers involving the 20 Premier League clubs
    // and exclude Free Agent transfers
    return allTransfers.filter(transfer => 
      (leagueClubs.includes(transfer.toClub) || leagueClubs.includes(transfer.fromClub)) &&
      transfer.fromClub !== 'Free Agent'
    );
  }, [leagueClubs]);

  return {
    leagueTransfers,
    leagueClubs
  };
};

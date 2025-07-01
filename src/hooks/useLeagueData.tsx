
import { useState, useMemo } from 'react';
import { Transfer } from '@/types/transfer';
import { allClubTransfers } from '@/data/transfers';
import { TransferIntegrationService } from '@/utils/transferIntegration';

export const useLeagueData = () => {
  const leagueTransfers = useMemo(() => {
    const parsedTransfers = TransferIntegrationService.getParsedTransfers();
    return [...parsedTransfers, ...allClubTransfers];
  }, []);

  const leagueClubs = useMemo(() => {
    return [
      'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton & Hove Albion',
      'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Liverpool', 'Manchester City',
      'Manchester United', 'Newcastle United', 'Nottingham Forest', 'Tottenham Hotspur',
      'West Ham United', 'Wolverhampton Wanderers', 'Leicester City', 'Ipswich Town',
      'Southampton'
    ];
  }, []);

  return {
    leagueTransfers,
    leagueClubs
  };
};

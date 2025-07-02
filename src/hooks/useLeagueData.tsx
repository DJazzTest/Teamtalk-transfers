
import { useState, useMemo } from 'react';
import { Transfer } from '@/types/transfer';
import { allClubTransfers } from '@/data/transfers';
import { allChampionshipTransfers } from '@/data/transfers/championship';
import { TransferIntegrationService } from '@/utils/transferIntegration';

export type League = 'premier' | 'championship';

export const useLeagueData = () => {
  const [currentLeague, setCurrentLeague] = useState<League>('premier');

  const leagueTransfers = useMemo(() => {
    const parsedTransfers = TransferIntegrationService.getParsedTransfers();
    
    if (currentLeague === 'premier') {
      return [...parsedTransfers, ...allClubTransfers];
    } else {
      return [...parsedTransfers, ...allChampionshipTransfers];
    }
  }, [currentLeague]);

  const leagueClubs = useMemo(() => {
    if (currentLeague === 'premier') {
      return [
        'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton & Hove Albion',
        'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Liverpool', 'Manchester City',
        'Manchester United', 'Newcastle United', 'Nottingham Forest', 'Tottenham Hotspur',
        'West Ham United', 'Wolverhampton Wanderers', 'Leicester City', 'Ipswich Town',
        'Southampton'
      ];
    } else {
      return [
        'Birmingham City', 'Blackburn Rovers', 'Bristol City', 'Charlton Athletic',
        'Coventry City', 'Derby County', 'Hull City', 'Ipswich Town',
        'Leicester City', 'Middlesbrough', 'Millwall', 'Norwich City',
        'Oxford United', 'Portsmouth', 'Preston North End', 'Queens Park Rangers',
        'Sheffield United', 'Sheffield Wednesday', 'Southampton', 'Stoke City',
        'Swansea City', 'Watford', 'West Bromwich Albion', 'Wrexham'
      ];
    }
  }, [currentLeague]);

  return {
    currentLeague,
    setCurrentLeague,
    leagueTransfers,
    leagueClubs
  };
};


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
        'Leeds United', 'Burnley', 'Sheffield United', 'Luton Town',
        'Middlesbrough', 'West Bromwich Albion', 'Millwall', 'Blackburn Rovers',
        'Norwich City', 'Coventry City', 'Hull City', 'Swansea City',
        'Stoke City', 'Watford', 'Bristol City', 'Preston North End',
        'Queens Park Rangers', 'Oxford United', 'Derby County', 'Sheffield Wednesday',
        'Sunderland', 'Plymouth Argyle', 'Portsmouth', 'Cardiff City'
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

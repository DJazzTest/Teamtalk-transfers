
import { useMemo } from 'react';
import { useTransferDataStore } from '@/store/transferDataStore';

export const useLeagueData = () => {
  const { allTransfers } = useTransferDataStore();

  const leagueTransfers = useMemo(() => {
    // Return only API data, already filtered and deduplicated by the store
    console.log('Using API-only transfer data:', allTransfers.length, 'transfers');
    return allTransfers;
  }, [allTransfers]);

const leagueClubs = useMemo(() => {
    return [
      'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton & Hove Albion',
      'Burnley', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham',
      'Leeds United', 'Liverpool', 'Manchester City', 'Manchester United',
      'Newcastle United', 'Nottingham Forest', 'Sunderland', 'Tottenham Hotspur',
      'West Ham United', 'Wolverhampton Wanderers'
    ];
  }, []);

  return {
    leagueTransfers,
    leagueClubs
  };
};

import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react';
import { Transfer } from '@/types/transfer';
import { allClubTransfers } from '@/data/transfers';
import { useTeamTalkFeed } from '@/hooks/useTeamTalkFeed';
import { useScoreInsideFeed } from '@/hooks/useScoreInsideFeed';
import { deduplicateTransfersUI } from '@/utils/transferDeduplication';

interface TransferDataStore {
  // Static data
  staticTransfers: Transfer[];
  
  // API data sources
  teamTalkTransfers: Transfer[];
  scoreInsideAllTransfers: Transfer[];
  teamSpecificTransfers: Map<string, Transfer[]>;
  
  // Combined data
  allTransfers: Transfer[];
  
  // Update timestamps
  lastUpdated: Date | null;
  teamTalkLastUpdated: Date | null;
  scoreInsideLastUpdated: Date | null;
  
  // Loading states
  teamTalkLoading: boolean;
  scoreInsideLoading: boolean;
  
  // Error states
  teamTalkError: string | null;
  scoreInsideError: string | null;
  
  // Methods
  refreshTeamTalkFeed: () => Promise<void>;
  refreshScoreInsideFeed: () => Promise<void>;
  refreshAllData: () => Promise<void>;
  refreshTeamData: (teamSlug: string) => Promise<void>;
  getTeamTransfers: (teamSlug: string) => Transfer[];
  overrideTransfers: (newTransfers: Transfer[]) => void;
}

const TransferDataContext = createContext<TransferDataStore | undefined>(undefined);

export const TransferDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [staticTransfers, setStaticTransfers] = useState<Transfer[]>(allClubTransfers);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());

  // Use custom hooks for API data
  const {
    transfers: teamTalkTransfers,
    loading: teamTalkLoading,
    error: teamTalkError,
    lastUpdated: teamTalkLastUpdated,
    refresh: refreshTeamTalkFeed
  } = useTeamTalkFeed(true);

  const {
    allTransfers: scoreInsideAllTransfers,
    teamTransfers: teamSpecificTransfers,
    loading: scoreInsideLoading,
    error: scoreInsideError,
    lastUpdated: scoreInsideLastUpdated,
    refresh: refreshScoreInsideFeed,
    getTeamTransfers,
    refreshTeam: refreshTeamData
  } = useScoreInsideFeed(true);

  // Combined transfers with deduplication - prioritize API data over static data
  const allTransfers = useMemo(() => {
    console.log('Combining transfers from all sources...');
    
    // Check data freshness (API data should be less than 1 hour old to be considered fresh)
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour
    
    const isTeamTalkFresh = teamTalkLastUpdated && (now - teamTalkLastUpdated.getTime()) < maxAge;
    const isScoreInsideFresh = scoreInsideLastUpdated && (now - scoreInsideLastUpdated.getTime()) < maxAge;
    
    console.log('Data freshness check:', { 
      isTeamTalkFresh, 
      isScoreInsideFresh,
      teamTalkAge: teamTalkLastUpdated ? Math.round((now - teamTalkLastUpdated.getTime()) / 1000 / 60) : 'never',
      scoreInsideAge: scoreInsideLastUpdated ? Math.round((now - scoreInsideLastUpdated.getTime()) / 1000 / 60) : 'never'
    });
    
    // If we have fresh API data, use only API data. Otherwise include static data as fallback
    let combined: Transfer[] = [];
    
    if (isTeamTalkFresh || isScoreInsideFresh) {
      // Use fresh API data only
      combined = [
        ...teamTalkTransfers,
        ...scoreInsideAllTransfers
      ];
      console.log('Using fresh API data only:', combined.length, 'transfers');
    } else {
      // Include static data as fallback when API data is stale
      combined = [
        ...teamTalkTransfers,
        ...scoreInsideAllTransfers,
        ...staticTransfers.filter(t => {
          // Only include recent static transfers (last 30 days) to avoid showing old data
          const transferDate = new Date(t.date);
          const thirtyDaysAgo = new Date(now - (30 * 24 * 60 * 60 * 1000));
          return transferDate > thirtyDaysAgo;
        })
      ];
      console.log('Using API + filtered static data:', combined.length, 'transfers');
    }
    
    return deduplicateTransfersUI(combined);
  }, [teamTalkTransfers, scoreInsideAllTransfers, staticTransfers, teamTalkLastUpdated, scoreInsideLastUpdated]);

  const refreshAllData = async () => {
    console.log('Refreshing all transfer data sources...');
    await Promise.all([
      refreshTeamTalkFeed(),
      refreshScoreInsideFeed()
    ]);
    setLastUpdated(new Date());
  };

  const overrideTransfers = (newTransfers: Transfer[]) => {
    setStaticTransfers(newTransfers);
    setLastUpdated(new Date());
  };

  const store: TransferDataStore = {
    staticTransfers,
    teamTalkTransfers,
    scoreInsideAllTransfers,
    teamSpecificTransfers,
    allTransfers,
    lastUpdated,
    teamTalkLastUpdated,
    scoreInsideLastUpdated,
    teamTalkLoading,
    scoreInsideLoading,
    teamTalkError,
    scoreInsideError,
    refreshTeamTalkFeed,
    refreshScoreInsideFeed,
    refreshAllData,
    refreshTeamData,
    getTeamTransfers,
    overrideTransfers
  };

  return (
    <TransferDataContext.Provider value={store}>
      {children}
    </TransferDataContext.Provider>
  );
};

export const useTransferDataStore = (): TransferDataStore => {
  const context = useContext(TransferDataContext);
  if (!context) {
    throw new Error('useTransferDataStore must be used within a TransferDataProvider');
  }
  return context;
};
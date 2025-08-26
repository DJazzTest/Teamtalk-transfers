
import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react';
import { Transfer } from '@/types/transfer';
import { useTeamTalkFeed } from '@/hooks/useTeamTalkFeed';
import { useScoreInsideFeed } from '@/hooks/useScoreInsideFeed';
import { useTransferPolling } from '@/hooks/useTransferPolling';
import { deduplicateTransfersUI } from '@/utils/transferDeduplication';

interface TransferDataStore {
  // API data sources only
  teamTalkTransfers: Transfer[];
  scoreInsideAllTransfers: Transfer[];
  teamSpecificTransfers: Map<string, Transfer[]>;
  
  // Combined data (API only)
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
  
  // Polling status
  isPollingEnabled: boolean;
  pollingInterval: number;
  
  // Methods
  refreshTeamTalkFeed: () => Promise<void>;
  refreshScoreInsideFeed: () => Promise<void>;
  refreshAllData: () => Promise<void>;
  refreshTeamData: (teamSlug: string) => Promise<void>;
  getTeamTransfers: (teamSlug: string) => Transfer[];
  manualPollingRefresh: () => Promise<void>;
}

const TransferDataContext = createContext<TransferDataStore | undefined>(undefined);

export const TransferDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());

  // Use custom hooks for API data only
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

  // Enhanced polling service for real-time updates
  const {
    manualRefresh: manualPollingRefresh,
    isEnabled: isPollingEnabled,
    intervalMinutes: pollingInterval
  } = useTransferPolling({
    enabled: true,
    intervalMinutes: 5, // Poll every 5 minutes
    showNotifications: true
  });

  // Combined transfers with deduplication - API data only
  const allTransfers = useMemo(() => {
    console.log('Combining transfers from API sources only...');
    
    // Use only fresh API data from both sources
    const combined: Transfer[] = [
      ...teamTalkTransfers,
      ...scoreInsideAllTransfers
    ];
    
    console.log('Using API data only:', {
      teamTalk: teamTalkTransfers.length,
      scoreInside: scoreInsideAllTransfers.length,
      total: combined.length
    });
    
    return deduplicateTransfersUI(combined);
  }, [teamTalkTransfers, scoreInsideAllTransfers]);

  const refreshAllData = async () => {
    console.log('Refreshing all API data sources...');
    await Promise.all([
      refreshTeamTalkFeed(),
      refreshScoreInsideFeed()
    ]);
    setLastUpdated(new Date());
  };

  const store: TransferDataStore = {
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
    isPollingEnabled,
    pollingInterval,
    refreshTeamTalkFeed,
    refreshScoreInsideFeed,
    refreshAllData,
    refreshTeamData,
    getTeamTransfers,
    manualPollingRefresh
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

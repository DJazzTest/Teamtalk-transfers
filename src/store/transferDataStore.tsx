
import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Transfer } from '@/types/transfer';
import { useTeamTalkFeed } from '@/hooks/useTeamTalkFeed';
import { useScoreInsideFeed } from '@/hooks/useScoreInsideFeed';
import { TransferIntegrationService } from '@/utils/transferIntegration';
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

  // Polling state - moved directly into the provider
  const [isPollingEnabled] = useState(true);
  const [pollingInterval] = useState(5);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Direct polling implementation (no context dependency)
  const performPolling = useCallback(async (): Promise<void> => {
    if (!isPollingEnabled) return;

    console.log(`🔄 Polling for transfer updates... (${new Date().toLocaleTimeString()})`);
    
    try {
      const FCM_TOKEN = "ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ";
      
      // Fetch transfers and news in parallel
      const [transfersResponse, newsResponse] = await Promise.all([
        fetch(`https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=${FCM_TOKEN}`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'TransferCentre/1.0'
          }
        }),
        fetch(`https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=${FCM_TOKEN}`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'TransferCentre/1.0'
          }
        })
      ]);

      if (transfersResponse.ok) {
        const transfersData = await transfersResponse.json();
        console.log(`✅ Fetched ${transfersData.result?.top_transfers?.length || 0} top transfers`);
      }

      if (newsResponse.ok) {
        const newsData = await newsResponse.json();
        console.log(`📰 Fetched ${newsData.result?.transfer_articles?.data?.length || 0} news articles`);
      }

      // Refresh the main data stores
      await Promise.all([
        refreshTeamTalkFeed(),
        refreshScoreInsideFeed()
      ]);
      
      console.log('✅ Polling completed successfully');
    } catch (error) {
      console.error('❌ Polling failed:', error);
    }
  }, [isPollingEnabled, refreshTeamTalkFeed, refreshScoreInsideFeed]);

  // Set up polling interval
  useEffect(() => {
    if (!isPollingEnabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial poll
    performPolling();

    // Set up interval
    intervalRef.current = setInterval(() => {
      performPolling();
    }, pollingInterval * 60 * 1000);

    console.log(`🕐 Transfer polling started - checking every ${pollingInterval} minute(s)`);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPollingEnabled, pollingInterval, performPolling]);

  // Use static transfers with real values
  const allTransfers = useMemo(() => {
    const staticTransfers = TransferIntegrationService.getAllTransfers();
    console.log('✅ Using static data with real transfer fees');
    return staticTransfers;
  }, []);

  const refreshAllData = async () => {
    console.log('Refreshing all API data sources...');
    await Promise.all([
      refreshTeamTalkFeed(),
      refreshScoreInsideFeed()
    ]);
    setLastUpdated(new Date());
  };

  // Manual polling refresh function
  const manualPollingRefresh = useCallback(async () => {
    await performPolling();
  }, [performPolling]);

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

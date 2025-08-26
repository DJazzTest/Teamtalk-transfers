import { useEffect, useCallback, useRef } from 'react';
import { useTransferDataStore } from '@/store/transferDataStore';
import { toast } from '@/hooks/use-toast';

/**
 * Enhanced Transfer Polling Hook
 * 
 * This hook implements automated polling for transfer updates as requested by the user.
 * It fetches data from ScoreInside API endpoints every 5 minutes to ensure transfers 
 * and news are always up to date.
 * 
 * Features:
 * - Polls https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers
 * - Polls https://liveapi.scoreinside.com/api/user/favourite/teams/news
 * - Auto-refresh every 5 minutes (configurable)
 * - Shows notifications for new transfers
 * - Integrates with existing data store
 * - Manual refresh capability
 */

interface TransferPollingOptions {
  enabled?: boolean;
  intervalMinutes?: number;
  showNotifications?: boolean;
}

const FCM_TOKEN = "ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ";

interface TopTransfersResponse {
  status: number;
  message: string;
  result: {
    top_transfers: Array<{
      pid: number;
      ttfr: number;
      ttto: number;
      pcat: string;
      scat: string;
      pr: string;
      team_from: {
        id: number;
        nm: string;
        sl: string;
      };
      team: {
        id: number;
        nm: string;
        sl: string;
      };
      player: {
        id: number;
        nm: string;
        sl: string;
        hs: string | null;
        sn: string;
      };
    }>;
  };
}

interface NewsResponse {
  status: number;
  message: string;
  result: {
    transfer_articles: {
      current_page: number;
      data: Array<{
        aid: number;
        pid: number;
        ttfr: number | null;
        ttto: number;
        scat: string;
        article: {
          id: number;
          imid: number;
          hdl: string;
          sl: string;
          sdt: string;
          image?: {
            id: number;
            ttl: string;
            cap: string;
            fn: string;
            crd: string;
            ty: string;
            scim: string;
            impth: string;
          };
        };
        team: {
          id: number;
          nm: string;
          sl: string;
        };
        team_from: {
          id: number;
          nm: string;
          sl: string;
        } | null;
        player: {
          id: number;
          nm: string;
          sl: string;
          sn: string;
        };
      }>;
    };
  };
}

export const useTransferPolling = ({
  enabled = true,
  intervalMinutes = 5,
  showNotifications = true
}: TransferPollingOptions = {}) => {
  const { refreshAllData, allTransfers } = useTransferDataStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTransferCountRef = useRef<number>(0);

  const fetchTopTransfers = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(
        `https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=${FCM_TOKEN}`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'TransferCentre/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TopTransfersResponse = await response.json();
      
      if (data.status === 200 && data.result?.top_transfers) {
        console.log(`✅ Fetched ${data.result.top_transfers.length} top transfers`);
        
        // Check for new transfers
        if (showNotifications && data.result.top_transfers.length > lastTransferCountRef.current) {
          const newCount = data.result.top_transfers.length - lastTransferCountRef.current;
          toast({
            title: "New Transfers Found",
            description: `${newCount} new transfer(s) detected`,
          });
        }
        
        lastTransferCountRef.current = data.result.top_transfers.length;
      }
    } catch (error) {
      console.error('❌ Error fetching top transfers:', error);
      if (showNotifications) {
        toast({
          title: "Transfer Update Failed",
          description: "Failed to fetch latest transfers",
          variant: "destructive"
        });
      }
    }
  }, [showNotifications]);

  const fetchTransferNews = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(
        `https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=${FCM_TOKEN}`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'TransferCentre/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: NewsResponse = await response.json();
      
      if (data.status === 200 && data.result?.transfer_articles?.data) {
        console.log(`📰 Fetched ${data.result.transfer_articles.data.length} news articles`);
      }
    } catch (error) {
      console.error('❌ Error fetching transfer news:', error);
    }
  }, []);

  const performPolling = useCallback(async (): Promise<void> => {
    if (!enabled) return;

    console.log(`🔄 Polling for transfer updates... (${new Date().toLocaleTimeString()})`);
    
    try {
      // Fetch both transfers and news in parallel
      await Promise.all([
        fetchTopTransfers(),
        fetchTransferNews()
      ]);

      // Also refresh the main data store to ensure consistency
      await refreshAllData();
      
      console.log('✅ Polling completed successfully');
    } catch (error) {
      console.error('❌ Polling failed:', error);
    }
  }, [enabled, fetchTopTransfers, fetchTransferNews, refreshAllData]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      performPolling();
    }
  }, [enabled, performPolling]);

  // Set up polling interval
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      performPolling();
    }, intervalMinutes * 60 * 1000);

    console.log(`🕐 Transfer polling started - checking every ${intervalMinutes} minute(s)`);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, intervalMinutes, performPolling]);

  // Manual refresh function
  const manualRefresh = useCallback(async () => {
    await performPolling();
  }, [performPolling]);

  return {
    manualRefresh,
    isEnabled: enabled,
    intervalMinutes
  };
};
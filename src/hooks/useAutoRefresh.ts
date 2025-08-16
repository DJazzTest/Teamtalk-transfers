import { useEffect, useCallback } from 'react';
import { useTransferDataStore } from '@/store/transferDataStore';

interface UseAutoRefreshOptions {
  enabled?: boolean;
  intervalMinutes?: number;
  maxRetries?: number;
}

export const useAutoRefresh = ({
  enabled = true,
  intervalMinutes = 15,
  maxRetries = 3
}: UseAutoRefreshOptions = {}) => {
  const { 
    refreshAllData, 
    teamTalkLastUpdated, 
    scoreInsideLastUpdated,
    teamTalkError,
    scoreInsideError
  } = useTransferDataStore();

  const performRefresh = useCallback(async () => {
    if (!enabled) return;

    const now = Date.now();
    const maxAge = intervalMinutes * 60 * 1000;
    
    // Check if any data source needs refreshing
    const needsTeamTalkRefresh = !teamTalkLastUpdated || 
      (now - teamTalkLastUpdated.getTime()) > maxAge;
    
    const needsScoreInsideRefresh = !scoreInsideLastUpdated || 
      (now - scoreInsideLastUpdated.getTime()) > maxAge;

    if (needsTeamTalkRefresh || needsScoreInsideRefresh) {
      console.log('Auto-refreshing stale data...', {
        needsTeamTalkRefresh,
        needsScoreInsideRefresh,
        teamTalkAge: teamTalkLastUpdated ? Math.round((now - teamTalkLastUpdated.getTime()) / 1000 / 60) : 'never',
        scoreInsideAge: scoreInsideLastUpdated ? Math.round((now - scoreInsideLastUpdated.getTime()) / 1000 / 60) : 'never'
      });

      try {
        await refreshAllData();
        console.log('Auto-refresh completed successfully');
      } catch (error) {
        console.error('Auto-refresh failed:', error);
      }
    }
  }, [enabled, intervalMinutes, refreshAllData, teamTalkLastUpdated, scoreInsideLastUpdated]);

  // Check for failed APIs and retry
  const retryFailedApis = useCallback(async () => {
    if (!enabled) return;

    if (teamTalkError || scoreInsideError) {
      console.log('Retrying failed APIs...', { teamTalkError, scoreInsideError });
      try {
        await refreshAllData();
      } catch (error) {
        console.error('API retry failed:', error);
      }
    }
  }, [enabled, teamTalkError, scoreInsideError, refreshAllData]);

  // Main auto-refresh interval
  useEffect(() => {
    if (!enabled) return;

    // Initial check
    performRefresh();

    // Set up regular interval
    const interval = setInterval(performRefresh, intervalMinutes * 60 * 1000);

    return () => clearInterval(interval);
  }, [enabled, intervalMinutes, performRefresh]);

  // Retry failed APIs more frequently
  useEffect(() => {
    if (!enabled) return;

    const retryInterval = setInterval(retryFailedApis, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(retryInterval);
  }, [enabled, retryFailedApis]);

  // Listen for manual refresh events
  useEffect(() => {
    const handleManualRefresh = () => {
      console.log('Manual refresh triggered');
      performRefresh();
    };

    window.addEventListener('manualRefresh', handleManualRefresh);
    return () => window.removeEventListener('manualRefresh', handleManualRefresh);
  }, [performRefresh]);

  return {
    performRefresh,
    retryFailedApis
  };
};
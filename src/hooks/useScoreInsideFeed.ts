import { useState, useEffect, useCallback } from 'react';
import { scoreInsideApi } from '@/services/scoreinsideApi';
import { Transfer } from '@/types/transfer';

interface UseScoreInsideFeedResult {
  allTransfers: Transfer[];
  teamTransfers: Map<string, Transfer[]>;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  refreshTeam: (teamSlug: string) => Promise<void>;
  getTeamTransfers: (teamSlug: string) => Transfer[];
}

export const useScoreInsideFeed = (autoRefresh = true): UseScoreInsideFeedResult => {
  const [allTransfers, setAllTransfers] = useState<Transfer[]>([]);
  const [teamTransfers, setTeamTransfers] = useState<Map<string, Transfer[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [allTeamsData, flatTransfers] = await Promise.all([
        scoreInsideApi.getAllTeamsTransfers(),
        scoreInsideApi.getAllTransfers()
      ]);

      setTeamTransfers(allTeamsData);
      setAllTransfers(flatTransfers);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch ScoreInside data';
      setError(errorMessage);
      console.error('ScoreInside feed error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshTeam = useCallback(async (teamSlug: string) => {
    try {
      // Clear cache for specific team
      scoreInsideApi.clearCache(teamSlug);
      
      // Fetch fresh data for the team
      const teamData = await scoreInsideApi.getTeamTransfers(teamSlug);
      
      // Update team transfers map
      setTeamTransfers(prev => {
        const updated = new Map(prev);
        updated.set(teamSlug, teamData);
        return updated;
      });

      // Refresh all transfers to include the updated team data
      const updatedAllTransfers = await scoreInsideApi.getAllTransfers();
      setAllTransfers(updatedAllTransfers);
      
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to refresh ${teamSlug} data`;
      setError(errorMessage);
      console.error(`ScoreInside team refresh error for ${teamSlug}:`, err);
    }
  }, []);

  const refresh = useCallback(async () => {
    scoreInsideApi.clearCache(); // Clear all cache
    await fetchAllData();
  }, [fetchAllData]);

  const getTeamTransfers = useCallback((teamSlug: string): Transfer[] => {
    return teamTransfers.get(teamSlug) || [];
  }, [teamTransfers]);

  useEffect(() => {
    if (autoRefresh) {
      fetchAllData();
    }
  }, [fetchAllData, autoRefresh]);

  // Auto-refresh every 15 minutes if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAllData();
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(interval);
  }, [fetchAllData, autoRefresh]);

  return {
    allTransfers,
    teamTransfers,
    loading,
    error,
    lastUpdated,
    refresh,
    refreshTeam,
    getTeamTransfers
  };
};

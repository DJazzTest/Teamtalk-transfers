import { useState, useEffect, useCallback } from 'react';
import { teamTalkApi } from '@/services/teamtalkApi';
import { TeamTalkArticle } from '@/types/teamtalk';
import { Transfer } from '@/types/transfer';

interface UseTeamTalkFeedResult {
  articles: TeamTalkArticle[];
  transfers: Transfer[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

export const useTeamTalkFeed = (autoRefresh = true): UseTeamTalkFeedResult => {
  const [articles, setArticles] = useState<TeamTalkArticle[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Force-clear any TeamTalk client cache (belt and braces)
      try {
        (teamTalkApi as any).clearCache?.();
      } catch {}

      const [fetchedArticles, fetchedTransfers] = await Promise.all([
        teamTalkApi.getTransferArticles(),
        teamTalkApi.getTransfers()
      ]);

      setArticles(fetchedArticles);
      setTransfers(fetchedTransfers);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch TeamTalk data';
      setError(errorMessage);
      console.error('TeamTalk feed error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (autoRefresh) {
      fetchData();
    }
  }, [fetchData, autoRefresh]);

  // Auto-refresh every 10 minutes if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [fetchData, autoRefresh]);

  return {
    articles,
    transfers,
    loading,
    error,
    lastUpdated,
    refresh
  };
};

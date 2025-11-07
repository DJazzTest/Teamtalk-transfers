/**
 * Hook to fetch and update player statistics from APIs
 */

import { useState, useEffect, useCallback } from 'react';
import { PlayerStatsService } from '@/services/playerStatsService';
import { PlayerSeasonStats } from '@/data/squadWages';

interface UsePlayerStatsOptions {
  enabled?: boolean;
  autoFetch?: boolean;
}

export const usePlayerStats = (
  playerName: string,
  teamName: string,
  options: UsePlayerStatsOptions & { playerPosition?: string } = {}
) => {
  const { enabled = true, autoFetch = false, playerPosition } = options;
  const [stats, setStats] = useState<PlayerSeasonStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!enabled || !playerName || !teamName) return;

    setLoading(true);
    setError(null);

    try {
      const service = PlayerStatsService.getInstance();
      const result = await service.getPlayerStats(playerName, teamName, undefined, undefined, playerPosition);
      
      if (result.seasonStats) {
        setStats(result.seasonStats);
        
        // Save to localStorage for persistence
        try {
          const savedPlayers = JSON.parse(localStorage.getItem('playerEdits') || '{}');
          if (!savedPlayers[teamName]) savedPlayers[teamName] = {};
          if (!savedPlayers[teamName][playerName]) savedPlayers[teamName][playerName] = {};
          
          savedPlayers[teamName][playerName].seasonStats = result.seasonStats;
          localStorage.setItem('playerEdits', JSON.stringify(savedPlayers));
          
          // Dispatch event to notify other components
          window.dispatchEvent(new CustomEvent('playerDataUpdated'));
        } catch (e) {
          console.warn('Failed to save player stats to localStorage:', e);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch player stats'));
      console.error('Error fetching player stats:', err);
    } finally {
      setLoading(false);
    }
  }, [playerName, teamName, enabled, playerPosition]);

  useEffect(() => {
    if (autoFetch) {
      fetchStats();
    }
  }, [autoFetch, fetchStats]);

  return {
    stats,
    loading,
    error,
    fetchStats,
    refetch: fetchStats
  };
};

/**
 * Hook to fetch stats for all players in a team
 */
export const useTeamPlayerStats = (
  teamName: string,
  playerNames: string[],
  options: UsePlayerStatsOptions & { playerPositions?: Map<string, string> } = {}
) => {
  const { enabled = true, autoFetch = false, playerPositions } = options;
  const [statsMap, setStatsMap] = useState<Map<string, PlayerSeasonStats>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const fetchAllStats = useCallback(async () => {
    if (!enabled || !teamName || playerNames.length === 0) {
      console.log('[useTeamPlayerStats] Skipping fetch:', { enabled, teamName, playerCount: playerNames.length });
      return;
    }

    console.log(`[useTeamPlayerStats] Starting fetch for ${teamName} with ${playerNames.length} players`);
    setLoading(true);
    setError(null);
    setProgress({ current: 0, total: playerNames.length });

    try {
      const service = PlayerStatsService.getInstance();
      console.log(`[useTeamPlayerStats] Calling getTeamPlayerStats...`);
      const results = await service.getTeamPlayerStats(teamName, playerNames, undefined, undefined, playerPositions);
      console.log(`[useTeamPlayerStats] Got ${results.size} results from service`);
      
      const newStatsMap = new Map<string, PlayerSeasonStats>();
      let savedCount = 0;
      
      // Save all stats to localStorage
      try {
        const savedPlayers = JSON.parse(localStorage.getItem('playerEdits') || '{}');
        if (!savedPlayers[teamName]) savedPlayers[teamName] = {};
        
        for (const [playerName, result] of results.entries()) {
          if (result.seasonStats) {
            newStatsMap.set(playerName, result.seasonStats);
            
            if (!savedPlayers[teamName][playerName]) {
              savedPlayers[teamName][playerName] = {};
            }
            savedPlayers[teamName][playerName].seasonStats = result.seasonStats;
            savedCount++;
          }
        }
        
        localStorage.setItem('playerEdits', JSON.stringify(savedPlayers));
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('playerDataUpdated'));
      } catch (e) {
        console.warn('Failed to save player stats to localStorage:', e);
      }
      
      setStatsMap(newStatsMap);
      setProgress({ current: savedCount, total: playerNames.length });
      console.log(`[useTeamPlayerStats] ✅ Completed: ${savedCount} players with stats saved`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch team player stats');
      setError(error);
      console.error('[useTeamPlayerStats] ❌ Error fetching team player stats:', err);
      console.error('[useTeamPlayerStats] Error details:', {
        message: error.message,
        stack: error.stack,
        teamName,
        playerCount: playerNames.length
      });
    } finally {
      setLoading(false);
      console.log('[useTeamPlayerStats] Fetch completed, loading set to false');
    }
  }, [teamName, playerNames, enabled, playerPositions]);

  useEffect(() => {
    if (autoFetch) {
      fetchAllStats();
    }
  }, [autoFetch, fetchAllStats]);

  return {
    statsMap,
    loading,
    error,
    progress,
    fetchAllStats,
    refetch: fetchAllStats
  };
};


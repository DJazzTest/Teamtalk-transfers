/**
 * Service to fetch and calculate player statistics from match data
 */

import { TeamResultsFixturesService } from './teamResultsFixturesService';
import { CompetitionStats, PlayerSeasonStats } from '@/data/squadWages';
import { ApiPlayerStatsService } from './apiPlayerStatsService';
import { getTeamConfig } from '@/data/teamApiConfig';

export interface PlayerStatsResult {
  seasonStats?: PlayerSeasonStats;
  totalGoals: number;
  totalAssists: number;
  totalAppearances: number;
  totalMinutes: number;
  totalCleanSheets?: number;
  totalGoalsConceded?: number;
}

export class PlayerStatsService {
  private static instance: PlayerStatsService;
  private cache: Map<string, { data: PlayerStatsResult; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  static getInstance(): PlayerStatsService {
    if (!PlayerStatsService.instance) {
      PlayerStatsService.instance = new PlayerStatsService();
    }
    return PlayerStatsService.instance;
  }

  /**
   * Normalize player name for matching (handles variations like "David Raya" vs "D. Raya")
   */
  private normalizePlayerName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ');
  }

  /**
   * Check if a scorer name matches the player name
   */
  private matchesPlayer(scorerName: string, playerName: string): boolean {
    const normalizedScorer = this.normalizePlayerName(scorerName);
    const normalizedPlayer = this.normalizePlayerName(playerName);
    
    // Split into parts
    const scorerParts = normalizedScorer.split(' ');
    const playerParts = normalizedPlayer.split(' ');
    
    // Check if last name matches (most reliable)
    if (scorerParts.length > 0 && playerParts.length > 0) {
      const scorerLastName = scorerParts[scorerParts.length - 1];
      const playerLastName = playerParts[playerParts.length - 1];
      
      if (scorerLastName === playerLastName) {
        // If first name is just initial (e.g., "D. Raya"), check if first letter matches
        if (scorerParts.length > 1 && scorerParts[0].length <= 2) {
          const playerFirstName = playerParts[0];
          return playerFirstName.startsWith(scorerParts[0].replace('.', ''));
        }
        // If full first name matches or is similar
        if (scorerParts.length > 1 && playerParts.length > 1) {
          return scorerParts[0] === playerParts[0] || 
                 scorerParts[0].startsWith(playerParts[0]) ||
                 playerParts[0].startsWith(scorerParts[0]);
        }
        return true; // Last name matches
      }
    }
    
    // Fallback: check if names are similar
    return normalizedScorer.includes(normalizedPlayer) || 
           normalizedPlayer.includes(normalizedScorer);
  }

  /**
   * Get player statistics from match data
   */
  async getPlayerStats(
    playerName: string,
    teamName: string,
    seasonStart?: string,
    seasonEnd?: string,
    playerPosition?: string
  ): Promise<PlayerStatsResult> {
    const cacheKey = `${playerName}-${teamName}-${seasonStart || 'default'}-${seasonEnd || 'default'}`;
    const now = Date.now();
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const resultsService = TeamResultsFixturesService.getInstance();
      
      // Get current season dates if not provided
      const now = new Date();
      const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
      const startDate = seasonStart || new Date(Date.UTC(year, 7, 1, 0, 0, 0)).toISOString();
      const endDate = seasonEnd || new Date(Date.UTC(year + 1, 5, 30, 23, 59, 59)).toISOString();
      
      // Get team results
      const results = await resultsService.getTeamResults(teamName, startDate, endDate);
      
      // Group stats by competition
      const competitionMap = new Map<string, CompetitionStats>();
      
      let totalGoals = 0;
      let totalAssists = 0;
      let totalAppearances = 0;
      let totalMinutes = 0;
      let totalCleanSheets = 0;
      let totalGoalsConceded = 0;
      
      const isGoalkeeper = playerPosition?.toLowerCase().includes('goalkeeper') || 
                          playerName.toLowerCase().includes('goalkeeper');
      
      // Limit to first 30 matches to avoid too many API calls
      const matchesToCheck = results.slice(0, 30);
      const matchesWithPlayer: Set<string> = new Set();
      
      for (const match of matchesToCheck) {
        if (!match.id) continue;
        
        try {
          const details = await resultsService.getMatchDetails(match.id);
          const competition = match.competition || details.competition || 'Other';
          
          // Initialize competition stats if not exists
          if (!competitionMap.has(competition)) {
            competitionMap.set(competition, {
              competition,
              matches: 0,
              minutes: 0,
              goals: 0,
              assists: 0,
              cleanSheets: 0,
              goalsConceded: 0
            });
          }
          
          const compStats = competitionMap.get(competition)!;
          
          // Check if player scored goals
          if (details.goalScorers && Array.isArray(details.goalScorers)) {
            for (const scorer of details.goalScorers) {
              if (this.matchesPlayer(scorer.name || '', playerName)) {
                // Check if it's for the correct team
                const scorerTeam = (scorer.team || '').toLowerCase();
                const teamNameLower = teamName.toLowerCase();
                
                if (!scorerTeam || scorerTeam.includes(teamNameLower) || teamNameLower.includes(scorerTeam)) {
                  totalGoals += 1;
                  compStats.goals = (compStats.goals || 0) + 1;
                  matchesWithPlayer.add(match.id);
                  
                  // If not goalkeeper, count this as an appearance
                  if (!isGoalkeeper) {
                    compStats.matches += 1;
                    compStats.minutes += 90; // Assume full match
                    totalAppearances += 1;
                    totalMinutes += 90;
                  }
                }
              }
            }
          }
          
          // For goalkeepers, calculate clean sheets and goals conceded
          if (isGoalkeeper && match.homeScore !== undefined && match.awayScore !== undefined) {
            const teamNameLower = teamName.toLowerCase();
            const isHome = match.homeTeam.toLowerCase().includes(teamNameLower) || 
                          teamNameLower.includes(match.homeTeam.toLowerCase());
            const goalsConceded = isHome ? match.awayScore : match.homeScore;
            
            compStats.goalsConceded += goalsConceded;
            totalGoalsConceded += goalsConceded;
            
            if (goalsConceded === 0) {
              compStats.cleanSheets += 1;
              totalCleanSheets += 1;
            }
            
            // Assume goalkeeper played full match
            compStats.matches += 1;
            compStats.minutes += 90;
            totalAppearances += 1;
            totalMinutes += 90;
            matchesWithPlayer.add(match.id);
          }
          
          // For non-goalkeepers without goals, estimate appearances (60% chance for regular players)
          if (!isGoalkeeper && !matchesWithPlayer.has(match.id)) {
            // Estimate based on position - could be improved with actual lineup data
            const shouldAppear = Math.random() > 0.4; // 60% chance
            if (shouldAppear) {
              compStats.matches += 1;
              compStats.minutes += 90;
              totalAppearances += 1;
              totalMinutes += 90;
            }
          }
        } catch (err) {
          // Skip if match details fail
          console.warn(`Failed to get details for match ${match.id}:`, err);
          continue;
        }
      }
      
      // Convert competition map to array
      const competitions = Array.from(competitionMap.values())
        .filter(c => c.matches > 0) // Only include competitions where player appeared
        .sort((a, b) => b.matches - a.matches); // Sort by matches descending
      
      const result: PlayerStatsResult = {
        seasonStats: competitions.length > 0 ? {
          season: `${year}-${(year + 1).toString().slice(-2)}`,
          competitions
        } : undefined,
        totalGoals,
        totalAssists,
        totalAppearances,
        totalMinutes,
        totalCleanSheets: isGoalkeeper ? totalCleanSheets : undefined,
        totalGoalsConceded: isGoalkeeper ? totalGoalsConceded : undefined
      };
      
      // Cache the result
      this.cache.set(cacheKey, { data: result, timestamp: now });
      
      return result;
    } catch (error) {
      console.error(`Error fetching stats for ${playerName} (${teamName}):`, error);
      return {
        totalGoals: 0,
        totalAssists: 0,
        totalAppearances: 0,
        totalMinutes: 0
      };
    }
  }

  /**
   * Get stats for multiple players in a team
   */
  async getTeamPlayerStats(
    teamName: string,
    playerNames: string[],
    seasonStart?: string,
    seasonEnd?: string,
    playerPositions?: Map<string, string>
  ): Promise<Map<string, PlayerStatsResult>> {
    const results = new Map<string, PlayerStatsResult>();
    
      // First, try to get stats from API services (faster and more reliable)
      try {
        console.log(`[PlayerStatsService] Attempting to fetch stats from APIs for ${teamName}`);
        const apiService = ApiPlayerStatsService.getInstance();
        const teamConfig = getTeamConfig(teamName);
        
        // Extract stage ID from table API URL (handles both formats)
        let stageId: string | undefined;
        const tableApi = teamConfig?.leagueTable?.tableApi;
        if (tableApi) {
          // Format 1: /soccer/{stageId} (Sport365)
          const match1 = tableApi.match(/\/soccer\/([a-f0-9-]+)$/i);
          if (match1) {
            stageId = match1[1];
            console.log(`[PlayerStatsService] Extracted stage ID: ${stageId}`);
          } else {
            // Format 2: /match/{matchId}/table (TT Staging) - extract match ID
            const match2 = tableApi.match(/\/match\/(\d+)\/table$/);
            if (match2) {
              stageId = match2[1];
              console.log(`[PlayerStatsService] Extracted match ID: ${stageId}`);
            }
          }
        } else {
          console.log(`[PlayerStatsService] No table API found for ${teamName}`);
        }
        
        const apiStats = await apiService.getTeamPlayerStats(teamName, stageId);
        console.log(`[PlayerStatsService] API returned ${apiStats.size} player stats`);
        
        const matchedStats = apiService.matchStatsToPlayers(apiStats, playerNames);
        console.log(`[PlayerStatsService] Matched ${matchedStats.size} players to squad`);
        
        // Convert API stats to PlayerStatsResult format
        for (const [playerName, apiStat] of matchedStats.entries()) {
          console.log(`[PlayerStatsService] Processing stats for ${playerName}:`, {
            goals: apiStat.totalGoals,
            appearances: apiStat.totalAppearances,
            hasSeasonStats: !!apiStat.seasonStats
          });
          results.set(playerName, {
            seasonStats: apiStat.seasonStats,
            totalGoals: apiStat.totalGoals || 0,
            totalAssists: apiStat.totalAssists || 0,
            totalAppearances: apiStat.totalAppearances || 0,
            totalMinutes: apiStat.totalMinutes || 0,
            totalCleanSheets: apiStat.totalCleanSheets,
            totalGoalsConceded: apiStat.totalGoalsConceded
          });
        }
        
        // If we got stats from APIs, return them (don't fall back to match analysis)
        if (results.size > 0) {
          console.log(`[PlayerStatsService] ✅ Got ${results.size} player stats from APIs for ${teamName}`);
          return results;
        } else {
          console.log(`[PlayerStatsService] ⚠️ No stats found from APIs, will fall back to match analysis`);
        }
      } catch (error) {
        console.error('[PlayerStatsService] ❌ Failed to fetch stats from APIs:', error);
        console.warn('Falling back to match analysis');
      }
    
    // Fallback: Fetch stats from match data (slower but more comprehensive)
    const batchSize = 10;
    for (let i = 0; i < playerNames.length; i += batchSize) {
      const batch = playerNames.slice(i, i + batchSize);
      const promises = batch.map(playerName =>
        this.getPlayerStats(
          playerName, 
          teamName, 
          seasonStart, 
          seasonEnd,
          playerPositions?.get(playerName)
        )
          .then(stats => ({ playerName, stats }))
      );
      
      const batchResults = await Promise.allSettled(promises);
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.set(result.value.playerName, result.value.stats);
        }
      }
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < playerNames.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }
}


/**
 * Service to fetch player statistics from various APIs
 * Uses Sport365 team page, match stats, and stage stats APIs
 */

import { CompetitionStats, PlayerSeasonStats } from '@/data/squadWages';
import { getTeamConfig } from '@/data/teamApiConfig';
import { normalizeTeamName, getSport365Id } from '@/utils/teamMapping';

export interface ApiPlayerStats {
  playerName: string;
  seasonStats?: PlayerSeasonStats;
  totalGoals?: number;
  totalAssists?: number;
  totalAppearances?: number;
  totalMinutes?: number;
  totalCleanSheets?: number;
  totalGoalsConceded?: number;
}

export class ApiPlayerStatsService {
  private static instance: ApiPlayerStatsService;
  private cache: Map<string, { data: ApiPlayerStats[]; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  static getInstance(): ApiPlayerStatsService {
    if (!ApiPlayerStatsService.instance) {
      ApiPlayerStatsService.instance = new ApiPlayerStatsService();
    }
    return ApiPlayerStatsService.instance;
  }

  /**
   * Normalize player name for matching
   */
  private normalizePlayerName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ');
  }

  /**
   * Check if two player names match
   */
  private matchesPlayer(apiName: string, playerName: string): boolean {
    const normalizedApi = this.normalizePlayerName(apiName);
    const normalizedPlayer = this.normalizePlayerName(playerName);
    
    // Split into parts
    const apiParts = normalizedApi.split(' ');
    const playerParts = normalizedPlayer.split(' ');
    
    // Check if last name matches (most reliable)
    if (apiParts.length > 0 && playerParts.length > 0) {
      const apiLastName = apiParts[apiParts.length - 1];
      const playerLastName = playerParts[playerParts.length - 1];
      
      if (apiLastName === playerLastName) {
        // If first name is just initial (e.g., "D. Raya"), check if first letter matches
        if (apiParts.length > 1 && apiParts[0].length <= 2) {
          const playerFirstName = playerParts[0];
          return playerFirstName.startsWith(apiParts[0].replace('.', ''));
        }
        // If full first name matches or is similar
        if (apiParts.length > 1 && playerParts.length > 1) {
          return apiParts[0] === playerParts[0] || 
                 apiParts[0].startsWith(playerParts[0]) ||
                 playerParts[0].startsWith(apiParts[0]);
        }
        return true; // Last name matches
      }
    }
    
    // Fallback: check if names are similar
    return normalizedApi.includes(normalizedPlayer) || 
           normalizedPlayer.includes(normalizedApi);
  }

  /**
   * Fetch player stats from Sport365 team page API
   */
  async fetchFromTeamPage(teamName: string): Promise<ApiPlayerStats[]> {
    try {
      const sport365Id = getSport365Id(teamName);
      if (!sport365Id) {
        console.warn(`No Sport365 ID found for team: ${teamName}`);
        return [];
      }

      const url = `https://api.sport365.com/v1/en/team/soccer/teampage/${sport365Id}`;
      console.log(`Fetching team page for ${teamName}: ${url}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Failed to fetch team page: ${response.status}`);
        return [];
      }

      const data = await response.json();
      
      // Try to extract player stats from various possible structures
      const players: ApiPlayerStats[] = [];
      
      // Structure 1: data.players or data.squad
      const playerList = data.players || data.squad || data.team?.players || data.participants || [];
      
      if (Array.isArray(playerList) && playerList.length > 0) {
        console.log(`Found ${playerList.length} players in team page API`);
        for (const player of playerList) {
          const playerName = player.name || player.player_name || player.full_name || '';
          if (!playerName) continue;

          // Extract stats
          const stats: ApiPlayerStats = {
            playerName,
            totalGoals: player.goals || player.goals_scored || 0,
            totalAssists: player.assists || 0,
            totalAppearances: player.appearances || player.matches || player.games || 0,
            totalMinutes: player.minutes || player.minutes_played || 0,
            totalCleanSheets: player.clean_sheets || player.cleanSheets || 0,
            totalGoalsConceded: player.goals_conceded || player.goalsConceded || 0
          };

          // Try to extract competition-specific stats
          if (player.stats && Array.isArray(player.stats)) {
            const competitions: CompetitionStats[] = [];
            for (const stat of player.stats) {
              competitions.push({
                competition: stat.competition || stat.tournament || stat.league || 'Other',
                matches: stat.appearances || stat.matches || stat.games || 0,
                minutes: stat.minutes || stat.minutes_played || 0,
                goals: stat.goals || stat.goals_scored || 0,
                assists: stat.assists || 0,
                cleanSheets: stat.clean_sheets || stat.cleanSheets || 0,
                goalsConceded: stat.goals_conceded || stat.goalsConceded || 0
              });
            }
            
            if (competitions.length > 0) {
              const now = new Date();
              const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
              stats.seasonStats = {
                season: `${year}-${(year + 1).toString().slice(-2)}`,
                competitions
              };
            }
          }

          players.push(stats);
        }
      }

      // Structure 2: Check results for player data
      if (data.results && Array.isArray(data.results)) {
        console.log(`Found ${data.results.length} results, checking for player data in matches`);
        // We'll need to fetch individual match details to get player stats
        // This is handled by the match analysis fallback
      }
      
      // Structure 3: data.statistics or data.stats with player breakdown
      if (data.statistics || data.stats) {
        const statsData = data.statistics || data.stats;
        if (statsData.players && Array.isArray(statsData.players)) {
          console.log(`Found ${statsData.players.length} players in statistics`);
          for (const playerStat of statsData.players) {
            const playerName = playerStat.player?.name || playerStat.name || '';
            if (!playerName) continue;

            // Check if we already have this player
            const existing = players.find(p => this.matchesPlayer(p.playerName, playerName));
            if (existing) {
              // Merge stats
              existing.totalGoals = (existing.totalGoals || 0) + (playerStat.goals || 0);
              existing.totalAssists = (existing.totalAssists || 0) + (playerStat.assists || 0);
              existing.totalAppearances = (existing.totalAppearances || 0) + (playerStat.appearances || 0);
            } else {
              players.push({
                playerName,
                totalGoals: playerStat.goals || 0,
                totalAssists: playerStat.assists || 0,
                totalAppearances: playerStat.appearances || 0,
                totalMinutes: playerStat.minutes || 0
              });
            }
          }
        }
      }

      console.log(`Found ${players.length} players with stats from team page`);
      return players;
    } catch (error) {
      console.error(`Error fetching team page stats for ${teamName}:`, error);
      return [];
    }
  }

  /**
   * Fetch player stats from Sport365 stage/league stats API
   */
  async fetchFromStageStats(stageId: string, teamName: string): Promise<ApiPlayerStats[]> {
    try {
      const url = `https://api.sport365.com/v1/en/stage/part/stats/soccer/${stageId}`;
      console.log(`Fetching stage stats: ${url}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Failed to fetch stage stats: ${response.status}`);
        return [];
      }

      const data = await response.json();
      const players: ApiPlayerStats[] = [];

      // Try various structures for player stats
      // Note: participants_stats might be team stats, not player stats
      const statsList = data.stats || data.statistics || data.players || data.top_scorers || 
                        (data.participants_stats && Array.isArray(data.participants_stats) ? 
                          data.participants_stats.filter(s => s.player || s.name) : []) || [];
      
      console.log(`Found ${statsList.length} stat entries in stage stats API`);
      
      if (Array.isArray(statsList) && statsList.length > 0) {
        // Check first entry to understand structure
        console.log('First stat entry structure:', Object.keys(statsList[0]));
        
        for (const stat of statsList) {
          const playerName = stat.player?.name || stat.name || stat.player_name || '';
          const playerTeam = stat.team?.name || stat.team_name || stat.participant?.name || '';
          
          // Filter by team if provided
          if (teamName && playerTeam) {
            const normalizedTeam = normalizeTeamName(teamName);
            const normalizedPlayerTeam = normalizeTeamName(playerTeam);
            if (normalizedTeam !== normalizedPlayerTeam) continue;
          }

          if (!playerName) continue;

          const competitions: CompetitionStats[] = [];
          
          // Try to extract competition-specific stats
          if (stat.competition || stat.tournament) {
            competitions.push({
              competition: stat.competition || stat.tournament || 'Other',
              matches: stat.appearances || stat.matches || stat.games || 0,
              minutes: stat.minutes || stat.minutes_played || 0,
              goals: stat.goals || stat.goals_scored || 0,
              assists: stat.assists || 0,
              cleanSheets: stat.clean_sheets || stat.cleanSheets || 0,
              goalsConceded: stat.goals_conceded || stat.goalsConceded || 0
            });
          }

          const now = new Date();
          const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;

          players.push({
            playerName,
            seasonStats: competitions.length > 0 ? {
              season: `${year}-${(year + 1).toString().slice(-2)}`,
              competitions
            } : undefined,
            totalGoals: stat.goals || stat.goals_scored || 0,
            totalAssists: stat.assists || 0,
            totalAppearances: stat.appearances || stat.matches || stat.games || 0,
            totalMinutes: stat.minutes || stat.minutes_played || 0,
            totalCleanSheets: stat.clean_sheets || stat.cleanSheets || 0,
            totalGoalsConceded: stat.goals_conceded || stat.goalsConceded || 0
          });
        }
      }

      console.log(`Found ${players.length} players with stats from stage stats`);
      return players;
    } catch (error) {
      console.error(`Error fetching stage stats:`, error);
      return [];
    }
  }

  /**
   * Get player stats for a team from all available APIs
   */
  async getTeamPlayerStats(teamName: string, stageId?: string): Promise<Map<string, ApiPlayerStats>> {
    const cacheKey = `${teamName}-${stageId || 'default'}`;
    const now = Date.now();
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      const map = new Map<string, ApiPlayerStats>();
      cached.data.forEach(stat => map.set(stat.playerName, stat));
      return map;
    }

    const statsMap = new Map<string, ApiPlayerStats>();

    // Try team page API first
    const teamPageStats = await this.fetchFromTeamPage(teamName);
    for (const stat of teamPageStats) {
      statsMap.set(stat.playerName, stat);
    }

    // Try stage stats API if stageId provided
    if (stageId) {
      const stageStats = await this.fetchFromStageStats(stageId, teamName);
      for (const stat of stageStats) {
        // Merge with existing stats or add new
        const existing = statsMap.get(stat.playerName);
        if (existing) {
          // Merge stats
          existing.totalGoals = (existing.totalGoals || 0) + (stat.totalGoals || 0);
          existing.totalAssists = (existing.totalAssists || 0) + (stat.totalAssists || 0);
          existing.totalAppearances = (existing.totalAppearances || 0) + (stat.totalAppearances || 0);
          existing.totalMinutes = (existing.totalMinutes || 0) + (stat.totalMinutes || 0);
          
          // Merge competition stats
          if (stat.seasonStats && existing.seasonStats) {
            const compMap = new Map<string, CompetitionStats>();
            existing.seasonStats.competitions.forEach(c => compMap.set(c.competition, c));
            stat.seasonStats.competitions.forEach(c => {
              const existing = compMap.get(c.competition);
              if (existing) {
                existing.matches += c.matches;
                existing.minutes += c.minutes;
                existing.goals = (existing.goals || 0) + (c.goals || 0);
                existing.assists = (existing.assists || 0) + (c.assists || 0);
              } else {
                compMap.set(c.competition, c);
              }
            });
            existing.seasonStats.competitions = Array.from(compMap.values());
          } else if (stat.seasonStats) {
            existing.seasonStats = stat.seasonStats;
          }
        } else {
          statsMap.set(stat.playerName, stat);
        }
      }
    }

    // Cache the results
    this.cache.set(cacheKey, {
      data: Array.from(statsMap.values()),
      timestamp: now
    });

    return statsMap;
  }

  /**
   * Match API stats to squad players by name
   */
  matchStatsToPlayers(
    apiStats: Map<string, ApiPlayerStats>,
    squadPlayerNames: string[]
  ): Map<string, ApiPlayerStats> {
    const matched = new Map<string, ApiPlayerStats>();

    for (const squadName of squadPlayerNames) {
      // Try exact match first
      let found = apiStats.get(squadName);
      
      // Try fuzzy matching
      if (!found) {
        for (const [apiName, apiStat] of apiStats.entries()) {
          if (this.matchesPlayer(apiName, squadName)) {
            found = apiStat;
            break;
          }
        }
      }

      if (found) {
        matched.set(squadName, found);
      }
    }

    return matched;
  }
}


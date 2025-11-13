import { Transfer } from '@/types/transfer';
import { scoreInsideApi } from './scoreinsideApi';
import { teamTalkApi } from './teamtalkApi';
import { TransferIntegrationService } from '@/utils/transferIntegration';
import { ttStagingApi } from './ttStagingApi';
import { TEAMS_RUMOURS_DATA, RumourEntry } from '@/data/teamRumours';
import { normalizeTeamName } from '@/utils/teamMapping';

// Team ID mapping for staging API
const TEAM_IDS: Record<string, string> = {
  'Arsenal': '1205',
  'Aston Villa': '1215',
  'Bournemouth': '1124',
  'Brentford': '1276',
  'Brighton & Hove Albion': '1125',
  'Burnley': '1126',
  'Chelsea': '1317',
  'Crystal Palace': '1367',
  'Everton': '1408',
  'Fulham': '1431',
  'Leeds United': '1132',
  'Liverpool': '1548',
  'Manchester City': '1571',
  'Manchester United': '1143',
  'Newcastle United': '1599',
  'Nottingham Forest': '1136',
  'Sunderland': '1748',
  'Tottenham Hotspur': '1779',
  'West Ham United': '1811',
  'Wolverhampton Wanderers': '1837'
};

export class LiveDataService {
  private static instance: LiveDataService;
  private cache: { transfers: Transfer[]; timestamp: number } | null = null;
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

  static getInstance(): LiveDataService {
    if (!LiveDataService.instance) {
      LiveDataService.instance = new LiveDataService();
    }
    return LiveDataService.instance;
  }

  async getAllTransfers(forceRefresh: boolean = false): Promise<Transfer[]> {
    const now = Date.now();
    
    // Return cached data if still valid and not forcing refresh
    if (!forceRefresh && this.cache && (now - this.cache.timestamp) < this.CACHE_DURATION) {
      console.log('📦 Returning cached live transfers:', this.cache.transfers.length, 'transfers');
      return this.cache.transfers;
    }

    console.log('🔄 Fetching fresh live transfer data...');
    
    try {
      // Fetch data from all sources in parallel
      const [scoreInsideTransfers, teamTalkTransfers, stagingTransfers] = await Promise.allSettled([
        this.getScoreInsideData(),
        this.getTeamTalkData(),
        this.getStagingData()
      ]);

      // Collect successful results
      const allTransfers: Transfer[] = [];
      
      if (scoreInsideTransfers.status === 'fulfilled' && scoreInsideTransfers.value.length > 0) {
        allTransfers.push(...scoreInsideTransfers.value);
        console.log('✅ ScoreInside API:', scoreInsideTransfers.value.length, 'transfers');
      } else {
        console.warn('⚠️ ScoreInside API failed or returned no data');
      }
      
      if (teamTalkTransfers.status === 'fulfilled' && teamTalkTransfers.value.length > 0) {
        allTransfers.push(...teamTalkTransfers.value);
        console.log('✅ TeamTalk API:', teamTalkTransfers.value.length, 'transfers');
      } else {
        console.warn('⚠️ TeamTalk API failed or returned no data');
      }

      if (stagingTransfers.status === 'fulfilled' && stagingTransfers.value.length > 0) {
        allTransfers.push(...stagingTransfers.value);
        console.log('✅ Staging API:', stagingTransfers.value.length, 'transfers');
      } else {
        console.warn('⚠️ Staging API failed or returned no data');
      }

      // If no live data is available, fall back to static data
      if (allTransfers.length === 0) {
        console.log('⚠️ No live data available, using static fallback');
        const staticTransfers = TransferIntegrationService.getAllTransfers();
        this.cache = { transfers: staticTransfers, timestamp: now };
        return staticTransfers;
      }

      // Deduplicate transfers
      const uniqueTransfers = this.deduplicateTransfers(allTransfers);
      
      // Sort by date (most recent first)
      const sortedTransfers = uniqueTransfers.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Update cache
      this.cache = { transfers: sortedTransfers, timestamp: now };
      
      console.log('🎯 Final transfer count:', sortedTransfers.length, 'unique transfers');
      return sortedTransfers;

    } catch (error) {
      console.error('❌ Error fetching live transfers:', error);
      
      // Return cached data if available
      if (this.cache) {
        console.log('📦 Returning cached data due to error');
        return this.cache.transfers;
      }
      
      // Final fallback to static data
      console.log('📚 Final fallback to static data');
      return TransferIntegrationService.getAllTransfers();
    }
  }

  private async getScoreInsideData(): Promise<Transfer[]> {
    try {
      const transfers = await scoreInsideApi.getAllTransfers();
      return transfers.map(transfer => ({
        ...transfer,
        source: transfer.source || 'ScoreInside API'
      }));
    } catch (error) {
      console.error('ScoreInside API error:', error);
      return [];
    }
  }

  private async getTeamTalkData(): Promise<Transfer[]> {
    try {
      const transfers = await teamTalkApi.getTransfers();
      return transfers.map(transfer => ({
        ...transfer,
        source: transfer.source || 'TeamTalk API'
      }));
    } catch (error) {
      console.error('TeamTalk API error:', error);
      return [];
    }
  }

  private async getStagingData(): Promise<Transfer[]> {
    try {
      const allTransfers: Transfer[] = [];
      
      // Get rumours from all teams
      const rumourTeams = await ttStagingApi.getRumourTeams('2025/26', 'Summer', '72602');
      if (rumourTeams?.result?.rumour_teams?.data || rumourTeams?.result?.teams) {
        const teams = rumourTeams.result.rumour_teams?.data || rumourTeams.result.teams || [];
        for (const team of teams) {
          try {
            const teamId = team.id || team.team_id;
            const rumours = await ttStagingApi.getRumoursByTeam('2025/26', 'Summer', teamId, 1, '72602');
            // Handle both structures: result.rumours.data (object with data array) or result.rumours (direct array)
            const rumoursArray = rumours?.result?.rumours?.data || 
                                (Array.isArray(rumours?.result?.rumours) ? rumours.result.rumours : []);
            
            if (rumoursArray && rumoursArray.length > 0) {
              const teamTransfers = rumoursArray.map((rumour: any) => {
                const toClub = (rumour.team?.nm || rumour.team_to?.nm || 'Unknown Club').trim();
                const fromClub = (rumour.team_from?.nm || 'Unknown Club').trim();
                const playerName = (rumour.player?.nm || 'Unknown Player').trim();
                
                // Skip if player name is missing or invalid
                if (!playerName || playerName === 'Unknown Player') {
                  return null;
                }
                
                return {
                  id: `staging-rumour-${rumour.aid || rumour.pid || rumour.id || Date.now()}`,
                  playerName: playerName,
                  fromClub: fromClub || 'Unknown Club',
                  toClub: toClub || 'Unknown Club',
                  fee: rumour.prc ? rumour.prc.replace('€', '£').replace('Million', 'm') : undefined,
                  status: 'rumored' as const,
                  date: rumour.article?.sdt || rumour.created_at || rumour.date || new Date().toISOString(),
                  source: 'Staging API (Rumours)',
                  category: 'Rumours'
                };
              }).filter((t: any) => t !== null); // Remove null entries
              
              allTransfers.push(...teamTransfers);
              console.log(`✓ Fetched ${teamTransfers.length} rumours for ${teamId}`);
            }
          } catch (error) {
            console.warn(`Failed to fetch rumours for team ${team.id || team.team_id}:`, error);
          }
        }
      }
      
      // Also fetch rumours directly from all team IDs to ensure we get everything
      const allTeamIds = Object.values(TEAM_IDS);
      for (const teamId of allTeamIds) {
        try {
          const rumours = await ttStagingApi.getRumoursByTeam('2025/26', 'Summer', teamId, 1, '72602');
          const rumoursArray = rumours?.result?.rumours?.data || 
                              (Array.isArray(rumours?.result?.rumours) ? rumours.result.rumours : []);
          
          if (rumoursArray && rumoursArray.length > 0) {
            const teamTransfers = rumoursArray.map((rumour: any) => {
              const toClub = (rumour.team?.nm || rumour.team_to?.nm || 'Unknown Club').trim();
              const fromClub = (rumour.team_from?.nm || 'Unknown Club').trim();
              const playerName = (rumour.player?.nm || 'Unknown Player').trim();
              
              if (!playerName || playerName === 'Unknown Player') {
                return null;
              }
              
              return {
                id: `staging-rumour-${rumour.aid || rumour.pid || rumour.id || Date.now()}`,
                playerName: playerName,
                fromClub: fromClub || 'Unknown Club',
                toClub: toClub || 'Unknown Club',
                fee: rumour.prc ? rumour.prc.replace('€', '£').replace('Million', 'm') : undefined,
                status: 'rumored' as const,
                date: rumour.article?.sdt || rumour.created_at || rumour.date || new Date().toISOString(),
                source: 'Staging API (Rumours)',
                category: 'Rumours'
              };
            }).filter((t: any) => t !== null);
            
            // Only add if not already present (deduplication)
            const existingIds = new Set(allTransfers.map(t => t.id));
            const newTransfers = teamTransfers.filter((t: any) => !existingIds.has(t.id));
            allTransfers.push(...newTransfers);
          }
        } catch (error) {
          console.warn(`Failed to fetch rumours for team ${teamId}:`, error);
        }
        await new Promise(resolve => setTimeout(resolve, 200)); // Rate limiting
      }

      // Get done deals from all teams
      const doneDealTeams = await ttStagingApi.getDoneDealTeams('2025/26', 'Summer', '72602');
      if (doneDealTeams?.result?.done_deal_teams?.data || doneDealTeams?.result?.teams) {
        const teams = doneDealTeams.result.done_deal_teams?.data || doneDealTeams.result.teams || [];
        for (const team of teams) {
          try {
            const doneDeals = await ttStagingApi.getDoneDealsByTeam('2025/26', 'Summer', team.id || team.team_id);
            if (doneDeals?.result?.done_deals && Array.isArray(doneDeals.result.done_deals)) {
              const teamTransfers = doneDeals.result.done_deals.map((deal: any) => {
                // Handle both structures: team/team_from and team_to/team_from
                const toClub = (deal.team?.nm || deal.team_to?.nm || 'Unknown Club').trim();
                const fromClub = (deal.team_from?.nm || 'Unknown Club').trim();
                const fee = deal.prc ? deal.prc.replace('€', '£').replace('Million', 'm') : undefined;
                
                return {
                  id: `staging-done-${deal.pid || deal.id}`,
                  playerName: (deal.player?.nm || 'Unknown Player').trim(),
                  fromClub: fromClub,
                  toClub: toClub,
                  fee: fee,
                  status: 'confirmed' as const,
                  date: deal.created_at || deal.date || new Date().toISOString(),
                  source: 'Staging API (Done Deals)',
                  category: deal.scat || 'Done Deal'
                };
              });
              allTransfers.push(...teamTransfers);
            }
          } catch (error) {
            console.warn(`Failed to fetch done deals for team ${team.id || team.team_id}:`, error);
          }
        }
      }

      // Add manual rumours from teamRumours data
      for (const [teamName, rumours] of Object.entries(TEAMS_RUMOURS_DATA)) {
        const manualRumoursTransfers = rumours.map((rumour: RumourEntry) => ({
          id: `manual-rumour-${teamName.toLowerCase().replace(/\s+/g, '-')}-${rumour.player.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          playerName: rumour.player,
          fromClub: rumour.fromClub,
          toClub: rumour.toClub,
          fee: rumour.fee || undefined,
          status: 'rumored' as const,
          date: new Date().toISOString(),
          source: 'Manual Rumours Data',
          category: 'Rumours',
          description: rumour.description
        }));
        allTransfers.push(...manualRumoursTransfers);
      }

      return allTransfers;
    } catch (error) {
      console.error('Staging API error:', error);
      return [];
    }
  }

  private deduplicateTransfers(transfers: Transfer[]): Transfer[] {
    const seen = new Set<string>();
    const uniqueTransfers: Transfer[] = [];

    for (const transfer of transfers) {
      // Create a unique key based on player name and destination club
      const key = `${transfer.playerName.toLowerCase().trim()}-${transfer.toClub.toLowerCase().trim()}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        uniqueTransfers.push(transfer);
      }
    }

    return uniqueTransfers;
  }

  clearCache(): void {
    this.cache = null;
    console.log('🧹 Live data cache cleared');
  }
}

export const liveDataService = LiveDataService.getInstance();
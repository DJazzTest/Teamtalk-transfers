import { Transfer } from '@/types/transfer';
import { scoreInsideApi } from './scoreinsideApi';
import { teamTalkApi } from './teamtalkApi';
import { TransferIntegrationService } from '@/utils/transferIntegration';
import { ttStagingApi } from './ttStagingApi';

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
      const rumourTeams = await ttStagingApi.getRumourTeams();
      if (rumourTeams?.result?.rumour_teams?.data) {
        for (const team of rumourTeams.result.rumour_teams.data) {
          try {
            const rumours = await ttStagingApi.getRumoursByTeam(team.id);
            if (rumours?.result?.rumours?.data) {
              const teamTransfers = rumours.result.rumours.data.map(rumour => ({
                id: `staging-rumour-${rumour.id}`,
                playerName: rumour.player?.nm || 'Unknown Player',
                fromClub: rumour.team_from?.nm || 'Unknown Club',
                toClub: rumour.team_to?.nm || 'Unknown Club',
                fee: rumour.fee ? `£${rumour.fee}` : undefined,
                status: 'rumored' as const,
                date: rumour.created_at || new Date().toISOString(),
                source: 'Staging API (Rumours)',
                category: 'Rumours'
              }));
              allTransfers.push(...teamTransfers);
            }
          } catch (error) {
            console.warn(`Failed to fetch rumours for team ${team.id}:`, error);
          }
        }
      }

      // Get done deals from all teams
      const doneDealTeams = await ttStagingApi.getDoneDealTeams();
      if (doneDealTeams?.result?.donedeal_teams?.data) {
        for (const team of doneDealTeams.result.donedeal_teams.data) {
          try {
            const doneDeals = await ttStagingApi.getDoneDealsByTeam(team.id);
            if (doneDeals?.result?.donedeals?.data) {
              const teamTransfers = doneDeals.result.donedeals.data.map(deal => ({
                id: `staging-done-${deal.id}`,
                playerName: deal.player?.nm || 'Unknown Player',
                fromClub: deal.team_from?.nm || 'Unknown Club',
                toClub: deal.team_to?.nm || 'Unknown Club',
                fee: deal.fee ? `£${deal.fee}` : undefined,
                status: 'confirmed' as const,
                date: deal.created_at || new Date().toISOString(),
                source: 'Staging API (Done Deals)',
                category: 'Done Deal'
              }));
              allTransfers.push(...teamTransfers);
            }
          } catch (error) {
            console.warn(`Failed to fetch done deals for team ${team.id}:`, error);
          }
        }
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
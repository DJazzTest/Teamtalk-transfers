import { Transfer } from '@/types/transfer';
import { scoreInsideApi } from './scoreinsideApi';
import { teamTalkApi } from './teamtalkApi';
import { TransferIntegrationService } from '@/utils/transferIntegration';

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
      const [scoreInsideTransfers, teamTalkTransfers] = await Promise.allSettled([
        this.getScoreInsideData(),
        this.getTeamTalkData()
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
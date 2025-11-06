import { Transfer, PlayerNewsArticle } from '@/types/transfer';
import { playerNewsService } from './playerNewsService';

export class TransferEnhancerService {
  private static instance: TransferEnhancerService;
  private enhancedTransfers: Map<string, Transfer> = new Map();
  private enhancementPromises: Map<string, Promise<Transfer>> = new Map();

  static getInstance(): TransferEnhancerService {
    if (!TransferEnhancerService.instance) {
      TransferEnhancerService.instance = new TransferEnhancerService();
    }
    return TransferEnhancerService.instance;
  }

  /**
   * Enhance a single transfer with player-specific news
   */
  async enhanceTransfer(transfer: Transfer): Promise<Transfer> {
    const cacheKey = transfer.id;
    
    // Return cached enhanced transfer if available
    if (this.enhancedTransfers.has(cacheKey)) {
      return this.enhancedTransfers.get(cacheKey)!;
    }

    // Return existing promise if enhancement is in progress
    if (this.enhancementPromises.has(cacheKey)) {
      return this.enhancementPromises.get(cacheKey)!;
    }

    // Start enhancement process
    const enhancementPromise = this.performEnhancement(transfer);
    this.enhancementPromises.set(cacheKey, enhancementPromise);

    try {
      const enhancedTransfer = await enhancementPromise;
      this.enhancedTransfers.set(cacheKey, enhancedTransfer);
      this.enhancementPromises.delete(cacheKey);
      return enhancedTransfer;
    } catch (error) {
      this.enhancementPromises.delete(cacheKey);
      console.error(`Error enhancing transfer for ${transfer.playerName}:`, error);
      return transfer; // Return original transfer if enhancement fails
    }
  }

  /**
   * Enhance multiple transfers with player-specific news
   */
  async enhanceTransfers(transfers: Transfer[]): Promise<Transfer[]> {
    console.log(`🔄 Enhancing ${transfers.length} transfers with player news...`);
    
    // Process transfers in batches to avoid overwhelming the API
    const batchSize = 5;
    const enhancedTransfers: Transfer[] = [];
    
    for (let i = 0; i < transfers.length; i += batchSize) {
      const batch = transfers.slice(i, i + batchSize);
      const batchPromises = batch.map(transfer => this.enhanceTransfer(transfer));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            enhancedTransfers.push(result.value);
          } else {
            console.warn(`Failed to enhance transfer for ${batch[index].playerName}:`, result.reason);
            enhancedTransfers.push(batch[index]); // Add original transfer if enhancement fails
          }
        });
      } catch (error) {
        console.error(`Error processing batch ${i}-${i + batchSize}:`, error);
        // Add original transfers if batch fails
        enhancedTransfers.push(...batch);
      }
      
      // Small delay between batches to be respectful to APIs
      if (i + batchSize < transfers.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`✅ Enhanced ${enhancedTransfers.length} transfers`);
    return enhancedTransfers;
  }

  /**
   * Perform the actual enhancement process
   */
  private async performEnhancement(transfer: Transfer): Promise<Transfer> {
    try {
      console.log(`🔄 Starting enhancement for ${transfer.playerName}...`);
      
      // Get player-specific news
      const playerNews = await playerNewsService.getPlayerNews(transfer.playerName);
      console.log(`📰 Retrieved ${playerNews.length} total news articles for ${transfer.playerName}`);
      
      // Filter news to only include highly relevant articles
      const relevantNews = playerNews
        .filter(news => {
          console.log(`🔍 Checking article "${news.title}" - relevance: ${news.relevanceScore}`);
          return news.relevanceScore > 0.3; // Lower threshold for testing
        })
        .slice(0, 3); // Limit to top 3 most relevant articles
      
      console.log(`✅ Filtered to ${relevantNews.length} relevant articles for ${transfer.playerName}`);
      
      // Create enhanced transfer
      const enhancedTransfer: Transfer = {
        ...transfer,
        relatedNews: relevantNews
      };
      
      console.log(`📰 Enhanced transfer for ${transfer.playerName} with ${relevantNews.length} news articles`);
      return enhancedTransfer;
      
    } catch (error) {
      console.error(`Error enhancing transfer for ${transfer.playerName}:`, error);
      return transfer;
    }
  }

  /**
   * Get enhanced transfer by ID
   */
  getEnhancedTransfer(transferId: string): Transfer | undefined {
    return this.enhancedTransfers.get(transferId);
  }

  /**
   * Check if a transfer has been enhanced
   */
  isEnhanced(transferId: string): boolean {
    return this.enhancedTransfers.has(transferId);
  }

  /**
   * Clear cache for a specific transfer or all transfers
   */
  clearCache(transferId?: string): void {
    if (transferId) {
      this.enhancedTransfers.delete(transferId);
      this.enhancementPromises.delete(transferId);
    } else {
      this.enhancedTransfers.clear();
      this.enhancementPromises.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { enhancedCount: number; pendingCount: number } {
    return {
      enhancedCount: this.enhancedTransfers.size,
      pendingCount: this.enhancementPromises.size
    };
  }
}

export const transferEnhancer = TransferEnhancerService.getInstance();

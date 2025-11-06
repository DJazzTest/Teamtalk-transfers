import { useState, useEffect, useCallback } from 'react';
import { Transfer } from '@/types/transfer';
import { transferEnhancer } from '@/services/transferEnhancer';

interface UseEnhancedTransfersOptions {
  enableEnhancement?: boolean;
  autoEnhance?: boolean;
}

interface UseEnhancedTransfersReturn {
  enhancedTransfers: Transfer[];
  isLoading: boolean;
  error: string | null;
  enhanceTransfers: (transfers: Transfer[]) => Promise<void>;
  clearCache: () => void;
  cacheStats: { enhancedCount: number; pendingCount: number };
}

export const useEnhancedTransfers = (
  originalTransfers: Transfer[],
  options: UseEnhancedTransfersOptions = {}
): UseEnhancedTransfersReturn => {
  const {
    enableEnhancement = true,
    autoEnhance = false
  } = options;

  const [enhancedTransfers, setEnhancedTransfers] = useState<Transfer[]>(originalTransfers);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-enhance transfers when they change (if enabled)
  useEffect(() => {
    console.log(`🔄 useEnhancedTransfers effect triggered:`, {
      autoEnhance,
      enableEnhancement,
      transferCount: originalTransfers.length
    });
    
    if (autoEnhance && enableEnhancement && originalTransfers.length > 0) {
      console.log(`🚀 Auto-enhancing ${originalTransfers.length} transfers...`);
      enhanceTransfers(originalTransfers);
    } else if (!enableEnhancement) {
      console.log(`⏭️ Enhancement disabled, using original transfers`);
      setEnhancedTransfers(originalTransfers);
    }
  }, [originalTransfers, autoEnhance, enableEnhancement]);

  // Manual enhancement function
  const enhanceTransfers = useCallback(async (transfers: Transfer[]) => {
    console.log(`🔄 enhanceTransfers called with ${transfers.length} transfers, enableEnhancement: ${enableEnhancement}`);
    
    if (!enableEnhancement) {
      console.log(`⏭️ Enhancement disabled, using original transfers`);
      setEnhancedTransfers(transfers);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`🔄 Enhancing ${transfers.length} transfers with player news...`);
      const enhanced = await transferEnhancer.enhanceTransfers(transfers);
      console.log(`✅ Successfully enhanced ${enhanced.length} transfers`);
      
      // Log which transfers have news
      const transfersWithNews = enhanced.filter(t => t.relatedNews && t.relatedNews.length > 0);
      console.log(`📰 ${transfersWithNews.length} transfers have related news:`, 
        transfersWithNews.map(t => ({ player: t.playerName, newsCount: t.relatedNews?.length }))
      );
      
      setEnhancedTransfers(enhanced);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enhance transfers';
      console.error('Error enhancing transfers:', err);
      setError(errorMessage);
      // Fallback to original transfers if enhancement fails
      setEnhancedTransfers(transfers);
    } finally {
      setIsLoading(false);
    }
  }, [enableEnhancement]);

  // Clear cache function
  const clearCache = useCallback(() => {
    transferEnhancer.clearCache();
    setEnhancedTransfers(originalTransfers);
  }, [originalTransfers]);

  // Get cache statistics
  const cacheStats = transferEnhancer.getCacheStats();

  return {
    enhancedTransfers,
    isLoading,
    error,
    enhanceTransfers,
    clearCache,
    cacheStats
  };
};

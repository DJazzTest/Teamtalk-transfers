
import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, TrendingUp, RefreshCw, Newspaper } from 'lucide-react';
import { Transfer } from '@/types/transfer';
import { TransferSpendingChart } from './TransferSpendingChart';
import { RecentConfirmedTransfers } from './RecentConfirmedTransfers';
import { TransferCard } from './TransferCard';
import { deduplicateTransfersUI } from '../utils/transferDeduplication';
import { useEnhancedTransfers } from '@/hooks/useEnhancedTransfers';

interface RecentTransfersProps {
  transfers: Transfer[];
}

export const RecentTransfers: React.FC<RecentTransfersProps> = ({ transfers }) => {
  const [showAll, setShowAll] = useState(false);
  const [enableEnhancement, setEnableEnhancement] = useState(true);
  
  // Debug logging
  console.log('RecentTransfers received transfers:', transfers.length);
  console.log('Sample transfers:', transfers.slice(0, 3));
  
  // Use enhanced transfers hook
  const { 
    enhancedTransfers, 
    isLoading: isEnhancing, 
    enhanceTransfers,
    cacheStats 
  } = useEnhancedTransfers(transfers, { 
    enableEnhancement, 
    autoEnhance: true 
  });
  
  // Freshness window (days)
  const FRESH_DAYS = 14;
  const cutoff = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - FRESH_DAYS);
    return d.getTime();
  }, []);

  // Deduplicate and get all transfers (both rumored and confirmed) and filter to freshness window
  const allTransfers = useMemo(() => {
    return deduplicateTransfersUI(enhancedTransfers)
      .filter(t => {
        const ts = new Date(t.date).getTime();
        return !isNaN(ts) && ts >= cutoff;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [enhancedTransfers, cutoff]);

  // Separate rumored and confirmed transfers
  const rumoredTransfers = allTransfers.filter(transfer => transfer.status === 'rumored');
  const confirmedTransfers = allTransfers.filter(transfer => transfer.status === 'confirmed');
  
  // Show recent transfers (both types)
  const recentTransfers = showAll ? allTransfers : allTransfers.slice(0, 10);
  const shouldScroll = recentTransfers.length > 3;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string>('');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshMessage('Refreshing data...');
    const previousCount = allTransfers.length;
    
    window.dispatchEvent(new CustomEvent('manualRefresh'));
    
    // Show feedback after refresh
    setTimeout(() => {
      setIsRefreshing(false);
      const currentTransfers = transfers;
      
      if (currentTransfers.length > previousCount) {
        const newCount = currentTransfers.length - previousCount;
        setRefreshMessage(`✅ Found ${newCount} new transfers! Data updated.`);
      } else {
        setRefreshMessage('✅ Data refreshed - no new transfers found.');
      }
      
      // Clear message after 3 seconds
      setTimeout(() => setRefreshMessage(''), 3000);
    }, 1000);
  };

  // Auto-refresh on window focus
  useEffect(() => {
    const onFocus = () => {
      window.dispatchEvent(new CustomEvent('manualRefresh'));
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  return (
    <div className="space-y-6">
      {/* Transfer Spending Chart */}
      <TransferSpendingChart transfers={transfers} />
      
      {/* Latest Confirmed Transfers */}
      <RecentConfirmedTransfers transfers={transfers} />
      
      {/* Latest Transfers - show both confirmed and rumored */}
      {recentTransfers.length > 0 && (
        <Card className="border-gray-200/50 shadow-lg" style={{ backgroundColor: '#2F517A' }}>
          <div className="p-3 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-blue-400">Latest Transfers</h3>
                <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                  {confirmedTransfers.length > 0 ? 'CONFIRMED' : 'RUMOURS'}
                </Badge>
                {enableEnhancement && (
                  <Badge variant="outline" className="text-xs text-blue-400 border-blue-400">
                    <Newspaper className="w-3 h-3 mr-1" />
                    News Enhanced
                  </Badge>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setEnableEnhancement(!enableEnhancement)}
                    variant={enableEnhancement ? "default" : "outline"}
                    size="sm"
                    className={enableEnhancement 
                      ? "bg-blue-600 hover:bg-blue-700 text-white" 
                      : "border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
                    }
                  >
                    <Newspaper className="w-4 h-4 mr-1" />
                    {enableEnhancement ? 'News On' : 'News Off'}
                  </Button>
                  <Button 
                    onClick={handleRefresh}
                    disabled={isRefreshing || isEnhancing}
                    variant="outline" 
                    size="sm"
                    className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing || isEnhancing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                {refreshMessage && (
                  <div className="text-xs text-green-400 font-medium whitespace-nowrap">
                    {refreshMessage}
                  </div>
                )}
                {isEnhancing && (
                  <div className="text-xs text-blue-400 font-medium whitespace-nowrap">
                    Enhancing with news...
                  </div>
                )}
              </div>
            </div>

            <div className={`${shouldScroll ? 'max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100' : ''} space-y-4`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {recentTransfers.map((transfer, index) => (
                  <TransferCard 
                    key={transfer.id} 
                    transfer={transfer} 
                    isCompact={true}
                  />
                ))}
              </div>
              
              {allTransfers.length > 10 && (
                <div className="flex justify-center pt-2">
                  <Button
                    onClick={() => setShowAll(!showAll)}
                    variant="outline"
                    size="sm"
                    className="border-blue-400 text-blue-600 hover:bg-blue-50"
                  >
                    {showAll ? 'Show Less' : `Show More (${allTransfers.length - 10} more)`}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

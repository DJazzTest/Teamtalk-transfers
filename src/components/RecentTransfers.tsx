
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, TrendingUp, RefreshCw } from 'lucide-react';
import { Transfer } from '@/types/transfer';
import { TransferSpendingChart } from './TransferSpendingChart';
import { RecentConfirmedTransfers } from './RecentConfirmedTransfers';

interface RecentTransfersProps {
  transfers: Transfer[];
}

export const RecentTransfers: React.FC<RecentTransfersProps> = ({ transfers }) => {
  const [showAll, setShowAll] = useState(false);
  
  // Get all rumored transfers, not just 3
  const allRumors = transfers
    .filter(transfer => transfer.status === 'rumored')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const recentRumors = showAll ? allRumors : allRumors.slice(0, 10);
  const shouldScroll = recentRumors.length > 3;

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    const previousCount = allRumors.length;
    
    window.dispatchEvent(new CustomEvent('manualRefresh'));
    
    // Show feedback after refresh
    setTimeout(() => {
      setIsRefreshing(false);
      const currentRumors = transfers
        .filter(transfer => transfer.status === 'rumored');
      
      if (currentRumors.length > previousCount) {
        // Could add toast notification here if needed
        console.log(`Found ${currentRumors.length - previousCount} new rumours`);
      }
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Transfer Spending Chart */}
      <TransferSpendingChart transfers={transfers} />
      
      {/* Latest Confirmed Transfers */}
      <RecentConfirmedTransfers transfers={transfers} />
      
      {/* Latest Rumours - only show if there are rumors */}
      {recentRumors.length > 0 && (
        <Card className="border-gray-200/50 shadow-lg" style={{ backgroundColor: '#2F517A' }}>
          <div className="p-3 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-blue-400">Latest Rumours</h3>
                <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                  BREAKING
                </Badge>
              </div>
              <Button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline" 
                size="sm"
                className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            <div className={`${shouldScroll ? 'max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100' : ''} space-y-4`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {recentRumors.map((transfer, index) => (
                  <Card key={transfer.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-md transition-all duration-200 hover:border-blue-300">
                    <div className="p-3 sm:p-4">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                          <Badge className="bg-orange-600 hover:bg-orange-700 text-white text-xs">
                            #{index + 1} RUMOUR
                          </Badge>
                        </div>
                        
                        <div>
                          <h4 className="font-bold text-gray-800 text-base sm:text-lg leading-tight">{transfer.playerName}</h4>
                          <div className="text-xs sm:text-sm text-gray-600 mt-1">
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="truncate">{transfer.fromClub}</span>
                              <span>→</span>
                              <span className="font-semibold text-gray-800 truncate">{transfer.toClub}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-end gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-base sm:text-lg font-bold text-blue-600 truncate">{transfer.fee}</p>
                            <p className="text-xs text-gray-500">{new Date(transfer.date).toLocaleDateString()}</p>
                          </div>
                          <p className="text-xs text-gray-600 truncate max-w-20 sm:max-w-none">{transfer.source}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              {allRumors.length > 10 && (
                <div className="flex justify-center pt-2">
                  <Button
                    onClick={() => setShowAll(!showAll)}
                    variant="outline"
                    size="sm"
                    className="border-blue-400 text-blue-600 hover:bg-blue-50"
                  >
                    {showAll ? 'Show Less' : `Show More (${allRumors.length - 10} more)`}
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

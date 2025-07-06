import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, TrendingUp, RefreshCw } from 'lucide-react';
import { Transfer } from '@/types/transfer';

interface RecentConfirmedTransfersProps {
  transfers: Transfer[];
}

export const RecentConfirmedTransfers: React.FC<RecentConfirmedTransfersProps> = ({ transfers }) => {
  // Get all confirmed transfers, not just 3
  const recentConfirmed = transfers
    .filter(transfer => transfer.status === 'confirmed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const shouldScroll = recentConfirmed.length > 3;

  const handleRefresh = () => {
    window.dispatchEvent(new CustomEvent('manualRefresh'));
  };

  if (recentConfirmed.length === 0) {
    return null;
  }

  return (
    <Card className="border-gray-200/50 shadow-lg" style={{ backgroundColor: '#2F517A' }}>
      <div className="p-3 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-green-100 p-1.5 sm:p-2 rounded-lg">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-green-400">Latest Confirmed Transfers</h3>
            <Badge className="bg-green-600 hover:bg-green-700 text-white text-xs">
              CONFIRMED
            </Badge>
          </div>
          <Button 
            onClick={handleRefresh}
            variant="outline" 
            size="sm"
            className="border-green-400 text-green-400 hover:bg-green-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        <div className={`${shouldScroll ? 'max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-green-100' : ''} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4`}>
          {recentConfirmed.map((transfer, index) => (
            <Card key={transfer.id} className="bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="p-3 sm:p-4">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    <Badge className="bg-green-600 hover:bg-green-700 text-white text-xs">
                      #{index + 1} DONE
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
                      <p className="text-base sm:text-lg font-bold text-green-600 truncate">{transfer.fee}</p>
                      <p className="text-xs text-gray-500">{new Date(transfer.date).toLocaleDateString()}</p>
                    </div>
                    <p className="text-xs text-gray-600 truncate max-w-20 sm:max-w-none">{transfer.source}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Card>
  );
};
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { Transfer } from '@/types/transfer';
import { deduplicateTransfersUI } from '../utils/transferDeduplication';
import { getPlayerImage, handlePlayerImageError } from '@/utils/playerImageUtils';
import { ClubBadgeIcon } from '@/components/ClubBadgeIcon';

interface RecentConfirmedTransfersProps {
  transfers: Transfer[];
}

export const RecentConfirmedTransfers: React.FC<RecentConfirmedTransfersProps> = ({ transfers }) => {
  const [showAll, setShowAll] = useState(false);
  
  // Deduplicate and get all confirmed transfers
  const allConfirmed = deduplicateTransfersUI(
    transfers.filter(transfer => transfer.status === 'confirmed')
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const recentConfirmed = showAll ? allConfirmed : allConfirmed.slice(0, 10);
  const shouldScroll = recentConfirmed.length > 3;

  const handleRefresh = () => {
    window.dispatchEvent(new CustomEvent('manualRefresh'));
  };

  if (recentConfirmed.length === 0) {
    return null;
  }

  return (
    <>
    <Card className="border-gray-200/50 shadow-lg" style={{ backgroundColor: '#2F517A' }}>
      <div className="p-3 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-1.5 sm:p-2 rounded-lg">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-green-200 font-medium">Confirmed In</p>
            <h3 className="text-lg sm:text-xl font-bold text-green-400">Premier League arrivals</h3>
          </div>
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

        <div className={`${shouldScroll ? 'max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-green-100' : ''} space-y-4`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {recentConfirmed.map((transfer, index) => (
              <Card key={transfer.id} className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-md transition-all duration-200 hover:border-green-300">
                <div className="p-3 sm:p-4">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0">
                      <AvatarImage 
                        src={getPlayerImage(transfer.playerName, transfer.toClub)} 
                        alt={transfer.playerName}
                        onError={handlePlayerImageError}
                      />
                      <AvatarFallback className="bg-green-100 text-green-600 text-sm sm:text-base">
                        <img 
                          src="/player-placeholder.png" 
                          alt="Player placeholder" 
                          className="w-full h-full object-cover"
                        />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 text-base sm:text-lg leading-tight">{transfer.playerName}</h4>
                    </div>
                  </div>
                  
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <ClubBadgeIcon club={transfer.fromClub} size="sm" />
                        <span className="text-xs text-gray-500">→</span>
                        <ClubBadgeIcon club={transfer.toClub} size="sm" highlight />
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transfer.date).toLocaleDateString()}
                      </div>
                  </div>
                </div>
                </div>
              </Card>
            ))}
          </div>
          
          {allConfirmed.length > 10 && (
            <div className="flex justify-center pt-2">
              <Button
                onClick={() => setShowAll(!showAll)}
                variant="outline"
                size="sm"
                className="border-green-400 text-green-600 hover:bg-green-50"
              >
                {showAll ? 'Show Less' : `Show More (${allConfirmed.length - 10} more)`}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
    </>
  );
};
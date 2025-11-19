import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { TrendingUp, MessageCircle, RefreshCw } from 'lucide-react';
import { Transfer } from '@/types/transfer';
import { getPlayerImage } from '@/utils/playerImageUtils';

interface HomeRecentRumoursProps {
  transfers: Transfer[];
  onSelectClub?: (club: string, playerName?: string) => void;
  onRefresh?: () => void;
}

export const HomeRecentRumours: React.FC<HomeRecentRumoursProps> = ({ transfers, onSelectClub, onRefresh }) => {
  const [showAll, setShowAll] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const allRumours = transfers.filter(t => t.status === 'rumored').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const displayRumours = showAll ? allRumours : allRumours.slice(0, 3);

  if (allRumours.length === 0) return null;

  return (
    <Card className="mb-6 border-gray-200/50 shadow-lg" style={{ backgroundColor: '#eaf3fb' }}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-blue-800">Most Recent Rumours</h2>
            <Badge className="bg-blue-600 text-white text-xs">RUMOUR</Badge>
          </div>
          {onRefresh && (
            <Button
              onClick={async () => {
                setRefreshing(true);
                await onRefresh();
                setRefreshing(false);
              }}
              variant="ghost"
              size="sm"
              disabled={refreshing}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {displayRumours.map((transfer) => (
            <Card key={transfer.id} className="min-w-[240px] max-w-xs bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-md transition-all duration-200 hover:border-blue-300">
              <div className="p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage 
                      src={getPlayerImage(transfer.playerName, transfer.toClub)} 
                      alt={transfer.playerName}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                      {transfer.playerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <MessageCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span
                      className="font-semibold text-blue-600 hover:underline cursor-pointer text-base truncate"
                      onClick={() => onSelectClub && onSelectClub(transfer.toClub, transfer.playerName)}
                      title={`View ${transfer.toClub} squad`}
                    >
                      {transfer.playerName}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  <span>{transfer.fromClub}</span> → <span className="font-semibold text-gray-800">{transfer.toClub}</span>
                </div>
                <div className="flex justify-between items-end gap-2">
                  <span className="text-blue-600 font-bold">{transfer.fee}</span>
                  <span className="text-xs text-gray-500">{new Date(transfer.date).toLocaleDateString()}</span>
                </div>
                <span className="text-xs text-gray-400 truncate">{transfer.source}</span>
              </div>
            </Card>
          ))}
          {allRumours.length > 3 && (
            <div className="flex items-center">
              <Button
                onClick={() => setShowAll(!showAll)}
                variant="outline"
                size="sm"
                className="border-blue-400 text-blue-600 hover:bg-blue-50 ml-2"
              >
                {showAll ? 'Show Less' : `Show More (${allRumours.length - 3} more)`}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

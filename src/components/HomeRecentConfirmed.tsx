import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle } from 'lucide-react';
import { Transfer } from '@/types/transfer';
import { getPlayerImage } from '@/utils/playerImageUtils';
import { PlayerNameLink } from './PlayerNameLink';
import { findPlayerInSquads } from '@/utils/playerUtils';

interface HomeRecentConfirmedProps {
  transfers: Transfer[];
  onSelectClub?: (club: string) => void;
}

export const HomeRecentConfirmed: React.FC<HomeRecentConfirmedProps> = ({ transfers, onSelectClub }) => {
  const [showAll, setShowAll] = useState(false);
  
  // Filter confirmed transfers and remove duplicates
  const confirmedTransfers = transfers.filter(t => t.status === 'confirmed');
  const uniqueConfirmed = confirmedTransfers.filter((transfer, index, arr) => {
    const key = `${transfer.playerName.toLowerCase()}-${transfer.fromClub.toLowerCase()}-${transfer.toClub.toLowerCase()}`;
    return arr.findIndex(t => 
      `${t.playerName.toLowerCase()}-${t.fromClub.toLowerCase()}-${t.toClub.toLowerCase()}` === key
    ) === index;
  });
  
  const allConfirmed = uniqueConfirmed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const displayConfirmed = showAll ? allConfirmed : allConfirmed.slice(0, 5);

  if (allConfirmed.length === 0) return null;

  return (
    <Card className="mb-6 border-gray-200/50 shadow-lg" style={{ backgroundColor: '#eafbee' }}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-bold text-green-800">Confirmed Transfers In</h2>
          <Badge className="bg-green-700 text-white text-xs">CONFIRMED</Badge>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {displayConfirmed.map((transfer) => (
            <Card key={transfer.id} className="min-w-[240px] max-w-xs bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-md transition-all duration-200 hover:border-green-300">
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
                    <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                      {transfer.playerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  {(() => {
                    const playerInfo = findPlayerInSquads(transfer.playerName);
                    if (playerInfo.found) {
                      return (
                        <PlayerNameLink
                          playerName={transfer.playerName}
                          teamName={playerInfo.club}
                          playerData={playerInfo.player}
                          className="text-green-700 text-base font-semibold truncate flex-1"
                        />
                      );
                    }
                    return (
                      <span
                        className="font-semibold text-green-700 hover:underline cursor-pointer text-base truncate flex-1"
                        onClick={() => onSelectClub && onSelectClub(transfer.toClub)}
                        title={`View ${transfer.toClub} transfers`}
                      >
                        {transfer.playerName}
                      </span>
                    );
                  })()}
                </div>
                <div className="text-xs text-gray-600">
                  <span>{transfer.fromClub}</span> → <span className="font-semibold text-gray-800">{transfer.toClub}</span>
                </div>
                <div className="flex justify-between items-end gap-2">
                  <span className="text-green-700 font-bold">{transfer.fee}</span>
                  <span className="text-xs text-gray-500">{new Date(transfer.date).toLocaleDateString()}</span>
                </div>
                <span className="text-xs text-gray-400 truncate">{transfer.source}</span>
              </div>
            </Card>
          ))}
          {allConfirmed.length > 5 && (
            <div className="flex items-center">
              <Button
                onClick={() => setShowAll(!showAll)}
                variant="outline"
                size="sm"
                className="border-green-400 text-green-700 hover:bg-green-50 ml-2"
              >
                {showAll ? 'Show Less' : `Show More (${allConfirmed.length - 5} more)`}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

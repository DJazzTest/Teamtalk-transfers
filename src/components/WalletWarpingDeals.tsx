import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { TrendingUp } from 'lucide-react';
import { TransferCard } from './TransferCard';
import { StaleTransferAlert } from './StaleTransferAlert';
import { getPlayerImage } from '@/utils/playerImageUtils';
import { PlayerNameLink } from './PlayerNameLink';
import { findPlayerInSquads } from '@/utils/playerUtils';

// Helper to parse transfer fee to a number (assumes format like '£100m', '€80m', etc.)
function parseFee(fee: string): number {
  if (!fee) return 0;
  const match = fee.match(/([£€$])([\d,.]+)([mkb]?)/i);
  if (!match) return 0;
  let [, , amount, unit] = match;
  let num = parseFloat(amount.replace(/,/g, ''));
  unit = unit?.toLowerCase();
  if (unit === 'b') num *= 1_000;
  if (unit === 'm') num *= 1;
  if (unit === 'k') num /= 1_000;
  return num;
}

interface WalletWarpingDealsProps {
  transfers: any[];
  onSelectClub?: (club: string) => void;
  onRefresh?: () => void;
}

export const WalletWarpingDeals: React.FC<WalletWarpingDealsProps> = ({ transfers, onSelectClub, onRefresh }) => {
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  // Standalone hash function for strings
  function hashString(str: string): string {
    let hash = 0, i, chr;
    if (str.length === 0) return hash.toString();
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return hash.toString();
  }

  useEffect(() => {
    const lastSeen = localStorage.getItem('lastSeenTransferHash');
    const currentHash = hashString(transfers.map(t => t.id || t.headline || '').join('|'));
    if (lastSeen !== currentHash) {
      setShowWhatsNew(true);
      localStorage.setItem('lastSeenTransferHash', currentHash);
    }
  }, [transfers]);

  // Top 10 Most Expensive UK Premier League Transfers season (2025–26) - Updated with latest data
  const top10ExpensiveTransfers = [
    { playerName: 'Florian Wirtz', fromClub: 'Bayer Leverkusen', toClub: 'Liverpool', fee: '£106m', feeValue: 106 },
    { playerName: 'Hugo Ekitike', fromClub: 'Eintracht Frankfurt', toClub: 'Liverpool', fee: '£88m', feeValue: 88 },
    { playerName: 'Bryan Mbeumo', fromClub: 'Brentford', toClub: 'Manchester United', fee: '£74m', feeValue: 74 },
    { playerName: 'Matheus Cunha', fromClub: 'Wolverhampton Wanderers', toClub: 'Manchester United', fee: '£63m', feeValue: 63 },
    { playerName: 'Eberechi Eze', fromClub: 'Crystal Palace', toClub: 'Arsenal', fee: '£60m', feeValue: 60 },
    { playerName: 'Martin Zubimendi', fromClub: 'Real Sociedad', toClub: 'Arsenal', fee: '£59m', feeValue: 59 },
    { playerName: 'Viktor Gyökeres', fromClub: 'Sporting CP', toClub: 'Arsenal', fee: '£57.5m', feeValue: 57.5 },
    { playerName: 'Jamie Gittens', fromClub: 'Borussia Dortmund', toClub: 'Chelsea', fee: '£55m', feeValue: 55 },
    { playerName: 'Mohammed Kudus', fromClub: 'West Ham United', toClub: 'Tottenham Hotspur', fee: '£54m', feeValue: 54 },
    { playerName: 'Joao Pedro', fromClub: 'Brighton & Hove Albion', toClub: 'Chelsea', fee: '£54m', feeValue: 54 }
  ];

  // Create transfer objects with proper structure and deduplication
  const sorted = top10ExpensiveTransfers.map((transfer, index) => {
    // Try to find matching transfer in actual data for additional details
    const matchingTransfer = transfers.find(t => 
      t.playerName?.toLowerCase().includes(transfer.playerName.toLowerCase()) ||
      transfer.playerName.toLowerCase().includes(t.playerName?.toLowerCase() || '')
    );

    return {
      id: `top10-${index}`,
      playerName: transfer.playerName,
      fromClub: transfer.fromClub,
      toClub: transfer.toClub,
      fee: transfer.fee,
      feeValue: transfer.feeValue,
      status: 'confirmed',
      date: matchingTransfer?.date || '2025-08-26', // Updated to current date for current season
      source: matchingTransfer?.source || 'Official Transfer',
      ...matchingTransfer // Merge any additional data if found
    };
  });

  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? sorted : sorted.slice(0, 5);

  // Removed stale detection as it was causing confusion and refresh wasn't working properly

  if (sorted.length === 0) return null;

  return (
    <Card className="mb-6 border-gray-200/50 shadow-lg" style={{ backgroundColor: '#f0f4ff' }}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-bold text-purple-800">Top 10 Most Expensive</h2>
          <Badge className="bg-purple-700 text-white text-xs">PREMIUM</Badge>
        </div>
        

        
        <div className="flex gap-4 overflow-x-auto pb-2" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#9CA3AF #E5E7EB'
        }}>
          {visible.map((transfer) => (
            <Card key={transfer.id} className="min-w-[240px] max-w-xs bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 hover:shadow-md transition-all duration-200 hover:border-purple-300">
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
                    <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                      {transfer.playerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  {(() => {
                    const playerInfo = findPlayerInSquads(transfer.playerName);
                    const viewTeamButton = onSelectClub ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-purple-500 hover:text-purple-700 hover:bg-purple-100/70 px-2 py-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectClub(transfer.toClub);
                        }}
                      >
                        View team
                      </Button>
                    ) : null;

                    return (
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span
                          className="font-semibold text-purple-700 hover:underline cursor-pointer text-base truncate"
                          onClick={() => onSelectClub && onSelectClub(transfer.toClub)}
                          title={`View ${transfer.toClub} squad`}
                        >
                          {transfer.playerName}
                        </span>
                        {viewTeamButton}
                      </div>
                    );
                  })()}
                </div>
                <div className="text-xs text-gray-600">
                  <span>{transfer.fromClub}</span> → <span className="font-semibold text-gray-800">{transfer.toClub}</span>
                </div>
                <div className="flex justify-between items-end gap-2">
                  <span className="text-purple-700 font-bold text-lg">{transfer.fee}</span>
                  <span className="text-xs text-gray-500">{new Date(transfer.date).toLocaleDateString()}</span>
                </div>
                <span className="text-xs text-gray-400 truncate">{transfer.source}</span>
              </div>
            </Card>
          ))}
          {sorted.length > 5 && (
            <div className="flex items-center">
              <Button
                onClick={() => setShowAll(!showAll)}
                variant="outline"
                size="sm"
                className="border-purple-400 text-purple-700 hover:bg-purple-50 ml-2"
              >
                {showAll ? 'Show Less' : `Show More (${sorted.length - 5} more)`}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

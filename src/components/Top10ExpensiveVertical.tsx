import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getPlayerImage, handlePlayerImageError } from '@/utils/playerImageUtils';
import { findPlayerInSquads } from '@/utils/playerUtils';
import { ClubBadgeIcon } from '@/components/ClubBadgeIcon';

// Helper to parse transfer fee to a number
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

interface Top10ExpensiveVerticalProps {
  transfers: any[];
  onSelectClub?: (club: string, playerName?: string) => void;
}

export const Top10ExpensiveVertical: React.FC<Top10ExpensiveVerticalProps> = ({ transfers, onSelectClub }) => {
  const [showAll, setShowAll] = useState(false);

  // Top 10 Most Expensive UK Premier League Transfers season (2025–26)
  const top10ExpensiveTransfers = [
    { playerName: 'Florian Wirtz', fromClub: 'Bayer Leverkusen', toClub: 'Liverpool', fee: '£126m', feeValue: 126 },
    { playerName: 'Alexander Isak', fromClub: 'Newcastle United', toClub: 'Liverpool', fee: '£125m', feeValue: 125 },
    { playerName: 'Hugo Ekitike', fromClub: 'Eintracht Frankfurt', toClub: 'Liverpool', fee: '£95m', feeValue: 95 },
    { playerName: 'Benjamin Sesko', fromClub: 'RB Leipzig', toClub: 'Manchester United', fee: '£73.7m', feeValue: 73.7 },
    { playerName: 'Eberechi Eze', fromClub: 'Crystal Palace', toClub: 'Arsenal', fee: '£67.5m', feeValue: 67.5 },
    { playerName: 'Jeremie Frimpong', fromClub: 'Bayer Leverkusen', toClub: 'Liverpool', fee: '£55m', feeValue: 55 },
    { playerName: 'Bryan Mbeumo', fromClub: 'Brentford', toClub: 'Manchester United', fee: '£71m', feeValue: 71 },
    { playerName: 'Milos Kerkez', fromClub: 'Bournemouth', toClub: 'Liverpool', fee: '£40m', feeValue: 40 },
    { playerName: 'Matheus Cunha', fromClub: 'Wolverhampton Wanderers', toClub: 'Manchester United', fee: '£38m', feeValue: 38 },
    { playerName: 'Marc Guehi', fromClub: 'Crystal Palace', toClub: 'Manchester City', fee: '£35m', feeValue: 35 }
  ];

  // Create transfer objects with proper structure
  const sorted = top10ExpensiveTransfers.map((transfer, index) => {
    const matchingTransfer = transfers.find(t => 
      t.playerName?.toLowerCase().includes(transfer.playerName.toLowerCase()) ||
      transfer.playerName.toLowerCase().includes(t.playerName?.toLowerCase() || '')
    );

    // Preserve the hardcoded fee and feeValue, but use other data from matchingTransfer if available
    const { fee: _, feeValue: __, ...matchingTransferRest } = matchingTransfer || {};

    return {
      id: `top10-${index}`,
      playerName: transfer.playerName,
      fromClub: transfer.fromClub,
      toClub: transfer.toClub,
      fee: transfer.fee, // Always use the hardcoded fee
      feeValue: transfer.feeValue, // Always use the hardcoded feeValue
      status: 'confirmed',
      date: matchingTransfer?.date || '2025-08-26',
      source: matchingTransfer?.source || 'Official Transfer',
      ...matchingTransferRest // Spread other properties but not fee/feeValue
    };
  });

  const visible = showAll ? sorted : sorted.slice(0, 5);

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No expensive transfers available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visible.map((transfer, index) => {
        const playerInfo = findPlayerInSquads(transfer.playerName);
        return (
          <Card
            key={transfer.id}
            className="p-3 border-2 hover:shadow-lg transition-all duration-200 border-green-700 dark:border-green-200 bg-green-50/50 dark:bg-green-500/10"
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <Avatar className="w-12 h-12 flex-shrink-0">
                <AvatarImage 
                  src={getPlayerImage(transfer.playerName, transfer.toClub)} 
                  alt={transfer.playerName}
                  onError={handlePlayerImageError}
                />
                <AvatarFallback 
                  className="bg-green-100 text-green-600 text-sm sm:text-base"
                >
                  <img src="/player-placeholder.png" alt="Player placeholder" className="w-full h-full object-cover" />
                </AvatarFallback>
              </Avatar>
              
              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="font-semibold hover:underline cursor-pointer text-sm truncate text-green-700 dark:text-green-200"
                  onClick={() => onSelectClub && onSelectClub(transfer.toClub, transfer.playerName)}
                    title={`View ${transfer.toClub} squad`}
                  >
                    {transfer.playerName}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-200">
                  <ClubBadgeIcon club={transfer.fromClub} size="sm" />
                  <span>→</span>
                  <ClubBadgeIcon club={transfer.toClub} size="sm" highlight />
                </div>
              </div>
              
              {/* Fee */}
              <div className="flex-shrink-0 text-right">
                <div className="font-bold text-base text-green-700 dark:text-green-200">
                  {transfer.fee}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(transfer.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
      
      {/* Expand/Collapse Button */}
      {sorted.length > 5 && (
        <div className="flex justify-center pt-2">
          <Button
            onClick={() => setShowAll(!showAll)}
            variant="outline"
            size="sm"
            className="border-2 border-green-700 dark:border-green-200 text-green-700 dark:text-green-200 font-bold hover:bg-green-700/20 dark:hover:bg-green-200/20"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Show {sorted.length - 5} More
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};


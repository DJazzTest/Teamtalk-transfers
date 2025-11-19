import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Transfer } from '@/types/transfer';
import { getPlayerImage } from '@/utils/playerImageUtils';

interface ConfirmedTransfersTabProps {
  transfers: Transfer[];
  onSelectClub?: (club: string, playerName?: string) => void;
}

const PREMIER_LEAGUE_CLUBS = [
  'Arsenal',
  'Aston Villa',
  'AFC Bournemouth',
  'Brentford',
  'Brighton & Hove Albion',
  'Chelsea',
  'Crystal Palace',
  'Everton',
  'Fulham',
  'Ipswich Town',
  'Leeds United',
  'Leicester City',
  'Liverpool',
  'Manchester City',
  'Manchester United',
  'Newcastle United',
  'Nottingham Forest',
  'Southampton',
  'Tottenham Hotspur',
  'West Ham United',
  'Wolverhampton Wanderers',
];

// Create a normalized set for quick lookup
const PREMIER_LEAGUE_CLUBS_SET = new Set(
  PREMIER_LEAGUE_CLUBS.map((club) => club.toLowerCase().trim())
);

const isPremierLeagueClub = (clubName?: string): boolean => {
  if (!clubName) return false;
  return PREMIER_LEAGUE_CLUBS_SET.has(clubName.toLowerCase().trim());
};

const deduplicateTransfers = (transfers: Transfer[]) => {
  const seen = new Set<string>();
  return transfers.filter((transfer) => {
    const key = `${transfer.playerName?.toLowerCase() || ''}|${transfer.fromClub?.toLowerCase() || ''}|${
      transfer.toClub?.toLowerCase() || ''
    }|${transfer.date || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const ConfirmedTransfersTab: React.FC<ConfirmedTransfersTabProps> = ({
  transfers,
  onSelectClub,
}) => {
  const [selectedClub, setSelectedClub] = useState<string>('all');

  const confirmedTransfers = useMemo(() => {
    return deduplicateTransfers(
      transfers.filter((transfer) => {
        // Only show confirmed transfers
        if (transfer.status?.toLowerCase() !== 'confirmed') return false;
        
        // Only show transfers INTO Premier League clubs (toClub must be Premier League)
        // fromClub can be any club in the world
        const toIsPL = isPremierLeagueClub(transfer.toClub);
        
        return toIsPL;
      })
    ).sort((a, b) => {
      const aTime = new Date(a.date || '').getTime();
      const bTime = new Date(b.date || '').getTime();
      return (isNaN(bTime) ? 0 : bTime) - (isNaN(aTime) ? 0 : aTime);
    });
  }, [transfers]);

  const filteredTransfers = useMemo(() => {
    return confirmedTransfers.filter((transfer) => {
      if (selectedClub === 'all') return true;
      return transfer.toClub?.toLowerCase() === selectedClub.toLowerCase();
    });
  }, [confirmedTransfers, selectedClub]);

  const formatDate = (value?: string) => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge className="bg-green-600 text-white px-3 py-1 text-xs tracking-wide">
            CONFIRMED IN
          </Badge>
          <span className="text-sm text-green-800 dark:text-green-200 font-semibold">
            Premier League arrivals
          </span>
        </div>
        <Select value={selectedClub} onValueChange={setSelectedClub}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Filter by club" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Premier League clubs</SelectItem>
            {PREMIER_LEAGUE_CLUBS.map((club) => (
              <SelectItem key={club} value={club}>
                {club}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        className="space-y-3 overflow-y-auto pr-2 summer-scrollbar"
        style={{ maxHeight: '520px' }}
      >
        {filteredTransfers.length === 0 ? (
          <Card className="p-6 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 border-dashed">
            No confirmed transfers into Premier League clubs match your filters yet.
          </Card>
        ) : (
          filteredTransfers.map((transfer, index) => (
            <Card
              key={`${transfer.id}-${transfer.playerName}-${transfer.toClub}-${transfer.date}`}
              className="p-3 border-2 hover:shadow-lg transition-all duration-200 border-green-700 dark:border-green-200 bg-green-50/50 dark:bg-green-500/10 cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() => transfer.toClub && onSelectClub?.(transfer.toClub, transfer.playerName)}
              onKeyDown={(event) => {
                if ((event.key === 'Enter' || event.key === ' ') && transfer.toClub) {
                  event.preventDefault();
                  onSelectClub?.(transfer.toClub, transfer.playerName);
                }
              }}
            >
              <div className="flex items-center gap-3">
                {/* Rank Number */}
                <div 
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-green-700 dark:bg-green-200 text-white dark:text-green-900"
                >
                  {index + 1}
                </div>
                
                {/* Avatar */}
                <Avatar className="w-12 h-12 flex-shrink-0">
                  <AvatarImage 
                    src={getPlayerImage(transfer.playerName || '', transfer.toClub || '')} 
                    alt={transfer.playerName || 'Player'}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <AvatarFallback 
                    className="text-xs font-bold text-green-700 dark:text-green-200 border-2 border-green-700 dark:border-green-200 bg-green-100 dark:bg-green-500/20"
                  >
                    {(transfer.playerName || 'PL').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                
                {/* Player Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate text-green-700 dark:text-green-200 mb-1">
                    {transfer.playerName || 'Unnamed player'}
                  </p>
                  <div className="text-xs text-green-700 dark:text-green-200">
                    <span>{transfer.fromClub || 'Unknown'}</span> → <span className="font-semibold">{transfer.toClub || 'Unknown'}</span>
                  </div>
                </div>
                
                {/* Fee */}
                <div className="flex-shrink-0 text-right">
                  <div className="font-bold text-base text-green-700 dark:text-green-200">
                    {transfer.fee || 'Undisclosed'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(transfer.date)}</div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ConfirmedTransfersTab;


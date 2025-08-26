
import React from 'react';
import { Card } from '@/components/ui/card';
import { clubBadgeMap } from './ClubsView';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ArrowRight } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Transfer } from '@/types/transfer';
import { categorizeAllClubTransfers, getTransferCounts } from '@/utils/transferCategorizer';
import { useToast } from '@/hooks/use-toast';

interface TeamTransferStatsProps {
  allTransfers?: Transfer[];  // Changed to use allTransfers instead of clubTransfers
  starredClubs: string[];
  onStarClub: (clubName: string) => void;
  onViewClubTransfers: (clubName: string) => void;
  myClub: string | null;
  clubBadgeMap: Record<string, string>;
}

export const TeamTransferStats: React.FC<TeamTransferStatsProps> = ({ 
  allTransfers = [],
  starredClubs, 
  onStarClub, 
  onViewClubTransfers, 
  myClub,
  clubBadgeMap 
}) => {
  const clubNames = [
    'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton & Hove Albion',
    'Burnley', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham',
    'Leeds United', 'Liverpool', 'Manchester City', 'Manchester United',
    'Newcastle United', 'Nottingham Forest', 'Sunderland', 'Tottenham Hotspur',
    'West Ham United', 'Wolverhampton Wanderers'
  ];

  // Categorize all transfers by club
  const categorizedByClub = categorizeAllClubTransfers(allTransfers, clubNames);
  const { toast } = useToast();

  const handleStarClick = (clubName: string) => {
    onStarClub(clubName);
  };

  const handleViewTransfers = (clubName: string) => {
    onViewClubTransfers(clubName);
    toast({
      title: "Viewing Club Transfers",
      description: `Showing all transfers for ${clubName}`,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(categorizedByClub)
        .sort(([a], [b]) => {
          // Sort my club first, then starred clubs, then alphabetically
          if (a === myClub) return -1;
          if (b === myClub) return 1;
          if (starredClubs.includes(a) && !starredClubs.includes(b)) return -1;
          if (starredClubs.includes(b) && !starredClubs.includes(a)) return 1;
          return a.localeCompare(b);
        })
        .map(([club, categorized]) => {
          const counts = getTransferCounts(categorized);
          const isMyClub = club === myClub;
          const isStarred = starredClubs.includes(club);

          return (
            <Card 
              key={club} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                isMyClub 
                  ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-400/50' 
                  : isStarred
                  ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-400/30'
                  : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800/70'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg flex items-center gap-2 ${isMyClub ? 'text-blue-300' : 'text-white'}`}>
                      <img
                        src={clubBadgeMap[club] || `/badges/${club.toLowerCase().replace(/[^a-z]/g, '')}.png`}
                        alt={`${club} badge`}
                        className="w-7 h-7 rounded-full shadow bg-white object-contain border border-gray-200 mr-1"
                        onError={e => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      {club}
                    </h3>
                    {isMyClub && (
                      <Badge className="bg-blue-500/20 text-blue-300 text-xs mt-1">
                        MY CLUB
                      </Badge>
                    )}
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={e => {
                            e.currentTarget.classList.add('scale-110');
                            setTimeout(() => e.currentTarget.classList.remove('scale-110'), 150);
                            handleStarClick(club);
                          }}
                          className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/20 border border-yellow-400/30 hover:border-yellow-300/50 transition-transform duration-150"
                          aria-label={isStarred ? 'Remove from Favourites' : 'Add to Favourites'}
                        >
                          <Star 
                            className={`w-5 h-5 ${isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-yellow-400'}`}
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {isStarred ? 'Remove from Favourites' : 'Add to Favourites'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-300">Confirmed In:</span>
                    <Badge className="bg-green-500/20 text-green-400">
                      {counts.confirmedIn}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-red-300">Confirmed Out:</span>
                    <Badge className="bg-red-500/20 text-red-400">
                      {counts.confirmedOut}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-yellow-300">Rumors:</span>
                    <Badge className="bg-yellow-500/20 text-yellow-400">
                      {counts.rumors}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm font-semibold border-t border-slate-600 pt-2">
                    <span className="text-white">Total:</span>
                    <Badge className="bg-blue-500/20 text-blue-400">
                      {counts.total}
                    </Badge>
                  </div>
                </div>

                <Button
                  onClick={() => handleViewTransfers(club)}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white border border-slate-600"
                  size="sm"
                >
                  View Transfers
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          );
        })}
    </div>
  );
};


import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ArrowRight } from 'lucide-react';
import { Transfer } from '@/types/transfer';
import { useToast } from '@/hooks/use-toast';

interface TeamTransferStatsProps {
  clubTransfers: { [key: string]: Transfer[] };
  starredClubs: string[];
  onStarClub: (clubName: string) => void;
  onViewClubTransfers: (clubName: string) => void;
  myClub: string | null;
}

export const TeamTransferStats: React.FC<TeamTransferStatsProps> = ({
  clubTransfers,
  starredClubs,
  onStarClub,
  onViewClubTransfers,
  myClub
}) => {
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
      {Object.entries(clubTransfers)
        .sort(([a], [b]) => {
          // Sort my club first, then starred clubs, then alphabetically
          if (a === myClub) return -1;
          if (b === myClub) return 1;
          if (starredClubs.includes(a) && !starredClubs.includes(b)) return -1;
          if (starredClubs.includes(b) && !starredClubs.includes(a)) return 1;
          return a.localeCompare(b);
        })
        .map(([club, transfers]) => {
          const confirmedCount = transfers.filter(t => t.status === 'confirmed').length;
          const rumoredCount = transfers.filter(t => t.status === 'rumored').length;
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
                    <h3 className={`font-bold text-lg ${isMyClub ? 'text-blue-300' : 'text-white'}`}>
                      {club}
                    </h3>
                    {isMyClub && (
                      <Badge className="bg-blue-500/20 text-blue-300 text-xs mt-1">
                        MY CLUB
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStarClick(club)}
                    className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/20 border border-yellow-400/30 hover:border-yellow-300/50"
                  >
                    <Star 
                      className={`w-5 h-5 ${isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-yellow-400'}`}
                    />
                  </Button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Confirmed:</span>
                    <Badge className="bg-green-500/20 text-green-400">
                      {confirmedCount}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Rumored:</span>
                    <Badge className="bg-yellow-500/20 text-yellow-400">
                      {rumoredCount}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm font-semibold border-t border-slate-600 pt-2">
                    <span className="text-white">Total:</span>
                    <Badge className="bg-blue-500/20 text-blue-400">
                      {transfers.length}
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

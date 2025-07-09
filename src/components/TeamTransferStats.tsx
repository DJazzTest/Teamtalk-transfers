
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, TrendingUp, TrendingDown, Users, Eye } from 'lucide-react';
import { Transfer } from '@/types/transfer';

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
  // Sort clubs by total transfers (descending)
  const sortedClubs = Object.entries(clubTransfers)
    .sort(([, a], [, b]) => b.length - a.length);

  return (
    <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-white">Team Transfer Activity</h2>
          <Badge className="bg-blue-500 text-white">
            {sortedClubs.length} Teams
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedClubs.map(([club, transfers]) => {
            const isStarred = starredClubs.includes(club);
            const isMyClub = myClub === club;
            const confirmedCount = transfers.filter(t => t.status === 'confirmed').length;
            const rumoredCount = transfers.filter(t => t.status === 'rumored').length;
            const transfersIn = transfers.filter(t => t.toClub === club).length;
            const transfersOut = transfers.filter(t => t.fromClub === club).length;

            return (
              <Card 
                key={club} 
                className={`
                  ${isMyClub ? 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-yellow-400/50' : 'bg-slate-700/50'} 
                  border-slate-600 hover:bg-slate-700/70 transition-all duration-200 relative
                `}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-lg leading-tight ${isMyClub ? 'text-yellow-200' : 'text-white'}`}>
                        {club}
                      </h3>
                      {isMyClub && (
                        <Badge className="bg-yellow-500/20 text-yellow-300 text-xs mt-1">
                          My Club
                        </Badge>
                      )}
                    </div>
                    
                    {/* Star Button - Made much more visible */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onStarClub(club)}
                      className={`
                        ml-2 p-1 h-8 w-8 rounded-full border-2 transition-all duration-200
                        ${isStarred 
                          ? 'bg-yellow-500 border-yellow-400 hover:bg-yellow-400 shadow-lg shadow-yellow-500/25' 
                          : 'bg-slate-600 border-slate-500 hover:bg-yellow-500/20 hover:border-yellow-400'
                        }
                      `}
                    >
                      <Star 
                        className={`w-4 h-4 ${
                          isStarred 
                            ? 'fill-white text-white' 
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                      />
                    </Button>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-300 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        In:
                      </span>
                      <Badge className="bg-green-500/20 text-green-400">
                        {transfersIn}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-300 flex items-center gap-1">
                        <TrendingDown className="w-3 h-3 text-red-400" />
                        Out:
                      </span>
                      <Badge className="bg-red-500/20 text-red-400">
                        {transfersOut}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center text-sm border-t border-slate-600 pt-2">
                      <span className="text-gray-300">Confirmed:</span>
                      <Badge className="bg-blue-500/20 text-blue-400">
                        {confirmedCount}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">Rumors:</span>
                      <Badge className="bg-purple-500/20 text-purple-400">
                        {rumoredCount}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center text-sm font-semibold border-t border-slate-600 pt-2">
                      <span className="text-white">Total Activity:</span>
                      <Badge className="bg-slate-500/20 text-white">
                        {transfers.length}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    onClick={() => onViewClubTransfers(club)}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

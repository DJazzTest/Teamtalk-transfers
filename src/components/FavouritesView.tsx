import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Heart, TrendingUp, TrendingDown } from 'lucide-react';
import { Transfer } from '@/types/transfer';
import { TransferCard } from './TransferCard';
import { clubBadgeMap } from './ClubsView';
import { groupTransfersByNormalizedClub } from '@/utils/clubNormalizer';

interface FavouritesViewProps {
  transfers: Transfer[];
}

export const FavouritesView: React.FC<FavouritesViewProps> = ({ transfers }) => {
  const [starredClubs, setStarredClubs] = useState<string[]>(() => {
    const saved = localStorage.getItem('starredClubs');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedClub, setSelectedClub] = useState<string | null>(null);

  useEffect(() => {
    const handleStarredClubsUpdate = (event: CustomEvent) => {
      setStarredClubs(event.detail);
    };

    window.addEventListener('starredClubsUpdate', handleStarredClubsUpdate as EventListener);
    return () => window.removeEventListener('starredClubsUpdate', handleStarredClubsUpdate as EventListener);
  }, []);

  const clubTransfers = groupTransfersByNormalizedClub(transfers);
  const favouriteClubTransfers = Object.entries(clubTransfers).filter(([club]) => 
    starredClubs.includes(club)
  );

  const handleRemoveFavourite = (clubName: string) => {
    const newStarredClubs = starredClubs.filter(club => club !== clubName);
    setStarredClubs(newStarredClubs);
    localStorage.setItem('starredClubs', JSON.stringify(newStarredClubs));
    window.dispatchEvent(new CustomEvent('starredClubsUpdate', { detail: newStarredClubs }));
  };

  const handleViewClub = (clubName: string) => {
    setSelectedClub(clubName);
  };

  if (selectedClub && clubTransfers[selectedClub]) {
    const clubTransferList = clubTransfers[selectedClub];
    const transfersIn = clubTransferList.filter(t => t.toClub === selectedClub);
    const transfersOut = clubTransferList.filter(t => t.fromClub === selectedClub);
    
    return (
      <div className="space-y-6">
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedClub(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ← Back to Favourites
                </Button>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <img
                    src={`/badges/${clubBadgeMap[selectedClub!] || selectedClub?.toLowerCase().replace(/[^a-z]/g, '') + '.png'}`}
                    alt={`${selectedClub} badge`}
                    className="w-7 h-7 rounded-full shadow bg-white object-contain border border-gray-200 mr-1"
                    onError={e => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {selectedClub}
                </h3>
              </div>
              <Badge className="bg-blue-500/20 text-blue-400">
                {clubTransferList.length} Total Activities
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-400/30">
                <div className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-400">{transfersIn.length}</div>
                  <div className="text-sm text-gray-300">Transfers In</div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-400/30">
                <div className="p-4 text-center">
                  <TrendingDown className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-400">{transfersOut.length}</div>
                  <div className="text-sm text-gray-300">Transfers Out</div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-400/30">
                <div className="p-4 text-center">
                  <Heart className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-400">
                    {clubTransferList.filter(t => t.status === 'rumored').length}
                  </div>
                  <div className="text-sm text-gray-300">Rumors & Gossip</div>
                </div>
              </Card>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
          <div className="p-6">
            <h4 className="text-lg font-bold text-white mb-4">All Transfer Activity</h4>
            <div className="space-y-3">
              {clubTransferList.map((transfer) => (
                <div key={transfer.id} className="bg-slate-700/50 rounded-lg p-4">
                  <TransferCard transfer={transfer} />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (favouriteClubTransfers.length === 0) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
        <div className="p-8 text-center">
          <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Favourite Clubs</h3>
          <p className="text-gray-400 mb-4">
            Star your favourite clubs in the Teams tab to see all their transfer activity here.
          </p>
          <p className="text-sm text-gray-500">
            Click the star button next to any club name to add them to your favourites.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
        <div className="p-6">
          {/* Responsive horizontally scrollable nav bar */}
          <div className="flex overflow-x-auto no-scrollbar gap-3 items-center mb-4 px-1" style={{ WebkitOverflowScrolling: 'touch' }}>
            <Star className="flex-shrink-0 w-6 h-6 text-yellow-400 fill-yellow-400" />
            <h2 className="flex-shrink-0 text-2xl font-bold text-white whitespace-nowrap">My Favourite Clubs</h2>
            <Badge className="flex-shrink-0 bg-yellow-500/20 text-yellow-400 whitespace-nowrap">
              {favouriteClubTransfers.length} clubs
            </Badge>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {favouriteClubTransfers.map(([club, clubTransferList]) => {
          const confirmedCount = clubTransferList.filter(t => t.status === 'confirmed').length;
          const rumoredCount = clubTransferList.filter(t => t.status === 'rumored').length;

          return (
            <Card 
              key={club} 
              className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-400/30 hover:bg-yellow-500/20 transition-all duration-200"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={`/badges/${clubBadgeMap[club] || club.toLowerCase().replace(/[^a-z]/g, '') + '.png'}`}
                      alt={`${club} badge`}
                      className="w-7 h-7 rounded-full shadow bg-white object-contain border border-gray-200 mr-1"
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <h3 className="font-bold text-lg text-yellow-300">{club}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFavourite(club)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/20"
                  >
                    ×
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
                  <div className="flex justify-between text-sm font-semibold border-t border-yellow-400/30 pt-2">
                    <span className="text-white">Total:</span>
                    <Badge className="bg-blue-500/20 text-blue-400">
                      {clubTransferList.length}
                    </Badge>
                  </div>
                </div>

                <Button
                  onClick={() => handleViewClub(club)}
                  className="w-full bg-yellow-600 hover:bg-yellow-500 text-white"
                  size="sm"
                >
                  View All Activity
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
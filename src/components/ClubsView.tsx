
import React from 'react';
import { Card } from '@/components/ui/card';
import { categorizeTransfers, getClubTransfers, CategorizedTransfers } from '@/utils/transferCategorizer';

// Maps club names to badge filenames - REAL official badges only
export const clubBadgeMap: Record<string, string> = {
  'Arsenal': '/badges/arsenal-real.png',
  'Aston Villa': '/badges/astonvilla.png',
  'Bournemouth': '/badges/bournemouth-real.png',
  'Brentford': '/badges/brentford.png',
  'Brighton & Hove Albion': '/badges/brightonhovealbion.png',
  'Burnley': '/badges/burnley.png',
  'Chelsea': '/badges/chelsea-real.png',
  'Crystal Palace': '/badges/crystalpalace.png',
  'Everton': '/badges/everton.png',
  'Fulham': '/badges/fulham.png',
  'Leeds United': '/lovable-uploads/f1403919-509d-469c-8455-d3b11b3d5cb6.png',
  'Liverpool': '/badges/liverpool-real.png',
  'Manchester City': '/badges/manchestercity-real.png',
  'Manchester United': '/badges/manchesterunited-real.png',
  'Newcastle United': '/badges/newcastleunited.png',
  'Nottingham Forest': '/badges/nottinghamforest.png',
  'Sunderland': '/badges/sunderland.png',
  'Tottenham Hotspur': '/badges/tottenhamhotspur.png',
  'West Ham United': '/badges/westhamunited.png',
  'Wolverhampton Wanderers': '/badges/wolverhamptonwanderers.png'
};

import { Button } from '@/components/ui/button';
import { Star, ArrowLeft, Info } from 'lucide-react';
import { Transfer } from '@/types/transfer';
import { TransferCard } from './TransferCard';
import { TeamTransferStats } from './TeamTransferStats';
import { useToast } from '@/hooks/use-toast';
import { groupTransfersByNormalizedClub } from '@/utils/clubNormalizer';

interface ClubsViewProps {
  clubTransfers: { [key: string]: Transfer[] };
  allTransfers?: Transfer[];
}

export const ClubsView: React.FC<ClubsViewProps> = ({ clubTransfers, allTransfers = [] }) => {
  const { toast } = useToast();
  const [starredClubs, setStarredClubs] = React.useState<string[]>(() => {
    const saved = localStorage.getItem('starredClubs');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedClub, setSelectedClub] = React.useState<string | null>(null);
  const [myClub, setMyClub] = React.useState<string | null>(() => {
    return localStorage.getItem('myFavoriteClub');
  });

  // Use normalized club transfers
  const normalizedClubTransfers = React.useMemo(() => {
    return groupTransfersByNormalizedClub(allTransfers);
  }, [allTransfers]);

  React.useEffect(() => {
    const handleMyClubUpdate = () => {
      const savedClub = localStorage.getItem('myFavoriteClub');
      setMyClub(savedClub);
    };

    window.addEventListener('storage', handleMyClubUpdate);
    return () => window.removeEventListener('storage', handleMyClubUpdate);
  }, []);

  const handleStarClub = (clubName: string) => {
    const newStarredClubs = starredClubs.includes(clubName)
      ? starredClubs.filter(club => club !== clubName)
      : [...starredClubs, clubName];
    
    setStarredClubs(newStarredClubs);
    localStorage.setItem('starredClubs', JSON.stringify(newStarredClubs));
    
    // Dispatch event to update other components
    window.dispatchEvent(new CustomEvent('starredClubsUpdate', { detail: newStarredClubs }));
    
    toast({
      title: starredClubs.includes(clubName) ? "Club Unstarred" : "Club Starred",
      description: `${clubName} has been ${starredClubs.includes(clubName) ? 'removed from' : 'added to'} your starred clubs.`,
    });
  };

  const handleViewClubTransfers = (clubName: string) => {
    setSelectedClub(clubName);
  };

  const handleBackToOverview = () => {
    setSelectedClub(null);
  };

  // If a specific club is selected, show categorized transfers
  if (selectedClub && allTransfers) {
    const clubTransferList = getClubTransfers(allTransfers, selectedClub);
    const categorizedTransfers = categorizeTransfers(clubTransferList, selectedClub);
    
    return (
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6 border-b border-slate-600 pb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToOverview}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <img
                  src={clubBadgeMap[selectedClub] || `/badges/${selectedClub?.toLowerCase().replace(/[^a-z]/g, '')}.png`}
                  alt={`${selectedClub} badge`}
                  className="w-7 h-7 rounded-full shadow bg-white object-contain border border-gray-200 mr-1"
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {selectedClub}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStarClub(selectedClub)}
              className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/20 border border-yellow-400/30 hover:border-yellow-300/50"
            >
              <Star 
                className={`w-5 h-5 ${starredClubs.includes(selectedClub) ? 'fill-yellow-400 text-yellow-400' : 'text-yellow-400'}`}
              />
            </Button>
          </div>

          {/* Transfer Statistics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="bg-green-900/30 border-green-700">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{categorizedTransfers.confirmedIn.length}</div>
                <div className="text-sm text-green-300">Confirmed In</div>
              </div>
            </Card>
            <Card className="bg-red-900/30 border-red-700">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{categorizedTransfers.confirmedOut.length}</div>
                <div className="text-sm text-red-300">Confirmed Out</div>
              </div>
            </Card>
            <Card className="bg-yellow-900/30 border-yellow-700">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{categorizedTransfers.rumors.length}</div>
                <div className="text-sm text-yellow-300">Rumors</div>
              </div>
            </Card>
          </div>

          {/* Show deduplication info if duplicates were removed */}
          {clubTransferList.length !== (categorizedTransfers.confirmedIn.length + categorizedTransfers.confirmedOut.length + categorizedTransfers.rumors.length) && (
            <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-300">
                <Info className="h-4 w-4" />
                <span>
                  Removed {clubTransferList.length - (categorizedTransfers.confirmedIn.length + categorizedTransfers.confirmedOut.length + categorizedTransfers.rumors.length)} duplicate player{clubTransferList.length - (categorizedTransfers.confirmedIn.length + categorizedTransfers.confirmedOut.length + categorizedTransfers.rumors.length) > 1 ? 's' : ''} 
                  ({clubTransferList.length} → {categorizedTransfers.confirmedIn.length + categorizedTransfers.confirmedOut.length + categorizedTransfers.rumors.length} unique transfers)
                </span>
              </div>
            </div>
          )}

          {/* Categorized Transfer Sections */}
          <div className="space-y-6">
            {/* Confirmed In */}
            {categorizedTransfers.confirmedIn.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Confirmed In ({categorizedTransfers.confirmedIn.length})
                </h4>
                <div className="space-y-3">
                  {categorizedTransfers.confirmedIn.map((transfer) => (
                    <div key={transfer.id} className="bg-green-900/20 rounded-lg p-4 border border-green-700/50 hover:bg-green-900/30 transition-all duration-200">
                      <TransferCard transfer={transfer} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirmed Out */}
            {categorizedTransfers.confirmedOut.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  Confirmed Out ({categorizedTransfers.confirmedOut.length})
                </h4>
                <div className="space-y-3">
                  {categorizedTransfers.confirmedOut.map((transfer) => (
                    <div key={transfer.id} className="bg-red-900/20 rounded-lg p-4 border border-red-700/50 hover:bg-red-900/30 transition-all duration-200">
                      <TransferCard transfer={transfer} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rumors */}
            {categorizedTransfers.rumors.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  Rumors & Speculation ({categorizedTransfers.rumors.length})
                </h4>
                <div className="space-y-3">
                  {categorizedTransfers.rumors.map((transfer) => (
                    <div key={transfer.id} className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-700/50 hover:bg-yellow-900/30 transition-all duration-200">
                      <TransferCard transfer={transfer} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No transfers found */}
            {categorizedTransfers.confirmedIn.length === 0 && 
             categorizedTransfers.confirmedOut.length === 0 && 
             categorizedTransfers.rumors.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p>No transfers found for {selectedClub}</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Show team overview with stats
  return (
    <TeamTransferStats
      allTransfers={allTransfers}
      starredClubs={starredClubs}
      onStarClub={handleStarClub}
      onViewClubTransfers={handleViewClubTransfers}
      myClub={myClub}
      clubBadgeMap={clubBadgeMap}
    />
  );
};

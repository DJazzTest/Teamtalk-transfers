
import React from 'react';
import { Card } from '@/components/ui/card';
import { clubBadgeMap } from '@/data/clubBadgeMap';

import { Button } from '@/components/ui/button';
import { Star, ArrowLeft, Home } from 'lucide-react';
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

  const handleGoHome = () => {
    setSelectedClub(null);
    if (typeof window === 'undefined') return;
    if (window.location.pathname !== '/') {
      window.location.href = '/';
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If a specific club is selected, show detailed transfers
  if (selectedClub && normalizedClubTransfers[selectedClub]) {
    const clubTransferList = normalizedClubTransfers[selectedClub];
    
    return (
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4 border-b border-slate-600 pb-2">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToOverview}
                  className="text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGoHome}
                  className="text-blue-300 hover:text-white"
                >
                  <Home className="w-4 h-4 mr-1" />
                  Home
                </Button>
              </div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <img
                  src={`/badges/${selectedClub?.toLowerCase().replace(/[^a-z]/g, '')}.png`}
                  alt={`${selectedClub} badge`}
                  className="w-7 h-7 rounded-full shadow bg-white object-contain border border-gray-200 mr-1"
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {selectedClub} ({clubTransferList.length} transfers)
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
          <div className="space-y-3">
            {clubTransferList.map((transfer) => (
              <div key={transfer.id} className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700/70 transition-all duration-200">
                <TransferCard transfer={transfer} />
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Show team overview with stats
  return (
    <TeamTransferStats
      clubTransfers={normalizedClubTransfers}
      starredClubs={starredClubs}
      onStarClub={handleStarClub}
      onViewClubTransfers={handleViewClubTransfers}
      myClub={myClub}
      clubBadgeMap={clubBadgeMap}
    />
  );
};

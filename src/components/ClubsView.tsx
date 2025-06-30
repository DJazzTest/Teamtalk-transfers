
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { Transfer } from '@/types/transfer';
import { TransferCard } from './TransferCard';
import { useToast } from '@/hooks/use-toast';

interface ClubsViewProps {
  clubTransfers: { [key: string]: Transfer[] };
}

export const ClubsView: React.FC<ClubsViewProps> = ({ clubTransfers }) => {
  const { toast } = useToast();
  const [starredClubs, setStarredClubs] = React.useState<string[]>(() => {
    const saved = localStorage.getItem('starredClubs');
    return saved ? JSON.parse(saved) : [];
  });

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

  return (
    <>
      {Object.entries(clubTransfers).map(([club, clubTransferList]) => (
        <Card key={club} className="bg-slate-800/50 backdrop-blur-md border-slate-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4 border-b border-slate-600 pb-2">
              <h3 className="text-xl font-bold text-white">
                {club} ({clubTransferList.length} transfers)
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStarClub(club)}
                className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/20 border border-yellow-400/30 hover:border-yellow-300/50"
              >
                <Star 
                  className={`w-5 h-5 ${starredClubs.includes(club) ? 'fill-yellow-400 text-yellow-400' : 'text-yellow-400'}`}
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
      ))}
    </>
  );
};

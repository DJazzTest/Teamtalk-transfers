
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Star } from 'lucide-react';
import { Transfer } from '@/types/transfer';
import { getStatusColor, getStatusIcon } from '@/utils/transferUtils';
import React from 'react';

interface TransferCardProps {
  transfer: Transfer;
  isCompact?: boolean;
}

const getPlayerInitials = (playerName: string) => {
  return playerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const TransferCard: React.FC<TransferCardProps> = ({ transfer, isCompact = false }) => {
  // Starred club state (localStorage sync)
  const [starredClubs, setStarredClubs] = React.useState<string[]>(() => {
    const saved = localStorage.getItem('starredClubs');
    return saved ? JSON.parse(saved) : [];
  });
  // Sync with localStorage updates from other tabs/components
  React.useEffect(() => {
    const handler = (event: any) => {
      if (event.detail) setStarredClubs(event.detail);
      else {
        const saved = localStorage.getItem('starredClubs');
        setStarredClubs(saved ? JSON.parse(saved) : []);
      }
    };
    window.addEventListener('starredClubsUpdate', handler);
    return () => window.removeEventListener('starredClubsUpdate', handler);
  }, []);
  // Star/unstar logic
  const handleStarClub = (clubName: string) => {
    const newStarred = starredClubs.includes(clubName)
      ? starredClubs.filter(c => c !== clubName)
      : [...starredClubs, clubName];
    setStarredClubs(newStarred);
    localStorage.setItem('starredClubs', JSON.stringify(newStarred));
    window.dispatchEvent(new CustomEvent('starredClubsUpdate', { detail: newStarred }));
  };
  const isStarred = starredClubs.includes(transfer.toClub);

  if (isCompact) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700 hover:bg-slate-800/70 transition-all duration-200">
        <div className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                {transfer.playerImage && <AvatarImage src={transfer.playerImage} alt={transfer.playerName} />}
                <AvatarFallback className="bg-slate-600 text-white text-xs">
                  {getPlayerInitials(transfer.playerName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2 flex-1">
                {getStatusIcon(transfer.status)}
                <h4 className="font-semibold text-white text-sm">{transfer.playerName}</h4>
              </div>
            </div>
            
            <div className="text-xs text-gray-300">
              <div className="flex items-center gap-1 mb-1">
              <span>{transfer.fromClub}</span>
              <span>→</span>
              <span className="font-semibold text-white flex items-center gap-1">
                {transfer.toClub}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={e => {
                          e.currentTarget.classList.add('scale-110');
                          setTimeout(() => e.currentTarget.classList.remove('scale-110'), 150);
                          handleStarClub(transfer.toClub);
                        }}
                        className={`ml-1 p-1 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/20 border border-yellow-400/30 hover:border-yellow-300/50 transition-transform duration-150 ${isStarred ? 'bg-yellow-400/20' : ''}`}
                        aria-label={isStarred ? 'Remove from Favourites' : 'Add to Favourites'}
                      >
                        <Star className={`w-4 h-4 ${isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-yellow-400'}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      {isStarred ? 'Remove from Favourites' : 'Add to Favourites'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
            </div>
            </div>
            
            {transfer.rejectionReason && (
              <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
                <p className="text-red-400 text-xs">{transfer.rejectionReason}</p>
              </div>
            )}
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm font-bold text-green-400">{transfer.fee}</p>
                <p className="text-xs text-gray-300">{new Date(transfer.date).toLocaleDateString()}</p>
              </div>
              <p className="text-xs text-gray-300">{transfer.source}</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700 hover:bg-slate-800/70 transition-all duration-200">
      <div className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex-1 flex items-center gap-4">
            <Avatar className="w-12 h-12">
              {transfer.playerImage && <AvatarImage src={transfer.playerImage} alt={transfer.playerName} />}
              <AvatarFallback className="bg-slate-600 text-white">
                {getPlayerInitials(transfer.playerName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {getStatusIcon(transfer.status)}
                <h3 className="text-lg font-semibold text-white">{transfer.playerName}</h3>
                <Badge className={`${getStatusColor(transfer.status)} text-white text-xs`}>
                  {transfer.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span>{transfer.fromClub}</span>
                <span>→</span>
                <span className="font-semibold text-white flex items-center gap-1">
                  {transfer.toClub}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={e => {
                            e.currentTarget.classList.add('scale-110');
                            setTimeout(() => e.currentTarget.classList.remove('scale-110'), 150);
                            handleStarClub(transfer.toClub);
                          }}
                          className={`ml-1 p-1 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/20 border border-yellow-400/30 hover:border-yellow-300/50 transition-transform duration-150 ${isStarred ? 'bg-yellow-400/20' : ''}`}
                          aria-label={isStarred ? 'Remove from Favourites' : 'Add to Favourites'}
                        >
                          <Star className={`w-4 h-4 ${isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-yellow-400'}`} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {isStarred ? 'Remove from Favourites' : 'Add to Favourites'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </span>
              </div>
              {transfer.rejectionReason && (
                <div className="mt-2 bg-red-500/10 border border-red-500/20 rounded p-2">
                  <p className="text-red-400 text-sm">{transfer.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-lg font-bold text-green-400">{transfer.fee}</p>
            <p className="text-xs text-gray-300">{transfer.source}</p>
            <p className="text-xs text-gray-400">{new Date(transfer.date).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

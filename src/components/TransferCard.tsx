
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Star, ExternalLink, Newspaper } from 'lucide-react';
import { Transfer } from '@/types/transfer';
import { getStatusColor } from '@/utils/statusUtils';
import { getPlayerImage } from '@/utils/playerImageUtils';
import { PlayerNameLink } from './PlayerNameLink';
import { findPlayerInSquads } from '@/utils/playerUtils';

interface TransferCardProps {
  transfer: Transfer;
  isCompact?: boolean;
}

const getPlayerInitials = (playerName: string) => {
  return playerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// Return a simple icon for transfer status
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'confirmed':
      return <span title="Confirmed" style={{ color: 'limegreen', fontSize: '1.2em' }}>✔️</span>;
    case 'rumored':
      return <span title="Rumored" style={{ color: 'gold', fontSize: '1.2em' }}>💬</span>;
    case 'rejected':
      return <span title="Rejected" style={{ color: 'red', fontSize: '1.2em' }}>❌</span>;
    default:
      return <span title={status} style={{ color: 'gray', fontSize: '1.2em' }}>•</span>;
  }
};

export const TransferCard: React.FC<TransferCardProps> = ({ transfer, isCompact = false }) => {
  // Debug logging
  React.useEffect(() => {
    console.log(`🎯 TransferCard rendered for ${transfer.playerName}:`, {
      hasRelatedNews: !!transfer.relatedNews,
      newsCount: transfer.relatedNews?.length || 0,
      newsTitles: transfer.relatedNews?.map(n => n.title) || []
    });
  }, [transfer.playerName, transfer.relatedNews]);

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

  // Handle news article click
  const handleNewsClick = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (isCompact) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700 hover:bg-slate-800/70 transition-all duration-200 overflow-hidden">
        <div className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage 
                  src={transfer.playerImage || getPlayerImage(transfer.playerName, transfer.toClub)} 
                  alt={transfer.playerName}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <AvatarFallback className="bg-slate-600 text-white text-xs">
                  {getPlayerInitials(transfer.playerName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Badge className={`text-xs flex-shrink-0 whitespace-nowrap`} style={{ background: getStatusColor(transfer.status), color: '#fff' }}>{transfer.status.toUpperCase()}</Badge>
                <div className="flex-1 min-w-0">
                  {(() => {
                    const playerInfo = findPlayerInSquads(transfer.playerName);
                    if (playerInfo.found) {
                      return (
                        <PlayerNameLink
                          playerName={transfer.playerName}
                          teamName={playerInfo.club}
                          playerData={playerInfo.player}
                          className="text-white text-sm font-semibold hover:text-blue-300 truncate block"
                        />
                      );
                    }
                    return <h4 className="font-semibold text-white text-sm truncate">{transfer.playerName}</h4>;
                  })()}
                </div>
              </div>
            </div>
            
            <div className="text-xs text-gray-300">
              <div className="flex items-center gap-1 mb-1">
              <span>{transfer.fromClub}</span>
              <span>→</span>
              <span className="font-semibold text-white">{transfer.toClub}</span>
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
            
            {/* Player News Section - Compact View */}
            {transfer.relatedNews && transfer.relatedNews.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <Newspaper className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium text-blue-400">Latest News</span>
                </div>
                <div className="space-y-2">
                  {transfer.relatedNews.slice(0, 1).map((news) => (
                    <div
                      key={news.id}
                      className="bg-slate-700/50 rounded p-2 cursor-pointer hover:bg-slate-700/70 transition-colors"
                      onClick={() => handleNewsClick(news.url || '')}
                    >
                      <p className="text-xs text-white font-medium line-clamp-2">{news.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-400">{news.source}</span>
                        <span className="text-xs text-gray-400">{news.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700 hover:bg-slate-800/70 transition-all duration-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex-1 flex items-center gap-4 min-w-0">
            <Avatar className="w-12 h-12">
              <AvatarImage 
                src={transfer.playerImage || getPlayerImage(transfer.playerName, transfer.toClub)} 
                alt={transfer.playerName}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <AvatarFallback className="bg-slate-600 text-white">
                {getPlayerInitials(transfer.playerName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {getStatusIcon(transfer.status)}
                <div className="flex-1 min-w-0">
                  {(() => {
                    const playerInfo = findPlayerInSquads(transfer.playerName);
                    if (playerInfo.found) {
                      return (
                        <PlayerNameLink
                          playerName={transfer.playerName}
                          teamName={playerInfo.club}
                          playerData={playerInfo.player}
                          className="text-lg font-semibold text-white hover:text-blue-300 truncate block"
                        />
                      );
                    }
                    return <h3 className="text-lg font-semibold text-white truncate">{transfer.playerName}</h3>;
                  })()}
                </div>
                <Badge className={`${getStatusColor(transfer.status)} text-white text-xs flex-shrink-0 whitespace-nowrap`}>
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
            <p className="text-lg font-bold text-green-400">{transfer.fee || 'No fee listed'}</p>
            <p className="text-xs text-gray-300">{transfer.source}</p>
            <p className="text-xs text-gray-400">{new Date(transfer.date).toLocaleDateString()}</p>
          </div>
        </div>
        
        {/* Player News Section - Full View */}
        {transfer.relatedNews && transfer.relatedNews.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-600">
            <div className="flex items-center gap-2 mb-3">
              <Newspaper className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Related News</span>
              <Badge variant="secondary" className="text-xs">
                {transfer.relatedNews.length} article{transfer.relatedNews.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="grid gap-3">
              {transfer.relatedNews.map((news) => (
                <div
                  key={news.id}
                  className="bg-slate-700/50 rounded-lg p-3 cursor-pointer hover:bg-slate-700/70 transition-all duration-200 group"
                  onClick={() => handleNewsClick(news.url || '')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors line-clamp-2">
                        {news.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {news.summary}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-500">{news.source}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{news.time}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">
                          {Math.round(news.relevanceScore * 100)}% match
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

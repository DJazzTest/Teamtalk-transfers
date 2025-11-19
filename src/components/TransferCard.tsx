
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ExternalLink, Newspaper } from 'lucide-react';
import { Transfer } from '@/types/transfer';
import { getStatusColor } from '@/utils/statusUtils';
import { getPlayerImage } from '@/utils/playerImageUtils';
import { PlayerNameLink } from './PlayerNameLink';
import { findPlayerInSquads } from '@/utils/playerUtils';

interface TransferCardProps {
  transfer: Transfer;
  isCompact?: boolean;
  highlightedPlayerName?: string | null;
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

export const TransferCard: React.FC<TransferCardProps> = ({ transfer, isCompact = false, highlightedPlayerName }) => {
  // Debug logging
  React.useEffect(() => {
    console.log(`🎯 TransferCard rendered for ${transfer.playerName}:`, {
      hasRelatedNews: !!transfer.relatedNews,
      newsCount: transfer.relatedNews?.length || 0,
      newsTitles: transfer.relatedNews?.map(n => n.title) || []
    });
  }, [transfer.playerName, transfer.relatedNews]);

  // Handle news article click
  const handleNewsClick = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const isHighlighted =
    highlightedPlayerName &&
    transfer.playerName &&
    transfer.playerName.toLowerCase() === highlightedPlayerName.toLowerCase();

  const highlightClasses = isHighlighted
    ? 'ring-2 ring-green-500 dark:ring-green-300 shadow-lg shadow-green-500/30'
    : '';

  if (isCompact) {
    return (
      <Card className={`bg-white dark:bg-slate-800/50 backdrop-blur-md border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/70 transition-all duration-200 overflow-hidden ${highlightClasses}`}>
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
                <AvatarFallback className="bg-gray-400 dark:bg-slate-600 text-white text-xs">
                  {getPlayerInitials(transfer.playerName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Badge className={`text-[10px] px-1.5 py-0.5 flex-shrink-0 whitespace-nowrap leading-tight`} style={{ background: getStatusColor(transfer.status), color: '#fff' }}>{transfer.status.toUpperCase()}</Badge>
                <div className="flex-1 min-w-0 pr-2">
                  {(() => {
                    const playerInfo = findPlayerInSquads(transfer.playerName);
                    if (playerInfo.found) {
                      return (
                        <PlayerNameLink
                          playerName={transfer.playerName}
                          teamName={playerInfo.club}
                          playerData={playerInfo.player}
                          className="text-gray-900 dark:text-white text-sm font-semibold hover:text-blue-600 dark:hover:text-blue-300 break-words"
                        />
                      );
                    }
                    return <h4 className="font-semibold text-gray-900 dark:text-white text-sm break-words">{transfer.playerName}</h4>;
                  })()}
                </div>
              </div>
            </div>
            
            <div className="text-xs text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-1 mb-1">
              <span>{transfer.fromClub}</span>
              <span>→</span>
              <span className="font-semibold text-gray-900 dark:text-white">{transfer.toClub}</span>
            </div>
            </div>
            
            {transfer.rejectionReason && (
              <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
                <p className="text-red-600 dark:text-red-400 text-xs">{transfer.rejectionReason}</p>
              </div>
            )}
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm font-bold text-green-600 dark:text-green-400">{transfer.fee}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">{new Date(transfer.date).toLocaleDateString()}</p>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300">{transfer.source}</p>
            </div>
            
            {/* Player News Section - Compact View */}
            {transfer.relatedNews && transfer.relatedNews.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-300 dark:border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <Newspaper className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Latest News</span>
                </div>
                <div className="space-y-2">
                  {transfer.relatedNews.slice(0, 1).map((news) => (
                    <div
                      key={news.id}
                      className="bg-gray-100 dark:bg-slate-700/50 rounded p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700/70 transition-colors"
                      onClick={() => handleNewsClick(news.url || '')}
                    >
                      <p className="text-xs text-gray-900 dark:text-white font-medium line-clamp-2">{news.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{news.source}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{news.time}</span>
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
        <div className="overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#475569 #1e293b' }}>
          <div className="flex items-center justify-between gap-4" style={{ minWidth: 'min-content' }}>
            <div className="flex items-center gap-4 flex-shrink-0">
              <Avatar className="w-12 h-12 flex-shrink-0">
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
              <div className="flex-shrink-0" style={{ minWidth: 'min-content' }}>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(transfer.status)}
                  {(() => {
                    const playerInfo = findPlayerInSquads(transfer.playerName);
                    if (playerInfo.found) {
                      return (
                        <PlayerNameLink
                          playerName={transfer.playerName}
                          teamName={playerInfo.club}
                          playerData={playerInfo.player}
                          className="text-base font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-300 whitespace-nowrap"
                        />
                      );
                    }
                    return <h3 className="text-base font-semibold text-gray-900 dark:text-white whitespace-nowrap">{transfer.playerName}</h3>;
                  })()}
                  <Badge className={`${getStatusColor(transfer.status)} text-white text-[10px] px-1.5 py-0.5 flex-shrink-0 whitespace-nowrap leading-tight`}>
                    {transfer.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  <span>{transfer.fromClub}</span>
                  <span>→</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {transfer.toClub}
                  </span>
                </div>
                {transfer.rejectionReason && (
                  <div className="mt-2 bg-red-500/10 border border-red-500/20 rounded p-2">
                    <p className="text-red-600 dark:text-red-400 text-sm">{transfer.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-right flex-shrink-0" style={{ minWidth: 'min-content' }}>
              <p className="text-lg font-bold text-green-600 dark:text-green-400 whitespace-nowrap">{transfer.fee || 'No fee listed'}</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">{transfer.source}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{new Date(transfer.date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        
        {/* Player News Section - Full View */}
        {transfer.relatedNews && transfer.relatedNews.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-300 dark:border-slate-600">
            <div className="flex items-center gap-2 mb-3">
              <Newspaper className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Related News</span>
              <Badge variant="secondary" className="text-xs">
                {transfer.relatedNews.length} article{transfer.relatedNews.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="grid gap-3">
              {transfer.relatedNews.map((news) => (
                <div
                  key={news.id}
                  className="bg-gray-100 dark:bg-slate-700/50 rounded-lg p-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700/70 transition-all duration-200 group"
                  onClick={() => handleNewsClick(news.url || '')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors line-clamp-2">
                        {news.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {news.summary}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-600 dark:text-gray-500">{news.source}</span>
                        <span className="text-xs text-gray-600 dark:text-gray-500">•</span>
                        <span className="text-xs text-gray-600 dark:text-gray-500">{news.time}</span>
                        <span className="text-xs text-gray-600 dark:text-gray-500">•</span>
                        <span className="text-xs text-gray-600 dark:text-gray-500">
                          {Math.round(news.relevanceScore * 100)}% match
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
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

import React from 'react';
import { useTeamTalkFeed } from '@/hooks/useTeamTalkFeed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink, Clock, User } from 'lucide-react';
import { TeamTalkArticle } from '@/types/teamtalk';

interface TeamTalkFeedProps {
  maxItems?: number;
  showTransfersOnly?: boolean;
}

const TeamTalkFeed: React.FC<TeamTalkFeedProps> = ({ 
  maxItems = 30, 
  showTransfersOnly = false 
}) => {
  const { articles, transfers, loading, error, lastUpdated, refresh } = useTeamTalkFeed();
  
  // Surface the latest headline to the console for quick verification
  if (articles && articles.length > 0) {
    console.log('📰 Latest TeamTalk headline:', articles[0].headline);
  }

  const getStatusBadgeColor = (tag: string) => {
    switch (tag) {
      case 'Top Source':
      case 'Exclusive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Rumour':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Interest Confirmed':
      case 'Heavily Linked':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const renderArticle = (article: TeamTalkArticle) => (
    <Card key={article.id} className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {article.image && (
            <img 
              src={article.image} 
              alt={article.image_title}
              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {article.transfer_tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className={getStatusBadgeColor(tag)}
                >
                  {tag}
                </Badge>
              ))}
              <div className="flex items-center text-xs text-gray-500 ml-auto">
                <Clock className="w-3 h-3 mr-1" />
                {formatTimeAgo(article.pub_date)}
              </div>
            </div>
            
            <h3 className="font-semibold text-sm mb-2 line-clamp-2">
              {article.headline}
            </h3>
            
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
              {article.excerpt}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {article.transfer_players.map((player, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <User className="w-3 h-3 mr-1" />
                    {player.name}
                  </Badge>
                ))}
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.open(article.link, '_blank')}
                className="text-xs"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Read More
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderTransfer = (transfer: any) => (
    <Card key={transfer.id} className="mb-3">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-sm">{transfer.playerName}</h4>
            <p className="text-xs text-gray-600">
              {transfer.fromClub} → {transfer.toClub}
            </p>
          </div>
          <div className="text-right">
            <Badge 
              variant={transfer.status === 'confirmed' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {transfer.status}
            </Badge>
            <p className="text-xs text-gray-500 mt-1">{transfer.fee}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-red-600">
            <p className="mb-2">Failed to load TeamTalk feed</p>
            <p className="text-sm text-gray-500 mb-3">{error}</p>
            <Button onClick={refresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayItems = showTransfersOnly ? transfers : articles;
  const limitedItems = displayItems.slice(0, maxItems);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              TeamTalk Live Feed
            </CardTitle>
            <div className="flex items-center gap-2">
              {lastUpdated && (
                <span className="text-xs text-gray-500">
                  Updated {formatTimeAgo(lastUpdated.toISOString())}
                </span>
              )}
              <Button 
                onClick={refresh} 
                variant="ghost" 
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {loading && displayItems.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">Loading transfer news...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div>
          {limitedItems.length === 0 ? (
            <Card>
              <CardContent className="p-8">
                <div className="text-center text-gray-500">
                  <p>No transfer news available</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            limitedItems.map(item => 
              showTransfersOnly ? renderTransfer(item) : renderArticle(item as TeamTalkArticle)
            )
          )}
        </div>
      )}
    </div>
  );
};

export default TeamTalkFeed;

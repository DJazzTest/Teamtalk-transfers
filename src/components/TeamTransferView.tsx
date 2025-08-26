
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Search, TrendingUp, TrendingDown, MessageCircle, Users, ExternalLink, Clock } from 'lucide-react';
import { Transfer } from '@/types/transfer';
import { TransferCard } from './TransferCard';
import { premierLeagueClubs } from '@/data/mockTransfers';
import { clubBadgeMap } from './ClubsView';
import { topSpendingClubs } from '@/data/topSpendingClubs';
import { scoreInsideApi } from '@/services/scoreinsideApi';

// Build a map of club -> spend from the topSpendingClubs data
const clubSpendMap: Record<string, number> = Object.fromEntries(
  topSpendingClubs.map(club => [club.club, club.spend])
);

interface TeamTransferViewProps {
  transfers: Transfer[];
  selectedTeam?: string | null;
  onBack?: () => void;
}

export const TeamTransferView: React.FC<TeamTransferViewProps> = ({ transfers, selectedTeam: externalSelectedTeam, onBack }) => {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(externalSelectedTeam || null);
  const [clubNews, setClubNews] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);

  // Fetch news when team is selected
  useEffect(() => {
    const fetchClubNews = async () => {
      if (!selectedTeam) return;
      
      setNewsLoading(true);
      try {
        // Use ScoreInside API to fetch transfer articles and news
        const response = await fetch('https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=50&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBrzeY8Ku923Q2MXcUog5gTDAZQ', {
          headers: {
            'accept': 'application/json',
            'user-agent': 'TransferCentre/1.0'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }

        const data = await response.json();
        
        if (data.status === 200 && data.result?.transfer_articles?.data) {
          // Enhanced filtering for club-specific articles
          const selectedTeamLower = selectedTeam.toLowerCase();
          const clubKeywords = [
            selectedTeam,
            selectedTeamLower,
            selectedTeam.replace(' United', '').replace(' City', '').replace(' Hotspur', '').replace(' FC', ''),
            selectedTeamLower.replace(' united', '').replace(' city', '').replace(' hotspur', '').replace(' fc', '')
          ];

          const clubArticles = data.result.transfer_articles.data
            .filter((item: any) => {
              const teamName = item.team?.nm;
              const headline = item.article?.hdl?.toLowerCase() || '';
              
              // Direct team match
              if (teamName === selectedTeam) return true;
              
              // Check if any club keyword is mentioned in headline
              return clubKeywords.some(keyword => 
                headline.includes(keyword.toLowerCase())
              );
            })
            .map((item: any) => ({
              id: item.aid,
              title: item.article.hdl,
              description: `${item.scat} - Player: ${item.player?.nm || 'Unknown'}`,
              url: `https://www.teamtalk.com/transfer-news/${item.article.sl}`,
              publishedAt: item.article.sdt,
              source: 'ScoreInside',
              category: item.scat,
              player: item.player?.nm,
              team: item.team?.nm,
              image: item.article.image?.impth || item.article.image?.scim,
              imageTitle: item.article.image?.ttl
            }))
            .sort((a: any, b: any) => 
              new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
            );

          // Always show at least some articles - if no specific club articles, show general Premier League news
          let finalArticles = clubArticles;
          if (finalArticles.length < 5) {
            const generalArticles = data.result.transfer_articles.data
              .filter((item: any) => !clubArticles.some((existing: any) => existing.id === item.aid))
              .slice(0, 8 - finalArticles.length)
              .map((item: any) => ({
                id: item.aid,
                title: item.article.hdl,
                description: `${item.scat} - Player: ${item.player?.nm || 'Unknown'}`,
                url: `https://www.teamtalk.com/transfer-news/${item.article.sl}`,
                publishedAt: item.article.sdt,
                source: 'ScoreInside',
                category: item.scat,
                player: item.player?.nm,
                team: item.team?.nm,
                image: item.article.image?.impth || item.article.image?.scim,
                imageTitle: item.article.image?.ttl
              }));

            finalArticles = [...finalArticles, ...generalArticles];
          }

          setClubNews(finalArticles.slice(0, 10));
        } else {
          setClubNews([]);
        }
      } catch (error) {
        console.error('Error fetching club news:', error);
        setClubNews([]);
      } finally {
        setNewsLoading(false);
      }
    };

    fetchClubNews();
  }, [selectedTeam]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClubs, setFilteredClubs] = useState(premierLeagueClubs);

  useEffect(() => {
    if (searchTerm) {
      setFilteredClubs(
        premierLeagueClubs.filter(club =>
          club.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredClubs(premierLeagueClubs);
    }
  }, [searchTerm]);

  const getTeamStats = (teamName: string) => {
    const transfersIn = transfers.filter(t => t.toClub === teamName);
    const transfersOut = transfers.filter(t => t.fromClub === teamName);
    const rumors = transfers.filter(t => 
      (t.toClub === teamName || t.fromClub === teamName) && t.status === 'rumored'
    );

    // Sort function to order transfers by date (oldest to latest)
    const sortByDate = (a: Transfer, b: Transfer) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB; // Oldest first
    };

    return {
      transfersIn: transfersIn.filter(t => t.status === 'confirmed').sort(sortByDate),
      transfersOut: transfersOut.filter(t => t.status === 'confirmed').sort(sortByDate),
      rumors: rumors.sort(sortByDate),
      totalActivity: transfersIn.length + transfersOut.length
    };
  };

  if (selectedTeam) {
    const stats = getTeamStats(selectedTeam);
    
    return (
      <div className="space-y-6">
        {/* Back Button and Team Header */}
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onBack ? onBack : () => setSelectedTeam(null)}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                ← Back to All Teams
              </button>
              <Badge className="bg-blue-500 text-white">
                {stats.totalActivity} Total Activities
              </Badge>
            </div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <img
                src={`/badges/${clubBadgeMap[selectedTeam!] || selectedTeam?.toLowerCase().replace(/[^a-z]/g, '') + '.png'}`}
                alt={`${selectedTeam} badge`}
                className="w-8 h-8 rounded-full shadow bg-white object-contain border border-gray-200 mr-1"
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {selectedTeam}
            </h2>
            {/* Show current spend for this club */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-green-400 font-bold text-lg">
                £{(clubSpendMap[selectedTeam] || 0).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
              </span>
              <span className="text-gray-400 text-sm">Current Spend</span>
            </div>
          </div>
        </Card>

        {/* Club News Index Carousel */}
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-purple-400" />
              Club News Index ({clubNews.length})
            </h3>
            {newsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading club news...</p>
              </div>
            ) : clubNews.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No recent news found for {selectedTeam}</p>
            ) : (
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {clubNews.map((article, index) => (
                  <div key={`${article.source}-${index}`} className="flex-none w-80">
                    <Card className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 transition-all duration-200 overflow-hidden h-full">
                      <div className="flex flex-col h-full">
                        {/* Thumbnail Image */}
                        <div className="w-full h-32 flex-shrink-0">
                          {article.image ? (
                            <img
                              src={article.image}
                              alt={article.imageTitle || article.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-600/50 flex items-center justify-center">
                              <ExternalLink className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={
                              article.category === 'Top Source' ? 'bg-green-500 text-white' :
                              article.category === 'Heavily Linked' ? 'bg-orange-500 text-white' :
                              article.category === 'Rumours' ? 'bg-blue-500 text-white' :
                              article.category === 'Done Deal' ? 'bg-purple-500 text-white' :
                              'bg-gray-500 text-white'
                            }>
                              {article.category || article.source}
                            </Badge>
                            {article.player && (
                              <Badge variant="outline" className="text-gray-400 border-gray-600 text-xs">
                                {article.player}
                              </Badge>
                            )}
                          </div>
                          
                          <h4 className="text-white font-semibold text-sm leading-tight mb-2 line-clamp-3">
                            {article.title}
                          </h4>
                          
                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-1 text-gray-400 text-xs">
                              <Clock className="w-3 h-3" />
                              {new Date(article.publishedAt).toLocaleDateString()}
                            </div>
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 text-xs font-medium transition-colors"
                            >
                              Read <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
            <div className="p-4 flex items-center gap-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-white font-semibold">{stats.transfersIn.length}</p>
                <p className="text-gray-300 text-sm">Transfers In</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
            <div className="p-4 flex items-center gap-3">
              <div className="bg-red-500/20 p-2 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-white font-semibold">{stats.transfersOut.length}</p>
                <p className="text-gray-300 text-sm">Transfers Out</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
            <div className="p-4 flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <MessageCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-semibold">{stats.rumors.length}</p>
                <p className="text-gray-300 text-sm">Rumors & Gossip</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Transfer Categories */}
        <div className="space-y-6">
          {/* Transfers In */}
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Transfers In ({stats.transfersIn.length})
              </h3>
              {stats.transfersIn.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No confirmed transfers in</p>
              ) : (
                <div className="space-y-3">
                  {stats.transfersIn.map((transfer) => (
                    <div key={transfer.id} className="bg-slate-700/50 rounded-lg p-4">
                      <TransferCard transfer={transfer} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Transfers Out */}
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-400" />
                Transfers Out ({stats.transfersOut.length})
              </h3>
              {stats.transfersOut.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No confirmed transfers out</p>
              ) : (
                <div className="space-y-3">
                  {stats.transfersOut.map((transfer) => (
                    <div key={transfer.id} className="bg-slate-700/50 rounded-lg p-4">
                      <TransferCard transfer={transfer} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Rumors & Gossip */}
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                Rumors & Gossip ({stats.rumors.length})
              </h3>
              {stats.rumors.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No transfer rumors found</p>
              ) : (
                <div className="space-y-3">
                  {stats.rumors.map((transfer) => (
                    <div key={transfer.id} className="bg-slate-700/50 rounded-lg p-4">
                      <TransferCard transfer={transfer} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Header */}
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Users className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Select a Team</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
            />
          </div>
        </div>
      </Card>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClubs.map((club) => {
          const stats = getTeamStats(club);
          return (
            <Card
              key={club}
              className="bg-slate-800/50 backdrop-blur-md border-slate-700 hover:bg-slate-800/70 cursor-pointer transition-all duration-200"
              onClick={() => setSelectedTeam(club)}
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <img
                    src={`/badges/${clubBadgeMap[club] || club.toLowerCase().replace(/[^a-z]/g, '') + '.png'}`}
                    alt={`${club} badge`}
                    className="w-6 h-6 rounded-full shadow bg-white object-contain border border-gray-200"
                    onError={e => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {club}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Transfers In:</span>
                    <span className="text-green-400 font-medium">{stats.transfersIn.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Transfers Out:</span>
                    <span className="text-red-400 font-medium">{stats.transfersOut.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Rumors:</span>
                    <span className="text-blue-400 font-medium">{stats.rumors.length}</span>
                  </div>
                  <div className="border-t border-slate-600 pt-2 mt-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-white">Total Activity:</span>
                      <span className="text-blue-400">{stats.totalActivity}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

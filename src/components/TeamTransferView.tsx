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
import { newsApi } from '@/services/newsApi';

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

  // Fetch news when team is selected using the working newsApi
  useEffect(() => {
    const fetchClubNews = async () => {
      if (!selectedTeam) return;
      
      setNewsLoading(true);
      try {
        // Use the working newsApi that combines multiple sources
        const allArticles = await newsApi.fetchNews();
        
        // Enhanced filtering for club-specific articles
        const selectedTeamLower = selectedTeam.toLowerCase();
        const clubKeywords = [
          selectedTeam,
          selectedTeamLower,
          selectedTeam.replace(' United', '').replace(' City', '').replace(' Hotspur', '').replace(' FC', ''),
          selectedTeamLower.replace(' united', '').replace(' city', '').replace(' hotspur', '').replace(' fc', '')
        ];

        // Filter articles related to the selected club
        const clubArticles = allArticles.filter(article => {
          const content = `${article.title} ${article.summary}`.toLowerCase();
          return clubKeywords.some(keyword => 
            content.includes(keyword.toLowerCase())
          );
        });

        // Convert to the format expected by the UI
        const formattedArticles = clubArticles.slice(0, 10).map(article => ({
          id: article.id,
          title: article.title,
          description: article.summary,
          url: article.url || '#',
          publishedAt: new Date().toISOString(), // Use current time as fallback
          source: article.source,
          category: article.category,
          player: null,
          team: selectedTeam,
          image: article.image,
          imageTitle: article.title
        }));

        // If we have fewer than 5 club-specific articles, add some general transfer news
        if (formattedArticles.length < 5) {
          const generalArticles = allArticles
            .filter(article => !clubArticles.some(existing => existing.id === article.id))
            .slice(0, 8 - formattedArticles.length)
            .map(article => ({
              id: article.id,
              title: article.title,
              description: article.summary,
              url: article.url || '#',
              publishedAt: new Date().toISOString(),
              source: article.source,
              category: article.category,
              player: null,
              team: null,
              image: article.image,
              imageTitle: article.title
            }));

          formattedArticles.push(...generalArticles);
        }

        setClubNews(formattedArticles);
      } catch (error) {
        console.error('Error fetching club news:', error);
        setClubNews([]);
      } finally {
        setNewsLoading(false);
      }
    };

    fetchClubNews();
  }, [selectedTeam]);

  // Handle team selection changes
  useEffect(() => {
    if (externalSelectedTeam !== selectedTeam) {
      setSelectedTeam(externalSelectedTeam || null);
    }
  }, [externalSelectedTeam]);

  // Filter logic for team selection page
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClubs, setFilteredClubs] = useState(premierLeagueClubs);

  useEffect(() => {
    const filtered = premierLeagueClubs.filter(club =>
      club.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClubs(filtered);
  }, [searchTerm]);

  const getTeamStats = (teamName: string) => {
    const teamTransfers = transfers.filter(
      transfer => transfer.fromClub === teamName || transfer.toClub === teamName
    );

    const transfersIn = teamTransfers.filter(t => t.toClub === teamName).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const transfersOut = teamTransfers.filter(t => t.fromClub === teamName).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const rumors = teamTransfers.filter(t => 
      t.status === 'rumored' && (t.fromClub === teamName || t.toClub === teamName)
    ).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return { transfersIn, transfersOut, rumors, totalActivity: teamTransfers.length };
  };

  if (selectedTeam) {
    const { transfersIn, transfersOut, rumors } = getTeamStats(selectedTeam);

    return (
      <div className="space-y-6">
        {/* Team Header */}
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSelectedTeam(null);
                  onBack?.();
                }}
                className="text-gray-300 hover:text-white border-gray-600 hover:border-gray-500"
              >
                ← Back to Teams
              </Button>
            </div>
          </div>
          
          <div className="px-6 pb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
              <img
                src={`/badges/${clubBadgeMap[selectedTeam] || selectedTeam.toLowerCase().replace(/[^a-z]/g, '') + '.png'}`}
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

        {/* Latest Transfer News */}
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-purple-400" />
              Latest Transfer News ({clubNews.length})
            </h3>
            {newsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading latest news...</p>
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
                          </div>
                          
                          <h4 className="text-white font-semibold text-sm leading-tight mb-2 line-clamp-3">
                            {article.title}
                          </h4>
                          
                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-1 text-gray-400 text-xs">
                              <Clock className="w-3 h-3" />
                              {article.source}
                            </div>
                            {article.url && article.url !== '#' && (
                              <a 
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 hover:text-purple-300 transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
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

        {/* Transfer Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-green-900/20 border-green-700/50 backdrop-blur-md">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-green-400">Transfers In</h3>
              </div>
              <p className="text-2xl font-bold text-white">{transfersIn.length}</p>
              <p className="text-green-300 text-sm">New signings</p>
            </div>
          </Card>

          <Card className="bg-red-900/20 border-red-700/50 backdrop-blur-md">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-semibold text-red-400">Transfers Out</h3>
              </div>
              <p className="text-2xl font-bold text-white">{transfersOut.length}</p>
              <p className="text-red-300 text-sm">Departures</p>
            </div>
          </Card>

          <Card className="bg-blue-900/20 border-blue-700/50 backdrop-blur-md">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-blue-400">Rumours</h3>
              </div>
              <p className="text-2xl font-bold text-white">{rumors.length}</p>
              <p className="text-blue-300 text-sm">Potential moves</p>
            </div>
          </Card>
        </div>

        {/* Transfers In */}
        {transfersIn.length > 0 && (
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Recent Signings ({transfersIn.length})
              </h3>
              <div className="space-y-3">
                {transfersIn.map((transfer) => (
                  <TransferCard key={transfer.id} transfer={transfer} />
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Transfers Out */}
        {transfersOut.length > 0 && (
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-400" />
                Recent Departures ({transfersOut.length})
              </h3>
              <div className="space-y-3">
                {transfersOut.map((transfer) => (
                  <TransferCard key={transfer.id} transfer={transfer} />
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Rumours */}
        {rumors.length > 0 && (
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                Transfer Rumours ({rumors.length})
              </h3>
              <div className="space-y-3">
                {rumors.map((transfer) => (
                  <TransferCard key={transfer.id} transfer={transfer} />
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Select a Team</h2>
            </div>
            
            <div className="relative mb-6">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400"
              />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredClubs.map((club) => {
            const stats = getTeamStats(club);
            
            return (
              <Card
                key={club}
                className="bg-slate-800/50 backdrop-blur-md border-slate-700 hover:bg-slate-800/70 transition-all duration-200 cursor-pointer group"
                onClick={() => setSelectedTeam(club)}
              >
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={`/badges/${clubBadgeMap[club] || club.toLowerCase().replace(/[^a-z]/g, '') + '.png'}`}
                      alt={`${club} badge`}
                      className="w-6 h-6 rounded-full shadow bg-white object-contain border border-gray-200"
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                      {club}
                    </h3>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        In: {stats.transfersIn.length}
                      </span>
                      <span className="text-red-400 flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        Out: {stats.transfersOut.length}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-blue-400 flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        Rumours: {stats.rumors.length}
                      </span>
                      <span className="text-gray-400 text-xs">
                        Total: {stats.totalActivity}
                      </span>
                    </div>

                    {/* Show current spend for this club */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-600">
                      <span className="text-gray-400 text-xs">Current Spend:</span>
                      <span className="text-green-400 font-semibold text-xs">
                        £{(clubSpendMap[club] || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};
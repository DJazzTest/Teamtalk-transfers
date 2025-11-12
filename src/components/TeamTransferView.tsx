import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Search, TrendingUp, TrendingDown, MessageCircle, Users, ExternalLink, Clock, Home, ChevronDown, ChevronUp } from 'lucide-react';
import { Transfer } from '@/types/transfer';
import { TransferCard } from './TransferCard';
import { SquadWageCarousel } from './SquadWageCarousel';
import { getPremierLeagueClubs } from '@/utils/teamMapping';
import { clubBadgeMap } from './ClubsView';
import { topSpendingClubs } from '@/data/topSpendingClubs';
import { newsApi } from '@/services/newsApi';
import { teamDataService, TeamData } from '@/services/teamDataService';
import { MediaHubCarousel } from './MediaHubCarousel';
import { getTeamYoutubeUrl, getSport365Id, normalizeTeamName } from '@/utils/teamMapping';
import { sport365Api } from '@/services/sport365Api';
import { youtubeApi, YouTubeVideo } from '@/services/youtubeApi';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button as UIButton } from '@/components/ui/button';
import { LeagueTable } from './LeagueTable';
import { getTeamConfig } from '@/data/teamApiConfig';
import { TopScorersVisualization } from './TopScorersVisualization';

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
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [youtubeVideosLoading, setYoutubeVideosLoading] = useState(false);
  const [youtubeModal, setYoutubeModal] = useState<{ open: boolean; video?: YouTubeVideo }>(() => ({ open: false }));
  const [mediaHubModal, setMediaHubModal] = useState<{ open: boolean; item?: any; content?: string; loading?: boolean }>(() => ({ open: false, loading: false }));
  const [teamStripTab, setTeamStripTab] = useState<'results' | 'fixtures' | 'tables' | 'topscorer'>('results');
  const [teamDataBlocks, setTeamDataBlocks] = useState<{
    results: any[];
    fixtures: any[];
    table: any[];
  }>({ results: [], fixtures: [], table: [] });
  const [teamBlocksLoading, setTeamBlocksLoading] = useState<boolean>(false);
  const [matchModal, setMatchModal] = useState<{ open: boolean; matchId?: string; details?: any }>({ open: false });
  const [dataLoading, setDataLoading] = useState(false);
  const [topScorers, setTopScorers] = useState<Array<{ name: string; goals: number }>>([]);
  const [expandedSections, setExpandedSections] = useState<{
    doneDeals: boolean;
    departures: boolean;
    rumours: boolean;
  }>({
    doneDeals: false,
    departures: false,
    rumours: false,
  });

  // Fetch comprehensive team data when team is selected
  useEffect(() => {
    const fetchTeamData = async () => {
      if (!selectedTeam) return;
      
      setDataLoading(true);
      setYoutubeVideosLoading(true);
      setYoutubeVideos([]); // Reset videos when team changes
      
      try {
        const [teamDataResult, youtubeVideosResult] = await Promise.allSettled([
          teamDataService.getTeamData(selectedTeam),
          youtubeApi.getTeamVideos(selectedTeam, 15)
        ]);
        
        if (teamDataResult.status === 'fulfilled') {
          setTeamData(teamDataResult.value);
        } else {
          console.error('Error fetching team data:', teamDataResult.reason);
          setTeamData(null);
        }
        
        if (youtubeVideosResult.status === 'fulfilled') {
          const videos = youtubeVideosResult.value || [];
          setYoutubeVideos(videos);
          console.log(`✅ Loaded ${videos.length} YouTube videos for ${selectedTeam}`);
        } else {
          console.error('Error fetching YouTube videos:', youtubeVideosResult.reason);
          setYoutubeVideos([]);
        }
      } catch (error) {
        console.error('Error fetching team data:', error);
        setTeamData(null);
        setYoutubeVideos([]);
      } finally {
        setDataLoading(false);
        setYoutubeVideosLoading(false);
      }
    };

    fetchTeamData();
  }, [selectedTeam]);

  // Load top goal scorers for the team from data file
  useEffect(() => {
    const loadTopScorers = async () => {
      try {
        setTopScorers([]);
        if (!selectedTeam) return;
        
        // Use the provided top scorers data
        const { getTeamTopScorers } = await import('@/data/teamTopScorers');
        const scorers = getTeamTopScorers(selectedTeam);
        
        if (scorers.length > 0) {
          // Already sorted by goals (descending) in the data file
          setTopScorers(scorers);
        } else {
          // If no data available, show empty state
          setTopScorers([]);
        }
      } catch (error) {
        console.error('Error loading top scorers:', error);
        setTopScorers([]);
      }
    };
    loadTopScorers();
  }, [selectedTeam]);

  // Fetch selected team blocks (results, fixtures, tables) using team service
  useEffect(() => {
    const loadTeamBlocks = async () => {
      if (!selectedTeam) return;
      setTeamBlocksLoading(true);
      try {
        const { teamResultsFixturesService } = await import('@/services/teamResultsFixturesService');
        // Season bounds: Aug 1 current season to June 30 next year
        const now = new Date();
        const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
        const seasonStart = new Date(Date.UTC(year, 7, 1, 0, 0, 0)).toISOString(); // Aug 1
        const seasonEnd = new Date(Date.UTC(year + 1, 5, 30, 23, 59, 59)).toISOString(); // Jun 30

        const [results, fixtures] = await Promise.all([
          teamResultsFixturesService.getTeamResults(selectedTeam, seasonStart, seasonEnd),
          teamResultsFixturesService.getTeamFixtures(selectedTeam, seasonStart, seasonEnd)
        ]);

        // Fallback: directly fetch and flatten competitions if results empty
        let nextResults = results;
        if (!nextResults || nextResults.length === 0) {
          try {
            const { sport365Api } = await import('@/services/sport365Api');
            const raw = await sport365Api.getMatchesFromTo(seasonStart, seasonEnd);
            const list: any[] = [];
            if (Array.isArray(raw)) {
              if (raw.length > 0 && raw[0].matches && Array.isArray(raw[0].matches)) {
                for (const comp of raw) {
                  if (comp.matches && Array.isArray(comp.matches)) list.push(...comp.matches);
                }
              } else {
                list.push(...raw);
              }
            } else if (raw?.data && Array.isArray(raw.data)) {
              list.push(...raw.data);
            } else if (raw?.matches && Array.isArray(raw.matches)) {
              list.push(...raw.matches);
            }

            const nameNorm = (n: string) => (n || '').toLowerCase();
            const isTeam = (m: any) => {
              if (m.teams && Array.isArray(m.teams)) {
                return m.teams.some((t: any) => nameNorm(t.name).includes(nameNorm(selectedTeam)) || nameNorm(selectedTeam).includes(nameNorm(t.name)));
              }
              const hn = nameNorm(m.home_name || m.hn || m.home?.name || m.home || '');
              const an = nameNorm(m.away_name || m.an || m.away?.name || m.away || '');
              const sel = nameNorm(selectedTeam);
              return hn.includes(sel) || an.includes(sel) || sel.includes(hn) || sel.includes(an);
            };
            const isFinished = (m: any) => m.status === 6 || (Array.isArray(m.ft_score) && m.ft_score.length >= 2) || (Array.isArray(m.score) && m.score.length >= 2);

            const filtered = list.filter(isTeam).filter(isFinished);
            nextResults = filtered.slice(0, 20).map((m: any) => ({
              id: m.id || m.mid || '',
              homeTeam: m.teams && m.teams[0]?.name ? m.teams[0].name : (m.home_name || m.hn || m.home?.name || m.home || ''),
              awayTeam: m.teams && m.teams[1]?.name ? m.teams[1].name : (m.away_name || m.an || m.away?.name || m.away || ''),
              homeScore: Array.isArray(m.score) ? m.score[0] : (Array.isArray(m.ft_score) ? m.ft_score[0] : undefined),
              awayScore: Array.isArray(m.score) ? m.score[1] : (Array.isArray(m.ft_score) ? m.ft_score[1] : undefined),
              date: (() => {
                const s = (m.start || '').toString();
                if (s && s.length === 14) return `${s.substring(0,4)}-${s.substring(4,6)}-${s.substring(6,8)}T${s.substring(8,10)}:${s.substring(10,12)}:${s.substring(12,14)}`;
                return m.start_time || m.date || m.dt || '';
              })(),
              status: 'finished',
              competition: m.c_name || ''
            }));
          } catch {}
        }

        // Fallback 2: team page by team id if still empty
        if (!nextResults || nextResults.length === 0) {
          try {
            const teamId = getSport365Id?.(selectedTeam);
            if (teamId) {
              const { sport365Api } = await import('@/services/sport365Api');
              const page = await sport365Api.getTeamPage(teamId);
              const buckets: any[] = [];
              if (page?.matches && Array.isArray(page.matches)) buckets.push(...page.matches);
              if (page?.recentMatches && Array.isArray(page.recentMatches)) buckets.push(...page.recentMatches);
              if (page?.upcomingMatches && Array.isArray(page.upcomingMatches)) buckets.push(...page.upcomingMatches);
              const finished = buckets.filter((m: any) => (Array.isArray(m.ft_score) && m.ft_score.length >= 2) || m.status === 6);
              nextResults = finished.slice(0, 20).map((m: any) => ({
                id: m.id || m.mid || '',
                homeTeam: m.teams && m.teams[0]?.name ? m.teams[0].name : (m.home_name || m.hn || m.home?.name || m.home || ''),
                awayTeam: m.teams && m.teams[1]?.name ? m.teams[1].name : (m.away_name || m.an || m.away?.name || m.away || ''),
                homeScore: Array.isArray(m.ft_score) ? m.ft_score[0] : (Array.isArray(m.score) ? m.score[0] : undefined),
                awayScore: Array.isArray(m.ft_score) ? m.ft_score[1] : (Array.isArray(m.score) ? m.score[1] : undefined),
                date: (() => {
                  const s = (m.start || '').toString();
                  if (s && s.length === 14) return `${s.substring(0,4)}-${s.substring(4,6)}-${s.substring(6,8)}T${s.substring(8,10)}:${s.substring(10,12)}:${s.substring(12,14)}`;
                  return m.start_time || m.date || m.dt || '';
                })(),
                status: 'finished',
                competition: m.c_name || page?.st_name || ''
              }));
            }
          } catch {}
        }

        // Load league table via team config endpoint
        let tableRows: any[] = [];
        try {
          const { getTeamConfig } = await import('@/data/teamApiConfig');
          const cfg = getTeamConfig(selectedTeam);
          const tableUrl = cfg?.leagueTable?.tableApi;
          if (tableUrl) {
            let raw: any = null;
            try {
              const res = await fetch(tableUrl, { headers: { 'Accept': 'application/json' } });
              if (res.ok) {
                raw = await res.json();
              } else {
                throw new Error(`HTTP ${res.status}`);
              }
            } catch {
              // Retry via permissive CORS proxy
              const proxied = `https://cors.isomorphic-git.org/${tableUrl}`;
              const res2 = await fetch(proxied, { headers: { 'Accept': 'application/json' } });
              raw = await res2.json();
            }
            // Try common shapes
            if (raw?.standings && Array.isArray(raw.standings)) {
              tableRows = raw.standings;
            } else if (raw?.data?.standings && Array.isArray(raw.data.standings)) {
              tableRows = raw.data.standings;
            } else if (Array.isArray(raw)) {
              // Some endpoints may return array of groups with table inside
              const rows: any[] = [];
              for (const g of raw) {
                if (g?.standings && Array.isArray(g.standings)) rows.push(...g.standings);
                if (g?.table && Array.isArray(g.table)) rows.push(...g.table);
              }
              tableRows = rows;
            }
          }
        } catch {}

        setTeamDataBlocks({ results: nextResults, fixtures, table: tableRows });
      } catch (e) {
        setTeamDataBlocks({ results: [], fixtures: [], table: [] });
      } finally {
        setTeamBlocksLoading(false);
      }
    };
    loadTeamBlocks();
  }, [selectedTeam]);

  // Load match details (goals, cards, fouls) when opening the modal
  useEffect(() => {
    const loadMatch = async () => {
      if (!matchModal.open || !matchModal.matchId) return;
      try {
        const details = await sport365Api.getMatchDetails(matchModal.matchId);
        setMatchModal(prev => ({ ...prev, details }));
      } catch (e) {
        setMatchModal(prev => ({ ...prev, details: { error: true } }));
      }
    };
    loadMatch();
  }, [matchModal.open, matchModal.matchId]);

  // Handle team selection changes
  useEffect(() => {
    if (externalSelectedTeam !== selectedTeam) {
      setSelectedTeam(externalSelectedTeam || null);
    }
  }, [externalSelectedTeam]);

  // Filter logic for team selection page
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClubs, setFilteredClubs] = useState<string[]>(getPremierLeagueClubs());

  useEffect(() => {
    const filtered = getPremierLeagueClubs().filter(club =>
      club.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClubs(filtered);
  }, [searchTerm]);

  const getTeamStats = (teamName: string) => {
    const teamTransfers = transfers.filter(
      transfer => transfer.fromClub === teamName || transfer.toClub === teamName
    );

    const transfersIn = teamTransfers.filter(t => 
      t.toClub === teamName && t.status !== 'rumored'
    ).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const transfersOut = teamTransfers.filter(t => 
      t.fromClub === teamName && t.status !== 'rumored'
    ).sort((a, b) => 
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
                className="text-blue-300 hover:text-blue-200 border-gray-600 hover:border-gray-500"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </div>
          </div>
          
          <div className="px-6 pb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
              {selectedTeam}
              <img
                src={clubBadgeMap[selectedTeam] || `/badges/${selectedTeam.toLowerCase().replace(/[^a-z]/g, '')}.png`}
                alt={`${selectedTeam} badge`}
                className="w-8 h-8 rounded-full shadow bg-white object-contain border border-gray-200"
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </h2>
            {!!selectedTeam && getSport365Id?.(selectedTeam) && (
              <div className="mt-1 mb-3 flex items-center gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => setTeamStripTab('results')}
                  className={`uppercase tracking-wide ${teamStripTab === 'results' ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'} `}
                >
                  Results
                </button>
                <span className="text-slate-500">•</span>
                <button
                  type="button"
                  onClick={() => setTeamStripTab('fixtures')}
                  className={`uppercase tracking-wide ${teamStripTab === 'fixtures' ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'} `}
                >
                  Fixtures
                </button>
                <span className="text-slate-500">•</span>
                <button
                  type="button"
                  onClick={() => setTeamStripTab('tables')}
                  className={`uppercase tracking-wide ${teamStripTab === 'tables' ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'} `}
                >
                  Tables
                </button>
                <span className="text-slate-500">•</span>
                <button
                  type="button"
                  onClick={() => setTeamStripTab('topscorer')}
                  className={`uppercase tracking-wide ${teamStripTab === 'topscorer' ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'} `}
                >
                  Top Goal Scorer
                </button>
              </div>
            )}
            {!!selectedTeam && getSport365Id?.(selectedTeam) && (
              <Card className="bg-slate-800/40 border-slate-700/60 mb-4">
                <div className="p-4">
                  {teamStripTab === 'results' && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-semibold">Recent Results</h4>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-blue-300 border-slate-600 hover:border-slate-500"
                          onClick={() => {
                            setSelectedTeam(null);
                            onBack?.();
                          }}
                        >
                          Back
                        </Button>
                      </div>
                      {teamBlocksLoading && <p className="text-slate-300 text-sm">Loading...</p>}
                      {!teamBlocksLoading && teamDataBlocks.results.length === 0 && (
                        <p className="text-slate-300 text-sm">No recent results found.</p>
                      )}
                      {!teamBlocksLoading && teamDataBlocks.results.length > 0 && (
                        <p className="text-slate-400 text-xs mb-2">Showing {teamDataBlocks.results.length} results</p>
                      )}
                      <div className="space-y-2">
                        {teamDataBlocks.results.map((m: any, idx: number) => {
                          const home = m.homeTeam || m.home?.name || m.hn || m.home || 'Home';
                          const away = m.awayTeam || m.away?.name || m.an || m.away || 'Away';
                          const score = (typeof m.homeScore === 'number' && typeof m.awayScore === 'number') ? `${m.homeScore}–${m.awayScore}` : (m.score || m.ft || '');
                          const date = m.date || m.dt || '';
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setMatchModal({ open: true, matchId: m.id || m.mid })}
                              className="w-full text-left bg-slate-700/40 hover:bg-slate-700/70 transition-colors rounded px-3 py-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="text-slate-200 text-sm">
                                  {home} {score} {away}
                                </div>
                                <div className="text-slate-400 text-xs">
                                  {date}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {teamStripTab === 'fixtures' && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-semibold">Upcoming Fixtures</h4>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-blue-300 border-slate-600 hover:border-slate-500"
                          onClick={() => {
                            setSelectedTeam(null);
                            onBack?.();
                          }}
                        >
                          Back
                        </Button>
                      </div>
                      {teamBlocksLoading && <p className="text-slate-300 text-sm">Loading...</p>}
                      {!teamBlocksLoading && teamDataBlocks.fixtures.length === 0 && (
                        <p className="text-slate-300 text-sm">No upcoming fixtures found.</p>
                      )}
                      <div className="space-y-2">
                        {teamDataBlocks.fixtures.map((m: any, idx: number) => {
                          const home = m.homeTeam || m.home?.name || m.hn || m.home || 'Home';
                          const away = m.awayTeam || m.away?.name || m.an || m.away || 'Away';
                          const date = m.date || m.dt || '';
                          return (
                            <div key={idx} className="w-full text-left bg-slate-700/40 rounded px-3 py-2">
                              <div className="flex items-center justify-between">
                                <div className="text-slate-200 text-sm">
                                  {home} vs {away}
                                </div>
                                <div className="text-slate-400 text-xs">
                                  {date}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {teamStripTab === 'tables' && (
                    <div>
                      {(() => {
                        const teamConfig = getTeamConfig(selectedTeam || '');
                        if (teamConfig?.leagueTable?.tableApi) {
                          return (
                            <LeagueTable 
                              tableApiUrl={teamConfig.leagueTable.tableApi}
                              selectedTeam={selectedTeam || undefined}
                              leagueName={teamConfig.leagueTable.leagueName}
                            />
                          );
                        }
                        return (
                          <div className="text-slate-300 text-sm">
                            {teamBlocksLoading ? 'Loading...' : 'No table data available.'}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  {teamStripTab === 'topscorer' && (
                    <div className="flex flex-col w-full">
                      <div className="flex items-center justify-between mb-3 w-full">
                        <h4 className="text-white font-semibold text-lg">Top Goal Scorers</h4>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-blue-300 border-slate-600 hover:border-slate-500"
                          onClick={() => {
                            setSelectedTeam(null);
                            onBack?.();
                          }}
                        >
                          Back
                        </Button>
                      </div>
                      <div className="w-full max-w-lg mx-auto">
                        <TopScorersVisualization scorers={topScorers} />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
            {/* Show current spend for this club */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-green-400 font-bold text-lg">
                £{(clubSpendMap[selectedTeam] || 0).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
              </span>
              <span className="text-gray-400 text-sm">Current Spend</span>
            </div>
          </div>
        </Card>

        {/* Squad Wage Carousel */}
        <SquadWageCarousel club={selectedTeam} />

        {/* Media Hub will be shown under Latest Transfer News */}

        {/* Removed Latest Transfer News; Media Hub below uses Crowdy/SB Live */}

        {/* Media Hub */}
        {teamData?.mediaHub && teamData.mediaHub.filter(item => item.image).length > 0 && (
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-purple-400" />
                Media Hub ({teamData.mediaHub.filter(item => item.image).length})
              </h3>
              <div className="relative">
                <div 
                  className="media-hub-scroll flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 pb-4"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {teamData.mediaHub
                    .filter(item => item.image) // Only show items with images
                    .map((item, index) => (
                    <div key={`${item.id || index}`} className="flex-none w-80">
                      <Card 
                        className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 transition-all duration-200 overflow-hidden h-full cursor-pointer"
                        onClick={async () => {
                          setMediaHubModal({ open: true, item, loading: item.source === 'Crowdy News' && item.url ? true : false, content: undefined });
                          
                          // If it's a Crowdy News item, try to fetch the content
                          if (item.source === 'Crowdy News' && item.url) {
                            try {
                              // Try multiple CORS proxies
                              const proxies = [
                                `https://api.allorigins.win/get?url=${encodeURIComponent(item.url)}`,
                                `https://corsproxy.io/?${encodeURIComponent(item.url)}`,
                                `https://cors.isomorphic-git.org/${item.url}`
                              ];
                              
                              let content = null;
                              for (const proxyUrl of proxies) {
                                try {
                                  const response = await fetch(proxyUrl);
                                  const data = await response.text();
                                  
                                  // Handle allorigins.win format
                                  if (proxyUrl.includes('allorigins.win')) {
                                    const json = JSON.parse(data);
                                    content = json.contents || json.content || data;
                                  } else {
                                    content = data;
                                  }
                                  
                                  if (content && content.length > 100) {
                                    // Extract main content from HTML
                                    const parser = new DOMParser();
                                    const doc = parser.parseFromString(content, 'text/html');
                                    
                                    // Remove scripts, styles, and other unwanted elements
                                    const scripts = doc.querySelectorAll('script, style, nav, header, footer, aside, .ad, .advertisement, [class*="ad-"], [id*="ad-"]');
                                    scripts.forEach(el => el.remove());
                                    
                                    // Try to find main content
                                    const mainContent = doc.querySelector('main, article, [role="main"], .content, .post-content, .article-content, .entry-content') || doc.body;
                                    
                                    // Clean up the content
                                    const cleanedContent = mainContent.innerHTML
                                      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                                      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
                                    
                                    setMediaHubModal(prev => ({ ...prev, content: cleanedContent, loading: false }));
                                    break;
                                  }
                                } catch (err) {
                                  console.error('Proxy failed:', proxyUrl, err);
                                  continue;
                                }
                              }
                              
                              if (!content) {
                                setMediaHubModal(prev => ({ ...prev, loading: false }));
                              }
                            } catch (error) {
                              console.error('Error fetching Crowdy News content:', error);
                              setMediaHubModal(prev => ({ ...prev, loading: false }));
                            }
                          }
                        }}
                      >
                        <div className="flex flex-col h-full">
                          {/* Thumbnail Image */}
                          <div className="w-full h-32 flex-shrink-0 relative">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.title || 'Media Item'}
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
                            {(item.videoUrl || item.url) && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                                  <svg className="w-6 h-6 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 p-4">
                            {/* Only show badge for SB Live, hide for Crowdy News */}
                            {item.source === 'SB Live' && (
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-purple-500 text-white">
                                  {item.source}
                                </Badge>
                              </div>
                            )}
                            
                            <h4 className="text-white font-semibold text-sm leading-tight mb-2 line-clamp-3">
                              {item.title || 'Untitled'}
                            </h4>
                            
                            {item.summary && (
                              <p className="text-gray-300 text-xs line-clamp-2 mb-3">
                                {item.summary}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between mt-auto">
                              <div className="flex items-center gap-1 text-gray-400 text-xs">
                                <Clock className="w-3 h-3" />
                                Media
                              </div>
                              <div className="text-purple-400 text-xs">
                                Click to view
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
                
                {/* Show More Button */}
                {teamData.mediaHub.filter(item => item.image).length > 5 && (
                  <div className="flex justify-center mt-4">
                    <Button
                      onClick={() => {
                        const container = document.querySelector('.media-hub-scroll') as HTMLElement;
                        if (container) {
                          container.scrollLeft += 1280; // Scroll by 4 cards (320px each)
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
                    >
                      Show More ({teamData.mediaHub.filter(item => item.image).length - 5} more)
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Match Details Modal (goal scorers, cards, etc.) */}
        {matchModal.open && (
          <Dialog open={matchModal.open} onOpenChange={(open) => setMatchModal((prev) => ({ open, matchId: open ? prev.matchId : undefined, details: open ? prev.details : undefined }))}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden">
              <div className="px-4 py-3 bg-slate-900 text-white border-b border-slate-700 flex items-center justify-between">
                <div className="font-semibold">Match Details</div>
                <UIButton
                  variant="outline"
                  size="sm"
                  className="border-slate-500 text-slate-200 hover:bg-slate-700 hover:text-white"
                  onClick={() => setMatchModal({ open: false })}
                >
                  Close
                </UIButton>
              </div>
              <div className="p-4 text-sm text-slate-100">
                {!matchModal.details && <p>Loading match data...</p>}
                {matchModal.details && matchModal.details.error && (
                  <p>Unable to load match details.</p>
                )}
                {matchModal.details && !matchModal.details.error && (
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-semibold mb-2">Score</h5>
                      <p>{matchModal.details?.home?.name || matchModal.details?.hn} {matchModal.details?.score || matchModal.details?.ft || ''} {matchModal.details?.away?.name || matchModal.details?.an}</p>
                    </div>
                    {!!(matchModal.details?.events || []).length && (
                      <div>
                        <h5 className="font-semibold mb-2">Events</h5>
                        <ul className="list-disc pl-5 space-y-1">
                          {(matchModal.details.events || []).map((ev: any, i: number) => (
                            <li key={i} className="text-slate-200">
                              {ev.minute || ev.min || ''}' - {ev.type || ev.ev || ''} - {ev.player || ev.pn || ''} {ev.detail ? `(${ev.detail})` : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {!!(matchModal.details?.cards || []).length && (
                      <div>
                        <h5 className="font-semibold mb-2">Cards</h5>
                        <ul className="list-disc pl-5 space-y-1">
                          {(matchModal.details.cards || []).map((c: any, i: number) => (
                            <li key={i} className="text-slate-200">
                              {c.minute || ''}' - {c.color || c.type || ''} - {c.player || ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {!!(matchModal.details?.scorers || []).length && (
                      <div>
                        <h5 className="font-semibold mb-2">Scorers</h5>
                        <ul className="list-disc pl-5 space-y-1">
                          {(matchModal.details.scorers || []).map((s: any, i: number) => (
                            <li key={i} className="text-slate-200">
                              {s.minute || ''}' - {s.player || ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* YouTube Channel */}
        {getTeamYoutubeUrl(selectedTeam) && (
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-red-400" />
                Official YouTube Channel {youtubeVideos.length > 0 && `(${youtubeVideos.length} videos)`}
              </h3>
              <div className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 pb-4">
                {/* YouTube Channel Link Card */}
                <div className="flex-none w-80">
                  <Card className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 transition-all duration-200 overflow-hidden h-full">
                    <div className="flex flex-col h-full">
                      {/* YouTube Thumbnail */}
                      <div className="w-full h-32 flex-shrink-0 bg-red-600/20 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mb-2 mx-auto">
                            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          </div>
                          <p className="text-white text-sm font-medium">YouTube Channel</p>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-red-500 text-white">
                            YouTube
                          </Badge>
                        </div>
                        
                        <h4 className="text-white font-semibold text-sm leading-tight mb-2">
                          {selectedTeam} Official Channel
                        </h4>
                        
                        <p className="text-gray-300 text-xs mb-3">
                          Watch official videos, highlights, and behind-the-scenes content
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-1 text-gray-400 text-xs">
                            <Clock className="w-3 h-3" />
                            Official
                          </div>
                          <a 
                            href={getTeamYoutubeUrl(selectedTeam)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* YouTube Videos - Show all videos */}
                {youtubeVideosLoading ? (
                  <div className="flex-none w-80">
                    <Card className="bg-slate-700/50 border-slate-600 p-4">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400 mb-2"></div>
                        <p className="text-gray-400 text-sm text-center">Loading videos...</p>
                      </div>
                    </Card>
                  </div>
                ) : youtubeVideos.length > 0 ? (
                  youtubeVideos.map((video, index) => (
                  <div key={index} className="flex-none w-80">
                    <Card className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 transition-all duration-200 overflow-hidden h-full cursor-pointer"
                      onClick={() => setYoutubeModal({ open: true, video })}
                    >
                      <div className="flex flex-col h-full">
                        {/* Video Thumbnail */}
                        <div className="w-full h-32 flex-shrink-0 relative">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/320x180/1e293b/64748b?text=Video+Thumbnail';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
                              <svg className="w-6 h-6 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-red-500 text-white">
                              Video
                            </Badge>
                          </div>
                          
                          <h4 className="text-white font-semibold text-sm leading-tight mb-2 line-clamp-2">
                            {video.title}
                          </h4>
                          
                          {video.channelTitle && (
                            <p className="text-gray-400 text-xs mb-2">
                              {video.channelTitle}
                            </p>
                          )}
                          
                          <p className="text-gray-300 text-xs mb-3 line-clamp-2">
                            {video.description}
                          </p>
                          
                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-1 text-gray-400 text-xs">
                              <Clock className="w-3 h-3" />
                              {video.duration}
                            </div>
                            <div className="flex items-center gap-1 text-gray-400 text-xs">
                              <span>Click to play</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                  ))
                ) : (
                  <div className="flex-none w-80">
                    <Card className="bg-slate-700/50 border-slate-600 p-4">
                      <p className="text-gray-400 text-sm text-center">No videos available</p>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Global YouTube Modal Webview with Back */}
        {youtubeModal.open && youtubeModal.video && (
          <Dialog open={youtubeModal.open} onOpenChange={(open) => setYoutubeModal((prev) => ({ open, video: open ? prev.video : undefined }))}>
            <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 text-white border-b border-slate-700">
                <div className="font-semibold truncate pr-2">{youtubeModal.video.title}</div>
                <div className="flex items-center gap-2">
                  <UIButton
                    variant="outline"
                    size="sm"
                    className="border-slate-500 text-slate-200 hover:bg-slate-700 hover:text-white flex items-center gap-2"
                    onClick={() => setYoutubeModal({ open: false })}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Dismiss
                  </UIButton>
                </div>
              </div>
              <iframe
                src={youtubeModal.video.embedUrl}
                title={youtubeModal.video.title}
                className="w-full h-[calc(85vh-42px)]"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Media Hub Modal */}
        {mediaHubModal.open && mediaHubModal.item && (
          <Dialog open={mediaHubModal.open} onOpenChange={(open) => setMediaHubModal((prev) => ({ open, item: open ? prev.item : undefined }))}>
            <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 text-white border-b border-slate-700">
                <div className="font-semibold truncate pr-2">{mediaHubModal.item.title || 'Media Item'}</div>
                <div className="flex items-center gap-2">
                  <UIButton
                    variant="outline"
                    size="sm"
                    className="border-slate-500 text-slate-200 hover:bg-slate-700 hover:text-white flex items-center gap-2"
                    onClick={() => setMediaHubModal({ open: false })}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Dismiss
                  </UIButton>
                </div>
              </div>
              <div className="w-full h-[calc(85vh-42px)] overflow-auto bg-slate-900">
                {mediaHubModal.item.videoUrl ? (
                  // Video content
                  <div className="w-full h-full flex flex-col">
                    <div className="flex-1 flex items-center justify-center bg-black">
                      <video
                        src={mediaHubModal.item.videoUrl}
                        controls
                        className="w-full h-full max-h-full object-contain"
                        autoPlay
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    {(mediaHubModal.item.title || mediaHubModal.item.summary) && (
                      <div className="p-4 bg-slate-800 border-t border-slate-700">
                        {mediaHubModal.item.title && (
                          <h3 className="text-white font-semibold text-lg mb-2">{mediaHubModal.item.title}</h3>
                        )}
                        {mediaHubModal.item.summary && (
                          <p className="text-gray-300 text-sm">{mediaHubModal.item.summary}</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : mediaHubModal.item.url ? (
                  // Article/URL content
                  mediaHubModal.item.source === 'Crowdy News' ? (
                    // Crowdy News items - fetch and display content in modal
                    mediaHubModal.loading ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
                          <p className="text-gray-300">Loading article...</p>
                        </div>
                      </div>
                    ) : mediaHubModal.content ? (
                      // Display fetched content
                      <div className="w-full h-full p-6 overflow-auto">
                        <div 
                          className="prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: mediaHubModal.content }}
                          style={{
                            color: '#e2e8f0',
                          }}
                          onClick={(e) => {
                            // Handle links within the content
                            const target = e.target as HTMLElement;
                            if (target.tagName === 'A' && target.getAttribute('href')) {
                              e.preventDefault();
                              const href = target.getAttribute('href');
                              if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
                                // Open external links in new tab
                                window.open(href, '_blank', 'noopener,noreferrer');
                              }
                            }
                          }}
                        />
                        <style>{`
                          .prose a {
                            color: #60a5fa;
                            text-decoration: underline;
                          }
                          .prose a:hover {
                            color: #93c5fd;
                          }
                          .prose img {
                            max-width: 100%;
                            height: auto;
                            border-radius: 0.5rem;
                          }
                          .prose iframe {
                            max-width: 100%;
                            height: auto;
                            aspect-ratio: 16 / 9;
                          }
                          .prose video {
                            max-width: 100%;
                            height: auto;
                          }
                          .prose table {
                            width: 100%;
                            display: block;
                            overflow-x: auto;
                          }
                        `}</style>
                      </div>
                    ) : (
                      // Fallback preview
                      <div className="w-full h-full flex flex-col items-center justify-center p-6">
                        {mediaHubModal.item.image && (
                          <img
                            src={mediaHubModal.item.image}
                            alt={mediaHubModal.item.title || 'Media Item'}
                            className="w-full max-w-2xl max-h-96 object-contain mb-6 rounded"
                          />
                        )}
                        {mediaHubModal.item.title && (
                          <h3 className="text-white font-semibold text-2xl mb-4 text-center">{mediaHubModal.item.title}</h3>
                        )}
                        {mediaHubModal.item.summary && (
                          <p className="text-gray-300 text-base leading-relaxed mb-6 max-w-2xl text-center">{mediaHubModal.item.summary}</p>
                        )}
                        <p className="text-gray-400 text-sm mb-4">Unable to load full article content.</p>
                        <UIButton
                          onClick={() => {
                            window.open(mediaHubModal.item.url, '_blank', 'noopener,noreferrer');
                          }}
                          variant="outline"
                          className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open in New Tab
                        </UIButton>
                      </div>
                    )
                  ) : (
                    // SB Live items - display in iframe
                    <iframe
                      src={mediaHubModal.item.url}
                      title={mediaHubModal.item.title || 'Media Item'}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      onError={() => {
                        // If iframe fails, show fallback
                        console.error('Failed to load iframe');
                      }}
                    />
                  )
                ) : (
                  // Fallback: show image and text
                  <div className="p-6">
                    {mediaHubModal.item.image && (
                      <img
                        src={mediaHubModal.item.image}
                        alt={mediaHubModal.item.title || 'Media Item'}
                        className="w-full max-h-96 object-contain mb-4 rounded"
                      />
                    )}
                    {mediaHubModal.item.title && (
                      <h3 className="text-white font-semibold text-xl mb-3">{mediaHubModal.item.title}</h3>
                    )}
                    {mediaHubModal.item.summary && (
                      <p className="text-gray-300 text-base leading-relaxed whitespace-pre-wrap">{mediaHubModal.item.summary}</p>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

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

        {/* Transfers Section - Side by Side */}
        {((transfersIn.length > 0 || (teamData?.transfers && teamData.transfers.length > 0) || (teamData?.doneDeals && teamData.doneDeals.some(t => t.toClub === selectedTeam))) ||
          (transfersOut.length > 0 || (teamData?.transfers && teamData.transfers.length > 0) || (teamData?.doneDeals && teamData.doneDeals.some(t => t.fromClub === selectedTeam))) ||
          (rumors.length > 0 || (teamData?.rumours && teamData.rumours.length > 0))) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Done Deals - Only INCOMING transfers (toClub === selectedTeam) */}
            {(transfersIn.length > 0 || (teamData?.transfers && teamData.transfers.length > 0) || (teamData?.doneDeals && teamData.doneDeals.some(t => t.toClub === selectedTeam))) && (
              <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      Done Deals ({(() => {
                        // Only include INCOMING transfers (toClub === selectedTeam)
                        const allSignings = [
                          ...transfersIn,
                          ...(teamData?.transfers?.filter(t => t.status === 'confirmed' && t.toClub === selectedTeam) || [])
                        ];
                        // Filter doneDeals to only include incoming transfers
                        const incomingDoneDeals = (teamData?.doneDeals || []).filter(t => t.toClub === selectedTeam);
                        const combined = [...allSignings, ...incomingDoneDeals];
                        // Remove duplicates based on player name and toClub
                        const unique = combined.filter((transfer, index, self) => 
                          index === self.findIndex(t => t.playerName === transfer.playerName && t.toClub === transfer.toClub)
                        );
                        return unique.length;
                      })()})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {(() => {
                      // Only include INCOMING transfers (toClub === selectedTeam)
                      const allSignings = [
                        ...transfersIn,
                        ...(teamData?.transfers?.filter(t => t.status === 'confirmed' && t.toClub === selectedTeam) || [])
                      ];
                      // Filter doneDeals to only include incoming transfers
                      const incomingDoneDeals = (teamData?.doneDeals || []).filter(t => t.toClub === selectedTeam);
                      const combined = [...allSignings, ...incomingDoneDeals];
                      // Remove duplicates based on player name and toClub
                      const uniqueDoneDeals = combined.filter((transfer, index, self) => 
                        index === self.findIndex(t => t.playerName === transfer.playerName && t.toClub === transfer.toClub)
                      );
                      const displayDoneDeals = expandedSections.doneDeals ? uniqueDoneDeals : uniqueDoneDeals.slice(0, 5);
                      return (
                        <>
                          {displayDoneDeals.map((transfer) => (
                            <TransferCard key={transfer.id} transfer={transfer} />
                          ))}
                          {uniqueDoneDeals.length > 5 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedSections(prev => ({ ...prev, doneDeals: !prev.doneDeals }))}
                              className="w-full text-gray-400 hover:text-white mt-2"
                            >
                              {expandedSections.doneDeals ? (
                                <>
                                  <ChevronUp className="w-4 h-4 mr-1" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4 mr-1" />
                                  Show More ({uniqueDoneDeals.length - 5})
                                </>
                              )}
                            </Button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </Card>
            )}

            {/* Departures - Only OUTGOING transfers (fromClub === selectedTeam) */}
            {(transfersOut.length > 0 || (teamData?.transfers && teamData.transfers.length > 0) || (teamData?.doneDeals && teamData.doneDeals.some(t => t.fromClub === selectedTeam))) && (
              <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-red-400" />
                      Departures ({(() => {
                        const allDepartures = [
                          ...transfersOut,
                          ...(teamData?.transfers?.filter(t => t.status === 'confirmed' && t.fromClub === selectedTeam) || [])
                        ];
                        // Filter doneDeals to only include outgoing transfers
                        const outgoingDoneDeals = (teamData?.doneDeals || []).filter(t => t.fromClub === selectedTeam);
                        const combined = [...allDepartures, ...outgoingDoneDeals];
                        // Deduplicate by player name
                        const unique = combined.filter((transfer, index, self) => 
                          index === self.findIndex(t => t.playerName === transfer.playerName && t.fromClub === transfer.fromClub)
                        );
                        return unique.length;
                      })()})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {(() => {
                      const allDepartures = [
                        ...transfersOut,
                        ...(teamData?.transfers?.filter(t => t.status === 'confirmed' && t.fromClub === selectedTeam) || [])
                      ];
                      // Filter doneDeals to only include outgoing transfers
                      const outgoingDoneDeals = (teamData?.doneDeals || []).filter(t => t.fromClub === selectedTeam);
                      const combined = [...allDepartures, ...outgoingDoneDeals];
                      // Remove duplicates based on player name and fromClub
                      const uniqueDepartures = combined.filter((transfer, index, self) => 
                        index === self.findIndex(t => t.playerName === transfer.playerName && t.fromClub === transfer.fromClub)
                      );
                      const displayDepartures = expandedSections.departures ? uniqueDepartures : uniqueDepartures.slice(0, 5);
                      return (
                        <>
                          {displayDepartures.map((transfer) => (
                            <TransferCard key={transfer.id} transfer={transfer} />
                          ))}
                          {uniqueDepartures.length > 5 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedSections(prev => ({ ...prev, departures: !prev.departures }))}
                              className="w-full text-gray-400 hover:text-white mt-2"
                            >
                              {expandedSections.departures ? (
                                <>
                                  <ChevronUp className="w-4 h-4 mr-1" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4 mr-1" />
                                  Show More ({uniqueDepartures.length - 5})
                                </>
                              )}
                            </Button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </Card>
            )}

            {/* Transfer Rumours */}
            {(rumors.length > 0 || (teamData?.rumours && teamData.rumours.length > 0)) && (
              <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-blue-400" />
                      Transfer Rumours ({(() => {
                        const allRumours = [
                          ...rumors,
                          ...(teamData?.rumours || [])
                        ];
                        // Deduplicate by player name and clubs
                        const unique = allRumours.filter((transfer, index, self) => 
                          index === self.findIndex(t => 
                            t.playerName === transfer.playerName && 
                            t.fromClub === transfer.fromClub && 
                            t.toClub === transfer.toClub
                          )
                        );
                        return unique.length;
                      })()})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {(() => {
                      const allRumours = [
                        ...rumors,
                        ...(teamData?.rumours || [])
                      ];
                      // Remove duplicates based on player name and clubs
                      const uniqueRumours = allRumours.filter((transfer, index, self) => 
                        index === self.findIndex(t => 
                          t.playerName === transfer.playerName && 
                          t.fromClub === transfer.fromClub && 
                          t.toClub === transfer.toClub
                        )
                      );
                      const displayRumours = expandedSections.rumours ? uniqueRumours : uniqueRumours.slice(0, 5);
                      return (
                        <>
                          {displayRumours.map((transfer) => (
                            <TransferCard key={transfer.id} transfer={transfer} />
                          ))}
                          {uniqueRumours.length > 5 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedSections(prev => ({ ...prev, rumours: !prev.rumours }))}
                              className="w-full text-gray-400 hover:text-white mt-2"
                            >
                              {expandedSections.rumours ? (
                                <>
                                  <ChevronUp className="w-4 h-4 mr-1" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4 mr-1" />
                                  Show More ({uniqueRumours.length - 5})
                                </>
                              )}
                            </Button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </Card>
            )}
          </div>
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

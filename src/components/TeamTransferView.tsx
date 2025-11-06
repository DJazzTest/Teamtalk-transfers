import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Search, TrendingUp, TrendingDown, MessageCircle, Users, ExternalLink, Clock, Home } from 'lucide-react';
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
  const [youtubeModal, setYoutubeModal] = useState<{ open: boolean; video?: YouTubeVideo }>(() => ({ open: false }));
  const [teamStripTab, setTeamStripTab] = useState<'results' | 'fixtures' | 'tables'>('results');
  const [teamDataBlocks, setTeamDataBlocks] = useState<{
    results: any[];
    fixtures: any[];
    table: any[];
  }>({ results: [], fixtures: [], table: [] });
  const [teamBlocksLoading, setTeamBlocksLoading] = useState<boolean>(false);
  const [matchModal, setMatchModal] = useState<{ open: boolean; matchId?: string; details?: any }>({ open: false });
  const [dataLoading, setDataLoading] = useState(false);

  // Fetch comprehensive team data when team is selected
  useEffect(() => {
    const fetchTeamData = async () => {
      if (!selectedTeam) return;
      
      setDataLoading(true);
      try {
        const [teamDataResult, youtubeVideosResult] = await Promise.allSettled([
          teamDataService.getTeamData(selectedTeam),
          youtubeApi.getTeamVideos(selectedTeam, 5)
        ]);
        
        if (teamDataResult.status === 'fulfilled') {
          setTeamData(teamDataResult.value);
        }
        
        if (youtubeVideosResult.status === 'fulfilled') {
          setYoutubeVideos(youtubeVideosResult.value);
        }
      } catch (error) {
        console.error('Error fetching team data:', error);
        setTeamData(null);
        setYoutubeVideos([]);
      } finally {
        setDataLoading(false);
      }
    };

    fetchTeamData();
  }, [selectedTeam]);

  // Fetch selected team blocks (results, fixtures, tables) from Sport365
  useEffect(() => {
    const loadTeamBlocks = async () => {
      if (!selectedTeam) return;
      let teamId = getSport365Id?.(selectedTeam);
      // Hard fallback mapping for Leeds
      if (!teamId) {
        const sel = (selectedTeam || '').toLowerCase();
        if (sel.includes('leeds')) teamId = '1-5254';
      }
      // Fallback: search API if mapping missing
      if (!teamId) {
        try {
          const found = await sport365Api.searchTeams?.(selectedTeam);
          const hit = Array.isArray(found?.data) ? found.data.find((t: any) => (t.name || t.tn || '').toString().toLowerCase().includes(selectedTeam.toLowerCase().replace(/\s+/g, ' '))) : undefined;
          if (hit?.id) teamId = hit.id;
        } catch {}
      }
      if (!teamId) return;
      setTeamBlocksLoading(true);
      try {
        const teamPage = await sport365Api.getTeamPage(teamId);
        const all = (teamPage?.matches || teamPage?.recentMatches || teamPage?.upcomingMatches || []).filter(Boolean);
        const teamOnly = all.filter((m: any) => {
          const home = (m.home?.name || m.hn || m.home || '').toString().toLowerCase();
          const away = (m.away?.name || m.an || m.away || '').toString().toLowerCase();
          const normalized = (normalizeTeamName?.(selectedTeam || '') || selectedTeam || '').toLowerCase();
          const base = normalized.replace(/[^a-z\s-]/g, ' ').replace(/\s+/g, ' ').trim();
          const parts = Array.from(new Set([base, ...base.split(' '), (base.includes('leeds') ? 'leeds' : ''), (base.includes('utd') ? 'utd' : ''), (base.includes('united') ? 'united' : '')].filter(Boolean)));
          return parts.some(p => home.includes(p) || away.includes(p));
        });
        const results = teamOnly.filter((m: any) => (m.status || m.st || '').toString().toLowerCase().includes('fin') || m.ft);
        const fixtures = teamOnly.filter((m: any) => !((m.status || m.st || '').toString().toLowerCase().includes('fin')) && !m.ft);
        let table: any[] = [];
        const stageId = teamPage?.stageId || teamPage?.st_id || teamPage?.league?.st_id;
        if (stageId && sport365Api.getStageDetails) {
          const stage = await sport365Api.getStageDetails(stageId);
          table = stage?.standings || stage?.data?.standings || [];
        }
        let nextResults = results?.slice(0, 10) || [];
        let nextFixtures = fixtures?.slice(0, 10) || [];

        // Fallback: query date-range endpoints if empty
        if (nextResults.length === 0 || nextFixtures.length === 0) {
          const now = new Date();
          const iso = (d: Date) => d.toISOString().slice(0, 19); // YYYY-MM-DDTHH:mm:ss
          // Past 60 days for results
          if (nextResults.length === 0) {
            const fromPast = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
            try {
              const urlPast = `https://api.sport365.com/v1/en/matches/soccer/from/${iso(fromPast)}/to/${iso(now)}`;
              const res = await fetch(urlPast);
              const data: any[] = await res.json();
              const filtered = (Array.isArray(data) ? data : []).filter((m: any) => {
                const home = (m.home?.name || m.hn || m.home || '').toString().toLowerCase();
                const away = (m.away?.name || m.an || m.away || '').toString().toLowerCase();
                const normalized = (normalizeTeamName?.(selectedTeam || '') || selectedTeam || '').toLowerCase();
                const base = normalized.replace(/[^a-z\s-]/g, ' ').replace(/\s+/g, ' ').trim();
                const tokens = Array.from(new Set([base, ...base.split(' '), 'leeds', 'united', 'utd']));
                const finished = (m.status || m.st || '').toString().toLowerCase().includes('fin') || m.ft;
                return finished && tokens.some(t => home.includes(t) || away.includes(t));
              });
              nextResults = filtered.slice(0, 10);
            } catch {}
          }
          // Next 60 days for fixtures
          if (nextFixtures.length === 0) {
            const toFuture = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
            try {
              const urlFuture = `https://api.sport365.com/v1/en/matches/soccer/from/${iso(now)}/to/${iso(toFuture)}`;
              const res = await fetch(urlFuture);
              const data: any[] = await res.json();
              const filtered = (Array.isArray(data) ? data : []).filter((m: any) => {
                const home = (m.home?.name || m.hn || m.home || '').toString().toLowerCase();
                const away = (m.away?.name || m.an || m.away || '').toString().toLowerCase();
                const normalized = (normalizeTeamName?.(selectedTeam || '') || selectedTeam || '').toLowerCase();
                const base = normalized.replace(/[^a-z\s-]/g, ' ').replace(/\s+/g, ' ').trim();
                const tokens = Array.from(new Set([base, ...base.split(' '), 'leeds', 'united', 'utd']));
                const finished = (m.status || m.st || '').toString().toLowerCase().includes('fin') || m.ft;
                return !finished && tokens.some(t => home.includes(t) || away.includes(t));
              });
              nextFixtures = filtered.slice(0, 10);
            } catch {}
          }
        }

        setTeamDataBlocks({ results: nextResults, fixtures: nextFixtures, table });
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
              </div>
            )}
            {!!selectedTeam && getSport365Id?.(selectedTeam) && (
              <Card className="bg-slate-800/40 border-slate-700/60 mb-4">
                <div className="p-4">
                  {teamStripTab === 'results' && (
                    <div>
                      <h4 className="text-white font-semibold mb-3">Recent Results</h4>
                      {teamBlocksLoading && <p className="text-slate-300 text-sm">Loading...</p>}
                      {!teamBlocksLoading && teamDataBlocks.results.length === 0 && (
                        <p className="text-slate-300 text-sm">No recent results found.</p>
                      )}
                      <div className="space-y-2">
                        {teamDataBlocks.results.map((m: any, idx: number) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setMatchModal({ open: true, matchId: m.id || m.mid })}
                            className="w-full text-left bg-slate-700/40 hover:bg-slate-700/70 transition-colors rounded px-3 py-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-slate-200 text-sm">
                                {(m.home?.name || m.hn || m.home) || 'Home'} {m.score ? m.score : m.ft ? m.ft : ''} {(m.away?.name || m.an || m.away) || 'Away'}
                              </div>
                              <div className="text-slate-400 text-xs">
                                {m.date || m.dt || ''}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {teamStripTab === 'fixtures' && (
                    <div>
                      <h4 className="text-white font-semibold mb-3">Upcoming Fixtures</h4>
                      {teamBlocksLoading && <p className="text-slate-300 text-sm">Loading...</p>}
                      {!teamBlocksLoading && teamDataBlocks.fixtures.length === 0 && (
                        <p className="text-slate-300 text-sm">No upcoming fixtures found.</p>
                      )}
                      <div className="space-y-2">
                        {teamDataBlocks.fixtures.map((m: any, idx: number) => (
                          <div key={idx} className="w-full text-left bg-slate-700/40 rounded px-3 py-2">
                            <div className="flex items-center justify-between">
                              <div className="text-slate-200 text-sm">
                                {(m.home?.name || m.hn || m.home) || 'Home'} vs {(m.away?.name || m.an || m.away) || 'Away'}
                              </div>
                              <div className="text-slate-400 text-xs">
                                {m.date || m.dt || ''}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {teamStripTab === 'tables' && (
                    <div>
                      <h4 className="text-white font-semibold mb-3">League Table</h4>
                      {teamBlocksLoading && <p className="text-slate-300 text-sm">Loading...</p>}
                      {!teamBlocksLoading && (!teamDataBlocks.table || teamDataBlocks.table.length === 0) && (
                        <p className="text-slate-300 text-sm">No table data available.</p>
                      )}
                      {!!teamDataBlocks.table && teamDataBlocks.table.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm text-slate-200">
                            <thead className="text-slate-400">
                              <tr>
                                <th className="py-2 pr-2">#</th>
                                <th className="py-2 pr-4">Team</th>
                                <th className="py-2 pr-2">P</th>
                                <th className="py-2 pr-2">W</th>
                                <th className="py-2 pr-2">D</th>
                                <th className="py-2 pr-2">L</th>
                                <th className="py-2 pr-2">GF</th>
                                <th className="py-2 pr-2">GA</th>
                                <th className="py-2 pr-2">GD</th>
                                <th className="py-2 pr-2">Pts</th>
                              </tr>
                            </thead>
                            <tbody>
                              {teamDataBlocks.table.map((row: any, i: number) => (
                                <tr key={i} className="border-t border-slate-700/50">
                                  <td className="py-2 pr-2">{row.rank || row.pos || row.position || i + 1}</td>
                                  <td className="py-2 pr-4">{row.team?.name || row.tn || row.team || '-'}</td>
                                  <td className="py-2 pr-2">{row.played || row.p || '-'}</td>
                                  <td className="py-2 pr-2">{row.won || row.w || '-'}</td>
                                  <td className="py-2 pr-2">{row.draw || row.d || '-'}</td>
                                  <td className="py-2 pr-2">{row.lost || row.l || '-'}</td>
                                  <td className="py-2 pr-2">{row.goalsFor || row.gf || '-'}</td>
                                  <td className="py-2 pr-2">{row.goalsAgainst || row.ga || '-'}</td>
                                  <td className="py-2 pr-2">{(row.goalsFor - row.goalsAgainst) || row.gd || '-'}</td>
                                  <td className="py-2 pr-2">{row.points || row.pts || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
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

        {/* Media Hub (Crowdy/SB Live) */}
        {teamData?.mediaHub && teamData.mediaHub.length > 0 && (
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-purple-400" />
                Media Hub ({teamData.mediaHub.length})
              </h3>
              <div className="relative">
                <div 
                  className="media-hub-scroll flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 pb-4"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {teamData.mediaHub.map((item, index) => (
                    <div key={`${item.id || index}`} className="flex-none w-80">
                      <Card className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 transition-all duration-200 overflow-hidden h-full">
                        <div className="flex flex-col h-full">
                          {/* Thumbnail Image */}
                          <div className="w-full h-32 flex-shrink-0">
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
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={
                                item.source === 'Crowdy News' ? 'bg-blue-500 text-white' :
                                item.source === 'SB Live' ? 'bg-purple-500 text-white' :
                                'bg-gray-500 text-white'
                              }>
                                {item.source || 'Media'}
                              </Badge>
                            </div>
                            
                            <h4 className="text-white font-semibold text-sm leading-tight mb-2 line-clamp-3">
                              {item.title ? (
                                <span 
                                  dangerouslySetInnerHTML={{ 
                                    __html: item.title.replace(
                                      /(https?:\/\/[^\s]+|@\w+)/g, 
                                      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>'
                                    )
                                  }} 
                                />
                              ) : 'Untitled'}
                            </h4>
                            
                            {item.summary && (
                              <p className="text-gray-300 text-xs line-clamp-2 mb-3">
                                <span 
                                  dangerouslySetInnerHTML={{ 
                                    __html: item.summary.replace(
                                      /(https?:\/\/[^\s]+|@\w+)/g, 
                                      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>'
                                    )
                                  }} 
                                />
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between mt-auto">
                              <div className="flex items-center gap-1 text-gray-400 text-xs">
                                <Clock className="w-3 h-3" />
                                Media
                              </div>
                              {(item.url || item.videoUrl) && (
                                <a 
                                  href={item.url || item.videoUrl}
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
                
                {/* Show More Button */}
                {teamData.mediaHub.length > 5 && (
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
                      Show More ({teamData.mediaHub.length - 5} more)
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
                Official YouTube Channel
              </h3>
              <div className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 pb-4">
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

                {/* YouTube Videos */}
                {youtubeVideos.map((video, index) => (
                  <div key={index} className="flex-none w-80">
                    <Card className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 transition-all duration-200 overflow-hidden h-full">
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
                          <button
                            type="button"
                            aria-label="Play video"
                            onClick={() => setYoutubeModal({ open: true, video })}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center"
                          >
                            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors">
                              <svg className="w-6 h-6 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </button>
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
                ))}
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
                    className="border-slate-500 text-slate-200 hover:bg-slate-700 hover:text-white"
                    onClick={() => setYoutubeModal({ open: false })}
                  >
                    Back
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
        {(transfersIn.length > 0 || (teamData?.transfers && teamData.transfers.length > 0)) && (
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Recent Signings ({transfersIn.length + (teamData?.transfers?.filter(t => t.status === 'confirmed' && t.toClub === selectedTeam).length || 0)})
              </h3>
              <div className="space-y-3">
                {transfersIn.map((transfer) => (
                  <TransferCard key={transfer.id} transfer={transfer} />
                ))}
                {teamData?.transfers?.filter(t => t.status === 'confirmed' && t.toClub === selectedTeam).map((transfer) => (
                  <TransferCard key={transfer.id} transfer={transfer} />
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Transfers Out */}
        {(transfersOut.length > 0 || (teamData?.transfers && teamData.transfers.length > 0)) && (
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-400" />
                Recent Departures ({transfersOut.length + (teamData?.transfers?.filter(t => t.status === 'confirmed' && t.fromClub === selectedTeam).length || 0)})
              </h3>
              <div className="space-y-3">
                {transfersOut.map((transfer) => (
                  <TransferCard key={transfer.id} transfer={transfer} />
                ))}
                {teamData?.transfers?.filter(t => t.status === 'confirmed' && t.fromClub === selectedTeam).map((transfer) => (
                  <TransferCard key={transfer.id} transfer={transfer} />
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Done Deals (live only) */}
        {(teamData?.doneDeals && teamData.doneDeals.length > 0) && (
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-purple-400" />
                Done Deals ({teamData?.doneDeals?.length || 0})
              </h3>
              <div className="space-y-3">
                {teamData?.doneDeals?.map((transfer) => (
                  <TransferCard key={transfer.id} transfer={transfer} />
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Rumours */}
        {(rumors.length > 0 || (teamData?.rumours && teamData.rumours.length > 0)) && (
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                Transfer Rumours ({rumors.length + (teamData?.rumours?.length || 0)})
              </h3>
              <div className="space-y-3">
                {rumors.map((transfer) => (
                  <TransferCard key={transfer.id} transfer={transfer} />
                ))}
                {teamData?.rumours?.map((transfer) => (
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

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Search, TrendingUp, TrendingDown, MessageCircle, Users, ExternalLink, Clock, Home, ChevronDown, ChevronUp } from 'lucide-react';
import { Transfer } from '@/types/transfer';
import { TransferCard } from './TransferCard';
import { SquadWageCarousel } from './SquadWageCarousel';
import { TeamComparisonPanel } from './TeamComparisonPanel';
import { TeamPhaseCharts } from './TeamPhaseCharts';
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
import { getTeamConfig } from '@/data/teamApiConfig';
import { teamComparisonData } from '@/data/teamComparisonStats';
import { DEFAULT_TEAM_BIOS, TeamBioEntry, TeamBioMap, sanitizeTeamBioMap } from '@/data/teamBios';
import { cn } from '@/lib/utils';

// Build a map of club -> spend from the topSpendingClubs data
const clubSpendMap: Record<string, number> = Object.fromEntries(
  topSpendingClubs.map(club => [club.club, club.spend])
);

interface TeamTransferViewProps {
  transfers: Transfer[];
  selectedTeam?: string | null;
  focusPlayerName?: string | null;
  onBack?: () => void;
}

export const TeamTransferView: React.FC<TeamTransferViewProps> = ({ transfers, selectedTeam: externalSelectedTeam, focusPlayerName, onBack }) => {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(externalSelectedTeam || null);
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [youtubeVideosLoading, setYoutubeVideosLoading] = useState(false);
  const [youtubeModal, setYoutubeModal] = useState<{ open: boolean; video?: YouTubeVideo }>(() => ({ open: false }));
  const [mediaHubModal, setMediaHubModal] = useState<{ open: boolean; item?: any; content?: string; loading?: boolean }>(() => ({ open: false, loading: false }));
  const [dataLoading, setDataLoading] = useState(false);
  const [matchModal, setMatchModal] = useState<{ open: boolean; matchId?: string; details?: any }>({ open: false });
  const [expandedSections, setExpandedSections] = useState<{
    doneDeals: boolean;
    departures: boolean;
    rumours: boolean;
  }>({
    doneDeals: false,
    departures: false,
    rumours: false,
  });
  const [teamViewTab, setTeamViewTab] = useState<'overview' | 'compare'>('overview');
  const [comparisonTeam, setComparisonTeam] = useState<string>('');
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [teamBiosData, setTeamBiosData] = useState<TeamBioMap>(DEFAULT_TEAM_BIOS);
  const [highlightedPlayer, setHighlightedPlayer] = useState<string | null>(null);
  const playerCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const registerPlayerRef = (playerName?: string) => (el: HTMLDivElement | null) => {
    if (!playerName) return;
    const key = playerName.toLowerCase();
    if (el) {
      if (!playerCardRefs.current[key]) {
        playerCardRefs.current[key] = el;
      }
    } else {
      delete playerCardRefs.current[key];
    }
  };

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

  useEffect(() => {
    setHighlightedPlayer(focusPlayerName || null);
  }, [focusPlayerName, selectedTeam]);

  useEffect(() => {
    playerCardRefs.current = {};
  }, [selectedTeam]);

  useEffect(() => {
    let isMounted = true;
    const loadTeamBios = async () => {
      try {
        const response = await fetch('/.netlify/functions/team-bios', {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) return;
        const payload = await response.json();
        if (!isMounted) return;
        const sanitized = sanitizeTeamBioMap(payload);
        if (Object.keys(sanitized).length > 0) {
          setTeamBiosData({ ...DEFAULT_TEAM_BIOS, ...sanitized });
        }
      } catch (error) {
        console.warn('Failed to load team bios data:', error);
      }
    };

    loadTeamBios();
    const handleUpdate = () => loadTeamBios();
    if (typeof window !== 'undefined') {
      window.addEventListener('teamBiosUpdated', handleUpdate);
    }
    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('teamBiosUpdated', handleUpdate);
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedTeam) {
      setComparisonTeam('');
      return;
    }
    setTeamViewTab('overview');
    const fallback = Object.keys(teamComparisonData).find(team => team !== selectedTeam) || '';
    setComparisonTeam(prev => {
      if (prev && prev !== selectedTeam && teamComparisonData[prev]) {
        return prev;
      }
      return fallback;
    });
    setIsBioExpanded(false);
  }, [selectedTeam]);

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

  const comparisonDatasetSize = Object.keys(teamComparisonData).length;
  const canCompareTeams = Boolean(
    selectedTeam && teamComparisonData[selectedTeam] && comparisonDatasetSize > 1
  );
  const tabButtonClass = (tab: 'overview' | 'compare') =>
    cn(
      'px-4 py-1 text-sm font-semibold rounded-full transition-colors',
      teamViewTab === tab
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white',
      tab === 'compare' && !canCompareTeams ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
    );

  const teamStats = selectedTeam
    ? getTeamStats(selectedTeam)
    : { transfersIn: [], transfersOut: [], rumors: [], totalActivity: 0 };
  const { transfersIn, transfersOut, rumors } = teamStats;

  useEffect(() => {
    if (!selectedTeam || !highlightedPlayer) return;
    const key = highlightedPlayer.toLowerCase();
    const target = playerCardRefs.current[key];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedPlayer, selectedTeam, transfersIn, transfersOut, rumors]);

  if (selectedTeam) {
    const currentBio: TeamBioEntry | undefined = teamBiosData[selectedTeam];

    const teamHeader = (
      <Card className="bg-white dark:bg-slate-800/50 backdrop-blur-md border-gray-200 dark:border-slate-700">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedTeam(null);
                onBack?.();
              }}
              className="text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
        </div>

        <div className="px-6 pb-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedTeam}</h2>
            <div className="flex items-center rounded-full bg-gray-100 dark:bg-slate-900/60 border border-gray-300 dark:border-slate-700 p-1">
              <button
                type="button"
                onClick={() => setTeamViewTab('overview')}
                className={tabButtonClass('overview')}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => {
                  if (canCompareTeams) {
                    setTeamViewTab('compare');
                  }
                }}
                disabled={!canCompareTeams}
                className={tabButtonClass('compare')}
              >
                Compare
              </button>
            </div>
            <img
              src={clubBadgeMap[selectedTeam] || `/badges/${selectedTeam.toLowerCase().replace(/[^a-z]/g, '')}.png`}
              alt={`${selectedTeam} badge`}
              className="w-8 h-8 rounded-full shadow bg-white dark:bg-white object-contain border border-gray-200 dark:border-gray-700"
              onError={e => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          {/* Show current spend for this club */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-green-600 dark:text-green-400 font-bold text-lg">
              £{(clubSpendMap[selectedTeam] || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="text-gray-600 dark:text-gray-400 text-sm">Current Spend</span>
          </div>
          {currentBio && (
            <div className="rounded-lg border border-gray-300 dark:border-slate-700/80 bg-gray-50 dark:bg-slate-900/60 p-4 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-300">About</p>
                {(currentBio.website || currentBio.twitter) && (
                  <div className="flex flex-wrap items-center gap-3 text-xs text-blue-600 dark:text-blue-200">
                    {currentBio.website && (
                      <a
                        href={currentBio.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-800 dark:hover:text-white underline-offset-4 hover:underline"
                      >
                        Official site
                      </a>
                    )}
                    {currentBio.twitter && (
                      <a
                        href={currentBio.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-800 dark:hover:text-white underline-offset-4 hover:underline"
                      >
                        Twitter / X
                      </a>
                    )}
                  </div>
                )}
              </div>
              {currentBio.facts && currentBio.facts.length > 0 && (
                <div className="grid gap-2 text-sm text-gray-700 dark:text-gray-200 sm:grid-cols-2">
                  {currentBio.facts.map((fact) => (
                    <div key={`${fact.label}-${fact.value}`} className="flex items-center gap-2">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold whitespace-nowrap">{fact.label}:</span>
                      <span className="text-gray-900 dark:text-white">{fact.value}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="relative">
                <div
                  className="space-y-3 text-sm text-gray-700 dark:text-gray-200 leading-relaxed transition-all duration-300"
                  style={
                    !isBioExpanded
                      ? {
                          maxHeight: '4.5rem',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                        }
                      : undefined
                  }
                >
                  <p>{currentBio.intro}</p>
                  {currentBio.honours && currentBio.honours.length > 0 && (
                    <div>
                      <p className="font-semibold text-blue-600 dark:text-blue-400 mb-1">
                        {currentBio.honoursHeading || 'Major honours'}
                      </p>
                      <ul className="list-disc list-inside space-y-0.5 text-gray-600 dark:text-gray-300">
                        {currentBio.honours.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p>{currentBio.history}</p>
                </div>
                {!isBioExpanded && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent dark:from-slate-900 dark:via-slate-900/80 dark:to-transparent" />
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBioExpanded((prev) => !prev)}
                className="border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-500/20 hover:text-blue-800 dark:hover:text-white w-max"
              >
                {isBioExpanded ? 'Show less' : 'Show more'}
              </Button>
            </div>
          )}
        </div>
      </Card>
    );

    if (teamViewTab === 'compare') {
      return (
        <div className="space-y-6">
          {teamHeader}
          <TeamComparisonPanel
            primaryTeam={selectedTeam}
            comparisonTeam={comparisonTeam}
            onComparisonTeamChange={(team) => setComparisonTeam(team)}
          />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {teamHeader}

        {/* Phase visualizations */}
        {teamComparisonData[selectedTeam] && (
          <TeamPhaseCharts teamName={selectedTeam} />
        )}

        {/* Squad Wage Carousel */}
        <SquadWageCarousel club={selectedTeam} />

        {/* Media Hub will be shown under Latest Transfer News */}

        {/* Removed Latest Transfer News; Media Hub below uses Crowdy/SB Live */}

        {/* Media Hub */}
        {teamData?.mediaHub && teamData.mediaHub.filter(item => item.image).length > 0 && (
          <Card className="bg-white dark:bg-slate-800/50 backdrop-blur-md border-gray-200 dark:border-slate-700">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
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
                        className="bg-gray-100 dark:bg-slate-700/50 border-gray-300 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-700/70 transition-all duration-200 overflow-hidden h-full cursor-pointer"
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
                              <div className="w-full h-full bg-gray-200 dark:bg-slate-600/50 flex items-center justify-center">
                                <ExternalLink className="w-6 h-6 text-gray-500 dark:text-gray-400" />
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
                            
                            <h4 className="text-gray-900 dark:text-white font-semibold text-sm leading-tight mb-2 line-clamp-3">
                              {item.title || 'Untitled'}
                            </h4>
                            
                            {item.summary && (
                              <p className="text-gray-600 dark:text-gray-300 text-xs line-clamp-2 mb-3">
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
              <div className="px-4 py-3 bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-white border-b border-gray-300 dark:border-slate-700 flex items-center justify-between">
                <div className="font-semibold">Match Details</div>
                <UIButton
                  variant="outline"
                  size="sm"
                  className="border-gray-400 dark:border-slate-500 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white"
                  onClick={() => setMatchModal({ open: false })}
                >
                  Close
                </UIButton>
              </div>
              <div className="p-4 text-sm text-gray-700 dark:text-slate-100">
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
                                    <li key={i} className="text-gray-700 dark:text-slate-200">
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
                                    <li key={i} className="text-gray-700 dark:text-slate-200">
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
                                    <li key={i} className="text-gray-700 dark:text-slate-200">
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
          <Card className="bg-white dark:bg-slate-800/50 backdrop-blur-md border-gray-200 dark:border-slate-700">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-red-400" />
                Official YouTube Channel {youtubeVideos.length > 0 && `(${youtubeVideos.length} videos)`}
              </h3>
              <div className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 pb-4">
                {/* YouTube Channel Link Card */}
                <div className="flex-none w-80">
                  <Card className="bg-gray-100 dark:bg-slate-700/50 border-gray-300 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-700/70 transition-all duration-200 overflow-hidden h-full">
                    <div className="flex flex-col h-full">
                      {/* YouTube Thumbnail */}
                              <div className="w-full h-32 flex-shrink-0 bg-red-100 dark:bg-red-600/20 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mb-2 mx-auto">
                            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          </div>
                          <p className="text-gray-900 dark:text-white text-sm font-medium">YouTube Channel</p>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-red-500 text-white">
                            YouTube
                          </Badge>
                        </div>
                        
                        <h4 className="text-gray-900 dark:text-white font-semibold text-sm leading-tight mb-2">
                          {selectedTeam} Official Channel
                        </h4>
                        
                        <p className="text-gray-600 dark:text-gray-300 text-xs mb-3">
                          Watch official videos, highlights, and behind-the-scenes content
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
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
                    <Card className="bg-gray-100 dark:bg-slate-700/50 border-gray-300 dark:border-slate-600 p-4">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400 mb-2"></div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm text-center">Loading videos...</p>
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
                          
                          <h4 className="text-gray-900 dark:text-white font-semibold text-sm leading-tight mb-2 line-clamp-2">
                            {video.title}
                          </h4>
                          
                          {video.channelTitle && (
                            <p className="text-gray-500 dark:text-gray-400 text-xs mb-2">
                              {video.channelTitle}
                            </p>
                          )}
                          
                          <p className="text-gray-600 dark:text-gray-300 text-xs mb-3 line-clamp-2">
                            {video.description}
                          </p>
                          
                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
                              <Clock className="w-3 h-3" />
                              {video.duration}
                            </div>
                            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
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
                    <Card className="bg-gray-100 dark:bg-slate-700/50 border-gray-300 dark:border-slate-600 p-4">
                      <p className="text-gray-600 dark:text-gray-400 text-sm text-center">No videos available</p>
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
              <div className="w-full h-[calc(85vh-42px)] overflow-auto bg-white dark:bg-slate-900">
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
                      <div className="p-4 bg-gray-50 dark:bg-slate-800 border-t border-gray-300 dark:border-slate-700">
                        {mediaHubModal.item.title && (
                          <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-2">{mediaHubModal.item.title}</h3>
                        )}
                        {mediaHubModal.item.summary && (
                          <p className="text-gray-600 dark:text-gray-300 text-sm">{mediaHubModal.item.summary}</p>
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
                          <p className="text-gray-600 dark:text-gray-300">Loading article...</p>
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
                          <h3 className="text-gray-900 dark:text-white font-semibold text-2xl mb-4 text-center">{mediaHubModal.item.title}</h3>
                        )}
                        {mediaHubModal.item.summary && (
                          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-6 max-w-2xl text-center">{mediaHubModal.item.summary}</p>
                        )}
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Unable to load full article content.</p>
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
                      <h3 className="text-gray-900 dark:text-white font-semibold text-xl mb-3">{mediaHubModal.item.title}</h3>
                    )}
                    {mediaHubModal.item.summary && (
                      <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed whitespace-pre-wrap">{mediaHubModal.item.summary}</p>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Transfers Section - Side by Side */}
        {((transfersIn.length > 0 || (teamData?.transfers && teamData.transfers.length > 0) || (teamData?.doneDeals && teamData.doneDeals.some(t => t.toClub === selectedTeam))) ||
          (transfersOut.length > 0 || (teamData?.transfers && teamData.transfers.length > 0) || (teamData?.doneDeals && teamData.doneDeals.some(t => t.fromClub === selectedTeam))) ||
          (rumors.length > 0 || (teamData?.rumours && teamData.rumours.length > 0))) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Done Deals - Only INCOMING transfers (toClub === selectedTeam) */}
            {(transfersIn.length > 0 || (teamData?.transfers && teamData.transfers.length > 0) || (teamData?.doneDeals && teamData.doneDeals.some(t => t.toClub === selectedTeam))) && (
              <Card className="bg-white dark:bg-slate-800/50 backdrop-blur-md border-gray-200 dark:border-slate-700">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
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
                            <div
                              key={transfer.id}
                              ref={registerPlayerRef(transfer.playerName)}
                            >
                              <TransferCard transfer={transfer} highlightedPlayerName={highlightedPlayer} />
                            </div>
                          ))}
                          {uniqueDoneDeals.length > 5 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedSections(prev => ({ ...prev, doneDeals: !prev.doneDeals }))}
                              className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mt-2"
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
              <Card className="bg-white dark:bg-slate-800/50 backdrop-blur-md border-gray-200 dark:border-slate-700">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
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
                            <div
                              key={transfer.id}
                              ref={registerPlayerRef(transfer.playerName)}
                            >
                              <TransferCard transfer={transfer} highlightedPlayerName={highlightedPlayer} />
                            </div>
                          ))}
                          {uniqueDepartures.length > 5 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedSections(prev => ({ ...prev, departures: !prev.departures }))}
                              className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mt-2"
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
              <Card className="bg-white dark:bg-slate-800/50 backdrop-blur-md border-gray-200 dark:border-slate-700">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
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
                            <div
                              key={transfer.id}
                              ref={registerPlayerRef(transfer.playerName)}
                            >
                              <TransferCard transfer={transfer} highlightedPlayerName={highlightedPlayer} />
                            </div>
                          ))}
                          {uniqueRumours.length > 5 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedSections(prev => ({ ...prev, rumours: !prev.rumours }))}
                              className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mt-2"
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
        <Card className="bg-white dark:bg-slate-800/50 backdrop-blur-md border-gray-200 dark:border-slate-700">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Select a Team</h2>
            </div>
            
            <div className="relative mb-6">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-gray-50 dark:bg-slate-700/50 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
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
                className="bg-white dark:bg-slate-800/50 backdrop-blur-md border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/70 transition-all duration-200 cursor-pointer group"
                onClick={() => setSelectedTeam(club)}
              >
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={`/badges/${clubBadgeMap[club] || club.toLowerCase().replace(/[^a-z]/g, '') + '.png'}`}
                      alt={`${club} badge`}
                      className="w-6 h-6 rounded-full shadow bg-white dark:bg-white object-contain border border-gray-200 dark:border-gray-700"
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                      {club}
                    </h3>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        In: {stats.transfersIn.length}
                      </span>
                      <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        Out: {stats.transfersOut.length}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        Rumours: {stats.rumors.length}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 text-xs">
                        Total: {stats.totalActivity}
                      </span>
                    </div>

                    {/* Show current spend for this club */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-300 dark:border-slate-600">
                      <span className="text-gray-600 dark:text-gray-400 text-xs">Current Spend:</span>
                      <span className="text-green-600 dark:text-green-400 font-semibold text-xs">
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

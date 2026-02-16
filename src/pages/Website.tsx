import React, { useState, useEffect } from 'react';
import { TransferDataProvider, useTransferDataStore } from '@/store/transferDataStore';
import { TransferCountdown } from '@/components/TransferCountdown';
import { FavouritesView } from '@/components/FavouritesView';
import { TransferSpendingChart } from '@/components/TransferSpendingChart';
import { ClubSpendingChart2025 } from '@/components/ClubSpendingChart2025';
import { HomeRecentRumours } from '@/components/HomeRecentRumours';
import { PlanetSportFooter } from '@/components/PlanetSportFooter';
import { HomeTodaysConfirmed } from '@/components/HomeTodaysConfirmed';
import { AppHeader } from '@/components/AppHeader';
import { PlayerModalProvider } from '@/context/PlayerModalContext';

import { Card } from '@/components/ui/card';
import { TeamTransferView } from '@/components/TeamTransferView';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { NewsCarousel } from '@/components/NewsCarousel';
import { ChatterBoxDisplay } from '@/components/ChatterBoxDisplay';
import { Top10ExpensiveVertical } from '@/components/Top10ExpensiveVertical';
import { VideoTab } from '@/components/VideoTab';
import { CheckCircle, MessageSquare, Newspaper, TrendingUp, Video } from 'lucide-react';
import { ClubTransfersList } from '@/components/ClubTransfersList';
import { FlashBanner } from '@/components/FlashBanner';
import { normalizeClubName } from '@/utils/clubNormalizer';
import { ConfirmedTransfersTab } from '@/components/ConfirmedTransfersTab';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ViewToggle } from '@/components/ViewToggle';
import { MobileLayout } from '@/components/MobileLayout';

const WebsiteContent = () => {
  console.log('WebsiteContent: Component rendering');
  const { allTransfers, lastUpdated, refreshAllData } = useTransferDataStore();
  console.log('WebsiteContent: Store initialized', { transfersCount: allTransfers.length });
  const { refreshCounter } = useRefreshControl();
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [countdownTarget] = useState('2025-12-31T23:00:00');
  const [newsView, setNewsView] = useState<'confirmed' | 'news' | 'chatter' | 'top10' | 'video'>('confirmed');
  // Available seasons - can be extended as needed
  const availableSeasons = ['2025/26', '2024/25', '2023/24'];
  
  const [transferSelectionIns, setTransferSelectionIns] = useState<string | undefined>(undefined);
  const [transferSelectionOuts, setTransferSelectionOuts] = useState<string | undefined>(undefined);
  
  // View mode state (desktop or mobile)
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>(() => {
    if (typeof window === 'undefined') return 'desktop';
    const saved = localStorage.getItem('viewMode');
    return (saved === 'mobile' || saved === 'desktop') ? saved : 'desktop';
  });
  
  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);
  // All transfer data is now sourced from useTransferDataStore()

  // Favourites state for badge
  const [starredClubs, setStarredClubs] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('starredClubs');
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
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

  // Listen for refresh events and update transfers (including CMS API refresh)
  useEffect(() => {
    const handleRefresh = () => {
      console.log('Refreshing transfers data for Premier League');
      // Trigger data refresh in the transfer store
      refreshAllData();
    };

    const handleCmsApiRefresh = (event: any) => {
      console.log('CMS API refresh triggered, updating main site data');
      // When CMS refreshes APIs, also refresh main site data
      refreshAllData();
    };

    window.addEventListener('autoRefresh', handleRefresh);
    window.addEventListener('manualRefresh', handleRefresh);
    window.addEventListener('crawlStatusUpdate', handleRefresh);
    window.addEventListener('globalApiRefresh', handleCmsApiRefresh);

    return () => {
      window.removeEventListener('autoRefresh', handleRefresh);
      window.removeEventListener('manualRefresh', handleRefresh);
      window.removeEventListener('crawlStatusUpdate', handleRefresh);
      window.removeEventListener('globalApiRefresh', handleCmsApiRefresh);
    };
  }, [refreshCounter, refreshAllData]);

  // Handler for club selection
  // Premier League clubs in the specified order (2024/25 Season)
  const premierLeagueClubs = [
    'Arsenal',
    'Aston Villa',
    'Bournemouth',
    'Brentford',
    'Brighton & Hove Albion',
    'Chelsea',
    'Crystal Palace',
    'Everton',
    'Fulham',
    'Ipswich Town',
    'Leeds United',
    'Leicester City',
    'Liverpool',
    'Manchester City',
    'Manchester United',
    'Newcastle United',
    'Nottingham Forest',
    'Southampton',
    'Tottenham Hotspur',
    'West Ham United',
    'Wolverhampton Wanderers'
  ];
  const premierLeagueClubSet = new Set(
    premierLeagueClubs.map((club) => normalizeClubName(club).toLowerCase())
  );

  const handleSelectClub = React.useCallback((club: string, playerName?: string) => {
    const normalizedClub = normalizeClubName(club);
    const normalizedKey = normalizedClub.toLowerCase();
    if (!premierLeagueClubSet.has(normalizedKey)) {
      console.warn(`Club ${club} is outside the Premier League list and cannot be selected.`);
      return;
    }

    // Ensure we use the canonical name from our Premier League list for consistency
    const canonicalClub =
      premierLeagueClubs.find(
        (plClub) => normalizeClubName(plClub).toLowerCase() === normalizedKey
      ) || normalizedClub;

    setSelectedClub(canonicalClub);
    setSelectedPlayer(playerName || null);
  }, [premierLeagueClubSet, premierLeagueClubs]);

  useEffect(() => {
    const handleClubBioNavigate = (event: Event) => {
      const detail = (event as CustomEvent<{ action: string; club: string }>).detail;
      if (!detail) return;
      if (detail.action === 'overview') {
        handleSelectClub(detail.club);
      }
      // Future actions (compare, squad) can be handled here.
    };
    window.addEventListener('clubbio:navigate', handleClubBioNavigate as EventListener);
    return () => window.removeEventListener('clubbio:navigate', handleClubBioNavigate as EventListener);
  }, [handleSelectClub]);
  const handleBackToDashboard = () => {
    setSelectedClub(null);
    setSelectedPlayer(null);
  };

  if (selectedClub) {
    // Show club card view
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#2F517A' }}>
        <div className="sticky top-0 z-50 bg-[#2F517A] border-b border-slate-700">
          <AppHeader lastUpdated={lastUpdated || new Date()} />
          <div className="flex justify-end px-4 py-2">
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </div>
        <div 
          className={viewMode === 'mobile' ? 'w-full max-w-full px-2 sm:px-4 py-2' : ''}
          style={viewMode === 'desktop' ? { width: '1200px', margin: '0 auto', padding: '16px' } : {}}
        >
          <TeamTransferView
            transfers={allTransfers}
            selectedTeam={selectedClub}
            focusPlayerName={selectedPlayer}
            onBack={handleBackToDashboard}
          />
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#2F517A] transition-colors">
      <div className="sticky top-0 z-50 bg-gray-50 dark:bg-[#2F517A] border-b border-gray-200 dark:border-slate-700">
        <AppHeader lastUpdated={lastUpdated || new Date()} />
        <div className="flex justify-end px-4 py-2">
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>
      </div>

      {viewMode === 'mobile' ? (
        <MobileLayout
          countdownTarget={countdownTarget}
          newsView={newsView}
          setNewsView={setNewsView}
          allTransfers={allTransfers}
          premierLeagueClubs={premierLeagueClubs}
          availableSeasons={availableSeasons}
          transferSelectionIns={transferSelectionIns}
          setTransferSelectionIns={setTransferSelectionIns}
          transferSelectionOuts={transferSelectionOuts}
          setTransferSelectionOuts={setTransferSelectionOuts}
          onSelectClub={handleSelectClub}
        />
      ) : (
        <div style={{ width: '1200px', margin: '0 auto', padding: '8px' }}>
        {/* Transfer Window Countdown */}
        <Card className="mb-2 bg-white dark:bg-slate-800/50 backdrop-blur-md border-gray-200 dark:border-slate-700 shadow-lg">
          <div style={{ padding: '8px' }}>
            <TransferCountdown targetDate={countdownTarget} />
          </div>
        </Card>

        {/* Flash Banner */}
        <FlashBanner />

        {/* Three Column Layout: Transfers In | News | Transfers Out */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 260px', gap: '16px', marginBottom: '0', alignItems: 'end' }}>
          {/* Club Spending Chart 2025 - Spans all three columns */}
          <div style={{ gridColumn: '1 / -1', marginBottom: '16px' }}>
            <ClubSpendingChart2025 onSelectClub={handleSelectClub} />
          </div>
          {/* Left Column: Transfers In */}
          <div style={{ width: '260px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Card className="bg-white dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 shadow-md flex flex-col h-full">
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: '1' }}>
                <div className="mb-3">
                  <Select value={transferSelectionIns} onValueChange={setTransferSelectionIns}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Select Transfer season" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSeasons.map((season) => (
                        <SelectItem key={`ins-${season}`} value={`ins-${season}`}>
                          Summer Ins {season}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="border-b-2 border-blue-600 dark:border-blue-400 mb-3"></div>
                <div 
                  className="flex-1 overflow-y-scroll pr-2 summer-scrollbar" 
                  style={{
                    scrollbarWidth: 'auto',
                    scrollbarColor: '#6b8e6b #E5E7EB',
                    maxHeight: 'calc(100vh - 400px)'
                  }}
                >
                  <ClubTransfersList 
                    transfers={allTransfers}
                    clubs={premierLeagueClubs}
                    type="in"
                    window="summer"
                    onSelectClub={handleSelectClub}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Middle Column: News */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
            <Card className="bg-white dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 shadow-md flex flex-col h-full">
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: '1' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', borderBottom: '2px solid', borderColor: 'rgb(209 213 219)', paddingBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setNewsView('news')}
                      className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                        newsView === 'news'
                          ? 'border-b-2 border-blue-600 dark:border-blue-400 pb-1'
                          : ''
                      }`}
                      style={newsView === 'news' ? { color: '#6b8e6b', borderBottom: '2px solid #6b8e6b' } : { color: '#6b8e6b' }}
                    >
                      <Newspaper className="w-4 h-4" style={{ color: '#6b8e6b' }} />
                      News
                    </button>
                    <button
                      onClick={() => setNewsView('video')}
                      className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                        newsView === 'video'
                          ? 'border-b-2 border-blue-600 dark:border-blue-400 pb-1'
                          : ''
                      }`}
                      style={newsView === 'video' ? { color: '#6b8e6b', borderBottom: '2px solid #6b8e6b' } : { color: '#6b8e6b' }}
                    >
                      <Video className="w-4 h-4" style={{ color: '#6b8e6b' }} />
                      Video
                    </button>
                    <button
                      onClick={() => setNewsView('chatter')}
                      className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                        newsView === 'chatter'
                          ? 'border-b-2 border-blue-600 dark:border-blue-400 pb-1'
                          : ''
                      }`}
                      style={newsView === 'chatter' ? { color: '#6b8e6b', borderBottom: '2px solid #6b8e6b' } : { color: '#6b8e6b' }}
                    >
                      <MessageSquare className="w-4 h-4" style={{ color: '#6b8e6b' }} />
                      <span>Live hub</span>
                      <span 
                        className="live-dot w-2.5 h-2.5 rounded-full bg-green-500"
                      />
                    </button>
                    <button
                      onClick={() => setNewsView('confirmed')}
                      className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                        newsView === 'confirmed'
                          ? 'border-b-2 border-blue-600 dark:border-blue-400 pb-1'
                          : ''
                      }`}
                      style={newsView === 'confirmed' ? { color: '#6b8e6b', borderBottom: '2px solid #6b8e6b' } : { color: '#6b8e6b' }}
                    >
                      <CheckCircle className="w-4 h-4" style={{ color: '#6b8e6b' }} />
                      Confirmed In
                    </button>
                    <button
                      onClick={() => setNewsView('top10')}
                      className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                        newsView === 'top10'
                          ? 'pb-1'
                          : ''
                      }`}
                      style={newsView === 'top10' ? { 
                        color: '#6b8e6b',
                        borderBottom: '3px solid #6b8e6b',
                        fontWeight: 'bold'
                      } : { color: '#6b8e6b' }}
                    >
                      <TrendingUp className="w-4 h-4" style={{ color: '#6b8e6b' }} />
                      Top 10
                    </button>
                  </div>
                </div>
                <style>{`
                  .live-dot {
                    animation: livePulse 1.5s ease-in-out infinite;
                    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
                  }
                  @keyframes livePulse {
                    0% {
                      opacity: 1;
                      transform: scale(1);
                      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
                    }
                    50% {
                      opacity: 0.8;
                      transform: scale(1.1);
                      box-shadow: 0 0 0 4px rgba(34, 197, 94, 0);
                    }
                    100% {
                      opacity: 1;
                      transform: scale(1);
                      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
                    }
                  }
                  .summer-scrollbar::-webkit-scrollbar {
                    width: 12px;
                    display: block;
                  }
                  .summer-scrollbar::-webkit-scrollbar-track {
                    background: #E5E7EB;
                    border-radius: 6px;
                  }
                  .summer-scrollbar::-webkit-scrollbar-thumb {
                    background: #6b8e6b;
                    border-radius: 6px;
                    border: 2px solid #E5E7EB;
                  }
                  .summer-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #5a7a5a;
                  }
                `}</style>
                <div className="flex-1 overflow-y-auto pr-2" style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#9CA3AF #E5E7EB',
                  maxHeight: 'calc(100vh - 400px)'
                }}>
                  {newsView === 'confirmed' ? (
                    <ConfirmedTransfersTab transfers={allTransfers} onSelectClub={handleSelectClub} />
                  ) : newsView === 'news' ? (
                    <NewsCarousel maxItems={5} />
                  ) : newsView === 'chatter' ? (
                    <ChatterBoxDisplay />
                  ) : newsView === 'video' ? (
                    <VideoTab />
                  ) : (
                    <Top10ExpensiveVertical transfers={allTransfers} onSelectClub={handleSelectClub} />
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Transfers Out */}
          <div style={{ width: '260px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Card className="bg-white dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 shadow-md flex flex-col h-full">
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: '1' }}>
                <div className="mb-3">
                  <Select value={transferSelectionOuts} onValueChange={setTransferSelectionOuts}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Select Transfer season" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSeasons.map((season) => (
                        <SelectItem key={`outs-${season}`} value={`outs-${season}`}>
                          Summer Outs {season}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="border-b-2 border-red-600 dark:border-red-400 mb-3"></div>
                <div 
                  className="flex-1 overflow-y-scroll pr-2 summer-scrollbar" 
                  style={{
                    scrollbarWidth: 'auto',
                    scrollbarColor: '#6b8e6b #E5E7EB',
                    maxHeight: 'calc(100vh - 400px)'
                  }}
                >
                  <ClubTransfersList 
                    transfers={allTransfers}
                    clubs={premierLeagueClubs}
                    type="out"
                    window="summer"
                    onSelectClub={handleSelectClub}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Blue Divider Bar */}
        <div className="w-full h-1 bg-blue-600 dark:bg-blue-500 mt-2 mb-0"></div>

        {/* Planet Sport Network Footer */}
        <div className="mt-0">
          <PlanetSportFooter />
        </div>
      </div>
      )}
    </div>
  );
};

const Website = () => (
  <TransferDataProvider>
    <PlayerModalProvider>
      <WebsiteContent />
    </PlayerModalProvider>
  </TransferDataProvider>
);

export default Website;
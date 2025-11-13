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
import { MessageSquare, Newspaper, TrendingUp } from 'lucide-react';
import { ClubTransfersList } from '@/components/ClubTransfersList';

const WebsiteContent = () => {
  const { allTransfers, lastUpdated, refreshAllData } = useTransferDataStore();
  const { refreshCounter } = useRefreshControl();
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [countdownTarget] = useState('2025-12-31T23:00:00');
  const [newsView, setNewsView] = useState<'news' | 'chatter' | 'top10'>('news');
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
  const handleSelectClub = (club: string) => setSelectedClub(club);
  const handleBackToDashboard = () => setSelectedClub(null);

  // Premier League clubs in the specified order
  const premierLeagueClubs = [
    'Arsenal',
    'Aston Villa',
    'AFC Bournemouth',
    'Brentford',
    'Brighton & Hove Albion',
    'Burnley',
    'Chelsea',
    'Crystal Palace',
    'Everton',
    'Fulham',
    'Leeds United',
    'Liverpool',
    'Manchester City',
    'Manchester United',
    'Newcastle United',
    'Nottingham Forest',
    'Sunderland',
    'Tottenham Hotspur',
    'West Ham United',
    'Wolverhampton Wanderers'
  ];

  if (selectedClub) {
    // Show club card view
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#2F517A' }}>

        <AppHeader lastUpdated={lastUpdated || new Date()} />
        <div style={{ width: '960px', margin: '0 auto', padding: '16px' }}>
          <TeamTransferView transfers={allTransfers} selectedTeam={selectedClub} onBack={handleBackToDashboard} />
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#2F517A] transition-colors">
      <AppHeader lastUpdated={lastUpdated || new Date()} />

      <div style={{ width: '960px', margin: '0 auto', padding: '16px' }}>
        {/* Transfer Window Countdown */}
        <Card className="mb-4 bg-white dark:bg-slate-800/50 backdrop-blur-md border-gray-200 dark:border-slate-700 shadow-lg">
          <div style={{ padding: '12px' }}>
            <TransferCountdown targetDate={countdownTarget} />
          </div>
        </Card>

        {/* Club Spending Chart 2025 */}
        <div className="mb-8" style={{ width: '960px' }}>
          <ClubSpendingChart2025 onSelectClub={handleSelectClub} />
        </div>

        {/* Three Column Layout: Transfers In | News | Transfers Out */}
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 240px', gap: '24px', marginBottom: '0', alignItems: 'end' }}>
          {/* Left Column: Transfers In */}
          <div style={{ width: '240px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Card className="bg-white dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 shadow-md flex flex-col h-full">
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: '1' }}>
                <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4 border-b-2 border-blue-600 dark:border-blue-400 pb-2">
                  Summer Ins
                </h3>
                <div className="flex-1 overflow-y-auto pr-2" style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#9CA3AF #E5E7EB',
                  maxHeight: 'calc(100vh - 400px)'
                }}>
                  <ClubTransfersList 
                    transfers={allTransfers}
                    clubs={premierLeagueClubs}
                    type="in"
                    onSelectClub={handleSelectClub}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Middle Column: News */}
          <div style={{ width: '456px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Card className="bg-white dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 shadow-md flex flex-col h-full">
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: '1' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '2px solid', borderColor: 'rgb(209 213 219)', paddingBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                      onClick={() => setNewsView('news')}
                      className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                        newsView === 'news'
                          ? 'text-gray-900 dark:text-white border-b-2 border-blue-600 dark:border-blue-400 pb-1'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <Newspaper className="w-4 h-4" />
                      Transfer News
                    </button>
                    <button
                      onClick={() => setNewsView('chatter')}
                      className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                        newsView === 'chatter'
                          ? 'text-gray-900 dark:text-white border-b-2 border-blue-600 dark:border-blue-400 pb-1'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Transfers Chatter Box
                    </button>
                    <button
                      onClick={() => setNewsView('top10')}
                      className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                        newsView === 'top10'
                          ? 'pb-1'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                      style={newsView === 'top10' ? { 
                        color: '#05DF72',
                        borderBottom: '3px solid #05DF72',
                        fontWeight: 'bold'
                      } : {}}
                    >
                      <TrendingUp className="w-4 h-4" style={newsView === 'top10' ? { color: '#05DF72' } : {}} />
                      Top 10 Most Expensive
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto pr-2" style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#9CA3AF #E5E7EB',
                  maxHeight: 'calc(100vh - 400px)'
                }}>
                  {newsView === 'news' ? (
                    <NewsCarousel maxItems={5} />
                  ) : newsView === 'chatter' ? (
                    <ChatterBoxDisplay />
                  ) : (
                    <Top10ExpensiveVertical transfers={allTransfers} onSelectClub={handleSelectClub} />
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Transfers Out */}
          <div style={{ width: '240px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Card className="bg-white dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 shadow-md flex flex-col h-full">
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: '1' }}>
                <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4 border-b-2 border-red-600 dark:border-red-400 pb-2">
                  Summer Outs
                </h3>
                <div className="flex-1 overflow-y-auto pr-2" style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#9CA3AF #E5E7EB',
                  maxHeight: 'calc(100vh - 400px)'
                }}>
                  <ClubTransfersList 
                    transfers={allTransfers}
                    clubs={premierLeagueClubs}
                    type="out"
                    onSelectClub={handleSelectClub}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Blue Divider Bar */}
        <div className="w-full h-1 bg-blue-600 dark:bg-blue-500 mt-4 mb-0"></div>

        {/* Planet Sport Network Footer */}
        <div className="mt-0">
          <PlanetSportFooter />
        </div>
      </div>
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
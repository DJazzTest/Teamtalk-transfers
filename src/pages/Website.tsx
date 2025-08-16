import React, { useState, useEffect } from 'react';
import { TransferDataProvider, useTransferDataStore } from '@/store/transferDataStore';
import { TransferCountdown } from '@/components/TransferCountdown';
import { WalletWarpingDeals } from '@/components/WalletWarpingDeals';
import { FavouritesView } from '@/components/FavouritesView';
import { TransferSpendingChart } from '@/components/TransferSpendingChart';
import { ClubSpendingChart2025 } from '@/components/ClubSpendingChart2025';
import { HomeRecentRumours } from '@/components/HomeRecentRumours';
import { HomeRecentConfirmed } from '@/components/HomeRecentConfirmed';
import { HomeTodaysConfirmed } from '@/components/HomeTodaysConfirmed';
import { AppHeader } from '@/components/AppHeader';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { TeamTransferView } from '@/components/TeamTransferView';
import { TransferResults } from '@/components/TransferResults';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { useLeagueData } from '@/hooks/useLeagueData';
import { TeamCarousel } from '@/components/TeamCarousel';
import { NewsCarousel } from '@/components/NewsCarousel';

const WebsiteContent = () => {
  const { allTransfers, lastUpdated, refreshAllData } = useTransferDataStore();
  const { refreshCounter } = useRefreshControl();
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [countdownTarget] = useState('2025-09-01T18:00:00Z');
  const [showAllNew, setShowAllNew] = useState(false);
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

  if (selectedClub) {
    // Show club card view
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#2F517A' }}>

        <AppHeader lastUpdated={lastUpdated || new Date()} />
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-full">
          <button
            className="mb-4 px-4 py-2 rounded bg-blue-700 text-white font-semibold hover:bg-blue-800 transition"
            onClick={handleBackToDashboard}
          >
            ← Back to Dashboard
          </button>
          <TeamTransferView transfers={allTransfers} selectedTeam={selectedClub} onBack={handleBackToDashboard} />
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#2F517A' }}>
      <AppHeader lastUpdated={lastUpdated || new Date()} />

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-full">
        {/* Transfer Window Countdown */}
        <Card className="mb-4 sm:mb-8 bg-white/95 backdrop-blur-md border-gray-200/50 shadow-lg">
          <div className="p-3 sm:p-6">
            <TransferCountdown targetDate={countdownTarget} />
          </div>
        </Card>

        {/* Team Selector Section */}
        <TeamCarousel onSelectTeam={handleSelectClub} />

        {/* News Feed - moved to below countdown */}
        <NewsCarousel maxItems={5} />

        {/* New Premier League Transfers & Rumours just added! */}
        <Card className="mb-6 border-gray-200/50 shadow-lg" style={{ backgroundColor: '#fff3cd' }}>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <h2 className="text-lg font-bold text-orange-800">New Premier League Transfers & Rumours just added!</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#9CA3AF #E5E7EB'
            }}>
              {(() => {
                const uniqueTransfers = allTransfers.filter((transfer, index, arr) => {
                  const key = `${transfer.playerName.toLowerCase()}-${transfer.fromClub.toLowerCase()}-${transfer.toClub.toLowerCase()}`;
                  return arr.findIndex(t => 
                    `${t.playerName.toLowerCase()}-${t.fromClub.toLowerCase()}-${t.toClub.toLowerCase()}` === key
                  ) === index;
                })
                // Sort by date (newest first) to show July 2025 transfers at the top
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                const displayTransfers = showAllNew ? uniqueTransfers : uniqueTransfers.slice(0, 5);
                
                return (
                  <>
                    {displayTransfers.map((transfer) => (
                      <Card key={transfer.id} className="min-w-[240px] max-w-xs bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 hover:shadow-md transition-all duration-200 hover:border-orange-300">
                        <div className="p-3 flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            <span
                              className="font-semibold text-orange-600 hover:underline cursor-pointer text-base truncate"
                              onClick={() => handleSelectClub(transfer.toClub)}
                              title={`View ${transfer.toClub} transfers`}
                            >
                              {transfer.playerName}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            <span>{transfer.fromClub}</span> → <span className="font-semibold text-gray-800">{transfer.toClub}</span>
                          </div>
                          <div className="flex justify-between items-end gap-2">
                            <span className="text-orange-600 font-bold">{transfer.fee}</span>
                            <span className="text-xs text-gray-500">{new Date(transfer.date).toLocaleDateString()}</span>
                          </div>
                          <span className="text-xs text-gray-400 truncate">{transfer.source}</span>
                        </div>
                      </Card>
                    ))}
                    {uniqueTransfers.length > 5 && (
                      <div className="flex items-center">
                        <Button
                          onClick={() => setShowAllNew(!showAllNew)}
                          variant="outline"
                          size="sm"
                          className="border-orange-400 text-orange-700 hover:bg-orange-50 ml-2"
                        >
                          {showAllNew ? 'Show Less' : `Show More (${uniqueTransfers.length - 5} more)`}
                        </Button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </Card>

        {/* Confirmed Transfers */}
        <HomeRecentConfirmed transfers={allTransfers} onSelectClub={handleSelectClub} />

        {/* Top 10 Wallet-Warping Deals */}
        <div className="mb-8">
          <WalletWarpingDeals transfers={allTransfers} onSelectClub={handleSelectClub} onRefresh={refreshAllData} />
        </div>

        {/* Club Spending Chart 2025 */}
        <div className="mb-8 overflow-x-auto">
          <div className="min-w-[600px]">
            <ClubSpendingChart2025 onSelectClub={handleSelectClub} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Website = () => (
  <TransferDataProvider>
    <WebsiteContent />
  </TransferDataProvider>
);

export default Website;
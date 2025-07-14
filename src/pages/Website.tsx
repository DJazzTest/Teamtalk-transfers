import React, { useState, useEffect } from 'react';
import { TransferCountdown } from '@/components/TransferCountdown';
import { WalletWarpingDeals } from '@/components/WalletWarpingDeals';
import { FavouritesView } from '@/components/FavouritesView';
import { TransferSpendingChart } from '@/components/TransferSpendingChart';
import { ClubSpendingGraph } from '@/components/ClubSpendingGraph';
import { HomeRecentRumours } from '@/components/HomeRecentRumours';
import { HomeRecentConfirmed } from '@/components/HomeRecentConfirmed';
import { AppHeader } from '@/components/AppHeader';
import { AdminNavigation } from '@/components/AdminNavigation';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users } from 'lucide-react';
import { TeamTransferView } from '@/components/TeamTransferView';
import { TransferResults } from '@/components/TransferResults';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { useLeagueData } from '@/hooks/useLeagueData';

const Website = () => {
  const { lastUpdated, refreshCounter } = useRefreshControl();
  const { leagueTransfers } = useLeagueData();
  
  // Set countdown to Monday 1 September 2025 at 19:00 BST (18:00 UTC)
  const [countdownTarget] = useState('2025-09-01T18:00:00Z');

  // Listen for refresh events and update transfers
  useEffect(() => {
    const handleRefresh = () => {
      console.log('Refreshing transfers data for Premier League');
      // The useLeagueData hook will handle the refresh automatically
    };

    window.addEventListener('autoRefresh', handleRefresh);
    window.addEventListener('manualRefresh', handleRefresh);
    window.addEventListener('crawlStatusUpdate', handleRefresh);

    return () => {
      window.removeEventListener('autoRefresh', handleRefresh);
      window.removeEventListener('manualRefresh', handleRefresh);
      window.removeEventListener('crawlStatusUpdate', handleRefresh);
    };
  }, [refreshCounter]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#2F517A' }}>
      <AdminNavigation />
      <AppHeader lastUpdated={lastUpdated} />

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-full">
        {/* Transfer Window Countdown */}
        <Card className="mb-4 sm:mb-8 bg-white/95 backdrop-blur-md border-gray-200/50 shadow-lg">
          <div className="p-3 sm:p-6">
            <TransferCountdown targetDate={countdownTarget} />
          </div>
        </Card>

        {/* Club spending 2025/26 Graph */}
        <div className="mb-8 overflow-x-auto">
          <div className="min-w-[600px]">
            <ClubSpendingGraph />
          </div>
        </div>

        {/* Recent Rumours & Confirmed Transfers */}
        <HomeRecentRumours transfers={leagueTransfers} />
        <HomeRecentConfirmed transfers={leagueTransfers} />

        {/* Teams & Wallet-Warping Deals Tabs */}
        <Tabs defaultValue="teams" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 backdrop-blur-md border-slate-700">
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="favourites" className="flex items-center gap-2">
              <span className="relative flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.036 6.29a1 1 0 00.95.69h6.6c.969 0 1.371 1.24.588 1.81l-5.347 3.89a1 1 0 00-.364 1.118l2.036 6.29c.3.921-.755 1.688-1.539 1.118l-5.347-3.89a1 1 0 00-1.176 0l-5.347 3.89c-.784.57-1.838-.197-1.539-1.118l2.036-6.29a1 1 0 00-.364-1.118l-5.347-3.89c-.783-.57-.38-1.81.588-1.81h6.6a1 1 0 00.95-.69l2.036-6.29z" />
                </svg>
                {/* Badge for count of favourites */}
                {typeof window !== 'undefined' && localStorage.getItem('starredClubs') && JSON.parse(localStorage.getItem('starredClubs')).length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-xs text-black rounded-full px-1.5 py-0.5 font-bold">
                    {JSON.parse(localStorage.getItem('starredClubs')).length}
                  </span>
                )}
              </span>
              My Favourites
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Users className="w-4 h-4 text-yellow-400" />
              Top 10 Wallet-Warping Deals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teams">
            <TeamTransferView transfers={leagueTransfers} />
          </TabsContent>

          <TabsContent value="favourites">
            <FavouritesView transfers={leagueTransfers} />
          </TabsContent>

          <TabsContent value="wallet">
            <div className="mb-8">
              <WalletWarpingDeals transfers={leagueTransfers} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Website;
import React, { useState, useEffect } from 'react';
import { TransferCountdown } from '@/components/TransferCountdown';
import { RecentTransfers } from '@/components/RecentTransfers';
import { RecentConfirmedTransfers } from '@/components/RecentConfirmedTransfers';
import { TransferDataDebugger } from '@/components/TransferDataDebugger';
import { ReliableSources } from '@/components/ReliableSources';
import { AppHeader } from '@/components/AppHeader';
import { AdminNavigation } from '@/components/AdminNavigation';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Database } from 'lucide-react';
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
        {/* Latest Confirmed Transfers */}
        <div className="mb-4">
          <RecentConfirmedTransfers transfers={leagueTransfers} />
        </div>

        {/* Latest Rumours */}
        <div className="mb-4">
          <RecentTransfers transfers={leagueTransfers} />
        </div>

        {/* Reliable Sources */}
        <ReliableSources />

        {/* Transfer Window Countdown */}
        <Card className="mb-4 sm:mb-8 bg-white/95 backdrop-blur-md border-gray-200/50 shadow-lg">
          <div className="p-3 sm:p-6">
            <TransferCountdown targetDate={countdownTarget} />
          </div>
        </Card>

        {/* Main Content Tabs - Teams, Transfers, and Data Debug */}
        <Tabs defaultValue="teams" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 backdrop-blur-md border-slate-700">
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="transfers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              All Transfers
            </TabsTrigger>
            <TabsTrigger value="data-debug" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Data Debug
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teams">
            <TeamTransferView transfers={leagueTransfers} />
          </TabsContent>

          <TabsContent value="transfers">
            <TransferResults 
              lastUpdated={lastUpdated} 
            />
          </TabsContent>

          <TabsContent value="data-debug">
            <TransferDataDebugger transfers={leagueTransfers} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Website;
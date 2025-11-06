
import React, { useState, useEffect } from 'react';
import { TransferCountdown } from '@/components/TransferCountdown';
import { RecentTransfers } from '@/components/RecentTransfers';
import { AppHeader } from '@/components/AppHeader';
import { MainTabs } from '@/components/MainTabs';
import { PollingStatusIndicator } from '@/components/PollingStatusIndicator';
import { NewDataIndicator } from '@/components/NewDataIndicator';
import { Card } from '@/components/ui/card';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { Transfer } from '@/types/transfer';
import { TransferIntegrationService } from '@/utils/transferIntegration';
const NewsCarousel = React.lazy(() => import('@/components/NewsCarousel').then(m => ({ default: m.NewsCarousel })));
const TeamTalkFeed = React.lazy(() => import('@/components/TeamTalkFeed'));

const Index = () => {
  const {
    refreshRate,
    setRefreshRate,
    lastUpdated,
    isAutoRefresh,
    setIsAutoRefresh,
    handleManualRefresh,
    refreshCounter,
    // Auto-scraping controls
    autoScrapeInterval,
    setAutoScrapeInterval,
    isAutoScrapeEnabled,
    setIsAutoScrapeEnabled,
    scrapeErrors,
    lastScrapeTime,
    handleManualScrape,
    clearScrapeErrors
  } = useRefreshControl();

  // Set countdown to December 31, 2025 at 23:00 (120 days, 16 hours, 19 minutes from now)
  const [countdownTarget, setCountdownTarget] = useState('2025-12-31T23:00:00');
  const [allTransfers, setAllTransfers] = useState<Transfer[]>([]);
  
  // Initialize transfers on mount
  useEffect(() => {
    const initializeTransfers = async () => {
      try {
        // Use the new live data service for fresh transfer data
        const { liveDataService } = await import('@/services/liveDataService');
        const liveTransfers = await liveDataService.getAllTransfers();
        
        console.log('✅ Initialized with live transfer data:', liveTransfers.length, 'transfers');
        console.log('Sample transfers:', liveTransfers.slice(0, 3));
        setAllTransfers(liveTransfers);
      } catch (error) {
        console.error('❌ Error initializing transfers:', error);
        // Fallback to static data if live data fails
        const staticTransfers = TransferIntegrationService.getAllTransfers();
        console.log('📚 Using static fallback data:', staticTransfers.length, 'transfers');
        console.log('Sample static transfers:', staticTransfers.slice(0, 3));
        setAllTransfers(staticTransfers);
      }
    };
    
    initializeTransfers();
  }, []);

  // Listen for refresh events and update transfers
  useEffect(() => {
    const handleRefresh = async () => {
      console.log('🔄 Manual refresh triggered');
      try {
        // Force refresh from live data service
        const { liveDataService } = await import('@/services/liveDataService');
        liveDataService.clearCache(); // Clear cache for fresh data
        const freshTransfers = await liveDataService.getAllTransfers(true);
        
        console.log('✅ Manual refresh completed:', freshTransfers.length, 'transfers');
        setAllTransfers(freshTransfers);
      } catch (error) {
        console.error('❌ Error during manual refresh:', error);
        // Fallback to static data on error
        const staticTransfers = TransferIntegrationService.getAllTransfers();
        setAllTransfers(staticTransfers);
      }
    };

    // Listen for both auto and manual refresh events
    window.addEventListener('autoRefresh', handleRefresh);
    window.addEventListener('manualRefresh', handleRefresh);
    
    // Also listen for crawl status updates to refresh data
    window.addEventListener('crawlStatusUpdate', handleRefresh);

    return () => {
      window.removeEventListener('autoRefresh', handleRefresh);
      window.removeEventListener('manualRefresh', handleRefresh);
      window.removeEventListener('crawlStatusUpdate', handleRefresh);
    };
  }, [refreshCounter]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#2F517A' }}>
      <AppHeader lastUpdated={lastUpdated} />

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-full">
        {/* New Data Indicator - Shows when fresh content was added */}
        <NewDataIndicator />

        {/* Polling Status Indicator - Shows real-time update status */}
        <div className="mb-4">
          <PollingStatusIndicator />
        </div>

        {/* Latest News (fresh, auto-refreshes) */}
        <div className="mb-4 sm:mb-8">
          <React.Suspense fallback={<Card className="p-4">Loading news…</Card>}>
            <NewsCarousel maxItems={12} />
          </React.Suspense>
        </div>

        {/* Recent Transfers Highlight - Now using only real transfer data */}
        <div className="mb-4 sm:mb-8">
          <RecentTransfers transfers={allTransfers} />
        </div>

        {/* Transfer Window Countdown */}
        <Card className="mb-4 sm:mb-8 bg-white/95 backdrop-blur-md border-gray-200/50 shadow-lg">
          <div className="p-3 sm:p-6">
            <TransferCountdown targetDate={countdownTarget} />
          </div>
        </Card>

        {/* Main Content Tabs */}
        <MainTabs
          transfers={allTransfers}
          lastUpdated={lastUpdated}
        />

        {/* TeamTalk Live Feed list (extra feed view) */}
        <div className="mt-6">
          <React.Suspense fallback={<Card className="p-4">Loading feed…</Card>}>
            <TeamTalkFeed maxItems={20} showTransfersOnly={false} />
          </React.Suspense>
        </div>
      </div>
    </div>
  );
};

export default Index;


import React, { useState, useEffect } from 'react';
import { TransferCountdown } from '@/components/TransferCountdown';
import { RecentTransfers } from '@/components/RecentTransfers';
import { AppHeader } from '@/components/AppHeader';
import { MainTabs } from '@/components/MainTabs';
import { PollingStatusIndicator } from '@/components/PollingStatusIndicator';
import { Card } from '@/components/ui/card';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { Transfer } from '@/types/transfer';
import { TransferIntegrationService } from '@/utils/transferIntegration';

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

  // Set countdown to Monday 1 September 2025 at 19:00 BST (18:00 UTC)
  const [countdownTarget, setCountdownTarget] = useState('2025-09-01T18:00:00Z');
  const [allTransfers, setAllTransfers] = useState<Transfer[]>(() => {
    // Initialize with only real transfers
    return TransferIntegrationService.getAllTransfers();
  });

  // Listen for refresh events and update transfers
  useEffect(() => {
    const handleRefresh = () => {
      console.log('Refreshing all transfers data...');
      const realTransfers = TransferIntegrationService.getAllTransfers();
      setAllTransfers(realTransfers);
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
        {/* Polling Status Indicator - Shows real-time update status */}
        <div className="mb-4">
          <PollingStatusIndicator />
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
      </div>
    </div>
  );
};

export default Index;

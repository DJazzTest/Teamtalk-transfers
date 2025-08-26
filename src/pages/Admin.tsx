
import React, { useState, useEffect } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { AdminNavigation } from '@/components/AdminNavigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Transfer } from '@/types/transfer';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { TransferIntegrationService } from '@/utils/transferIntegration';
import TransferDataAdmin from '@/components/TransferDataAdmin';
import { SourcesTab } from '@/components/SourcesTab';
import { TransferWindowCountdownSetting } from '@/components/TransferWindowCountdownSetting';
import ClubApiManager from '@/components/ClubApiManager';
import { TransferValueUpdater } from '@/components/TransferValueUpdater';
import { TransferDataProvider } from '@/store/transferDataStore';


const Admin = () => {
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

  const [countdownTarget, setCountdownTarget] = useState('2025-09-01T18:00:00Z');
  const [allTransfers, setAllTransfers] = useState<Transfer[]>(() => {
    return TransferIntegrationService.getAllTransfers();
  });

  // Listen for refresh events and update transfers
  useEffect(() => {
    const handleRefresh = () => {
      console.log('Refreshing all transfers data...');
      const realTransfers = TransferIntegrationService.getAllTransfers();
      setAllTransfers(realTransfers);
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
    <TransferDataProvider>
      <div className="min-h-screen" style={{ backgroundColor: '#2F517A' }}>
        <AdminNavigation />
        <AppHeader lastUpdated={lastUpdated} />

        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-full">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <p className="text-gray-300">Manage transfer data sources, API settings, and system configuration</p>
              <div className="bg-blue-600/20 px-3 py-1 rounded-lg">
                <span className="text-blue-300 text-sm font-medium">
                  {(() => {
                    const savedUrls = localStorage.getItem('transfer_urls');
                    const urlCount = savedUrls ? JSON.parse(savedUrls).length : 0;
                    return `${urlCount} URLs monitored`;
                  })()}
                </span>
              </div>
            </div>
          </div>

          {/* Admin Management Tabs */}
          <Tabs defaultValue="api-management" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 backdrop-blur-md border-slate-700">
              <TabsTrigger value="api-management" className="flex items-center gap-2">
                API Management
              </TabsTrigger>
              <TabsTrigger value="manual-entry" className="flex items-center gap-2">
                Manual Entry
              </TabsTrigger>
              <TabsTrigger value="value-updater" className="flex items-center gap-2">
                AI Value Updater
              </TabsTrigger>
            </TabsList>

            <TabsContent value="api-management">
              <ClubApiManager />
            </TabsContent>

            <TabsContent value="manual-entry">
              <TransferDataAdmin />
            </TabsContent>

            <TabsContent value="value-updater">
              <TransferValueUpdater />
            </TabsContent>
          </Tabs>


        </div>
      </div>
    </TransferDataProvider>
  );
};

export default Admin;

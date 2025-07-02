
import React, { useState, useEffect } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { AdminNavigation } from '@/components/AdminNavigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiConfig } from '@/components/ApiConfig';
import { SourcesConfig } from '@/components/SourcesConfig';
import { RefreshConfig } from '@/components/RefreshConfig';
import { CrawlErrors } from '@/components/CrawlErrors';
import { CountdownConfig } from '@/components/CountdownConfig';
import { ScrapeDebugger } from '@/components/ScrapeDebugger';
import { TransferDataDebugger } from '@/components/TransferDataDebugger';
import { Settings, Globe, RefreshCw, AlertTriangle, Clock, Search, Database } from 'lucide-react';
import { Transfer } from '@/types/transfer';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { TransferIntegrationService } from '@/utils/transferIntegration';

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
    <div className="min-h-screen" style={{ backgroundColor: '#2F517A' }}>
      <AdminNavigation />
      <AppHeader lastUpdated={lastUpdated} />

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-300">Manage transfer data sources, API settings, and system configuration</p>
        </div>

        {/* Admin Management Tabs */}
        <Tabs defaultValue="scrape-debug" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 backdrop-blur-md border-slate-700">
            <TabsTrigger value="scrape-debug" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Scrape Debug
            </TabsTrigger>
            <TabsTrigger value="sources" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Sources
            </TabsTrigger>
            <TabsTrigger value="refresh" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Scrape
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              API
            </TabsTrigger>
            <TabsTrigger value="errors" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Errors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scrape-debug">
            <ScrapeDebugger />
          </TabsContent>

          <TabsContent value="sources">
            <SourcesConfig />
          </TabsContent>

          <TabsContent value="refresh">
            <RefreshConfig
              autoScrapeInterval={autoScrapeInterval}
              setAutoScrapeInterval={setAutoScrapeInterval}
              isAutoScrapeEnabled={isAutoScrapeEnabled}
              setIsAutoScrapeEnabled={setIsAutoScrapeEnabled}
              lastScrapeTime={lastScrapeTime}
              onManualScrape={handleManualScrape}
            />
          </TabsContent>

          <TabsContent value="api">
            <ApiConfig 
              refreshRate={refreshRate}
              setRefreshRate={setRefreshRate}
              isAutoRefresh={isAutoRefresh}
              setIsAutoRefresh={setIsAutoRefresh}
              onManualRefresh={handleManualRefresh}
              countdownTarget={countdownTarget}
              setCountdownTarget={setCountdownTarget}
              autoScrapeInterval={autoScrapeInterval}
              setAutoScrapeInterval={setAutoScrapeInterval}
              isAutoScrapeEnabled={isAutoScrapeEnabled}
              setIsAutoScrapeEnabled={setIsAutoScrapeEnabled}
              scrapeErrors={scrapeErrors}
              lastScrapeTime={lastScrapeTime}
              onManualScrape={handleManualScrape}
              onClearScrapeErrors={clearScrapeErrors}
            />
          </TabsContent>

          <TabsContent value="errors">
            <CrawlErrors 
              scrapeErrors={scrapeErrors}
              onClearScrapeErrors={clearScrapeErrors}
            />
          </TabsContent>
        </Tabs>

        {/* Countdown Configuration Section */}
        <div className="mt-8">
          <CountdownConfig
            countdownTarget={countdownTarget}
            setCountdownTarget={setCountdownTarget}
          />
        </div>
      </div>
    </div>
  );
};

export default Admin;

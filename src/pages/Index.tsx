
import React, { useState, useEffect } from 'react';
import { TransferCountdown } from '@/components/TransferCountdown';
import { UrlManager } from '@/components/UrlManager';
import { TransferResults } from '@/components/TransferResults';
import { ApiKeyManager } from '@/components/ApiKeyManager';
import { RefreshControl } from '@/components/RefreshControl';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const [refreshRate, setRefreshRate] = useState(300000); // 5 minutes default
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoRefresh) {
      interval = setInterval(() => {
        setLastUpdated(new Date());
        console.log('Auto-refreshing transfer data...');
      }, refreshRate);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoRefresh, refreshRate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
      {/* Header */}
      <header className="bg-slate-800/90 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">PlanetSport Transfers</h1>
              <p className="text-gray-300 text-sm">Live Transfer Tracking</p>
            </div>
            <div className="text-right text-white">
              <p className="text-sm opacity-80">Last Updated</p>
              <p className="text-xs">{lastUpdated.toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Transfer Window Countdown */}
        <Card className="mb-8 bg-slate-800/50 backdrop-blur-md border-slate-700">
          <div className="p-6">
            <TransferCountdown />
          </div>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="transfers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border border-slate-700">
            <TabsTrigger value="transfers" className="text-gray-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              Live Transfers
            </TabsTrigger>
            <TabsTrigger value="sources" className="text-gray-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              Sources
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-gray-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              Settings
            </TabsTrigger>
            <TabsTrigger value="api" className="text-gray-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              API Config
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transfers" className="space-y-6">
            <RefreshControl
              refreshRate={refreshRate}
              setRefreshRate={setRefreshRate}
              isAutoRefresh={isAutoRefresh}
              setIsAutoRefresh={setIsAutoRefresh}
              onManualRefresh={() => setLastUpdated(new Date())}
            />
            <TransferResults lastUpdated={lastUpdated} />
          </TabsContent>

          <TabsContent value="sources">
            <UrlManager />
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Transfer Settings</h3>
                <div className="space-y-4 text-white">
                  <div>
                    <label className="block text-sm font-medium mb-2">Date Range</label>
                    <p className="text-sm text-gray-300">June 1, 2025 - September 1, 2025</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Transfer Type</label>
                    <p className="text-sm text-gray-300">Players arriving at clubs only</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <ApiKeyManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;

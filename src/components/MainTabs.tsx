
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { RefreshControl } from '@/components/RefreshControl';
import { TransferResults } from '@/components/TransferResults';
import { CompletedTransfers } from '@/components/CompletedTransfers';
import { UrlManager } from '@/components/UrlManager';
import { CountdownSettings } from '@/components/CountdownSettings';
import { ApiKeyManager } from '@/components/ApiKeyManager';

interface Transfer {
  id: string;
  playerName: string;
  fromClub: string;
  toClub: string;
  fee: string;
  date: string;
  source: string;
  status: 'confirmed' | 'rumored' | 'pending';
}

interface MainTabsProps {
  refreshRate: number;
  setRefreshRate: (rate: number) => void;
  isAutoRefresh: boolean;
  setIsAutoRefresh: (auto: boolean) => void;
  onManualRefresh: () => void;
  lastUpdated: Date;
  countdownTarget: string;
  setCountdownTarget: (target: string) => void;
  mockTransfers: Transfer[];
}

export const MainTabs: React.FC<MainTabsProps> = ({
  refreshRate,
  setRefreshRate,
  isAutoRefresh,
  setIsAutoRefresh,
  onManualRefresh,
  lastUpdated,
  countdownTarget,
  setCountdownTarget,
  mockTransfers
}) => {
  return (
    <Tabs defaultValue="transfers" className="space-y-4 sm:space-y-6">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 bg-white/90 border border-gray-200/50 shadow-sm gap-0.5 sm:gap-0 h-auto p-1">
        <TabsTrigger value="transfers" className="text-xs sm:text-sm text-gray-600 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm px-2 py-2 sm:px-3">
          Live Transfers
        </TabsTrigger>
        <TabsTrigger value="completed" className="text-xs sm:text-sm text-gray-600 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm px-2 py-2 sm:px-3">
          Completed
        </TabsTrigger>
        <TabsTrigger value="sources" className="text-xs sm:text-sm text-gray-600 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm px-2 py-2 sm:px-3 col-span-2 sm:col-span-1">
          Sources
        </TabsTrigger>
        <TabsTrigger value="settings" className="text-xs sm:text-sm text-gray-600 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm px-2 py-2 sm:px-3 lg:col-span-1 col-span-1">
          Settings
        </TabsTrigger>
        <TabsTrigger value="api" className="text-xs sm:text-sm text-gray-600 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm px-2 py-2 sm:px-3 lg:col-span-1 col-span-1">
          API Config
        </TabsTrigger>
      </TabsList>

      <TabsContent value="transfers" className="space-y-4 sm:space-y-6">
        <RefreshControl
          refreshRate={refreshRate}
          setRefreshRate={setRefreshRate}
          isAutoRefresh={isAutoRefresh}
          setIsAutoRefresh={setIsAutoRefresh}
          onManualRefresh={onManualRefresh}
        />
        <TransferResults lastUpdated={lastUpdated} />
      </TabsContent>

      <TabsContent value="completed">
        <CompletedTransfers transfers={mockTransfers} />
      </TabsContent>

      <TabsContent value="sources">
        <UrlManager />
      </TabsContent>

      <TabsContent value="settings" className="space-y-4 sm:space-y-6">
        <CountdownSettings 
          targetDate={countdownTarget}
          onDateChange={setCountdownTarget}
        />
        
        <Card className="bg-white/95 backdrop-blur-md border-gray-200/50 shadow-lg">
          <div className="p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Transfer Settings</h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <p className="text-sm text-gray-600">June 1, 2025 - September 1, 2025</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transfer Type</label>
                <p className="text-sm text-gray-600">Players arriving at clubs only</p>
              </div>
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="api">
        <ApiKeyManager />
      </TabsContent>
    </Tabs>
  );
};

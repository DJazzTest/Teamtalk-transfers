
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
    <Tabs defaultValue="transfers" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5 bg-white/90 border border-gray-200/50 shadow-sm">
        <TabsTrigger value="transfers" className="text-gray-600 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm">
          Live Transfers
        </TabsTrigger>
        <TabsTrigger value="completed" className="text-gray-600 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm">
          Completed
        </TabsTrigger>
        <TabsTrigger value="sources" className="text-gray-600 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm">
          Sources
        </TabsTrigger>
        <TabsTrigger value="settings" className="text-gray-600 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm">
          Settings
        </TabsTrigger>
        <TabsTrigger value="api" className="text-gray-600 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm">
          API Config
        </TabsTrigger>
      </TabsList>

      <TabsContent value="transfers" className="space-y-6">
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

      <TabsContent value="settings" className="space-y-6">
        <CountdownSettings 
          targetDate={countdownTarget}
          onDateChange={setCountdownTarget}
        />
        
        <Card className="bg-white/95 backdrop-blur-md border-gray-200/50 shadow-lg">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Transfer Settings</h3>
            <div className="space-y-4">
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

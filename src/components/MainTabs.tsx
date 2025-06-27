import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TransferResults } from './TransferResults';
import { CompletedTransfers } from './CompletedTransfers';
import { TeamTransferView } from './TeamTransferView';
import { ApiConfig } from './ApiConfig';
import { SourcesConfig } from './SourcesConfig';
import { RefreshConfig } from './RefreshConfig';
import { CrawlErrors } from './CrawlErrors';
import { CountdownConfig } from './CountdownConfig';

interface MainTabsProps {
  refreshRate: number;
  setRefreshRate: (rate: number) => void;
  isAutoRefresh: boolean;
  setIsAutoRefresh: (enabled: boolean) => void;
  onManualRefresh: () => void;
  lastUpdated: Date;
  countdownTarget: string;
  setCountdownTarget: (target: string) => void;
  mockTransfers: any[];
  autoScrapeInterval: number;
  setAutoScrapeInterval: (interval: number) => void;
  isAutoScrapeEnabled: boolean;
  setIsAutoScrapeEnabled: (enabled: boolean) => void;
  scrapeErrors: string[];
  lastScrapeTime: Date | null;
  onManualScrape: () => void;
  onClearScrapeErrors: () => void;
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
  mockTransfers,
  autoScrapeInterval,
  setAutoScrapeInterval,
  isAutoScrapeEnabled,
  setIsAutoScrapeEnabled,
  scrapeErrors,
  lastScrapeTime,
  onManualScrape,
  onClearScrapeErrors
}) => {
  return (
    <Tabs defaultValue="teams" className="w-full space-y-4">
      <TabsList className="grid w-full grid-cols-6 lg:grid-cols-6 bg-slate-800/50 backdrop-blur-md border-slate-700">
        <TabsTrigger value="teams" className="text-white data-[state=active]:bg-slate-700 data-[state=active]:text-white">
          Teams
        </TabsTrigger>
        <TabsTrigger value="transfers" className="text-white data-[state=active]:bg-slate-700 data-[state=active]:text-white">
          All Transfers
        </TabsTrigger>
        <TabsTrigger value="completed" className="text-white data-[state=active]:bg-slate-700 data-[state=active]:text-white">
          Completed
        </TabsTrigger>
        <TabsTrigger value="api" className="text-white data-[state=active]:bg-slate-700 data-[state=active]:text-white">
          API Config
        </TabsTrigger>
        <TabsTrigger value="sources" className="text-white data-[state=active]:bg-slate-700 data-[state=active]:text-white">
          Sources
        </TabsTrigger>
        <TabsTrigger value="refresh" className="text-white data-[state=active]:bg-slate-700 data-[state=active]:text-white">
          Refresh
        </TabsTrigger>
      </TabsList>

      <TabsContent value="teams" className="space-y-4">
        <TeamTransferView transfers={mockTransfers} />
      </TabsContent>

      <TabsContent value="transfers" className="space-y-4">
        <TransferResults lastUpdated={lastUpdated} />
      </TabsContent>

      <TabsContent value="completed" className="space-y-4">
        <CompletedTransfers transfers={mockTransfers} />
      </TabsContent>

      <TabsContent value="api" className="space-y-4">
        <ApiConfig />
      </TabsContent>

      <TabsContent value="sources" className="space-y-4">
        <SourcesConfig />
      </TabsContent>

      <TabsContent value="refresh" className="space-y-4">
        <RefreshConfig
          refreshRate={refreshRate}
          setRefreshRate={setRefreshRate}
          isAutoRefresh={isAutoRefresh}
          setIsAutoRefresh={setIsAutoRefresh}
          onManualRefresh={onManualRefresh}
          autoScrapeInterval={autoScrapeInterval}
          setAutoScrapeInterval={setAutoScrapeInterval}
          isAutoScrapeEnabled={isAutoScrapeEnabled}
          setIsAutoScrapeEnabled={setIsAutoScrapeEnabled}
          lastScrapeTime={lastScrapeTime}
          onManualScrape={onManualScrape}
        />
        <CountdownConfig
          countdownTarget={countdownTarget}
          setCountdownTarget={setCountdownTarget}
        />
        {scrapeErrors.length > 0 && (
          <CrawlErrors
            scrapeErrors={scrapeErrors}
            onClearScrapeErrors={onClearScrapeErrors}
          />
        )}
      </TabsContent>
    </Tabs>
  );
};

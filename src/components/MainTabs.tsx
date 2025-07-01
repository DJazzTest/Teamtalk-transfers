
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Settings, Globe } from 'lucide-react';
import { TeamTransferView } from './TeamTransferView';
import { TransferResults } from './TransferResults';
import { RefreshConfig } from './RefreshConfig';
import { SourcesConfig } from './SourcesConfig';
import { Transfer } from '@/types/transfer';
import { League } from '@/hooks/useLeagueData';

interface MainTabsProps {
  transfers: Transfer[];
  lastUpdated: Date;
  currentLeague: League;
  // Refresh control props
  refreshRate: number;
  setRefreshRate: (rate: number) => void;
  isAutoRefresh: boolean;
  setIsAutoRefresh: (enabled: boolean) => void;
  onManualRefresh: () => void;
  countdownTarget: string;
  setCountdownTarget: (target: string) => void;
  // Auto-scraping props
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
  transfers, 
  lastUpdated, 
  currentLeague,
  refreshRate,
  setRefreshRate,
  isAutoRefresh,
  setIsAutoRefresh,
  onManualRefresh,
  countdownTarget,
  setCountdownTarget,
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
    <Tabs defaultValue="teams" className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 backdrop-blur-md border-slate-700">
        <TabsTrigger value="teams" className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Teams
        </TabsTrigger>
        <TabsTrigger value="transfers" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          All Transfers
        </TabsTrigger>
        <TabsTrigger value="sources" className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Sources
        </TabsTrigger>
        <TabsTrigger value="api" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          API Config
        </TabsTrigger>
      </TabsList>

      <TabsContent value="teams">
        <TeamTransferView transfers={transfers} />
      </TabsContent>

      <TabsContent value="transfers">
        <TransferResults 
          lastUpdated={lastUpdated} 
          currentLeague={currentLeague}
        />
      </TabsContent>

      <TabsContent value="sources">
        <SourcesConfig />
      </TabsContent>

      <TabsContent value="api">
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
      </TabsContent>
    </Tabs>
  );
};

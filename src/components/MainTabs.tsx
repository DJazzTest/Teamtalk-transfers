
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Settings, Globe, Clock } from 'lucide-react';
import { TeamTransferView } from './TeamTransferView';
import { TransferResults } from './TransferResults';
import { ApiConfig } from './ApiConfig';
import { SourcesConfig } from './SourcesConfig';
import { TransferActivityLog } from './TransferActivityLog';
import { Transfer } from '@/types/transfer';
// Removed League type as championship is no longer supported

interface MainTabsProps {
  transfers: Transfer[];
  lastUpdated: Date;
  refreshRate: number;
  setRefreshRate: (rate: number) => void;
  isAutoRefresh: boolean;
  setIsAutoRefresh: (enabled: boolean) => void;
  onManualRefresh: () => void;
  countdownTarget: string;
  setCountdownTarget: (target: string) => void;
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
      <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 backdrop-blur-md border-slate-700">
        <TabsTrigger value="teams" className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Teams
        </TabsTrigger>
        <TabsTrigger value="transfers" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          All Transfers
        </TabsTrigger>
        <TabsTrigger value="activity" className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Activity
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
        />
      </TabsContent>

      <TabsContent value="activity">
        <TransferActivityLog />
      </TabsContent>

      <TabsContent value="sources">
        <SourcesConfig />
      </TabsContent>

      <TabsContent value="api">
        <ApiConfig 
          refreshRate={refreshRate}
          setRefreshRate={setRefreshRate}
          isAutoRefresh={isAutoRefresh}
          setIsAutoRefresh={setIsAutoRefresh}
          onManualRefresh={onManualRefresh}
          countdownTarget={countdownTarget}
          setCountdownTarget={setCountdownTarget}
          autoScrapeInterval={autoScrapeInterval}
          setAutoScrapeInterval={setAutoScrapeInterval}
          isAutoScrapeEnabled={isAutoScrapeEnabled}
          setIsAutoScrapeEnabled={setIsAutoScrapeEnabled}
          scrapeErrors={scrapeErrors}
          lastScrapeTime={lastScrapeTime}
          onManualScrape={onManualScrape}
          onClearScrapeErrors={onClearScrapeErrors}
        />
      </TabsContent>
    </Tabs>
  );
};

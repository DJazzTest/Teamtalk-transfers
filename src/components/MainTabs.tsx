
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeamTransferView } from './TeamTransferView';
import { TransferResults } from './TransferResults';
import { ApiConfig } from './ApiConfig';
import { SourcesConfig } from './SourcesConfig';
import { RefreshConfig } from './RefreshConfig';
import { CrawlErrors } from './CrawlErrors';
import { CountdownConfig } from './CountdownConfig';
import { ScrapeDebugger } from './ScrapeDebugger';
import { Shield, Users, Settings, Globe, RefreshCw, AlertTriangle, Clock, Search } from 'lucide-react';

interface MainTabsProps {
  refreshRate: number;
  setRefreshRate: (rate: number) => void;
  isAutoRefresh: boolean;
  setIsAutoRefresh: (enabled: boolean) => void;
  onManualRefresh: () => void;
  autoScrapeInterval: number;
  setAutoScrapeInterval: (interval: number) => void;
  isAutoScrapeEnabled: boolean;
  setIsAutoScrapeEnabled: (enabled: boolean) => void;
  lastScrapeTime: Date | null;
  onManualScrape: () => void;
  scrapeErrors: string[];
  onClearScrapeErrors: () => void;
  countdownTarget: string;
  setCountdownTarget: (target: string) => void;
  lastUpdated: Date;
}

export const MainTabs: React.FC<MainTabsProps> = (props) => {
  return (
    <Tabs defaultValue="teams" className="w-full">
      <TabsList className="grid w-full grid-cols-8 bg-slate-800/50 backdrop-blur-md border-slate-700">
        <TabsTrigger value="teams" className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Teams
        </TabsTrigger>
        <TabsTrigger value="transfers" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          All Transfers
        </TabsTrigger>
        <TabsTrigger value="debug" className="flex items-center gap-2">
          <Search className="w-4 h-4" />
          Debug
        </TabsTrigger>
        <TabsTrigger value="sources" className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Sources
        </TabsTrigger>
        <TabsTrigger value="refresh" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </TabsTrigger>
        <TabsTrigger value="api" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          API
        </TabsTrigger>
        <TabsTrigger value="errors" className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Errors
        </TabsTrigger>
        <TabsTrigger value="countdown" className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Countdown
        </TabsTrigger>
      </TabsList>

      <TabsContent value="teams">
        <TeamTransferView />
      </TabsContent>

      <TabsContent value="transfers">
        <TransferResults lastUpdated={props.lastUpdated} />
      </TabsContent>

      <TabsContent value="debug">
        <ScrapeDebugger />
      </TabsContent>

      <TabsContent value="sources">
        <SourcesConfig />
      </TabsContent>

      <TabsContent value="refresh">
        <RefreshConfig
          refreshRate={props.refreshRate}
          setRefreshRate={props.setRefreshRate}
          isAutoRefresh={props.isAutoRefresh}
          setIsAutoRefresh={props.setIsAutoRefresh}
          onManualRefresh={props.onManualRefresh}
          autoScrapeInterval={props.autoScrapeInterval}
          setAutoScrapeInterval={props.setAutoScrapeInterval}
          isAutoScrapeEnabled={props.isAutoScrapeEnabled}
          setIsAutoScrapeEnabled={props.setIsAutoScrapeEnabled}
          lastScrapeTime={props.lastScrapeTime}
          onManualScrape={props.onManualScrape}
        />
      </TabsContent>

      <TabsContent value="api">
        <ApiConfig />
      </TabsContent>

      <TabsContent value="errors">
        <CrawlErrors 
          scrapeErrors={props.scrapeErrors}
          onClearScrapeErrors={props.onClearScrapeErrors}
        />
      </TabsContent>

      <TabsContent value="countdown">
        <CountdownConfig
          countdownTarget={props.countdownTarget}
          setCountdownTarget={props.setCountdownTarget}
        />
      </TabsContent>
    </Tabs>
  );
};


import React from 'react';
import { Card } from '@/components/ui/card';
import { DataRefreshSection } from './DataRefreshSection';
import { AutoScrapeSection } from './AutoScrapeSection';
import { RefreshCw } from 'lucide-react';

interface RefreshConfigProps {
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
}

export const RefreshConfig: React.FC<RefreshConfigProps> = (props) => {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <RefreshCw className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Refresh Settings</h2>
          </div>
          <div className="space-y-6">
            <DataRefreshSection
              refreshRate={props.refreshRate}
              setRefreshRate={props.setRefreshRate}
              isAutoRefresh={props.isAutoRefresh}
              setIsAutoRefresh={props.setIsAutoRefresh}
              onManualRefresh={props.onManualRefresh}
            />
            <AutoScrapeSection
              autoScrapeInterval={props.autoScrapeInterval}
              setAutoScrapeInterval={props.setAutoScrapeInterval}
              isAutoScrapeEnabled={props.isAutoScrapeEnabled}
              setIsAutoScrapeEnabled={props.setIsAutoScrapeEnabled}
              lastScrapeTime={props.lastScrapeTime}
              onManualScrape={props.onManualScrape}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

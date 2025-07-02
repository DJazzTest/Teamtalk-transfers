
import React from 'react';
import { Card } from '@/components/ui/card';
import { AutoScrapeSection } from './AutoScrapeSection';
import { Globe } from 'lucide-react';

interface RefreshConfigProps {
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
            <div className="bg-green-500/20 p-2 rounded-lg">
              <Globe className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Scrape Settings</h2>
          </div>
          <AutoScrapeSection
            autoScrapeInterval={props.autoScrapeInterval}
            setAutoScrapeInterval={props.setAutoScrapeInterval}
            isAutoScrapeEnabled={props.isAutoScrapeEnabled}
            setIsAutoScrapeEnabled={props.setIsAutoScrapeEnabled}
            lastScrapeTime={props.lastScrapeTime}
            onManualScrape={props.onManualScrape}
          />
        </div>
      </Card>
    </div>
  );
};

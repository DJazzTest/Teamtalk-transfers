
import React from 'react';
import { Card } from '@/components/ui/card';
import { ErrorDisplay } from './ErrorDisplay';
import { DataRefreshSection } from './DataRefreshSection';
import { AutoScrapeSection } from './AutoScrapeSection';

interface RefreshControlProps {
  refreshRate: number;
  setRefreshRate: (rate: number) => void;
  isAutoRefresh: boolean;
  setIsAutoRefresh: (auto: boolean) => void;
  onManualRefresh: () => void;
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

export const RefreshControl: React.FC<RefreshControlProps> = ({
  refreshRate,
  setRefreshRate,
  isAutoRefresh,
  setIsAutoRefresh,
  onManualRefresh,
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
    <div className="space-y-4">
      <ErrorDisplay 
        scrapeErrors={scrapeErrors}
        onClearScrapeErrors={onClearScrapeErrors}
      />

      <Card className="bg-white/70 backdrop-blur-md border-gray-200/50 shadow-lg">
        <div className="p-3 sm:p-4">
          <div className="space-y-4">
            <DataRefreshSection
              refreshRate={refreshRate}
              setRefreshRate={setRefreshRate}
              isAutoRefresh={isAutoRefresh}
              setIsAutoRefresh={setIsAutoRefresh}
              onManualRefresh={onManualRefresh}
            />

            <AutoScrapeSection
              autoScrapeInterval={autoScrapeInterval}
              setAutoScrapeInterval={setAutoScrapeInterval}
              isAutoScrapeEnabled={isAutoScrapeEnabled}
              setIsAutoScrapeEnabled={setIsAutoScrapeEnabled}
              lastScrapeTime={lastScrapeTime}
              onManualScrape={onManualScrape}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

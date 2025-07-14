
import React from 'react';
import { Card } from '@/components/ui/card';
import { ApiKeyManager } from './ApiKeyManager';
import ApiEndpointManager from './ApiEndpointManager';
import { RefreshConfig } from './RefreshConfig';
import { CountdownConfig } from './CountdownConfig';
import { CrawlErrors } from './CrawlErrors';
import { Settings } from 'lucide-react';

interface ApiConfigProps {
  refreshRate: number;
  setRefreshRate: (rate: number) => void;
  isAutoRefresh: boolean;
  setIsAutoRefresh: (enabled: boolean) => void;
  onManualRefresh: () => void;
  autoScrapeInterval: number;
  setAutoScrapeInterval: (interval: number) => void;
  isAutoScrapeEnabled: boolean;
  setIsAutoScrapeEnabled: (enabled: boolean) => void;
  scrapeErrors: string[];
  lastScrapeTime: Date | null;
  onManualScrape: () => void;
  onClearScrapeErrors: () => void;
}

export const ApiConfig: React.FC<ApiConfigProps> = ({
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
    <div className="space-y-6">
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <Settings className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">API Configuration</h2>
          </div>
          <ApiKeyManager />
        </div>
      </Card>

      {/* Custom API Endpoints Manager */}
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700 mt-6">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Custom Transfer APIs</h3>
          <ApiEndpointManager />
        </div>
      </Card>

      <RefreshConfig
        autoScrapeInterval={autoScrapeInterval}
        setAutoScrapeInterval={setAutoScrapeInterval}
        isAutoScrapeEnabled={isAutoScrapeEnabled}
        setIsAutoScrapeEnabled={setIsAutoScrapeEnabled}
        lastScrapeTime={lastScrapeTime}
        onManualScrape={onManualScrape}
      />

      {scrapeErrors.length > 0 && (
        <CrawlErrors
          scrapeErrors={scrapeErrors}
          onClearScrapeErrors={onClearScrapeErrors}
        />
      )}
    </div>
  );
};

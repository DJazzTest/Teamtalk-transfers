
import React from 'react';
import { Card } from '@/components/ui/card';
import { ApiKeyManager } from './ApiKeyManager';
import { Settings } from 'lucide-react';
import { Transfer } from '@/types/transfer';

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
  lastScrapeTime: Date | null;
  onManualScrape: () => void;
  scrapeErrors: string[];
  onClearScrapeErrors: () => void;
  countdownTarget: string;
  setCountdownTarget: (target: string) => void;
  lastUpdated: Date;
  transfers: Transfer[];
}

export const ApiConfig: React.FC<ApiConfigProps> = () => {
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
    </div>
  );
};

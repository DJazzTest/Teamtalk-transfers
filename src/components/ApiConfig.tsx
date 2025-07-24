
import React from 'react';
import { Card } from '@/components/ui/card';
import { ApiKeyManager } from './ApiKeyManager';
import ApiEndpointManager from './ApiEndpointManager';
import { RefreshConfig } from './RefreshConfig';
import { CountdownConfig } from './CountdownConfig';
import { CrawlErrors } from './CrawlErrors';
import { Settings } from 'lucide-react';

interface ApiConfigProps {
  // No props needed unless ApiKeyManager requires them
}

export const ApiConfig: React.FC = () => {
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

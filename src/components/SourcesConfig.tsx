
import React from 'react';
import { Card } from '@/components/ui/card';
import { UrlManager } from './UrlManager';
import { Globe } from 'lucide-react';

export const SourcesConfig: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-500/20 p-2 rounded-lg">
              <Globe className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Transfer Sources</h2>
          </div>
          <UrlManager />
        </div>
      </Card>
    </div>
  );
};

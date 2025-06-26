
import React from 'react';
import { Card } from '@/components/ui/card';
import { Globe, CheckCircle, AlertCircle } from 'lucide-react';
import { CrawlStatus } from '@/types/transfer';

interface CrawlStatusDisplayProps {
  crawlStatuses: CrawlStatus[];
}

export const CrawlStatusDisplay: React.FC<CrawlStatusDisplayProps> = ({ crawlStatuses }) => {
  if (crawlStatuses.length === 0) return null;

  return (
    <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          URL Crawl Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
          {crawlStatuses.map((status, index) => (
            <div
              key={index}
              className="flex items-center gap-3 bg-slate-700/50 rounded-lg p-3"
            >
              <div className="flex-shrink-0">
                {status.status === 'success' && (
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                )}
                {status.status === 'error' && (
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                )}
                {status.status === 'pending' && (
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{status.url}</p>
                {status.error && (
                  <p className="text-red-400 text-xs truncate" title={status.error}>
                    {status.error}
                  </p>
                )}
              </div>
              {status.status === 'success' && (
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              )}
              {status.status === 'error' && (
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};


import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';

interface CrawlErrorsProps {
  scrapeErrors: string[];
  onClearScrapeErrors: () => void;
}

export const CrawlErrors: React.FC<CrawlErrorsProps> = ({ 
  scrapeErrors, 
  onClearScrapeErrors 
}) => {
  return (
    <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/20 p-2 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Scrape Errors</h3>
          </div>
          <Button
            onClick={onClearScrapeErrors}
            variant="outline"
            size="sm"
            className="text-gray-300 border-slate-600 hover:bg-slate-600"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {scrapeErrors.map((error, index) => (
            <div key={index} className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Globe, Play, Pause, Clock } from 'lucide-react';

interface AutoScrapeSectionProps {
  autoScrapeInterval: number;
  setAutoScrapeInterval: (interval: number) => void;
  isAutoScrapeEnabled: boolean;
  setIsAutoScrapeEnabled: (enabled: boolean) => void;
  lastScrapeTime: Date | null;
  onManualScrape: () => void;
}

export const AutoScrapeSection: React.FC<AutoScrapeSectionProps> = ({
  autoScrapeInterval,
  setAutoScrapeInterval,
  isAutoScrapeEnabled,
  setIsAutoScrapeEnabled,
  lastScrapeTime,
  onManualScrape
}) => {
  const [isScraping, setIsScraping] = useState(false);

  const scrapeIntervalOptions = [
    { value: 0, label: 'None' },
    { value: 900000, label: '15 minutes' },
    { value: 1800000, label: '30 minutes' },
    { value: 3600000, label: '1 hour' },
    { value: 7200000, label: '2 hours' }
  ];

  const handleScrapeClick = async () => {
    console.log('🔍 Manual Scrape button clicked - triggering scrape');
    setIsScraping(true);
    
    try {
      await onManualScrape();
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div className="space-y-3 border-t pt-3">
      <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <Globe className="w-4 h-4" />
        Auto URL Scraping
        {lastScrapeTime && (
          <span className="text-xs text-gray-500">
            (Last: {lastScrapeTime.toLocaleTimeString()})
          </span>
        )}
      </h3>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <Switch
            checked={isAutoScrapeEnabled}
            onCheckedChange={setIsAutoScrapeEnabled}
          />
          <span className="text-gray-700 text-sm">
            {isAutoScrapeEnabled ? <Play className="w-4 h-4 text-green-600" /> : <Pause className="w-4 h-4 text-red-500" />}
          </span>
          <span className="text-gray-700 text-sm">Auto Scrape</span>
          {isAutoScrapeEnabled && autoScrapeInterval > 0 && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <Clock className="w-3 h-3" />
              <span>Active</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-gray-700 text-sm whitespace-nowrap">Every:</span>
          <Select
            value={autoScrapeInterval.toString()}
            onValueChange={(value) => setAutoScrapeInterval(Number(value))}
          >
            <SelectTrigger className="w-full sm:w-32 bg-white border-gray-300 text-gray-700 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {scrapeIntervalOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button
          onClick={handleScrapeClick}
          disabled={isScraping}
          className="bg-green-600 hover:bg-green-700 text-white shadow-sm w-full sm:w-auto"
          size="sm"
        >
          <Globe className={`w-4 h-4 mr-2 ${isScraping ? 'animate-spin' : ''}`} />
          {isScraping ? 'Scraping...' : 'Scrape Now'}
        </Button>
      </div>
    </div>
  );
};

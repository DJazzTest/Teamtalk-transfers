
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Play, Pause, Clock, Globe, AlertTriangle, X } from 'lucide-react';

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
  const refreshOptions = [
    { value: 60000, label: '1 minute' },
    { value: 300000, label: '5 minutes' },
    { value: 600000, label: '10 minutes' },
    { value: 1800000, label: '30 minutes' },
    { value: 3600000, label: '1 hour' }
  ];

  const scrapeIntervalOptions = [
    { value: 0, label: 'None' },
    { value: 300000, label: '5 minutes' },
    { value: 900000, label: '15 minutes' },
    { value: 1500000, label: '25 minutes' },
    { value: 3600000, label: '1 hour' },
    { value: 7200000, label: '2 hours' }
  ];

  const handleRefreshClick = () => {
    console.log('Refresh Now button clicked');
    onManualRefresh();
  };

  const handleScrapeClick = () => {
    console.log('Scrape Now button clicked');
    onManualScrape();
  };

  return (
    <div className="space-y-4">
      {/* Scrape Errors */}
      {scrapeErrors.length > 0 && (
        <Alert className="bg-red-50 border-red-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
              <div className="flex-1">
                <AlertDescription className="text-red-800">
                  <div className="font-medium mb-1">URL Scraping Errors:</div>
                  <ul className="text-sm space-y-1">
                    {scrapeErrors.map((error, index) => (
                      <li key={index} className="text-red-700">• {error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearScrapeErrors}
              className="text-red-600 hover:text-red-800 hover:bg-red-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Alert>
      )}

      {/* Main Controls */}
      <Card className="bg-white/70 backdrop-blur-md border-gray-200/50 shadow-lg">
        <div className="p-3 sm:p-4">
          <div className="space-y-4">
            {/* Data Refresh Controls */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Data Refresh
              </h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isAutoRefresh}
                    onCheckedChange={setIsAutoRefresh}
                  />
                  <span className="text-gray-700 text-sm">
                    {isAutoRefresh ? <Play className="w-4 h-4 text-green-600" /> : <Pause className="w-4 h-4 text-red-500" />}
                  </span>
                  <span className="text-gray-700 text-sm">Auto Refresh</span>
                  {isAutoRefresh && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <Clock className="w-3 h-3" />
                      <span>Active</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-gray-700 text-sm whitespace-nowrap">Every:</span>
                  <Select
                    value={refreshRate.toString()}
                    onValueChange={(value) => setRefreshRate(Number(value))}
                  >
                    <SelectTrigger className="w-full sm:w-32 bg-white border-gray-300 text-gray-700 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {refreshOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  onClick={handleRefreshClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm w-full sm:w-auto"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Now
                </Button>
              </div>
            </div>

            {/* Auto-Scraping Controls */}
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
                  className="bg-green-600 hover:bg-green-700 text-white shadow-sm w-full sm:w-auto"
                  size="sm"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Scrape Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

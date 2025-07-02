import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AutoScrapeService } from '@/utils/transferDetection/autoScrapeService';
import { useToast } from '@/hooks/use-toast';
import { Zap, Target, Clock, TrendingUp } from 'lucide-react';

interface EnhancedScrapeControlsProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const EnhancedScrapeControls: React.FC<EnhancedScrapeControlsProps> = ({
  isEnabled,
  onToggle
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<{
    transfersFound: number;
    sources: number;
    timestamp: Date;
  } | null>(null);
  const { toast } = useToast();

  const handleEnhancedScrape = async () => {
    setIsRunning(true);
    
    try {
      toast({
        title: "Enhanced Scrape Started",
        description: "Running targeted search for latest transfers...",
      });

      const result = await AutoScrapeService.performEnhancedScrape();
      
      if (result.success) {
        setLastResult({
          transfersFound: result.transfersFound,
          sources: result.sources.length,
          timestamp: new Date()
        });
        
        toast({
          title: "Enhanced Scrape Complete",
          description: `Found ${result.transfersFound} transfers from ${result.sources.length} sources`,
        });
        
        // Trigger refresh
        window.dispatchEvent(new CustomEvent('manualRefresh'));
      } else {
        toast({
          title: "Enhanced Scrape Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Enhanced Scrape Error",
        description: "Failed to run enhanced scrape",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleScheduleToggle = (enabled: boolean) => {
    onToggle(enabled);
    
    if (enabled) {
      AutoScrapeService.schedulePeriodicScrape(30); // Every 30 minutes
      toast({
        title: "Auto-Scrape Enabled",
        description: "Enhanced transfer detection will run every 30 minutes",
      });
    } else {
      toast({
        title: "Auto-Scrape Disabled",
        description: "Periodic enhanced scraping has been stopped",
      });
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Zap className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Enhanced Transfer Detection</h3>
            <p className="text-sm text-gray-600">AI-powered transfer hunting with targeted search patterns</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Confirmed Transfers</span>
            </div>
            <p className="text-xs text-gray-600">Official announcements & done deals</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">Breaking News</span>
            </div>
            <p className="text-xs text-gray-600">Fabrizio Romano & insider sources</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Real-time Monitoring</span>
            </div>
            <p className="text-xs text-gray-600">30+ official sources tracked</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleEnhancedScrape}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              {isRunning ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {isRunning ? 'Hunting Transfers...' : 'Run Enhanced Scrape'}
            </Button>

            <div className="flex items-center gap-2">
              <Switch
                checked={isEnabled}
                onCheckedChange={handleScheduleToggle}
                id="auto-enhanced-scrape"
              />
              <label htmlFor="auto-enhanced-scrape" className="text-sm font-medium text-gray-700">
                Auto-Schedule
              </label>
            </div>
          </div>

          {lastResult && (
            <div className="flex gap-2">
              <Badge className="bg-green-100 text-green-800">
                {lastResult.transfersFound} transfers found
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                {lastResult.sources} sources
              </Badge>
              <Badge className="bg-gray-100 text-gray-600">
                {lastResult.timestamp.toLocaleTimeString()}
              </Badge>
            </div>
          )}
        </div>

        {isEnabled && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800">Auto-Enhanced Scraping Active</span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Monitoring 30+ sources every 30 minutes for confirmed transfers, breaking news, and reliable rumors
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
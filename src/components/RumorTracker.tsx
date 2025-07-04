import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AutoScrapeService } from '@/utils/transferDetection/autoScrapeService';
import { TrendingUp, Filter, Bell, Star } from 'lucide-react';
import { Transfer } from '@/types/transfer';

interface RumorTrackerProps {
  transfers: Transfer[];
  onFiltersChange: (filters: any) => void;
}

export const RumorTracker: React.FC<RumorTrackerProps> = ({ transfers, onFiltersChange }) => {
  const [filters, setFilters] = useState({
    minFee: 0,
    minConfidence: 50,
    clubs: [] as string[],
    positions: [] as string[]
  });
  const [isAutoScrapeEnabled, setIsAutoScrapeEnabled] = useState(false);
  const { toast } = useToast();

  // Listen for new transfer notifications
  useEffect(() => {
    const handleNewTransfers = (event: CustomEvent) => {
      toast({
        title: "🚨 Breaking Transfer News!",
        description: event.detail.message,
        duration: 5000
      });
    };

    window.addEventListener('newTransfersFound', handleNewTransfers as EventListener);
    return () => window.removeEventListener('newTransfersFound', handleNewTransfers as EventListener);
  }, [toast]);

  const startAutoScraping = async () => {
    setIsAutoScrapeEnabled(true);
    await AutoScrapeService.schedulePeriodicScrape(15); // Every 15 minutes
    
    toast({
      title: "Auto-Scraping Enabled",
      description: "Now monitoring transfer news every 15 minutes",
    });
  };

  const stopAutoScraping = () => {
    setIsAutoScrapeEnabled(false);
    toast({
      title: "Auto-Scraping Disabled",
      description: "Stopped monitoring transfer news",
    });
  };

  const applyFilters = () => {
    const filteredTransfers = AutoScrapeService.filterTransfers(transfers, filters);
    onFiltersChange({ ...filters, filtered: filteredTransfers });
    
    toast({
      title: "Filters Applied",
      description: `Found ${filteredTransfers.length} transfers matching criteria`,
    });
  };

  const getConfidenceBadge = (source: string) => {
    const confidence = AutoScrapeService.calculateConfidenceScore(source);
    if (confidence >= 80) return <Badge className="bg-green-600 text-white text-xs">TIER 1</Badge>;
    if (confidence >= 60) return <Badge className="bg-yellow-600 text-white text-xs">TIER 2</Badge>;
    if (confidence >= 40) return <Badge className="bg-orange-600 text-white text-xs">TIER 3</Badge>;
    return <Badge className="bg-red-600 text-white text-xs">TIER 4</Badge>;
  };

  const rumors = transfers.filter(t => t.status === 'rumored');
  const highConfidenceRumors = rumors.filter(r => AutoScrapeService.calculateConfidenceScore(r.source) >= 70);

  return (
    <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Enhanced Rumor Tracker</h3>
            <Badge className="bg-blue-600 text-white">
              {highConfidenceRumors.length} High Confidence
            </Badge>
          </div>
          
          <div className="flex gap-2">
            {!isAutoScrapeEnabled ? (
              <Button onClick={startAutoScraping} className="bg-green-600 hover:bg-green-700">
                <Bell className="w-4 h-4 mr-2" />
                Start Auto-Monitoring
              </Button>
            ) : (
              <Button onClick={stopAutoScraping} variant="outline" className="border-red-500 text-red-400">
                <Bell className="w-4 h-4 mr-2" />
                Stop Monitoring
              </Button>
            )}
          </div>
        </div>

        {/* Smart Filters */}
        <Card className="bg-slate-700/50 border-slate-600 mb-6">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-blue-400" />
              <span className="text-white font-medium">Smart Filters</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Min Fee (£M)</label>
                <Input
                  type="number"
                  value={filters.minFee}
                  onChange={(e) => setFilters({...filters, minFee: Number(e.target.value)})}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="10"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Min Confidence</label>
                <Select value={filters.minConfidence.toString()} onValueChange={(v) => setFilters({...filters, minConfidence: Number(v)})}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="80">Tier 1 Only (80%+)</SelectItem>
                    <SelectItem value="60">Tier 2+ (60%+)</SelectItem>
                    <SelectItem value="40">Tier 3+ (40%+)</SelectItem>
                    <SelectItem value="20">All Sources (20%+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-2 flex items-end">
                <Button onClick={applyFilters} className="bg-blue-600 hover:bg-blue-700 w-full">
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* High Confidence Rumors */}
        {highConfidenceRumors.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              High Confidence Rumors
            </h4>
            {highConfidenceRumors.slice(0, 5).map((rumor) => (
              <Card key={rumor.id} className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-500/30">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-bold text-white">{rumor.playerName}</h5>
                    <div className="flex gap-2">
                      {getConfidenceBadge(rumor.source)}
                      <Badge className="bg-blue-600 text-white text-xs">{rumor.fee}</Badge>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">
                    {rumor.fromClub} → {rumor.toClub}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Source: {rumor.source} • {new Date(rumor.date).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Monitoring Status */}
        <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">Auto-Monitoring Status:</span>
            <span className={`font-medium ${isAutoScrapeEnabled ? 'text-green-400' : 'text-gray-400'}`}>
              {isAutoScrapeEnabled ? '🟢 Active (15min intervals)' : '🔴 Inactive'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-300">Total Rumors Tracked:</span>
            <span className="font-medium text-blue-400">{rumors.length}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
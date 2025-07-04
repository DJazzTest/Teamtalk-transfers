import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Rss, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

interface RssFeed {
  name: string;
  url: string;
  category: 'official' | 'news' | 'api';
  status: 'active' | 'inactive' | 'error';
}

export const RssIntegration = () => {
  const [feeds, setFeeds] = useState<RssFeed[]>([
    // Official Club RSS Feeds
    { name: 'Arsenal Official', url: 'https://www.arsenal.com/feed', category: 'official', status: 'inactive' },
    { name: 'Chelsea Official', url: 'https://www.chelseafc.com/en/feeds/news', category: 'official', status: 'inactive' },
    { name: 'Liverpool Official', url: 'https://www.liverpoolfc.com/news/rss', category: 'official', status: 'inactive' },
    { name: 'Man United Official', url: 'https://www.manutd.com/en/feeds/first-team-news', category: 'official', status: 'inactive' },
    
    // Transfer News RSS
    { name: 'BBC Sport Football', url: 'https://feeds.bbci.co.uk/sport/football/rss.xml', category: 'news', status: 'inactive' },
    { name: 'Sky Sports Transfers', url: 'https://www.skysports.com/rss/12040', category: 'news', status: 'inactive' },
    { name: 'Goal.com Transfers', url: 'https://www.goal.com/feeds/en/news?fmt=rss', category: 'news', status: 'inactive' },
    
    // API Sources (simulated)
    { name: 'TransferMarkt API', url: 'https://api.transfermarkt.com/v1/transfers', category: 'api', status: 'inactive' },
    { name: 'Football-Data API', url: 'https://api.football-data.org/v2/transfers', category: 'api', status: 'inactive' }
  ]);
  
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { toast } = useToast();

  const startMonitoring = async () => {
    setIsMonitoring(true);
    setLastUpdate(new Date());
    
    // Simulate RSS feed monitoring
    const updatedFeeds = feeds.map(feed => ({
      ...feed,
      status: Math.random() > 0.2 ? 'active' : 'error' as 'active' | 'error'
    }));
    
    setFeeds(updatedFeeds);
    
    const activeCount = updatedFeeds.filter(f => f.status === 'active').length;
    
    toast({
      title: "RSS Monitoring Started",
      description: `Monitoring ${activeCount} RSS feeds for transfer updates`,
    });

    // Simulate periodic updates
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of new update
        toast({
          title: "🔔 RSS Update",
          description: "New transfer content detected from RSS feeds",
          duration: 4000
        });
      }
      setLastUpdate(new Date());
    }, 30000); // Every 30 seconds for demo

    // Store interval ID for cleanup
    (window as any).rssInterval = interval;
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if ((window as any).rssInterval) {
      clearInterval((window as any).rssInterval);
    }
    
    const inactiveFeeds = feeds.map(feed => ({ ...feed, status: 'inactive' as const }));
    setFeeds(inactiveFeeds);
    
    toast({
      title: "RSS Monitoring Stopped",
      description: "RSS feed monitoring has been disabled",
    });
  };

  const refreshFeeds = async () => {
    toast({
      title: "Refreshing RSS Feeds",
      description: "Checking all RSS feeds for updates...",
    });

    // Simulate refresh
    setTimeout(() => {
      setLastUpdate(new Date());
      const newUpdateCount = Math.floor(Math.random() * 5) + 1;
      
      toast({
        title: "RSS Refresh Complete",
        description: `Found ${newUpdateCount} new transfer updates`,
      });
    }, 2000);
  };

  const getCategoryBadge = (category: RssFeed['category']) => {
    switch (category) {
      case 'official':
        return <Badge className="bg-green-600 text-white text-xs">OFFICIAL</Badge>;
      case 'news':
        return <Badge className="bg-blue-600 text-white text-xs">NEWS</Badge>;
      case 'api':
        return <Badge className="bg-purple-600 text-white text-xs">API</Badge>;
    }
  };

  const getStatusIcon = (status: RssFeed['status']) => {
    switch (status) {
      case 'active':
        return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full" />;
    }
  };

  const activeFeeds = feeds.filter(f => f.status === 'active').length;
  const errorFeeds = feeds.filter(f => f.status === 'error').length;

  return (
    <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Rss className="w-6 h-6 text-orange-400" />
            <h3 className="text-xl font-bold text-white">RSS & API Integration</h3>
            <Badge className="bg-orange-600 text-white">
              {activeFeeds} Active
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={refreshFeeds}
              variant="outline" 
              size="sm"
              className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            
            {!isMonitoring ? (
              <Button onClick={startMonitoring} className="bg-green-600 hover:bg-green-700">
                Start Monitoring
              </Button>
            ) : (
              <Button onClick={stopMonitoring} variant="outline" className="border-red-500 text-red-400">
                Stop Monitoring
              </Button>
            )}
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-slate-700/50 border-slate-600">
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{activeFeeds}</div>
              <div className="text-sm text-gray-300">Active Feeds</div>
            </div>
          </Card>
          <Card className="bg-slate-700/50 border-slate-600">
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{errorFeeds}</div>
              <div className="text-sm text-gray-300">Error Feeds</div>
            </div>
          </Card>
          <Card className="bg-slate-700/50 border-slate-600">
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{feeds.length}</div>
              <div className="text-sm text-gray-300">Total Sources</div>
            </div>
          </Card>
        </div>

        {/* Feed List */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white">RSS Feeds & APIs</h4>
          {feeds.map((feed, index) => (
            <Card key={index} className="bg-slate-700/30 border-slate-600">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(feed.status)}
                    <div>
                      <h5 className="font-medium text-white">{feed.name}</h5>
                      <p className="text-xs text-gray-400 truncate max-w-96">{feed.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getCategoryBadge(feed.category)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(feed.url, '_blank')}
                      className="text-gray-400 hover:text-white"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Last Update */}
        {lastUpdate && (
          <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Last Update:</span>
              <span className="text-blue-400">{lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
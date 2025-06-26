import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, Globe, CheckCircle, AlertCircle } from 'lucide-react';

interface CrawlStatus {
  url: string;
  status: 'success' | 'error' | 'pending';
  error?: string;
}

export const UrlManager = () => {
  const [urls, setUrls] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [crawlStatuses, setCrawlStatuses] = useState<CrawlStatus[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedUrls = localStorage.getItem('transfer_urls');
    if (savedUrls) {
      setUrls(JSON.parse(savedUrls));
    } else {
      // Premier League transfer news URLs from NewsNow
      const defaultUrls = [
        'https://www.newsnow.co.uk/h/Sport/Football/Premier+League/Arsenal/Transfer+News',
        'https://www.newsnow.co.uk/h/Sport/Football/Premier+League/Aston+Villa/Transfer+News',
        'https://www.newsnow.co.uk/h/Sport/Football/Premier+League/Bournemouth/Transfer+News',
        'https://www.newsnow.co.uk/h/Sport/Football/Premier+League/Brentford/Transfer+News',
        'https://www.newsnow.co.uk/h/Sport/Football/Premier+League/Brighton/Transfer+News',
        'https://www.newsnow.co.uk/h/Sport/Football/Premier+League/Burnley/Transfer+News',
        'https://www.newsnow.co.uk/h/Sport/Football/Premier+League/Chelsea/Transfer+News',
        'https://www.newsnow.co.uk/h/Sport/Football/Premier+League/Crystal+Palace/Transfer+News',
        'https://www.newsnow.co.uk/h/Sport/Football/Premier+League/Everton/Transfer+News',
        'https://www.newsnow.co.uk/h/Sport/Football/Premier+League/Fulham/Transfer+News',
        'https://www.newsnow.co.uk/h/Sport/Football/Premier+League/Leeds+United/Transfer+News',
        'https://www.newsnow.co.uk/h/Sport/Football/Premier+League/Liverpool/Transfer+News',
        'https://www.newsnow.co.uk/h/Sport/Football/Premier+League/Manchester+City/Transfer+News',
        'https://www.newsnow.co.uk/h/Sport/Football/Premier+League/Manchester+United/Transfer+News',
        'https://www.newsnow.co.uk/h/Sport/Football/Premier+League/Newcastle+United/Transfer+News',
        'https://www.newsnow.co.uk/h/Sport/Football/Premier+League/Nottingham+Forest/Transfer+News',
        'https://www.newsnow.co.uk/h/Sport/Football/Premier+League/Sunderland/Transfer+News',
        'https://www.newsnow.co.uk/h/Sport/Football/Premier+League/Tottenham+Hotspur/Transfer+News',
        'https://www.newsnow.co.uk/h/Sport/Football/Premier+League/West+Ham+United/Transfer+News',
        'https://www.newsnow.co.uk/h/Sport/Football/Premier+League/Wolves/Transfer+News',
        'https://www.bbc.com/sport/football',
        'https://www.skysports.com/football/transfers',
        'https://www.transfermarkt.com',
        'https://www.football.london',
        'https://www.goal.com/en/transfers'
      ];
      setUrls(defaultUrls);
      localStorage.setItem('transfer_urls', JSON.stringify(defaultUrls));
    }

    // Listen for crawl status updates from other components
    const handleCrawlStatusUpdate = (event: CustomEvent) => {
      setCrawlStatuses(event.detail);
    };

    window.addEventListener('crawlStatusUpdate', handleCrawlStatusUpdate as EventListener);
    
    return () => {
      window.removeEventListener('crawlStatusUpdate', handleCrawlStatusUpdate as EventListener);
    };
  }, []);

  const addUrl = () => {
    if (newUrl.trim() && !urls.includes(newUrl.trim())) {
      const updatedUrls = [...urls, newUrl.trim()];
      setUrls(updatedUrls);
      localStorage.setItem('transfer_urls', JSON.stringify(updatedUrls));
      setNewUrl('');
      toast({
        title: "URL Added",
        description: "New source URL has been added successfully.",
      });
    } else if (urls.includes(newUrl.trim())) {
      toast({
        title: "Duplicate URL",
        description: "This URL is already in your sources list.",
        variant: "destructive",
      });
    }
  };

  const removeUrl = (urlToRemove: string) => {
    const updatedUrls = urls.filter(url => url !== urlToRemove);
    setUrls(updatedUrls);
    localStorage.setItem('transfer_urls', JSON.stringify(updatedUrls));
    toast({
      title: "URL Removed",
      description: "Source URL has been removed successfully.",
    });
  };

  const getUrlStatus = (url: string) => {
    return crawlStatuses.find(status => status.url === url);
  };

  const getStatusIcon = (status?: CrawlStatus) => {
    if (!status) return null;
    
    switch (status.status) {
      case 'success':
        return <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0" title="Successfully crawled" />;
      case 'error':
        return <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0" title={`Error: ${status.error}`} />;
      case 'pending':
        return <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse flex-shrink-0" title="Crawling in progress" />;
      default:
        return null;
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Source URLs Management
        </h3>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Enter URL to crawl (e.g., https://example.com)"
              className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
              onKeyPress={(e) => e.key === 'Enter' && addUrl()}
            />
            <Button 
              onClick={addUrl}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-blue-200">Current Sources ({urls.length})</p>
            {urls.length === 0 ? (
              <p className="text-white/60 text-sm">No URLs added yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {urls.map((url, index) => {
                  const status = getUrlStatus(url);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white/10 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3 flex-1 mr-2">
                        {getStatusIcon(status)}
                        <div className="flex-1">
                          <span className="text-white text-sm truncate block">{url}</span>
                          {status?.error && (
                            <span className="text-red-400 text-xs truncate block" title={status.error}>
                              {status.error}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeUrl(url)}
                        className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {crawlStatuses.length > 0 && (
            <div className="border-t border-white/20 pt-4">
              <div className="flex items-center gap-4 text-sm text-blue-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Success: {crawlStatuses.filter(s => s.status === 'success').length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Failed: {crawlStatuses.filter(s => s.status === 'error').length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Pending: {crawlStatuses.filter(s => s.status === 'pending').length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

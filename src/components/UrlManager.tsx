
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, Globe } from 'lucide-react';

export const UrlManager = () => {
  const [urls, setUrls] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const savedUrls = localStorage.getItem('transfer_urls');
    if (savedUrls) {
      setUrls(JSON.parse(savedUrls));
    } else {
      // Default URLs
      const defaultUrls = [
        'https://www.bbc.com/sport/football',
        'https://www.skysports.com/football/transfers',
        'https://www.transfermarkt.com',
        'https://www.football.london',
        'https://www.goal.com/en/transfers'
      ];
      setUrls(defaultUrls);
      localStorage.setItem('transfer_urls', JSON.stringify(defaultUrls));
    }
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
                {urls.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white/10 rounded-lg p-3"
                  >
                    <span className="text-white text-sm truncate flex-1 mr-2">{url}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeUrl(url)}
                      className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

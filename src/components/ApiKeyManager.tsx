
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Key, CheckCircle } from 'lucide-react';

export const ApiKeyManager = () => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidKey, setIsValidKey] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedKey = localStorage.getItem('firecrawl_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsValidKey(true);
    }
  }, []);

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('firecrawl_api_key', apiKey.trim());
      setIsValidKey(true);
      toast({
        title: "API Key Saved",
        description: "Firecrawl API key has been saved successfully.",
      });
    }
  };

  const clearApiKey = () => {
    localStorage.removeItem('firecrawl_api_key');
    setApiKey('');
    setIsValidKey(false);
    toast({
      title: "API Key Cleared",
      description: "Firecrawl API key has been removed.",
    });
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Key className="w-5 h-5" />
          Firecrawl API Configuration
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Firecrawl API Key
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Firecrawl API key"
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <Button 
                onClick={saveApiKey}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={!apiKey.trim()}
              >
                Save
              </Button>
            </div>
          </div>

          {isValidKey && (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">API Key configured successfully</span>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-blue-200">API Key Instructions:</p>
            <ul className="text-xs text-white/70 space-y-1 list-disc list-inside">
              <li>Get your API key from <a href="https://firecrawl.dev" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">firecrawl.dev</a></li>
              <li>The API key is stored locally in your browser</li>
              <li>This key is used to crawl and scrape transfer news from websites</li>
              <li>Keep your API key secure and don't share it</li>
            </ul>
          </div>

          {isValidKey && (
            <Button 
              onClick={clearApiKey}
              variant="outline"
              className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
            >
              Clear API Key
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};


import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Search, Globe, Code } from 'lucide-react';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { TransferParser } from '@/utils/transferParser';
import { useToast } from '@/hooks/use-toast';

export const ScrapeDebugger: React.FC = () => {
  const [testUrl, setTestUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rawContent, setRawContent] = useState('');
  const [parsedTransfers, setParsedTransfers] = useState<any[]>([]);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { toast } = useToast();

  const handleTestScrape = async () => {
    if (!testUrl) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to test scraping",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setRawContent('');
    setParsedTransfers([]);
    setDebugInfo(null);

    try {
      console.log('=== SCRAPE DEBUG STARTED ===');
      console.log('Testing URL:', testUrl);
      
      const result = await FirecrawlService.testUrlScraping(testUrl);
      
      if (result.success && result.data) {
        const content = result.data.markdown || result.data.content || '';
        setRawContent(content);
        
        console.log('Raw content length:', content.length);
        console.log('Raw content preview:', content.substring(0, 500));
        
        // Parse transfers with debug info
        const transfers = TransferParser.parseTransfers(content, testUrl);
        setParsedTransfers(transfers);
        
        // Create debug info
        const debugData = {
          contentLength: content.length,
          contentPreview: content.substring(0, 1000),
          transfersFound: transfers.length,
          sourceIsTrusted: isSourceTrusted(testUrl),
          containsTransferKeywords: checkForTransferKeywords(content),
          containsClubNames: checkForClubNames(content),
          containsPlayerNames: checkForPlayerNames(content),
        };
        
        setDebugInfo(debugData);
        
        toast({
          title: "Scraping Complete",
          description: `Found ${transfers.length} transfers from ${content.length} characters of content`,
        });
      } else {
        toast({
          title: "Scraping Failed",
          description: result.error || "Failed to scrape URL",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Debug scrape error:', error);
      toast({
        title: "Error",
        description: "An error occurred during scraping",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isSourceTrusted = (url: string): boolean => {
    const trustedSources = [
      'arsenal.com', 'avfc.co.uk', 'afcb.co.uk', 'brentfordfc.com', 'brightonandhovealbion.com',
      'burnleyfc.com', 'chelseafc.com', 'cpfc.co.uk', 'evertonfc.com', 'fulhamfc.com',
      'leedsunited.com', 'liverpoolfc.com', 'mancity.com', 'manutd.com', 'nufc.co.uk',
      'premierleague.com', 'bbc.com/sport', 'skysports.com', 'theguardian.com/football'
    ];
    return trustedSources.some(trusted => url.toLowerCase().includes(trusted));
  };

  const checkForTransferKeywords = (content: string): string[] => {
    const keywords = ['has signed', 'officially joins', 'completed transfer', 'signs for', 'welcome to'];
    const found = keywords.filter(keyword => content.toLowerCase().includes(keyword));
    return found;
  };

  const checkForClubNames = (content: string): string[] => {
    const clubs = ['Arsenal', 'Aston Villa', 'Bournemouth', 'Chelsea', 'Liverpool', 'Manchester City'];
    const found = clubs.filter(club => content.toLowerCase().includes(club.toLowerCase()));
    return found;
  };

  const checkForPlayerNames = (content: string): string[] => {
    const players = ['Jaka Bijol', 'Lukas Nmecha', 'Giorgi Mamardashvili', 'Jeremie Frimpong'];
    const found = players.filter(player => content.toLowerCase().includes(player.toLowerCase()));
    return found;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-500/20 p-2 rounded-lg">
              <Search className="w-5 h-5 text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Scrape Debugger</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Enter URL to test scraping (e.g., https://www.arsenal.com/news)"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                className="flex-1 bg-slate-700 border-slate-600 text-white"
              />
              <Button
                onClick={handleTestScrape}
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Globe className="w-4 h-4 mr-2" />
                {isLoading ? 'Testing...' : 'Test Scrape'}
              </Button>
            </div>

            {debugInfo && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-700/50 p-3">
                  <div className="flex items-center gap-2">
                    {debugInfo.sourceIsTrusted ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-sm text-white">
                      {debugInfo.sourceIsTrusted ? 'Trusted Source' : 'Untrusted Source'}
                    </span>
                  </div>
                </Card>
                
                <Card className="bg-slate-700/50 p-3">
                  <div className="text-white text-sm">
                    <div className="font-semibold">{debugInfo.contentLength} chars</div>
                    <div className="text-gray-300">Content Length</div>
                  </div>
                </Card>
                
                <Card className="bg-slate-700/50 p-3">
                  <div className="text-white text-sm">
                    <div className="font-semibold">{debugInfo.transfersFound}</div>
                    <div className="text-gray-300">Transfers Found</div>
                  </div>
                </Card>
                
                <Card className="bg-slate-700/50 p-3">
                  <div className="text-white text-sm">
                    <div className="font-semibold">{debugInfo.containsTransferKeywords.length}</div>
                    <div className="text-gray-300">Transfer Keywords</div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </Card>

      {(rawContent || parsedTransfers.length > 0 || debugInfo) && (
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
          <div className="p-6">
            <Tabs defaultValue="debug" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-slate-700">
                <TabsTrigger value="debug">Debug Info</TabsTrigger>
                <TabsTrigger value="transfers">Parsed Transfers</TabsTrigger>
                <TabsTrigger value="content">Raw Content</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="debug" className="space-y-4">
                {debugInfo && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-white font-semibold mb-2">Transfer Keywords Found:</h4>
                      <div className="flex flex-wrap gap-2">
                        {debugInfo.containsTransferKeywords.map((keyword: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="bg-green-500/20 text-green-300">
                            {keyword}
                          </Badge>
                        ))}
                        {debugInfo.containsTransferKeywords.length === 0 && (
                          <span className="text-red-400">No transfer keywords found</span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-semibold mb-2">Club Names Found:</h4>
                      <div className="flex flex-wrap gap-2">
                        {debugInfo.containsClubNames.map((club: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="bg-blue-500/20 text-blue-300">
                            {club}
                          </Badge>
                        ))}
                        {debugInfo.containsClubNames.length === 0 && (
                          <span className="text-red-400">No club names found</span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-semibold mb-2">Player Names Found:</h4>
                      <div className="flex flex-wrap gap-2">
                        {debugInfo.containsPlayerNames.map((player: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="bg-purple-500/20 text-purple-300">
                            {player}
                          </Badge>
                        ))}
                        {debugInfo.containsPlayerNames.length === 0 && (
                          <span className="text-red-400">No known player names found</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="transfers">
                <div className="space-y-3">
                  {parsedTransfers.length > 0 ? (
                    parsedTransfers.map((transfer, idx) => (
                      <Card key={idx} className="bg-slate-700/50 p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-white font-semibold">{transfer.playerName}</h4>
                            <p className="text-gray-300 text-sm">
                              {transfer.fromClub} → {transfer.toClub}
                            </p>
                            <p className="text-gray-400 text-xs">Fee: {transfer.fee}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge 
                              variant={transfer.verificationStatus === 'confirmed' ? 'default' : 'secondary'}
                              className={transfer.verificationStatus === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}
                            >
                              {transfer.verificationStatus}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {Math.round(transfer.confidence * 100)}% confidence
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <p className="text-gray-400">No transfers parsed from the content</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="content">
                <Textarea
                  value={rawContent}
                  readOnly
                  className="min-h-96 bg-slate-700 border-slate-600 text-white text-xs font-mono"
                  placeholder="Raw scraped content will appear here..."
                />
              </TabsContent>
              
              <TabsContent value="analysis" className="space-y-4">
                <div className="text-white">
                  <h4 className="font-semibold mb-3">Why might transfers not be found?</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Source not trusted:</strong> Only official club websites and major sports news sites are considered trusted sources
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Missing keywords:</strong> Content must contain confirmation words like "has signed", "officially joins", etc.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Unknown players:</strong> Only pre-defined known players are easily detected
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Content format:</strong> The parser expects specific sentence structures and may miss table-formatted data
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      )}
    </div>
  );
};

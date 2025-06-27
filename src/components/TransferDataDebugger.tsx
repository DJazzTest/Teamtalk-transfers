
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Database, RefreshCw, Search, Globe } from 'lucide-react';
import { Transfer } from '@/types/transfer';
import { TransferIntegrationService } from '@/utils/transferIntegration';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { useToast } from '@/hooks/use-toast';

interface TransferDataDebuggerProps {
  transfers: Transfer[];
}

export const TransferDataDebugger: React.FC<TransferDataDebuggerProps> = ({ transfers }) => {
  const [parsedTransfers, setParsedTransfers] = useState<Transfer[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load current parsed transfers from storage
    const currentParsed = TransferIntegrationService.getParsedTransfers();
    setParsedTransfers(currentParsed);
  }, []);

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      // Test scraping Bournemouth's official website
      const testUrls = [
        'https://www.afcb.co.uk/news/first-team',
        'https://www.afcb.co.uk/news'
      ];

      console.log('=== TESTING BOURNEMOUTH DATA SCRAPING ===');
      
      for (const url of testUrls) {
        console.log(`Testing scrape of: ${url}`);
        const result = await FirecrawlService.testUrlScraping(url);
        
        if (result.success) {
          console.log(`✓ Successfully scraped ${url}`);
          console.log('Content preview:', result.data?.markdown?.substring(0, 1000));
        } else {
          console.log(`✗ Failed to scrape ${url}: ${result.error}`);
        }
      }

      // Refresh parsed transfers
      const refreshedParsed = TransferIntegrationService.getParsedTransfers();
      setParsedTransfers(refreshedParsed);
      setLastRefresh(new Date());
      
      toast({
        title: "Data Refresh Complete",
        description: `Found ${refreshedParsed.length} parsed transfers`,
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh transfer data",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const clearStoredData = () => {
    TransferIntegrationService.clearParsedTransfers();
    setParsedTransfers([]);
    toast({
      title: "Storage Cleared",
      description: "All parsed transfer data has been cleared",
    });
  };

  const getTransfersByClub = (clubName: string) => {
    const transfersIn = transfers.filter(t => t.toClub === clubName);
    const transfersOut = transfers.filter(t => t.fromClub === clubName);
    return { transfersIn, transfersOut };
  };

  const bournemouthData = getTransfersByClub('Bournemouth');

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-500/20 p-2 rounded-lg">
                <Database className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Transfer Data Debugger</h2>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRefreshData}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Test Scrape
              </Button>
              <Button
                onClick={clearStoredData}
                variant="destructive"
                size="sm"
              >
                Clear Storage
              </Button>
            </div>
          </div>

          {lastRefresh && (
            <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
              <p className="text-sm text-gray-300">
                Last refresh: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
          )}

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-700">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="bournemouth">Bournemouth</TabsTrigger>
              <TabsTrigger value="parsed">Parsed Data</TabsTrigger>
              <TabsTrigger value="sources">Data Sources</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-700/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-semibold">Total Transfers</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">{transfers.length}</p>
                </Card>
                
                <Card className="bg-slate-700/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="w-4 h-4 text-green-400" />
                    <span className="text-white font-semibold">Parsed Transfers</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">{parsedTransfers.length}</p>
                </Card>

                <Card className="bg-slate-700/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-purple-400" />
                    <span className="text-white font-semibold">Mock/Recent</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-400">{transfers.length - parsedTransfers.length}</p>
                </Card>
              </div>

              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-400" />
                  Data Flow Analysis
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Sources being scraped:</span>
                    <Badge variant="secondary">Club websites + News sites</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Parsing success rate:</span>
                    <Badge variant={parsedTransfers.length > 0 ? 'default' : 'destructive'}>
                      {parsedTransfers.length > 0 ? 'Some data found' : 'No parsed data'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Last storage update:</span>
                    <span className="text-gray-400">Check browser localStorage</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bournemouth" className="space-y-4">
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-3">Bournemouth Transfer Data</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-300 mb-1">Current Transfers In:</p>
                    <p className="text-white">{bournemouthData.transfersIn.length} transfers</p>
                    {bournemouthData.transfersIn.map(t => (
                      <div key={t.id} className="text-xs text-gray-400 ml-2">
                        • {t.playerName} from {t.fromClub} ({t.source})
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-300 mb-1">Current Transfers Out:</p>
                    <p className="text-white">{bournemouthData.transfersOut.length} transfers</p>
                    {bournemouthData.transfersOut.map(t => (
                      <div key={t.id} className="text-xs text-gray-400 ml-2">
                        • {t.playerName} to {t.toClub} ({t.source})
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-600 pt-3">
                    <p className="text-sm text-yellow-400 font-semibold mb-2">Expected Bournemouth Transfers:</p>
                    <div className="text-xs text-gray-300 space-y-1">
                      <div>• Eli Junior Kroupi (Transfer In from Lorient)</div>
                      <div>• Dean Huijsen (Transfer Out to Real Madrid)</div>
                      <div>• Jaidon Anthony (Transfer Out to Burnley)</div>
                      <div>• Kepa Arrizabalaga (End of loan to Chelsea)</div>
                      <div>• Adrien Truffert (Transfer In from Rennes)</div>
                      <div>• Daniel Jebbison (Loan Out to Preston)</div>
                      <div>• Max Aarons (Loan Out to Rangers)</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="parsed" className="space-y-4">
              <div className="space-y-3">
                {parsedTransfers.length === 0 ? (
                  <Card className="bg-slate-700/50 p-6 text-center">
                    <AlertCircle className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                    <p className="text-white font-semibold">No Parsed Transfers Found</p>
                    <p className="text-gray-400 text-sm mt-1">
                      This suggests the scraping/parsing process isn't working correctly
                    </p>
                  </Card>
                ) : (
                  parsedTransfers.map((transfer) => (
                    <Card key={transfer.id} className="bg-slate-700/50 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-white font-semibold">{transfer.playerName}</h4>
                          <p className="text-gray-300 text-sm">
                            {transfer.fromClub} → {transfer.toClub}
                          </p>
                          <p className="text-gray-400 text-xs">
                            Fee: {transfer.fee} | Source: {transfer.source}
                          </p>
                        </div>
                        <Badge variant={transfer.status === 'confirmed' ? 'default' : 'secondary'}>
                          {transfer.status}
                        </Badge>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="sources" className="space-y-4">
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-3">Data Source Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Mock Transfers:</span>
                    <Badge variant="outline">Static data</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Recent Transfers:</span>
                    <Badge variant="outline">Hardcoded recent</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Scraped Data:</span>
                    <Badge variant={parsedTransfers.length > 0 ? 'default' : 'destructive'}>
                      {parsedTransfers.length > 0 ? 'Active' : 'Not working'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Firecrawl API:</span>
                    <Badge variant={FirecrawlService.getApiKey() ? 'default' : 'destructive'}>
                      {FirecrawlService.getApiKey() ? 'Configured' : 'Not configured'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Recommended Actions:</h4>
                <div className="space-y-1 text-sm text-gray-300">
                  <div>1. Configure Firecrawl API key in the API tab</div>
                  <div>2. Test scraping with official club websites</div>
                  <div>3. Run manual scrape to populate fresh data</div>
                  <div>4. Check parsing rules are not too restrictive</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

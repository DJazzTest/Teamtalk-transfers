
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Users, Globe, CheckCircle, Clock, MessageCircle, X } from 'lucide-react';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { useToast } from '@/hooks/use-toast';
import { Transfer, CrawlStatus } from '@/types/transfer';
import { mockTransfers, premierLeagueClubs } from '@/data/mockTransfers';
import { groupTransfersByClub, groupTransfersByStatus } from '@/utils/transferUtils';
import { TransferCard } from './TransferCard';
import { LanesView } from './LanesView';
import { ClubsView } from './ClubsView';
import { CrawlStatusDisplay } from './CrawlStatusDisplay';

interface TransferResultsProps {
  lastUpdated: Date;
}

export const TransferResults: React.FC<TransferResultsProps> = ({ lastUpdated }) => {
  const [transfers] = useState<Transfer[]>(mockTransfers);
  const [filteredTransfers, setFilteredTransfers] = useState<Transfer[]>(mockTransfers);
  const [selectedClub, setSelectedClub] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'clubs' | 'lanes'>('lanes');
  const [isScraping, setIsScraping] = useState(false);
  const [crawlStatuses, setCrawlStatuses] = useState<CrawlStatus[]>([]);
  const [crawlProgress, setCrawlProgress] = useState<{ completed: number; total: number; currentUrl: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let filtered = transfers;

    if (selectedClub !== 'all') {
      filtered = filtered.filter(transfer => transfer.toClub === selectedClub);
    }

    if (searchTerm) {
      filtered = filtered.filter(transfer =>
        transfer.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.fromClub.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.toClub.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTransfers(filtered);
  }, [transfers, selectedClub, searchTerm]);

  // Dispatch crawl status updates to other components
  useEffect(() => {
    const event = new CustomEvent('crawlStatusUpdate', { detail: crawlStatuses });
    window.dispatchEvent(event);
  }, [crawlStatuses]);

  const handleScrapeUrls = async () => {
    const apiKey = FirecrawlService.getApiKey();
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your Firecrawl API key in the API Config tab first.",
        variant: "destructive",
      });
      return;
    }

    const savedUrls = localStorage.getItem('transfer_urls');
    if (!savedUrls) {
      toast({
        title: "No URLs Found",
        description: "Please add URLs to scrape in the Sources tab first.",
        variant: "destructive",
      });
      return;
    }

    const urls = JSON.parse(savedUrls);
    setIsScraping(true);
    setCrawlProgress({ completed: 0, total: urls.length, currentUrl: 'Starting...' });
    
    // Initialize crawl statuses
    const initialStatuses: CrawlStatus[] = urls.map((url: string) => ({
      url,
      status: 'pending' as const
    }));
    setCrawlStatuses(initialStatuses);

    try {
      toast({
        title: "Scraping Started",
        description: `Starting to scrape ${urls.length} URLs sequentially to avoid rate limits...`,
      });

      const result = await FirecrawlService.crawlTransferSources(urls, (progress) => {
        setCrawlProgress(progress);
        
        // Update individual URL status as we go
        setCrawlStatuses(prev => prev.map(status => {
          if (status.url === progress.currentUrl) {
            return { ...status, status: 'pending' as const };
          }
          return status;
        }));
      });
      
      if (result.success && result.data) {
        console.log('Successfully scraped URLs:', result.data);
        
        // Update crawl statuses based on results
        const updatedStatuses: CrawlStatus[] = result.data.map((crawlResult: any) => ({
          url: crawlResult.url,
          status: crawlResult.success ? 'success' : 'error',
          error: crawlResult.error
        }));
        setCrawlStatuses(updatedStatuses);
        
        const successCount = updatedStatuses.filter(s => s.status === 'success').length;
        const errorCount = updatedStatuses.filter(s => s.status === 'error').length;
        
        toast({
          title: "Scraping Complete",
          description: `${successCount} successful, ${errorCount} failed. Sequential processing completed.`,
        });
      } else {
        console.error('Failed to scrape URLs:', result.error);
        
        // Mark all as failed
        const failedStatuses: CrawlStatus[] = urls.map((url: string) => ({
          url,
          status: 'error',
          error: result.error || 'Unknown error'
        }));
        setCrawlStatuses(failedStatuses);
        
        toast({
          title: "Scraping Error",
          description: result.error || "Failed to scrape URLs.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error during scraping:', error);
      
      // Mark all as failed
      const failedStatuses: CrawlStatus[] = urls.map((url: string) => ({
        url,
        status: 'error',
        error: 'Network or system error'
      }));
      setCrawlStatuses(failedStatuses);
      
      toast({
        title: "Scraping Error",
        description: "An error occurred while scraping URLs.",
        variant: "destructive",
      });
    } finally {
      setIsScraping(false);
      setCrawlProgress(null);
    }
  };

  const clubTransfers = groupTransfersByClub(filteredTransfers);
  const statusTransfers = groupTransfersByStatus(filteredTransfers);

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
        <div className="p-4">
          <div className="flex gap-4 flex-wrap items-center">
            <div className="flex-1 min-w-48">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search players, clubs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                />
              </div>
            </div>
            <Select value={selectedClub} onValueChange={setSelectedClub}>
              <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Filter by club" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clubs</SelectItem>
                {premierLeagueClubs.map((club) => (
                  <SelectItem key={club} value={club}>
                    {club}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={viewMode} onValueChange={(value: 'list' | 'clubs' | 'lanes') => setViewMode(value)}>
              <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lanes">Lanes</SelectItem>
                <SelectItem value="clubs">By Club</SelectItem>
                <SelectItem value="list">List View</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleScrapeUrls}
              disabled={isScraping}
              className="bg-slate-600 hover:bg-slate-700 text-white"
            >
              <Globe className="w-4 h-4 mr-2" />
              {isScraping ? 'Scraping...' : 'Scrape URLs'}
            </Button>
          </div>
          
          {/* Progress indicator */}
          {crawlProgress && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm text-blue-200">
                <span>Progress: {crawlProgress.completed}/{crawlProgress.total}</span>
                <span>{Math.round((crawlProgress.completed / crawlProgress.total) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(crawlProgress.completed / crawlProgress.total) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-300 truncate">
                Current: {crawlProgress.currentUrl}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Crawl Status Display */}
      <CrawlStatusDisplay crawlStatuses={crawlStatuses} />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
          <div className="p-4 flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-semibold">{filteredTransfers.length}</p>
              <p className="text-gray-300 text-sm">Total Transfers</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
          <div className="p-4 flex items-center gap-3">
            <div className="bg-green-500/20 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-white font-semibold">
                {filteredTransfers.filter(t => t.status === 'confirmed').length}
              </p>
              <p className="text-gray-300 text-sm">Confirmed</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
          <div className="p-4 flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <MessageCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-semibold">
                {filteredTransfers.filter(t => t.status === 'rumored').length}
              </p>
              <p className="text-gray-300 text-sm">Gossip</p>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
          <div className="p-4 flex items-center gap-3">
            <div className="bg-red-500/20 p-2 rounded-lg">
              <X className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-white font-semibold">
                {filteredTransfers.filter(t => t.status === 'rejected').length}
              </p>
              <p className="text-gray-300 text-sm">Failed</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Transfer Display */}
      <div className="space-y-4">
        {filteredTransfers.length === 0 ? (
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
            <div className="p-8 text-center">
              <p className="text-gray-400">No transfers found matching your criteria</p>
            </div>
          </Card>
        ) : viewMode === 'lanes' ? (
          <LanesView statusTransfers={statusTransfers} />
        ) : viewMode === 'clubs' ? (
          <ClubsView clubTransfers={clubTransfers} />
        ) : (
          // List View
          filteredTransfers.map((transfer) => (
            <TransferCard key={transfer.id} transfer={transfer} />
          ))
        )}
      </div>
    </div>
  );
};

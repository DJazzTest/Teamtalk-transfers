
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { useToast } from '@/hooks/use-toast';
import { Transfer, CrawlStatus } from '@/types/transfer';
import { allClubTransfers } from '@/data/transfers';
import { groupTransfersByClub, groupTransfersByStatus } from '@/utils/transferUtils';
import { TransferCard } from './TransferCard';
import { LanesView } from './LanesView';
import { ClubsView } from './ClubsView';
import { CrawlStatusDisplay } from './CrawlStatusDisplay';
import { TransferIntegrationService } from '@/utils/transferIntegration';
import { TransferFilters } from './TransferFilters';
import { TransferStats } from './TransferStats';
import { ScrapeControls } from './ScrapeControls';

interface TransferResultsProps {
  lastUpdated: Date;
}

export const TransferResults: React.FC<TransferResultsProps> = ({ lastUpdated }) => {
  const [allTransfers, setAllTransfers] = useState<Transfer[]>(() => {
    // Use only real transfers data
    console.log('Initializing with real transfer data only');
    return allClubTransfers;
  });
  const [filteredTransfers, setFilteredTransfers] = useState<Transfer[]>(allTransfers);
  const [selectedClub, setSelectedClub] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'clubs' | 'lanes'>('lanes');
  const [isScraping, setIsScraping] = useState(false);
  const [crawlStatuses, setCrawlStatuses] = useState<CrawlStatus[]>([]);
  const [crawlProgress, setCrawlProgress] = useState<{ completed: number; total: number; currentUrl: string } | null>(null);
  const { toast } = useToast();

  // Listen for refresh events to update data
  useEffect(() => {
    const handleRefresh = () => {
      console.log('Refreshing transfer data with latest real transfers');
      setAllTransfers([...allClubTransfers]);
    };

    window.addEventListener('autoRefresh', handleRefresh);
    window.addEventListener('manualRefresh', handleRefresh);
    
    return () => {
      window.removeEventListener('autoRefresh', handleRefresh);
      window.removeEventListener('manualRefresh', handleRefresh);
    };
  }, []);

  useEffect(() => {
    let filtered = allTransfers;

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
  }, [allTransfers, selectedClub, searchTerm]);

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
        
        // Process crawled data to extract transfers
        const parsedTransfers = await TransferIntegrationService.processCrawlResults(result.data);
        
        // Merge with mock transfers and update state
        const mergedTransfers = TransferIntegrationService.mergeParsedWithMockTransfers(allClubTransfers);
        setAllTransfers(mergedTransfers);
        
        const successCount = updatedStatuses.filter(s => s.status === 'success').length;
        const errorCount = updatedStatuses.filter(s => s.status === 'error').length;
        
        toast({
          title: "Scraping Complete",
          description: `${successCount} successful, ${errorCount} failed. Found ${parsedTransfers.length} new transfers.`,
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
      <TransferFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedClub={selectedClub}
        setSelectedClub={setSelectedClub}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onScrapeUrls={handleScrapeUrls}
        isScraping={isScraping}
      />
      
      {/* Progress indicator */}
      <ScrapeControls crawlProgress={crawlProgress} />

      {/* Crawl Status Display */}
      <CrawlStatusDisplay crawlStatuses={crawlStatuses} />

      {/* Stats */}
      <TransferStats transfers={filteredTransfers} />

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

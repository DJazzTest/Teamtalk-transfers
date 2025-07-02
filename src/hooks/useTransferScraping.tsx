import { useState, useEffect } from 'react';
import { CrawlStatus } from '@/types/transfer';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { TransferIntegrationService } from '@/utils/transferIntegration';
import { useToast } from '@/hooks/use-toast';

export const useTransferScraping = (setAllTransfers: (transfers: any[]) => void) => {
  const [isScraping, setIsScraping] = useState(false);
  const [crawlStatuses, setCrawlStatuses] = useState<CrawlStatus[]>([]);
  const [crawlProgress, setCrawlProgress] = useState<{ completed: number; total: number; currentUrl: string } | null>(null);
  const { toast } = useToast();

  // Dispatch crawl status updates to other components
  useEffect(() => {
    const event = new CustomEvent('crawlStatusUpdate', { detail: crawlStatuses });
    window.dispatchEvent(event);
  }, [crawlStatuses]);

  const handleScrapeUrls = async () => {
    console.log('🔍 Scrape URLs button clicked - starting scrape process');
    
    const apiKey = FirecrawlService.getApiKey();
    if (!apiKey) {
      console.log('❌ No API key found');
      toast({
        title: "API Key Required",
        description: "Please set your Firecrawl API key in the API Config tab first.",
        variant: "destructive",
      });
      return;
    }

    const savedUrls = localStorage.getItem('transfer_urls');
    if (!savedUrls) {
      console.log('❌ No URLs found to scrape');
      toast({
        title: "No URLs Found",
        description: "Please add URLs to scrape in the Sources tab first.",
        variant: "destructive",
      });
      return;
    }

    const urls = JSON.parse(savedUrls);
    console.log(`🚀 Starting scrape process for ${urls.length} URLs`);
    
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

      console.log('📡 Making API call to FirecrawlService.crawlTransferSources');
      const result = await FirecrawlService.crawlTransferSources(urls, (progress) => {
        console.log(`📊 Scrape progress: ${progress.completed}/${progress.total} - ${progress.currentUrl}`);
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
        console.log('✅ Successfully scraped URLs:', result.data);
        
        // Update crawl statuses based on results
        const updatedStatuses: CrawlStatus[] = result.data.map((crawlResult: any) => ({
          url: crawlResult.url,
          status: crawlResult.success ? 'success' : 'error',
          error: crawlResult.error
        }));
        setCrawlStatuses(updatedStatuses);
        
        console.log('🔄 Processing crawl results to extract transfers');
        // Process crawled data to extract transfers
        const parsedTransfers = await TransferIntegrationService.processCrawlResults(result.data);
        
        // Get all transfers including parsed ones
        const allLatestTransfers = TransferIntegrationService.getAllTransfers();
        setAllTransfers(allLatestTransfers);
        
        const successCount = updatedStatuses.filter(s => s.status === 'success').length;
        const errorCount = updatedStatuses.filter(s => s.status === 'error').length;
        
        console.log(`✅ Scraping complete: ${successCount} successful, ${errorCount} failed, ${parsedTransfers.length} transfers found`);
        
        toast({
          title: "Scraping Complete",
          description: `${successCount} successful, ${errorCount} failed. Found ${parsedTransfers.length} new transfers.`,
        });
      } else {
        console.error('❌ Failed to scrape URLs:', result.error);
        
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
      console.error('❌ Error during scraping:', error);
      
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
      console.log('🏁 Scraping process finished');
      setIsScraping(false);
      setCrawlProgress(null);
    }
  };

  return {
    isScraping,
    crawlStatuses,
    crawlProgress,
    handleScrapeUrls
  };
};
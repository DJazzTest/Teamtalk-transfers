
import { useState, useEffect } from 'react';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { useToast } from '@/hooks/use-toast';
import { TransferIntegrationService } from '@/utils/transferIntegration';

export const useRefreshControl = () => {
  const [refreshRate, setRefreshRate] = useState(300000); // 5 minutes default
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isAutoRefresh, setIsAutoRefresh] = useState(true); // Enable by default
  const [refreshCounter, setRefreshCounter] = useState(0);
  
  // Auto-scraping states
  const [autoScrapeInterval, setAutoScrapeInterval] = useState(300000); // 5 minutes default
  const [isAutoScrapeEnabled, setIsAutoScrapeEnabled] = useState(false);
  const [scrapeErrors, setScrapeErrors] = useState<string[]>([]);
  const [lastScrapeTime, setLastScrapeTime] = useState<Date | null>(null);
  
  const { toast } = useToast();

  // Regular refresh interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoRefresh) {
      interval = setInterval(() => {
        setLastUpdated(new Date());
        setRefreshCounter(prev => prev + 1);
        console.log('Auto-refreshing with real transfer data only...');
        
        // Dispatch a custom event to notify other components
        window.dispatchEvent(new CustomEvent('autoRefresh'));
      }, refreshRate);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoRefresh, refreshRate]);

  // Auto-scraping interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoScrapeEnabled && autoScrapeInterval > 0) {
      interval = setInterval(async () => {
        console.log('Auto-scraping URLs...');
        await performAutoScrape();
      }, autoScrapeInterval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoScrapeEnabled, autoScrapeInterval]);

  const performAutoScrape = async () => {
    const apiKey = FirecrawlService.getApiKey();
    if (!apiKey) {
      const error = 'Firecrawl API key not found - auto-scraping disabled';
      setScrapeErrors(prev => [...prev.slice(-4), error]); // Keep last 5 errors
      console.error(error);
      return;
    }

    const savedUrls = localStorage.getItem('transfer_urls');
    if (!savedUrls) {
      const error = 'No URLs configured for scraping';
      setScrapeErrors(prev => [...prev.slice(-4), error]);
      console.error(error);
      return;
    }

    const urls = JSON.parse(savedUrls);
    
    try {
      console.log(`Auto-scraping ${urls.length} URLs...`);
      
      const result = await FirecrawlService.crawlTransferSources(urls);
      
      if (result.success && result.data) {
        // Process crawled data
        const parsedTransfers = await TransferIntegrationService.processCrawlResults(result.data);
        
        // Clear previous errors on success
        setScrapeErrors([]);
        setLastScrapeTime(new Date());
        
        // Dispatch event to update UI
        window.dispatchEvent(new CustomEvent('autoScrapeComplete', { 
          detail: { 
            success: true, 
            transfersFound: parsedTransfers.length,
            urlsScraped: urls.length
          } 
        }));
        
        console.log(`Auto-scrape completed: ${parsedTransfers.length} transfers found`);
      } else {
        const error = `Auto-scrape failed: ${result.error || 'Unknown error'}`;
        setScrapeErrors(prev => [...prev.slice(-4), error]);
        
        window.dispatchEvent(new CustomEvent('autoScrapeComplete', { 
          detail: { 
            success: false, 
            error: result.error 
          } 
        }));
      }
    } catch (error) {
      const errorMsg = `Auto-scrape error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setScrapeErrors(prev => [...prev.slice(-4), errorMsg]);
      console.error('Auto-scrape error:', error);
      
      window.dispatchEvent(new CustomEvent('autoScrapeComplete', { 
        detail: { 
          success: false, 
          error: errorMsg 
        } 
      }));
    }
  };

  const handleManualRefresh = () => {
    console.log('Manual refresh triggered - using real transfer data only');
    setLastUpdated(new Date());
    setRefreshCounter(prev => prev + 1);
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new CustomEvent('manualRefresh'));
    console.log('Manual refresh completed with real data, event dispatched');
  };

  const handleManualScrape = async () => {
    console.log('Manual scrape triggered');
    await performAutoScrape();
  };

  const clearScrapeErrors = () => {
    setScrapeErrors([]);
  };

  return {
    refreshRate,
    setRefreshRate,
    lastUpdated,
    isAutoRefresh,
    setIsAutoRefresh,
    handleManualRefresh,
    refreshCounter,
    // Auto-scraping controls
    autoScrapeInterval,
    setAutoScrapeInterval,
    isAutoScrapeEnabled,
    setIsAutoScrapeEnabled,
    scrapeErrors,
    lastScrapeTime,
    handleManualScrape,
    clearScrapeErrors
  };
};

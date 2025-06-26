
import FirecrawlApp from '@mendable/firecrawl-js';

interface ErrorResponse {
  success: false;
  error: string;
}

interface CrawlStatusResponse {
  success: true;
  status: string;
  completed: number;
  total: number;
  creditsUsed: number;
  expiresAt: string;
  data: any[];
}

type CrawlResponse = CrawlStatusResponse | ErrorResponse;

export class FirecrawlService {
  private static API_KEY_STORAGE_KEY = 'firecrawl_api_key';
  private static firecrawlApp: FirecrawlApp | null = null;
  private static readonly RATE_LIMIT_DELAY = 2000; // 2 seconds between requests

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    this.firecrawlApp = new FirecrawlApp({ apiKey });
    console.log('Firecrawl API key saved successfully');
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static async testApiKey(apiKey: string): Promise<boolean> {
    try {
      console.log('Testing Firecrawl API key');
      this.firecrawlApp = new FirecrawlApp({ apiKey });
      const testResponse = await this.firecrawlApp.crawlUrl('https://example.com', {
        limit: 1
      });
      return testResponse.success;
    } catch (error) {
      console.error('Error testing Firecrawl API key:', error);
      return false;
    }
  }

  static async testUrlScraping(url: string): Promise<{ success: boolean; error?: string; data?: any }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'Firecrawl API key not found' };
    }

    try {
      console.log('Testing URL scraping:', url);
      if (!this.firecrawlApp) {
        this.firecrawlApp = new FirecrawlApp({ apiKey });
      }

      // Test with a single page scrape first
      const response = await this.firecrawlApp.scrapeUrl(url, {
        formats: ['markdown'],
        onlyMainContent: true
      });

      if (response.success) {
        console.log('URL test successful:', url);
        return { 
          success: true,
          data: response
        };
      } else {
        console.error('URL test failed:', response);
        let errorMessage = 'Unknown error';
        
        if (response.error) {
          const error = response.error.toLowerCase();
          if (error.includes('timeout') || error.includes('timed out')) {
            errorMessage = 'URL timeout - site may be slow or blocking requests';
          } else if (error.includes('403') || error.includes('forbidden')) {
            errorMessage = 'Access forbidden - site blocks scraping';
          } else if (error.includes('404') || error.includes('not found')) {
            errorMessage = 'URL not found - check if the URL is correct';
          } else if (error.includes('500') || error.includes('server error')) {
            errorMessage = 'Server error - try again later';
          } else if (error.includes('cloudflare') || error.includes('captcha')) {
            errorMessage = 'Site protected by anti-bot measures';
          } else if (error.includes('ssl') || error.includes('certificate')) {
            errorMessage = 'SSL certificate issue';
          } else if (error.includes('dns') || error.includes('resolve')) {
            errorMessage = 'Cannot resolve domain - check URL';
          } else {
            errorMessage = response.error;
          }
        }
        
        return { 
          success: false, 
          error: errorMessage
        };
      }
    } catch (error) {
      console.error('Error testing URL scraping:', error);
      let errorMessage = 'Unknown error occurred';
      
      if (error instanceof Error) {
        const errorStr = error.message.toLowerCase();
        if (errorStr.includes('network') || errorStr.includes('fetch')) {
          errorMessage = 'Network error - check internet connection';
        } else if (errorStr.includes('cors')) {
          errorMessage = 'CORS policy blocks this request';
        } else if (errorStr.includes('invalid url')) {
          errorMessage = 'Invalid URL format';
        } else if (errorStr.includes('429') || errorStr.includes('rate limit')) {
          errorMessage = 'Rate limit exceeded - please wait before testing again';
        } else {
          errorMessage = error.message;
        }
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }

  private static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async crawlTransferSources(urls: string[], onProgress?: (progress: { completed: number; total: number; currentUrl: string }) => void): Promise<{ success: boolean; error?: string; data?: any }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'Firecrawl API key not found' };
    }

    try {
      console.log('Crawling transfer sources with Firecrawl API (sequential processing)');
      if (!this.firecrawlApp) {
        this.firecrawlApp = new FirecrawlApp({ apiKey });
      }

      const results = [];
      
      // Process URLs sequentially to avoid rate limits
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        
        // Report progress
        if (onProgress) {
          onProgress({
            completed: i,
            total: urls.length,
            currentUrl: url
          });
        }

        console.log(`Processing URL ${i + 1}/${urls.length}: ${url}`);
        
        try {
          const response = await this.firecrawlApp.scrapeUrl(url, {
            formats: ['markdown'],
            onlyMainContent: true
          });
          
          if (response.success) {
            results.push({
              url,
              success: true,
              data: response.markdown || response
            });
            console.log(`✓ Successfully crawled: ${url}`);
          } else {
            results.push({
              url,
              success: false,
              error: response.error || 'Unknown error'
            });
            console.log(`✗ Failed to crawl: ${url} - ${response.error}`);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.push({
            url,
            success: false,
            error: errorMessage
          });
          console.log(`✗ Error crawling: ${url} - ${errorMessage}`);
        }

        // Add delay between requests to respect rate limits (except for the last request)
        if (i < urls.length - 1) {
          console.log(`Waiting ${this.RATE_LIMIT_DELAY}ms before next request...`);
          await this.delay(this.RATE_LIMIT_DELAY);
        }
      }

      // Final progress update
      if (onProgress) {
        onProgress({
          completed: urls.length,
          total: urls.length,
          currentUrl: 'Complete'
        });
      }

      const successfulCrawls = results.filter(result => result.success);
      console.log(`Successfully crawled ${successfulCrawls.length} out of ${urls.length} sources`);
      
      return { 
        success: true,
        data: results 
      };
    } catch (error) {
      console.error('Error during transfer crawling:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to crawl transfer sources' 
      };
    }
  }
}

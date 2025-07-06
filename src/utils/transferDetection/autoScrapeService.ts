import { FirecrawlService } from '@/utils/FirecrawlService';
import { TransferIntegrationService } from '@/utils/transferIntegration';

interface SearchPattern {
  type: 'confirmed' | 'rumor' | 'breaking';
  queries: string[];
  priority: number;
}

export class AutoScrapeService {
  private static SEARCH_PATTERNS: SearchPattern[] = [
    // 🔥 Confirmed Transfers (Highest Priority)
    {
      type: 'confirmed',
      priority: 1,
      queries: [
        'Premier League summer 2025 confirmed transfers',
        'Football transfer window done deals site:bbc.co.uk',
        'Premier League official transfers January 2025',
        'confirmed signings Premier League winter 2025',
        'done deals January transfer window 2025'
      ]
    },
    
    // 💣 Breaking News & Inside Sources
    {
      type: 'breaking',
      priority: 2,
      queries: [
        'Fabrizio Romano transfer news January 2025',
        'medical completed fee agreed Premier League',
        'here we go transfers January 2025',
        'transfer breakthrough Premier League clubs',
        'official announcement transfer Premier League'
      ]
    },
    
    // 🤐 Gossip & Rumours (Enhanced Keywords)
    {
      type: 'rumor',
      priority: 3,
      queries: [
        // Transfer Activity
        'Premier League linked with monitoring eyeing targeting 2025',
        'set to sign close to signing on the verge',
        'advanced talks negotiations ongoing personal terms',
        'medical scheduled breakthrough Premier League',
        
        // Deal Structure
        'loan move loan-to-buy Premier League January 2025',
        'free transfer release clause Premier League',
        'bid submitted rejected offer counter-offer',
        'swap deal player-plus-cash Premier League',
        
        // Market Dynamics
        'valuation gap deal hijacked stumbling block',
        'emerging interest revived interest reignited talks',
        'deadline day last-minute deal Premier League',
        
        // Source-Based
        'sources close to trusted journalist Premier League',
        'multiple outlets reliable insiders transfer',
        'reportedly according to believed rumored',
        
        // Club-Specific Rumor Patterns
        'Arsenal linked with monitoring targeting',
        'Chelsea set to sign close to signing',
        'Liverpool advanced talks negotiations',
        'Manchester United bid submitted preparing',
        'Manchester City eyeing tracking scouted',
        'Tottenham poised ready breakthrough',
        'Newcastle medical scheduled terms agreed'
      ]
    }
  ];

  private static CLUB_SPECIFIC_PATTERNS = [
    'Arsenal ins and outs summer 2025',
    'Chelsea official transfer list',
    'Liverpool recruitment plan',
    'Manchester United contract renewals 2025',
    'Manchester City medical fee agreed',
    'Newcastle United youth promotions squad changes',
    'Tottenham target shortlist',
    'West Ham linked with',
    'Brighton transfer rumours',
    'Aston Villa talks ongoing',
    'Brentford linked with',
    'Bournemouth transfer news',
    'Crystal Palace official transfer list',
    'Everton ins and outs summer 2025',
    'Fulham transfer rumours',
    'Leeds United recruitment plan',
    'Nottingham Forest contract renewals 2025',
    'Wolves youth promotions squad changes',
    'Burnley official transfer list'
  ];

  static async performEnhancedScrape(): Promise<{
    success: boolean;
    transfersFound: number;
    sources: string[];
    error?: string;
  }> {
    console.log('🚀 Starting Enhanced Auto-Scrape for Latest Transfers');
    
    try {
      const apiKey = FirecrawlService.getApiKey();
      if (!apiKey) {
        return { 
          success: false, 
          transfersFound: 0, 
          sources: [], 
          error: 'No API key configured' 
        };
      }

      // Generate targeted URLs based on search patterns
      const targetUrls = this.generateTargetUrls();
      console.log(`📡 Generated ${targetUrls.length} target URLs for scraping`);

      // Scrape with enhanced targeting
      const crawlResults = await this.performTargetedCrawl(targetUrls);
      
      if (crawlResults.success && crawlResults.data) {
        // Process with enhanced detection
        const transfers = await TransferIntegrationService.processCrawlResults(crawlResults.data);
        
        console.log(`✅ Enhanced scrape complete: ${transfers.length} transfers found`);
        
        return {
          success: true,
          transfersFound: transfers.length,
          sources: crawlResults.data.map((r: any) => r.url),
        };
      }

      return { 
        success: false, 
        transfersFound: 0, 
        sources: [], 
        error: crawlResults.error 
      };

    } catch (error) {
      console.error('❌ Enhanced scrape failed:', error);
      return { 
        success: false, 
        transfersFound: 0, 
        sources: [], 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private static generateTargetUrls(): string[] {
    const baseUrls = [
      'https://www.bbc.com/sport/football/transfers',
      'https://www.skysports.com/football/transfers',
      'https://www.premierleague.com/news',
      'https://www.transfermarkt.com/premier-league/transfers/wettbewerb/GB1',
      'https://www.goal.com/en/transfers',
      'https://www.football365.com/transfers',
      'https://www.teamtalk.com/transfers',
      'https://www.planetsport.com/football/transfers',
      'https://www.givemesport.com/transfer-news',
      'https://talksport.com/football/transfer-news'
    ];

    // Add club-specific official pages
    const clubUrls = [
      'https://www.arsenal.com/news',
      'https://www.chelseafc.com/en/news',
      'https://www.liverpoolfc.com/news',
      'https://www.manutd.com/en/news',
      'https://www.mancity.com/news',
      'https://www.tottenhamhotspur.com/news',
      'https://www.whufc.com/news',
      'https://www.avfc.co.uk/news',
      'https://www.brentfordfc.com/news',
      'https://www.brightonandhovealbion.com/news',
      'https://www.evertonfc.com/news',
      'https://www.fulhamfc.com/news',
      'https://www.leedsunited.com/news',
      'https://www.nufc.co.uk/news',
      'https://www.cpfc.co.uk/news'
    ];

    return [...baseUrls, ...clubUrls];
  }

  private static async performTargetedCrawl(urls: string[]): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    try {
      // Use FirecrawlService with enhanced targeting
      const result = await FirecrawlService.crawlTransferSources(urls);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Crawl failed'
      };
    }
  }

  static async schedulePeriodicScrape(intervalMinutes: number = 30): Promise<void> {
    console.log(`📅 Scheduling periodic enhanced scrape every ${intervalMinutes} minutes`);
    
    setInterval(async () => {
      console.log('⏰ Running scheduled enhanced transfer scrape...');
      const result = await this.performEnhancedScrape();
      
      if (result.success) {
        console.log(`✅ Scheduled scrape found ${result.transfersFound} new transfers`);
        
        // Dispatch event to notify UI
        window.dispatchEvent(new CustomEvent('autoRefresh', { 
          detail: { 
            type: 'enhanced-scrape',
            transfersFound: result.transfersFound,
            sources: result.sources
          } 
        }));
      } else {
        console.log(`❌ Scheduled scrape failed: ${result.error}`);
      }
    }, intervalMinutes * 60 * 1000);
  }
}
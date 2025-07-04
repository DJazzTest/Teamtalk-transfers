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
        'done deals January transfer window 2025',
        'medical completed fee agreed Premier League',
        'official announcement transfer Premier League'
      ]
    },
    
    // 💣 Breaking News & Inside Sources
    {
      type: 'breaking',
      priority: 2,
      queries: [
        'Fabrizio Romano transfer news January 2025',
        'here we go transfers January 2025',
        'transfer breakthrough Premier League clubs',
        'BREAKING transfer news Premier League',
        'linked with preparing bid Premier League',
        'interested in talks ongoing Premier League',
        'advanced negotiations transfer Premier League'
      ]
    },
    
    // 🤐 Gossip & Rumours (Lower Priority)
    {
      type: 'rumor',
      priority: 3,
      queries: [
        'Football gossip transfer news 2025',
        'Premier League transfer rumours January',
        'transfer targets Premier League clubs',
        'January transfer window gossip 2025',
        'linked with interested in Premier League',
        'preparing bid considering move Premier League',
        'rumour mill transfer gossip Premier League'
      ]
    }
  ];

  // Source reliability tiers for confidence scoring
  private static SOURCE_TIERS = {
    tier1: ['bbc.co.uk', 'sky sports', 'guardian.com', 'espn.com'], // Highest reliability
    tier2: ['goal.com', 'transfermarkt.com', 'football365.com', 'talksport.com'], // Medium reliability  
    tier3: ['teamtalk.com', 'givemesport.com', 'planetsport.com'], // Lower reliability
    tier4: ['twitter.com', 'instagram.com', 'facebook.com'] // Social media - lowest
  };

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
      'https://www.skysports.com/transfer-centre',
      'https://www.premierleague.com/news',
      'https://www.transfermarkt.com/premier-league/transfers/wettbewerb/GB1',
      'https://www.goal.com/en/transfers',
      'https://www.football365.com/transfer-gossip',
      'https://www.teamtalk.com/transfer-news',
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

  // Calculate confidence score based on source reliability
  static calculateConfidenceScore(source: string): number {
    const sourceLower = source.toLowerCase();
    
    if (this.SOURCE_TIERS.tier1.some(t => sourceLower.includes(t))) return 90;
    if (this.SOURCE_TIERS.tier2.some(t => sourceLower.includes(t))) return 70;
    if (this.SOURCE_TIERS.tier3.some(t => sourceLower.includes(t))) return 50;
    if (this.SOURCE_TIERS.tier4.some(t => sourceLower.includes(t))) return 20;
    
    return 40; // Default for unknown sources
  }

  // Enhanced filtering with smart criteria
  static filterTransfers(transfers: any[], filters: {
    minFee?: number;
    clubs?: string[];
    positions?: string[];
    minConfidence?: number;
  }) {
    return transfers.filter(transfer => {
      // Fee filter
      if (filters.minFee && transfer.fee) {
        const feeNum = this.extractFeeNumber(transfer.fee);
        if (feeNum < filters.minFee) return false;
      }

      // Club filter
      if (filters.clubs && filters.clubs.length > 0) {
        if (!filters.clubs.includes(transfer.toClub) && !filters.clubs.includes(transfer.fromClub)) {
          return false;
        }
      }

      // Confidence filter
      if (filters.minConfidence) {
        const confidence = this.calculateConfidenceScore(transfer.source);
        if (confidence < filters.minConfidence) return false;
      }

      return true;
    });
  }

  private static extractFeeNumber(fee: string): number {
    const match = fee.match(/£(\d+(?:\.\d+)?)([KkMm])?/);
    if (!match) return 0;
    
    const num = parseFloat(match[1]);
    const unit = match[2]?.toLowerCase();
    
    if (unit === 'k') return num * 1000;
    if (unit === 'm') return num * 1000000;
    return num;
  }

  static async schedulePeriodicScrape(intervalMinutes: number = 15): Promise<void> {
    console.log(`📅 Scheduling enhanced periodic scrape every ${intervalMinutes} minutes`);
    
    setInterval(async () => {
      console.log('⏰ Running scheduled enhanced transfer scrape...');
      const result = await this.performEnhancedScrape();
      
      if (result.success && result.transfersFound > 0) {
        console.log(`✅ Scheduled scrape found ${result.transfersFound} new transfers`);
        
        // Real-time notification
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('newTransfersFound', { 
            detail: { 
              count: result.transfersFound,
              sources: result.sources,
              message: `🚨 ${result.transfersFound} new transfer${result.transfersFound > 1 ? 's' : ''} detected!`
            } 
          }));
        }
        
        // Dispatch refresh event
        window.dispatchEvent(new CustomEvent('autoRefresh', { 
          detail: { 
            type: 'enhanced-scrape',
            transfersFound: result.transfersFound,
            sources: result.sources
          } 
        }));
      } else {
        console.log(`❌ Scheduled scrape failed: ${result.error || 'No new transfers found'}`);
      }
    }, intervalMinutes * 60 * 1000);
  }
}
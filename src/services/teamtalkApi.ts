import { TeamTalkFeedResponse, TeamTalkArticle, ParsedTransferInfo } from '@/types/teamtalk';
import { Transfer } from '@/types/transfer';

const TEAMTALK_API_BASE_URL = 'https://www.teamtalk.com/mobile-app-feed';

function getTeamTalkFeedUrl(): string {
  try {
    // Force proxy in non-production bundles using Vite's flag
    if (!(import.meta as any).env?.PROD) {
      return `https://cors.isomorphic-git.org/${TEAMTALK_API_BASE_URL}`;
    }
    if (typeof window !== 'undefined') {
      const host = window.location.hostname || '';
      const isProd = /teamtalk\.com$/.test(host) || /netlify\.app$/.test(host);
      if (!isProd) {
        // Use a permissive CORS passthrough for non-production hosts (localhost, LAN IPs, etc.)
        return `https://cors.isomorphic-git.org/${TEAMTALK_API_BASE_URL}`;
      }
    }
  } catch {
    // noop – likely running in a non-browser context
  }
  return TEAMTALK_API_BASE_URL;
}

// Keywords to filter for transfer-related content
const TRANSFER_KEYWORDS = [
  'transfer', 'transfers', 'signing', 'signed', 'deal', 'move', 'moves',
  'rumour', 'rumours', 'rumors', 'gossip', 'speculation', 'linked',
  'target', 'interest', 'bid', 'offer', 'agreement', 'contract',
  'departure', 'exit', 'leaving', 'joins', 'joined', 'signs',
  'pursuit', 'chase', 'tracking', 'monitoring', 'scouting'
];

// Transfer status mapping from TeamTalk tags
const STATUS_MAPPING: Record<string, 'confirmed' | 'rumored' | 'pending'> = {
  'Top Source': 'confirmed',
  'Rumour': 'rumored',
  'Interest Confirmed': 'pending',
  'Heavily Linked': 'rumored',
  'Exclusive': 'confirmed'
};

export class TeamTalkApiService {
  private static instance: TeamTalkApiService;
  private cache: { data: TeamTalkFeedResponse | null; timestamp: number } = {
    data: null,
    timestamp: 0
  };
  private readonly CACHE_DURATION = 0; // Always fetch fresh for now to prevent staleness

  static getInstance(): TeamTalkApiService {
    if (!TeamTalkApiService.instance) {
      TeamTalkApiService.instance = new TeamTalkApiService();
    }
    return TeamTalkApiService.instance;
  }

  async fetchFeed(): Promise<TeamTalkFeedResponse> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cache.data && this.CACHE_DURATION > 0 && (now - this.cache.timestamp) < this.CACHE_DURATION) {
      return this.cache.data;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${getTeamTalkFeedUrl()}?_t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        cache: 'no-store',
        mode: 'cors',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`TeamTalk API returned ${response.status}: ${response.statusText}`);
        // Return cached data if API fails but we have cache
        if (this.cache.data) {
          console.log('Using cached TeamTalk data due to API failure');
          return this.cache.data;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: TeamTalkFeedResponse = await response.json();
      
      // Update cache
      this.cache = {
        data,
        timestamp: now
      };

      console.log('✅ TeamTalk API fetch successful:', data?.items?.length || 0, 'articles');
      return data;
      
    } catch (error) {
      console.error('Error fetching TeamTalk feed:', error);
      
      // Return cached data if available, otherwise return empty structure
      if (this.cache.data) {
        console.log('Using cached TeamTalk data due to fetch error');
        return this.cache.data;
      }
      
      // Return empty response structure to prevent crashes
      return {
        status: 500,
        message: 'Failed to fetch TeamTalk data',
        items: []
      };
    }
  }

  clearCache(): void {
    this.cache = { data: null, timestamp: 0 };
  }

  isTransferRelated(article: TeamTalkArticle): boolean {
    // Check if article has transfer players
    if (article.transfer_players && article.transfer_players.length > 0) {
      return true;
    }

    // Check transfer tags
    if (article.transfer_tags && article.transfer_tags.length > 0) {
      return true;
    }

    // Check categories for transfer-related content
    const transferCategories = ['Transfer News', 'Transfers', 'Rumours'];
    if (article.category && article.category.some(cat => transferCategories.includes(cat))) {
      return true;
    }

    // Check headline and excerpt for transfer keywords
    const textToCheck = `${article.headline || ''} ${article.excerpt || ''}`.toLowerCase();
    return TRANSFER_KEYWORDS.some(keyword => textToCheck.includes(keyword));
  }

  parseTransferInfo(article: TeamTalkArticle): ParsedTransferInfo | null {
    const headline = (article.headline || '').toLowerCase();
    const excerpt = (article.excerpt || '').toLowerCase();
    const description = (article.description || '').toLowerCase();
    
    // Get player name from transfer_players if available
    let playerName = '';
    if (article.transfer_players && article.transfer_players.length > 0) {
      playerName = article.transfer_players[0].name;
    } else {
      // Try to extract player name from headline
      const nameMatch = article.headline?.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/);
      if (nameMatch) {
        playerName = nameMatch[1];
      }
    }

    if (!playerName) return null;

    // Determine status from transfer tags
    let status: 'confirmed' | 'rumored' | 'pending' = 'rumored';
    if (article.transfer_tags && article.transfer_tags.length > 0) {
      const tag = article.transfer_tags[0];
      status = STATUS_MAPPING[tag] || 'rumored';
    }

    // Look for confirmed transfer indicators
    if (headline.includes('officially') || headline.includes('confirmed') || 
        headline.includes('signed') || headline.includes('completed')) {
      status = 'confirmed';
    }

    // Try to extract clubs and fee from content
    const fromClub = this.extractFromClub(headline + ' ' + excerpt);
    const toClub = this.extractToClub(headline + ' ' + excerpt);
    const fee = this.extractFee(headline + ' ' + excerpt + ' ' + description);

    return {
      playerName,
      fromClub,
      toClub,
      fee,
      status,
      confidence: this.calculateConfidence(article, playerName, fromClub, toClub)
    };
  }

  private extractFromClub(text: string): string | undefined {
    const fromPatterns = [
      /from ([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i,
      /leaving ([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i,
      /\b([A-Z][a-z]+(?: [A-Z][a-z]+)*) (?:star|striker|midfielder|defender|goalkeeper)/i
    ];

    for (const pattern of fromPatterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return undefined;
  }

  private extractToClub(text: string): string | undefined {
    const toPatterns = [
      /to ([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i,
      /joining ([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i,
      /signed (?:for|by) ([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i,
      /move to ([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i
    ];

    for (const pattern of toPatterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return undefined;
  }

  private extractFee(text: string): string | undefined {
    const feePatterns = [
      /£([\d.]+)m/i,
      /€([\d.]+)m/i,
      /\$([\d.]+)m/i,
      /worth (?:around )?£([\d.]+)/i,
      /fee of £([\d.]+)/i,
      /for £([\d.]+)/i
    ];

    for (const pattern of feePatterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = match[1];
        const currency = text.includes('€') ? '€' : text.includes('$') ? '$' : '£';
        return `${currency}${amount}m`;
      }
    }

    // Check for free transfer indicators
    if (text.includes('free') || text.includes('released') || text.includes('end of contract')) {
      return 'Free';
    }

    return undefined;
  }

  private calculateConfidence(
    article: TeamTalkArticle, 
    playerName: string, 
    fromClub?: string, 
    toClub?: string
  ): number {
    let confidence = 0.5; // Base confidence

    // Higher confidence if player is in transfer_players
    if (article.transfer_players && article.transfer_players.length > 0) {
      confidence += 0.3;
    }

    // Higher confidence if we have both clubs
    if (fromClub && toClub) {
      confidence += 0.2;
    } else if (fromClub || toClub) {
      confidence += 0.1;
    }

    // Higher confidence for certain transfer tags
    if (article.transfer_tags) {
      if (article.transfer_tags.includes('Top Source') || article.transfer_tags.includes('Exclusive')) {
        confidence += 0.2;
      }
    }

    return Math.min(confidence, 1.0);
  }

  async getTransferArticles(): Promise<TeamTalkArticle[]> {
    try {
      const feed = await this.fetchFeed();
      if (!feed?.items || feed.items.length === 0) {
        console.log('No TeamTalk articles available');
        return [];
      }
      
      // Loosen filtering: return all items; UI can decide which to display
      const articles = feed.items;
      console.log(`Returning ${articles.length} TeamTalk articles (no strict transfer filter)`);
      return articles;
    } catch (error) {
      console.error('Error getting transfer articles:', error);
      return []; // Return empty array instead of throwing
    }
  }

  async getTransfers(): Promise<Transfer[]> {
    try {
      const articles = await this.getTransferArticles();
      if (articles.length === 0) {
        return [];
      }
      
      const transfers: Transfer[] = [];
      
      for (const article of articles) {
        const parsed = this.parseTransferInfo(article);
        if (parsed && parsed.confidence > 0.6) {
          const transfer: Transfer = {
            id: `teamtalk-${article.id}`,
            playerName: parsed.playerName,
            fromClub: parsed.fromClub || 'Unknown',
            toClub: parsed.toClub || 'Unknown', 
            fee: parsed.fee || 'Undisclosed',
            status: parsed.status,
            date: article.pub_date || new Date().toISOString(),
            source: 'TeamTalk'
          };
          transfers.push(transfer);
        }
      }
      
      console.log(`Generated ${transfers.length} transfers from TeamTalk with confidence > 0.6`);
      return transfers;
    } catch (error) {
      console.error('Error getting transfers from TeamTalk:', error);
      return []; // Return empty array instead of throwing
    }
  }
}

export const teamTalkApi = TeamTalkApiService.getInstance();
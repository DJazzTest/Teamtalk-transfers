import { TeamTalkFeedResponse, TeamTalkArticle, ParsedTransferInfo } from '@/types/teamtalk';
import { Transfer } from '@/types/transfer';

const TEAMTALK_API_URL = 'https://www.teamtalk.com/mobile-app-feed';

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
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): TeamTalkApiService {
    if (!TeamTalkApiService.instance) {
      TeamTalkApiService.instance = new TeamTalkApiService();
    }
    return TeamTalkApiService.instance;
  }

  async fetchFeed(): Promise<TeamTalkFeedResponse> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cache.data && (now - this.cache.timestamp) < this.CACHE_DURATION) {
      return this.cache.data;
    }

    try {
      const response = await fetch(TEAMTALK_API_URL, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TransferCentre/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TeamTalkFeedResponse = await response.json();
      
      // Update cache
      this.cache = {
        data,
        timestamp: now
      };

      return data;
    } catch (error) {
      console.error('Error fetching TeamTalk feed:', error);
      throw error;
    }
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
    if (article.category.some(cat => transferCategories.includes(cat))) {
      return true;
    }

    // Check headline and excerpt for transfer keywords
    const textToCheck = `${article.headline} ${article.excerpt}`.toLowerCase();
    return TRANSFER_KEYWORDS.some(keyword => textToCheck.includes(keyword));
  }

  parseTransferInfo(article: TeamTalkArticle): ParsedTransferInfo | null {
    const headline = article.headline.toLowerCase();
    const excerpt = article.excerpt.toLowerCase();
    const description = article.description.toLowerCase();
    
    // Get player name from transfer_players if available
    let playerName = '';
    if (article.transfer_players && article.transfer_players.length > 0) {
      playerName = article.transfer_players[0].name;
    } else {
      // Try to extract player name from headline
      const nameMatch = article.headline.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/);
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
    const feed = await this.fetchFeed();
    return feed.items.filter(article => this.isTransferRelated(article));
  }

  async getTransfers(): Promise<Transfer[]> {
    const articles = await this.getTransferArticles();
    const transfers: Transfer[] = [];

    for (const article of articles) {
      const transferInfo = this.parseTransferInfo(article);
      if (transferInfo && transferInfo.confidence > 0.6) {
        const transfer: Transfer = {
          id: `teamtalk-${article.id}`,
          playerName: transferInfo.playerName,
          fromClub: transferInfo.fromClub || 'Unknown',
          toClub: transferInfo.toClub || 'Unknown',
          fee: transferInfo.fee || 'Undisclosed',
          date: article.pub_date,
          source: 'TeamTalk',
          status: transferInfo.status
        };
        transfers.push(transfer);
      }
    }

    return transfers;
  }
}

export const teamTalkApi = TeamTalkApiService.getInstance();

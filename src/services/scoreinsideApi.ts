import { 
  ScoreInsideResponse, 
  ScoreInsideTransferArticle, 
  TeamApiConfig, 
  TEAM_API_CONFIGS 
} from '@/types/scoreinside';
import { Transfer } from '@/types/transfer';

export class ScoreInsideApiService {
  private static instance: ScoreInsideApiService;
  private cache: Map<string, { data: ScoreInsideTransferArticle[]; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): ScoreInsideApiService {
    if (!ScoreInsideApiService.instance) {
      ScoreInsideApiService.instance = new ScoreInsideApiService();
    }
    return ScoreInsideApiService.instance;
  }

  private async fetchTeamData(config: TeamApiConfig): Promise<ScoreInsideTransferArticle[]> {
    const cacheKey = config.slug;
    const now = Date.now();
    
    // Return cached data if still valid
    const cached = this.cache.get(cacheKey);
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Try the manual transfer data first
      const { transferDataParser } = await import('@/services/transferDataParser');
      const manualTransfers = transferDataParser.getTeamTransfers(config.name);
      
      if (manualTransfers.length > 0) {
        // Convert manual transfers to ScoreInside format for consistency
        const mockArticles: ScoreInsideTransferArticle[] = manualTransfers.map((transfer, index) => ({
          aid: index + 1000,
          pid: index + 2000,
          ttfr: null,
          ttto: 1205, // Generic team ID
          scat: transfer.status === 'confirmed' ? 'Done Deal' : 'Rumours',
          article: {
            id: index + 3000,
            imid: index + 4000,
            hdl: `${transfer.playerName} ${transfer.fee !== 'Undisclosed' ? transfer.fee : ''} transfer`,
            sl: `${transfer.playerName.toLowerCase().replace(/\s+/g, '-')}-transfer`,
            sdt: transfer.date
          },
          team: {
            id: 1205,
            nm: transfer.toClub,
            sl: transfer.toClub.toLowerCase().replace(/\s+/g, '-')
          },
          team_from: transfer.fromClub ? {
            id: 1206,
            nm: transfer.fromClub,
            sl: transfer.fromClub.toLowerCase().replace(/\s+/g, '-')
          } : null,
          player: {
            id: index + 5000,
            nm: transfer.playerName,
            sl: transfer.playerName.toLowerCase().replace(/\s+/g, '-'),
            sn: transfer.playerName.split(' ').map(n => n[0]).join('')
          }
        }));
        
        // Update cache
        this.cache.set(cacheKey, {
          data: mockArticles,
          timestamp: now
        });

        return mockArticles;
      }

      // Fallback to original API call if no manual data
      let response = await fetch(config.transfersUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TransferCentre/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let data: ScoreInsideResponse = await response.json();
      
      // Check for API error messages
      if (data.message && data.message.includes('not found')) {
        throw new Error(`ScoreInside API: ${data.message}`);
      }
      
      // If transfers endpoint has no data, try news endpoint
      if (!data.result?.transfer_articles?.data || data.result.transfer_articles.data.length === 0) {
        response = await fetch(config.newsUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'TransferCentre/1.0'
          }
        });

        if (response.ok) {
          data = await response.json();
        }
      }

      const articles = data.result?.transfer_articles?.data || [];
      
      // Update cache
      this.cache.set(cacheKey, {
        data: articles,
        timestamp: now
      });

      return articles;
    } catch (error) {
      console.error(`Error fetching data for ${config.name}:`, error);
      return [];
    }
  }

  private mapToTransfer(article: ScoreInsideTransferArticle, teamSlug: string): Transfer | null {
    // Skip transfers without basic player information
    if (!article.player?.nm) {
      return null;
    }

    // Determine status from category
    let status: 'confirmed' | 'rumored' | 'pending' = 'rumored';
    switch (article.scat.toLowerCase()) {
      case 'top source':
      case 'confirmed':
      case 'official':
      case 'done deal':
      case 'done deals':
        status = 'confirmed';
        break;
      case 'rumours':
      case 'rumour':
      case 'speculation':
        status = 'rumored';
        break;
      case 'interest confirmed':
      case 'linked':
      case 'heavily linked':
        status = 'pending';
        break;
    }

    // Extract fee from headline if possible
    const fee = this.extractFee(article.article.hdl) || 'Undisclosed';

    // Determine from and to clubs - be more flexible
    let fromClub = 'Unknown';
    let toClub = 'Unknown';

    if (article.team_from?.nm && article.team?.nm) {
      fromClub = article.team_from.nm;
      toClub = article.team.nm;
    } else if (article.team?.nm) {
      // If we only have one team, try to determine direction from headline
      const headline = article.article.hdl.toLowerCase();
      if (headline.includes('signs') || headline.includes('joins') || headline.includes('completes move to')) {
        toClub = article.team.nm;
      } else if (headline.includes('leaves') || headline.includes('departs')) {
        fromClub = article.team.nm;
      } else {
        // Default: assume the team in the API is the target team
        toClub = article.team.nm;
      }
    }

    return {
      id: `scoreinside-${article.aid}`,
      playerName: article.player.nm,
      fromClub,
      toClub,
      fee,
      date: article.article.sdt,
      source: 'ScoreInside',
      status
    };
  }

  private extractFee(headline: string): string | undefined {
    const feePatterns = [
      /£([\d.]+)m/i,
      /€([\d.]+)m/i,
      /\$([\d.]+)m/i,
      /worth (?:around )?£([\d.]+)/i,
      /fee of £([\d.]+)/i,
      /for £([\d.]+)/i,
      /([\d.]+) million/i
    ];

    for (const pattern of feePatterns) {
      const match = headline.match(pattern);
      if (match) {
        const amount = match[1];
        const currency = headline.includes('€') ? '€' : headline.includes('$') ? '$' : '£';
        return `${currency}${amount}m`;
      }
    }

    // Check for free transfer indicators
    if (headline.toLowerCase().includes('free') || 
        headline.toLowerCase().includes('released') || 
        headline.toLowerCase().includes('end of contract')) {
      return 'Free';
    }

    return undefined;
  }

  async getTeamTransfers(teamSlug: string): Promise<Transfer[]> {
    const config = TEAM_API_CONFIGS.find(c => c.slug === teamSlug);
    if (!config) {
      console.warn(`No API config found for team: ${teamSlug}`);
      return [];
    }

    const articles = await this.fetchTeamData(config);
    return articles
      .map(article => this.mapToTransfer(article, teamSlug))
      .filter((transfer): transfer is Transfer => transfer !== null);
  }

  async getAllTeamsTransfers(): Promise<Map<string, Transfer[]>> {
    const results = new Map<string, Transfer[]>();
    
    // Fetch data for all teams in parallel
    const promises = TEAM_API_CONFIGS.map(async (config) => {
      const transfers = await this.getTeamTransfers(config.slug);
      return { slug: config.slug, transfers };
    });

    const teamResults = await Promise.allSettled(promises);
    
    teamResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.set(result.value.slug, result.value.transfers);
      } else {
        console.error(`Failed to fetch transfers for ${TEAM_API_CONFIGS[index].name}:`, result.reason);
        results.set(TEAM_API_CONFIGS[index].slug, []);
      }
    });

    return results;
  }

  async getAllTransfers(): Promise<Transfer[]> {
    const allTeamsData = await this.getAllTeamsTransfers();
    const allTransfers: Transfer[] = [];

    // Flatten all team transfers into a single array
    for (const [teamSlug, transfers] of allTeamsData) {
      allTransfers.push(...transfers);
    }

    // Remove duplicates based on player name and similar details
    const uniqueTransfers = this.removeDuplicates(allTransfers);

    // Sort by date (newest first)
    return uniqueTransfers.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  private removeDuplicates(transfers: Transfer[]): Transfer[] {
    const seen = new Set<string>();
    const unique: Transfer[] = [];

    for (const transfer of transfers) {
      // Create a key based on player name, clubs, and approximate date
      const key = `${transfer.playerName.toLowerCase()}-${transfer.fromClub.toLowerCase()}-${transfer.toClub.toLowerCase()}-${transfer.date.split('T')[0]}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(transfer);
      }
    }

    return unique;
  }

  // Get team name mapping for UI consistency
  getTeamDisplayName(slug: string): string {
    const config = TEAM_API_CONFIGS.find(c => c.slug === slug);
    return config?.name || slug;
  }

  // Get all available team slugs
  getAvailableTeams(): string[] {
    return TEAM_API_CONFIGS.map(config => config.slug);
  }

  // Clear cache for a specific team or all teams
  clearCache(teamSlug?: string): void {
    if (teamSlug) {
      this.cache.delete(teamSlug);
    } else {
      this.cache.clear();
    }
  }
}

export const scoreInsideApi = ScoreInsideApiService.getInstance();

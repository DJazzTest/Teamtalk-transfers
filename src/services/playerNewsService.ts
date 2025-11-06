import { Transfer, PlayerNewsArticle } from '@/types/transfer';
import { TeamTalkArticle } from '@/types/teamtalk';
import { newsApi } from './newsApi';
import { teamTalkApi } from './teamtalkApi';

export class PlayerNewsService {
  private static instance: PlayerNewsService;
  private cache: Map<string, PlayerNewsArticle[]> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  private cacheTimestamps: Map<string, number> = new Map();

  static getInstance(): PlayerNewsService {
    if (!PlayerNewsService.instance) {
      PlayerNewsService.instance = new PlayerNewsService();
    }
    return PlayerNewsService.instance;
  }

  /**
   * Get player-specific news articles for a given player name
   */
  async getPlayerNews(playerName: string): Promise<PlayerNewsArticle[]> {
    const cacheKey = `player-${playerName.toLowerCase()}`;
    const now = Date.now();
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    const cacheTime = this.cacheTimestamps.get(cacheKey);
    if (cached && cacheTime && (now - cacheTime) < this.CACHE_DURATION) {
      console.log(`📋 Using cached news for ${playerName}: ${cached.length} articles`);
      return cached;
    }

    try {
      console.log(`🔍 Searching for news articles related to: ${playerName}`);
      
      const playerNews: PlayerNewsArticle[] = [];
      
      // 1. Get news from TeamTalk API (most relevant for transfers)
      console.log(`📡 Fetching TeamTalk news for ${playerName}...`);
      const teamTalkNews = await this.getTeamTalkPlayerNews(playerName);
      console.log(`📰 TeamTalk found ${teamTalkNews.length} articles for ${playerName}`);
      playerNews.push(...teamTalkNews);
      
      // 2. Get news from general news API
      console.log(`📡 Fetching general news for ${playerName}...`);
      const generalNews = await this.getGeneralPlayerNews(playerName);
      console.log(`📰 General news found ${generalNews.length} articles for ${playerName}`);
      playerNews.push(...generalNews);
      
      // 3. Remove duplicates and sort by relevance
      const uniqueNews = this.removeDuplicateNews(playerNews);
      const sortedNews = uniqueNews.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      // Cache the results
      this.cache.set(cacheKey, sortedNews);
      this.cacheTimestamps.set(cacheKey, now);
      
      console.log(`✅ Found ${sortedNews.length} news articles for ${playerName}:`, sortedNews.map(n => ({ title: n.title, score: n.relevanceScore })));
      return sortedNews;
      
    } catch (error) {
      console.error(`Error fetching news for ${playerName}:`, error);
      return [];
    }
  }

  /**
   * Get player news from TeamTalk API
   */
  private async getTeamTalkPlayerNews(playerName: string): Promise<PlayerNewsArticle[]> {
    try {
      const articles = await teamTalkApi.getTransferArticles();
      const playerNews: PlayerNewsArticle[] = [];
      
      for (const article of articles) {
        const relevanceScore = this.calculateRelevanceScore(article, playerName);
        
        if (relevanceScore > 0.3) { // Only include articles with decent relevance
          const newsArticle: PlayerNewsArticle = {
            id: `teamtalk-${article.id}`,
            title: article.headline,
            summary: article.excerpt || article.description || 'Latest transfer news',
            source: 'TeamTalk',
            time: this.formatTime(article.pub_date),
            category: article.category?.[0] || 'Transfer News',
            url: article.link,
            image: article.image,
            playerName,
            relevanceScore
          };
          playerNews.push(newsArticle);
        }
      }
      
      return playerNews;
    } catch (error) {
      console.error('Error fetching TeamTalk player news:', error);
      return [];
    }
  }

  /**
   * Get player news from general news API
   */
  private async getGeneralPlayerNews(playerName: string): Promise<PlayerNewsArticle[]> {
    try {
      const newsArticles = await newsApi.fetchNews();
      const playerNews: PlayerNewsArticle[] = [];
      
      for (const article of newsArticles) {
        const relevanceScore = this.calculateTextRelevanceScore(
          `${article.title} ${article.summary}`,
          playerName
        );
        
        if (relevanceScore > 0.4) { // Higher threshold for general news
          const newsArticle: PlayerNewsArticle = {
            id: article.id,
            title: article.title,
            summary: article.summary,
            source: article.source,
            time: article.time,
            category: article.category,
            url: article.url,
            image: article.image,
            playerName,
            relevanceScore
          };
          playerNews.push(newsArticle);
        }
      }
      
      return playerNews;
    } catch (error) {
      console.error('Error fetching general player news:', error);
      return [];
    }
  }

  /**
   * Calculate relevance score for TeamTalk articles
   */
  private calculateRelevanceScore(article: TeamTalkArticle, playerName: string): number {
    let score = 0;
    const playerNameLower = playerName.toLowerCase();
    const headline = (article.headline || '').toLowerCase();
    const excerpt = (article.excerpt || '').toLowerCase();
    const description = (article.description || '').toLowerCase();
    const fullText = `${headline} ${excerpt} ${description}`;
    
    // Check if player is in transfer_players
    if (article.transfer_players && article.transfer_players.length > 0) {
      const hasPlayer = article.transfer_players.some(p => 
        p.name.toLowerCase().includes(playerNameLower) || 
        playerNameLower.includes(p.name.toLowerCase())
      );
      if (hasPlayer) {
        score += 0.8; // High score for direct player match
      }
    }
    
    // Check headline for player name
    if (headline.includes(playerNameLower)) {
      score += 0.6;
    } else if (this.isPartialNameMatch(headline, playerName)) {
      score += 0.4;
    }
    
    // Check excerpt and description
    if (excerpt.includes(playerNameLower) || description.includes(playerNameLower)) {
      score += 0.3;
    } else if (this.isPartialNameMatch(excerpt, playerName) || this.isPartialNameMatch(description, playerName)) {
      score += 0.2;
    }
    
    // Check for transfer-related keywords
    const transferKeywords = ['transfer', 'signing', 'deal', 'move', 'rumour', 'interest'];
    const hasTransferKeywords = transferKeywords.some(keyword => fullText.includes(keyword));
    if (hasTransferKeywords) {
      score += 0.2;
    }
    
    // Check transfer tags for higher confidence
    if (article.transfer_tags && article.transfer_tags.length > 0) {
      score += 0.1;
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * Calculate relevance score for general text content
   */
  private calculateTextRelevanceScore(text: string, playerName: string): number {
    let score = 0;
    const playerNameLower = playerName.toLowerCase();
    const textLower = text.toLowerCase();
    
    // Exact name match
    if (textLower.includes(playerNameLower)) {
      score += 0.7;
    } else if (this.isPartialNameMatch(textLower, playerName)) {
      score += 0.4;
    }
    
    // Check for transfer-related keywords
    const transferKeywords = ['transfer', 'signing', 'deal', 'move', 'rumour', 'interest', 'linked'];
    const hasTransferKeywords = transferKeywords.some(keyword => textLower.includes(keyword));
    if (hasTransferKeywords) {
      score += 0.3;
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * Check for partial name matches (e.g., "Kalvin Phillips" matches "Kalvin" or "Phillips")
   */
  private isPartialNameMatch(text: string, playerName: string): boolean {
    const nameParts = playerName.toLowerCase().split(' ');
    return nameParts.some(part => part.length > 2 && text.includes(part));
  }

  /**
   * Remove duplicate news articles based on title similarity
   */
  private removeDuplicateNews(news: PlayerNewsArticle[]): PlayerNewsArticle[] {
    const seen = new Set<string>();
    const unique: PlayerNewsArticle[] = [];
    
    for (const article of news) {
      const key = article.title.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(article);
      }
    }
    
    return unique;
  }

  /**
   * Format time string
   */
  private formatTime(dateString: string): string {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Just now';
      
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 7) return `${diffInDays}d ago`;
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch {
      return 'Just now';
    }
  }

  /**
   * Clear cache for a specific player or all players
   */
  clearCache(playerName?: string): void {
    if (playerName) {
      const cacheKey = `player-${playerName.toLowerCase()}`;
      this.cache.delete(cacheKey);
      this.cacheTimestamps.delete(cacheKey);
    } else {
      this.cache.clear();
      this.cacheTimestamps.clear();
    }
  }
}

export const playerNewsService = PlayerNewsService.getInstance();

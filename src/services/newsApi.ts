interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  time: string;
  category: string;
  image?: string;
  url?: string;
}

interface ScoreInsideNewsResponse {
  status: number;
  message: string;
  result: {
    transfer_articles: {
      current_page: number;
      data: Array<{
        aid: number;
        pid: number;
        ttfr: number | null;
        ttto: number;
        scat: string;
        article: {
          id: number;
          imid: number;
          hdl: string;
          sl: string;
          sdt: string;
          image?: {
            id: number;
            ttl: string;
            cap: string;
            fn: string;
            crd: string;
            ty: string;
            scim: string;
            impth: string;
          };
        };
        team: {
          id: number;
          nm: string;
          sl: string;
        };
        team_from: {
          id: number;
          nm: string;
          sl: string;
        } | null;
        player: {
          id: number;
          nm: string;
          sl: string;
          sn: string;
        };
      }>;
    };
  };
}

interface TeamTalkFeedResponse {
  status: string;
  items: Array<{
    id: string;
    headline: string;
    excerpt: string;
    pub_date: string;
    category: string[];
    image?: string;
    link?: string;
  }>;
}

export class NewsApiService {
  private static instance: NewsApiService;
  private cache: { data: NewsArticle[]; timestamp: number; lastSuccessfulFetch: number } = {
    data: [],
    timestamp: 0,
    lastSuccessfulFetch: 0
  };
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
  private readonly STALE_THRESHOLD = 6 * 60 * 60 * 1000; // 6 hours

  static getInstance(): NewsApiService {
    if (!NewsApiService.instance) {
      NewsApiService.instance = new NewsApiService();
    }
    return NewsApiService.instance;
  }

  async fetchNews(forceRefresh = false): Promise<NewsArticle[]> {
    const now = Date.now();
    
    // Return cached data if still valid and not forced refresh
    if (!forceRefresh && this.cache.data.length > 0 && (now - this.cache.timestamp) < this.CACHE_DURATION) {
      return this.cache.data;
    }

    try {
      const articles: NewsArticle[] = [];

      // Try TeamTalk first (priority source), then ScoreInside as fallback
      await this.tryTeamTalkFeed(articles);
      
      if (articles.length === 0) {
        await this.fetchScoreInsideNews(articles);
      }

      // If we got real articles, update last successful fetch time
      if (articles.length > 0) {
        this.cache.lastSuccessfulFetch = now;
      }

      // Don't use misleading mock data - show real status instead
      if (articles.length === 0) {
        console.warn('All news APIs failed - no articles available');
        // Return empty array instead of fake data
      }

      // Remove duplicates based on title similarity
      const uniqueArticles = this.deduplicateArticles(articles);

      // Sort by recency (newest first)
      const sortedArticles = uniqueArticles
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      // Update cache
      this.cache = {
        data: sortedArticles,
        timestamp: now,
        lastSuccessfulFetch: articles.length > 0 ? now : this.cache.lastSuccessfulFetch
      };

      return sortedArticles;
    } catch (error) {
      console.error('Error fetching news:', error);
      // Return cached data if available, otherwise empty array
      return this.cache.data.length > 0 ? this.cache.data : [];
    }
  }

  private deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
    const seen = new Set<string>();
    const unique: NewsArticle[] = [];
    
    for (const article of articles) {
      // Create a normalized title for comparison
      const normalizedTitle = article.title.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (!seen.has(normalizedTitle)) {
        seen.add(normalizedTitle);
        unique.push(article);
      }
    }
    
    return unique;
  }

  private async fetchScoreInsideNews(articles: NewsArticle[]): Promise<void> {
    try {
      // Try the new API endpoint first
      await this.tryNewApiEndpoint(articles);
      
      // If no articles from new endpoint, try the old endpoint with multiple pages
      if (articles.length === 0) {
        await this.tryOldApiEndpoint(articles);
      }
    } catch (error) {
      console.error('Error fetching ScoreInside news:', error);
    }
  }

  private async tryNewApiEndpoint(articles: NewsArticle[]): Promise<void> {
    try {
      const response = await fetch(
        'https://liveapi.scoreinside.com/api/user/favourite/teams/transfer-news?per_page=20',
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      );

      if (response.ok) {
        const data: ScoreInsideNewsResponse = await response.json();
        
        if (data.result?.transfer_articles?.data) {
          data.result.transfer_articles.data.forEach(item => {
            // Ensure we have proper image URLs
            let imageUrl: string | undefined = undefined;
            if (item.article.image?.impth) {
              imageUrl = item.article.image.impth.startsWith('http') 
                ? item.article.image.impth 
                : `https://liveapi.scoreinside.com${item.article.image.impth}`;
            }

            articles.push({
              id: `scoreinside-${item.aid}`,
              title: item.article.hdl,
              summary: `${item.player.nm} - ${item.team.nm}${item.team_from ? ` from ${item.team_from.nm}` : ''}`,
              source: 'ScoreInside',
              time: this.formatTime(item.article.sdt),
              category: item.scat,
              image: imageUrl,
              url: `https://liveapi.scoreinside.com/news/${item.article.sl}`
            });
          });
        }
      }
    } catch (error) {
      console.error('New API endpoint failed:', error);
    }
  }

  private async tryOldApiEndpoint(articles: NewsArticle[]): Promise<void> {
    try {
      const pages = [1, 2];
      const fetchPromises = pages.map(page => 
        fetch(
          `https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=${page}&per_page=15`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          }
        )
      );

      const responses = await Promise.all(fetchPromises);
      
      for (const response of responses) {
        if (response.ok) {
          const data: ScoreInsideNewsResponse = await response.json();
          
          if (data.result?.transfer_articles?.data) {
            data.result.transfer_articles.data.forEach(item => {
              let imageUrl: string | undefined = undefined;
              if (item.article.image?.impth) {
                imageUrl = item.article.image.impth.startsWith('http') 
                  ? item.article.image.impth 
                  : `https://liveapi.scoreinside.com${item.article.image.impth}`;
              }

              articles.push({
                id: `scoreinside-${item.aid}`,
                title: item.article.hdl,
                summary: `${item.player.nm} - ${item.team.nm}${item.team_from ? ` from ${item.team_from.nm}` : ''}`,
                source: 'ScoreInside',
                time: this.formatTime(item.article.sdt),
                category: item.scat,
                image: imageUrl,
                url: `https://liveapi.scoreinside.com/news/${item.article.sl}`
              });
            });
          }
        }
      }
    } catch (error) {
      console.error('Old API endpoint failed:', error);
    }
  }

  private async tryTeamTalkFeed(articles: NewsArticle[]): Promise<void> {
    try {
      const response = await fetch('https://www.teamtalk.com/mobile-app-feed', {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (response.ok) {
        const data: TeamTalkFeedResponse = await response.json();
        
        if (data.items && Array.isArray(data.items)) {
          data.items.forEach(item => {
            // Filter for transfer-related content
            const isTransferNews = item.category.some(cat => 
              cat.toLowerCase().includes('transfer') || 
              cat.toLowerCase().includes('rumor') ||
              cat.toLowerCase().includes('deal')
            );

            if (isTransferNews) {
              articles.push({
                id: item.id,
                title: item.headline,
                summary: item.excerpt,
                source: 'TeamTalk',
                time: this.formatTime(item.pub_date),
                category: item.category[0] || 'Transfer News',
                image: item.image,
                url: item.link
              });
            }
          });
        }
      }
    } catch (error) {
      console.error('TeamTalk feed failed:', error);
    }
  }

  private formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  }

  isDataStale(): boolean {
    const now = Date.now();
    return (now - this.cache.lastSuccessfulFetch) > this.STALE_THRESHOLD;
  }

  getLastSuccessfulFetch(): Date | null {
    return this.cache.lastSuccessfulFetch > 0 ? new Date(this.cache.lastSuccessfulFetch) : null;
  }

  clearCache(): void {
    this.cache = { data: [], timestamp: 0, lastSuccessfulFetch: 0 };
  }
}

export const newsApi = NewsApiService.getInstance();
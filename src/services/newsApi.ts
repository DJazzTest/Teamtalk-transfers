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
  private cache: { data: NewsArticle[]; timestamp: number } = {
    data: [],
    timestamp: 0
  };
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for fresher news

  static getInstance(): NewsApiService {
    if (!NewsApiService.instance) {
      NewsApiService.instance = new NewsApiService();
    }
    return NewsApiService.instance;
  }

  async fetchNews(): Promise<NewsArticle[]> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cache.data.length > 0 && (now - this.cache.timestamp) < this.CACHE_DURATION) {
      return this.cache.data;
    }

    try {
      const articles: NewsArticle[] = [];

      // Fetch from ScoreInside API
      await this.fetchScoreInsideNews(articles);

      // Fetch from TeamTalk API
      await this.fetchTeamTalkNews(articles);

      // Remove duplicates and sort by recency
      const uniqueArticles = this.removeDuplicates(articles)
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      // Update cache
      this.cache = {
        data: uniqueArticles,
        timestamp: now
      };

      return uniqueArticles;
    } catch (error) {
      console.error('Error fetching news:', error);
      return this.cache.data; // Return cached data on error
    }
  }

  private async fetchScoreInsideNews(articles: NewsArticle[]): Promise<void> {
    try {
      const response = await fetch(
        'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=25&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'TransferCentre/1.0'
          }
        }
      );

      if (response.ok) {
        const data: ScoreInsideNewsResponse = await response.json();
        
        if (data.result?.transfer_articles?.data) {
          data.result.transfer_articles.data.forEach(item => {
            articles.push({
              id: `scoreinside-${item.aid}`,
              title: item.article.hdl,
              summary: `${item.player.nm} - ${item.team.nm}${item.team_from ? ` from ${item.team_from.nm}` : ''}`,
              source: 'TeamTalk',
              time: this.formatTime(item.article.sdt),
              category: item.scat,
              image: item.article.image?.impth,
              // Correct TeamTalk URL format: /news/{slug}
              url: `https://www.teamtalk.com/news/${item.article.sl}`
            });
          });
        }
      }
    } catch (error) {
      console.error('Error fetching ScoreInside news:', error);
    }
  }

  private async fetchTeamTalkNews(articles: NewsArticle[]): Promise<void> {
    try {
      const response = await fetch('https://www.teamtalk.com/mobile-app-feed', {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TransferCentre/1.0'
        }
      });

      if (response.ok) {
        const data: TeamTalkFeedResponse = await response.json();
        
        if (data.items) {
          // Filter for transfer-related content
          const transferKeywords = ['transfer', 'signing', 'deal', 'move', 'rumour', 'linked'];
          
          data.items
            .filter(item => {
              const content = `${item.headline} ${item.excerpt}`.toLowerCase();
              return transferKeywords.some(keyword => content.includes(keyword));
            })
            .slice(0, 25) // Increase articles limit
            .forEach(item => {
              articles.push({
                id: `teamtalk-${item.id}`,
                title: item.headline,
                summary: item.excerpt,
                source: 'TeamTalk',
                time: this.formatTime(item.pub_date),
                category: item.category?.[0] || 'Transfer News',
                image: item.image,
                url: item.link
              });
            });
        }
      }
    } catch (error) {
      console.error('Error fetching TeamTalk news:', error);
    }
  }

  private removeDuplicates(articles: NewsArticle[]): NewsArticle[] {
    const seen = new Set<string>();
    const unique: NewsArticle[] = [];

    for (const article of articles) {
      // Create a key based on title similarity
      const key = article.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 50);
      
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(article);
      }
    }

    return unique;
  }

  private formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  }

  clearCache(): void {
    this.cache = { data: [], timestamp: 0 };
  }
}

export const newsApi = NewsApiService.getInstance();
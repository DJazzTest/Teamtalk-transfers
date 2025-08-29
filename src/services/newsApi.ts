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
  private readonly CACHE_DURATION = 1 * 60 * 1000; // 1 minute for more frequent updates

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

      // Try fetching from ScoreInside API first
      await this.fetchScoreInsideNews(articles);

      // Only use mock data if absolutely no articles from any source
      if (articles.length === 0) {
        console.warn('All news APIs failed, using fallback data');
        articles.push(...this.getMockNews());
      }

      // Sort by recency (newest first)
      const sortedArticles = articles
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      // Update cache
      this.cache = {
        data: sortedArticles,
        timestamp: now
      };

      return sortedArticles;
    } catch (error) {
      console.error('Error fetching news:', error);
      // Return mock data if API fails
      return this.getMockNews();
    }
  }

  private getMockNews(): NewsArticle[] {
    const now = new Date();
    const mockArticles = [
      {
        id: 'mock-1',
        title: 'Arsenal close to signing £60m midfielder in January window',
        summary: 'Gunners preparing bid for Brighton star who has impressed this season',
        source: 'TeamTalk',
        time: this.formatTime(new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()),
        category: 'Transfer News',
        url: 'https://www.teamtalk.com/transfer-centre'
      },
      {
        id: 'mock-2', 
        title: 'Manchester United plot move for Serie A striker',
        summary: 'Red Devils monitoring 25-year-old forward ahead of potential summer bid',
        source: 'TeamTalk',
        time: this.formatTime(new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString()),
        category: 'Transfer Rumours',
        url: 'https://www.teamtalk.com/transfer-centre'
      },
      {
        id: 'mock-3',
        title: 'Liverpool eye Premier League winger as Salah replacement',
        summary: 'Reds considering move for England international if Egyptian leaves',
        source: 'TeamTalk', 
        time: this.formatTime(new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString()),
        category: 'Transfer News',
        url: 'https://www.teamtalk.com/transfer-centre'
      },
      {
        id: 'mock-4',
        title: 'Chelsea prepare £40m bid for La Liga defender',
        summary: 'Blues targeting young centre-back to strengthen defensive options',
        source: 'TeamTalk',
        time: this.formatTime(new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString()),
        category: 'Transfer Rumours',
        url: 'https://www.teamtalk.com/transfer-centre'
      },
      {
        id: 'mock-5',
        title: 'Tottenham agree personal terms with German midfielder',
        summary: 'Spurs move closer to securing January signing after breakthrough talks',
        source: 'TeamTalk',
        time: this.formatTime(new Date(now.getTime() - 10 * 60 * 60 * 1000).toISOString()),
        category: 'Transfer News',
        url: 'https://www.teamtalk.com/transfer-centre'
      },
      {
        id: 'mock-6',
        title: 'Manchester City monitoring Brazilian wonderkid',
        summary: 'Citizens tracking 18-year-old striker valued at £30m by South American club',
        source: 'TeamTalk',
        time: this.formatTime(new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString()),
        category: 'Transfer Rumours',
        url: 'https://www.teamtalk.com/transfer-centre'
      }
    ];
    
    return mockArticles;
  }

  private async fetchScoreInsideNews(articles: NewsArticle[]): Promise<void> {
    try {
      // Try the new API endpoint first
      await this.tryNewApiEndpoint(articles);
      
      // If no articles from new endpoint, try the old endpoint with multiple pages
      if (articles.length === 0) {
        await this.tryOldApiEndpoint(articles);
      }
      
      // Try TeamTalk feed as fallback
      if (articles.length === 0) {
        await this.tryTeamTalkFeed(articles);
      }
    } catch (error) {
      console.error('Error fetching ScoreInside news:', error);
    }
  }

  private async tryNewApiEndpoint(articles: NewsArticle[]): Promise<void> {
    try {
      const response = await fetch(
        'https://liveapi.scoreinside.com/api/user/favourite/teams/transfer-news?per_page=20&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
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
              source: 'TeamTalk',
              time: this.formatTime(item.article.sdt),
              category: item.scat,
              image: imageUrl,
              url: `https://www.teamtalk.com/news/${item.article.sl}`
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
          `https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=${page}&per_page=15&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'TransferCentre/1.0'
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
                source: 'TeamTalk',
                time: this.formatTime(item.article.sdt),
                category: item.scat,
                image: imageUrl,
                url: `https://www.teamtalk.com/news/${item.article.sl}`
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
          'User-Agent': 'TransferCentre/1.0'
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

  clearCache(): void {
    this.cache = { data: [], timestamp: 0 };
  }
}

export const newsApi = NewsApiService.getInstance();
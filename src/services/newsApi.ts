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

      // Try multiple news sources in parallel
      await Promise.allSettled([
        this.tryTeamTalkFeed(articles),
        this.fetchScoreInsideNews(articles),
        this.fetchComprehensiveNews(articles),
        this.fetchScoreInsideTransferNews(articles)
      ]);

      // If we got real articles, update last successful fetch time
      if (articles.length > 0) {
        this.cache.lastSuccessfulFetch = now;
        console.log(`✅ Fetched ${articles.length} news articles from multiple sources`);
      } else {
        console.warn('⚠️ All news APIs failed - no articles available');
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
      const fcmToken = 'ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ';
      const response = await fetch(
        `https://liveapi.scoreinside.com/api/user/favourite/teams/transfer-news?per_page=30&fcm_token=${fcmToken}`,
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
              category: item.scat || 'Transfer News',
              image: imageUrl ? this.wrapImageUrlWithProxy(imageUrl) : undefined,
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
      const fcmToken = 'ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ';
      const pages = [1, 2];
      const fetchPromises = pages.map(page => 
        fetch(
          `https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=${page}&per_page=15&fcm_token=${fcmToken}`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          }
        )
      );

      const responses = await Promise.allSettled(fetchPromises);
      
      for (const result of responses) {
        if (result.status === 'fulfilled' && result.value.ok) {
          try {
            const data: ScoreInsideNewsResponse = await result.value.json();
            
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
                  category: item.scat || 'Transfer News',
                  image: imageUrl,
                  url: `https://liveapi.scoreinside.com/news/${item.article.sl}`
                });
              });
            }
          } catch (parseError) {
            console.error('Error parsing ScoreInside response:', parseError);
          }
        }
      }
    } catch (error) {
      console.error('Old API endpoint failed:', error);
    }
  }

  private async tryTeamTalkFeed(articles: NewsArticle[]): Promise<void> {
    try {
      // Try the TeamTalk API endpoint first (has better image data)
      try {
        const apiResponse = await fetch('https://stagingapi.tt-apis.com/api/transfer-articles?page=1&per_page=30', {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (apiResponse.ok) {
          const apiData: any = await apiResponse.json();
          
          if (apiData.result?.transfer_articles?.data && Array.isArray(apiData.result.transfer_articles.data)) {
            apiData.result.transfer_articles.data.forEach((item: any) => {
              // Try multiple image sources
              let teamTalkImage: string | undefined = undefined;
              
              // Debug: Log the full article structure for first few items
              const articleTitle = item.article?.hdl || 'Unknown';
              if (item.article?.image) {
                console.log(`🔍 [${articleTitle.substring(0, 40)}] Image object:`, item.article.image);
              } else {
                console.warn(`⚠️ [${articleTitle.substring(0, 40)}] No image object found`);
              }
              
              // First try scim path (most common for TeamTalk)
              if (item.article?.image?.scim) {
                const scimPath = item.article.image.scim;
                // scim might already be a full path or just the filename
                if (scimPath.includes('/')) {
                  teamTalkImage = scimPath.startsWith('http') 
                    ? scimPath 
                    : `https://images.teamtalk.com/content/uploads/${scimPath}`;
                } else {
                  // If it's just a filename, we need to construct the full path
                  // Try to get date from article date
                  const articleDate = item.article?.sdt ? new Date(item.article.sdt) : new Date();
                  const year = articleDate.getFullYear();
                  const month = String(articleDate.getMonth() + 1).padStart(2, '0');
                  const day = String(articleDate.getDate()).padStart(2, '0');
                  teamTalkImage = `https://images.teamtalk.com/content/uploads/${year}/${month}/${day}0000/${scimPath}`;
                }
                console.log(`✅ [${articleTitle.substring(0, 40)}] Using scim: ${teamTalkImage}`);
              }
              // Try direct image URL
              else if (item.article?.image?.url) {
                teamTalkImage = item.article.image.url;
                console.log(`✅ [${articleTitle.substring(0, 40)}] Using url: ${teamTalkImage}`);
              }
              // Try image path
              else if (item.article?.image?.path) {
                teamTalkImage = item.article.image.path.startsWith('http') 
                  ? item.article.image.path 
                  : `https://images.teamtalk.com${item.article.image.path}`;
                console.log(`✅ [${articleTitle.substring(0, 40)}] Using path: ${teamTalkImage}`);
              }
              // Try image filename
              else if (item.article?.image?.fn) {
                teamTalkImage = `https://images.teamtalk.com/content/uploads/${item.article.image.fn}`;
                console.log(`✅ [${articleTitle.substring(0, 40)}] Using fn: ${teamTalkImage}`);
              }
              // Try impth (ScoreInside format, sometimes used)
              else if (item.article?.image?.impth) {
                teamTalkImage = item.article.image.impth.startsWith('http') 
                  ? item.article.image.impth 
                  : `https://images.teamtalk.com${item.article.image.impth}`;
                console.log(`✅ [${articleTitle.substring(0, 40)}] Using impth: ${teamTalkImage}`);
              }
              // Try ttl (title might contain image info)
              else if (item.article?.image?.ttl) {
                const possiblePath = item.article.image.ttl;
                if (possiblePath.includes('/') || possiblePath.includes('.')) {
                  teamTalkImage = possiblePath.startsWith('http') 
                    ? possiblePath 
                    : `https://images.teamtalk.com/content/uploads/${possiblePath}`;
                  console.log(`✅ [${articleTitle.substring(0, 40)}] Using ttl: ${teamTalkImage}`);
                }
              }

              const finalImage = teamTalkImage ? this.wrapImageUrlWithProxy(teamTalkImage) : undefined;
              if (finalImage) {
                console.log(`🖼️ [${articleTitle.substring(0, 40)}] Final URL: ${finalImage.substring(0, 120)}`);
              } else {
                console.warn(`⚠️ [${articleTitle.substring(0, 40)}] No image URL generated`);
              }

              articles.push({
                id: `teamtalk-api-${item.aid || item.article?.id}`,
                title: item.article?.hdl || 'Untitled',
                summary: item.article?.description || `${item.player?.nm || ''} - ${item.team?.nm || ''}`,
                source: 'TeamTalk',
                time: this.formatTime(item.article?.sdt || new Date().toISOString()),
                category: 'Transfer News',
                image: finalImage,
                url: item.article?.sl ? `https://www.teamtalk.com/${item.team?.sl || 'transfer-news'}/${item.article.sl}` : undefined
              });
            });
            console.log(`✅ TeamTalk API: Added ${apiData.result.transfer_articles.data.length} articles`);
          }
        }
      } catch (apiError) {
        console.error('TeamTalk API endpoint failed:', apiError);
      }

      // Also try the mobile feed as backup
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
                // Check if we already have this article
                const existing = articles.find(a => a.title === item.headline);
                if (!existing) {
                  articles.push({
                    id: item.id,
                    title: item.headline,
                    summary: item.excerpt,
                    source: 'TeamTalk',
                    time: this.formatTime(item.pub_date),
                    category: item.category[0] || 'Transfer News',
                    image: item.image ? this.wrapImageUrlWithProxy(item.image) : undefined,
                    url: item.link
                  });
                }
              }
            });
          }
        }
      } catch (feedError) {
        console.error('TeamTalk feed failed:', feedError);
      }
    } catch (error) {
      console.error('TeamTalk feed failed:', error);
    }
  }

  private async fetchComprehensiveNews(articles: NewsArticle[]): Promise<void> {
    try {
      const { comprehensiveNewsApi } = await import('@/services/comprehensiveNewsApi');
      
      // Fetch from all comprehensive sources
      const [sport365News, sbLiveNews, teamTalkNews] = await Promise.allSettled([
        comprehensiveNewsApi.getSport365News(),
        comprehensiveNewsApi.getSBLiveNews(),
        comprehensiveNewsApi.getTeamTalkNews()
      ]);

      // Process Sport365 news
      if (sport365News.status === 'fulfilled') {
        sport365News.value.forEach(item => {
          articles.push({
            id: item.id,
            title: item.title,
            summary: item.summary || '',
            source: item.source,
            time: this.formatTime(item.publishedAt),
            category: item.category || 'Football',
            image: item.image ? this.wrapImageUrlWithProxy(item.image) : undefined,
            url: item.url
          });
        });
      }

      // Process SB Live news
      if (sbLiveNews.status === 'fulfilled') {
        sbLiveNews.value.forEach(item => {
          articles.push({
            id: item.id,
            title: item.title,
            summary: item.summary || '',
            source: item.source,
            time: this.formatTime(item.publishedAt),
            category: item.category || 'Football',
            image: item.image ? this.wrapImageUrlWithProxy(item.image) : undefined,
            url: item.url
          });
        });
      }

      // Process TeamTalk news from comprehensive API
      if (teamTalkNews.status === 'fulfilled') {
        teamTalkNews.value.forEach(item => {
          articles.push({
            id: item.id,
            title: item.title,
            summary: item.summary || '',
            source: item.source,
            time: this.formatTime(item.publishedAt),
            category: item.category || 'Transfer News',
            image: item.image ? this.wrapImageUrlWithProxy(item.image) : undefined,
            url: item.url
          });
        });
      }
    } catch (error) {
      console.error('Error fetching comprehensive news:', error);
    }
  }

  private async fetchScoreInsideTransferNews(articles: NewsArticle[]): Promise<void> {
    try {
      // Try the transfer news endpoint with FCM token
      const fcmToken = 'ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ';
      const response = await fetch(
        `https://liveapi.scoreinside.com/api/user/favourite/teams/transfer-news?per_page=30&fcm_token=${fcmToken}`,
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
            let imageUrl: string | undefined = undefined;
            if (item.article.image?.impth) {
              imageUrl = item.article.image.impth.startsWith('http') 
                ? item.article.image.impth 
                : `https://liveapi.scoreinside.com${item.article.image.impth}`;
            }

                articles.push({
                  id: `scoreinside-transfer-${item.aid}`,
                  title: item.article.hdl,
                  summary: `${item.player.nm} - ${item.team.nm}${item.team_from ? ` from ${item.team_from.nm}` : ''}`,
                  source: 'ScoreInside',
                  time: this.formatTime(item.article.sdt),
                  category: item.scat || 'Transfer News',
                  image: imageUrl ? this.wrapImageUrlWithProxy(imageUrl) : undefined,
                  url: `https://liveapi.scoreinside.com/news/${item.article.sl}`
                });
          });
        }
      }
    } catch (error) {
      console.error('ScoreInside transfer news failed:', error);
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

  private wrapImageUrlWithProxy(url: string): string {
    if (!url) return '';
    if (url.startsWith('https://images.ps-aws.com/')) return url;
    
    // Ensure URL is properly formatted
    let cleanUrl = url.trim();
    
    // If URL doesn't start with http, it might be a relative path
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      if (cleanUrl.startsWith('//')) {
        cleanUrl = `https:${cleanUrl}`;
      } else if (cleanUrl.startsWith('/wp-content')) {
        cleanUrl = `https://www.teamtalk.com${cleanUrl}`;
      } else if (cleanUrl.startsWith('/')) {
        cleanUrl = `https://images.teamtalk.com${cleanUrl}`;
      } else {
        cleanUrl = `https://images.teamtalk.com/content/uploads/${cleanUrl}`;
      }
    }
    
    // Some TeamTalk images come from the main wordpress uploads path
    if (cleanUrl.includes('/wp-content/uploads/')) {
      cleanUrl = cleanUrl.replace('www.teamtalk.com/wp-content/uploads/', 'images.teamtalk.com/content/uploads/');
    }

    // Remove any accidental double slashes after protocol
    cleanUrl = cleanUrl.replace(/(^https?:\/\/)(\/+)/, '$1');

    // Last sanity check: ensure we have https schema
    if (!cleanUrl.startsWith('http')) {
      // Assume it's a TeamTalk relative path
      cleanUrl = `https://images.teamtalk.com/content/uploads/${cleanUrl.replace(/^\/+/, '')}`;
    }
    
    const proxiedUrl = `https://images.ps-aws.com/c?url=${encodeURIComponent(cleanUrl)}`;
    return proxiedUrl;
  }
}

export const newsApi = NewsApiService.getInstance();
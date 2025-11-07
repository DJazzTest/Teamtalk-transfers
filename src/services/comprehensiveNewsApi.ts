/* Comprehensive News API service integrating all provided news sources */

export interface NewsItem {
  id: string;
  title: string;
  summary?: string;
  image?: string;
  url: string;
  publishedAt: string;
  source: string;
  team?: string;
  category?: string;
}

export interface NewsResponse {
  items: NewsItem[];
  total: number;
  sources: string[];
}

// API endpoints
const SPORT365_NEWS_API = 'https://news.sport365.com/api/v1/news/entries?sport=1&limit=25&language=1&base64=1';
const SB_LIVE_FEED_API = 'https://inframe.sportsdevhub.com/api/feed?offset=0&client=sblive&sport=soccer&locale=en&topic=general';
const SB_LIVE_BANNERS_API = 'https://inframe.sportsdevhub.com/api/feed/banners?sport=soccer&locale=en&client=sblive';
const SB_LIVE_PINNED_API = 'https://inframe.sportsdevhub.com/api/feed/pinned?locale=en&type=general&sport=soccer&matchid=&client=sblive';
const TEAMTALK_API = 'https://stagingapi.tt-apis.com/api/transfer-articles?page=1&per_page=10';

// Team mapping for filtering
import { normalizeTeamName, getTeamSlug } from '@/utils/teamMapping';
const TEAM_KEYWORDS: Record<string, string[]> = {
  'Arsenal': ['Arsenal', 'Gunners', 'Emirates'],
  'Chelsea': ['Chelsea', 'Blues', 'Stamford Bridge'],
  'Liverpool': ['Liverpool', 'Reds', 'Anfield'],
  'Manchester United': ['Manchester United', 'Man United', 'Man Utd', 'Old Trafford'],
  'Manchester City': ['Manchester City', 'Man City', 'Etihad'],
  'Tottenham Hotspur': ['Tottenham', 'Spurs', 'White Hart Lane'],
  'Newcastle United': ['Newcastle', 'Magpies', 'St James Park'],
  'Brighton & Hove Albion': ['Brighton', 'Seagulls', 'Amex Stadium'],
  'Aston Villa': ['Aston Villa', 'Villa', 'Villa Park'],
  'Bournemouth': ['Bournemouth', 'Cherries', 'Vitality Stadium'],
  'Crystal Palace': ['Crystal Palace', 'Palace', 'Selhurst Park'],
  'Nottingham Forest': ['Nottingham Forest', 'Forest', 'City Ground'],
  'Fulham': ['Fulham', 'Cottagers', 'Craven Cottage'],
  'Brentford': ['Brentford', 'Bees', 'Brentford Community Stadium'],
  'Everton': ['Everton', 'Toffees', 'Goodison Park'],
  'Wolves': ['Wolves', 'Wolverhampton', 'Molineux'],
  'West Ham United': ['West Ham', 'Hammers', 'London Stadium'],
  'Sunderland': ['Sunderland', 'Black Cats', 'Stadium of Light'],
  'Burnley': ['Burnley', 'Clarets', 'Turf Moor'],
  'Leeds United': ['Leeds', 'Leeds United', 'Elland Road']
};

async function safeJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try { 
    return JSON.parse(text); 
  } catch { 
    console.error('JSON parse error:', text.substring(0, 200));
    return text as unknown as T; 
  }
}

function wrapImageUrlWithProxy(url: string): string {
  if (!url) return '';
  if (url.startsWith('https://images.ps-aws.com/')) return url;
  return `https://images.ps-aws.com/c?url=${encodeURIComponent(url)}`;
}

function filterByTeam(items: NewsItem[], teamName: string): NewsItem[] {
  if (!teamName) return [];
  const normalized = normalizeTeamName ? normalizeTeamName(teamName) : teamName;
  const slug = getTeamSlug ? (getTeamSlug(teamName) || normalized.toLowerCase().replace(/\s+/g, '-')) : normalized.toLowerCase().replace(/\s+/g, '-');
  const baseKeywords = TEAM_KEYWORDS[teamName] || TEAM_KEYWORDS[normalized] || [teamName];
  const keywords = Array.from(new Set<string>([
    ...baseKeywords,
    normalized,
    teamName,
    slug.replace(/-/g, ' ')
  ]));

  return items.filter(item => {
    const haystack = `${item.title || ''} ${item.summary || ''} ${item.url || ''}`.toLowerCase();
    // whole-word keyword match
    const keywordMatch = keywords.some(k => new RegExp(`(^|[^a-z])${k.toLowerCase().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}(?=[^a-z]|$)`).test(haystack));
    // URL slug presence
    const slugMatch = haystack.includes(`/${slug}`) || haystack.includes(slug);
    return keywordMatch || slugMatch;
  });
}

export const comprehensiveNewsApi = {
  async getTeamNews(teamName: string, limit: number = 20): Promise<NewsResponse> {
    try {
      const [sport365Result, sbLiveResult, teamTalkResult] = await Promise.allSettled([
        this.getSport365News(),
        this.getSBLiveNews(),
        this.getTeamTalkNews()
      ]);

      let allItems: NewsItem[] = [];

      // Process Sport365 news
      if (sport365Result.status === 'fulfilled') {
        allItems.push(...sport365Result.value);
      }

      // Process SB Live news
      if (sbLiveResult.status === 'fulfilled') {
        allItems.push(...sbLiveResult.value);
      }

      // Process TeamTalk news
      if (teamTalkResult.status === 'fulfilled') {
        allItems.push(...teamTalkResult.value);
      }

      // Filter by team (strict; no cross-team fallback)
      const teamItems = filterByTeam(allItems, teamName);

      // Sort by date (most recent first) and limit
      const sortedItems = teamItems
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, limit);

      return {
        items: sortedItems,
        total: teamItems.length,
        sources: ['Sport365', 'SB Live', 'TeamTalk']
      };
    } catch (error) {
      console.error('Error fetching comprehensive team news:', error);
      return {
        items: [],
        total: 0,
        sources: []
      };
    }
  },

  async getSport365News(): Promise<NewsItem[]> {
    try {
      const response = await fetch(SPORT365_NEWS_API);
      const text = await response.text();
      
      // Handle base64 encoded response
      let decodedData: any;
      try {
        // Try to decode base64 if it's a base64 string
        if (typeof text === 'string' && /^[A-Za-z0-9+/=]+$/.test(text.trim())) {
          const decoded = atob(text.trim());
          decodedData = JSON.parse(decoded);
        } else {
          decodedData = JSON.parse(text);
        }
      } catch {
        // If parsing fails, try direct JSON parse
        decodedData = JSON.parse(text);
      }
      
      let entries = decodedData;
      if (Array.isArray(decodedData)) {
        entries = decodedData;
      } else if (decodedData.entries && Array.isArray(decodedData.entries)) {
        entries = decodedData.entries;
      } else {
        return [];
      }

      return entries.map((item: any, index: number) => ({
        id: `sport365-${item.id || index}`,
        title: item.title || 'Untitled',
        summary: item.description || item.article || '',
        image: item.image ? wrapImageUrlWithProxy(item.image) : undefined,
        url: item.externalLink || item.url || '#',
        publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString() : new Date().toISOString(),
        source: 'Sport365',
        category: 'Football'
      }));
    } catch (error) {
      console.error('Error fetching Sport365 news:', error);
      return [];
    }
  },

  async getSBLiveNews(): Promise<NewsItem[]> {
    try {
      const [feedRes, bannersRes, pinnedRes] = await Promise.allSettled([
        fetch(SB_LIVE_FEED_API),
        fetch(SB_LIVE_BANNERS_API),
        fetch(SB_LIVE_PINNED_API)
      ]);

      let allItems: NewsItem[] = [];

      // Process feed
      if (feedRes.status === 'fulfilled') {
        const feedData = await safeJson<any>(feedRes.value);
        if (feedData.data && Array.isArray(feedData.data)) {
          allItems.push(...this.transformSBLiveItems(feedData.data, 'SB Live Feed'));
        }
      }

      // Process banners
      if (bannersRes.status === 'fulfilled') {
        const bannersData = await safeJson<any>(bannersRes.value);
        if (bannersData.data && Array.isArray(bannersData.data)) {
          allItems.push(...this.transformSBLiveItems(bannersData.data, 'SB Live Banners'));
        }
      }

      // Process pinned
      if (pinnedRes.status === 'fulfilled') {
        const pinnedData = await safeJson<any>(pinnedRes.value);
        if (pinnedData.data && Array.isArray(pinnedData.data)) {
          allItems.push(...this.transformSBLiveItems(pinnedData.data, 'SB Live Pinned'));
        }
      }

      return allItems;
    } catch (error) {
      console.error('Error fetching SB Live news:', error);
      return [];
    }
  },

  transformSBLiveItems(items: any[], source: string): NewsItem[] {
    return items.map((item: any, index: number) => ({
      id: `sblive-${item.id || index}`,
      title: item.title || item.headline || 'Untitled',
      summary: item.summary || item.description || item.excerpt,
      image: item.media?.[0]?.url ? wrapImageUrlWithProxy(item.media[0].url) : 
             item.image ? wrapImageUrlWithProxy(item.image) : undefined,
      url: item.url || item.link || item.permalink || '#',
      publishedAt: item.publishedAt || item.date || item.created_at || new Date().toISOString(),
      source: source,
      category: item.category || 'Football'
    }));
  },

  async getTeamTalkNews(): Promise<NewsItem[]> {
    try {
      const response = await fetch(TEAMTALK_API);
      const data = await safeJson<any>(response);
      
      if (!data.result?.transfer_articles?.data || !Array.isArray(data.result.transfer_articles.data)) {
        return [];
      }

      return data.result.transfer_articles.data.map((item: any, index: number) => ({
        id: `teamtalk-${item.aid || index}`,
        title: item.article?.hdl || 'Untitled',
        summary: item.article?.description || '',
        image: item.article?.image ? wrapImageUrlWithProxy(
          `https://images.teamtalk.com/content/uploads/${item.article.image.scim}`
        ) : undefined,
        url: `https://www.teamtalk.com/${item.team?.sl || 'transfer-news'}/${item.article?.sl || ''}`,
        publishedAt: item.article?.sdt || new Date().toISOString(),
        source: 'TeamTalk',
        team: item.team?.nm,
        category: 'Transfer News'
      }));
    } catch (error) {
      console.error('Error fetching TeamTalk news:', error);
      return [];
    }
  }
};

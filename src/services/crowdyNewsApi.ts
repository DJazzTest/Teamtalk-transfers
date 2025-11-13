/* Crowdy News API service for team-specific content */

export interface CrowdyNewsItem {
  id: string;
  title: string;
  summary?: string;
  image?: string;
  url?: string;
  publishedAt?: string;
  source?: string;
  media?: Array<{
    type: string;
    url: string;
  }>;
}

async function safeJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text as unknown as T; }
}

const BASE = 'https://q.crowdynews.com/v1/content/betway-soccer';

export const crowdyNewsApi = {
  async getTeamContent(teamSlug: string): Promise<CrowdyNewsItem[]> {
    try {
      const res = await fetch(`${BASE}?q=${encodeURIComponent(teamSlug)}`);
      const data = await safeJson<any>(res);
      
      // Transform the response to our format
      if (Array.isArray(data)) {
        return data.map((item, index) => ({
          id: item.id || `crowdy-${teamSlug}-${index}`,
          title: item.text || item.title || item.headline || 'Untitled',
          summary: item.summary || item.description || item.excerpt,
          image: item.media?.[0]?.url || item.image || item.thumbnail || item.photo,
          url: item.postedUrls?.[0] || item.url || item.link || item.permalink,
          publishedAt: item.date || item.publishedAt || item.created_at || new Date().toISOString(),
          source: 'Crowdy News',
          media: item.media || []
        }));
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching Crowdy News for ${teamSlug}:`, error);
      return [];
    }
  },

  async getAllTeamsContent(): Promise<Record<string, CrowdyNewsItem[]>> {
    const teams = [
      'chelsea', 'manchester-united', 'leeds-united', 'arsenal', 'liverpool',
      'manchester-city', 'brighton-hove-albion', 'newcastle-united', 'aston-villa',
      'afc-bournemouth', 'tottenham-hotspur', 'crystal-palace', 'nottingham-forest',
      'fulham', 'brentford', 'everton', 'wolves', 'west-ham-united', 'sunderland', 'burnley'
    ];

    const results: Record<string, CrowdyNewsItem[]> = {};
    
    // Fetch all teams in parallel
    const promises = teams.map(async (team) => {
      try {
        const content = await this.getTeamContent(team);
        results[team] = content;
      } catch (error) {
        console.error(`Error fetching content for ${team}:`, error);
        results[team] = [];
      }
    });

    await Promise.allSettled(promises);
    return results;
  }
};

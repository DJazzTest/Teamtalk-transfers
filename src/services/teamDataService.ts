import { Transfer } from '@/types/transfer';
import { ttStagingApi } from './ttStagingApi';
import { sbLiveApi, SbLiveFeedItem } from './sbLiveApi';
import { sport365Api } from './sport365Api';
import { crowdyNewsApi, CrowdyNewsItem } from './crowdyNewsApi';
import { comprehensiveNewsApi, NewsItem } from './comprehensiveNewsApi';
import { normalizeTeamName, getTeamSlug, getSport365Id } from '@/utils/teamMapping';
import { newsApi } from './newsApi';
import { TEAMS_RUMOURS_DATA, RumourEntry } from '@/data/teamRumours';

export interface TeamNewsItem {
  id: string;
  title: string;
  summary?: string;
  image?: string;
  url?: string;
  source: string;
  publishedAt: string;
  category?: string;
}

export interface TeamData {
  name: string;
  slug: string;
  sport365Id?: string;
  transfers: Transfer[];
  rumours: Transfer[];
  doneDeals: Transfer[];
  news: NewsItem[];
  mediaHub: (SbLiveFeedItem | CrowdyNewsItem)[];
  matches?: any[];
}

export class TeamDataService {
  private static instance: TeamDataService;
  private cache: Map<string, { data: TeamData; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): TeamDataService {
    if (!TeamDataService.instance) {
      TeamDataService.instance = new TeamDataService();
    }
    return TeamDataService.instance;
  }

  async getTeamData(teamName: string, forceRefresh = false): Promise<TeamData> {
    const normalizedName = normalizeTeamName(teamName);
    const cacheKey = normalizedName;
    const now = Date.now();

    // Return cached data if still valid
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (now - cached.timestamp < this.CACHE_DURATION) {
        console.log(`📦 Returning cached data for ${normalizedName}`);
        return cached.data;
      }
    }

    console.log(`🔄 Fetching fresh data for ${normalizedName}`);
    
    try {
      const [transfers, rumours, doneDeals, news, mediaHub, matches] = await Promise.allSettled([
        this.getTeamTransfers(normalizedName),
        this.getTeamRumours(normalizedName),
        this.getTeamDoneDeals(normalizedName),
        this.getTeamNews(normalizedName),
        this.getTeamMediaHub(normalizedName),
        this.getTeamMatches(normalizedName)
      ]);

      const teamData: TeamData = {
        name: normalizedName,
        slug: getTeamSlug(normalizedName) || normalizedName.toLowerCase().replace(/\s+/g, '-'),
        sport365Id: getSport365Id(normalizedName),
        transfers: transfers.status === 'fulfilled' ? transfers.value : [],
        rumours: rumours.status === 'fulfilled' ? rumours.value : [],
        doneDeals: doneDeals.status === 'fulfilled' ? doneDeals.value : [],
        news: news.status === 'fulfilled' ? news.value : [],
        mediaHub: mediaHub.status === 'fulfilled' ? mediaHub.value : [],
        matches: matches.status === 'fulfilled' ? matches.value : []
      };

      // Cache the result
      this.cache.set(cacheKey, { data: teamData, timestamp: now });
      
      console.log(`✅ Team data loaded for ${normalizedName}:`, {
        transfers: teamData.transfers.length,
        rumours: teamData.rumours.length,
        doneDeals: teamData.doneDeals.length,
        news: teamData.news.length,
        mediaHub: teamData.mediaHub.length
      });

      return teamData;
    } catch (error) {
      console.error(`❌ Error fetching team data for ${normalizedName}:`, error);
      throw error;
    }
  }

  private async getTeamTransfers(teamName: string): Promise<Transfer[]> {
    try {
      // Get all transfers from live data service
      const { liveDataService } = await import('./liveDataService');
      const allTransfers = await liveDataService.getAllTransfers();
      
      // Filter for this team
      return allTransfers.filter(transfer => 
        transfer.fromClub === teamName || transfer.toClub === teamName
      );
    } catch (error) {
      console.error('Error fetching team transfers:', error);
      return [];
    }
  }

  private async getTeamRumours(teamName: string): Promise<Transfer[]> {
    try {
      const allRumours: Transfer[] = [];
      
      // 1. Get rumours from staging API
      const sport365Id = getSport365Id(teamName);
      if (sport365Id) {
        try {
          const rumours = await ttStagingApi.getRumoursByTeam('2025/26', 'Summer', sport365Id, 1, '72602');
          // Handle both structures: result.rumours.data (object with data array) or result.rumours (direct array)
          const rumoursArray = rumours?.result?.rumours?.data || 
                              (Array.isArray(rumours?.result?.rumours) ? rumours.result.rumours : []);
          
          if (rumoursArray && rumoursArray.length > 0) {
            const apiRumours = rumoursArray.map((rumour: any) => {
              const toClub = (rumour.team?.nm || rumour.team_to?.nm || 'Unknown Club').trim();
              const fromClub = (rumour.team_from?.nm || 'Unknown Club').trim();
              const playerName = (rumour.player?.nm || 'Unknown Player').trim();
              
              return {
                id: `staging-rumour-${rumour.aid || rumour.pid || rumour.id}`,
                playerName: playerName,
                fromClub: fromClub || 'Unknown Club',
                toClub: toClub || 'Unknown Club',
                fee: rumour.prc ? rumour.prc.replace('€', '£').replace('Million', 'm') : undefined,
                status: 'rumored' as const,
                date: rumour.article?.sdt || rumour.created_at || rumour.date || new Date().toISOString(),
                source: 'Staging API',
                category: 'Rumours'
              };
            }).filter((r: any) => r.playerName && r.playerName !== 'Unknown Player');
            
            allRumours.push(...apiRumours);
          }
        } catch (error) {
          console.warn('Error fetching rumours from staging API:', error);
        }
      }

      // 2. Get manual rumours from teamRumours data
      const manualRumours = TEAMS_RUMOURS_DATA[teamName] || [];
      const manualRumoursTransfers = manualRumours.map((rumour: RumourEntry) => {
        // Check if this rumour is relevant to this team (either from or to)
        const isRelevant = 
          normalizeTeamName(rumour.toClub) === normalizeTeamName(teamName) ||
          normalizeTeamName(rumour.fromClub) === normalizeTeamName(teamName);
        
        if (!isRelevant) return null;
        
        return {
          id: `manual-rumour-${teamName.toLowerCase().replace(/\s+/g, '-')}-${rumour.player.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          playerName: rumour.player,
          fromClub: rumour.fromClub,
          toClub: rumour.toClub,
          fee: rumour.fee || undefined,
          status: 'rumored' as const,
          date: new Date().toISOString(),
          source: 'Manual Rumours Data',
          category: 'Rumours',
          description: rumour.description
        };
      }).filter((r: any) => r !== null) as Transfer[];
      
      allRumours.push(...manualRumoursTransfers);

      // 3. Fallback to filtered live data
      if (allRumours.length === 0) {
        const { liveDataService } = await import('./liveDataService');
        const allTransfers = await liveDataService.getAllTransfers();
        const filteredRumours = allTransfers.filter(transfer => 
          (normalizeTeamName(transfer.fromClub) === normalizeTeamName(teamName) || 
           normalizeTeamName(transfer.toClub) === normalizeTeamName(teamName)) && 
          transfer.status === 'rumored'
        );
        allRumours.push(...filteredRumours);
      }

      // Remove duplicates based on player name and clubs
      const uniqueRumours = allRumours.filter((rumour, index, self) => 
        index === self.findIndex(r => 
          r.playerName === rumour.playerName && 
          normalizeTeamName(r.fromClub) === normalizeTeamName(rumour.fromClub) && 
          normalizeTeamName(r.toClub) === normalizeTeamName(rumour.toClub)
        )
      );

      return uniqueRumours;
    } catch (error) {
      console.error('Error fetching team rumours:', error);
      return [];
    }
  }

  private async getTeamDoneDeals(teamName: string): Promise<Transfer[]> {
    try {
      // Try staging API first
      const sport365Id = getSport365Id(teamName);
      if (sport365Id) {
        const doneDeals = await ttStagingApi.getDoneDealsByTeam(sport365Id);
        if (doneDeals?.result?.donedeals?.data) {
          return doneDeals.result.donedeals.data.map(deal => ({
            id: `staging-done-${deal.id}`,
            playerName: deal.player?.nm || 'Unknown Player',
            fromClub: deal.team_from?.nm || 'Unknown Club',
            toClub: deal.team_to?.nm || 'Unknown Club',
            fee: deal.fee ? `£${deal.fee}` : undefined,
            status: 'confirmed' as const,
            date: deal.created_at || new Date().toISOString(),
            source: 'Staging API',
            category: 'Done Deal'
          }));
        }
      }

      // Fallback to filtered live data
      const { liveDataService } = await import('./liveDataService');
      const allTransfers = await liveDataService.getAllTransfers();
      return allTransfers.filter(transfer => 
        (transfer.fromClub === teamName || transfer.toClub === teamName) && 
        transfer.status === 'confirmed'
      );
    } catch (error) {
      console.error('Error fetching team done deals:', error);
      return [];
    }
  }

  private async getTeamNews(teamName: string): Promise<NewsItem[]> {
    try {
      const newsResponse = await comprehensiveNewsApi.getTeamNews(teamName, 20);
      return newsResponse.items;
    } catch (error) {
      console.error('Error fetching team news:', error);
      return [];
    }
  }

  private async getTeamMediaHub(teamName: string): Promise<(SbLiveFeedItem | CrowdyNewsItem)[]> {
    try {
      const teamSlug = getTeamSlug(teamName) || teamName.toLowerCase().replace(/\s+/g, '-');
      
      // Get both SB Live feeds and Crowdy News
      const [sbLiveData, crowdyData] = await Promise.allSettled([
        this.getSbLiveFeeds(teamName),
        crowdyNewsApi.getTeamContent(teamSlug)
      ]);

      const allItems: (SbLiveFeedItem | CrowdyNewsItem)[] = [];
      
      // Add SB Live items
      if (sbLiveData.status === 'fulfilled') {
        allItems.push(...sbLiveData.value);
      }
      
      // Add Crowdy News items
      if (crowdyData.status === 'fulfilled') {
        allItems.push(...crowdyData.value);
      }

      // Sort by published date (most recent first) and limit to 20 items
      return allItems
        .sort((a, b) => {
          const dateA = new Date(a.publishedAt || 0).getTime();
          const dateB = new Date(b.publishedAt || 0).getTime();
          return dateB - dateA;
        })
        .slice(0, 20);
    } catch (error) {
      console.error('Error fetching team media hub:', error);
      return [];
    }
  }

  private async getSbLiveFeeds(teamName: string): Promise<(SbLiveFeedItem & { source?: string })[]> {
    try {
      // Get SB Live feeds
      const [feed, banners, pinned] = await Promise.allSettled([
        sbLiveApi.getFeed(0, 'general'),
        sbLiveApi.getBanners(),
        sbLiveApi.getPinned('general')
      ]);

      const allItems: (SbLiveFeedItem & { source?: string })[] = [];
      
      if (feed.status === 'fulfilled' && feed.value?.data) {
        allItems.push(...feed.value.data.map((item: SbLiveFeedItem) => ({ ...item, source: 'SB Live' })));
      }
      if (banners.status === 'fulfilled' && banners.value?.data) {
        allItems.push(...banners.value.data.map((item: SbLiveFeedItem) => ({ ...item, source: 'SB Live' })));
      }
      if (pinned.status === 'fulfilled' && pinned.value?.data) {
        allItems.push(...pinned.value.data.map((item: SbLiveFeedItem) => ({ ...item, source: 'SB Live' })));
      }

      // Filter for this team
      const teamKeywords = [
        teamName,
        teamName.toLowerCase(),
        teamName.replace(' United', '').replace(' City', '').replace(' Hotspur', '').replace(' FC', ''),
        teamName.toLowerCase().replace(' united', '').replace(' city', '').replace(' hotspur', '').replace(' fc', '')
      ];

      const teamItems = allItems.filter(item => {
        const content = `${item.title || ''} ${item.summary || ''}`.toLowerCase();
        return teamKeywords.some(keyword => 
          content.includes(keyword.toLowerCase())
        );
      });

      // Fallback: if no team-specific items, return general feed items
      if (teamItems.length === 0) {
        return (allItems || []).slice(0, 10);
      }

      return teamItems.slice(0, 10);
    } catch (error) {
      console.error('Error fetching SB Live feeds:', error);
      return [];
    }
  }

  private async getTeamMatches(teamName: string): Promise<any[]> {
    try {
      const sport365Id = getSport365Id(teamName);
      if (!sport365Id) return [];

      // Get today's matches and filter for this team
      const todayMatches = await sport365Api.getTodayMatches();
      if (todayMatches?.data) {
        return todayMatches.data.filter((match: any) => 
          match.home_name === teamName || match.away_name === teamName
        );
      }
      return [];
    } catch (error) {
      console.error('Error fetching team matches:', error);
      return [];
    }
  }

  clearCache(teamName?: string): void {
    if (teamName) {
      this.cache.delete(normalizeTeamName(teamName));
    } else {
      this.cache.clear();
    }
    console.log('🧹 Team data cache cleared');
  }
}

export const teamDataService = TeamDataService.getInstance();

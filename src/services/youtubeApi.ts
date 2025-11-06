/* YouTube API service for fetching team-specific videos using Google YouTube API */

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  embedUrl: string;
  duration: string;
  publishedAt: string;
  viewCount?: string;
  channelTitle?: string;
}

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  subscriberCount: string;
  videoCount: string;
  url: string;
}

// YouTube API configuration
const YOUTUBE_API_KEY = 'AIzaSyDdkKUe0vrOuXfnJ8qg3hM_FH0-UEkqTQs';
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Team search terms for YouTube
const TEAM_SEARCH_TERMS: Record<string, string> = {
  'Arsenal': 'Arsenal FC highlights goals',
  'Chelsea': 'Chelsea FC highlights goals',
  'Liverpool': 'Liverpool FC highlights goals',
  'Manchester United': 'Manchester United highlights goals',
  'Manchester City': 'Manchester City highlights goals',
  'Tottenham Hotspur': 'Tottenham Hotspur highlights goals',
  'Newcastle United': 'Newcastle United highlights goals',
  'Brighton & Hove Albion': 'Brighton highlights goals',
  'Aston Villa': 'Aston Villa highlights goals',
  'Bournemouth': 'Bournemouth highlights goals',
  'Crystal Palace': 'Crystal Palace highlights goals',
  'Nottingham Forest': 'Nottingham Forest highlights goals',
  'Fulham': 'Fulham highlights goals',
  'Brentford': 'Brentford highlights goals',
  'Everton': 'Everton highlights goals',
  'Wolves': 'Wolves highlights goals',
  'West Ham United': 'West Ham highlights goals',
  'Sunderland': 'Sunderland highlights goals',
  'Burnley': 'Burnley highlights goals',
  'Leeds United': 'Leeds United highlights goals'
};

// Sample video data for demonstration
const SAMPLE_VIDEOS: Record<string, YouTubeVideo[]> = {
  'Arsenal': [
    {
      id: '1',
      title: 'Arsenal vs Fulham | Premier League Highlights',
      description: 'Watch the best moments from Arsenal\'s victory over Fulham in the Premier League',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      duration: '5:23',
      publishedAt: '2024-10-20T10:00:00Z',
      viewCount: '125K'
    },
    {
      id: '2',
      title: 'Training Session | Behind the Scenes',
      description: 'Exclusive look at Arsenal\'s training ground and preparation',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      duration: '3:45',
      publishedAt: '2024-10-19T15:30:00Z',
      viewCount: '89K'
    },
    {
      id: '3',
      title: 'Player Interviews | Post-Match',
      description: 'Hear from the players after the match',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      duration: '2:15',
      publishedAt: '2024-10-19T12:00:00Z',
      viewCount: '67K'
    }
  ],
  'Chelsea': [
    {
      id: '4',
      title: 'Chelsea vs Liverpool | Match Highlights',
      description: 'All the action from Stamford Bridge',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      duration: '4:30',
      publishedAt: '2024-10-20T08:00:00Z',
      viewCount: '156K'
    },
    {
      id: '5',
      title: 'New Signing Interview',
      description: 'Meet our latest addition to the squad',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      duration: '6:12',
      publishedAt: '2024-10-18T14:20:00Z',
      viewCount: '234K'
    }
  ],
  'Liverpool': [
    {
      id: '6',
      title: 'Anfield Atmosphere | Fan Reactions',
      description: 'Experience the passion of Anfield',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      duration: '3:20',
      publishedAt: '2024-10-20T16:45:00Z',
      viewCount: '198K'
    },
    {
      id: '7',
      title: 'Manager Press Conference',
      description: 'Latest updates from the manager',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      duration: '8:45',
      publishedAt: '2024-10-19T11:30:00Z',
      viewCount: '145K'
    }
  ]
};

export const youtubeApi = {
  async getTeamVideos(teamName: string, maxResults: number = 5): Promise<YouTubeVideo[]> {
    try {
      const searchTerm = TEAM_SEARCH_TERMS[teamName];
      if (!searchTerm) {
        return this.getDefaultVideos(teamName);
      }

      const response = await fetch(
        `${YOUTUBE_BASE_URL}/search?part=snippet&q=${encodeURIComponent(searchTerm)}&type=video&maxResults=${maxResults}&order=date&key=${YOUTUBE_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        return this.getDefaultVideos(teamName);
      }

      // Transform YouTube API response to our format
      return data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
        duration: 'N/A', // Duration requires additional API call
        publishedAt: item.snippet.publishedAt,
        viewCount: 'N/A', // View count requires additional API call
        channelTitle: item.snippet.channelTitle
      }));
    } catch (error) {
      console.error(`Error fetching YouTube videos for ${teamName}:`, error);
      return this.getDefaultVideos(teamName);
    }
  },

  async getChannelInfo(teamName: string): Promise<YouTubeChannel | null> {
    try {
      const channelId = TEAM_YOUTUBE_CHANNELS[teamName];
      if (!channelId) return null;

      // Sample channel data
      return {
        id: channelId,
        title: `${teamName} Official`,
        description: `Official ${teamName} YouTube channel`,
        thumbnail: 'https://via.placeholder.com/200x200/1e293b/64748b?text=YT',
        subscriberCount: '2.5M',
        videoCount: '1.2K',
        url: `https://www.youtube.com/channel/${channelId}`
      };
    } catch (error) {
      console.error(`Error fetching channel info for ${teamName}:`, error);
      return null;
    }
  },

  getDefaultVideos(teamName: string): YouTubeVideo[] {
    return [
      {
        id: `${teamName.toLowerCase()}-1`,
        title: `${teamName} Highlights`,
        description: `Latest videos from ${teamName}`,
        thumbnail: 'https://via.placeholder.com/320x180/1e293b/64748b?text=Video+Thumbnail',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '4:00',
        publishedAt: new Date().toISOString(),
        viewCount: '50K',
        channelTitle: `${teamName} Official`
      },
      {
        id: `${teamName.toLowerCase()}-2`,
        title: `${teamName} Training`,
        description: `Behind the scenes at ${teamName}`,
        thumbnail: 'https://via.placeholder.com/320x180/1e293b/64748b?text=Video+Thumbnail',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '3:30',
        publishedAt: new Date().toISOString(),
        viewCount: '35K',
        channelTitle: `${teamName} Official`
      }
    ];
  }
};

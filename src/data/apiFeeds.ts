export type ApiFeedEnvironment = 'production' | 'staging' | 'public';

export interface ApiFeedEndpoint {
  id: string;
  label: string;
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  notes?: string;
}

export interface ApiFeedEntry {
  id: string;
  name: string;
  provider: string;
  category: 'Transfers' | 'Match Data' | 'Content & Media' | 'Infrastructure' | 'Utilities';
  environment: ApiFeedEnvironment;
  description: string;
  auth?: string;
  docsUrl?: string;
  tags?: string[];
  usedBy: string[];
  endpoints: ApiFeedEndpoint[];
}

export const API_FEEDS: ApiFeedEntry[] = [
  {
    id: 'scoreinside-team-favourites',
    name: 'Favourite Teams (Transfers & News)',
    provider: 'ScoreInside',
    category: 'Transfers',
    environment: 'production',
    description: 'Per-club feeds that power the ScoreInside transfer cards and fallback news for every Premier League side.',
    auth: 'Requires device FCM token query string',
    tags: ['scoreinside', 'transfers', 'news'],
    usedBy: ['ScoreInsideApiService', 'TransferDataProvider', 'Transfer tabs'],
    endpoints: [
      {
        id: 'scoreinside-team-top-transfers',
        label: 'Top Transfers feed',
        url: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token={token}',
        notes: 'Returns transfer_articles data scoped to the user/team favourites.'
      },
      {
        id: 'scoreinside-team-news',
        label: 'Team News feed',
        url: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token={token}',
        notes: 'Fallback feed when no transfer items exist.'
      }
    ]
  },
  {
    id: 'scoreinside-window-feeds',
    name: 'Window Done Deals & Rumours',
    provider: 'ScoreInside',
    category: 'Transfers',
    environment: 'production',
    description: 'Seasonal “done deal”, “rumour”, and “top transfer” feeds used for historical window modules.',
    tags: ['done-deals', 'rumours', 'top-transfers'],
    usedBy: ['Historical transfer cards', 'Homepage Summer Ins/Outs'],
    endpoints: [
      {
        id: 'scoreinside-done-deals',
        label: 'Done Deals',
        url: 'https://liveapi.scoreinside.com/api/transfers/done-deal-teams?seasonYear={season}&seasonName={window}&tournamentId=72602',
        notes: 'Replace {season} with e.g. 2024/25 and {window} with Summer or Winter.'
      },
      {
        id: 'scoreinside-rumours',
        label: 'Rumour Teams',
        url: 'https://liveapi.scoreinside.com/api/transfers/rumour-teams?seasonYear={season}&seasonName={window}&tournamentId=72602',
        notes: 'Supports historical seasons such as 2023/24 or 2022/23.'
      },
      {
        id: 'scoreinside-top-transfers',
        label: 'Top Transfers',
        url: 'https://liveapi.scoreinside.com/api/transfers/top-transfers?seasonYear={season}&seasonName={window}&tournamentId=72602',
        notes: 'Used for the Top 10 transfer widget.'
      }
    ]
  },
  {
    id: 'sport365-core',
    name: 'Sport365 Core APIs',
    provider: 'Sport365',
    category: 'Match Data',
    environment: 'public',
    description: 'Primary results/fixtures data source for comparison tools, league tables and match timelines.',
    auth: 'Public, requires standard headers',
    tags: ['results', 'fixtures', 'tables'],
    usedBy: ['TeamResultsFixturesService', 'TeamComparisonPanel', 'TeamPhaseCharts'],
    endpoints: [
      {
        id: 'sport365-range',
        label: 'Matches from/to',
        url: 'https://api.sport365.com/v1/en/matches/soccer/from/{ISO}/to/{ISO}',
        notes: 'Used to pull rolling 90-day windows of results and fixtures.'
      },
      {
        id: 'sport365-match-full',
        label: 'Match detail',
        url: 'https://api.sport365.com/v1/en/match/soccer/full/{matchId}?boxscore=1&estats=1&tf=1&tlge=1&wh2h=1&wstats=1&wtops=1',
        notes: 'Full match breakdown for detailed stats or H2H.'
      },
      {
        id: 'sport365-table',
        label: 'Stage/League table',
        url: 'https://api.sport365.com/v1/en/stage/lg/soccer/{stageId}',
        notes: 'Stage IDs are defined per competition inside teamApiConfig.'
      },
      {
        id: 'sport365-search',
        label: 'Team search',
        url: 'https://api.sport365.com/v1/en/search/soccer?userInput={query}',
        notes: 'Used for mapping Sport365 IDs to club slugs.'
      }
    ]
  },
  {
    id: 'tt-staging-league-tables',
    name: 'TeamTalk Staging Tables',
    provider: 'stagingapi.tt-apis.com',
    category: 'Match Data',
    environment: 'staging',
    description: 'Fallback league tables for EFL, National League and Scottish competitions.',
    tags: ['league-table', 'fallback'],
    usedBy: ['TeamApiConfigManager', 'League table cards'],
    endpoints: [
      {
        id: 'tt-league-one',
        label: 'League One table',
        url: 'https://stagingapi.tt-apis.com/api/football/match/2999249/table',
        notes: 'League One stage ID.'
      },
      {
        id: 'tt-league-two',
        label: 'League Two table',
        url: 'https://stagingapi.tt-apis.com/api/football/match/2999805/table'
      },
      {
        id: 'tt-national-league',
        label: 'National League table',
        url: 'https://stagingapi.tt-apis.com/api/football/match/3016668/table'
      },
      {
        id: 'tt-scottish-prem',
        label: 'Scottish Premiership table',
        url: 'https://api.sport365.com/v1/en/stage/lg/soccer/6ae0a9ab-092d-4d67-9fe0-b7fa89dfe0f4',
        notes: 'Hybrid entry: still tracked in Team API config for completeness.'
      }
    ]
  },
  {
    id: 'sofascore-player-stats',
    name: 'SofaScore Player Data',
    provider: 'SofaScore',
    category: 'Transfers',
    environment: 'public',
    description: 'Live player statistics consumed by the player comparison modal and SofaScore scraper.',
    auth: 'Public, but rate limited. Proxies used for browser access.',
    tags: ['player-stats', 'comparisons'],
    usedBy: ['PlayerComparisonModal', 'fetchSofaScorePlayerData', 'SofaScoreScraper'],
    endpoints: [
      {
        id: 'sofascore-player',
        label: 'Player profile',
        url: 'https://api.sofascore.com/api/v1/player/{playerId}',
        notes: 'Base metadata (name, DOB, physical stats).'
      },
      {
        id: 'sofascore-player-season',
        label: 'Season statistics',
        url: 'https://api.sofascore.com/api/v1/player/{playerId}/statistics/season',
        notes: 'Used for aggregate goals/assists, minutes etc.'
      },
      {
        id: 'sofascore-competition-season',
        label: 'Competition-specific stats',
        url: 'https://api.sofascore.com/api/v1/player/{playerId}/unique-tournament/17/season/52186/statistics/overall',
        notes: 'Example uses Premier League (tournament 17, season 52186).'
      },
      {
        id: 'sofascore-search',
        label: 'Global search',
        url: 'https://api.sofascore.com/api/v1/search/all?q={player}',
        notes: 'Used to resolve SofaScore IDs from player names.'
      },
      {
        id: 'sofascore-web',
        label: 'Public player page',
        url: 'https://www.sofascore.com/player/{slug}/{id}',
        notes: 'Fallback HTML scraper with proxy.'
      }
    ]
  },
  {
    id: 'proxy-endpoints',
    name: 'CORS Proxy Helpers',
    provider: 'Multiple',
    category: 'Utilities',
    environment: 'public',
    description: 'Generic proxy services used to bypass CORS when calling third-party APIs from the browser.',
    tags: ['cors', 'proxy'],
    usedBy: ['fetchSofaScorePlayerData', 'link preview', 'TeamTalk feed (local)'],
    endpoints: [
      {
        id: 'proxy-isomorphic',
        label: 'isomorphic-git CORS proxy',
        url: 'https://cors.isomorphic-git.org/{target}',
        notes: 'Used in dev for TeamTalk feed & SofaScore API.'
      },
      {
        id: 'proxy-allorigins',
        label: 'AllOrigins',
        url: 'https://api.allorigins.win/get?url={target}',
        notes: 'Wraps response as { contents, status }; used for HTML scraping and link preview.'
      },
      {
        id: 'proxy-corsproxy',
        label: 'corsproxy.io',
        url: 'https://corsproxy.io/?{target}',
        notes: 'Simple passthrough when others fail.'
      }
    ]
  },
  {
    id: 'teamtalk-feed',
    name: 'TeamTalk Mobile Feed',
    provider: 'TeamTalk',
    category: 'Content & Media',
    environment: 'public',
    description: 'Primary editorial feed for transfer articles and rumours (mobile specific endpoint).',
    auth: 'Public; proxied on non-production hosts.',
    tags: ['editorial', 'transfers'],
    usedBy: ['TeamTalkApiService', 'TransferEnhancer'],
    endpoints: [
      {
        id: 'teamtalk-mobile-feed',
        label: 'Mobile app feed',
        url: 'https://www.teamtalk.com/mobile-app-feed',
        notes: 'In dev we auto-route through https://cors.isomorphic-git.org/.'
      }
    ]
  },
  {
    id: 'crowdy-news',
    name: 'Crowdy News search',
    provider: 'Crowdy News',
    category: 'Content & Media',
    environment: 'public',
    description: 'Betway-soccer curated news feed used as a fallback news stream.',
    tags: ['news', 'crowdy'],
    usedBy: ['crowdyNewsApi', 'News tabs'],
    endpoints: [
      {
        id: 'crowdy-team-search',
        label: 'Content search',
        url: 'https://q.crowdynews.com/v1/content/betway-soccer?q={teamSlug}',
        notes: 'Returns an array of content items per query.'
      }
    ]
  },
  {
    id: 'sblive-feed',
    name: 'SB Live content feeds',
    provider: 'inframe.sportsdevhub.com',
    category: 'Content & Media',
    environment: 'production',
    description: 'Live hub / pinned feed provider.',
    tags: ['live-hub', 'banners', 'news'],
    usedBy: ['sbLiveApi', 'ChatterBoxManagement'],
    endpoints: [
      {
        id: 'sblive-feed',
        label: 'General feed',
        url: 'https://inframe.sportsdevhub.com/api/feed?offset={offset}&client=sblive&sport=soccer&locale=en&topic={topic}'
      },
      {
        id: 'sblive-banners',
        label: 'Banners',
        url: 'https://inframe.sportsdevhub.com/api/feed/banners?sport=soccer&locale=en&client=sblive'
      },
      {
        id: 'sblive-pinned',
        label: 'Pinned content',
        url: 'https://inframe.sportsdevhub.com/api/feed/pinned?locale=en&type={type}&sport=soccer&matchid={matchId}&client=sblive'
      }
    ]
  },
  {
    id: 'youtube-data',
    name: 'YouTube Data API v3',
    provider: 'Google',
    category: 'Content & Media',
    environment: 'public',
    description: 'Team video carousel videos & highlights.',
    auth: 'API key in request query (?key=)',
    tags: ['video', 'highlights'],
    usedBy: ['youtubeApi.ts', 'Video tab'],
    endpoints: [
      {
        id: 'youtube-search',
        label: 'Search endpoint',
        url: 'https://www.googleapis.com/youtube/v3/search?part=snippet&q={query}&type=video&maxResults={n}&order=date&key={API_KEY}',
        notes: 'Primary feed for latest uploads.'
      },
      {
        id: 'youtube-channels',
        label: 'Channel details',
        url: 'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id={channelId}&key={API_KEY}'
      }
    ]
  },
  {
    id: 'netlify-functions',
    name: 'Netlify Serverless Functions',
    provider: 'Netlify',
    category: 'Infrastructure',
    environment: 'production',
    description: 'Internal proxies & CMS helpers deployed alongside the site.',
    tags: ['cms', 'serverless'],
    usedBy: ['FlashBannerManagement', 'ChatterBoxManagement', 'Link previews'],
    endpoints: [
      { id: 'fn-flash-banner', label: 'Flash banner config', url: '/.netlify/functions/flash-banner', method: 'POST', notes: 'GET/POST for banner content.' },
      { id: 'fn-live-hub', label: 'Live hub proxy', url: '/.netlify/functions/live-hub' },
      { id: 'fn-news-feed', label: 'News feed proxy', url: '/.netlify/functions/news-feed' },
      { id: 'fn-team-bios', label: 'Team bios storage', url: '/.netlify/functions/team-bios' },
      { id: 'fn-link-preview', label: 'Link preview scraper', url: '/.netlify/functions/link-preview?url={target}' },
      { id: 'fn-tiktok', label: 'TikTok RSS bridge', url: '/.netlify/functions/tiktok-rss' }
    ]
  }
];








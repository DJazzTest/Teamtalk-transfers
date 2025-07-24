export interface ScoreInsideImage {
  id: number;
  ttl: string;
  cap: string;
  fn: string;
  crd: string;
  ty: string;
  scim: string;
  impth: string;
}

export interface ScoreInsideArticle {
  id: number;
  imid: number;
  hdl: string;
  sl: string;
  sdt: string;
  image: ScoreInsideImage;
}

export interface ScoreInsideTeam {
  id: number;
  nm: string;
  sl: string;
}

export interface ScoreInsidePlayer {
  id: number;
  nm: string;
  sl: string;
  sn: string;
}

export interface ScoreInsideTransferArticle {
  aid: number;
  pid: number;
  ttfr: number | null;
  ttto: number;
  scat: string; // Category like "Rumours", "Top Source"
  article: ScoreInsideArticle;
  team: ScoreInsideTeam;
  team_from: ScoreInsideTeam | null;
  player: ScoreInsidePlayer;
}

export interface ScoreInsideTransferData {
  current_page: number;
  data: ScoreInsideTransferArticle[];
  first_page_url: string;
  from: number;
  next_page_url: string | null;
  path: string;
  per_page: string;
  prev_page_url: string | null;
  to: number;
}

export interface ScoreInsideResponse {
  status: number;
  message: string;
  result: {
    transfer_articles: ScoreInsideTransferData;
  };
}

export interface TeamApiConfig {
  name: string;
  slug: string;
  transfersUrl: string;
  newsUrl: string;
}

export const TEAM_API_CONFIGS: TeamApiConfig[] = [
  {
    name: 'Arsenal',
    slug: 'arsenal',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    name: 'Aston Villa',
    slug: 'aston-villa',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    name: 'Bournemouth',
    slug: 'bournemouth',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    name: 'Brentford',
    slug: 'brentford',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    name: 'Brighton',
    slug: 'brighton',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    name: 'Burnley',
    slug: 'burnley',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    name: 'Chelsea',
    slug: 'chelsea',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    name: 'Crystal Palace',
    slug: 'crystal-palace',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    name: 'Everton',
    slug: 'everton',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    name: 'Fulham',
    slug: 'fulham',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    name: 'Leeds',
    slug: 'leeds',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    name: 'Liverpool',
    slug: 'liverpool',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    name: 'Manchester City',
    slug: 'manchester-city',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    name: 'Manchester United',
    slug: 'manchester-united',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    name: 'Newcastle',
    slug: 'newcastle',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    name: 'Nottingham Forest',
    slug: 'nottingham-forest',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    name: 'Sunderland',
    slug: 'sunderland',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    name: 'Tottenham',
    slug: 'tottenham',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    name: 'West Ham',
    slug: 'west-ham',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    name: 'Wolverhampton',
    slug: 'wolves',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  }
];

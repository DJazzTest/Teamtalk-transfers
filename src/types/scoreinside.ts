
export interface ScoreInsideResponse {
  status: number;
  message: string;
  result: {
    transfer_articles: {
      current_page: number;
      data: ScoreInsideTransferArticle[];
    };
  };
}

export interface ScoreInsideTransferArticle {
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
}

export interface TeamApiConfig {
  slug: string;
  name: string;
  transfersUrl: string;
  newsUrl: string;
}

export const TEAM_API_CONFIGS: TeamApiConfig[] = [
  {
    slug: 'arsenal',
    name: 'Arsenal',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    slug: 'aston-villa',
    name: 'Aston Villa',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    slug: 'bournemouth',
    name: 'Bournemouth',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    slug: 'brentford',
    name: 'Brentford',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    slug: 'brighton',
    name: 'Brighton & Hove Albion',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    slug: 'burnley',
    name: 'Burnley',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    slug: 'chelsea',
    name: 'Chelsea',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    slug: 'crystal-palace',
    name: 'Crystal Palace',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    slug: 'everton',
    name: 'Everton',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    slug: 'fulham',
    name: 'Fulham',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    slug: 'leeds-united',
    name: 'Leeds United',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    slug: 'liverpool',
    name: 'Liverpool',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    slug: 'manchester-city',
    name: 'Manchester City',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    slug: 'manchester-united',
    name: 'Manchester United',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    slug: 'newcastle-united',
    name: 'Newcastle United',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    slug: 'nottingham-forest',
    name: 'Nottingham Forest',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    slug: 'sunderland',
    name: 'Sunderland',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    slug: 'tottenham-hotspur',
    name: 'Tottenham Hotspur',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    slug: 'west-ham-united',
    name: 'West Ham United',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  },
  {
    slug: 'wolverhampton-wanderers',
    name: 'Wolverhampton Wanderers',
    transfersUrl: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    newsUrl: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ'
  }
];

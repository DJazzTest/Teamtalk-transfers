import { Agent } from 'undici';

const TEAMTALK_FEED_URL = 'https://www.teamtalk.com/mobile-app-feed';

const defaultHeaders = {
  'User-Agent': 'TeamTalkTransfersBot/1.0',
  Accept: 'application/json',
};

const allowInsecure = process.env.ALLOW_INSECURE_TEAMTALK === 'true';
const insecureAgent = allowInsecure
  ? new Agent({ connect: { rejectUnauthorized: false } })
  : null;

const getFetchOptions = () => ({
  headers: defaultHeaders,
  ...(insecureAgent ? { dispatcher: insecureAgent } : {}),
});

const mapTeamTalkItems = (items = []) =>
  items.map((item) => ({
    id: `teamtalk-${item.id}`,
    title: item.headline,
    summary: item.excerpt || '',
    source: 'TeamTalk',
    publishedAt: item.pub_date,
    category: Array.isArray(item.category) && item.category.length > 0 ? item.category[0] : 'Transfer News',
    image: item.image,
    url: item.link,
  }));

const fetchDirectFeed = async () => {
  const response = await fetch(TEAMTALK_FEED_URL, getFetchOptions());
  if (!response.ok) {
    throw new Error(`TeamTalk feed failed: ${response.status}`);
  }

  const data = await response.json();
  if (!data?.items || !Array.isArray(data.items)) return [];

  return mapTeamTalkItems(data.items);
};

const fetchViaProxy = async () => {
  const proxies = [
    {
      url: `https://api.allorigins.win/get?url=${encodeURIComponent(TEAMTALK_FEED_URL)}`,
      parse: async (response) => {
        const wrapper = await response.json();
        return wrapper?.contents ? JSON.parse(wrapper.contents) : null;
      },
    },
    {
      url: `https://corsproxy.io/?${encodeURIComponent(TEAMTALK_FEED_URL)}`,
      parse: async (response) => JSON.parse(await response.text()),
    },
  ];

  for (const proxy of proxies) {
    try {
      const response = await fetch(proxy.url, getFetchOptions());
      if (!response.ok) continue;
      const data = await proxy.parse(response);
      if (data?.items && Array.isArray(data.items)) {
        console.log(`[news-feed] Loaded TeamTalk feed via proxy ${proxy.url}`);
        return mapTeamTalkItems(data.items);
      }
    } catch (error) {
      console.warn(`[news-feed] Proxy ${proxy.url} failed`, error);
    }
  }

  return [];
};

const fetchTeamTalkFeed = async () => {
  try {
    return await fetchDirectFeed();
  } catch (error) {
    console.warn('[news-feed] Direct TeamTalk fetch failed, trying proxies', error?.message || error);
    const proxyItems = await fetchViaProxy();
    if (proxyItems.length > 0) {
      return proxyItems;
    }
    throw error;
  }
};

export const handler = async () => {
  try {
    const items = await fetchTeamTalkFeed();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=120, max-age=60',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ items }),
    };
  } catch (error) {
    console.error('news-feed lambda failed:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Failed to load news feed' }),
    };
  }
};


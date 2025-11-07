/* SB Live feeds: news, banners, pinned */

async function safeJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text as unknown as T; }
}

export interface SbLiveFeedItem {
  id?: string;
  title?: string;
  summary?: string;
  image?: string;
  videoUrl?: string;
  publishedAt?: string;
  team?: string;
}

const BASE = 'https://inframe.sportsdevhub.com/api';

export const sbLiveApi = {
  async getFeed(offset = 0, topic = 'general') {
    const url = `${BASE}/feed?offset=${offset}&client=sblive&sport=soccer&locale=en&topic=${encodeURIComponent(topic)}`;
    const res = await fetch(url);
    return safeJson(res);
  },

  async getBanners() {
    const res = await fetch(`${BASE}/feed/banners?sport=soccer&locale=en&client=sblive`);
    return safeJson(res);
  },

  async getPinned(type = 'general', matchId = '') {
    const url = `${BASE}/feed/pinned?locale=en&type=${encodeURIComponent(type)}&sport=soccer&matchid=${encodeURIComponent(matchId)}&client=sblive`;
    const res = await fetch(url);
    return safeJson(res);
  }
};






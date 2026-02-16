import { clubBadgeMap } from '@/data/clubBadgeMap';

const badgeCache = new Map<string, string | null>();

const FREE_AGENT_KEYWORDS = ['free agent', 'unattached', 'released'];
export const FREE_AGENT_PLACEHOLDER = '/badges/free-agent-placeholder.svg';
const TRANSFERFEED_BASE = 'https://www.transferfeed.com';

const SELECTORS = [
  'img[alt*="logo" i]',
  'img[alt*="badge" i]',
  'img[class*="logo" i]',
  'img[class*="badge" i]',
  '[data-lov-id] img',
  '.club-card img',
];

const TRANSFERFEED_SEARCH_ENDPOINTS = [
  (query: string) => `${TRANSFERFEED_BASE}/search?q=${encodeURIComponent(query)}`,
  (query: string) => `${TRANSFERFEED_BASE}/?search=${encodeURIComponent(query)}`,
  (query: string) => `${TRANSFERFEED_BASE}/?q=${encodeURIComponent(query)}`,
];

const STORAGE_KEY_PREFIX = 'clubBadge::';
const CLUB_BADGE_OVERRIDES_KEY = 'club-badge-overrides';

const slugifyClub = (clubName: string) =>
  clubName
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const applyImageProxy = (url: string) => `https://images.ps-aws.com/c?url=${encodeURIComponent(url)}`;

const isRemoteUrl = (url: string) => /^https?:\/\//i.test(url);

export const isFreeAgentClub = (clubName?: string | null) =>
  !!clubName && FREE_AGENT_KEYWORDS.some(keyword => clubName.toLowerCase().includes(keyword));

const getBadgeOverrides = (): Record<string, string> => {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const stored = window.localStorage.getItem(CLUB_BADGE_OVERRIDES_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Record<string, string>;
  } catch {
    return {};
  }
};

export const getStaticBadgeSrc = (clubName?: string | null) => {
  if (!clubName) return null;

  // 1) Check CMS overrides first
  const overrides = getBadgeOverrides();
  if (overrides[clubName]) {
    return overrides[clubName];
  }

  // 2) Fallback to static badge map
  const mapped = clubBadgeMap[clubName];
  if (mapped) return mapped;

  // 3) Slug-based default
  return `/badges/${slugifyClub(clubName)}.png`;
};

const getStoredBadge = (clubName: string) => {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return window.localStorage.getItem(`${STORAGE_KEY_PREFIX}${clubName}`);
};

const persistBadge = (clubName: string, badgeUrl: string) => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(`${STORAGE_KEY_PREFIX}${clubName}`, badgeUrl);
  } catch {
    // Ignore storage quota or private browsing errors
  }
};

const makeAbsoluteUrl = (src: string) => {
  if (!src) return null;
  return isRemoteUrl(src) ? src : `${TRANSFERFEED_BASE}${src.startsWith('/') ? '' : '/'}${src}`;
};

const extractBadgeFromHtml = (html: string): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    for (const selector of SELECTORS) {
      const img = doc.querySelector(selector) as HTMLImageElement | null;
      if (img) {
        const candidate = img.getAttribute('src') || img.getAttribute('data-src');
        if (candidate) {
          const absolute = makeAbsoluteUrl(candidate);
          if (absolute) {
            return applyImageProxy(absolute);
          }
        }
      }
    }
  } catch (error) {
    console.warn('Club badge parser failed:', error);
  }
  return null;
};

const fetchBadgeFromTransferFeed = async (clubName: string): Promise<string | null> => {
  if (typeof window === 'undefined') return null;
  for (const buildEndpoint of TRANSFERFEED_SEARCH_ENDPOINTS) {
    try {
      const response = await fetch(buildEndpoint(clubName), {
        mode: 'cors',
        headers: {
          'Accept': 'text/html,application/xhtml+xml',
          'User-Agent': 'Mozilla/5.0 (compatible; TeamTalkTransfers/1.0)',
        },
      });
      if (!response.ok) {
        continue;
      }
      const html = await response.text();
      const badge = extractBadgeFromHtml(html);
      if (badge) {
        return badge;
      }
    } catch (error) {
      console.warn(`TransferFeed lookup failed for ${clubName}:`, error);
    }
  }
  return null;
};

export const resolveClubBadgeSrc = async (clubName?: string | null): Promise<string | null> => {
  if (!clubName) return null;
  if (isFreeAgentClub(clubName)) {
    return FREE_AGENT_PLACEHOLDER;
  }
  const normalized = clubName.trim();

  if (badgeCache.has(normalized)) {
    return badgeCache.get(normalized)!;
  }

  const stored = getStoredBadge(normalized);
  if (stored) {
    badgeCache.set(normalized, stored);
    return stored;
  }

  const staticBadge = getStaticBadgeSrc(normalized);
  if (staticBadge) {
    badgeCache.set(normalized, staticBadge);
    return staticBadge;
  }

  const fetched = await fetchBadgeFromTransferFeed(normalized);
  if (fetched) {
    badgeCache.set(normalized, fetched);
    persistBadge(normalized, fetched);
    return fetched;
  }

  badgeCache.set(normalized, null);
  return null;
};

export const getInitialBadgeSrc = (clubName?: string | null) => {
  if (!clubName) return null;
  if (isFreeAgentClub(clubName)) {
    return FREE_AGENT_PLACEHOLDER;
  }
  const stored = getStoredBadge(clubName);
  if (stored) return stored;
  return getStaticBadgeSrc(clubName);
};

export const getClubInitials = (clubName?: string | null) => {
  if (!clubName) return '';
  return clubName
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
};


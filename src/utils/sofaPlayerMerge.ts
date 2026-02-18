import { slugifyName } from '@/utils/playerImageUtils';

type SeasonStats = any;

interface SofaPlayerRecord {
  name: string;
  sofascoreId?: string;
  imageUrl?: string;
  bio?: any;
  seasonStats?: SeasonStats;
  previousMatches?: any[];
}

const clubSlugMap: Record<string, string> = {
  'Arsenal': 'arsenal',
  'Aston Villa': 'aston-villa',
  'Chelsea': 'chelsea',
  'Liverpool': 'liverpool',
  'Manchester City': 'man-city',
  'Manchester United': 'man-utd',
  'Tottenham Hotspur': 'tottenham',
  'Newcastle United': 'newcastle-united',
  'West Ham United': 'west-ham-united',
  'Wolverhampton Wanderers': 'wolverhampton-wanderers',
  'Sunderland': 'sunderland',
  'Brighton & Hove Albion': 'brighton',
  'Crystal Palace': 'crystal-palace',
  'Fulham': 'fulham',
  'Everton': 'everton',
  'Bournemouth': 'bournemouth',
  'Burnley': 'burnley',
};

const sofaCache: Map<string, Map<string, SofaPlayerRecord>> = new Map();

async function loadClubSofaData(clubName: string): Promise<Map<string, SofaPlayerRecord> | null> {
  const slug = clubSlugMap[clubName];
  if (!slug) return null;

  if (sofaCache.has(slug)) {
    return sofaCache.get(slug)!;
  }

  try {
    const res = await fetch(`/${slug}-players-data.json`, { cache: 'no-cache' });
    if (!res.ok) {
      return null;
    }
    const data = (await res.json()) as SofaPlayerRecord[];
    const map = new Map<string, SofaPlayerRecord>();
    for (const p of data) {
      const key = p.name?.toLowerCase?.() || '';
      if (!key) continue;
      map.set(key, p);
      // Also set slugified variant as fallback
      map.set(slugifyName(p.name), p);
    }
    sofaCache.set(slug, map);
    return map;
  } catch {
    return null;
  }
}

export async function mergePlayerWithSofa<T extends { name: string; seasonStats?: SeasonStats; bio?: any; previousMatches?: any[]; imageUrl?: string; sofascoreId?: string }>(
  player: T,
  clubName: string,
): Promise<T> {
  const map = await loadClubSofaData(clubName);
  if (!map) return player;

  const nameKey = player.name.toLowerCase();
  const altKey = slugifyName(player.name);
  const sofa = map.get(nameKey) || map.get(altKey);
  if (!sofa) return player;

  // Decide seasonStats source:
  // - Prefer full SofaScore seasonStats when available (26+ games, up to date)
  // - For Leeds United, we treat the hand-crafted seasonStats as the \"good\" source
  // - For other clubs with NO SofaScore seasonStats, avoid falling back to old 11‑match placeholders
  let mergedSeasonStats: SeasonStats | undefined = player.seasonStats;
  const hasSofaSeason =
    sofa.seasonStats && Array.isArray(sofa.seasonStats.competitions) && sofa.seasonStats.competitions.length > 0;

  if (hasSofaSeason) {
    mergedSeasonStats = sofa.seasonStats;
  } else if (clubName === 'Leeds United' && player.seasonStats?.competitions?.length) {
    // Keep Leeds' curated stats when SofaScore isn't available
    mergedSeasonStats = player.seasonStats;
  } else if (clubName !== 'Leeds United') {
    // For other clubs, don't show stale 11‑match placeholders if SofaScore has no season data
    mergedSeasonStats = undefined;
  }

  return {
    ...player,
    sofascoreId: sofa.sofascoreId || player.sofascoreId,
    imageUrl: sofa.imageUrl || player.imageUrl,
    bio: sofa.bio || player.bio,
    seasonStats: mergedSeasonStats,
    previousMatches: sofa.previousMatches?.length ? sofa.previousMatches : player.previousMatches,
  };
}


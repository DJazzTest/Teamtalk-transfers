export interface FbrefStandardRow {
  name: string;
  position: string;
  matches: number;
  starts: number;
  minutes: number;
  goals: number;
  assists: number;
  goalsNoPen: number;
  pensScored: number;
  pensTaken: number;
  yellowCards: number;
  redCards: number;
  goalsPer90: number;
  assistsPer90: number;
  gaPer90: number;
  gNoPenPer90: number;
  gaNoPenPer90: number;
}

/**
 * Map from the canonical club name used in the UI to the slug we use
 * for FBref standard stats JSON files in /public.
 *
 * These slugs correspond to the filenames we copy into /public,
 * e.g. "leeds" -> /leeds-standard.json.
 */
const clubToSlug: Record<string, string> = {
  'Arsenal': 'arsenal',
  'Aston Villa': 'aston-villa',
  'Bournemouth': 'bournemouth',
  'Brentford': 'brentford',
  'Brighton & Hove Albion': 'brighton',
  'Chelsea': 'chelsea',
  'Crystal Palace': 'crystal-palace',
  'Everton': 'everton',
  'Fulham': 'fulham',
  'Leeds United': 'leeds',
  'Liverpool': 'liverpool',
  'Manchester City': 'manchester-city',
  'Manchester United': 'manchester-united',
  'Newcastle United': 'newcastle-united',
  'Nottingham Forest': 'nottingham-forest',
  'Tottenham Hotspur': 'tottenham-hotspur',
  'West Ham United': 'west-ham-united',
  'Wolverhampton Wanderers': 'wolverhampton-wanderers',
  // Sunderland and Burnley are in the FBref set we scraped even though
  // they may not be current PL sides – we still expose them for completeness.
  'Sunderland': 'sunderland',
  'Burnley': 'burnley',
};

/**
 * Load standard stats for a club from a JSON file in /public.
 * The JSON should be an array of FbrefStandardRow objects.
 */
export async function loadClubStandardStats(teamName: string): Promise<FbrefStandardRow[] | null> {
  const slug = clubToSlug[teamName];
  if (!slug) return null;

  try {
    const res = await fetch(`/${slug}-standard.json`, { cache: 'no-cache' });
    if (!res.ok) return null;
    const data = (await res.json()) as FbrefStandardRow[];
    if (!Array.isArray(data)) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Return the FBref standard stats row for a given player at a given club.
 * Name matching is done case-insensitively and ignores simple whitespace
 * differences for robustness.
 */
export async function getPlayerStandardStatsForClub(
  teamName: string,
  playerName: string
): Promise<FbrefStandardRow | null> {
  const all = await loadClubStandardStats(teamName);
  if (!all || !playerName) return null;

  const target = normalise(playerName);
  return (
    all.find((row) => normalise(row.name) === target) ||
    all.find((row) => normalise(row.name).includes(target)) ||
    null
  );
}

function normalise(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Create a safe zeroed-out standard stats row when we don't have FBref
 * data for a particular player. This prevents charts from breaking and
 * makes "no data" visually obvious.
 */
export function createEmptyStandardRow(playerName: string, position = 'MF'): FbrefStandardRow {
  return {
    name: playerName,
    position,
    matches: 0,
    starts: 0,
    minutes: 0,
    goals: 0,
    assists: 0,
    goalsNoPen: 0,
    pensScored: 0,
    pensTaken: 0,
    yellowCards: 0,
    redCards: 0,
    goalsPer90: 0,
    assistsPer90: 0,
    gaPer90: 0,
    gNoPenPer90: 0,
    gaNoPenPer90: 0,
  };
}



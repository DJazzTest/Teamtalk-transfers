export interface FbrefTable {
  headers: string[];
  rows: string[][];
}

export interface FbrefPlayerProfileRecord {
  clubSlug: string;
  clubName: string;
  fbrefUrl: string;
  fbrefId: string | null;
  name: string;
  scrapedName?: string | null;
  bioBlocks: string[];
  tables: {
    standardDomesticLeagues?: FbrefTable | null;
    keeperDomesticLeagues?: FbrefTable | null;
    playingTimeDomesticLeagues?: FbrefTable | null;
    miscDomesticLeagues?: FbrefTable | null;
    matchLogs?: FbrefTable | null;
  };
}

export interface FbrefPlayerProfilesFile {
  scrapedAt: string;
  profiles: FbrefPlayerProfileRecord[];
}

let cachedProfiles: FbrefPlayerProfilesFile | null = null;

async function loadProfilesFile(): Promise<FbrefPlayerProfilesFile | null> {
  if (cachedProfiles) return cachedProfiles;
  try {
    const res = await fetch('/fbref-player-profiles.json', { cache: 'no-cache' });
    if (!res.ok) return null;
    const data = (await res.json()) as FbrefPlayerProfilesFile;
    if (!data || !Array.isArray(data.profiles)) return null;
    cachedProfiles = data;
    return data;
  } catch {
    return null;
  }
}

function normaliseName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

export async function getFbrefPlayerProfile(
  clubSlug: string,
  playerName: string
): Promise<FbrefPlayerProfileRecord | null> {
  const data = await loadProfilesFile();
  if (!data) return null;
  const target = normaliseName(playerName);

  const exact =
    data.profiles.find(
      (p) =>
        p.clubSlug === clubSlug &&
        (normaliseName(p.name) === target ||
          (p.scrapedName && normaliseName(p.scrapedName) === target))
    ) || null;
  if (exact) return exact;

  const fuzzy =
    data.profiles.find(
      (p) =>
        p.clubSlug === clubSlug &&
        (normaliseName(p.name).includes(target) ||
          (p.scrapedName && normaliseName(p.scrapedName).includes(target)))
    ) || null;
  return fuzzy;
}


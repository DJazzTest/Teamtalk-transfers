/* Team mapping utilities: normalize names, map to IDs and slugs */

export interface TeamMappingEntry {
  canonical: string;
  variations: string[];
  sport365Id?: string; // e.g. 1-65 for Arsenal
  slug?: string; // e.g. arsenal
  youtubeUrl?: string;
}

const TEAM_MAP: TeamMappingEntry[] = [
  { canonical: 'Arsenal', variations: ['Arsenal FC', 'ARS'], sport365Id: '1-65', slug: 'arsenal', youtubeUrl: 'https://www.youtube.com/@arsenal/videos' },
  { canonical: 'Aston Villa', variations: ['Aston Villa FC', 'Villa'], sport365Id: '1-66', slug: 'aston-villa', youtubeUrl: 'https://www.youtube.com/@avfcofficial/videos' },
  { canonical: 'Bournemouth', variations: ['AFC Bournemouth', 'Bournemouth'], sport365Id: '1-389', slug: 'bournemouth', youtubeUrl: 'https://www.youtube.com/results?search_query=afc+bournemouth' },
  { canonical: 'Brentford', variations: ['Brentford FC'], sport365Id: '1-131', slug: 'brentford', youtubeUrl: 'https://www.youtube.com/results?search_query=brentford' },
  { canonical: 'Brighton & Hove Albion', variations: ['Brighton', 'Brighton and Hove Albion'], sport365Id: '1-102', slug: 'brightonhovealbion', youtubeUrl: 'https://www.youtube.com/@officialbhafc/videos' },
  { canonical: 'Chelsea', variations: ['Chelsea FC', 'CFC'], sport365Id: '1-61', slug: 'chelsea', youtubeUrl: 'https://www.youtube.com/user/chelseafc' },
  { canonical: 'Crystal Palace', variations: ['Crystal Palace FC'], sport365Id: '1-63', slug: 'crystalpalace', youtubeUrl: 'https://www.youtube.com/@OfficialCPFC/videos' },
  { canonical: 'Everton', variations: ['Everton FC'], sport365Id: '1-62', slug: 'everton', youtubeUrl: 'https://www.youtube.com/@Everton/videos' },
  { canonical: 'Fulham', variations: ['Fulham FC'], sport365Id: '1-64', slug: 'fulham', youtubeUrl: 'https://www.youtube.com/results?search_query=fulham' },
  { canonical: 'Ipswich Town', variations: ['Ipswich'], sport365Id: undefined, slug: 'ipswich-town', youtubeUrl: 'https://www.youtube.com/results?search_query=ipswichtownfootballclub++' },
  { canonical: 'Leeds United', variations: ['Leeds'], sport365Id: '1-341', slug: 'leeds-united', youtubeUrl: 'https://www.youtube.com/@LeedsUnited/videos' },
  { canonical: 'Leicester City', variations: ['Leicester'], sport365Id: undefined, slug: 'leicester-city', youtubeUrl: 'https://www.youtube.com/@LCFC/videos' },
  { canonical: 'Liverpool', variations: ['Liverpool FC', 'LFC'], sport365Id: '1-60', slug: 'liverpool', youtubeUrl: 'https://www.youtube.com/@LiverpoolFC/videos' },
  { canonical: 'Manchester City', variations: ['Man City', 'Manchester City FC'], sport365Id: '1-50', slug: 'manchestercity', youtubeUrl: 'https://www.youtube.com/@mancity/videos' },
  { canonical: 'Manchester United', variations: ['Man Utd', 'Manchester United FC'], sport365Id: '1-52', slug: 'manchesterunited', youtubeUrl: 'https://www.youtube.com/@manutd/videos' },
  { canonical: 'Newcastle United', variations: ['Newcastle', 'NUFC'], sport365Id: undefined, slug: 'newcastleunited', youtubeUrl: 'https://www.youtube.com/@NUFC/videos' },
  { canonical: 'Nottingham Forest', variations: ['Nottm Forest', 'Nottingham Forest FC'], sport365Id: '1-340', slug: 'nottinghamforest', youtubeUrl: 'https://www.youtube.com/@NottinghamForestFC/videos' },
  { canonical: 'Sheffield United', variations: ['Sheffield Utd'], sport365Id: undefined, slug: 'sheffield-united', youtubeUrl: 'https://www.youtube.com/@sheffieldunited/videos' },
  { canonical: 'Tottenham Hotspur', variations: ['Spurs', 'Tottenham'], sport365Id: '1-73', slug: 'tottenhamhotspur', youtubeUrl: 'https://www.youtube.com/@TottenhamHotspur/videos' },
  { canonical: 'West Ham United', variations: ['West Ham'], sport365Id: '1-80', slug: 'westhamunited', youtubeUrl: 'https://www.youtube.com/@westhamunited/videos' },
  { canonical: 'Wolverhampton Wanderers', variations: ['Wolves'], sport365Id: '1-76', slug: 'wolverhamptonwanderers', youtubeUrl: 'https://www.youtube.com/user/OfficialWolves' }
];

export function normalizeTeamName(name: string): string {
  const clean = name.trim().toLowerCase();
  for (const entry of TEAM_MAP) {
    if (entry.canonical.toLowerCase() === clean) return entry.canonical;
    if (entry.variations.some(v => v.toLowerCase() === clean)) return entry.canonical;
  }
  return name;
}

export function getTeamSlug(name: string): string | undefined {
  const canonical = normalizeTeamName(name);
  const found = TEAM_MAP.find(t => t.canonical === canonical);
  return found?.slug;
}

export function getSport365Id(name: string): string | undefined {
  const canonical = normalizeTeamName(name);
  const found = TEAM_MAP.find(t => t.canonical === canonical);
  return found?.sport365Id;
}

export function getTeamYoutubeUrl(name: string): string | undefined {
  const canonical = normalizeTeamName(name);
  const found = TEAM_MAP.find(t => t.canonical === canonical);
  return found?.youtubeUrl;
}

export function isPremierLeagueTeam(name: string): boolean {
  const canonical = normalizeTeamName(name);
  return TEAM_MAP.some(t => t.canonical === canonical);
}

// Public list of all mapped Premier League clubs (canonical names)
export function getPremierLeagueClubs(): string[] {
  return TEAM_MAP.map(t => t.canonical);
}



/* Comprehensive Team API Configuration
 * Maps each team to their league tables, results, and fixtures APIs
 */

export interface LeagueTableConfig {
  leagueName: string;
  tableApi: string;
  provider: 'sport365' | 'scoreinside' | 'ttStaging';
}

export interface TeamApiConfig {
  teamName: string;
  slug: string;
  league: string;
  leagueTable: LeagueTableConfig;
  resultsApi: string; // API to get past results for this team
  fixturesApi: string; // API to get upcoming fixtures for this team
  sport365TeamId?: string; // For Sport365 API calls
  ttTeamId?: string; // For TeamTalk staging API calls
}

// League Table Configurations
const LEAGUE_TABLES: Record<string, LeagueTableConfig> = {
  'Premier League': {
    leagueName: 'Premier League',
    tableApi: 'https://api.sport365.com/v1/en/stage/lg/soccer/91b797a0-1bb1-4c67-b359-5569369c5d56',
    provider: 'sport365'
  },
  'Championship': {
    leagueName: 'Championship',
    tableApi: 'https://api.sport365.com/v1/en/stage/lg/soccer/0e8a3f5a-1a74-4a23-a01c-2ab1042f62c9',
    provider: 'sport365'
  },
  'League One': {
    leagueName: 'League One',
    tableApi: 'https://stagingapi.tt-apis.com/api/football/match/2999249/table',
    provider: 'ttStaging'
  },
  'League Two': {
    leagueName: 'League Two',
    tableApi: 'https://stagingapi.tt-apis.com/api/football/match/2999805/table',
    provider: 'ttStaging'
  },
  'National League': {
    leagueName: 'English National League',
    tableApi: 'https://stagingapi.tt-apis.com/api/football/match/3016668/table',
    provider: 'ttStaging'
  },
  'Scottish Premiership': {
    leagueName: 'Scottish Premiership',
    tableApi: 'https://api.sport365.com/v1/en/stage/lg/soccer/6ae0a9ab-092d-4d67-9fe0-b7fa89dfe0f4',
    provider: 'sport365'
  },
  'Scottish Championship': {
    leagueName: 'Scottish Championship',
    tableApi: 'https://api.sport365.com/v1/en/stage/lg/soccer/cdf7ac88-b806-46e7-b3ca-ef90aec7c73c',
    provider: 'sport365'
  },
  'Scottish League One': {
    leagueName: 'Scottish League One',
    tableApi: 'https://api.sport365.com/v1/en/stage/lg/soccer/0ee0aa6a-6cdb-4aeb-a9dd-0c2215e0fd3a',
    provider: 'sport365'
  },
  'Scottish League Two': {
    leagueName: 'Scottish League Two',
    tableApi: 'https://api.sport365.com/v1/en/stage/lg/soccer/6e65f39f-37b3-4390-9851-fcc543baf798',
    provider: 'sport365'
  },
  'Serie A': {
    leagueName: 'Italian Serie A',
    tableApi: 'https://api.sport365.com/v1/en/stage/lg/soccer/6e65f39f-37b3-4390-9851-fcc543baf798',
    provider: 'sport365'
  },
  'La Liga': {
    leagueName: 'Spanish La Liga',
    tableApi: 'https://api.sport365.com/v1/en/stage/lg/soccer/6b80f4b4-fe58-4a27-b3d2-e152992c4f1b',
    provider: 'sport365'
  },
  'Ligue 1': {
    leagueName: 'French Ligue 1',
    tableApi: 'https://api.sport365.com/v1/en/stage/lg/soccer/567875d5-69a9-4b73-a98e-137452943f63',
    provider: 'sport365'
  },
  'Bundesliga': {
    leagueName: 'German Bundesliga',
    tableApi: 'https://api.sport365.com/v1/en/stage/lg/soccer/cd8c931b-b4ce-4533-8e5b-1309026c100f',
    provider: 'sport365'
  },
  'Irish League': {
    leagueName: 'Irish League',
    tableApi: 'https://api.sport365.com/v1/en/stage/lg/soccer/07eb144a-6acc-43a5-b7d3-af7cbe0c9ca8',
    provider: 'sport365'
  },
  'Welsh League': {
    leagueName: 'Welsh League',
    tableApi: 'https://api.sport365.com/v1/en/stage/lg/soccer/7473888e-9980-41b9-ba48-1bb0c4b331a1',
    provider: 'sport365'
  }
};

// Helper function to generate results API URL for a team
function getResultsApi(teamId: string, fromDate: string, toDate: string): string {
  return `https://api.sport365.com/v1/en/matches/soccer/from/${fromDate}/to/${toDate}`;
}

// Helper function to generate fixtures API URL for a team
function getFixturesApi(teamId: string, fromDate: string, toDate: string): string {
  return `https://api.sport365.com/v1/en/matches/soccer/from/${fromDate}/to/${toDate}`;
}

// Team API Configurations - Premier League Teams
export const TEAM_API_CONFIGS: TeamApiConfig[] = [
  {
    teamName: 'Arsenal',
    slug: 'arsenal',
    league: 'Premier League',
    leagueTable: LEAGUE_TABLES['Premier League'],
    resultsApi: getResultsApi('1-65', '2024-08-01T00:00:00', new Date().toISOString()),
    fixturesApi: getFixturesApi('1-65', new Date().toISOString(), '2025-06-30T23:59:59'),
    sport365TeamId: '1-65',
    ttTeamId: '1205'
  },
  {
    teamName: 'Aston Villa',
    slug: 'aston-villa',
    league: 'Premier League',
    leagueTable: LEAGUE_TABLES['Premier League'],
    resultsApi: getResultsApi('1-66', '2024-08-01T00:00:00', new Date().toISOString()),
    fixturesApi: getFixturesApi('1-66', new Date().toISOString(), '2025-06-30T23:59:59'),
    sport365TeamId: '1-66',
    ttTeamId: '1215'
  },
  {
    teamName: 'Bournemouth',
    slug: 'bournemouth',
    league: 'Premier League',
    leagueTable: LEAGUE_TABLES['Premier League'],
    resultsApi: getResultsApi('1-389', '2024-08-01T00:00:00', new Date().toISOString()),
    fixturesApi: getFixturesApi('1-389', new Date().toISOString(), '2025-06-30T23:59:59'),
    sport365TeamId: '1-389',
    ttTeamId: '1124'
  },
  {
    teamName: 'Brentford',
    slug: 'brentford',
    league: 'Premier League',
    leagueTable: LEAGUE_TABLES['Premier League'],
    resultsApi: getResultsApi('1-131', '2024-08-01T00:00:00', new Date().toISOString()),
    fixturesApi: getFixturesApi('1-131', new Date().toISOString(), '2025-06-30T23:59:59'),
    sport365TeamId: '1-131',
    ttTeamId: '1125'
  },
  {
    teamName: 'Brighton & Hove Albion',
    slug: 'brighton',
    league: 'Premier League',
    leagueTable: LEAGUE_TABLES['Premier League'],
    resultsApi: getResultsApi('1-102', '2024-08-01T00:00:00', new Date().toISOString()),
    fixturesApi: getFixturesApi('1-102', new Date().toISOString(), '2025-06-30T23:59:59'),
    sport365TeamId: '1-102',
    ttTeamId: '1126'
  },
  {
    teamName: 'Burnley',
    slug: 'burnley',
    league: 'Premier League',
    leagueTable: LEAGUE_TABLES['Premier League'],
    resultsApi: getResultsApi('1-68', '2024-08-01T00:00:00', new Date().toISOString()),
    fixturesApi: getFixturesApi('1-68', new Date().toISOString(), '2025-06-30T23:59:59'),
    sport365TeamId: '1-68',
    ttTeamId: '1132'
  },
  {
    teamName: 'Chelsea',
    slug: 'chelsea',
    league: 'Premier League',
    leagueTable: LEAGUE_TABLES['Premier League'],
    resultsApi: getResultsApi('1-61', '2024-08-01T00:00:00', new Date().toISOString()),
    fixturesApi: getFixturesApi('1-61', new Date().toISOString(), '2025-06-30T23:59:59'),
    sport365TeamId: '1-61',
    ttTeamId: '1276'
  },
  {
    teamName: 'Crystal Palace',
    slug: 'crystal-palace',
    league: 'Premier League',
    leagueTable: LEAGUE_TABLES['Premier League'],
    resultsApi: getResultsApi('1-63', '2024-08-01T00:00:00', new Date().toISOString()),
    fixturesApi: getFixturesApi('1-63', new Date().toISOString(), '2025-06-30T23:59:59'),
    sport365TeamId: '1-63',
    ttTeamId: '1317'
  },
  {
    teamName: 'Everton',
    slug: 'everton',
    league: 'Premier League',
    leagueTable: LEAGUE_TABLES['Premier League'],
    resultsApi: getResultsApi('1-62', '2024-08-01T00:00:00', new Date().toISOString()),
    fixturesApi: getFixturesApi('1-62', new Date().toISOString(), '2025-06-30T23:59:59'),
    sport365TeamId: '1-62',
    ttTeamId: '1367'
  },
  {
    teamName: 'Fulham',
    slug: 'fulham',
    league: 'Premier League',
    leagueTable: LEAGUE_TABLES['Premier League'],
    resultsApi: getResultsApi('1-64', '2024-08-01T00:00:00', new Date().toISOString()),
    fixturesApi: getFixturesApi('1-64', new Date().toISOString(), '2025-06-30T23:59:59'),
    sport365TeamId: '1-64',
    ttTeamId: '1408'
  },
  {
    teamName: 'Leeds United',
    slug: 'leeds-united',
    league: 'Premier League',
    leagueTable: LEAGUE_TABLES['Premier League'],
    resultsApi: getResultsApi('1-341', '2024-08-01T00:00:00', new Date().toISOString()),
    fixturesApi: getFixturesApi('1-341', new Date().toISOString(), '2025-06-30T23:59:59'),
    sport365TeamId: '1-341',
    ttTeamId: '1431'
  },
  {
    teamName: 'Liverpool',
    slug: 'liverpool',
    league: 'Premier League',
    leagueTable: LEAGUE_TABLES['Premier League'],
    resultsApi: getResultsApi('1-59', '2024-08-01T00:00:00', new Date().toISOString()),
    fixturesApi: getFixturesApi('1-59', new Date().toISOString(), '2025-06-30T23:59:59'),
    sport365TeamId: '1-59',
    ttTeamId: '1124'
  },
  {
    teamName: 'Manchester City',
    slug: 'manchester-city',
    league: 'Premier League',
    leagueTable: LEAGUE_TABLES['Premier League'],
    resultsApi: getResultsApi('1-60', '2024-08-01T00:00:00', new Date().toISOString()),
    fixturesApi: getFixturesApi('1-60', new Date().toISOString(), '2025-06-30T23:59:59'),
    sport365TeamId: '1-60',
    ttTeamId: '1548'
  },
  {
    teamName: 'Manchester United',
    slug: 'manchester-united',
    league: 'Premier League',
    leagueTable: LEAGUE_TABLES['Premier League'],
    resultsApi: getResultsApi('1-58', '2024-08-01T00:00:00', new Date().toISOString()),
    fixturesApi: getFixturesApi('1-58', new Date().toISOString(), '2025-06-30T23:59:59'),
    sport365TeamId: '1-58',
    ttTeamId: '1571'
  },
  {
    teamName: 'Newcastle United',
    slug: 'newcastle-united',
    league: 'Premier League',
    leagueTable: LEAGUE_TABLES['Premier League'],
    resultsApi: getResultsApi('1-67', '2024-08-01T00:00:00', new Date().toISOString()),
    fixturesApi: getFixturesApi('1-67', new Date().toISOString(), '2025-06-30T23:59:59'),
    sport365TeamId: '1-67',
    ttTeamId: '1599'
  },
  {
    teamName: 'Nottingham Forest',
    slug: 'nottingham-forest',
    league: 'Premier League',
    leagueTable: LEAGUE_TABLES['Premier League'],
    resultsApi: getResultsApi('1-70', '2024-08-01T00:00:00', new Date().toISOString()),
    fixturesApi: getFixturesApi('1-70', new Date().toISOString(), '2025-06-30T23:59:59'),
    sport365TeamId: '1-70',
    ttTeamId: '1748'
  },
  {
    teamName: 'Sunderland',
    slug: 'sunderland',
    league: 'Premier League',
    leagueTable: LEAGUE_TABLES['Premier League'],
    resultsApi: getResultsApi('1-69', '2024-08-01T00:00:00', new Date().toISOString()),
    fixturesApi: getFixturesApi('1-69', new Date().toISOString(), '2025-06-30T23:59:59'),
    sport365TeamId: '1-69',
    ttTeamId: '1779'
  },
  {
    teamName: 'Tottenham Hotspur',
    slug: 'tottenham-hotspur',
    league: 'Premier League',
    leagueTable: LEAGUE_TABLES['Premier League'],
    resultsApi: getResultsApi('1-57', '2024-08-01T00:00:00', new Date().toISOString()),
    fixturesApi: getFixturesApi('1-57', new Date().toISOString(), '2025-06-30T23:59:59'),
    sport365TeamId: '1-57',
    ttTeamId: '1811'
  },
  {
    teamName: 'West Ham United',
    slug: 'west-ham-united',
    league: 'Premier League',
    leagueTable: LEAGUE_TABLES['Premier League'],
    resultsApi: getResultsApi('1-56', '2024-08-01T00:00:00', new Date().toISOString()),
    fixturesApi: getFixturesApi('1-56', new Date().toISOString(), '2025-06-30T23:59:59'),
    sport365TeamId: '1-56',
    ttTeamId: '1837'
  },
  {
    teamName: 'Wolverhampton Wanderers',
    slug: 'wolves',
    league: 'Premier League',
    leagueTable: LEAGUE_TABLES['Premier League'],
    resultsApi: getResultsApi('1-55', '2024-08-01T00:00:00', new Date().toISOString()),
    fixturesApi: getFixturesApi('1-55', new Date().toISOString(), '2025-06-30T23:59:59'),
    sport365TeamId: '1-55',
    ttTeamId: '1143'
  }
];

// Helper functions
export function getTeamConfig(teamName: string): TeamApiConfig | undefined {
  return TEAM_API_CONFIGS.find(config => 
    config.teamName === teamName || 
    config.slug === teamName.toLowerCase().replace(/\s+/g, '-')
  );
}

export function getTeamConfigBySlug(slug: string): TeamApiConfig | undefined {
  return TEAM_API_CONFIGS.find(config => config.slug === slug);
}

export function getAllLeagueTables(): LeagueTableConfig[] {
  return Object.values(LEAGUE_TABLES);
}

export function getTeamsByLeague(league: string): TeamApiConfig[] {
  return TEAM_API_CONFIGS.filter(config => config.league === league);
}


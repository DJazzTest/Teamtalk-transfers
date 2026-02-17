/**
 * TEAMtalk source URLs per club for scraping Overview, Results, Fixtures, Squad, Stats.
 * Used by the "pull" job (scripts/pull-teamtalk-data.mjs) and can be overridden from
 * CMS or public/teamtalk-source-urls.json.
 *
 * @see docs/TEAMTALK_LOOK_AND_DATA.md
 */

export interface TeamtalkSourceUrls {
  overview: string;
  results: string;
  fixtures: string;
  squad: string;
  stats: string;
}

const TEAMTALK_BASE = 'https://www.teamtalk.com';

/**
 * Build default TEAMtalk URLs for a club from its slug.
 * Override these in CMS or public/teamtalk-source-urls.json when paths differ.
 */
export function getDefaultTeamtalkUrls(slug: string): TeamtalkSourceUrls {
  const base = `${TEAMTALK_BASE}/${slug}`;
  return {
    overview: base,
    results: `${base}/results`,
    fixtures: `${base}/fixtures`,
    squad: `${base}/squad`,
    stats: `${base}/stats`,
  };
}

/**
 * Slug-to-URLs map. When you add URLs via CMS or paste them, merge into this or
 * load from public/teamtalk-source-urls.json so the pull job uses them.
 */
export type TeamtalkSourceUrlsMap = Record<string, Partial<TeamtalkSourceUrls>>;

/**
 * Default map for all Premier League clubs (slugs from teamApiConfig).
 * Replace or merge with CMS/JSON overrides.
 */
export const DEFAULT_TEAMTALK_SOURCE_URLS: TeamtalkSourceUrlsMap = {
  'arsenal': getDefaultTeamtalkUrls('arsenal'),
  'aston-villa': getDefaultTeamtalkUrls('aston-villa'),
  'bournemouth': getDefaultTeamtalkUrls('bournemouth'),
  'brentford': getDefaultTeamtalkUrls('brentford'),
  'brighton': getDefaultTeamtalkUrls('brighton-and-hove-albion'),
  'burnley': getDefaultTeamtalkUrls('burnley'),
  'chelsea': getDefaultTeamtalkUrls('chelsea'),
  'crystal-palace': getDefaultTeamtalkUrls('crystal-palace'),
  'everton': getDefaultTeamtalkUrls('everton'),
  'fulham': getDefaultTeamtalkUrls('fulham'),
  'leeds-united': getDefaultTeamtalkUrls('leeds-united'),
  'liverpool': getDefaultTeamtalkUrls('liverpool'),
  'manchester-city': getDefaultTeamtalkUrls('manchester-city'),
  'manchester-united': getDefaultTeamtalkUrls('manchester-united'),
  'newcastle-united': getDefaultTeamtalkUrls('newcastle-united'),
  'nottingham-forest': getDefaultTeamtalkUrls('nottingham-forest'),
  'sunderland': getDefaultTeamtalkUrls('sunderland'),
  'tottenham-hotspur': getDefaultTeamtalkUrls('tottenham-hotspur'),
  'west-ham-united': getDefaultTeamtalkUrls('west-ham-united'),
  'wolves': getDefaultTeamtalkUrls('wolverhampton-wanderers'),
};

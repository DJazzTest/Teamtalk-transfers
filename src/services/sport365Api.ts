/*
  Lightweight Sport365 API client
  - Only minimal endpoints needed for initial integration
*/

export interface Sport365Match {
  id?: string;
  match_id?: string;
  stage_id?: string;
  home_name?: string;
  away_name?: string;
  start_time?: string;
  status?: string;
  score?: string;
}

export interface Sport365TeamPage {
  id?: string;
  name?: string;
  country?: string;
  logo?: string;
}

export interface Sport365SearchItem {
  id?: string;
  name?: string;
  type?: string;
  logo?: string;
}

async function safeJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text as unknown as T; }
}

const BASE = 'https://api.sport365.com';

export const sport365Api = {
  async getTodayMatches(): Promise<any> {
    const res = await fetch(`${BASE}/v1/en/matches/soccer/today/0/utc`);
    return safeJson(res);
  },

  async getMatchesByDate(yyyyMmDd: string): Promise<any> {
    const res = await fetch(`${BASE}/v1/en/matches/soccer/date/${yyyyMmDd}/0/utc`);
    return safeJson(res);
  },

  async getMatchesFromTo(fromIso: string, toIso: string): Promise<any> {
    const res = await fetch(`${BASE}/v1/en/matches/soccer/from/${encodeURIComponent(fromIso)}/to/${encodeURIComponent(toIso)}`);
    return safeJson(res);
  },

  async getLiveMatches(): Promise<any> {
    const res = await fetch(`${BASE}/v1/en/matches/soccer/live`);
    return safeJson(res);
  },

  async getMatchFull(id: string): Promise<any> {
    const res = await fetch(`${BASE}/v1/en/match/soccer/full/${id}?boxscore=1&estats=1&tf=1&tlge=1&wh2h=1&wstats=1&wtops=1`);
    return safeJson(res);
  },

  async getMatch(id: string): Promise<any> {
    const res = await fetch(`${BASE}/v1/en/match/soccer/${id}`);
    return safeJson(res);
  },

  async getTeamPage(teamId: string): Promise<Sport365TeamPage | any> {
    const res = await fetch(`${BASE}/v1/en/team/soccer/teampage/${teamId}`);
    return safeJson(res);
  },

  async searchTeam(query: string): Promise<Sport365SearchItem[] | any> {
    const res = await fetch(`${BASE}/v1/en/search/soccer?userInput=${encodeURIComponent(query)}`);
    return safeJson(res);
  },

  getTeamLogoUrl(teamId: string): string {
    return `${BASE}/logos/soccer/1/${teamId}/teamlogo.png`;
  }
};







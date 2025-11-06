export interface CountdownResponse {
  status: number;
  message: string;
  result: { id: number; title: string; start_date: string; end_date: string };
}

export interface TransferArticlesPage {
  status: number;
  message: string;
  result: { transfer_articles: { current_page: number; data: any[] } };
}

async function safeJson<T>(res: Response): Promise<T | null> {
  try { return (await res.json()) as T; } catch { return null; }
}

export const ttStagingApi = {
  async getCountdown(tournamentId: string) {
    const url = `https://stagingapi.tt-apis.com/api/transfer-window-countdown?tournament_id=${encodeURIComponent(tournamentId)}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return null;
    return safeJson<CountdownResponse>(res);
  },

  async getTransferArticles(page = 1, perPage = 20) {
    const url = `https://stagingapi.tt-apis.com/api/transfer-articles?page=${page}&per_page=${perPage}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return null;
    return safeJson<TransferArticlesPage>(res);
  },

  async getRumourTeams(seasonYear: string, seasonName: string, tournamentId: string) {
    const url = `https://stagingapi.tt-apis.com/api/transfers/rumour-teams?seasonYear=${encodeURIComponent(seasonYear)}&seasonName=${encodeURIComponent(seasonName)}&tournamentId=${encodeURIComponent(tournamentId)}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return null;
    return res.json();
  },

  async getTopTransfers(seasonYear: string, seasonName: string, tournamentId: string) {
    const url = `https://stagingapi.tt-apis.com/api/transfers/top-transfers?seasonYear=${encodeURIComponent(seasonYear)}&seasonName=${encodeURIComponent(seasonName)}&tournamentId=${encodeURIComponent(tournamentId)}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return null;
    return res.json();
  },

  async getRumoursByTeam(seasonYear: string, seasonName: string, teamId: string, page: number, tournamentId: string) {
    const url = `https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=${encodeURIComponent(seasonYear)}&seasonName=${encodeURIComponent(seasonName)}&team_id=${encodeURIComponent(teamId)}&page=${page}&tournamentId=${encodeURIComponent(tournamentId)}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return null;
    return res.json();
  },

  async getDoneDealTeams(seasonYear: string, seasonName: string, tournamentId: string) {
    const url = `https://stagingapi.tt-apis.com/api/transfers/done-deal-teams?seasonName=${encodeURIComponent(seasonName)}&seasonYear=${encodeURIComponent(seasonYear)}&tournamentId=${encodeURIComponent(tournamentId)}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return null;
    return res.json();
  },

  async getDoneDealsByTeam(seasonYear: string, seasonName: string, teamId: string) {
    const url = `https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=${encodeURIComponent(seasonName)}&seasonYear=${encodeURIComponent(seasonYear)}&team_id=${encodeURIComponent(teamId)}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return null;
    return res.json();
  }
};

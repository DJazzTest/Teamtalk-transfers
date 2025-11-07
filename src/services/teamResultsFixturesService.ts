/* Service to fetch team-specific results and fixtures */

import { getTeamConfig } from '@/data/teamApiConfig';
import { sport365Api } from './sport365Api';

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  date: string;
  status: 'finished' | 'scheduled' | 'live' | 'postponed';
  competition?: string;
}

export interface TeamResultsFixtures {
  results: Match[];
  fixtures: Match[];
}

export interface MatchDetails {
  goalScorers?: Array<{ name: string; minute?: string; team?: string; type?: string }>;
  competition?: string;
}

export class TeamResultsFixturesService {
  private static instance: TeamResultsFixturesService;
  private cache: Map<string, { data: TeamResultsFixtures; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): TeamResultsFixturesService {
    if (!TeamResultsFixturesService.instance) {
      TeamResultsFixturesService.instance = new TeamResultsFixturesService();
    }
    return TeamResultsFixturesService.instance;
  }

  private normalizeTeamName(name: string): string {
    return name.toLowerCase().trim();
  }

  private matchesTeam(match: any, teamName: string): boolean {
    const normalized = this.normalizeTeamName(teamName);
    
    // Handle Sport365 API structure: teams array with name field
    if (match.teams && Array.isArray(match.teams)) {
      for (const team of match.teams) {
        const teamNameStr = this.normalizeTeamName(team.name || '');
        if (teamNameStr.includes(normalized) || normalized.includes(teamNameStr)) {
          return true;
        }
      }
      return false;
    }
    
    // Fallback to other structures
    const homeName = this.normalizeTeamName(
      match.home_name || match.homeTeam || match.hn || match.home?.name || match.home || ''
    );
    const awayName = this.normalizeTeamName(
      match.away_name || match.awayTeam || match.an || match.away?.name || match.away || ''
    );
    
    return homeName.includes(normalized) || awayName.includes(normalized) ||
           normalized.includes(homeName) || normalized.includes(awayName);
  }

  private transformMatch(match: any): Match {
    // Handle Sport365 API structure: teams array, score array, start timestamp
    let homeTeam = '';
    let awayTeam = '';
    let homeScore: number | undefined;
    let awayScore: number | undefined;
    
    if (match.teams && Array.isArray(match.teams) && match.teams.length >= 2) {
      homeTeam = match.teams[0].name || '';
      awayTeam = match.teams[1].name || '';
    } else {
      homeTeam = match.home_name || match.homeTeam || match.hn || match.home?.name || match.home || '';
      awayTeam = match.away_name || match.awayTeam || match.an || match.away?.name || match.away || '';
    }
    
    // Handle score: can be array [home, away] or ft_score array
    if (Array.isArray(match.score) && match.score.length >= 2) {
      homeScore = match.score[0];
      awayScore = match.score[1];
    } else if (Array.isArray(match.ft_score) && match.ft_score.length >= 2) {
      homeScore = match.ft_score[0];
      awayScore = match.ft_score[1];
    } else {
      homeScore = match.home_score ?? match.homeScore;
      awayScore = match.away_score ?? match.awayScore;
      if (typeof match.ft === 'string' && match.ft.includes('-')) {
        const parts = match.ft.split('-');
        homeScore = Number((parts[0] || '').trim());
        awayScore = Number((parts[1] || '').trim());
      }
    }
    
    // Handle date: start is timestamp in format YYYYMMDDHHmmss
    let dateStr = '';
    if (match.start) {
      // Convert YYYYMMDDHHmmss to ISO string
      const s = match.start.toString();
      if (s.length === 14) {
        dateStr = `${s.substring(0, 4)}-${s.substring(4, 6)}-${s.substring(6, 8)}T${s.substring(8, 10)}:${s.substring(10, 12)}:${s.substring(12, 14)}`;
      }
    }
    if (!dateStr) {
      dateStr = match.start_time || match.date || match.startTime || match.dt || '';
    }
    
    // Status: 6 = finished, other numbers = various states
    let statusStr = '';
    if (typeof match.status === 'number') {
      statusStr = match.status === 6 ? 'finished' : match.status === 1 ? 'scheduled' : match.status === 2 ? 'live' : '';
    } else {
      statusStr = match.status || match.match_status || match.st || (match.ft ? 'finished' : '');
    }
    
    return {
      id: match.id || match.match_id || match.mid || '',
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      date: dateStr,
      status: this.determineStatus(statusStr),
      competition: match.c_name || match.competition || match.league || match.tournament || ''
    };
  }

  private determineStatus(status: string): 'finished' | 'scheduled' | 'live' | 'postponed' {
    if (!status) return 'scheduled';
    const lower = status.toLowerCase();
    if (lower.includes('finished') || lower.includes('ft') || lower.includes('completed')) {
      return 'finished';
    }
    if (lower.includes('live') || lower.includes('playing') || lower.includes('in progress')) {
      return 'live';
    }
    if (lower.includes('postponed') || lower.includes('cancelled')) {
      return 'postponed';
    }
    return 'scheduled';
  }

  async getTeamResults(teamName: string, fromDate?: string, toDate?: string): Promise<Match[]> {
    const config = getTeamConfig(teamName);
    if (!config) {
      console.warn(`No config found for team: ${teamName}`);
      return [];
    }

    const cacheKey = `results-${config.slug}-${fromDate || 'default'}-${toDate || 'default'}`;
    const now = Date.now();
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data.results;
    }

    try {
      // Use Sport365 API to get matches
      const startDate = fromDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(); // Last 90 days
      const endDate = toDate || new Date().toISOString();
      
      const matches = await sport365Api.getMatchesFromTo(startDate, endDate);
      
      // Filter matches for this team
      let teamMatches: any[] = [];
      
      // Handle nested structure: array of competitions, each with matches array
      if (Array.isArray(matches)) {
        // Check if it's an array of competitions (has c_name, matches) or direct matches
        if (matches.length > 0 && matches[0].matches && Array.isArray(matches[0].matches)) {
          // It's an array of competitions
          for (const comp of matches) {
            if (comp.matches && Array.isArray(comp.matches)) {
              teamMatches.push(...comp.matches.filter((match: any) => this.matchesTeam(match, teamName)));
            }
          }
        } else {
          // It's a direct array of matches
          teamMatches = matches.filter(match => this.matchesTeam(match, teamName));
        }
      } else if (matches.data && Array.isArray(matches.data)) {
        teamMatches = matches.data.filter((match: any) => this.matchesTeam(match, teamName));
      } else if (matches.matches && Array.isArray(matches.matches)) {
        teamMatches = matches.matches.filter((match: any) => this.matchesTeam(match, teamName));
      }

      // Filter to only finished matches (results)
      const results = teamMatches
        .filter(match => {
          // Status 6 = finished in Sport365 API
          const isFinished = match.status === 6 || 
                           (typeof match.status === 'string' && this.determineStatus(match.status) === 'finished') ||
                           (match.ft_score && Array.isArray(match.ft_score)) ||
                           (match.score && Array.isArray(match.score) && match.status === 6);
          return isFinished;
        })
        .map(match => this.transformMatch(match))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Update cache
      const cachedData = this.cache.get(cacheKey);
      this.cache.set(cacheKey, {
        data: {
          results,
          fixtures: cachedData?.data.fixtures || []
        },
        timestamp: now
      });

      return results;
    } catch (error) {
      console.error(`Error fetching results for ${teamName}:`, error);
      return [];
    }
  }

  async getTeamFixtures(teamName: string, fromDate?: string, toDate?: string): Promise<Match[]> {
    const config = getTeamConfig(teamName);
    if (!config) {
      console.warn(`No config found for team: ${teamName}`);
      return [];
    }

    const cacheKey = `fixtures-${config.slug}-${fromDate || 'default'}-${toDate || 'default'}`;
    const now = Date.now();
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data.fixtures;
    }

    try {
      // Use Sport365 API to get matches
      const startDate = fromDate || new Date().toISOString();
      const endDate = toDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(); // Next 90 days
      
      const matches = await sport365Api.getMatchesFromTo(startDate, endDate);
      
      // Filter matches for this team
      let teamMatches: any[] = [];
      
      // Handle nested structure: array of competitions, each with matches array
      if (Array.isArray(matches)) {
        // Check if it's an array of competitions (has c_name, matches) or direct matches
        if (matches.length > 0 && matches[0].matches && Array.isArray(matches[0].matches)) {
          // It's an array of competitions
          for (const comp of matches) {
            if (comp.matches && Array.isArray(comp.matches)) {
              teamMatches.push(...comp.matches.filter((match: any) => this.matchesTeam(match, teamName)));
            }
          }
        } else {
          // It's a direct array of matches
          teamMatches = matches.filter(match => this.matchesTeam(match, teamName));
        }
      } else if (matches.data && Array.isArray(matches.data)) {
        teamMatches = matches.data.filter((match: any) => this.matchesTeam(match, teamName));
      } else if (matches.matches && Array.isArray(matches.matches)) {
        teamMatches = matches.matches.filter((match: any) => this.matchesTeam(match, teamName));
      }

      // Filter to only scheduled matches (fixtures)
      const fixtures = teamMatches
        .filter(match => {
          const status = match.status || match.match_status || '';
          const matchStatus = this.determineStatus(status);
          return matchStatus === 'scheduled' || matchStatus === 'live';
        })
        .map(match => this.transformMatch(match))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Update cache
      const cachedData = this.cache.get(cacheKey);
      this.cache.set(cacheKey, {
        data: {
          results: cachedData?.data.results || [],
          fixtures
        },
        timestamp: now
      });

      return fixtures;
    } catch (error) {
      console.error(`Error fetching fixtures for ${teamName}:`, error);
      return [];
    }
  }

  async getTeamResultsAndFixtures(teamName: string): Promise<TeamResultsFixtures> {
    const results = await this.getTeamResults(teamName);
    const fixtures = await this.getTeamFixtures(teamName);
    
    return {
      results,
      fixtures
    };
  }

  async getMatchDetails(matchId: string): Promise<MatchDetails> {
    try {
      if (!matchId) return {};
      const full = await sport365Api.getMatchFull(matchId);
      const details: MatchDetails = {};

      // Try common shapes for goals
      const goalScorers: Array<{ name: string; minute?: string; team?: string; type?: string }> = [];

      // Variant 1: full.events with type 'goal'
      if (full?.events && Array.isArray(full.events)) {
        for (const ev of full.events) {
          const isGoal = /goal/i.test(ev.type || ev.eventType || '');
          if (isGoal) {
            goalScorers.push({
              name: ev.player || ev.player_name || ev.scorer || ev.name || 'Unknown',
              minute: ev.minute ? `${ev.minute}'` : ev.time || undefined,
              team: ev.team || ev.team_name || undefined,
              type: ev.detail || ev.subtype || undefined
            });
          }
        }
      }

      // Variant 2: full.goals array
      if (goalScorers.length === 0 && Array.isArray(full?.goals)) {
        for (const g of full.goals) {
          goalScorers.push({
            name: g.player || g.player_name || g.scorer || 'Unknown',
            minute: g.minute ? `${g.minute}'` : undefined,
            team: g.team || g.team_name || undefined,
            type: g.type || undefined
          });
        }
      }

      // Variant 3: nested boxscore or timeline structures
      const timeline = full?.timeline || full?.match_timeline || [];
      if (goalScorers.length === 0 && Array.isArray(timeline)) {
        for (const ev of timeline) {
          const isGoal = /goal/i.test(ev.type || ev.event || '');
          if (isGoal) {
            goalScorers.push({
              name: ev.player || ev.player_name || 'Unknown',
              minute: ev.minute ? `${ev.minute}'` : ev.time || undefined,
              team: ev.team || ev.team_name || undefined,
              type: ev.detail || undefined
            });
          }
        }
      }

      // Variant 4: incs (incidents) structure - this is where Sport365 stores goal events
      // Always check incs as it's the most reliable source for Sport365
      if (full?.incs && typeof full.incs === 'object') {
        const incs = full.incs as Record<string, Record<string, any[]>>;
        // incs is a dict where keys are team IDs, values are dicts of minute -> events
        for (const teamId in incs) {
          const teamIncs = incs[teamId];
          if (teamIncs && typeof teamIncs === 'object') {
            for (const minute in teamIncs) {
              const events = teamIncs[minute];
              if (Array.isArray(events)) {
                for (const ev of events) {
                  // Type 1 is goal in Sport365 API
                  if (ev.type === 1 || ev.type === '1') {
                    const playerName = ev.pl_name || ev.player_name || ev.player || ev.name;
                    if (playerName && playerName !== 'Unknown') {
                      goalScorers.push({
                        name: playerName,
                        minute: ev.min ? `${ev.min}'` : ev.minute ? `${ev.minute}'` : minute ? `${minute}'` : undefined,
                        team: ev.team || ev.team_name || undefined,
                        type: ev.detail || undefined
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }

      if (goalScorers.length > 0) {
        details.goalScorers = goalScorers;
      }

      // Competition name if present
      details.competition = full?.competition?.name || full?.league?.name || full?.tournament || undefined;

      return details;
    } catch (error) {
      console.error('Error fetching match details', matchId, error);
      return {};
    }
  }

  clearCache(teamName?: string): void {
    if (teamName) {
      const config = getTeamConfig(teamName);
      if (config) {
        const keysToDelete: string[] = [];
        this.cache.forEach((_, key) => {
          if (key.includes(config.slug)) {
            keysToDelete.push(key);
          }
        });
        keysToDelete.forEach(key => this.cache.delete(key));
      }
    } else {
      this.cache.clear();
    }
  }
}

export const teamResultsFixturesService = TeamResultsFixturesService.getInstance();


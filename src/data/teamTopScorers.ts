/**
 * Top Goal Scorers data for teams
 * This is the source of truth for goal scorer statistics
 */

export interface TopScorer {
  name: string;
  goals: number;
}

export const TEAM_TOP_SCORERS: Record<string, TopScorer[]> = {
  'Arsenal': [
    { name: 'Viktor Gyökeres', goals: 6 },
    { name: 'Bukayo Saka', goals: 2 },
    { name: 'Jurrien Timber', goals: 2 },
    { name: 'Martín Zubimendi', goals: 2 },
    { name: 'Declan Rice', goals: 2 },
    { name: 'Leandro Trossard', goals: 2 },
    { name: 'Eberechi Eze', goals: 2 },
    { name: 'Gabriel Magalhães', goals: 2 },
    { name: 'Riccardo Calafiori', goals: 2 },
    { name: 'Martin Ødegaard', goals: 1 },
    { name: 'Gabriel Martinelli', goals: 1 }
  ]
};

/**
 * Get top scorers for a team
 */
export function getTeamTopScorers(teamName: string): TopScorer[] {
  // Try exact match first
  if (TEAM_TOP_SCORERS[teamName]) {
    return TEAM_TOP_SCORERS[teamName];
  }
  
  // Try case-insensitive match
  const normalized = teamName.toLowerCase();
  for (const [key, value] of Object.entries(TEAM_TOP_SCORERS)) {
    if (key.toLowerCase() === normalized) {
      return value;
    }
  }
  
  return [];
}


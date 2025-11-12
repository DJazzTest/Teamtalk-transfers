import { getSquad } from '@/data/squadWages';
import { getPremierLeagueClubs } from '@/utils/teamMapping';

/**
 * Check if a player exists in any squad across all clubs
 * @param playerName - The name of the player to search for
 * @returns Object with found status, player data, and club name
 */
export function findPlayerInSquads(playerName: string): {
  found: boolean;
  player?: any;
  club?: string;
} {
  const clubs = getPremierLeagueClubs();
  
  for (const club of clubs) {
    try {
      const squad = getSquad(club);
      const player = squad.find(p => 
        p.name.toLowerCase().trim() === playerName.toLowerCase().trim()
      );
      
      if (player) {
        return { found: true, player, club };
      }
    } catch (error) {
      // Continue searching other clubs
      continue;
    }
  }
  
  return { found: false };
}

/**
 * Normalize player name for comparison (remove accents, special chars)
 */
export function normalizePlayerName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}


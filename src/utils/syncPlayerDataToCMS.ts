/**
 * Utility function to sync player data from squadWages.ts to localStorage
 * This ensures that updated player profiles are available in the CMS for editing
 */

import { clubSquads } from '@/data/squadWages';
import type { Player } from '@/data/squadWages';

/**
 * Sync a specific player's data to localStorage for CMS editing
 * @param teamName - The team name (e.g., "Arsenal")
 * @param playerName - The player's name
 */
export const syncPlayerToCMS = (teamName: string, playerName: string): boolean => {
  try {
    const squad = clubSquads[teamName];
    if (!squad) {
      console.warn(`Team "${teamName}" not found in clubSquads`);
      return false;
    }

    const player = squad.find(p => p.name === playerName);
    if (!player) {
      console.warn(`Player "${playerName}" not found in ${teamName} squad`);
      return false;
    }

    // Get existing localStorage data
    const savedPlayers = JSON.parse(localStorage.getItem('playerEdits') || '{}');
    if (!savedPlayers[teamName]) {
      savedPlayers[teamName] = {};
    }

    // Merge player data, preserving any existing edits (like imageUrl)
    const existingData = savedPlayers[teamName][playerName] || {};
    
    savedPlayers[teamName][playerName] = {
      ...existingData, // Preserve existing edits (like imageUrl)
      position: player.position,
      age: player.age,
      shirtNumber: player.shirtNumber,
      weeklyWage: player.weeklyWage,
      yearlyWage: player.yearlyWage,
      bio: player.bio,
      seasonStats: player.seasonStats,
      transferHistory: player.transferHistory,
      previousMatches: player.previousMatches,
      injuries: player.injuries,
      // Keep existing imageUrl if present
      imageUrl: existingData.imageUrl || player.imageUrl
    };

    localStorage.setItem('playerEdits', JSON.stringify(savedPlayers));
    
    console.log(`✅ Synced ${playerName} (${teamName}) to CMS`);
    return true;
  } catch (error) {
    console.error(`❌ Error syncing ${playerName} (${teamName}) to CMS:`, error);
    return false;
  }
};

/**
 * Sync all players from a specific team to localStorage
 * @param teamName - The team name (e.g., "Arsenal")
 */
export const syncTeamToCMS = (teamName: string): number => {
  try {
    const squad = clubSquads[teamName];
    if (!squad) {
      console.warn(`Team "${teamName}" not found in clubSquads`);
      return 0;
    }

    const savedPlayers = JSON.parse(localStorage.getItem('playerEdits') || '{}');
    if (!savedPlayers[teamName]) {
      savedPlayers[teamName] = {};
    }

    let syncedCount = 0;
    for (const player of squad) {
      const existingData = savedPlayers[teamName][player.name] || {};
      
      savedPlayers[teamName][player.name] = {
        ...existingData,
        position: player.position,
        age: player.age,
        shirtNumber: player.shirtNumber,
        weeklyWage: player.weeklyWage,
        yearlyWage: player.yearlyWage,
        bio: player.bio,
        seasonStats: player.seasonStats,
        transferHistory: player.transferHistory,
        previousMatches: player.previousMatches,
        injuries: player.injuries,
        imageUrl: existingData.imageUrl || player.imageUrl
      };
      syncedCount++;
    }

    localStorage.setItem('playerEdits', JSON.stringify(savedPlayers));
    
    console.log(`✅ Synced ${syncedCount} players from ${teamName} to CMS`);
    return syncedCount;
  } catch (error) {
    console.error(`❌ Error syncing ${teamName} to CMS:`, error);
    return 0;
  }
};

/**
 * Sync all players from all teams to localStorage
 * Use with caution - this will update all player data in localStorage
 */
export const syncAllPlayersToCMS = (): { [teamName: string]: number } => {
  const results: { [teamName: string]: number } = {};
  
  for (const teamName in clubSquads) {
    const count = syncTeamToCMS(teamName);
    results[teamName] = count;
  }
  
  const total = Object.values(results).reduce((sum, count) => sum + count, 0);
  console.log(`✅ Synced ${total} total players from all teams to CMS`);
  
  return results;
};


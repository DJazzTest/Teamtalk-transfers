/**
 * Utility to load player data from JSON files
 */

import { PlayerSeasonStats } from '@/data/squadWages';

export interface PlayerDataFile {
  name: string;
  sofascoreId?: string;
  url?: string;
  bio?: {
    name?: string;
    height?: string;
    weight?: string;
    nationality?: string;
    dateOfBirth?: string;
    placeOfBirth?: string;
    preferredFoot?: string;
    position?: string;
    marketValue?: string;
    jerseyNumber?: number;
    age?: number;
    description?: string;
  };
  seasonStats?: Array<{
    competition: string;
    matches: number;
    minutes: number;
    goals?: number;
    assists?: number;
    cleanSheets?: number;
    goalsConceded?: number;
    saves?: number;
    yellowCards?: number;
    redCards?: number;
    rating?: number;
  }>;
  careerStats?: Array<{
    season: string;
    team: string;
    competition: string;
    matches: number;
    minutes: number;
    goals?: number;
    assists?: number;
    cleanSheets?: number;
    goalsConceded?: number;
  }>;
}

/**
 * Load player data from a JSON file
 */
export async function loadPlayerDataFromFile(playerName: string): Promise<PlayerDataFile | null> {
  try {
    // Convert player name to filename format
    const filename = playerName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    const filePath = `/data/players/${filename}.json`;
    
    const response = await fetch(filePath);
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error loading player data for ${playerName}:`, error);
    return null;
  }
}

/**
 * Convert player data file format to our internal format
 */
export function convertPlayerDataToInternal(
  fileData: PlayerDataFile,
  currentSeason?: string
): {
  bio?: any;
  seasonStats?: PlayerSeasonStats;
  age?: number;
  shirtNumber?: number;
} {
  const result: {
    bio?: any;
    seasonStats?: PlayerSeasonStats;
    age?: number;
    shirtNumber?: number;
  } = {};

  // Convert bio
  if (fileData.bio) {
    result.bio = { ...fileData.bio };
    if (fileData.bio.age) {
      result.age = fileData.bio.age;
    }
    if (fileData.bio.jerseyNumber) {
      result.shirtNumber = fileData.bio.jerseyNumber;
    }
  }

  // Convert season stats
  if (fileData.seasonStats && fileData.seasonStats.length > 0) {
    const now = new Date();
    const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
    const season = currentSeason || `${year}-${(year + 1).toString().slice(-2)}`;
    
    result.seasonStats = {
      season,
      competitions: fileData.seasonStats.map(stat => ({
        competition: stat.competition || 'Unknown',
        matches: stat.matches || 0,
        minutes: stat.minutes || 0,
        goals: stat.goals,
        assists: stat.assists,
        cleanSheets: stat.cleanSheets,
        goalsConceded: stat.goalsConceded
      }))
    };
  }

  return result;
}


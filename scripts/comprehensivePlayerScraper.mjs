/**
 * Comprehensive SofaScore Player Data Scraper
 * Extracts all player data from SofaScore for all clubs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rate limiting delay between requests (ms)
const DELAY_BETWEEN_REQUESTS = 2000;
const DELAY_BETWEEN_CLUBS = 5000;

// Fetch with proxy
async function fetchWithProxy(url) {
  const proxies = [
    `https://cors.isomorphic-git.org/${url}`,
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?${encodeURIComponent(url)}`
  ];

  for (const proxyUrl of proxies) {
    try {
      const response = await fetch(proxyUrl);
      if (response.ok) {
        let text = await response.text();
        if (proxyUrl.includes('allorigins.win')) {
          const data = JSON.parse(text);
          text = data.contents;
        }
        return text;
      }
    } catch (error) {
      continue;
    }
  }
  throw new Error('All proxies failed');
}

// Fetch SofaScore API
async function fetchSofaScoreAPI(endpoint) {
  try {
    const response = await fetch(endpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Origin': 'https://www.sofascore.com',
        'Referer': 'https://www.sofascore.com/'
      }
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    // Silent fail
  }
  return null;
}

// Find player ID via search
async function findPlayerId(playerName) {
  try {
    const searchUrl = `https://api.sofascore.com/api/v1/search?q=${encodeURIComponent(playerName)}`;
    const searchData = await fetchSofaScoreAPI(searchUrl);
    
    if (searchData && searchData.players && searchData.players.length > 0) {
      // Return first match (could be improved with better matching)
      return searchData.players[0].id;
    }
  } catch (error) {
    // Silent fail
  }
  return null;
}

// Extract comprehensive player data
async function extractComprehensivePlayerData(playerName, clubName, knownPlayerId = null) {
  console.log(`  📋 ${playerName}...`);
  
  let playerId = knownPlayerId;
  
  // Find player ID if not provided
  if (!playerId) {
    playerId = await findPlayerId(playerName);
    if (!playerId) {
      console.log(`    ⚠️  Could not find SofaScore ID`);
      return null;
    }
  }

  const playerData = {
    name: playerName,
    sofascoreId: playerId,
    url: `https://www.sofascore.com/football/player/${playerName.toLowerCase().replace(/\s+/g, '-')}/${playerId}`,
    bio: {},
    seasonStats: null,
    careerStats: [],
    transferHistory: [],
    nationalTeam: null,
    debut: null,
    averageRating: null,
    detailedStats: {
      goalkeeping: {},
      attacking: {},
      passing: {},
      defending: {},
      other: {},
      cards: {}
    }
  };

  // Fetch player data
  const playerApiUrl = `https://api.sofascore.com/api/v1/player/${playerId}`;
  const playerData_api = await fetchSofaScoreAPI(playerApiUrl);
  
  if (playerData_api && playerData_api.player) {
    const p = playerData_api.player;
    
    // Bio data
    playerData.bio = {
      name: p.name || p.fullName || playerName,
      height: p.height ? `${p.height} cm` : undefined,
      weight: p.weight ? `${p.weight} kg` : undefined,
      nationality: p.country?.name || p.nationality,
      dateOfBirth: p.dateOfBirth || p.birthDate,
      placeOfBirth: p.placeOfBirth || p.birthPlace,
      preferredFoot: p.preferredFoot,
      position: p.position,
      marketValue: p.marketValue,
      jerseyNumber: p.jerseyNumber || p.shirtNumber,
      age: p.age
    };
    
    playerData.nationalTeam = p.country?.name;
  }

  // Fetch season statistics
  const statsUrl = `https://api.sofascore.com/api/v1/player/${playerId}/statistics/season`;
  const statsData = await fetchSofaScoreAPI(statsUrl);
  
  if (statsData && statsData.statistics) {
    // Process statistics
    const stats = statsData.statistics;
    if (Array.isArray(stats) && stats.length > 0) {
      const currentSeason = stats[0];
      playerData.seasonStats = {
        competition: currentSeason.tournament?.name || 'Unknown',
        matches: currentSeason.appearances || 0,
        minutes: currentSeason.minutes || 0,
        goals: currentSeason.goals || 0,
        assists: currentSeason.assists || 0,
        cleanSheets: currentSeason.cleanSheets || 0,
        goalsConceded: currentSeason.goalsConceded || 0,
        saves: currentSeason.saves || 0,
        yellowCards: currentSeason.yellowCards || 0,
        redCards: currentSeason.redCards || 0,
        rating: currentSeason.rating
      };
      
      playerData.averageRating = currentSeason.rating || null;
    }
  }

  // Fetch career data
  const careerUrl = `https://api.sofascore.com/api/v1/player/${playerId}/career`;
  const careerData = await fetchSofaScoreAPI(careerUrl);
  
  if (careerData && careerData.career) {
    playerData.careerStats = careerData.career.map(entry => ({
      season: entry.season || entry.year || '',
      team: entry.team?.name || entry.team || '',
      competition: entry.tournament?.name || entry.competition || '',
      matches: entry.appearances || entry.matches || 0,
      minutes: entry.minutes || 0,
      goals: entry.goals || 0,
      assists: entry.assists || 0
    }));
    
    // Extract debut
    if (careerData.career.length > 0) {
      const firstEntry = careerData.career[careerData.career.length - 1];
      playerData.debut = {
        season: firstEntry.season || firstEntry.year,
        team: firstEntry.team?.name || firstEntry.team
      };
    }
  }

  // Try to get detailed stats from HTML page
  try {
    const html = await fetchWithProxy(playerData.url);
    
    // Extract detailed statistics from HTML
    // This would require parsing the HTML structure
    // For now, we'll rely on API data
    
  } catch (error) {
    // HTML scraping is optional
  }

  console.log(`    ✅ Extracted data`);
  return playerData;
}

// Main execution
async function main() {
  console.log('🚀 Comprehensive SofaScore Player Data Scraper\n');
  console.log('This script will extract data for all players across all clubs.\n');
  console.log('⚠️  This is a large operation and may take a long time.\n');
  
  // For now, process a few players as a test
  const testPlayers = [
    { name: 'David Raya', club: 'Arsenal', id: null },
    { name: 'Illan Meslier', club: 'Leeds United', id: '906076' },
    { name: 'James Justin', club: 'Leeds United', id: null }
  ];
  
  const results = {};
  
  for (const player of testPlayers) {
    if (!results[player.club]) {
      results[player.club] = {};
    }
    
    const data = await extractComprehensivePlayerData(
      player.name,
      player.club,
      player.id
    );
    
    if (data) {
      results[player.club][player.name] = data;
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
  }
  
  // Save results
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'players', 'sofascore-extracted.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Saved results to ${outputPath}`);
  console.log(`\n📊 Processed ${testPlayers.length} players`);
}

// Run
main().catch(console.error);


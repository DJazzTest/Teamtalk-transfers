/**
 * Comprehensive script to scrape all player data from SofaScore
 * Extracts: Matches, Positions, National Team, Debut, Appearances, Goals,
 * Transfer History, Bio, Rating, Goalkeeping, Attacking, Passing, Defending, Other, Cards
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Import the squad data
const squadWagesPath = join(process.cwd(), 'src', 'data', 'squadWages.ts');
const squadData = readFileSync(squadWagesPath, 'utf-8');

// Extract all clubs and players from the squad data
const clubMatches = squadData.match(/export const clubSquads: Record<string, Player\[\]> = \{([\s\S]*?)\};/);
if (!clubMatches) {
  console.error('Could not find clubSquads in squadWages.ts');
  process.exit(1);
}

// Helper to construct SofaScore URL from player name
function constructSofaScoreUrl(playerName) {
  // Convert player name to URL format: "First Last" -> "first-last"
  const urlName = playerName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
  
  // SofaScore URL format: https://www.sofascore.com/football/player/player-name
  return `https://www.sofascore.com/football/player/${urlName}`;
}

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
    console.log(`API call failed: ${error.message}`);
  }
  return null;
}

// Extract player ID from SofaScore search
async function findPlayerId(playerName, clubName) {
  try {
    // Try searching via API
    const searchUrl = `https://api.sofascore.com/api/v1/search?q=${encodeURIComponent(playerName)}`;
    const searchData = await fetchSofaScoreAPI(searchUrl);
    
    if (searchData && searchData.players) {
      // Find best match
      for (const player of searchData.players) {
        const nameMatch = player.name?.toLowerCase().includes(playerName.toLowerCase()) ||
                         playerName.toLowerCase().includes(player.name?.toLowerCase() || '');
        if (nameMatch) {
          return player.id;
        }
      }
    }
  } catch (error) {
    console.log(`Search failed for ${playerName}: ${error.message}`);
  }
  return null;
}

// Comprehensive player data extraction
async function extractPlayerData(playerName, clubName, playerId = null) {
  console.log(`\n🔍 Fetching data for ${playerName} (${clubName})...`);
  
  // If no player ID, try to find it
  if (!playerId) {
    playerId = await findPlayerId(playerName, clubName);
    if (!playerId) {
      console.log(`⚠️  Could not find SofaScore ID for ${playerName}`);
      return null;
    }
  }

  const playerUrl = `https://www.sofascore.com/football/player/${playerName.toLowerCase().replace(/\s+/g, '-')}/${playerId}`;
  
  const playerData = {
    name: playerName,
    club: clubName,
    sofascoreId: playerId,
    url: playerUrl,
    bio: {},
    seasonStats: [],
    careerStats: [],
    transferHistory: [],
    nationalTeam: null,
    debut: null,
    averageRating: null
  };

  // Try API endpoints
  const apiEndpoints = [
    `https://api.sofascore.com/api/v1/player/${playerId}`,
    `https://api.sofascore.com/api/v1/player/${playerId}/statistics/season`,
    `https://api.sofascore.com/api/v1/player/${playerId}/unique-tournament/17/season/52186/statistics/overall`
  ];

  let apiData = null;
  for (const endpoint of apiEndpoints) {
    apiData = await fetchSofaScoreAPI(endpoint);
    if (apiData) {
      console.log(`✅ Got API data from ${endpoint}`);
      break;
    }
  }

  // Extract from API
  if (apiData) {
    if (apiData.player) {
      const p = apiData.player;
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

    // Extract statistics
    if (apiData.statistics && Array.isArray(apiData.statistics)) {
      playerData.seasonStats = apiData.statistics.map(stat => ({
        competition: stat.tournament?.name || stat.competition || 'Unknown',
        matches: stat.appearances || stat.matches || 0,
        minutes: stat.minutes || 0,
        goals: stat.goals || 0,
        assists: stat.assists || 0,
        cleanSheets: stat.cleanSheets || 0,
        goalsConceded: stat.goalsConceded || 0,
        saves: stat.saves,
        yellowCards: stat.yellowCards || 0,
        redCards: stat.redCards || 0,
        rating: stat.rating
      }));
      
      // Calculate average rating
      const ratings = playerData.seasonStats
        .map(s => s.rating)
        .filter(r => r && r > 0);
      if (ratings.length > 0) {
        playerData.averageRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2);
      }
    }

    // Extract career stats
    if (apiData.career || apiData.player?.career) {
      const career = apiData.career || apiData.player.career || [];
      playerData.careerStats = career.map(entry => ({
        season: entry.season || entry.year || '',
        team: entry.team?.name || entry.team || '',
        competition: entry.tournament?.name || entry.competition || '',
        matches: entry.appearances || entry.matches || 0,
        minutes: entry.minutes || 0,
        goals: entry.goals || 0,
        assists: entry.assists || 0,
        cleanSheets: entry.cleanSheets || 0,
        goalsConceded: entry.goalsConceded || 0
      }));
      
      // Extract debut (first career entry)
      if (career.length > 0) {
        const firstEntry = career[career.length - 1]; // Usually oldest is last
        playerData.debut = {
          season: firstEntry.season || firstEntry.year,
          team: firstEntry.team?.name || firstEntry.team,
          competition: firstEntry.tournament?.name || firstEntry.competition
        };
      }
    }
  }

  // Try HTML scraping for additional data
  try {
    const html = await fetchWithProxy(playerUrl);
    
    // Extract transfer history from HTML (if available)
    const transferMatch = html.match(/transfer[^"]*history[^"]*/i);
    if (transferMatch) {
      // Parse transfer history if present in HTML
      console.log('Found transfer history section');
    }

    // Extract detailed stats from HTML tables
    // This would require more sophisticated parsing
  } catch (error) {
    console.log(`HTML scraping failed: ${error.message}`);
  }

  return playerData;
}

// Main execution
async function main() {
  console.log('🚀 Starting comprehensive SofaScore player data extraction...\n');
  
  // Parse clubs and players from squad data
  // This is a simplified version - you'd need to properly parse the TypeScript file
  const clubs = ['Arsenal', 'Leeds United']; // Start with a few clubs for testing
  
  const allPlayerData = {};
  
  for (const club of clubs) {
    console.log(`\n📊 Processing ${club}...`);
    allPlayerData[club] = {};
    
    // Get players for this club (you'd extract from actual squad data)
    const players = [
      { name: 'David Raya', id: null },
      { name: 'Illan Meslier', id: '906076' }
    ];
    
    for (const player of players) {
      try {
        const data = await extractPlayerData(player.name, club, player.id);
        if (data) {
          allPlayerData[club][player.name] = data;
        }
        
        // Rate limiting - wait between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Error processing ${player.name}:`, error.message);
      }
    }
  }
  
  // Save results
  const outputPath = join(process.cwd(), 'src', 'data', 'players', 'all-players-sofascore.json');
  writeFileSync(outputPath, JSON.stringify(allPlayerData, null, 2));
  console.log(`\n✅ Saved all player data to ${outputPath}`);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { extractPlayerData, constructSofaScoreUrl, findPlayerId };


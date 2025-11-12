/**
 * Arsenal Player Data Scraper from SofaScore
 * Extracts comprehensive data for all Arsenal players
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DELAY_BETWEEN_REQUESTS = 2000; // 2 seconds
const MAX_RETRIES = 3;

// Fetch with proxy
async function fetchWithProxy(url, retries = MAX_RETRIES) {
  const proxies = [
    `https://cors.isomorphic-git.org/${url}`,
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?${encodeURIComponent(url)}`
  ];

  for (let attempt = 0; attempt < retries; attempt++) {
    for (const proxyUrl of proxies) {
      try {
        const response = await fetch(proxyUrl, { timeout: 15000 });
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
    if (attempt < retries - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  throw new Error('All proxies failed');
}

// Fetch SofaScore API
async function fetchSofaScoreAPI(endpoint, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(endpoint, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Origin': 'https://www.sofascore.com',
          'Referer': 'https://www.sofascore.com/'
        },
        timeout: 15000
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }
  return null;
}

// Find player ID via search
async function findPlayerId(playerName, clubName = 'Arsenal') {
  try {
    const searchUrl = `https://api.sofascore.com/api/v1/search?q=${encodeURIComponent(playerName)}`;
    const searchData = await fetchSofaScoreAPI(searchUrl);
    
    if (searchData && searchData.players && searchData.players.length > 0) {
      // Try to find Arsenal player
      for (const player of searchData.players) {
        const nameMatch = player.name?.toLowerCase().includes(playerName.toLowerCase()) ||
                         player.shortName?.toLowerCase().includes(playerName.toLowerCase());
        if (nameMatch) {
          // Check if player is at Arsenal
          const team = player.team?.name || player.currentTeam?.name || '';
          if (team.toLowerCase().includes('arsenal') || !team) {
            return player.id;
          }
        }
      }
      // Fallback to first match
      return searchData.players[0].id;
    }
  } catch (error) {
    console.error(`Error finding player ID for ${playerName}:`, error.message);
  }
  return null;
}

// Extract comprehensive player data
async function extractPlayerData(playerName, knownPlayerId = null) {
  console.log(`\n🔍 Processing ${playerName}...`);
  
  let playerId = knownPlayerId;
  
  if (!playerId) {
    playerId = await findPlayerId(playerName);
    if (!playerId) {
      console.log(`  ⚠️  Could not find SofaScore ID`);
      return null;
    }
    console.log(`  ✅ Found ID: ${playerId}`);
  }

  const playerData = {
    name: playerName,
    sofascoreId: playerId,
    url: `https://www.sofascore.com/football/player/${playerName.toLowerCase().replace(/\s+/g, '-')}/${playerId}`,
    bio: {},
    seasonStats: null,
    transferHistory: [],
    previousMatches: []
  };

  // Fetch player basic info
  const playerApiUrl = `https://api.sofascore.com/api/v1/player/${playerId}`;
  const playerInfo = await fetchSofaScoreAPI(playerApiUrl);
  
  if (playerInfo && playerInfo.player) {
    const p = playerInfo.player;
    playerData.bio = {
      name: p.name || p.fullName || playerName,
      height: p.height ? `${p.height} cm` : undefined,
      nationality: p.country?.name || p.nationality,
      dateOfBirth: p.dateOfBirth || p.birthDate,
      preferredFoot: p.preferredFoot,
      position: p.position,
      age: p.age,
      contractUntil: p.contractUntil,
      nationalTeam: p.country?.name,
      nationalTeamAppearances: p.nationalTeamAppearances,
      nationalTeamGoals: p.nationalTeamGoals,
      nationalTeamDebut: p.nationalTeamDebut,
      description: `${p.name || playerName} is ${p.age || 'N/A'} years old${p.dateOfBirth ? ` (${new Date(p.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })})` : ''}, ${p.height ? `${p.height} cm` : 'N/A'} tall and plays for Arsenal. ${p.preferredFoot ? `${p.name || playerName} prefers to play with ${p.preferredFoot.toLowerCase()} foot.` : ''} ${p.jerseyNumber ? `His jersey number is ${p.jerseyNumber}.` : ''}`
    };
  }

  // Fetch season statistics - try Premier League first
  const premierLeagueStatsUrl = `https://api.sofascore.com/api/v1/player/${playerId}/unique-tournament/17/season/52186/statistics/overall`;
  let statsData = await fetchSofaScoreAPI(premierLeagueStatsUrl);
  
  // Fallback to general season stats
  if (!statsData) {
    const seasonStatsUrl = `https://api.sofascore.com/api/v1/player/${playerId}/statistics/season`;
    statsData = await fetchSofaScoreAPI(seasonStatsUrl);
  }

  if (statsData) {
    // Process statistics - structure varies
    let stats = null;
    if (statsData.statistics) {
      stats = Array.isArray(statsData.statistics) ? statsData.statistics[0] : statsData.statistics;
    } else if (statsData.statisticsGroups) {
      stats = statsData;
    }

    if (stats) {
      playerData.seasonStats = {
        season: '2025-26',
        competitions: [{
          competition: 'Premier League',
          // Extract all available stats
          matches: stats.appearances || stats.matches || 0,
          minutes: stats.minutes || 0,
          appearances: stats.appearances || 0,
          started: stats.started || 0,
          minutesPerGame: stats.minutesPerGame || (stats.minutes && stats.appearances ? Math.round(stats.minutes / stats.appearances) : 0),
          totalMinutes: stats.minutes || 0,
          goals: stats.goals || 0,
          assists: stats.assists || 0,
          cleanSheets: stats.cleanSheets || 0,
          goalsConceded: stats.goalsConceded || 0,
          averageRating: stats.rating || stats.averageRating || null,
          // Goalkeeping
          goalsConcededPerGame: stats.goalsConcededPerGame || (stats.goalsConceded && stats.appearances ? (stats.goalsConceded / stats.appearances).toFixed(1) : 0),
          savesPerGame: stats.savesPerGame || 0,
          saves: stats.saves || 0,
          // Attacking
          goalsPerGame: stats.goalsPerGame || (stats.goals && stats.appearances ? (stats.goals / stats.appearances).toFixed(2) : 0),
          totalShots: stats.totalShots || stats.shots || 0,
          // Passing
          touches: stats.touches || 0,
          accuratePasses: stats.accuratePasses || stats.passes || 0,
          // Defending
          interceptions: stats.interceptions || 0,
          tacklesPerGame: stats.tacklesPerGame || 0,
          // Cards
          yellowCards: stats.yellowCards || 0,
          redCards: stats.redCards || 0
        }]
      };
    }
  }

  // Try to fetch HTML page for more detailed stats
  try {
    const html = await fetchWithProxy(playerData.url);
    // Parse HTML for detailed stats (this would need more sophisticated parsing)
    // For now, we'll use what we got from API
  } catch (error) {
    console.log(`  ⚠️  Could not fetch HTML page`);
  }

  await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
  return playerData;
}

// Main function
async function scrapeArsenalPlayers() {
  console.log('🚀 Starting Arsenal player data scrape from SofaScore...\n');

  // Read Arsenal squad from squadWages.ts
  const squadWagesPath = path.join(__dirname, '..', 'src', 'data', 'squadWages.ts');
  const squadData = fs.readFileSync(squadWagesPath, 'utf-8');

  // Extract Arsenal players
  const arsenalMatch = squadData.match(/'Arsenal':\s*\[([\s\S]*?)(?=\s*'Aston Villa'|$)/);
  if (!arsenalMatch) {
    console.error('Could not find Arsenal squad in squadWages.ts');
    return;
  }

  // Extract player names (simple regex match for name field)
  const playerNameMatches = arsenalMatch[1].matchAll(/name:\s*['"]([^'"]+)['"]/g);
  const playerNames = Array.from(playerNameMatches, m => m[1]);

  console.log(`Found ${playerNames.length} Arsenal players to process\n`);

  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (const playerName of playerNames) {
    try {
      const playerData = await extractPlayerData(playerName);
      if (playerData) {
        results.push(playerData);
        successCount++;
        console.log(`  ✅ Successfully extracted data for ${playerName}`);
      } else {
        failCount++;
        console.log(`  ❌ Failed to extract data for ${playerName}`);
      }
    } catch (error) {
      failCount++;
      console.error(`  ❌ Error processing ${playerName}:`, error.message);
    }
  }

  // Save results to JSON file
  const outputPath = path.join(__dirname, '..', 'arsenal-players-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log(`\n✅ Scraping complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log(`   Results saved to: ${outputPath}`);
  console.log(`\n📝 Next step: Review the JSON file and update squadWages.ts with the extracted data`);
}

// Run the scraper
scrapeArsenalPlayers().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});


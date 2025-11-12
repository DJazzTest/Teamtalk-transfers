/**
 * Automated Comprehensive SofaScore Player Data Scraper
 * Processes ALL players from ALL clubs and extracts complete data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DELAY_BETWEEN_REQUESTS = 2000; // 2 seconds between player requests
const DELAY_BETWEEN_CLUBS = 5000; // 5 seconds between clubs
const MAX_RETRIES = 3;
const PROGRESS_FILE = path.join(__dirname, '..', 'scraper-progress.json');

// Load progress if exists
let progress = {};
if (fs.existsSync(PROGRESS_FILE)) {
  try {
    progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    console.log('📂 Loaded previous progress');
  } catch (e) {
    console.log('⚠️  Could not load progress file');
  }
}

// Save progress
function saveProgress() {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

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
        const response = await fetch(proxyUrl, { timeout: 10000 });
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
        timeout: 10000
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
async function findPlayerId(playerName, clubName) {
  try {
    const searchUrl = `https://api.sofascore.com/api/v1/search?q=${encodeURIComponent(playerName)}`;
    const searchData = await fetchSofaScoreAPI(searchUrl);
    
    if (searchData && searchData.players && searchData.players.length > 0) {
      // Try to match by name and potentially club
      for (const player of searchData.players) {
        const nameMatch = player.name?.toLowerCase().includes(playerName.toLowerCase()) ||
                         playerName.toLowerCase().includes(player.name?.toLowerCase() || '');
        if (nameMatch) {
          return player.id;
        }
      }
      // Return first if no exact match
      return searchData.players[0].id;
    }
  } catch (error) {
    // Silent fail
  }
  return null;
}

// Extract comprehensive player data from SofaScore
async function extractComprehensivePlayerData(playerName, clubName, knownPlayerId = null) {
  const cacheKey = `${clubName}:${playerName}`;
  
  // Check if already processed
  if (progress[cacheKey] && progress[cacheKey].completed) {
    console.log(`  ⏭️  ${playerName} (cached)`);
    return progress[cacheKey].data;
  }
  
  console.log(`  📋 ${playerName}...`);
  
  let playerId = knownPlayerId;
  
  // Find player ID if not provided
  if (!playerId) {
    playerId = await findPlayerId(playerName, clubName);
    if (!playerId) {
      console.log(`    ⚠️  Could not find SofaScore ID`);
      progress[cacheKey] = { completed: false, error: 'ID not found' };
      saveProgress();
      return null;
    }
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit
  }

  const playerData = {
    name: playerName,
    sofascoreId: playerId,
    url: `https://www.sofascore.com/football/player/${playerName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}/${playerId}`,
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

  try {
    // Fetch player basic info
    const playerApiUrl = `https://api.sofascore.com/api/v1/player/${playerId}`;
    const playerData_api = await fetchSofaScoreAPI(playerApiUrl);
    
    if (playerData_api && playerData_api.player) {
      const p = playerData_api.player;
      
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
        age: p.age,
        description: p.description
      };
      
      playerData.nationalTeam = p.country?.name;
    }

    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit

    // Fetch season statistics
    const statsUrl = `https://api.sofascore.com/api/v1/player/${playerId}/statistics/season`;
    const statsData = await fetchSofaScoreAPI(statsUrl);
    
    if (statsData && statsData.statistics && statsData.statistics.length > 0) {
      const currentSeason = statsData.statistics[0];
      
      // Calculate total appearances and goals across all competitions
      let totalAppearances = 0;
      let totalGoals = 0;
      let totalAssists = 0;
      let totalMinutes = 0;
      let totalCleanSheets = 0;
      let totalGoalsConceded = 0;
      let totalSaves = 0;
      let totalYellowCards = 0;
      let totalRedCards = 0;
      const ratings = [];
      
      statsData.statistics.forEach(stat => {
        totalAppearances += stat.appearances || 0;
        totalGoals += stat.goals || 0;
        totalAssists += stat.assists || 0;
        totalMinutes += stat.minutes || 0;
        totalCleanSheets += stat.cleanSheets || 0;
        totalGoalsConceded += stat.goalsConceded || 0;
        totalSaves += stat.saves || 0;
        totalYellowCards += stat.yellowCards || 0;
        totalRedCards += stat.redCards || 0;
        if (stat.rating) ratings.push(stat.rating);
      });
      
      playerData.seasonStats = {
        appearances: totalAppearances,
        goals: totalGoals,
        assists: totalAssists,
        minutes: totalMinutes,
        cleanSheets: totalCleanSheets,
        goalsConceded: totalGoalsConceded,
        saves: totalSaves,
        yellowCards: totalYellowCards,
        redCards: totalRedCards
      };
      
      if (ratings.length > 0) {
        playerData.averageRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit

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
        assists: entry.assists || 0,
        cleanSheets: entry.cleanSheets || 0,
        goalsConceded: entry.goalsConceded || 0
      }));
      
      // Extract debut (first career entry - usually last in array)
      if (careerData.career.length > 0) {
        const sortedCareer = [...careerData.career].sort((a, b) => {
          const yearA = parseInt(a.season || a.year || '0');
          const yearB = parseInt(b.season || b.year || '0');
          return yearA - yearB;
        });
        const firstEntry = sortedCareer[0];
        playerData.debut = {
          season: firstEntry.season || firstEntry.year,
          team: firstEntry.team?.name || firstEntry.team,
          competition: firstEntry.tournament?.name || firstEntry.competition
        };
      }
      
      // Extract transfer history from career moves
      if (careerData.career.length > 1) {
        const transfers = [];
        for (let i = 1; i < careerData.career.length; i++) {
          const prev = careerData.career[i - 1];
          const curr = careerData.career[i];
          if (prev.team?.name !== curr.team?.name) {
            transfers.push({
              date: curr.season || curr.year || '',
              from: prev.team?.name || prev.team || '',
              to: curr.team?.name || curr.team || '',
              fee: 'Undisclosed',
              type: 'Transfer'
            });
          }
        }
        playerData.transferHistory = transfers.reverse(); // Most recent first
      }
    }

    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit

    // Try to get detailed stats from HTML page
    try {
      const html = await fetchWithProxy(playerData.url);
      
      // Extract detailed statistics from HTML
      // Look for stats tables/sections
      const statsSections = html.match(/<section[^>]*class="[^"]*stat[^"]*"[^>]*>[\s\S]*?<\/section>/gi);
      if (statsSections) {
        // Parse detailed stats if available
        // This would require more specific HTML parsing based on SofaScore's structure
      }
      
    } catch (error) {
      // HTML scraping is optional, continue without it
    }

    console.log(`    ✅ Extracted data (Rating: ${playerData.averageRating || 'N/A'})`);
    
    // Save to progress
    progress[cacheKey] = { completed: true, data: playerData };
    saveProgress();
    
    return playerData;
    
  } catch (error) {
    console.log(`    ❌ Error: ${error.message}`);
    progress[cacheKey] = { completed: false, error: error.message };
    saveProgress();
    return null;
  }
}

// Parse players from squadWages.ts - improved version
function parsePlayersFromSquadFile() {
  const squadFile = path.join(__dirname, '..', 'src', 'data', 'squadWages.ts');
  const content = fs.readFileSync(squadFile, 'utf-8');
  
  const clubs = {};
  
  // Split by club entries - look for pattern: 'Club Name': [
  const clubPattern = /['"]([^'"]+)['"]:\s*\[/g;
  let lastIndex = 0;
  const clubMatches = [];
  
  let match;
  while ((match = clubPattern.exec(content)) !== null) {
    clubMatches.push({
      name: match[1],
      startIndex: match.index
    });
  }
  
  // For each club, find its closing bracket
  for (let i = 0; i < clubMatches.length; i++) {
    const club = clubMatches[i];
    const nextClub = clubMatches[i + 1];
    const startIdx = club.startIndex;
    const endIdx = nextClub ? nextClub.startIndex : content.length;
    
    let bracketCount = 0;
    let inString = false;
    let stringChar = '';
    let clubContent = '';
    
    // Extract club content by matching brackets
    for (let j = startIdx; j < endIdx; j++) {
      const char = content[j];
      const prevChar = j > 0 ? content[j - 1] : '';
      
      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar && prevChar !== '\\') {
        inString = false;
      }
      
      if (!inString) {
        if (char === '[') bracketCount++;
        if (char === ']') bracketCount--;
      }
      
      clubContent += char;
      
      if (!inString && bracketCount === 0 && char === ']') {
        break;
      }
    }
    
    // Extract players from club content
    const players = [];
    
    // Match player objects - handle nested objects
    const playerPattern = /\{\s*name:\s*['"]([^'"]+)['"]/g;
    let playerMatch;
    const playerIndices = [];
    
    while ((playerMatch = playerPattern.exec(clubContent)) !== null) {
      playerIndices.push({
        name: playerMatch[1],
        startIndex: playerMatch.index
      });
    }
    
    // Extract each player's full object
    for (let p = 0; p < playerIndices.length; p++) {
      const player = playerIndices[p];
      const nextPlayer = playerIndices[p + 1];
      
      let playerStart = player.startIndex;
      let playerEnd = nextPlayer ? nextPlayer.startIndex : clubContent.length;
      
      // Find the closing brace for this player
      let braceCount = 0;
      let inString2 = false;
      let stringChar2 = '';
      let foundStart = false;
      
      for (let k = playerStart; k < playerEnd; k++) {
        const char = clubContent[k];
        const prevChar = k > 0 ? clubContent[k - 1] : '';
        
        if (!inString2 && (char === '"' || char === "'")) {
          inString2 = true;
          stringChar2 = char;
        } else if (inString2 && char === stringChar2 && prevChar !== '\\') {
          inString2 = false;
        }
        
        if (!inString2) {
          if (char === '{') {
            braceCount++;
            foundStart = true;
          }
          if (char === '}') {
            braceCount--;
            if (foundStart && braceCount === 0) {
              playerEnd = k + 1;
              break;
            }
          }
        }
      }
      
      const playerContent = clubContent.substring(playerStart, playerEnd);
      
      // Extract properties
      const shirtMatch = playerContent.match(/shirtNumber:\s*(\d+)/);
      const positionMatch = playerContent.match(/position:\s*['"]([^'"]+)['"]/);
      
      players.push({
        name: player.name,
        shirtNumber: shirtMatch ? parseInt(shirtMatch[1]) : null,
        position: positionMatch ? positionMatch[1] : null
      });
    }
    
    if (players.length > 0) {
      clubs[club.name] = players;
    }
  }
  
  return clubs;
}

// Update squadWages.ts with scraped data
function updateSquadFileWithData(clubsData) {
  const squadFile = path.join(__dirname, '..', 'src', 'data', 'squadWages.ts');
  let content = fs.readFileSync(squadFile, 'utf-8');
  
  // For each club and player, update their data
  for (const [clubName, playersData] of Object.entries(clubsData)) {
    for (const [playerName, playerData] of Object.entries(playersData)) {
      if (!playerData) continue;
      
      // Find the player in the file and update their entry
      const playerPattern = new RegExp(
        `(\\{\\s*name:\\s*['"]${playerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"][\\s\\S]*?)(\\})`,
        'g'
      );
      
      let updated = false;
      content = content.replace(playerPattern, (match, before, closing) => {
        if (updated) return match;
        
        // Build updated player object
        let updatedPlayer = before;
        
        // Add/update bio
        if (playerData.bio) {
          if (!updatedPlayer.includes('bio:')) {
            updatedPlayer += '\n      bio: {';
            if (playerData.bio.nationality) updatedPlayer += `\n        nationality: '${playerData.bio.nationality}',`;
            if (playerData.bio.dateOfBirth) updatedPlayer += `\n        dateOfBirth: '${playerData.bio.dateOfBirth}',`;
            if (playerData.bio.placeOfBirth) updatedPlayer += `\n        placeOfBirth: '${playerData.bio.placeOfBirth}',`;
            if (playerData.bio.preferredFoot) updatedPlayer += `\n        preferredFoot: '${playerData.bio.preferredFoot}',`;
            if (playerData.bio.height) updatedPlayer += `\n        height: '${playerData.bio.height}',`;
            if (playerData.bio.weight) updatedPlayer += `\n        weight: '${playerData.bio.weight}',`;
            updatedPlayer += '\n      },';
          }
        }
        
        // Add/update age
        if (playerData.bio && playerData.bio.age && !updatedPlayer.includes('age:')) {
          updatedPlayer = updatedPlayer.replace(/(name:\s*['"][^'"]+['"])/, `$1,\n      age: ${playerData.bio.age}`);
        }
        
        // Add transfer history if not present
        if (playerData.transferHistory && playerData.transferHistory.length > 0 && !updatedPlayer.includes('transferHistory:')) {
          updatedPlayer += '\n      transferHistory: [';
          playerData.transferHistory.forEach(transfer => {
            updatedPlayer += `\n        {`;
            updatedPlayer += `\n          date: '${transfer.date}',`;
            if (transfer.from) updatedPlayer += `\n          from: '${transfer.from}',`;
            updatedPlayer += `\n          to: '${transfer.to}',`;
            updatedPlayer += `\n          fee: '${transfer.fee}',`;
            updatedPlayer += `\n          type: '${transfer.type}'`;
            updatedPlayer += `\n        },`;
          });
          updatedPlayer += '\n      ],';
        }
        
        updated = true;
        return updatedPlayer + closing;
      });
    }
  }
  
  // Write updated file
  fs.writeFileSync(squadFile, content);
  console.log('\n✅ Updated squadWages.ts with scraped data');
}

// Main execution
async function main() {
  console.log('🚀 Automated Comprehensive SofaScore Player Data Scraper\n');
  console.log('This will process ALL players from ALL clubs.\n');
  console.log('⚠️  This is a large operation and will take significant time.\n');
  
  // Parse all players from squad file
  console.log('📖 Parsing players from squadWages.ts...');
  const clubs = parsePlayersFromSquadFile();
  console.log(`✅ Found ${Object.keys(clubs).length} clubs with players\n`);
  
  const allResults = {};
  let totalProcessed = 0;
  let totalPlayers = 0;
  
  // Count total players
  for (const players of Object.values(clubs)) {
    totalPlayers += players.length;
  }
  
  console.log(`📊 Total players to process: ${totalPlayers}\n`);
  console.log('Starting extraction...\n');
  
  // Process each club
  for (const [clubName, players] of Object.entries(clubs)) {
    console.log(`\n🏆 Processing ${clubName} (${players.length} players)...`);
    
    if (!allResults[clubName]) {
      allResults[clubName] = {};
    }
    
    // Process each player
    for (const player of players) {
      const data = await extractComprehensivePlayerData(
        player.name,
        clubName,
        null // No known IDs, will search
      );
      
      if (data) {
        allResults[clubName][player.name] = data;
        totalProcessed++;
      }
      
      // Rate limiting between players
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
      
      // Progress update
      const progressPercent = ((totalProcessed / totalPlayers) * 100).toFixed(1);
      console.log(`    📈 Progress: ${totalProcessed}/${totalPlayers} (${progressPercent}%)`);
    }
    
    // Rate limiting between clubs
    if (Object.keys(clubs).indexOf(clubName) < Object.keys(clubs).length - 1) {
      console.log(`\n⏳ Waiting ${DELAY_BETWEEN_CLUBS / 1000}s before next club...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_CLUBS));
    }
  }
  
  // Save all results
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'players', 'all-players-comprehensive.json');
  fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2));
  console.log(`\n✅ Saved all results to ${outputPath}`);
  
  // Update squad file
  console.log('\n📝 Updating squadWages.ts with extracted data...');
  updateSquadFileWithData(allResults);
  
  console.log(`\n🎉 Complete! Processed ${totalProcessed} players`);
  console.log(`📁 Results saved to: ${outputPath}`);
  console.log(`📁 Progress saved to: ${PROGRESS_FILE}`);
}

// Run
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});


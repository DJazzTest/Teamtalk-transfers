/**
 * Extract Arsenal Player Data from SofaScore Iframe URLs
 * Extracts comprehensive data using player IDs from iframe embeds
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DELAY_BETWEEN_REQUESTS = 2000; // 2 seconds between requests

// Player IDs from iframe URLs
const PLAYER_IDS = [
  1150958,
  1218090,
  232422, // Kepa (already known)
];

// Fetch SofaScore API
async function fetchSofaScoreAPI(endpoint, retries = 3) {
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

// Extract comprehensive player data
async function extractPlayerData(playerId) {
  console.log(`\n🔍 Processing Player ID: ${playerId}...`);
  
  const playerData = {
    sofascoreId: playerId,
    bio: {},
    seasonStats: null,
    transferHistory: [],
    previousMatches: []
  };

  // 1. Fetch basic player info
  const playerInfoUrl = `https://api.sofascore.com/api/v1/player/${playerId}`;
  const playerInfo = await fetchSofaScoreAPI(playerInfoUrl);
  
  if (!playerInfo || !playerInfo.player) {
    console.log(`  ❌ Could not fetch player info`);
    return null;
  }

  const p = playerInfo.player;
  playerData.name = p.name || p.fullName || 'Unknown';
  console.log(`  ✅ Found player: ${playerData.name}`);

  // Extract bio data
  playerData.bio = {
    name: p.name || p.fullName,
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
    description: `${p.name || 'Player'} is ${p.age || 'N/A'} years old${p.dateOfBirth ? ` (${new Date(p.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })})` : ''}, ${p.height ? `${p.height} cm` : 'N/A'} tall and plays for Arsenal. ${p.preferredFoot ? `${p.name || 'Player'} prefers to play with ${p.preferredFoot.toLowerCase()} foot.` : ''} ${p.jerseyNumber ? `His jersey number is ${p.jerseyNumber}.` : ''}`
  };

  // 2. Fetch detailed season statistics
  const statsUrl = `https://api.sofascore.com/api/v1/player/${playerId}/unique-tournament/17/statistics/overall`;
  const statsData = await fetchSofaScoreAPI(statsUrl);
  
  if (statsData && statsData.seasons && statsData.seasons.length > 0) {
    const currentSeason = statsData.seasons[0];
    const stats = currentSeason.statistics;
    
    if (stats) {
      const isGoalkeeper = p.position?.toLowerCase().includes('goalkeeper') || 
                           p.position?.toLowerCase().includes('gk');
      
      const competitionStats = {
        competition: 'Premier League',
        matches: stats.appearances || 0,
        minutes: stats.minutesPlayed || 0,
        appearances: stats.appearances || 0,
        started: stats.started || 0,
        minutesPerGame: stats.appearances && stats.minutesPlayed ? 
          Math.round(stats.minutesPlayed / stats.appearances) : 0,
        totalMinutes: stats.minutesPlayed || 0,
        averageRating: stats.rating || null,
        // Goalkeeping
        cleanSheets: stats.cleanSheet || 0,
        goalsConceded: stats.goalsConceded || 0,
        goalsConcededPerGame: stats.goalsConceded && stats.appearances ? 
          (stats.goalsConceded / stats.appearances).toFixed(1) : 0,
        saves: stats.saves || 0,
        savesFromInsideBox: stats.savedShotsFromInsideTheBox || 0,
        savesFromOutsideBox: (stats.saves || 0) - (stats.savedShotsFromInsideTheBox || 0),
        goalsPrevented: stats.goalsPrevented || 0,
        penaltiesSaved: stats.penaltySave && stats.penaltyFaced ? 
          `${stats.penaltySave}/${stats.penaltyFaced}` : '0/0',
        errorsLeadingToGoal: stats.errorLeadToGoal || 0,
        // Attacking
        goals: stats.goals || 0,
        expectedGoals: stats.expectedGoals || 0,
        goalsPerGame: stats.goals && stats.appearances ? 
          (stats.goals / stats.appearances).toFixed(2) : 0,
        totalShots: stats.totalShots || 0,
        shotsOnTargetPerGame: stats.shotsOnTarget && stats.appearances ? 
          (stats.shotsOnTarget / stats.appearances).toFixed(2) : 0,
        bigChancesMissed: stats.bigChancesMissed || 0,
        // Passing
        assists: stats.assists || 0,
        expectedAssists: stats.expectedAssists || 0,
        touches: stats.touches || 0,
        accuratePasses: stats.accuratePasses || 0,
        accuratePassesPercentage: stats.accuratePassesPercentage || 0,
        longBallsAccurate: stats.accurateLongBalls || 0,
        longBallsPercentage: stats.accurateLongBallsPercentage || 0,
        keyPasses: stats.keyPasses || 0,
        bigChancesCreated: stats.bigChancesCreated || 0,
        // Defending
        interceptions: stats.interceptions || 0,
        tacklesPerGame: stats.tackles && stats.appearances ? 
          (stats.tackles / stats.appearances).toFixed(2) : 0,
        blockedShotsPerGame: stats.blockedShots && stats.appearances ? 
          (stats.blockedShots / stats.appearances).toFixed(2) : 0,
        dribbledPastPerGame: stats.dribbledPast && stats.appearances ? 
          (stats.dribbledPast / stats.appearances).toFixed(2) : 0,
        errorsLeadingToShot: stats.errorLeadToShot || 0,
        // Other
        aerialDuelsWon: stats.aerialDuelsWon || 0,
        succDribbles: stats.successfulDribbles || 0,
        // Cards
        yellowCards: stats.yellowCards || 0,
        redCards: stats.redCards || 0,
        redCards2Yellows: stats.redCards2Yellows || 0
      };

      playerData.seasonStats = {
        season: '2025-26',
        competitions: [competitionStats]
      };

      console.log(`  ✅ Extracted season statistics`);
    }
  }

  // 3. Try to fetch transfer history
  const transfersUrl = `https://api.sofascore.com/api/v1/player/${playerId}/transfers`;
  const transfersData = await fetchSofaScoreAPI(transfersUrl);
  
  if (transfersData && transfersData.transfers) {
    playerData.transferHistory = transfersData.transfers.map(transfer => ({
      date: transfer.date || transfer.transferDate,
      from: transfer.fromTeam?.name || transfer.from,
      to: transfer.toTeam?.name || transfer.to,
      fee: transfer.fee || transfer.transferFee || 'Undisclosed',
      type: transfer.type || 'Transfer'
    }));
    console.log(`  ✅ Extracted ${playerData.transferHistory.length} transfer records`);
  }

  await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
  return playerData;
}

// Main function
async function extractAllPlayers() {
  console.log('🚀 Starting Arsenal player data extraction from SofaScore...\n');
  console.log(`📋 Processing ${PLAYER_IDS.length} player IDs\n`);

  const results = [];
  
  for (const playerId of PLAYER_IDS) {
    try {
      const playerData = await extractPlayerData(playerId);
      if (playerData) {
        results.push(playerData);
        console.log(`  ✅ Successfully extracted data for ${playerData.name}`);
      } else {
        console.log(`  ❌ Failed to extract data for player ID ${playerId}`);
      }
    } catch (error) {
      console.error(`  ❌ Error processing player ID ${playerId}:`, error.message);
    }
  }

  // Save results to JSON file
  const outputPath = path.join(__dirname, '..', 'arsenal-players-extracted.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log(`\n✅ Extraction complete!`);
  console.log(`   Successfully extracted: ${results.length} players`);
  console.log(`   Results saved to: ${outputPath}`);
  console.log(`\n📝 Next: Review the JSON and update squadWages.ts with this data`);
  
  // Also print summary
  console.log(`\n📊 Summary:`);
  results.forEach(player => {
    console.log(`   - ${player.name} (ID: ${player.sofascoreId})`);
    if (player.seasonStats) {
      const comp = player.seasonStats.competitions[0];
      console.log(`     Matches: ${comp.matches}, Goals: ${comp.goals}, Rating: ${comp.averageRating || 'N/A'}`);
    }
  });
}

// Run the extraction
extractAllPlayers().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});


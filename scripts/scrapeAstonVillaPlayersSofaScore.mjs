/**
 * Aston Villa Player Data Scraper from SofaScore
 * Extracts comprehensive data for all Aston Villa players defined in squadWages.ts
 *
 * Usage (from project root):
 *   node scripts/scrapeAstonVillaPlayersSofaScore.mjs
 *
 * This writes a JSON file at ./aston-villa-players-data.json which you can
 * then use to enrich src/data/squadWages.ts (seasonStats, previousMatches, bio, etc).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DELAY_BETWEEN_REQUESTS = 2000; // 2 seconds
const MAX_RETRIES = 3;

// Known SofaScore IDs from URLs you provided (to avoid search ambiguity)
const KNOWN_IDS = {
  'Ollie Watkins': '555386',
  'Tammy Abraham': '610766',
  'Jadon Sancho': '851100',
  'Harvey Elliott': '955245',
  'Morgan Rogers': '948261',
  'Douglas Luiz': '867887',
  'Youri Tielemans': '331737',
  'Leon Bailey': '808590',
  'Amadou Onana': '923973',
  'Boubacar Kamara': '826204',
  'Matty Cash': '833956',
  'Victor Lindelöf': '143334',
  'Victor Lindelof': '143334',
  'Ian Maatsen': '976263',
  'Lucas Digne': '96538',
  'Pau Torres': '864169',
  'Ezri Konsa': '827679',
  'Tyrone Mings': '303638',
  'Lamare Bogarde': '1089388',
  'Andres Garcia': '1457536',
  'Emiliano Martínez': '158263',
  'Emiliano Martinez': '158263',
  'Marco Bizot': '100390',
  // Youth / U21 names you provided
  'Travis Patterson': '1135879',
  'James Wright': '1138445',
  'Jamaldeen Jimoh': '1410178',
  'Bradley Burrowes': '1899712',
  'George Hemmings': '1398204',
  'Sam Proctor': '1410227',
  'Triston Rowe': '1400655',
  // Additional Aston Villa-related players and moves
  'Donyell Malen': '803039',
  'Philippe Coutinho': '119159',
  'John McGinn': '250223',
  'Samuel Iling-Junior': '996919',
  'Samuel Iling‑Junior': '996919',
  'Evann Guessand': '930245',
  'Ross Barkley': '98435',
  'Lino Sousa': '1104418',
};

// Fetch SofaScore JSON API directly
async function fetchSofaScoreAPI(endpoint, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'application/json',
          Origin: 'https://www.sofascore.com',
          Referer: 'https://www.sofascore.com/',
        },
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      // ignore and retry
    }
    if (attempt < retries - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  return null;
}

// Search for a player if we don't have a known ID
async function findPlayerId(playerName, clubName = 'Aston Villa') {
  try {
    const searchUrl = `https://api.sofascore.com/api/v1/search?q=${encodeURIComponent(
      playerName,
    )}`;
    const searchData = await fetchSofaScoreAPI(searchUrl);

    if (searchData && searchData.players && searchData.players.length > 0) {
      for (const player of searchData.players) {
        const nameMatch =
          player.name?.toLowerCase().includes(playerName.toLowerCase()) ||
          player.shortName?.toLowerCase().includes(playerName.toLowerCase());
        if (!nameMatch) continue;

        const teamName =
          player.team?.name || player.currentTeam?.name || player.teamShortName || '';
        if (teamName && teamName.toLowerCase().includes(clubName.toLowerCase())) {
          return player.id;
        }
      }
      // Fallback to first search result
      return searchData.players[0].id;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error finding player ID for ${playerName}:`, error.message);
  }
  return null;
}

// Extract one player's SofaScore data into a shape we can later merge into squadWages.ts
async function extractPlayerData(playerName, knownPlayerId = null) {
  // eslint-disable-next-line no-console
  console.log(`\n🔍 Processing ${playerName}...`);

  let playerId = knownPlayerId;
  if (!playerId && KNOWN_IDS[playerName]) {
    playerId = KNOWN_IDS[playerName];
  }

  if (!playerId) {
    playerId = await findPlayerId(playerName, 'Aston Villa');
  }

  if (!playerId) {
    // eslint-disable-next-line no-console
    console.log(`  ⚠️  Could not resolve SofaScore ID`);
    return null;
  }

  const playerData = {
    name: playerName,
    sofascoreId: playerId,
    url: `https://www.sofascore.com/football/player/${playerName
      .toLowerCase()
      .replace(/\s+/g, '-')}/${playerId}`,
    imageUrl: `https://api.sofascore.com/api/v1/player/${playerId}/image`,
    bio: {},
    seasonStats: null,
    previousMatches: [],
  };

  // Basic player info
  const infoUrl = `https://api.sofascore.com/api/v1/player/${playerId}`;
  const info = await fetchSofaScoreAPI(infoUrl);
  if (info && info.player) {
    const p = info.player;
    playerData.bio = {
      name: p.name || p.fullName || playerName,
      height: p.height ? `${p.height} cm` : undefined,
      weight: p.weight ? `${p.weight} kg` : undefined,
      nationality: p.country?.name || p.nationality,
      dateOfBirth: p.dateOfBirth || p.birthDate,
      placeOfBirth: p.placeOfBirth || p.birthPlace,
      preferredFoot: p.preferredFoot,
      position: p.position,
      jerseyNumber: p.jerseyNumber || p.shirtNumber,
    };
  }

  // Season stats (overall)
  const seasonStatsUrl = `https://api.sofascore.com/api/v1/player/${playerId}/statistics/season`;
  const statsData = await fetchSofaScoreAPI(seasonStatsUrl);
  if (statsData && statsData.statistics) {
    const stats = Array.isArray(statsData.statistics)
      ? statsData.statistics[0]
      : statsData.statistics;

    if (stats) {
      playerData.seasonStats = {
        season: '2025-26',
        competitions: [
          {
            competition: stats.tournament?.name || 'League',
            matches: stats.appearances || stats.matches || 0,
            minutes: stats.minutes || 0,
            appearances: stats.appearances || 0,
            started: stats.started || 0,
            minutesPerGame:
              stats.minutesPerGame ||
              (stats.minutes && stats.appearances
                ? Math.round(stats.minutes / stats.appearances)
                : 0),
            totalMinutes: stats.minutes || 0,
            goals: stats.goals || 0,
            assists: stats.assists || 0,
            cleanSheets: stats.cleanSheets || 0,
            goalsConceded: stats.goalsConceded || 0,
            averageRating: stats.rating || stats.averageRating || null,
          },
        ],
      };
    }
  }

  // Optional: you could also call SofaScore's player/fixtures endpoint here
  // to populate playerData.previousMatches in the same shape that PlayerDetailModal expects.

  await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
  return playerData;
}

async function scrapeAstonVillaPlayers() {
  // eslint-disable-next-line no-console
  console.log('🚀 Starting Aston Villa player data scrape from SofaScore...\n');

  // Read Aston Villa squad block from squadWages.ts
  const squadWagesPath = path.join(__dirname, '..', 'src', 'data', 'squadWages.ts');
  const squadData = fs.readFileSync(squadWagesPath, 'utf-8');

  const villaMatch = squadData.match(
    /'Aston Villa':\s*\[([\s\S]*?)(?=\s*'Chelsea'|$)/,
  );
  if (!villaMatch) {
    // eslint-disable-next-line no-console
    console.error('Could not find Aston Villa squad in squadWages.ts');
    return;
  }

  const playerNameMatches = villaMatch[1].matchAll(/name:\s*['"]([^'"]+)['"]/g);
  const playerNames = Array.from(playerNameMatches, (m) => m[1]);

  // eslint-disable-next-line no-console
  console.log(`Found ${playerNames.length} Aston Villa players to process\n`);

  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (const playerName of playerNames) {
    try {
      const playerData = await extractPlayerData(playerName);
      if (playerData) {
        results.push(playerData);
        successCount += 1;
        // eslint-disable-next-line no-console
        console.log(`  ✅ Successfully extracted data for ${playerName}`);
      } else {
        failCount += 1;
        // eslint-disable-next-line no-console
        console.log(`  ❌ Failed to extract data for ${playerName}`);
      }
    } catch (error) {
      failCount += 1;
      // eslint-disable-next-line no-console
      console.error(`  ❌ Error processing ${playerName}:`, error.message);
    }
  }

  const outputPath = path.join(__dirname, '..', 'aston-villa-players-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  // eslint-disable-next-line no-console
  console.log('\n✅ Scraping complete!');
  // eslint-disable-next-line no-console
  console.log(`   Success: ${successCount}`);
  // eslint-disable-next-line no-console
  console.log(`   Failed: ${failCount}`);
  // eslint-disable-next-line no-console
  console.log(`   Results saved to: ${outputPath}`);
  // eslint-disable-next-line no-console
  console.log(
    '\n📝 Next step: Use aston-villa-players-data.json to enrich Aston Villa entries in src/data/squadWages.ts (seasonStats, previousMatches, bio, etc).',
  );
}

scrapeAstonVillaPlayers().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Fatal error:', error);
  process.exit(1);
});


/**
 * Tottenham Hotspur Player Data Scraper from SofaScore
 * Extracts comprehensive data for all Tottenham Hotspur players defined in squadWages.ts
 *
 * Usage (from project root):
 *   node scripts/scrapeTottenhamPlayersSofaScore.mjs
 *
 * This writes a JSON file at ./tottenham-hotspur-players-data.json which you can
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
  'Antonín Kinský': '1031251',
  'Antonin Kinsky': '1031251',
  'Guglielmo Vicario': '553606',
  'Pedro Porro': '913654',
  'Destiny Udogie': '983572',
  'Djed Spence': '945798',
  'Ben Davies': '94758',
  'Cristian Romero': '829932',
  'Radu Drăgușin': '997103',
  'Radu Dragusin': '997103',
  'Micky van de Ven': '998247',
  'Pape Matar Sarr': '1002711',
  'Rodrigo Bentancur': '791190',
  'Yves Bissouma': '844842',
  'Archie Gray': '1142335',
  'James Maddison': '356398',
  'Xavi Simons': '997183',
  'João Palhinha': '364612',
  'Joao Palhinha': '364612',
  'Lucas Bergvall': '1391251',
  'Dejan Kulusevski': '928124',
  'Mathys Tel': '1048888',
  'Randal Kolo Muani': '871706',
  'Dominic Solanke': '361420',
  'Mohammed Kudus': '905163',
  'Richarlison': '840217',
  'Wilson Odobert': '1142679',
  'Brandon Austin': '859896',
  'Luca Gunter': '1187493',
  'Kevin Danso': '794953',
  'Brennan Johnson': '1085180', // moved to Crystal Palace
  'Kota Takai': '1144143', // moved to Borussia Mönchengladbach
  'Dane Scarlett': '998772', // moved to Hibernian
  // Optional / future squad
  'Conor Gallagher': '904970',
  'Souza': '1482340',
  'Junai Byfield': '1913038',
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
async function findPlayerId(playerName, clubName = 'Tottenham Hotspur') {
  try {
    const searchUrl = `https://api.sofascore.com/api/v1/search?q=${encodeURIComponent(
      playerName,
    )}`;
    const searchData = await fetchSofaScoreAPI(searchUrl);

    if (searchData && searchData.players && searchData.players.length > 0) {
      const spurs = clubName.toLowerCase().replace(/\s/g, '');
      for (const player of searchData.players) {
        const nameMatch =
          player.name?.toLowerCase().includes(playerName.toLowerCase()) ||
          player.shortName?.toLowerCase().includes(playerName.toLowerCase());
        if (!nameMatch) continue;

        const teamName =
          player.team?.name || player.currentTeam?.name || player.teamShortName || '';
        const teamNorm = teamName.toLowerCase().replace(/\s/g, '');
        if (teamNorm.includes('tottenham') || teamNorm.includes('spurs')) {
          return player.id;
        }
      }
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
    playerId = await findPlayerId(playerName, 'Tottenham Hotspur');
  }

  if (!playerId) {
    // eslint-disable-next-line no-console
    console.log(`  ⚠️  Could not resolve SofaScore ID`);
    return null;
  }

  const slug = playerName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
  const playerData = {
    name: playerName,
    sofascoreId: playerId,
    url: `https://www.sofascore.com/football/player/${slug}/${playerId}`,
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
            appearances: stats.appearances || stats.matches || 0,
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

  await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
  return playerData;
}

async function scrapeTottenhamPlayers() {
  // eslint-disable-next-line no-console
  console.log('🚀 Starting Tottenham Hotspur player data scrape from SofaScore...\n');

  const squadWagesPath = path.join(__dirname, '..', 'src', 'data', 'squadWages.ts');
  const squadData = fs.readFileSync(squadWagesPath, 'utf-8');

  const spursMatch = squadData.match(
    /'Tottenham Hotspur':\s*createImageOnlySquad\s*\(\s*'tottenham',\s*\[([\s\S]*?)\]\s*\)/,
  );
  if (!spursMatch) {
    // eslint-disable-next-line no-console
    console.error('Could not find Tottenham Hotspur squad in squadWages.ts');
    return;
  }

  const block = spursMatch[1];
  const playerNameMatches = block.matchAll(/\s*'([^']+)'/g);
  const playerNames = Array.from(playerNameMatches, (m) => m[1].trim()).filter(Boolean);

  // eslint-disable-next-line no-console
  console.log(`Found ${playerNames.length} Tottenham Hotspur players to process\n`);

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

  const outputPath = path.join(__dirname, '..', 'tottenham-hotspur-players-data.json');
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
    '\n📝 Next step: Use tottenham-hotspur-players-data.json to enrich Tottenham Hotspur entries in src/data/squadWages.ts (seasonStats, previousMatches, bio, etc).',
  );
}

scrapeTottenhamPlayers().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Fatal error:', error);
  process.exit(1);
});

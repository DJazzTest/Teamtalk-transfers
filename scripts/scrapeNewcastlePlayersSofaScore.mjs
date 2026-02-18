/**
 * Newcastle United Player Data Scraper from SofaScore
 * Extracts comprehensive data for all Newcastle United players defined in squadWages.ts
 *
 * Usage (from project root):
 *   node scripts/scrapeNewcastlePlayersSofaScore.mjs
 *
 * This writes a JSON file at ./newcastle-united-players-data.json which you can
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
  'Nick Pope': '162653',
  'Aaron Ramsdale': '839410',
  'John Ruddy': '1131',
  'Mark Gillespie': '108508',
  'Alex Murphy': '1125214',
  'Kieran Trippier': '69256',
  'Lewis Hall': '1136730',
  'Sven Botman': '910046',
  'Tino Livramento': '980634',
  'Valentino Livramento': '980634',
  'Fabian Schär': '101882',
  'Fabian Schar': '101882',
  'Jamaal Lascelles': '153444', // moved to Leicester City
  'Dan Burn': '99090',
  'Harrison Ashby': '1084284', // moved to Bradford City (loan)
  'Malick Thiaw': '1014286',
  'Emil Krafth': '150396',
  'Lewis Miley': '1400650',
  'Jacob Ramsey': '975937',
  'Joe Willock': '888550',
  'Sandro Tonali': '892673',
  'Bruno Guimarães': '866469',
  'Bruno Guimaraes': '866469',
  'Joelinton': '560128',
  'William Osula': '1122603',
  'Nick Woltemade': '980623',
  'Anthony Elanga': '979232',
  'Harvey Barnes': '855647',
  'Anthony Gordon': '914902',
  'Gordon Anthony': '914902',
  'Jacob Murphy': '372336',
  'Yoane Wissa': '805123',
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
async function findPlayerId(playerName, clubName = 'Newcastle United') {
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
        if (teamName && teamName.toLowerCase().includes(clubName.toLowerCase().replace(' united', ''))) {
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
    playerId = await findPlayerId(playerName, 'Newcastle United');
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
      .replace(/\s+/g, '-')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')}/${playerId}`,
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

async function scrapeNewcastlePlayers() {
  // eslint-disable-next-line no-console
  console.log('🚀 Starting Newcastle United player data scrape from SofaScore...\n');

  const squadWagesPath = path.join(__dirname, '..', 'src', 'data', 'squadWages.ts');
  const squadData = fs.readFileSync(squadWagesPath, 'utf-8');

  // Newcastle squad is createImageOnlySquad('newcastle-utd', [ 'Name1', 'Name2', ... ])
  const newcastleMatch = squadData.match(
    /'Newcastle United':\s*createImageOnlySquad\s*\(\s*'newcastle-utd',\s*\[([\s\S]*?)\]\s*\)/,
  );
  if (!newcastleMatch) {
    // eslint-disable-next-line no-console
    console.error('Could not find Newcastle United squad in squadWages.ts');
    return;
  }

  const block = newcastleMatch[1];
  const playerNameMatches = block.matchAll(/\s*'([^']+)'/g);
  const playerNames = Array.from(playerNameMatches, (m) => m[1].trim()).filter(Boolean);

  // eslint-disable-next-line no-console
  console.log(`Found ${playerNames.length} Newcastle United players to process\n`);

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

  const outputPath = path.join(__dirname, '..', 'newcastle-united-players-data.json');
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
    '\n📝 Next step: Use newcastle-united-players-data.json to enrich Newcastle United entries in src/data/squadWages.ts (seasonStats, previousMatches, bio, etc).',
  );
}

scrapeNewcastlePlayers().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Fatal error:', error);
  process.exit(1);
});

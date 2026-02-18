/**
 * Wolverhampton Wanderers Player Data Scraper from SofaScore
 * Extracts comprehensive data for all Wolves players defined in squadWages.ts
 *
 * Usage (from project root):
 *   node scripts/scrapeWolvesPlayersSofaScore.mjs
 *
 * This writes a JSON file at ./wolverhampton-wanderers-players-data.json which you can
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
  'José Sá': '252669',
  'Jose Sa': '252669',
  'Sam Johnstone': '98427',
  'Daniel Bentley': '101367',
  'Matt Doherty': '143047',
  'David Møller Wolfe': '1031283',
  'David Moller Wolfe': '1031283',
  'Ladislav Krejci': '856250',
  'Santiago Bueno': '846308',
  'Toti': '973418',
  'Toti Gomes': '973418',
  'Yerson Mosquera': '1014835',
  'Hugo Bueno': '1013928',
  'Jackson Tchatchoua': '1096210',
  'Emmanuel Agbadou': '1013842', // moved to Beşiktaş
  'Craig Dawson': '50027', // no club
  'Ki-Jana Hoever': '954044', // moved to Sheffield United
  'Fer López': '1153270', // moved to Barcelona
  'Fermin Lopez': '1153270',
  'Tawanda Chirewa': '1005725', // moved to Barnsley
  'Jean-Ricner Bellegarde': '845273',
  'Marshall Munetsi': '894733', // moved to Paris FC
  'André': '1035996',
  'Andre': '1035996',
  'João Gomes': '1015267',
  'Joao Gomes': '1015267',
  'Mateus Mané': '1899647',
  'Mateus Mane': '1899647',
  'Jörgen Strand Larsen': '876599', // moved to Crystal Palace
  'Jorgen Strand Larsen': '876599',
  'Tolu Arokodare': '987734',
  'Enso González': '1402232',
  'Enso Gonzalez': '1402232',
  'Jhon Arias': '844096', // moved to Palmeiras
  'Hee-chan Hwang': '786186',
  // Optional / transfer-linked (not in current squad list)
  'Adam Armstrong': '361352',
  'Nathan Fraser': '1166679',
  'Angel Gomes': '867441',
  'Rodrigo Gomes': '1006073',
  'Pedro Lima': '1597270',
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
async function findPlayerId(playerName, clubName = 'Wolverhampton Wanderers') {
  try {
    const searchUrl = `https://api.sofascore.com/api/v1/search?q=${encodeURIComponent(
      playerName,
    )}`;
    const searchData = await fetchSofaScoreAPI(searchUrl);

    if (searchData && searchData.players && searchData.players.length > 0) {
      const wolves = 'wolverhampton';
      for (const player of searchData.players) {
        const nameMatch =
          player.name?.toLowerCase().includes(playerName.toLowerCase()) ||
          player.shortName?.toLowerCase().includes(playerName.toLowerCase());
        if (!nameMatch) continue;

        const teamName =
          player.team?.name || player.currentTeam?.name || player.teamShortName || '';
        if (teamName && teamName.toLowerCase().includes(wolves)) {
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
    playerId = await findPlayerId(playerName, 'Wolverhampton Wanderers');
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

async function scrapeWolvesPlayers() {
  // eslint-disable-next-line no-console
  console.log('🚀 Starting Wolverhampton Wanderers player data scrape from SofaScore...\n');

  const squadWagesPath = path.join(__dirname, '..', 'src', 'data', 'squadWages.ts');
  const squadData = fs.readFileSync(squadWagesPath, 'utf-8');

  const wolvesMatch = squadData.match(
    /'Wolverhampton Wanderers':\s*createImageOnlySquad\s*\(\s*'wolverhampton',\s*\[([\s\S]*?)\]\s*\)/,
  );
  if (!wolvesMatch) {
    // eslint-disable-next-line no-console
    console.error('Could not find Wolverhampton Wanderers squad in squadWages.ts');
    return;
  }

  const block = wolvesMatch[1];
  const playerNameMatches = block.matchAll(/\s*'([^']+)'/g);
  const playerNames = Array.from(playerNameMatches, (m) => m[1].trim()).filter(Boolean);

  // eslint-disable-next-line no-console
  console.log(`Found ${playerNames.length} Wolverhampton Wanderers players to process\n`);

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

  const outputPath = path.join(__dirname, '..', 'wolverhampton-wanderers-players-data.json');
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
    '\n📝 Next step: Use wolverhampton-wanderers-players-data.json to enrich Wolverhampton Wanderers entries in src/data/squadWages.ts (seasonStats, previousMatches, bio, etc).',
  );
}

scrapeWolvesPlayers().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Fatal error:', error);
  process.exit(1);
});

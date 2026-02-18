/**
 * West Ham United Player Data Scraper from SofaScore
 * Extracts comprehensive data for all West Ham United players defined in squadWages.ts
 *
 * Usage (from project root):
 *   node scripts/scrapeWestHamPlayersSofaScore.mjs
 *
 * This writes a JSON file at ./west-ham-united-players-data.json which you can
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
  'Alphonse Areola': '96531',
  'Łukasz Fabiański': '15479',
  'Lukasz Fabianski': '15479',
  'El Hadji Malick Diouf': '1471764',
  'Konstantinos Mavropanos': '829022',
  'Kyle Walker-Peters': '823085',
  'Oliver Scarles': '1150952',
  'Aaron Wan-Bissaka': '863653',
  'Jean-Clair Todibo': '945217',
  'Maximilian Kilman': '894474',
  'Max Kilman': '894474',
  'Freddie Potts': '1089582',
  'Soungoutou Magassa': '1170560',
  'Tomas Soucek': '799041',
  'Mateus Fernandes': '1142562',
  'Crysencio Summerville': '917005',
  'Jarrod Bowen': '552884',
  'Mads Hermansen': '856640',
  'Igor Julio': '842513', // moved to Brighton
  'Guido Rodríguez': '609752', // moved to Valencia
  'Guido Rodriguez': '609752',
  'Lucas Paquetá': '839981', // moved to Flamengo
  'Lucas Paqueta': '839981',
  'George Earthy': '1212165', // moved to Bristol City
  'James Ward-Prowse': '161717', // loan to Burnley
  'Luis Guilherme': '1464248', // moved to Sporting
  'Niclas Füllkrug': '132645', // moved to AC Milan
  'Niclas Fullkrug': '132645',
  'Callum Marshall': '1394099', // moved to VfL (loan)
  // Optional / transfer-linked
  'Adama Traore': '286165',
  'Valentin Castellanos': '877013',
  'Taty Castellanos': '877013',
  'Callum Wilson': '113956',
  'Keiber Lamadrid': '1190165',
  'Mohamadou Kante': '1523623',
  'Axel Disasi': '827243',
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
async function findPlayerId(playerName, clubName = 'West Ham United') {
  try {
    const searchUrl = `https://api.sofascore.com/api/v1/search?q=${encodeURIComponent(
      playerName,
    )}`;
    const searchData = await fetchSofaScoreAPI(searchUrl);

    if (searchData && searchData.players && searchData.players.length > 0) {
      const westHam = 'west ham';
      for (const player of searchData.players) {
        const nameMatch =
          player.name?.toLowerCase().includes(playerName.toLowerCase()) ||
          player.shortName?.toLowerCase().includes(playerName.toLowerCase());
        if (!nameMatch) continue;

        const teamName =
          player.team?.name || player.currentTeam?.name || player.teamShortName || '';
        if (teamName && teamName.toLowerCase().includes(westHam)) {
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
    playerId = await findPlayerId(playerName, 'West Ham United');
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

async function scrapeWestHamPlayers() {
  // eslint-disable-next-line no-console
  console.log('🚀 Starting West Ham United player data scrape from SofaScore...\n');

  const squadWagesPath = path.join(__dirname, '..', 'src', 'data', 'squadWages.ts');
  const squadData = fs.readFileSync(squadWagesPath, 'utf-8');

  const westHamMatch = squadData.match(
    /'West Ham United':\s*createImageOnlySquad\s*\(\s*'west-ham',\s*\[([\s\S]*?)\]\s*\)/,
  );
  if (!westHamMatch) {
    // eslint-disable-next-line no-console
    console.error('Could not find West Ham United squad in squadWages.ts');
    return;
  }

  const block = westHamMatch[1];
  const playerNameMatches = block.matchAll(/\s*'([^']+)'/g);
  const playerNames = Array.from(playerNameMatches, (m) => m[1].trim()).filter(Boolean);

  // eslint-disable-next-line no-console
  console.log(`Found ${playerNames.length} West Ham United players to process\n`);

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

  const outputPath = path.join(__dirname, '..', 'west-ham-united-players-data.json');
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
    '\n📝 Next step: Use west-ham-united-players-data.json to enrich West Ham United entries in src/data/squadWages.ts (seasonStats, previousMatches, bio, etc).',
  );
}

scrapeWestHamPlayers().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Fatal error:', error);
  process.exit(1);
});

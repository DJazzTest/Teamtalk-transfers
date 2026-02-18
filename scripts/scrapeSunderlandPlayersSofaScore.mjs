/**
 * Sunderland Player Data Scraper from SofaScore
 * Extracts comprehensive data for all Sunderland players defined in squadWages.ts
 *
 * Usage (from project root):
 *   node scripts/scrapeSunderlandPlayersSofaScore.mjs
 *
 * This writes a JSON file at ./sunderland-players-data.json which you can
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
  'Robin Roefs': '1012928',
  'Simon Moore': '95461',
  'Anthony Patterson': '958718', // moved to Millwall
  'Blondy Nna Noukeu': '1007038', // moved to Union Saint-Gilloise
  'Arthur Masuaku': '174975', // moved to RC Lens
  'Joe Anderson': '1472789',
  'Nordi Mukiele': '780014',
  'Timothée Pembélé': '1824137', // moved to Le Havre
  'Timothee Pembele': '1824137',
  'Lutsharel Geertruida': '856739',
  'Trai Hume': '989034',
  'Aji Alese': '934228', // moved to Portsmouth (Aji Alese = Ajibola Joshua Alese)
  'Dennis Cirkin': '1014987',
  'Leo Fuhr Hjelde': '1097848', // moved to Sheffield United
  'Omar Alderete': '805137',
  'Daniel George Ballard': '958878',
  'Daniel Ballard': '958878',
  "Luke O'Nien": '365812',
  'Luke ONien': '365812',
  'Reinildo Mandava': '831424',
  'Chris Rigg': '1394089',
  'Noah Sadiki': '1171539',
  'Granit Xhaka': '117777',
  'Habib Diarra': '1128532',
  'Harrison Jones': '1186076',
  'Abdoullah Ba': '1000139',
  'Ahmed Abdullahi': '1442017',
  'Abdullahi Ahmed': '1442017',
  'Dan Neil': '964106', // moved to Ipswich Town
  'Enzo Le Fée': '984014',
  'Enzo Le Fee': '984014',
  'Jay Matete': '998019', // moved to MK Dons
  'Eliezer Mayenda': '1168588',
  'Romaine Mundle': '1094440',
  'Simon Adingra': '1110842', // moved to AS Monaco
  'Wilson Isidor': '877980',
  'Brian Brobbey': '910048',
  'Chemsdine Talbi': '1142675',
  'Bertrand Traoré': '218160',
  'Bertrand Traore': '218160',
  'Ian Poveda': '907464',
  'Ian Carlo Poveda': '907464',
  // Optional / transfer-linked (not in current squad list)
  'Nilson Angulo': '1116571',
  'Jocelin Ta Bi': '2138729',
  'Milan Aleksic': '1409347',
  'Jaydon Jones': '1891914',
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
async function findPlayerId(playerName, clubName = 'Sunderland') {
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
        if (teamName && teamName.toLowerCase().includes('sunderland')) {
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
    playerId = await findPlayerId(playerName, 'Sunderland');
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
    .replace(/\s+/g, '-')
    .replace(/'/g, '');
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

async function scrapeSunderlandPlayers() {
  // eslint-disable-next-line no-console
  console.log('🚀 Starting Sunderland player data scrape from SofaScore...\n');

  const squadWagesPath = path.join(__dirname, '..', 'src', 'data', 'squadWages.ts');
  const squadData = fs.readFileSync(squadWagesPath, 'utf-8');

  const sunderlandMatch = squadData.match(
    /'Sunderland':\s*createImageOnlySquad\s*\(\s*'sunderland',\s*\[([\s\S]*?)\]\s*\)/,
  );
  if (!sunderlandMatch) {
    // eslint-disable-next-line no-console
    console.error('Could not find Sunderland squad in squadWages.ts');
    return;
  }

  const block = sunderlandMatch[1];
  const playerNameMatches = block.matchAll(/\s*'([^']+)'/g);
  const playerNames = Array.from(playerNameMatches, (m) => m[1].trim()).filter(Boolean);
  // Handle Luke O'Nien-style names (escaped quote)
  const normalizedNames = playerNames.map((n) => n.replace(/\\'/g, "'"));

  // eslint-disable-next-line no-console
  console.log(`Found ${normalizedNames.length} Sunderland players to process\n`);

  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (const playerName of normalizedNames) {
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

  const outputPath = path.join(__dirname, '..', 'sunderland-players-data.json');
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
    '\n📝 Next step: Use sunderland-players-data.json to enrich Sunderland entries in src/data/squadWages.ts (seasonStats, previousMatches, bio, etc).',
  );
}

scrapeSunderlandPlayers().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Fatal error:', error);
  process.exit(1);
});

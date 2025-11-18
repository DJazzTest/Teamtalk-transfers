#!/usr/bin/env node
/**
 * Fetch detailed SofaScore data for Premier League players that are missing season stats.
 * The script:
 *  - Loads the existing squad data from src/data/squadWages.ts
 *  - Detects which Premier League players lack seasonStats.competitions information
 *  - Queries SofaScore's public API for player details/season statistics
 *  - Saves the fetched payloads to scripts/output/premier-league-player-stats.json
 *
 * NOTE: This does NOT mutate squadWages.ts automatically. Review the output JSON
 *       and merge the stats you need into the data file (or wire an importer).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const SQUAD_WAGES_PATH = path.join(ROOT_DIR, 'src', 'data', 'squadWages.ts');
const OUTPUT_DIR = path.join(__dirname, 'output');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'premier-league-player-stats.json');

const PREMIER_LEAGUE_CLUBS = [
  'Arsenal',
  'Aston Villa',
  'Bournemouth',
  'Brentford',
  'Brighton & Hove Albion',
  'Burnley',
  'Chelsea',
  'Crystal Palace',
  'Everton',
  'Fulham',
  'Leeds United',
  'Liverpool',
  'Manchester City',
  'Manchester United',
  'Newcastle United',
  'Nottingham Forest',
  'Sunderland',
  'Tottenham Hotspur',
  'West Ham United',
  'Wolverhampton Wanderers'
];

const PREMIER_LEAGUE_TOURNAMENT_ID = 17;
// SofaScore season id for Premier League 2025/26 (update if season changes)
const PREMIER_LEAGUE_SEASON_ID = 52186;

const OPTIONAL_STAT_FIELDS = [
  'appearances',
  'started',
  'minutesPerGame',
  'totalMinutes',
  'teamOfTheWeek',
  'averageRating',
  'goals',
  'assists',
  'cleanSheets',
  'goalsConceded',
  'goalsConcededPerGame',
  'penaltiesSaved',
  'savesPerGame',
  'savesPerGamePercentage',
  'succRunsOutPerGame',
  'succRunsOutPercentage',
  'concededFromInsideBox',
  'concededFromOutsideBox',
  'saves',
  'goalsPrevented',
  'savesFromInsideBox',
  'savesFromOutsideBox',
  'savesCaught',
  'savesParried',
  'expectedGoals',
  'scoringFrequency',
  'goalsPerGame',
  'totalShots',
  'shotsOnTargetPerGame',
  'bigChancesMissed',
  'goalConversion',
  'penaltyGoals',
  'penaltyConversion',
  'freeKickGoals',
  'freeKickConversion',
  'goalsFromInsideBox',
  'goalsFromOutsideBox',
  'headedGoals',
  'leftFootedGoals',
  'rightFootedGoals',
  'penaltyWon',
  'expectedAssists',
  'touches',
  'bigChancesCreated',
  'keyPasses',
  'accuratePasses',
  'accuratePassesPercentage',
  'accOwnHalf',
  'accOwnHalfPercentage',
  'accOppositionHalf',
  'accOppositionHalfPercentage',
  'longBallsAccurate',
  'longBallsPercentage',
  'accurateChipPasses',
  'accurateChipPassesPercentage',
  'accurateCrosses',
  'interceptions',
  'tacklesPerGame',
  'possessionWonFinalThird',
  'ballsRecoveredPerGame',
  'dribbledPastPerGame',
  'clearancesPerGame',
  'blockedShotsPerGame',
  'errorsLeadingToShot',
  'errorsLeadingToGoal',
  'penaltiesCommitted',
  'succDribbles',
  'succDribblesPercentage',
  'totalDuelsWon',
  'totalDuelsWonPercentage',
  'groundDuelsWon',
  'groundDuelsWonPercentage',
  'aerialDuelsWon',
  'aerialDuelsWonPercentage',
  'possessionLost',
  'foulsPerGame',
  'wasFouled',
  'offsides',
  'goalKicksPerGame',
  'yellowCards',
  'redCards2Yellows',
  'redCards'
];

function transpileAndLoadSquads() {
  const source = fs.readFileSync(SQUAD_WAGES_PATH, 'utf-8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2018 }
  }).outputText;

  const moduleShim = { exports: {} };
  const exportsShim = moduleShim.exports;
  const requireShim = (specifier) => {
    throw new Error(`Dynamic require not supported: ${specifier}`);
  };
  const fn = new Function(
    'exports',
    'require',
    'module',
    '__filename',
    '__dirname',
    transpiled
  );
  fn(exportsShim, requireShim, moduleShim, SQUAD_WAGES_PATH, path.dirname(SQUAD_WAGES_PATH));

  if (!moduleShim.exports?.clubSquads) {
    throw new Error('Unable to load clubSquads from squadWages.ts');
  }
  return moduleShim.exports.clubSquads;
}

function hasSeasonStats(player) {
  return Boolean(
    player?.seasonStats?.competitions &&
      Array.isArray(player.seasonStats.competitions) &&
      player.seasonStats.competitions.length > 0
  );
}

async function fetchJson(url, retries = 3, delayMs = 500) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'application/json',
          Origin: 'https://www.sofascore.com',
          Referer: 'https://www.sofascore.com/'
        }
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      if (attempt === retries - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }
  return null;
}

async function findPlayerId(playerName, clubName) {
  const searchUrl = `https://api.sofascore.com/api/v1/search?q=${encodeURIComponent(playerName)}`;
  const searchData = await fetchJson(searchUrl);
  if (!searchData) return null;

  const candidates = [
    ...(searchData.players || []),
    ...(searchData.results?.player || []),
    ...(searchData.playerSuggestions || [])
  ];

  const normalizedClub = clubName.toLowerCase();

  const exact = candidates.find((player) => {
    const teamName =
      (player.team?.name ||
        player.currentTeam?.name ||
        player.shortTeamName ||
        player.teamName ||
        '')?.toLowerCase();
    const playerNameLc = player.name?.toLowerCase() || '';
    return (
      playerNameLc.includes(playerName.toLowerCase()) &&
      (!!teamName ? teamName.includes(normalizedClub) : true)
    );
  });

  if (exact) return String(exact.id);

  return candidates.length > 0 ? String(candidates[0].id) : null;
}

function mapCompetitionStats(stat) {
  const competition = stat.tournament?.name || stat.competition || 'Unknown';
  const mapped = {
    competition,
    matches: stat.appearances ?? stat.matches ?? 0,
    minutes: stat.minutes ?? 0
  };

  for (const field of OPTIONAL_STAT_FIELDS) {
    if (stat[field] !== undefined && stat[field] !== null) {
      mapped[field] = stat[field];
    }
  }

  if (!('appearances' in mapped) && stat.appearances !== undefined) {
    mapped.appearances = stat.appearances;
  }
  return mapped;
}

async function fetchPlayerData(playerName, clubName) {
  const playerId = await findPlayerId(playerName, clubName);
  if (!playerId) {
    return { success: false, reason: 'PLAYER_ID_NOT_FOUND' };
  }

  const baseUrl = `https://api.sofascore.com/api/v1/player/${playerId}`;
  const [baseData, seasonData, tournamentData] = await Promise.all([
    fetchJson(baseUrl),
    fetchJson(`${baseUrl}/statistics/season`),
    fetchJson(
      `${baseUrl}/unique-tournament/${PREMIER_LEAGUE_TOURNAMENT_ID}/season/${PREMIER_LEAGUE_SEASON_ID}/statistics/overall`
    )
  ]);

  if (!baseData && !seasonData && !tournamentData) {
    return { success: false, reason: 'API_DATA_UNAVAILABLE' };
  }

  const bioSource = baseData?.player;
  const playerPayload = {
    name: playerName,
    club: clubName,
    sofascoreId: playerId,
    url: `https://www.sofascore.com/football/player/${playerName
      .toLowerCase()
      .replace(/\s+/g, '-')}/${playerId}`,
    bio: bioSource
      ? {
          name: bioSource.name || bioSource.fullName || playerName,
          height: bioSource.height ? `${bioSource.height} cm` : undefined,
          weight: bioSource.weight ? `${bioSource.weight} kg` : undefined,
          nationality: bioSource.country?.name || bioSource.nationality,
          dateOfBirth: bioSource.dateOfBirth || bioSource.birthDate,
          placeOfBirth: bioSource.placeOfBirth || bioSource.birthPlace,
          preferredFoot: bioSource.preferredFoot,
          position: bioSource.position,
          age: bioSource.age,
          jerseyNumber: bioSource.jerseyNumber || bioSource.shirtNumber,
          contractUntil: bioSource.contractUntil,
          marketValue: bioSource.marketValue,
          nationalTeam: bioSource.country?.name,
          nationalTeamAppearances: bioSource.nationalTeamAppearances,
          nationalTeamGoals: bioSource.nationalTeamGoals
        }
      : {}
  };

  const competitions = [];
  if (Array.isArray(seasonData?.statistics)) {
    for (const stat of seasonData.statistics) {
      competitions.push(mapCompetitionStats(stat));
    }
  } else if (seasonData?.statistics) {
    competitions.push(mapCompetitionStats(seasonData.statistics));
  }

  // Merge tournament stats into the first competition (usually Premier League)
  const premierCompetition =
    competitions.find((comp) =>
      comp.competition.toLowerCase().includes('premier league')
    ) || competitions[0];

  if (premierCompetition && tournamentData?.statistics?.players) {
    const playerStats = tournamentData.statistics.players[0]?.statistics || {};
    for (const field of OPTIONAL_STAT_FIELDS) {
      if (playerStats[field] !== undefined && playerStats[field] !== null) {
        premierCompetition[field] = playerStats[field];
      }
    }
    if (playerStats.rating && !premierCompetition.averageRating) {
      premierCompetition.averageRating = playerStats.rating;
    }
    if (playerStats.goals && !premierCompetition.goals) {
      premierCompetition.goals = playerStats.goals;
    }
  }

  if (!competitions.length) {
    return { success: false, reason: 'NO_COMPETITION_DATA' };
  }

  playerPayload.seasonStats = {
    season: '2025-26',
    competitions
  };

  return { success: true, data: playerPayload };
}

async function main() {
  console.log('🔎 Loading squad data…');
  const clubSquads = transpileAndLoadSquads();

  const missingPlayers = [];
  for (const club of PREMIER_LEAGUE_CLUBS) {
    const squad = clubSquads[club];
    if (!Array.isArray(squad)) continue;

    for (const player of squad) {
      if (!hasSeasonStats(player)) {
        missingPlayers.push({ club, name: player.name });
      }
    }
  }

  if (!missingPlayers.length) {
    console.log('✅ All Premier League players already have detailed stats.');
    return;
  }

  console.log(`📋 Found ${missingPlayers.length} Premier League players missing data.`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const results = [];
  const failures = [];

  for (const player of missingPlayers) {
    console.log(`\n➡️  ${player.club} – ${player.name}`);
    try {
      const outcome = await fetchPlayerData(player.name, player.club);
      if (outcome.success) {
        results.push(outcome.data);
        console.log('   ✅ Data captured');
      } else {
        failures.push({ ...player, reason: outcome.reason });
        console.log(`   ⚠️  ${outcome.reason}`);
      }
    } catch (err) {
      failures.push({ ...player, reason: err.message });
      console.log(`   ❌ Error: ${err.message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    totalMissing: missingPlayers.length,
    successCount: results.length,
    failureCount: failures.length,
    players: results,
    failures
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 2));
  console.log(`\n💾 Saved output to ${path.relative(ROOT_DIR, OUTPUT_PATH)}`);
  console.log(`   Success: ${results.length} | Failed: ${failures.length}`);
  console.log('   Next step: merge the fetched stats into src/data/squadWages.ts as needed.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});


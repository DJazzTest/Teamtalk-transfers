#!/usr/bin/env node
/**
 * Bulk extractor that walks every club transfer list (ins, outs, rumors),
 * fetches SofaScore data for each player, downloads any missing player images,
 * and writes a structured report per club.
 *
 * Run with:  node scripts/extractTransferPlayerData.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const TRANSFERS_DIR = path.join(ROOT_DIR, 'src', 'data', 'transfers');
const OUTPUT_PATH = path.join(
  ROOT_DIR,
  'src',
  'data',
  'players',
  'club-transfer-players.json'
);
const CACHE_PATH = path.join(ROOT_DIR, 'player-data-cache.json');
const IMAGE_ROOT = path.join(ROOT_DIR, 'public', 'player-images');
const API_BASE = 'https://api.sofascore.com/api/v1';
const RATE_LIMIT_MS = 1200;
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

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const sanitizePlayerKey = (playerName, clubName) =>
  `${clubName}::${playerName}`.toLowerCase();

const ensureDir = async (dirPath) => {
  await fs.promises.mkdir(dirPath, { recursive: true });
};

const readJsonFile = (filePath, fallback) => {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return fallback;
  }
};

const writeJsonFile = (filePath, data) => {
  const serialized = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, `${serialized}\n`, 'utf-8');
};

const fetchJson = async (url, retries = 3) => {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          Accept: 'application/json',
          Origin: 'https://www.sofascore.com',
          Referer: 'https://www.sofascore.com/'
        }
      });
      if (response.ok) {
        return await response.json();
      }
      if (response.status === 404) return null;
    } catch (error) {
      if (attempt === retries - 1) throw error;
    }
    await delay(500 * (attempt + 1));
  }
  return null;
};

const loadTransferModule = (filePath) => {
  const source = fs.readFileSync(filePath, 'utf-8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2018,
      esModuleInterop: true,
      removeComments: true
    }
  }).outputText;

  const moduleShim = { exports: {} };
  const requireShim = (specifier) => {
    if (specifier.startsWith('@/')) {
      return {};
    }
    throw new Error(`Unsupported import "${specifier}" in ${filePath}`);
  };

  const script = new vm.Script(transpiled, { filename: filePath });
  const context = vm.createContext({
    module: moduleShim,
    exports: moduleShim.exports,
    require: requireShim,
    __filename: filePath,
    __dirname: path.dirname(filePath)
  });
  script.runInContext(context);
  return moduleShim.exports;
};

const loadAllTransfers = () => {
  const files = fs
    .readdirSync(TRANSFERS_DIR)
    .filter((file) => file.endsWith('.ts') && file !== 'index.ts');

  const transfers = [];

  files.forEach((file) => {
    const modulePath = path.join(TRANSFERS_DIR, file);
    const exported = loadTransferModule(modulePath);
    const exportKey = Object.keys(exported).find((key) => Array.isArray(exported[key]));
    if (!exportKey) {
      console.warn(`⚠️  No transfer array exported from ${file}`);
      return;
    }
    transfers.push(
      ...exported[exportKey].map((entry) => ({
        ...entry,
        sourceFile: file
      }))
    );
  });

  return transfers;
};

const buildClubBuckets = (transfers) => {
  const map = new Map();
  const ensureClub = (club) => {
    if (!club) return null;
    const normalized = club.trim();
    if (!normalized) return null;
    if (!map.has(normalized)) {
      map.set(normalized, {
        arrivals: new Map(),
        departures: new Map(),
        rumors: new Map()
      });
    }
    return map.get(normalized);
  };

  transfers.forEach((transfer) => {
    const { playerName, toClub, fromClub, status } = transfer;
    if (!playerName) return;
    if (status === 'confirmed') {
      const arrivalBucket = ensureClub(toClub);
      if (arrivalBucket && !arrivalBucket.arrivals.has(playerName)) {
        arrivalBucket.arrivals.set(playerName, transfer);
      }
      const departureBucket = ensureClub(fromClub);
      if (departureBucket && !departureBucket.departures.has(playerName)) {
        departureBucket.departures.set(playerName, transfer);
      }
    } else if (status === 'rumored') {
      const rumorArrival = ensureClub(toClub);
      if (rumorArrival && !rumorArrival.rumors.has(playerName)) {
        rumorArrival.rumors.set(playerName, transfer);
      }
      const rumorDeparture = ensureClub(fromClub);
      if (rumorDeparture && !rumorDeparture.rumors.has(playerName)) {
        rumorDeparture.rumors.set(playerName, transfer);
      }
    }
  });

  return map;
};

const findPlayerCandidate = async (playerName, clubName) => {
  const url = `${API_BASE}/search/all?q=${encodeURIComponent(playerName)}`;
  const payload = await fetchJson(url);
  if (!payload) return null;

  const candidateArrays = [
    payload.players,
    payload.results?.players,
    payload.searchResults?.players,
    payload.searchResults?.player,
    payload.topPlayers,
    payload.items?.players
  ].filter(Boolean);

  const candidates = candidateArrays.flat();
  if (!candidates.length) return null;

  const normalizedName = playerName.toLowerCase();
  const normalizedClub = clubName.toLowerCase();

  const nameMatch = candidates.find((candidate) => {
    const candidateName = (candidate.name || candidate.fullName || candidate.shortName || '').toLowerCase();
    if (!candidateName) return false;
    const teamName =
      candidate.team?.name ||
      candidate.currentTeam?.name ||
      candidate.teamName ||
      candidate.shortTeamName ||
      '';
    const teamMatch = teamName ? teamName.toLowerCase().includes(normalizedClub) : true;
    return candidateName.includes(normalizedName) && teamMatch;
  });

  const target = nameMatch || candidates[0];
  const id =
    target?.id ||
    target?.entityId ||
    target?.playerId ||
    target?.itemId ||
    target?.slugId ||
    null;
  if (!id) return null;

  const slugSource = target.slug || target.seoName || target.name || playerName;
  return {
    id: String(id),
    slug: slugify(slugSource),
    resolvedName: target.name || target.fullName || playerName
  };
};

const mapCompetitionStats = (stat) => {
  const competition = stat.tournament?.name || stat.competition || 'Unknown';
  const mapped = {
    competition,
    matches: stat.appearances ?? stat.matches ?? 0,
    minutes: stat.minutes ?? 0
  };

  OPTIONAL_STAT_FIELDS.forEach((field) => {
    if (stat[field] !== undefined && stat[field] !== null) {
      mapped[field] = stat[field];
    }
  });

  return mapped;
};

const fetchPlayerProfile = async (playerMeta) => {
  const { id, slug, resolvedName } = playerMeta;
  const baseUrl = `${API_BASE}/player/${id}`;

  const [baseData, seasonData, careerData] = await Promise.all([
    fetchJson(baseUrl),
    fetchJson(`${baseUrl}/statistics/season`),
    fetchJson(`${baseUrl}/career`)
  ]);

  const bioSource = baseData?.player || {};
  const competitions = [];
  if (Array.isArray(seasonData?.statistics)) {
    seasonData.statistics.forEach((stat) => competitions.push(mapCompetitionStats(stat)));
  } else if (seasonData?.statistics) {
    competitions.push(mapCompetitionStats(seasonData.statistics));
  }

  const summary = competitions.reduce(
    (acc, comp) => ({
      matches: acc.matches + (comp.matches || 0),
      minutes: acc.minutes + (comp.minutes || 0),
      goals: acc.goals + (comp.goals || 0),
      assists: acc.assists + (comp.assists || 0),
      cleanSheets: acc.cleanSheets + (comp.cleanSheets || 0)
    }),
    { matches: 0, minutes: 0, goals: 0, assists: 0, cleanSheets: 0 }
  );

  const averageRating =
    competitions.length > 0
      ? (
          competitions.reduce((sum, comp) => sum + (Number(comp.averageRating) || 0), 0) /
          competitions.length
        ).toFixed(2)
      : null;

  const career = Array.isArray(careerData?.career)
    ? careerData.career.map((entry) => ({
        season: entry.season || entry.year || '',
        team: entry.team?.name || entry.team || '',
        competition: entry.tournament?.name || entry.competition || '',
        matches: entry.appearances || entry.matches || 0,
        minutes: entry.minutes || 0,
        goals: entry.goals || 0,
        assists: entry.assists || 0,
        cleanSheets: entry.cleanSheets || 0,
        goalsConceded: entry.goalsConceded || 0
      }))
    : [];

  return {
    name: resolvedName,
    sofascoreId: id,
    sofascoreSlug: slug,
    url: `https://www.sofascore.com/player/${slug}/${id}`,
    bio: {
      name: bioSource.name || bioSource.fullName || resolvedName,
      height: bioSource.height ? `${bioSource.height} cm` : undefined,
      weight: bioSource.weight ? `${bioSource.weight} kg` : undefined,
      nationality: bioSource.country?.name || bioSource.nationality,
      dateOfBirth: bioSource.dateOfBirth || bioSource.birthDate,
      placeOfBirth: bioSource.placeOfBirth || bioSource.birthPlace,
      preferredFoot: bioSource.preferredFoot,
      position: bioSource.position,
      jerseyNumber: bioSource.jerseyNumber || bioSource.shirtNumber,
      age: bioSource.age,
      marketValue: bioSource.marketValue,
      contractUntil: bioSource.contractUntil,
      nationalTeam: bioSource.country?.name
    },
    seasonStats: competitions.length
      ? {
          season: seasonData?.statistics?.[0]?.season || seasonData?.season || '2025-26',
          competitions
        }
      : null,
    careerStats: career,
    summary: {
      ...summary,
      averageRating: averageRating && averageRating !== 'NaN' ? Number(averageRating) : null
    }
  };
};

const ensurePlayerImage = async (playerId, clubName, playerName) => {
  const clubSlug = slugify(clubName);
  const playerSlug = slugify(playerName);
  const destDir = path.join(IMAGE_ROOT, clubSlug);
  const destPath = path.join(destDir, `${playerSlug}.png`);

  if (fs.existsSync(destPath)) {
    return `/player-images/${clubSlug}/${playerSlug}.png`;
  }

  try {
    const response = await fetch(`${API_BASE}/player/${playerId}/image`);
    if (!response.ok) {
      return null;
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length === 0) {
      return null;
    }
    await ensureDir(destDir);
    await fs.promises.writeFile(destPath, buffer);
    return `/player-images/${clubSlug}/${playerSlug}.png`;
  } catch (error) {
    console.warn(`   ⚠️  Failed to download image for ${playerName}: ${error.message}`);
    return null;
  }
};

const fetchAndCachePlayer = async ({
  playerName,
  clubName,
  cache,
  cacheDirty,
  stats
}) => {
  const cacheKey = sanitizePlayerKey(playerName, clubName);
  const cachedClub = cache[clubName];
  if (cachedClub && cachedClub[playerName]) {
    return { data: cachedClub[playerName], fromCache: true };
  }

  const playerMeta = await findPlayerCandidate(playerName, clubName);
  if (!playerMeta) {
    stats.failures.push({ playerName, clubName, reason: 'PLAYER_NOT_FOUND' });
    return { data: null, fromCache: false };
  }

  await delay(RATE_LIMIT_MS);
  const profile = await fetchPlayerProfile(playerMeta);
  if (!profile.seasonStats) {
    stats.failures.push({ playerName, clubName, reason: 'NO_SEASON_STATS' });
  }

  const imageUrl = await ensurePlayerImage(playerMeta.id, clubName, playerName);
  const payload = {
    ...profile,
    imageUrl,
    fetchedAt: new Date().toISOString(),
    source: 'api'
  };

  if (!cache[clubName]) {
    cache[clubName] = {};
  }
  cache[clubName][playerName] = payload;
  cacheDirty.value = true;
  stats.successCount += 1;

  return { data: payload, fromCache: false };
};

const processClub = async (clubName, bucket, cache, cacheDirty, stats) => {
  console.log(`\n🏟️  ${clubName}`);
  const startTime = Date.now();

  const categories = [
    ['arrivals', bucket.arrivals],
    ['departures', bucket.departures],
    ['rumors', bucket.rumors]
  ];

  const clubReport = {
    totals: {
      arrivals: bucket.arrivals.size,
      departures: bucket.departures.size,
      rumors: bucket.rumors.size
    },
    arrivals: [],
    departures: [],
    rumors: []
  };

  for (const [categoryName, entries] of categories) {
    const list = Array.from(entries.entries());
    for (const [playerName, transfer] of list) {
      const { data } = await fetchAndCachePlayer({
        playerName,
        clubName,
        cache,
        cacheDirty,
        stats
      });

      clubReport[categoryName].push({
        playerName,
        transferId: transfer.id,
        status: transfer.status,
        fromClub: transfer.fromClub,
        toClub: transfer.toClub,
        fee: transfer.fee,
        source: transfer.source,
        sofascore: data || null,
        dataStatus: data ? 'fetched' : 'missing'
      });
    }
  }

  const durationMs = Date.now() - startTime;
  console.log(
    `   ✅ Completed ${clubName} in ${(durationMs / 1000).toFixed(1)}s (players: ${
      clubReport.totals.arrivals +
      clubReport.totals.departures +
      clubReport.totals.rumors
    })`
  );
  return clubReport;
};

const main = async () => {
  console.log('🚀 Extracting player data for all transfer-listed clubs\n');

  const transfers = loadAllTransfers();
  console.log(`📦 Loaded ${transfers.length} transfer entries`);

  const clubBuckets = buildClubBuckets(transfers);
  console.log(`🏆 Clubs detected: ${clubBuckets.size}\n`);

  const cache = readJsonFile(CACHE_PATH, {});
  const cacheDirty = { value: false };
  const report = {
    generatedAt: new Date().toISOString(),
    totals: {
      clubs: clubBuckets.size,
      playersProcessed: 0
    },
    failures: [],
    clubs: {}
  };

  const stats = {
    successCount: 0,
    failures: []
  };

  for (const [clubName, bucket] of clubBuckets.entries()) {
    const totalPlayers =
      bucket.arrivals.size + bucket.departures.size + bucket.rumors.size;
    report.totals.playersProcessed += totalPlayers;

    const clubReport = await processClub(clubName, bucket, cache, cacheDirty, stats);
    report.clubs[clubName] = clubReport;
  }

  report.failures = stats.failures;
  report.totals.successfulFetches = stats.successCount;

  await ensureDir(path.dirname(OUTPUT_PATH));
  writeJsonFile(OUTPUT_PATH, report);
  console.log(`\n📄 Wrote club breakdown to ${path.relative(ROOT_DIR, OUTPUT_PATH)}`);

  if (cacheDirty.value) {
    writeJsonFile(CACHE_PATH, cache);
    console.log(`💾 Updated cache at ${path.relative(ROOT_DIR, CACHE_PATH)}`);
  } else {
    console.log('ℹ️  Cache already up to date');
  }

  if (report.failures.length) {
    console.log('\n⚠️  Players needing manual follow-up:');
    report.failures.forEach((failure) => {
      console.log(
        `   - ${failure.playerName} (${failure.clubName}): ${failure.reason || 'unknown'}`
      );
    });
  }

  console.log('\n✅ Done!');
};

main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});



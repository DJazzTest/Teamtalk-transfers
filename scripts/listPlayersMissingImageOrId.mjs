/**
 * List all players in the project that are missing a player image and/or a SofaScore ID.
 *
 * - Image: checks if public/player-images/{teamSlug}/{sanitizedName}.png exists.
 * - ID: checks if player is in the corresponding club's SofaScore scraper KNOWN_IDS.
 *
 * Usage: node scripts/listPlayersMissingImageOrId.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const squadPath = path.join(ROOT, 'src', 'data', 'squadWages.ts');

function sanitizePlayerImageName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const squadSource = fs.readFileSync(squadPath, 'utf-8');

// Club key -> { slug, scraper? }
const CLUB_CONFIG = {
  'Arsenal': { slug: 'arsenal', scraper: 'scrapeArsenalPlayersSofaScore.mjs' },
  'Aston Villa': { slug: 'aston-villa', scraper: 'scrapeAstonVillaPlayersSofaScore.mjs' },
  'Chelsea': { slug: 'chelsea', scraper: 'scrapeChelseaPlayersSofaScore.mjs' },
  'Liverpool': { slug: 'liverpool', scraper: 'scrapeLiverpoolPlayersSofaScore.mjs' },
  'Manchester City': { slug: 'man-city', scraper: 'scrapeManCityPlayersSofaScore.mjs' },
  'Manchester United': { slug: 'man-utd', scraper: 'scrapeManUnitedPlayersSofaScore.mjs' },
  'Tottenham Hotspur': { slug: 'tottenham', scraper: 'scrapeTottenhamPlayersSofaScore.mjs' },
  'Newcastle United': { slug: 'newcastle-utd', scraper: 'scrapeNewcastlePlayersSofaScore.mjs' },
  'West Ham United': { slug: 'west-ham', scraper: 'scrapeWestHamPlayersSofaScore.mjs' },
  'Brighton & Hove Albion': { slug: 'brighton', scraper: 'scrapeBrightonPlayersSofaScore.mjs' },
  'Brentford': { slug: 'brentford', scraper: null },
  'Crystal Palace': { slug: 'crystal-palace', scraper: 'scrapeCrystalPalacePlayersSofaScore.mjs' },
  'Wolverhampton Wanderers': { slug: 'wolverhampton', scraper: 'scrapeWolvesPlayersSofaScore.mjs' },
  'Fulham': { slug: 'fulham', scraper: 'scrapeFulhamPlayersSofaScore.mjs' },
  'Nottingham Forest': { slug: 'nottingham', scraper: null },
  'Everton': { slug: 'everton', scraper: 'scrapeEvertonPlayersSofaScore.mjs' },
  'Bournemouth': { slug: 'bournemouth', scraper: 'scrapeBournemouthPlayersSofaScore.mjs' },
  'Burnley': { slug: 'burnley', scraper: 'scrapeBurnleyPlayersSofaScore.mjs' },
  'Sunderland': { slug: 'sunderland', scraper: 'scrapeSunderlandPlayersSofaScore.mjs' },
  'Leeds United': { slug: 'leeds-united', scraper: null },
};

function loadKnownIds(scraperFile) {
  if (!scraperFile) return new Set();
  const p = path.join(ROOT, 'scripts', scraperFile);
  if (!fs.existsSync(p)) return new Set();
  const src = fs.readFileSync(p, 'utf-8');
  const m = src.match(/const KNOWN_IDS\s*=\s*\{([\s\S]*?)\};/m);
  if (!m) return new Set();
  const keys = [...m[1].matchAll(/'((?:[^'\\]|\\.)*)':/g)].map((x) => x[1].replace(/\\'/g, "'"));
  return new Set(keys);
}

function extractArsenalNames() {
  const m = squadSource.match(/'Arsenal':\s*\[([\s\S]*?)\]\s*\.map\(player =>/);
  if (!m) return [];
  return [...m[1].matchAll(/name:\s*'([^']+)'/g)].map((x) => x[1]);
}

function extractAstonVillaNames() {
  const m = squadSource.match(/'Aston Villa':\s*\[([\s\S]*?)\]\.map\(player =>/);
  if (!m) return [];
  return [...m[1].matchAll(/name:\s*'([^']+)'/g)].map((x) => x[1]);
}

function extractCreateImageOnlySquad(clubKey, slug) {
  const escaped = clubKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Match either ]) or ], { (with overrides)
  const re = new RegExp(
    `'${escaped}':\\s*createImageOnlySquad\\s*\\(\\s*'${slug}',\\s*\\[([\\s\\S]*?)\\]\\s*(?:\\)|,\\s*\\{)`,
  );
  const m = squadSource.match(re);
  if (!m) return [];
  const block = m[1];
  // Match quoted strings, allowing \' inside (e.g. Luke O\'Nien)
  return [...block.matchAll(/\s*'((?:[^'\\]|\\.)*)'/g)]
    .map((x) => x[1].trim().replace(/\\'/g, "'"))
    .filter(Boolean);
}

function extractTottenhamNames() {
  const m = squadSource.match(/'Tottenham Hotspur':\s*createImageOnlySquad\s*\(\s*'tottenham',\s*\[([\s\S]*?)\],\s*\{/);
  if (!m) return [];
  return [...m[1].matchAll(/\s*'((?:[^'\\]|\\.)*)'/g)].map((x) => x[1].replace(/\\'/g, "'").trim()).filter(Boolean);
}

function extractNewcastleNames() {
  const m = squadSource.match(/'Newcastle United':\s*createImageOnlySquad\s*\(\s*'newcastle-utd',\s*\[([\s\S]*?)\],\s*\{/);
  if (!m) return [];
  return [...m[1].matchAll(/\s*'((?:[^'\\]|\\.)*)'/g)].map((x) => x[1].replace(/\\'/g, "'").trim()).filter(Boolean);
}

function extractWestHamNames() {
  const m = squadSource.match(/'West Ham United':\s*createImageOnlySquad\s*\(\s*'west-ham',\s*\[([\s\S]*?)\],\s*\{/);
  if (!m) return [];
  return [...m[1].matchAll(/\s*'((?:[^'\\]|\\.)*)'/g)].map((x) => x[1].replace(/\\'/g, "'").trim()).filter(Boolean);
}

function extractWolvesNames() {
  const m = squadSource.match(/'Wolverhampton Wanderers':\s*createImageOnlySquad\s*\(\s*'wolverhampton',\s*\[([\s\S]*?)\],\s*\{/);
  if (!m) return [];
  return [...m[1].matchAll(/\s*'([^']+)'/g)].map((x) => x[1].trim().replace(/\\'/g, "'")).filter(Boolean);
}

function extractSunderlandNames() {
  const m = squadSource.match(/'Sunderland':\s*createImageOnlySquad\s*\(\s*'sunderland',\s*\[([\s\S]*?)\],\s*\{/);
  if (!m) return [];
  return [...m[1].matchAll(/\s*'((?:[^'\\]|\\.)*)'/g)].map((x) => x[1].replace(/\\'/g, "'").trim()).filter(Boolean);
}

function extractBrentfordNames() {
  const m = squadSource.match(/createImageOnlySquad\s*\(\s*'brentford',\s*\[([\s\S]*?)\]\s*\)/);
  if (!m) return [];
  const names = [...m[1].matchAll(/\s*'([^']+)'/g)].map((x) => x[1].trim()).filter(Boolean);
  names.push('Reiss Nelson');
  return names;
}

function extractNottinghamNames() {
  const names = [];
  const re = /createImageOnlySquad\s*\(\s*'nottingham',\s*\[([\s\S]*?)\]\s*\)/g;
  let m;
  while ((m = re.exec(squadSource)) !== null) {
    const block = m[1];
    const part = [...block.matchAll(/\s*'((?:[^'\\]|\\.)*)'/g)].map((x) => x[1].replace(/\\'/g, "'").trim()).filter(Boolean);
    names.push(...part);
  }
  names.push('Oleksandr Zinchenko');
  return [...new Set(names)];
}

function extractLeedsNames() {
  const m = squadSource.match(/'Leeds United':\s*\[([\s\S]*?)\]\s*\.map\(/);
  if (!m) return [];
  return [...m[1].matchAll(/name:\s*'([^']+)'/g)].map((x) => x[1]);
}

function getPlayersForClub(clubKey) {
  const { slug } = CLUB_CONFIG[clubKey];
  switch (clubKey) {
    case 'Arsenal':
      return extractArsenalNames();
    case 'Aston Villa':
      return extractAstonVillaNames();
    case 'Tottenham Hotspur':
      return extractTottenhamNames();
    case 'Newcastle United':
      return extractNewcastleNames();
    case 'West Ham United':
      return extractWestHamNames();
    case 'Wolverhampton Wanderers':
      return extractWolvesNames();
    case 'Sunderland':
      return extractSunderlandNames();
    case 'Brentford':
      return extractBrentfordNames();
    case 'Nottingham Forest':
      return extractNottinghamNames();
    case 'Leeds United':
      return extractLeedsNames();
    default:
      return extractCreateImageOnlySquad(clubKey, slug);
  }
}

function hasImage(slug, playerName) {
  const base = path.join(PUBLIC, 'player-images', slug);
  const file = sanitizePlayerImageName(playerName) + '.png';
  return fs.existsSync(path.join(base, file));
}

const report = [];
const scrapers = {};

for (const [clubKey, config] of Object.entries(CLUB_CONFIG)) {
  const players = getPlayersForClub(clubKey);
  if (!players.length) continue;

  if (config.scraper && !scrapers[config.scraper]) {
    scrapers[config.scraper] = loadKnownIds(config.scraper);
  }
  const knownIds = config.scraper ? scrapers[config.scraper] : new Set();
  const slug = config.slug;

  const missingImage = [];
  const missingId = [];
  const missingBoth = [];

  for (const name of players) {
    const hasImg = hasImage(slug, name);
    const hasId = knownIds.has(name);
    if (!hasImg && !hasId) missingBoth.push(name);
    else if (!hasImg) missingImage.push(name);
    else if (!hasId) missingId.push(name);
  }

  report.push({
    club: clubKey,
    slug,
    total: players.length,
    missingImage,
    missingId,
    missingBoth,
  });
}

// Output
console.log('=== Players missing IMAGE and/or SOFASCORE ID ===\n');

let anyMissing = false;
for (const r of report) {
  const noImage = r.missingImage.length + r.missingBoth.length;
  const noId = r.missingId.length + r.missingBoth.length;
  if (noImage === 0 && noId === 0) continue;
  anyMissing = true;

  console.log(`## ${r.club} (${r.slug}) — ${r.total} players`);
  if (r.missingBoth.length) {
    console.log('  Missing BOTH image and ID:');
    r.missingBoth.forEach((n) => console.log(`    • ${n}`));
  }
  if (r.missingImage.length) {
    console.log('  Missing image only:');
    r.missingImage.forEach((n) => console.log(`    • ${n}`));
  }
  if (r.missingId.length) {
    console.log('  Missing ID only:');
    r.missingId.forEach((n) => console.log(`    • ${n}`));
  }
  console.log('');
}

if (!anyMissing) {
  console.log('All listed players have both an image and a SofaScore ID.');
}

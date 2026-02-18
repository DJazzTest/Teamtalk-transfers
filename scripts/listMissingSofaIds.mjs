/**
 * List players in selected clubs that do NOT have an explicit SofaScore ID
 * in the corresponding KNOWN_IDS maps of our SofaScore scrapers.
 *
 * Scope: focuses on clubs we've been curating in detail:
 *  - Aston Villa
 *  - Newcastle United
 *  - Tottenham Hotspur
 *  - West Ham United
 *  - Wolverhampton Wanderers
 *  - Sunderland
 *
 * Usage:
 *   node scripts/listMissingSofaIds.mjs
 */

import fs from 'fs';
import path from 'path';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const squadPath = path.join(ROOT, 'src', 'data', 'squadWages.ts');

const clubs = [
  {
    clubKey: 'Aston Villa',
    type: 'aston',
    scraper: 'scrapeAstonVillaPlayersSofaScore.mjs',
  },
  {
    clubKey: 'Newcastle United',
    type: 'image',
    slug: 'newcastle-utd',
    scraper: 'scrapeNewcastlePlayersSofaScore.mjs',
  },
  {
    clubKey: 'Tottenham Hotspur',
    type: 'image',
    slug: 'tottenham',
    scraper: 'scrapeTottenhamPlayersSofaScore.mjs',
  },
  {
    clubKey: 'West Ham United',
    type: 'image',
    slug: 'west-ham',
    scraper: 'scrapeWestHamPlayersSofaScore.mjs',
  },
  {
    clubKey: 'Wolverhampton Wanderers',
    type: 'image',
    slug: 'wolverhampton',
    scraper: 'scrapeWolvesPlayersSofaScore.mjs',
  },
  {
    clubKey: 'Sunderland',
    type: 'image',
    slug: 'sunderland',
    scraper: 'scrapeSunderlandPlayersSofaScore.mjs',
  },
];

const squadSource = fs.readFileSync(squadPath, 'utf-8');

function extractAstonVillaNames() {
  const m = squadSource.match(/'Aston Villa':\s*\[([\s\S]*?)\]\.map\(player =>/);
  if (!m) return [];
  const block = m[1];
  const names = [...block.matchAll(/name:\s*'([^']+)'/g)].map((x) => x[1]);
  return names;
}

function extractImageSquadNames(clubKey, slug) {
  const re = new RegExp(
    `'${clubKey.replace(/[-/\\^$*+?.()|[\\]{}]/g, '\\\\$&')}':\\s*createImageOnlySquad\\s*\\(\\s*'${slug}',\\s*\\[([\\s\\S]*?)\\]\\s*,?`,
  );
  const m = squadSource.match(re);
  if (!m) return [];
  const block = m[1];
  const names = [...block.matchAll(/\s*'([^']+)'/g)].map((x) =>
    x[1].trim().replace(/\\'/g, "'"),
  );
  return names;
}

function loadKnownIds(scraperFile) {
  const p = path.join(ROOT, 'scripts', scraperFile);
  const src = fs.readFileSync(p, 'utf-8');
  const m = src.match(/const KNOWN_IDS\s*=\s*\{([\s\S]*?)\};/);
  if (!m) return new Set();
  const body = m[1];
  const keys = [...body.matchAll(/'([^']+)':/g)].map((x) => x[1]);
  return new Set(keys);
}

const report = [];

for (const club of clubs) {
  let players = [];
  if (club.type === 'aston') {
    players = extractAstonVillaNames();
  } else if (club.type === 'image') {
    players = extractImageSquadNames(club.clubKey, club.slug);
  }
  const known = loadKnownIds(club.scraper);

  const missing = players.filter((name) => !known.has(name));

  report.push({
    club: club.clubKey,
    total: players.length,
    withId: players.length - missing.length,
    withoutId: missing,
  });
}

console.log('Players without explicit SofaScore IDs (by club):\n');
for (const r of report) {
  console.log(`- ${r.club}: ${r.withId}/${r.total} have IDs`);
  if (r.withoutId.length) {
    console.log('  Missing IDs for:');
    for (const name of r.withoutId) {
      console.log(`    • ${name}`);
    }
  } else {
    console.log('  All players have explicit IDs.');
  }
  console.log('');
}


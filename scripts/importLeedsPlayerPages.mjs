#!/usr/bin/env node

/**
 * Fetch individual FBref player pages for Leeds United
 * using the playerPath values from leeds-fbref-standard-stats.json.
 *
 * This does NOT fully parse every table yet – it:
 * - Downloads each player page HTML to scripts/output/leeds-players/{slug}.html
 * - Emits a lightweight index JSON with:
 *   { name, position, age, standardStats, playerPath, file }
 *
 * You can run this locally (where you have normal browser-like access to FBref):
 *
 *   cd ~/Documents/Team-TalkTransfers
 *   node scripts/importLeedsPlayerPages.mjs
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const OUTPUT_DIR = path.join(ROOT, 'scripts', 'output');
const INPUT_STANDARD_PATH = path.join(OUTPUT_DIR, 'leeds-fbref-standard-stats.json');
const PLAYER_HTML_DIR = path.join(OUTPUT_DIR, 'leeds-players');
const INDEX_OUTPUT_PATH = path.join(OUTPUT_DIR, 'leeds-players-index.json');

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  });
  if (!res.ok) {
    throw new Error(`FBref HTTP ${res.status} for ${url}`);
  }
  return await res.text();
}

function slugifyName(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  if (!fs.existsSync(INPUT_STANDARD_PATH)) {
    console.error(`❌ Cannot find ${INPUT_STANDARD_PATH}. Run importLeedsFbrefStats.mjs first.`);
    process.exit(1);
  }

  const standard = JSON.parse(fs.readFileSync(INPUT_STANDARD_PATH, 'utf8'));
  if (!Array.isArray(standard)) {
    console.error('❌ leeds-fbref-standard-stats.json is not an array');
    process.exit(1);
  }

  if (!fs.existsSync(PLAYER_HTML_DIR)) {
    fs.mkdirSync(PLAYER_HTML_DIR, { recursive: true });
  }

  const index = [];

  for (const player of standard) {
    const { name, playerPath } = player;
    if (!name || !playerPath) {
      continue;
    }
    const slug = slugifyName(name);
    const url = `https://fbref.com${playerPath}`;
    const outFile = path.join(PLAYER_HTML_DIR, `${slug}.html`);

    try {
      console.log(`🔎 Fetching ${name} -> ${url}`);
      const html = await fetchHtml(url);
      fs.writeFileSync(outFile, html, 'utf8');

      index.push({
        name,
        position: player.position || null,
        age: player.age ?? null,
        standardStats: {
          matches: player.matches ?? null,
          starts: player.starts ?? null,
          minutes: player.minutes ?? null,
          goals: player.goals ?? null,
          assists: player.assists ?? null,
          shots: player.shots ?? null,
          shotsOnTarget: player.shotsOnTarget ?? null,
          yellowCards: player.yellowCards ?? null,
          redCards: player.redCards ?? null,
          xg: player.xg ?? null,
          npxg: player.npxg ?? null,
          xgAssist: player.xgAssist ?? null
        },
        playerPath,
        file: path.relative(ROOT, outFile)
      });
    } catch (err) {
      console.error(`❌ Failed to fetch ${name} (${url}):`, err.message || err);
    }
  }

  fs.writeFileSync(INDEX_OUTPUT_PATH, JSON.stringify(index, null, 2), 'utf8');
  console.log(`✅ Saved HTML pages for ${index.length} Leeds players to ${path.relative(ROOT, PLAYER_HTML_DIR)}`);
  console.log(`💾 Index written to ${path.relative(ROOT, INDEX_OUTPUT_PATH)}`);
}

main().catch((err) => {
  console.error('Fatal error while importing Leeds player pages:', err);
  process.exit(1);
});


#!/usr/bin/env node
/**
 * Scrape per-player FBref profile pages for selected clubs (starting with Leeds United & Manchester United)
 * and write a consolidated JSON file with richer profile data.
 *
 * Input:
 *   - public/fbref-urls.json (clubs + squadUrl + players[].url)
 *
 * Output:
 *   - public/fbref-player-profiles.json
 *
 * Usage (on your machine, not in-browser):
 *   npx playwright install chromium   # first time
 *   npm run scrape:fbref-player-profiles
 *
 * NOTE: This is best-effort and may need tweaks if FBref changes table IDs.
 */

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const URLS_FILE = path.join(ROOT, 'public', 'fbref-urls.json');
const OUT_FILE = path.join(ROOT, 'public', 'fbref-player-profiles.json');

const FBREF_ORIGIN = 'https://fbref.com';

/** Safe JSON read */
function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Normalise name for matching */
function normaliseName(name) {
  return (name || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Extracts a table into an array-of-rows structure from a given table element.
 * We keep headers + a raw rows representation; downstream UI can decide what to render.
 */
function extractTable(table) {
  if (!table) return null;
  const headerCells = Array.from(table.querySelectorAll('thead tr th')).map((th) =>
    (th.textContent || '').trim()
  );

  const rows = Array.from(table.querySelectorAll('tbody tr')).map((tr) => {
    const cells = Array.from(tr.querySelectorAll('th, td')).map((td) =>
      (td.textContent || '').trim()
    );
    return cells;
  });

  return {
    headers: headerCells,
    rows,
  };
}

/**
 * Scrape a single player profile page for a subset of tables we care about.
 * This is tuned towards keeper / standard stats, but should be generic enough.
 */
async function scrapePlayerProfile(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
  await page.waitForTimeout(1500);

  const data = await page.evaluate(() => {
    const out = {};

    // Basic identity info from the header
    const h1 = document.querySelector('h1[itemprop=\"name\"], h1');
    out.name = h1 ? (h1.textContent || '').trim() : null;

    // Try to find primary position & club from the meta block
    const infoBox = document.querySelector('#meta') || document.querySelector('#info');
    if (infoBox) {
      const paragraphs = Array.from(infoBox.querySelectorAll('p')).map((p) =>
        (p.textContent || '').trim()
      );
      out.bioBlocks = paragraphs;
    }

    // Helper to get a table by id (FBref uses many ids; we target common ones)
    function getTable(id) {
      const wrap = document.getElementById(id);
      if (!wrap) return null;
      const table = wrap.querySelector('table');
      if (!table) return null;
      return table;
    }

    // Standard stats: Domestic leagues (outfield) – often id like "stats_standard_dom_lg"
    const standardDomTable =
      getTable('stats_standard_dom_lg') ||
      getTable('stats_standard_ks_dom_lg') ||
      getTable('stats_standard') ||
      document.querySelector('table#stats_standard_dom_lg, table#stats_standard');

    // Goalkeeping stats: Domestic leagues – keeper-specific
    const keeperDomTable =
      getTable('stats_keeper_dom_lg') ||
      getTable('stats_keeper') ||
      document.querySelector('table#stats_keeper_dom_lg, table#stats_keeper');

    // Playing time: Domestic leagues
    const playingTimeTable =
      getTable('stats_playing_time_dom_lg') ||
      getTable('stats_playing_time') ||
      document.querySelector('table#stats_playing_time_dom_lg, table#stats_playing_time');

    // Misc: Domestic leagues
    const miscTable =
      getTable('stats_misc_dom_lg') ||
      getTable('stats_misc') ||
      document.querySelector('table#stats_misc_dom_lg, table#stats_misc');

    // Last 5 matches / match logs – sometimes in a "Match Logs" table with id "matchlogs_all"
    const matchLogTable =
      getTable('matchlogs_all') ||
      getTable('matchlogs_2025-2026') ||
      document.querySelector('table#matchlogs_all');

    function tableToObject(table) {
      if (!table) return null;
      const headerCells = Array.from(table.querySelectorAll('thead tr th')).map((th) =>
        (th.textContent || '').trim()
      );
      const rows = Array.from(table.querySelectorAll('tbody tr')).map((tr) => {
        const cells = Array.from(tr.querySelectorAll('th, td')).map((td) =>
          (td.textContent || '').trim()
        );
        return cells;
      });
      return { headers: headerCells, rows };
    }

    out.tables = {
      standardDomesticLeagues: tableToObject(standardDomTable),
      keeperDomesticLeagues: tableToObject(keeperDomTable),
      playingTimeDomesticLeagues: tableToObject(playingTimeTable),
      miscDomesticLeagues: tableToObject(miscTable),
      matchLogs: tableToObject(matchLogTable),
    };

    return out;
  });

  return data;
}

async function main() {
  const urlsConfig = readJson(URLS_FILE);
  if (!urlsConfig || !Array.isArray(urlsConfig.clubs)) {
    console.error('fbref-urls.json missing or invalid. Run scrape:fbref-urls or add clubs first.');
    process.exit(1);
  }

  // Focus on Leeds + Man Utd for now
  const targetSlugs = new Set(['leeds-united', 'manchester-united']);
  const targetClubs = urlsConfig.clubs.filter((c) => targetSlugs.has(c.slug));
  if (targetClubs.length === 0) {
    console.warn('No Leeds/Manchester United clubs found in fbref-urls.json');
  }

  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  const profiles = [];

  try {
    for (const club of targetClubs) {
      console.log(`\nClub: ${club.name} (${club.slug})`);
      const players = Array.isArray(club.players) ? club.players : [];
      for (const player of players) {
        if (!player.url) continue;
        const url = player.url.startsWith('http') ? player.url : `${FBREF_ORIGIN}${player.url}`;
        console.log(`  Player: ${player.name} -> ${url}`);
        try {
          const scraped = await scrapePlayerProfile(page, url);
          profiles.push({
            clubSlug: club.slug,
            clubName: club.name,
            fbrefUrl: url,
            fbrefId: url.match(/\/players\/([a-z0-9]+)/)?.[1] || null,
            name: player.name || scraped.name,
            scrapedName: scraped.name,
            bioBlocks: scraped.bioBlocks || [],
            tables: scraped.tables || {},
          });
        } catch (e) {
          console.warn(`    Failed to scrape ${player.name}: ${e.message}`);
        }
        await page.waitForTimeout(500);
      }
    }
  } finally {
    await browser.close();
  }

  const out = {
    scrapedAt: new Date().toISOString(),
    profiles,
  };

  const outDir = path.dirname(OUT_FILE);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), 'utf8');
  console.log('\nWrote', path.relative(ROOT, OUT_FILE));
  console.log('Profiles:', profiles.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


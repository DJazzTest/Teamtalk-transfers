#!/usr/bin/env node
/**
 * Scrape only Arsenal squad page for player URLs and merge into public/fbref-urls.json.
 * Keeps existing clubs (e.g. Leeds) intact and only updates Arsenal's players list.
 *
 * Usage:
 *   npx playwright install chromium   # first time only
 *   node scripts/scrapeFbrefArsenalOnly.mjs
 *   npm run scrape:fbref-arsenal
 */

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_FILE = path.join(ROOT, 'public', 'fbref-urls.json');
const ARSENAL_SQUAD_URL = 'https://fbref.com/en/squads/18bb7c10/Arsenal-Stats';
const FBREF_ORIGIN = 'https://fbref.com';

function fullUrl(href) {
  if (href.startsWith('http')) return href;
  return href.startsWith('/') ? `${FBREF_ORIGIN}${href}` : `${FBREF_ORIGIN}/${href}`;
}

async function main() {
  let config;
  try {
    const raw = fs.readFileSync(OUT_FILE, 'utf8');
    config = JSON.parse(raw);
    if (!config.clubs || !Array.isArray(config.clubs)) {
      config = { compUrl: 'https://fbref.com/en/comps/9/Premier-League-Stats', scrapedAt: null, clubs: [] };
    }
  } catch (e) {
    config = { compUrl: 'https://fbref.com/en/comps/9/Premier-League-Stats', scrapedAt: null, clubs: [] };
  }

  const arsenalIndex = config.clubs.findIndex((c) => c.slug === 'arsenal' || c.name === 'Arsenal');
  if (arsenalIndex === -1) {
    config.clubs.push({
      name: 'Arsenal',
      slug: 'arsenal',
      squadUrl: ARSENAL_SQUAD_URL,
      players: [],
    });
  }

  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  const players = [];
  try {
    console.log('Fetching Arsenal squad:', ARSENAL_SQUAD_URL);
    await page.goto(ARSENAL_SQUAD_URL, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(2000);

    const playerLinks = await page.evaluate((origin) => {
      const out = [];
      const seen = new Set();
      document.querySelectorAll('a[href*="/players/"]').forEach((a) => {
        const href = a.getAttribute('href') || '';
        if (!href.match(/\/players\/[a-z0-9]+\/[^/]+/) || href.includes('#') || seen.has(href)) return;
        seen.add(href);
        const name = (a.textContent || '').trim();
        if (name && name.length > 1 && name.length < 80) out.push({ href: href.split('?')[0], name });
      });
      return out;
    }, FBREF_ORIGIN);

    for (const p of playerLinks) {
      players.push({ name: p.name, url: fullUrl(p.href) });
    }
    const byUrl = new Map();
    players.forEach((p) => byUrl.set(p.url, p));
    console.log('Arsenal players found:', byUrl.size);
  } catch (e) {
    console.error('Scrape failed:', e.message);
  } finally {
    await browser.close();
  }

  const idx = config.clubs.findIndex((c) => c.slug === 'arsenal' || c.name === 'Arsenal');
  const scrapedList = (() => {
    const byUrl = new Map();
    players.forEach((p) => byUrl.set(p.url, p));
    return Array.from(byUrl.values());
  })();
  if (idx !== -1) {
    config.clubs[idx] = {
      ...config.clubs[idx],
      squadUrl: ARSENAL_SQUAD_URL,
      players: scrapedList.length ? scrapedList : config.clubs[idx].players,
      error: scrapedList.length ? undefined : 'Scrape failed or no players found',
    };
  }

  const outDir = path.dirname(OUT_FILE);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(config, null, 2), 'utf8');
  console.log('Updated', path.relative(ROOT, OUT_FILE));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

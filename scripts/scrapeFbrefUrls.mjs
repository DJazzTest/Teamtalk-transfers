#!/usr/bin/env node
/**
 * Scrape FBref Premier League page for all club squad URLs, then each squad for all player URLs.
 * Writes public/fbref-urls.json for use by CMS and pull jobs.
 *
 * Usage:
 *   npx playwright install chromium   # first time only
 *   node scripts/scrapeFbrefUrls.mjs
 *   npm run scrape:fbref-urls
 *
 * Requires: playwright
 */

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_FILE = path.join(ROOT, 'public', 'fbref-urls.json');

const COMP_URL = 'https://fbref.com/en/comps/9/Premier-League-Stats';
const FBREF_ORIGIN = 'https://fbref.com';

/** Derive slug from squad URL path, e.g. Arsenal-Stats -> arsenal, Leeds-United-Stats -> leeds-united */
function slugFromSquadPath(href) {
  const match = href.match(/\/squads\/[^/]+\/([^/]+)/);
  if (!match) return null;
  const name = match[1].replace(/-Stats$/, '').replace(/-/g, ' ');
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/** Full URL from href (may be path-only) */
function fullUrl(href) {
  if (href.startsWith('http')) return href;
  return href.startsWith('/') ? `${FBREF_ORIGIN}${href}` : `${FBREF_ORIGIN}/${href}`;
}

async function main() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  const result = {
    compUrl: COMP_URL,
    scrapedAt: new Date().toISOString(),
    clubs: [],
  };

  try {
    // 1) Premier League Stats page: collect all squad links
    console.log('Fetching Premier League table:', COMP_URL);
    await page.goto(COMP_URL, { waitUntil: 'load', timeout: 25000 });
    await page.waitForSelector('a[href*="squads"]', { timeout: 20000 }).catch(() => null);
    await page.waitForTimeout(2000);

    const squadLinks = await page.evaluate((origin) => {
      const out = [];
      const seen = new Set();
      document.querySelectorAll('a[href*="squads"]').forEach((a) => {
        const href = (a.getAttribute('href') || '').trim();
        if (!href.includes('/squads/') || href.includes('#')) return;
        const pathPart = href.split('?')[0];
        // Must look like .../squads/ID/Name (ID alphanumeric, Name can have hyphens)
        if (!pathPart.match(/\/squads\/[a-zA-Z0-9]+\/[^/#?]+$/)) return;
        if (seen.has(pathPart)) return;
        seen.add(pathPart);
        const name = (a.textContent || '').trim();
        out.push({ href: pathPart, name: name || null });
      });
      return out;
    }, FBREF_ORIGIN);

    let linksToUse = squadLinks;
    if (squadLinks.length === 0) {
      const fallback = await page.evaluate(() => {
        const out = [];
        document.querySelectorAll('a[href*="squads"]').forEach((a) => {
          const href = (a.getAttribute('href') || '').split('?')[0];
          if (!href.includes('/squads/') || href.includes('#')) return;
          const name = (a.textContent || '').trim();
          if (name && name.length < 50) out.push({ href, name });
        });
        return out;
      });
      if (fallback.length) {
        linksToUse = fallback;
        console.log('Fallback found', fallback.length, 'squad links');
      }
    }

    const uniqueSquads = [];
    const seenPaths = new Set();
    for (const { href, name } of linksToUse) {
      const pathKey = href.replace(/^https?:\/\/[^/]+/, '');
      if (seenPaths.has(pathKey)) continue;
      seenPaths.add(pathKey);
      const slug = slugFromSquadPath(href) || pathKey.replace(/\/squads\/[^/]+\//, '').replace(/-Stats$/, '').toLowerCase().replace(/\s+/g, '-');
      uniqueSquads.push({
        href: fullUrl(href),
        name: name || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        slug,
      });
    }

    if (uniqueSquads.length === 0) {
      console.warn('No squad links found. FBref may block automated access (403). Run this script from your local machine or a network that can load fbref.com.');
    }
    console.log(`Found ${uniqueSquads.length} squads. Fetching player links for each...`);

    for (const squad of uniqueSquads) {
      console.log(`  ${squad.name} (${squad.slug})`);
      const players = [];
      try {
        await page.goto(squad.href, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(1500);

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
          players.push({
            name: p.name,
            url: fullUrl(p.href),
          });
        }
        // Dedupe by URL
        const byUrl = new Map();
        players.forEach((p) => byUrl.set(p.url, p));
        result.clubs.push({
          name: squad.name,
          slug: squad.slug,
          squadUrl: squad.href,
          players: Array.from(byUrl.values()),
        });
      } catch (e) {
        console.warn(`    Failed: ${e.message}`);
        result.clubs.push({
          name: squad.name,
          slug: squad.slug,
          squadUrl: squad.href,
          players: [],
          error: e.message,
        });
      }
      await page.waitForTimeout(400);
    }
  } finally {
    await browser.close();
  }

  const outDir = path.dirname(OUT_FILE);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(result, null, 2), 'utf8');
  console.log('\nWrote', path.relative(ROOT, OUT_FILE));
  console.log('Clubs:', result.clubs.length);
  console.log('Total players:', result.clubs.reduce((s, c) => s + c.players.length, 0));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

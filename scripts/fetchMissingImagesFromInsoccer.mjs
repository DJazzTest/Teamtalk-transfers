#!/usr/bin/env node

/**
 * Fetch images for players still missing images, using insoccer.com squad pages.
 *
 * Flow:
 *  - Reads scripts/players-still-missing-images.json
 *  - For supported clubs, fetches the insoccer squad page
 *  - Finds the matching player row and extracts the scoremania avatar URL
 *  - Downloads the image into public/player-images/{club-slug}/{player-slug}.png
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const PLAYER_IMAGES_DIR = path.join(ROOT_DIR, 'public', 'player-images');
const STILL_MISSING_PATH = path.join(__dirname, 'players-still-missing-images.json');

function slugifyName(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/** Map of canonical club name (as in missing list) to our slug and insoccer URL */
const CLUB_MAPPINGS = {
  Chelsea: {
    slug: 'chelsea',
    url: 'https://www.insoccer.com/football/team/chelsea/2/squad'
  },
  'Aston Villa': {
    slug: 'aston-villa',
    url: 'https://www.insoccer.com/football/team/aston-villa/12/squad'
  },
  Fulham: {
    slug: 'fulham',
    url: 'https://www.insoccer.com/football/team/fulham/15/squad'
  },
  'Nottingham Forest': {
    slug: 'nottingham',
    url: 'https://www.insoccer.com/football/team/nottingham-forest/16/squad'
  },
  'West Ham': {
    slug: 'west-ham',
    url: 'https://www.insoccer.com/football/team/west-ham-united/21/squad'
  },
  'Manchester United': {
    slug: 'man-utd',
    url: 'https://www.insoccer.com/football/team/manchester-united/20/squad'
  }
};

async function fetchText(url, retries = 3) {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      if (!res.ok) {
        lastErr = new Error(`HTTP ${res.status}`);
        continue;
      }
      return await res.text();
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw lastErr || new Error('Unknown fetch error');
}

/**
 * Try to find a player avatar URL on the insoccer squad page.
 * We search for a line / snippet containing the player name and a scoremania player-pictures URL.
 */
function extractPlayerImageUrl(html, playerName) {
  if (!html) return null;

  const lower = html.toLowerCase();
  const nameLower = playerName.toLowerCase();

  // Narrow to chunks that mention the player name
  const chunks = lower.split('\n').filter((line) => line.includes(nameLower));
  const candidates = chunks.length ? chunks : [lower];

  const urlRegex =
    /https:\/\/scoremania\.com\/v1\/sports\/football\/player-pictures\/[^"')\s?]+(?:\?[^"')\s]*)?/gi;

  for (const chunk of candidates) {
    let match;
    while ((match = urlRegex.exec(chunk)) !== null) {
      const url = match[0];
      if (url.includes('player-pictures')) {
        return url;
      }
    }
  }
  return null;
}

async function downloadImage(imageUrl, outputPath) {
  const res = await fetch(imageUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  if (!res.ok) {
    throw new Error(`Image HTTP ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outputPath, buf);
}

async function main() {
  if (!fs.existsSync(STILL_MISSING_PATH)) {
    console.error('❌ players-still-missing-images.json not found – run getRemainingMissingPlayers.mjs first.');
    process.exit(1);
  }

  const missing = JSON.parse(fs.readFileSync(STILL_MISSING_PATH, 'utf8'));

  // Group missing players by club (canonical name)
  const playersByClub = new Map();
  for (const p of missing) {
    const clubName = p.club;
    if (!playersByClub.has(clubName)) playersByClub.set(clubName, []);
    playersByClub.get(clubName).push(p);
  }

  console.log('🔎 Fetching missing images from insoccer.com squad pages…\n');

  for (const [clubName, players] of playersByClub.entries()) {
    const mapping = CLUB_MAPPINGS[clubName];
    if (!mapping) {
      console.log(`⚠️  No insoccer mapping configured for club: ${clubName}`);
      continue;
    }

    console.log(`\n🏟  ${clubName} (${mapping.slug})`);
    let html;
    try {
      html = await fetchText(mapping.url);
    } catch (e) {
      console.error(`  ❌ Failed to fetch squad page: ${e.message}`);
      continue;
    }

    for (const player of players) {
      const playerName = player.playerName;
      const playerSlug = slugifyName(playerName);
      const imagePath = path.join(PLAYER_IMAGES_DIR, mapping.slug, `${playerSlug}.png`);

      if (fs.existsSync(imagePath)) {
        console.log(`  ✅ Already exists: ${playerName} -> ${imagePath}`);
        continue;
      }

      console.log(`  ▶︎ ${playerName}`);
      const imageUrl = extractPlayerImageUrl(html, playerName);
      if (!imageUrl) {
        console.log('    ⚠️  No avatar URL found on squad page');
        continue;
      }

      try {
        await downloadImage(imageUrl, imagePath);
        console.log(`    ✅ Saved image from ${imageUrl}`);
      } catch (e) {
        console.log(`    ❌ Download failed: ${e.message}`);
      }
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  console.log('\n✅ Completed fetchMissingImagesFromInsoccer');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});


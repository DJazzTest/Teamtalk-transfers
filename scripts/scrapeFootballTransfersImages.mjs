/**
 * Scrape player images from FootballTransfers and save to public/player-images/{teamSlug}
 *
 * Usage:
 *   node scripts/scrapeFootballTransfersImages.mjs --team=arsenal --url=https://...
 *
 * Notes:
 * - Defaults to Arsenal if no arguments are provided.
 * - Downloads images to public/player-images/{teamSlug}/{player-slug}.png
 * - Writes manifest JSON with mapping for audit: public/player-images/{teamSlug}/manifest.json
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const argMap = Object.fromEntries(
  args
    .filter(arg => arg.includes('='))
    .map(arg => {
      const [key, value] = arg.split('=');
      return [key.replace(/^--/, ''), value];
    })
);

const teamSlug = (argMap.team || 'arsenal').toLowerCase();
const teamUrl = argMap.url || `https://www.footballtransfers.com/en/teams/uk/${teamSlug}`;

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'player-images', teamSlug);
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function sanitizeName(name) {
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

async function fetchText(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TeamTalkTransfersBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirect
        resolve(fetchText(res.headers.location));
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk.toString('utf-8'));
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.end();
  });
}

async function downloadToFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TeamTalkTransfersBot/1.0)',
        'Accept': '*/*',
      }
    }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirect
        resolve(downloadToFile(res.headers.location, destPath));
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const tmpPath = `${destPath}.part`;
      const file = fs.createWriteStream(tmpPath);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          fs.renameSync(tmpPath, destPath);
          resolve();
        });
      });
      file.on('error', (err) => {
        try { fs.unlinkSync(tmpPath); } catch {}
        reject(err);
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function extractPlayersAndImages(html) {
  // The page contains rows with player name hyperlinks and image tags
  // Example snippet:
  // <img src="https://images.footballtransfers.com/?url=https://static.footballtransfers.com/resources/players/97067-alt.webp&h=120">
  // <a ...>David Raya</a>
  // We'll parse crude pairs by scanning lines around image tags.

  const results = [];
  // Quick regex for image URLs and attempt to get the following player name anchor nearby
  const imgRegex = /<img[^>]+src="([^"]*images\.footballtransfers\.com[^"]+)"[^>]*>\s*[^<]*\n?[^<]*\n?[^<]*?<a[^>]+>([^<]+)<\/a>/gim;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const imgUrl = match[1];
    const playerName = match[2].replace(/\s+/g, ' ').trim();
    if (playerName && imgUrl) {
      results.push({ name: playerName, imageUrl: imgUrl });
    }
  }

  // Fallback: extract pairs by scanning table rows
  if (results.length === 0) {
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gim;
    let row;
    while ((row = rowRegex.exec(html)) !== null) {
      const rowHtml = row[1];
      const imgMatch = rowHtml.match(/<img[^>]+src="([^"]*images\.footballtransfers\.com[^"]+)"/i);
      const nameMatch = rowHtml.match(/<a[^>]+>([^<]+)<\/a>/i);
      const imgUrl = imgMatch?.[1];
      const playerName = nameMatch?.[1]?.trim();
      if (imgUrl && playerName) {
        results.push({ name: playerName, imageUrl: imgUrl });
      }
    }
  }

  // De-duplicate by name
  const seen = new Set();
  return results.filter(({ name }) => {
    const key = name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function main() {
  console.log(`🔎 Fetching ${teamSlug} team page...`);
  const html = await fetchText(teamUrl);
  console.log('✅ Page fetched. Extracting players and images...');
  const pairs = extractPlayersAndImages(html);
  if (pairs.length === 0) {
    console.log('⚠️ No player-image pairs found. The page structure may have changed.');
    process.exit(1);
  }
  console.log(`✅ Found ${pairs.length} players with image URLs`);

  // Ensure output dir
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const manifest = [];
  let downloaded = 0;
  for (const { name, imageUrl } of pairs) {
    const slug = sanitizeName(name);
    const outPath = path.join(OUTPUT_DIR, `${slug}.png`);

    // Prefer the proxied URL directly (it's already resized). If it wraps another 'url' query param, we can still download the proxy.
    const urlToDownload = imageUrl;
    try {
      await downloadToFile(urlToDownload, outPath);
      downloaded++;
      manifest.push({ name, slug, image: `/${path.posix.join('player-images', teamSlug, `${slug}.png`)}`, source: imageUrl });
      console.log(`🖼️  Saved: ${name} -> ${outPath}`);
      // Rate limit politely
      await sleep(150);
    } catch (err) {
      console.warn(`⚠️ Failed to download ${name} image: ${urlToDownload} — ${err.message}`);
    }
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify({ team: teamSlug, count: manifest.length, images: manifest }, null, 2));
  console.log(`\n🎉 Done. Downloaded ${downloaded}/${pairs.length} images.`);
  console.log(`🗂️  Manifest: ${MANIFEST_PATH}`);
}

main().catch(err => {
  console.error('❌ Scrape failed:', err);
  process.exit(1);
});



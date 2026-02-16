#!/usr/bin/env node

/**
 * Auto-extract images only for players still missing images.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function slugifyName(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const proxyUrls = [
      `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
      url
    ];
    for (const proxyUrl of proxyUrls) {
      try {
        const response = await fetch(proxyUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });
        if (!response.ok) continue;
        let html = await response.text();
        if (proxyUrl.includes('allorigins.win')) {
          try {
            const data = JSON.parse(html);
            html = data.contents;
          } catch {}
        }
        return html;
      } catch {
        // try next proxy
      }
    }
    await new Promise(r => setTimeout(r, 1000 * (i + 1)));
  }
  return null;
}

function extractPlayerImageFromHTML(html) {
  if (!html) return null;
  const patterns = [
    /<img[^>]+(?:class|data-src|src)=["']([^"']*player[^"']*\.(?:jpg|jpeg|png|webp))["']/gi,
    /<img[^>]+src=["']([^"']*\/players\/[^"']*\.(?:jpg|jpeg|png|webp))["']/gi,
    /<img[^>]+data-src=["']([^"']*\.(?:jpg|jpeg|png|webp))["']/gi,
    /<img[^>]+src=["'](https?:\/\/[^"']*\.(?:jpg|jpeg|png|webp))["']/gi
  ];
  const foundImages = new Set();
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      let imageUrl = match[1];
      if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
      else if (imageUrl.startsWith('/')) imageUrl = 'https://www.transferfeed.com' + imageUrl;
      if (!imageUrl.includes('logo') &&
          !imageUrl.includes('badge') &&
          !imageUrl.includes('icon') &&
          !imageUrl.includes('placeholder') &&
          imageUrl.match(/\.(jpg|jpeg|png|webp)$/i)) {
        foundImages.add(imageUrl);
      }
    }
  }
  return foundImages.size ? Array.from(foundImages)[0] : null;
}

async function downloadImage(imageUrl, outputPath) {
  try {
    const response = await fetch(imageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = await response.arrayBuffer();
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    return true;
  } catch (e) {
    console.error('  ❌ Download error:', e.message);
    return false;
  }
}

async function processPlayer(player, index, total) {
  const { playerName, club, transferFeedUrl } = player;
  console.log(`\n[${index + 1}/${total}] ${playerName} (${club})`);
  console.log('  URL:', transferFeedUrl);
  const html = await fetchWithRetry(transferFeedUrl);
  if (!html) {
    console.log('  ⚠️  Could not fetch page');
    return { success: false, reason: 'fetch_failed' };
  }
  const imageUrl = extractPlayerImageFromHTML(html);
  if (!imageUrl) {
    console.log('  ⚠️  No image found');
    return { success: false, reason: 'no_image_found' };
  }
  console.log('  ✅ Found image:', imageUrl);
  const clubSlug = slugifyName(club);
  const playerSlug = slugifyName(playerName);
  const outPath = path.join(__dirname, '../public/player-images', clubSlug, `${playerSlug}.png`);
  const ok = await downloadImage(imageUrl, outPath);
  if (ok) console.log('  ✅ Saved:', outPath);
  return { success: ok, reason: ok ? undefined : 'download_failed' };
}

async function main() {
  const stillPath = path.join(__dirname, 'players-still-missing-images.json');
  if (!fs.existsSync(stillPath)) {
    console.error('players-still-missing-images.json not found; run getRemainingMissingPlayers.mjs first');
    process.exit(1);
  }
  const players = JSON.parse(fs.readFileSync(stillPath, 'utf-8'));
  const total = players.length;
  console.log(`Processing ${total} players still missing images...`);
  let idx = 0;
  for (const p of players) {
    await processPlayer(p, idx++, total);
    await new Promise(r => setTimeout(r, 800));
  }
  console.log('\n✅ Finished autoExtractRemainingImages');
}

main().catch(e => { console.error('Fatal error:', e); process.exit(1); });


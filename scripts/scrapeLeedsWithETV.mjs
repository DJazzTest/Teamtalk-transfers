/**
 * Scrape Leeds United player images and ETV values from FootballTransfers
 * 
 * Usage:
 *   node scripts/scrapeLeedsWithETV.mjs
 * 
 * Outputs:
 * - Downloads images to public/player-images/leeds-united/{player-slug}.png
 * - Creates manifest with ETV values in public/player-images/leeds-united/etv-data.json
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEAM_URL = 'https://www.footballtransfers.com/en/teams/uk/leeds-united';
const TEAM_SLUG = 'leeds-united';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'player-images', TEAM_SLUG);
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json');
const ETV_DATA_PATH = path.join(OUTPUT_DIR, 'etv-data.json');

// Euro to Pound conversion rate (approximate, can be updated)
const EUR_TO_GBP = 0.85;

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

function parseETV(etvText) {
  if (!etvText) return null;
  
  // Extract value like "€14.2M" or "€0.4M"
  const match = etvText.match(/€([\d.]+)([MK])?/i);
  if (!match) return null;
  
  const value = parseFloat(match[1]);
  const multiplier = match[2]?.toUpperCase();
  
  let euroValue = value;
  if (multiplier === 'M') {
    euroValue = value * 1000000;
  } else if (multiplier === 'K') {
    euroValue = value * 1000;
  }
  
  // Convert to GBP
  const gbpValue = euroValue * EUR_TO_GBP;
  
  return {
    euro: euroValue,
    euroFormatted: etvText,
    gbp: gbpValue,
    gbpFormatted: `£${(gbpValue / 1000000).toFixed(2)}M`
  };
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

function extractPlayersData(html) {
  const results = [];
  
  // Extract from table rows - look for pattern with image, name, and ETV
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gim;
  let row;
  
  while ((row = rowRegex.exec(html)) !== null) {
    const rowHtml = row[1];
    
    // Extract image URL
    const imgMatch = rowHtml.match(/<img[^>]+src="([^"]*images\.footballtransfers\.com[^"]+)"/i);
    const imgUrl = imgMatch?.[1];
    
    // Extract player name from link
    const nameMatch = rowHtml.match(/<a[^>]+href="[^"]*\/players\/[^"]*"[^>]*>([^<]+)<\/a>/i);
    const playerName = nameMatch?.[1]?.trim();
    
    // Extract ETV - look for pattern like "€14.2M" in the row
    const etvMatch = rowHtml.match(/€([\d.]+)([MK])?/i);
    const etvText = etvMatch ? `€${etvMatch[1]}${etvMatch[2] || ''}` : null;
    
    // Extract position - look for GK, D, M, etc.
    const positionMatch = rowHtml.match(/\b(GK|D|M|F|ST|LW|RW|CM|CDM|CAM|CB|LB|RB)\b/i);
    const position = positionMatch?.[1] || null;
    
    if (playerName && imgUrl) {
      const etvData = parseETV(etvText);
      results.push({
        name: playerName,
        imageUrl: imgUrl,
        etv: etvData,
        position: position
      });
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
  console.log(`🔎 Fetching Leeds United team page...`);
  const html = await fetchText(TEAM_URL);
  console.log('✅ Page fetched. Extracting players, images, and ETV values...');
  
  const players = extractPlayersData(html);
  if (players.length === 0) {
    console.log('⚠️ No player data found. The page structure may have changed.');
    process.exit(1);
  }
  
  console.log(`✅ Found ${players.length} players with data`);
  
  // Ensure output dir
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  
  const manifest = [];
  const etvData = {};
  let downloaded = 0;
  
  for (const player of players) {
    const slug = sanitizeName(player.name);
    const outPath = path.join(OUTPUT_DIR, `${slug}.png`);
    
    // Download image
    try {
      // Extract original URL from proxy if needed
      let imageUrl = player.imageUrl;
      if (imageUrl.includes('url=')) {
        const urlMatch = imageUrl.match(/url=([^&]+)/);
        if (urlMatch) {
          imageUrl = decodeURIComponent(urlMatch[1]);
        }
      }
      
      await downloadToFile(player.imageUrl, outPath);
      downloaded++;
      
      const imagePath = `/${path.posix.join('player-images', TEAM_SLUG, `${slug}.png`)}`;
      manifest.push({
        name: player.name,
        slug,
        image: imagePath,
        source: player.imageUrl
      });
      
      // Store ETV data
      if (player.etv) {
        etvData[player.name] = {
          etvEuro: player.etv.euro,
          etvEuroFormatted: player.etv.euroFormatted,
          etvGbp: player.etv.gbp,
          etvGbpFormatted: player.etv.gbpFormatted,
          position: player.position
        };
      }
      
      console.log(`🖼️  Saved: ${player.name}${player.etv ? ` (ETV: ${player.etv.gbpFormatted})` : ''}`);
      
      // Rate limit politely
      await sleep(150);
    } catch (err) {
      console.warn(`⚠️ Failed to download ${player.name} image: ${err.message}`);
    }
  }
  
  // Write manifest
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify({
    team: TEAM_SLUG,
    count: manifest.length,
    images: manifest
  }, null, 2));
  
  // Write ETV data
  fs.writeFileSync(ETV_DATA_PATH, JSON.stringify({
    team: 'Leeds United',
    conversionRate: EUR_TO_GBP,
    players: etvData
  }, null, 2));
  
  console.log(`\n🎉 Done. Downloaded ${downloaded}/${players.length} images.`);
  console.log(`🗂️  Manifest: ${MANIFEST_PATH}`);
  console.log(`💰 ETV Data: ${ETV_DATA_PATH}`);
  console.log(`\n📊 ETV Summary:`);
  console.log(`   Total players with ETV: ${Object.keys(etvData).length}`);
  console.log(`   Total value (GBP): £${(Object.values(etvData).reduce((sum, p) => sum + p.etvGbp, 0) / 1000000).toFixed(2)}M`);
}

main().catch(err => {
  console.error('❌ Scrape failed:', err);
  process.exit(1);
});


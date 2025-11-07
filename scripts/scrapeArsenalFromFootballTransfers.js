import fs from 'fs';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_DIR = join(__dirname, '../public/player-images/arsenal');
const SOURCE_URL = 'https://www.footballtransfers.com/en/teams/uk/arsenal';

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function downloadFile(url, dest) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      } else {
        file.close();
        fs.unlinkSync(dest);
        resolve(false);
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      resolve(false);
    });
  });
}

async function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function scrapeArsenalPlayers() {
  ensureDir(OUTPUT_DIR);
  console.log(`Fetching ${SOURCE_URL}`);
  
  try {
    const html = await fetchHtml(SOURCE_URL);
    const $ = cheerio.load(html);
    
    const players = [];
    
    // Look for player images - footballtransfers.com uses various patterns
    $('img').each((_, img) => {
      const src = $(img).attr('src') || $(img).attr('data-src') || '';
      const alt = $(img).attr('alt') || '';
      const title = $(img).attr('title') || '';
      
      // Look for player images - common patterns on footballtransfers
      if (src && (
        src.includes('players') || 
        src.includes('player') ||
        src.includes('static.footballtransfers.com') ||
        /\/\d+\.(png|jpg|jpeg|webp)/i.test(src)
      )) {
        // Try to extract player name from alt, title, or nearby text
        const name = alt || title || '';
        if (name && name.length > 2 && !name.includes('logo') && !name.includes('badge')) {
          const fullUrl = src.startsWith('http') ? src : `https://www.footballtransfers.com${src}`;
          players.push({ name: name.trim(), url: fullUrl });
        }
      }
    });
    
    // Also try to find player names from links and nearby elements
    $('a[href*="/players/"], a[href*="/player/"]').each((_, link) => {
      const href = $(link).attr('href') || '';
      const text = $(link).text().trim();
      const img = $(link).find('img');
      
      if (text && text.length > 2) {
        const imgSrc = img.attr('src') || img.attr('data-src') || '';
        if (imgSrc) {
          const fullUrl = imgSrc.startsWith('http') ? imgSrc : `https://www.footballtransfers.com${imgSrc}`;
          players.push({ name: text, url: fullUrl });
        }
      }
    });
    
    // Deduplicate
    const unique = new Map();
    for (const p of players) {
      const key = slugify(p.name);
      if (!unique.has(key) && p.name.length > 2) {
        unique.set(key, p);
      }
    }
    
    const playerList = Array.from(unique.values());
    console.log(`Found ${playerList.length} player images`);
    
    // Download images
    let downloaded = 0;
    for (const player of playerList) {
      const slug = slugify(player.name);
      const dest = join(OUTPUT_DIR, `${slug}.png`);
      
      // Use image proxy if needed
      const imageUrl = player.url.includes('images.footballtransfers.com') 
        ? `https://images.ps-aws.com/c?url=${encodeURIComponent(player.url)}`
        : player.url;
      
      const success = await downloadFile(imageUrl, dest);
      if (success) {
        downloaded++;
        console.log(`✓ Downloaded: ${player.name}`);
      } else {
        console.log(`✗ Failed: ${player.name}`);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`\nDownloaded ${downloaded}/${playerList.length} player images`);
    return playerList;
  } catch (error) {
    console.error('Error scraping:', error);
    return [];
  }
}

scrapeArsenalPlayers().catch(console.error);


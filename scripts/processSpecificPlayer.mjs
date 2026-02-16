#!/usr/bin/env node

/**
 * Process a specific player's image from TransferFeed
 * Usage: node scripts/processSpecificPlayer.mjs "Player Name" "Club Name"
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
    try {
      const proxyUrls = [
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        url
      ];
      
      for (const proxyUrl of proxyUrls) {
        try {
          const response = await fetch(proxyUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
          });
          
          if (!response.ok) continue;
          
          let html = await response.text();
          
          if (proxyUrl.includes('allorigins.win')) {
            try {
              const data = JSON.parse(html);
              html = data.contents;
            } catch (e) {}
          }
          
          return html;
        } catch (error) {
          continue;
        }
      }
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
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
      if (match[1]) {
        let imageUrl = match[1];
        
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('/')) {
          imageUrl = 'https://www.transferfeed.com' + imageUrl;
        }
        
        if (!imageUrl.includes('logo') && 
            !imageUrl.includes('badge') && 
            !imageUrl.includes('icon') &&
            !imageUrl.includes('placeholder') &&
            imageUrl.match(/\.(jpg|jpeg|png|webp)$/i)) {
          foundImages.add(imageUrl);
        }
      }
    }
  }
  
  if (foundImages.size > 0) {
    return Array.from(foundImages)[0];
  }
  
  return null;
}

async function downloadImage(imageUrl, outputPath) {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    const dir = path.dirname(outputPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    return true;
  } catch (error) {
    console.error(`  ❌ Download error: ${error.message}`);
    return false;
  }
}

async function processPlayer(playerName, clubName) {
  const searchQuery = playerName.replace(/\s+/g, '+');
  const transferFeedUrl = `https://www.transferfeed.com/search?query=${encodeURIComponent(searchQuery)}`;
  
  console.log(`\n🔍 Processing: ${playerName} (${clubName})`);
  console.log(`   URL: ${transferFeedUrl}\n`);
  
  const html = await fetchWithRetry(transferFeedUrl);
  
  if (!html) {
    console.log(`  ❌ Could not fetch page`);
    return false;
  }
  
  const imageUrl = extractPlayerImageFromHTML(html);
  
  if (!imageUrl) {
    console.log(`  ⚠️  No image found on TransferFeed`);
    return false;
  }
  
  console.log(`  ✅ Found image: ${imageUrl}`);
  
  const clubSlug = slugifyName(clubName);
  const playerSlug = slugifyName(playerName);
  const playerImagesDir = path.join(__dirname, '../public/player-images');
  const imagePath = path.join(playerImagesDir, clubSlug, `${playerSlug}.png`);
  
  console.log(`  📥 Downloading...`);
  const success = await downloadImage(imageUrl, imagePath);
  
  if (success) {
    console.log(`  ✅ Saved: ${imagePath}\n`);
    return true;
  }
  
  return false;
}

// Main
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: node scripts/processSpecificPlayer.mjs "Player Name" "Club Name"');
  console.log('\nExample:');
  console.log('  node scripts/processSpecificPlayer.mjs "Luka Vuskovic" "Tottenham Hotspur"');
  process.exit(1);
}

const playerName = args[0];
const clubName = args[1];

processPlayer(playerName, clubName).then(success => {
  if (success) {
    console.log('✅ Done!');
  } else {
    console.log('❌ Failed to process player');
    process.exit(1);
  }
}).catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});




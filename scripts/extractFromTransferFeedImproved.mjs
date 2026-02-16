#!/usr/bin/env node

/**
 * Improved script to extract player images from TransferFeed
 * Better image extraction patterns based on actual TransferFeed HTML structure
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
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9'
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
    
    if (i < retries - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  return null;
}

// Improved image extraction for TransferFeed
function extractPlayerImageFromTransferFeed(html, playerName) {
  if (!html) return null;
  
  // TransferFeed uses cdn.transferfeed.com for images
  // Look for player images in various patterns
  const patterns = [
    // Direct CDN URLs with player names/IDs
    /https?:\/\/cdn\.transferfeed\.com\/[^"'\s<>]+\.(?:jpg|jpeg|png|webp)/gi,
    // Images in player cards/sections
    /<img[^>]+src=["'](https?:\/\/cdn\.transferfeed\.com\/[^"']+\.(?:jpg|jpeg|png|webp))["']/gi,
    // Data-src attributes (lazy loading)
    /<img[^>]+data-src=["'](https?:\/\/cdn\.transferfeed\.com\/[^"']+\.(?:jpg|jpeg|png|webp))["']/gi,
    // Background images
    /background-image:\s*url\(["']?(https?:\/\/cdn\.transferfeed\.com\/[^"')]+\.(?:jpg|jpeg|png|webp))["']?\)/gi,
    // Generic image tags with transferfeed CDN
    /<img[^>]+src=["']([^"']*transferfeed[^"']*\.(?:jpg|jpeg|png|webp))["']/gi,
    // Look for player photo sections
    /player\s+photo[\s\S]*?<img[^>]+src=["']([^"']+\.(?:jpg|jpeg|png|webp))["']/gi,
    // Any image in the players section
    /<section[^>]*players[^>]*>[\s\S]*?<img[^>]+src=["']([^"']+\.(?:jpg|jpeg|png|webp))["']/gi
  ];
  
  const foundImages = new Set();
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      let imageUrl = match[1] || match[0];
      
      // Make absolute URL if relative
      if (imageUrl.startsWith('//')) {
        imageUrl = 'https:' + imageUrl;
      } else if (imageUrl.startsWith('/')) {
        imageUrl = 'https://www.transferfeed.com' + imageUrl;
      }
      
      // Filter out non-player images
      if (!imageUrl.includes('logo') && 
          !imageUrl.includes('badge') && 
          !imageUrl.includes('icon') &&
          !imageUrl.includes('placeholder') &&
          !imageUrl.includes('bundesliga-36') && // Common placeholder
          imageUrl.match(/\.(jpg|jpeg|png|webp)$/i)) {
        foundImages.add(imageUrl);
      }
    }
  }
  
  // If we found multiple images, prefer ones that might match the player name
  if (foundImages.size > 0) {
    const images = Array.from(foundImages);
    const playerSlug = slugifyName(playerName);
    
    // Try to find an image that might match the player name
    for (const img of images) {
      const imgSlug = slugifyName(img);
      if (imgSlug.includes(playerSlug) || playerSlug.includes(imgSlug.split('-')[0])) {
        return img;
      }
    }
    
    // Return the first CDN image (most likely to be a player image)
    for (const img of images) {
      if (img.includes('cdn.transferfeed.com')) {
        return img;
      }
    }
    
    // Return first image found
    return images[0];
  }
  
  return null;
}

async function downloadImage(imageUrl, outputPath) {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': 'https://www.transferfeed.com/'
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

async function processPlayer(player, index, total) {
  const { playerName, club, transferFeedUrl } = player;
  
  console.log(`\n[${index + 1}/${total}] Processing: ${playerName} (${club})`);
  console.log(`  🔍 URL: ${transferFeedUrl}`);
  
  try {
    const html = await fetchWithRetry(transferFeedUrl);
    
    if (!html) {
      console.log(`  ⚠️  Could not fetch page`);
      return { success: false, reason: 'fetch_failed' };
    }
    
    const imageUrl = extractPlayerImageFromTransferFeed(html, playerName);
    
    if (!imageUrl) {
      console.log(`  ⚠️  No image found`);
      return { success: false, reason: 'no_image_found' };
    }
    
    console.log(`  ✅ Found image: ${imageUrl}`);
    
    const clubSlug = slugifyName(club);
    const playerSlug = slugifyName(playerName);
    const playerImagesDir = path.join(__dirname, '../public/player-images');
    const imagePath = path.join(playerImagesDir, clubSlug, `${playerSlug}.png`);
    
    console.log(`  📥 Downloading...`);
    const success = await downloadImage(imageUrl, imagePath);
    
    if (success) {
      console.log(`  ✅ Saved: ${imagePath}`);
      return { 
        success: true, 
        imageUrl, 
        localPath: `/player-images/${clubSlug}/${playerSlug}.png` 
      };
    } else {
      return { success: false, reason: 'download_failed' };
    }
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return { success: false, reason: error.message };
  }
}

async function main() {
  console.log('🚀 Starting improved TransferFeed image extraction\n');
  
  const stillMissingPath = path.join(__dirname, 'players-still-missing-images.json');
  if (!fs.existsSync(stillMissingPath)) {
    console.error('❌ players-still-missing-images.json not found.');
    process.exit(1);
  }
  
  const missingPlayers = JSON.parse(fs.readFileSync(stillMissingPath, 'utf-8'));
  const total = missingPlayers.length;
  
  console.log(`📊 Found ${total} players still missing images\n`);
  
  const results = { success: [], failed: [] };
  const BATCH_SIZE = 5;
  const DELAY_BETWEEN_BATCHES = 3000;
  const DELAY_BETWEEN_PLAYERS = 1000;
  
  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = missingPlayers.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(total / BATCH_SIZE);
    
    console.log(`\n📦 Batch ${batchNum}/${totalBatches} (${batch.length} players)...`);
    
    for (const player of batch) {
      const result = await processPlayer(player, i + batch.indexOf(player), total);
      
      if (result.success) {
        results.success.push({ playerName: player.playerName, club: player.club, ...result });
      } else {
        results.failed.push({ playerName: player.playerName, club: player.club, reason: result.reason });
      }
      
      if (batch.indexOf(player) < batch.length - 1) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_PLAYERS));
      }
    }
    
    if (i + BATCH_SIZE < total) {
      console.log(`\n⏸️  Waiting ${DELAY_BETWEEN_BATCHES / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }
  
  const resultsPath = path.join(__dirname, 'transferfeed-improved-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 SUMMARY\n');
  console.log(`✅ Successfully extracted: ${results.success.length} images`);
  console.log(`❌ Failed: ${results.failed.length} players`);
  console.log(`\n📁 Results: ${resultsPath}\n`);
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});




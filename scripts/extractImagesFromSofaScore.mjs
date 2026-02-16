#!/usr/bin/env node

/**
 * Extract player images from SofaScore
 * 
 * Usage: node scripts/extractImagesFromSofaScore.mjs
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

// Fetch HTML with retry and CORS proxy
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
          } catch (e) {
            // Not JSON, use as is
          }
        }
        
        return html;
      } catch (error) {
        // Try next proxy
        continue;
      }
    }
    
    if (i < retries - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  return null;
}

// Extract player image from SofaScore search results
function extractPlayerImageFromSofaScore(html, playerName) {
  if (!html) return null;
  
  // SofaScore uses various patterns for player images
  const patterns = [
    // Look for player image in search results
    /<img[^>]+(?:class|data-src|src)=["']([^"']*player[^"']*\.(?:jpg|jpeg|png|webp))["']/gi,
    // SofaScore specific image patterns
    /<img[^>]+src=["'](https?:\/\/[^"']*sofascore[^"']*\.(?:jpg|jpeg|png|webp))["']/gi,
    // Look for images in player cards
    /<div[^>]*class="[^"]*player[^"]*"[^>]*>[\s\S]*?<img[^>]+src=["']([^"']*\.(?:jpg|jpeg|png|webp))["']/gi,
    // Look for data-src (lazy loading)
    /<img[^>]+data-src=["']([^"']*\.(?:jpg|jpeg|png|webp))["']/gi,
    // Generic image patterns
    /<img[^>]+src=["'](https?:\/\/[^"']*\.(?:jpg|jpeg|png|webp))["']/gi
  ];
  
  const foundImages = new Set();
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      if (match[1]) {
        let imageUrl = match[1];
        
        // Make absolute URL if relative
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('/')) {
          imageUrl = 'https://www.sofascore.com' + imageUrl;
        }
        
        // Filter out common non-player images
        if (!imageUrl.includes('logo') && 
            !imageUrl.includes('badge') && 
            !imageUrl.includes('icon') &&
            !imageUrl.includes('placeholder') &&
            !imageUrl.includes('flag') &&
            !imageUrl.includes('team') &&
            imageUrl.match(/\.(jpg|jpeg|png|webp)$/i)) {
          foundImages.add(imageUrl);
        }
      }
    }
  }
  
  // Return the first valid image found
  if (foundImages.size > 0) {
    return Array.from(foundImages)[0];
  }
  
  return null;
}

// Search for player on SofaScore
async function searchPlayerOnSofaScore(playerName) {
  // SofaScore search URL format
  const searchUrl = `https://www.sofascore.com/search?q=${encodeURIComponent(playerName)}`;
  
  try {
    const html = await fetchWithRetry(searchUrl);
    if (!html) return null;
    
    // Extract player image from search results
    const imageUrl = extractPlayerImageFromSofaScore(html, playerName);
    return imageUrl;
  } catch (error) {
    console.error(`  ❌ Search error: ${error.message}`);
    return null;
  }
}

// Download image
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

// Process a single player
async function processPlayer(player, index, total) {
  const { playerName, club } = player;
  
  console.log(`\n[${index + 1}/${total}] Processing: ${playerName} (${club})`);
  
  try {
    // Search SofaScore for the player
    console.log(`  🔍 Searching SofaScore...`);
    const imageUrl = await searchPlayerOnSofaScore(playerName);
    
    if (!imageUrl) {
      console.log(`  ⚠️  No image found on SofaScore`);
      return { success: false, reason: 'no_image_found' };
    }
    
    console.log(`  ✅ Found image: ${imageUrl}`);
    
    // Generate file path
    const clubSlug = slugifyName(club);
    const playerSlug = slugifyName(playerName);
    const playerImagesDir = path.join(__dirname, '../public/player-images');
    const imagePath = path.join(playerImagesDir, clubSlug, `${playerSlug}.png`);
    
    // Download and save
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

// Main execution
async function main() {
  console.log('🚀 Starting player image extraction from SofaScore\n');
  
  // Load players still missing images
  const stillMissingPath = path.join(__dirname, 'players-still-missing-images.json');
  if (!fs.existsSync(stillMissingPath)) {
    console.error('❌ players-still-missing-images.json not found. Run getRemainingMissingPlayers.mjs first.');
    process.exit(1);
  }
  
  const missingPlayers = JSON.parse(fs.readFileSync(stillMissingPath, 'utf-8'));
  const total = missingPlayers.length;
  
  console.log(`📊 Found ${total} players still missing images\n`);
  console.log('⏳ Processing in batches with delays...\n');
  
  const results = {
    success: [],
    failed: []
  };
  
  // Process in batches to avoid rate limiting
  const BATCH_SIZE = 5;
  const DELAY_BETWEEN_BATCHES = 3000; // 3 seconds
  const DELAY_BETWEEN_PLAYERS = 1000; // 1 second
  
  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = missingPlayers.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(total / BATCH_SIZE);
    
    console.log(`\n📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} players)...`);
    
    for (const player of batch) {
      const result = await processPlayer(player, i + batch.indexOf(player), total);
      
      if (result.success) {
        results.success.push({
          playerName: player.playerName,
          club: player.club,
          ...result
        });
      } else {
        results.failed.push({
          playerName: player.playerName,
          club: player.club,
          reason: result.reason
        });
      }
      
      // Small delay between players
      if (batch.indexOf(player) < batch.length - 1) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_PLAYERS));
      }
    }
    
    // Delay between batches
    if (i + BATCH_SIZE < total) {
      console.log(`\n⏸️  Waiting ${DELAY_BETWEEN_BATCHES / 1000}s before next batch...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }
  
  // Save results
  const resultsPath = path.join(__dirname, 'sofascore-extraction-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 EXTRACTION SUMMARY\n');
  console.log(`✅ Successfully extracted: ${results.success.length} images`);
  console.log(`❌ Failed: ${results.failed.length} players`);
  console.log(`\n📁 Results saved to: ${resultsPath}\n`);
  
  if (results.failed.length > 0 && results.failed.length <= 20) {
    console.log('❌ Failed players:');
    results.failed.forEach(({ playerName, reason }) => {
      console.log(`   - ${playerName}: ${reason}`);
    });
    console.log('');
  }
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});




#!/usr/bin/env node

/**
 * Automated script to extract player images from TransferFeed
 * 
 * This script:
 * 1. Reads the list of players missing images
 * 2. For each player, searches TransferFeed
 * 3. Extracts the player image URL
 * 4. Downloads and saves the image
 * 
 * Usage: node scripts/autoExtractPlayerImages.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to slugify names
function slugifyName(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

// Fetch HTML with retry logic
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      // Try using a CORS proxy
      const proxyUrls = [
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        url // Try direct as fallback
      ];
      
      for (const proxyUrl of proxyUrls) {
        try {
          const response = await fetch(proxyUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5'
            }
          });
          
          if (!response.ok) continue;
          
          let html = await response.text();
          
          // If using allorigins proxy, extract the content
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
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  return null;
}

// Extract player image URL from TransferFeed HTML
function extractPlayerImageFromHTML(html, playerName) {
  if (!html) return null;
  
  // Try multiple patterns to find player images
  const patterns = [
    // Look for img tags with player-related classes or data attributes
    /<img[^>]+(?:class|data-src|src)=["']([^"']*player[^"']*\.(?:jpg|jpeg|png|webp))["']/gi,
    // Look for images in player cards or search results
    /<img[^>]+src=["']([^"']*\/players\/[^"']*\.(?:jpg|jpeg|png|webp))["']/gi,
    // Look for data-src attributes (lazy loading)
    /<img[^>]+data-src=["']([^"']*\.(?:jpg|jpeg|png|webp))["']/gi,
    // Look for any image in a player-related container
    /<div[^>]*player[^>]*>[\s\S]*?<img[^>]+src=["']([^"']*\.(?:jpg|jpeg|png|webp))["']/gi,
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
          imageUrl = 'https://www.transferfeed.com' + imageUrl;
        }
        
        // Filter out common non-player images
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
  
  // Return the first valid image found
  if (foundImages.size > 0) {
    return Array.from(foundImages)[0];
  }
  
  return null;
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
  const { playerName, club, transferFeedUrl } = player;
  
  console.log(`\n[${index + 1}/${total}] Processing: ${playerName} (${club})`);
  console.log(`  🔍 Searching: ${transferFeedUrl}`);
  
  try {
    // Fetch the TransferFeed search page
    const html = await fetchWithRetry(transferFeedUrl);
    
    if (!html) {
      console.log(`  ⚠️  Could not fetch page`);
      return { success: false, reason: 'fetch_failed' };
    }
    
    // Extract player image URL
    const imageUrl = extractPlayerImageFromHTML(html, playerName);
    
    if (!imageUrl) {
      console.log(`  ⚠️  No image found on TransferFeed`);
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
  console.log('🚀 Starting automated player image extraction from TransferFeed\n');
  
  // Load missing players list
  const missingPlayersPath = path.join(__dirname, 'players-missing-images.json');
  if (!fs.existsSync(missingPlayersPath)) {
    console.error('❌ Missing players file not found. Run findMissingPlayerImages.mjs first.');
    process.exit(1);
  }
  
  const missingPlayers = JSON.parse(fs.readFileSync(missingPlayersPath, 'utf-8'));
  const total = missingPlayers.length;
  
  console.log(`📊 Found ${total} players to process\n`);
  console.log('⏳ This may take a while. Processing in batches with delays...\n');
  
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
  const resultsPath = path.join(__dirname, 'image-extraction-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 EXTRACTION SUMMARY\n');
  console.log(`✅ Successfully extracted: ${results.success.length} images`);
  console.log(`❌ Failed: ${results.failed.length} players`);
  console.log(`\n📁 Results saved to: ${resultsPath}\n`);
  
  if (results.failed.length > 0) {
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


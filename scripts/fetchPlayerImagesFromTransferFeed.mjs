#!/usr/bin/env node

/**
 * Script to find players missing images and fetch them from TransferFeed
 * 
 * Usage: node scripts/fetchPlayerImagesFromTransferFeed.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Get all transfer files
const transfersDir = path.join(__dirname, '../src/data/transfers');
const transfersFiles = fs.readdirSync(transfersDir)
  .filter(file => file.endsWith('.ts') && file !== 'index.ts');

// Import all transfers
let allTransfers = [];
for (const file of transfersFiles) {
  try {
    const filePath = path.join(transfersDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract transfer arrays using regex (simple approach)
    const transferMatches = content.matchAll(/playerName:\s*['"]([^'"]+)['"]/g);
    for (const match of transferMatches) {
      allTransfers.push({
        playerName: match[1],
        source: file.replace('.ts', '')
      });
    }
  } catch (error) {
    console.error(`Error reading ${file}:`, error.message);
  }
}

// Get unique players
const uniquePlayers = [...new Set(allTransfers.map(t => t.playerName))];

// Check which players have images
const playerImagesDir = path.join(__dirname, '../public/player-images');
const playerImages = new Set();

// Check localStorage player images
const localStorageImagesPath = path.join(__dirname, '../src/utils/playerImageUtils.ts');
let localStorageImages = {};
try {
  const content = fs.readFileSync(localStorageImagesPath, 'utf-8');
  // This is a simplified check - in reality, images are stored in browser localStorage
  // We'll check the file system instead
} catch (error) {
  // Ignore
}

// Check file system for existing images
function checkPlayerImageExists(playerName, clubName) {
  if (!clubName) return false;
  
  const clubSlug = clubName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const playerSlug = playerName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const imagePath = path.join(playerImagesDir, clubSlug, `${playerSlug}.png`);
  
  return fs.existsSync(imagePath);
}

// Find players without images
const playersWithoutImages = [];
for (const playerName of uniquePlayers) {
  // Find which club this player belongs to
  const playerTransfer = allTransfers.find(t => t.playerName === playerName);
  const clubName = playerTransfer?.source || 'unknown';
  
  // Check if image exists
  const hasImage = checkPlayerImageExists(playerName, clubName);
  
  if (!hasImage) {
    playersWithoutImages.push({
      playerName,
      clubName,
      transferFeedUrl: `https://www.transferfeed.com/search?query=${encodeURIComponent(playerName.replace(/\s+/g, '+'))}`
    });
  }
}

console.log(`\n📊 Found ${uniquePlayers.length} unique players`);
console.log(`❌ Found ${playersWithoutImages.length} players without images\n`);

// Generate TransferFeed URLs
console.log('🔗 TransferFeed Search URLs:\n');
playersWithoutImages.forEach((player, index) => {
  console.log(`${index + 1}. ${player.playerName} (${player.clubName})`);
  console.log(`   ${player.transferFeedUrl}\n`);
});

// Save to JSON file for reference
const outputPath = path.join(__dirname, '../scripts/players-missing-images.json');
fs.writeFileSync(outputPath, JSON.stringify(playersWithoutImages, null, 2));
console.log(`\n✅ Saved list to: ${outputPath}\n`);

// Now attempt to fetch images from TransferFeed
console.log('🌐 Attempting to fetch player images from TransferFeed...\n');

async function fetchPlayerImageFromTransferFeed(playerName) {
  const searchUrl = `https://www.transferfeed.com/search?query=${encodeURIComponent(playerName.replace(/\s+/g, '+'))}`;
  
  try {
    // Use a CORS proxy or fetch directly
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const html = await response.text();
    
    // Try to extract player image URL from the HTML
    // Look for common image patterns in TransferFeed
    const imagePatterns = [
      /<img[^>]+src=["']([^"']*player[^"']*\.(jpg|jpeg|png|webp))["']/gi,
      /<img[^>]+src=["']([^"']*\/players\/[^"']*\.(jpg|jpeg|png|webp))["']/gi,
      /data-src=["']([^"']*player[^"']*\.(jpg|jpeg|png|webp))["']/gi
    ];
    
    for (const pattern of imagePatterns) {
      const match = pattern.exec(html);
      if (match && match[1]) {
        let imageUrl = match[1];
        // Make absolute URL if relative
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('/')) {
          imageUrl = 'https://www.transferfeed.com' + imageUrl;
        }
        return imageUrl;
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching image for ${playerName}:`, error.message);
    return null;
  }
}

// Process players in batches to avoid rate limiting
const BATCH_SIZE = 5;
const DELAY_MS = 2000; // 2 seconds between batches

for (let i = 0; i < playersWithoutImages.length; i += BATCH_SIZE) {
  const batch = playersWithoutImages.slice(i, i + BATCH_SIZE);
  
  console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}...`);
  
  for (const player of batch) {
    console.log(`  Fetching image for ${player.playerName}...`);
    const imageUrl = await fetchPlayerImageFromTransferFeed(player.playerName);
    
    if (imageUrl) {
      console.log(`  ✅ Found image: ${imageUrl}`);
      // Save the image URL to a mapping file
      const mappingPath = path.join(__dirname, '../scripts/transferfeed-image-mapping.json');
      let mapping = {};
      try {
        if (fs.existsSync(mappingPath)) {
          mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
        }
      } catch (error) {
        // Ignore
      }
      
      mapping[player.playerName] = {
        imageUrl,
        transferFeedUrl: player.transferFeedUrl,
        clubName: player.clubName
      };
      
      fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
    } else {
      console.log(`  ❌ No image found for ${player.playerName}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Delay between batches
  if (i + BATCH_SIZE < playersWithoutImages.length) {
    console.log(`\nWaiting ${DELAY_MS / 1000} seconds before next batch...\n`);
    await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  }
}

console.log('\n✅ Done! Check scripts/transferfeed-image-mapping.json for found images.\n');




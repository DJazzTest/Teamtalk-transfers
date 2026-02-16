#!/usr/bin/env node

/**
 * Helper script to process player images extracted from TransferFeed
 * 
 * This script helps you:
 * 1. Download images from TransferFeed URLs
 * 2. Save them to the correct directory structure
 * 3. Update the player image mapping
 * 
 * Usage: 
 *   node scripts/processTransferFeedImages.mjs <playerName> <imageUrl> [clubName]
 * 
 * Example:
 *   node scripts/processTransferFeedImages.mjs "Walter Benitez" "https://www.transferfeed.com/..." "Nottingham Forest"
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

// Download image from URL
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
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write file
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    return true;
  } catch (error) {
    console.error(`Error downloading image: ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node scripts/processTransferFeedImages.mjs <playerName> <imageUrl> [clubName]');
    console.log('\nExample:');
    console.log('  node scripts/processTransferFeedImages.mjs "Walter Benitez" "https://..." "Nottingham Forest"');
    process.exit(1);
  }
  
  const playerName = args[0];
  const imageUrl = args[1];
  const clubName = args[2] || 'Unknown';
  
  console.log(`\n📥 Processing image for: ${playerName}`);
  console.log(`   Club: ${clubName}`);
  console.log(`   Image URL: ${imageUrl}\n`);
  
  // Generate file path
  const clubSlug = slugifyName(clubName);
  const playerSlug = slugifyName(playerName);
  const playerImagesDir = path.join(__dirname, '../public/player-images');
  const clubDir = path.join(playerImagesDir, clubSlug);
  const imagePath = path.join(clubDir, `${playerSlug}.png`);
  
  // Download and save image
  console.log(`📁 Saving to: ${imagePath}`);
  const success = await downloadImage(imageUrl, imagePath);
  
  if (success) {
    console.log(`✅ Successfully saved image for ${playerName}\n`);
    
    // Update the mapping file
    const mappingPath = path.join(__dirname, '../scripts/transferfeed-image-mapping.json');
    let mapping = {};
    
    try {
      if (fs.existsSync(mappingPath)) {
        mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
      }
    } catch (error) {
      // Ignore
    }
    
    mapping[playerName] = {
      imageUrl,
      clubName,
      localPath: `/player-images/${clubSlug}/${playerSlug}.png`,
      savedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
    console.log(`✅ Updated mapping file: ${mappingPath}\n`);
  } else {
    console.error(`❌ Failed to save image for ${playerName}\n`);
    process.exit(1);
  }
}

main().catch(console.error);




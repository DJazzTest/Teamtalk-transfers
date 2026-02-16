#!/usr/bin/env node

/**
 * Script to find all players missing images and generate TransferFeed search URLs
 * 
 * This script:
 * 1. Extracts all unique player names from transfer data
 * 2. Checks which players don't have images
 * 3. Generates TransferFeed search URLs in the format: https://www.transferfeed.com/search?query=FirstName+LastName
 * 
 * Usage: node scripts/findMissingPlayerImages.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const transfersDir = path.join(__dirname, '../src/data/transfers');
const playerImagesDir = path.join(__dirname, '../public/player-images');

// Helper to slugify names (matching the logic in playerImageUtils.ts)
function slugifyName(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

// Check if player image exists in file system
function checkPlayerImageExists(playerName, clubName) {
  if (!clubName || clubName === 'unknown') return false;
  
  const clubSlug = slugifyName(clubName);
  const playerSlug = slugifyName(playerName);
  const imagePath = path.join(playerImagesDir, clubSlug, `${playerSlug}.png`);
  
  return fs.existsSync(imagePath);
}

// Extract player names from transfer files
function extractPlayersFromTransfers() {
  const players = new Map(); // playerName -> { clubs: Set, transfers: [] }
  
  // Read all transfer files
  const transferFiles = [
    'arsenal.ts', 'astonVilla.ts', 'bournemouth.ts', 'brentford.ts',
    'brighton.ts', 'burnley.ts', 'chelsea.ts', 'crystalPalace.ts',
    'everton.ts', 'fulham.ts', 'leeds.ts', 'liverpool.ts',
    'manchesterCity.ts', 'manchesterUnited.ts', 'newcastle.ts',
    'nottinghamForest.ts', 'rumors.ts', 'sunderland.ts', 'tottenham.ts',
    'westHam.ts', 'wolves.ts'
  ];
  
  for (const file of transferFiles) {
    const filePath = path.join(transfersDir, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${file}`);
      continue;
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const clubName = file.replace('.ts', '').replace(/([A-Z])/g, ' $1').trim();
    
    // Extract player names using regex
    // Look for: playerName: 'Name' or playerName: "Name"
    const playerNameRegex = /playerName:\s*['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = playerNameRegex.exec(content)) !== null) {
      const playerName = match[1].trim();
      if (!playerName) continue;
      
      if (!players.has(playerName)) {
        players.set(playerName, {
          clubs: new Set(),
          transfers: []
        });
      }
      
      const playerData = players.get(playerName);
      playerData.clubs.add(clubName);
      
      // Try to extract club info from the transfer
      const fromClubMatch = content.substring(Math.max(0, match.index - 500), match.index + 500)
        .match(/fromClub:\s*['"]([^'"]+)['"]/);
      const toClubMatch = content.substring(match.index, match.index + 500)
        .match(/toClub:\s*['"]([^'"]+)['"]/);
      
      playerData.transfers.push({
        fromClub: fromClubMatch ? fromClubMatch[1] : 'Unknown',
        toClub: toClubMatch ? toClubMatch[1] : 'Unknown'
      });
    }
  }
  
  return players;
}

// Main execution
console.log('🔍 Finding players missing images...\n');

// Extract all players
const allPlayers = extractPlayersFromTransfers();
console.log(`📊 Found ${allPlayers.size} unique players\n`);

// Check which players are missing images
const playersWithoutImages = [];
const playersWithImages = [];

for (const [playerName, playerData] of allPlayers.entries()) {
  // Check if image exists for any of the clubs this player has been associated with
  let hasImage = false;
  let associatedClub = null;
  
  for (const club of playerData.clubs) {
    if (checkPlayerImageExists(playerName, club)) {
      hasImage = true;
      associatedClub = club;
      break;
    }
  }
  
  // Also check common club names from transfers
  for (const transfer of playerData.transfers) {
    if (checkPlayerImageExists(playerName, transfer.toClub)) {
      hasImage = true;
      associatedClub = transfer.toClub;
      break;
    }
    if (checkPlayerImageExists(playerName, transfer.fromClub)) {
      hasImage = true;
      associatedClub = transfer.fromClub;
      break;
    }
  }
  
  if (hasImage) {
    playersWithImages.push({ playerName, club: associatedClub });
  } else {
    // Get the most recent club (prefer toClub over fromClub)
    const latestTransfer = playerData.transfers[playerData.transfers.length - 1];
    const club = latestTransfer?.toClub || latestTransfer?.fromClub || Array.from(playerData.clubs)[0] || 'Unknown';
    
    // Generate TransferFeed URL
    const searchQuery = playerName.replace(/\s+/g, '+');
    const transferFeedUrl = `https://www.transferfeed.com/search?query=${encodeURIComponent(searchQuery)}`;
    
    playersWithoutImages.push({
      playerName,
      club,
      transferFeedUrl,
      clubs: Array.from(playerData.clubs)
    });
  }
}

// Output results
console.log(`✅ Players with images: ${playersWithImages.length}`);
console.log(`❌ Players without images: ${playersWithoutImages.length}\n`);

// Generate TransferFeed URLs list
console.log('🔗 TransferFeed Search URLs for Missing Player Images:\n');
console.log('='.repeat(80));

playersWithoutImages.forEach((player, index) => {
  console.log(`\n${index + 1}. ${player.playerName}`);
  console.log(`   Club: ${player.club}`);
  console.log(`   URL: ${player.transferFeedUrl}`);
  if (player.clubs.length > 1) {
    console.log(`   Also associated with: ${player.clubs.join(', ')}`);
  }
});

console.log('\n' + '='.repeat(80));

// Save to JSON files
const outputDir = path.join(__dirname, '../scripts');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const missingImagesPath = path.join(outputDir, 'players-missing-images.json');
fs.writeFileSync(missingImagesPath, JSON.stringify(playersWithoutImages, null, 2));
console.log(`\n✅ Saved missing players list to: ${missingImagesPath}`);

const allPlayersPath = path.join(outputDir, 'all-players-list.json');
const allPlayersList = Array.from(allPlayers.entries()).map(([name, data]) => ({
  playerName: name,
  clubs: Array.from(data.clubs),
  transfers: data.transfers
}));
fs.writeFileSync(allPlayersPath, JSON.stringify(allPlayersList, null, 2));
console.log(`✅ Saved all players list to: ${allPlayersPath}`);

// Generate a simple HTML file with clickable links
const htmlPath = path.join(outputDir, 'missing-player-images.html');
const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Missing Player Images - TransferFeed Links</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .player { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
    .player-name { font-weight: bold; font-size: 1.1em; }
    .player-club { color: #666; margin: 5px 0; }
    .player-url { margin: 5px 0; }
    a { color: #0066cc; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .stats { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>Missing Player Images</h1>
  <div class="stats">
    <p><strong>Total players without images:</strong> ${playersWithoutImages.length}</p>
    <p><strong>Total players with images:</strong> ${playersWithImages.length}</p>
  </div>
  
  ${playersWithoutImages.map((player, index) => `
    <div class="player">
      <div class="player-name">${index + 1}. ${player.playerName}</div>
      <div class="player-club">Club: ${player.club}</div>
      <div class="player-url">
        <a href="${player.transferFeedUrl}" target="_blank">${player.transferFeedUrl}</a>
      </div>
    </div>
  `).join('')}
</body>
</html>`;

fs.writeFileSync(htmlPath, htmlContent);
console.log(`✅ Generated HTML file with clickable links: ${htmlPath}\n`);

console.log('📝 Next steps:');
console.log('   1. Open the HTML file in your browser to access all TransferFeed links');
console.log('   2. For each player, click the link to view their TransferFeed page');
console.log('   3. Extract the player image URL from the page');
console.log('   4. Save images to: public/player-images/{club-slug}/{player-slug}.png\n');




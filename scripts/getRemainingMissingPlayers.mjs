#!/usr/bin/env node

/**
 * Get list of players that still don't have images
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

// Some clubs use folder slugs that don't match a naive slug of the name
const CLUB_SLUG_OVERRIDES = {
  'Manchester United': 'man-utd',
  'Manchester City': 'man-city',
  'Newcastle United': 'newcastle-utd',
  'Nottingham Forest': 'nottingham',
  'West Ham': 'west-ham',
  'West Ham United': 'west-ham',
  'Leeds United': 'leeds-united',
  'Wolverhampton Wanderers': 'wolverhampton'
};

function getClubSlug(clubName) {
  if (!clubName) return null;
  const trimmed = clubName.trim();
  if (CLUB_SLUG_OVERRIDES[trimmed]) {
    return CLUB_SLUG_OVERRIDES[trimmed];
  }
  return slugifyName(trimmed);
}

function checkPlayerImageExists(playerName, clubName) {
  if (!clubName || clubName === 'unknown' || clubName === 'Unknown') return false;

  const clubSlug = getClubSlug(clubName);
  if (!clubSlug) return false;

  const playerSlug = slugifyName(playerName);
  const playerImagesDir = path.join(__dirname, '../public/player-images');
  const imagePath = path.join(playerImagesDir, clubSlug, `${playerSlug}.png`);

  return fs.existsSync(imagePath);
}

// Load missing players list
const missingPlayersPath = path.join(__dirname, 'players-missing-images.json');
if (!fs.existsSync(missingPlayersPath)) {
  console.error('❌ Missing players file not found.');
  process.exit(1);
}

const allMissingPlayers = JSON.parse(fs.readFileSync(missingPlayersPath, 'utf-8'));
const stillMissing = [];

console.log('🔍 Checking which players still need images...\n');

for (const player of allMissingPlayers) {
  const { playerName, club, clubs } = player;

  // Check main club
  let hasImage = checkPlayerImageExists(playerName, club);

  // Check other associated clubs if main club doesn't have image
  if (!hasImage && clubs && clubs.length > 0) {
    for (const altClub of clubs) {
      if (checkPlayerImageExists(playerName, altClub)) {
        hasImage = true;
        break;
      }
    }
  }
  
  if (!hasImage) {
    stillMissing.push(player);
  }
}

// Output results
console.log(`📊 Results:\n`);
console.log(`   Total players checked: ${allMissingPlayers.length}`);
console.log(`   ✅ Players with images: ${allMissingPlayers.length - stillMissing.length}`);
console.log(`   ❌ Players still missing: ${stillMissing.length}\n`);

if (stillMissing.length > 0) {
  console.log('='.repeat(80));
  console.log('\n❌ PLAYERS STILL MISSING IMAGES:\n');
  
  stillMissing.forEach((player, index) => {
    console.log(`${index + 1}. ${player.playerName}`);
    console.log(`   Club: ${player.club}`);
    console.log(`   TransferFeed URL: ${player.transferFeedUrl}`);
    if (player.clubs && player.clubs.length > 1) {
      console.log(`   Also associated with: ${player.clubs.join(', ')}`);
    }
    console.log('');
  });
  
  console.log('='.repeat(80));
  
  // Save to file
  const outputPath = path.join(__dirname, 'players-still-missing-images.json');
  fs.writeFileSync(outputPath, JSON.stringify(stillMissing, null, 2));
  console.log(`\n✅ Saved to: ${outputPath}\n`);
  
  // Generate HTML
  const htmlPath = path.join(__dirname, 'players-still-missing-images.html');
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Players Still Missing Images</title>
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
  <h1>Players Still Missing Images</h1>
  <div class="stats">
    <p><strong>Total still missing:</strong> ${stillMissing.length}</p>
    <p><strong>Players with images:</strong> ${allMissingPlayers.length - stillMissing.length}</p>
  </div>
  
  ${stillMissing.map((player, index) => `
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
  console.log(`✅ Generated HTML: ${htmlPath}\n`);
} else {
  console.log('🎉 All players now have images!\n');
}




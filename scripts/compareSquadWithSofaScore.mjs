#!/usr/bin/env node

/**
 * Script to compare our squad players with SofaScore and identify players
 * that need to be moved to "unassigned" status
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// SofaScore team IDs and slugs for Premier League clubs
// Note: IDs need to be verified manually from SofaScore URLs
const SOFASCORE_TEAMS = {
  'Arsenal': { slug: 'arsenal', id: 42 },
  'Aston Villa': { slug: 'aston-villa', id: 24 },
  'AFC Bournemouth': { slug: 'bournemouth', id: 35 },
  'Brentford': { slug: 'brentford', id: 37 },
  'Brighton & Hove Albion': { slug: 'brighton-hove-albion', id: 38 },
  'Chelsea': { slug: 'chelsea', id: 39 },
  'Crystal Palace': { slug: 'crystal-palace', id: 40 },
  'Everton': { slug: 'everton', id: 41 },
  'Fulham': { slug: 'fulham', id: 43 },
  'Ipswich Town': { slug: 'ipswich-town', id: 44 },
  'Leicester City': { slug: 'leicester-city', id: 45 },
  'Liverpool': { slug: 'liverpool', id: 46 },
  'Manchester City': { slug: 'manchester-city', id: 17 },
  'Manchester United': { slug: 'manchester-united', id: 35 }, // Verified from user's example
  'Newcastle United': { slug: 'newcastle-united', id: 47 },
  'Nottingham Forest': { slug: 'nottingham-forest', id: 48 },
  'Southampton': { slug: 'southampton', id: 49 },
  'Tottenham Hotspur': { slug: 'tottenham-hotspur', id: 50 },
  'West Ham United': { slug: 'west-ham-united', id: 51 },
  'Wolverhampton Wanderers': { slug: 'wolverhampton-wanderers', id: 52 },
};

// Premier League clubs
const PREMIER_LEAGUE_CLUBS = Object.keys(SOFASCORE_TEAMS);

// Normalize player names for comparison
function normalizeName(name) {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// More flexible name matching - check if names are similar
function namesMatch(name1, name2) {
  const norm1 = normalizeName(name1);
  const norm2 = normalizeName(name2);
  
  // Exact match
  if (norm1 === norm2) return true;
  
  // Check if one name contains the other (for nicknames/shortened names)
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    // Only match if the shorter name is at least 5 characters (to avoid false matches)
    const shorter = norm1.length < norm2.length ? norm1 : norm2;
    if (shorter.length >= 5) return true;
  }
  
  // Check if last names match (split by space and compare last parts)
  const parts1 = norm1.split(/\s+/);
  const parts2 = norm2.split(/\s+/);
  if (parts1.length > 0 && parts2.length > 0) {
    const last1 = parts1[parts1.length - 1];
    const last2 = parts2[parts2.length - 1];
    if (last1 === last2 && last1.length >= 4) return true;
  }
  
  return false;
}

// Extract players from squadWages.ts
function extractPlayersFromSquadFile() {
  const squadPath = join(__dirname, '../src/data/squadWages.ts');
  const content = readFileSync(squadPath, 'utf-8');
  
  const playersByClub = {};
  
  // More robust pattern to match club entries
  // Match: 'Club Name': [ ... player objects ... ]
  const clubPattern = /'([^']+)':\s*\[([\s\S]*?)(?=\s*,\s*'[^']+':|\s*\};)/g;
  let match;
  
  while ((match = clubPattern.exec(content)) !== null) {
    const clubName = match[1];
    const playersContent = match[2];
    
    // Extract player names: name: 'Player Name' (handle escaped quotes)
    // Look for: name: '...' or name: "..." 
    const namePattern = /name:\s*['"]([^'"]+)['"]/g;
    const players = new Set(); // Use Set to avoid duplicates
    let nameMatch;
    
    while ((nameMatch = namePattern.exec(playersContent)) !== null) {
      const playerName = nameMatch[1];
      // Skip if it's part of a comment or string property
      if (playerName && playerName.length > 1) {
        players.add(playerName);
      }
    }
    
    if (players.size > 0) {
      playersByClub[clubName] = Array.from(players);
    }
  }
  
  return playersByClub;
}

// Fetch players from SofaScore API
async function fetchSofaScorePlayers(clubName, teamInfo) {
  const { slug, id } = teamInfo;
  
  // Try multiple SofaScore API endpoints
  const apiEndpoints = [
    `https://api.sofascore.com/api/v1/team/${id}/players`,
    `https://api.sofascore.com/api/v1/team/${id}/squad`,
    `https://api.sofascore.com/api/v1/team/${id}`,
  ];
  
  for (const apiUrl of apiEndpoints) {
    try {
      console.log(`  Trying API: ${apiUrl}`);
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Referer': `https://www.sofascore.com/football/team/${slug}/${id}`,
        },
      });
      
      if (!response.ok) {
        continue; // Try next endpoint
      }
      
      const data = await response.json();
      
      // Extract player names from various possible response structures
      const players = [];
      
      // Structure 1: data.players array
      if (data.players && Array.isArray(data.players)) {
        for (const item of data.players) {
          if (item.player && item.player.name) {
            players.push(item.player.name);
          } else if (item.name) {
            players.push(item.name);
          }
        }
      }
      
      // Structure 2: data.squad object
      if (data.squad && typeof data.squad === 'object') {
        for (const position in data.squad) {
          if (Array.isArray(data.squad[position])) {
            for (const player of data.squad[position]) {
              if (player.player && player.player.name) {
                players.push(player.player.name);
              } else if (player.name) {
                players.push(player.name);
              }
            }
          }
        }
      }
      
      // Structure 3: data.team.players
      if (data.team && data.team.players && Array.isArray(data.team.players)) {
        for (const player of data.team.players) {
          if (player.name) {
            players.push(player.name);
          }
        }
      }
      
      if (players.length > 0) {
        console.log(`  ✅ Found ${players.length} players via API`);
        return players;
      }
    } catch (error) {
      // Continue to next endpoint
      continue;
    }
  }
  
  // If all API endpoints fail, return empty array and provide manual URL
  console.log(`  ⚠️  All API endpoints failed - manual check required`);
  console.log(`  📋 Manual URL: https://www.sofascore.com/football/team/${slug}/${id}#tab:players`);
  return [];
}

// Compare players and find extras, also track matches
function findExtraAndMatchedPlayers(ourPlayers, sofascorePlayers) {
  const extraPlayers = [];
  const matchedPlayers = [];
  const usedSofaScorePlayers = new Set();
  
  for (const ourPlayer of ourPlayers) {
    let found = false;
    let matchedSofaScorePlayer = null;
    
    // Try to find a match in SofaScore players
    for (const sofascorePlayer of sofascorePlayers) {
      if (namesMatch(ourPlayer, sofascorePlayer)) {
        found = true;
        matchedSofaScorePlayer = sofascorePlayer;
        usedSofaScorePlayers.add(sofascorePlayer);
        break;
      }
    }
    
    if (found) {
      matchedPlayers.push({
        our: ourPlayer,
        sofascore: matchedSofaScorePlayer,
      });
    } else {
      extraPlayers.push({
        player: ourPlayer,
        reason: 'No match found on SofaScore',
      });
    }
  }
  
  return { extraPlayers, matchedPlayers };
}

async function main() {
  console.log('🔍 Comparing Squad Players with SofaScore\n');
  console.log('='.repeat(100));
  
  // Extract our players
  console.log('\n📋 Extracting players from squadWages.ts...');
  const ourPlayersByClub = extractPlayersFromSquadFile();
  console.log(`✅ Found ${Object.keys(ourPlayersByClub).length} clubs in our data\n`);
  
  const results = {};
  const rosterChanges = {};
  let totalExtraPlayers = 0;
  
  // Process each club
  for (const clubName of PREMIER_LEAGUE_CLUBS) {
    if (!SOFASCORE_TEAMS[clubName]) {
      console.log(`⚠️  Skipping ${clubName} - no SofaScore data`);
      continue;
    }
    
    console.log(`\n${'='.repeat(100)}`);
    console.log(`🏟️  ${clubName}`);
    console.log('='.repeat(100));
    
    const ourPlayers = ourPlayersByClub[clubName] || [];
    console.log(`  Our squad: ${ourPlayers.length} players`);
    
    // Fetch SofaScore players
    console.log(`  Fetching SofaScore players...`);
    const sofascorePlayers = await fetchSofaScorePlayers(clubName, SOFASCORE_TEAMS[clubName]);
    console.log(`  SofaScore: ${sofascorePlayers.length} players`);
    
    if (sofascorePlayers.length === 0) {
      console.log(`  ⚠️  No players found on SofaScore - skipping comparison`);
      results[clubName] = {
        ourCount: ourPlayers.length,
        sofascoreCount: 0,
        extraPlayers: [],
        sofascorePlayers: [],
        url: `https://www.sofascore.com/football/team/${SOFASCORE_TEAMS[clubName].slug}/${SOFASCORE_TEAMS[clubName].id}#tab:players`,
      };
      continue;
    }
    
    // Find extra players and matched players
    const { extraPlayers, matchedPlayers } = findExtraAndMatchedPlayers(ourPlayers, sofascorePlayers);
    console.log(`  Matched players: ${matchedPlayers.length}/${ourPlayers.length}`);
    console.log(`  Extra players (not on SofaScore): ${extraPlayers.length}`);
    
    if (extraPlayers.length > 0) {
      console.log(`  📝 Players to move to unassigned:`);
      extraPlayers.forEach(({ player, reason }) => {
        console.log(`     - ${player}${reason ? ` (${reason})` : ''}`);
        // Create roster change entry
        rosterChanges[player] = {
          status: 'unassigned',
          currentTeam: 'Unassigned',
        };
      });
      totalExtraPlayers += extraPlayers.length;
    }
    
    // Show some matched examples for verification
    if (matchedPlayers.length > 0 && matchedPlayers.length <= 5) {
      console.log(`  ✅ Matched players (sample):`);
      matchedPlayers.slice(0, 3).forEach(({ our, sofascore }) => {
        console.log(`     ${our} ↔ ${sofascore}`);
      });
    }
    
    results[clubName] = {
      ourCount: ourPlayers.length,
      sofascoreCount: sofascorePlayers.length,
      matchedCount: matchedPlayers.length,
      extraPlayers: extraPlayers.map(e => e.player),
      matchedPlayers: matchedPlayers.slice(0, 10), // Store first 10 matches for reference
      sofascorePlayers,
      url: `https://www.sofascore.com/football/team/${SOFASCORE_TEAMS[clubName].slug}/${SOFASCORE_TEAMS[clubName].id}#tab:players`,
    };
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Save results
  const outputDir = join(__dirname, '../scripts/output');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  
  // Save comparison results
  const resultsPath = join(outputDir, 'squad-comparison-results.json');
  writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Comparison results saved to: ${resultsPath}`);
  
  // Save roster changes
  if (Object.keys(rosterChanges).length > 0) {
    const rosterPath = join(outputDir, 'roster-changes-unassigned.json');
    writeFileSync(rosterPath, JSON.stringify(rosterChanges, null, 2));
    console.log(`✅ Roster changes saved to: ${rosterPath}`);
    console.log(`\n📋 Summary: ${totalExtraPlayers} players need to be moved to unassigned`);
    console.log(`\n💡 To apply these changes:`);
    console.log(`   1. Open the CMS in your browser`);
    console.log(`   2. Go to Players section`);
    console.log(`   3. For each player in ${rosterPath}, mark them as "Unassigned"`);
    console.log(`   4. Or manually update localStorage with key "playerRosterChanges"`);
  } else {
    console.log(`\n✅ No extra players found - all players match SofaScore!`);
  }
  
  // Generate HTML report
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Squad Comparison with SofaScore</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1400px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
    h1 { color: #333; }
    .club { margin: 20px 0; padding: 15px; background: #f9f9f9; border-left: 4px solid #007bff; border-radius: 4px; }
    .club-name { font-weight: bold; font-size: 18px; color: #007bff; margin-bottom: 10px; }
    .stats { color: #666; margin: 5px 0; }
    .extra-players { margin-top: 10px; padding: 10px; background: #fff3cd; border-radius: 4px; }
    .extra-players h3 { margin-top: 0; color: #856404; }
    .extra-players ul { margin: 5px 0; padding-left: 20px; }
    .extra-players li { margin: 3px 0; }
    .url { margin: 5px 0; }
    .url a { color: #007bff; text-decoration: none; }
    .url a:hover { text-decoration: underline; }
    .summary { padding: 15px; background: #d4edda; border-radius: 4px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 Squad Comparison with SofaScore</h1>
    <div class="summary">
      <strong>Total Extra Players Found:</strong> ${totalExtraPlayers}
    </div>
    ${Object.entries(results).map(([club, data]) => `
      <div class="club">
        <div class="club-name">${club}</div>
        <div class="stats">Our Squad: ${data.ourCount} players | SofaScore: ${data.sofascoreCount} players</div>
        <div class="stats">Matched: ${data.matchedCount || 0}/${data.ourCount} players</div>
        ${data.extraPlayers && data.extraPlayers.length > 0 ? `
          <div class="extra-players">
            <h3>⚠️ Extra Players (${data.extraPlayers.length}) - Move to Unassigned:</h3>
            <ul>
              ${data.extraPlayers.map(p => `<li>${p}</li>`).join('')}
            </ul>
          </div>
        ` : '<div style="color: green; margin-top: 10px;">✅ All players match SofaScore</div>'}
        <div class="url">SofaScore: <a href="${data.url}" target="_blank">${data.url}</a></div>
      </div>
    `).join('')}
  </div>
</body>
</html>`;
  
  const htmlPath = join(outputDir, 'squad-comparison-report.html');
  writeFileSync(htmlPath, htmlContent);
  console.log(`✅ HTML report created: ${htmlPath}`);
  console.log(`   Open this file in your browser for a detailed view!\n`);
}

main().catch(console.error);


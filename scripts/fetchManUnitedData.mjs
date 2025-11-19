#!/usr/bin/env node

/**
 * Script to fetch Manchester United data from SofaScore:
 * - Transfer ins and outs
 * - Team statistics (total players, avg age, foreign players, national team players)
 * - Missing players and their images
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MANCHESTER_UNITED = {
  slug: 'manchester-united',
  id: 35,
};

// Fetch data from SofaScore API
async function fetchSofaScoreData(endpoint) {
  try {
    const url = `https://api.sofascore.com/api/v1${endpoint}`;
    console.log(`  Fetching: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': `https://www.sofascore.com/football/team/${MANCHESTER_UNITED.slug}/${MANCHESTER_UNITED.id}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.log(`  ⚠️  Failed: ${error.message}`);
    return null;
  }
}

// Fetch team details and statistics
async function fetchTeamStatistics() {
  console.log('\n📊 Fetching Team Statistics...');
  const data = await fetchSofaScoreData(`/team/${MANCHESTER_UNITED.id}`);
  
  if (!data || !data.team) {
    console.log('  ❌ Could not fetch team statistics');
    return null;
  }
  
  const team = data.team;
  const stats = {
    totalPlayers: team.players?.length || 0,
    averageAge: null,
    foreignPlayers: null,
    nationalTeamPlayers: null,
    // Additional info
    name: team.name,
    slug: team.slug,
    country: team.country?.name,
    founded: team.founded,
    venue: team.venue?.name,
    venueCapacity: team.venue?.capacity,
  };
  
  // Try to get players from the players endpoint
  const playersData = await fetchSofaScoreData(`/team/${MANCHESTER_UNITED.id}/players`);
  let playersArray = [];
  
  if (playersData) {
    if (Array.isArray(playersData)) {
      playersArray = playersData;
    } else if (playersData.players && Array.isArray(playersData.players)) {
      playersArray = playersData.players;
    }
  }
  
  if (playersArray.length > 0) {
    stats.totalPlayers = playersArray.length;
    
    // Calculate average age
    const ages = playersArray
      .map(item => {
        const p = item.player || item;
        if (p.dateOfBirthTimestamp) {
          return Math.floor((Date.now() / 1000 - p.dateOfBirthTimestamp) / (365.25 * 24 * 60 * 60));
        }
        return null;
      })
      .filter(age => age !== null);
    
    if (ages.length > 0) {
      stats.averageAge = (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1);
    }
    
    // Count foreign players (not from England/UK)
    const foreignCount = playersArray.filter(item => {
      const p = item.player || item;
      const nationality = p.country?.name || p.nationality || '';
      return !['England', 'United Kingdom', 'UK', 'Wales', 'Scotland', 'Northern Ireland'].includes(nationality);
    }).length;
    stats.foreignPlayers = foreignCount;
    
    // Count national team players (players with national team data)
    const nationalTeamCount = playersArray.filter(item => {
      const p = item.player || item;
      return p.nationalTeam?.name || false;
    }).length;
    stats.nationalTeamPlayers = nationalTeamCount;
  }
  
  console.log('  ✅ Team Statistics:');
  console.log(`     Total Players: ${stats.totalPlayers}`);
  console.log(`     Average Age: ${stats.averageAge || 'N/A'} years`);
  console.log(`     Foreign Players: ${stats.foreignPlayers || 'N/A'}`);
  console.log(`     National Team Players: ${stats.nationalTeamPlayers || 'N/A'}`);
  
  return stats;
}

// Fetch transfers (ins and outs)
async function fetchTransfers() {
  console.log('\n🔄 Fetching Transfers (Ins & Outs)...');
  
  // Try different endpoints for transfers
  const endpoints = [
    `/team/${MANCHESTER_UNITED.id}/transfers`,
    `/team/${MANCHESTER_UNITED.id}/transfers/arrivals`,
    `/team/${MANCHESTER_UNITED.id}/transfers/departures`,
  ];
  
  let transfers = {
    arrivals: [],
    departures: [],
  };
  
  // Try to get transfers from team endpoint
  const teamData = await fetchSofaScoreData(`/team/${MANCHESTER_UNITED.id}`);
  if (teamData && teamData.transfers) {
    if (Array.isArray(teamData.transfers)) {
      // If it's an array, try to categorize
      teamData.transfers.forEach(t => {
        if (t.type === 'arrival' || t.toTeam?.id === MANCHESTER_UNITED.id) {
          transfers.arrivals.push(t);
        } else if (t.type === 'departure' || t.fromTeam?.id === MANCHESTER_UNITED.id) {
          transfers.departures.push(t);
        }
      });
    } else {
      transfers = teamData.transfers;
    }
  }
  
  // Try specific transfer endpoints
  for (const endpoint of endpoints) {
    const data = await fetchSofaScoreData(endpoint);
    if (data) {
      if (Array.isArray(data)) {
        data.forEach(t => {
          if (t.toTeam?.id === MANCHESTER_UNITED.id || endpoint.includes('arrivals')) {
            transfers.arrivals.push(t);
          } else if (t.fromTeam?.id === MANCHESTER_UNITED.id || endpoint.includes('departures')) {
            transfers.departures.push(t);
          }
        });
      } else if (data.arrivals) {
        transfers.arrivals.push(...(Array.isArray(data.arrivals) ? data.arrivals : []));
      } else if (data.departures) {
        transfers.departures.push(...(Array.isArray(data.departures) ? data.departures : []));
      }
    }
  }
  
  // Remove duplicates
  const uniqueArrivals = [];
  const seenArrivals = new Set();
  transfers.arrivals.forEach(t => {
    const key = `${t.player?.name}-${t.date}`;
    if (!seenArrivals.has(key)) {
      seenArrivals.add(key);
      uniqueArrivals.push(t);
    }
  });
  
  const uniqueDepartures = [];
  const seenDepartures = new Set();
  transfers.departures.forEach(t => {
    const key = `${t.player?.name}-${t.date}`;
    if (!seenDepartures.has(key)) {
      seenDepartures.add(key);
      uniqueDepartures.push(t);
    }
  });
  
  transfers.arrivals = uniqueArrivals;
  transfers.departures = uniqueDepartures;
  
  console.log(`  ✅ Found ${transfers.arrivals.length} arrivals and ${transfers.departures.length} departures`);
  
  if (transfers.arrivals.length > 0) {
    console.log('\n  📥 Arrivals:');
    transfers.arrivals.slice(0, 10).forEach(t => {
      const playerName = t.player?.name || 'Unknown';
      const fromTeam = t.fromTeam?.name || 'Unknown';
      const date = t.date || 'N/A';
      const fee = t.fee || 'N/A';
      console.log(`     - ${playerName} from ${fromTeam} (${date}) - ${fee}`);
    });
  }
  
  if (transfers.departures.length > 0) {
    console.log('\n  📤 Departures:');
    transfers.departures.slice(0, 10).forEach(t => {
      const playerName = t.player?.name || 'Unknown';
      const toTeam = t.toTeam?.name || 'Unknown';
      const date = t.date || 'N/A';
      const fee = t.fee || 'N/A';
      console.log(`     - ${playerName} to ${toTeam} (${date}) - ${fee}`);
    });
  }
  
  return transfers;
}

// Fetch all players with their images
async function fetchPlayersWithImages() {
  console.log('\n👥 Fetching Players with Images...');
  
  const data = await fetchSofaScoreData(`/team/${MANCHESTER_UNITED.id}/players`);
  
  if (!data) {
    console.log('  ❌ Could not fetch players');
    return [];
  }
  
  // Debug: log the structure
  console.log('  📋 API Response structure:', Object.keys(data));
  
  const players = [];
  let playersArray = [];
  
  // Handle different response structures
  if (Array.isArray(data)) {
    playersArray = data;
  } else if (data.players && Array.isArray(data.players)) {
    playersArray = data.players;
  } else if (data.squad) {
    // If it's a squad object with positions
    Object.values(data.squad).forEach(positionPlayers => {
      if (Array.isArray(positionPlayers)) {
        playersArray.push(...positionPlayers);
      }
    });
  }
  
  console.log(`  📊 Found ${playersArray.length} player entries`);
  
  for (const item of playersArray) {
    const player = item.player || item;
    if (!player || !player.name) continue;
    
    // Get image URL - try different possible fields
    let imageUrl = player.image || player.imageUrl || player.photo || null;
    if (!imageUrl && player.id) {
      // Try to construct image URL from player ID
      imageUrl = `https://api.sofascore.com/api/v1/player/${player.id}/image`;
    }
    
    const playerData = {
      name: player.name,
      position: item.position?.name || player.position?.name || null,
      shirtNumber: item.shirtNumber || player.shirtNumber || null,
      age: player.dateOfBirthTimestamp ? 
        Math.floor((Date.now() / 1000 - player.dateOfBirthTimestamp) / (365.25 * 24 * 60 * 60)) : null,
      nationality: player.country?.name || player.nationality || null,
      dateOfBirth: player.dateOfBirthTimestamp ? 
        new Date(player.dateOfBirthTimestamp * 1000).toISOString().split('T')[0] : null,
      imageUrl: imageUrl,
      sofascoreId: player.id || null,
      sofascoreSlug: player.slug || null,
      height: player.height || null,
      weight: player.weight || null,
      preferredFoot: player.preferredFoot || null,
      nationalTeam: player.nationalTeam?.name || null,
    };
    
    players.push(playerData);
  }
  
  console.log(`  ✅ Found ${players.length} players`);
  console.log(`  📸 Players with images: ${players.filter(p => p.imageUrl).length}`);
  
  return players;
}

// Download player image
async function downloadPlayerImage(imageUrl, playerName, clubName) {
  if (!imageUrl) return null;
  
  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = response.headers.get('content-type') || 'image/png';
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.log(`     ⚠️  Could not download image for ${playerName}: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🔴 Fetching Manchester United Data from SofaScore\n');
  console.log('='.repeat(100));
  
  const outputDir = join(__dirname, '../scripts/output');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  
  // Fetch all data
  const [teamStats, transfers, players] = await Promise.all([
    fetchTeamStatistics(),
    fetchTransfers(),
    fetchPlayersWithImages(),
  ]);
  
  // Download images for players missing images
  console.log('\n📥 Downloading Player Images...');
  const playersWithImages = [];
  
  for (const player of players) {
    if (player.imageUrl) {
      console.log(`  Downloading image for ${player.name}...`);
      const imageData = await downloadPlayerImage(player.imageUrl, player.name, 'Manchester United');
      if (imageData) {
        player.imageDataUrl = imageData;
        playersWithImages.push(player);
        console.log(`     ✅ Downloaded`);
      } else {
        console.log(`     ⚠️  Failed`);
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Compile results
  const results = {
    teamStatistics: teamStats,
    transfers,
    players: playersWithImages,
    fetchedAt: new Date().toISOString(),
  };
  
  // Save results
  const resultsPath = join(outputDir, 'manchester-united-data.json');
  writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Results saved to: ${resultsPath}`);
  
  // Create summary report
  const summary = {
    teamStatistics: teamStats,
    transferSummary: {
      arrivals: transfers.arrivals.length,
      departures: transfers.departures.length,
      arrivalsList: transfers.arrivals.map(t => ({
        player: t.player?.name,
        from: t.fromTeam?.name,
        date: t.date,
        fee: t.fee,
      })),
      departuresList: transfers.departures.map(t => ({
        player: t.player?.name,
        to: t.toTeam?.name,
        date: t.date,
        fee: t.fee,
      })),
    },
    playersSummary: {
      total: players.length,
      withImages: playersWithImages.length,
      missingImages: players.length - playersWithImages.length,
    },
  };
  
  const summaryPath = join(outputDir, 'manchester-united-summary.json');
  writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`✅ Summary saved to: ${summaryPath}`);
  
  // Generate HTML report
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Manchester United - SofaScore Data</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
    h1 { color: #DA020E; }
    .section { margin: 20px 0; padding: 15px; background: #f9f9f9; border-left: 4px solid #DA020E; border-radius: 4px; }
    .stat { display: inline-block; margin: 10px 20px 10px 0; }
    .stat-label { color: #666; font-size: 14px; }
    .stat-value { color: #DA020E; font-size: 24px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #DA020E; color: white; }
    .player-image { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔴 Manchester United - SofaScore Data</h1>
    
    ${teamStats ? `
    <div class="section">
      <h2>Team Statistics</h2>
      <div class="stat">
        <div class="stat-label">Total Players</div>
        <div class="stat-value">${teamStats.totalPlayers}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Average Age</div>
        <div class="stat-value">${teamStats.averageAge || 'N/A'} yrs</div>
      </div>
      <div class="stat">
        <div class="stat-label">Foreign Players</div>
        <div class="stat-value">${teamStats.foreignPlayers || 'N/A'}</div>
      </div>
      <div class="stat">
        <div class="stat-label">National Team Players</div>
        <div class="stat-value">${teamStats.nationalTeamPlayers || 'N/A'}</div>
      </div>
    </div>
    ` : ''}
    
    ${transfers.arrivals.length > 0 ? `
    <div class="section">
      <h2>📥 Arrivals (${transfers.arrivals.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Player</th>
            <th>From</th>
            <th>Date</th>
            <th>Fee</th>
          </tr>
        </thead>
        <tbody>
          ${transfers.arrivals.map(t => `
            <tr>
              <td>${t.player?.name || 'Unknown'}</td>
              <td>${t.fromTeam?.name || 'Unknown'}</td>
              <td>${t.date || 'N/A'}</td>
              <td>${t.fee || 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}
    
    ${transfers.departures.length > 0 ? `
    <div class="section">
      <h2>📤 Departures (${transfers.departures.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Player</th>
            <th>To</th>
            <th>Date</th>
            <th>Fee</th>
          </tr>
        </thead>
        <tbody>
          ${transfers.departures.map(t => `
            <tr>
              <td>${t.player?.name || 'Unknown'}</td>
              <td>${t.toTeam?.name || 'Unknown'}</td>
              <td>${t.date || 'N/A'}</td>
              <td>${t.fee || 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}
    
    <div class="section">
      <h2>👥 Players (${players.length})</h2>
      <p>Players with images: ${playersWithImages.length}</p>
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Position</th>
            <th>Number</th>
            <th>Age</th>
            <th>Nationality</th>
          </tr>
        </thead>
        <tbody>
          ${players.map(p => `
            <tr>
              <td>${p.imageDataUrl ? `<img src="${p.imageDataUrl}" class="player-image" />` : '-'}</td>
              <td>${p.name}</td>
              <td>${p.position || '-'}</td>
              <td>${p.shirtNumber || '-'}</td>
              <td>${p.age || '-'}</td>
              <td>${p.nationality || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;
  
  const htmlPath = join(outputDir, 'manchester-united-report.html');
  writeFileSync(htmlPath, htmlContent);
  console.log(`✅ HTML report created: ${htmlPath}`);
  console.log(`   Open this file in your browser for a detailed view!\n`);
}

main().catch(console.error);


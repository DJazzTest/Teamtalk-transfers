#!/usr/bin/env node

/**
 * Script to check manager information for all Premier League clubs
 * and identify which ones need updates
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read current team bios
const teamBiosPath = join(__dirname, '../src/data/teamBios.ts');
const teamBiosContent = readFileSync(teamBiosPath, 'utf-8');

// Extract current managers from team bios
function extractCurrentManagers(content) {
  const managers = {};
  const managerRegex = /{ label: 'Manager', value: '([^']+)' }/g;
  let match;
  
  // Find all team entries
  const teamEntries = content.match(/'([^']+)':\s*\{[\s\S]*?facts: \[[\s\S]*?\],/g) || [];
  
  for (const entry of teamEntries) {
    const teamMatch = entry.match(/'([^']+)':/);
    const managerMatch = entry.match(/{ label: 'Manager', value: '([^']+)' }/);
    
    if (teamMatch && managerMatch) {
      managers[teamMatch[1]] = managerMatch[1];
    }
  }
  
  return managers;
}

// Premier League clubs to check
const PREMIER_LEAGUE_CLUBS = [
  'Arsenal',
  'Aston Villa',
  'AFC Bournemouth',
  'Brentford',
  'Brighton & Hove Albion',
  'Chelsea',
  'Crystal Palace',
  'Everton',
  'Fulham',
  'Ipswich Town',
  'Leicester City',
  'Liverpool',
  'Manchester City',
  'Manchester United',
  'Newcastle United',
  'Nottingham Forest',
  'Southampton',
  'Tottenham Hotspur',
  'West Ham United',
  'Wolverhampton Wanderers',
];

// SofaScore URLs for each club
const SOFASCORE_URLS = {
  'Arsenal': 'https://www.sofascore.com/football/team/arsenal/42',
  'Aston Villa': 'https://www.sofascore.com/football/team/aston-villa/35',
  'AFC Bournemouth': 'https://www.sofascore.com/football/team/bournemouth/35',
  'Brentford': 'https://www.sofascore.com/football/team/brentford/35',
  'Brighton & Hove Albion': 'https://www.sofascore.com/football/team/brighton-hove-albion/35',
  'Chelsea': 'https://www.sofascore.com/football/team/chelsea/35',
  'Crystal Palace': 'https://www.sofascore.com/football/team/crystal-palace/35',
  'Everton': 'https://www.sofascore.com/football/team/everton/35',
  'Fulham': 'https://www.sofascore.com/football/team/fulham/35',
  'Ipswich Town': 'https://www.sofascore.com/football/team/ipswich-town/35',
  'Leicester City': 'https://www.sofascore.com/football/team/leicester-city/35',
  'Liverpool': 'https://www.sofascore.com/football/team/liverpool/35',
  'Manchester City': 'https://www.sofascore.com/football/team/manchester-city/35',
  'Manchester United': 'https://www.sofascore.com/football/team/manchester-united/35',
  'Newcastle United': 'https://www.sofascore.com/football/team/newcastle-united/35',
  'Nottingham Forest': 'https://www.sofascore.com/football/team/nottingham-forest/35',
  'Southampton': 'https://www.sofascore.com/football/team/southampton/35',
  'Tottenham Hotspur': 'https://www.sofascore.com/football/team/tottenham-hotspur/35',
  'West Ham United': 'https://www.sofascore.com/football/team/west-ham-united/35',
  'Wolverhampton Wanderers': 'https://www.sofascore.com/football/team/wolverhampton-wanderers/35',
};

async function checkManager(clubName, currentManager) {
  console.log(`\n🔍 Checking ${clubName}...`);
  console.log(`   Current: ${currentManager}`);
  console.log(`   SofaScore: ${SOFASCORE_URLS[clubName]}`);
  
  // Since SofaScore is JS-rendered, we'll need to manually check or use web search
  // For now, return the URL so user can check manually
  return {
    club: clubName,
    current: currentManager,
    url: SOFASCORE_URLS[clubName],
    needsCheck: true
  };
}

async function main() {
  console.log('📋 Checking managers for all Premier League clubs...\n');
  
  const currentManagers = extractCurrentManagers(teamBiosContent);
  console.log('Current managers found:', Object.keys(currentManagers).length);
  
  const results = [];
  
  for (const club of PREMIER_LEAGUE_CLUBS) {
    const currentManager = currentManagers[club] || 'Not found in bios';
    const result = await checkManager(club, currentManager);
    results.push(result);
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n\n📊 Summary:');
  console.log('='.repeat(80));
  console.log('\nPlease check the following SofaScore URLs manually:');
  console.log('(SofaScore pages are JavaScript-rendered, so automated extraction is difficult)\n');
  
  results.forEach(r => {
    console.log(`${r.club}:`);
    console.log(`  Current Manager: ${r.current}`);
    console.log(`  SofaScore URL: ${r.url}`);
    console.log('');
  });
  
  // Save results to file
  const outputPath = join(__dirname, '../scripts/output/manager-check-results.json');
  writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Results saved to: ${outputPath}`);
}

main().catch(console.error);

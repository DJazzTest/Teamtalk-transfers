#!/usr/bin/env node

/**
 * Script to check current managers against SofaScore for all Premier League clubs
 * Outputs a formatted list with URLs for easy manual verification
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read team bios to get current managers
const teamBiosPath = join(__dirname, '../src/data/teamBios.ts');
const teamBiosContent = readFileSync(teamBiosPath, 'utf-8');

// Extract current managers from team bios
function extractManagers(content) {
  const managers = {};
  
  // Match team entries with manager/head coach facts
  const teamPattern = /'([^']+)':\s*\{[\s\S]*?facts:\s*\[([\s\S]*?)\],/g;
  let match;
  
  while ((match = teamPattern.exec(content)) !== null) {
    const teamName = match[1];
    const factsContent = match[2];
    
    // Look for Manager or Head Coach
    const managerMatch = factsContent.match(/{ label: '(?:Manager|Head Coach)', value: '([^']+)' }/);
    if (managerMatch) {
      managers[teamName] = managerMatch[1];
    }
  }
  
  return managers;
}

// SofaScore team slugs (verified for Premier League clubs)
const SOFASCORE_SLUGS = {
  'Arsenal': 'arsenal',
  'Aston Villa': 'aston-villa',
  'AFC Bournemouth': 'bournemouth',
  'Brentford': 'brentford',
  'Brighton & Hove Albion': 'brighton-hove-albion',
  'Chelsea': 'chelsea',
  'Crystal Palace': 'crystal-palace',
  'Everton': 'everton',
  'Fulham': 'fulham',
  'Ipswich Town': 'ipswich-town',
  'Leicester City': 'leicester-city',
  'Liverpool': 'liverpool',
  'Manchester City': 'manchester-city',
  'Manchester United': 'manchester-united',
  'Newcastle United': 'newcastle-united',
  'Nottingham Forest': 'nottingham-forest',
  'Southampton': 'southampton',
  'Tottenham Hotspur': 'tottenham-hotspur',
  'West Ham United': 'west-ham-united',
  'Wolverhampton Wanderers': 'wolverhampton-wanderers',
};

// Premier League clubs in order
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

async function main() {
  console.log('📋 Manager Verification - Premier League Clubs 2024/25\n');
  console.log('='.repeat(100));
  console.log('Current managers in team bios vs SofaScore URLs for verification\n');
  console.log('='.repeat(100));
  
  const currentManagers = extractManagers(teamBiosContent);
  
  const results = [];
  
  PREMIER_LEAGUE_CLUBS.forEach((club, index) => {
    const currentManager = currentManagers[club] || '❌ NOT FOUND IN BIOS';
    const slug = SOFASCORE_SLUGS[club];
    const url = slug ? `https://www.sofascore.com/football/team/${slug}` : 'N/A';
    
    results.push({
      club,
      currentManager,
      url
    });
    
    console.log(`\n${(index + 1).toString().padStart(2, ' ')}. ${club}`);
    console.log(`    Current in Bio: ${currentManager}`);
    console.log(`    SofaScore URL:  ${url}`);
  });
  
  console.log('\n' + '='.repeat(100));
  console.log('\n📝 Instructions:');
  console.log('1. Open each SofaScore URL in your browser');
  console.log('2. Navigate to the team page and find the manager/coach information');
  console.log('3. Compare with the "Current in Bio" value');
  console.log('4. If they don\'t match, note the correct manager name');
  console.log('5. Update the teamBios.ts file with the correct manager\n');
  
  // Ensure output directory exists
  const outputDir = join(__dirname, '../scripts/output');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  
  // Save results to JSON file for reference
  const outputPath = join(outputDir, 'manager-verification.json');
  writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`✅ Results saved to: ${outputPath}\n`);
  
  // Generate HTML file for easy clicking
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Manager Verification - Premier League Clubs</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
    h1 { color: #333; }
    .club { margin: 15px 0; padding: 15px; background: #f9f9f9; border-left: 4px solid #007bff; border-radius: 4px; }
    .club-name { font-weight: bold; font-size: 18px; color: #007bff; margin-bottom: 8px; }
    .manager { color: #666; margin: 5px 0; }
    .url { margin: 5px 0; }
    .url a { color: #007bff; text-decoration: none; }
    .url a:hover { text-decoration: underline; }
    .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-left: 10px; }
    .status.verified { background: #d4edda; color: #155724; }
    .status.pending { background: #fff3cd; color: #856404; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📋 Manager Verification - Premier League Clubs 2024/25</h1>
    <p><strong>Instructions:</strong> Click each URL to check the manager on SofaScore, then verify against the current bio.</p>
    ${results.map((r, i) => `
      <div class="club">
        <div class="club-name">${i + 1}. ${r.club}</div>
        <div class="manager">Current in Bio: <strong>${r.currentManager}</strong></div>
        <div class="url">SofaScore: <a href="${r.url}" target="_blank">${r.url}</a></div>
        <div style="margin-top: 8px;">
          <input type="checkbox" id="check-${i}"> <label for="check-${i}">Verified</label>
        </div>
      </div>
    `).join('')}
  </div>
</body>
</html>`;
  
  const htmlPath = join(outputDir, 'manager-verification.html');
  writeFileSync(htmlPath, htmlContent);
  console.log(`✅ HTML file created: ${htmlPath}`);
  console.log('   Open this file in your browser for easy clicking!\n');
}

main().catch(console.error);


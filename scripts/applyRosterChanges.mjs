#!/usr/bin/env node

/**
 * Helper script to apply roster changes from the comparison script
 * This creates a JSON file that can be imported into localStorage
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const rosterChangesPath = join(__dirname, '../scripts/output/roster-changes-unassigned.json');
  
  if (!existsSync(rosterChangesPath)) {
    console.log('❌ No roster changes file found. Run compareSquadWithSofaScore.mjs first.');
    process.exit(1);
  }
  
  const rosterChanges = JSON.parse(readFileSync(rosterChangesPath, 'utf-8'));
  const playerNames = Object.keys(rosterChanges);
  
  console.log(`📋 Found ${playerNames.length} players to move to unassigned\n`);
  console.log('Players to move:');
  playerNames.forEach((name, index) => {
    console.log(`  ${(index + 1).toString().padStart(3, ' ')}. ${name}`);
  });
  
  console.log(`\n💡 To apply these changes:`);
  console.log(`\n   Option 1: Manual (via CMS)`);
  console.log(`   1. Open the CMS in your browser`);
  console.log(`   2. Go to Players section`);
  console.log(`   3. For each player listed above, select them and click "Mark Unassigned"`);
  
  console.log(`\n   Option 2: Browser Console (localStorage)`);
  console.log(`   1. Open browser DevTools (F12)`);
  console.log(`   2. Go to Console tab`);
  console.log(`   3. Paste and run the following code:\n`);
  
  const localStorageCode = `
// Load existing roster changes
const existing = JSON.parse(localStorage.getItem('playerRosterChanges') || '{}');

// Apply new changes
const newChanges = ${JSON.stringify(rosterChanges, null, 2)};

// Merge changes
Object.assign(existing, newChanges);

// Save back to localStorage
localStorage.setItem('playerRosterChanges', JSON.stringify(existing));

console.log('✅ Applied roster changes for', Object.keys(newChanges).length, 'players');
console.log('Total players in roster:', Object.keys(existing).length);
`;
  
  console.log(localStorageCode);
  
  // Also save as a JavaScript file for easy copy-paste
  const jsPath = join(__dirname, '../scripts/output/apply-roster-changes.js');
  writeFileSync(jsPath, localStorageCode);
  console.log(`\n✅ JavaScript code saved to: ${jsPath}`);
  console.log(`   You can copy-paste this into your browser console to apply changes.\n`);
}

main().catch(console.error);


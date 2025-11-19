#!/usr/bin/env node

/**
 * Script to verify managers from SofaScore for all Premier League clubs
 * Since SofaScore is JS-rendered, this script outputs URLs for manual checking
 * and attempts to extract manager info where possible
 */

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

// SofaScore team slugs and IDs (need to be verified)
const SOFASCORE_MAP = {
  'Arsenal': { slug: 'arsenal', id: 42 },
  'Aston Villa': { slug: 'aston-villa', id: 35 },
  'AFC Bournemouth': { slug: 'bournemouth', id: 35 },
  'Brentford': { slug: 'brentford', id: 35 },
  'Brighton & Hove Albion': { slug: 'brighton-hove-albion', id: 35 },
  'Chelsea': { slug: 'chelsea', id: 35 },
  'Crystal Palace': { slug: 'crystal-palace', id: 35 },
  'Everton': { slug: 'everton', id: 35 },
  'Fulham': { slug: 'fulham', id: 35 },
  'Ipswich Town': { slug: 'ipswich-town', id: 35 },
  'Leicester City': { slug: 'leicester-city', id: 35 },
  'Liverpool': { slug: 'liverpool', id: 35 },
  'Manchester City': { slug: 'manchester-city', id: 35 },
  'Manchester United': { slug: 'manchester-united', id: 35 },
  'Newcastle United': { slug: 'newcastle-united', id: 35 },
  'Nottingham Forest': { slug: 'nottingham-forest', id: 35 },
  'Southampton': { slug: 'southampton', id: 35 },
  'Tottenham Hotspur': { slug: 'tottenham-hotspur', id: 35 },
  'West Ham United': { slug: 'west-ham-united', id: 35 },
  'Wolverhampton Wanderers': { slug: 'wolverhampton-wanderers', id: 35 },
};

console.log('📋 SofaScore URLs for all Premier League clubs:\n');
console.log('='.repeat(80));

PREMIER_LEAGUE_CLUBS.forEach((club, index) => {
  const info = SOFASCORE_MAP[club];
  if (info) {
    const url = `https://www.sofascore.com/football/team/${info.slug}/${info.id}`;
    console.log(`${(index + 1).toString().padStart(2, ' ')}. ${club}`);
    console.log(`    ${url}`);
  }
});

console.log('\n' + '='.repeat(80));
console.log('\n⚠️  Note: SofaScore pages are JavaScript-rendered.');
console.log('   Please manually check each URL to verify the current manager.');
console.log('   The manager information is typically found in the team details section.\n');


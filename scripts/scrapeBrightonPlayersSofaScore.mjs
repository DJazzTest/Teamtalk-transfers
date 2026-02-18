/**
 * Brighton & Hove Albion Player Data Scraper from SofaScore
 * Usage: node scripts/scrapeBrightonPlayersSofaScore.mjs
 * Writes ./brighton-players-data.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DELAY_BETWEEN_REQUESTS = 2000;
const MAX_RETRIES = 3;

const KNOWN_IDS = {};

async function fetchSofaScoreAPI(endpoint, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const res = await fetch(endpoint, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', Accept: 'application/json', Origin: 'https://www.sofascore.com', Referer: 'https://www.sofascore.com/' },
      });
      if (res.ok) return await res.json();
    } catch (_) {}
    if (attempt < retries - 1) await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
  }
  return null;
}

async function findPlayerId(playerName, clubName = 'Brighton') {
  try {
    const data = await fetchSofaScoreAPI(`https://api.sofascore.com/api/v1/search?q=${encodeURIComponent(playerName)}`);
    if (data?.players?.length) {
      for (const p of data.players) {
        const nameMatch = [p.name, p.shortName].some((n) => n?.toLowerCase().includes(playerName.toLowerCase()));
        if (!nameMatch) continue;
        const team = (p.team?.name || p.currentTeam?.name || '').toLowerCase();
        if (team.includes('brighton')) return p.id;
      }
      return data.players[0].id;
    }
  } catch (e) { console.error(`findPlayerId ${playerName}:`, e.message); }
  return null;
}

async function extractPlayerData(playerName) {
  console.log(`\n🔍 ${playerName}...`);
  let playerId = KNOWN_IDS[playerName] || await findPlayerId(playerName);
  if (!playerId) { console.log('  ⚠️  Could not resolve SofaScore ID'); return null; }
  const slug = playerName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/'/g, '');
  const out = { name: playerName, sofascoreId: playerId, url: `https://www.sofascore.com/football/player/${slug}/${playerId}`, bio: {}, seasonStats: null, previousMatches: [] };
  const info = await fetchSofaScoreAPI(`https://api.sofascore.com/api/v1/player/${playerId}`);
  if (info?.player) {
    const p = info.player;
    out.bio = { name: p.name || p.fullName || playerName, height: p.height ? `${p.height} cm` : undefined, weight: p.weight ? `${p.weight} kg` : undefined, nationality: p.country?.name, dateOfBirth: p.dateOfBirth || p.birthDate, placeOfBirth: p.placeOfBirth, preferredFoot: p.preferredFoot, position: p.position, jerseyNumber: p.jerseyNumber || p.shirtNumber };
  }
  const statsData = await fetchSofaScoreAPI(`https://api.sofascore.com/api/v1/player/${playerId}/statistics/season`);
  if (statsData?.statistics) {
    const s = Array.isArray(statsData.statistics) ? statsData.statistics[0] : statsData.statistics;
    if (s) out.seasonStats = { season: '2025-26', competitions: [{ competition: s.tournament?.name || 'League', matches: s.appearances || s.matches || 0, minutes: s.minutes || 0, appearances: s.appearances || s.matches || 0, started: s.started || 0, minutesPerGame: s.minutesPerGame || (s.minutes && s.appearances ? Math.round(s.minutes / s.appearances) : 0), totalMinutes: s.minutes || 0, goals: s.goals || 0, assists: s.assists || 0, cleanSheets: s.cleanSheets || 0, goalsConceded: s.goalsConceded || 0, averageRating: s.rating || s.averageRating || null }] };
  }
  await new Promise((r) => setTimeout(r, DELAY_BETWEEN_REQUESTS));
  return out;
}

async function main() {
  console.log('🚀 Brighton & Hove Albion – SofaScore scrape\n');
  const squadPath = path.join(__dirname, '..', 'src', 'data', 'squadWages.ts');
  const raw = fs.readFileSync(squadPath, 'utf-8');
  const m = raw.match(/'Brighton & Hove Albion':\s*createImageOnlySquad\s*\(\s*'brighton',\s*\[([\s\S]*?)\]\s*\)/);
  if (!m) { console.error('Brighton squad not found in squadWages.ts'); return; }
  const names = [...m[1].matchAll(/\s*'([^']+)'/g)].map((n) => n[1].trim()).filter(Boolean).map((n) => n.replace(/\\'/g, "'"));
  console.log(`Found ${names.length} players\n`);
  const results = [];
  let ok = 0, fail = 0;
  for (const name of names) {
    try {
      const data = await extractPlayerData(name);
      if (data) { results.push(data); ok++; console.log(`  ✅ ${name}`); } else { fail++; console.log(`  ❌ ${name}`); }
    } catch (e) { fail++; console.error(`  ❌ ${name}:`, e.message); }
  }
  const outPath = path.join(__dirname, '..', 'brighton-players-data.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Done. Success: ${ok} Failed: ${fail}\nResults: ${outPath}`);
}

main().catch((e) => { console.error(e); process.exit(1); });

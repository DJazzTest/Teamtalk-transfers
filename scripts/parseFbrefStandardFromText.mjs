#!/usr/bin/env node

/**
 * Parse pasted FBref "Standard" stats tables from local text files
 * and emit clean JSON stats per player for specific clubs.
 *
 * Inputs (plain text copied from FBref, as you've provided in this chat):
 *   - scripts/input/arsenal-standard.txt
 *   - scripts/input/leeds-standard.txt
 *
 * Outputs:
 *   - scripts/output/arsenal-standard.json
 *   - scripts/output/leeds-standard.json
 *
 * Each player object:
 *   {
 *     name: string,
 *     position: string | null,
 *     matches: number | null,   // MP
 *     starts: number | null,
 *     subAppearances: number | null,  // derived: matches - starts (times came on from bench)
 *     minutes: number | null,
 *     goals: number | null,
 *     assists: number | null,
 *     goalsNoPen: number | null,
 *     pensScored: number | null,
 *     pensTaken: number | null,
 *     yellowCards: number | null,
 *     redCards: number | null,
 *     goalsPer90: number | null,
 *     assistsPer90: number | null,
 *     gaPer90: number | null,
 *     gNoPenPer90: number | null,
 *     gaNoPenPer90: number | null
 *   }
 *
 * NOTE: We intentionally ignore "Age" and the textual "Matches" column at the end,
 * as requested.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const INPUT_DIR = path.join(ROOT, 'scripts', 'input');
const OUTPUT_DIR = path.join(ROOT, 'scripts', 'output');

const CLUB_FILES = [
  // Existing
  { club: 'Arsenal', input: 'arsenal-standard.txt', output: 'arsenal-standard.json' },
  { club: 'Leeds United', input: 'leeds-standard.txt', output: 'leeds-standard.json' },
  // New Premier League clubs from FBref squad URLs
  { club: 'Manchester City', input: 'manchester-city-standard.txt', output: 'manchester-city-standard.json' },
  { club: 'Manchester United', input: 'manchester-united-standard.txt', output: 'manchester-united-standard.json' },
  { club: 'Aston Villa', input: 'aston-villa-standard.txt', output: 'aston-villa-standard.json' },
  { club: 'Chelsea', input: 'chelsea-standard.txt', output: 'chelsea-standard.json' },
  { club: 'Liverpool', input: 'liverpool-standard.txt', output: 'liverpool-standard.json' },
  { club: 'Brentford', input: 'brentford-standard.txt', output: 'brentford-standard.json' },
  { club: 'Everton', input: 'everton-standard.txt', output: 'everton-standard.json' },
  { club: 'AFC Bournemouth', input: 'bournemouth-standard.txt', output: 'bournemouth-standard.json' },
  { club: 'Newcastle United', input: 'newcastle-united-standard.txt', output: 'newcastle-united-standard.json' },
  { club: 'Sunderland', input: 'sunderland-standard.txt', output: 'sunderland-standard.json' },
  { club: 'Fulham', input: 'fulham-standard.txt', output: 'fulham-standard.json' },
  { club: 'Crystal Palace', input: 'crystal-palace-standard.txt', output: 'crystal-palace-standard.json' },
  { club: 'Brighton & Hove Albion', input: 'brighton-standard.txt', output: 'brighton-standard.json' },
  { club: 'Tottenham Hotspur', input: 'tottenham-hotspur-standard.txt', output: 'tottenham-hotspur-standard.json' },
  { club: 'Nottingham Forest', input: 'nottingham-forest-standard.txt', output: 'nottingham-forest-standard.json' },
  { club: 'West Ham United', input: 'west-ham-united-standard.txt', output: 'west-ham-united-standard.json' },
  { club: 'Burnley', input: 'burnley-standard.txt', output: 'burnley-standard.json' },
  { club: 'Wolverhampton Wanderers', input: 'wolverhampton-wanderers-standard.txt', output: 'wolverhampton-wanderers-standard.json' }
];

function parseNumber(val) {
  if (val == null) return null;
  const cleaned = String(val).replace(/,/g, '').trim();
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parseStandardText(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const headerIdx = lines.findIndex((l) => l.startsWith('Player'));
  if (headerIdx === -1) {
    throw new Error('Could not find header line starting with "Player"');
  }

  const rows = lines.slice(headerIdx + 1);
  const players = [];

  for (const rawLine of rows) {
    if (!rawLine || rawLine.startsWith('Squad Total') || rawLine.startsWith('Opponent Total')) {
      continue;
    }

    // Normalize whitespace into tabs to make splitting easier.
    const normalized = rawLine.replace(/\s{2,}/g, '\t');
    let cols = normalized.split('\t').filter((c) => c !== '');

    // Lines with all the trailing empty FBref cells will end with 'Matches'
    if (cols[0] === 'Player' || cols[0] === 'Squad' || cols[0] === 'Opponent') continue;
    if (cols.length < 8) continue; // Too short to be a real row

    const name = cols[0];
    if (!name || name === 'Player') continue;

    // We expect this column order (after normalization):
    // 0: Player
    // 1: Nation
    // 2: Pos
    // 3: Age   (ignored)
    // 4: MP
    // 5: Starts
    // 6: Min
    // 7: 90s
    // 8: Gls
    // 9: Ast
    // 10: G+A
    // 11: G-PK
    // 12: PK
    // 13: PKatt
    // 14: CrdY
    // 15: CrdR
    // 16: Gls/90
    // 17: Ast/90
    // 18: G+A/90
    // 19: G-PK/90
    // 20: G+A-PK/90
    // 21: Matches (text) – ignored

    const get = (idx) => (idx < cols.length ? cols[idx] : '');

    const position = get(2) || null;
    const matches = parseNumber(get(4));
    const starts = parseNumber(get(5));
    const minutes = parseNumber(get(6));
    const goals = parseNumber(get(8));
    const assists = parseNumber(get(9));
    const ga = parseNumber(get(10));
    const gNoPen = parseNumber(get(11));
    const pensScored = parseNumber(get(12));
    const pensTaken = parseNumber(get(13));
    const yellow = parseNumber(get(14));
    const red = parseNumber(get(15));
    const gls90 = parseNumber(get(16));
    const ast90 = parseNumber(get(17));
    const ga90 = parseNumber(get(18));
    const gNoPen90 = parseNumber(get(19));
    const gaNoPen90 = parseNumber(get(20));

    const subAppearances =
      matches != null && starts != null ? Math.max(0, matches - starts) : null;

    players.push({
      name,
      position,
      matches,
      starts,
      subAppearances,
      minutes,
      goals,
      assists,
      goalsNoPen: gNoPen,
      pensScored,
      pensTaken,
      yellowCards: yellow,
      redCards: red,
      goalsPer90: gls90,
      assistsPer90: ast90,
      gaPer90: ga90,
      gNoPenPer90: gNoPen90,
      gaNoPenPer90: gaNoPen90
    });
  }

  return players;
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  for (const cfg of CLUB_FILES) {
    const inPath = path.join(INPUT_DIR, cfg.input);
    if (!fs.existsSync(inPath)) {
      console.warn(`⚠️  Input not found for ${cfg.club}: ${inPath}`);
      continue;
    }
    const raw = fs.readFileSync(inPath, 'utf8');
    const players = parseStandardText(raw);
    const outPath = path.join(OUTPUT_DIR, cfg.output);
    fs.writeFileSync(outPath, JSON.stringify(players, null, 2), 'utf8');
    console.log(`✅ Parsed ${players.length} players for ${cfg.club} → ${path.relative(ROOT, outPath)}`);
  }
}

main().catch((err) => {
  console.error('Fatal error while parsing FBref standard text:', err);
  process.exit(1);
});


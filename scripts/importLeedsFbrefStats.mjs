#!/usr/bin/env node

/**
 * Import Leeds United player stats from FBref and export them to JSON,
 * mirroring the existing Arsenal FBref import.
 *
 * Source page (standard stats):
 *   https://fbref.com/en/squads/5bfb9659/Leeds-United-Stats#all_stats_standard
 *
 * Output:
 *   scripts/output/leeds-fbref-standard-stats.json
 *
 * Each entry is:
 *   {
 *     name: string,              // Player name as on FBref
 *     position: string | null,   // Pos column
 *     age: number | null,
 *     matches: number | null,
 *     starts: number | null,
 *     minutes: number | null,
 *     goals: number | null,
 *     assists: number | null,
 *     shots: number | null,
 *     shotsOnTarget: number | null,
 *     yellowCards: number | null,
 *     redCards: number | null,
 *     xg: number | null,
 *     npxg: number | null,
 *     xgAssist: number | null,
 *     playerPath: string | null   // e.g. /en/players/d5d22a58/Gabriel-Gudmundsson
 *   }
 */

import fs from 'node:fs';
import path from 'node:path';

const FBREF_URL =
  'https://fbref.com/en/squads/5bfb9659/Leeds-United-Stats?tab=stats_standard';

const ROOT_DIR = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'scripts', 'output');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'leeds-fbref-standard-stats.json');

function parseNumber(val) {
  if (val == null) return null;
  const cleaned = String(val).replace(/,/g, '').trim();
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  });
  if (!res.ok) {
    throw new Error(`FBref HTTP ${res.status}`);
  }
  return await res.text();
}

function extractStandardTable(html) {
  const tableId = 'stats_standard_5bfb9659';
  const startIdx = html.indexOf(`<table id="${tableId}"`);
  if (startIdx === -1) {
    throw new Error(`Could not find table with id ${tableId}`);
  }
  const afterTable = html.indexOf('</table>', startIdx);
  if (afterTable === -1) {
    throw new Error('Could not find </table> end tag');
  }
  return html.slice(startIdx, afterTable + '</table>'.length);
}

function decodeHtmlEntities(str) {
  if (!str) return str;
  return str
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function stripTags(str) {
  return decodeHtmlEntities(str.replace(/<[^>]*>/g, '')).trim();
}

function parseStandardRows(tableHtml) {
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const rows = [];
  let m;
  while ((m = rowRegex.exec(tableHtml)) !== null) {
    rows.push(m[1]);
  }

  const players = [];

  for (const row of rows) {
    // Skip header and summary rows
    if (row.includes('thead')) continue;
    if (!row.includes('data-stat="player"')) continue;

    const getCell = (dataStat) => {
      const cellRegex = new RegExp(
        `<(td|th)[^>]*data-stat=["']${dataStat}["'][^>]*>([\\s\\S]*?)<\\/\\1>`,
        'i'
      );
      const match = cellRegex.exec(row);
      return match ? stripTags(match[2]) : '';
    };

    const getPlayerHref = () => {
      // Within the player cell, find the anchor href
      const cellRegex = /<td[^>]*data-stat=["']player["'][^>]*>([\s\S]*?)<\/td>/i;
      const cellMatch = cellRegex.exec(row);
      if (!cellMatch) return null;
      const cellHtml = cellMatch[1];
      const hrefMatch = cellHtml.match(/href=["']([^"']+)["']/i);
      return hrefMatch ? hrefMatch[1] : null;
    };

    const name = getCell('player');
    if (!name) continue;

    const pos = getCell('position');
    const age = parseNumber(getCell('age'));
    const matches = parseNumber(getCell('games'));
    const starts = parseNumber(getCell('games_starts'));
    const minutes = parseNumber(getCell('minutes'));
    const goals = parseNumber(getCell('goals'));
    const assists = parseNumber(getCell('assists'));
    const shots = parseNumber(getCell('shots_total'));
    const shotsOnTarget = parseNumber(getCell('shots_on_target'));
    const yellowCards = parseNumber(getCell('cards_yellow'));
    const redCards = parseNumber(getCell('cards_red'));
    const xg = parseNumber(getCell('xg'));
    const npxg = parseNumber(getCell('npxg'));
    const xgAssist = parseNumber(getCell('xg_assist'));
    const playerPath = getPlayerHref();

    players.push({
      name,
      position: pos || null,
      age,
      matches,
      starts,
      minutes,
      goals,
      assists,
      shots,
      shotsOnTarget,
      yellowCards,
      redCards,
      xg,
      npxg,
      xgAssist,
      playerPath: playerPath || null
    });
  }

  return players;
}

async function main() {
  console.log('🔎 Fetching Leeds United standard stats from FBref…');
  const html = await fetchHtml(FBREF_URL);
  const tableHtml = extractStandardTable(html);
  const players = parseStandardRows(tableHtml);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(players, null, 2), 'utf8');

  console.log(`✅ Parsed ${players.length} Leeds player rows from FBref.`);
  console.log(`💾 Saved to ${path.relative(ROOT_DIR, OUTPUT_PATH)}`);
  console.log(
    'Next step: use playerPath to fetch each /en/players/... page for detailed bios and match logs, then map onto clubSquads[\"Leeds United\"] like we do for Arsenal.'
  );
}

main().catch((err) => {
  console.error('Fatal error while importing Leeds FBref stats:', err);
  process.exit(1);
});


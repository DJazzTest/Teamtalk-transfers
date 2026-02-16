/**
 * Import Premier League squads and player data from Sportmonks Football API (v3)
 *
 * This is a scaffold: it does NOT make any external calls until you:
 *  - Create a Sportmonks Football API key
 *  - Set SPORTMONKS_API_KEY in your environment
 *  - Fill in real team IDs in scripts/input/sportmonks-premier-league-teams.json
 *
 * Usage (from project root):
 *   SPORTMONKS_API_KEY=your_token_here node scripts/importSportmonksPremierLeague.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(__dirname, 'input', 'sportmonks-premier-league-teams.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'data', 'players');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'sportmonks-premier-league-squads.json');

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(`Config file not found: ${CONFIG_PATH}`);
  }
  const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
  const cfg = JSON.parse(raw);
  if (!cfg.teams || typeof cfg.teams !== 'object') {
    throw new Error('Invalid config: missing "teams" object');
  }
  return cfg;
}

function getApiKey() {
  const key = process.env.SPORTMONKS_API_KEY || process.env.SPORTMONKS_API_TOKEN;
  if (!key) {
    throw new Error('SPORTMONKS_API_KEY (or SPORTMONKS_API_TOKEN) is not set in environment.');
  }
  return key;
}

async function fetchJson(url, apiKey) {
  const sep = url.includes('?') ? '&' : '?';
  const fullUrl = `${url}${sep}api_token=${encodeURIComponent(apiKey)}`;

  const res = await fetch(fullUrl, {
    headers: {
      Accept: 'application/json'
    }
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} from Sportmonks for ${url} – ${text.slice(0, 200)}`);
  }

  return res.json();
}

/**
 * Normalise a single Sportmonks player record into a compact structure
 * compatible with how we use player data in Team-TalkTransfers.
 */
function normalisePlayer(smPlayer) {
  const p = smPlayer.player || smPlayer;
  const nationality = p.nationality?.name || p.nationality || p.country?.name;

  const bio = {
    name: p.display_name || p.common_name || p.name,
    height: p.height ? `${p.height} cm` : undefined,
    weight: p.weight ? `${p.weight} kg` : undefined,
    nationality,
    dateOfBirth: p.date_of_birth || p.birthdate,
    placeOfBirth: p.birthplace || undefined,
    preferredFoot: p.preferred_foot || undefined,
    position: p.position?.name || p.position,
    jerseyNumber: p.number || p.shirt_number,
    age: p.age
  };

  // Filter out undefined to keep JSON tidy
  Object.keys(bio).forEach((k) => bio[k] === undefined && delete bio[k]);

  return {
    id: p.id,
    name: bio.name,
    type: p.type || 'player',
    bio,
    // Squad-specific meta
    inSquad: smPlayer.in_squad ?? true
  };
}

async function fetchTeamSquad(teamId, apiKey) {
  // Sportmonks v3 extended team squad:
  // https://docs.sportmonks.com/football/endpoints-and-entities/endpoints/team-squads/get-extended-team-squad-by-team-id
  const baseUrl = `https://api.sportmonks.com/v3/football/squads/teams/${teamId}/extended`;
  const json = await fetchJson(baseUrl, apiKey);

  if (!json || !Array.isArray(json.data) || json.data.length === 0) {
    console.warn(`⚠️ No squad data returned for teamId=${teamId}`);
    return [];
  }

  // According to docs, data is an array of squad entries with embedded player
  return json.data.map(normalisePlayer);
}

async function main() {
  console.log('🚀 Importing Premier League squads from Sportmonks…\n');

  const apiKey = getApiKey();
  const cfg = loadConfig();
  const teams = cfg.teams;

  const results = {
    league: cfg.league || null,
    generatedAt: new Date().toISOString(),
    source: 'sportmonks',
    squads: {}
  };

  for (const [clubName, teamId] of Object.entries(teams)) {
    if (!teamId || typeof teamId !== 'number' || teamId <= 0) {
      console.log(`⏭️  Skipping ${clubName} – no valid Sportmonks team ID configured yet.`);
      continue;
    }

    console.log(`🏆 Fetching squad for ${clubName} (teamId=${teamId})…`);
    try {
      const players = await fetchTeamSquad(teamId, apiKey);
      results.squads[clubName] = players;
      console.log(`   ✅ Retrieved ${players.length} players for ${clubName}`);
    } catch (err) {
      console.error(`   ❌ Failed to fetch ${clubName}: ${err.message}`);
    }
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));
  console.log(`\n✅ Saved Sportmonks Premier League squads to: ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error('\n❌ Fatal error in importSportmonksPremierLeague:', err);
  process.exit(1);
});


import fs from 'fs';
import path from 'path';

interface Transfer {
  id: string;
  playerName: string;
  fromClub: string;
  toClub: string;
  fee: string;
  date: string;
  source: string;
  status: string;
}

// Keywords for gossip/rumor detection
const GOSSIP_KEYWORDS = [
  'interest reported', 'monitoring', 'talks underway', 'negotiations ongoing',
  'personal terms agreed', 'medical scheduled', 'bid submitted', 'offer tabled',
  'verbal agreement', 'hijack attempt', 'on the radar', 'agent pushing move',
  'player keen', 'surprise move', 'marquee signing', 'exit door looms',
  'contract standoff', 'free to leave', 'loan with option to buy',
  'rumor', 'rumoured', 'gossip', 'linked', 'scouted', 'target', 'deal imminent',
  'terms agreed', 'club pushing', 'liked', 'listed as target'
];

// Rumor intensity levels (optional future use)
const INTENSITY_LEVELS = [
  'confirmed medical', 'deal imminent', 'terms agreed', 'club pushing',
  'interest reported', 'scouted', 'player liked', 'listed as target'
];

// How many days old before a transfer is considered stale?
const STALE_DAYS = 3;
const NOW = new Date('2025-07-10T12:00:00Z'); // Use the user's provided current time

// Directory containing transfer data
const DATA_DIR = path.join(__dirname, '../src/data/transfers');

function isGossip(transfer: Transfer): boolean {
  const text = `${transfer.fee} ${transfer.status} ${transfer.source}`.toLowerCase();
  return GOSSIP_KEYWORDS.some(keyword => text.includes(keyword));
}

function isStale(dateStr: string): boolean {
  const date = new Date(dateStr);
  const diffDays = Math.floor((+NOW - +date) / (1000 * 60 * 60 * 24));
  return diffDays > STALE_DAYS;
}

function checkFile(filePath: string) {
  const file = fs.readFileSync(filePath, 'utf-8');
  let transfers: Transfer[] = [];
  try {
    // Try to eval the array (works for simple export const foo = [ ... ];)
    const match = file.match(/\[([\s\S]*)\]/);
    if (match) {
      // Parse as JSON-ish (replace trailing commas, single quotes)
      let arrStr = match[0]
        .replace(/(\w+):/g, '"$1":')
        .replace(/'/g, '"')
        .replace(/,\s*]/g, ']');
      transfers = JSON.parse(arrStr);
    }
  } catch (e) {
    // fallback: skip file
    return [];
  }
  return transfers.map(t => ({...t, _file: filePath}));
}

function scanAllTransfers() {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.ts'));
  let stale: any[] = [];
  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const transfers = checkFile(filePath);
    for (const t of transfers) {
      if (isGossip(t) && isStale(t.date)) {
        stale.push({
          player: t.playerName,
          file: file,
          date: t.date,
          fee: t.fee,
          status: t.status,
          source: t.source
        });
      }
    }
  }
  return stale;
}

function main() {
  const stale = scanAllTransfers();
  if (stale.length === 0) {
    console.log('✅ No stale transfer rumors/gossip detected.');
  } else {
    console.log('⚠️  Stale transfer rumors/gossip found:');
    stale.forEach(s => {
      console.log(`- ${s.player} (${s.file}): ${s.date} | ${s.status} | ${s.fee} | ${s.source}`);
    });
    process.exit(1);
  }
}

main();

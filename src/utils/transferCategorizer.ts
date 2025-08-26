import { Transfer } from '@/types/transfer';

// Words that indicate rumors, gossip, or unconfirmed status
const RUMOR_KEYWORDS = [
  'rumor', 'rumour', 'rumored', 'rumoured', 'gossip', 'speculation', 'speculated',
  'linked', 'target', 'interest', 'reported', 'allegedly', 'supposedly',
  'unconfirmed', 'potential', 'considering', 'monitoring', 'tracking',
  'scouting', 'interested in', 'keen on', 'eyeing', 'close to', 'nearing'
];

// Check if a transfer contains rumor-related keywords
function containsRumorKeywords(transfer: Transfer): boolean {
  const textToCheck = [
    transfer.fee.toLowerCase(),
    transfer.source.toLowerCase(),
    transfer.playerName.toLowerCase()
  ].join(' ');
  
  return RUMOR_KEYWORDS.some(keyword => textToCheck.includes(keyword.toLowerCase()));
}

// Normalize player names for better duplicate detection
function normalizePlayerName(playerName: string): string {
  return playerName.toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/['']/g, '')
    .replace(/[.-]/g, '')
    .trim();
}

// Normalize club names for comparison
function normalizeClubName(clubName: string): string {
  return clubName.toLowerCase()
    .replace(/^fc\s+/i, '')
    .replace(/\s+fc$/i, '')
    .replace(/^afc\s+/i, '')
    .replace(/\s+united$/i, ' utd')
    .replace(/manchester city/i, 'man city')
    .replace(/manchester united/i, 'man united')
    .replace(/tottenham hotspur/i, 'tottenham')
    .replace(/brighton & hove albion/i, 'brighton')
    .replace(/wolverhampton wanderers/i, 'wolves')
    .replace(/west ham united/i, 'west ham')
    .replace(/nottingham forest/i, 'notts forest')
    .replace(/sheffield united/i, 'sheffield utd')
    .replace(/leicester city/i, 'leicester')
    .replace(/ipswich town/i, 'ipswich')
    .trim();
}

// Check if a club name matches (with variations)
function isClubMatch(clubName: string, targetClub: string): boolean {
  const normalizedClub = normalizeClubName(clubName);
  const normalizedTarget = normalizeClubName(targetClub);
  
  return normalizedClub === normalizedTarget ||
         normalizedClub.includes(normalizedTarget) ||
         normalizedTarget.includes(normalizedClub);
}

export interface CategorizedTransfers {
  confirmedIn: Transfer[];
  confirmedOut: Transfer[];
  rumors: Transfer[];
}

/**
 * Categorizes transfers for a specific club into confirmed in/out and rumors
 * FIXED: Ensures rumored players ONLY appear in rumors, confirmed players ONLY in confirmed sections
 */
export function categorizeTransfers(transfers: Transfer[], clubName: string): CategorizedTransfers {
  const confirmedIn: Transfer[] = [];
  const confirmedOut: Transfer[] = [];
  const rumors: Transfer[] = [];
  
  // Track players to prevent duplicates
  const processedPlayers = new Set<string>();

  // STEP 1: First pass - collect ALL rumored transfers
  for (const transfer of transfers) {
    if (transfer.status === 'rumored') {
      const playerKey = normalizePlayerName(transfer.playerName);
      if (!processedPlayers.has(playerKey)) {
        rumors.push(transfer);
        processedPlayers.add(playerKey);
      }
    }
  }

  // STEP 2: Second pass - collect ONLY confirmed transfers for players not already in rumors
  for (const transfer of transfers) {
    if (transfer.status === 'confirmed') {
      const playerKey = normalizePlayerName(transfer.playerName);
      
      // Skip if this player is already in rumors
      if (processedPlayers.has(playerKey)) {
        continue;
      }
      
      // Add to appropriate confirmed section
      if (isClubMatch(transfer.toClub, clubName)) {
        confirmedIn.push(transfer);
        processedPlayers.add(playerKey);
      } else if (isClubMatch(transfer.fromClub, clubName)) {
        confirmedOut.push(transfer);
        processedPlayers.add(playerKey);
      }
    }
  }

  // Sort each category by date (newest first)
  const sortByDate = (a: Transfer, b: Transfer) => 
    new Date(b.date).getTime() - new Date(a.date).getTime();

  const result = {
    confirmedIn: confirmedIn.sort(sortByDate),
    confirmedOut: confirmedOut.sort(sortByDate),
    rumors: rumors.sort(sortByDate)
  };
  
  console.log(`${clubName} categorization:`, {
    confirmedIn: result.confirmedIn.length,
    confirmedOut: result.confirmedOut.length, 
    rumors: result.rumors.length,
    total: transfers.length,
    duplicatesRemoved: transfers.length - (result.confirmedIn.length + result.confirmedOut.length + result.rumors.length)
  });

  return result;
}

/**
 * Get all transfers related to a club (both directions)
 */
export function getClubTransfers(allTransfers: Transfer[], clubName: string): Transfer[] {
  return allTransfers.filter(transfer => 
    isClubMatch(transfer.toClub, clubName) || 
    isClubMatch(transfer.fromClub, clubName)
  );
}

/**
 * Apply categorization to all clubs
 */
export function categorizeAllClubTransfers(
  allTransfers: Transfer[], 
  clubNames: string[]
): Record<string, CategorizedTransfers> {
  const result: Record<string, CategorizedTransfers> = {};
  
  for (const clubName of clubNames) {
    const clubTransfers = getClubTransfers(allTransfers, clubName);
    result[clubName] = categorizeTransfers(clubTransfers, clubName);
  }
  
  return result;
}

/**
 * Get transfer counts for a club
 */
export function getTransferCounts(categorized: CategorizedTransfers) {
  return {
    confirmedIn: categorized.confirmedIn.length,
    confirmedOut: categorized.confirmedOut.length,
    rumors: categorized.rumors.length,
    total: categorized.confirmedIn.length + categorized.confirmedOut.length + categorized.rumors.length
  };
}
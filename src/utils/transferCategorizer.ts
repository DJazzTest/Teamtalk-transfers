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
 */
export function categorizeTransfers(transfers: Transfer[], clubName: string): CategorizedTransfers {
  const confirmedIn: Transfer[] = [];
  const confirmedOut: Transfer[] = [];
  const rumors: Transfer[] = [];

  for (const transfer of transfers) {
    // First check if it's a rumor based on status or keywords
    const isRumor = transfer.status === 'rumored' || 
                    containsRumorKeywords(transfer) ||
                    transfer.fee.toLowerCase().includes('interest') ||
                    transfer.fee.toLowerCase().includes('reported');

    if (isRumor) {
      rumors.push(transfer);
      continue;
    }

    // For confirmed transfers, categorize by direction
    if (transfer.status === 'confirmed') {
      if (isClubMatch(transfer.toClub, clubName)) {
        confirmedIn.push(transfer);
      } else if (isClubMatch(transfer.fromClub, clubName)) {
        confirmedOut.push(transfer);
      }
    }
  }

  // Sort each category by date (newest first)
  const sortByDate = (a: Transfer, b: Transfer) => 
    new Date(b.date).getTime() - new Date(a.date).getTime();

  return {
    confirmedIn: confirmedIn.sort(sortByDate),
    confirmedOut: confirmedOut.sort(sortByDate),
    rumors: rumors.sort(sortByDate)
  };
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
// Enhanced transfer deduplication with better matching
import { Transfer } from '@/types/transfer';

// Premier League clubs only - updated for 2025/26 season
const premierLeagueClubs = [
  'Arsenal', 'Aston Villa', 'Brentford', 'Brighton & Hove Albion', 'Burnley', 'Chelsea',
  'Crystal Palace', 'Everton', 'Fulham', 'Ipswich Town', 'Leeds United',
  'Leicester City', 'Liverpool', 'Manchester City', 'Manchester United',
  'Newcastle United', 'Nottingham Forest', 'Sheffield United', 'Southampton',
  'Tottenham Hotspur', 'West Ham United', 'Wolverhampton Wanderers'
];

// Normalize club names for better matching
function normalizeClub(clubName: string): string {
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

// Normalize player names for better duplicate detection
function normalizePlayerName(playerName: string): string {
  return playerName.toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/['']/g, '')
    .replace(/[.-]/g, '')
    .trim();
}

// Filter for Premier League clubs only
function isPremierLeagueClub(clubName: string): boolean {
  const normalized = normalizeClub(clubName);
  return premierLeagueClubs.some(club => 
    normalizeClub(club) === normalized
  );
}

// Enhanced duplicate detection
function isDuplicateTransfer(transfer1: Transfer, transfer2: Transfer): boolean {
  const player1 = normalizePlayerName(transfer1.playerName);
  const player2 = normalizePlayerName(transfer2.playerName);
  
  // Different players
  if (player1 !== player2) return false;
  
  const to1 = normalizeClub(transfer1.toClub);
  const to2 = normalizeClub(transfer2.toClub);
  const from1 = normalizeClub(transfer1.fromClub);
  const from2 = normalizeClub(transfer2.fromClub);
  
  // Same player, same destination club
  if (to1 === to2) {
    // If from clubs are also same or one is empty, it's a duplicate
    if (from1 === from2 || !from1 || !from2) {
      return true;
    }
  }
  
  // Same player, same from and to (complete match)
  if (to1 === to2 && from1 === from2) {
    return true;
  }
  
  return false;
}

export function deduplicateTransfersUI(transfers: Transfer[]): Transfer[] {
  console.log('🔄 STRICT deduplication starting...');
  console.log(`Input: ${transfers.length} transfers`);
  
  // Filter for Premier League clubs only
  const plTransfers = transfers.filter(transfer => 
    isPremierLeagueClub(transfer.toClub) || isPremierLeagueClub(transfer.fromClub)
  );

  // Create unique key for player + destination
  const createKey = (transfer: Transfer) => {
    const player = normalizePlayerName(transfer.playerName);
    const to = normalizeClub(transfer.toClub);
    return `${player}→${to}`;
  };

  const transferMap = new Map<string, Transfer>();
  
  // Sort by priority: confirmed status first, then by date (newest first)
  const sortedTransfers = plTransfers.sort((a, b) => {
    // Status priority: confirmed beats everything
    if (a.status === 'confirmed' && b.status !== 'confirmed') return -1;
    if (a.status !== 'confirmed' && b.status === 'confirmed') return 1;
    
    // If same status, prefer newer date
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  for (const transfer of sortedTransfers) {
    const key = createKey(transfer);
    const existing = transferMap.get(key);
    
    if (!existing) {
      // First time seeing this player+destination
      transferMap.set(key, transfer);
      console.log(`✅ ADDED: ${transfer.playerName} (${transfer.status})`);
    } else {
      // We have this player+destination already
      if (transfer.status === 'confirmed' && existing.status === 'rumored') {
        // Upgrade from rumored to confirmed
        transferMap.set(key, transfer);
        console.log(`🔄 UPGRADED: ${transfer.playerName} from rumored to confirmed`);
      } else if (transfer.status === existing.status && new Date(transfer.date) > new Date(existing.date)) {
        // Same status but newer date
        transferMap.set(key, transfer);
        console.log(`📅 UPDATED: ${transfer.playerName} with newer date`);
      } else {
        // Keep existing
        console.log(`❌ SKIPPED: ${transfer.playerName} (${transfer.status}) - keeping existing ${existing.status}`);
      }
    }
  }

  const result = Array.from(transferMap.values());
  console.log(`✅ STRICT deduplication complete: ${transfers.length} → ${result.length} transfers`);
  
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Enhanced deduplication specifically for individual club transfer data
export function deduplicateClubTransfers(transfers: Transfer[]): Transfer[] {
  const playerMap = new Map<string, Transfer>();

  for (const transfer of transfers) {
    const playerKey = normalizePlayerName(transfer.playerName);
    const existing = playerMap.get(playerKey);

    if (!existing) {
      playerMap.set(playerKey, transfer);
    } else {
      // Determine which transfer to keep based on priority rules
      const transferDate = new Date(transfer.date);
      const existingDate = new Date(existing.date);
      
      const shouldReplace = 
        // Confirmed transfers beat rumors
        (transfer.status === 'confirmed' && existing.status === 'rumored') ||
        // If both same status, prefer more recent
        (transfer.status === existing.status && transferDate > existingDate) ||
        // If same date, prefer confirmed
        (transferDate.getTime() === existingDate.getTime() && 
         transfer.status === 'confirmed' && existing.status !== 'confirmed');

      if (shouldReplace) {
        playerMap.set(playerKey, transfer);
      }
    }
  }

  return Array.from(playerMap.values())
    .sort((a, b) => {
      // Sort by status (confirmed first) then by date (newest first)
      if (a.status !== b.status) {
        return a.status === 'confirmed' ? -1 : 1;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
}

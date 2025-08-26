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
  // Filter for Premier League clubs only
  const plTransfers = transfers.filter(transfer => 
    isPremierLeagueClub(transfer.toClub) || isPremierLeagueClub(transfer.fromClub)
  );

  const deduplicatedTransfers: Transfer[] = [];
  
  for (const transfer of plTransfers) {
    // Check if this transfer is a duplicate of any already processed
    const isDuplicate = deduplicatedTransfers.some(existing => 
      isDuplicateTransfer(transfer, existing)
    );
    
    if (!isDuplicate) {
      deduplicatedTransfers.push(transfer);
    } else {
      // Find the existing duplicate and keep the better one
      const duplicateIndex = deduplicatedTransfers.findIndex(existing => 
        isDuplicateTransfer(transfer, existing)
      );
      
      if (duplicateIndex !== -1) {
        const existing = deduplicatedTransfers[duplicateIndex];
        const transferDate = new Date(transfer.date);
        const existingDate = new Date(existing.date);
        
        // Keep the more recent one, or prefer confirmed over rumored
        if (transferDate > existingDate || 
            (transferDate.getTime() === existingDate.getTime() && 
             transfer.status === 'confirmed' && existing.status !== 'confirmed') ||
            (transferDate.getTime() === existingDate.getTime() && 
             transfer.source === 'ScoreInside' && existing.source !== 'ScoreInside')) {
          deduplicatedTransfers[duplicateIndex] = transfer;
        }
      }
    }
  }

  return deduplicatedTransfers
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Utility function to clear duplicates from a specific array
export function clearDuplicateNames(transfers: Transfer[]): Transfer[] {
  const seen = new Map<string, Transfer>();

  for (const transfer of transfers) {
    const normalizedPlayer = normalizePlayerName(transfer.playerName);
    const normalizedToClub = normalizeClub(transfer.toClub);
    const normalizedFromClub = normalizeClub(transfer.fromClub);
    
    const key = `${normalizedPlayer}-${normalizedFromClub}-${normalizedToClub}`;
    const existing = seen.get(key);

    if (!existing) {
      seen.set(key, transfer);
    } else {
      // Keep the one with more recent date or better source
      const transferDate = new Date(transfer.date);
      const existingDate = new Date(existing.date);
      
      if (transferDate > existingDate || 
          (transferDate.getTime() === existingDate.getTime() && 
           transfer.status === 'confirmed' && existing.status !== 'confirmed')) {
        seen.set(key, transfer);
      }
    }
  }

  return Array.from(seen.values())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

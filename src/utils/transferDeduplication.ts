// Enhanced transfer deduplication with better matching
import { Transfer } from '@/types/transfer';

// Premier League clubs only
const premierLeagueClubs = [
  'Arsenal', 'Aston Villa', 'Brentford', 'Brighton & Hove Albion', 'Chelsea',
  'Crystal Palace', 'Everton', 'Fulham', 'Ipswich Town', 'Leeds United',
  'Leicester City', 'Liverpool', 'Manchester City', 'Manchester United',
  'Newcastle United', 'Nottingham Forest', 'Sheffield United', 'Southampton',
  'Tottenham Hotspur', 'West Ham United'
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
    .trim();
}

// Filter for Premier League clubs only
function isPremierLeagueClub(clubName: string): boolean {
  const normalized = normalizeClub(clubName);
  return premierLeagueClubs.some(club => 
    normalizeClub(club) === normalized
  );
}

export function deduplicateTransfersUI(transfers: Transfer[]): Transfer[] {
  // Filter for Premier League clubs only
  const plTransfers = transfers.filter(transfer => 
    isPremierLeagueClub(transfer.toClub) || isPremierLeagueClub(transfer.fromClub)
  );

  const seen = new Map<string, Transfer>();

  for (const transfer of plTransfers) {
    // Create a more robust key
    const normalizedPlayer = transfer.playerName.toLowerCase().trim();
    const normalizedToClub = normalizeClub(transfer.toClub);
    const normalizedFromClub = normalizeClub(transfer.fromClub);
    
    const key = `${normalizedPlayer}-${normalizedFromClub}-${normalizedToClub}-${transfer.status}`;
    const existing = seen.get(key);

    if (!existing) {
      seen.set(key, transfer);
    } else {
      // Keep the one with more recent date or better source
      const transferDate = new Date(transfer.date);
      const existingDate = new Date(existing.date);
      
      if (transferDate > existingDate || 
          (transferDate.getTime() === existingDate.getTime() && 
           transfer.source === 'ScoreInside' && existing.source !== 'ScoreInside')) {
        seen.set(key, transfer);
      }
    }
  }

  return Array.from(seen.values())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}


import { PREMIER_LEAGUE_CLUBS, TRANSFER_KEYWORDS, KNOWN_PLAYERS, FEE_PATTERNS, CLUB_VARIATIONS } from './constants';

export function extractSentences(content: string): string[] {
  console.log('Extracting sentences from content length:', content.length);
  
  const cleaned = content
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s£$€.,!?-]/g, '')
    .trim();

  // Split by multiple delimiters and also try to extract from table-like structures
  const sentences = cleaned.split(/[.!?\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10 && s.length < 1000);

  // Also try to extract from structured data (like tables)
  const structuredData = extractFromStructuredContent(content);
  
  const allSentences = [...sentences, ...structuredData]
    .filter(s => containsRelevantContent(s));

  console.log(`Extracted ${allSentences.length} relevant sentences from ${sentences.length} total sentences`);
  return allSentences;
}

export function extractFromStructuredContent(content: string): string[] {
  const results: string[] = [];
  
  // Look for patterns like "PlayerName ClubName Transfer In"
  const transferInPattern = /([A-Z][a-z]+ [A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+Transfer In/gi;
  let match;
  
  while ((match = transferInPattern.exec(content)) !== null) {
    const playerName = match[1].trim();
    const clubName = match[2].trim();
    results.push(`${playerName} joins ${clubName} transfer in confirmed`);
    console.log(`Found structured transfer: ${playerName} -> ${clubName}`);
  }
  
  return results;
}

export function containsRelevantContent(sentence: string): boolean {
  const lower = sentence.toLowerCase();
  
  const hasTransferKeyword = TRANSFER_KEYWORDS.some(keyword => 
    lower.includes(keyword.toLowerCase())
  );
  
  const hasClubName = PREMIER_LEAGUE_CLUBS.some(club => 
    lower.includes(club.toLowerCase())
  ) || Object.keys(CLUB_VARIATIONS).some(club =>
    lower.includes(club.toLowerCase()) || 
    CLUB_VARIATIONS[club].some(variation => lower.includes(variation.toLowerCase()))
  );
  
  const hasKnownPlayer = KNOWN_PLAYERS.some(player =>
    lower.includes(player.toLowerCase())
  );
  
  // Accept if it has transfer keywords + club, or if it has a known player
  const isRelevant = (hasTransferKeyword && hasClubName) || hasKnownPlayer;
  
  if (isRelevant) {
    console.log(`Relevant sentence found: "${sentence.substring(0, 100)}..."`);
  }
  
  return isRelevant;
}

export function extractPlayerName(sentence: string): string | null {
  // Check for known players first (exact matches)
  for (const player of KNOWN_PLAYERS) {
    const regex = new RegExp(`\\b${player.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(sentence)) {
      console.log(`Found known player: ${player}`);
      return player;
    }
  }

  // Look for capitalized words that could be names
  const words = sentence.split(/\s+/);
  const capitalizedWords = words.filter(word => 
    /^[A-Z][a-z]+$/.test(word) && 
    word.length > 2 &&
    !['The', 'A', 'An', 'In', 'On', 'At', 'To', 'From', 'For', 'With', 'By', 'United', 'City', 'Town', 'FC', 'Transfer'].includes(word)
  );

  // Look for name patterns (2-3 consecutive capitalized words)
  for (let i = 0; i < capitalizedWords.length - 1; i++) {
    const possibleName = capitalizedWords.slice(i, Math.min(i + 3, capitalizedWords.length)).join(' ');
    if (possibleName.length > 4 && possibleName.split(' ').length >= 2) {
      console.log(`Extracted potential player name: ${possibleName}`);
      return possibleName;
    }
  }

  return null;
}

export function extractClubs(sentence: string): string[] {
  const clubs: string[] = [];
  
  // Check main club names
  for (const club of PREMIER_LEAGUE_CLUBS) {
    const regex = new RegExp(`\\b${club.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(sentence)) {
      clubs.push(club);
    }
  }

  // Check club variations
  for (const [mainClub, variations] of Object.entries(CLUB_VARIATIONS)) {
    for (const variation of variations) {
      const regex = new RegExp(`\\b${variation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      if (regex.test(sentence)) {
        clubs.push(mainClub);
      }
    }
  }

  const uniqueClubs = [...new Set(clubs)];
  if (uniqueClubs.length > 0) {
    console.log(`Found clubs in sentence: ${uniqueClubs.join(', ')}`);
  }
  
  return uniqueClubs;
}

export function extractFee(sentence: string): string {
  for (const pattern of FEE_PATTERNS) {
    const match = sentence.match(pattern);
    if (match) {
      console.log(`Found fee: ${match[0]}`);
      return match[0];
    }
  }
  return 'Undisclosed';
}

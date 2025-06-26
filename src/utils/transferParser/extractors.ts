
import { PREMIER_LEAGUE_CLUBS, TRANSFER_KEYWORDS, KNOWN_PLAYERS, FEE_PATTERNS } from './constants';

export function extractSentences(content: string): string[] {
  const cleaned = content
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s£$€.,!?-]/g, '')
    .trim();

  return cleaned.split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 15 && s.length < 800)
    .filter(s => containsRelevantContent(s));
}

export function containsRelevantContent(sentence: string): boolean {
  const lower = sentence.toLowerCase();
  
  const hasTransferKeyword = TRANSFER_KEYWORDS.some(keyword => 
    lower.includes(keyword)
  );
  
  const hasClubName = PREMIER_LEAGUE_CLUBS.some(club => 
    lower.includes(club.toLowerCase())
  );
  
  return hasTransferKeyword && hasClubName;
}

export function extractPlayerName(sentence: string): string | null {
  // Check for known players first
  for (const player of KNOWN_PLAYERS) {
    if (sentence.toLowerCase().includes(player.toLowerCase())) {
      return player;
    }
  }

  // Look for capitalized words that could be names
  const words = sentence.split(/\s+/);
  const capitalizedWords = words.filter(word => 
    /^[A-Z][a-z]+$/.test(word) && 
    word.length > 2 &&
    !['The', 'A', 'An', 'In', 'On', 'At', 'To', 'From', 'For', 'With', 'By', 'United', 'City', 'Town', 'FC'].includes(word)
  );

  // Look for name patterns (2-3 consecutive capitalized words)
  for (let i = 0; i < capitalizedWords.length - 1; i++) {
    const possibleName = capitalizedWords.slice(i, Math.min(i + 3, capitalizedWords.length)).join(' ');
    if (possibleName.length > 4 && possibleName.split(' ').length >= 2) {
      return possibleName;
    }
  }

  return null;
}

export function extractClubs(sentence: string): string[] {
  const clubs: string[] = [];
  
  for (const club of PREMIER_LEAGUE_CLUBS) {
    const regex = new RegExp(`\\b${club.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(sentence)) {
      clubs.push(club);
    }
  }

  return [...new Set(clubs)];
}

export function extractFee(sentence: string): string {
  for (const pattern of FEE_PATTERNS) {
    const match = sentence.match(pattern);
    if (match) {
      return match[0];
    }
  }
  return 'Undisclosed';
}

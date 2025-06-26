
import { Transfer } from '@/types/transfer';

export interface ParsedTransferData {
  playerName: string;
  fromClub: string;
  toClub: string;
  fee: string;
  confidence: number;
}

export class TransferParser {
  private static readonly PREMIER_LEAGUE_CLUBS = [
    'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton', 'Brighton & Hove Albion',
    'Burnley', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Leeds United', 'Leeds',
    'Liverpool', 'Manchester City', 'Manchester United', 'Newcastle United', 'Newcastle',
    'Nottingham Forest', 'Sheffield United', 'Tottenham', 'Tottenham Hotspur', 'West Ham United', 'West Ham',
    'Wolverhampton Wanderers', 'Wolves', 'Luton Town', 'Luton'
  ];

  private static readonly TRANSFER_KEYWORDS = [
    'signed', 'joins', 'transferred', 'moves to', 'completes move', 'agrees deal',
    'deal agreed', 'medical completed', 'officially joins', 'confirms signing'
  ];

  private static readonly FEE_PATTERNS = [
    /£([\d.]+)m/gi,
    /\$([\d.]+)m/gi,
    /€([\d.]+)m/gi,
    /([\d.]+) million/gi,
    /undisclosed/gi,
    /free transfer/gi,
    /loan/gi
  ];

  static parseTransfers(scrapedContent: string, sourceUrl: string): ParsedTransferData[] {
    const transfers: ParsedTransferData[] = [];
    const sentences = this.extractSentences(scrapedContent);

    for (const sentence of sentences) {
      const parsedTransfer = this.parseSentence(sentence);
      if (parsedTransfer && parsedTransfer.confidence > 0.6) {
        transfers.push(parsedTransfer);
      }
    }

    return this.deduplicateTransfers(transfers);
  }

  private static extractSentences(content: string): string[] {
    // Clean up the content and split into sentences
    const cleaned = content
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return cleaned.split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20 && s.length < 500);
  }

  private static parseSentence(sentence: string): ParsedTransferData | null {
    const lowerSentence = sentence.toLowerCase();
    
    // Check if sentence contains transfer keywords
    const hasTransferKeyword = this.TRANSFER_KEYWORDS.some(keyword => 
      lowerSentence.includes(keyword)
    );

    if (!hasTransferKeyword) return null;

    // Extract potential player names (capitalize words that aren't common words)
    const playerName = this.extractPlayerName(sentence);
    if (!playerName) return null;

    // Extract clubs
    const clubs = this.extractClubs(sentence);
    if (clubs.length < 1) return null;

    // Extract fee
    const fee = this.extractFee(sentence);

    // Determine from/to clubs based on context
    let fromClub = 'Unknown';
    let toClub = clubs[0];

    if (clubs.length >= 2) {
      // Look for patterns like "from X to Y" or "X to Y"
      const fromMatch = sentence.match(/from\s+([^,]+?)\s+to\s+([^,]+)/i);
      if (fromMatch) {
        fromClub = fromMatch[1].trim();
        toClub = fromMatch[2].trim();
      } else {
        fromClub = clubs[0];
        toClub = clubs[1];
      }
    }

    const confidence = this.calculateConfidence(sentence, playerName, clubs, fee);

    return {
      playerName,
      fromClub,
      toClub,
      fee,
      confidence
    };
  }

  private static extractPlayerName(sentence: string): string | null {
    // Look for capitalized words that could be names
    const words = sentence.split(/\s+/);
    const capitalizedWords = words.filter(word => 
      /^[A-Z][a-z]+$/.test(word) && 
      !['The', 'A', 'An', 'In', 'On', 'At', 'To', 'From', 'For', 'With', 'By'].includes(word)
    );

    // Look for common name patterns (2-3 consecutive capitalized words)
    for (let i = 0; i < capitalizedWords.length - 1; i++) {
      const possibleName = capitalizedWords.slice(i, i + 2).join(' ');
      if (possibleName.length > 4) {
        return possibleName;
      }
    }

    return null;
  }

  private static extractClubs(sentence: string): string[] {
    const clubs: string[] = [];
    
    for (const club of this.PREMIER_LEAGUE_CLUBS) {
      const regex = new RegExp(`\\b${club}\\b`, 'gi');
      if (regex.test(sentence)) {
        clubs.push(club);
      }
    }

    return [...new Set(clubs)]; // Remove duplicates
  }

  private static extractFee(sentence: string): string {
    for (const pattern of this.FEE_PATTERNS) {
      const match = sentence.match(pattern);
      if (match) {
        return match[0];
      }
    }
    return 'Undisclosed';
  }

  private static calculateConfidence(
    sentence: string, 
    playerName: string, 
    clubs: string[], 
    fee: string
  ): number {
    let confidence = 0.5;

    // Boost confidence for strong transfer keywords
    const strongKeywords = ['signed', 'joins', 'officially', 'completed', 'confirmed'];
    if (strongKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
      confidence += 0.2;
    }

    // Boost for multiple clubs mentioned
    if (clubs.length >= 2) {
      confidence += 0.1;
    }

    // Boost for fee mentioned
    if (fee !== 'Undisclosed') {
      confidence += 0.1;
    }

    // Boost for longer player names (more likely to be real)
    if (playerName.split(' ').length >= 2) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  private static deduplicateTransfers(transfers: ParsedTransferData[]): ParsedTransferData[] {
    const seen = new Map<string, ParsedTransferData>();

    for (const transfer of transfers) {
      const key = `${transfer.playerName.toLowerCase()}-${transfer.toClub.toLowerCase()}`;
      const existing = seen.get(key);

      if (!existing || transfer.confidence > existing.confidence) {
        seen.set(key, transfer);
      }
    }

    return Array.from(seen.values());
  }

  static convertToTransfer(parsed: ParsedTransferData, sourceUrl: string): Transfer {
    return {
      id: `parsed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      playerName: parsed.playerName,
      fromClub: parsed.fromClub,
      toClub: parsed.toClub,
      fee: parsed.fee,
      date: new Date().toISOString(),
      source: new URL(sourceUrl).hostname,
      status: parsed.confidence > 0.8 ? 'confirmed' : 'rumored'
    };
  }
}

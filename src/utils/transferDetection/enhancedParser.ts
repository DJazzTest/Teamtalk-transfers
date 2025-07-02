import { ParsedTransferData } from '@/utils/transferParser/types';
import { PREMIER_LEAGUE_CLUBS, CONFIRMED_TRANSFER_KEYWORDS } from '@/utils/transferParser/constants';

export class EnhancedTransferParser {
  
  // Enhanced patterns for better transfer detection
  private static ENHANCED_PATTERNS = {
    // Official announcement patterns
    OFFICIAL_SIGNING: [
      /(\w+(?:\s+\w+)*)\s+(?:has\s+)?(?:officially\s+)?(?:signed|joins?|completed?\s+(?:his\s+)?move\s+to|announced\s+as\s+new\s+signing\s+for)\s+(\w+(?:\s+\w+)*)/gi,
      /(\w+(?:\s+\w+)*)\s+(?:welcome|pleased\s+to\s+announce|delighted\s+to\s+confirm)\s+(?:the\s+signing\s+of\s+)?(\w+(?:\s+\w+)*)/gi,
      /(?:official|confirmed):\s*(\w+(?:\s+\w+)*)\s+(?:signs\s+for|joins)\s+(\w+(?:\s+\w+)*)/gi,
    ],
    
    // Fee patterns
    FEE_AMOUNTS: [
      /(?:fee|transfer|deal|price|cost|worth|valued\s+at|reported)\s*:?\s*(?:around|approximately|up\s+to|rising\s+to)?\s*[£$€]?([\d.]+)(?:\s*(?:million|m|mil))?/gi,
      /(?:undisclosed|free\s+transfer|loan\s+deal|permanent\s+deal|released)/gi,
    ],
    
    // Medical and contract completion
    MEDICAL_COMPLETION: [
      /(\w+(?:\s+\w+)*)\s+(?:completes?\s+medical|undergoes?\s+medical|passes?\s+medical)\s+(?:at|with|for)\s+(\w+(?:\s+\w+)*)/gi,
      /medical\s+completed?\s+for\s+(\w+(?:\s+\w+)*)\s+(?:at|with)\s+(\w+(?:\s+\w+)*)/gi,
    ],
    
    // Here we go - Fabrizio Romano style
    HERE_WE_GO: [
      /here\s+we\s+go[!.]?\s*(\w+(?:\s+\w+)*)\s+(?:to|→)\s+(\w+(?:\s+\w+)*)/gi,
      /(?:breaking|confirmed|done\s+deal)[!:]?\s*(\w+(?:\s+\w+)*)\s+(?:to|→|joins?)\s+(\w+(?:\s+\w+)*)/gi,
    ]
  };

  static parseEnhancedContent(content: string, sourceUrl: string): ParsedTransferData[] {
    console.log('🔍 Enhanced parsing content from:', sourceUrl);
    
    const transfers: ParsedTransferData[] = [];
    const processedPlayers = new Set<string>(); // Avoid duplicates
    
    // Try each enhanced pattern
    for (const [patternType, patterns] of Object.entries(this.ENHANCED_PATTERNS)) {
      if (patternType === 'FEE_AMOUNTS') continue; // Handle separately
      
      for (const pattern of patterns) {
        const matches = content.matchAll(pattern);
        
        for (const match of matches) {
          const transfer = this.processPatternMatch(match, patternType, content);
          
          if (transfer && !processedPlayers.has(transfer.playerName.toLowerCase())) {
            transfers.push(transfer);
            processedPlayers.add(transfer.playerName.toLowerCase());
            console.log(`✅ Enhanced pattern match: ${transfer.playerName} → ${transfer.toClub}`);
          }
        }
      }
    }
    
    // Also parse using existing structured content extraction
    const structuredTransfers = this.parseStructuredData(content);
    for (const transfer of structuredTransfers) {
      if (!processedPlayers.has(transfer.playerName.toLowerCase())) {
        transfers.push(transfer);
        processedPlayers.add(transfer.playerName.toLowerCase());
      }
    }
    
    console.log(`🎯 Enhanced parsing found ${transfers.length} potential transfers`);
    return transfers;
  }

  private static processPatternMatch(
    match: RegExpMatchArray, 
    patternType: string, 
    fullContent: string
  ): ParsedTransferData | null {
    
    let playerName: string;
    let clubName: string;
    
    // Extract player and club based on pattern type
    if (patternType === 'OFFICIAL_SIGNING' || patternType === 'HERE_WE_GO') {
      playerName = match[1]?.trim();
      clubName = match[2]?.trim();
    } else if (patternType === 'MEDICAL_COMPLETION') {
      playerName = match[1]?.trim();
      clubName = match[2]?.trim();
    } else {
      return null;
    }
    
    // Validate player and club names
    if (!this.isValidPlayerName(playerName) || !this.isValidClubName(clubName)) {
      return null;
    }
    
    // Extract fee from surrounding context
    const fee = this.extractFeeFromContext(match[0], fullContent);
    
    // Calculate confidence based on pattern type and context
    const confidence = this.calculateEnhancedConfidence(patternType, match[0], fullContent);
    
    return {
      playerName: this.cleanName(playerName),
      fromClub: 'Unknown', // We'd need more context to determine this
      toClub: this.normalizeClubName(clubName),
      fee,
      confidence,
      verificationStatus: confidence >= 0.8 ? 'confirmed' : 'unverified'
    };
  }

  private static parseStructuredData(content: string): ParsedTransferData[] {
    const transfers: ParsedTransferData[] = [];
    
    // Look for table-like structures with transfer data
    const tablePattern = /(?:player|name)\s*[:|]\s*(\w+(?:\s+\w+)*)\s*[,;]\s*(?:club|to|destination)\s*[:|]\s*(\w+(?:\s+\w+)*)\s*[,;]?\s*(?:fee|price)\s*[:|]\s*([£$€]?[\d.]+m?|undisclosed|free)/gi;
    
    const matches = content.matchAll(tablePattern);
    for (const match of matches) {
      const playerName = match[1]?.trim();
      const clubName = match[2]?.trim();
      const fee = match[3]?.trim();
      
      if (this.isValidPlayerName(playerName) && this.isValidClubName(clubName)) {
        transfers.push({
          playerName: this.cleanName(playerName),
          fromClub: 'Unknown',
          toClub: this.normalizeClubName(clubName),
          fee: fee || 'Undisclosed',
          confidence: 0.75,
          verificationStatus: 'confirmed'
        });
      }
    }
    
    return transfers;
  }

  private static extractFeeFromContext(matchText: string, fullContent: string): string {
    const contextStart = Math.max(0, fullContent.indexOf(matchText) - 200);
    const contextEnd = Math.min(fullContent.length, fullContent.indexOf(matchText) + matchText.length + 200);
    const context = fullContent.slice(contextStart, contextEnd);
    
    // Try to find fee in the context
    for (const pattern of this.ENHANCED_PATTERNS.FEE_AMOUNTS) {
      const feeMatch = context.match(pattern);
      if (feeMatch) {
        return feeMatch[0];
      }
    }
    
    return 'Undisclosed';
  }

  private static calculateEnhancedConfidence(patternType: string, matchText: string, fullContent: string): number {
    let confidence = 0.5;
    
    // Base confidence by pattern type
    switch (patternType) {
      case 'OFFICIAL_SIGNING':
        confidence = 0.9;
        break;
      case 'HERE_WE_GO':
        confidence = 0.85;
        break;
      case 'MEDICAL_COMPLETION':
        confidence = 0.8;
        break;
      default:
        confidence = 0.6;
    }
    
    // Boost for confirmation keywords
    const hasConfirmationKeyword = CONFIRMED_TRANSFER_KEYWORDS.some(keyword => 
      matchText.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (hasConfirmationKeyword) {
      confidence += 0.1;
    }
    
    // Boost for official source context
    if (fullContent.toLowerCase().includes('official') || 
        fullContent.toLowerCase().includes('confirmed')) {
      confidence += 0.05;
    }
    
    return Math.min(confidence, 1.0);
  }

  private static isValidPlayerName(name: string): boolean {
    if (!name || name.length < 3) return false;
    
    // Check if it's not obviously a club name
    const isClubName = PREMIER_LEAGUE_CLUBS.some(club => 
      name.toLowerCase().includes(club.toLowerCase())
    );
    
    return !isClubName && /^[A-Za-z\s'-]+$/.test(name);
  }

  private static isValidClubName(name: string): boolean {
    if (!name || name.length < 3) return false;
    
    return PREMIER_LEAGUE_CLUBS.some(club => 
      name.toLowerCase().includes(club.toLowerCase()) ||
      club.toLowerCase().includes(name.toLowerCase())
    );
  }

  private static normalizeClubName(name: string): string {
    const clubName = name.toLowerCase();
    
    for (const standardName of PREMIER_LEAGUE_CLUBS) {
      if (clubName.includes(standardName.toLowerCase()) || 
          standardName.toLowerCase().includes(clubName)) {
        return standardName;
      }
    }
    
    return this.cleanName(name);
  }

  private static cleanName(name: string): string {
    return name.replace(/[^\w\s'-]/g, '').trim();
  }
}
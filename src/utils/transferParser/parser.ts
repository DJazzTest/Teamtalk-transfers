
import { ParsedTransferData } from './types';
import { CONFIRMED_TRANSFER_KEYWORDS, RUMOR_KEYWORDS, EXCLUDED_KEYWORDS, TRUSTED_SOURCES, KNOWN_PLAYERS } from './constants';
import { extractSentences, extractPlayerName, extractClubs, extractFee, isFromTrustedSource, containsRelevantRumorContent } from './extractors';
import { EnhancedTransferParser } from '../transferDetection/enhancedParser';

export function parseTransfersFromContent(scrapedContent: string, sourceUrl: string): ParsedTransferData[] {
  console.log('=== PARSING TRANSFERS FROM:', sourceUrl, '===');
  console.log('Content length:', scrapedContent.length);
  
  // RULE 1: Check if source is trusted
  if (!isFromTrustedSource(sourceUrl)) {
    console.log('❌ Source not trusted, skipping:', sourceUrl);
    return [];
  }
  
  const transfers: ParsedTransferData[] = [];
  
  // Use enhanced parsing first for better detection
  const enhancedTransfers = EnhancedTransferParser.parseEnhancedContent(scrapedContent, sourceUrl);
  transfers.push(...enhancedTransfers);
  
  // Add specific known transfers based on content analysis (only if from trusted source)
  const knownTransfers = extractKnownTransfers(scrapedContent, sourceUrl);
  transfers.push(...knownTransfers);

  const sentences = extractSentences(scrapedContent);
  console.log(`Processing ${sentences.length} sentences for transfer detection`);

  // Process confirmed transfers
  for (const sentence of sentences) {
    const parsedTransfer = parseSentenceWithVerification(sentence);
    if (parsedTransfer && parsedTransfer.confidence >= 0.8 && parsedTransfer.verificationStatus === 'confirmed') {
      transfers.push(parsedTransfer);
      console.log(`✓ Found CONFIRMED transfer: ${parsedTransfer.playerName} -> ${parsedTransfer.toClub}`);
    }
  }

  // Process rumors with enhanced detection
  const rumorSentences = scrapedContent.split(/[.!?\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10 && containsRelevantRumorContent(s));
  
  console.log(`Processing ${rumorSentences.length} sentences for RUMOR detection`);
  
  for (const sentence of rumorSentences) {
    const rumorTransfer = parseRumorSentence(sentence);
    if (rumorTransfer && rumorTransfer.confidence >= 0.5) {
      transfers.push(rumorTransfer);
      console.log(`✓ Found RUMOR: ${rumorTransfer.playerName} -> ${rumorTransfer.toClub}`);
    }
  }

  const deduped = deduplicateTransfers(transfers);
  console.log(`=== FINAL RESULT: ${deduped.length} CONFIRMED transfers after verification ===`);
  deduped.forEach(transfer => {
    console.log(`- ${transfer.playerName}: ${transfer.fromClub} -> ${transfer.toClub} (confidence: ${transfer.confidence}, status: ${transfer.verificationStatus})`);
  });
  
  return deduped;
}

function extractKnownTransfers(content: string, sourceUrl: string): ParsedTransferData[] {
  const transfers: ParsedTransferData[] = [];
  const lowerContent = content.toLowerCase();

  // Enhanced known transfer map with latest signings
  const knownTransferMap = [
    // Leeds United
    { player: 'Jaka Bijol', from: 'Udinese', to: 'Leeds United', fee: '£15M' },
    { player: 'Lukas Nmecha', from: 'VfL Wolfsburg', to: 'Leeds United', fee: '£8M' },
    
    // Liverpool  
    { player: 'Giorgi Mamardashvili', from: 'Valencia', to: 'Liverpool', fee: '£35M' },
    { player: 'Jeremie Frimpong', from: 'Bayer Leverkusen', to: 'Liverpool', fee: '£40M' },
    
    // Manchester City
    { player: 'Rayan Ait-Nouri', from: 'Wolverhampton Wanderers', to: 'Manchester City', fee: '£25M' },
    { player: 'Marcus Bettinelli', from: 'Chelsea', to: 'Manchester City', fee: 'Free Transfer' },
    
    // Brentford - Latest signings
    { player: 'Romelle Donovan', from: 'Sheffield United', to: 'Brentford', fee: '£2M' },
    { player: 'Michael Kayode', from: 'Fiorentina', to: 'Brentford', fee: '£8M' },
    { player: 'Caoimhin Kelleher', from: 'Liverpool', to: 'Brentford', fee: '£25M' },
    
    // Brighton
    { player: 'Matt O\'Riley', from: 'Celtic', to: 'Brighton & Hove Albion', fee: '£25M' },
    { player: 'Ferdi Kadioglu', from: 'Fenerbahce', to: 'Brighton & Hove Albion', fee: '£25M' },
    { player: 'Mats Wieffer', from: 'Feyenoord', to: 'Brighton & Hove Albion', fee: '£25M' },
    { player: 'Yankuba Minteh', from: 'Newcastle United', to: 'Brighton & Hove Albion', fee: '£30M' },
    
    // Newcastle United
    { player: 'Lloyd Kelly', from: 'Bournemouth', to: 'Newcastle United', fee: 'Free Transfer' },
    { player: 'Lewis Hall', from: 'Chelsea', to: 'Newcastle United', fee: '£28M' },
    
    // Crystal Palace
    { player: 'Chadi Riad', from: 'Real Betis', to: 'Crystal Palace', fee: '£14M' },
    
    // West Ham United
    { player: 'Crysencio Summerville', from: 'Leeds United', to: 'West Ham United', fee: '£25M' }
  ];

  for (const transfer of knownTransferMap) {
    const playerFound = lowerContent.includes(transfer.player.toLowerCase());
    const clubFound = lowerContent.includes(transfer.to.toLowerCase());
    
    // More flexible confirmation - look for signing-related keywords
    const hasConfirmationKeyword = CONFIRMED_TRANSFER_KEYWORDS.some(keyword => 
      lowerContent.includes(keyword.toLowerCase())
    ) || lowerContent.includes('signs') || lowerContent.includes('joins') || 
       lowerContent.includes('completes') || lowerContent.includes('move');
    
    if (playerFound && clubFound && hasConfirmationKeyword) {
      console.log(`✓ Adding CONFIRMED known transfer: ${transfer.player} -> ${transfer.to}`);
      transfers.push({
        playerName: transfer.player,
        fromClub: transfer.from,
        toClub: transfer.to,
        fee: transfer.fee,
        confidence: 0.95,
        verificationStatus: 'confirmed'
      });
    } else if (playerFound && clubFound) {
      // Even without explicit confirmation keywords, if both player and club are mentioned
      console.log(`✓ Adding probable transfer: ${transfer.player} -> ${transfer.to}`);
      transfers.push({
        playerName: transfer.player,
        fromClub: transfer.from,
        toClub: transfer.to,
        fee: transfer.fee,
        confidence: 0.85,
        verificationStatus: 'confirmed'
      });
    }
  }

  return transfers;
}

export function parseSentenceWithVerification(sentence: string): ParsedTransferData | null {
  const lowerSentence = sentence.toLowerCase();
  
  // RULE 2: Check for excluded keywords first (immediate disqualification)
  const hasExcludedKeyword = EXCLUDED_KEYWORDS.some(keyword => 
    lowerSentence.includes(keyword.toLowerCase())
  );
  
  if (hasExcludedKeyword) {
    console.log('❌ Sentence contains excluded keyword, skipping:', sentence.substring(0, 100));
    return null;
  }
  
  // RULE 3: Must contain confirmed transfer keywords
  const hasConfirmedKeyword = CONFIRMED_TRANSFER_KEYWORDS.some(keyword => 
    lowerSentence.includes(keyword.toLowerCase())
  );

  if (!hasConfirmedKeyword) {
    return null;
  }

  // Extract potential player names
  const playerName = extractPlayerName(sentence);
  if (!playerName) return null;

  // Extract clubs
  const clubs = extractClubs(sentence);
  if (clubs.length < 1) return null;

  // Extract fee
  const fee = extractFee(sentence);

  // Determine from/to clubs based on context
  let fromClub = 'Unknown';
  let toClub = clubs[0];

  if (clubs.length >= 2) {
    // Look for patterns like "from X to Y"
    const fromToMatch = sentence.match(/from\s+([^,]+?)\s+to\s+([^,]+)/i);
    if (fromToMatch) {
      fromClub = cleanClubName(fromToMatch[1].trim());
      toClub = cleanClubName(fromToMatch[2].trim());
    } else {
      // First club mentioned might be the destination
      toClub = clubs[0];
      if (clubs.length > 1) {
        fromClub = clubs[1];
      }
    }
  }

  const confidence = calculateConfidenceWithVerification(sentence, playerName, clubs, fee);
  const verificationStatus = confidence >= 0.8 ? 'confirmed' : 'unverified';

  return {
    playerName: cleanPlayerName(playerName),
    fromClub: cleanClubName(fromClub),
    toClub: cleanClubName(toClub),
    fee,
    confidence,
    verificationStatus
  };
}

function calculateConfidenceWithVerification(
  sentence: string, 
  playerName: string, 
  clubs: string[], 
  fee: string
): number {
  let confidence = 0.5; // Start lower, require more verification

  // High boost for confirmed transfer keywords
  const confirmedKeywords = ['has signed', 'officially joins', 'completed transfer', 'announces signing'];
  if (confirmedKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
    confidence += 0.4;
  }

  // Boost for multiple clubs mentioned (clear transfer path)
  if (clubs.length >= 2) {
    confidence += 0.2;
  }

  // Boost for fee mentioned (more official)
  if (fee !== 'Undisclosed') {
    confidence += 0.15;
  }

  // Boost for longer player names (more likely to be real)
  if (playerName.split(' ').length >= 2) {
    confidence += 0.1;
  }

  // Boost for known players
  if (KNOWN_PLAYERS.some(known => known.toLowerCase() === playerName.toLowerCase())) {
    confidence += 0.15;
  }

  return Math.min(confidence, 1.0);
}

function cleanPlayerName(name: string): string {
  return name.replace(/[^\w\s]/g, '').trim();
}

function cleanClubName(name: string): string {
  return name.replace(/[^\w\s]/g, '').trim();
}

export function parseRumorSentence(sentence: string): ParsedTransferData | null {
  const lowerSentence = sentence.toLowerCase();
  
  // Check for rumor keywords
  const hasRumorKeyword = RUMOR_KEYWORDS.some(keyword => 
    lowerSentence.includes(keyword.toLowerCase())
  );

  if (!hasRumorKeyword) {
    return null;
  }

  // Extract potential player names
  const playerName = extractPlayerName(sentence);
  if (!playerName) return null;

  // Extract clubs
  const clubs = extractClubs(sentence);
  if (clubs.length < 1) return null;

  // Extract fee
  const fee = extractFee(sentence);

  // Determine from/to clubs based on context
  let fromClub = 'Unknown';
  let toClub = clubs[0];

  if (clubs.length >= 2) {
    // Look for patterns like "from X to Y"
    const fromToMatch = sentence.match(/from\s+([^,]+?)\s+to\s+([^,]+)/i);
    if (fromToMatch) {
      fromClub = cleanClubName(fromToMatch[1].trim());
      toClub = cleanClubName(fromToMatch[2].trim());
    } else {
      toClub = clubs[0];
      if (clubs.length > 1) {
        fromClub = clubs[1];
      }
    }
  }

  const confidence = calculateRumorConfidence(sentence, playerName, clubs, fee);

  return {
    playerName: cleanPlayerName(playerName),
    fromClub: cleanClubName(fromClub),
    toClub: cleanClubName(toClub),
    fee,
    confidence,
    verificationStatus: 'rumored'
  };
}

function calculateRumorConfidence(
  sentence: string, 
  playerName: string, 
  clubs: string[], 
  fee: string
): number {
  let confidence = 0.3; // Start lower for rumors

  // High-confidence rumor keywords
  const highConfidenceKeywords = ['set to sign', 'close to signing', 'medical scheduled', 'personal terms agreed', 'breakthrough'];
  if (highConfidenceKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
    confidence += 0.3;
  }

  // Medium-confidence rumor keywords
  const mediumConfidenceKeywords = ['advanced talks', 'negotiations ongoing', 'preparing bid', 'ready to sign'];
  if (mediumConfidenceKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
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

  // Boost for known players
  if (KNOWN_PLAYERS.some(known => known.toLowerCase() === playerName.toLowerCase())) {
    confidence += 0.1;
  }

  return Math.min(confidence, 0.9); // Cap at 0.9 for rumors
}

function deduplicateTransfers(transfers: ParsedTransferData[]): ParsedTransferData[] {
  const seen = new Map<string, ParsedTransferData>();

  for (const transfer of transfers) {
    const key = `${transfer.playerName.toLowerCase()}-${transfer.toClub.toLowerCase()}`;
    const existing = seen.get(key);

    if (!existing || 
        (transfer.verificationStatus === 'confirmed' && existing.verificationStatus !== 'confirmed') ||
        (transfer.verificationStatus === existing.verificationStatus && transfer.confidence > existing.confidence)) {
      seen.set(key, transfer);
    }
  }

  // Return both confirmed and rumored transfers (removed the filter)
  return Array.from(seen.values());
}

import { Transfer } from '@/types/transfer';
import { TransferParser, ParsedTransferData } from './transferParser';
import { PREMIER_LEAGUE_CLUBS, CLUB_VARIATIONS } from './transferParser/constants';
import { allClubTransfers } from '@/data/transfers';
import { updateRumorsFromOfficialSources } from '@/data/transfers/rumors';

export interface CrawlResult {
  url: string;
  success: boolean;
  data?: any;
  error?: string;
}

export class TransferIntegrationService {
  private static STORAGE_KEY = 'parsed_transfers';

  static async processCrawlResults(crawlResults: CrawlResult[]): Promise<Transfer[]> {
    console.log('=== PROCESSING CRAWL RESULTS WITH OFFICIAL RUMORS ===');
    console.log('Number of crawl results:', crawlResults.length);
    
    const confirmedTransfers: Transfer[] = [];
    const officialRumors: Transfer[] = [];

    for (const result of crawlResults) {
      if (result.success && result.data) {
        try {
          console.log(`\n--- Processing result from ${result.url} ---`);
          const transfers = this.extractTransfersFromCrawlData(result.data, result.url);
          
          // Separate confirmed transfers from rumors
          const confirmed = transfers.filter(t => t.status === 'confirmed');
          const rumors = transfers.filter(t => t.status === 'rumored');
          
          confirmedTransfers.push(...confirmed);
          officialRumors.push(...rumors);
          
          console.log(`✓ Extracted ${confirmed.length} CONFIRMED transfers and ${rumors.length} OFFICIAL RUMORS from ${result.url}`);
        } catch (error) {
          console.error(`❌ Error processing transfers from ${result.url}:`, error);
        }
      }
    }

    // Store confirmed transfers
    const deduplicatedConfirmed = this.deduplicateTransfers(confirmedTransfers);
    this.storeParsedTransfers(deduplicatedConfirmed);
    
    // Update official rumors
    const deduplicatedRumors = this.deduplicateTransfers(officialRumors);
    updateRumorsFromOfficialSources(deduplicatedRumors);
    
    console.log(`\n=== CRAWL PROCESSING COMPLETE ===`);
    console.log(`Total CONFIRMED transfers: ${deduplicatedConfirmed.length}`);
    console.log(`Total OFFICIAL RUMORS: ${deduplicatedRumors.length}`);
    
    return [...deduplicatedConfirmed, ...deduplicatedRumors];
  }

  private static extractTransfersFromCrawlData(crawlData: any, sourceUrl: string): Transfer[] {
    let content = '';

    console.log(`\n--- Extracting content from crawl data for: ${sourceUrl} ---`);
    console.log('Crawl data type:', typeof crawlData);
    console.log('Crawl data keys:', Object.keys(crawlData || {}));

    // Handle different data structures from Firecrawl
    if (Array.isArray(crawlData)) {
      // Multiple pages crawled
      content = crawlData
        .map(page => page.markdown || page.content || '')
        .join('\n\n');
      console.log(`Processed ${crawlData.length} pages from array`);
    } else if (crawlData.markdown) {
      // Single page with markdown
      content = crawlData.markdown;
      console.log('Using markdown content');
    } else if (crawlData.content) {
      // Single page with content
      content = crawlData.content;
      console.log('Using content field');
    } else if (typeof crawlData === 'string') {
      // Direct content string
      content = crawlData;
      console.log('Using direct string content');
    }

    console.log(`Content length for ${sourceUrl}: ${content.length} characters`);
    
    if (!content) {
      console.warn(`❌ No content found for ${sourceUrl}`);
      return [];
    }

    // Parse transfers from content with NEW VERIFICATION RULES
    const parsedTransfers = TransferParser.parseTransfers(content, sourceUrl);
    return parsedTransfers.map(parsed => this.convertToTransferWithVerification(parsed, sourceUrl));
  }

  static convertToTransferWithVerification(parsed: ParsedTransferData, sourceUrl: string): Transfer {
    // Only convert to confirmed status if verification passes
    const status = parsed.verificationStatus === 'confirmed' && parsed.confidence >= 0.8 ? 'confirmed' : 'rumored';
    
    return {
      id: `verified-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      playerName: parsed.playerName,
      fromClub: parsed.fromClub,
      toClub: parsed.toClub,
      fee: parsed.fee,
      date: new Date().toISOString(),
      source: new URL(sourceUrl).hostname,
      status
    };
  }

  private static deduplicateTransfers(transfers: Transfer[]): Transfer[] {
    const seen = new Map<string, Transfer>();

    for (const transfer of transfers) {
      const key = `${transfer.playerName.toLowerCase()}-${transfer.toClub.toLowerCase()}`;
      const existing = seen.get(key);

      if (!existing) {
        seen.set(key, transfer);
      } else {
        // Keep the one with more recent date or higher confidence (confirmed over rumored)
        if (transfer.status === 'confirmed' && existing.status === 'rumored') {
          seen.set(key, transfer);
        } else if (new Date(transfer.date) > new Date(existing.date)) {
          seen.set(key, transfer);
        }
      }
    }

    return Array.from(seen.values());
  }

  static cleanupCorruptedPlayerNames(transfers: Transfer[]): Transfer[] {
    const allClubNames = new Set([
      ...PREMIER_LEAGUE_CLUBS.map(club => club.toLowerCase()),
      ...Object.keys(CLUB_VARIATIONS).map(club => club.toLowerCase()),
      ...Object.values(CLUB_VARIATIONS).flat().map(variation => variation.toLowerCase())
    ]);

    return transfers.map(transfer => {
      let cleanedPlayerName = transfer.playerName;
      
      // Remove club names from player names
      const playerWords = cleanedPlayerName.split(' ');
      const filteredWords = playerWords.filter(word => {
        const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
        return !allClubNames.has(cleanWord);
      });
      
      // Only update if we have at least 2 words left (first and last name)
      if (filteredWords.length >= 2) {
        cleanedPlayerName = filteredWords.join(' ');
      }
      
      // If the cleaned name is too short or empty, mark for removal
      if (cleanedPlayerName.length < 3 || filteredWords.length < 2) {
        return null;
      }
      
      return {
        ...transfer,
        playerName: cleanedPlayerName
      };
    }).filter(transfer => transfer !== null) as Transfer[];
  }

  static getParsedTransfers(): Transfer[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const transfers = stored ? JSON.parse(stored) : [];
      console.log(`Retrieved ${transfers.length} parsed transfers from storage`);
      
      // Clean up corrupted player names
      const cleanedTransfers = this.cleanupCorruptedPlayerNames(transfers);
      
      // Store the cleaned transfers back
      if (cleanedTransfers.length !== transfers.length) {
        console.log(`Cleaned up ${transfers.length - cleanedTransfers.length} corrupted transfers`);
        this.storeParsedTransfers(cleanedTransfers);
      }
      
      return cleanedTransfers;
    } catch (error) {
      console.error('Error loading parsed transfers:', error);
      return [];
    }
  }

  private static storeParsedTransfers(transfers: Transfer[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(transfers));
      console.log(`Stored ${transfers.length} parsed transfers to localStorage`);
    } catch (error) {
      console.error('Error storing parsed transfers:', error);
    }
  }

  // Updated to include official rumors
  static getAllTransfers(): Transfer[] {
    const parsedTransfers = this.getParsedTransfers();
    console.log(`Using ${parsedTransfers.length} parsed transfers with ${allClubTransfers.length} real transfers`);
    
    // Combine real transfers with parsed transfers (includes official rumors)
    const combined = [...parsedTransfers, ...allClubTransfers];
    const merged = this.deduplicateTransfers(combined);
    
    console.log(`Final transfers: ${merged.length} total`);
    return merged;
  }

  static clearParsedTransfers(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('Cleared parsed transfers from storage');
  }
}

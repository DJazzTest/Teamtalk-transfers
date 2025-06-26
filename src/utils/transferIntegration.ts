import { Transfer } from '@/types/transfer';
import { TransferParser, ParsedTransferData } from './transferParser';

export interface CrawlResult {
  url: string;
  success: boolean;
  data?: any;
  error?: string;
}

export class TransferIntegrationService {
  private static STORAGE_KEY = 'parsed_transfers';

  static async processCrawlResults(crawlResults: CrawlResult[]): Promise<Transfer[]> {
    const allTransfers: Transfer[] = [];

    for (const result of crawlResults) {
      if (result.success && result.data) {
        try {
          const transfers = this.extractTransfersFromCrawlData(result.data, result.url);
          allTransfers.push(...transfers);
          console.log(`Extracted ${transfers.length} transfers from ${result.url}`);
        } catch (error) {
          console.error(`Error processing transfers from ${result.url}:`, error);
        }
      }
    }

    // Store parsed transfers
    const deduplicated = this.deduplicateTransfers(allTransfers);
    this.storeParsedTransfers(deduplicated);
    
    console.log(`Total parsed transfers: ${deduplicated.length}`);
    return deduplicated;
  }

  private static extractTransfersFromCrawlData(crawlData: any, sourceUrl: string): Transfer[] {
    let content = '';

    // Handle different data structures from Firecrawl
    if (Array.isArray(crawlData)) {
      // Multiple pages crawled
      content = crawlData
        .map(page => page.markdown || page.content || '')
        .join('\n\n');
    } else if (crawlData.markdown) {
      // Single page with markdown
      content = crawlData.markdown;
    } else if (crawlData.content) {
      // Single page with content
      content = crawlData.content;
    } else if (typeof crawlData === 'string') {
      // Direct content string
      content = crawlData;
    }

    if (!content) {
      console.warn(`No content found for ${sourceUrl}`);
      return [];
    }

    // Parse transfers from content
    const parsedTransfers = TransferParser.parseTransfers(content, sourceUrl);
    return parsedTransfers.map(parsed => TransferParser.convertToTransfer(parsed, sourceUrl));
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

  static getParsedTransfers(): Transfer[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading parsed transfers:', error);
      return [];
    }
  }

  private static storeParsedTransfers(transfers: Transfer[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(transfers));
    } catch (error) {
      console.error('Error storing parsed transfers:', error);
    }
  }

  static mergeParsedWithMockTransfers(mockTransfers: Transfer[]): Transfer[] {
    const parsedTransfers = this.getParsedTransfers();
    const combined = [...parsedTransfers, ...mockTransfers];
    return this.deduplicateTransfers(combined);
  }

  static clearParsedTransfers(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

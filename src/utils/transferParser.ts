
import { Transfer } from '@/types/transfer';
import { ParsedTransferData } from './transferParser/types';
import { parseTransfersFromContent } from './transferParser/parser';

export type { ParsedTransferData } from './transferParser/types';

export class TransferParser {
  static parseTransfers(scrapedContent: string, sourceUrl: string): ParsedTransferData[] {
    return parseTransfersFromContent(scrapedContent, sourceUrl);
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

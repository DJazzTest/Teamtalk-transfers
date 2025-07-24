// Deduplicate transfers by player name, toClub, and status (case-insensitive), keeping the most recent by date
import { Transfer } from '../types/Transfer';

export function deduplicateTransfersUI(transfers: Transfer[]): Transfer[] {
  const seen = new Map<string, Transfer>();

  for (const transfer of transfers) {
    const key = `${transfer.playerName.toLowerCase()}-${transfer.toClub.toLowerCase()}-${transfer.status}`;
    const existing = seen.get(key);

    if (!existing) {
      seen.set(key, transfer);
    } else {
      // Keep the one with more recent date
      if (new Date(transfer.date) > new Date(existing.date)) {
        seen.set(key, transfer);
      }
    }
  }

  return Array.from(seen.values());
}

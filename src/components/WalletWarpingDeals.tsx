import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { TransferCard } from './TransferCard';
import { StaleTransferAlert } from './StaleTransferAlert';

interface WalletWarpingDealsProps {
  transfers: any[];
}

// Helper to parse transfer fee to a number (assumes format like '£100m', '€80m', etc.)
function parseFee(fee: string): number {
  if (!fee) return 0;
  const match = fee.match(/([£€$])([\d,.]+)([mkb]?)/i);
  if (!match) return 0;
  let [, , amount, unit] = match;
  let num = parseFloat(amount.replace(/,/g, ''));
  unit = unit?.toLowerCase();
  if (unit === 'b') num *= 1_000;
  if (unit === 'm') num *= 1;
  if (unit === 'k') num /= 1_000;
  return num;
}

export const WalletWarpingDeals: React.FC<WalletWarpingDealsProps> = ({ transfers }) => {
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  // Standalone hash function for strings
  function hashString(str: string): string {
    let hash = 0, i, chr;
    if (str.length === 0) return hash.toString();
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return hash.toString();
  }

  useEffect(() => {
    const lastSeen = localStorage.getItem('lastSeenTransferHash');
    const currentHash = hashString(transfers.map(t => t.id || t.headline || '').join('|'));
    if (lastSeen !== currentHash) {
      setShowWhatsNew(true);
      localStorage.setItem('lastSeenTransferHash', currentHash);
    }
  }, [transfers]);

  // Sort by fee descending, filter only confirmed transfers with a valid fee
  const sorted = transfers
    .filter(t => t.status === 'confirmed' && t.fee && parseFee(t.fee) > 0)
    .sort((a, b) => parseFee(b.fee) - parseFee(a.fee))
    .slice(0, 10);

  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? sorted : sorted.slice(0, 5);

  // --- Stale content detection ---
  const GOSSIP_KEYWORDS = [
    'interest reported', 'monitoring', 'talks underway', 'negotiations ongoing',
    'personal terms agreed', 'medical scheduled', 'bid submitted', 'offer tabled',
    'verbal agreement', 'hijack attempt', 'on the radar', 'agent pushing move',
    'player keen', 'surprise move', 'marquee signing', 'exit door looms',
    'contract standoff', 'free to leave', 'loan with option to buy',
    'rumor', 'rumoured', 'gossip', 'linked', 'scouted', 'target', 'deal imminent',
    'terms agreed', 'club pushing', 'liked', 'listed as target'
  ];
  const STALE_DAYS = 3;
  const NOW = new Date('2025-07-10T12:00:00Z'); // Use the user's provided current time

  function isGossip(transfer: any): boolean {
    const text = `${transfer.fee} ${transfer.status} ${transfer.source}`.toLowerCase();
    return GOSSIP_KEYWORDS.some(keyword => text.includes(keyword));
  }
  function isStale(dateStr: string): boolean {
    const date = new Date(dateStr);
    const diffDays = Math.floor((+NOW - +date) / (1000 * 60 * 60 * 24));
    return diffDays > STALE_DAYS;
  }
  const stale = visible.filter(t => isGossip(t) && isStale(t.date)).map(t => ({
    ...t,
    daysOld: Math.floor((+NOW - +new Date(t.date)) / (1000 * 60 * 60 * 24))
  }));
  // --- End stale detection ---

  return (
    <div className="space-y-6">
      {showWhatsNew && (
        <div className="bg-yellow-400 text-black text-center py-2 rounded shadow mb-2 font-semibold animate-pulse">
          🔁 New Premier League Transfers & Rumours just added!
        </div>
      )}
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
        {/* Stale transfer alert */}
        <StaleTransferAlert stale={stale} />
        <div className="space-y-4">
          {visible.map(transfer => (
            <div key={transfer.id} className="flex items-center gap-3">
              <img
                src={`/badges/${transfer.toClub?.toLowerCase().replace(/[^a-z]/g, '')}.png`}
                alt={`${transfer.toClub} badge`}
                className="w-8 h-8 rounded-full shadow bg-white object-contain border border-gray-200"
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <TransferCard transfer={transfer} />
            </div>
          ))}
        </div>
        {sorted.length > 5 && (
          <button
            className="mt-4 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            onClick={() => setShowAll(s => !s)}
          >
            {showAll ? 'Show Less' : `Show More (${sorted.length - 5} more)`}
          </button>
        )}
      </Card>
    </div>
  );
};

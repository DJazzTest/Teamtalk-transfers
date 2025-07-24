import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export interface StaleTransfer {
  id: string;
  playerName: string;
  fromClub: string;
  toClub: string;
  fee: string;
  date: string;
  source: string;
  status: string;
  daysOld: number;
}

export const StaleTransferAlert: React.FC<{ stale: StaleTransfer[]; onRefresh?: () => void }> = ({ stale, onRefresh }) => {
  if (!stale.length) return null;
  return (
    <div className="bg-red-600 text-white p-4 rounded shadow mb-4 animate-pulse">
      <h3 className="font-bold text-lg mb-2">⚠️ Stale Transfer Rumors Detected</h3>
      <ul className="list-disc pl-5">
        {stale.map(tr => (
          <li key={tr.id}>
            <span className="font-semibold">{tr.playerName}</span> ({tr.fromClub} → {tr.toClub}) — <span className="italic">{tr.fee}</span> <span className="text-xs">[{tr.date}, {tr.daysOld} days old]</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm">Consider refreshing your data scrape or updating rumors.</div>
        {onRefresh && (
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20 ml-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        )}
      </div>
    </div>
  );
};

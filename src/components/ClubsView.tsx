
import React from 'react';
import { Card } from '@/components/ui/card';
import { Transfer } from '@/types/transfer';
import { TransferCard } from './TransferCard';

interface ClubsViewProps {
  clubTransfers: { [key: string]: Transfer[] };
}

export const ClubsView: React.FC<ClubsViewProps> = ({ clubTransfers }) => {
  return (
    <>
      {Object.entries(clubTransfers).map(([club, clubTransferList]) => (
        <Card key={club} className="bg-slate-800/50 backdrop-blur-md border-slate-700">
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-600 pb-2">
              {club} ({clubTransferList.length} transfers)
            </h3>
            <div className="space-y-3">
              {clubTransferList.map((transfer) => (
                <div key={transfer.id} className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700/70 transition-all duration-200">
                  <TransferCard transfer={transfer} />
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </>
  );
};

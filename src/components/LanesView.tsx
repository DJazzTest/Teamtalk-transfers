
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Transfer } from '@/types/transfer';
import { TransferCard } from './TransferCard';
import { getLaneTitle, getLaneIcon, getStatusColor } from '@/utils/statusUtils';

interface LanesViewProps {
  statusTransfers: { [key: string]: Transfer[] };
}

export const LanesView: React.FC<LanesViewProps> = ({ statusTransfers }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {Object.entries(statusTransfers).map(([status, statusTransferList]) => (
        <div key={status} className="space-y-4">
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
            <div className="p-4 border-b border-slate-600">
              <div className="flex items-center gap-3">
                {getLaneIcon(status)}
                <h3 className="text-lg font-bold text-white">
                  {getLaneTitle(status)}
                </h3>
                <Badge className={`${getStatusColor(status)} text-white text-xs`}>
                  {statusTransferList.length}
                </Badge>
              </div>
            </div>
          </Card>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {statusTransferList.map((transfer) => (
              <TransferCard key={transfer.id} transfer={transfer} isCompact={true} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

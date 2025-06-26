
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Transfer } from '@/types/transfer';
import { getStatusColor, getStatusIcon } from '@/utils/transferUtils';

interface TransferCardProps {
  transfer: Transfer;
  isCompact?: boolean;
}

export const TransferCard: React.FC<TransferCardProps> = ({ transfer, isCompact = false }) => {
  if (isCompact) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700 hover:bg-slate-800/70 transition-all duration-200">
        <div className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(transfer.status)}
              <h4 className="font-semibold text-white text-sm">{transfer.playerName}</h4>
            </div>
            
            <div className="text-xs text-gray-300">
              <div className="flex items-center gap-1 mb-1">
                <span>{transfer.fromClub}</span>
                <span>→</span>
                <span className="font-semibold text-white">{transfer.toClub}</span>
              </div>
            </div>
            
            {transfer.rejectionReason && (
              <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
                <p className="text-red-400 text-xs">{transfer.rejectionReason}</p>
              </div>
            )}
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm font-bold text-green-400">{transfer.fee}</p>
                <p className="text-xs text-gray-300">{new Date(transfer.date).toLocaleDateString()}</p>
              </div>
              <p className="text-xs text-gray-300">{transfer.source}</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700 hover:bg-slate-800/70 transition-all duration-200">
      <div className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-white">{transfer.playerName}</h3>
              <Badge className={`${getStatusColor(transfer.status)} text-white text-xs`}>
                {transfer.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span>{transfer.fromClub}</span>
              <span>→</span>
              <span className="font-semibold text-white">{transfer.toClub}</span>
            </div>
            {transfer.rejectionReason && (
              <div className="mt-2 bg-red-500/10 border border-red-500/20 rounded p-2">
                <p className="text-red-400 text-sm">{transfer.rejectionReason}</p>
              </div>
            )}
          </div>
          
          <div className="text-right">
            <p className="text-lg font-bold text-green-400">{transfer.fee}</p>
            <p className="text-xs text-gray-300">{transfer.source}</p>
            <p className="text-xs text-gray-400">{new Date(transfer.date).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

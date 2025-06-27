
import React from 'react';
import { Card } from '@/components/ui/card';
import { Users, CheckCircle, MessageCircle, X } from 'lucide-react';
import { Transfer } from '@/types/transfer';

interface TransferStatsProps {
  transfers: Transfer[];
}

export const TransferStats: React.FC<TransferStatsProps> = ({ transfers }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
        <div className="p-4 flex items-center gap-3">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-white font-semibold">{transfers.length}</p>
            <p className="text-gray-300 text-sm">Total Transfers</p>
          </div>
        </div>
      </Card>
      
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
        <div className="p-4 flex items-center gap-3">
          <div className="bg-green-500/20 p-2 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-white font-semibold">
              {transfers.filter(t => t.status === 'confirmed').length}
            </p>
            <p className="text-gray-300 text-sm">Confirmed</p>
          </div>
        </div>
      </Card>
      
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
        <div className="p-4 flex items-center gap-3">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <MessageCircle className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-white font-semibold">
              {transfers.filter(t => t.status === 'rumored').length}
            </p>
            <p className="text-gray-300 text-sm">Gossip</p>
          </div>
        </div>
      </Card>

      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
        <div className="p-4 flex items-center gap-3">
          <div className="bg-red-500/20 p-2 rounded-lg">
            <X className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-white font-semibold">
              {transfers.filter(t => t.status === 'rejected').length}
            </p>
            <p className="text-gray-300 text-sm">Failed</p>
          </div>
        </div>
      </Card>
    </div>
  );
};


import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, TrendingUp } from 'lucide-react';

interface Transfer {
  id: string;
  playerName: string;
  fromClub: string;
  toClub: string;
  fee: string;
  date: string;
  source: string;
  status: 'confirmed' | 'rumored' | 'pending';
}

interface RecentTransfersProps {
  transfers: Transfer[];
}

export const RecentTransfers: React.FC<RecentTransfersProps> = ({ transfers }) => {
  // Get the most recent confirmed transfers (last 3)
  const recentConfirmed = transfers
    .filter(transfer => transfer.status === 'confirmed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  if (recentConfirmed.length === 0) {
    return null;
  }

  return (
    <Card className="bg-slate-800/90 backdrop-blur-md border-slate-600/50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Latest Confirmed Transfers</h3>
          <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
            BREAKING
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentConfirmed.map((transfer, index) => (
            <Card key={transfer.id} className="bg-slate-700/60 backdrop-blur-md border-slate-600 hover:bg-slate-700/80 transition-all duration-200">
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                      #{index + 1} LATEST
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-white text-lg">{transfer.playerName}</h4>
                    <div className="text-sm text-gray-300 mt-1">
                      <div className="flex items-center gap-1">
                        <span>{transfer.fromClub}</span>
                        <span>→</span>
                        <span className="font-semibold text-white">{transfer.toClub}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-lg font-bold text-blue-400">{transfer.fee}</p>
                      <p className="text-xs text-gray-400">{new Date(transfer.date).toLocaleDateString()}</p>
                    </div>
                    <p className="text-xs text-gray-300">{transfer.source}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Card>
  );
};

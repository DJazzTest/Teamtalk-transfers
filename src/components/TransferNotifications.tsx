import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, RefreshCw, TrendingUp, Users, Clock } from 'lucide-react';
import { Transfer } from '@/types/transfer';

interface TransferNotificationsProps {
  transfers: Transfer[];
}

export const TransferNotifications: React.FC<TransferNotificationsProps> = ({ transfers }) => {
  const [lastCheckTime, setLastCheckTime] = useState(() => {
    const saved = localStorage.getItem('lastTransferCheck');
    return saved ? new Date(saved) : new Date(Date.now() - 15 * 60 * 1000); // 15 mins ago default
  });
  
  const [newTransfersCount, setNewTransfersCount] = useState(0);

  useEffect(() => {
    // Count transfers added since last check
    const newTransfers = transfers.filter(transfer => 
      new Date(transfer.date) > lastCheckTime
    );
    setNewTransfersCount(newTransfers.length);
  }, [transfers, lastCheckTime]);

  const handleMarkAsRead = () => {
    const now = new Date();
    setLastCheckTime(now);
    localStorage.setItem('lastTransferCheck', now.toISOString());
    setNewTransfersCount(0);
  };

  const recentTransfers = transfers
    .filter(transfer => new Date(transfer.date) > lastCheckTime)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const getTimeSinceLastScrape = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastCheckTime.getTime()) / (1000 * 60));
    return diff;
  };

  return (
    <div className="space-y-6">
      {/* Update Summary Card */}
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Transfer Updates</h3>
                <p className="text-gray-400 text-sm">Auto-scrape runs every 15 minutes</p>
              </div>
            </div>
            <Button 
              onClick={handleMarkAsRead}
              variant="outline" 
              size="sm"
              className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Mark as Read
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-400/30">
              <div className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-400">{newTransfersCount}</div>
                <div className="text-sm text-gray-300">New Updates</div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-400/30">
              <div className="p-4 text-center">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-400">{transfers.length}</div>
                <div className="text-sm text-gray-300">Total Transfers</div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-400/30">
              <div className="p-4 text-center">
                <Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-400">{getTimeSinceLastScrape()}m</div>
                <div className="text-sm text-gray-300">Since Last Check</div>
              </div>
            </Card>
          </div>
        </div>
      </Card>

      {/* Recent Updates */}
      {recentTransfers.length > 0 && (
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
          <div className="p-6">
            <h4 className="text-lg font-bold text-white mb-4">Recent Updates</h4>
            <div className="space-y-3">
              {recentTransfers.map((transfer) => (
                <Card key={transfer.id} className="bg-slate-700/50 border-slate-600">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold text-white">{transfer.playerName}</h5>
                        <p className="text-sm text-gray-300">
                          {transfer.fromClub} → {transfer.toClub}
                        </p>
                        <p className="text-sm font-semibold text-blue-400">{transfer.fee}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={
                          transfer.status === 'confirmed' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }>
                          {transfer.status.toUpperCase()}
                        </Badge>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(transfer.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      )}

      {newTransfersCount === 0 && (
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
          <div className="p-6 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">All Up to Date!</h4>
            <p className="text-gray-400">No new transfers since your last check.</p>
          </div>
        </Card>
      )}
    </div>
  );
};
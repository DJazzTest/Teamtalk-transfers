import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TransferTracker } from '@/utils/transferTracker';
import { Clock, Plus, Edit, CheckCircle, Trash2 } from 'lucide-react';

export const TransferActivityLog: React.FC = () => {
  const [logs, setLogs] = useState(TransferTracker.getLogs());
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const handleRefresh = () => {
      setLogs(TransferTracker.getLogs());
    };

    window.addEventListener('transferLogged', handleRefresh);
    return () => window.removeEventListener('transferLogged', handleRefresh);
  }, []);

  const recentLogs = showAll ? logs : logs.slice(0, 10);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'added': return <Plus className="w-3 h-3" />;
      case 'updated': return <Edit className="w-3 h-3" />;
      case 'confirmed': return <CheckCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'added': return 'bg-blue-100 text-blue-800';
      case 'updated': return 'bg-orange-100 text-orange-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleClearLogs = () => {
    TransferTracker.clearLogs();
    setLogs([]);
  };

  if (logs.length === 0) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
        <div className="p-4 text-center">
          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-400">No transfer activity logged yet</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Transfer Activity Log</h3>
            <Badge className="bg-blue-100 text-blue-800">{logs.length}</Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="text-white border-slate-600"
            >
              {showAll ? 'Show Recent' : 'Show All'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearLogs}
              className="text-red-400 border-red-400 hover:bg-red-400/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {recentLogs.map((log, index) => (
            <div
              key={`${log.id}-${log.timestamp.getTime()}`}
              className="bg-slate-700/50 rounded-lg p-3 hover:bg-slate-700/70 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`${getActionColor(log.action)} text-xs flex items-center gap-1`}>
                      {getActionIcon(log.action)}
                      {log.action.toUpperCase()}
                    </Badge>
                    <span className="text-white font-medium">{log.playerName}</span>
                  </div>
                  <div className="text-sm text-gray-300">
                    <span>{log.fromClub}</span>
                    <span className="mx-2">→</span>
                    <span className="text-white">{log.toClub}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Source: {log.source}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">
                    {log.timestamp.toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-400">
                    {log.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!showAll && logs.length > 10 && (
          <div className="text-center mt-3 pt-3 border-t border-slate-600">
            <p className="text-sm text-gray-400">
              Showing {recentLogs.length} of {logs.length} activities
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
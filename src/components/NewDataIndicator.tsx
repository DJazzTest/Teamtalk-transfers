import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock } from 'lucide-react';
import { TransferTracker } from '@/utils/transferTracker';

export const NewDataIndicator: React.FC = () => {
  const [lastNewDataTime, setLastNewDataTime] = useState<Date | null>(null);

  useEffect(() => {
    const checkForNewData = () => {
      const recentLogs = TransferTracker.getLogs();
      if (recentLogs.length === 0) return;

      // Find the most recent "added" or "confirmed" activity (not just updates)
      const newDataLogs = recentLogs.filter(log => 
        log.action === 'added' || log.action === 'confirmed'
      );

      if (newDataLogs.length > 0) {
        const mostRecentNewData = newDataLogs[0]; // getLogs() returns in desc order
        setLastNewDataTime(mostRecentNewData.timestamp);
      }
    };

    // Check initially
    checkForNewData();

    // Listen for new transfer activity
    const handleTransferLogged = () => {
      checkForNewData();
    };

    window.addEventListener('transferLogged', handleTransferLogged);
    return () => window.removeEventListener('transferLogged', handleTransferLogged);
  }, []);

  const getTimeAgo = (date: Date): string => {
    const now = Date.now();
    const diff = now - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 5) return `${minutes}m ago`;
    return 'just now';
  };

  // Only show if we have new data and it's not too old (within last 24 hours)
  if (!lastNewDataTime) return null;
  
  const timeSinceNewData = Date.now() - lastNewDataTime.getTime();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  if (timeSinceNewData > maxAge) return null;

  return (
    <div className="flex items-center justify-center mb-4">
      <Badge className="bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400 flex items-center gap-2 px-3 py-1.5 text-sm font-medium animate-pulse">
        <Plus className="w-4 h-4" />
        New data added {getTimeAgo(lastNewDataTime)}
        <Clock className="w-3 h-3 opacity-70" />
      </Badge>
    </div>
  );
};
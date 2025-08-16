import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { useTransferDataStore } from '@/store/transferDataStore';

export const DataFreshnessIndicator: React.FC = () => {
  const { 
    teamTalkLastUpdated, 
    scoreInsideLastUpdated,
    teamTalkError,
    scoreInsideError,
    teamTalkLoading,
    scoreInsideLoading
  } = useTransferDataStore();

  const getTimeAgo = (date: Date | null): string => {
    if (!date) return 'Never';
    
    const now = Date.now();
    const diff = now - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getDataStatus = () => {
    const now = Date.now();
    const maxFreshAge = 60 * 60 * 1000; // 1 hour
    
    const teamTalkFresh = teamTalkLastUpdated && (now - teamTalkLastUpdated.getTime()) < maxFreshAge;
    const scoreInsideFresh = scoreInsideLastUpdated && (now - scoreInsideLastUpdated.getTime()) < maxFreshAge;
    
    if (teamTalkLoading || scoreInsideLoading) {
      return {
        status: 'loading',
        icon: <Clock className="w-3 h-3 animate-spin" />,
        color: 'bg-blue-500',
        text: 'Updating...'
      };
    }
    
    if (teamTalkError && scoreInsideError) {
      return {
        status: 'error',
        icon: <WifiOff className="w-3 h-3" />,
        color: 'bg-red-500',
        text: 'APIs Offline'
      };
    }
    
    if (teamTalkFresh || scoreInsideFresh) {
      return {
        status: 'fresh',
        icon: <Wifi className="w-3 h-3" />,
        color: 'bg-green-500',
        text: 'Live Data'
      };
    }
    
    return {
      status: 'stale',
      icon: <AlertTriangle className="w-3 h-3" />,
      color: 'bg-yellow-500',
      text: 'Stale Data'
    };
  };

  const status = getDataStatus();

  return (
    <div className="flex items-center gap-2 text-xs">
      <Badge className={`${status.color} text-white flex items-center gap-1`}>
        {status.icon}
        {status.text}
      </Badge>
      
      <div className="text-gray-500 flex items-center gap-3">
        <span title="TeamTalk API">
          TT: {getTimeAgo(teamTalkLastUpdated)}
          {teamTalkError && <span className="text-red-500"> ✗</span>}
        </span>
        <span title="ScoreInside API">
          SI: {getTimeAgo(scoreInsideLastUpdated)}
          {scoreInsideError && <span className="text-red-500"> ✗</span>}
        </span>
      </div>
    </div>
  );
};
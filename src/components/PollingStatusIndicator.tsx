import React from 'react';
import { Clock, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useTransferDataStore } from '@/store/transferDataStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface PollingStatusIndicatorProps {
  compact?: boolean;
}

export const PollingStatusIndicator: React.FC<PollingStatusIndicatorProps> = ({ 
  compact = false 
}) => {
  const { 
    isPollingEnabled, 
    pollingInterval, 
    lastUpdated,
    teamTalkLoading,
    scoreInsideLoading,
    teamTalkError,
    scoreInsideError,
    manualPollingRefresh
  } = useTransferDataStore();

  const isLoading = teamTalkLoading || scoreInsideLoading;
  const hasErrors = teamTalkError || scoreInsideError;

  const getStatusColor = () => {
    if (hasErrors) return 'bg-red-500';
    if (isLoading) return 'bg-yellow-500';
    if (isPollingEnabled) return 'bg-green-500';
    return 'bg-gray-500';
  };

  const getStatusText = () => {
    if (hasErrors) return 'Connection Error';
    if (isLoading) return 'Updating...';
    if (isPollingEnabled) return 'Live Updates Active';
    return 'Offline';
  };

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  const handleManualRefresh = async () => {
    try {
      await manualPollingRefresh();
      toast({
        title: "Refresh Complete",
        description: "Transfer data has been updated",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to update transfer data",
        variant: "destructive"
      });
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {formatLastUpdated(lastUpdated)}
        </span>
      </div>
    );
  }

  return (
    <Card className="p-3 bg-white/95 backdrop-blur-sm border-gray-200/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isPollingEnabled ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-gray-500" />
            )}
            <Badge variant={hasErrors ? "destructive" : isPollingEnabled ? "default" : "secondary"}>
              {getStatusText()}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Clock className="w-3 h-3" />
            Updated: {formatLastUpdated(lastUpdated)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isPollingEnabled && (
            <span className="text-xs text-gray-500">
              Auto-refresh: {pollingInterval}min
            </span>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {hasErrors && (
        <div className="mt-2 text-xs text-red-600">
          {teamTalkError && <div>TeamTalk: {teamTalkError}</div>}
          {scoreInsideError && <div>ScoreInside: {scoreInsideError}</div>}
        </div>
      )}
    </Card>
  );
};
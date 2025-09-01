import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { newsApi } from '@/services/newsApi';

interface StaleDataNotificationProps {
  onRefresh?: () => void;
}

export const StaleDataNotification: React.FC<StaleDataNotificationProps> = ({ onRefresh }) => {
  const [isStale, setIsStale] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkStaleData = () => {
      const stale = newsApi.isDataStale();
      const lastFetch = newsApi.getLastSuccessfulFetch();
      
      setIsStale(stale);
      setLastUpdate(lastFetch);
      
      // Reset dismissed state if data becomes fresh again
      if (!stale) {
        setDismissed(false);
      }
    };

    // Check immediately
    checkStaleData();

    // Check every minute
    const interval = setInterval(checkStaleData, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await newsApi.fetchNews(true); // Force refresh
      if (onRefresh) {
        onRefresh();
      }
      setDismissed(false); // Reset dismissed state after successful refresh
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  const formatLastUpdate = (date: Date | null): string => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours === 1) return '1 hour ago';
    return `${diffInHours} hours ago`;
  };

  if (!isStale || dismissed) {
    return null;
  }

  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex-1">
          <p className="text-amber-800 font-medium mb-1">
            News data may be outdated
          </p>
          <p className="text-amber-700 text-sm">
            Last updated: {formatLastUpdate(lastUpdate)}. Click refresh to get the latest transfer news.
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </>
            )}
          </Button>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

import { useState, useEffect } from 'react';

export const useRefreshControl = () => {
  const [refreshRate, setRefreshRate] = useState(300000); // 5 minutes default
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isAutoRefresh, setIsAutoRefresh] = useState(true); // Enable by default
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoRefresh) {
      interval = setInterval(() => {
        setLastUpdated(new Date());
        setRefreshCounter(prev => prev + 1);
        console.log('Auto-refreshing transfer data...');
        
        // Dispatch a custom event to notify other components
        window.dispatchEvent(new CustomEvent('autoRefresh'));
      }, refreshRate);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoRefresh, refreshRate]);

  const handleManualRefresh = () => {
    setLastUpdated(new Date());
    setRefreshCounter(prev => prev + 1);
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new CustomEvent('manualRefresh'));
  };

  return {
    refreshRate,
    setRefreshRate,
    lastUpdated,
    isAutoRefresh,
    setIsAutoRefresh,
    handleManualRefresh,
    refreshCounter
  };
};

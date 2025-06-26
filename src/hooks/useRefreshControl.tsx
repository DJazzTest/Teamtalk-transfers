
import { useState, useEffect } from 'react';

export const useRefreshControl = () => {
  const [refreshRate, setRefreshRate] = useState(300000); // 5 minutes default
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoRefresh) {
      interval = setInterval(() => {
        setLastUpdated(new Date());
        console.log('Auto-refreshing transfer data...');
      }, refreshRate);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoRefresh, refreshRate]);

  const handleManualRefresh = () => {
    setLastUpdated(new Date());
  };

  return {
    refreshRate,
    setRefreshRate,
    lastUpdated,
    isAutoRefresh,
    setIsAutoRefresh,
    handleManualRefresh
  };
};

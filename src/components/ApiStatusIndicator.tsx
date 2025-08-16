import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface ApiStatus {
  name: string;
  status: 'online' | 'offline' | 'checking';
  lastChecked: Date;
  responseTime?: number;
}

export const ApiStatusIndicator: React.FC = () => {
  const [apiStatuses, setApiStatuses] = useState<ApiStatus[]>([
    { name: 'TeamTalk Feed', status: 'checking', lastChecked: new Date() },
    { name: 'ScoreInside News', status: 'checking', lastChecked: new Date() },
    { name: 'ScoreInside Transfers', status: 'checking', lastChecked: new Date() }
  ]);

  const checkApiStatus = async (url: string, name: string): Promise<ApiStatus> => {
    const startTime = Date.now();
    
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TransferCentre/1.0'
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        name,
        status: response.ok ? 'online' : 'offline',
        lastChecked: new Date(),
        responseTime
      };
    } catch (error) {
      return {
        name,
        status: 'offline',
        lastChecked: new Date()
      };
    }
  };

  useEffect(() => {
    const checkAllApis = async () => {
      const urls = [
        { url: 'https://www.teamtalk.com/mobile-app-feed', name: 'TeamTalk Feed' },
        { 
          url: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ', 
          name: 'ScoreInside News' 
        },
        { 
          url: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ', 
          name: 'ScoreInside Transfers' 
        }
      ];

      const statusPromises = urls.map(({ url, name }) => checkApiStatus(url, name));
      const results = await Promise.all(statusPromises);
      setApiStatuses(results);
    };

    checkAllApis();
    
    // Check every 5 minutes
    const interval = setInterval(checkAllApis, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'offline':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  return (
    <Card className="p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3">API Status Monitor</h3>
      <div className="space-y-2">
        {apiStatuses.map((api) => (
          <div key={api.name} className="flex items-center justify-between p-2 rounded border">
            <div className="flex items-center gap-2">
              {getStatusIcon(api.status)}
              <span className="font-medium">{api.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(api.status)} text-white`}>
                {api.status.toUpperCase()}
              </Badge>
              {api.responseTime && (
                <span className="text-xs text-gray-500">
                  {api.responseTime}ms
                </span>
              )}
              <span className="text-xs text-gray-500">
                {api.lastChecked.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
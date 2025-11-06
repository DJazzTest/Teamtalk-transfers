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
  const [apiStatuses, setApiStatuses] = useState<ApiStatus[]>([]);

  const checkApiStatus = async (url: string, name: string): Promise<ApiStatus> => {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate, br',
          'User-Agent': 'TransferCentre/1.0'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      let isValidResponse = response.ok;
      if (response.ok) {
        try {
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            const data = await response.json();
            // Generic JSON presence check
            isValidResponse = Boolean(data);
            // If common list structures present, ensure non-empty
            const hasItems = Array.isArray((data as any)?.items) && (data as any).items.length > 0;
            const hasData = Array.isArray((data as any)?.result?.transfer_articles?.data) && (data as any).result.transfer_articles.data.length > 0;
            if ((data as any)?.items) isValidResponse = hasItems;
            if ((data as any)?.result?.transfer_articles) isValidResponse = hasData;
          }
        } catch {
          isValidResponse = false;
        }
      }
      
      return { name, status: isValidResponse ? 'online' : 'offline', lastChecked: new Date(), responseTime };
    } catch {
      return { name, status: 'offline', lastChecked: new Date() };
    }
  };

  useEffect(() => {
    const urls = [
      { url: 'https://www.teamtalk.com/transfer-news', name: 'TeamTalk Transfer News' },
      { url: 'https://stagingapi.tt-apis.com/api/transfer-window-countdown?tournament_id=72602', name: 'Window Countdown' },
      { url: 'https://stagingapi.tt-apis.com/api/transfers/rumour-teams?seasonYear=2025/26&seasonName=Summer&tournamentId=72602', name: 'Rumour Teams' },
      { url: 'https://stagingapi.tt-apis.com/api/transfers/top-transfers?seasonYear=2025/26&seasonName=Summer&tournamentId=72602', name: 'Top Transfers' },
      { url: 'https://stagingapi.tt-apis.com/api/transfers/done-deal-teams?seasonName=Summer&seasonYear=2025/26&tournamentId=72602', name: 'Done Deal Teams' },
      // A few representative team rumours endpoints (dedupe handled by map)
      { url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1205&page=1&tournamentId=72602', name: 'Rumours Team 1205' },
      { url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1215&page=1&tournamentId=72602', name: 'Rumours Team 1215' },
      { url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1124&page=1&tournamentId=72602', name: 'Rumours Team 1124' },
      { url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1276&page=1&tournamentId=72602', name: 'Rumours Team 1276' },
      { url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1125&page=1&tournamentId=72602', name: 'Rumours Team 1125' },
      { url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1126&page=1&tournamentId=72602', name: 'Rumours Team 1126' },
      { url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1317&page=1&tournamentId=72602', name: 'Rumours Team 1317' },
      { url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1367&page=1&tournamentId=72602', name: 'Rumours Team 1367' },
      { url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1408&page=1&tournamentId=72602', name: 'Rumours Team 1408' },
      { url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1431&page=1&tournamentId=72602', name: 'Rumours Team 1431' },
      { url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1132&page=1&tournamentId=72602', name: 'Rumours Team 1132' },
      { url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1548&page=1&tournamentId=72602', name: 'Rumours Team 1548' },
      { url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1571&page=1&tournamentId=72602', name: 'Rumours Team 1571' },
      { url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1599&page=1&tournamentId=72602', name: 'Rumours Team 1599' },
      { url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1136&page=1&tournamentId=72602', name: 'Rumours Team 1136' },
      { url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1748&page=1&tournamentId=72602', name: 'Rumours Team 1748' },
      { url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1779&page=1&tournamentId=72602', name: 'Rumours Team 1779' },
      { url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1811&page=1&tournamentId=72602', name: 'Rumours Team 1811' },
      { url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1837&page=1&tournamentId=72602', name: 'Rumours Team 1837' },
      // Transfer articles pages
      { url: 'https://stagingapi.tt-apis.com/api/transfer-articles?page=1&per_page=10', name: 'Articles p1' },
      { url: 'https://stagingapi.tt-apis.com/api/transfer-articles?page=2&per_page=20', name: 'Articles p2' },
      { url: 'https://stagingapi.tt-apis.com/api/transfer-articles?page=3&per_page=20', name: 'Articles p3' },
      { url: 'https://stagingapi.tt-apis.com/api/transfer-articles?page=4&per_page=20', name: 'Articles p4' },
      { url: 'https://stagingapi.tt-apis.com/api/transfer-articles?page=5&per_page=20', name: 'Articles p5' },
      { url: 'https://stagingapi.tt-apis.com/api/transfer-articles?page=6&per_page=20', name: 'Articles p6' },
      { url: 'https://stagingapi.tt-apis.com/api/transfer-articles?page=7&per_page=20', name: 'Articles p7' },
      { url: 'https://stagingapi.tt-apis.com/api/transfer-articles?page=8&per_page=20', name: 'Articles p8' },
      { url: 'https://stagingapi.tt-apis.com/api/transfer-articles?page=9&per_page=20', name: 'Articles p9' },
      { url: 'https://stagingapi.tt-apis.com/api/transfer-articles?page=10&per_page=20', name: 'Articles p10' }
    ];

    const checkAllApis = async () => {
      const statusPromises = urls.map(({ url, name }) => checkApiStatus(url, name));
      const results = await Promise.all(statusPromises);
      setApiStatuses(results);
    };

    checkAllApis();
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

  const hasBrokenApis = apiStatuses.some(s => s.status === 'offline');
  const brokenList = apiStatuses.filter(s => s.status === 'offline').map(s => s.name);

  return (
    <Card className="p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3">API Status Monitor</h3>

      {hasBrokenApis && (
        <div className="mb-3 p-3 rounded border border-red-300 bg-red-50 text-red-700 text-sm">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4" />
            One or more APIs are broken. Investigate.
          </div>
          <div className="mt-1">Affected: {brokenList.join(', ')}</div>
        </div>
      )}

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
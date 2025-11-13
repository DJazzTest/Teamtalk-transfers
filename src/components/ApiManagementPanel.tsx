import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, Trash2, Edit, Plus, TestTube, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ApiEndpoint {
  id: string;
  name: string;
  url: string;
  description: string;
  status: 'online' | 'offline' | 'checking' | 'untested';
  lastChecked?: Date;
  responseTime?: number;
  error?: string;
  responseData?: any;
  hasData?: boolean;
  dataCount?: number;
}

// Team ID to Team Name mapping (from API responses)
const TEAM_ID_MAP: Record<string, string> = {
  '1124': 'Bournemouth',
  '1125': 'Brighton & Hove Albion',
  '1126': 'Burnley',
  '1132': 'Leeds United',
  '1136': 'Nottingham Forest',
  '1143': 'Manchester United',
  '1205': 'Arsenal',
  '1215': 'Aston Villa',
  '1276': 'Brentford',
  '1317': 'Chelsea',
  '1367': 'Crystal Palace',
  '1408': 'Everton',
  '1431': 'Fulham',
  '1548': 'Liverpool',
  '1571': 'Manchester City',
  '1599': 'Newcastle United',
  '1748': 'Sunderland',
  '1779': 'Tottenham Hotspur',
  '1811': 'West Ham United',
  '1837': 'Wolverhampton Wanderers'
};

// Helper to extract team name from URL
const getTeamNameFromUrl = (url: string): string | null => {
  const match = url.match(/team_id=(\d+)/);
  if (match && TEAM_ID_MAP[match[1]]) {
    return TEAM_ID_MAP[match[1]];
  }
  return null;
};

// Helper to get API type from URL
const getApiType = (url: string): string => {
  if (url.includes('countdown')) return 'Countdown';
  if (url.includes('rumour-teams')) return 'Rumour Teams';
  if (url.includes('top-transfers')) return 'Top Transfers';
  if (url.includes('done-deal-teams')) return 'Done Deal Teams';
  if (url.includes('get-rumours')) return 'Rumours';
  if (url.includes('get-done-deals-by-team')) return 'Done Deals';
  return 'Other';
};

const DEFAULT_APIS: ApiEndpoint[] = [
  // Global APIs
  {
    id: 'tt-countdown',
    name: 'Transfer Window Countdown',
    url: 'https://stagingapi.tt-apis.com/api/transfer-window-countdown?tournament_id=72602',
    description: 'Transfer window countdown timer',
    status: 'untested'
  },
  {
    id: 'tt-rumour-teams',
    name: 'Rumour Teams',
    url: 'https://stagingapi.tt-apis.com/api/transfers/rumour-teams?seasonYear=2025/26&seasonName=Summer&tournamentId=72602',
    description: 'All teams with transfer rumours',
    status: 'untested'
  },
  {
    id: 'tt-top-transfers',
    name: 'Top Transfers',
    url: 'https://stagingapi.tt-apis.com/api/transfers/top-transfers?seasonYear=2025/26&seasonName=Summer&tournamentId=72602',
    description: 'Top transfer deals across all teams',
    status: 'untested'
  },
  {
    id: 'tt-done-deal-teams',
    name: 'Done Deal Teams',
    url: 'https://stagingapi.tt-apis.com/api/transfers/done-deal-teams?seasonName=Summer&seasonYear=2025/26&tournamentId=72602',
    description: 'All teams with confirmed done deals',
    status: 'untested'
  },
  // Team-specific Rumours APIs
  {
    id: 'tt-rumours-arsenal',
    name: 'Arsenal - Rumours',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1205&page=1&tournamentId=72602',
    description: 'Arsenal transfer rumours',
    status: 'untested'
  },
  {
    id: 'tt-rumours-aston-villa',
    name: 'Aston Villa - Rumours',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1215&page=1&tournamentId=72602',
    description: 'Aston Villa transfer rumours',
    status: 'untested'
  },
  {
    id: 'tt-rumours-bournemouth',
    name: 'Bournemouth - Rumours',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1124&page=1&tournamentId=72602',
    description: 'Bournemouth transfer rumours',
    status: 'untested'
  },
  {
    id: 'tt-rumours-brentford',
    name: 'Brentford - Rumours',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1276&page=1&tournamentId=72602',
    description: 'Brentford transfer rumours',
    status: 'untested'
  },
  {
    id: 'tt-rumours-brighton',
    name: 'Brighton - Rumours',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1125&page=1&tournamentId=72602',
    description: 'Brighton transfer rumours',
    status: 'untested'
  },
  {
    id: 'tt-rumours-burnley',
    name: 'Burnley - Rumours',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1126&page=1&tournamentId=72602',
    description: 'Burnley transfer rumours',
    status: 'untested'
  },
  {
    id: 'tt-rumours-chelsea',
    name: 'Chelsea - Rumours',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1317&page=1&tournamentId=72602',
    description: 'Chelsea transfer rumours',
    status: 'untested'
  },
  {
    id: 'tt-rumours-crystal-palace',
    name: 'Crystal Palace - Rumours',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1367&page=1&tournamentId=72602',
    description: 'Crystal Palace transfer rumours',
    status: 'untested'
  },
  {
    id: 'tt-rumours-everton',
    name: 'Everton - Rumours',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1408&page=1&tournamentId=72602',
    description: 'Everton transfer rumours',
    status: 'untested'
  },
  {
    id: 'tt-rumours-fulham',
    name: 'Fulham - Rumours',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1431&page=1&tournamentId=72602',
    description: 'Fulham transfer rumours',
    status: 'untested'
  },
  {
    id: 'tt-rumours-leeds',
    name: 'Leeds United - Rumours',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1132&page=1&tournamentId=72602',
    description: 'Leeds United transfer rumours',
    status: 'untested'
  },
  {
    id: 'tt-rumours-liverpool',
    name: 'Liverpool - Rumours',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1548&page=1&tournamentId=72602',
    description: 'Liverpool transfer rumours',
    status: 'untested'
  },
  {
    id: 'tt-rumours-man-city',
    name: 'Manchester City - Rumours',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1571&page=1&tournamentId=72602',
    description: 'Manchester City transfer rumours',
    status: 'untested'
  },
  {
    id: 'tt-rumours-man-utd',
    name: 'Manchester United - Rumours',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1143&page=1&tournamentId=72602',
    description: 'Manchester United transfer rumours',
    status: 'untested'
  },
  {
    id: 'tt-rumours-newcastle',
    name: 'Newcastle United - Rumours',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1599&page=1&tournamentId=72602',
    description: 'Newcastle United transfer rumours',
    status: 'untested'
  },
  {
    id: 'tt-rumours-nottingham-forest',
    name: 'Nottingham Forest - Rumours',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1136&page=1&tournamentId=72602',
    description: 'Nottingham Forest transfer rumours',
    status: 'untested'
  },
  {
    id: 'tt-rumours-sunderland',
    name: 'Sunderland - Rumours',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1748&page=1&tournamentId=72602',
    description: 'Sunderland transfer rumours',
    status: 'untested'
  },
  {
    id: 'tt-rumours-tottenham',
    name: 'Tottenham Hotspur - Rumours',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1779&page=1&tournamentId=72602',
    description: 'Tottenham Hotspur transfer rumours',
    status: 'untested'
  },
  {
    id: 'tt-rumours-west-ham',
    name: 'West Ham United - Rumours',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1811&page=1&tournamentId=72602',
    description: 'West Ham United transfer rumours',
    status: 'untested'
  },
  {
    id: 'tt-rumours-wolves',
    name: 'Wolverhampton Wanderers - Rumours',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1837&page=1&tournamentId=72602',
    description: 'Wolverhampton Wanderers transfer rumours',
    status: 'untested'
  },
  // Team-specific Done Deals APIs
  {
    id: 'tt-done-deals-arsenal',
    name: 'Arsenal - Done Deals',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1205',
    description: 'Arsenal confirmed transfers',
    status: 'untested'
  },
  {
    id: 'tt-done-deals-aston-villa',
    name: 'Aston Villa - Done Deals',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1215',
    description: 'Aston Villa confirmed transfers',
    status: 'untested'
  },
  {
    id: 'tt-done-deals-bournemouth',
    name: 'Bournemouth - Done Deals',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1124',
    description: 'Bournemouth confirmed transfers',
    status: 'untested'
  },
  {
    id: 'tt-done-deals-brentford',
    name: 'Brentford - Done Deals',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1276',
    description: 'Brentford confirmed transfers',
    status: 'untested'
  },
  {
    id: 'tt-done-deals-brighton',
    name: 'Brighton - Done Deals',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1125',
    description: 'Brighton confirmed transfers',
    status: 'untested'
  },
  {
    id: 'tt-done-deals-burnley',
    name: 'Burnley - Done Deals',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1126',
    description: 'Burnley confirmed transfers',
    status: 'untested'
  },
  {
    id: 'tt-done-deals-chelsea',
    name: 'Chelsea - Done Deals',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1317',
    description: 'Chelsea confirmed transfers',
    status: 'untested'
  },
  {
    id: 'tt-done-deals-crystal-palace',
    name: 'Crystal Palace - Done Deals',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1367',
    description: 'Crystal Palace confirmed transfers',
    status: 'untested'
  },
  {
    id: 'tt-done-deals-everton',
    name: 'Everton - Done Deals',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1408',
    description: 'Everton confirmed transfers',
    status: 'untested'
  },
  {
    id: 'tt-done-deals-fulham',
    name: 'Fulham - Done Deals',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1431',
    description: 'Fulham confirmed transfers',
    status: 'untested'
  },
  {
    id: 'tt-done-deals-leeds',
    name: 'Leeds United - Done Deals',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1132',
    description: 'Leeds United confirmed transfers',
    status: 'untested'
  },
  {
    id: 'tt-done-deals-liverpool',
    name: 'Liverpool - Done Deals',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1548',
    description: 'Liverpool confirmed transfers',
    status: 'untested'
  },
  {
    id: 'tt-done-deals-man-city',
    name: 'Manchester City - Done Deals',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1571',
    description: 'Manchester City confirmed transfers',
    status: 'untested'
  },
  {
    id: 'tt-done-deals-man-utd',
    name: 'Manchester United - Done Deals',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1143',
    description: 'Manchester United confirmed transfers',
    status: 'untested'
  },
  {
    id: 'tt-done-deals-newcastle',
    name: 'Newcastle United - Done Deals',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1599',
    description: 'Newcastle United confirmed transfers',
    status: 'untested'
  },
  {
    id: 'tt-done-deals-nottingham-forest',
    name: 'Nottingham Forest - Done Deals',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1136',
    description: 'Nottingham Forest confirmed transfers',
    status: 'untested'
  },
  {
    id: 'tt-done-deals-sunderland',
    name: 'Sunderland - Done Deals',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1748',
    description: 'Sunderland confirmed transfers',
    status: 'untested'
  },
  {
    id: 'tt-done-deals-tottenham',
    name: 'Tottenham Hotspur - Done Deals',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1779',
    description: 'Tottenham Hotspur confirmed transfers',
    status: 'untested'
  },
  {
    id: 'tt-done-deals-west-ham',
    name: 'West Ham United - Done Deals',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1811',
    description: 'West Ham United confirmed transfers',
    status: 'untested'
  },
  {
    id: 'tt-done-deals-wolves',
    name: 'Wolverhampton Wanderers - Done Deals',
    url: 'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1837',
    description: 'Wolverhampton Wanderers confirmed transfers',
    status: 'untested'
  }
];

const STORAGE_KEY = 'api_endpoints';

const deserializeApi = (raw: any): ApiEndpoint | null => {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    url: String(raw.url ?? ''),
    description: String(raw.description ?? ''),
    status: (raw.status === 'online' || raw.status === 'offline' || raw.status === 'checking' || raw.status === 'untested')
      ? raw.status
      : 'untested',
    lastChecked: raw.lastChecked ? new Date(raw.lastChecked) : undefined,
    responseTime: typeof raw.responseTime === 'number' ? raw.responseTime : undefined,
    error: raw.error ? String(raw.error) : undefined,
    responseData: raw.responseData,
    hasData: typeof raw.hasData === 'boolean' ? raw.hasData : undefined,
    dataCount: typeof raw.dataCount === 'number' ? raw.dataCount : undefined,
  };
};

export const ApiManagementPanel: React.FC = () => {
  const [apis, setApis] = useState<ApiEndpoint[]>(DEFAULT_APIS);
  const [editingApi, setEditingApi] = useState<ApiEndpoint | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [testingApis, setTestingApis] = useState<Set<string>>(new Set());
  const [viewingResponse, setViewingResponse] = useState<ApiEndpoint | null>(null);
  const { toast } = useToast();

  // Form state
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const normalized = parsed
            .map(deserializeApi)
            .filter((api): api is ApiEndpoint => !!api);

          if (normalized.length > 0) {
            setApis(normalized);
            return;
          }
        }
        setApis(DEFAULT_APIS);
      } catch {
        setApis(DEFAULT_APIS);
      }
    }
  }, []);

  const saveApis = (newApis: ApiEndpoint[]) => {
    setApis(newApis);
    const serializable = newApis.map(api => ({
      ...api,
      lastChecked: api.lastChecked ? api.lastChecked.toISOString() : undefined,
      // Only save responseData if it's not too large (to avoid localStorage limits)
      responseData: api.responseData && JSON.stringify(api.responseData).length < 50000 ? api.responseData : undefined,
      hasData: api.hasData,
      dataCount: api.dataCount
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  };

  const testApiEndpoint = async (api: ApiEndpoint): Promise<ApiEndpoint> => {
    const startTime = Date.now();
    
    try {
      // Try different approaches for different API types
      let response: Response;
      let useCorsProxy = false;
      
      if (api.url.includes('teamtalk.com')) {
        // TeamTalk API works with CORS, try direct first
        try {
          response = await fetch(api.url, {
            method: 'GET',
            mode: 'cors',
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache'
            },
            cache: 'no-store'
          });
          // Check if response is ok before proceeding
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (corsError) {
          // If CORS fails or response not ok, try with proxy (like the service does)
          useCorsProxy = true;
          const proxyUrl = `https://cors.isomorphic-git.org/${api.url}`;
          response = await fetch(proxyUrl, {
            method: 'GET',
            mode: 'cors',
            headers: {
              'Accept': 'application/json'
            }
          });
        }
      } else {
        // Other APIs with standard approach
        response = await fetch(api.url, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'TransferCentre/1.0'
          }
        });
      }
      
      const responseTime = Date.now() - startTime;
      
      if (!response.ok) {
        return {
          ...api,
          status: 'offline',
          lastChecked: new Date(),
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
      
      // Try to read and parse the response to verify it's valid
      try {
        const text = await response.text();
        
        if (!text || text.length === 0) {
          return {
            ...api,
            status: 'offline',
            lastChecked: new Date(),
            responseTime,
            error: 'Empty response received'
          };
        }
        
        // Try to parse as JSON to verify it's valid
        try {
          const json = JSON.parse(text);
          
          // Check if API has actual data (not just empty arrays/objects)
          let hasData = false;
          let dataCount = 0;
          
          // Check various response structures
          if (json.result) {
            if (Array.isArray(json.result.top_transfers) && json.result.top_transfers.length > 0) {
              hasData = true;
              dataCount = json.result.top_transfers.length;
            } else if (Array.isArray(json.result.done_deals) && json.result.done_deals.length > 0) {
              hasData = true;
              dataCount = json.result.done_deals.length;
            } else if (Array.isArray(json.result.transfer_articles?.data) && json.result.transfer_articles.data.length > 0) {
              hasData = true;
              dataCount = json.result.transfer_articles.data.length;
            } else if (json.result && Object.keys(json.result).length > 0 && !json.message?.includes('not found') && !json.message?.includes('No favorite')) {
              // Check if result has any non-empty data
              const resultKeys = Object.keys(json.result);
              for (const key of resultKeys) {
                const value = json.result[key];
                if (Array.isArray(value) && value.length > 0) {
                  hasData = true;
                  dataCount += value.length;
                } else if (value && typeof value === 'object' && Object.keys(value).length > 0) {
                  hasData = true;
                }
              }
            }
          } else if (Array.isArray(json.items) && json.items.length > 0) {
            hasData = true;
            dataCount = json.items.length;
          } else if (Array.isArray(json) && json.length > 0) {
            hasData = true;
            dataCount = json.length;
          }
          
          // For TeamTalk API, check for expected structure
          if (api.url.includes('teamtalk.com')) {
            const isValid = json.status === 200 && json.message === 'success' && Array.isArray(json.items) && json.items.length > 0;
            return {
              ...api,
              status: isValid ? 'online' : 'offline',
              lastChecked: new Date(),
              responseTime,
              responseData: json,
              hasData: isValid,
              dataCount: json.items?.length || 0,
              error: isValid ? undefined : `Unexpected response structure. Expected status: 200, message: success, items array. Got: ${JSON.stringify({ status: json.status, message: json.message, hasItems: Array.isArray(json.items), itemCount: json.items?.length || 0 })}`
            };
          }
          
          // Check if API returned empty data
          const isEmpty = json.message?.includes('not found') || 
                         json.message?.includes('No favorite') ||
                         (!hasData && (json.status === 200 || json.status === 'success'));
          
          return {
            ...api,
            status: isEmpty ? 'offline' : 'online',
            lastChecked: new Date(),
            responseTime,
            responseData: json,
            hasData,
            dataCount,
            error: isEmpty ? (json.message || 'API returned empty data') : undefined
          };
        } catch (parseError) {
          // Not JSON, but has content - might be HTML or other format
          return {
            ...api,
            status: 'online',
            lastChecked: new Date(),
            responseTime,
            error: useCorsProxy ? 'Response received (via proxy) but not JSON format' : undefined
          };
        }
      } catch (readError) {
        // Can't read response (CORS issue)
        return {
          ...api,
          status: 'offline',
          lastChecked: new Date(),
          responseTime,
          error: 'Cannot read response. CORS policy may be blocking access. API may still be working.'
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const responseTime = Date.now() - startTime;
      
      // Provide more specific error messages
      let detailedError = errorMessage;
      if (errorMessage.includes('CORS') || errorMessage.includes('cors')) {
        detailedError = 'CORS policy blocks this request. API may still be working but inaccessible from browser.';
      } else if (errorMessage.includes('Failed to fetch')) {
        detailedError = 'Network error or API is down. Check URL and network connectivity.';
      }
      
      return {
        ...api,
        status: 'offline',
        lastChecked: new Date(),
        responseTime,
        error: detailedError
      };
    }
  };

  const handleTestApi = async (apiId: string) => {
    setTestingApis(prev => new Set(prev).add(apiId));
    
    const api = apis.find(a => a.id === apiId);
    if (!api) return;

    const updatedApi = await testApiEndpoint(api);
    
    const newApis = apis.map(a => a.id === apiId ? updatedApi : a);
    saveApis(newApis);
    
    setTestingApis(prev => {
      const next = new Set(prev);
      next.delete(apiId);
      return next;
    });

    toast({
      title: `API Test Result`,
      description: `${api.name}: ${updatedApi.status === 'online' ? 'Online' : 'Offline'}`,
      variant: updatedApi.status === 'online' ? 'default' : 'destructive'
    });
  };

  const handleTestAllApis = async () => {
    toast({
      title: "Testing all APIs",
      description: "This may take a few moments..."
    });

    const testPromises = apis.map(api => testApiEndpoint(api));
    const results = await Promise.all(testPromises);
    saveApis(results);

    const onlineCount = results.filter(api => api.status === 'online').length;
    toast({
      title: "API Tests Complete",
      description: `${onlineCount} of ${apis.length} APIs are online`
    });
  };

  const handleAddApi = () => {
    if (!name.trim() || !url.trim()) {
      toast({
        title: "Missing required fields",
        description: "Name and URL are required",
        variant: "destructive"
      });
      return;
    }

    const newApi: ApiEndpoint = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      url: url.trim(),
      description: description.trim(),
      status: 'untested'
    };

    saveApis([...apis, newApi]);
    setName('');
    setUrl('');
    setDescription('');
    setIsAddDialogOpen(false);

    toast({
      title: "API Added",
      description: `${newApi.name} has been added successfully`
    });
  };

  const handleEditApi = () => {
    if (!editingApi || !name.trim() || !url.trim()) return;

    const updatedApi: ApiEndpoint = {
      ...editingApi,
      name: name.trim(),
      url: url.trim(),
      description: description.trim(),
      status: 'untested' // Reset status when edited
    };

    const newApis = apis.map(api => api.id === editingApi.id ? updatedApi : api);
    saveApis(newApis);
    
    setEditingApi(null);
    setName('');
    setUrl('');
    setDescription('');

    toast({
      title: "API Updated",
      description: `${updatedApi.name} has been updated successfully`
    });
  };

  const handleRemoveApi = (apiId: string) => {
    const api = apis.find(a => a.id === apiId);
    if (!api) return;

    const newApis = apis.filter(a => a.id !== apiId);
    saveApis(newApis);

    toast({
      title: "API Removed",
      description: `${api.name} has been removed`
    });
  };

  const openEditDialog = (api: ApiEndpoint) => {
    setEditingApi(api);
    setName(api.name);
    setUrl(api.url);
    setDescription(api.description);
  };

  const getStatusIcon = (status: string, isLoading: boolean) => {
    if (isLoading) return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
    
    switch (status) {
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'offline':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-red-500';
      case 'untested':
        return 'bg-gray-500';
      default:
        return 'bg-yellow-500';
    }
  };

  // Group APIs by type for better organization
  const groupedApis = {
    global: apis.filter(api => ['Countdown', 'Rumour Teams', 'Top Transfers', 'Done Deal Teams'].includes(getApiType(api.url))),
    rumours: apis.filter(api => getApiType(api.url) === 'Rumours'),
    doneDeals: apis.filter(api => getApiType(api.url) === 'Done Deals')
  };

  const renderApiCard = (api: ApiEndpoint, isLoading: boolean) => {
    return (
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(api.status, isLoading)}
            <h4 className="font-semibold">{api.name}</h4>
            <Badge className={`${getStatusColor(api.status)} text-white text-xs`}>
              {isLoading ? 'Testing...' : api.status.toUpperCase()}
            </Badge>
          </div>
          
          <div className="text-sm text-gray-600 mb-2 break-all">
            {api.url}
          </div>
          
          {api.description && (
            <div className="text-sm text-gray-500 mb-2">
              {api.description}
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
            {getTeamNameFromUrl(api.url) && (
              <Badge variant="outline" className="text-xs">
                Club: {getTeamNameFromUrl(api.url)}
              </Badge>
            )}
            {getApiType(api.url) !== 'Other' && (
              <Badge variant="outline" className="text-xs">
                Type: {getApiType(api.url)}
              </Badge>
            )}
            {api.lastChecked && (
              <span>Last checked: {api.lastChecked.toLocaleTimeString()}</span>
            )}
            {api.responseTime && (
              <span>Response: {api.responseTime}ms</span>
            )}
            {api.hasData !== undefined && (
              <span className={`font-semibold ${api.hasData ? 'text-green-600' : 'text-orange-600'}`}>
                {api.hasData ? `✓ Has Data (${api.dataCount || 0} items)` : '✗ No Data'}
              </span>
            )}
          </div>

          {api.error && (
            <div className="text-xs text-red-500 mt-2 p-2 bg-red-50 rounded">
              Error: {api.error}
            </div>
          )}

          {api.responseData && (
            <div className="mt-2">
              <Button
                onClick={() => setViewingResponse(api)}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <Eye className="w-3 h-3 mr-1" />
                View Response Data
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          <Button
            onClick={() => handleTestApi(api.id)}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <TestTube className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={() => openEditDialog(api)}
            variant="outline"
            size="sm"
          >
            <Edit className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={() => handleRemoveApi(api.id)}
            variant="outline"
            size="sm"
            className="text-red-500 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold">API Management</h3>
          <p className="text-sm text-gray-500 mt-1">Staging APIs - All expired ScoreInside APIs have been replaced</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleTestAllApis} variant="outline" size="sm">
            <TestTube className="w-4 h-4 mr-2" />
            Test All APIs
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add API
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New API Endpoint</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="API Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <Input
                  placeholder="API URL"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                />
                <Input
                  placeholder="Description (optional)"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
                <Button onClick={handleAddApi} className="w-full">
                  Add API
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-6">
        {/* Global APIs */}
        {groupedApis.global.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Global APIs</h4>
            <div className="space-y-4">
              {groupedApis.global.map((api) => {
                const isLoading = testingApis.has(api.id);
                
                return (
                  <div key={api.id} className="border rounded-lg p-4">
                    {renderApiCard(api, isLoading)}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Team Rumours APIs */}
        {groupedApis.rumours.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Team Rumours APIs</h4>
            <div className="space-y-4">
              {groupedApis.rumours.map((api) => {
                const isLoading = testingApis.has(api.id);
                
                return (
                  <div key={api.id} className="border rounded-lg p-4">
                    {renderApiCard(api, isLoading)}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Team Done Deals APIs */}
        {groupedApis.doneDeals.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Team Done Deals APIs</h4>
            <div className="space-y-4">
              {groupedApis.doneDeals.map((api) => {
                const isLoading = testingApis.has(api.id);
                
                return (
                  <div key={api.id} className="border rounded-lg p-4">
                    {renderApiCard(api, isLoading)}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Fallback for any other APIs */}
        {apis.filter(api => !groupedApis.global.includes(api) && !groupedApis.rumours.includes(api) && !groupedApis.doneDeals.includes(api)).length > 0 && (
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Other APIs</h4>
            <div className="space-y-4">
              {apis.filter(api => !groupedApis.global.includes(api) && !groupedApis.rumours.includes(api) && !groupedApis.doneDeals.includes(api)).map((api) => {
                const isLoading = testingApis.has(api.id);
                
                return (
                  <div key={api.id} className="border rounded-lg p-4">
                    {renderApiCard(api, isLoading)}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingApi} onOpenChange={() => setEditingApi(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit API Endpoint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="API Name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <Input
              placeholder="API URL"
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
            <Input
              placeholder="Description (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <Button onClick={handleEditApi} className="w-full">
              Update API
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Response Viewer Dialog */}
      <Dialog open={!!viewingResponse} onOpenChange={(open) => !open && setViewingResponse(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>API Response Data - {viewingResponse?.name}</DialogTitle>
          </DialogHeader>
          {viewingResponse && (
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">URL:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 break-all">{viewingResponse.url}</p>
                </div>
                
                {viewingResponse.hasData !== undefined && (
                  <div>
                    <h4 className="font-semibold mb-2">Data Status:</h4>
                    <Badge className={viewingResponse.hasData ? 'bg-green-500' : 'bg-orange-500'}>
                      {viewingResponse.hasData ? `Has Data (${viewingResponse.dataCount || 0} items)` : 'No Data'}
                    </Badge>
                  </div>
                )}

                {viewingResponse.error && (
                  <div>
                    <h4 className="font-semibold mb-2 text-red-600">Error:</h4>
                    <p className="text-sm text-red-600">{viewingResponse.error}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2">Response:</h4>
                  <pre className="text-xs bg-gray-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(viewingResponse.responseData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
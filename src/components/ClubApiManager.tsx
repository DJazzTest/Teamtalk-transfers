import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Trash2, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Globe,
  Database,
  Settings,
  Users,
  Shield
} from 'lucide-react';
import { TEAM_API_CONFIGS } from '@/types/scoreinside';

interface ApiEndpoint {
  id: string;
  name: string;
  url: string;
  provider: 'ScoreInside' | 'TeamTalk' | 'Custom';
  team?: string;
  status: 'active' | 'inactive' | 'error';
  lastTested?: Date;
  responseTime?: number;
  staleRumors?: number;
  lastDataRefresh?: Date;
}

const ClubApiManager: React.FC = () => {
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([]);
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [refreshingAll, setRefreshingAll] = useState(false);
  const [failedApis, setFailedApis] = useState<Array<{club: string, error: string}>>([]);

  // Initialize with team-specific APIs using new FCM token
  useEffect(() => {
    const newFcmToken = 'ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ';
    
    const teamApis: ApiEndpoint[] = [
      // Arsenal
      {
        id: 'arsenal-transfers',
        name: 'Arsenal - Transfers',
        url: `https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Arsenal',
        status: 'active' as const,
        lastTested: new Date()
      },
      {
        id: 'arsenal-news',
        name: 'Arsenal - News',
        url: `https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Arsenal',
        status: 'active' as const,
        lastTested: new Date()
      },
      // Aston Villa
      {
        id: 'aston-villa-transfers',
        name: 'Aston Villa - Transfers',
        url: `https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Aston Villa',
        status: 'active' as const,
        lastTested: new Date()
      },
      {
        id: 'aston-villa-news',
        name: 'Aston Villa - News',
        url: `https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Aston Villa',
        status: 'active' as const,
        lastTested: new Date()
      },
      // Bournemouth
      {
        id: 'bournemouth-transfers',
        name: 'Bournemouth - Transfers',
        url: `https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Bournemouth',
        status: 'active' as const,
        lastTested: new Date()
      },
      {
        id: 'bournemouth-news',
        name: 'Bournemouth - News',
        url: `https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Bournemouth',
        status: 'active' as const,
        lastTested: new Date()
      },
      // Brentford
      {
        id: 'brentford-transfers',
        name: 'Brentford - Transfers',
        url: `https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Brentford',
        status: 'active' as const,
        lastTested: new Date()
      },
      {
        id: 'brentford-news',
        name: 'Brentford - News',
        url: `https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Brentford',
        status: 'active' as const,
        lastTested: new Date()
      },
      // Brighton & Hove Albion
      {
        id: 'brighton-transfers',
        name: 'Brighton & Hove Albion - Transfers',
        url: `https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Brighton & Hove Albion',
        status: 'active' as const,
        lastTested: new Date()
      },
      {
        id: 'brighton-news',
        name: 'Brighton & Hove Albion - News',
        url: `https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Brighton & Hove Albion',
        status: 'active' as const,
        lastTested: new Date()
      },
      // Burnley
      {
        id: 'burnley-transfers',
        name: 'Burnley - Transfers',
        url: `https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Burnley',
        status: 'active' as const,
        lastTested: new Date()
      },
      {
        id: 'burnley-news',
        name: 'Burnley - News',
        url: `https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Burnley',
        status: 'active' as const,
        lastTested: new Date()
      },
      // Chelsea
      {
        id: 'chelsea-transfers',
        name: 'Chelsea - Transfers',
        url: `https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Chelsea',
        status: 'active' as const,
        lastTested: new Date()
      },
      {
        id: 'chelsea-news',
        name: 'Chelsea - News',
        url: `https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Chelsea',
        status: 'active' as const,
        lastTested: new Date()
      },
      // Crystal Palace
      {
        id: 'crystal-palace-transfers',
        name: 'Crystal Palace - Transfers',
        url: `https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Crystal Palace',
        status: 'active' as const,
        lastTested: new Date()
      },
      {
        id: 'crystal-palace-news',
        name: 'Crystal Palace - News',
        url: `https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Crystal Palace',
        status: 'active' as const,
        lastTested: new Date()
      },
      // Everton
      {
        id: 'everton-transfers',
        name: 'Everton - Transfers',
        url: `https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Everton',
        status: 'active' as const,
        lastTested: new Date()
      },
      {
        id: 'everton-news',
        name: 'Everton - News',
        url: `https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Everton',
        status: 'active' as const,
        lastTested: new Date()
      },
      // Fulham
      {
        id: 'fulham-transfers',
        name: 'Fulham - Transfers',
        url: `https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Fulham',
        status: 'active' as const,
        lastTested: new Date()
      },
      {
        id: 'fulham-news',
        name: 'Fulham - News',
        url: `https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Fulham',
        status: 'active' as const,
        lastTested: new Date()
      },
      // Leeds
      {
        id: 'leeds-transfers',
        name: 'Leeds - Transfers',
        url: `https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Leeds',
        status: 'active' as const,
        lastTested: new Date()
      },
      {
        id: 'leeds-news',
        name: 'Leeds - News',
        url: `https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Leeds',
        status: 'active' as const,
        lastTested: new Date()
      },
      // Liverpool
      {
        id: 'liverpool-transfers',
        name: 'Liverpool - Transfers',
        url: `https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Liverpool',
        status: 'active' as const,
        lastTested: new Date()
      },
      {
        id: 'liverpool-news',
        name: 'Liverpool - News',
        url: `https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Liverpool',
        status: 'active' as const,
        lastTested: new Date()
      },
      // Manchester City
      {
        id: 'manchester-city-transfers',
        name: 'Manchester City - Transfers',
        url: `https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Manchester City',
        status: 'active' as const,
        lastTested: new Date()
      },
      {
        id: 'manchester-city-news',
        name: 'Manchester City - News',
        url: `https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Manchester City',
        status: 'active' as const,
        lastTested: new Date()
      },
      // Manchester United
      {
        id: 'manchester-united-transfers',
        name: 'Manchester United - Transfers',
        url: `https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Manchester United',
        status: 'active' as const,
        lastTested: new Date()
      },
      {
        id: 'manchester-united-news',
        name: 'Manchester United - News',
        url: `https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Manchester United',
        status: 'active' as const,
        lastTested: new Date()
      },
      // Newcastle
      {
        id: 'newcastle-transfers',
        name: 'Newcastle - Transfers',
        url: `https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Newcastle',
        status: 'active' as const,
        lastTested: new Date()
      },
      {
        id: 'newcastle-news',
        name: 'Newcastle - News',
        url: `https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Newcastle',
        status: 'active' as const,
        lastTested: new Date()
      },
      // Nottingham Forest
      {
        id: 'nottingham-forest-transfers',
        name: 'Nottingham Forest - Transfers',
        url: `https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Nottingham Forest',
        status: 'active' as const,
        lastTested: new Date()
      },
      {
        id: 'nottingham-forest-news',
        name: 'Nottingham Forest - News',
        url: `https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Nottingham Forest',
        status: 'active' as const,
        lastTested: new Date()
      },
      // Sunderland
      {
        id: 'sunderland-transfers',
        name: 'Sunderland - Transfers',
        url: `https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Sunderland',
        status: 'active' as const,
        lastTested: new Date()
      },
      {
        id: 'sunderland-news',
        name: 'Sunderland - News',
        url: `https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Sunderland',
        status: 'active' as const,
        lastTested: new Date()
      },
      // Tottenham Hotspur
      {
        id: 'tottenham-transfers',
        name: 'Tottenham Hotspur - Transfers',
        url: `https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Tottenham Hotspur',
        status: 'active' as const,
        lastTested: new Date()
      },
      {
        id: 'tottenham-news',
        name: 'Tottenham Hotspur - News',
        url: `https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Tottenham Hotspur',
        status: 'active' as const,
        lastTested: new Date()
      },
      // West Ham United
      {
        id: 'west-ham-transfers',
        name: 'West Ham United - Transfers',
        url: `https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'West Ham United',
        status: 'active' as const,
        lastTested: new Date()
      },
      {
        id: 'west-ham-news',
        name: 'West Ham United - News',
        url: `https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'West Ham United',
        status: 'active' as const,
        lastTested: new Date()
      },
      // Wolverhampton Wanderers
      {
        id: 'wolverhampton-transfers',
        name: 'Wolverhampton Wanderers - Transfers',
        url: `https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Wolverhampton Wanderers',
        status: 'active' as const,
        lastTested: new Date()
      },
      {
        id: 'wolverhampton-news',
        name: 'Wolverhampton Wanderers - News',
        url: `https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=${newFcmToken}`,
        provider: 'ScoreInside',
        team: 'Wolverhampton Wanderers',
        status: 'active' as const,
        lastTested: new Date()
      }
    ];

    // Add TeamTalk API
    const teamTalkApi: ApiEndpoint = {
      id: 'teamtalk-main',
      name: 'TeamTalk Mobile Feed',
      url: 'https://www.teamtalk.com/mobile-app-feed',
      provider: 'TeamTalk',
      status: 'inactive' as const, // CORS issue
      lastTested: new Date()
    };

    setApiEndpoints([...teamApis, teamTalkApi]);
  }, []);

  const handleRemoveEndpoint = (id: string) => {
    if (confirm('Are you sure you want to remove this API endpoint?')) {
      setApiEndpoints(apiEndpoints.filter(endpoint => endpoint.id !== id));
      // Remove test results for this endpoint
      const newTestResults = { ...testResults };
      delete newTestResults[id];
      setTestResults(newTestResults);
    }
  };

  const handleRefreshAllApis = async () => {
    setRefreshingAll(true);
    setFailedApis([]);
    const failures: Array<{club: string, error: string}> = [];

    // Test all APIs in parallel
    const promises = apiEndpoints.map(async (endpoint) => {
      try {
        await handleTestEndpoint(endpoint);
        const result = testResults[endpoint.id];
        if (result && !result.success && endpoint.team) {
          failures.push({
            club: endpoint.team,
            error: result.error || 'Unknown error'
          });
        }
      } catch (error) {
        if (endpoint.team) {
          failures.push({
            club: endpoint.team,
            error: error instanceof Error ? error.message : 'Network error'
          });
        }
      }
    });

    await Promise.allSettled(promises);
    setFailedApis(failures);
    setRefreshingAll(false);

    // Trigger a global data refresh for both CMS and main site
    window.dispatchEvent(new CustomEvent('globalApiRefresh', { 
      detail: { 
        totalApis: apiEndpoints.length,
        failedApis: failures.length,
        failures
      } 
    }));
    
    // Also trigger the main site refresh events
    window.dispatchEvent(new CustomEvent('manualRefresh'));
    window.dispatchEvent(new CustomEvent('autoRefresh'));
  };

  const handleTestEndpoint = async (endpoint: ApiEndpoint) => {
    setTestingEndpoint(endpoint.id);
    const startTime = Date.now();

    try {
      let testUrl = endpoint.url;
      let result: any;

      if (endpoint.provider === 'ScoreInside') {
        // Use the actual ScoreInside API service
        const { ScoreInsideApiService } = await import('@/services/scoreinsideApi');
        const apiService = ScoreInsideApiService.getInstance();
        
        try {
          const teamSlug = endpoint.team?.toLowerCase().replace(/\s+/g, '-') || 'unknown';
          const transfers = await apiService.getTeamTransfers(teamSlug);
          
          result = {
            success: true,
            status: 200,
            responseTime: Date.now() - startTime,
            dataCount: transfers.length,
            error: null,
            clubName: endpoint.team
          };
        } catch (apiError) {
          result = {
            success: false,
            error: `ScoreInside API failed for ${endpoint.team}: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`,
            responseTime: Date.now() - startTime,
            clubName: endpoint.team
          };
        }
      } else if (endpoint.provider === 'TeamTalk') {
        // Use the actual TeamTalk API service
        const { TeamTalkApiService } = await import('@/services/teamtalkApi');
        const apiService = TeamTalkApiService.getInstance();
        
        try {
          const transfers = await apiService.getTransfers();
          
          result = {
            success: true,
            status: 200,
            responseTime: Date.now() - startTime,
            dataCount: transfers.length,
            error: null
          };
        } catch (apiError) {
          result = {
            success: false,
            error: `TeamTalk API failed: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`,
            responseTime: Date.now() - startTime
          };
        }
      } else {
        // Custom API - use basic fetch
        const response = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Transfer-Tracker/1.0'
          }
        });

        const responseTime = Date.now() - startTime;
        const data = await response.json();

        result = {
          success: response.ok,
          status: response.status,
          responseTime,
          dataCount: Array.isArray(data) ? data.length : (data.articles ? data.articles.length : 0),
          error: response.ok ? null : `HTTP ${response.status}`
        };
      }

      setTestResults({ ...testResults, [endpoint.id]: result });
      
      // Update endpoint status
      setApiEndpoints(endpoints => 
        endpoints.map(ep => 
          ep.id === endpoint.id 
            ? { 
                ...ep, 
                status: result.success ? 'active' : 'error', 
                lastTested: new Date(), 
                responseTime: result.responseTime,
                lastDataRefresh: result.success ? new Date() : ep.lastDataRefresh
              }
            : ep
        )
      );

      // If successful, trigger a data refresh in the main app
      if (result.success) {
        window.dispatchEvent(new CustomEvent('apiDataRefresh', { 
          detail: { 
            provider: endpoint.provider, 
            team: endpoint.team,
            dataCount: result.dataCount
          } 
        }));
      }

    } catch (error) {
      const result = {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        responseTime: Date.now() - startTime,
        clubName: endpoint.team
      };

      setTestResults({ ...testResults, [endpoint.id]: result });
      
      setApiEndpoints(endpoints => 
        endpoints.map(ep => 
          ep.id === endpoint.id 
            ? { ...ep, status: 'error', lastTested: new Date() }
            : ep
        )
      );
    } finally {
      setTestingEndpoint(null);
    }
  };

  const getStatusIcon = (status: ApiEndpoint['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'ScoreInside':
        return 'bg-blue-100 text-blue-800';
      case 'TeamTalk':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Premier League teams for display
  const premierLeagueTeams = [
    'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton & Hove Albion',
    'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Ipswich Town',
    'Leicester City', 'Liverpool', 'Manchester City', 'Manchester United', 'Newcastle United',
    'Nottingham Forest', 'Southampton', 'Tottenham Hotspur', 'West Ham United', 'Wolverhampton Wanderers'
  ];

  // Check for stale rumors in API data
  const checkStaleRumors = (endpoint: ApiEndpoint) => {
    const testResult = testResults[endpoint.id];
    if (!testResult || !testResult.success) {
      return 0; // No data to check
    }

    // Check if the last data refresh was more than 24 hours ago
    const now = new Date();
    const lastRefresh = endpoint.lastDataRefresh;
    
    if (!lastRefresh) {
      return 1; // No refresh data available
    }

    const hoursSinceRefresh = (now.getTime() - lastRefresh.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceRefresh > 24) {
      return 1; // Data is stale (older than 24 hours)
    }

    return 0; // Data is fresh
  };

  return (
    <div className="space-y-6">
      {/* API Refresh Controls */}
      <Card className="bg-slate-800/30 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">API Management</h3>
              <p className="text-sm text-gray-400">Test and refresh all club APIs to ensure data is current</p>
            </div>
            <Button
              onClick={handleRefreshAllApis}
              disabled={refreshingAll}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {refreshingAll ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {refreshingAll ? 'Refreshing All APIs...' : 'Refresh All APIs'}
            </Button>
          </div>
          
          {/* Failed APIs Display */}
          {failedApis.length > 0 && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-500/30 rounded">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-300 font-medium">Failed APIs ({failedApis.length})</span>
              </div>
              <div className="space-y-1">
                {failedApis.map((failure, index) => (
                  <div key={index} className="text-xs text-red-200">
                    <span className="font-medium">{failure.club}:</span> {failure.error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Database className="w-5 h-5" />
            Club API Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full">

            <div className="space-y-4">
              <div className="grid gap-4">
                {apiEndpoints.map((endpoint) => (
                  <Card key={endpoint.id} className="bg-slate-800/30 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusIcon(endpoint.status)}
                            {endpoint.team && (
                              <div className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-md font-semibold text-sm border border-blue-500/30">
                                {endpoint.team}
                              </div>
                            )}
                            <h3 className="font-semibold text-white">{endpoint.name}</h3>
                            <Badge className={getProviderColor(endpoint.provider)}>
                              {endpoint.provider}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400 mb-2 font-mono break-all">
                            {endpoint.url}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Last tested: {endpoint.lastTested?.toLocaleString()}</span>
                            {endpoint.responseTime && (
                              <span>Response: {endpoint.responseTime}ms</span>
                            )}
                          </div>
                          {testResults[endpoint.id] && (
                            <div className="mt-2 p-2 bg-slate-900/50 rounded text-xs">
                              <div className="text-gray-300">
                                {testResults[endpoint.id].success ? (
                                  <span className="text-green-400">✓ Test passed</span>
                                ) : (
                                  <span className="text-red-400">✗ Test failed: {testResults[endpoint.id].error}</span>
                                )}
                                {testResults[endpoint.id].dataCount && (
                                  <span className="ml-2">({testResults[endpoint.id].dataCount} items)</span>
                                )}
                              </div>
                            </div>
                          )}
                          {/* Stale Rumors Detection */}
                          {(() => {
                            const staleCount = checkStaleRumors(endpoint);
                            if (staleCount > 0) {
                              return (
                                <div className="mt-2 p-2 bg-red-900/30 border border-red-500/30 rounded text-xs">
                                  <div className="flex items-center justify-between text-red-300">
                                    <div className="flex items-center gap-2">
                                      <AlertCircle className="w-3 h-3" />
                                      <span>⚠️ {staleCount} stale rumors detected</span>
                                    </div>
                                    <Button
                                      onClick={() => handleTestEndpoint(endpoint)}
                                      variant="outline"
                                      size="sm"
                                      className="h-6 px-2 text-xs border-red-400 text-red-300 hover:bg-red-500/10"
                                    >
                                      <RefreshCw className="w-3 h-3 mr-1" />
                                      Refresh
                                    </Button>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleTestEndpoint(endpoint)}
                            disabled={testingEndpoint === endpoint.id}
                            variant="outline"
                            size="sm"
                            className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                          >
                            {testingEndpoint === endpoint.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <TestTube className="w-4 h-4" />
                            )}
                            Test
                          </Button>
                          <Button
                            onClick={() => handleRemoveEndpoint(endpoint.id)}
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-400 hover:bg-red-500/10"
                            title="Remove this API endpoint"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClubApiManager;

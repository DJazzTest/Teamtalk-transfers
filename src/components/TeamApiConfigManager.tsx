import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  Calendar, 
  Trophy, 
  ExternalLink, 
  CheckCircle, 
  XCircle,
  Clock,
  TestTube
} from 'lucide-react';
import { 
  TEAM_API_CONFIGS, 
  getTeamConfig, 
  getAllLeagueTables,
  getTeamsByLeague 
} from '@/data/teamApiConfig';
import { sport365Api } from '@/services/sport365Api';
import { TeamDetailPanel } from '@/components/TeamDetailPanel';

interface ApiTestResult {
  status: 'success' | 'error' | 'testing';
  responseTime?: number;
  data?: any;
  error?: string;
}

export const TeamApiConfigManager: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, ApiTestResult>>({});
  const [testingApis, setTestingApis] = useState<Set<string>>(new Set());
  const [selectedTeamSlug, setSelectedTeamSlug] = useState<string | null>(null);

  const testApi = async (apiId: string, url: string, provider: string) => {
    setTestingApis(prev => new Set(prev).add(apiId));
    setTestResults(prev => ({ ...prev, [apiId]: { status: 'testing' } }));

    const startTime = Date.now();
    try {
      let response: Response;
      
      if (provider === 'sport365') {
        response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'TransferCentre/1.0'
          }
        });
      } else {
        response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'TransferCentre/1.0'
          }
        });
      }

      const responseTime = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      setTestResults(prev => ({
        ...prev,
        [apiId]: {
          status: 'success',
          responseTime,
          data
        }
      }));
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      setTestResults(prev => ({
        ...prev,
        [apiId]: {
          status: 'error',
          responseTime,
          error: error.message
        }
      }));
    } finally {
      setTestingApis(prev => {
        const next = new Set(prev);
        next.delete(apiId);
        return next;
      });
    }
  };

  const getResultIcon = (result: ApiTestResult | undefined) => {
    if (!result) return null;
    if (result.status === 'testing') {
      return <Clock className="h-4 w-4 animate-spin text-blue-500" />;
    }
    if (result.status === 'success') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const leagues = Array.from(new Set(TEAM_API_CONFIGS.map(config => config.league)));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Team API Configuration Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="teams" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="teams">Teams by League</TabsTrigger>
              <TabsTrigger value="tables">League Tables</TabsTrigger>
            </TabsList>

            <TabsContent value="teams" className="space-y-4">
              {leagues.map(league => {
                const teams = getTeamsByLeague(league);
                return (
                  <Card key={league} className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-lg">{league}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {teams.map(team => {
                        const tableApiId = `${team.slug}-table`;
                        const resultsApiId = `${team.slug}-results`;
                        const fixturesApiId = `${team.slug}-fixtures`;
                        
                        const tableResult = testResults[tableApiId];
                        const resultsResult = testResults[resultsApiId];
                        const fixturesResult = testResults[fixturesApiId];

                        return (
                          <div key={team.slug} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-lg">{team.teamName}</h3>
                              <Badge variant="outline">{team.league}</Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* League Table */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Table className="h-4 w-4" />
                                  <span className="font-medium">League Table</span>
                                  {getResultIcon(tableResult)}
                                </div>
                                <div className="text-sm text-gray-500 break-all">
                                  {team.leagueTable.tableApi.substring(0, 60)}...
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => testApi(tableApiId, team.leagueTable.tableApi, team.leagueTable.provider)}
                                    disabled={testingApis.has(tableApiId)}
                                  >
                                    <TestTube className="h-3 w-3 mr-1" />
                                    Test
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => window.open(team.leagueTable.tableApi, '_blank')}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                </div>
                                {tableResult?.status === 'success' && (
                                  <div className="text-xs text-green-600">
                                    ✓ {tableResult.responseTime}ms
                                  </div>
                                )}
                                {tableResult?.status === 'error' && (
                                  <div className="text-xs text-red-600">
                                    ✗ {tableResult.error}
                                  </div>
                                )}
                              </div>

                              {/* Results */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Trophy className="h-4 w-4" />
                                  <span className="font-medium">Results</span>
                                  {getResultIcon(resultsResult)}
                                </div>
                                <div className="text-sm text-gray-500 break-all">
                                  {team.resultsApi.substring(0, 60)}...
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => testApi(resultsApiId, team.resultsApi, 'sport365')}
                                    disabled={testingApis.has(resultsApiId)}
                                  >
                                    <TestTube className="h-3 w-3 mr-1" />
                                    Test
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => window.open(team.resultsApi, '_blank')}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                </div>
                                {resultsResult?.status === 'success' && (
                                  <div className="text-xs text-green-600">
                                    ✓ {resultsResult.responseTime}ms
                                  </div>
                                )}
                                {resultsResult?.status === 'error' && (
                                  <div className="text-xs text-red-600">
                                    ✗ {resultsResult.error}
                                  </div>
                                )}
                              </div>

                              {/* Fixtures */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span className="font-medium">Fixtures</span>
                                  {getResultIcon(fixturesResult)}
                                </div>
                                <div className="text-sm text-gray-500 break-all">
                                  {team.fixturesApi.substring(0, 60)}...
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => testApi(fixturesApiId, team.fixturesApi, 'sport365')}
                                    disabled={testingApis.has(fixturesApiId)}
                                  >
                                    <TestTube className="h-3 w-3 mr-1" />
                                    Test
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => window.open(team.fixturesApi, '_blank')}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                </div>
                                {fixturesResult?.status === 'success' && (
                                  <div className="text-xs text-green-600">
                                    ✓ {fixturesResult.responseTime}ms
                                  </div>
                                )}
                                {fixturesResult?.status === 'error' && (
                                  <div className="text-xs text-red-600">
                                    ✗ {fixturesResult.error}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <Button size="sm" onClick={() => setSelectedTeamSlug(team.slug)}>
                                View {team.teamName}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="tables" className="space-y-4">
              {getAllLeagueTables().map((table, index) => {
                const tableApiId = `table-${index}`;
                const result = testResults[tableApiId];

                return (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Table className="h-5 w-5" />
                          <h3 className="font-semibold text-lg">{table.leagueName}</h3>
                          <Badge variant="outline">{table.provider}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testApi(tableApiId, table.tableApi, table.provider)}
                            disabled={testingApis.has(tableApiId)}
                          >
                            <TestTube className="h-3 w-3 mr-1" />
                            Test API
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(table.tableApi, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 break-all mb-2">
                        {table.tableApi}
                      </div>
                      {result?.status === 'success' && (
                        <div className="text-xs text-green-600">
                          ✓ Success - {result.responseTime}ms
                        </div>
                      )}
                      {result?.status === 'error' && (
                        <div className="text-xs text-red-600">
                          ✗ Error: {result.error}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {selectedTeamSlug && (
        <Card>
          <CardHeader>
            <CardTitle>Team Detail: {selectedTeamSlug}</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamDetailPanel slug={selectedTeamSlug} onClose={() => setSelectedTeamSlug(null)} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};


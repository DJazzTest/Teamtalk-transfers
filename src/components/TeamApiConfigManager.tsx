import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Trophy,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  TestTube,
} from 'lucide-react';
import {
  TEAM_API_CONFIGS,
  getTeamConfig,
  getTeamsByLeague,
  getDisabledEndpoints,
  addDisabledEndpoint,
  removeDisabledEndpoint,
  isEndpointDisabled,
} from '@/data/teamApiConfig';
import { TeamDetailPanel } from '@/components/TeamDetailPanel';
import { toast } from 'sonner';

interface ApiTestResult {
  status: 'success' | 'error' | 'testing';
  responseTime?: number;
  data?: any;
  error?: string;
}

/** Consider response empty if no meaningful list (e.g. matches, data, items) with length > 0 */
function isResponseEmpty(data: unknown): boolean {
  if (data == null) return true;
  if (Array.isArray(data)) return data.length === 0;
  if (typeof data !== 'object') return true;
  const o = data as Record<string, unknown>;
  const listKeys = ['matches', 'data', 'items', 'events', 'results', 'fixtures'];
  for (const key of listKeys) {
    const val = o[key];
    if (Array.isArray(val) && val.length > 0) return false;
  }
  if (Array.isArray(o.matches) && (o.matches as unknown[]).length > 0) return false;
  return true;
}

export const TeamApiConfigManager: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, ApiTestResult>>({});
  const [testingApis, setTestingApis] = useState<Set<string>>(new Set());
  const [selectedTeamSlug, setSelectedTeamSlug] = useState<string | null>(null);
  const [disabledEndpoints, setDisabledEndpoints] = useState<string[]>(() => getDisabledEndpoints());

  const refreshDisabled = () => setDisabledEndpoints(getDisabledEndpoints());

  const testApi = async (apiId: string, url: string, provider: string): Promise<ApiTestResult> => {
    setTestingApis(prev => new Set(prev).add(apiId));
    setTestResults(prev => ({ ...prev, [apiId]: { status: 'testing' } }));

    const startTime = Date.now();
    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'TransferCentre/1.0',
        },
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        const err = new Error(`HTTP ${response.status}: ${response.statusText}`);
        setTestResults(prev => ({ ...prev, [apiId]: { status: 'error', responseTime, error: err.message } }));
        return { status: 'error', responseTime, error: err.message };
      }

      const data = await response.json();
      const empty = isResponseEmpty(data);

      if (empty) {
        setTestResults(prev => ({
          ...prev,
          [apiId]: { status: 'error', responseTime, data, error: 'Response empty' },
        }));
        return { status: 'error', responseTime, data, error: 'Response empty' };
      }

      setTestResults(prev => ({
        ...prev,
        [apiId]: { status: 'success', responseTime, data },
      }));
      return { status: 'success', responseTime, data };
    } catch (error: unknown) {
      const responseTime = Date.now() - startTime;
      const err = error instanceof Error ? error.message : String(error);
      setTestResults(prev => ({
        ...prev,
        [apiId]: { status: 'error', responseTime, error: err },
      }));
      return { status: 'error', responseTime, error: err };
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

  const testAllApis = async () => {
    const toRemove: string[] = [];
    for (const team of TEAM_API_CONFIGS) {
      const resultsApiId = `${team.slug}-results`;
      const fixturesApiId = `${team.slug}-fixtures`;
      if (!isEndpointDisabled(resultsApiId)) {
        const r = await testApi(resultsApiId, team.resultsApi, 'sport365');
        if (r.status === 'error') {
          addDisabledEndpoint(resultsApiId);
          toRemove.push(resultsApiId);
        }
      }
      if (!isEndpointDisabled(fixturesApiId)) {
        const r = await testApi(fixturesApiId, team.fixturesApi, 'sport365');
        if (r.status === 'error') {
          addDisabledEndpoint(fixturesApiId);
          toRemove.push(fixturesApiId);
        }
      }
    }
    refreshDisabled();
    if (toRemove.length > 0) {
      toast.info(`Removed ${toRemove.length} failed or empty endpoint(s).`);
    } else {
      toast.success('All APIs passed.');
    }
  };

  const restoreEndpoint = (apiId: string) => {
    removeDisabledEndpoint(apiId);
    refreshDisabled();
    setTestResults(prev => ({ ...prev, [apiId]: undefined }));
    toast.success(`Restored ${apiId}`);
  };

  const restoreAll = () => {
    getDisabledEndpoints().forEach(removeDisabledEndpoint);
    refreshDisabled();
    setTestResults({});
    toast.success('All endpoints restored.');
  };

  const leagues = Array.from(new Set(TEAM_API_CONFIGS.map(config => config.league)));
  const hasDisabled = disabledEndpoints.length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Team API Configuration Manager
          </CardTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            <Button
              onClick={testAllApis}
              disabled={testingApis.size > 0}
              className="gap-1"
            >
              <TestTube className="h-4 w-4" />
              Test all APIs
            </Button>
            {hasDisabled && (
              <Button variant="outline" size="sm" onClick={restoreAll}>
                Restore all removed
              </Button>
            )}
          </div>
          {hasDisabled && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              {disabledEndpoints.length} endpoint(s) removed (failed or empty). Restore above to show again.
            </p>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="teams" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="teams">Teams by League</TabsTrigger>
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Results — hidden when disabled (removed) */}
                              {!isEndpointDisabled(resultsApiId) ? (
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
                              ) : (
                                <div className="space-y-2 rounded border border-dashed border-slate-600 p-3 bg-slate-800/50">
                                  <span className="font-medium text-gray-400">Results</span>
                                  <p className="text-xs text-gray-500">Removed (failed or empty)</p>
                                  <Button size="sm" variant="outline" onClick={() => restoreEndpoint(resultsApiId)}>
                                    Restore
                                  </Button>
                                </div>
                              )}

                              {/* Fixtures — hidden when disabled (removed) */}
                              {!isEndpointDisabled(fixturesApiId) ? (
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
                              ) : (
                                <div className="space-y-2 rounded border border-dashed border-slate-600 p-3 bg-slate-800/50">
                                  <span className="font-medium text-gray-400">Fixtures</span>
                                  <p className="text-xs text-gray-500">Removed (failed or empty)</p>
                                  <Button size="sm" variant="outline" onClick={() => restoreEndpoint(fixturesApiId)}>
                                    Restore
                                  </Button>
                                </div>
                              )}
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


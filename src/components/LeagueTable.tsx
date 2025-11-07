import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { normalizeTeamName } from '@/utils/teamMapping';
import { Loader2 } from 'lucide-react';

interface TeamTableEntry {
  ranking: number;
  team_id: string;
  team_name: string;
  played: string;
  wins: string;
  draws: string;
  loss: string;
  goal_for: string;
  goal_against: string;
  goal_difference: string;
  points: string;
  form?: string[];
  stage_phases?: number[];
}

interface LeagueTableProps {
  tableApiUrl: string;
  selectedTeam?: string; // Team name to highlight
  leagueName?: string;
}

export const LeagueTable: React.FC<LeagueTableProps> = ({ 
  tableApiUrl, 
  selectedTeam,
  leagueName = 'Premier League'
}) => {
  const [teams, setTeams] = useState<TeamTableEntry[]>([]);
  const [homeTeams, setHomeTeams] = useState<TeamTableEntry[]>([]);
  const [awayTeams, setAwayTeams] = useState<TeamTableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'compact' | 'full'>('compact');
  const [tableType, setTableType] = useState<'overall' | 'home' | 'away'>('overall');

  useEffect(() => {
    const fetchTable = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try direct API call first (might work in production or if CORS allows)
        const fetchOptions = [
          { url: tableApiUrl, useProxy: false },
          { url: `https://cors.isomorphic-git.org/${tableApiUrl}`, useProxy: true },
          { url: `https://api.allorigins.win/get?url=${encodeURIComponent(tableApiUrl)}`, useProxy: true, isAllOrigins: true },
          { url: `https://corsproxy.io/?${encodeURIComponent(tableApiUrl)}`, useProxy: true },
        ];
        
        let data: any = null;
        let lastError: Error | null = null;
        
        for (const option of fetchOptions) {
          try {
            console.log('Trying to fetch league table:', option.url.substring(0, 80) + '...');
            const response = await fetch(option.url, {
              headers: {
                'Accept': 'application/json',
              }
            });
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            let responseText = await response.text();
            
            // Handle allorigins wrapper
            if (option.isAllOrigins) {
              const wrapped = JSON.parse(responseText);
              responseText = wrapped.contents;
            }
            
            // Try to parse as JSON
            data = JSON.parse(responseText);
            console.log('Successfully fetched league table data');
            break; // Success, exit loop
          } catch (error) {
            console.log('Fetch attempt failed:', error);
            lastError = error instanceof Error ? error : new Error(String(error));
            continue; // Try next option
          }
        }
        
        if (!data) {
          throw lastError || new Error('All fetch attempts failed');
        }
        
        // Parse Sport365 API response structure
        // The API returns multiple tables:
        // - tables[0] (code=0): Overall table
        // - tables[1] (code=1): Home table
        // - tables[2] (code=2): Away table
        if (data.L && data.L.tables && data.L.tables.length > 0) {
          // Overall table (code=0)
          const overallTable = data.L.tables.find((t: any) => t.code === 0) || data.L.tables[0];
          if (overallTable.teams && Array.isArray(overallTable.teams)) {
            setTeams(overallTable.teams);
          }
          
          // Home table (code=1)
          const homeTable = data.L.tables.find((t: any) => t.code === 1);
          if (homeTable && homeTable.teams && Array.isArray(homeTable.teams)) {
            setHomeTeams(homeTable.teams);
          }
          
          // Away table (code=2)
          const awayTable = data.L.tables.find((t: any) => t.code === 2);
          if (awayTable && awayTable.teams && Array.isArray(awayTable.teams)) {
            setAwayTeams(awayTable.teams);
          }
          
          if (!overallTable.teams || !Array.isArray(overallTable.teams)) {
            throw new Error('No teams found in table data');
          }
        } else {
          throw new Error('Invalid table data structure');
        }
      } catch (err) {
        console.error('Error fetching league table:', err);
        setError(err instanceof Error ? err.message : 'Failed to load league table');
      } finally {
        setLoading(false);
      }
    };

    if (tableApiUrl) {
      fetchTable();
    }
  }, [tableApiUrl]);

  // Normalize team name for matching
  const normalizeForMatch = (name: string): string => {
    return normalizeTeamName(name).toLowerCase();
  };

  const isSelectedTeam = (teamName: string): boolean => {
    if (!selectedTeam) return false;
    const normalizedSelected = normalizeForMatch(selectedTeam);
    const normalizedTeam = normalizeForMatch(teamName);
    
    // Check exact match or if one contains the other
    return normalizedSelected === normalizedTeam ||
           normalizedTeam.includes(normalizedSelected) ||
           normalizedSelected.includes(normalizedTeam);
  };

  const getFormColor = (result: string): string => {
    switch (result) {
      case 'W': return 'bg-green-500';
      case 'D': return 'bg-yellow-500';
      case 'L': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPhaseColor = (phase: number): string => {
    // Phase 1 = Promotion, Phase 7 = Play-off, Phase 2 = Relegation
    if (phase === 1) return 'bg-green-600/20 border-green-500/50';
    if (phase === 7) return 'bg-yellow-600/20 border-yellow-500/50';
    if (phase === 2) return 'bg-red-600/20 border-red-500/50';
    return '';
  };

  if (loading) {
    return (
      <Card className="p-6 bg-slate-800/70 border-slate-700">
        <div className="flex items-center justify-center gap-2 text-white">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading {leagueName} table...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-slate-800/70 border-slate-700">
        <div className="text-red-400">
          <p className="font-semibold">Error loading table</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </Card>
    );
  }

  // Get the current table data based on selected type
  const getCurrentTeams = (): TeamTableEntry[] => {
    switch (tableType) {
      case 'home':
        return homeTeams.length > 0 ? homeTeams : teams;
      case 'away':
        return awayTeams.length > 0 ? awayTeams : teams;
      default:
        return teams;
    }
  };

  const currentTeams = getCurrentTeams();

  if (currentTeams.length === 0) {
    return (
      <Card className="p-6 bg-slate-800/70 border-slate-700">
        <div className="text-gray-400 text-center">No table data available</div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-slate-800/70 border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">
          {viewMode === 'compact' 
            ? `${leagueName} Table` 
            : `Full ${leagueName} Table`
          }
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode(viewMode === 'compact' ? 'full' : 'compact')}
          className="text-blue-300 border-slate-600 hover:border-slate-500 hover:text-white"
        >
          {viewMode === 'compact' ? 'Full Table' : 'Compact Table'}
        </Button>
      </div>

      {/* Table Type Tabs */}
      <div className="mb-4">
        <Tabs value={tableType} onValueChange={(value) => setTableType(value as 'overall' | 'home' | 'away')}>
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-slate-700/50">
            <TabsTrigger value="overall" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white">
              Overall
            </TabsTrigger>
            <TabsTrigger value="home" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white">
              Home
            </TabsTrigger>
            <TabsTrigger value="away" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white">
              Away
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-gray-400">
              <th className="text-left py-2 px-2">Pos</th>
              <th className="text-left py-2 px-3">Team</th>
              <th className="text-center py-2 px-2">P</th>
              <th className="text-center py-2 px-2">W</th>
              <th className="text-center py-2 px-2">D</th>
              <th className="text-center py-2 px-2">L</th>
              {viewMode === 'full' && (
                <>
                  <th className="text-center py-2 px-2">GF</th>
                  <th className="text-center py-2 px-2">GA</th>
                  <th className="text-center py-2 px-2">GD</th>
                </>
              )}
              <th className="text-center py-2 px-2">Pts</th>
              {viewMode === 'full' && (
                <th className="text-center py-2 px-2">Form</th>
              )}
            </tr>
          </thead>
          <tbody>
            {currentTeams.map((team) => {
              const isSelected = isSelectedTeam(team.team_name);
              const hasPhase = team.stage_phases && team.stage_phases.length > 0;
              const phaseColor = hasPhase ? getPhaseColor(team.stage_phases[0]) : '';
              
              return (
                <tr
                  key={team.team_id}
                  className={`
                    border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors
                    ${isSelected ? 'bg-blue-600/20 border-blue-500/50' : ''}
                    ${phaseColor}
                  `}
                >
                  <td className="py-3 px-2 text-white font-semibold">
                    {team.ranking}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${isSelected ? 'text-blue-400' : 'text-white'}`}>
                        {team.team_name}
                      </span>
                      {isSelected && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                          You are here
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center text-white">{team.played}</td>
                  <td className="py-3 px-2 text-center text-white">{team.wins}</td>
                  <td className="py-3 px-2 text-center text-white">{team.draws}</td>
                  <td className="py-3 px-2 text-center text-white">{team.loss}</td>
                  {viewMode === 'full' && (
                    <>
                      <td className="py-3 px-2 text-center text-white">{team.goal_for}</td>
                      <td className="py-3 px-2 text-center text-white">{team.goal_against}</td>
                      <td className={`py-3 px-2 text-center font-semibold ${
                        parseInt(team.goal_difference) > 0 ? 'text-green-400' : 
                        parseInt(team.goal_difference) < 0 ? 'text-red-400' : 
                        'text-white'
                      }`}>
                        {parseInt(team.goal_difference) > 0 ? '+' : ''}{team.goal_difference}
                      </td>
                    </>
                  )}
                  <td className="py-3 px-2 text-center text-white font-semibold">{team.points}</td>
                  {viewMode === 'full' && (
                    <td className="py-3 px-2">
                      <div className="flex gap-1 justify-center">
                        {team.form && team.form.slice(0, 5).map((result, idx) => (
                          <div
                            key={idx}
                            className={`w-5 h-5 rounded text-xs flex items-center justify-center text-white ${getFormColor(result)}`}
                            title={result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}
                          >
                            {result}
                          </div>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Legend - only show in full mode */}
      {viewMode === 'full' && (
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Win</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Draw</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Loss</span>
          </div>
          {selectedTeam && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600/20 border border-blue-500/50 rounded"></div>
              <span>Selected Team</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};


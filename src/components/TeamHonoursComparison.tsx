import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TeamBioMap, DEFAULT_TEAM_BIOS } from '@/data/teamBios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';
import { Trophy, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamHonoursComparisonProps {
  primaryTeam: string;
  comparisonTeam?: string;
  onComparisonTeamChange?: (team: string) => void;
}

interface ParsedHonour {
  trophy: string;
  count: number;
  raw: string;
}

// Parse honours strings to extract trophy names and counts
function parseHonours(honours: string[]): ParsedHonour[] {
  const parsed: ParsedHonour[] = [];
  
  for (const honour of honours) {
    if (!honour || typeof honour !== 'string') continue;
    
    // Try different patterns:
    // "3 First Division titles" -> {trophy: "First Division", count: 3}
    // "20 English league titles" -> {trophy: "English League", count: 20}
    // "First Division / Premier League: 7" -> {trophy: "First Division / Premier League", count: 7}
    // "FA Cups: 14" -> {trophy: "FA Cup", count: 14}
    // "1 FA Cup (1972)" -> {trophy: "FA Cup", count: 1}
    
    // Pattern 1: Number at start, then trophy name (with optional parentheses)
    const pattern1 = /^(\d+)\s+(.+?)(?:\s*\(|$)/i;
    const match1 = honour.match(pattern1);
    if (match1) {
      const count = parseInt(match1[1], 10);
      let trophy = match1[2].trim();
      // Remove common suffixes but keep the trophy name
      trophy = trophy.replace(/\s*(titles?|cups?|shields?|trophies?)\s*$/i, '').trim();
      if (trophy && !isNaN(count)) {
        parsed.push({ trophy: trophy, count, raw: honour });
        continue;
      }
    }
    
    // Pattern 2: Trophy name, then colon, then number
    const pattern2 = /^(.+?):\s*(\d+)/i;
    const match2 = honour.match(pattern2);
    if (match2) {
      const trophy = match2[1].trim();
      const count = parseInt(match2[2], 10);
      if (trophy && !isNaN(count)) {
        parsed.push({ trophy: trophy, count, raw: honour });
        continue;
      }
    }
    
    // Pattern 3: Just a number and trophy name (no specific pattern)
    const pattern3 = /(\d+)\s+(.+)/i;
    const match3 = honour.match(pattern3);
    if (match3) {
      const count = parseInt(match3[1], 10);
      let trophy = match3[2].trim();
      // Remove parentheses and common suffixes
      trophy = trophy.replace(/\s*\([^)]*\)\s*/g, '').trim(); // Remove parentheses
      trophy = trophy.replace(/\s*(titles?|cups?|shields?|trophies?)\s*$/i, '').trim();
      if (trophy && !isNaN(count)) {
        parsed.push({ trophy: trophy, count, raw: honour });
        continue;
      }
    }
    
    // If no pattern matches, try to extract just a number at the start
    const numberMatch = honour.match(/^(\d+)/);
    if (numberMatch) {
      const count = parseInt(numberMatch[1], 10);
      let trophy = honour.replace(/^\d+\s*/, '').trim();
      if (trophy && !isNaN(count)) {
        parsed.push({ trophy: trophy, count, raw: honour });
      }
    }
  }
  
  return parsed;
}

// Normalize trophy names for comparison
function normalizeTrophyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*\/\s*/g, ' / ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Get all unique trophy types across teams
function getAllTrophyTypes(parsedHonours: Record<string, ParsedHonour[]>): string[] {
  const trophySet = new Set<string>();
  Object.values(parsedHonours).forEach(parsed => {
    parsed.forEach(h => {
      trophySet.add(normalizeTrophyName(h.trophy));
    });
  });
  return Array.from(trophySet).sort();
}

export const TeamHonoursComparison: React.FC<TeamHonoursComparisonProps> = ({
  primaryTeam,
  comparisonTeam,
  onComparisonTeamChange,
}) => {
  // Load team bios
  const teamBiosData = useMemo(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('teamBios');
        if (stored) {
          const parsed = JSON.parse(stored);
          return { ...DEFAULT_TEAM_BIOS, ...parsed } as TeamBioMap;
        }
      }
    } catch (e) {
      console.error('Error loading team bios:', e);
    }
    return DEFAULT_TEAM_BIOS;
  }, []);

  const primaryBio = teamBiosData[primaryTeam];
  const comparisonBio = comparisonTeam ? teamBiosData[comparisonTeam] : null;

  // Parse honours
  const primaryParsed = primaryBio?.honours ? parseHonours(primaryBio.honours) : [];
  const comparisonParsed = comparisonBio?.honours ? parseHonours(comparisonBio.honours) : [];

  // Get all available teams for comparison
  const availableTeams = Object.keys(teamBiosData).filter(
    team => team !== primaryTeam && teamBiosData[team]?.honours && teamBiosData[team].honours.length > 0
  );

  // Create comparison data
  const comparisonData = useMemo(() => {
    const allTrophies = getAllTrophyTypes({
      primary: primaryParsed,
      comparison: comparisonParsed,
    });

    return allTrophies.map(trophy => {
      const primaryCount = primaryParsed.find(
        h => normalizeTrophyName(h.trophy) === trophy
      )?.count || 0;
      
      const comparisonCount = comparisonParsed.find(
        h => normalizeTrophyName(h.trophy) === trophy
      )?.count || 0;

      return {
        trophy,
        [primaryTeam]: primaryCount,
        [comparisonTeam || 'Other']: comparisonCount,
      };
    }).filter(item => item[primaryTeam] > 0 || item[comparisonTeam || 'Other'] > 0);
  }, [primaryParsed, comparisonParsed, primaryTeam, comparisonTeam]);

  // Calculate totals
  const primaryTotal = primaryParsed.reduce((sum, h) => sum + h.count, 0);
  const comparisonTotal = comparisonParsed.reduce((sum, h) => sum + h.count, 0);

  const colors = {
    primary: '#3b82f6', // blue
    comparison: '#10b981', // green
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <div className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <div>
                <h3 className="text-xl font-bold text-white">Major Honours Comparison</h3>
                <p className="text-sm text-gray-400">Compare trophy counts between clubs</p>
              </div>
            </div>
            {availableTeams.length > 0 && (
              <Select
                value={comparisonTeam || undefined}
                onValueChange={(value) => onComparisonTeamChange?.(value)}
              >
                <SelectTrigger className="w-full sm:w-56 bg-slate-900/60 border-slate-700 text-white">
                  <SelectValue placeholder="Select Team to Compare" />
                </SelectTrigger>
                <SelectContent>
                  {availableTeams.map((team) => (
                    <SelectItem key={team} value={team}>
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {comparisonData.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No honours data available for comparison</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="bg-slate-900/60 border-slate-700 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">{primaryTeam}</p>
                      <p className="text-3xl font-bold text-blue-400">{primaryTotal}</p>
                      <p className="text-xs text-gray-500 mt-1">Total Trophies</p>
                    </div>
                    <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/50">
                      {primaryParsed.length} Types
                    </Badge>
                  </div>
                </Card>
                {comparisonTeam && (
                  <Card className="bg-slate-900/60 border-slate-700 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">{comparisonTeam}</p>
                        <p className="text-3xl font-bold text-green-400">{comparisonTotal}</p>
                        <p className="text-xs text-gray-500 mt-1">Total Trophies</p>
                      </div>
                      <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/50">
                        {comparisonParsed.length} Types
                      </Badge>
                    </div>
                  </Card>
                )}
              </div>

              {/* Bar Chart */}
              {comparisonData.length > 0 && (
                <Card className="bg-slate-900/60 border-slate-700 p-4 mb-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Trophy Comparison</h4>
                  <ResponsiveContainer width="100%" height={Math.max(300, comparisonData.length * 40)}>
                    <BarChart
                      data={comparisonData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                    >
                      <XAxis type="number" stroke="#94a3b8" />
                      <YAxis
                        type="category"
                        dataKey="trophy"
                        stroke="#94a3b8"
                        width={140}
                        tick={{ fill: '#e2e8f0', fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #475569',
                          borderRadius: '6px',
                          color: '#e2e8f0',
                        }}
                      />
                      <Legend
                        wrapperStyle={{ color: '#e2e8f0' }}
                        iconType="rect"
                      />
                      <Bar
                        dataKey={primaryTeam}
                        fill={colors.primary}
                        name={primaryTeam}
                        radius={[0, 4, 4, 0]}
                      >
                        {comparisonData.map((entry, index) => (
                          <Cell key={`cell-primary-${index}`} fill={colors.primary} />
                        ))}
                      </Bar>
                      {comparisonTeam && (
                        <Bar
                          dataKey={comparisonTeam}
                          fill={colors.comparison}
                          name={comparisonTeam}
                          radius={[0, 4, 4, 0]}
                        >
                          {comparisonData.map((entry, index) => (
                            <Cell key={`cell-comparison-${index}`} fill={colors.comparison} />
                          ))}
                        </Bar>
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Detailed List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-slate-900/60 border-slate-700 p-4">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50">
                      {primaryTeam}
                    </Badge>
                  </h4>
                  <div className="space-y-2">
                    {primaryParsed.length === 0 ? (
                      <p className="text-gray-400 text-sm">No honours data</p>
                    ) : (
                      primaryParsed.map((honour, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
                        >
                          <span className="text-sm text-gray-300 flex-1">{honour.trophy}</span>
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50 ml-2">
                            {honour.count}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                {comparisonTeam && (
                  <Card className="bg-slate-900/60 border-slate-700 p-4">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/50">
                        {comparisonTeam}
                      </Badge>
                    </h4>
                    <div className="space-y-2">
                      {comparisonParsed.length === 0 ? (
                        <p className="text-gray-400 text-sm">No honours data</p>
                      ) : (
                        comparisonParsed.map((honour, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 rounded bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
                          >
                            <span className="text-sm text-gray-300 flex-1">{honour.trophy}</span>
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/50 ml-2">
                              {honour.count}
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};


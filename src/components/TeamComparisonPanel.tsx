import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { teamComparisonData, TeamComparisonEntry, getAvailableComparisonTeams } from '@/data/teamComparisonStats';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip as RechartsTooltip } from 'recharts';
import { AlertCircle, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TeamPhaseComparisonCharts } from './TeamPhaseComparisonCharts';

interface TeamComparisonPanelProps {
  primaryTeam: string;
  comparisonTeam?: string;
  onComparisonTeamChange?: (team: string) => void;
}

const formatSummaryMetrics = (team: TeamComparisonEntry | null) => {
  if (!team) {
    return [];
  }
  return [
    { label: 'Avg. Sofascore Rating', value: team.averageRating.toFixed(2) },
    { label: 'Matches', value: team.matches.toString() },
    { label: 'Goals scored', value: team.goalsScored.toString() },
    { label: 'Goals conceded', value: team.goalsConceded.toString() },
    { label: 'Assists', value: team.assists.toString() },
  ];
};

export const TeamComparisonPanel: React.FC<TeamComparisonPanelProps> = ({
  primaryTeam,
  comparisonTeam,
  onComparisonTeamChange,
}) => {
  const primaryData = teamComparisonData[primaryTeam] || null;
  const comparisonData = comparisonTeam ? teamComparisonData[comparisonTeam] || null : null;
  const selectableTeams = getAvailableComparisonTeams().filter((team) => team !== primaryTeam);

  if (!primaryData) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700 p-6">
        <div className="flex items-start gap-3 text-amber-200">
          <AlertCircle className="w-5 h-5 mt-1" />
          <div>
            <p className="font-semibold">Comparison data unavailable</p>
            <p className="text-sm text-amber-100/80">
              We don&rsquo;t have comparison data for {primaryTeam} yet. Add data in the CMS to enable this view.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!comparisonData && selectableTeams.length === 0) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700 p-6">
        <div className="flex items-start gap-3 text-amber-200">
          <AlertCircle className="w-5 h-5 mt-1" />
          <div>
            <p className="font-semibold">Only one team available</p>
            <p className="text-sm text-amber-100/80">
              Add at least one more club to the comparison dataset so we can chart the differences.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const resolvedComparisonTeam = comparisonData ? comparisonTeam : selectableTeams[0];
  const resolvedComparisonData = resolvedComparisonTeam ? teamComparisonData[resolvedComparisonTeam] : null;

  if (!resolvedComparisonData) {
    return null;
  }

  const summaryMetrics = formatSummaryMetrics(primaryData).map((metric) => {
    const comparisonMetric = formatSummaryMetrics(resolvedComparisonData).find((item) => item.label === metric.label);
    return {
      label: metric.label,
      primary: metric.value,
      comparison: comparisonMetric?.value || '—',
    };
  });

  const radarData = primaryData.radarScores.map((category) => ({
    category: category.category,
    primary: category.value,
    comparison:
      resolvedComparisonData.radarScores.find((c) => c.category === category.category)?.value ??
      category.value,
  }));

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <div className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-gray-400 uppercase tracking-wider">Club Comparison</p>
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                {primaryTeam}
                <Badge className="bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  vs {resolvedComparisonTeam}
                </Badge>
              </h3>
            </div>
            {selectableTeams.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-300">Compare against</span>
                <Select
                  value={resolvedComparisonTeam}
                  onValueChange={(value) => onComparisonTeamChange?.(value)}
                >
                  <SelectTrigger className="w-56 bg-slate-900/60 border-slate-700 text-white">
                    <SelectValue placeholder="Select club" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    {getAvailableComparisonTeams().map((team) => (
                      <SelectItem
                        key={team}
                        value={team}
                        disabled={team === primaryTeam}
                        className={cn(team === primaryTeam && 'text-gray-500')}
                      >
                        {team}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid gap-4 mt-6 sm:grid-cols-2 lg:grid-cols-3">
            {summaryMetrics.map((metric) => (
              <Card key={metric.label} className="bg-slate-900/60 border-slate-700 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">{metric.label}</p>
                <div className="mt-2 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-2xl font-semibold text-white">{metric.primary}</p>
                    <p className="text-xs text-gray-400 mt-1">{primaryTeam}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-semibold text-emerald-300">{metric.comparison}</p>
                    <p className="text-xs text-gray-400 mt-1">{resolvedComparisonTeam}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-white font-semibold">Performance Profile</p>
              <p className="text-xs text-gray-400">Aggregate scores per phase of play</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#475569" />
                <PolarAngleAxis dataKey="category" tick={{ fill: '#cbd5f5', fontSize: 12 }} />
                <RechartsTooltip
                  formatter={(value: number, name: string) => [`${value.toFixed(0)}`, name]}
                  labelFormatter={(label) => `Phase: ${label}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#475569', color: '#e2e8f0' }}
                />
                <Radar
                  name={primaryTeam}
                  dataKey="primary"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
                <Radar
                  name={resolvedComparisonTeam}
                  dataKey="comparison"
                  stroke="#f97316"
                  fill="#f97316"
                  fillOpacity={0.25}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      <TeamPhaseComparisonCharts primaryTeam={primaryTeam} comparisonTeam={resolvedComparisonTeam} />
    </div>
  );
};


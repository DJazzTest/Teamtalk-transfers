import React from 'react';
import { Card } from '@/components/ui/card';
import { teamComparisonData } from '@/data/teamComparisonStats';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from 'recharts';

interface TeamPhaseComparisonChartsProps {
  primaryTeam: string;
  comparisonTeam: string;
}

type SectionKey = 'Attacking' | 'Passing' | 'Defending' | 'Other';

const SECTION_COLORS: Record<SectionKey, { primary: string; comparison: string }> = {
  Attacking: { primary: '#38bdf8', comparison: '#fb923c' },
  Passing: { primary: '#34d399', comparison: '#fbbf24' },
  Defending: { primary: '#a78bfa', comparison: '#f87171' },
  Other: { primary: '#f472b6', comparison: '#22d3ee' },
};

const extractNumericValue = (value: string): number => {
  if (!value) return 0;
  const clean = value.replace(/,/g, '.');
  const match = clean.match(/-?\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : 0;
};

const buildComparisonData = (primarySection: any, comparisonSection: any) => {
  const labels = new Set<string>();
  primarySection?.metrics?.forEach((metric: any) => labels.add(metric.label));
  comparisonSection?.metrics?.forEach((metric: any) => labels.add(metric.label));

  return Array.from(labels).map((label) => {
    const primaryMetric = primarySection?.metrics?.find((metric: any) => metric.label === label);
    const comparisonMetric = comparisonSection?.metrics?.find((metric: any) => metric.label === label);
    return {
      label,
      shortLabel: label.length > 26 ? label.replace(/\b(per game)\b/gi, 'pg') : label,
      primaryValue: extractNumericValue(primaryMetric?.value || '0'),
      primaryFull: primaryMetric?.value || '—',
      comparisonValue: extractNumericValue(comparisonMetric?.value || '0'),
      comparisonFull: comparisonMetric?.value || '—',
    };
  });
};

export const TeamPhaseComparisonCharts: React.FC<TeamPhaseComparisonChartsProps> = ({
  primaryTeam,
  comparisonTeam,
}) => {
  const primaryData = teamComparisonData[primaryTeam];
  const comparisonData = teamComparisonData[comparisonTeam];

  if (!primaryData || !comparisonData) {
    return null;
  }

  const buildDataForSection = (title: string) =>
    buildComparisonData(
      primaryData.sections.find((section) => section.title === title),
      comparisonData.sections.find((section) => section.title === title)
    );

  const sectionMap: Record<SectionKey, ReturnType<typeof buildDataForSection>> = {
    Attacking: buildDataForSection('Attacking'),
    Passing: buildDataForSection('Passing'),
    Defending: buildDataForSection('Defending'),
    Other: buildDataForSection('Other'),
  };

  return (
    <div className="space-y-4">
      {(Object.keys(sectionMap) as SectionKey[]).map((sectionKey) => {
        const data = sectionMap[sectionKey];
        if (!data.length) return null;

        const gradientPrimary = `comparison-primary-${sectionKey}`;
        const gradientComparison = `comparison-secondary-${sectionKey}`;
        const colors = SECTION_COLORS[sectionKey];

        // Calculate domain to ensure small values are visible
        const allValues = [
          ...data.map(d => d.primaryValue),
          ...data.map(d => d.comparisonValue)
        ].filter(v => !isNaN(v) && isFinite(v));
        if (allValues.length === 0) return null; // Skip if no valid values
        
        const dataMin = 0; // Always start at 0 for better visibility
        const dataMax = Math.max(...allValues);
        // Add padding: 20% for small values (< 1), 10% for larger values
        const padding = dataMax < 1 ? dataMax * 0.2 : dataMax * 0.1;
        const domainMax = Math.max(dataMax + padding, 0.1); // Ensure at least 0.1 is shown

        return (
          <Card key={sectionKey} className="bg-slate-900/70 border-slate-700 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{sectionKey}</p>
                  <h4 className="text-lg font-semibold text-white">{primaryTeam} vs {comparisonTeam}</h4>
                </div>
                <div className="flex items-center gap-4 text-xs uppercase tracking-wide text-gray-400">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-6 rounded-full" style={{ background: colors.primary }} />
                    {primaryTeam}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-6 rounded-full" style={{ background: colors.comparison }} />
                    {comparisonTeam}
                  </span>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 8, right: 16, left: 16, bottom: 8 }}
                    barCategoryGap={8}
                  >
                    <XAxis type="number" hide domain={[dataMin, domainMax]} />
                    <YAxis
                      type="category"
                      dataKey="shortLabel"
                      width={120}
                      tick={{ fill: '#cbd5f5', fontSize: 12 }}
                    />
                    <RechartsTooltip
                      formatter={(value: number, name: string, props) => {
                        const payload = props.payload;
                        return [
                          name === primaryTeam ? payload.primaryFull : payload.comparisonFull,
                          name,
                        ];
                      }}
                      labelFormatter={(label) => label}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#475569', color: '#e2e8f0' }}
                    />
                    <Bar
                      dataKey="primaryValue"
                      name={primaryTeam}
                      radius={[4, 4, 4, 4]}
                      fill={`url(#${gradientPrimary})`}
                    />
                    <Bar
                      dataKey="comparisonValue"
                      name={comparisonTeam}
                      radius={[4, 4, 4, 4]}
                      fill={`url(#${gradientComparison})`}
                    />
                    <defs>
                      <linearGradient id={gradientPrimary} x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor={colors.primary} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={colors.primary} stopOpacity={0.95} />
                      </linearGradient>
                      <linearGradient id={gradientComparison} x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor={colors.comparison} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={colors.comparison} stopOpacity={0.95} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};


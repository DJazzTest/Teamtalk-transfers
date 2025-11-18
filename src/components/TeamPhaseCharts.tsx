import React from 'react';
import { Card } from '@/components/ui/card';
import { teamComparisonData, TeamComparisonEntry, TeamComparisonSection } from '@/data/teamComparisonStats';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from '@/lib/utils';

interface TeamPhaseChartsProps {
  teamName: string;
}

type SectionKey = 'Attacking' | 'Passing' | 'Defending' | 'Other';

const SECTION_COLORS: Record<SectionKey, string> = {
  Attacking: '#f97316',
  Passing: '#22d3ee',
  Defending: '#38bdf8',
  Other: '#d946ef',
};

const SECTION_BG: Record<SectionKey, string> = {
  Attacking: 'from-orange-500/10 to-orange-500/0',
  Passing: 'from-cyan-400/10 to-cyan-400/0',
  Defending: 'from-sky-400/10 to-sky-400/0',
  Other: 'from-fuchsia-500/10 to-fuchsia-500/0',
};

const extractNumericValue = (value: string): number => {
  if (!value) return 0;
  const clean = value.replace(/,/g, '.');
  const match = clean.match(/-?\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : 0;
};

const buildSectionData = (section?: TeamComparisonSection) => {
  if (!section) return [];
  return section.metrics.map((metric) => ({
    label: metric.label,
    shortLabel: metric.label.length > 26 ? metric.label.replace(/\b(per game)\b/gi, 'pg') : metric.label,
    value: extractNumericValue(metric.value),
    fullValue: metric.value,
  }));
};

const TeamPhaseCharts: React.FC<TeamPhaseChartsProps> = ({ teamName }) => {
  const entry: TeamComparisonEntry | undefined = teamComparisonData[teamName];
  if (!entry) {
    return null;
  }

  const sectionMap: Record<SectionKey, ReturnType<typeof buildSectionData>> = {
    Attacking: buildSectionData(entry.sections.find((section) => section.title === 'Attacking')),
    Passing: buildSectionData(entry.sections.find((section) => section.title === 'Passing')),
    Defending: buildSectionData(entry.sections.find((section) => section.title === 'Defending')),
    Other: buildSectionData(entry.sections.find((section) => section.title === 'Other')),
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {(Object.keys(sectionMap) as SectionKey[]).map((sectionKey) => {
        const data = sectionMap[sectionKey];
        if (!data.length) return null;
        const color = SECTION_COLORS[sectionKey];

        return (
          <Card
            key={sectionKey}
            className={cn(
              'bg-slate-900/60 border-slate-700 relative overflow-hidden',
              'before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-70 before:pointer-events-none',
              `before:${SECTION_BG[sectionKey]}`
            )}
          >
            <div className="relative p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{sectionKey}</p>
                  <h3 className="text-lg font-semibold text-white">{teamName}</h3>
                </div>
                <span className="text-xs text-gray-400">Data visuals</span>
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                    <XAxis type="number" hide domain={['dataMin', 'dataMax']} />
                    <YAxis
                      type="category"
                      dataKey="shortLabel"
                      width={120}
                      tick={{ fill: '#cbd5f5', fontSize: 12 }}
                    />
                    <RechartsTooltip
                      formatter={(value: number, _name, props) => [`${props.payload.fullValue}`, props.payload.label]}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#475569', color: '#e2e8f0' }}
                    />
                    <Bar
                      dataKey="value"
                      radius={[4, 4, 4, 4]}
                      fill={`url(#gradient-${sectionKey})`}
                      background={{ fill: 'rgba(148,163,184,0.15)', radius: 4 }}
                    />
                    <defs>
                      <linearGradient id={`gradient-${sectionKey}`} x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.95} />
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

export { TeamPhaseCharts };


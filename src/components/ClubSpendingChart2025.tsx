import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ClubSpendingChart2025Props {
  onSelectClub?: (club: string) => void;
}

// Official 2025/26 Summer Window Data - Ordered by spending (descending)
const clubFinancialData = [
  { club: 'Liverpool', spending: 317.0, earnings: 207.0, displayName: 'Liverpool' },
  { club: 'Arsenal', spending: 263.0, earnings: 9.0, displayName: 'Arsenal' },
  { club: 'Chelsea', spending: 236.1, earnings: 207.8, displayName: 'Chelsea' },
  { club: 'Manchester United', spending: 210.5, earnings: 0.0, displayName: 'Man U' },
  { club: 'Sunderland', spending: 147.9, earnings: 37.0, displayName: 'Sunder' },
  { club: 'Nottingham Forest', spending: 147.7, earnings: 105.4, displayName: 'Notts F' },
  { club: 'Manchester City', spending: 147.5, earnings: 81.2, displayName: 'Man C' },
  { club: 'Newcastle United', spending: 128.6, earnings: 32.0, displayName: 'Newc' },
  { club: 'Tottenham Hotspur', spending: 122.5, earnings: 36.5, displayName: 'Tott' },
  { club: 'Bournemouth', spending: 121.0, earnings: 191.3, displayName: 'Bourn' },
  { club: 'Leeds United', spending: 90.1, earnings: 5.2, displayName: 'Leeds' },
  { club: 'Burnley', spending: 87.4, earnings: 29.6, displayName: 'Burnley' },
  { club: 'Brentford', spending: 84.5, earnings: 88.4, displayName: 'Brentf' },
  { club: 'Everton', spending: 80.0, earnings: 6.0, displayName: 'Everton' },
  { club: 'Wolverhampton Wanderers', spending: 77.8, earnings: 97.0, displayName: 'Wolves' },
  { club: 'West Ham United', spending: 72.8, earnings: 54.5, displayName: 'West H' },
  { club: 'Brighton & Hove Albion', spending: 67.75, earnings: 110.0, displayName: 'Brighton' },
  { club: 'Aston Villa', spending: 34.5, earnings: 42.5, displayName: 'A Villa' },
  { club: 'Crystal Palace', spending: 3.0, earnings: 68.5, displayName: 'Palace' },
  { club: 'Fulham', spending: 0.43, earnings: 0.0, displayName: 'Fulham' }
];

const clubNameVariants: Record<string, { medium: string; short: string; veryShort: string; single: string }> = {
  'Arsenal': { medium: 'Arsenal', short: 'Ars', veryShort: 'Ar..', single: 'A.' },
  'Manchester United': { medium: 'Man Utd', short: 'Man U', veryShort: 'Man..', single: 'M.' },
  'Liverpool': { medium: 'Liverpool', short: 'Liver', veryShort: 'Liv..', single: 'L.' },
  'Chelsea': { medium: 'Chelsea', short: 'Chel', veryShort: 'Ch..', single: 'C.' },
  'Manchester City': { medium: 'Man City', short: 'Man C', veryShort: 'Ma..', single: 'M.' },
  'Nottingham Forest': { medium: 'Notts Forest', short: 'Notts', veryShort: 'No..', single: 'N.' },
  'Sunderland': { medium: 'Sunderland', short: 'Sund', veryShort: 'Su..', single: 'S.' },
  'Newcastle United': { medium: 'Newcastle', short: 'Newc', veryShort: 'Ne..', single: 'N.' },
  'Tottenham Hotspur': { medium: 'Tott', short: 'Tott', veryShort: 'To..', single: 'T.' },
  'Bournemouth': { medium: 'Bourn', short: 'Bour', veryShort: 'Bo..', single: 'B.' },
  'Leeds United': { medium: 'Leeds', short: 'Leeds', veryShort: 'Le..', single: 'L.' },
  'Burnley': { medium: 'Burnley', short: 'Burn', veryShort: 'Bu..', single: 'B.' },
  'Brentford': { medium: 'Brentford', short: 'Bren', veryShort: 'Br..', single: 'B.' },
  'Everton': { medium: 'Everton', short: 'Ever', veryShort: 'Ev..', single: 'E.' },
  'Wolverhampton Wanderers': { medium: 'Wolves', short: 'Wolv', veryShort: 'Wo..', single: 'W.' },
  'West Ham United': { medium: 'West Ham', short: 'W Ham', veryShort: 'W..', single: 'W.' },
  'Brighton & Hove Albion': { medium: 'Brighton', short: 'Brigh', veryShort: 'Br..', single: 'B.' },
  'Aston Villa': { medium: 'Aston Villa', short: 'A Villa', veryShort: 'A..', single: 'A.' },
  'Crystal Palace': { medium: 'Palace', short: 'Pal', veryShort: 'Pa..', single: 'P.' },
  'Fulham': { medium: 'Fulham', short: 'Ful', veryShort: 'Fu..', single: 'F.' }
};

export const ClubSpendingChart2025: React.FC<ClubSpendingChart2025Props> = ({ onSelectClub }) => {
  const getResponsiveName = React.useCallback((club: string, defaultName: string) => {
    // Always use display name for fixed-width layout
    return defaultName;
  }, []);

  // Calculate net spend and sort by total spending
  const chartData = React.useMemo(() => {
    return clubFinancialData
      .map(club => {
        const responsiveName = getResponsiveName(club.club, club.displayName);
        return {
          ...club,
          netSpend: club.spending - club.earnings,
          clubShort: responsiveName,
          responsiveName
        };
      })
      .sort((a, b) => b.spending - a.spending);
  }, [getResponsiveName]);

  const handleBarClick = (data: any) => {
    if (onSelectClub) {
      onSelectClub(data.club);
    }
  };

  const totalSpending = chartData.reduce((sum, club) => sum + club.spending, 0);
  const totalEarnings = chartData.reduce((sum, club) => sum + club.earnings, 0);
  const totalNetSpend = totalSpending - totalEarnings;

  return (
    <Card className="border border-gray-200 dark:border-slate-700 shadow-lg mb-6 bg-white dark:bg-slate-800/70 transition-colors" style={{ width: '960px' }}>
      <div style={{ padding: '16px' }}>
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 dark:bg-blue-900/40 p-1.5 rounded-lg">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="text-lg font-bold text-blue-700 dark:text-blue-200">
                Club Spending 2025/26 Summer Window
              </h3>
            </div>
            
            {/* Chart */}
            <div className="w-full text-slate-600 dark:text-slate-200">
              <div style={{ width: '100%', height: '224px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                margin={{ 
                  top: 20, 
                  right: 24, 
                  left: 16, 
                  bottom: 32 
                }}
                barCategoryGap={chartData.length > 15 ? '30%' : chartData.length > 10 ? '20%' : '10%'}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
                <XAxis 
                  dataKey="clubShort" 
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  height={60}
                  tickFormatter={(value) => value}
                  tickMargin={8}
                  angle={0}
                  textAnchor="middle"
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: 'currentColor' }}
                  width={60}
                  label={{ value: 'Amount (£M)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'currentColor', fontSize: '12px' } }}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    const label = name === 'spending' ? 'Spent' : name === 'earnings' ? 'Earned' : 'Net Spend';
                    return [`£${value.toFixed(1)}M`, label];
                  }}
                  labelFormatter={(label: string) => label}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(148,163,184,0.4)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar 
                  dataKey="spending" 
                  name="spending" 
                  fill="#DC2626" 
                  radius={[4, 4, 0, 0]} 
                  onClick={handleBarClick}
                  style={{ cursor: onSelectClub ? 'pointer' : 'default' }}
                  barSize={chartData.length > 15 ? 18 : chartData.length > 10 ? 22 : 28}
                />
                <Bar 
                  dataKey="earnings" 
                  name="earnings" 
                  fill="#10B981" 
                  radius={[4, 4, 0, 0]} 
                  onClick={handleBarClick}
                  style={{ cursor: onSelectClub ? 'pointer' : 'default' }}
                  barSize={chartData.length > 15 ? 18 : chartData.length > 10 ? 22 : 28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
            {/* Summary Statistics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
              <div className="bg-red-100 dark:bg-red-500/20 p-2 rounded-lg border border-red-200 dark:border-red-500/40">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-3 h-3 text-red-500 dark:text-red-300" />
                  <span className="text-xs font-medium text-red-700 dark:text-red-200">Total Spent</span>
                </div>
                <p className="text-sm font-bold text-red-700 dark:text-red-200">£{totalSpending.toFixed(1)}M</p>
              </div>
              
              <div className="bg-green-100 dark:bg-green-500/20 p-2 rounded-lg border border-green-200 dark:border-green-500/40">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingDown className="w-3 h-3 text-green-600 dark:text-green-300" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-200">Total Earned</span>
                </div>
                <p className="text-sm font-bold text-green-700 dark:text-green-200">£{totalEarnings.toFixed(1)}M</p>
              </div>
              
              <div className="bg-blue-100 dark:bg-blue-500/20 p-2 rounded-lg border border-blue-200 dark:border-blue-500/40">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-3 h-3 text-blue-600 dark:text-blue-300" />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-200">Net Spend</span>
                </div>
                <p className="text-sm font-bold text-blue-700 dark:text-blue-200">£{totalNetSpend.toFixed(1)}M</p>
              </div>
            </div>
      </div>
    </Card>
  );
};
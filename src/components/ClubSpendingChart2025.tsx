import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ClubSpendingChart2025Props {
  onSelectClub?: (club: string) => void;
}

// Official 2025/26 Summer Window Data
const clubFinancialData = [
  { club: 'Arsenal', spending: 263.0, earnings: 9.0, displayName: 'Arsenal' },
  { club: 'Manchester United', spending: 210.5, earnings: 0.0, displayName: 'Man U' },
  { club: 'Liverpool', spending: 317.0, earnings: 207.0, displayName: 'Liverpool' },
  { club: 'Chelsea', spending: 236.1, earnings: 207.8, displayName: 'Chelsea' },
  { club: 'Manchester City', spending: 147.5, earnings: 81.2, displayName: 'Man City' },
  { club: 'Nottingham Forest', spending: 147.7, earnings: 105.4, displayName: 'Notts Forest' },
  { club: 'Sunderland', spending: 147.9, earnings: 37.0, displayName: 'Sunderland' },
  { club: 'Newcastle United', spending: 128.6, earnings: 32.0, displayName: 'Newcastle' },
  { club: 'Tottenham Hotspur', spending: 122.5, earnings: 36.5, displayName: 'Tottenham' },
  { club: 'Bournemouth', spending: 121.0, earnings: 191.3, displayName: 'Bournemouth' },
  { club: 'Leeds United', spending: 90.1, earnings: 5.2, displayName: 'Leeds' },
  { club: 'Burnley', spending: 87.4, earnings: 29.6, displayName: 'Burnley' },
  { club: 'Brentford', spending: 84.5, earnings: 88.4, displayName: 'Brentford' },
  { club: 'Everton', spending: 80.0, earnings: 6.0, displayName: 'Everton' },
  { club: 'Wolverhampton Wanderers', spending: 77.8, earnings: 97.0, displayName: 'Wolves' },
  { club: 'West Ham United', spending: 72.8, earnings: 54.5, displayName: 'West Ham' },
  { club: 'Brighton & Hove Albion', spending: 67.75, earnings: 110.0, displayName: 'Brighton' },
  { club: 'Aston Villa', spending: 34.5, earnings: 42.5, displayName: 'Aston Villa' },
  { club: 'Crystal Palace', spending: 3.0, earnings: 68.5, displayName: 'Crystal Palace' },
  { club: 'Fulham', spending: 0.43, earnings: 0.0, displayName: 'Fulham' }
];

// Club badge mapping
const getClubBadge = (club: string): string => {
  const badgeMap: Record<string, string> = {
    'Arsenal': '/badges/arsenal-real.png',
    'Aston Villa': '/badges/astonvilla.png',
    'Bournemouth': '/badges/bournemouth-real.png',
    'Brentford': '/badges/brentford.png',
    'Brighton & Hove Albion': '/badges/brightonhovealbion.png',
    'Burnley': '/badges/burnley.png', 
    'Chelsea': '/badges/chelsea-real.png',
    'Crystal Palace': '/badges/crystalpalace.png',
    'Everton': '/badges/everton.png',
    'Fulham': '/badges/fulham.png',
    'Leeds United': '/lovable-uploads/f1403919-509d-469c-8455-d3b11b3d5cb6.png',
    'Liverpool': '/badges/liverpool-real.png',
    'Manchester City': '/badges/manchestercity-real.png',
    'Manchester United': '/badges/manchesterunited-real.png',
    'Newcastle United': '/badges/newcastleunited.png',
    'Nottingham Forest': '/badges/nottinghamforest.png',
    'Sunderland': '/badges/sunderland.png',
    'Tottenham Hotspur': '/badges/tottenhamhotspur.png',
    'West Ham United': '/badges/westhamunited.png',
    'Wolverhampton Wanderers': '/badges/wolverhamptonwanderers.png'
  };
  return badgeMap[club] || '';
};

export const ClubSpendingChart2025: React.FC<ClubSpendingChart2025Props> = ({ onSelectClub }) => {
  // Calculate net spend and sort by total spending
  const chartData = clubFinancialData
    .map(club => ({
      ...club,
      netSpend: club.spending - club.earnings,
      clubShort: club.club.length > 12 ? club.club.substring(0, 12) + '...' : club.club
    }))
    .sort((a, b) => b.spending - a.spending);

  const handleBarClick = (data: any) => {
    if (onSelectClub) {
      onSelectClub(data.club);
    }
  };

  const totalSpending = chartData.reduce((sum, club) => sum + club.spending, 0);
  const totalEarnings = chartData.reduce((sum, club) => sum + club.earnings, 0);
  const totalNetSpend = totalSpending - totalEarnings;

  return (
    <Card className="border-gray-200/50 shadow-lg mb-6" style={{ backgroundColor: '#2F517A' }}>
      <div className="p-3 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-blue-400">Club Spending 2025/26 Summer Window</h3>
          </div>
        </div>
        
        {/* Scrollable chart container */}
        <div className="overflow-x-auto pb-4" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#9CA3AF #E5E7EB'
        }}>
          <div className="min-w-[1800px] h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={1800}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="clubShort" 
                  tick={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#E5E7EB' }}
                  label={{ value: 'Amount (£M)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#E5E7EB' } }}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    const label = name === 'spending' ? 'Spent' : name === 'earnings' ? 'Earned' : 'Net Spend';
                    return [`£${value.toFixed(1)}M`, label];
                  }}
                  labelFormatter={(label: string) => label}
                  contentStyle={{
                    backgroundColor: 'rgba(47, 81, 122, 0.95)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar 
                  dataKey="spending" 
                  name="spending" 
                  fill="#DC2626" 
                  radius={[2, 2, 0, 0]} 
                  onClick={handleBarClick}
                  style={{ cursor: onSelectClub ? 'pointer' : 'default' }}
                />
                <Bar 
                  dataKey="earnings" 
                  name="earnings" 
                  fill="#10B981" 
                  radius={[2, 2, 0, 0]} 
                  onClick={handleBarClick}
                  style={{ cursor: onSelectClub ? 'pointer' : 'default' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Custom club info below chart - also scrollable */}
          <div className="min-w-[1800px] flex gap-12 mt-4 px-4 justify-start items-end">
            {chartData.map((club, index) => (
              <div 
                key={club.club} 
                className="text-center flex-shrink-0 w-16 flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleBarClick(club)}
              >
                {/* Earnings - Green */}
                <div className="text-xs font-semibold text-green-400 mb-1">
                  £{club.earnings.toFixed(1)}M
                </div>
                {/* Spending - Red */}
                <div className="text-xs font-semibold text-red-400 mb-2">
                  £{club.spending.toFixed(1)}M
                </div>
                {/* Club Name - Horizontal */}
                <div className="text-xs font-medium text-white mb-2 leading-tight">
                  {club.displayName}
                </div>
                {/* Club Badge */}
                <div className="flex justify-center">
                  <img
                    src={getClubBadge(club.club)}
                    alt={`${club.club} badge`}
                    className="w-8 h-8 rounded-full shadow bg-white object-contain border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Summary Statistics */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-red-500/20 p-3 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">Total Spent</span>
            </div>
            <p className="text-lg font-bold text-white">£{totalSpending.toFixed(1)}M</p>
          </div>
          
          <div className="bg-green-500/20 p-3 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">Total Earned</span>
            </div>
            <p className="text-lg font-bold text-white">£{totalEarnings.toFixed(1)}M</p>
          </div>
          
          <div className="bg-blue-500/20 p-3 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Net Spend</span>
            </div>
            <p className="text-lg font-bold text-white">£{totalNetSpend.toFixed(1)}M</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
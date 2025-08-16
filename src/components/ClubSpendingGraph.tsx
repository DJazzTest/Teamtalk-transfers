import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { clubSpending, clubEarnings, getNetSpend, allPremierLeagueClubs } from '@/data/clubFinancials';

const premierLeagueClubs = [
  'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton & Hove Albion',
  'Burnley', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham',
  'Leeds United', 'Liverpool', 'Manchester City', 'Manchester United',
  'Newcastle United', 'Nottingham Forest', 'Sunderland', 'Tottenham Hotspur',
  'West Ham United', 'Wolverhampton Wanderers'
];

const parseTransferFee = (fee: string): number => {
  if (!fee || fee === 'Free Transfer' || fee === 'Released' || fee === 'Loan' || fee === 'End of loan') {
    return 0;
  }
  const match = fee.match(/[£€$]?(\d+(?:\.\d+)?)[MmKk]?/);
  if (!match) return 0;
  const number = parseFloat(match[1]);
  if (fee.toLowerCase().includes('m')) {
    return number;
  } else if (fee.toLowerCase().includes('k')) {
    return number / 1000;
  }
  return number;
};

const pastelColors = [
  '#A5D8FF', '#FFC9DE', '#B9F6CA', '#FFD6A5', '#FFF7AE', '#D0F4DE', '#C3C7F7', '#F7D6E0',
  '#F9E2AE', '#B6E2D3', '#E0C3FC', '#FFB7B2', '#B5EAD7', '#E2F0CB', '#FFDAC1', '#B5A7F7',
  '#F7B7A3', '#F7E1AE', '#C7CEEA', '#D4A5A5'
];

interface ClubSpendingGraphProps {
  onSelectClub?: (club: string) => void;
}

export const ClubSpendingGraph: React.FC<ClubSpendingGraphProps> = ({ onSelectClub }) => {
  // Prepare chart data showing spending, earnings, and net spend
  const chartData = allPremierLeagueClubs.map((club, i) => {
    const spending = clubSpending[club as keyof typeof clubSpending] || 0;
    const earnings = clubEarnings[club as keyof typeof clubEarnings] || 0;
    const netSpend = getNetSpend(club);
    
    return {
      club: club.length > 15 ? club.substring(0, 15) + '...' : club,
      fullClub: club,
      spending: Number(spending.toFixed(1)),
      earnings: Number(earnings.toFixed(1)),
      netSpend: Number(netSpend.toFixed(1)),
      color: pastelColors[i % pastelColors.length],
    };
  }).sort((a, b) => b.netSpend - a.netSpend); // Sort by net spend (highest first)

  // Total spend and earnings
  const totalSpend = chartData.reduce((sum, c) => sum + c.spending, 0);
  const totalEarnings = chartData.reduce((sum, c) => sum + c.earnings, 0);
  const totalNetSpend = totalSpend - totalEarnings;

  // Bar Chart View with spending (red) and earnings (green)
  const BarChartView = () => {
    return (
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="club" 
              angle={-45} 
              textAnchor="end" 
              height={80}
              tick={{ fontSize: 12, fill: '#E5E7EB' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#E5E7EB' }}
              label={{ value: 'Amount (£M)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#E5E7EB' } }}
            />
            <Tooltip 
              formatter={(value: number, name: string, props: any) => {
                const label = name === 'spending' ? 'Spent' : 'Earned';
                return [`£${value}M`, label];
              }}
              labelFormatter={(label: string, payload: any) => 
                payload?.[0]?.payload?.fullClub || label
              }
              contentStyle={{
                backgroundColor: 'rgba(47, 81, 122, 0.95)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Bar 
              dataKey="spending" 
              name="Spending"
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`spending-${index}`} fill="#DC2626" />
              ))}
            </Bar>
            <Bar 
              dataKey="earnings" 
              name="Earnings"
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`earnings-${index}`} fill="#16A34A" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <Card className="border-gray-200/50 shadow-lg mb-6" style={{ backgroundColor: '#d0e0f7' }}>
      <div className="p-3 sm:p-6">
        <div className="flex items-center justify-center mb-4">
          <h3 className="text-xl font-bold text-blue-700">Club Spending vs Earnings 2025/26</h3>
        </div>
        
        {/* Show bar chart view */}
        <BarChartView />
        <div className="mt-4 text-center space-y-1">
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-500" />
              <span className="text-sm font-semibold text-red-700">
                Total spending: £{totalSpend.toFixed(1)}B
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold text-green-700">
                Total earnings: £{totalEarnings.toFixed(1)}B
              </span>
            </div>
          </div>
          <span className="text-base font-semibold text-blue-800">
            Net spend: £{totalNetSpend.toFixed(1)}B
          </span>
        </div>
      </div>
    </Card>
  );
};

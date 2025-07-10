
import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Transfer } from '@/types/transfer';
import { TrendingUp } from 'lucide-react';

interface TransferSpendingChartProps {
  transfers: Transfer[];
}

const parseTransferFee = (fee: string): number => {
  if (!fee || fee === 'Free Transfer' || fee === 'Released' || fee === 'Loan' || fee === 'End of loan') {
    return 0;
  }
  
  // Extract numbers from fee string (e.g., "£12M" -> 12)
  const match = fee.match(/[£€$]?(\d+(?:\.\d+)?)[MmKk]?/);
  if (!match) return 0;
  
  const number = parseFloat(match[1]);
  if (fee.toLowerCase().includes('m')) {
    return number; // Already in millions
  } else if (fee.toLowerCase().includes('k')) {
    return number / 1000; // Convert thousands to millions
  }
  return number; // Assume millions if no unit
};

const getBarColor = (spending: number): string => {
  if (spending >= 51) return '#DC2626'; // Fiery red (£51m+)
  if (spending >= 16) return '#F87171'; // Coral pink (£16-£50m)
  return '#9CA3AF'; // Light gray (£0-£15m)
};

export const TransferSpendingChart: React.FC<TransferSpendingChartProps> = ({ transfers }) => {
  // Premier League clubs only
  const premierLeagueClubs = [
    'Arsenal', 'Aston Villa', 'Brentford', 'Brighton & Hove Albion', 'Chelsea',
    'Crystal Palace', 'Everton', 'Fulham', 'Ipswich Town', 'Leeds United',
    'Leicester City', 'Liverpool', 'Manchester City', 'Manchester United',
    'Newcastle United', 'Nottingham Forest', 'Sheffield United', 'Southampton',
    'Tottenham Hotspur', 'West Ham United'
  ];

  // Calculate spending per Premier League club (only incoming transfers)
  const clubSpending = transfers
    .filter(transfer => 
      transfer.status === 'confirmed' && 
      premierLeagueClubs.includes(transfer.toClub)
    )
    .reduce((acc, transfer) => {
      const fee = parseTransferFee(transfer.fee);
      if (fee > 0) {
        acc[transfer.toClub] = (acc[transfer.toClub] || 0) + fee;
      }
      return acc;
    }, {} as Record<string, number>);

  // Create chart data for ALL Premier League clubs (including £0 spenders)
  const chartData = premierLeagueClubs.map(club => {
    const spending = clubSpending[club] || 0;
    return {
      club: club.length > 15 ? club.substring(0, 15) + '...' : club,
      fullClub: club,
      spending: Number(spending.toFixed(1)),
      color: getBarColor(spending)
    };
  }).sort((a, b) => b.spending - a.spending); // Sort by spending (highest first)

  return (
    <Card className="border-gray-200/50 shadow-lg mb-6" style={{ backgroundColor: '#2F517A' }}>
      <div className="p-3 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-blue-400">Transfer Spending 2025/26</h3>
        </div>
        
        <div className="h-96 overflow-x-auto">
          <div className="min-w-[800px] h-full">
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
                  label={{ value: 'Spending (£M)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#E5E7EB' } }}
                />
                <Tooltip 
                  formatter={(value: number, name: string, props: any) => [
                    `£${value}M`, 
                    props.payload.fullClub
                  ]}
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
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-300">
            Total spending: £{chartData.reduce((sum, club) => sum + club.spending, 0).toFixed(1)}M
          </p>
        </div>
      </div>
    </Card>
  );
};

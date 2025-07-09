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

export const TransferSpendingChart: React.FC<TransferSpendingChartProps> = ({ transfers }) => {
  // Calculate spending per club (only incoming transfers)
  const clubSpending = transfers
    .filter(transfer => transfer.status === 'confirmed')
    .reduce((acc, transfer) => {
      const fee = parseTransferFee(transfer.fee);
      if (fee > 0) {
        acc[transfer.toClub] = (acc[transfer.toClub] || 0) + fee;
      }
      return acc;
    }, {} as Record<string, number>);

  // Convert to chart data and sort by spending
  const chartData = Object.entries(clubSpending)
    .map(([club, spending]) => ({
      club: club.length > 15 ? club.substring(0, 15) + '...' : club,
      fullClub: club,
      spending: Number(spending.toFixed(1))
    }))
    .sort((a, b) => b.spending - a.spending)
    .slice(0, 10); // Top 10 spenders

  const colors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    'hsl(220, 70%, 50%)',
    'hsl(280, 65%, 55%)',
    'hsl(340, 75%, 55%)',
    'hsl(25, 85%, 55%)',
    'hsl(120, 70%, 45%)'
  ];

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Card className="border-gray-200/50 shadow-lg mb-6" style={{ backgroundColor: '#2F517A' }}>
      <div className="p-3 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-blue-400">Transfer Spending 2025</h3>
        </div>
        
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
                fill="url(#colorGradient)"
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-1))" />
                  <stop offset="100%" stopColor="hsl(var(--chart-2))" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
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
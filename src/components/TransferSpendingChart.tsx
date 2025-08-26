import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Transfer } from '@/types/transfer';
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TransferSpendingChartProps {
  transfers: Transfer[];
}

// Official 2025/26 Summer Window Data
const clubFinancialData = [
  { club: 'Arsenal', spending: 263.0, earnings: 9.0 },
  { club: 'Manchester United', spending: 210.5, earnings: 0.0 },
  { club: 'Liverpool', spending: 317.0, earnings: 207.0 },
  { club: 'Chelsea', spending: 236.1, earnings: 207.8 },
  { club: 'Manchester City', spending: 147.5, earnings: 81.2 },
  { club: 'Nottingham Forest', spending: 147.7, earnings: 105.4 },
  { club: 'Sunderland', spending: 147.9, earnings: 37.0 },
  { club: 'Newcastle United', spending: 128.6, earnings: 32.0 },
  { club: 'Tottenham Hotspur', spending: 122.5, earnings: 36.5 },
  { club: 'Bournemouth', spending: 121.0, earnings: 191.3 },
  { club: 'Leeds United', spending: 90.1, earnings: 5.2 },
  { club: 'Burnley', spending: 87.4, earnings: 29.6 },
  { club: 'Brentford', spending: 84.5, earnings: 88.4 },
  { club: 'Everton', spending: 80.0, earnings: 6.0 },
  { club: 'Wolverhampton Wanderers', spending: 77.8, earnings: 97.0 },
  { club: 'West Ham United', spending: 72.8, earnings: 54.5 },
  { club: 'Brighton & Hove Albion', spending: 67.75, earnings: 110.0 },
  { club: 'Aston Villa', spending: 34.5, earnings: 42.5 },
  { club: 'Crystal Palace', spending: 3.0, earnings: 68.5 },
  { club: 'Fulham', spending: 0.43, earnings: 0.0 }
];

export const TransferSpendingChart: React.FC<TransferSpendingChartProps> = ({ transfers }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 6;
  
  // Calculate net spend and sort by total spending
  const chartData = clubFinancialData
    .map(club => ({
      ...club,
      netSpend: club.spending - club.earnings,
      clubShort: club.club.length > 12 ? club.club.substring(0, 12) + '...' : club.club
    }))
    .sort((a, b) => b.spending - a.spending);

  const totalPages = Math.ceil(chartData.length / itemsPerPage);
  const currentData = chartData.slice(currentIndex * itemsPerPage, (currentIndex + 1) * itemsPerPage);

  const nextPage = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const totalSpending = chartData.reduce((sum, club) => sum + club.spending, 0);
  const totalEarnings = chartData.reduce((sum, club) => sum + club.earnings, 0);
  const totalNetSpend = totalSpending - totalEarnings;

  return (
    <Card className="border-gray-200/50 shadow-lg mb-6" style={{ backgroundColor: '#2F517A' }}>
      <div className="p-3 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-400">Club Spending 2025/26 Summer Window</h3>
              <p className="text-sm text-gray-300">Page {currentIndex + 1} of {totalPages}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevPage}
              className="text-white hover:bg-blue-500/20"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextPage}
              className="text-white hover:bg-blue-500/20"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="clubShort" 
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
              <Bar dataKey="spending" name="spending" fill="#DC2626" radius={[2, 2, 0, 0]} />
              <Bar dataKey="earnings" name="earnings" fill="#10B981" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
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
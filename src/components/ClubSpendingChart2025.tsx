import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClubSpendingChart2025Props {
  onSelectClub?: (club: string) => void;
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
  const [showAll, setShowAll] = useState(false);
  
  // Calculate net spend and sort by total spending
  const chartData = clubFinancialData
    .map(club => ({
      ...club,
      netSpend: club.spending - club.earnings,
    }))
    .sort((a, b) => b.spending - a.spending);

  const displayData = showAll ? chartData : chartData.slice(0, 8);

  const handleClubClick = (club: string) => {
    if (onSelectClub) {
      onSelectClub(club);
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
        
        {/* Scrollable club cards */}
        <div className="flex gap-4 overflow-x-auto pb-4 mb-4" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#9CA3AF #E5E7EB'
        }}>
          {displayData.map((club) => (
            <Card 
              key={club.club} 
              className="min-w-[160px] max-w-[160px] bg-slate-800/50 backdrop-blur-md border-slate-700 hover:border-blue-400/50 transition-all duration-200 cursor-pointer"
              onClick={() => handleClubClick(club.club)}
            >
              <div className="p-4 flex flex-col items-center gap-3">
                {/* Club Badge */}
                <div className="flex justify-center">
                  <img
                    src={getClubBadge(club.club)}
                    alt={`${club.club} badge`}
                    className="w-12 h-12 rounded-full shadow-lg bg-white object-contain border-2 border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                
                {/* Club Name */}
                <div className="text-sm font-bold text-white text-center leading-tight">
                  {club.club}
                </div>
                
                {/* Earnings - Green */}
                <div className="text-center">
                  <div className="text-xs text-green-400 font-medium">Earned</div>
                  <div className="text-sm font-bold text-green-400">
                    £{club.earnings.toFixed(1)}M
                  </div>
                </div>
                
                {/* Spending - Red */}
                <div className="text-center">
                  <div className="text-xs text-red-400 font-medium">Spent</div>
                  <div className="text-sm font-bold text-red-400">
                    £{club.spending.toFixed(1)}M
                  </div>
                </div>
                
                {/* Net Spend */}
                <div className="text-center border-t border-slate-600 pt-2 w-full">
                  <div className="text-xs text-blue-400 font-medium">Net</div>
                  <div className={`text-sm font-bold ${
                    club.netSpend > 0 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {club.netSpend > 0 ? '+' : ''}£{club.netSpend.toFixed(1)}M
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          {/* Show More Button */}
          {chartData.length > 8 && (
            <div className="flex items-center min-w-[120px]">
              <Button
                onClick={() => setShowAll(!showAll)}
                variant="outline"
                size="sm"
                className="border-blue-400/50 text-blue-400 hover:bg-blue-500/20 hover:border-blue-300"
              >
                {showAll ? 'Show Less' : `Show More (${chartData.length - 8})`}
              </Button>
            </div>
          )}
        </div>
        
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
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
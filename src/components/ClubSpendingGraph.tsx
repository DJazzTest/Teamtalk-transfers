import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList, ReferenceLine } from 'recharts';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
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

  // 3D Analog Gauge Component showing spending, earnings, and net spend
  const AnalogGauge = ({ club, maxSpending, index }: { club: any; maxSpending: number; index: number }) => {
    const spendingPercentage = maxSpending > 0 ? (club.spending / maxSpending) * 100 : 0;
    const earningsPercentage = maxSpending > 0 ? (club.earnings / maxSpending) * 100 : 0;
    const spendingAngle = (spendingPercentage / 100) * 270 - 135;
    const earningsAngle = (earningsPercentage / 100) * 270 - 135;
    
    // Create meaningful scale markers based on actual spending values
    const createScaleMarkers = () => {
      const step = Math.ceil(maxSpending / 5);
      return [
        { value: 0, label: '0' },
        { value: step, label: `${step}M` },
        { value: step * 2, label: `${step * 2}M` },
        { value: step * 3, label: `${step * 3}M` },
        { value: maxSpending, label: `${maxSpending}M` }
      ];
    };
    
    const scaleMarkers = createScaleMarkers();
    
    return (
      <div 
        className="flex-shrink-0 relative cursor-pointer hover:scale-105 transition-transform duration-300 mx-2 sm:mx-4"
        onClick={() => onSelectClub && onSelectClub(club.fullClub)}
      >
        {/* Football Pitch Background */}
        <div 
          className="w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 rounded-lg shadow-2xl"
          style={{
            background: `linear-gradient(145deg, #4CAF50, #45a049)`,
            backgroundImage: `
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              radial-gradient(circle at center, rgba(255,255,255,0.2) 20%, transparent 20%)
            `,
            backgroundSize: '10px 10px, 10px 10px, 20px 20px',
            transform: 'perspective(150px) rotateX(15deg)',
            border: '2px solid #2E7D32',
          }}
        />
        
        {/* Spending Hand - Red */}
        <div
          className="absolute w-2 sm:w-2.5 bg-red-500 rounded-full shadow-lg transition-transform duration-1000 ease-in-out"
          style={{
            height: '30px',
            top: '18%',
            left: '50%',
            transformOrigin: '50% 100%',
            transform: `translateX(-50%) translateY(-100%) rotate(${spendingAngle}deg)`,
            background: `linear-gradient(to top, #dc2626, #ef4444)`,
            border: '1px solid rgba(0,0,0,0.2)',
          }}
        />
        
        {/* Earnings Hand - Green */}
        <div
          className="absolute w-2 sm:w-2.5 bg-green-500 rounded-full shadow-lg transition-transform duration-1000 ease-in-out"
          style={{
            height: '25px',
            top: '18%',
            left: '50%',
            transformOrigin: '50% 100%',
            transform: `translateX(-50%) translateY(-100%) rotate(${earningsAngle}deg)`,
            background: `linear-gradient(to top, #16a34a, #22c55e)`,
            border: '1px solid rgba(0,0,0,0.2)',
          }}
        />
        
        {/* Center Circle */}
        <div 
          className="absolute w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm md:text-lg font-bold shadow-lg border-2 border-white"
          style={{ 
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: `linear-gradient(145deg, ${club.color}, #333333)`,
            color: '#ffffff',
            textShadow: '0 1px 3px rgba(0,0,0,0.5)'
          }}
        >
          £
        </div>
        
        {/* Digital displays */}
        <div 
          className="absolute -bottom-6 sm:-bottom-8 md:-bottom-12 left-1/2 transform -translate-x-1/2 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg text-xs sm:text-sm md:text-base font-bold text-white shadow-lg border border-white/20"
          style={{ 
            backgroundColor: '#dc2626',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}
        >
          Spent: £{club.spending}M
        </div>
        
        <div 
          className="absolute -bottom-12 sm:-bottom-16 md:-bottom-24 left-1/2 transform -translate-x-1/2 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg text-xs sm:text-sm md:text-base font-bold text-white shadow-lg border border-white/20"
          style={{ 
            backgroundColor: '#16a34a',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}
        >
          Earned: £{club.earnings}M
        </div>
        
        {/* Net Spend */}
        <div 
          className="absolute -bottom-18 sm:-bottom-24 md:-bottom-36 left-1/2 transform -translate-x-1/2 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg text-xs sm:text-sm md:text-base font-bold text-white shadow-lg border border-white/20"
          style={{ 
            backgroundColor: club.netSpend >= 0 ? '#dc2626' : '#16a34a',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}
        >
          Net: {club.netSpend >= 0 ? '+' : ''}£{club.netSpend}M
        </div>
        
        {/* Club Label */}
        <div 
          className="absolute -bottom-24 sm:-bottom-32 md:-bottom-48 left-1/2 transform -translate-x-1/2 text-center w-28 sm:w-36 md:w-48"
        >
          <div 
            className="text-xs sm:text-sm md:text-lg font-bold hover:underline leading-tight px-1 py-0.5 rounded bg-white/90 shadow-sm border border-gray-200"
            style={{ 
              color: club.color,
              textShadow: '0 1px 2px rgba(255,255,255,0.8)'
            }}
          >
            {club.fullClub}
          </div>
          <div className="text-xs sm:text-sm text-gray-700 mt-1 bg-white/80 rounded px-1 py-0.5 shadow-sm">
            #{index + 1} • Net: £{club.netSpend}M
          </div>
        </div>
      </div>
    );
  };

  // 3D Analog View Component - Mobile-Responsive Horizontal Scrollable Carousel
  const AnalogView = () => {
    const maxSpending = Math.max(...chartData.map(c => c.spending));
    const allClubs = chartData; // Show all clubs in carousel
    
    return (
      <div className="p-2 sm:p-4 md:p-6">
        {/* Carousel Container - Mobile optimized with better spacing */}
        <div className="relative">
          <div className="overflow-x-auto pb-6 sm:pb-8 md:pb-12 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
            <div 
              className="flex gap-4 sm:gap-6 md:gap-8 min-w-max px-3 sm:px-4 md:px-6" 
              style={{ paddingBottom: '120px' }}
            >
              {allClubs.map((club, index) => (
                <AnalogGauge 
                  key={club.fullClub} 
                  club={club} 
                  maxSpending={maxSpending} 
                  index={index} 
                />
              ))}
            </div>
          </div>
          
          {/* Mobile-friendly scroll indicators with better visibility */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-50 via-blue-50 to-transparent w-6 sm:w-8 md:w-10 h-full pointer-events-none opacity-80" />
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-l from-blue-50 via-blue-50 to-transparent w-6 sm:w-8 md:w-10 h-full pointer-events-none opacity-80" />
        </div>
        
        {/* Instructions - Mobile responsive with better contrast */}
        <div className="text-center text-gray-700 mb-3 sm:mb-4 bg-white/60 rounded-lg py-2 mx-4">
          <p className="text-xs sm:text-sm font-medium">
            <span className="hidden sm:inline">← Scroll horizontally to view all clubs →</span>
            <span className="sm:hidden">← Swipe to view all clubs →</span>
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Red Hand: Spending • Green Hand: Earnings • Net Spend shown below
          </p>
        </div>
      </div>
    );
  };

  return (
    <Card className="border-gray-200/50 shadow-lg mb-6" style={{ backgroundColor: '#d0e0f7' }}>
      <div className="p-3 sm:p-6">
        <div className="flex items-center justify-center mb-4">
          <h3 className="text-xl font-bold text-blue-700">Club Spending vs Earnings 2025/26</h3>
        </div>
        
        {/* Always show analog 3D view */}
        <AnalogView />
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

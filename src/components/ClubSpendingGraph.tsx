import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList, ReferenceLine } from 'recharts';
import { BarChart3, Gauge } from 'lucide-react';

import { allClubTransfers } from '@/data/transfers';

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
  // Always show analog 3D view
  // Calculate spending per club (incoming confirmed transfers only)
  const clubSpending = allClubTransfers
    .filter(t => t.status === 'confirmed' && premierLeagueClubs.includes(t.toClub))
    .reduce((acc, t) => {
      const fee = parseTransferFee(t.fee);
      if (fee > 0) {
        acc[t.toClub] = (acc[t.toClub] || 0) + fee;
      }
      return acc;
    }, {} as Record<string, number>);

  // Prepare chart data for all PL clubs (including zero spenders)
  const chartData = premierLeagueClubs.map((club, i) => {
    const spending = clubSpending[club] || 0;
    return {
      club: club.length > 15 ? club.substring(0, 15) + '...' : club,
      fullClub: club,
      spending: Number(spending.toFixed(2)),
      color: pastelColors[i % pastelColors.length],
    };
  }).sort((a, b) => b.spending - a.spending);

  // Total spend and confirmed signings
  const totalSpend = chartData.reduce((sum, c) => sum + c.spending, 0);
  const confirmedSignings = allClubTransfers.filter(t => t.status === 'confirmed' && premierLeagueClubs.includes(t.toClub) && parseTransferFee(t.fee) > 0).length;

  // 3D Analog Gauge Component (like Transfer Window Closes timer) - Responsive for mobile
  const AnalogGauge = ({ club, maxSpending, index }: { club: any; maxSpending: number; index: number }) => {
    const percentage = maxSpending > 0 ? (club.spending / maxSpending) * 100 : 0;
    const angle = (percentage / 100) * 270 - 135; // 270 degree range, starting from -135deg
    
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
        {/* 3D Base - Responsive sizing with bolder appearance */}
        <div 
          className="w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 rounded-full shadow-2xl"
          style={{
            background: `linear-gradient(145deg, #e8e8e8, #c0c0c0)`,
            transform: 'perspective(150px) rotateX(15deg)',
            border: '2px solid #a0a0a0',
          }}
        />
        
        {/* Clock Face - Responsive inset with better contrast */}
        <div 
          className="absolute inset-1.5 sm:inset-2 md:inset-3 rounded-full border-3 sm:border-4 md:border-5 flex items-center justify-center"
          style={{
            background: `radial-gradient(circle, #ffffff, #f0f0f0)`,
            borderColor: club.color,
            boxShadow: 'inset 0 3px 12px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {/* Spending scale markers with labels - responsive positioning */}
          {scaleMarkers.map((marker, i) => {
            const markerAngle = (marker.value / maxSpending) * 270 - 135;
            const isValidAngle = !isNaN(markerAngle) && isFinite(markerAngle);
            if (!isValidAngle) return null;
            
            return (
              <div key={i}>
                {/* Marker line - responsive sizing with better visibility */}
                <div
                  className="absolute w-1 sm:w-1.5 h-3 sm:h-4 md:h-6 bg-gray-800"
                  style={{
                    top: '4px',
                    left: '50%',
                    transformOrigin: '50% 48px',
                    transform: `translateX(-50%) rotate(${markerAngle}deg)`,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  }}
                />
                {/* Marker label - responsive text and positioning with better contrast */}
                <div
                  className="absolute text-xs sm:text-sm font-bold text-gray-900 bg-white/95 px-1 py-0.5 rounded shadow-sm border border-gray-200"
                  style={{
                    top: '8px',
                    left: '50%',
                    transformOrigin: '50% 42px',
                    transform: `translateX(-50%) rotate(${markerAngle}deg) translateY(42px) rotate(${-markerAngle}deg)`,
                  }}
                >
                  {marker.label}
                </div>
              </div>
            );
          })}
          
          {/* Spending Hand - responsive sizing with better visibility */}
          <div
            className="absolute w-2 sm:w-2.5 bg-red-500 rounded-full shadow-lg transition-transform duration-1000 ease-in-out"
            style={{
              height: '35px',
              top: '50%',
              left: '50%',
              transformOrigin: '50% 100%',
              transform: `translateX(-50%) translateY(-100%) rotate(${angle}deg)`,
              background: `linear-gradient(to top, ${club.color}, #dc2626)`,
              border: '1px solid rgba(0,0,0,0.2)',
            }}
          />
          
          {/* £ Symbol in Center - responsive sizing with better contrast */}
          <div 
            className="absolute w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm sm:text-lg md:text-2xl font-bold shadow-lg border-2 border-white"
            style={{ 
              background: `linear-gradient(145deg, ${club.color}, #333333)`,
              color: '#ffffff',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)'
            }}
          >
            £
          </div>
        </div>
        
        {/* Digital display - responsive sizing with better visibility */}
        <div 
          className="absolute -bottom-6 sm:-bottom-8 md:-bottom-12 left-1/2 transform -translate-x-1/2 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg text-xs sm:text-sm md:text-lg font-bold text-white shadow-lg border border-white/20"
          style={{ 
            backgroundColor: club.color,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}
        >
          £{club.spending}M
        </div>
        
        {/* Club Label - responsive and more visible with better spacing */}
        <div 
          className="absolute -bottom-12 sm:-bottom-16 md:-bottom-24 left-1/2 transform -translate-x-1/2 text-center w-28 sm:w-36 md:w-48"
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
          <div className="text-xs sm:text-sm text-gray-700 mt-1 bg-white/80 rounded px-1 py-0.5 shadow-sm">#{index + 1} • £{club.spending}M</div>
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
              style={{ paddingBottom: '60px' }}
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
        </div>
        
        {/* No revert button needed - always show analog */}
      </div>
    );
  };

  return (
    <Card className="border-gray-200/50 shadow-lg mb-6" style={{ backgroundColor: '#d0e0f7' }}>
      <div className="p-3 sm:p-6">
        <div className="flex items-center justify-center mb-4">
          <h3 className="text-xl font-bold text-blue-700">Club spending 2025/26</h3>
        </div>
        
        {/* Always show analog 3D view */}
        <AnalogView />
        <div className="mt-4 text-center">
          <span className="text-base font-semibold text-green-800">
            Total spending: £1.311 billion &nbsp;|&nbsp; Confirmed signings: 66 players
          </span>
        </div>
      </div>
    </Card>
  );
};

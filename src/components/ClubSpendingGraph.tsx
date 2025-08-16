import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clubSpending, clubEarnings, getNetSpend, allPremierLeagueClubs } from '@/data/clubFinancials';

// Club badge mapping - create initials from club names
const getClubBadge = (club: string): string => {
  const badgeMap: Record<string, string> = {
    'Arsenal': '/badges/arsenal.png',
    'Aston Villa': '/badges/astonvilla.png',
    'Bournemouth': '/badges/bournemouth.png',
    'Brentford': '/badges/brentford.png',
    'Brighton & Hove Albion': '/badges/brightonhovealbion.png',
    'Burnley': '/badges/burnley.png',
    'Chelsea': '/badges/chelsea.png',
    'Crystal Palace': '/badges/crystalpalace.png',
    'Everton': '/badges/everton.png',
    'Fulham': '/badges/fulham.png',
    'Liverpool': '/badges/liverpool.png',
    'Manchester City': '/badges/manchestercity.png',
    'Manchester United': '/badges/manchesterunited.png',
    'Newcastle United': '/badges/newcastleunited.png',
    'Nottingham Forest': '/badges/nottinghamforest.png',
    'Sunderland': '/badges/sunderland.png',
    'Tottenham Hotspur': '/badges/tottenhamhotspur.png',
    'West Ham United': '/badges/westhamunited.png',
    'Wolverhampton Wanderers': '/badges/wolverhamptonwanderers.png'
  };
  return badgeMap[club] || '';
};

const getClubInitials = (club: string): string => {
  return club.split(' ').map(word => word[0]).join('').substring(0, 2);
};

interface ClubSpendingGraphProps {
  onSelectClub?: (club: string) => void;
}

export const ClubSpendingGraph: React.FC<ClubSpendingGraphProps> = ({ onSelectClub }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 8; // Show 8 clubs at a time

  // Prepare chart data showing spending, earnings, and net spend
  const chartData = allPremierLeagueClubs.map((club, i) => {
    const spending = clubSpending[club as keyof typeof clubSpending] || 0;
    const earnings = clubEarnings[club as keyof typeof clubEarnings] || 0;
    const netSpend = getNetSpend(club);
    
    return {
      club: club.length > 12 ? club.substring(0, 12) + '...' : club,
      fullClub: club,
      spending: Number(spending.toFixed(1)),
      earnings: Number(earnings.toFixed(1)),
      netSpend: Number(netSpend.toFixed(1)),
      badge: getClubBadge(club),
      initials: getClubInitials(club)
    };
  }).sort((a, b) => b.netSpend - a.netSpend); // Sort by net spend (highest first)

  // Get current slice of data
  const currentData = chartData.slice(currentIndex, currentIndex + itemsPerView);
  
  const canGoLeft = currentIndex > 0;
  const canGoRight = currentIndex + itemsPerView < chartData.length;

  const goLeft = () => {
    if (canGoLeft) {
      setCurrentIndex(Math.max(0, currentIndex - itemsPerView));
    }
  };

  const goRight = () => {
    if (canGoRight) {
      setCurrentIndex(Math.min(chartData.length - itemsPerView, currentIndex + itemsPerView));
    }
  };

  // Total spend and earnings
  const totalSpend = chartData.reduce((sum, c) => sum + c.spending, 0);
  const totalEarnings = chartData.reduce((sum, c) => sum + c.earnings, 0);
  const totalNetSpend = totalSpend - totalEarnings;

  // Custom tick component for XAxis with club badges
  const CustomXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const clubData = chartData.find(d => d.club === payload.value);
    
    return (
      <g transform={`translate(${x},${y})`}>
        {/* Club badge or initials */}
        <g transform="translate(0, 10)">
          {clubData?.badge ? (
            <image 
              x={-12} 
              y={0} 
              width={24} 
              height={24} 
              href={clubData.badge}
              onError={(e) => {
                // Fallback to initials on image error
                const target = e.target as SVGImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <circle cx={0} cy={12} r={12} fill="#3B82F6" />
          )}
          {(!clubData?.badge || clubData.badge === '') && (
            <text 
              x={0} 
              y={17} 
              textAnchor="middle" 
              fill="white" 
              fontSize="8" 
              fontWeight="bold"
            >
              {clubData?.initials}
            </text>
          )}
        </g>
        {/* Club name */}
        <text 
          x={0} 
          y={45} 
          textAnchor="middle" 
          fill="#E5E7EB" 
          fontSize="10"
          transform="rotate(-45)"
        >
          {payload.value}
        </text>
      </g>
    );
  };

  // Bar Chart View with spending (red) and earnings (green)
  const BarChartView = () => {
    return (
      <div className="relative">
        {/* Navigation buttons */}
        <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goLeft}
            disabled={!canGoLeft}
            className="bg-white/80 hover:bg-white/90"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-sm text-gray-600 bg-white/80 px-2 py-1 rounded">
            {currentIndex + 1}-{Math.min(currentIndex + itemsPerView, chartData.length)} of {chartData.length}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={goRight}
            disabled={!canGoRight}
            className="bg-white/80 hover:bg-white/90"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="h-96 pt-12">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="club" 
                tick={<CustomXAxisTick />}
                height={100}
                interval={0}
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
                onClick={(data) => onSelectClub && onSelectClub(data.fullClub)}
                cursor="pointer"
              >
                {currentData.map((entry, index) => (
                  <Cell key={`spending-${index}`} fill="#DC2626" />
                ))}
              </Bar>
              <Bar 
                dataKey="earnings" 
                name="Earnings"
                radius={[4, 4, 0, 0]}
                onClick={(data) => onSelectClub && onSelectClub(data.fullClub)}
                cursor="pointer"
              >
                {currentData.map((entry, index) => (
                  <Cell key={`earnings-${index}`} fill="#16A34A" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <Card className="border-gray-200/50 shadow-lg mb-6 relative overflow-hidden" style={{ backgroundColor: '#d0e0f7' }}>
      {/* Football pitch background */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.3) 0%, transparent 50%),
            linear-gradient(90deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 25%, rgba(34, 197, 94, 0.05) 75%, rgba(34, 197, 94, 0.1) 100%),
            linear-gradient(0deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 25%, rgba(34, 197, 94, 0.05) 75%, rgba(34, 197, 94, 0.1) 100%)
          `,
          backgroundSize: '100% 100%, 100% 100%, 100% 100%'
        }}
      />
      
      <div className="relative p-3 sm:p-6">
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
        
        <div className="text-center text-gray-600 text-xs mt-2">
          <span className="hidden sm:inline">← Use arrow buttons to navigate through clubs →</span>
          <span className="sm:hidden">← Navigate through clubs →</span>
        </div>
      </div>
    </Card>
  );
};

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
        {/* Club badge or initials - larger and clearer */}
        <g transform="translate(0, 10)">
          {clubData?.badge ? (
            <image 
              x={-28} 
              y={0} 
              width={56} 
              height={56} 
              href={clubData.badge}
              onError={(e) => {
                // Fallback to initials on image error
                const target = e.target as SVGImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <circle cx={0} cy={28} r={28} fill="hsl(var(--primary))" />
          )}
          {(!clubData?.badge || clubData.badge === '') && (
            <text 
              x={0} 
              y={35} 
              textAnchor="middle" 
              fill="hsl(var(--primary-foreground))" 
              fontSize="16" 
              fontWeight="bold"
            >
              {clubData?.initials}
            </text>
          )}
        </g>
        {/* Club name - horizontal, green text, clear and readable */}
        <text 
          x={0} 
          y={85} 
          textAnchor="middle" 
          fill="hsl(var(--success))" 
          fontSize="14"
          fontWeight="800"
          className="drop-shadow-lg"
          style={{ textShadow: '2px 2px 4px hsl(var(--background) / 0.9)' }}
        >
          {clubData?.fullClub}
        </text>
      </g>
    );
  };

  // Bar Chart View with spending (red) and earnings (green) - Mobile Friendly Horizontal Scroll
  const BarChartView = () => {
    return (
      <div className="relative">
        {/* Scroll indicator */}
        <div className="text-center mb-2">
          <div className="inline-flex items-center gap-2 bg-success/10 px-4 py-2 rounded-full">
            <span className="text-success font-semibold text-sm">
              📊 Scroll horizontally to view all clubs
            </span>
          </div>
        </div>
        
        <div className="h-96 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-success scrollbar-track-muted"
        >
          <div style={{ width: `${chartData.length * 140}px`, minWidth: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 110 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="club" 
                  tick={<CustomXAxisTick />}
                  height={120}
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: 'hsl(var(--foreground))', fontWeight: '600' }}
                  label={{ value: 'Amount (£M)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'hsl(var(--foreground))', fontWeight: '600' } }}
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
                    backgroundColor: 'hsl(var(--success) / 0.95)',
                    border: '2px solid hsl(var(--border))',
                    borderRadius: '12px',
                    color: 'hsl(var(--success-foreground))',
                    fontWeight: '600',
                    boxShadow: '0 10px 25px hsl(var(--foreground) / 0.2)'
                  }}
                />
                <Bar 
                  dataKey="spending" 
                  name="Spending"
                  radius={[6, 6, 0, 0]}
                  onClick={(data) => onSelectClub && onSelectClub(data.fullClub)}
                  cursor="pointer"
                  maxBarSize={30}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`spending-${index}`} fill="hsl(var(--destructive))" />
                  ))}
                </Bar>
                <Bar 
                  dataKey="earnings" 
                  name="Earnings"
                  radius={[6, 6, 0, 0]}
                  onClick={(data) => onSelectClub && onSelectClub(data.fullClub)}
                  cursor="pointer"
                  maxBarSize={30}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`earnings-${index}`} fill="hsl(var(--success))" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Mobile scroll hint */}
        <div className="text-center text-muted-foreground text-xs mt-2">
          <span className="hidden sm:inline">💡 Click on bars to view club details</span>
          <span className="sm:hidden">💡 Tap bars for club details • Swipe to scroll</span>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-card border-border shadow-lg mb-6 relative overflow-hidden">
      {/* Football pitch background */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, hsl(var(--success) / 0.3) 0%, transparent 50%),
            linear-gradient(90deg, hsl(var(--success) / 0.1) 0%, hsl(var(--success) / 0.05) 25%, hsl(var(--success) / 0.05) 75%, hsl(var(--success) / 0.1) 100%),
            linear-gradient(0deg, hsl(var(--success) / 0.1) 0%, hsl(var(--success) / 0.05) 25%, hsl(var(--success) / 0.05) 75%, hsl(var(--success) / 0.1) 100%)
          `,
          backgroundSize: '100% 100%, 100% 100%, 100% 100%'
        }}
      />
      
      <div className="relative p-3 sm:p-6">
        <div className="flex items-center justify-center mb-4">
          <h3 className="text-xl font-bold text-primary">Club Spending vs Earnings 2025/26</h3>
        </div>
        
        {/* Show bar chart view */}
        <BarChartView />
        
        <div className="mt-4 text-center space-y-1">
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-destructive" />
              <span className="text-sm font-semibold text-destructive">
                Total spending: £{totalSpend.toFixed(1)}B
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-success" />
              <span className="text-sm font-semibold text-success">
                Total earnings: £{totalEarnings.toFixed(1)}B
              </span>
            </div>
          </div>
          <span className="text-base font-semibold text-primary">
            Net spend: £{totalNetSpend.toFixed(1)}B
          </span>
        </div>
        
        <div className="text-center text-muted-foreground text-xs mt-2">
          <span className="hidden sm:inline">← Scroll horizontally to view all clubs →</span>
          <span className="sm:hidden">← Scroll to view all →</span>
        </div>
      </div>
    </Card>
  );
};

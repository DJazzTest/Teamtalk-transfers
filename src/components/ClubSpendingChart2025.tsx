import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface ClubSpendingChart2025Props {
  onSelectClub?: (club: string) => void;
}

const clubSpendingData = [
  { club: 'Chelsea', spending: 195, fullClub: 'Chelsea' },
  { club: 'Liverpool', spending: 170, fullClub: 'Liverpool' },
  { club: 'Brighton', spending: 105.8, fullClub: 'Brighton & Hove Albion' },
  { club: 'Wolves', spending: 64, fullClub: 'Wolverhampton Wanderers' },
  { club: 'Brentford', spending: 60, fullClub: 'Brentford' },
  { club: 'West Ham', spending: 55, fullClub: 'West Ham United' },
  { club: 'Southampton', spending: 50, fullClub: 'Southampton' },
  { club: 'Leicester', spending: 46, fullClub: 'Leicester City' },
  { club: 'Tottenham', spending: 42, fullClub: 'Tottenham Hotspur' },
  { club: 'Bournemouth', spending: 40, fullClub: 'Bournemouth' },
  { club: 'Nottm Forest', spending: 30, fullClub: 'Nottingham Forest' },
  { club: 'Man City', spending: 28, fullClub: 'Manchester City' },
  { club: 'Arsenal', spending: 6.7, fullClub: 'Arsenal' },
  { club: 'Crystal Palace', spending: 2, fullClub: 'Crystal Palace' },
  { club: 'Fulham', spending: 1, fullClub: 'Fulham' },
  { club: 'Newcastle', spending: 0, fullClub: 'Newcastle United' },
  { club: 'Aston Villa', spending: 0, fullClub: 'Aston Villa' },
  { club: 'Everton', spending: 3, fullClub: 'Everton' },
  { club: 'Burnley', spending: 5, fullClub: 'Burnley' },
  { club: 'Sunderland', spending: 2, fullClub: 'Sunderland' }
];

const getBarColor = (spending: number): string => {
  if (spending >= 100) return '#DC2626'; // Red for £100m+
  if (spending >= 50) return '#F97316'; // Orange for £50-99m
  if (spending >= 25) return '#EAB308'; // Yellow for £25-49m
  if (spending >= 10) return '#22C55E'; // Green for £10-24m
  return '#9CA3AF'; // Gray for under £10m
};

export const ClubSpendingChart2025: React.FC<ClubSpendingChart2025Props> = ({ onSelectClub }) => {
  const totalSpending = clubSpendingData.reduce((sum, club) => sum + club.spending, 0);

  const handleBarClick = (data: any) => {
    if (onSelectClub) {
      onSelectClub(data.fullClub);
    }
  };

  const getBadgePath = (club: string): string => {
    const clubMap: { [key: string]: string } = {
      'Chelsea': '/badges/chelsea.png',
      'Liverpool': '/badges/liverpool.png',
      'Brighton': '/badges/brightonhovealbion.png',
      'Wolves': '/badges/wolverhamptonwanderers.png',
      'Brentford': '/badges/brentford.png',
      'West Ham': '/badges/westhamunited.png',
      'Tottenham': '/badges/tottenhamhotspur.png',
      'Bournemouth': '/badges/bournemouth.png',
      'Nottm Forest': '/badges/nottinghamforest.png',
      'Man City': '/badges/manchestercity.png',
      'Crystal Palace': '/badges/crystalpalace.png',
      'Fulham': '/badges/fulham.png',
      'Newcastle': '/badges/newcastleunited.png',
      'Aston Villa': '/badges/astonvilla.png',
      'Everton': '/badges/everton.png',
      'Burnley': '/badges/burnley.png',
      'Sunderland': '/badges/sunderland.png'
    };
    return clubMap[club] || '';
  };

  return (
    <Card className="border-gray-200/50 shadow-lg mb-6" style={{ backgroundColor: '#2F517A' }}>
      <div className="p-3 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-green-100 p-2 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-400">Club Spending 2025/26 Summer Window</h3>
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-[800px] h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clubSpendingData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="club" 
                  angle={0} 
                  textAnchor="middle" 
                  height={80}
                  tick={{ fontSize: 11, fill: '#22C55E' }}
                  interval={0}
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
                  onClick={handleBarClick}
                  style={{ cursor: onSelectClub ? 'pointer' : 'default' }}
                  fill="#22C55E"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Club badges row */}
        <div className="overflow-x-auto mt-2">
          <div className="min-w-[800px] flex justify-between items-center px-[50px]">
            {clubSpendingData.map((club, index) => (
              <div key={index} className="flex flex-col items-center" style={{ width: `${100/clubSpendingData.length}%` }}>
                {getBadgePath(club.club) && (
                  <img 
                    src={getBadgePath(club.club)} 
                    alt={`${club.club} badge`}
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-green-300">
            Total summer window spending: £{totalSpending.toFixed(1)}M across all clubs
          </p>
          <p className="text-xs text-green-400 mt-1">
            Estimated total income from player sales: ~£1.3 billion
          </p>
          <p className="text-xs text-green-500 mt-1">
            ← Scroll horizontally to view all clubs →
          </p>
        </div>
      </div>
    </Card>
  );
};
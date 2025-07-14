import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList, ReferenceLine } from 'recharts';

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

export const ClubSpendingGraph: React.FC = () => {
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

  return (
    <Card className="border-gray-200/50 shadow-lg mb-6" style={{ backgroundColor: '#d0e0f7' }}>
      <div className="p-3 sm:p-6">
        <h3 className="text-xl font-bold text-center text-blue-700 mb-4">Club spending 2025/26</h3>
        <div className="h-96 overflow-x-auto">
          <ResponsiveContainer width={chartData.length * 70} height="100%" minWidth={600}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <ReferenceLine y={0} stroke="#22c55e" strokeWidth={3} />
              <XAxis
                dataKey="club"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12, fill: '#2563eb', fontWeight: 700 }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#333' }}
                label={{ value: 'Spending (£M)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#2563eb', fontWeight: 700 } }}
                domain={[0, 'auto']}
              />
              <Bar dataKey="spending" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="spending"
                  position="right"
                  content={({ x, y, width, height, value }) => {
                    if (!value || value === 0) return null;
                    const xNum = typeof x === 'number' ? x : parseFloat(String(x));
                    const yNum = typeof y === 'number' ? y : parseFloat(String(y));
                    const widthNum = typeof width === 'number' ? width : parseFloat(String(width));
                    const heightNum = typeof height === 'number' ? height : parseFloat(String(height));
                    const minBarWidthForLabel = 28;
                    if (widthNum < minBarWidthForLabel) return null;
                    let fontSize = 14;
                    let labelText = `£${value}M`;
                    let textWidth = labelText.length * fontSize * 0.6;
                    if (textWidth > widthNum - 6) {
                      fontSize = 11;
                      textWidth = labelText.length * fontSize * 0.6;
                    }
                    if (textWidth > widthNum - 6) {
                      fontSize = 9;
                      textWidth = labelText.length * fontSize * 0.6;
                    }
                    if (textWidth > widthNum - 6) return null;
                    const labelX = xNum + widthNum / 2;
                    const labelY = yNum + heightNum / 2 + 5;
                    return (
                      <text
                        x={labelX}
                        y={labelY}
                        fontSize={fontSize}
                        fontWeight={700}
                        fill="#222"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        style={{ pointerEvents: 'none' }}
                      >
                        {labelText}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-center">
          <span className="text-base font-semibold text-green-800">
            Total spending: £{totalSpend.toLocaleString(undefined, { maximumFractionDigits: 2 })}M &nbsp;|&nbsp; Confirmed signings: {confirmedSignings}
          </span>
        </div>
      </div>
    </Card>
  );
};

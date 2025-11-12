import React from 'react';
import { Card } from '@/components/ui/card';
import { CompetitionStats } from '@/data/squadWages';

interface PlayerStatsHexagonProps {
  competitions: CompetitionStats[];
  isGoalkeeper: boolean;
  injuries?: string;
  totalMatches: number;
  totalMinutes: number;
  totalCleanSheets?: number;
  totalGoalsConceded?: number;
  totalGoals?: number;
}

export const PlayerStatsHexagon: React.FC<PlayerStatsHexagonProps> = ({
  competitions,
  isGoalkeeper,
  injuries,
  totalMatches,
  totalMinutes,
  totalCleanSheets,
  totalGoalsConceded,
  totalGoals
}) => {
  // Calculate normalized values for hexagon (0-100 scale)
  // Handle empty arrays to prevent Math.max errors
  const matchValues = competitions.length > 0 
    ? [...competitions.map(c => c.matches), totalMatches]
    : [totalMatches];
  const maxMatches = Math.max(...matchValues, 0);
  
  const minuteValues = competitions.length > 0
    ? [...competitions.map(c => c.minutes), totalMinutes]
    : [totalMinutes];
  const maxMinutes = Math.max(...minuteValues, 0);
  
  const cleanSheetValues = isGoalkeeper && competitions.length > 0
    ? [...competitions.map(c => c.cleanSheets || 0), totalCleanSheets || 0]
    : [totalCleanSheets || 0];
  const maxCleanSheets = isGoalkeeper ? Math.max(...cleanSheetValues, 0) : 0;
  
  const goalsConcededValues = isGoalkeeper && competitions.length > 0
    ? [...competitions.map(c => c.goalsConceded || 0), totalGoalsConceded || 0]
    : [totalGoalsConceded || 0];
  const maxGoalsConceded = isGoalkeeper ? Math.max(...goalsConcededValues, 0) : 0;
  
  const goalValues = !isGoalkeeper && competitions.length > 0
    ? [...competitions.map(c => c.goals || 0), totalGoals || 0]
    : [totalGoals || 0];
  const maxGoals = !isGoalkeeper ? Math.max(...goalValues, 0) : 0;

  // Normalize to 0-100 for hexagon display
  const normalize = (value: number, max: number) => max > 0 ? Math.min(100, (value / max) * 100) : 0;

  const matchesValue = normalize(totalMatches, maxMatches || 1);
  const minutesValue = normalize(totalMinutes, maxMinutes || 1);
  const cleanSheetsValue = isGoalkeeper ? normalize(totalCleanSheets || 0, maxCleanSheets || 1) : 0;
  const goalsConcededValue = isGoalkeeper ? normalize(totalGoalsConceded || 0, maxGoalsConceded || 1) : 0;
  const goalsValue = !isGoalkeeper ? normalize(totalGoals || 0, maxGoals || 1) : 0;
  // Injuries: 100 if no injuries, lower if injured (inverted - no injuries is good)
  const hasInjuries = injuries && !injuries.toLowerCase().includes('no time') && !injuries.toLowerCase().includes('no injury');
  const injuriesValue = hasInjuries ? 30 : 100; // 100 = no injuries (good), 30 = injured (bad)

  // Hexagon points (6 points for 6 metrics)
  const centerX = 150;
  const centerY = 150;
  const radius = 100;

  const getHexagonPoint = (index: number, value: number) => {
    const angle = (index * Math.PI * 2) / 6 - Math.PI / 2; // Start from top
    const r = (value / 100) * radius;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle)
    };
  };

  // For goalkeepers: Matches, Minutes, Clean Sheets, Goals Conceded, Injuries, Performance
  // For others: Matches, Minutes, Goals, Assists, Injuries, Performance
  const points = isGoalkeeper
    ? [
        getHexagonPoint(0, matchesValue),           // Top: Matches
        getHexagonPoint(1, minutesValue),           // Top-right: Minutes
        getHexagonPoint(2, cleanSheetsValue),       // Bottom-right: Clean Sheets
        getHexagonPoint(3, 100 - goalsConcededValue), // Bottom: Goals Conceded (inverted - lower is better)
        getHexagonPoint(4, injuriesValue),           // Bottom-left: Injuries (100 = no injuries, good)
        getHexagonPoint(5, matchesValue)            // Top-left: Matches (close)
      ]
    : [
        getHexagonPoint(0, matchesValue),           // Top: Matches
        getHexagonPoint(1, minutesValue),           // Top-right: Minutes
        getHexagonPoint(2, goalsValue),             // Bottom-right: Goals
        getHexagonPoint(3, injuriesValue),          // Bottom: Injuries (100 = no injuries, good)
        getHexagonPoint(4, matchesValue),          // Bottom-left: Matches
        getHexagonPoint(5, matchesValue)            // Top-left: Matches
      ];

  const hexagonPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  // Grid lines for reference
  const gridLines = [25, 50, 75, 100].map(percent => {
    const r = (percent / 100) * radius;
    const points = Array.from({ length: 6 }, (_, i) => {
      const angle = (i * Math.PI * 2) / 6 - Math.PI / 2;
      return {
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle)
      };
    });
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
    return { path, percent };
  });

  return (
    <Card className="p-6 bg-slate-700/50 border-slate-600">
      <h3 className="text-lg font-semibold text-white mb-6 text-center">
        2025–26 Season Performance
      </h3>
      
      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        {/* Hexagon Visualization */}
        <div className="relative flex-shrink-0">
          <svg width="300" height="300" viewBox="0 0 300 300" className="transform">
            {/* Grid lines */}
            {gridLines.map((grid, i) => (
              <path
                key={i}
                d={grid.path}
                fill="none"
                stroke="rgba(148, 163, 184, 0.2)"
                strokeWidth="1"
              />
            ))}
            
            {/* Hexagon fill */}
            <path
              d={hexagonPath}
              fill="rgba(59, 130, 246, 0.3)"
              stroke="rgba(59, 130, 246, 0.8)"
              strokeWidth="2"
            />
            
            {/* Center point */}
            <circle cx={centerX} cy={centerY} r="4" fill="rgba(59, 130, 246, 1)" />
            
            {/* Labels - positioned around hexagon */}
            {isGoalkeeper ? (
              <>
                <text x={centerX} y={30} textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="600">
                  Matches
                </text>
                <text x={centerX} y={45} textAnchor="middle" fill="#94a3b8" fontSize="10">
                  {totalMatches}
                </text>
                <text x={260} y={centerY - 5} textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="600">
                  Minutes
                </text>
                <text x={260} y={centerY + 10} textAnchor="middle" fill="#94a3b8" fontSize="10">
                  {totalMinutes}
                </text>
                <text x={centerX} y={270} textAnchor="middle" fill="#f87171" fontSize="11" fontWeight="600">
                  Goals Conceded
                </text>
                <text x={centerX} y={285} textAnchor="middle" fill="#94a3b8" fontSize="10">
                  {totalGoalsConceded || 0}
                </text>
                <text x={40} y={centerY - 5} textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="600">
                  Clean Sheets
                </text>
                <text x={40} y={centerY + 10} textAnchor="middle" fill="#94a3b8" fontSize="10">
                  {totalCleanSheets || 0}
                </text>
                <text x={40} y={270} textAnchor="middle" fill={hasInjuries ? "#f87171" : "#34d399"} fontSize="11" fontWeight="600">
                  Injuries
                </text>
                <text x={40} y={285} textAnchor="middle" fill="#94a3b8" fontSize="10">
                  {hasInjuries ? 'Yes' : 'None'}
                </text>
              </>
            ) : (
              <>
                <text x={centerX} y={30} textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="600">
                  Matches
                </text>
                <text x={centerX} y={45} textAnchor="middle" fill="#94a3b8" fontSize="10">
                  {totalMatches}
                </text>
                <text x={260} y={centerY - 5} textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="600">
                  Minutes
                </text>
                <text x={260} y={centerY + 10} textAnchor="middle" fill="#94a3b8" fontSize="10">
                  {totalMinutes}
                </text>
                <text x={centerX} y={270} textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="600">
                  Goals
                </text>
                <text x={centerX} y={285} textAnchor="middle" fill="#94a3b8" fontSize="10">
                  {totalGoals || 0}
                </text>
                <text x={40} y={270} textAnchor="middle" fill={hasInjuries ? "#f87171" : "#34d399"} fontSize="11" fontWeight="600">
                  Injuries
                </text>
                <text x={40} y={285} textAnchor="middle" fill="#94a3b8" fontSize="10">
                  {hasInjuries ? 'Yes' : 'None'}
                </text>
              </>
            )}
          </svg>
        </div>

        {/* Stats Breakdown */}
        <div className="flex-1 space-y-4">
          {competitions.map((comp, index) => (
            <div key={index} className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white">{comp.competition}</h4>
                <span className="text-sm text-gray-400">
                  {comp.matches} {comp.matches === 1 ? 'match' : 'matches'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-gray-400">Minutes:</span>
                  <span className="text-white font-medium">{comp.minutes.toLocaleString()}</span>
                </div>
                {isGoalkeeper && comp.cleanSheets !== undefined && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-gray-400">Clean sheets:</span>
                      <span className="text-white font-medium">{comp.cleanSheets}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-gray-400">Goals conceded:</span>
                      <span className="text-white font-medium">{comp.goalsConceded || 0}</span>
                    </div>
                  </>
                )}
                {!isGoalkeeper && comp.goals !== undefined && comp.goals > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-gray-400">Goals:</span>
                    <span className="text-white font-medium">{comp.goals}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Total Summary */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-4 border border-blue-500/30">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-white">Total</h4>
              <span className="text-sm text-gray-300 font-medium">
                {totalMatches} matches • {totalMinutes.toLocaleString()} minutes
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {isGoalkeeper && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-300">Clean sheets:</span>
                    <span className="text-white font-semibold">{totalCleanSheets || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-300">Goals conceded:</span>
                    <span className="text-white font-semibold">{totalGoalsConceded || 0}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Injuries */}
          {injuries && (
            <div className={`rounded-lg p-4 border ${
              injuries.toLowerCase().includes('no time') || injuries.toLowerCase().includes('no injury')
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  injuries.toLowerCase().includes('no time') || injuries.toLowerCase().includes('no injury')
                    ? 'bg-green-500'
                    : 'bg-red-500'
                }`}></div>
                <span className="text-sm font-semibold text-white">Injuries</span>
              </div>
              <p className="text-sm text-gray-300 mt-2">{injuries}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};


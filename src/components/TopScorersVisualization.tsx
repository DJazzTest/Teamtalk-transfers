import React from 'react';

interface TopScorer {
  name: string;
  goals: number;
}

interface TopScorersVisualizationProps {
  scorers: TopScorer[];
}

export const TopScorersVisualization: React.FC<TopScorersVisualizationProps> = ({ scorers }) => {
  if (scorers.length === 0) {
    return (
      <p className="text-slate-300 text-sm text-center py-8">No scorer data available yet.</p>
    );
  }

  // Show top 6 scorers in the radar chart, but all scorers in the legend
  const radarScorers = scorers.slice(0, Math.min(6, scorers.length));
  const maxGoals = scorers[0]?.goals || 1;
  const numAxes = radarScorers.length;

  // Radar chart dimensions - smaller for better fit
  const centerX = 150;
  const centerY = 150;
  const radius = 110;
  const svgSize = 320;

  // Calculate angle for each axis
  const getAxisAngle = (index: number) => {
    return (index * Math.PI * 2) / numAxes - Math.PI / 2; // Start from top
  };

  // Get point on axis at a certain distance from center
  const getPointOnAxis = (index: number, distance: number) => {
    const angle = getAxisAngle(index);
    return {
      x: centerX + distance * Math.cos(angle),
      y: centerY + distance * Math.sin(angle)
    };
  };

  // Get color for top 3
  const getScorerColor = (index: number) => {
    switch (index) {
      case 0:
        return { fill: 'rgba(234, 179, 8, 0.3)', stroke: 'rgba(234, 179, 8, 0.8)', text: '#fbbf24', label: '#fbbf24' };
      case 1:
        return { fill: 'rgba(156, 163, 175, 0.3)', stroke: 'rgba(156, 163, 175, 0.8)', text: '#9ca3af', label: '#9ca3af' };
      case 2:
        return { fill: 'rgba(234, 88, 12, 0.3)', stroke: 'rgba(234, 88, 12, 0.8)', text: '#ea580c', label: '#ea580c' };
      default:
        return { fill: 'rgba(59, 130, 246, 0.2)', stroke: 'rgba(59, 130, 246, 0.6)', text: '#60a5fa', label: '#94a3b8' };
    }
  };

  // Create polygon path for a scorer
  const createPolygonPath = (scorer: TopScorer, index: number) => {
    const normalizedValue = (scorer.goals / maxGoals) * radius;
    const point = getPointOnAxis(index, normalizedValue);
    return point;
  };

  // Grid lines (concentric circles)
  const gridLevels = [25, 50, 75, 100].map(percent => {
    const r = (percent / 100) * radius;
    const points = radarScorers.map((_, i) => getPointOnAxis(i, r));
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
    return { path, percent, radius: r };
  });

  // Axis lines
  const axisLines = radarScorers.map((_, i) => {
    const endPoint = getPointOnAxis(i, radius);
    return {
      x1: centerX,
      y1: centerY,
      x2: endPoint.x,
      y2: endPoint.y
    };
  });

  return (
    <div className="flex flex-col items-center w-full px-2">
      {/* Radar Chart */}
      <div className="relative mb-5 flex justify-center w-full">
        <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} className="transform">
          {/* Grid lines */}
          {gridLevels.map((grid, i) => (
            <path
              key={i}
              d={grid.path}
              fill="none"
              stroke="rgba(148, 163, 184, 0.15)"
              strokeWidth="1"
            />
          ))}

          {/* Axis lines */}
          {axisLines.map((line, i) => (
            <line
              key={i}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="rgba(148, 163, 184, 0.2)"
              strokeWidth="1"
            />
          ))}

          {/* Main data polygon - connects all scorers */}
          {(() => {
            const polygonPoints = radarScorers.map((scorer, i) => {
              const normalizedValue = (scorer.goals / maxGoals) * radius;
              return getPointOnAxis(i, normalizedValue);
            });
            const path = polygonPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
            
            return (
              <path
                d={path}
                fill="rgba(59, 130, 246, 0.2)"
                stroke="rgba(59, 130, 246, 0.8)"
                strokeWidth="2"
              />
            );
          })()}

          {/* Individual data points with colors for top 3 */}
          {radarScorers.map((scorer, scorerIndex) => {
            const colors = getScorerColor(scorerIndex);
            const normalizedValue = (scorer.goals / maxGoals) * radius;
            const point = getPointOnAxis(scorerIndex, normalizedValue);
            
            return (
              <g key={scorerIndex}>
                {/* Data point circle */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth="2"
                />
              </g>
            );
          })}

          {/* Center point */}
          <circle cx={centerX} cy={centerY} r="4" fill="rgba(148, 163, 184, 0.5)" />

          {/* Player name labels at the end of each axis */}
          {radarScorers.map((scorer, i) => {
            const colors = getScorerColor(i);
            const labelPoint = getPointOnAxis(i, radius + 25);
            const angle = getAxisAngle(i);
            
            // Adjust text anchor based on angle
            let textAnchor: 'start' | 'middle' | 'end' = 'middle';
            if (angle > -Math.PI / 3 && angle < Math.PI / 3) {
              textAnchor = 'middle'; // Top
            } else if (angle > Math.PI / 3 && angle < (2 * Math.PI) / 3) {
              textAnchor = 'start'; // Right
            } else if (angle < -Math.PI / 3 && angle > -(2 * Math.PI) / 3) {
              textAnchor = 'end'; // Left
            } else {
              textAnchor = 'middle'; // Bottom
            }

            // Shorten name if too long
            const displayName = scorer.name.length > 15 
              ? scorer.name.split(' ').map(n => n[0]).join('.') 
              : scorer.name;

            return (
              <g key={`label-${i}`}>
                <text
                  x={labelPoint.x}
                  y={labelPoint.y}
                  textAnchor={textAnchor}
                  fill={colors.label}
                  fontSize="11"
                  fontWeight="600"
                  className="drop-shadow-md"
                >
                  {displayName}
                </text>
                {/* Goal count box below name */}
                <rect
                  x={labelPoint.x - 18}
                  y={labelPoint.y + 4}
                  width="36"
                  height="16"
                  rx="3"
                  fill={colors.fill.replace('0.3', '0.5')}
                  stroke={colors.stroke}
                  strokeWidth="1.5"
                />
                <text
                  x={labelPoint.x}
                  y={labelPoint.y + 15}
                  textAnchor="middle"
                  fill={colors.text}
                  fontSize="9"
                  fontWeight="700"
                >
                  {scorer.goals}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend/Summary - Show ALL scorers */}
      <div className="w-full space-y-1 max-h-64 overflow-y-auto">
        {scorers.map((scorer, i) => {
          const colors = getScorerColor(i);
          const percentage = (scorer.goals / maxGoals) * 100;
          
          return (
            <div
              key={scorer.name}
              className="flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-700/30 border border-slate-600/30 hover:bg-slate-700/40 transition-colors"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: colors.stroke,
                      boxShadow: `0 0 4px ${colors.stroke}`
                    }}
                  />
                  <span className="text-slate-400 text-xs font-bold w-5 text-right flex-shrink-0 tabular-nums">
                    {i + 1}
                  </span>
                </div>
                <span className="text-slate-200 text-xs font-medium truncate">
                  {scorer.name}
                </span>
              </div>
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <div className="w-16 h-1 bg-slate-800/50 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: colors.stroke
                    }}
                  />
                </div>
                <span className="text-xs font-bold w-6 text-right tabular-nums" style={{ color: colors.text }}>
                  {scorer.goals}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

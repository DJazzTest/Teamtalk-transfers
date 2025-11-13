
import React, { useMemo, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, PoundSterling, Calendar, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getSquad } from '@/data/squadWages';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { getTeamSlug } from '@/utils/teamMapping';
import { ShirtNumberIcon } from './ShirtNumberIcon';
import { usePlayerModal } from '@/context/PlayerModalContext';
import { PlayerNameLink } from './PlayerNameLink';

interface SquadWageCarouselProps {
  club: string;
}

// Format number with commas
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Format wage for display
const formatWage = (amount: number, isYearly: boolean = false): string => {
  if (isYearly) {
    return `£${amount.toFixed(2)}m`;
  }
  return `£${formatNumber(amount)}`;
};

export const SquadWageCarousel: React.FC<SquadWageCarouselProps> = ({ club }) => {
  const [squad, setSquad] = useState(() => getSquad(club));
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());
  const clubSlug = useMemo(() => getTeamSlug(club) || club.toLowerCase().replace(/[^a-z0-9]+/g, '-'), [club]);
  const { openPlayerModal } = usePlayerModal();

  // Listen for player data updates from CMS
  useEffect(() => {
    const handlePlayerUpdate = () => {
      setSquad(getSquad(club));
    };
    
    window.addEventListener('playerDataUpdated', handlePlayerUpdate);
    return () => window.removeEventListener('playerDataUpdated', handlePlayerUpdate);
  }, [club]);

  // Use the same sanitization as squadWages.ts to ensure paths match
  const sanitizePlayerImageName = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };
  
  const totalWeeklyWage = useMemo(() => {
    return squad.reduce((sum, player) => sum + player.weeklyWage, 0);
  }, [squad]);
  
  const totalYearlyWage = useMemo(() => {
    return squad.reduce((sum, player) => sum + player.yearlyWage, 0);
  }, [squad]);
  
  if (!squad || squad.length === 0) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700 mb-6">
        <div className="p-6 text-center text-slate-400">
          No squad data available for {club}
        </div>
      </Card>
    );
  }
  
  // Get position color
  const getPositionColor = (position?: string) => {
    if (!position) return 'bg-slate-600';
    
    const positionType = position.toLowerCase();
    if (positionType.includes('forward') || positionType.includes('striker') || positionType.includes('winger')) {
      return 'bg-red-500/20 text-red-400';
    } else if (positionType.includes('midfielder') || positionType.includes('playmaker')) {
      return 'bg-blue-500/20 text-blue-400';
    } else if (positionType.includes('defender') || positionType.includes('back') || positionType.includes('fullback')) {
      return 'bg-green-500/20 text-green-400';
    } else if (positionType.includes('goalkeeper')) {
      return 'bg-yellow-500/20 text-yellow-400';
    }
    return 'bg-slate-600';
  };

  return (
    <Card className="bg-slate-800/80 backdrop-blur-md border-slate-700/50 mb-6 overflow-hidden shadow-lg">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-slate-700/50 border border-slate-600/50 shadow-sm">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {club} Squad
              </h3>
              <p className="text-sm text-slate-400 mt-1">{squad.length} Players</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 bg-slate-800/80 p-3 rounded-lg border border-slate-700/50 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-emerald-500/10">
                <PoundSterling className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Weekly Wage</p>
                <p className="font-medium text-white">{formatWage(totalWeeklyWage)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-blue-500/10">
                <Calendar className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Yearly Wage</p>
                <p className="font-medium text-white">{formatWage(totalYearlyWage, true)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <ScrollArea className="w-full">
            <div className="flex space-x-4 pb-4 pr-4">
              {squad.map((player, index) => (
                <Card 
                  key={index} 
                  className="w-64 flex-shrink-0 bg-slate-800/70 border border-slate-700/50 hover:border-blue-500/30 hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
                  onClick={() => openPlayerModal(player.name, { teamName: club, playerData: player })}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-0 group-hover:opacity-100 blur transition-all duration-300 group-hover:duration-200"></div>
                        <Avatar className="w-16 h-16 border-2 border-slate-600 group-hover:border-blue-500/50 relative transition-all duration-300">
                          {(() => {
                            const imageUrl = player.imageUrl || `/player-images/${clubSlug}/${sanitizePlayerImageName(player.name)}.png`;
                            // Log for debugging in production
                            if (process.env.NODE_ENV === 'production' && !player.imageUrl) {
                              console.log(`[SquadWageCarousel] Player ${player.name} using fallback image: ${imageUrl}`);
                            }
                            return imageUrl ? (
                              <img 
                                src={imageUrl} 
                                alt={player.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error(`[SquadWageCarousel] Failed to load image for ${player.name}: ${imageUrl}`, e);
                                  const target = e.currentTarget as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.classList.remove('hidden');
                                }}
                                onLoad={() => {
                                  // Hide fallback when image loads successfully
                                  const img = document.querySelector(`img[src="${imageUrl}"]`);
                                  if (img) {
                                    const fallback = img.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.classList.add('hidden');
                                  }
                                }}
                              />
                            ) : null;
                          })()}
                          <AvatarFallback className={cn(
                            player.imageUrl ? 'hidden' : '',
                            'bg-slate-700/80 text-white text-lg font-medium group-hover:bg-slate-600/80 transition-colors duration-300',
                            getPositionColor(player.position).includes('bg-red-500') ? 'bg-red-500/10 group-hover:bg-red-500/20' : '',
                            getPositionColor(player.position).includes('bg-blue-500') ? 'bg-blue-500/10 group-hover:bg-blue-500/20' : '',
                            getPositionColor(player.position).includes('bg-green-500') ? 'bg-green-500/10 group-hover:bg-green-500/20' : '',
                            getPositionColor(player.position).includes('bg-yellow-500') ? 'bg-yellow-500/10 group-hover:bg-yellow-500/20' : ''
                          )}>
                            {player.name
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .toUpperCase()
                              .substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {player.shirtNumber !== undefined && (
                            <ShirtNumberIcon 
                              number={player.shirtNumber} 
                              size="sm"
                              className="text-blue-400"
                            />
                          )}
                          <PlayerNameLink
                            playerName={player.name}
                            teamName={club}
                            playerData={player}
                            className="text-base text-white group-hover:text-blue-200 transition-colors duration-200"
                          />
                        </div>
                        {(player as any).age && (
                          <p className="text-xs text-slate-400 mt-0.5">Age: {(player as any).age}</p>
                        )}
                        {player.position && (
                          <Badge 
                            className={cn(
                              'mt-2 text-xs font-medium px-2 py-0.5',
                              getPositionColor(player.position),
                              'border-0 shadow-sm group-hover:shadow-md transition-all duration-200'
                            )}
                          >
                            {player.position}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3 mt-4 pt-4 border-t border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-slate-400">
                          <PoundSterling className="w-3.5 h-3.5 mr-1.5" />
                          <span>Weekly</span>
                        </div>
                        <span className="font-medium text-white">{formatWage(player.weeklyWage)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-slate-400">
                          <Calendar className="w-3.5 h-3.5 mr-1.5" />
                          <span>Yearly</span>
                        </div>
                        <span className="font-medium text-white">{formatWage(player.yearlyWage, true)}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full" 
                          style={{ width: `${Math.min(100, (player.weeklyWage / 300000) * 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>Wage %</span>
                        <span>{Math.round((player.weeklyWage / totalWeeklyWage) * 100)}%</span>
                      </div>
                    </div>

                    {(() => {
                      const description = (player as any).bio?.description || (player as any).description;
                      if (!description) return null;
                      
                      const isExpanded = expandedPlayers.has(player.name);
                      // Rough estimate: ~80-100 chars per line for text-xs in a 256px wide card
                      const estimatedLines = Math.ceil(description.length / 90);
                      const needsExpansion = estimatedLines > 3;
                      
                      return (
                        <div className="mt-3 pt-3 border-t border-slate-700">
                          <p 
                            className={cn(
                              "text-xs text-slate-300 leading-relaxed",
                              !isExpanded && needsExpansion && "line-clamp-3"
                            )}
                          >
                            {description}
                          </p>
                          {needsExpansion && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedPlayers(prev => {
                                  const newSet = new Set(prev);
                                  if (isExpanded) {
                                    newSet.delete(player.name);
                                  } else {
                                    newSet.add(player.name);
                                  }
                                  return newSet;
                                });
                              }}
                              className="mt-2 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              {isExpanded ? (
                                <>
                                  <span>Show less</span>
                                  <ChevronUp className="w-3 h-3" />
                                </>
                              ) : (
                                <>
                                  <span>Show more</span>
                                  <ChevronDown className="w-3 h-3" />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="h-2" />
          </ScrollArea>
        </div>
      </div>
    </Card>
  );
};

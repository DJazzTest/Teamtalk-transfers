import React, { useState, useCallback } from 'react';
import { useTransferDataStore } from '@/store/transferDataStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, TrendingUp, TrendingDown, Clock, AlertCircle, ChevronRight, MessageSquare } from 'lucide-react';
import { TEAM_API_CONFIGS } from '@/types/scoreinside';
import { Transfer } from '@/types/transfer';
import { getClubTheme } from '@/data/clubColors';
import { usePlayerModal } from '@/context/PlayerModalContext';
import { PlayerNameLink } from './PlayerNameLink';
import { cn } from '@/lib/utils';
import type { Player } from '@/data/squadWages';

interface TeamSpecificTransfersProps {
  selectedTeam?: string;
  showTeamSelector?: boolean;
  maxItems?: number;
}

const TeamSpecificTransfers: React.FC<TeamSpecificTransfersProps> = ({
  selectedTeam,
  showTeamSelector = true,
  maxItems = 10
}) => {
  const {
    getTeamTransfers,
    refreshTeamData,
    scoreInsideLoading,
    scoreInsideError,
    scoreInsideLastUpdated
  } = useTransferDataStore();

  const [currentTeam, setCurrentTeam] = useState(selectedTeam || '');
  const [refreshing, setRefreshing] = useState(false);
  const [showAllIn, setShowAllIn] = useState(false);
  const [showAllOut, setShowAllOut] = useState(false);
  const [showAllRumours, setShowAllRumours] = useState(false);
  const { openPlayerModal } = usePlayerModal();

  const teamTransfers = getTeamTransfers(currentTeam);
  
  // Group transfers by type
  const transfersIn = teamTransfers.filter(t => t.toClub.toLowerCase().includes(currentTeam.toLowerCase().replace('-', ' ')) && t.status === 'confirmed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const transfersOut = teamTransfers.filter(t => t.fromClub.toLowerCase().includes(currentTeam.toLowerCase().replace('-', ' ')) && t.status === 'confirmed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const rumours = teamTransfers.filter(t => 
    (t.toClub.toLowerCase().includes(currentTeam.toLowerCase().replace('-', ' ')) || 
     t.fromClub.toLowerCase().includes(currentTeam.toLowerCase().replace('-', ' '))) && 
    t.status === 'rumored')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getTeamDisplayName = (slug: string) => {
    const config = TEAM_API_CONFIGS.find(c => c.slug === slug);
    return config?.name || slug;
  };

  const handleRefreshTeam = async () => {
    setRefreshing(true);
    try {
      await refreshTeamData(currentTeam);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'rumored':
        return 'secondary';
      case 'pending':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getTransferDirection = (transfer: Transfer, teamName: string) => {
    const isIncoming = transfer.toClub.toLowerCase().includes(teamName.toLowerCase().replace('-', ' '));
    const isOutgoing = transfer.fromClub.toLowerCase().includes(teamName.toLowerCase().replace('-', ' '));
    
    if (isIncoming && !isOutgoing) return 'in';
    if (isOutgoing && !isIncoming) return 'out';
    return 'unknown';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getDisplayTeamName = useCallback((slug: string) => getTeamDisplayName(slug) || slug, []);

  const handlePlayerClick = (transfer: Transfer) => {
    const direction = getTransferDirection(transfer, currentTeam);
    const defaultTeam = direction === 'out'
      ? getDisplayTeamName(currentTeam)
      : transfer.toClub || transfer.fromClub;

    const bio = {
      nationality: transfer.country,
      dateOfBirth: transfer.dateOfBirth
    };

    const playerData: Partial<Player> = {
      age: transfer.age,
      bio: transfer.country || transfer.dateOfBirth ? bio : undefined
    };

    openPlayerModal(transfer.playerName, {
      teamName: defaultTeam,
      playerData
    });
  };

  const renderTransferCard = (transfer: Transfer) => {
    const direction = getTransferDirection(transfer, currentTeam);
    const theme = getClubTheme(currentTeam);

    return (
      <div 
        key={transfer.id} 
        className={`flex-shrink-0 w-80 cursor-pointer transition-all duration-200 hover:scale-105`}
        onClick={() => handlePlayerClick(transfer)}
      >
        <Card className={`h-full border-2 ${theme.border} hover:shadow-lg`}>
          <CardContent className={`p-4 ${theme.background} h-full`}>
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3">
                <PlayerNameLink
                  playerName={transfer.playerName}
                  teamName={
                    getTransferDirection(transfer, currentTeam) === 'out'
                      ? getDisplayTeamName(currentTeam)
                      : transfer.toClub
                  }
                  playerData={{
                    age: transfer.age,
                    bio: transfer.country || transfer.dateOfBirth
                      ? {
                          nationality: transfer.country,
                          dateOfBirth: transfer.dateOfBirth
                        }
                      : undefined
                  }}
                  className={cn('text-lg', theme.text ? `text-[${theme.text}]` : 'text-white')}
                  stopPropagation={false}
                />
                {direction === 'in' && (
                  <TrendingUp className="w-5 h-5 text-green-300" />
                )}
                {direction === 'out' && (
                  <TrendingDown className="w-5 h-5 text-red-300" />
                )}
              </div>
              
              <div className="mb-3" style={{ color: theme.text, opacity: 0.9 }}>
                <div className="text-sm font-medium mb-1">
                  {transfer.fromClub} → {transfer.toClub}
                </div>
                <div className="text-lg font-bold text-yellow-300">
                  {transfer.fee}
                </div>
              </div>
              
              <div className="mt-auto">
                <div className="flex items-center justify-between text-xs" style={{ color: theme.text, opacity: 0.8 }}>
                  <Badge 
                    variant="secondary" 
                    className="bg-white/20 text-white border-white/30"
                  >
                    {transfer.status}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(transfer.date)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {showTeamSelector && (
        <div className="flex justify-center mb-6">
          <Select value={currentTeam} onValueChange={setCurrentTeam}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Your Team" />
            </SelectTrigger>
            <SelectContent>
              {TEAM_API_CONFIGS.map((team) => (
                <SelectItem key={team.slug} value={team.slug}>
                  <div className="flex items-center gap-2">
                    <img
                      src={`/badges/${team.slug}.png`}
                      alt={`${team.name} badge`}
                      className="w-4 h-4 rounded-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    {team.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {!currentTeam ? (
        <div></div>
      ) : scoreInsideLoading && teamTransfers.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">Loading {getTeamDisplayName(currentTeam)} transfers...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div>
          {teamTransfers.length === 0 ? (
            <Card>
              <CardContent className="p-8">
                <div className="text-center text-gray-500">
                  <p>No transfers found for {getTeamDisplayName(currentTeam)}</p>
                  <Button 
                    onClick={handleRefreshTeam} 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    disabled={refreshing}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#9CA3AF #E5E7EB'
            }}>
              {/* Transfers In Cards */}
              {transfersIn.length > 0 && (
                <>
                  {/* Transfers In Label Card */}
                  <div className="min-w-[200px] flex items-center justify-center bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-4 text-white">
                    <div className="text-center">
                      <TrendingUp className="w-8 h-8 text-green-200 mx-auto mb-2" />
                      <h3 className="text-lg font-bold">Transfers In</h3>
                      <span className="text-green-200">({transfersIn.length})</span>
                    </div>
                  </div>
                  {/* Transfers In Player Cards */}
                  {transfersIn.slice(0, showAllIn ? transfersIn.length : 5).map(renderTransferCard)}
                  {transfersIn.length > 5 && !showAllIn && (
                    <div className="min-w-[120px] flex items-center justify-center">
                      <Button 
                        onClick={() => setShowAllIn(true)}
                        variant="outline"
                        size="sm"
                        className="flex flex-col items-center gap-2 h-auto py-4 border-green-400 text-green-700 hover:bg-green-50"
                      >
                        <span className="text-xs">Show More</span>
                        <span className="text-xs">({transfersIn.length - 5} more)</span>
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Transfers Out Cards */}
              {transfersOut.length > 0 && (
                <>
                  {/* Transfers Out Label Card */}
                  <div className="min-w-[200px] flex items-center justify-center bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-4 text-white">
                    <div className="text-center">
                      <TrendingDown className="w-8 h-8 text-red-200 mx-auto mb-2" />
                      <h3 className="text-lg font-bold">Transfers Out</h3>
                      <span className="text-red-200">({transfersOut.length})</span>
                    </div>
                  </div>
                  {/* Transfers Out Player Cards */}
                  {transfersOut.slice(0, showAllOut ? transfersOut.length : 5).map(renderTransferCard)}
                  {transfersOut.length > 5 && !showAllOut && (
                    <div className="min-w-[120px] flex items-center justify-center">
                      <Button 
                        onClick={() => setShowAllOut(true)}
                        variant="outline"
                        size="sm"
                        className="flex flex-col items-center gap-2 h-auto py-4 border-red-400 text-red-700 hover:bg-red-50"
                      >
                        <span className="text-xs">Show More</span>
                        <span className="text-xs">({transfersOut.length - 5} more)</span>
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Rumours Cards */}
              {rumours.length > 0 && (
                <>
                  {/* Rumours Label Card */}
                  <div className="min-w-[200px] flex items-center justify-center bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg p-4 text-white">
                    <div className="text-center">
                      <MessageSquare className="w-8 h-8 text-yellow-200 mx-auto mb-2" />
                      <h3 className="text-lg font-bold">Rumours & Gossip</h3>
                      <span className="text-yellow-200">({rumours.length})</span>
                    </div>
                  </div>
                  {/* Rumours Player Cards */}
                  {rumours.slice(0, showAllRumours ? rumours.length : 5).map(renderTransferCard)}
                  {rumours.length > 5 && !showAllRumours && (
                    <div className="min-w-[120px] flex items-center justify-center">
                      <Button 
                        onClick={() => setShowAllRumours(true)}
                        variant="outline"
                        size="sm"
                        className="flex flex-col items-center gap-2 h-auto py-4 border-yellow-400 text-yellow-700 hover:bg-yellow-50"
                      >
                        <span className="text-xs">Show More</span>
                        <span className="text-xs">({rumours.length - 5} more)</span>
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamSpecificTransfers;

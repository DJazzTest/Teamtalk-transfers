import React, { useState } from 'react';
import { Transfer } from '@/types/transfer';
import { PlayerNameLink } from './PlayerNameLink';
import { findPlayerInSquads } from '@/utils/playerUtils';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { TransferDetailsModal } from './TransferDetailsModal';
import { filterTransfersByWindow } from '@/utils/transferWindow';

interface ClubTransfersListProps {
  transfers: Transfer[];
  clubs: string[];
  type: 'in' | 'out';
  window?: 'summer' | 'winter' | 'all';
  onSelectClub?: (club: string, playerName?: string) => void;
}

export const ClubTransfersList: React.FC<ClubTransfersListProps> = ({ 
  transfers, 
  clubs, 
  type,
  window = 'all',
  onSelectClub 
}) => {
  // Filter transfers by window if specified
  const filteredTransfers = window !== 'all' ? filterTransfersByWindow(transfers, window) : transfers;
  const [expandedClubs, setExpandedClubs] = useState<Set<string>>(new Set());
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const normalizeClubName = (name: string) => {
    if (!name) return '';
    // Normalize common variations
    let normalized = name.toLowerCase().trim();
    
    // Handle common club name variations
    normalized = normalized
      .replace(/^afc\s+/i, '')
      .replace(/^fc\s+/i, '')
      .replace(/\s+fc$/i, '')
      .replace(/\s+united$/i, ' united')
      .replace(/tottenham hotspur/i, 'tottenham hotspur')
      .replace(/west ham united/i, 'west ham united')
      .replace(/wolverhampton wanderers/i, 'wolverhampton wanderers')
      .replace(/brighton & hove albion/i, 'brighton & hove albion')
      .replace(/brighton and hove albion/i, 'brighton & hove albion')
      .replace(/manchester city/i, 'manchester city')
      .replace(/manchester united/i, 'manchester united')
      .replace(/newcastle united/i, 'newcastle united')
      .replace(/nottingham forest/i, 'nottingham forest')
      .replace(/crystal palace/i, 'crystal palace');
    
    // Remove all non-alphanumeric characters except spaces and &
    normalized = normalized.replace(/[^a-z0-9\s&]/g, '').trim();
    
    // Normalize multiple spaces to single space
    normalized = normalized.replace(/\s+/g, ' ');
    
    return normalized;
  };

  const getClubTransfers = (club: string) => {
    const normalizedClub = normalizeClubName(club);
    if (type === 'in') {
      return filteredTransfers.filter(t => {
        const normalizedTo = normalizeClubName(t.toClub);
        return normalizedTo === normalizedClub || 
               normalizedTo.includes(normalizedClub) || 
               normalizedClub.includes(normalizedTo);
      }).filter(t => t.status === 'confirmed')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else {
      return filteredTransfers.filter(t => {
        const normalizedFrom = normalizeClubName(t.fromClub);
        return normalizedFrom === normalizedClub || 
               normalizedFrom.includes(normalizedClub) || 
               normalizedClub.includes(normalizedFrom);
      }).filter(t => t.status === 'confirmed')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  };

  const toggleExpand = (club: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedClubs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(club)) {
        newSet.delete(club);
      } else {
        newSet.add(club);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      {clubs.map((club, index) => {
        const clubTransfers = getClubTransfers(club);
        const displayNumber = index + 1;
        const isExpanded = expandedClubs.has(club);
        const showExpandButton = clubTransfers.length > 3;
        const displayedTransfers = isExpanded ? clubTransfers : clubTransfers.slice(0, 3);
        
        return (
          <div key={club} className="border-b border-gray-200 dark:border-slate-600 pb-4 last:border-b-0">
            {/* Club Header */}
            <div 
              className="flex items-center gap-2 mb-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onSelectClub?.(club)}
            >
              <span className="text-gray-500 dark:text-gray-400 text-sm font-semibold w-6">{displayNumber}.</span>
              <h4 className={`font-bold text-base flex-1 ${type === 'in' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                {club}:
              </h4>
            </div>
            
            {/* Transfers List */}
            <div className="space-y-1 ml-8">
              {clubTransfers.length === 0 ? (
                <div className="text-sm text-gray-400 dark:text-gray-500 italic">
                  No transfers
                </div>
              ) : (
                <>
                  {displayedTransfers.map((transfer) => {
                    const playerInfo = findPlayerInSquads(transfer.playerName);
                    const feeDisplay = transfer.fee || 'undisc.';
                    const targetClub = type === 'in' ? transfer.toClub : transfer.fromClub;
                    
                    return (
                      <div 
                        key={transfer.id} 
                        className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        <PlayerNameLink
                          playerName={transfer.playerName}
                          teamName={targetClub}
                          playerData={playerInfo.player}
                          className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                          stopPropagation={true}
                          navigateToClub={!!onSelectClub}
                          onNavigateToClub={(clubName) => onSelectClub?.(clubName, transfer.playerName)}
                        />
                        <button
                          type="button"
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedTransfer(transfer);
                            setIsTransferModalOpen(true);
                          }}
                          title="View transfer details"
                        >
                          <Info className="w-3 h-3" />
                          <span>Details</span>
                        </button>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">({feeDisplay})</span>
                      </div>
                    );
                  })}
                  
                  {/* Expand/Collapse Button */}
                  {showExpandButton && (
                    <button
                      onClick={(e) => toggleExpand(club, e)}
                      className="flex items-center gap-1 text-sm font-semibold mt-3 transition-colors px-2 py-1 rounded hover:opacity-80"
                      style={{ 
                        color: '#6b8e6b',
                        backgroundColor: 'rgba(107, 142, 107, 0.1)',
                        border: '1px solid rgba(107, 142, 107, 0.3)'
                      }}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4" style={{ color: '#6b8e6b' }} />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" style={{ color: '#6b8e6b' }} />
                          Show {clubTransfers.length - 3} More
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
      
      {/* Transfer Details Modal */}
      <TransferDetailsModal
        transfer={selectedTransfer}
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setSelectedTransfer(null);
        }}
        onNavigateToClub={onSelectClub}
      />
    </div>
  );
};


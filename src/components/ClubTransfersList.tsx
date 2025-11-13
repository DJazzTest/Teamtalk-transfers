import React, { useState } from 'react';
import { Transfer } from '@/types/transfer';
import { PlayerNameLink } from './PlayerNameLink';
import { findPlayerInSquads } from '@/utils/playerUtils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TransferDetailsModal } from './TransferDetailsModal';

interface ClubTransfersListProps {
  transfers: Transfer[];
  clubs: string[];
  type: 'in' | 'out';
  onSelectClub?: (club: string) => void;
}

export const ClubTransfersList: React.FC<ClubTransfersListProps> = ({ 
  transfers, 
  clubs, 
  type,
  onSelectClub 
}) => {
  const [expandedClubs, setExpandedClubs] = useState<Set<string>>(new Set());
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const normalizeClubName = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  };

  const getClubTransfers = (club: string) => {
    const normalizedClub = normalizeClubName(club);
    if (type === 'in') {
      return transfers.filter(t => {
        const normalizedTo = normalizeClubName(t.toClub);
        return normalizedTo === normalizedClub || 
               normalizedTo.includes(normalizedClub) || 
               normalizedClub.includes(normalizedTo);
      }).filter(t => t.status === 'confirmed')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else {
      return transfers.filter(t => {
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
        
        if (clubTransfers.length === 0) return null;
        
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
              {displayedTransfers.map((transfer) => {
                const playerInfo = findPlayerInSquads(transfer.playerName);
                const feeDisplay = transfer.fee || 'undisc.';
                const targetClub = type === 'in' ? transfer.toClub : transfer.fromClub;
                
                return (
                      <div 
                        key={transfer.id} 
                        className="text-sm text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        <PlayerNameLink
                          playerName={transfer.playerName}
                          teamName={targetClub}
                          playerData={playerInfo.player}
                          className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                          stopPropagation={true}
                          navigateToClub={false}
                          showTransferDetails={true}
                          onShowTransferDetails={() => {
                            setSelectedTransfer(transfer);
                            setIsTransferModalOpen(true);
                          }}
                        />
                        {' '}
                        <span className="text-gray-500 dark:text-gray-400 text-sm">({feeDisplay})</span>
                      </div>
                );
              })}
              
                  {/* Expand/Collapse Button */}
                  {showExpandButton && (
                    <button
                      onClick={(e) => toggleExpand(club, e)}
                      className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white mt-2 transition-colors"
                    >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show {clubTransfers.length - 3} More
                    </>
                  )}
                </button>
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


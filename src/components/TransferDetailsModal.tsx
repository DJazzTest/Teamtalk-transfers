import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Transfer } from '@/types/transfer';
import { X, TrendingUp, TrendingDown, Calendar, DollarSign, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TransferDetailsModalProps {
  transfer: Transfer | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToClub?: (club: string) => void;
}

export const TransferDetailsModal: React.FC<TransferDetailsModalProps> = ({
  transfer,
  isOpen,
  onClose,
  onNavigateToClub
}) => {
  if (!transfer) return null;

  const isLoan = transfer.fee?.toLowerCase().includes('loan') || 
                 transfer.status === 'pending' && transfer.fee?.toLowerCase().includes('loan');
  const isFree = transfer.fee?.toLowerCase().includes('free') || 
                 transfer.fee === 'Free' || 
                 transfer.fee === '0' || 
                 transfer.fee === '£0';
  const isUndisclosed = transfer.fee?.toLowerCase().includes('undisc') || 
                        transfer.fee === 'undisc.' || 
                        !transfer.fee || 
                        transfer.fee === '';

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-300 border-green-500/40';
      case 'rumored':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      case 'pending':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'rejected':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/40';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-white">
              Transfer Details
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Player Name */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <h3 className="text-lg font-semibold text-white mb-2">{transfer.playerName}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Building2 className="w-4 h-4" />
              <span>{transfer.fromClub}</span>
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="font-semibold text-green-400">{transfer.toClub}</span>
            </div>
          </div>

          {/* Transfer Fee */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <h4 className="font-semibold text-white">Transfer Fee</h4>
            </div>
            <div className="text-lg font-bold text-blue-300">
              {isLoan ? (
                <span className="flex items-center gap-2">
                  <span>Loan</span>
                  {transfer.fee?.toLowerCase().includes('end') && (
                    <span className="text-xs text-gray-400">(End of loan)</span>
                  )}
                </span>
              ) : isFree ? (
                'Free Transfer'
              ) : isUndisclosed ? (
                'Undisclosed'
              ) : (
                transfer.fee
              )}
            </div>
            {isLoan && transfer.fee && !transfer.fee.toLowerCase().includes('end') && (
              <div className="text-xs text-gray-400 mt-1">
                Loan transfer
              </div>
            )}
          </div>

          {/* Transfer Date */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <h4 className="font-semibold text-white">Transfer Date</h4>
            </div>
            <div className="text-white">{formatDate(transfer.date)}</div>
          </div>

          {/* Status */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-white">Status</h4>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(transfer.status)}`}>
                {transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Source */}
          {transfer.source && (
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <h4 className="font-semibold text-white mb-1">Source</h4>
              <div className="text-sm text-gray-300">{transfer.source}</div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-2">
            {onNavigateToClub && (
              <>
                <Button
                  onClick={() => {
                    onNavigateToClub(transfer.fromClub);
                    onClose();
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  View {transfer.fromClub}
                </Button>
                <Button
                  onClick={() => {
                    onNavigateToClub(transfer.toClub);
                    onClose();
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  View {transfer.toClub}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


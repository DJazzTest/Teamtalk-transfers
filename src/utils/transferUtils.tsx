
import React from 'react';
import { CheckCircle, Clock, MessageCircle, X, Verified } from 'lucide-react';
import { Transfer } from '@/types/transfer';

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed': return 'bg-green-500';
    case 'pending': return 'bg-yellow-500';
    case 'rumored': return 'bg-blue-500';
    case 'rejected': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'confirmed': return <Verified className="w-4 h-4" />;
    case 'pending': return <Clock className="w-4 h-4" />;
    case 'rumored': return <MessageCircle className="w-4 h-4" />;
    case 'rejected': return <X className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

export const getLaneTitle = (status: string) => {
  switch (status) {
    case 'confirmed': return 'Confirmed Transfers';
    case 'rumored': return 'Transfer Gossip';
    case 'pending': return 'Pending Deals';
    case 'rejected': return 'Failed Transfers';
    default: return status;
  }
};

export const getLaneIcon = (status: string) => {
  switch (status) {
    case 'confirmed': return <CheckCircle className="w-5 h-5 text-green-400" />;
    case 'rumored': return <MessageCircle className="w-5 h-5 text-blue-400" />;
    case 'pending': return <Clock className="w-5 h-5 text-yellow-400" />;
    case 'rejected': return <X className="w-5 h-5 text-red-400" />;
    default: return <Clock className="w-5 h-5 text-gray-400" />;
  }
};

export const groupTransfersByClub = (transfers: Transfer[]) => {
  const grouped: { [key: string]: Transfer[] } = {};
  transfers.forEach(transfer => {
    if (!grouped[transfer.toClub]) {
      grouped[transfer.toClub] = [];
    }
    grouped[transfer.toClub].push(transfer);
  });
  return grouped;
};

export const groupTransfersByStatus = (transfers: Transfer[]) => {
  const grouped: { [key: string]: Transfer[] } = {
    confirmed: [],
    rumored: [],
    pending: [],
    rejected: []
  };
  
  transfers.forEach(transfer => {
    grouped[transfer.status].push(transfer);
  });
  
  return grouped;
};

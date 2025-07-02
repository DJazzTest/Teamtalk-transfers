import { useState, useEffect } from 'react';
import { Transfer } from '@/types/transfer';
import { useLeagueData } from '@/hooks/useLeagueData';
import { TransferTracker } from '@/utils/transferTracker';
import { useToast } from '@/hooks/use-toast';

export const useTransferData = () => {
  const { leagueTransfers, leagueClubs } = useLeagueData();
  const [allTransfers, setAllTransfers] = useState<Transfer[]>(leagueTransfers);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Update transfers when data changes
  useEffect(() => {
    setAllTransfers(leagueTransfers);
  }, [leagueTransfers]);

  // Listen for refresh events to update data
  useEffect(() => {
    const handleRefresh = () => {
      console.log('🔄 Refresh event received - updating transfer data');
      setIsRefreshing(true);
      
      // Check for new transfers before updating
      const previousTransfers = allTransfers;
      
      // Add a small delay to show the loading state
      setTimeout(() => {
        console.log('📊 Refreshing transfer data with latest real transfers');
        const newTransferData = [...leagueTransfers];
        setAllTransfers(newTransferData);
        
        // Check for new transfers and log them
        const newTransfers = newTransferData.filter(transfer => 
          !previousTransfers.some(prev => prev.id === transfer.id)
        );
        
        const updatedTransfers = newTransferData.filter(transfer => {
          const prevTransfer = previousTransfers.find(prev => prev.id === transfer.id);
          return prevTransfer && (
            prevTransfer.status !== transfer.status ||
            prevTransfer.fee !== transfer.fee ||
            prevTransfer.source !== transfer.source
          );
        });

        // Log new and updated transfers
        newTransfers.forEach(transfer => {
          TransferTracker.logTransfer(transfer, 'added');
        });
        
        updatedTransfers.forEach(transfer => {
          const action = transfer.status === 'confirmed' ? 'confirmed' : 'updated';
          TransferTracker.logTransfer(transfer, action);
        });

        setIsRefreshing(false);
        
        // Show notification with new transfer count
        const totalNew = newTransfers.length + updatedTransfers.length;
        if (totalNew > 0) {
          toast({
            title: "New Transfer Activity Detected",
            description: `${newTransfers.length} new transfers, ${updatedTransfers.length} updates found`,
          });
          
          // Dispatch event for activity log to update
          window.dispatchEvent(new CustomEvent('transferLogged'));
        } else {
          toast({
            title: "Data Refreshed",
            description: "No new transfer activity detected",
          });
        }
      }, 500);
    };

    window.addEventListener('autoRefresh', handleRefresh);
    window.addEventListener('manualRefresh', handleRefresh);
    
    return () => {
      window.removeEventListener('autoRefresh', handleRefresh);
      window.removeEventListener('manualRefresh', handleRefresh);
    };
  }, [toast, leagueTransfers, allTransfers]);

  return {
    allTransfers,
    setAllTransfers,
    leagueClubs,
    isRefreshing
  };
};
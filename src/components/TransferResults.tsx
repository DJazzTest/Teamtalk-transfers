import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { groupTransfersByClub, groupTransfersByStatus } from '@/utils/transferUtils';
import { TransferCard } from './TransferCard';
import { LanesView } from './LanesView';
import { ClubsView } from './ClubsView';
import { CrawlStatusDisplay } from './CrawlStatusDisplay';
import { TransferFilters } from './TransferFilters';
import { TransferStats } from './TransferStats';
import { ScrapeControls } from './ScrapeControls';
import { EnhancedScrapeControls } from './EnhancedScrapeControls';
import { TransferActivityLog } from './TransferActivityLog';
import { useTransferData } from '@/hooks/useTransferData';
import { useTransferScraping } from '@/hooks/useTransferScraping';

interface TransferResultsProps {
  lastUpdated: Date;
}

export const TransferResults: React.FC<TransferResultsProps> = ({ lastUpdated }) => {
  const { allTransfers, setAllTransfers, leagueClubs, isRefreshing } = useTransferData();
  const { isScraping, crawlStatuses, crawlProgress, handleScrapeUrls } = useTransferScraping(setAllTransfers);
  
  const [filteredTransfers, setFilteredTransfers] = useState(allTransfers);
  const [selectedClub, setSelectedClub] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'clubs' | 'lanes'>('lanes');
  const [isEnhancedScrapeEnabled, setIsEnhancedScrapeEnabled] = useState(false);

  // Update filtered transfers when data or filters change
  useEffect(() => {
    let filtered = allTransfers;

    if (selectedClub !== 'all') {
      filtered = filtered.filter(transfer => transfer.toClub === selectedClub);
    }

    if (searchTerm) {
      filtered = filtered.filter(transfer =>
        transfer.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.fromClub.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.toClub.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTransfers(filtered);
  }, [allTransfers, selectedClub, searchTerm]);

  // Reset selected club when transfers change
  useEffect(() => {
    setSelectedClub('all');
  }, [allTransfers]);

  const clubTransfers = groupTransfersByClub(filteredTransfers);
  const statusTransfers = groupTransfersByStatus(filteredTransfers);

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <TransferFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedClub={selectedClub}
        setSelectedClub={setSelectedClub}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onScrapeUrls={handleScrapeUrls}
        isScraping={isScraping}
        availableClubs={leagueClubs}
      />
      
      {/* Loading indicators */}
      {isRefreshing && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <p className="text-blue-700 font-medium">Refreshing transfer data...</p>
            </div>
          </div>
        </Card>
      )}
      
      {/* Enhanced Transfer Detection */}
      <EnhancedScrapeControls 
        isEnabled={isEnhancedScrapeEnabled}
        onToggle={setIsEnhancedScrapeEnabled}
      />
      
      {/* Progress indicator */}
      <ScrapeControls crawlProgress={crawlProgress} />

      {/* Crawl Status Display */}
      <CrawlStatusDisplay crawlStatuses={crawlStatuses} />

      {/* Transfer Activity Log */}
      <TransferActivityLog />

      {/* Stats */}
      <TransferStats transfers={filteredTransfers} />

      {/* Transfer Display */}
      <div className="space-y-4">
        {filteredTransfers.length === 0 ? (
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
            <div className="p-8 text-center">
              <p className="text-gray-400">No transfers found matching your criteria</p>
            </div>
          </Card>
        ) : viewMode === 'lanes' ? (
          <LanesView statusTransfers={statusTransfers} />
        ) : viewMode === 'clubs' ? (
          <ClubsView clubTransfers={clubTransfers} allTransfers={allTransfers} />
        ) : (
          // List View
          filteredTransfers.map((transfer) => (
            <TransferCard key={transfer.id} transfer={transfer} />
          ))
        )}
      </div>
    </div>
  );
};
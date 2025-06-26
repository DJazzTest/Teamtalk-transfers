
import React, { useState } from 'react';
import { TransferCountdown } from '@/components/TransferCountdown';
import { RecentTransfers } from '@/components/RecentTransfers';
import { AppHeader } from '@/components/AppHeader';
import { MainTabs } from '@/components/MainTabs';
import { Card } from '@/components/ui/card';
import { useRefreshControl } from '@/hooks/useRefreshControl';

// Mock transfers data
const mockTransfers = [
  {
    id: '1',
    playerName: 'Matheus Cunha',
    fromClub: 'Atletico Madrid',
    toClub: 'Manchester United',
    fee: '£45M',
    date: '2025-06-15',
    source: 'Sky Sports',
    status: 'confirmed' as const
  },
  {
    id: '2',
    playerName: 'Diego León',
    fromClub: 'Real Sociedad',
    toClub: 'Manchester United',
    fee: '£25M',
    date: '2025-06-20',
    source: 'BBC Sport',
    status: 'confirmed' as const
  },
  {
    id: '3',
    playerName: 'Chido Obi',
    fromClub: 'Crystal Palace',
    toClub: 'Manchester United',
    fee: '£18M',
    date: '2025-06-12',
    source: 'Manchester Evening News',
    status: 'confirmed' as const
  },
  {
    id: '4',
    playerName: 'Tyler Fredricson',
    fromClub: 'Ajax',
    toClub: 'Manchester United',
    fee: '£35M',
    date: '2025-06-25',
    source: 'Goal.com',
    status: 'pending' as const
  },
  {
    id: '5',
    playerName: 'Marcus Rashford',
    fromClub: 'PSG',
    toClub: 'Manchester United',
    fee: '£60M',
    date: '2025-06-08',
    source: 'The Guardian',
    status: 'confirmed' as const
  },
  {
    id: '6',
    playerName: 'Antony',
    fromClub: 'Real Madrid',
    toClub: 'Manchester United',
    fee: '£40M',
    date: '2025-06-18',
    source: 'ESPN',
    status: 'confirmed' as const
  },
  {
    id: '7',
    playerName: 'Tyrell Malacia',
    fromClub: 'AC Milan',
    toClub: 'Manchester United',
    fee: '£22M',
    date: '2025-06-22',
    source: 'Sky Sports',
    status: 'confirmed' as const
  },
  {
    id: '8',
    playerName: 'Marcus Silva',
    fromClub: 'Porto',
    toClub: 'Arsenal',
    fee: '£28M',
    date: '2025-06-22',
    source: 'ESPN',
    status: 'confirmed' as const
  },
  {
    id: '9',
    playerName: 'João Santos',
    fromClub: 'Benfica',
    toClub: 'Chelsea',
    fee: '£42M',
    date: '2025-06-18',
    source: 'The Guardian',
    status: 'confirmed' as const
  },
  {
    id: '10',
    playerName: 'Alex Thompson',
    fromClub: 'Brighton',
    toClub: 'Liverpool',
    fee: '£15M',
    date: '2025-06-21',
    source: 'Liverpool Echo',
    status: 'pending' as const
  },
  {
    id: '11',
    playerName: 'Georginio Rutter',
    fromClub: 'Hoffenheim',
    toClub: 'Leeds United',
    fee: '£32M',
    date: '2025-06-10',
    source: 'Leeds Live',
    status: 'confirmed' as const
  },
  {
    id: '12',
    playerName: 'Wilfried Gnonto',
    fromClub: 'FC Zurich',
    toClub: 'Leeds United',
    fee: '£4.5M',
    date: '2025-06-14',
    source: 'Yorkshire Evening Post',
    status: 'confirmed' as const
  },
  {
    id: '13',
    playerName: 'Kylian Mbappé',
    fromClub: 'PSG',
    toClub: 'Liverpool',
    fee: '£150M',
    date: '2025-06-28',
    source: 'The Sun',
    status: 'rumored' as const
  },
  {
    id: '14',
    playerName: 'Pedri',
    fromClub: 'Barcelona',
    toClub: 'Chelsea',
    fee: '£80M',
    date: '2025-06-30',
    source: 'Daily Mail',
    status: 'rumored' as const
  }
];

const Index = () => {
  const {
    refreshRate,
    setRefreshRate,
    lastUpdated,
    isAutoRefresh,
    setIsAutoRefresh,
    handleManualRefresh
  } = useRefreshControl();

  const [countdownTarget, setCountdownTarget] = useState('2025-09-01T23:59:00');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#2F517A' }}>
      <AppHeader lastUpdated={lastUpdated} />

      <div className="container mx-auto px-4 py-8">
        {/* Recent Transfers Highlight */}
        <div className="mb-8">
          <RecentTransfers transfers={mockTransfers} />
        </div>

        {/* Transfer Window Countdown */}
        <Card className="mb-8 bg-white/95 backdrop-blur-md border-gray-200/50 shadow-lg">
          <div className="p-6">
            <TransferCountdown targetDate={countdownTarget} />
          </div>
        </Card>

        {/* Main Content Tabs */}
        <MainTabs
          refreshRate={refreshRate}
          setRefreshRate={setRefreshRate}
          isAutoRefresh={isAutoRefresh}
          setIsAutoRefresh={setIsAutoRefresh}
          onManualRefresh={handleManualRefresh}
          lastUpdated={lastUpdated}
          countdownTarget={countdownTarget}
          setCountdownTarget={setCountdownTarget}
          mockTransfers={mockTransfers}
        />
      </div>
    </div>
  );
};

export default Index;

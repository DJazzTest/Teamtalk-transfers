
import React, { useState, useEffect } from 'react';
import { TransferCountdown } from '@/components/TransferCountdown';
import { CountdownSettings } from '@/components/CountdownSettings';
import { UrlManager } from '@/components/UrlManager';
import { TransferResults } from '@/components/TransferResults';
import { RecentTransfers } from '@/components/RecentTransfers';
import { CompletedTransfers } from '@/components/CompletedTransfers';
import { ApiKeyManager } from '@/components/ApiKeyManager';
import { RefreshControl } from '@/components/RefreshControl';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock transfers data (same as in TransferResults)
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
  const [refreshRate, setRefreshRate] = useState(300000); // 5 minutes default
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [countdownTarget, setCountdownTarget] = useState('2025-09-01T23:59:00');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoRefresh) {
      interval = setInterval(() => {
        setLastUpdated(new Date());
        console.log('Auto-refreshing transfer data...');
      }, refreshRate);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoRefresh, refreshRate]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#2F517A' }}>
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                PlanetSport Transfers
              </h1>
              <p className="text-gray-600 text-sm">Live Transfer Tracking</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="text-xs text-gray-700 font-medium">{lastUpdated.toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </header>

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
        <Tabs defaultValue="transfers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/90 border border-gray-200/50 shadow-sm">
            <TabsTrigger value="transfers" className="text-gray-600 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm">
              Live Transfers
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-gray-600 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm">
              Completed
            </TabsTrigger>
            <TabsTrigger value="sources" className="text-gray-600 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm">
              Sources
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-gray-600 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm">
              Settings
            </TabsTrigger>
            <TabsTrigger value="api" className="text-gray-600 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm">
              API Config
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transfers" className="space-y-6">
            <RefreshControl
              refreshRate={refreshRate}
              setRefreshRate={setRefreshRate}
              isAutoRefresh={isAutoRefresh}
              setIsAutoRefresh={setIsAutoRefresh}
              onManualRefresh={() => setLastUpdated(new Date())}
            />
            <TransferResults lastUpdated={lastUpdated} />
          </TabsContent>

          <TabsContent value="completed">
            <CompletedTransfers transfers={mockTransfers} />
          </TabsContent>

          <TabsContent value="sources">
            <UrlManager />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <CountdownSettings 
              targetDate={countdownTarget}
              onDateChange={setCountdownTarget}
            />
            
            <Card className="bg-white/95 backdrop-blur-md border-gray-200/50 shadow-lg">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Transfer Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                    <p className="text-sm text-gray-600">June 1, 2025 - September 1, 2025</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transfer Type</label>
                    <p className="text-sm text-gray-600">Players arriving at clubs only</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <ApiKeyManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;

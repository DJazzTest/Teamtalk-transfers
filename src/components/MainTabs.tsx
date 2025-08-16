import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Settings, Globe, Clock, Bell, Star } from 'lucide-react';
import { ClubsView } from './ClubsView';
import { ApiConfig } from './ApiConfig';
import { TransferActivityLog } from './TransferActivityLog';
import { TransferNotifications } from './TransferNotifications';
import { SourcesTab } from './SourcesTab';
import { Transfer } from '@/types/transfer';
import { HomeRecentRumours } from './HomeRecentRumours';
import { HomeRecentConfirmed } from './HomeRecentConfirmed';
import { HomeTodaysConfirmed } from './HomeTodaysConfirmed';

interface MainTabsProps {
  transfers: Transfer[];
  lastUpdated: Date;
}

export const MainTabs: React.FC<MainTabsProps> = ({ 
  transfers, 
  lastUpdated
}) => {
  return (
    <Tabs defaultValue="sources" className="w-full">
      <TabsList className="w-full flex overflow-x-scroll scrollbar scrollbar-thumb-green-400 scrollbar-track-slate-800 bg-slate-800/50 backdrop-blur-md border-slate-700 whitespace-nowrap min-w-max">
        <TabsTrigger value="teams" className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Teams
        </TabsTrigger>
        <TabsTrigger value="favourites" className="flex items-center gap-2">
          <Star className="w-4 h-4" />
          Favourites
        </TabsTrigger>
        <TabsTrigger value="transfers" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          All Transfers
        </TabsTrigger>
        <TabsTrigger value="activity" className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Activity
        </TabsTrigger>
        <TabsTrigger value="updates" className="flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Updates
        </TabsTrigger>
        <TabsTrigger value="sources">Sources</TabsTrigger>
        <TabsTrigger value="api" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          API Config
        </TabsTrigger>
      </TabsList>

      <TabsContent value="teams">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-slate-800">
          <ClubsView clubTransfers={{}} allTransfers={transfers} />
        </div>
      </TabsContent>

      <TabsContent value="favourites">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-track-yellow-100">
          {/* FavouritesView */}
        </div>
      </TabsContent>

      <TabsContent value="transfers">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100">
          <HomeTodaysConfirmed transfers={transfers} />
          <HomeRecentRumours transfers={transfers} />
          <HomeRecentConfirmed transfers={transfers} />
        </div>
      </TabsContent>

      <TabsContent value="activity">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-purple-100">
          <TransferActivityLog />
        </div>
      </TabsContent>

      <TabsContent value="updates">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-green-100">
          <TransferNotifications transfers={transfers} />
        </div>
      </TabsContent>

      <TabsContent value="sources">
        <SourcesTab />
      </TabsContent>

      <TabsContent value="api">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-cyan-400 scrollbar-track-cyan-100">
          <ApiConfig />
        </div>
      </TabsContent>
    </Tabs>
  );
};

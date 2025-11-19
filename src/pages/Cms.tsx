import React from 'react';
import Admin from './Admin';
import { TeamApiConfigManager } from '@/components/TeamApiConfigManager';
import { TeamBioManager } from '@/components/TeamBioManager';
import { PlayerManagement } from '@/components/PlayerManagement';
import { ChatterBoxManagement } from '@/components/ChatterBoxManagement';
import { FlashBannerManagement } from '@/components/FlashBannerManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayerModalProvider } from '@/context/PlayerModalContext';
import { TransferDataProvider } from '@/store/transferDataStore';

// This wrapper is for future CMS-specific logic (auth, layout, etc.)
const Cms: React.FC = () => {
  return (
    <TransferDataProvider>
      <PlayerModalProvider>
        <div className="min-h-screen bg-slate-900 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-white mb-6">CMS Dashboard</h1>
            
            <Tabs defaultValue="players" className="space-y-6">
              <TabsList className="bg-slate-800">
                <TabsTrigger value="players">Players</TabsTrigger>
                <TabsTrigger value="teams">Teams</TabsTrigger>
                <TabsTrigger value="chatter">Live Hub</TabsTrigger>
                <TabsTrigger value="flash-banner">Flash Banner</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>

              <TabsContent value="players">
                <PlayerManagement />
              </TabsContent>

              <TabsContent value="teams" className="space-y-6">
                <TeamBioManager />
                <TeamApiConfigManager />
              </TabsContent>

              <TabsContent value="chatter">
                <ChatterBoxManagement />
              </TabsContent>

              <TabsContent value="flash-banner">
                <FlashBannerManagement />
              </TabsContent>

              <TabsContent value="admin">
                <Admin />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </PlayerModalProvider>
    </TransferDataProvider>
  );
};

export default Cms;

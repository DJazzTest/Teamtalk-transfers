
import React from 'react';
import { AppHeader } from '@/components/AppHeader';
import { AdminNavigation } from '@/components/AdminNavigation';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import ClubApiManager from '@/components/ClubApiManager';
import { FeedStatusPanel } from '@/components/FeedStatusPanel';
import { ApiManagementPanel } from '@/components/ApiManagementPanel';
import { TransferDataProvider } from '@/store/transferDataStore';


const Admin = () => {
  const { lastUpdated } = useRefreshControl();

  return (
    <TransferDataProvider>
      <div className="min-h-screen" style={{ backgroundColor: '#2F517A' }}>
        <AdminNavigation />
        <AppHeader lastUpdated={lastUpdated} />

        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-full">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <p className="text-gray-300">Manage transfer data sources, API settings, and system configuration</p>
              <div className="bg-blue-600/20 px-3 py-1 rounded-lg">
                <span className="text-blue-300 text-sm font-medium">
                  {(() => {
                    const savedUrls = localStorage.getItem('transfer_urls');
                    const urlCount = savedUrls ? JSON.parse(savedUrls).length : 0;
                    return `${urlCount} URLs monitored`;
                  })()}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <FeedStatusPanel />
            <ApiManagementPanel />
            <ClubApiManager />
          </div>


        </div>
      </div>
    </TransferDataProvider>
  );
};

export default Admin;

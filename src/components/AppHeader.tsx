
import React from 'react';

interface AppHeaderProps {
  lastUpdated: Date;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ lastUpdated }) => {
  return (
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
  );
};

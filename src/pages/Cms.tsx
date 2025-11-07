import React from 'react';
import Admin from './Admin';
import { ApiManagementPanel } from '@/components/ApiManagementPanel';
import { TeamApiConfigManager } from '@/components/TeamApiConfigManager';

// This wrapper is for future CMS-specific logic (auth, layout, etc.)
const Cms: React.FC = () => {
  return (
    <div className="space-y-6">
      <ApiManagementPanel />
      <TeamApiConfigManager />
      <Admin />
    </div>
  );
};

export default Cms;

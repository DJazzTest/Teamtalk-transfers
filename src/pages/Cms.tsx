import React from 'react';
import Admin from './Admin';
import { ApiStatusIndicator } from '@/components/ApiStatusIndicator';

// This wrapper is for future CMS-specific logic (auth, layout, etc.)
const Cms: React.FC = () => {
  return (
    <div className="space-y-6">
      <ApiStatusIndicator />
      <Admin />
    </div>
  );
};

export default Cms;

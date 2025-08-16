// PlayerStatsEditor.tsx - Deprecated. This component is no longer used.
// The Transfer interface doesn't include player stats like height, weight, etc.

import React from 'react';

interface PlayerStatsEditorProps {
  allTransfers: any[];
  onSave: (updatedPlayer: any) => void;
}

export const PlayerStatsEditor: React.FC<PlayerStatsEditorProps> = () => {
  return (
    <div className="text-gray-500 text-center p-4">
      This component is deprecated and no longer in use.
    </div>
  );
};

export default PlayerStatsEditor;
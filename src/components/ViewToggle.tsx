import React from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  viewMode: 'desktop' | 'mobile';
  onViewModeChange: (mode: 'desktop' | 'mobile') => void;
  className?: string;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  viewMode,
  onViewModeChange,
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-2 bg-slate-800/50 rounded-lg p-1 border border-slate-700', className)}>
      <Button
        variant={viewMode === 'desktop' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('desktop')}
        className={cn(
          'flex items-center gap-2',
          viewMode === 'desktop'
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'text-gray-400 hover:text-white hover:bg-slate-700'
        )}
      >
        <Monitor className="w-4 h-4" />
        <span className="hidden sm:inline">Desktop</span>
      </Button>
      <Button
        variant={viewMode === 'mobile' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('mobile')}
        className={cn(
          'flex items-center gap-2',
          viewMode === 'mobile'
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'text-gray-400 hover:text-white hover:bg-slate-700'
        )}
      >
        <Smartphone className="w-4 h-4" />
        <span className="hidden sm:inline">Mobile</span>
      </Button>
    </div>
  );
};


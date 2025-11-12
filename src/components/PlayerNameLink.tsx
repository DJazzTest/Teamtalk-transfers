import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayerModal } from '@/context/PlayerModalContext';
import type { Player } from '@/data/squadWages';

interface PlayerNameLinkProps {
  playerName: string;
  teamName?: string;
  playerData?: Partial<Player>;
  className?: string;
  stopPropagation?: boolean;
}

export const PlayerNameLink: React.FC<PlayerNameLinkProps> = ({
  playerName,
  teamName,
  playerData,
  className,
  stopPropagation = true,
}) => {
  const { openPlayerModal } = usePlayerModal();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) {
      event.stopPropagation();
    }
    openPlayerModal(playerName, { teamName, playerData });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-1 text-sm font-semibold text-blue-300 hover:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors',
        className
      )}
      title={`View ${playerName} details`}
    >
      <span className="truncate">{playerName}</span>
      <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
    </button>
  );
};


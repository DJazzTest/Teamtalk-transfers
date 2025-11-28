import React from 'react';
import { cn } from '@/lib/utils';
import { useClubBadge } from '@/hooks/useClubBadge';
import { useClubBio } from '@/context/ClubBioContext';
import { FREE_AGENT_PLACEHOLDER } from '@/utils/clubBadgeUtils';

type BadgeSize = 'sm' | 'md' | 'lg';

interface ClubBadgeIconProps {
  club?: string | null;
  size?: BadgeSize;
  highlight?: boolean;
  className?: string;
  disabled?: boolean;
}

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-12 h-12',
};

export const ClubBadgeIcon: React.FC<ClubBadgeIconProps> = ({
  club,
  size = 'md',
  highlight = false,
  className,
  disabled = false,
}) => {
  const { badgeSrc, isLoading, placeholderInitials } = useClubBadge(club);
  const { openClubBio } = useClubBio();
  const initials = placeholderInitials || club?.charAt(0)?.toUpperCase() || '?';
  const isClickable = !!club && !disabled;

  const displaySrc = badgeSrc || FREE_AGENT_PLACEHOLDER;

  return (
    <button
      type="button"
      onClick={() => isClickable && openClubBio(club!)}
      disabled={!isClickable}
      className={cn(
        'rounded-full border bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden shadow-sm transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        highlight ? 'border-green-500' : 'border-gray-200 dark:border-slate-700',
        SIZE_CLASSES[size],
        !isClickable && 'opacity-60 cursor-default hover:scale-100',
        className,
      )}
      title={club ? `Open ${club} bio` : 'Unknown club'}
      aria-label={club ? `Open ${club} bio` : 'Unknown club'}
    >
      {displaySrc ? (
        <img
          src={displaySrc}
          alt={club ? `${club} badge` : 'Club badge placeholder'}
          className="w-full h-full object-contain"
          loading="lazy"
          onError={(event) => {
            if (event.currentTarget.src !== FREE_AGENT_PLACEHOLDER) {
              event.currentTarget.src = FREE_AGENT_PLACEHOLDER;
            }
          }}
        />
      ) : isLoading ? (
        <span className="w-4 h-4 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      ) : (
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-200">{initials}</span>
      )}
    </button>
  );
};


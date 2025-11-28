import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Transfer } from '@/types/transfer';
import { useClubBadge } from '@/hooks/useClubBadge';
import { useClubBio } from '@/context/ClubBioContext';
import { getClubInitials } from '@/utils/clubBadgeUtils';
import { getPremierLeagueClubs } from '@/utils/teamMapping';

interface HomeClubBadgeRailProps {
  transfers: Transfer[];
  variant?: 'card' | 'inline';
  className?: string;
  heading?: string;
  subtitle?: string;
}

const MAX_CLUBS = 18;

export const ClubBadgeChip: React.FC<{ clubName: string }> = ({ clubName }) => {
  const { badgeSrc, isLoading, placeholderInitials } = useClubBadge(clubName);
  const { openClubBio } = useClubBio();

  return (
    <button
      type="button"
      onClick={() => openClubBio(clubName)}
      className="flex flex-col items-center gap-2 min-w-[72px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
      title={clubName}
    >
      <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm flex items-center justify-center overflow-hidden">
        {badgeSrc ? (
          <img
            src={badgeSrc}
            alt={`${clubName} badge`}
            className="w-full h-full object-contain scale-110"
            loading="lazy"
          />
        ) : isLoading ? (
          <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
        ) : (
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-300">
            {placeholderInitials || getClubInitials(clubName)}
          </span>
        )}
      </div>
      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 text-center leading-tight line-clamp-2">
        {clubName}
      </span>
    </button>
  );
};

export const HomeClubBadgeRail: React.FC<HomeClubBadgeRailProps> = ({
  transfers,
  variant = 'card',
  className = '',
  heading = 'Club radar',
  subtitle = 'Trending badges',
}) => {
  const clubs = useMemo(() => {
    if (transfers?.length) {
      const counter = new Map<string, number>();
      transfers.forEach((transfer) => {
        const clubsToCount = [transfer.fromClub, transfer.toClub].filter(Boolean) as string[];
        clubsToCount.forEach((club) => {
          counter.set(club, (counter.get(club) || 0) + 1);
        });
      });
      return Array.from(counter.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, MAX_CLUBS)
        .map(([club]) => club);
    }
    return getPremierLeagueClubs().slice(0, MAX_CLUBS);
  }, [transfers]);

  if (!clubs.length) {
    return null;
  }

  const badgeRow = (
    <div
      className="flex gap-4 overflow-x-auto pb-1"
      style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5f5 transparent' }}
    >
      {clubs.map((club) => (
        <ClubBadgeChip key={club} clubName={club} />
      ))}
    </div>
  );

  if (variant === 'inline') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-blue-500 font-semibold">{heading}</p>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{subtitle}</h4>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Live pulse</span>
        </div>
        {badgeRow}
      </div>
    );
  }

  return (
    <Card className={`mb-4 sm:mb-8 bg-white/95 dark:bg-slate-900/70 border border-gray-200/70 dark:border-slate-700 shadow-lg ${className}`}>
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-blue-500 font-semibold">{heading}</p>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{subtitle}</h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Updated live</span>
        </div>
        {badgeRow}
      </div>
    </Card>
  );
};


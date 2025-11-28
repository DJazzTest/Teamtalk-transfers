import { useEffect, useState } from 'react';
import {
  FREE_AGENT_PLACEHOLDER,
  getInitialBadgeSrc,
  getClubInitials,
  isFreeAgentClub,
  resolveClubBadgeSrc,
} from '@/utils/clubBadgeUtils';

export const useClubBadge = (clubName?: string | null) => {
  const [badgeSrc, setBadgeSrc] = useState<string | null>(() => {
    const initial = getInitialBadgeSrc(clubName);
    if (!initial && clubName) {
      return FREE_AGENT_PLACEHOLDER;
    }
    return initial;
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadBadge = async () => {
      if (!clubName) {
        setBadgeSrc(null);
        return;
      }
      if (isFreeAgentClub(clubName)) {
        setBadgeSrc(FREE_AGENT_PLACEHOLDER);
        return;
      }
      setIsLoading(true);
      const resolved = await resolveClubBadgeSrc(clubName);
      if (isMounted) {
        setBadgeSrc(resolved || FREE_AGENT_PLACEHOLDER);
        setIsLoading(false);
      }
    };
    loadBadge();
    return () => {
      isMounted = false;
    };
  }, [clubName]);

  return {
    badgeSrc,
    isLoading,
    placeholderInitials: getClubInitials(clubName),
  };
};


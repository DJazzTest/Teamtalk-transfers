import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, X, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AnalogCountdown } from './AnalogCountdown';

interface TransferCountdownProps {
  targetDate: string;
}

export const TransferCountdown: React.FC<TransferCountdownProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [starredClubs, setStarredClubs] = useState<string[]>([]);
  // Always show analog countdown
  const { toast } = useToast();

  useEffect(() => {
    // Load starred clubs
    const savedStarredClubs = localStorage.getItem('starredClubs');
    if (savedStarredClubs) {
      setStarredClubs(JSON.parse(savedStarredClubs));
    }
  }, []);

  // Listen for starred clubs updates
  useEffect(() => {
    const handleStarredClubsUpdate = (event: CustomEvent) => {
      setStarredClubs(event.detail);
    };

    window.addEventListener('starredClubsUpdate', handleStarredClubsUpdate as EventListener);
    return () => {
      window.removeEventListener('starredClubsUpdate', handleStarredClubsUpdate as EventListener);
    };
  }, []);

  const handleRemoveStarredClub = (clubName: string) => {
    const newStarredClubs = starredClubs.filter(club => club !== clubName);
    setStarredClubs(newStarredClubs);
    localStorage.setItem('starredClubs', JSON.stringify(newStarredClubs));
    
    // Dispatch event to update other components
    window.dispatchEvent(new CustomEvent('starredClubsUpdate', { detail: newStarredClubs }));
    
    toast({
      title: "Club Unstarred",
      description: `${clubName} has been removed from your starred clubs.`,
    });
  };

  useEffect(() => {
    const target = new Date(targetDate);
    
    const updateTimer = () => {
      const now = new Date();
      const difference = target.getTime() - now.getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const target = new Date(targetDate);
  const isExpired = target.getTime() < new Date().getTime();

  // Always show analog countdown
  return (
    <AnalogCountdown 
      targetDate={targetDate} 
      onRevert={() => {}} // No revert needed since we only show analog
    />
  );
};

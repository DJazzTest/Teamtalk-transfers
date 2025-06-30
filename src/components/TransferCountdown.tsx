
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MyClubSelector } from './MyClubSelector';

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
  const [myClub, setMyClub] = useState<string | null>(null);
  const [starredClubs, setStarredClubs] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved club from localStorage
    const savedClub = localStorage.getItem('myFavoriteClub');
    if (savedClub) {
      setMyClub(savedClub);
    }

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

  return (
    <div className="space-y-6">
      {/* My Club Section - Always at the top */}
      <MyClubSelector 
        selectedClub={myClub} 
        onClubChange={setMyClub} 
      />

      {/* Starred Clubs Section */}
      {starredClubs.length > 0 && (
        <Card className="bg-gradient-to-r from-yellow-600 to-amber-600 border-none shadow-lg">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <Star className="w-5 h-5 text-white fill-current" />
              </div>
              <h3 className="text-lg font-semibold text-white">Starred Clubs</h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {starredClubs.map((club) => (
                <div key={club} className="bg-white/10 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-300 fill-current" />
                  <span className="text-white font-medium text-sm">{club}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveStarredClub(club)}
                    className="h-auto w-auto p-1 text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Transfer Window Countdown */}
      <div className="text-center" style={{ backgroundColor: '#2F517A', borderRadius: '0.5rem', padding: '1rem sm:2rem' }}>
        <h2 className="text-lg sm:text-2xl font-bold text-blue-400 mb-2 sm:mb-4">Transfer Window Countdown</h2>
        
        {isExpired ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-8 max-w-md mx-auto">
            <p className="text-red-600 text-lg sm:text-xl font-bold">Transfer Window Closed</p>
            <p className="text-gray-600 text-xs sm:text-sm mt-2">Configure a new date in the Settings tab</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-2 sm:p-4 shadow-lg">
              <div className="text-xl sm:text-3xl font-bold text-white drop-shadow-lg">{timeLeft.days}</div>
              <div className="text-xs sm:text-sm text-blue-100">Days</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg p-2 sm:p-4 shadow-lg">
              <div className="text-xl sm:text-3xl font-bold text-white drop-shadow-lg">{timeLeft.hours}</div>
              <div className="text-xs sm:text-sm text-emerald-100">Hours</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg p-2 sm:p-4 shadow-lg">
              <div className="text-xl sm:text-3xl font-bold text-white drop-shadow-lg">{timeLeft.minutes}</div>
              <div className="text-xs sm:text-sm text-purple-100">Minutes</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg p-2 sm:p-4 shadow-lg">
              <div className="text-xl sm:text-3xl font-bold text-white drop-shadow-lg">{timeLeft.seconds}</div>
              <div className="text-xs sm:text-sm text-orange-100">Seconds</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

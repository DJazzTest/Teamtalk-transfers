
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PREMIER_LEAGUE_CLUBS } from '@/utils/transferParser/constants';

interface MyClubSelectorProps {
  selectedClub: string | null;
  onClubChange: (club: string | null) => void;
}

export const MyClubSelector: React.FC<MyClubSelectorProps> = ({
  selectedClub,
  onClubChange
}) => {
  const { toast } = useToast();

  const handleClubSelect = (club: string) => {
    onClubChange(club);
    localStorage.setItem('myFavoriteClub', club);
    toast({
      title: "My Club Saved",
      description: `${club} has been set as your favorite club!`,
    });
  };

  const handleRemoveClub = () => {
    onClubChange(null);
    localStorage.removeItem('myFavoriteClub');
    toast({
      title: "Club Removed",
      description: "Your favorite club has been removed.",
    });
  };

  return (
    <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-none shadow-lg">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/20 p-2 rounded-lg">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">My Club</h3>
        </div>

        {selectedClub ? (
          <div className="space-y-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-yellow-300 fill-current" />
                <span className="text-white font-medium">{selectedClub}</span>
              </div>
              <p className="text-white/80 text-sm">Your favorite Premier League club</p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedClub} onValueChange={handleClubSelect}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PREMIER_LEAGUE_CLUBS.map((club) => (
                    <SelectItem key={club} value={club}>
                      {club}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRemoveClub}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-white/80 text-sm">
              Select your favorite Premier League club to see it featured prominently
            </p>
            <Select onValueChange={handleClubSelect}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Choose your club..." />
              </SelectTrigger>
              <SelectContent>
                {PREMIER_LEAGUE_CLUBS.map((club) => (
                  <SelectItem key={club} value={club}>
                    {club}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </Card>
  );
};

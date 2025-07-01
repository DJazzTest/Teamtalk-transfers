
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Crown, Trophy } from 'lucide-react';

export type League = 'premier' | 'championship';

interface LeagueToggleProps {
  currentLeague: League;
  onLeagueChange: (league: League) => void;
}

export const LeagueToggle: React.FC<LeagueToggleProps> = ({
  currentLeague,
  onLeagueChange
}) => {
  return (
    <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700 mb-4">
      <div className="p-4">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant={currentLeague === 'premier' ? 'default' : 'outline'}
            onClick={() => onLeagueChange('premier')}
            className={`flex items-center gap-2 ${
              currentLeague === 'premier' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600'
            }`}
          >
            <Crown className="w-4 h-4" />
            Premier League
          </Button>
          <Button
            variant={currentLeague === 'championship' ? 'default' : 'outline'}
            onClick={() => onLeagueChange('championship')}
            className={`flex items-center gap-2 ${
              currentLeague === 'championship' 
                ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                : 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Championship
          </Button>
        </div>
      </div>
    </Card>
  );
};

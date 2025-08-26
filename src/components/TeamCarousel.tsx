import React from 'react';
import { Card } from '@/components/ui/card';

// Premier League clubs list
const premierLeagueClubs = [
  'Arsenal', 'Aston Villa', 'Brentford', 'Brighton & Hove Albion', 'Chelsea',
  'Crystal Palace', 'Everton', 'Fulham', 'Leeds United', 'Leicester City',
  'Liverpool', 'Manchester City', 'Manchester United', 'Newcastle United',
  'Nottingham Forest', 'Southampton', 'Tottenham Hotspur', 'West Ham United',
  'Wolverhampton Wanderers', 'Bournemouth'
];

// Club badge mapping - centralized system using REAL official badges
const getClubBadge = (club: string): string => {
  const badgeMap: Record<string, string> = {
    'Arsenal': '/badges/arsenal-real.png', // Real Arsenal badge
    'Bournemouth': '/badges/bournemouth-real.png', // Real Bournemouth badge
    'Chelsea': '/badges/chelsea-real.png', // Real Chelsea badge
    'Leeds United': '/lovable-uploads/f1403919-509d-469c-8455-d3b11b3d5cb6.png', // Real Leeds badge provided by user
    'Liverpool': '/badges/liverpool-real.png', // Real Liverpool badge
    'Manchester City': '/badges/manchestercity-real.png', // Real Man City badge
    'Manchester United': '/badges/manchesterunited-real.png', // Real Man United badge
    'Newcastle United': '/badges/newcastle-real.png', // Real Newcastle badge
    'Tottenham Hotspur': '/badges/tottenham-real.png', // Real Spurs badge
    // Other teams will use initials fallback until we get their real badges
    'Aston Villa': '',
    'Brentford': '',
    'Brighton & Hove Albion': '',
    'Burnley': '',
    'Crystal Palace': '',
    'Everton': '',
    'Fulham': '',
    'Nottingham Forest': '',
    'Sunderland': '',
    'West Ham United': '',
    'Wolverhampton Wanderers': ''
  };
  return badgeMap[club] || '';
};

interface TeamCarouselProps {
  onSelectTeam?: (team: string) => void;
}

export const TeamCarousel: React.FC<TeamCarouselProps> = ({ onSelectTeam }) => {
  return (
    <Card className="mb-6 border-gray-200/50 shadow-lg" style={{ backgroundColor: '#f8fafc' }}>
      <div className="p-4">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Select Your Team</h2>
          <p className="text-sm text-gray-600">Choose from the clubs below to see transfers in, out, and rumors</p>
        </div>
        
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-4 min-w-max px-2" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#9CA3AF #E5E7EB'
          }}>
            {premierLeagueClubs.map((club) => (
              <Card 
                key={club}
                className="min-w-[160px] bg-gradient-to-br from-blue-50 to-white border-blue-200 hover:shadow-md transition-all duration-200 hover:border-blue-300 cursor-pointer"
                onClick={() => onSelectTeam && onSelectTeam(club)}
              >
                <div className="p-3 flex flex-col items-center gap-2">
                  {/* Club Badge */}
                  <div className="w-12 h-12 flex items-center justify-center">
                    <img 
                      src={getClubBadge(club)} 
                      alt={`${club} badge`}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        // Fallback to initials on image error
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `
                          <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            ${club.split(' ').map(word => word[0]).join('').substring(0, 2)}
                          </div>
                        `;
                      }}
                    />
                  </div>
                  
                  {/* Club Name */}
                  <div className="text-center">
                    <span className="font-semibold text-blue-700 text-sm leading-tight">
                      {club}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="text-center text-gray-500 text-xs mt-2">
          <span className="hidden sm:inline">← Scroll horizontally to view all teams →</span>
          <span className="sm:hidden">← Swipe to view all teams →</span>
        </div>
      </div>
    </Card>
  );
};
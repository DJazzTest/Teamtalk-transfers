import React from 'react';
import { Card } from '@/components/ui/card';
import { allPremierLeagueClubs } from '@/data/clubFinancials';

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
            {allPremierLeagueClubs.map((club) => (
              <Card 
                key={club}
                className="min-w-[160px] bg-gradient-to-br from-blue-50 to-white border-blue-200 hover:shadow-md transition-all duration-200 hover:border-blue-300 cursor-pointer"
                onClick={() => onSelectTeam && onSelectTeam(club)}
              >
                <div className="p-3 flex flex-col items-center gap-2">
                  {/* Club Badge Placeholder */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {club.split(' ').map(word => word[0]).join('').substring(0, 2)}
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
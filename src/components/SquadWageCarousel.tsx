
import React from 'react';
import { Card } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';

interface Player {
  name: string;
  weeklyWage: number;
  yearlyWage: number;
}

interface SquadWageCarouselProps {
  club: string;
}

const arsenalSquad: Player[] = [
  { name: 'Kai Havertz', weeklyWage: 280000, yearlyWage: 14.56 },
  { name: 'Gabriel Jesus', weeklyWage: 265000, yearlyWage: 13.78 },
  { name: 'Declan Rice', weeklyWage: 240000, yearlyWage: 12.48 },
  { name: 'Martin Ødegaard', weeklyWage: 240000, yearlyWage: 12.48 },
  { name: 'Viktor Gyökeres', weeklyWage: 200000, yearlyWage: 10.4 },
  { name: 'Bukayo Saka', weeklyWage: 195000, yearlyWage: 10.14 },
  { name: 'William Saliba', weeklyWage: 190000, yearlyWage: 9.88 },
  { name: 'Gabriel Martinelli', weeklyWage: 180000, yearlyWage: 9.36 },
  { name: 'Gabriel Magalhães', weeklyWage: 150000, yearlyWage: 7.8 },
  { name: 'Ben White', weeklyWage: 150000, yearlyWage: 7.8 },
  { name: 'Oleksandr Zinchenko', weeklyWage: 150000, yearlyWage: 7.8 },
  { name: 'Mikel Merino', weeklyWage: 130000, yearlyWage: 6.76 },
  { name: 'Riccardo Calafiori', weeklyWage: 120000, yearlyWage: 6.24 },
  { name: 'Reiss Nelson', weeklyWage: 100000, yearlyWage: 5.2 },
  { name: 'Fabio Vieira', weeklyWage: 95000, yearlyWage: 4.94 },
  { name: 'Eberechi Eze', weeklyWage: 90000, yearlyWage: 4.68 },
  { name: 'David Raya', weeklyWage: 85000, yearlyWage: 4.42 },
  { name: 'Jurrien Timber', weeklyWage: 80000, yearlyWage: 4.16 },
  { name: 'Jakub Kiwior', weeklyWage: 75000, yearlyWage: 3.9 },
  { name: 'Albert Sambi Lokonga', weeklyWage: 70000, yearlyWage: 3.64 },
  { name: 'Noni Madueke', weeklyWage: 65000, yearlyWage: 3.38 },
  { name: 'Martin Zubimendi', weeklyWage: 60000, yearlyWage: 3.12 },
  { name: 'Cristhian Mosquera', weeklyWage: 55000, yearlyWage: 2.86 },
  { name: 'Tommy Setford', weeklyWage: 30000, yearlyWage: 1.56 },
  { name: 'Ethan Nwaneri', weeklyWage: 25000, yearlyWage: 1.3 },
  { name: 'Myles Lewis-Skelly', weeklyWage: 20000, yearlyWage: 1.04 },
  { name: 'Alexei Rojas', weeklyWage: 15000, yearlyWage: 0.78 },
  { name: 'Joshua Nichols', weeklyWage: 10000, yearlyWage: 0.52 },
  { name: 'Louie Copley', weeklyWage: 8000, yearlyWage: 0.416 },
  { name: 'Ismeal Kabia', weeklyWage: 6000, yearlyWage: 0.312 },
  { name: 'Max Dowman', weeklyWage: 5000, yearlyWage: 0.26 },
  { name: 'Andre Harriman-Annous', weeklyWage: 5000, yearlyWage: 0.26 },
  { name: 'Marli Salmon', weeklyWage: 5000, yearlyWage: 0.26 }
];

export const SquadWageCarousel: React.FC<SquadWageCarouselProps> = ({ club }) => {
  // For now, only show Arsenal data
  if (club !== 'Arsenal') {
    return null;
  }

  const squad = arsenalSquad;
  const totalWeeklyWages = squad.reduce((sum, player) => sum + player.weeklyWage, 0);
  const totalYearlyWages = squad.reduce((sum, player) => sum + player.yearlyWage, 0);

  return (
    <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700 mb-6">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            {club} Squad Wages
          </h3>
          <div className="text-right">
            <div className="text-lg font-bold text-green-400">
              £{totalWeeklyWages.toLocaleString()}/week
            </div>
            <div className="text-sm text-gray-400">
              £{totalYearlyWages.toFixed(1)}m/year total
            </div>
          </div>
        </div>

        <Carousel className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {squad.map((player, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                <Card className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 transition-all duration-200">
                  <div className="p-4">
                    <h4 className="font-semibold text-white mb-2 truncate">
                      {player.name}
                    </h4>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Weekly:</span>
                        <Badge className="bg-green-500/20 text-green-400">
                          £{player.weeklyWage.toLocaleString()}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Yearly:</span>
                        <span className="text-blue-400 text-sm font-medium">
                          £{player.yearlyWage}m
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="text-white hover:text-blue-300" />
          <CarouselNext className="text-white hover:text-blue-300" />
        </Carousel>
      </div>
    </Card>
  );
};

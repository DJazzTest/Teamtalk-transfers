import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

// Mock news data - in a real app this would come from an API
const mockNews = [
  {
    id: '1',
    title: 'Arsenal Complete £51m Signing of Martin Zubimendi',
    summary: 'The Spanish midfielder joins from Real Sociedad on a five-year deal',
    source: 'BBC Sport',
    time: '2 hours ago',
    category: 'Transfer News'
  },
  {
    id: '2', 
    title: 'Liverpool Land £100m Florian Wirtz Deal',
    summary: 'The German wonderkid becomes Liverpool\'s record signing from Bayer Leverkusen',
    source: 'Sky Sports',
    time: '4 hours ago',
    category: 'Breaking News'
  },
  {
    id: '3',
    title: 'Chelsea Secure Jamie Gittens for £64.3m',
    summary: 'The English winger moves from Borussia Dortmund in a surprise deal',
    source: 'The Guardian',
    time: '6 hours ago',
    category: 'Transfer News'
  },
  {
    id: '4',
    title: 'Tottenham Sign Japanese Star Kota Takai',
    summary: 'The Kawasaki Frontale midfielder joins Spurs for €5.8m',
    source: 'ESPN',
    time: '8 hours ago',
    category: 'Transfer News'
  },
  {
    id: '5',
    title: 'Leeds United Land Gabriel Gudmundsson',
    summary: 'The Swedish defender joins from Lille for €11.6m',
    source: 'Yorkshire Evening Post',
    time: '10 hours ago',
    category: 'Transfer News'
  },
  {
    id: '6',
    title: 'Sunderland Sign Reinildo on Free Transfer',
    summary: 'The experienced defender joins from Atlético Madrid',
    source: 'Sunderland Echo',
    time: '12 hours ago',
    category: 'Transfer News'
  },
  {
    id: '7',
    title: 'Transfer Window Heating Up',
    summary: 'Premier League clubs have spent over £2 billion this summer',
    source: 'Premier League',
    time: '1 day ago',
    category: 'Market Update'
  }
];

interface NewsCarouselProps {
  maxItems?: number;
}

export const NewsCarousel: React.FC<NewsCarouselProps> = ({ maxItems = 5 }) => {
  const [showAll, setShowAll] = useState(false);
  const displayNews = showAll ? mockNews : mockNews.slice(0, maxItems);

  return (
    <Card className="mb-6 border-gray-200/50 shadow-lg" style={{ backgroundColor: '#e6f3ff' }}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <h2 className="text-lg font-bold text-blue-800">Latest Transfer News</h2>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-2" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#9CA3AF #E5E7EB'
        }}>
          {displayNews.map((article) => (
            <Card 
              key={article.id}
              className="min-w-[280px] max-w-sm bg-gradient-to-br from-blue-50 to-white border-blue-200 hover:shadow-md transition-all duration-200 hover:border-blue-300 cursor-pointer"
            >
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-blue-600 font-medium">{article.category}</span>
                </div>
                
                <h3 className="font-semibold text-blue-800 text-sm leading-tight line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-xs text-gray-600 line-clamp-2">
                  {article.summary}
                </p>
                
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-xs text-blue-600 font-medium">{article.source}</span>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {article.time}
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          {mockNews.length > maxItems && (
            <div className="flex items-center">
              <Button
                onClick={() => setShowAll(!showAll)}
                variant="outline"
                size="sm"
                className="border-blue-400 text-blue-700 hover:bg-blue-50 ml-2"
              >
                {showAll ? 'Show Less' : `Show More (${mockNews.length - maxItems} more)`}
              </Button>
            </div>
          )}
        </div>
        
        <div className="text-center text-gray-500 text-xs mt-2">
          <span className="hidden sm:inline">← Scroll horizontally to view all news →</span>
          <span className="sm:hidden">← Swipe to view all news →</span>
        </div>
      </div>
    </Card>
  );
};
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ExternalLink } from 'lucide-react';
import { useScoreInsideFeed } from '@/hooks/useScoreInsideFeed';
import { useTeamTalkFeed } from '@/hooks/useTeamTalkFeed';
import { TeamTalkArticle } from '@/types/teamtalk';

// Premier League clubs filter
const premierLeagueClubs = [
  'Arsenal', 'Aston Villa', 'Brentford', 'Brighton & Hove Albion', 'Chelsea',
  'Crystal Palace', 'Everton', 'Fulham', 'Ipswich Town', 'Leeds United',
  'Leicester City', 'Liverpool', 'Manchester City', 'Manchester United',
  'Newcastle United', 'Nottingham Forest', 'Sheffield United', 'Southampton',
  'Tottenham Hotspur', 'West Ham United'
];

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  time: string;
  category: string;
  image?: string;
  url?: string;
}

interface NewsCarouselProps {
  maxItems?: number;
}

export const NewsCarousel: React.FC<NewsCarouselProps> = ({ maxItems = 5 }) => {
  const [showAll, setShowAll] = useState(false);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { articles: teamTalkArticles, loading: teamTalkLoading } = useTeamTalkFeed();
  const { allTransfers, loading: scoreInsideLoading } = useScoreInsideFeed();

  useEffect(() => {
    const processNewsData = () => {
      const processedNews: NewsArticle[] = [];

      // Process TeamTalk articles
      teamTalkArticles
        .filter(article => {
          // Filter for Premier League clubs only
          const content = `${article.headline} ${article.excerpt}`.toLowerCase();
          return premierLeagueClubs.some(club => 
            content.includes(club.toLowerCase())
          );
        })
        .slice(0, 10) // Limit to prevent too many articles
        .forEach(article => {
          processedNews.push({
            id: `teamtalk-${article.id}`,
            title: article.headline,
            summary: article.excerpt,
            source: 'TeamTalk',
            time: formatTime(article.pub_date),
            category: article.category?.[0] || 'Transfer News',
            image: article.image,
            url: article.link
          });
        });

      // Remove duplicates and sort by recency
      const uniqueNews = processedNews
        .filter((article, index, self) => 
          index === self.findIndex(a => 
            a.title.toLowerCase() === article.title.toLowerCase()
          )
        )
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      setNewsArticles(uniqueNews);
      setLoading(false);
    };

    if (!teamTalkLoading && !scoreInsideLoading) {
      processNewsData();
    }
  }, [teamTalkArticles, allTransfers, teamTalkLoading, scoreInsideLoading]);

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  const displayNews = showAll ? newsArticles : newsArticles.slice(0, maxItems);

  return (
    <Card className="mb-6 border-gray-200/50 shadow-lg" style={{ backgroundColor: '#e6f3ff' }}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <h2 className="text-lg font-bold text-blue-800">Latest Transfer News</h2>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-blue-700">Loading latest news...</span>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#9CA3AF #E5E7EB'
          }}>
            {displayNews.map((article) => (
              <Card 
                key={article.id}
                className="min-w-[280px] max-w-sm bg-gradient-to-br from-blue-50 to-white border-blue-200 hover:shadow-md transition-all duration-200 hover:border-blue-300 cursor-pointer"
                onClick={() => article.url && window.open(article.url, '_blank')}
              >
                <div className="p-4 flex flex-col gap-3">
                  {article.image && (
                    <div className="w-full h-32 rounded-lg overflow-hidden">
                      <img 
                        src={article.image} 
                        alt={article.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
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
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {article.time}
                      </div>
                      {article.url && (
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
          
        {!loading && newsArticles.length > maxItems && (
          <div className="flex items-center">
            <Button
              onClick={() => setShowAll(!showAll)}
              variant="outline"
              size="sm"
              className="border-blue-400 text-blue-700 hover:bg-blue-50 ml-2"
            >
              {showAll ? 'Show Less' : `Show More (${newsArticles.length - maxItems} more)`}
            </Button>
          </div>
        )}
        
        <div className="text-center text-gray-500 text-xs mt-2">
          <span className="hidden sm:inline">← Scroll horizontally to view all news →</span>
          <span className="sm:hidden">← Swipe to view all news →</span>
        </div>
      </div>
    </Card>
  );
};
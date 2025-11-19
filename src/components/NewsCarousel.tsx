import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ExternalLink } from 'lucide-react';
import { newsApi } from '@/services/newsApi';

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
  const [refreshKey, setRefreshKey] = useState(0);

  const showPlaceholder = React.useCallback((img: HTMLImageElement) => {
    const parent = img.parentElement;
    if (parent) {
      parent.innerHTML =
        '<div class="w-full h-full flex items-center justify-center rounded-lg bg-gray-200 text-gray-500 text-xs dark:bg-slate-600 dark:text-gray-300">No Image</div>';
    }
  }, []);

  const getFallbackUrls = React.useCallback((imageUrl?: string) => {
    if (!imageUrl) return [];
    const urls: string[] = [];

    const addUrl = (url?: string) => {
      if (url && !urls.includes(url)) {
        urls.push(url);
      }
    };

    addUrl(imageUrl);

    let originalUrl = imageUrl;
    if (imageUrl.includes('images.ps-aws.com')) {
      const match = imageUrl.match(/url=([^&]+)/);
      if (match) {
        try {
          originalUrl = decodeURIComponent(match[1]);
          addUrl(originalUrl);
        } catch (error) {
          console.warn('Failed to decode proxied image URL', error);
        }
      }
    } else {
      addUrl(originalUrl);
    }

    addUrl(`https://api.allorigins.win/raw?url=${encodeURIComponent(originalUrl)}`);
    addUrl(`https://corsproxy.io/?${encodeURIComponent(originalUrl)}`);

    return urls;
  }, []);

  const handleImageError = React.useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    let fallbacks: string[] = [];

    try {
      fallbacks = img.dataset.fallbacks ? JSON.parse(img.dataset.fallbacks) : [];
    } catch (error) {
      console.warn('Failed to parse fallback URLs', error);
    }

    if (!Array.isArray(fallbacks) || fallbacks.length === 0) {
      showPlaceholder(img);
      return;
    }

    let currentIndex = parseInt(img.dataset.fallbackIndex ?? '0', 10);
    if (Number.isNaN(currentIndex)) currentIndex = 0;

    if (currentIndex >= fallbacks.length - 1) {
      showPlaceholder(img);
      return;
    }

    currentIndex += 1;
    img.dataset.fallbackIndex = String(currentIndex);
    img.src = fallbacks[currentIndex];
  }, [showPlaceholder]);

  useEffect(() => {
    const fetchNews = async (forceRefresh = false) => {
      setLoading(true);
      try {
        const articles = await newsApi.fetchNews(forceRefresh);
        
        // Filter for Premier League clubs only
        const filteredArticles = articles.filter(article => {
          const content = `${article.title} ${article.summary}`.toLowerCase();
          return premierLeagueClubs.some(club => 
            content.includes(club.toLowerCase())
          );
        });
        
        // Debug: Log articles with images
        console.log('📰 News articles fetched:', filteredArticles.length);
        filteredArticles.forEach((article, idx) => {
          if (article.image) {
            console.log(`  Article ${idx + 1}: ${article.title.substring(0, 50)}... - Image: ${article.image.substring(0, 80)}...`);
          } else {
            console.log(`  Article ${idx + 1}: ${article.title.substring(0, 50)}... - No image`);
          }
        });
        
        setNewsArticles(filteredArticles);
      } catch (error) {
        console.error('Error fetching news:', error);
        setNewsArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    
    // Auto refresh every 5 minutes to get latest news
    const interval = setInterval(() => {
      fetchNews();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshKey]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const articles = await newsApi.fetchNews(true); // Force refresh
      
      // Filter for Premier League clubs only
      const filteredArticles = articles.filter(article => {
        const content = `${article.title} ${article.summary}`.toLowerCase();
        return premierLeagueClubs.some(club => 
          content.includes(club.toLowerCase())
        );
      });
      
      setNewsArticles(filteredArticles);
    } catch (error) {
      console.error('Error refreshing news:', error);
    } finally {
      setLoading(false);
    }
  };

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
    <>
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-white"></div>
            <span className="ml-2 text-gray-700 dark:text-white">Loading latest news...</span>
          </div>
        ) : newsArticles.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-gray-900 dark:text-white font-medium mb-2">No news articles available</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">The news API is currently unavailable. Please try again later.</p>
            </div>
          </div>
        ) : (
          <>
            {displayNews.map((article) => {
              const fallbackUrls = getFallbackUrls(article.image);
              const hasImage = fallbackUrls.length > 0;

              return (
                <div
                  key={article.id}
                  className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-slate-700/70 transition-all duration-200 cursor-pointer border border-gray-200 dark:border-slate-600"
                  onClick={() => {
                    // Open article in new tab instead of modal
                    if (article.url) {
                      window.open(article.url, '_blank', 'noopener,noreferrer');
                    }
                  }}
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    {hasImage ? (
                      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-slate-600">
                        <img 
                          src={fallbackUrls[0]}
                          alt={article.title}
                          className="w-full h-full object-cover"
                          data-fallbacks={JSON.stringify(fallbackUrls)}
                          data-fallback-index="0"
                          loading="lazy"
                          crossOrigin="anonymous"
                          onError={(event) => handleImageError(event)}
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 flex-shrink-0 rounded-lg bg-gray-200 dark:bg-slate-600 flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{article.category}</span>
                        <span className="text-gray-400 dark:text-gray-500">•</span>
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          {article.time}
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight line-clamp-2 mb-2 hover:text-blue-600 dark:hover:text-blue-300 transition-colors">
                        {article.title}
                      </h3>
                      
                      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                        {article.summary}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {article.source === 'ScoreInside' ? 'TeamTalk' : article.source}
                        </span>
                        <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Show More Button */}
            {!loading && newsArticles.length > maxItems && (
              <div className="flex justify-center pt-2">
                <Button
                  onClick={() => setShowAll(!showAll)}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white"
                >
                  {showAll ? 'Show Less' : `Show More (${newsArticles.length - maxItems} more)`}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};
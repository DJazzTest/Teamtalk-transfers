import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [articleContent, setArticleContent] = useState<string | null>(null);
  const [loadingArticle, setLoadingArticle] = useState(false);

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

  const fetchArticleContent = async (url: string) => {
    try {
      // Try multiple CORS proxies
      const proxies = [
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
      ];

      for (const proxyUrl of proxies) {
        try {
          const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
          });

          if (response.ok) {
            let html = '';
            if (proxyUrl.includes('allorigins.win')) {
              const data = await response.json();
              html = data.contents;
            } else {
              html = await response.text();
            }

            if (html && html.length > 100) {
              // Extract main content from HTML
              const parser = new DOMParser();
              const doc = parser.parseFromString(html, 'text/html');
              
              // Remove scripts, styles, and other unwanted elements
              const unwanted = doc.querySelectorAll('script, style, nav, header, footer, aside, .ad, .advertisement, [class*="ad-"], [id*="ad-"], .social-share, .comments, .related-posts, .newsletter');
              unwanted.forEach(el => el.remove());
              
              // Try to find main content
              const mainContent = doc.querySelector('main, article, [role="main"], .content, .post-content, .article-content, .entry-content, .article-body, .story-body, .post-body') || doc.body;
              
              // Clean up the content - remove more unwanted elements
              const cleanElements = mainContent.querySelectorAll('nav, header, footer, aside, .ad, .advertisement, .social-share, .comments, .related-posts, .newsletter, .author-box, .tags, .share-buttons');
              cleanElements.forEach(el => el.remove());
              
              // Get text content and preserve some basic formatting
              const content = mainContent.innerHTML
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');
              
              if (content && content.length > 200) {
                setArticleContent(content);
                return;
              }
            }
          }
        } catch (err) {
          console.error('Proxy failed:', proxyUrl, err);
          continue;
        }
      }
      
      // If all proxies fail, show a message
      setArticleContent('<p class="text-gray-500 dark:text-gray-400">Unable to load article content. Please use the "Read Full Article" button to view on the original site.</p>');
    } catch (error) {
      console.error('Error fetching article content:', error);
      setArticleContent('<p class="text-red-500 dark:text-red-400">Error loading article content. Please use the "Read Full Article" button.</p>');
    }
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
                    setSelectedArticle(article);
                    setIsModalOpen(true);
                    setArticleContent(null);
                    setLoadingArticle(false);
                    
                    // Auto-load article content if URL is available
                    if (article.url) {
                      setLoadingArticle(true);
                      fetchArticleContent(article.url).finally(() => {
                        setLoadingArticle(false);
                      });
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

    {/* News Detail Modal */}
    <Dialog open={isModalOpen} onOpenChange={(open) => {
      setIsModalOpen(open);
      if (!open) {
        setArticleContent(null);
        setLoadingArticle(false);
      }
    }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-slate-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-800 dark:text-blue-200 pr-8">
            {selectedArticle?.title}
          </DialogTitle>
        </DialogHeader>

        {selectedArticle && (
          <div className="space-y-4 mt-4 overflow-y-auto flex-1 pr-2" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#9CA3AF #E5E7EB',
            maxHeight: 'calc(90vh - 100px)'
          }}>
            {/* Image */}
            {selectedArticle.image && (
              <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-200 relative">
                <img 
                  src={selectedArticle.image} 
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Modal image failed to load:', selectedArticle.image);
                    const target = e.target as HTMLImageElement;
                    const parent = target.parentElement;
                    
                    // Try to extract original URL from proxy and try direct load
                    if (selectedArticle.image && selectedArticle.image.includes('images.ps-aws.com')) {
                      try {
                        const urlMatch = selectedArticle.image.match(/url=([^&]+)/);
                        if (urlMatch) {
                          const originalUrl = decodeURIComponent(urlMatch[1]);
                          console.log('  🔄 Trying direct URL for modal:', originalUrl.substring(0, 80));
                          
                          // Try alternative proxy
                          const altProxies = [
                            `https://api.allorigins.win/raw?url=${encodeURIComponent(originalUrl)}`,
                            `https://corsproxy.io/?${encodeURIComponent(originalUrl)}`,
                            originalUrl // Try direct as last resort
                          ];
                          
                          let proxyIndex = 0;
                          const tryNextProxy = () => {
                            if (proxyIndex >= altProxies.length) {
                              if (parent) {
                                parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-300"><span class="text-gray-600 text-sm">Image unavailable</span></div>';
                              }
                              return;
                            }
                            
                            const testImg = new Image();
                            testImg.onload = () => {
                              target.src = altProxies[proxyIndex];
                              console.log('  ✅ Alternative proxy worked for modal:', altProxies[proxyIndex].substring(0, 80));
                            };
                            testImg.onerror = () => {
                              proxyIndex++;
                              tryNextProxy();
                            };
                            testImg.src = altProxies[proxyIndex];
                          };
                          
                          tryNextProxy();
                          return;
                        }
                      } catch (err) {
                        console.error('  ❌ Error extracting URL:', err);
                      }
                    }
                    
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-300"><span class="text-gray-600 text-sm">Image unavailable</span></div>';
                    }
                  }}
                  onLoad={() => {
                    console.log('✅ Modal image loaded:', selectedArticle.image?.substring(0, 80));
                  }}
                  crossOrigin="anonymous"
                />
              </div>
            )}

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium">{selectedArticle.category}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{selectedArticle.time}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">Source:</span>
                <span>{selectedArticle.source === 'ScoreInside' ? 'TeamTalk' : selectedArticle.source}</span>
              </div>
            </div>

            {/* Summary */}
            {selectedArticle.summary && (
              <div className="prose max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {selectedArticle.summary}
                </p>
              </div>
            )}

            {/* Article Content */}
            {loadingArticle && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">Loading article content...</span>
              </div>
            )}
            
            {articleContent && !loadingArticle && (
              <div className="mt-4 border-t border-gray-200 dark:border-slate-600 pt-4">
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200"
                  style={{
                    maxHeight: '400px',
                    overflowY: 'auto',
                    paddingRight: '8px'
                  }}
                  dangerouslySetInnerHTML={{ __html: articleContent }}
                />
              </div>
            )}

            {/* External Link Button */}
            {selectedArticle.url && (
              <div className="pt-4 border-t border-gray-200 dark:border-slate-600 flex items-center gap-4">
                {!articleContent && !loadingArticle && (
                  <Button
                    onClick={async () => {
                      setLoadingArticle(true);
                      try {
                        await fetchArticleContent(selectedArticle.url!);
                      } catch (error) {
                        console.error('Error loading article:', error);
                      } finally {
                        setLoadingArticle(false);
                      }
                    }}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Load article content
                  </Button>
                )}
                <Button
                  onClick={() => window.open(selectedArticle.url, '_blank', 'noopener,noreferrer')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Read Full Article
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
};
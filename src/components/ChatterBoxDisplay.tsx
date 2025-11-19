import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { MessageSquare, Image as ImageIcon, Link as LinkIcon, Video, ExternalLink, X, Clock } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { ChatterBoxEntry } from './ChatterBoxManagement';
import { TeamTalkAppPrompt, isTeamTalkUrl } from '@/components/TeamTalkAppPrompt';

const STORAGE_KEY = 'chatterBoxEntries';
const API_URL = '/.netlify/functions/live-hub';
const REFRESH_INTERVAL = 60 * 1000;

const sortEntries = (data: ChatterBoxEntry[]) =>
  data
    .slice()
    .sort((a, b) => {
      try {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } catch {
        return 0;
      }
    });

const persistLocally = (data: ChatterBoxEntry[]) => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Live Hub display: failed to persist to localStorage', error);
  }
};

const loadFromLocal = (): ChatterBoxEntry[] | null => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Live Hub display: failed to parse local entries', error);
  }
  return null;
};

export const ChatterBoxDisplay: React.FC = () => {
  const [entries, setEntries] = useState<ChatterBoxEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<ChatterBoxEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [articleContent, setArticleContent] = useState<string | null>(null);
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [showAppPrompt, setShowAppPrompt] = useState(false);
  const [selectedArticleUrl, setSelectedArticleUrl] = useState<string | undefined>();

  const fetchRemoteEntries = async (): Promise<ChatterBoxEntry[]> => {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Live Hub API responded with ${response.status}`);
    }

    const payload = await response.json();
    if (Array.isArray(payload)) {
      return payload;
    }
    if (payload && Array.isArray(payload.entries)) {
      return payload.entries;
    }
    return [];
  };

  const loadEntries = async () => {
    try {
      const remoteEntries = await fetchRemoteEntries();
      const sorted = sortEntries(remoteEntries);
      setEntries(sorted);
      persistLocally(sorted);
      return;
    } catch (error) {
      console.warn('Live Hub display: remote fetch failed, falling back to local', error);
    }

    const localEntries = loadFromLocal();
    setEntries(localEntries ? sortEntries(localEntries) : []);
  };

  useEffect(() => {
    // Delay initial load slightly to ensure localStorage is ready (especially on mobile)
    const loadTimer = setTimeout(() => {
      loadEntries();
    }, 100);

    // Periodically refresh to capture remote updates (e.g., other devices)
    const intervalId = setInterval(() => {
      loadEntries();
    }, REFRESH_INTERVAL);
    
    // Listen for storage changes (when CMS updates entries in another tab/window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadEntries();
      }
    };
    
    // Listen for custom event from CMS (same window)
    const handleCustomUpdate = () => {
      loadEntries();
    };
    
    // Also listen for focus events (when user returns to tab/window on mobile)
    const handleFocus = () => {
      loadEntries();
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('chatterBoxUpdated', handleCustomUpdate);
      window.addEventListener('focus', handleFocus);
    }
    
    return () => {
      clearTimeout(loadTimer);
      clearInterval(intervalId);
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('chatterBoxUpdated', handleCustomUpdate);
        window.removeEventListener('focus', handleFocus);
      }
    };
  }, []);

  const handleEntryClick = (entry: ChatterBoxEntry) => {
    // For articles, open in new tab instead of modal
    if (entry.linkPreview?.type === 'article' || entry.articleUrl || entry.socialMediaUrl) {
      const articleUrl = entry.articleUrl || entry.socialMediaUrl || entry.linkPreview?.url;
      if (articleUrl) {
        // Check if it's a TeamTalk article and if user hasn't dismissed the prompt
        const isTeamTalk = isTeamTalkUrl(articleUrl);
        const hasDismissed = localStorage.getItem('teamtalk-app-prompt-dismissed') === 'true';
        
        if (isTeamTalk && !hasDismissed) {
          setSelectedArticleUrl(articleUrl);
          setShowAppPrompt(true);
          return;
        } else {
          window.open(articleUrl, '_blank', 'noopener,noreferrer');
          return;
        }
      }
    }
    
    // For YouTube videos, open in new tab
    if (entry.linkPreview?.type === 'youtube' && entry.linkPreview.url) {
      window.open(entry.linkPreview.url, '_blank', 'noopener,noreferrer');
      return;
    }
    
    // For other entries (text-only or images), open modal as before
    setSelectedEntry(entry);
    setIsModalOpen(true);
    setArticleContent(null);
    setLoadingArticle(false);
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
      setArticleContent('<p class="text-gray-500 dark:text-gray-400">Unable to load article content. Please use the "Read full article" link to view on the original site.</p>');
    } catch (error) {
      console.error('Error fetching article content:', error);
      setArticleContent('<p class="text-red-500 dark:text-red-400">Error loading article content. Please use the "Read full article" link.</p>');
    }
  };

  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const formatTimeAgo = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Just now';
      if (diffInHours === 1) return '1 hour ago';
      if (diffInHours < 24) return `${diffInHours} hours ago`;
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) return '1 day ago';
      return `${diffInDays} days ago`;
    } catch {
      return dateString;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Check if localStorage is available for debugging
  const isLocalStorageAvailable = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'unknown';
  
  if (entries.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
          No chatter box entries yet. Check back soon!
        </p>
        {!isLocalStorageAvailable && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-2">
            Note: localStorage is not available. This may be due to private browsing mode.
          </p>
        )}
        {isLocalStorageAvailable && currentDomain !== 'localhost' && !currentDomain.includes('127.0.0.1') && (
          <p className="text-xs text-amber-500 dark:text-amber-400 mt-2 px-4">
            Note: Chatter Box entries are stored locally. Entries created on localhost won't appear here. 
            To see entries on production, they need to be created on this domain.
          </p>
        )}
        {isLocalStorageAvailable && (
          <button
            onClick={() => {
              console.log('Manual refresh triggered from button');
              loadEntries();
            }}
            className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline px-4 py-2 rounded border border-blue-600 dark:border-blue-400"
          >
            Refresh
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {entries.map((entry) => {
          // Check if this is a YouTube video entry
          const isYouTubeVideo = entry.linkPreview && entry.linkPreview.type === 'youtube' && entry.linkPreview.image;
          const isArticle = (entry.articleUrl || entry.socialMediaUrl) && entry.linkPreview && entry.linkPreview.type === 'article';
          const hasImage = entry.imageDataUrl;
          
          // Use news-style layout for YouTube videos, articles, and entries with images
          if (isYouTubeVideo || isArticle || hasImage) {
            return (
              <div
                key={entry.id}
                onClick={() => handleEntryClick(entry)}
                className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-slate-700/70 transition-all duration-200 cursor-pointer border border-gray-200 dark:border-slate-600"
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-slate-600 relative">
                    {entry.linkPreview?.image ? (
                      <>
                        <img
                          src={entry.linkPreview.image}
                          alt={entry.linkPreview.title || 'Video thumbnail'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        {isYouTubeVideo && (
                          <div className="absolute top-1 right-1 bg-black/50 backdrop-blur-sm rounded-full p-1" title="Video">
                            <Video className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </>
                    ) : hasImage ? (
                      <div className="relative w-full h-full">
                        <img
                          src={entry.imageDataUrl}
                          alt="Chatter box"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        {entry.imageOverlayText && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent text-white p-1.5">
                            <p className="text-[10px] font-semibold line-clamp-1">{entry.imageOverlayText}</p>
                          </div>
                        )}
                        <div className="absolute top-1 right-1 bg-black/50 backdrop-blur-sm rounded-full p-1">
                          <ImageIcon className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    ) : isArticle && entry.linkPreview?.image ? (
                      <div className="w-full h-full rounded-lg overflow-hidden">
                        <img
                          src={entry.linkPreview.image}
                          alt={entry.linkPreview.title || 'Article preview'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to TeamTalk logo if image fails
                            const img = e.target as HTMLImageElement;
                            img.src = 'https://www.teamtalk.com/content/themes/teamtalk2/img/png/logo/teamtalk-mobile.png';
                            img.className = 'w-full h-full object-contain p-2 bg-slate-700';
                          }}
                        />
                      </div>
                    ) : isArticle ? (
                      <div className="w-full h-full rounded-lg bg-slate-600 flex items-center justify-center">
                        <img
                          src="https://www.teamtalk.com/content/themes/teamtalk2/img/png/logo/teamtalk-mobile.png"
                          alt="TEAMtalk"
                          className="w-12 h-auto opacity-50"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 relative">
                    {/* Metadata Line */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {isYouTubeVideo ? 'Video' : entry.articleUrl ? 'Article' : entry.socialMediaUrl ? 'Social Media' : hasImage ? 'Image' : 'Transfer News'}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500">•</span>
                      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(entry.createdAt)}
                      </div>
                    </div>
                    
                    {/* Headline - prioritize link preview title, then text */}
                    <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 leading-snug">
                      {entry.linkPreview?.title || (entry.text ? (entry.text.length > 80 ? entry.text.substring(0, 80) + '...' : entry.text) : 'Article')}
                    </h4>
                    
                    {/* Description/Text */}
                    {entry.linkPreview?.description ? (
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-1">
                        {entry.linkPreview.description}
                      </p>
                    ) : entry.text && entry.text.length > 80 ? (
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-1">
                        {entry.text.substring(80)}
                      </p>
                    ) : entry.text ? (
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-1">
                        {entry.text}
                      </p>
                    ) : null}
                    
                    {/* Source/Author and Timestamp */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {isYouTubeVideo ? 'YouTube' : entry.articleUrl ? 'Article' : entry.socialMediaUrl ? 'Social Media' : hasImage ? 'Image Post' : 'Post'}
                        </span>
                        {(entry.articleUrl || entry.socialMediaUrl) && (() => {
                          try {
                            const url = entry.articleUrl || entry.socialMediaUrl || '';
                            const hostname = new URL(url).hostname.replace('www.', '');
                            return (
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {hostname}
                              </span>
                            );
                          } catch {
                            return null;
                          }
                        })()}
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          
          // Default layout for text-only entries (no images, videos, or articles)
          return (
            <div
              key={entry.id}
              onClick={() => handleEntryClick(entry)}
              className="bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors overflow-hidden"
            >
              {/* Text Content */}
              <div className="p-4">
                <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-3 mb-2">
                  {entry.text}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {entry.articleUrl && (
                      <span title="Article">
                        <LinkIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </span>
                    )}
                    {entry.socialMediaUrl && (
                      <span title="Social Media">
                        <LinkIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(entry.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for full entry view */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open);
        if (!open) {
          setArticleContent(null);
          setLoadingArticle(false);
        }
      }}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-slate-800 text-gray-900 dark:text-white p-4 sm:p-6">
          {selectedEntry && (
            <div className="space-y-4 overflow-y-auto flex-1 pr-2" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#9CA3AF #E5E7EB',
              maxHeight: 'calc(90vh - 100px)'
            }}>
              <div className="flex items-start">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Transfers Chatter Box
                </h3>
              </div>

              {selectedEntry.text ? (
                <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                  {selectedEntry.text}
                </p>
              ) : selectedEntry.linkPreview?.title ? (
                <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed italic text-gray-500 dark:text-gray-400">
                  No description provided. Article headline: {selectedEntry.linkPreview.title}
                </p>
              ) : null}

              {/* Timestamp */}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-slate-600">
                <Clock className="w-4 h-4" />
                <span>Created: {formatDate(selectedEntry.createdAt)} ({formatTimeAgo(selectedEntry.createdAt)})</span>
                {selectedEntry.updatedAt && (
                  <>
                    <span>•</span>
                    <span>Updated: {formatDate(selectedEntry.updatedAt)} ({formatTimeAgo(selectedEntry.updatedAt)})</span>
                  </>
                )}
              </div>

              {selectedEntry.imageDataUrl && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Image
                  </h4>
                  <div className="relative">
                    <img
                      src={selectedEntry.imageDataUrl}
                      alt="Chatter box"
                      className="w-full rounded-lg border border-gray-200 dark:border-slate-600"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    {selectedEntry.imageOverlayText && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent text-white p-4 rounded-b-lg">
                        <p className="text-base font-semibold">{selectedEntry.imageOverlayText}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Link Preview - YouTube, Instagram, or Article */}
              {selectedEntry.linkPreview && (
                <div>
                  {selectedEntry.linkPreview.type === 'youtube' && selectedEntry.linkPreview.embedUrl && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        {selectedEntry.linkPreview.title || 'YouTube Video'}
                      </h4>
                      {selectedEntry.linkPreview.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {selectedEntry.linkPreview.description}
                        </p>
                      )}
                      <div className="aspect-video">
                        <iframe
                          src={selectedEntry.linkPreview.embedUrl}
                          title={selectedEntry.linkPreview.title || 'Video'}
                          className="w-full h-full rounded-lg"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}

                  {selectedEntry.linkPreview.type === 'article' && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        {selectedEntry.linkPreview.title || 'Article'}
                      </h4>
                      {selectedEntry.linkPreview.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {selectedEntry.linkPreview.description}
                        </p>
                      )}
                      {selectedEntry.linkPreview.image && (
                        <img
                          src={selectedEntry.linkPreview.image}
                          alt={selectedEntry.linkPreview.title || 'Article preview'}
                          className="w-full rounded-lg border border-gray-200 dark:border-slate-600 mb-2"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
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
                      
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
                        {!articleContent && !loadingArticle && (
                          <button
                            onClick={async () => {
                              const articleUrl = selectedEntry.articleUrl || selectedEntry.socialMediaUrl || selectedEntry.linkPreview?.url;
                              if (!articleUrl) return;
                              
                              setLoadingArticle(true);
                              try {
                                await fetchArticleContent(articleUrl);
                              } catch (error) {
                                console.error('Error loading article:', error);
                              } finally {
                                setLoadingArticle(false);
                              }
                            }}
                            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                          >
                            <LinkIcon className="w-4 h-4" />
                            Load article content
                          </button>
                        )}
                        <a
                          href={selectedEntry.linkPreview.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                        >
                          Read full article
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  {selectedEntry.linkPreview.type === 'instagram' && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        {selectedEntry.linkPreview.title || 'Instagram Post'}
                      </h4>
                      <a
                        href={selectedEntry.linkPreview.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View on Instagram
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* TeamTalk App Prompt */}
      <TeamTalkAppPrompt
        isOpen={showAppPrompt}
        onClose={() => setShowAppPrompt(false)}
        onDismiss={() => {
          localStorage.setItem('teamtalk-app-prompt-dismissed', 'true');
          setShowAppPrompt(false);
        }}
        articleUrl={selectedArticleUrl}
      />
    </>
  );
};


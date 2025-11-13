import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { MessageSquare, Image as ImageIcon, Link as LinkIcon, Video, ExternalLink, X, Clock } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { ChatterBoxEntry } from './ChatterBoxManagement';

const STORAGE_KEY = 'chatterBoxEntries';

export const ChatterBoxDisplay: React.FC = () => {
  const [entries, setEntries] = useState<ChatterBoxEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<ChatterBoxEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Delay initial load slightly to ensure localStorage is ready (especially on mobile)
    const loadTimer = setTimeout(() => {
      loadEntries();
    }, 100);
    
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
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('chatterBoxUpdated', handleCustomUpdate);
        window.removeEventListener('focus', handleFocus);
      }
    };
  }, []);

  const loadEntries = () => {
    try {
      // Check if localStorage is available (some mobile browsers in private mode block it)
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        console.warn('localStorage is not available - may be in private browsing mode');
        setEntries([]);
        return;
      }

      // Test localStorage access (some mobile browsers throw errors on access)
      try {
        localStorage.setItem('__test__', 'test');
        localStorage.removeItem('__test__');
      } catch (testError) {
        console.warn('localStorage access test failed:', testError);
        setEntries([]);
        return;
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      console.log('ChatterBox: Checking localStorage for key:', STORAGE_KEY, 'Found:', !!stored);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('ChatterBox: Parsed data type:', typeof parsed, 'Is array:', Array.isArray(parsed));
        
        // Ensure it's an array
        if (!Array.isArray(parsed)) {
          console.warn('Chatter box entries is not an array:', parsed);
          setEntries([]);
          return;
        }
        
        // Sort by date, newest first
        const sorted = parsed.sort((a: ChatterBoxEntry, b: ChatterBoxEntry) => {
          try {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          } catch {
            return 0;
          }
        });
        console.log(`ChatterBox: Loaded ${sorted.length} entries successfully`);
        setEntries(sorted);
      } else {
        console.log('ChatterBox: No entries found in localStorage. Current domain:', window.location.hostname);
        console.log('ChatterBox: Note - localStorage is domain-specific. Entries created on localhost won\'t appear on production domain.');
        setEntries([]);
      }
    } catch (error) {
      console.error('ChatterBox: Error loading entries:', error);
      // Try to recover by checking if localStorage has the key but corrupted data
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY);
          console.log('ChatterBox: Cleared corrupted entries');
        }
      } catch {
        // Ignore errors when trying to clear
      }
      setEntries([]);
    }
  };

  const handleEntryClick = (entry: ChatterBoxEntry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
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
                          <div className="absolute top-1 right-1 bg-black/50 backdrop-blur-sm rounded-full p-1">
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
                      <LinkIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" title="Article" />
                    )}
                    {entry.socialMediaUrl && (
                      <LinkIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" title="Social Media" />
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
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white max-h-[90vh] overflow-y-auto">
          {selectedEntry && (
            <div className="space-y-4">
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

              {(selectedEntry.imageDataUrl || selectedEntry.imageUrl) && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Image
                  </h4>
                  <div className="relative">
                    <img
                      src={selectedEntry.imageDataUrl || selectedEntry.imageUrl}
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
                      <a
                        href={selectedEntry.linkPreview.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Read full article
                        <ExternalLink className="w-3 h-3" />
                      </a>
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

              {/* Fallback to old videoUrl if no linkPreview */}
              {!selectedEntry.linkPreview && selectedEntry.videoUrl && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Video
                  </h4>
                  {isYouTubeUrl(selectedEntry.videoUrl) ? (
                    <div className="aspect-video">
                      <iframe
                        src={getYouTubeEmbedUrl(selectedEntry.videoUrl) || selectedEntry.videoUrl}
                        title="Video"
                        className="w-full h-full rounded-lg"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <video
                      src={selectedEntry.videoUrl}
                      controls
                      className="w-full rounded-lg border border-gray-200 dark:border-slate-600"
                    />
                  )}
                </div>
              )}

              {(selectedEntry.tweetUrl || selectedEntry.facebookUrl) && (
                <div className="space-y-2">
                  {selectedEntry.tweetUrl && (
                    <a
                      href={selectedEntry.tweetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <LinkIcon className="w-4 h-4" />
                      View Tweet
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {selectedEntry.facebookUrl && (
                    <a
                      href={selectedEntry.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <LinkIcon className="w-4 h-4" />
                      View Facebook Post
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};


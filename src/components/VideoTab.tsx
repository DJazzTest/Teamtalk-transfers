import React, { useState, useEffect } from 'react';
import { Video, Clock, ExternalLink, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { crowdyNewsApi, CrowdyNewsItem } from '@/services/crowdyNewsApi';
import { TeamTalkAppPrompt, isTeamTalkUrl } from '@/components/TeamTalkAppPrompt';
import { stripHtml, normalizeToHttps, cleanTitle, parseTextWithUrls } from '@/utils/htmlUtils';

interface VideoItem extends CrowdyNewsItem {
  isVideo?: boolean;
}

// Transfer-related keywords to filter videos
const TRANSFER_KEYWORDS = [
  'transfer', 'signing', 'sign', 'deal', 'move', 'join', 'leave', 'departure',
  'arrival', 'loan', 'permanent', 'contract', 'fee', 'million', 'pound',
  'euro', 'agreement', 'medical', 'announcement', 'confirmed', 'rumour',
  'rumor', 'target', 'interest', 'bid', 'offer', 'negotiation', 'talks'
];

// Premier League team slugs for Crowdy News
const TEAM_SLUGS = [
  'chelsea', 'manchester-united', 'leeds-united', 'arsenal', 'liverpool',
  'manchester-city', 'brighton-hove-albion', 'newcastle-united', 'aston-villa',
  'afc-bournemouth', 'tottenham-hotspur', 'crystal-palace', 'nottingham-forest',
  'fulham', 'brentford', 'everton', 'wolves', 'west-ham-united', 'sunderland', 'burnley'
];

const isTransferRelated = (item: CrowdyNewsItem): boolean => {
  const content = `${item.title} ${item.summary || ''}`.toLowerCase();
  return TRANSFER_KEYWORDS.some(keyword => content.includes(keyword));
};

const isVideoItem = (item: CrowdyNewsItem): boolean => {
  // Check if item has video indicators
  const content = `${item.title} ${item.summary || ''} ${item.url || ''}`.toLowerCase();
  return content.includes('video') || 
         content.includes('youtube') || 
         content.includes('youtu.be') ||
         item.url?.includes('youtube') ||
         item.url?.includes('youtu.be') ||
         item.media?.some(m => m.type === 'video');
};

export const VideoTab: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [showAppPrompt, setShowAppPrompt] = useState(false);
  const [selectedArticleUrl, setSelectedArticleUrl] = useState<string | undefined>();

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const allVideos: VideoItem[] = [];
        
        // Fetch videos from all teams in parallel
        const promises = TEAM_SLUGS.map(async (teamSlug) => {
          try {
            const items = await crowdyNewsApi.getTeamContent(teamSlug);
            
            // Filter for videos and transfer-related content
            const videoItems = items
              .filter(item => isVideoItem(item) && isTransferRelated(item))
              .map(item => ({
                ...item,
                isVideo: true,
                url: item.url ? normalizeToHttps(item.url) : item.url
              }));
            
            return videoItems;
          } catch (err) {
            console.error(`Error fetching videos for ${teamSlug}:`, err);
            return [];
          }
        });
        
        const results = await Promise.allSettled(promises);
        
        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            allVideos.push(...result.value);
          }
        });
        
        // Sort by published date (newest first)
        allVideos.sort((a, b) => {
          const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
          const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
          return dateB - dateA;
        });
        
        setVideos(allVideos);
        console.log(`✅ Loaded ${allVideos.length} transfer-related videos`);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError('Failed to load videos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
    
    // Auto-refresh every 10 minutes
    const interval = setInterval(fetchVideos, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatTime = (dateString?: string): string => {
    if (!dateString) return 'Recently';
    
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
      return 'Recently';
    }
  };

  const extractYouTubeVideoId = (url?: string): string | null => {
    if (!url) return null;
    
    // Normalize to HTTPS first to ensure consistent matching
    const normalizedUrl = normalizeToHttps(url);
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
      /youtube\.com\/embed\/([^&\s]+)/,
      /youtube\.com\/v\/([^&\s]+)/
    ];
    
    for (const pattern of patterns) {
      const match = normalizedUrl.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  };

  const getYouTubeEmbedUrl = (videoId: string): string => {
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const getYouTubeThumbnail = (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400 mr-2" />
        <span className="text-gray-700 dark:text-white">Loading transfer videos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Video className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No transfer-related videos available at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {videos.map((video) => {
        const videoId = extractYouTubeVideoId(video.url);
        const hasYouTubeVideo = videoId !== null;
        
        return (
          <div
            key={video.id}
            className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-slate-700/70 transition-all duration-200 border border-gray-200 dark:border-slate-600 cursor-pointer"
            onClick={() => {
              if (hasYouTubeVideo) {
                setSelectedVideo(video);
                setIsVideoModalOpen(true);
              } else if (video.url) {
                const normalizedUrl = normalizeToHttps(video.url);
                // Check if it's a TeamTalk article and if user hasn't dismissed the prompt
                const isTeamTalk = isTeamTalkUrl(normalizedUrl);
                const hasDismissed = localStorage.getItem('teamtalk-app-prompt-dismissed') === 'true';
                
                if (isTeamTalk && !hasDismissed) {
                  setSelectedArticleUrl(normalizedUrl);
                  setShowAppPrompt(true);
                } else {
                  window.open(normalizedUrl, '_blank', 'noopener,noreferrer');
                }
              }
            }}
          >
            <div className="flex gap-4">
              {/* Video Thumbnail/Preview */}
              <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-slate-600 relative">
                {hasYouTubeVideo ? (
                  <>
                    <img
                      src={getYouTubeThumbnail(videoId)}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const parent = (e.target as HTMLImageElement).parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-slate-600"><svg class="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg></div>';
                        }
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                        </svg>
                      </div>
                    </div>
                  </>
                ) : video.image ? (
                  <img
                    src={video.image}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-slate-600"><svg class="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/></svg></div>';
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-slate-600">
                    <Video className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                  </div>
                )}
                <div className="absolute top-1 right-1 bg-black/50 backdrop-blur-sm rounded-full p-1">
                  <Video className="w-3 h-3 text-white" />
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Video</span>
                  <span className="text-gray-400 dark:text-gray-500">•</span>
                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    {formatTime(video.publishedAt)}
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight line-clamp-2 mb-2 hover:text-blue-600 dark:hover:text-blue-300 transition-colors">
                  {cleanTitle(video.title)}
                </h3>
                
                {video.summary && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                    {cleanTitle(video.summary)}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {video.source || 'Crowdy News'}
                  </span>
                  {video.url && !hasYouTubeVideo && (
                    <a
                      href={normalizeToHttps(video.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Watch
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {hasYouTubeVideo && (
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Click to play
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Video Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-slate-800 p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white pr-8">
              {selectedVideo ? cleanTitle(selectedVideo.title) : ''}
            </DialogTitle>
          </DialogHeader>
          
          {selectedVideo && (() => {
            const videoId = extractYouTubeVideoId(selectedVideo.url);
            if (!videoId) return null;
            
            return (
              <div className="flex-1 overflow-hidden px-6 pb-6">
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                  <iframe
                    src={getYouTubeEmbedUrl(videoId)}
                    title={selectedVideo.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                
                {selectedVideo.summary && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {parseTextWithUrls(selectedVideo.summary).map((part, index) => {
                        if (part.type === 'url' && part.url) {
                          return (
                            <a
                              key={`url-${index}`}
                              href={part.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline break-all inline"
                            >
                              {part.content}
                            </a>
                          );
                        }
                        return <span key={`text-${index}`}>{part.content}</span>;
                      })}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-600">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(selectedVideo.publishedAt)}</span>
                    <span>•</span>
                    <span>{selectedVideo.source || 'Crowdy News'}</span>
                  </div>
                  {selectedVideo.url && (
                    <a
                      href={normalizeToHttps(selectedVideo.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      Watch on YouTube
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })()}
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
    </div>
  );
};


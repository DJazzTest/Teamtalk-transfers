import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Image as ImageIcon, Link as LinkIcon, Video, ExternalLink, ArrowLeft } from 'lucide-react';
import { TransferDataProvider } from '@/store/transferDataStore';
import type { ChatterBoxEntry } from '@/components/ChatterBoxManagement';
import { stripHtml, normalizeToHttps } from '@/utils/htmlUtils';

const STORAGE_KEY = 'chatterBoxEntries';

const ChatterBoxPage: React.FC = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<ChatterBoxEntry[]>([]);

  useEffect(() => {
    loadEntries();
    
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
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('chatterBoxUpdated', handleCustomUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('chatterBoxUpdated', handleCustomUpdate);
    };
  }, []);

  const loadEntries = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Sort by date, newest first
        const sorted = parsed.sort((a: ChatterBoxEntry, b: ChatterBoxEntry) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setEntries(sorted);
      }
    } catch (error) {
      console.error('Error loading chatter box entries:', error);
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

  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const normalizedUrl = normalizeToHttps(url);
    let videoId = '';
    if (normalizedUrl.includes('youtube.com/watch?v=')) {
      videoId = normalizedUrl.split('v=')[1]?.split('&')[0] || '';
    } else if (normalizedUrl.includes('youtu.be/')) {
      videoId = normalizedUrl.split('youtu.be/')[1]?.split('?')[0] || '';
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  return (
    <TransferDataProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-[#2F517A] transition-colors">
        <AppHeader lastUpdated={new Date()} />
      
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-6xl">
        <div className="mb-6">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="mb-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Transfers Chatter Box
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Latest updates, videos, and discussions about Premier League transfers
          </p>
        </div>

        {entries.length === 0 ? (
          <Card className="p-12 bg-white dark:bg-slate-800/50 border-gray-200 dark:border-slate-700">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No entries yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Check back soon for the latest transfer chatter!
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => (
              <Card
                key={entry.id}
                className="p-6 bg-white dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 shadow-md"
              >
                <div className="space-y-4">
                  {/* Text Content */}
                  <div>
                    <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {entry.text}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {formatDate(entry.createdAt)}
                    </p>
                  </div>

                  {/* Image */}
                  {entry.imageUrl && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Image
                        </h4>
                      </div>
                      <img
                        src={entry.imageUrl}
                        alt="Chatter box"
                        className="w-full max-w-2xl rounded-lg border border-gray-200 dark:border-slate-600"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Link Preview - YouTube, Instagram, or Article */}
                  {entry.linkPreview && (
                    <div>
                      {entry.linkPreview.type === 'youtube' && entry.linkPreview.embedUrl && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {stripHtml(entry.linkPreview.title) || 'YouTube Video'}
                            </h4>
                          </div>
                          {entry.linkPreview.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {stripHtml(entry.linkPreview.description)}
                            </p>
                          )}
                          <div className="aspect-video max-w-4xl">
                            <iframe
                              src={entry.linkPreview.embedUrl}
                              title={stripHtml(entry.linkPreview.title) || 'Video'}
                              className="w-full h-full rounded-lg"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      )}

                      {entry.linkPreview.type === 'article' && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <LinkIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {stripHtml(entry.linkPreview.title) || 'Article'}
                            </h4>
                          </div>
                          {entry.linkPreview.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {stripHtml(entry.linkPreview.description)}
                            </p>
                          )}
                          {entry.linkPreview.image && (
                            <img
                              src={entry.linkPreview.image}
                              alt={stripHtml(entry.linkPreview.title) || 'Article preview'}
                              className="w-full max-w-2xl rounded-lg border border-gray-200 dark:border-slate-600 mb-2"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <a
                            href={normalizeToHttps(entry.linkPreview.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                          >
                            Read full article
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {entry.linkPreview.type === 'instagram' && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <LinkIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {stripHtml(entry.linkPreview.title) || 'Instagram Post'}
                            </h4>
                          </div>
                          <a
                            href={normalizeToHttps(entry.linkPreview.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-colors"
                          >
                            View on Instagram
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Fallback to old videoUrl if no linkPreview */}
                  {!entry.linkPreview && entry.videoUrl && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Video
                        </h4>
                      </div>
                      {isYouTubeUrl(entry.videoUrl) ? (
                        <div className="aspect-video max-w-4xl">
                          <iframe
                            src={getYouTubeEmbedUrl(entry.videoUrl) || normalizeToHttps(entry.videoUrl)}
                            title="Video"
                            className="w-full h-full rounded-lg"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <video
                          src={normalizeToHttps(entry.videoUrl)}
                          controls
                          className="w-full max-w-4xl rounded-lg border border-gray-200 dark:border-slate-600"
                        />
                      )}
                    </div>
                  )}

                  {/* Links */}
                  {(entry.tweetUrl || entry.facebookUrl) && (
                    <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-200 dark:border-slate-600">
                      {entry.tweetUrl && (
                        <a
                          href={entry.tweetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                        >
                          <LinkIcon className="w-4 h-4" />
                          View Tweet
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {entry.facebookUrl && (
                        <a
                          href={entry.facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          <LinkIcon className="w-4 h-4" />
                          View Facebook Post
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      </div>
    </TransferDataProvider>
  );
};

export default ChatterBoxPage;


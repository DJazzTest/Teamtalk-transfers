import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Image as ImageIcon, Link as LinkIcon, Video, X, Loader2, Edit2, Save, Clock, Upload, Type } from 'lucide-react';
import { toast } from 'sonner';
import { fetchLinkPreview, detectLinkType, extractYouTubeVideoId, getYouTubeEmbedUrl } from '@/utils/linkPreview';
import type { LinkPreview } from '@/utils/linkPreview';
import { EmojiPicker } from '@/components/EmojiPicker';

export interface ChatterBoxEntry {
  id: string;
  text: string;
  articleUrl?: string; // Article URL (e.g., TeamTalk articles)
  socialMediaUrl?: string; // Social media URL (Twitter, Facebook, Instagram, etc.)
  imageDataUrl?: string; // Base64 image data
  imageOverlayText?: string; // Text overlay on image
  linkPreview?: LinkPreview;
  createdAt: string;
  updatedAt?: string;
}

const STORAGE_KEY = 'chatterBoxEntries';
const API_URL = '/.netlify/functions/live-hub';

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
    console.warn('Live Hub: failed to persist entries locally', error);
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
    console.warn('Live Hub: failed to parse local entries', error);
  }
  return null;
};

export const ChatterBoxManagement: React.FC = () => {
  const [entries, setEntries] = useState<ChatterBoxEntry[]>([]);
  const [text, setText] = useState('');
  const [articleUrl, setArticleUrl] = useState('');
  const [socialMediaUrl, setSocialMediaUrl] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageOverlayText, setImageOverlayText] = useState('');
  const [showOverlayEditor, setShowOverlayEditor] = useState(false);
  const [linkPreview, setLinkPreview] = useState<LinkPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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
      console.warn('Live Hub: remote fetch failed, falling back to local data', error);
    }

    const localEntries = loadFromLocal();
    setEntries(localEntries ? sortEntries(localEntries) : []);
  };

  const saveEntries = async (newEntries: ChatterBoxEntry[], successMessage?: string) => {
    const sorted = sortEntries(newEntries);
    setEntries(sorted);
    persistLocally(sorted);

    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sorted)
      });
    } catch (error) {
      console.warn('Live Hub: failed to sync entries to cloud', error);
      toast.error('Saved locally but failed to sync Live Hub to the cloud');
    }

    // Dispatch custom event to notify frontend of update
    window.dispatchEvent(new Event('chatterBoxUpdated'));
    if (successMessage) {
      toast.success(successMessage);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImageDataUrl(dataUrl);
      setImageUrl(''); // Clear URL if image is uploaded
      setShowOverlayEditor(true);
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const handleArticleUrlChange = async (url: string) => {
    setArticleUrl(url);
    setSocialMediaUrl(''); // Clear social media URL if article is provided
    
    if (url.trim()) {
      setLoadingPreview(true);
      try {
        const preview = await fetchLinkPreview(url);
        if (preview) {
          setLinkPreview(preview);
        } else {
          setLinkPreview(null);
        }
      } catch (error) {
        console.error('Error fetching article preview:', error);
        setLinkPreview(null);
      } finally {
        setLoadingPreview(false);
      }
    } else {
      setLinkPreview(null);
    }
  };

  const handleSocialMediaUrlChange = async (url: string) => {
    setSocialMediaUrl(url);
    setArticleUrl(''); // Clear article URL if social media is provided
    
    if (url.trim()) {
      setLoadingPreview(true);
      try {
        const preview = await fetchLinkPreview(url);
        if (preview) {
          setLinkPreview(preview);
        } else {
          setLinkPreview(null);
        }
      } catch (error) {
        console.error('Error fetching social media preview:', error);
        setLinkPreview(null);
      } finally {
        setLoadingPreview(false);
      }
    } else {
      setLinkPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If no text but article URL is provided, show confirmation
    if (!text.trim() && articleUrl.trim()) {
      const confirmed = window.confirm('Are you sure you want to post with no headline? The article will automatically use the image thumbnail and article headline.');
      if (!confirmed) {
        return;
      }
    } else if (!text.trim() && !articleUrl.trim() && !socialMediaUrl.trim() && !imageDataUrl) {
      toast.error('Please enter a description, article URL, social media URL, or upload an image');
      return;
    }

    if (editingId) {
      // Update existing entry
      const updatedEntries = entries.map(entry => {
        if (entry.id === editingId) {
          return {
            ...entry,
            text: text.trim(),
            articleUrl: articleUrl.trim() || undefined,
            socialMediaUrl: socialMediaUrl.trim() || undefined,
            imageDataUrl: imageDataUrl || undefined,
            imageOverlayText: imageOverlayText.trim() || undefined,
            linkPreview: linkPreview || undefined,
            updatedAt: new Date().toISOString()
          };
        }
        return entry;
      });
      await saveEntries(updatedEntries, 'Entry updated successfully');
      setEditingId(null);
    } else {
      // Create new entry
      const newEntry: ChatterBoxEntry = {
        id: Date.now().toString(),
        text: text.trim(),
        articleUrl: articleUrl.trim() || undefined,
        socialMediaUrl: socialMediaUrl.trim() || undefined,
        imageDataUrl: imageDataUrl || undefined,
        imageOverlayText: imageOverlayText.trim() || undefined,
        linkPreview: linkPreview || undefined,
        createdAt: new Date().toISOString()
      };

      const updatedEntries = [newEntry, ...entries];
      await saveEntries(updatedEntries, 'Entry added successfully');
    }
    
    // Reset form
    setText('');
    setArticleUrl('');
    setSocialMediaUrl('');
    setImageDataUrl(null);
    setImageOverlayText('');
    setShowOverlayEditor(false);
    setLinkPreview(null);
  };

  const handleEdit = (entry: ChatterBoxEntry) => {
    setEditingId(entry.id);
    setText(entry.text);
    setArticleUrl(entry.articleUrl || '');
    setSocialMediaUrl(entry.socialMediaUrl || '');
    setImageDataUrl(entry.imageDataUrl || null);
    setImageOverlayText(entry.imageOverlayText || '');
    setShowOverlayEditor(!!entry.imageDataUrl);
    setLinkPreview(entry.linkPreview || null);
    
    // Scroll to form
    document.getElementById('chatter-box-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setText('');
    setArticleUrl('');
    setSocialMediaUrl('');
    setImageDataUrl(null);
    setImageOverlayText('');
    setShowOverlayEditor(false);
    setLinkPreview(null);
  };

  const handleDelete = async (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    await saveEntries(updatedEntries, 'Entry deleted');
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

  return (
    <div className="space-y-6">
      <Card id="chatter-box-form" className="p-6 bg-slate-800 border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">
            {editingId ? 'Edit Chatter Box Entry' : 'Add Chatter Box Entry'}
          </h2>
          {editingId && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="text" className="text-white block">
                Text Content *
              </Label>
              <EmojiPicker
                onEmojiSelect={(emoji) => {
                  const textarea = document.getElementById('text') as HTMLTextAreaElement;
                  if (textarea) {
                    const start = textarea.selectionStart || 0;
                    const end = textarea.selectionEnd || 0;
                    const newText = text.substring(0, start) + emoji + text.substring(end);
                    setText(newText);
                    // Set cursor position after emoji
                    setTimeout(() => {
                      textarea.focus();
                      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
                    }, 0);
                  } else {
                    setText(text + emoji);
                  }
                }}
              />
            </div>
            <Textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Description........ (Optional if article URL is provided)"
              className="min-h-[120px] bg-slate-700 text-white border-slate-600"
            />
          </div>

          {/* Article URL */}
          <div>
            <Label htmlFor="articleUrl" className="text-white mb-2 block flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Article URL
            </Label>
            <Input
              id="articleUrl"
              type="url"
              value={articleUrl}
              onChange={(e) => handleArticleUrlChange(e.target.value)}
              onBlur={(e) => {
                if (e.target.value.trim()) {
                  handleArticleUrlChange(e.target.value);
                }
              }}
              placeholder="https://www.teamtalk.com/leeds-united/..."
              className="bg-slate-700 text-white border-slate-600"
            />
            <p className="text-xs text-gray-400 mt-1">
              Paste an article URL to automatically fetch the image and headline
            </p>
          </div>

          {/* Social Media URL */}
          <div>
            <Label htmlFor="socialMediaUrl" className="text-white mb-2 block flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Social Media URL (Twitter, Facebook, Instagram, etc.)
            </Label>
            <Input
              id="socialMediaUrl"
              type="url"
              value={socialMediaUrl}
              onChange={(e) => handleSocialMediaUrlChange(e.target.value)}
              onBlur={(e) => {
                if (e.target.value.trim()) {
                  handleSocialMediaUrlChange(e.target.value);
                }
              }}
              placeholder="https://twitter.com/... or https://facebook.com/... or https://instagram.com/..."
              className="bg-slate-700 text-white border-slate-600"
            />
            <p className="text-xs text-gray-400 mt-1">
              Paste a social media link to automatically fetch the preview
            </p>
          </div>

          {/* Picture Upload */}
          <div>
            <Label htmlFor="imageUpload" className="text-white mb-2 block flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Picture Upload (Drag & Drop)
            </Label>
              
              {/* Drag and Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                }`}
              >
                {imageDataUrl ? (
                  <div className="space-y-3">
                    <div className="relative inline-block">
                      <img
                        src={imageDataUrl}
                        alt="Uploaded"
                        className="max-w-full max-h-48 rounded-lg"
                      />
                      {imageOverlayText && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 rounded-b-lg text-sm font-semibold">
                          {imageOverlayText}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setImageDataUrl(null);
                          setImageOverlayText('');
                          setShowOverlayEditor(false);
                        }}
                        className="text-white border-slate-500 hover:bg-slate-600"
                      >
                        Remove
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowOverlayEditor(!showOverlayEditor)}
                        className="text-white border-slate-500 hover:bg-slate-600"
                      >
                        <Type className="w-4 h-4 mr-1" />
                        {showOverlayEditor ? 'Hide' : 'Add'} Text Overlay
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-400 mb-2">
                      Drag and drop an image here, or click to browse
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                      id="imageFileInput"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('imageFileInput')?.click()}
                      className="text-white border-slate-500 hover:bg-slate-600"
                    >
                      Browse Files
                    </Button>
                  </>
                )}
              </div>

              {/* Text Overlay Editor */}
              {showOverlayEditor && imageDataUrl && (
                <div className="mt-3 p-3 bg-slate-700 rounded-lg border border-slate-600">
                  <Label htmlFor="overlayText" className="text-white mb-2 block text-sm">
                    Text Overlay
                  </Label>
                  <Input
                    id="overlayText"
                    type="text"
                    value={imageOverlayText}
                    onChange={(e) => setImageOverlayText(e.target.value)}
                    placeholder="Enter text to display on image..."
                    className="bg-slate-600 text-white border-slate-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    This text will appear at the bottom of the image
                  </p>
                </div>
              )}

            </div>

          {/* Link Preview */}
          {loadingPreview && (
            <div className="flex items-center gap-2 text-blue-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Fetching preview...
            </div>
          )}

          {linkPreview && !loadingPreview && (
            <Card className="p-4 bg-slate-700 border-slate-600">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-white font-semibold">Link Preview</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setLinkPreview(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Article Preview - News Style */}
              {linkPreview.type === 'article' && (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    {linkPreview.image ? (
                      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-slate-600">
                        <img
                          src={linkPreview.image}
                          alt={linkPreview.title || 'Article preview'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to TeamTalk logo
                            const img = e.target as HTMLImageElement;
                            img.src = 'https://www.teamtalk.com/content/themes/teamtalk2/img/png/logo/teamtalk-mobile.png';
                            img.className = 'w-full h-full object-contain p-2 bg-slate-600';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 flex-shrink-0 rounded-lg bg-slate-600 flex items-center justify-center border border-slate-500">
                        <img
                          src="https://www.teamtalk.com/content/themes/teamtalk2/img/png/logo/teamtalk-mobile.png"
                          alt="TEAMtalk"
                          className="w-16 h-auto opacity-50"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      {linkPreview.title && (
                        <h4 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                          {linkPreview.title}
                        </h4>
                      )}
                      {linkPreview.description && (
                        <p className="text-gray-300 text-xs line-clamp-2">
                          {linkPreview.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-blue-400">
                    Article will be displayed in news-style layout on the frontend
                  </div>
                </div>
              )}

              {/* Social Media Preview (YouTube, Instagram) - News Style */}
              {(linkPreview.type === 'youtube' || linkPreview.type === 'instagram') && (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    {linkPreview.image ? (
                      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-slate-600">
                        <img
                          src={linkPreview.image}
                          alt={linkPreview.title || 'Social media preview'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to TeamTalk logo
                            const img = e.target as HTMLImageElement;
                            img.src = 'https://www.teamtalk.com/content/themes/teamtalk2/img/png/logo/teamtalk-mobile.png';
                            img.className = 'w-full h-full object-contain p-2 bg-slate-600';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 flex-shrink-0 rounded-lg bg-slate-600 flex items-center justify-center border border-slate-500">
                        <img
                          src="https://www.teamtalk.com/content/themes/teamtalk2/img/png/logo/teamtalk-mobile.png"
                          alt="TEAMtalk"
                          className="w-16 h-auto opacity-50"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      {linkPreview.title && (
                        <h4 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                          {linkPreview.title}
                        </h4>
                      )}
                      {linkPreview.description && (
                        <p className="text-gray-300 text-xs line-clamp-2">
                          {linkPreview.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-blue-400">
                    {linkPreview.type === 'youtube' ? 'Video will be embedded' : 'Social media content will be linked'}
                  </div>
                </div>
              )}
            </Card>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {editingId ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update Entry
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Entry
              </>
            )}
          </Button>
        </form>
      </Card>

      <Card className="p-6 bg-slate-800 border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-4">Existing Entries ({entries.length})</h2>
        
        {entries.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No entries yet. Add your first entry above!</p>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="p-4 bg-slate-700 border-slate-600">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <p className="text-white">{entry.text}</p>
                    <div className="flex flex-wrap gap-2">
                      {entry.articleUrl && (
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" />
                          Article
                        </span>
                      )}
                      {entry.socialMediaUrl && (
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" />
                          Social Media
                        </span>
                      )}
                      {entry.imageDataUrl && (
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          Image
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Created: {formatDate(entry.createdAt)}</span>
                        <span className="text-gray-500">({formatTimeAgo(entry.createdAt)})</span>
                      </div>
                      {entry.updatedAt && (
                        <>
                          <span className="text-gray-500">•</span>
                          <div className="flex items-center gap-1">
                            <span>Updated: {formatDate(entry.updatedAt)}</span>
                            <span className="text-gray-500">({formatTimeAgo(entry.updatedAt)})</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(entry)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                      title="Edit entry"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};


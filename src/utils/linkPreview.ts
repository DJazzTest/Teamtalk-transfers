export interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  type: 'youtube' | 'instagram' | 'article' | 'unknown';
  embedUrl?: string;
  videoId?: string;
  duration?: string;
}

const YOUTUBE_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
const INSTAGRAM_REGEX = /instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/;

export const detectLinkType = (url: string): 'youtube' | 'instagram' | 'article' | 'unknown' => {
  if (YOUTUBE_REGEX.test(url)) {
    return 'youtube';
  }
  if (INSTAGRAM_REGEX.test(url)) {
    return 'instagram';
  }
  if (url.match(/^https?:\/\//)) {
    return 'article';
  }
  return 'unknown';
};

export const extractYouTubeVideoId = (url: string): string | null => {
  const match = url.match(YOUTUBE_REGEX);
  return match ? match[1] : null;
};

export const getYouTubeEmbedUrl = (videoId: string): string => {
  return `https://www.youtube.com/embed/${videoId}`;
};

export const getYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

// Normalize URL to HTTPS
const normalizeToHttps = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('https://')) return url;
  if (url.startsWith('http://')) return url.replace(/^http:\/\//i, 'https://');
  if (url.startsWith('//')) return `https:${url}`;
  return url;
};

export const fetchLinkPreview = async (url: string): Promise<LinkPreview | null> => {
  try {
    // Normalize URL to HTTPS first
    const normalizedUrl = normalizeToHttps(url);
    const linkType = detectLinkType(normalizedUrl);
    
    if (linkType === 'youtube') {
      const videoId = extractYouTubeVideoId(normalizedUrl);
      if (videoId) {
        // Fetch YouTube video info using oEmbed
        try {
          const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(normalizedUrl)}&format=json`;
          const response = await fetch(oEmbedUrl);
          if (response.ok) {
            const data = await response.json();
            return {
              url: normalizedUrl,
              title: data.title,
              description: data.author_name,
              image: getYouTubeThumbnail(videoId),
              type: 'youtube',
              embedUrl: getYouTubeEmbedUrl(videoId),
              videoId
            };
          }
        } catch (error) {
          console.error('Error fetching YouTube oEmbed:', error);
        }
        
        // Fallback: return basic YouTube info
        return {
          url: normalizedUrl,
          title: 'YouTube Video',
          image: getYouTubeThumbnail(videoId),
          type: 'youtube',
          embedUrl: getYouTubeEmbedUrl(videoId),
          videoId
        };
      }
    }
    
    if (linkType === 'instagram') {
      // Instagram requires authentication for oEmbed, so we'll use a proxy or basic info
      const match = normalizedUrl.match(INSTAGRAM_REGEX);
      if (match) {
        return {
          url: normalizedUrl,
          title: 'Instagram Post',
          description: 'View on Instagram',
          type: 'instagram',
          embedUrl: normalizedUrl
        };
      }
    }
    
    if (linkType === 'article') {
      // Prefer serverless preview to avoid CORS limitations
      try {
        const response = await fetch(`/.netlify/functions/link-preview?url=${encodeURIComponent(normalizedUrl)}`);
        if (response.ok) {
          const data = await response.json();
          if (data) {
            return {
              url: data.url ? normalizeToHttps(data.url) : normalizedUrl,
              title: data.title || '',
              description: data.description || '',
              image: data.image ? normalizeToHttps(data.image) : '',
              type: 'article'
            };
          }
        }
      } catch (error) {
        console.error('Error fetching article preview via Netlify function:', error);
      }

      // Fallback: fetch via public proxy directly from the browser
      try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(normalizedUrl)}`;
        const response = await fetch(proxyUrl);
        if (response.ok) {
          const data = await response.json();
          const html = data.contents;

          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');

          const ogTitle =
            doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
            doc.querySelector('title')?.textContent ||
            '';
          const ogDescription =
            doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
            doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
            '';
          const ogImage =
            doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
            doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
            '';

          return {
            url: normalizedUrl,
            title: ogTitle || '',
            description: ogDescription || '',
            image: ogImage ? normalizeToHttps(ogImage) : '',
            type: 'article'
          };
        }
      } catch (error) {
        console.error('Error fetching article preview via proxy:', error);
      }

      // Last resort: basic info
      try {
        const urlObj = new URL(normalizedUrl);
        return {
          url: normalizedUrl,
          title: urlObj.hostname,
          description: normalizedUrl,
          type: 'article'
        };
      } catch {
        return {
          url: normalizedUrl,
          title: 'Article',
          type: 'article'
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching link preview:', error);
    return null;
  }
};


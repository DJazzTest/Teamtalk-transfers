export interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  type: 'youtube' | 'instagram' | 'article' | 'unknown';
  embedUrl?: string;
  videoId?: string;
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

export const fetchLinkPreview = async (url: string): Promise<LinkPreview | null> => {
  try {
    const linkType = detectLinkType(url);
    
    if (linkType === 'youtube') {
      const videoId = extractYouTubeVideoId(url);
      if (videoId) {
        // Fetch YouTube video info using oEmbed
        try {
          const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
          const response = await fetch(oEmbedUrl);
          if (response.ok) {
            const data = await response.json();
            return {
              url,
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
          url,
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
      const match = url.match(INSTAGRAM_REGEX);
      if (match) {
        return {
          url,
          title: 'Instagram Post',
          description: 'View on Instagram',
          type: 'instagram',
          embedUrl: url
        };
      }
    }
    
    if (linkType === 'article') {
      // Fetch Open Graph metadata
      try {
        // Use a CORS proxy to fetch the page
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        if (response.ok) {
          const data = await response.json();
          const html = data.contents;
          
          // Parse Open Graph tags
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          
          const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                         doc.querySelector('title')?.textContent ||
                         '';
          const ogDescription = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
                              doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
                              '';
          const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
                         doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
                         '';
          
          return {
            url,
            title: ogTitle || '',
            description: ogDescription || '',
            image: ogImage || '',
            type: 'article'
          };
        }
      } catch (error) {
        console.error('Error fetching article preview:', error);
      }
      
      // Fallback: return basic article info
      try {
        const urlObj = new URL(url);
        return {
          url,
          title: urlObj.hostname,
          description: url,
          type: 'article'
        };
      } catch {
        return {
          url,
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


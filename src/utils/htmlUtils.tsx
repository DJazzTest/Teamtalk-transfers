import React from 'react';

/**
 * Strip HTML tags from a string and decode HTML entities
 * @param html - The HTML string to clean
 * @returns Plain text with HTML tags removed
 */
export function stripHtml(html: string | undefined | null): string {
  if (!html) return '';
  
  // If document is not available (SSR), use regex fallback
  if (typeof document === 'undefined') {
    return stripHtmlSimple(html);
  }
  
  try {
    // Create a temporary DOM element to parse HTML
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    
    // Get text content and clean up whitespace
    const text = tmp.textContent || tmp.innerText || '';
    
    // Replace multiple spaces/newlines with single space and trim
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim();
  } catch (error) {
    // Fallback to regex if DOM parsing fails
    return stripHtmlSimple(html);
  }
}

/**
 * Strip HTML tags using regex (faster but less safe)
 * Use this for simple cases where you trust the input
 */
export function stripHtmlSimple(html: string | undefined | null): string {
  if (!html) return '';
  
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Decode &amp;
    .replace(/&lt;/g, '<') // Decode &lt;
    .replace(/&gt;/g, '>') // Decode &gt;
    .replace(/&quot;/g, '"') // Decode &quot;
    .replace(/&#39;/g, "'") // Decode &#39;
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n+/g, ' ') // Replace newlines with space
    .trim();
}

/**
 * Normalize URL to HTTPS
 * Converts http:// URLs to https:// for security
 * @param url - The URL to normalize
 * @returns URL with HTTPS protocol
 */
export function normalizeToHttps(url: string | undefined | null): string {
  if (!url) return '';
  
  // If it's already HTTPS, return as is
  if (url.startsWith('https://')) return url;
  
  // If it's HTTP, convert to HTTPS
  if (url.startsWith('http://')) {
    return url.replace(/^http:\/\//i, 'https://');
  }
  
  // If it doesn't have a protocol, assume HTTPS for external URLs
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  
  // If it's a relative URL, return as is
  if (!url.includes('://')) {
    return url;
  }
  
  return url;
}

/**
 * Clean title by removing URLs, emails, and HTML tags
 * @param text - The text to clean
 * @returns Cleaned text without URLs, emails, or HTML
 */
export function cleanTitle(text: string | undefined | null): string {
  if (!text) return '';
  
  // First strip HTML tags
  let cleaned = stripHtml(text);
  
  // Remove URLs (http://, https://, www., and protocol-relative)
  cleaned = cleaned.replace(/https?:\/\/[^\s]+/gi, '');
  cleaned = cleaned.replace(/www\.[^\s]+/gi, '');
  cleaned = cleaned.replace(/\/\/[^\s]+/gi, ''); // Protocol-relative URLs
  
  // Remove email addresses (more specific pattern)
  cleaned = cleaned.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi, '');
  
  // Remove social media handles (@username) but keep them if they're part of a sentence
  // Only remove standalone @ mentions
  cleaned = cleaned.replace(/\s@[A-Za-z0-9_]+\b/g, '');
  cleaned = cleaned.replace(/^@[A-Za-z0-9_]+\b/g, '');
  
  // Remove common social media patterns
  cleaned = cleaned.replace(/\b(Subscribe|Follow|Like|Share)\s+(to|on|us)\s+[^\s]+/gi, '');
  
  // Remove common YouTube footer text patterns
  cleaned = cleaned.replace(/Subscribe\s+to\s+the\s+Official\s+[^\s]+\s+YouTube\s+Channel/gi, '');
  cleaned = cleaned.replace(/Follow\s+us\s+on\s+(Facebook|Twitter|Instagram|TikTok)/gi, '');
  cleaned = cleaned.replace(/This\s+is\s+the\s+Official\s+YouTube\s+channel/gi, '');
  cleaned = cleaned.replace(/For\s+more\s+match\s+action/gi, '');
  
  // Clean up multiple spaces, newlines, and trim
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Remove leading/trailing punctuation that might be left over
  cleaned = cleaned.replace(/^[.,;:\s]+|[.,;:\s]+$/g, '');
  
  return cleaned;
}

/**
 * Process description: strip HTML but make URLs clickable
 * @param text - The text to process
 * @returns JSX with clickable URLs
 */
export function processDescription(text: string | undefined | null): string {
  if (!text) return '';
  
  // First strip HTML tags
  let processed = stripHtml(text);
  
  // Replace URLs with clickable links (we'll render this as HTML)
  // This function returns a string that can be used with dangerouslySetInnerHTML
  // or we can return JSX elements
  
  // For now, just clean it up - we'll handle clickable links in the component
  processed = processed.replace(/\s+/g, ' ').trim();
  
  return processed;
}

/**
 * Extract URLs from text
 * @param text - The text to extract URLs from
 * @returns Array of URLs found in the text
 */
export function extractUrls(text: string | undefined | null): string[] {
  if (!text) return [];
  
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const matches = text.match(urlRegex) || [];
  return matches.map(url => normalizeToHttps(url));
}

/**
 * Interface for text parts with URLs
 */
export interface TextPart {
  type: 'text' | 'url';
  content: string;
  url?: string;
}

/**
 * Convert text with URLs to an array of parts for rendering
 * @param text - The text to convert
 * @returns Array of text parts (text or URL)
 */
export function parseTextWithUrls(text: string | undefined | null): TextPart[] {
  if (!text) return [];
  
  // First strip HTML tags
  let cleaned = stripHtml(text);
  
  // Remove email addresses and @ mentions from display (but keep URLs)
  cleaned = cleaned.replace(/\b[^\s]+@[^\s]+\b/g, ''); // Remove emails
  cleaned = cleaned.replace(/\s@[^\s]+\s/g, ' '); // Remove @ mentions with spaces around
  
  // Split by URLs
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const parts: TextPart[] = [];
  let lastIndex = 0;
  let match;
  
  // Reset regex lastIndex
  urlRegex.lastIndex = 0;
  
  while ((match = urlRegex.exec(cleaned)) !== null) {
    // Add text before the URL
    if (match.index > lastIndex) {
      const textBefore = cleaned.substring(lastIndex, match.index).trim();
      if (textBefore) {
        parts.push({ type: 'text', content: textBefore });
      }
    }
    
    // Add the URL
    const url = normalizeToHttps(match[0]);
    parts.push({ type: 'url', content: url, url: url });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < cleaned.length) {
    const remaining = cleaned.substring(lastIndex).trim();
    if (remaining) {
      parts.push({ type: 'text', content: remaining });
    }
  }
  
  // If no URLs were found, return the cleaned text as a single text part
  if (parts.length === 0) {
    return [{ type: 'text', content: cleaned.trim() }];
  }
  
  return parts;
}





import type React from 'react';

export const PLAYER_PLACEHOLDER = '/player-placeholder.png';

const applyPlaceholder = (img: HTMLImageElement | null) => {
  if (img && img.src !== PLAYER_PLACEHOLDER) {
    img.src = PLAYER_PLACEHOLDER;
  }
};

export const handlePlayerImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
  applyPlaceholder(event.currentTarget);
};

/**
 * Get player image URL from various sources
 * Priority: localStorage > player-images directory > placeholder
 */
export function getPlayerImage(playerName: string, clubName?: string): string {
  if (!playerName) return PLAYER_PLACEHOLDER;

  // Try to get from localStorage (CMS uploaded images)
  try {
    const imageData = localStorage.getItem('playerImages') || '{}';
    const images = JSON.parse(imageData);
    
    // Try exact match first
    if (clubName && images[clubName]?.[playerName]) {
      return images[clubName][playerName];
    }
    
    // Try without club name (check all clubs)
    for (const club in images) {
      if (images[club]?.[playerName]) {
        return images[club][playerName];
      }
    }
  } catch (error) {
    console.error('Error reading player images from localStorage:', error);
  }

  // Try to get from player-images directory
  if (clubName) {
    const clubSlug = clubName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const playerSlug = playerName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return `/player-images/${clubSlug}/${playerSlug}.png`;
  }

  return PLAYER_PLACEHOLDER;
}

/**
 * Slugify a name for use in file paths
 */
export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Get club slug from club name
 */
export function getClubSlug(clubName: string): string {
  return clubName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}


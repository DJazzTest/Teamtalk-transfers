export interface Transfer {
  /**
   * Player injury info (optional)
   * - hasInjury: boolean (true if player has been injured)
   * - injuryType: string (description of injury)
   * - injuryDuration: string (how long out, e.g. '2 months')
   */
  /**
   * Player profile enhancements for manual entry
   * - dateOfBirth: string (ISO or YYYY-MM-DD)
   * - age: number
   * - country: string (country of origin)
   * - pastClubs: string[] (array of previous clubs)
   */
  id: string;
  playerName: string;
  fromClub: string;
  toClub: string;
  fee: string;
  date: string;
  source: string;
  status: 'confirmed' | 'rumored' | 'pending' | 'rejected';
  // Enhanced player profile fields
  dateOfBirth?: string;
  age?: number;
  country?: string;
  pastClubs?: string[];
  rejectionReason?: string;
  playerImage?: string;
  // Player-specific news articles
  relatedNews?: PlayerNewsArticle[];
  // Rumours and transfer metadata
  category?: string; // e.g., 'Rumours', 'Done Deal', etc.
  description?: string; // Additional description for rumours
}

export interface PlayerNewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  time: string;
  category: string;
  image?: string;
  url?: string;
  playerName: string;
  relevanceScore: number; // 0-1 score for how relevant this article is to the player
}

export interface CrawlStatus {
  url: string;
  status: 'success' | 'error' | 'pending';
  error?: string;
}

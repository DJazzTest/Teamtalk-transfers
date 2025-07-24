export interface TeamTalkPlayer {
  id: string;
  name: string;
}

export interface TeamTalkArticle {
  id: number;
  headline: string;
  slug: string;
  link: string;
  category: string[];
  tags: string[] | null;
  transfer_tags: string[];
  key_values: string[];
  pub_date: string;
  last_mod_date: string;
  excerpt: string;
  image: string;
  image_title: string;
  description: string;
  transfer_players: TeamTalkPlayer[];
  author: string;
  author_image_url: string;
  author_page_url: string;
}

export interface TeamTalkFeedResponse {
  status: number;
  message: string;
  items: TeamTalkArticle[];
}

export interface ParsedTransferInfo {
  playerName: string;
  fromClub?: string;
  toClub?: string;
  fee?: string;
  status: 'confirmed' | 'rumored' | 'pending';
  confidence: number; // 0-1 score for parsing confidence
}

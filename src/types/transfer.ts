
export interface Transfer {
  id: string;
  playerName: string;
  fromClub: string;
  toClub: string;
  fee: string;
  date: string;
  source: string;
  status: 'confirmed' | 'rumored' | 'pending' | 'rejected';
  rejectionReason?: string;
}

export interface CrawlStatus {
  url: string;
  status: 'success' | 'error' | 'pending';
  error?: string;
}

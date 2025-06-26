
import { Transfer } from '@/types/transfer';

export const mockTransfers: Transfer[] = [
  // Only transfers that meet ALL verification criteria:
  // 1) Sourced from official press release 
  // 2) League registration feed with explicit confirmation phrase
  // 3) Cross-checked against Transfermarkt/official club announcement
  // 4) Appears in scraped URLs from trusted sources
  
  // All mock transfers removed - only verified transfers from scraping will be shown
  // This ensures we only display transfers that pass the strict verification pipeline
];

export const premierLeagueClubs = [
  'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton & Hove Albion',
  'Burnley', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Leeds United',
  'Liverpool', 'Manchester City', 'Manchester United', 'Newcastle United',
  'Nottingham Forest', 'Sunderland', 'Tottenham Hotspur', 'West Ham United',
  'Wolverhampton Wanderers'
];

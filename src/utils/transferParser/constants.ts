
export const PREMIER_LEAGUE_CLUBS = [
  'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton', 'Brighton & Hove Albion',
  'Burnley', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Leeds United', 'Leeds',
  'Liverpool', 'Manchester City', 'Manchester United', 'Newcastle United', 'Newcastle',
  'Nottingham Forest', 'Sheffield United', 'Tottenham', 'Tottenham Hotspur', 'West Ham United', 'West Ham',
  'Wolverhampton Wanderers', 'Wolves', 'Luton Town', 'Luton', 'Leicester City', 'Leicester'
];

// CONFIRMED TRANSFER KEYWORDS - Only phrases that indicate official completion
export const CONFIRMED_TRANSFER_KEYWORDS = [
  'has signed', 'officially joins', 'completed transfer', 'completes move', 
  'signs for', 'announces signing of', 'confirmed signing', 'welcome to',
  'pleased to announce', 'delighted to confirm', 'agreement reached',
  'medical completed', 'contract signed', 'registration confirmed'
];

// EXCLUDED KEYWORDS - Phrases that indicate rumors or speculation
export const EXCLUDED_KEYWORDS = [
  'linked with', 'reportedly', 'in talks', 'could move', 'might sign',
  'interested in', 'considering', 'exploring', 'rumored', 'speculation',
  'potential target', 'looking at', 'monitoring', 'scouting', 'eyeing',
  'set to', 'expected to', 'likely to', 'planning', 'preparing bid'
];

// TRUSTED SOURCES - Only official and verified sources
export const TRUSTED_SOURCES = [
  // Official Premier League clubs
  'arsenal.com', 'avfc.co.uk', 'afcb.co.uk', 'brentfordfc.com', 'brightonandhovealbion.com',
  'burnleyfc.com', 'chelseafc.com', 'cpfc.co.uk', 'evertonfc.com', 'fulhamfc.com',
  'leedsunited.com', 'liverpoolfc.com', 'mancity.com', 'manutd.com', 'nufc.co.uk',
  'nottinghamforest.co.uk', 'safc.com', 'tottenhamhotspur.com', 'whufc.com', 'wolves.co.uk',
  
  // Official league and transfer sites
  'premierleague.com', 'transfermarkt.com', 'transfermarkt.co.uk',
  
  // Tier 1 trusted football news
  'bbc.com/sport', 'skysports.com', 'theguardian.com/football'
];

export const KNOWN_PLAYERS = [
  // Leeds United
  'Jaka Bijol', 'Lukas Nmecha', 
  // Liverpool
  'Giorgi Mamardashvili', 'Jeremie Frimpong', 'Armin Pecsi', 'Florian Wirtz',
  // Manchester City
  'Rayan Ait-Nouri', 'Marcus Bettinelli', 'Rayan Cherki', 'Tijjani Reijnders',
  // Other known players
  'Matheus Cunha', 'Diego León', 'Chido Obi', 'Tyler Fredricson', 
  'Marcus Rashford', 'Antony', 'Tyrell Malacia'
];

export const FEE_PATTERNS = [
  /£([\d.]+)m/gi,
  /\$([\d.]+)m/gi,
  /€([\d.]+)m/gi,
  /([\d.]+) million/gi,
  /undisclosed/gi,
  /free transfer/gi,
  /loan/gi,
  /permanent/gi
];

// Common club name variations
export const CLUB_VARIATIONS: { [key: string]: string[] } = {
  'Leeds United': ['Leeds', 'LUFC'],
  'Manchester City': ['Man City', 'City'],
  'Manchester United': ['Man United', 'United', 'MUFC'],
  'Liverpool': ['LFC'],
  'Brighton & Hove Albion': ['Brighton'],
  'Tottenham Hotspur': ['Tottenham', 'Spurs'],
  'West Ham United': ['West Ham'],
  'Wolverhampton Wanderers': ['Wolves']
};

export const PREMIER_LEAGUE_CLUBS = [
  'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton', 'Brighton & Hove Albion',
  'Burnley', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Leeds United', 'Leeds',
  'Liverpool', 'Manchester City', 'Manchester United', 'Newcastle United', 'Newcastle',
  'Nottingham Forest', 'Sheffield United', 'Tottenham', 'Tottenham Hotspur', 'West Ham United', 'West Ham',
  'Wolverhampton Wanderers', 'Wolves', 'Luton Town', 'Luton', 'Leicester City', 'Leicester'
];

export const TRANSFER_KEYWORDS = [
  'signed', 'joins', 'transferred', 'moves to', 'completes move', 'agrees deal',
  'deal agreed', 'medical completed', 'officially joins', 'confirms signing',
  'announced', 'completed', 'acquisition', 'signs for', 'recruited',
  'lands at', 'moves from', 'switches to', 'deal done', 'transfer in',
  'new signing', 'arrives at', 'signs', 'joined'
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

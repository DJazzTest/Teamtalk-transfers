
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
  'lands at', 'moves from', 'switches to', 'deal done'
];

export const KNOWN_PLAYERS = [
  'Jaka Bijol', 'Lukas Nmecha', 'Matheus Cunha', 'Diego León', 'Chido Obi',
  'Tyler Fredricson', 'Marcus Rashford', 'Antony', 'Tyrell Malacia'
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

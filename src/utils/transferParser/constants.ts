
export const PREMIER_LEAGUE_CLUBS = [
  'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton', 'Brighton & Hove Albion',
  'Burnley', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Leeds United', 'Leeds',
  'Liverpool', 'Manchester City', 'Manchester United', 'Newcastle United', 'Newcastle',
  'Nottingham Forest', 'Sheffield United', 'Tottenham', 'Tottenham Hotspur', 'West Ham United', 'West Ham',
  'Wolverhampton Wanderers', 'Wolves', 'Luton Town', 'Luton', 'Leicester City', 'Leicester', 'Sunderland'
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
  // Arsenal
  'Jorginho', 'Nathan Butler-Oyedeji', 'Elian Quesada-Thorn', 'Kieran Tierney', 
  'Raheem Sterling', 'Neto', 'Nuno Tavares', 'Marquinhos',
  
  // Aston Villa
  'Yasin Ozcan', 'Robin Olsen', 'Josh Feeney',
  
  // Bournemouth
  'Eli Junior Kroupi', 'Dean Huijsen', 'Jaidon Anthony', 'Kepa Arrizabalaga',
  'Adrien Truffert', 'Daniel Jebbison', 'Max Aarons',
  
  // Brentford
  'Ben Mee', 'Michael Kayode', 'Ben Winterbottom', 'Romelle Donovan',
  'Caoimhin Kelleher', 'Mark Flekken',
  
  // Brighton
  'Tommy Watson', 'Yun Do-young', 'Charalampos Kostoulas', 'Diego Coppola',
  
  // Burnley
  'Bashir Humphreys', 'Marcus Edwards', 'Zian Flemming', 'Nathan Redmond',
  'Jonjo Shelvey', 'Jeremy Sarmiento', 'CJ Egan-Riley', 'Max Weiss',
  
  // Chelsea
  'Dario Essugo', 'Estevao Willian', 'Liam Delap', 'Mamadou Sarr', 'Marcus Bettinelli',
  
  // Crystal Palace
  'Joel Ward', 'Jeffrey Schlupp', 'Louie Moulden', 'Walter Benitez',
  
  // Everton
  'Ashley Young', 'Asmir Begovic', 'Joao Virginia', 'Abdoulaye Doucoure',
  'Jack Harrison', 'Jesper Lindstrom', 'Orel Mangala', 'Armando Broja',
  'Charly Alcaraz', 'Mason Holgate', 'Neal Maupay',
  
  // Fulham
  'Carlos Vinicius', 'Willian', 'Luca Ashby-Hammond',
  
  // Leeds United
  'Josuha Guilavogui', 'Joe Rothwell', 'Manor Solomon', 'Lukas Nmecha',
  'Joe Snowdon', 'Jaka Bijol',
  
  // Liverpool
  'Giorgi Mamardashvili', 'Trent Alexander-Arnold', 'Jeremie Frimpong',
  'Dominic Corness', 'Jakub Ojrzynski', 'Armin Pecsi', 'Vitezslav Jaros',
  'Florian Wirtz', 'Nathaniel Phillips', 'Harvey Davies',
  
  // Manchester City
  'Kevin De Bruyne', 'Jacob Wright', 'Scott Carson', 'Rayan Ait-Nouri',
  'Rayan Cherki', 'Tijjani Reijnders',
  
  // Manchester United
  'Christian Eriksen', 'Jonny Evans', 'Victor Lindelof', 'Matheus Cunha',
  
  // Newcastle United
  'Antonio Cordero', 'Jamal Lewis', 'Lloyd Kelly',
  
  // Nottingham Forest
  'Jack Perkins', 'Harry Toffolo', 'Alex Moreno', 'Andrew Omobamidele',
  
  // Sunderland
  'Enzo Le Fee', 'Jobe Bellingham',
  
  // Tottenham
  'Luka Vuskovic', 'Fraser Forster', 'Sergio Reguilon', 'Alfie Whiteman',
  'Timo Werner', 'Pierre-Emile Hojbjerg', 'Kevin Danso', 'Mathys Tel', 'Damola Ajayi',
  
  // West Ham
  'Aaron Cresswell', 'Lukasz Fabianski', 'Vladimir Coufal', 'Danny Ings',
  'Kamarai Swyer', 'Jean-Clair Todibo', 'Carlos Soler', 'Evan Ferguson',
  'Kurt Zouma', 'Brad Dolaghan',
  
  // Wolves
  'Pablo Sarabia', 'Craig Dawson', 'Carlos Forbs', 'Matty Whittingham',
  'Hugo Bueno', 'Fer Lopez', 'Chem Campbell'
] as const;

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

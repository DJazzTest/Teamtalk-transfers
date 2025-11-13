// Team Rumours Data - Players rumoured to join/leave clubs
// This supplements API data with manually curated rumours

export interface RumourEntry {
  player: string;
  fromClub: string;
  toClub: string;
  fee?: string;
  description?: string;
}

export const TEAMS_RUMOURS_DATA: Record<string, RumourEntry[]> = {
  'Arsenal': [
    { player: 'Rafael Leão', fromClub: 'AC Milan', toClub: 'Arsenal', description: 'Tracking' },
    { player: 'Givairo Read', fromClub: 'Feyenoord', toClub: 'Arsenal', description: 'Monitoring' }
  ],
  'Aston Villa': [
    { player: 'Igor Thiago', fromClub: 'Brentford', toClub: 'Aston Villa', description: 'Linked with' },
    { player: 'Serie A midfielder', fromClub: 'Serie A', toClub: 'Aston Villa', description: 'Interest in' }
  ],
  'Bournemouth': [
    // No major rumours reported
  ],
  'Brentford': [
    { player: 'Vitaly Janelt', fromClub: 'Brentford', toClub: 'Eintracht Frankfurt', description: 'Targeted by' },
    { player: 'Igor Thiago', fromClub: 'Brentford', toClub: 'Newcastle United', description: 'Monitored by Newcastle, Villa, Spurs' },
    { player: 'Nikola Vasilj', fromClub: 'St. Pauli', toClub: 'Brentford', description: 'Linked' }
  ],
  'Brighton & Hove Albion': [
    { player: 'Carlos Baleba', fromClub: 'Brighton & Hove Albion', toClub: 'Manchester United', description: 'Linked with' },
    { player: 'Ismael Saibari', fromClub: 'PSV', toClub: 'Brighton & Hove Albion', description: 'Interest in' },
    { player: 'Nikola Vasilj', fromClub: 'St. Pauli', toClub: 'Brighton & Hove Albion', description: 'Interest in' },
    { player: 'Yankuba Minteh', fromClub: 'Feyenoord', toClub: 'Brighton & Hove Albion', description: 'Liverpool tracking (on loan)' }
  ],
  'Burnley': [
    { player: 'La Liga striker', fromClub: 'La Liga', toClub: 'Burnley', description: 'Linked with' },
    { player: 'Franculino Dju', fromClub: 'FC Midtjylland', toClub: 'Burnley', description: 'Interest in' }
  ],
  'Chelsea': [
    { player: 'Endrick', fromClub: 'Real Madrid', toClub: 'Chelsea', description: 'Monitoring' },
    { player: 'Daniel Muñoz', fromClub: 'Crystal Palace', toClub: 'Chelsea', description: 'Contact made for' },
    { player: 'Serie A striker', fromClub: 'Serie A', toClub: 'Chelsea', description: 'Linked with' },
    { player: 'U20 World Cup star', fromClub: 'Unknown', toClub: 'Chelsea', description: 'Linked with' }
  ],
  'Crystal Palace': [
    { player: 'Adam Wharton', fromClub: 'Crystal Palace', toClub: 'Manchester United', description: 'Linked with' },
    { player: 'Daniel Muñoz', fromClub: 'Crystal Palace', toClub: 'Chelsea', description: 'Attracting Chelsea, PSG, Barcelona' }
  ],
  'Everton': [
    { player: 'Joshua Zirkzee', fromClub: 'Manchester United', toClub: 'Everton', description: 'Eyeing' },
    { player: 'Franculino Dju', fromClub: 'FC Midtjylland', toClub: 'Everton', description: 'Linked with' }
  ],
  'Fulham': [
    { player: 'Kevin', fromClub: 'Fulham', toClub: 'Liverpool', description: 'Liverpool tracking (recent signing)' },
    { player: 'Marco Silva', fromClub: 'Fulham', toClub: 'Unknown', description: 'Future under scrutiny' }
  ],
  'Ipswich Town': [
    { player: 'Issa Kaboré', fromClub: 'Manchester City', toClub: 'Ipswich Town', description: 'Interested in' },
    { player: 'Jordan James', fromClub: 'Birmingham City', toClub: 'Ipswich Town', description: 'Interested in' },
    { player: 'El Hadji Malick Cissé', fromClub: 'Unknown', toClub: 'Ipswich Town', description: 'Linked with' },
    { player: 'Dele Alli', fromClub: 'Everton', toClub: 'Ipswich Town', description: 'Linked with' }
  ],
  'Leicester City': [
    { player: 'Jeremy Monga', fromClub: 'Leicester City', toClub: 'Top Six', description: 'Attracting interest from top six' },
    { player: 'Bruno Fuchs', fromClub: 'CSKA Moscow', toClub: 'Leicester City', description: 'Linked with' },
    { player: 'Louie Barry', fromClub: 'Aston Villa', toClub: 'Leicester City', description: 'Linked with' },
    { player: 'Dennis Cirkin', fromClub: 'Sunderland', toClub: 'Leicester City', description: 'Linked with' }
  ],
  'Liverpool': [
    { player: 'Dayot Upamecano', fromClub: 'Bayern Munich', toClub: 'Liverpool', description: 'Monitoring' },
    { player: 'Alexis Mac Allister', fromClub: 'Liverpool', toClub: 'Real Madrid', description: 'Linked with' },
    { player: 'Yankuba Minteh', fromClub: 'Feyenoord', toClub: 'Liverpool', description: 'Tracking' },
    { player: 'Kevin', fromClub: 'Fulham', toClub: 'Liverpool', description: 'Tracking' }
  ],
  'Leeds United': [
    { player: 'Chris Wood', fromClub: 'Nottingham Forest', toClub: 'Leeds United', description: 'Linked with' },
    { player: 'Patrick Bamford', fromClub: 'Sheffield United', toClub: 'Leeds United', description: 'Linked with' }
  ],
  'Manchester City': [
    { player: 'Vinícius Júnior', fromClub: 'Real Madrid', toClub: 'Manchester City', description: 'Interested in' },
    { player: 'Marc Guehi', fromClub: 'Crystal Palace', toClub: 'Manchester City', description: 'Monitoring' }
  ],
  'Manchester United': [
    { player: 'Conor Gallagher', fromClub: 'Atletico Madrid', toClub: 'Manchester United', description: 'Preparing move for' },
    { player: 'Kennet Eichhorn', fromClub: 'Hertha Berlin', toClub: 'Manchester United', description: 'Tracking' },
    { player: 'Vitor Roque', fromClub: 'Palmeiras', toClub: 'Manchester United', description: 'Interested in' },
    { player: 'Elliot Anderson', fromClub: 'Nottingham Forest', toClub: 'Manchester United', description: 'Interested in' },
    { player: 'Carlos Baleba', fromClub: 'Brighton & Hove Albion', toClub: 'Manchester United', description: 'Linked with' },
    { player: 'Adam Wharton', fromClub: 'Crystal Palace', toClub: 'Manchester United', description: 'Linked with' }
  ],
  'Newcastle United': [
    { player: 'Galáctico-level signing', fromClub: 'Unknown', toClub: 'Newcastle United', description: 'Planning' },
    { player: 'Ligue 1 starlet', fromClub: 'Ligue 1', toClub: 'Newcastle United', description: 'Monitoring £22m (also linked with Sunderland)' },
    { player: 'Igor Thiago', fromClub: 'Brentford', toClub: 'Newcastle United', description: 'Monitored by' }
  ],
  'Nottingham Forest': [
    { player: 'Elliot Anderson', fromClub: 'Nottingham Forest', toClub: 'Manchester United', description: 'Attracting £100m+ interest from' },
    { player: 'Arnaud Kalimuendo', fromClub: 'Nottingham Forest', toClub: 'Unknown', description: 'In talks to leave in January' },
    { player: 'Chris Wood', fromClub: 'Nottingham Forest', toClub: 'Leeds United', description: 'Linked with' }
  ],
  'Sheffield United': [
    { player: 'Patrick Bamford', fromClub: 'Free Agent', toClub: 'Sheffield United', description: 'In talks to sign (free agent)' },
    { player: 'Attacking reinforcements', fromClub: 'Unknown', toClub: 'Sheffield United', description: 'Seeking under Chris Wilder' }
  ],
  'Sunderland': [
    { player: 'Ligue 1 starlet', fromClub: 'Ligue 1', toClub: 'Sunderland', description: 'Monitoring £22m (also linked with Newcastle)' }
  ],
  'Tottenham Hotspur': [
    { player: 'Antoine Semenyo', fromClub: 'Bournemouth', toClub: 'Tottenham Hotspur', description: 'Linked with' },
    { player: 'Iliman Ndiaye', fromClub: 'Everton', toClub: 'Tottenham Hotspur', description: 'Eyeing' },
    { player: 'Rodrygo', fromClub: 'Real Madrid', toClub: 'Tottenham Hotspur', description: 'Monitoring' },
    { player: 'Ivan Toney', fromClub: 'Al-Ahli', toClub: 'Tottenham Hotspur', description: 'Monitoring' },
    { player: 'Igor Thiago', fromClub: 'Brentford', toClub: 'Tottenham Hotspur', description: 'Monitored by' }
  ],
  'West Ham United': [
    // No specific rumours listed
  ],
  'Wolverhampton Wanderers': [
    // No specific rumours listed
  ]
};


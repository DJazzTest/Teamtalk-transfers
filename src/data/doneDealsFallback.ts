export interface DoneDealFallbackItem {
  player: string;
  fromClub: string;
  toClub: string;
  fee?: string;
  notes?: string;
}

// Fallback dataset used when staging API has no done deals
export const doneDealsFallbackByClub: Record<string, DoneDealFallbackItem[]> = {
  'Liverpool': [
    { player: 'Alexander Isak', fromClub: 'Newcastle United', toClub: 'Liverpool', fee: '£134m + add-ons', notes: 'Premier League record fee; will lead the line with Salah and Ekitike' },
    { player: 'Marc Guehi', fromClub: 'Crystal Palace', toClub: 'Liverpool', fee: undefined, notes: 'Strengthens back line alongside Konaté' }
  ],
  'Chelsea': [
    { player: 'Alejandro Garnacho', fromClub: 'Manchester United', toClub: 'Chelsea', fee: '£40m', notes: 'Adds pace and flair to attack' }
  ],
  'Newcastle United': [
    { player: 'Nick Woltemade', fromClub: 'Stuttgart', toClub: 'Newcastle United', fee: '£65m', notes: 'Tall, technical forward — replaces Isak' }
  ],
  'Arsenal': [
    { player: 'Piero Hincapie', fromClub: 'Bayer Leverkusen', toClub: 'Arsenal', fee: 'Loan + £45m option', notes: 'Versatile defender (CB/LB)' }
  ],
  'Everton': [
    { player: 'Tyler Dibling', fromClub: 'Southampton', toClub: 'Everton', fee: '£40m', notes: 'Promising 19-year-old midfielder' }
  ],
  'Nottingham Forest': [
    { player: 'Savona', fromClub: 'Juventus', toClub: 'Nottingham Forest', fee: undefined, notes: 'Versatile defender — adds depth' }
  ]
};







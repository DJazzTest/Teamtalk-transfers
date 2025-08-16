// Premier League 2025 - Club Financial Data
export const clubEarnings = {
  'Chelsea': 195,
  'Liverpool': 170,
  'Brighton & Hove Albion': 105.8,
  'Wolverhampton Wanderers': 64,
  'Brentford': 60,
  'West Ham United': 55,
  'Southampton': 50,
  'Leicester City': 46,
  'Tottenham Hotspur': 42,
  'Bournemouth': 40,
  'Nottingham Forest': 30,
  'Manchester City': 28,
  'Arsenal': 6.7,
  'Crystal Palace': 2,
  'Fulham': 1,
  'Newcastle United': 0,
  'Aston Villa': 0,
  'Everton': 5,
  'Burnley': 5,
  'Sunderland': 2
};

export const clubSpending = {
  'Liverpool': 248.5,
  'Chelsea': 234.8,
  'Manchester United': 193.8,
  'Arsenal': 185.3,
  'Manchester City': 146.9,
  'Sunderland': 130,
  'Brighton & Hove Albion': 133,
  'Burnley': 123,
  'Tottenham Hotspur': 125,
  'Leeds United': 118,
  'Newcastle United': 60,
  'Nottingham Forest': 42,
  'Bournemouth': 29,
  'Wolverhampton Wanderers': 27,
  'Brentford': 20,
  'West Ham United': 15,
  'Everton': 10,
  'Aston Villa': 6,
  'Crystal Palace': 5,
  'Fulham': 0.5
};

// Calculate net spend for each club (spending - earnings)
export const getNetSpend = (club: string): number => {
  const spent = clubSpending[club as keyof typeof clubSpending] || 0;
  const earned = clubEarnings[club as keyof typeof clubEarnings] || 0;
  return spent - earned;
};

export const allPremierLeagueClubs = [
  'Arsenal', 'Aston Villa', 'Brentford', 'Brighton & Hove Albion', 'Chelsea',
  'Crystal Palace', 'Everton', 'Fulham', 'Ipswich Town', 'Leeds United',
  'Leicester City', 'Liverpool', 'Manchester City', 'Manchester United',
  'Newcastle United', 'Nottingham Forest', 'Sheffield United', 'Southampton',
  'Tottenham Hotspur', 'West Ham United'
];
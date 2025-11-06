interface Player {
  name: string;
  weeklyWage: number;
  yearlyWage: number;
  position?: string;
  imageUrl?: string;
}

// Base wage multipliers for each club tier
const wageTiers = {
  'top6': 1.0,      // Man City, Liverpool, Chelsea, etc.
  'european': 0.8,  // Teams regularly in Europe
  'midtable': 0.6,  // Mid-table teams
  'lower': 0.4,     // Lower table teams
  'promoted': 0.3   // Newly promoted teams
};

// Helper function to generate realistic player names based on club
const generatePlayerName = (club: string, index: number): string => {
  const firstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  
  // For top clubs, include some international-sounding names
  const isTopClub = ['Arsenal', 'Manchester City', 'Chelsea', 'Liverpool', 'Manchester United', 'Tottenham'].includes(club);
  
  if (isTopClub && Math.random() > 0.5) {
    const intlFirst = ['Mohamed', 'Kevin', 'Bruno', 'Heung-min', 'Virgil', 'Ruben', 'Rodri', 'Bernardo', 'Jack', 'Phil'];
    const intlLast = ['Salah', 'De Bruyne', 'Fernandes', 'Son', 'van Dijk', 'Dias', 'Silva', 'Grealish', 'Foden', 'Nunes'];
    return `${intlFirst[Math.floor(Math.random() * intlFirst.length)]} ${intlLast[Math.floor(Math.random() * intlLast.length)]}`;
  }
  
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

// Generate a squad of players with realistic wage distribution
const generateSquad = (club: string, size: number, wageMultiplier: number): Player[] => {
  const squad: Player[] = [];
  
  // Generate players with decreasing wages
  for (let i = 0; i < size; i++) {
    // Base wage decreases with player position in squad
    const positionFactor = Math.pow(0.9, i);
    const baseWage = 300000 * wageMultiplier * positionFactor;
    
    // Add some randomness
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
    const weeklyWage = Math.round(baseWage * randomFactor / 1000) * 1000; // Round to nearest £1k
    
    // Calculate yearly wage in millions with 2 decimal places
    const yearlyWage = Math.round((weeklyWage * 52 / 1000000) * 100) / 100;
    
    squad.push({
      name: generatePlayerName(club, i),
      weeklyWage,
      yearlyWage
    });
  }
  
  return squad;
};

export const clubSquads: Record<string, Player[]> = {
  'Arsenal': [
    { name: 'Kai Havertz', position: 'Midfielder', weeklyWage: 280000, yearlyWage: 14.56 },
    { name: 'Gabriel Jesus', position: 'Forward', weeklyWage: 265000, yearlyWage: 13.78 },
    { name: 'Declan Rice', position: 'Midfielder', weeklyWage: 240000, yearlyWage: 12.48 },
    { name: 'Martin Ødegaard', position: 'Midfielder', weeklyWage: 240000, yearlyWage: 12.48 },
    { name: 'Viktor Gyökeres', position: 'Forward', weeklyWage: 200000, yearlyWage: 10.4 },
    { name: 'Bukayo Saka', position: 'Midfielder', weeklyWage: 195000, yearlyWage: 10.14 },
    { name: 'William Saliba', position: 'Defender', weeklyWage: 190000, yearlyWage: 9.88 },
    { name: 'Gabriel Martinelli', position: 'Forward', weeklyWage: 180000, yearlyWage: 9.36 },
    { name: 'Gabriel Magalhães', position: 'Defender', weeklyWage: 150000, yearlyWage: 7.8 },
    { name: 'Ben White', position: 'Defender', weeklyWage: 150000, yearlyWage: 7.8 },
    { name: 'Oleksandr Zinchenko', position: 'Defender', weeklyWage: 150000, yearlyWage: 7.8 },
    { name: 'Mikel Merino', position: 'Midfielder', weeklyWage: 130000, yearlyWage: 6.76 },
    { name: 'Riccardo Calafiori', position: 'Defender', weeklyWage: 120000, yearlyWage: 6.24 },
    { name: 'Reiss Nelson', position: 'Forward', weeklyWage: 100000, yearlyWage: 5.2 },
    { name: 'Fabio Vieira', position: 'Midfielder', weeklyWage: 95000, yearlyWage: 4.94 },
    { name: 'Eberechi Eze', position: 'Midfielder', weeklyWage: 90000, yearlyWage: 4.68 },
    { name: 'David Raya', position: 'Goalkeeper', weeklyWage: 85000, yearlyWage: 4.42 },
    { name: 'Jurrien Timber', position: 'Defender', weeklyWage: 80000, yearlyWage: 4.16 },
    { name: 'Jakub Kiwior', position: 'Defender', weeklyWage: 75000, yearlyWage: 3.9 },
    { name: 'Albert Sambi Lokonga', position: 'Midfielder', weeklyWage: 70000, yearlyWage: 3.64 },
    { name: 'Noni Madueke', position: 'Forward', weeklyWage: 65000, yearlyWage: 3.38 },
    { name: 'Martin Zubimendi', position: 'Midfielder', weeklyWage: 60000, yearlyWage: 3.12 },
    { name: 'Cristhian Mosquera', position: 'Defender', weeklyWage: 55000, yearlyWage: 2.86 },
    { name: 'Tommy Setford', position: 'Goalkeeper', weeklyWage: 30000, yearlyWage: 1.56 },
    { name: 'Ethan Nwaneri', position: 'Midfielder', weeklyWage: 25000, yearlyWage: 1.3 },
    { name: 'Myles Lewis-Skelly', position: 'Midfielder', weeklyWage: 20000, yearlyWage: 1.04 },
    { name: 'Alexei Rojas', position: 'Forward', weeklyWage: 15000, yearlyWage: 0.78 },
    { name: 'Joshua Nichols', position: 'Midfielder', weeklyWage: 10000, yearlyWage: 0.52 },
    { name: 'Louie Copley', position: 'Midfielder', weeklyWage: 8000, yearlyWage: 0.416 },
    { name: 'Ismeal Kabia', position: 'Forward', weeklyWage: 6000, yearlyWage: 0.312 },
    { name: 'Max Dowman', position: 'Midfielder', weeklyWage: 5000, yearlyWage: 0.26 },
    { name: 'Andre Harriman-Annous', position: 'Midfielder', weeklyWage: 5000, yearlyWage: 0.26 },
    { name: 'Marli Salmon', position: 'Midfielder', weeklyWage: 5000, yearlyWage: 0.26 }
  ].map(player => ({
    ...player,
    imageUrl: `/player-images/arsenal/${player.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.png`
  })),
  'Aston Villa': [
    { name: 'Boubacar Kamara', position: 'Midfielder', weeklyWage: 150000, yearlyWage: 7.8 },
    { name: 'Youri Tielemans', position: 'Midfielder', weeklyWage: 150000, yearlyWage: 7.8 },
    { name: 'Emiliano Martínez', position: 'Goalkeeper', weeklyWage: 150000, yearlyWage: 7.8 },
    { name: 'Donyell Malen', position: 'Forward', weeklyWage: 140000, yearlyWage: 7.28 },
    { name: 'Amadou Onana', position: 'Midfielder', weeklyWage: 140000, yearlyWage: 7.28 },
    { name: 'Ollie Watkins', position: 'Forward', weeklyWage: 130000, yearlyWage: 6.76 },
    { name: 'Philippe Coutinho', position: 'Midfielder', weeklyWage: 125000, yearlyWage: 6.5 },
    { name: 'Lucas Digne', position: 'Defender', weeklyWage: 120000, yearlyWage: 6.24 },
    { name: 'John McGinn', position: 'Midfielder', weeklyWage: 120000, yearlyWage: 6.24 },
    { name: 'Tyrone Mings', position: 'Defender', weeklyWage: 100000, yearlyWage: 5.2 },
    { name: 'Ian Maatsen', position: 'Defender', weeklyWage: 100000, yearlyWage: 5.2 },
    { name: 'Pau Torres', position: 'Defender', weeklyWage: 95000, yearlyWage: 4.94 },
    { name: 'Ezri Konsa', position: 'Defender', weeklyWage: 90000, yearlyWage: 4.68 },
    { name: 'Matty Cash', position: 'Defender', weeklyWage: 85000, yearlyWage: 4.42 },
    { name: 'Samuel Iling-Junior', position: 'Midfielder', weeklyWage: 80000, yearlyWage: 4.16 },
    { name: 'Morgan Rogers', position: 'Forward', weeklyWage: 75000, yearlyWage: 3.9 },
    { name: 'Evann Guessand', position: 'Forward', weeklyWage: 70000, yearlyWage: 3.64 },
    { name: 'Ross Barkley', position: 'Midfielder', weeklyWage: 65000, yearlyWage: 3.38 },
    { name: 'Marco Bizot', position: 'Goalkeeper', weeklyWage: 60000, yearlyWage: 3.12 },
    { name: 'Andres Garcia', position: 'Defender', weeklyWage: 55000, yearlyWage: 2.86 },
    { name: 'Lino Sousa', position: 'Defender', weeklyWage: 50000, yearlyWage: 2.6 },
    { name: 'Lamare Bogarde', position: 'Midfielder', weeklyWage: 45000, yearlyWage: 2.34 },
    { name: 'Travis Patterson', position: 'Midfielder', weeklyWage: 40000, yearlyWage: 2.08 },
    { name: 'James Wright', position: 'Midfielder', weeklyWage: 35000, yearlyWage: 1.82 },
    { name: 'Jamaldeen Jimoh', position: 'Midfielder', weeklyWage: 30000, yearlyWage: 1.56 },
    { name: 'Bradley Burrowes', position: 'Midfielder', weeklyWage: 25000, yearlyWage: 1.3 },
    { name: 'George Hemmings', position: 'Forward', weeklyWage: 20000, yearlyWage: 1.04 },
    { name: 'Sam Proctor', position: 'Midfielder', weeklyWage: 15000, yearlyWage: 0.78 },
    { name: 'Triston Rowe', position: 'Midfielder', weeklyWage: 10000, yearlyWage: 0.52 }
  ].map(player => ({
    ...player,
    imageUrl: `/player-images/aston-villa/${player.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.png`
  })),
  'Chelsea': generateSquad('Chelsea', 25, wageTiers.top6),
  'Liverpool': generateSquad('Liverpool', 25, wageTiers.top6),
  'Manchester City': generateSquad('Manchester City', 25, wageTiers.top6),
  'Manchester United': generateSquad('Manchester United', 25, wageTiers.top6),
  'Tottenham Hotspur': generateSquad('Tottenham Hotspur', 25, wageTiers.top6),
  
  // European Competition Teams
  'Newcastle United': generateSquad('Newcastle United', 25, wageTiers.european),
  'West Ham United': generateSquad('West Ham United', 25, wageTiers.european),
  'Brighton & Hove Albion': generateSquad('Brighton', 25, wageTiers.european),
  
  // Mid-table Teams
  'Brentford': generateSquad('Brentford', 25, wageTiers.midtable),
  'Crystal Palace': generateSquad('Crystal Palace', 25, wageTiers.midtable),
  'Wolverhampton Wanderers': generateSquad('Wolves', 25, wageTiers.midtable),
  'Fulham': generateSquad('Fulham', 25, wageTiers.midtable),
  
  // Lower Table Teams
  'Nottingham Forest': generateSquad('Nottingham Forest', 25, wageTiers.lower),
  'Everton': generateSquad('Everton', 25, wageTiers.lower),
  'Bournemouth': generateSquad('Bournemouth', 25, wageTiers.lower),
  
  // Newly Promoted Teams
  'Ipswich Town': generateSquad('Ipswich Town', 25, wageTiers.promoted),
  'Sunderland': generateSquad('Sunderland', 25, wageTiers.promoted),
  'Sheffield United': generateSquad('Sheffield United', 25, wageTiers.promoted),
  
  // Championship Team (Leeds United)
  'Leeds United': [
    { name: 'Illan Meslier', position: 'Goalkeeper', weeklyWage: 35000, yearlyWage: 1.82 },
    { name: 'Kristoffer Klaesson', position: 'Goalkeeper', weeklyWage: 15000, yearlyWage: 0.78 },
    { name: 'Robin Koch', position: 'Defender', weeklyWage: 45000, yearlyWage: 2.34 },
    { name: 'Liam Cooper', position: 'Defender', weeklyWage: 40000, yearlyWage: 2.08 },
    { name: 'Pascal Struijk', position: 'Defender', weeklyWage: 30000, yearlyWage: 1.56 },
    { name: 'Junior Firpo', position: 'Defender', weeklyWage: 50000, yearlyWage: 2.6 },
    { name: 'Rasmus Kristensen', position: 'Defender', weeklyWage: 40000, yearlyWage: 2.08 },
    { name: 'Cody Drameh', position: 'Defender', weeklyWage: 20000, yearlyWage: 1.04 },
    { name: 'Leo Hjelde', position: 'Defender', weeklyWage: 15000, yearlyWage: 0.78 },
    { name: 'Tyler Adams', position: 'Midfielder', weeklyWage: 60000, yearlyWage: 3.12 },
    { name: 'Marc Roca', position: 'Midfielder', weeklyWage: 55000, yearlyWage: 2.86 },
    { name: 'Weston McKennie', position: 'Midfielder', weeklyWage: 70000, yearlyWage: 3.64 },
    { name: 'Brenden Aaronson', position: 'Midfielder', weeklyWage: 60000, yearlyWage: 3.12 },
    { name: 'Jack Harrison', position: 'Midfielder', weeklyWage: 55000, yearlyWage: 2.86 },
    { name: 'Luis Sinisterra', position: 'Midfielder', weeklyWage: 65000, yearlyWage: 3.38 },
    { name: 'Crysencio Summerville', position: 'Midfielder', weeklyWage: 30000, yearlyWage: 1.56 },
    { name: 'Sam Greenwood', position: 'Midfielder', weeklyWage: 20000, yearlyWage: 1.04 },
    { name: 'Patrick Bamford', position: 'Forward', weeklyWage: 70000, yearlyWage: 3.64 },
    { name: 'Rodrigo', position: 'Forward', weeklyWage: 100000, yearlyWage: 5.2 },
    { name: 'Georginio Rutter', position: 'Forward', weeklyWage: 45000, yearlyWage: 2.34 },
    { name: 'Joe Gelhardt', position: 'Forward', weeklyWage: 25000, yearlyWage: 1.3 },
    { name: 'Wilfried Gnonto', position: 'Forward', weeklyWage: 30000, yearlyWage: 1.56 },
    { name: 'Sonny Perkins', position: 'Forward', weeklyWage: 10000, yearlyWage: 0.52 },
    { name: 'Darko Gyabi', position: 'Midfielder', weeklyWage: 15000, yearlyWage: 0.78 },
    { name: 'Archie Gray', position: 'Midfielder', weeklyWage: 10000, yearlyWage: 0.52 }
  ].map(player => ({
    ...player,
    // Use local image if available, otherwise fallback to avatar
    imageUrl: `/player-images/leeds-united/${player.name.toLowerCase().replace(/\s+/g, '-')}.png`
  }))
};

export const getSquad = (club: string): Player[] => {
  // Return real squad data if available, otherwise generate placeholder data
  if (clubSquads[club]) {
    return clubSquads[club];
  }
  
  // Generate a default squad for any club not explicitly listed
  return generateSquad(club, 25, wageTiers.midtable);
};

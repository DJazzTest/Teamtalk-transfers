import { Transfer } from '@/types/transfer';

export const recentTransfers: Transfer[] = [
  // Latest Rumours (added at the top for recent display)
  {
    id: 'rumor-osimhen-2025',
    playerName: 'Victor Osimhen',
    fromClub: 'Napoli',
    toClub: 'Chelsea',
    fee: '£85M',
    date: '2025-01-17T09:00:00Z',
    source: 'sky sports',
    status: 'rumored'
  },
  {
    id: 'rumor-kvaratskhelia-2025',
    playerName: 'Khvicha Kvaratskhelia',
    fromClub: 'Napoli',
    toClub: 'Liverpool',
    fee: '£70M',
    date: '2025-01-17T08:30:00Z',
    source: 'the guardian',
    status: 'rumored'
  },
  {
    id: 'rumor-darwin-2025',
    playerName: 'Darwin Nunez',
    fromClub: 'Liverpool',
    toClub: 'AC Milan',
    fee: '£60M',
    date: '2025-01-17T07:45:00Z',
    source: 'bbc sport',
    status: 'rumored'
  },
  {
    id: 'rumor-grealish-2025',
    playerName: 'Jack Grealish',
    fromClub: 'Manchester City',
    toClub: 'Aston Villa',
    fee: '£50M',
    date: '2025-01-16T22:15:00Z',
    source: 'sky sports',
    status: 'rumored'
  },
  {
    id: 'rumor-rashford-2025',
    playerName: 'Marcus Rashford',
    fromClub: 'Manchester United',
    toClub: 'Paris Saint-Germain',
    fee: '£75M',
    date: '2025-01-16T21:30:00Z',
    source: 'the guardian',
    status: 'rumored'
  },
  {
    id: 'rumor-maddison-2025',
    playerName: 'James Maddison',
    fromClub: 'Tottenham Hotspur',
    toClub: 'Newcastle United',
    fee: '£40M',
    date: '2025-01-16T20:45:00Z',
    source: 'bbc sport',
    status: 'rumored'
  },

  // Arsenal
  {
    id: 'arsenal-jorginho-2025',
    playerName: 'Jorginho',
    fromClub: 'Arsenal',
    toClub: 'Flamengo',
    fee: 'Free Transfer',
    date: '2025-01-15T10:00:00Z',
    source: 'arsenal.com',
    status: 'confirmed'
  },
  {
    id: 'arsenal-tierney-2025',
    playerName: 'Kieran Tierney',
    fromClub: 'Arsenal',
    toClub: 'Celtic',
    fee: 'Free Transfer',
    date: '2025-01-12T14:30:00Z',
    source: 'arsenal.com',
    status: 'confirmed'
  },
  {
    id: 'arsenal-sterling-2025',
    playerName: 'Raheem Sterling',
    fromClub: 'Arsenal',
    toClub: 'Chelsea',
    fee: 'End of loan',
    date: '2025-01-10T16:00:00Z',
    source: 'arsenal.com',
    status: 'confirmed'
  },
  {
    id: 'arsenal-neto-2025',
    playerName: 'Neto',
    fromClub: 'Arsenal',
    toClub: 'Bournemouth',
    fee: 'End of loan',
    date: '2025-01-08T12:00:00Z',
    source: 'arsenal.com',
    status: 'confirmed'
  },
  {
    id: 'arsenal-tavares-2025',
    playerName: 'Nuno Tavares',
    fromClub: 'Arsenal',
    toClub: 'Lazio',
    fee: '£8M',
    date: '2025-01-05T15:00:00Z',
    source: 'arsenal.com',
    status: 'confirmed'
  },
  {
    id: 'arsenal-marquinhos-2025',
    playerName: 'Marquinhos',
    fromClub: 'Arsenal',
    toClub: 'Cruzeiro',
    fee: '£5M',
    date: '2025-01-03T11:00:00Z',
    source: 'arsenal.com',
    status: 'confirmed'
  },
  {
    id: 'arsenal-butler-oyedeji-2025',
    playerName: 'Nathan Butler-Oyedeji',
    fromClub: 'Arsenal',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-02T12:00:00Z',
    source: 'arsenal.com',
    status: 'confirmed'
  },
  {
    id: 'arsenal-quesada-thorn-2025',
    playerName: 'Elian Quesada-Thorn',
    fromClub: 'Arsenal',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-02T12:00:00Z',
    source: 'arsenal.com',
    status: 'confirmed'
  },

  // Aston Villa
  {
    id: 'villa-ozcan-2025',
    playerName: 'Yasin Ozcan',
    fromClub: 'Kasimpasa',
    toClub: 'Aston Villa',
    fee: '£3M',
    date: '2025-01-14T13:00:00Z',
    source: 'avfc.co.uk',
    status: 'confirmed'
  },
  {
    id: 'villa-olsen-2025',
    playerName: 'Robin Olsen',
    fromClub: 'Aston Villa',
    toClub: 'Malmo',
    fee: 'Free Transfer',
    date: '2025-01-11T09:00:00Z',
    source: 'avfc.co.uk',
    status: 'confirmed'
  },
  {
    id: 'villa-feeney-2025',
    playerName: 'Josh Feeney',
    fromClub: 'Aston Villa',
    toClub: 'Huddersfield',
    fee: 'Loan',
    date: '2025-01-09T16:30:00Z',
    source: 'avfc.co.uk',
    status: 'confirmed'
  },

  // Bournemouth
  {
    id: 'bournemouth-kroupi-2025',
    playerName: 'Eli Junior Kroupi',
    fromClub: 'Lorient',
    toClub: 'Bournemouth',
    fee: '£12M',
    date: '2025-01-16T14:00:00Z',
    source: 'afcb.co.uk',
    status: 'confirmed'
  },
  {
    id: 'bournemouth-huijsen-2025',
    playerName: 'Dean Huijsen',
    fromClub: 'Bournemouth',
    toClub: 'Real Madrid',
    fee: '£18M',
    date: '2025-01-13T10:30:00Z',
    source: 'afcb.co.uk',
    status: 'confirmed'
  },
  {
    id: 'bournemouth-anthony-2025',
    playerName: 'Jaidon Anthony',
    fromClub: 'Bournemouth',
    toClub: 'Burnley',
    fee: '£6M',
    date: '2025-01-12T15:45:00Z',
    source: 'afcb.co.uk',
    status: 'confirmed'
  },
  {
    id: 'bournemouth-kepa-2025',
    playerName: 'Kepa Arrizabalaga',
    fromClub: 'Bournemouth',
    toClub: 'Chelsea',
    fee: 'End of loan',
    date: '2025-01-10T11:15:00Z',
    source: 'afcb.co.uk',
    status: 'confirmed'
  },
  {
    id: 'bournemouth-truffert-2025',
    playerName: 'Adrien Truffert',
    fromClub: 'Rennes',
    toClub: 'Bournemouth',
    fee: '£10M',
    date: '2025-01-08T13:20:00Z',
    source: 'afcb.co.uk',
    status: 'confirmed'
  },
  {
    id: 'bournemouth-jebbison-2025',
    playerName: 'Daniel Jebbison',
    fromClub: 'Bournemouth',
    toClub: 'Preston',
    fee: 'Loan',
    date: '2025-01-07T17:00:00Z',
    source: 'afcb.co.uk',
    status: 'confirmed'
  },
  {
    id: 'bournemouth-aarons-2025',
    playerName: 'Max Aarons',
    fromClub: 'Bournemouth',
    toClub: 'Rangers',
    fee: 'Loan',
    date: '2025-01-06T12:45:00Z',
    source: 'afcb.co.uk',
    status: 'confirmed'
  },

  // Brentford
  {
    id: 'brentford-kayode-2025',
    playerName: 'Michael Kayode',
    fromClub: 'Fiorentina',
    toClub: 'Brentford',
    fee: '£8M',
    date: '2025-01-15T14:30:00Z',
    source: 'brentfordfc.com',
    status: 'confirmed'
  },
  {
    id: 'brentford-donovan-2025',
    playerName: 'Romelle Donovan',
    fromClub: 'Birmingham City',
    toClub: 'Brentford',
    fee: '£2M',
    date: '2025-01-14T10:00:00Z',
    source: 'brentfordfc.com',
    status: 'confirmed'
  },
  {
    id: 'brentford-kelleher-2025',
    playerName: 'Caoimhin Kelleher',
    fromClub: 'Liverpool',
    toClub: 'Brentford',
    fee: '£25M',
    date: '2025-01-12T16:00:00Z',
    source: 'brentfordfc.com',
    status: 'confirmed'
  },
  {
    id: 'brentford-flekken-2025',
    playerName: 'Mark Flekken',
    fromClub: 'Brentford',
    toClub: 'Bayer Leverkusen',
    fee: '£15M',
    date: '2025-01-10T13:15:00Z',
    source: 'brentfordfc.com',
    status: 'confirmed'
  },
  {
    id: 'brentford-mee-2025',
    playerName: 'Ben Mee',
    fromClub: 'Brentford',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-08T10:00:00Z',
    source: 'brentfordfc.com',
    status: 'confirmed'
  },
  {
    id: 'brentford-winterbottom-2025',
    playerName: 'Ben Winterbottom',
    fromClub: 'Brentford',
    toClub: 'Barrow',
    fee: 'Released',
    date: '2025-01-08T10:00:00Z',
    source: 'brentfordfc.com',
    status: 'confirmed'
  },

  // Brighton
  {
    id: 'brighton-watson-2025',
    playerName: 'Tommy Watson',
    fromClub: 'Sunderland',
    toClub: 'Brighton & Hove Albion',
    fee: '£4M',
    date: '2025-01-16T11:00:00Z',
    source: 'brightonandhovealbion.com',
    status: 'confirmed'
  },
  {
    id: 'brighton-yun-2025',
    playerName: 'Yun Do-young',
    fromClub: 'Daejon Hana Citizen',
    toClub: 'Brighton & Hove Albion',
    fee: '£2M',
    date: '2025-01-14T15:30:00Z',
    source: 'brightonandhovealbion.com',
    status: 'confirmed'
  },
  {
    id: 'brighton-kostoulas-2025',
    playerName: 'Charalampos Kostoulas',
    fromClub: 'Olympiacos',
    toClub: 'Brighton & Hove Albion',
    fee: '£6M',
    date: '2025-01-13T12:45:00Z',
    source: 'brightonandhovealbion.com',
    status: 'confirmed'
  },
  {
    id: 'brighton-coppola-2025',
    playerName: 'Diego Coppola',
    fromClub: 'Verona',
    toClub: 'Brighton & Hove Albion',
    fee: '£8M',
    date: '2025-01-11T14:20:00Z',
    source: 'brightonandhovealbion.com',
    status: 'confirmed'
  },

  // Burnley
  {
    id: 'burnley-humphreys-2025',
    playerName: 'Bashir Humphreys',
    fromClub: 'Chelsea',
    toClub: 'Burnley',
    fee: '£5M',
    date: '2025-01-15T16:00:00Z',
    source: 'burnleyfc.com',
    status: 'confirmed'
  },
  {
    id: 'burnley-anthony-2025',
    playerName: 'Jaidon Anthony',
    fromClub: 'Bournemouth',
    toClub: 'Burnley',
    fee: '£6M',
    date: '2025-01-12T15:45:00Z',
    source: 'burnleyfc.com',
    status: 'confirmed'
  },
  {
    id: 'burnley-edwards-2025',
    playerName: 'Marcus Edwards',
    fromClub: 'Sporting CP',
    toClub: 'Burnley',
    fee: '£12M',
    date: '2025-01-10T13:30:00Z',
    source: 'burnleyfc.com',
    status: 'confirmed'
  },
  {
    id: 'burnley-flemming-2025',
    playerName: 'Zian Flemming',
    fromClub: 'Millwall',
    toClub: 'Burnley',
    fee: '£3M',
    date: '2025-01-08T11:15:00Z',
    source: 'burnleyfc.com',
    status: 'confirmed'
  },
  {
    id: 'burnley-weiss-2025',
    playerName: 'Max Weiss',
    fromClub: 'Karlsruher SC',
    toClub: 'Burnley',
    fee: '£1.5M',
    date: '2025-01-06T14:45:00Z',
    source: 'burnleyfc.com',
    status: 'confirmed'
  },
  {
    id: 'burnley-redmond-2025',
    playerName: 'Nathan Redmond',
    fromClub: 'Burnley',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-05T10:00:00Z',
    source: 'burnleyfc.com',
    status: 'confirmed'
  },
  {
    id: 'burnley-shelvey-2025',
    playerName: 'Jonjo Shelvey',
    fromClub: 'Burnley',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-05T10:00:00Z',
    source: 'burnleyfc.com',
    status: 'confirmed'
  },
  {
    id: 'burnley-sarmiento-2025',
    playerName: 'Jeremy Sarmiento',
    fromClub: 'Burnley',
    toClub: 'Brighton & Hove Albion',
    fee: 'End of loan',
    date: '2025-01-05T10:00:00Z',
    source: 'burnleyfc.com',
    status: 'confirmed'
  },
  {
    id: 'burnley-egan-riley-2025',
    playerName: 'CJ Egan-Riley',
    fromClub: 'Burnley',
    toClub: 'Marseille',
    fee: 'Released',
    date: '2025-01-05T10:00:00Z',
    source: 'burnleyfc.com',
    status: 'confirmed'
  },

  // Chelsea
  {
    id: 'chelsea-essugo-2025',
    playerName: 'Dario Essugo',
    fromClub: 'Sporting CP',
    toClub: 'Chelsea',
    fee: '£15M',
    date: '2025-01-16T12:00:00Z',
    source: 'chelseafc.com',
    status: 'confirmed'
  },
  {
    id: 'chelsea-estevao-2025',
    playerName: 'Estevao Willian',
    fromClub: 'Palmeiras',
    toClub: 'Chelsea',
    fee: '£35M',
    date: '2025-01-14T16:30:00Z',
    source: 'chelseafc.com',
    status: 'confirmed'
  },
  {
    id: 'chelsea-delap-2025',
    playerName: 'Liam Delap',
    fromClub: 'Ipswich Town',
    toClub: 'Chelsea',
    fee: '£20M',
    date: '2025-01-12T14:15:00Z',
    source: 'chelseafc.com',
    status: 'confirmed'
  },
  {
    id: 'chelsea-sarr-2025',
    playerName: 'Mamadou Sarr',
    fromClub: 'RC Strasbourg',
    toClub: 'Chelsea',
    fee: '£8M',
    date: '2025-01-10T11:45:00Z',
    source: 'chelseafc.com',
    status: 'confirmed'
  },
  {
    id: 'chelsea-bettinelli-2025',
    playerName: 'Marcus Bettinelli',
    fromClub: 'Chelsea',
    toClub: 'Manchester City',
    fee: 'Free Transfer',
    date: '2025-01-08T10:30:00Z',
    source: 'chelseafc.com',
    status: 'confirmed'
  },

  // Crystal Palace
  {
    id: 'palace-benitez-2025',
    playerName: 'Walter Benitez',
    fromClub: 'PSV Eindhoven',
    toClub: 'Crystal Palace',
    fee: '£10M',
    date: '2025-01-15T13:20:00Z',
    source: 'cpfc.co.uk',
    status: 'confirmed'
  },
  {
    id: 'palace-ward-2025',
    playerName: 'Joel Ward',
    fromClub: 'Crystal Palace',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-12T10:00:00Z',
    source: 'cpfc.co.uk',
    status: 'confirmed'
  },
  {
    id: 'palace-schlupp-2025',
    playerName: 'Jeffrey Schlupp',
    fromClub: 'Crystal Palace',
    toClub: 'Celtic',
    fee: 'Released',
    date: '2025-01-12T10:00:00Z',
    source: 'cpfc.co.uk',
    status: 'confirmed'
  },
  {
    id: 'palace-moulden-2025',
    playerName: 'Louie Moulden',
    fromClub: 'Crystal Palace',
    toClub: 'Norwich',
    fee: 'Released',
    date: '2025-01-12T10:00:00Z',
    source: 'cpfc.co.uk',
    status: 'confirmed'
  },

  // Everton
  {
    id: 'everton-alcaraz-2025',
    playerName: 'Charly Alcaraz',
    fromClub: 'Flamengo',
    toClub: 'Everton',
    fee: '£7M',
    date: '2025-01-13T15:00:00Z',
    source: 'evertonfc.com',
    status: 'confirmed'
  },
  {
    id: 'everton-young-2025',
    playerName: 'Ashley Young',
    fromClub: 'Everton',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-10T10:00:00Z',
    source: 'evertonfc.com',
    status: 'confirmed'
  },
  {
    id: 'everton-begovic-2025',
    playerName: 'Asmir Begovic',
    fromClub: 'Everton',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-10T10:00:00Z',
    source: 'evertonfc.com',
    status: 'confirmed'
  },
  {
    id: 'everton-virginia-2025',
    playerName: 'Joao Virginia',
    fromClub: 'Everton',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-10T10:00:00Z',
    source: 'evertonfc.com',
    status: 'confirmed'
  },
  {
    id: 'everton-doucoure-2025',
    playerName: 'Abdoulaye Doucoure',
    fromClub: 'Everton',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-10T10:00:00Z',
    source: 'evertonfc.com',
    status: 'confirmed'
  },
  {
    id: 'everton-harrison-2025',
    playerName: 'Jack Harrison',
    fromClub: 'Everton',
    toClub: 'Leeds United',
    fee: 'End of loan',
    date: '2025-01-10T10:00:00Z',
    source: 'evertonfc.com',
    status: 'confirmed'
  },
  {
    id: 'everton-lindstrom-2025',
    playerName: 'Jesper Lindstrom',
    fromClub: 'Everton',
    toClub: 'Napoli',
    fee: 'End of loan',
    date: '2025-01-10T10:00:00Z',
    source: 'evertonfc.com',
    status: 'confirmed'
  },
  {
    id: 'everton-mangala-2025',
    playerName: 'Orel Mangala',
    fromClub: 'Everton',
    toClub: 'Lyon',
    fee: 'End of loan',
    date: '2025-01-10T10:00:00Z',
    source: 'evertonfc.com',
    status: 'confirmed'
  },
  {
    id: 'everton-broja-2025',
    playerName: 'Armando Broja',
    fromClub: 'Everton',
    toClub: 'Chelsea',
    fee: 'End of loan',
    date: '2025-01-10T10:00:00Z',
    source: 'evertonfc.com',
    status: 'confirmed'
  },
  {
    id: 'everton-holgate-2025',
    playerName: 'Mason Holgate',
    fromClub: 'Everton',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-10T10:00:00Z',
    source: 'evertonfc.com',
    status: 'confirmed'
  },
  {
    id: 'everton-maupay-2025',
    playerName: 'Neal Maupay',
    fromClub: 'Everton',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-10T10:00:00Z',
    source: 'evertonfc.com',
    status: 'confirmed'
  },

  // Fulham
  {
    id: 'fulham-vinicius-2025',
    playerName: 'Carlos Vinicius',
    fromClub: 'Fulham',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-08T10:00:00Z',
    source: 'fulhamfc.com',
    status: 'confirmed'
  },
  {
    id: 'fulham-willian-2025',
    playerName: 'Willian',
    fromClub: 'Fulham',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-08T10:00:00Z',
    source: 'fulhamfc.com',
    status: 'confirmed'
  },
  {
    id: 'fulham-ashby-hammond-2025',
    playerName: 'Luca Ashby-Hammond',
    fromClub: 'Fulham',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-08T10:00:00Z',
    source: 'fulhamfc.com',
    status: 'confirmed'
  },

  // Leeds United
  {
    id: 'leeds-nmecha-2025',
    playerName: 'Lukas Nmecha',
    fromClub: 'VfL Wolfsburg',
    toClub: 'Leeds United',
    fee: '£8M',
    date: '2025-01-16T14:00:00Z',
    source: 'leedsunited.com',
    status: 'confirmed'
  },
  {
    id: 'leeds-bijol-2025',
    playerName: 'Jaka Bijol',
    fromClub: 'Udinese',
    toClub: 'Leeds United',
    fee: '£15M',
    date: '2025-01-14T12:30:00Z',
    source: 'leedsunited.com',
    status: 'confirmed'
  },
  {
    id: 'leeds-guilavogui-2025',
    playerName: 'Josuha Guilavogui',
    fromClub: 'Leeds United',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-10T10:00:00Z',
    source: 'leedsunited.com',
    status: 'confirmed'
  },
  {
    id: 'leeds-rothwell-2025',
    playerName: 'Joe Rothwell',
    fromClub: 'Leeds United',
    toClub: 'Bournemouth',
    fee: 'End of loan',
    date: '2025-01-10T10:00:00Z',
    source: 'leedsunited.com',
    status: 'confirmed'
  },
  {
    id: 'leeds-solomon-2025',
    playerName: 'Manor Solomon',
    fromClub: 'Leeds United',
    toClub: 'Tottenham Hotspur',
    fee: 'End of loan',
    date: '2025-01-10T10:00:00Z',
    source: 'leedsunited.com',
    status: 'confirmed'
  },
  {
    id: 'leeds-snowdon-2025',
    playerName: 'Joe Snowdon',
    fromClub: 'Leeds United',
    toClub: 'Swindon',
    fee: 'Released',
    date: '2025-01-10T10:00:00Z',
    source: 'leedsunited.com',
    status: 'confirmed'
  },

  // Liverpool
  {
    id: 'liverpool-mamardashvili-2025',
    playerName: 'Giorgi Mamardashvili',
    fromClub: 'Valencia',
    toClub: 'Liverpool',
    fee: '£35M',
    date: '2025-01-16T16:00:00Z',
    source: 'liverpoolfc.com',
    status: 'confirmed'
  },
  {
    id: 'liverpool-alexander-arnold-2025',
    playerName: 'Trent Alexander-Arnold',
    fromClub: 'Liverpool',
    toClub: 'Real Madrid',
    fee: '£50M',
    date: '2025-01-15T13:45:00Z',
    source: 'liverpoolfc.com',
    status: 'confirmed'
  },
  {
    id: 'liverpool-frimpong-2025',
    playerName: 'Jeremie Frimpong',
    fromClub: 'Bayer Leverkusen',
    toClub: 'Liverpool',
    fee: '£40M',
    date: '2025-01-13T15:20:00Z',
    source: 'liverpoolfc.com',
    status: 'confirmed'
  },
  {
    id: 'liverpool-pecsi-2025',
    playerName: 'Armin Pecsi',
    fromClub: 'Puskas Akademia',
    toClub: 'Liverpool',
    fee: '£2M',
    date: '2025-01-11T11:30:00Z',
    source: 'liverpoolfc.com',
    status: 'confirmed'
  },
  {
    id: 'liverpool-wirtz-2025',
    playerName: 'Florian Wirtz',
    fromClub: 'Bayer Leverkusen',
    toClub: 'Liverpool',
    fee: '£80M',
    date: '2025-01-09T17:00:00Z',
    source: 'liverpoolfc.com',
    status: 'confirmed'
  },
  {
    id: 'liverpool-phillips-2025',
    playerName: 'Nathaniel Phillips',
    fromClub: 'Liverpool',
    toClub: 'West Bromwich Albion',
    fee: '£3M',
    date: '2025-01-07T14:15:00Z',
    source: 'liverpoolfc.com',
    status: 'confirmed'
  },
  {
    id: 'liverpool-corness-2025',
    playerName: 'Dominic Corness',
    fromClub: 'Liverpool',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-05T10:00:00Z',
    source: 'liverpoolfc.com',
    status: 'confirmed'
  },
  {
    id: 'liverpool-ojrzynski-2025',
    playerName: 'Jakub Ojrzynski',
    fromClub: 'Liverpool',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-05T10:00:00Z',
    source: 'liverpoolfc.com',
    status: 'confirmed'
  },
  {
    id: 'liverpool-jaros-2025',
    playerName: 'Vitezslav Jaros',
    fromClub: 'Liverpool',
    toClub: 'Ajax',
    fee: 'Loan',
    date: '2025-01-05T10:00:00Z',
    source: 'liverpoolfc.com',
    status: 'confirmed'
  },
  {
    id: 'liverpool-davies-2025',
    playerName: 'Harvey Davies',
    fromClub: 'Liverpool',
    toClub: 'Crawley',
    fee: 'Loan',
    date: '2025-01-05T10:00:00Z',
    source: 'liverpoolfc.com',
    status: 'confirmed'
  },

  // Manchester City
  {
    id: 'city-de-bruyne-2025',
    playerName: 'Kevin De Bruyne',
    fromClub: 'Manchester City',
    toClub: 'Napoli',
    fee: '£30M',
    date: '2025-01-16T15:30:00Z',
    source: 'mancity.com',
    status: 'confirmed'
  },
  {
    id: 'city-ait-nouri-2025',
    playerName: 'Rayan Ait-Nouri',
    fromClub: 'Wolverhampton Wanderers',
    toClub: 'Manchester City',
    fee: '£25M',
    date: '2025-01-14T13:45:00Z',
    source: 'mancity.com',
    status: 'confirmed'
  },
  {
    id: 'city-bettinelli-2025',
    playerName: 'Marcus Bettinelli',
    fromClub: 'Chelsea',
    toClub: 'Manchester City',
    fee: 'Free Transfer',
    date: '2025-01-12T10:20:00Z',
    source: 'mancity.com',
    status: 'confirmed'
  },
  {
    id: 'city-cherki-2025',
    playerName: 'Rayan Cherki',
    fromClub: 'Lyon',
    toClub: 'Manchester City',
    fee: '£20M',
    date: '2025-01-10T16:45:00Z',
    source: 'mancity.com',
    status: 'confirmed'
  },
  {
    id: 'city-reijnders-2025',
    playerName: 'Tijjani Reijnders',
    fromClub: 'AC Milan',
    toClub: 'Manchester City',
    fee: '£45M',
    date: '2025-01-08T14:30:00Z',
    source: 'mancity.com',
    status: 'confirmed'
  },
  {
    id: 'city-wright-2025',
    playerName: 'Jacob Wright',
    fromClub: 'Manchester City',
    toClub: 'Norwich City',
    fee: '£2M',
    date: '2025-01-06T10:00:00Z',
    source: 'mancity.com',
    status: 'confirmed'
  },
  {
    id: 'city-carson-2025',
    playerName: 'Scott Carson',
    fromClub: 'Manchester City',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-05T10:00:00Z',
    source: 'mancity.com',
    status: 'confirmed'
  },

  // Manchester United
  {
    id: 'united-cunha-2025',
    playerName: 'Matheus Cunha',
    fromClub: 'Wolverhampton Wanderers',
    toClub: 'Manchester United',
    fee: '£35M',
    date: '2025-01-15T12:15:00Z',
    source: 'manutd.com',
    status: 'confirmed'
  },
  {
    id: 'united-eriksen-2025',
    playerName: 'Christian Eriksen',
    fromClub: 'Manchester United',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-08T10:00:00Z',
    source: 'manutd.com',
    status: 'confirmed'
  },
  {
    id: 'united-evans-2025',
    playerName: 'Jonny Evans',
    fromClub: 'Manchester United',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-08T10:00:00Z',
    source: 'manutd.com',
    status: 'confirmed'
  },
  {
    id: 'united-lindelof-2025',
    playerName: 'Victor Lindelof',
    fromClub: 'Manchester United',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-08T10:00:00Z',
    source: 'manutd.com',
    status: 'confirmed'
  },

  // Newcastle United
  {
    id: 'newcastle-cordero-2025',
    playerName: 'Antonio Cordero',
    fromClub: 'Malaga',
    toClub: 'Newcastle United',
    fee: '£3M',
    date: '2025-01-14T11:40:00Z',
    source: 'nufc.co.uk',
    status: 'confirmed'
  },
  {
    id: 'newcastle-kelly-2025',
    playerName: 'Lloyd Kelly',
    fromClub: 'Newcastle United',
    toClub: 'Juventus',
    fee: '£12M',
    date: '2025-01-12T16:20:00Z',
    source: 'nufc.co.uk',
    status: 'confirmed'
  },
  {
    id: 'newcastle-lewis-2025',
    playerName: 'Jamal Lewis',
    fromClub: 'Newcastle United',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-10T10:00:00Z',
    source: 'nufc.co.uk',
    status: 'confirmed'
  },

  // Nottingham Forest
  {
    id: 'forest-perkins-2025',
    playerName: 'Jack Perkins',
    fromClub: 'Nottingham Forest',
    toClub: 'Northampton Town',
    fee: '£500K',
    date: '2025-01-13T10:45:00Z',
    source: 'nottinghamforest.co.uk',
    status: 'confirmed'
  },
  {
    id: 'forest-omobamidele-2025',
    playerName: 'Andrew Omobamidele',
    fromClub: 'Nottingham Forest',
    toClub: 'Strasbourg',
    fee: '£4M',
    date: '2025-01-11T15:30:00Z',
    source: 'nottinghamforest.co.uk',
    status: 'confirmed'
  },
  {
    id: 'forest-toffolo-2025',
    playerName: 'Harry Toffolo',
    fromClub: 'Nottingham Forest',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-08T10:00:00Z',
    source: 'nottinghamforest.co.uk',
    status: 'confirmed'
  },
  {
    id: 'forest-moreno-2025',
    playerName: 'Alex Moreno',
    fromClub: 'Nottingham Forest',
    toClub: 'Aston Villa',
    fee: 'End of loan',
    date: '2025-01-08T10:00:00Z',
    source: 'nottinghamforest.co.uk',
    status: 'confirmed'
  },

  // Sunderland
  {
    id: 'sunderland-lee-fee-2025',
    playerName: 'Enzo Le Fee',
    fromClub: 'Roma',
    toClub: 'Sunderland',
    fee: '£8M',
    date: '2025-01-15T14:50:00Z',
    source: 'safc.com',
    status: 'confirmed'
  },
  {
    id: 'sunderland-bellingham-2025',
    playerName: 'Jobe Bellingham',
    fromClub: 'Sunderland',
    toClub: 'Borussia Dortmund',
    fee: '£25M',
    date: '2025-01-13T12:00:00Z',
    source: 'safc.com',
    status: 'confirmed'
  },

  // Tottenham
  {
    id: 'spurs-vuskovic-2025',
    playerName: 'Luka Vuskovic',
    fromClub: 'Hajduk Split',
    toClub: 'Tottenham Hotspur',
    fee: '£5M',
    date: '2025-01-16T13:25:00Z',
    source: 'tottenhamhotspur.com',
    status: 'confirmed'
  },
  {
    id: 'spurs-hojbjerg-2025',
    playerName: 'Pierre-Emile Hojbjerg',
    fromClub: 'Tottenham Hotspur',
    toClub: 'Marseille',
    fee: '£15M',
    date: '2025-01-14T16:10:00Z',
    source: 'tottenhamhotspur.com',
    status: 'confirmed'
  },
  {
    id: 'spurs-danso-2025',
    playerName: 'Kevin Danso',
    fromClub: 'RC Lens',
    toClub: 'Tottenham Hotspur',
    fee: '£18M',
    date: '2025-01-12T11:35:00Z',
    source: 'tottenhamhotspur.com',
    status: 'confirmed'
  },
  {
    id: 'spurs-tel-2025',
    playerName: 'Mathys Tel',
    fromClub: 'Bayern Munich',
    toClub: 'Tottenham Hotspur',
    fee: '£25M',
    date: '2025-01-10T15:45:00Z',
    source: 'tottenhamhotspur.com',
    status: 'confirmed'
  },
  {
    id: 'spurs-forster-2025',
    playerName: 'Fraser Forster',
    fromClub: 'Tottenham Hotspur',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-08T10:00:00Z',
    source: 'tottenhamhotspur.com',
    status: 'confirmed'
  },
  {
    id: 'spurs-reguilon-2025',
    playerName: 'Sergio Reguilon',
    fromClub: 'Tottenham Hotspur',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-08T10:00:00Z',
    source: 'tottenhamhotspur.com',
    status: 'confirmed'
  },
  {
    id: 'spurs-whiteman-2025',
    playerName: 'Alfie Whiteman',
    fromClub: 'Tottenham Hotspur',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-08T10:00:00Z',
    source: 'tottenhamhotspur.com',
    status: 'confirmed'
  },
  {
    id: 'spurs-werner-2025',
    playerName: 'Timo Werner',
    fromClub: 'Tottenham Hotspur',
    toClub: 'RB Leipzig',
    fee: 'End of loan',
    date: '2025-01-08T10:00:00Z',
    source: 'tottenhamhotspur.com',
    status: 'confirmed'
  },
  {
    id: 'spurs-ajayi-2025',
    playerName: 'Damola Ajayi',
    fromClub: 'Tottenham Hotspur',
    toClub: 'Doncaster Rovers',
    fee: 'Loan',
    date: '2025-01-08T10:00:00Z',
    source: 'tottenhamhotspur.com',
    status: 'confirmed'
  },

  // West Ham
  {
    id: 'westham-todibo-2025',
    playerName: 'Jean-Clair Todibo',
    fromClub: 'OGC Nice',
    toClub: 'West Ham United',
    fee: '£30M',
    date: '2025-01-15T17:00:00Z',
    source: 'whufc.com',
    status: 'confirmed'
  },
  {
    id: 'westham-cresswell-2025',
    playerName: 'Aaron Cresswell',
    fromClub: 'West Ham United',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-10T10:00:00Z',
    source: 'whufc.com',
    status: 'confirmed'
  },
  {
    id: 'westham-fabianski-2025',
    playerName: 'Lukasz Fabianski',
    fromClub: 'West Ham United',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-10T10:00:00Z',
    source: 'whufc.com',
    status: 'confirmed'
  },
  {
    id: 'westham-coufal-2025',
    playerName: 'Vladimir Coufal',
    fromClub: 'West Ham United',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-10T10:00:00Z',
    source: 'whufc.com',
    status: 'confirmed'
  },
  {
    id: 'westham-ings-2025',
    playerName: 'Danny Ings',
    fromClub: 'West Ham United',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-10T10:00:00Z',
    source: 'whufc.com',
    status: 'confirmed'
  },
  {
    id: 'westham-swyer-2025',
    playerName: 'Kamarai Swyer',
    fromClub: 'West Ham United',
    toClub: 'Northampton Town',
    fee: 'Released',
    date: '2025-01-10T10:00:00Z',
    source: 'whufc.com',
    status: 'confirmed'
  },
  {
    id: 'westham-soler-2025',
    playerName: 'Carlos Soler',
    fromClub: 'West Ham United',
    toClub: 'PSG',
    fee: 'End of loan',
    date: '2025-01-10T10:00:00Z',
    source: 'whufc.com',
    status: 'confirmed'
  },
  {
    id: 'westham-ferguson-2025',
    playerName: 'Evan Ferguson',
    fromClub: 'West Ham United',
    toClub: 'Brighton & Hove Albion',
    fee: 'End of loan',
    date: '2025-01-10T10:00:00Z',
    source: 'whufc.com',
    status: 'confirmed'
  },
  {
    id: 'westham-zouma-2025',
    playerName: 'Kurt Zouma',
    fromClub: 'West Ham United',
    toClub: 'Al-Orobah',
    fee: 'Released',
    date: '2025-01-10T10:00:00Z',
    source: 'whufc.com',
    status: 'confirmed'
  },
  {
    id: 'westham-dolaghan-2025',
    playerName: 'Brad Dolaghan',
    fromClub: 'West Ham United',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-10T10:00:00Z',
    source: 'whufc.com',
    status: 'confirmed'
  },

  // Wolverhampton Wanderers  
  {
    id: 'wolves-lopez-2025',
    playerName: 'Fer Lopez',
    fromClub: 'Celta Vigo',
    toClub: 'Wolverhampton Wanderers',
    fee: '£6M',
    date: '2025-01-13T14:20:00Z',
    source: 'wolves.co.uk',
    status: 'confirmed'
  },
  {
    id: 'wolves-sarabia-2025',
    playerName: 'Pablo Sarabia',
    fromClub: 'Wolverhampton Wanderers',
    toClub: 'Al-Arabi',
    fee: 'Released',
    date: '2025-01-10T10:00:00Z',
    source: 'wolves.co.uk',
    status: 'confirmed'
  },
  {
    id: 'wolves-dawson-2025',
    playerName: 'Craig Dawson',
    fromClub: 'Wolverhampton Wanderers',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-10T10:00:00Z',
    source: 'wolves.co.uk',
    status: 'confirmed'
  },
  {
    id: 'wolves-forbs-2025',
    playerName: 'Carlos Forbs',
    fromClub: 'Wolverhampton Wanderers',
    toClub: 'Ajax',
    fee: 'End of loan',
    date: '2025-01-10T10:00:00Z',
    source: 'wolves.co.uk',
    status: 'confirmed'
  },
  {
    id: 'wolves-whittingham-2025',
    playerName: 'Matty Whittingham',
    fromClub: 'Wolverhampton Wanderers',
    toClub: 'Free Agent',
    fee: 'Released',
    date: '2025-01-10T10:00:00Z',
    source: 'wolves.co.uk',
    status: 'confirmed'
  },
  {
    id: 'wolves-bueno-2025',
    playerName: 'Hugo Bueno',
    fromClub: 'Wolverhampton Wanderers',
    toClub: 'Feyenoord',
    fee: 'End of loan',
    date: '2025-01-10T10:00:00Z',
    source: 'wolves.co.uk',
    status: 'confirmed'
  },
  {
    id: 'wolves-campbell-2025',
    playerName: 'Chem Campbell',
    fromClub: 'Wolverhampton Wanderers',
    toClub: 'Free Agent',
    fee: 'Transfer Out',
    date: '2025-01-10T10:00:00Z',
    source: 'wolves.co.uk',
    status: 'confirmed'
  }
];

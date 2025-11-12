import { Transfer } from '@/types/transfer';

export interface TransferEntry {
  player: string;
  transferType: 'Transfer In' | 'Transfer Out' | 'Loan In' | 'Loan Out' | 'Released' | 'End of loan';
  club: string;
}

export const TEAMS_TRANSFER_DATA: Record<string, TransferEntry[]> = {
  'Arsenal': [
    // TRANSFERS OUT - RELEASED
    { player: 'Jorginho', transferType: 'Released', club: 'Flamengo' },
    { player: 'Nathan Butler-Oyedeji', transferType: 'Released', club: 'Lausanne' },
    { player: 'Elian Quesada-Thorn', transferType: 'Released', club: 'Alajuelense' },
    { player: 'Kieran Tierney', transferType: 'Released', club: 'Celtic' },
    { player: 'Takehiro Tomiyasu', transferType: 'Released', club: '-' },
    // TRANSFERS OUT - END OF LOAN
    { player: 'Raheem Sterling', transferType: 'End of loan', club: 'Chelsea' },
    { player: 'Neto', transferType: 'End of loan', club: 'Bournemouth' },
    // TRANSFERS OUT
    { player: 'Nuno Tavares', transferType: 'Transfer Out', club: 'Lazio' },
    { player: 'Marquinhos', transferType: 'Transfer Out', club: 'Cruzeiro' },
    { player: 'Sambi Lokonga', transferType: 'Transfer Out', club: 'Hamburger SV' },
    // TRANSFERS IN
    { player: 'Kepa Arrizabalaga', transferType: 'Transfer In', club: 'Chelsea' },
    { player: 'Martin Zubimendi', transferType: 'Transfer In', club: 'Real Sociedad' },
    { player: 'Christian Norgaard', transferType: 'Transfer In', club: 'Brentford' },
    { player: 'Noni Madueke', transferType: 'Transfer In', club: 'Chelsea' },
    { player: 'Cristhian Mosquera', transferType: 'Transfer In', club: 'Valencia' },
    { player: 'Viktor Gyokeres', transferType: 'Transfer In', club: 'Sporting' },
    { player: 'Eberechi Eze', transferType: 'Transfer In', club: 'Crystal Palace' },
    // LOANS OUT
    { player: 'Karl Hein', transferType: 'Loan Out', club: 'Werder Bremen' },
    { player: 'Ismeal Kabia', transferType: 'Loan Out', club: 'Shrewsbury Town' },
    { player: 'Lucas Martin Nygaard', transferType: 'Loan Out', club: 'Brabrand IF' },
    { player: 'Fabio Vieira', transferType: 'Loan Out', club: 'Hamburger SV' },
    { player: 'Jakub Kiwior', transferType: 'Loan Out', club: 'Porto' },
    { player: 'Oleksandr Zinchenko', transferType: 'Loan Out', club: 'Nottingham Forest' },
    { player: 'Reiss Nelson', transferType: 'Loan Out', club: 'Brentford' },
    { player: 'Maldini Kacurri', transferType: 'Loan Out', club: 'Morecambe' },
    // LOANS IN
    { player: 'Piero Hincapie', transferType: 'Loan In', club: 'Bayer Leverkusen' }
  ],
  'Aston Villa': [
    { player: 'Yasin Ozcan', transferType: 'Transfer In', club: 'Kasimpasa' },
    { player: 'Robin Olsen', transferType: 'Released', club: 'Malmo' },
    { player: 'Josh Feeney', transferType: 'Loan Out', club: 'Huddersfield' },
    { player: 'Rico Richards', transferType: 'Transfer Out', club: 'Port Vale' },
    { player: 'Kortney Hause', transferType: 'Released', club: '-' },
    { player: 'Marcus Rashford', transferType: 'End of loan', club: 'Man Utd' },
    { player: 'Marco Asensio', transferType: 'End of loan', club: 'PSG' },
    { player: 'Axel Disasi', transferType: 'End of loan', club: 'Chelsea' },
    { player: 'Hesler Hayden', transferType: 'Transfer Out', club: 'Coventry' },
    { player: 'Zepiqueno Redmond', transferType: 'Transfer In', club: 'Feyenoord' },
    { player: 'Philippe Coutinho', transferType: 'Transfer Out', club: 'Vasco da Gama' },
    { player: 'Kosta Nedelkovic', transferType: 'Loan Out', club: 'RB Leipzig' },
    { player: 'Oliwier Zych', transferType: 'Loan Out', club: 'Rakow Czestochowa' },
    { player: 'Finley Munroe', transferType: 'Loan Out', club: 'Swindon' },
    { player: 'Tommi O\'Reilly', transferType: 'Loan Out', club: 'Crewe' },
    { player: 'Sil Swinkels', transferType: 'Loan Out', club: 'Exeter City' },
    { player: 'Marco Bizot', transferType: 'Transfer In', club: 'Brest' },
    { player: 'Enzo Barrenechea', transferType: 'Loan Out', club: 'Benfica' },
    { player: 'Modou Keba Cisse', transferType: 'Transfer In', club: 'LASK' },
    { player: 'Kyrie Pierre', transferType: 'Transfer Out', club: 'Brentford' },
    { player: 'Louie Barry', transferType: 'Loan Out', club: 'Sheffield United' },
    { player: 'Filip Marschall', transferType: 'Transfer Out', club: 'Stevenage' },
    { player: 'Ethan Amundsen-Day', transferType: 'Transfer Out', club: 'Hamarkameratene' },
    { player: 'Yasin Ozcan', transferType: 'Loan Out', club: 'Anderlecht' },
    { player: 'Evann Guessand', transferType: 'Transfer In', club: 'Nice' },
    { player: 'Joe Gauci', transferType: 'Loan Out', club: 'Port Vale' },
    { player: 'Kerr Smith', transferType: 'Loan Out', club: 'Barrow' },
    { player: 'Jacob Ramsey', transferType: 'Transfer Out', club: 'Newcastle' },
    { player: 'Leander Dendoncker', transferType: 'Transfer Out', club: 'Real Oviedo' },
    { player: 'Leon Bailey', transferType: 'Loan Out', club: 'AS Roma' },
    { player: 'Lewis Dobbin', transferType: 'Loan Out', club: 'Preston North End' },
    { player: 'Alex Moreno', transferType: 'Transfer Out', club: 'Girona' }
  ],
  'Bournemouth': [
    { player: 'Eli Junior Kroupi', transferType: 'Transfer In', club: 'Lorient' },
    { player: 'Dean Huijsen', transferType: 'Transfer Out', club: 'Real Madrid' },
    { player: 'Jaidon Anthony', transferType: 'Transfer Out', club: 'Burnley' },
    { player: 'Kepa Arrizabalaga', transferType: 'End of loan', club: 'Chelsea' },
    { player: 'Adrien Truffert', transferType: 'Transfer In', club: 'Rennes' },
    { player: 'Daniel Jebbison', transferType: 'Loan Out', club: 'Preston' },
    { player: 'Max Aarons', transferType: 'Loan Out', club: 'Rangers' },
    { player: 'Milos Kerkez', transferType: 'Transfer Out', club: 'Liverpool' },
    { player: 'Joe Rothwell', transferType: 'Transfer Out', club: 'Rangers' },
    { player: 'Mark Travers', transferType: 'Transfer Out', club: 'Everton' },
    { player: 'Djordje Petrovic', transferType: 'Transfer In', club: 'Chelsea' },
    { player: 'Neto', transferType: 'Transfer Out', club: 'Botafogo' },
    { player: 'Illia Zabarnyi', transferType: 'Transfer Out', club: 'Paris Saint-Germain' },
    { player: 'Bafode Diakite', transferType: 'Transfer In', club: 'Lille' },
    { player: 'Dango Ouattara', transferType: 'Transfer Out', club: 'Brentford' },
    { player: 'Ben Gannon-Doak', transferType: 'Transfer In', club: 'Liverpool' },
    { player: 'Amine Adli', transferType: 'Transfer In', club: 'Bayer Leverkusen' },
    { player: 'Luis Sinisterra', transferType: 'Loan Out', club: 'Cruzeiro' },
    { player: 'Philip Billing', transferType: 'Transfer Out', club: 'Midtjylland' }
  ],
  'Leeds United': [
    { player: 'Josuha Guilavogui', transferType: 'Released', club: '-' },
    { player: 'Joe Rothwell', transferType: 'End of loan', club: 'Bournemouth' },
    { player: 'Manor Solomon', transferType: 'End of loan', club: 'Spurs' },
    { player: 'Lukas Nmecha', transferType: 'Transfer In', club: 'Wolfsburg' },
    { player: 'Sebastiaan Bornauw', transferType: 'Transfer In', club: 'Wolfsburg' },
    { player: 'Joe Snowdon', transferType: 'Released', club: 'Swindon' },
    { player: 'Jaka Bijol', transferType: 'Transfer In', club: 'Udinese' },
    { player: 'Junior Firpo', transferType: 'Released', club: 'Real Betis' },
    { player: 'Max Wober', transferType: 'Loan Out', club: 'Werder Bremen' },
    { player: 'Max McFadden', transferType: 'Released', club: 'Spurs' },
    { player: 'Gabriel Gudmundsson', transferType: 'Transfer In', club: 'Lille' },
    { player: 'Louis Enahoro-Marcus', transferType: 'Transfer In', club: 'Liverpool' },
    { player: 'Sean Longstaff', transferType: 'Transfer In', club: 'Newcastle' },
    { player: 'Anton Stach', transferType: 'Transfer In', club: 'TSG Hoffenheim' },
    { player: 'Lucas Perri', transferType: 'Transfer In', club: 'Lyon' },
    { player: 'Mateo Joseph', transferType: 'Loan Out', club: 'RCD Mallorca' },
    { player: 'Joe Gelhardt', transferType: 'Loan Out', club: 'Hull City' },
    { player: 'Dominic Calvert-Lewin', transferType: 'Transfer In', club: 'Everton' },
    { player: 'Noah Okafor', transferType: 'Transfer In', club: 'AC Milan' },
    { player: 'James Justin', transferType: 'Transfer In', club: 'Leicester' }
  ],
  'Brentford': [
    { player: 'Ben Mee', transferType: 'Released', club: '-' },
    { player: 'Michael Kayode', transferType: 'Transfer In', club: 'Fiorentina' },
    { player: 'Ben Winterbottom', transferType: 'Released', club: 'Barrow' },
    { player: 'Romelle Donovan', transferType: 'Transfer In', club: 'Birmingham City' },
    { player: 'Caoimhin Kelleher', transferType: 'Transfer In', club: 'Liverpool' },
    { player: 'Mark Flekken', transferType: 'Transfer Out', club: 'Bayer Leverkusen' },
    { player: 'Tony Yogane', transferType: 'Loan Out', club: 'Dundee' },
    { player: 'Antoni Milambo', transferType: 'Transfer In', club: 'Feyenoord' },
    { player: 'Christian Norgaard', transferType: 'Transfer Out', club: 'Arsenal' },
    { player: 'Jordan Henderson', transferType: 'Transfer In', club: 'Ajax' },
    { player: 'Ben Krauhaus', transferType: 'Loan Out', club: 'Bromley' },
    { player: 'Kyrie Pierre', transferType: 'Transfer In', club: 'Aston Villa' },
    { player: 'Bryan Mbeumo', transferType: 'Transfer Out', club: 'Man Utd' },
    { player: 'Emeka Peters', transferType: 'Transfer Out', club: 'Feyenoord' },
    { player: 'Ji-soo Kim', transferType: 'Loan Out', club: 'Kaiserslautern' },
    { player: 'Benjamin Fredrick', transferType: 'Loan Out', club: 'Dender' },
    { player: 'Ryan Trevitt', transferType: 'Loan Out', club: 'Wigan Athletic' },
    { player: 'Dango Ouattara', transferType: 'Transfer In', club: 'AFC Bournemouth' },
    { player: 'Jayden Meghoma', transferType: 'Loan Out', club: 'Rangers' },
    { player: 'Mads Roerslev', transferType: 'Transfer Out', club: 'Southampton' }
  ],
  'Brighton & Hove Albion': [
    { player: 'Tommy Watson', transferType: 'Transfer In', club: 'Sunderland' },
    { player: 'Yun Do-young', transferType: 'Transfer In', club: 'Daejon Hana Citizen' },
    { player: 'Charalampos Kostoulas', transferType: 'Transfer In', club: 'Olympiacos' },
    { player: 'Diego Coppola', transferType: 'Transfer In', club: 'Verona' },
    { player: 'Nils Ramming', transferType: 'Transfer In', club: 'Eintracht Frankfurt' },
    { player: 'James Beadle', transferType: 'Loan Out', club: 'Birmingham City' },
    { player: 'Joao Pedro', transferType: 'Transfer Out', club: 'Chelsea' },
    { player: 'Valentin Barco', transferType: 'Transfer Out', club: 'Strasbourg' },
    { player: 'Olivier Boscagli', transferType: 'Transfer In', club: 'PSV' },
    { player: 'Odel Offiah', transferType: 'Transfer Out', club: 'Preston' },
    { player: 'Amario Cozier-Duberry', transferType: 'Loan Out', club: 'Bolton' },
    { player: 'Maxim De Cuyper', transferType: 'Transfer In', club: 'Club Brugge' },
    { player: 'Mark O\'Mahony', transferType: 'Loan Out', club: 'Reading' },
    { player: 'Simon Adingra', transferType: 'Transfer Out', club: 'Sunderland' },
    { player: 'Jamie Mullins', transferType: 'Transfer Out', club: 'Wycombe' },
    { player: 'Yoon Do-young', transferType: 'Loan Out', club: 'Excelsior' },
    { player: 'Caylan Vickers', transferType: 'Loan Out', club: 'Barnsley' },
    { player: 'Evan Ferguson', transferType: 'Loan Out', club: 'Roma' },
    { player: 'Pervis Estupinan', transferType: 'Transfer Out', club: 'AC Milan' },
    { player: 'Carl Rushworth', transferType: 'Loan Out', club: 'Coventry' },
    { player: 'Eiran Cashin', transferType: 'Loan Out', club: 'Birmingham City' },
    { player: 'Sean Keogh', transferType: 'Transfer In', club: 'Dundalk' },
    { player: 'Kofi Shaw', transferType: 'Transfer In', club: 'Bristol Rovers' },
    { player: 'Kamari Doyle', transferType: 'Loan Out', club: 'Reading' },
    { player: 'Malick Yalcouye', transferType: 'Loan Out', club: 'Swansea City' },
    { player: 'Andrew Moran', transferType: 'Loan Out', club: 'Los Angeles FC' }
  ]
  // ... continue with more teams
};

export class TransferDataParserService {
  private static instance: TransferDataParserService;

  static getInstance(): TransferDataParserService {
    if (!TransferDataParserService.instance) {
      TransferDataParserService.instance = new TransferDataParserService();
    }
    return TransferDataParserService.instance;
  }

  private mapTransferEntryToTransfer(entry: TransferEntry, teamName: string): Transfer {
    const now = new Date().toISOString();
    let status: 'confirmed' | 'rumored' | 'pending' = 'confirmed';
    let fromClub = '';
    let toClub = '';
    let fee = 'Undisclosed';

    // Determine transfer direction and status
    switch (entry.transferType) {
      case 'Transfer In':
        fromClub = entry.club;
        toClub = teamName;
        fee = 'Undisclosed';
        break;
      case 'Transfer Out':
        fromClub = teamName;
        toClub = entry.club;
        fee = 'Undisclosed';
        break;
      case 'Loan In':
        fromClub = entry.club;
        toClub = teamName;
        fee = 'Loan';
        break;
      case 'Loan Out':
        fromClub = teamName;
        toClub = entry.club;
        fee = 'Loan';
        break;
      case 'Released':
        fromClub = teamName;
        toClub = entry.club === '-' ? 'Free Agent' : entry.club;
        fee = 'Free';
        break;
      case 'End of loan':
        fromClub = teamName;
        toClub = entry.club;
        fee = 'End of Loan';
        break;
    }

    return {
      id: `transfer-${teamName.toLowerCase().replace(/\s+/g, '-')}-${entry.player.toLowerCase().replace(/\s+/g, '-')}-2025`,
      playerName: entry.player,
      fromClub,
      toClub,
      fee,
      date: now,
      source: 'Manual Data Entry',
      status
    };
  }

  getTeamTransfers(teamName: string): Transfer[] {
    const entries = TEAMS_TRANSFER_DATA[teamName] || [];
    return entries.map(entry => this.mapTransferEntryToTransfer(entry, teamName));
  }

  getAllTransfers(): Transfer[] {
    const allTransfers: Transfer[] = [];
    
    for (const [teamName, entries] of Object.entries(TEAMS_TRANSFER_DATA)) {
      const teamTransfers = entries.map(entry => this.mapTransferEntryToTransfer(entry, teamName));
      allTransfers.push(...teamTransfers);
    }

    // Sort by date (newest first)
    return allTransfers.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  getAvailableTeams(): string[] {
    return Object.keys(TEAMS_TRANSFER_DATA);
  }
}

export const transferDataParser = TransferDataParserService.getInstance();
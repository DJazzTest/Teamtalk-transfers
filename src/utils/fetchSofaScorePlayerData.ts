/**
 * Utility to fetch comprehensive player data from SofaScore
 * Can be used in browser or Node.js environment
 */

export interface SofaScorePlayerData {
  name: string;
  sofascoreId: string;
  url: string;
  bio: {
    name?: string;
    height?: string;
    weight?: string;
    nationality?: string;
    dateOfBirth?: string;
    placeOfBirth?: string;
    preferredFoot?: string;
    position?: string;
    marketValue?: string;
    jerseyNumber?: number;
    age?: number;
    description?: string;
  };
  seasonStats: Array<{
    competition: string;
    matches: number;
    minutes: number;
    goals?: number;
    assists?: number;
    cleanSheets?: number;
    goalsConceded?: number;
    saves?: number;
    yellowCards?: number;
    redCards?: number;
    rating?: number;
  }>;
  careerStats: Array<{
    season: string;
    team: string;
    competition: string;
    matches: number;
    minutes: number;
    goals?: number;
    assists?: number;
    cleanSheets?: number;
    goalsConceded?: number;
  }>;
  currentSeason?: string;
}

export async function fetchSofaScoreAPI(endpoint: string): Promise<any> {
  try {
    const response = await fetch(endpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Origin': 'https://www.sofascore.com',
        'Referer': 'https://www.sofascore.com/'
      }
    });
    
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log(`API call failed: ${error}`);
  }
  return null;
}

export async function fetchWithProxy(url: string): Promise<string> {
  const proxies = [
    `https://cors.isomorphic-git.org/${url}`,
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?${encodeURIComponent(url)}`
  ];

  for (const proxyUrl of proxies) {
    try {
      const response = await fetch(proxyUrl);
      
      if (response.ok) {
        let text = await response.text();
        
        // Handle allorigins wrapper
        if (proxyUrl.includes('allorigins.win')) {
          const data = JSON.parse(text);
          text = data.contents;
        }
        
        return text;
      }
    } catch (error) {
      continue;
    }
  }
  
  throw new Error('All proxies failed');
}

export async function fetchSofaScorePlayerData(
  playerUrl: string,
  playerId?: string
): Promise<SofaScorePlayerData | null> {
  try {
    // Extract player ID from URL if not provided
    if (!playerId) {
      const match = playerUrl.match(/\/player\/[^/]+\/(\d+)/);
      playerId = match ? match[1] : undefined;
    }

    if (!playerId) {
      throw new Error('Could not extract player ID from URL');
    }

    console.log(`[SofaScore] Fetching data for player ID: ${playerId}`);

    const playerData: SofaScorePlayerData = {
      name: '',
      sofascoreId: playerId,
      url: playerUrl,
      bio: {},
      seasonStats: [],
      careerStats: [],
      currentSeason: '2025-26'
    };

    // Try API endpoints first
    const apiEndpoints = [
      `https://api.sofascore.com/api/v1/player/${playerId}`,
      `https://api.sofascore.com/api/v1/player/${playerId}/statistics/season`,
      `https://api.sofascore.com/api/v1/player/${playerId}/unique-tournament/17/season/52186/statistics/overall`, // Premier League
    ];

    let apiData = null;
    for (const endpoint of apiEndpoints) {
      apiData = await fetchSofaScoreAPI(endpoint);
      if (apiData) {
        console.log(`[SofaScore] ✅ Got data from API`);
        break;
      }
    }

    // Extract from API data
    if (apiData) {
      // Extract player info
      if (apiData.player) {
        const p = apiData.player;
        playerData.name = p.name || p.fullName || '';
        playerData.bio = {
          name: p.name || p.fullName,
          height: p.height ? `${p.height} cm` : undefined,
          weight: p.weight ? `${p.weight} kg` : undefined,
          nationality: p.country?.name || p.nationality,
          dateOfBirth: p.dateOfBirth || p.birthDate,
          placeOfBirth: p.placeOfBirth || p.birthPlace,
          preferredFoot: p.preferredFoot,
          position: p.position || 'Goalkeeper',
          marketValue: p.marketValue,
          jerseyNumber: p.jerseyNumber || p.shirtNumber,
          age: p.age
        };
      }

      // Extract season stats
      if (apiData.statistics && Array.isArray(apiData.statistics)) {
        playerData.seasonStats = apiData.statistics.map((stat: any) => ({
          competition: stat.tournament?.name || stat.competition || 'Unknown',
          matches: stat.appearances || stat.matches || 0,
          minutes: stat.minutes || 0,
          goals: stat.goals || 0,
          assists: stat.assists || 0,
          cleanSheets: stat.cleanSheets || 0,
          goalsConceded: stat.goalsConceded || 0,
          saves: stat.saves,
          yellowCards: stat.yellowCards || 0,
          redCards: stat.redCards || 0,
          rating: stat.rating
        }));
      }

      // Extract career stats
      if (apiData.career || apiData.player?.career) {
        const career = apiData.career || apiData.player.career || [];
        playerData.careerStats = career.map((entry: any) => ({
          season: entry.season || entry.year || '',
          team: entry.team?.name || entry.team || '',
          competition: entry.tournament?.name || entry.competition || '',
          matches: entry.appearances || entry.matches || 0,
          minutes: entry.minutes || 0,
          goals: entry.goals || 0,
          assists: entry.assists || 0,
          cleanSheets: entry.cleanSheets || 0,
          goalsConceded: entry.goalsConceded || 0
        }));
      }
    }

    // Fallback: Try HTML scraping if API didn't work
    if (!apiData || playerData.seasonStats.length === 0) {
      console.log('[SofaScore] Trying HTML scraping...');
      try {
        const html = await fetchWithProxy(playerUrl);
        
        // Extract JSON data from script tags
        const jsonMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({.+?});/);
        if (jsonMatch) {
          try {
            const initialState = JSON.parse(jsonMatch[1]);
            console.log('[SofaScore] Found initial state');
            
            // Try to find player data in initial state
            if (initialState.player || initialState.playerData) {
              const player = initialState.player || initialState.playerData;
              if (player && !playerData.name) {
                playerData.name = player.name || '';
              }
            }
          } catch (e) {
            console.log('[SofaScore] Could not parse initial state');
          }
        }

        // Parse HTML for player info using DOM parser
        if (typeof DOMParser !== 'undefined') {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          
          // Extract bio information
          const bioElements = doc.querySelectorAll('[data-testid*="player"], .player-info, .player-details');
          bioElements.forEach(el => {
            const text = el.textContent || '';
            // Extract height
            const heightMatch = text.match(/(\d+)\s*cm/i);
            if (heightMatch && !playerData.bio.height) {
              playerData.bio.height = `${heightMatch[1]} cm`;
            }
            // Extract weight
            const weightMatch = text.match(/(\d+)\s*kg/i);
            if (weightMatch && !playerData.bio.weight) {
              playerData.bio.weight = `${weightMatch[1]} kg`;
            }
          });

          // Extract date of birth
          const dobMatch = html.match(/(?:born|dob|date of birth)[\s:]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
          if (dobMatch && !playerData.bio.dateOfBirth) {
            playerData.bio.dateOfBirth = dobMatch[1];
          }
        }
      } catch (error) {
        console.error('[SofaScore] HTML scraping failed:', error);
      }
    }

    return playerData;
  } catch (error) {
    console.error('[SofaScore] Error fetching player data:', error);
    return null;
  }
}


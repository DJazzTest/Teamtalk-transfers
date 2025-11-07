/**
 * Script to fetch comprehensive player data from SofaScore for Kepa Arrizabalaga
 */

const KEPA_URL = 'https://www.sofascore.com/football/player/kepa-arrizabalaga/232422';
const KEPA_PLAYER_ID = '232422';

async function fetchWithProxy(url) {
  const proxies = [
    `https://cors.isomorphic-git.org/${url}`,
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?${encodeURIComponent(url)}`
  ];

  for (const proxyUrl of proxies) {
    try {
      console.log(`Trying proxy: ${proxyUrl.substring(0, 60)}...`);
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
      console.log(`Proxy failed: ${error.message}`);
      continue;
    }
  }
  
  throw new Error('All proxies failed');
}

async function fetchSofaScoreAPI(endpoint) {
  try {
    console.log(`Fetching API: ${endpoint}`);
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
    console.log(`API call failed: ${error.message}`);
  }
  return null;
}

async function extractPlayerData() {
  console.log('\n🔍 Fetching Kepa Arrizabalaga data from SofaScore...\n');
  
  const playerData = {
    name: 'Kepa Arrizabalaga',
    sofascoreId: KEPA_PLAYER_ID,
    url: KEPA_URL,
    bio: {},
    seasonStats: [],
    careerStats: [],
    currentSeason: '2025-26'
  };

  // Try API endpoints first
  const apiEndpoints = [
    `https://api.sofascore.com/api/v1/player/${KEPA_PLAYER_ID}`,
    `https://api.sofascore.com/api/v1/player/${KEPA_PLAYER_ID}/statistics/season`,
    `https://api.sofascore.com/api/v1/player/${KEPA_PLAYER_ID}/unique-tournament/17/season/52186/statistics/overall`, // Premier League
  ];

  let apiData = null;
  for (const endpoint of apiEndpoints) {
    apiData = await fetchSofaScoreAPI(endpoint);
    if (apiData) {
      console.log(`✅ Got data from API: ${endpoint}`);
      break;
    }
  }

  // If API works, extract from there
  if (apiData) {
    // Extract player info
    if (apiData.player) {
      const p = apiData.player;
      playerData.bio = {
        name: p.name || p.fullName || 'Kepa Arrizabalaga',
        height: p.height ? `${p.height} cm` : undefined,
        weight: p.weight ? `${p.weight} kg` : undefined,
        nationality: p.country?.name || p.nationality,
        dateOfBirth: p.dateOfBirth || p.birthDate,
        placeOfBirth: p.placeOfBirth || p.birthPlace,
        preferredFoot: p.preferredFoot,
        position: p.position || 'Goalkeeper',
        marketValue: p.marketValue,
        jerseyNumber: p.jerseyNumber || p.shirtNumber
      };
    }

    // Extract season stats
    if (apiData.statistics && Array.isArray(apiData.statistics)) {
      playerData.seasonStats = apiData.statistics.map(stat => ({
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
      playerData.careerStats = career.map(entry => ({
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

  // Fallback: Try HTML scraping
  if (!apiData || playerData.seasonStats.length === 0) {
    console.log('\n📄 Trying HTML scraping...');
    try {
      const html = await fetchWithProxy(KEPA_URL);
      
      // Extract JSON data from script tags
      const jsonMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({.+?});/);
      if (jsonMatch) {
        const initialState = JSON.parse(jsonMatch[1]);
        console.log('Found initial state, keys:', Object.keys(initialState));
        
        // Try to find player data in initial state
        if (initialState.player || initialState.playerData) {
          const player = initialState.player || initialState.playerData;
          console.log('Found player data in initial state');
        }
      }

      // Parse HTML for player info
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
        // Extract nationality
        const flagImg = el.querySelector('img[alt*="flag"], img[title*="flag"]');
        if (flagImg && !playerData.bio.nationality) {
          playerData.bio.nationality = flagImg.getAttribute('alt') || flagImg.getAttribute('title') || '';
        }
      });

      // Extract date of birth
      const dobMatch = html.match(/(?:born|dob|date of birth)[\s:]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
      if (dobMatch && !playerData.bio.dateOfBirth) {
        playerData.bio.dateOfBirth = dobMatch[1];
      }

    } catch (error) {
      console.error('HTML scraping failed:', error.message);
    }
  }

  return playerData;
}

// Run the extraction
(async () => {
  try {
    const data = await extractPlayerData();
    
    console.log('\n📊 Extracted Data:');
    console.log(JSON.stringify(data, null, 2));
    
    // Save to file (Node.js environment)
    if (typeof require !== 'undefined') {
      const fs = require('fs');
      const path = require('path');
      const outputPath = path.join(process.cwd(), 'src', 'data', 'players', 'kepa-arrizabalaga.json');
      const outputDir = path.dirname(outputPath);
      
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
      console.log(`\n✅ Saved to: ${outputPath}`);
    } else {
      // Browser environment - log for copy/paste
      console.log('\n📋 Copy this data to save:');
      console.log(JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();


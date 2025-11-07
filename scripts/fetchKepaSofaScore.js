/**
 * Script to fetch and save Kepa Arrizabalaga's complete data from SofaScore
 * Run with: node scripts/fetchKepaSofaScore.js
 */

const KEPA_URL = 'https://www.sofascore.com/football/player/kepa-arrizabalaga/232422';
const KEPA_PLAYER_ID = '232422';

async function fetchSofaScoreAPI(endpoint) {
  try {
    console.log(`Fetching: ${endpoint}`);
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
    } else {
      console.log(`Failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
  return null;
}

async function fetchWithProxy(url) {
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

async function extractKepaData() {
  console.log('\n🔍 Fetching Kepa Arrizabalaga data from SofaScore...\n');
  
  const playerData = {
    name: 'Kepa Arrizabalaga',
    sofascoreId: KEPA_PLAYER_ID,
    url: KEPA_URL,
    bio: {},
    seasonStats: [],
    careerStats: []
  };

  // Try API endpoints
  const apiEndpoints = [
    `https://api.sofascore.com/api/v1/player/${KEPA_PLAYER_ID}`,
    `https://api.sofascore.com/api/v1/player/${KEPA_PLAYER_ID}/statistics/season`,
    `https://api.sofascore.com/api/v1/player/${KEPA_PLAYER_ID}/unique-tournament/17/season/52186/statistics/overall`,
  ];

  let apiData = null;
  for (const endpoint of apiEndpoints) {
    apiData = await fetchSofaScoreAPI(endpoint);
    if (apiData) {
      console.log(`✅ Got data from: ${endpoint}`);
      break;
    }
  }

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
        jerseyNumber: p.jerseyNumber || p.shirtNumber,
        age: p.age
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

  // Fallback: HTML scraping
  if (!apiData || playerData.seasonStats.length === 0) {
    console.log('\n📄 Trying HTML scraping...');
    try {
      const html = await fetchWithProxy(KEPA_URL);
      
      // Extract JSON from script tags
      const jsonMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({.+?});/s);
      if (jsonMatch) {
        try {
          const initialState = JSON.parse(jsonMatch[1]);
          console.log('Found initial state');
          // Process initial state if needed
        } catch (e) {
          console.log('Could not parse initial state');
        }
      }
    } catch (error) {
      console.error('HTML scraping failed:', error.message);
    }
  }

  return playerData;
}

// Run extraction
(async () => {
  try {
    const data = await extractKepaData();
    
    console.log('\n📊 Extracted Data:');
    console.log(JSON.stringify(data, null, 2));
    
    // Save to file
    if (typeof require !== 'undefined') {
      const fs = require('fs');
      const path = require('path');
      const outputDir = path.join(process.cwd(), 'src', 'data', 'players');
      const outputPath = path.join(outputDir, 'kepa-arrizabalaga.json');
      
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
      console.log(`\n✅ Saved to: ${outputPath}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();


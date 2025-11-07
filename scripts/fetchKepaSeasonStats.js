/**
 * Script to fetch Kepa Arrizabalaga's 2025-26 season statistics
 */

const KEPA_PLAYER_ID = '232422';
const KEPA_URL = 'https://www.sofascore.com/football/player/kepa-arrizabalaga/232422';

// Try various API endpoints
const endpoints = [
  `https://api.sofascore.com/api/v1/player/${KEPA_PLAYER_ID}`,
  `https://api.sofascore.com/api/v1/player/${KEPA_PLAYER_ID}/statistics/season`,
  `https://api.sofascore.com/api/v1/player/${KEPA_PLAYER_ID}/unique-tournament/17/season/52186/statistics/overall`, // Premier League 2025-26
  `https://api.sofascore.com/api/v1/player/${KEPA_PLAYER_ID}/unique-tournament/7/season/52186/statistics/overall`, // Champions League
  `https://api.sofascore.com/api/v1/player/${KEPA_PLAYER_ID}/statistics/tournament/17`, // Premier League tournament
  `https://api.sofascore.com/api/v1/player/${KEPA_PLAYER_ID}/statistics/tournament/7`, // Champions League tournament
];

async function fetchEndpoint(url) {
  try {
    console.log(`\nTrying: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Origin': 'https://www.sofascore.com',
        'Referer': 'https://www.sofascore.com/'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Success! Response keys:`, Object.keys(data));
      return data;
    } else {
      console.log(`❌ Failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  return null;
}

async function fetchWithProxy(url) {
  const proxies = [
    `https://cors.isomorphic-git.org/${url}`,
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
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
  return null;
}

async function extractFromHTML() {
  console.log('\n📄 Trying HTML scraping for season stats...');
  try {
    const html = await fetchWithProxy(KEPA_URL);
    if (!html) {
      console.log('HTML fetch failed');
      return null;
    }

    // Try to find JSON data in script tags
    const patterns = [
      /window\.__INITIAL_STATE__\s*=\s*({.+?});/s,
      /__NEXT_DATA__[^>]*>({.+?})<\/script>/s,
      /"player":\s*({.+?"id":\s*232422[^}]+})/s,
      /"statistics":\s*(\[[^\]]+\])/s,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        try {
          const json = JSON.parse(match[1]);
          console.log('Found JSON data in HTML');
          return json;
        } catch (e) {
          console.log('Could not parse JSON from HTML');
        }
      }
    }

    // Try to find season stats in HTML text
    const seasonMatch = html.match(/(2025[-\s]?26|2025\/26|season\s+2025)/i);
    if (seasonMatch) {
      console.log('Found season reference in HTML');
    }

    // Look for stats tables or data attributes
    const statsPatterns = [
      /matches[:\s]+(\d+)/i,
      /appearances[:\s]+(\d+)/i,
      /clean\s+sheets[:\s]+(\d+)/i,
      /goals\s+conceded[:\s]+(\d+)/i,
    ];

    const foundStats = {};
    for (const pattern of statsPatterns) {
      const match = html.match(pattern);
      if (match) {
        foundStats[pattern.source] = match[1];
      }
    }

    if (Object.keys(foundStats).length > 0) {
      console.log('Found stats in HTML:', foundStats);
    }

  } catch (error) {
    console.error('HTML scraping error:', error.message);
  }
  return null;
}

async function main() {
  console.log('🔍 Fetching Kepa Arrizabalaga 2025-26 Season Stats...\n');

  let seasonStats = null;
  let allData = null;

  // Try all API endpoints
  for (const endpoint of endpoints) {
    const data = await fetchEndpoint(endpoint);
    if (data) {
      allData = data;
      
      // Check for statistics
      if (data.statistics) {
        console.log('\n📊 Found statistics:', Array.isArray(data.statistics) ? data.statistics.length : 'object');
        if (Array.isArray(data.statistics)) {
          console.log('Sample stat:', JSON.stringify(data.statistics[0], null, 2));
        } else {
          console.log('Statistics structure:', Object.keys(data.statistics));
        }
      }

      // Check for player data
      if (data.player) {
        console.log('\n👤 Player data found');
        console.log('Player keys:', Object.keys(data.player));
      }

      // Check for season data
      if (data.season) {
        console.log('\n📅 Season data found');
        console.log('Season keys:', Object.keys(data.season));
      }

      // Check for tournament data
      if (data.tournament) {
        console.log('\n🏆 Tournament data found');
        console.log('Tournament:', data.tournament.name || data.tournament);
      }

      break; // Found data, stop trying other endpoints
    }
  }

  // Try HTML scraping
  if (!allData || !allData.statistics) {
    await extractFromHTML();
  }

  // If we have data, format it
  if (allData && allData.statistics) {
    const stats = Array.isArray(allData.statistics) ? allData.statistics : [allData.statistics];
    
    seasonStats = stats.map(stat => ({
      competition: stat.tournament?.name || stat.competition || stat.league?.name || 'Unknown',
      matches: stat.appearances || stat.matches || stat.games || 0,
      minutes: stat.minutes || stat.minutesPlayed || 0,
      goals: stat.goals || 0,
      assists: stat.assists || 0,
      cleanSheets: stat.cleanSheets || stat.clean_sheets || 0,
      goalsConceded: stat.goalsConceded || stat.goals_conceded || 0,
      saves: stat.saves,
      yellowCards: stat.yellowCards || stat.yellow_cards || 0,
      redCards: stat.redCards || stat.red_cards || 0,
      rating: stat.rating || stat.averageRating
    }));

    console.log('\n📊 Formatted Season Stats:');
    console.log(JSON.stringify(seasonStats, null, 2));
  }

  return seasonStats;
}

main().then(stats => {
  if (stats && stats.length > 0) {
    console.log('\n✅ Successfully extracted season stats!');
  } else {
    console.log('\n⚠️ Could not extract season stats from APIs');
    console.log('You may need to manually enter the data or use match analysis');
  }
}).catch(console.error);


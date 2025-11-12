/**
 * Test script to see what data we can extract from SofaScore player embeds
 * Player ID: 232422 (from the iframe URL)
 */

const PLAYER_ID = 232422; // Example from the iframe

// SofaScore API endpoints we can try
const API_ENDPOINTS = [
  `https://api.sofascore.com/api/v1/player/${PLAYER_ID}`,
  `https://api.sofascore.com/api/v1/player/${PLAYER_ID}/statistics/season`,
  `https://api.sofascore.com/api/v1/player/${PLAYER_ID}/unique-tournament/17/season/52186/statistics/overall`, // Premier League
  `https://api.sofascore.com/api/v1/player/${PLAYER_ID}/statistics/tournament/17`,
  `https://api.sofascore.com/api/v1/player/${PLAYER_ID}/career`,
  `https://api.sofascore.com/api/v1/player/${PLAYER_ID}/transfers`,
  `https://api.sofascore.com/api/v1/player/${PLAYER_ID}/events`,
  `https://api.sofascore.com/api/v1/player/${PLAYER_ID}/unique-tournament/17/statistics/overall`,
];

async function fetchSofaScoreAPI(endpoint) {
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
      const data = await response.json();
      return { success: true, data };
    } else {
      return { success: false, status: response.status, statusText: response.statusText };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testEndpoints() {
  console.log(`🔍 Testing SofaScore API endpoints for player ID: ${PLAYER_ID}\n`);
  console.log('='.repeat(80));
  
  for (const endpoint of API_ENDPOINTS) {
    console.log(`\n📡 Testing: ${endpoint}`);
    const result = await fetchSofaScoreAPI(endpoint);
    
    if (result.success) {
      console.log('✅ Success!');
      console.log('📊 Data structure:');
      console.log(JSON.stringify(result.data, null, 2).substring(0, 1000) + '...');
    } else {
      console.log(`❌ Failed: ${result.status || result.error}`);
    }
    
    // Delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Also try fetching the widget HTML to see what's embedded
  console.log('\n\n📄 Testing Widget HTML:');
  console.log('='.repeat(80));
  try {
    const widgetUrl = `https://widgets.sofascore.com/en/embed/player/${PLAYER_ID}?widgetTheme=light`;
    const response = await fetch(widgetUrl);
    if (response.ok) {
      const html = await response.text();
      console.log('✅ Widget HTML fetched');
      console.log(`📏 HTML length: ${html.length} characters`);
      // Look for data attributes or JSON in the HTML
      const jsonMatches = html.match(/window\.__INITIAL_STATE__\s*=\s*({.+?});/s);
      if (jsonMatches) {
        console.log('✅ Found embedded JSON data!');
        try {
          const data = JSON.parse(jsonMatches[1]);
          console.log('📊 Embedded data keys:', Object.keys(data));
        } catch (e) {
          console.log('⚠️  Could not parse embedded JSON');
        }
      }
    }
  } catch (error) {
    console.log(`❌ Failed to fetch widget: ${error.message}`);
  }
}

testEndpoints().catch(console.error);


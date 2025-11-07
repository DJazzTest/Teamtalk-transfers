import fs from 'fs';
import https from 'https';
import http from 'http';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to fetch HTML from URL
function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Extract player data from Premier League page
async function importPlayerData(playerUrl) {
  try {
    console.log(`Fetching data from: ${playerUrl}`);
    const html = await fetchHtml(playerUrl);
    const $ = cheerio.load(html);

    // Extract player name
    const name = $('h1.playerName, .playerName, [data-player-name]').first().text().trim() || 
                 $('h1').first().text().trim();

    // Extract age - look for age in various formats
    let age = null;
    const ageText = $('.playerAge, [data-age], .statValue').filter((i, el) => {
      const text = $(el).text().trim();
      return /^\d+$/.test(text) && parseInt(text) >= 16 && parseInt(text) <= 50;
    }).first().text().trim();
    if (ageText) age = parseInt(ageText);

    // Try to find age in text like "Age: 30" or "30 years old"
    if (!age) {
      const pageText = $('body').text();
      const ageMatch = pageText.match(/(?:age|aged)[\s:]+(\d+)/i) || 
                      pageText.match(/(\d+)[\s]+(?:years?\s+old|yrs?)/i);
      if (ageMatch) age = parseInt(ageMatch[1]);
    }

    // Extract position
    let position = null;
    const positionText = $('.playerPosition, [data-position], .position').first().text().trim();
    if (positionText) {
      const pos = positionText.toLowerCase();
      if (pos.includes('goalkeeper') || pos.includes('gk')) position = 'Goalkeeper';
      else if (pos.includes('defender') || pos.includes('def')) position = 'Defender';
      else if (pos.includes('midfielder') || pos.includes('mid')) position = 'Midfielder';
      else if (pos.includes('forward') || pos.includes('attacker') || pos.includes('striker')) position = 'Forward';
    }

    // Extract stats
    const stats = {};
    $('.stat, .statValue, [data-stat]').each((i, el) => {
      const label = $(el).find('.statLabel, .label').text().trim() || 
                    $(el).prev().text().trim() ||
                    $(el).attr('data-label') || '';
      const value = $(el).find('.statValue, .value').text().trim() || 
                    $(el).text().trim();
      
      if (label && value) {
        const cleanLabel = label.toLowerCase().replace(/[^a-z0-9]/g, '');
        stats[cleanLabel] = value;
      }
    });

    // Extract image URL
    let imageUrl = null;
    const imgSrc = $('img.playerImage, .playerImage img, [data-player-image]').attr('src') ||
                   $('img').filter((i, img) => {
                     const src = $(img).attr('src') || '';
                     return src.includes('player') || src.includes(name.toLowerCase().replace(/\s+/g, '-'));
                   }).first().attr('src');
    
    if (imgSrc) {
      imageUrl = imgSrc.startsWith('http') ? imgSrc : `https://www.premierleague.com${imgSrc}`;
    }

    // Extract nationality
    let nationality = null;
    const natText = $('.nationality, [data-nationality], .country').first().text().trim();
    if (natText) nationality = natText;

    // Extract club
    let currentClub = null;
    const clubText = $('.currentClub, [data-club], .club').first().text().trim();
    if (clubText) currentClub = clubText;

    const playerData = {
      name: name || 'Unknown',
      age: age,
      position: position,
      nationality: nationality,
      currentClub: currentClub,
      imageUrl: imageUrl,
      stats: stats,
      sourceUrl: playerUrl
    };

    console.log('\n=== Extracted Player Data ===');
    console.log(JSON.stringify(playerData, null, 2));
    console.log('\n');

    // Save to localStorage format
    const savedPlayers = JSON.parse(fs.existsSync(join(__dirname, '../player-data-cache.json')) 
      ? fs.readFileSync(join(__dirname, '../player-data-cache.json'), 'utf8') 
      : '{}');
    
    const teamName = currentClub || 'Unknown';
    if (!savedPlayers[teamName]) savedPlayers[teamName] = {};
    savedPlayers[teamName][name] = {
      age: age,
      position: position,
      nationality: nationality,
      imageUrl: imageUrl,
      stats: stats,
      importedAt: new Date().toISOString()
    };

    fs.writeFileSync(
      join(__dirname, '../player-data-cache.json'),
      JSON.stringify(savedPlayers, null, 2)
    );

    console.log(`✅ Player data saved for ${name} (${teamName})`);
    console.log(`📁 Data cached in: player-data-cache.json`);

    return playerData;
  } catch (error) {
    console.error('Error importing player data:', error);
    throw error;
  }
}

// Main execution
const playerUrl = process.argv[2] || 'https://www.premierleague.com/en/players/154561/david-raya/stats';

if (!playerUrl.includes('premierleague.com')) {
  console.error('Please provide a valid Premier League player URL');
  process.exit(1);
}

importPlayerData(playerUrl)
  .then(() => {
    console.log('\n✅ Import complete!');
    console.log('💡 You can now use this data in the CMS Player Management section.');
  })
  .catch((error) => {
    console.error('❌ Import failed:', error);
    process.exit(1);
  });


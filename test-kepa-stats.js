/**
 * Test script to check if Kepa Arrizabalaga data exists in APIs
 */

const ARSENAL_TEAM_ID = '1-65';
const ARSENAL_STAGE_ID = '9d5918a8-febc-47b8-abbe-29d0777064a0'; // Premier League
const PLAYER_NAME = 'Kepa Arrizabalaga';

async function testTeamPageAPI() {
  console.log('\n=== Testing Sport365 Team Page API ===');
  const url = `https://api.sport365.com/v1/en/team/soccer/teampage/${ARSENAL_TEAM_ID}`;
  console.log(`URL: ${url}`);
  
  try {
    const response = await fetch(url);
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.error(`Failed: ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    console.log('\nResponse structure:', Object.keys(data));
    
    // Check for players in various possible locations
    const players = data.players || data.squad || data.team?.players || data.statistics?.players || [];
    console.log(`\nFound ${Array.isArray(players) ? players.length : 'N/A'} players`);
    
    if (Array.isArray(players)) {
      console.log('\nPlayer names found:');
      players.slice(0, 20).forEach((p, i) => {
        const name = p.name || p.player_name || p.full_name || 'Unknown';
        console.log(`  ${i + 1}. ${name}`);
        
        // Check if this is Kepa
        if (name.toLowerCase().includes('kepa') || name.toLowerCase().includes('arrizabalaga')) {
          console.log(`    *** MATCH FOUND! ***`);
          console.log(`    Full data:`, JSON.stringify(p, null, 2));
        }
      });
      
      // Search specifically for Kepa
      const kepa = players.find(p => {
        const name = (p.name || p.player_name || p.full_name || '').toLowerCase();
        return name.includes('kepa') || name.includes('arrizabalaga');
      });
      
      if (kepa) {
        console.log('\n✅ KEPA FOUND IN TEAM PAGE API:');
        console.log(JSON.stringify(kepa, null, 2));
      } else {
        console.log('\n❌ Kepa not found in team page API');
      }
    }
    
    // Check statistics structure
    if (data.statistics) {
      console.log('\nStatistics structure:', Object.keys(data.statistics));
      if (data.statistics.players) {
        console.log(`Statistics players: ${data.statistics.players.length}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function testStageStatsAPI() {
  console.log('\n=== Testing Sport365 Stage Stats API ===');
  const url = `https://api.sport365.com/v1/en/stage/part/stats/soccer/${ARSENAL_STAGE_ID}`;
  console.log(`URL: ${url}`);
  
  try {
    const response = await fetch(url);
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.error(`Failed: ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    console.log('\nResponse structure:', Object.keys(data));
    
    // Check for player stats
    const stats = data.stats || data.statistics || data.players || data.top_scorers || [];
    console.log(`\nFound ${Array.isArray(stats) ? stats.length : 'N/A'} stat entries`);
    
    if (Array.isArray(stats)) {
      // Search for Kepa
      const kepa = stats.find(s => {
        const name = (s.player?.name || s.name || s.player_name || '').toLowerCase();
        const team = (s.team?.name || s.team_name || '').toLowerCase();
        return (name.includes('kepa') || name.includes('arrizabalaga')) && team.includes('arsenal');
      });
      
      if (kepa) {
        console.log('\n✅ KEPA FOUND IN STAGE STATS API:');
        console.log(JSON.stringify(kepa, null, 2));
      } else {
        console.log('\n❌ Kepa not found in stage stats API');
        console.log('\nFirst 10 entries:');
        stats.slice(0, 10).forEach((s, i) => {
          const name = s.player?.name || s.name || s.player_name || 'Unknown';
          const team = s.team?.name || s.team_name || 'Unknown';
          console.log(`  ${i + 1}. ${name} (${team})`);
        });
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function testMatchDetails() {
  console.log('\n=== Testing Match Details API ===');
  // Get recent Arsenal matches and check for Kepa in match details
  const url = `https://api.sport365.com/v1/en/matches/soccer/from/2025-08-01T00:00:00/to/${new Date().toISOString()}`;
  console.log(`URL: ${url}`);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed: ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    console.log('\nResponse structure:', Array.isArray(data) ? 'Array' : Object.keys(data));
    
    // Find Arsenal matches
    let arsenalMatches = [];
    if (Array.isArray(data)) {
      if (data[0]?.matches) {
        // Array of competitions
        for (const comp of data) {
          if (comp.matches) {
            arsenalMatches.push(...comp.matches.filter(m => {
              const teams = m.teams || [];
              return teams.some(t => t.name?.toLowerCase().includes('arsenal'));
            }));
          }
        }
      } else {
        arsenalMatches = data.filter(m => {
          const teams = m.teams || [];
          return teams.some(t => t.name?.toLowerCase().includes('arsenal'));
        });
      }
    }
    
    console.log(`\nFound ${arsenalMatches.length} Arsenal matches`);
    
    if (arsenalMatches.length > 0) {
      // Check first match for player data
      const match = arsenalMatches[0];
      console.log(`\nChecking match: ${match.id || 'no-id'}`);
      
      if (match.id) {
        const matchUrl = `https://api.sport365.com/v1/en/match/soccer/full/${match.id}?boxscore=1&estats=1&tf=1&tlge=1&wh2h=1&wstats=1&wtops=1`;
        console.log(`Match details URL: ${matchUrl}`);
        
        try {
          const matchResponse = await fetch(matchUrl);
          if (matchResponse.ok) {
            const matchData = await matchResponse.json();
            console.log('\nMatch data structure:', Object.keys(matchData));
            
            // Check for players in match
            if (matchData.players || matchData.squad) {
              const players = matchData.players || matchData.squad || [];
              console.log(`Match has ${players.length} players`);
            }
          }
        } catch (e) {
          console.error('Error fetching match details:', e.message);
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run all tests
(async () => {
  console.log(`\n🔍 Testing APIs for: ${PLAYER_NAME} (Arsenal)\n`);
  await testTeamPageAPI();
  await testStageStatsAPI();
  await testMatchDetails();
  console.log('\n✅ Tests complete\n');
})();


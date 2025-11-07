/**
 * Test script to check API structure more thoroughly
 */

const ARSENAL_TEAM_ID = '1-65';
const ARSENAL_STAGE_ID = '9d5918a8-febc-47b8-abbe-29d0777064a0';

async function testTeamPageAPI() {
  console.log('\n=== Testing Sport365 Team Page API (Detailed) ===');
  const url = `https://api.sport365.com/v1/en/team/soccer/teampage/${ARSENAL_TEAM_ID}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('\nTop-level keys:', Object.keys(data));
    
    // Check participants
    if (data.participants) {
      console.log('\n📊 Participants found:', Array.isArray(data.participants) ? data.participants.length : typeof data.participants);
      if (Array.isArray(data.participants)) {
        console.log('First participant:', JSON.stringify(data.participants[0], null, 2));
        
        // Search for Kepa
        const kepa = data.participants.find(p => {
          const name = (p.name || p.player_name || p.full_name || '').toLowerCase();
          return name.includes('kepa') || name.includes('arrizabalaga');
        });
        
        if (kepa) {
          console.log('\n✅ KEPA FOUND IN PARTICIPANTS:');
          console.log(JSON.stringify(kepa, null, 2));
        } else {
          console.log('\n❌ Kepa not in participants');
          console.log('Sample participant names:');
          data.participants.slice(0, 10).forEach((p, i) => {
            const name = p.name || p.player_name || p.full_name || 'Unknown';
            console.log(`  ${i + 1}. ${name}`);
          });
        }
      }
    }
    
    // Check stages
    if (data.stages) {
      console.log('\n📊 Stages found:', Array.isArray(data.stages) ? data.stages.length : typeof data.stages);
      if (Array.isArray(data.stages) && data.stages.length > 0) {
        console.log('First stage keys:', Object.keys(data.stages[0]));
      }
    }
    
    // Check results
    if (data.results) {
      console.log('\n📊 Results found:', Array.isArray(data.results) ? data.results.length : typeof data.results);
    }
    
    // Check fixtures
    if (data.fixtures) {
      console.log('\n📊 Fixtures found:', Array.isArray(data.fixtures) ? data.fixtures.length : typeof data.fixtures);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function testStageStatsAPI() {
  console.log('\n=== Testing Sport365 Stage Stats API (Detailed) ===');
  const url = `https://api.sport365.com/v1/en/stage/part/stats/soccer/${ARSENAL_STAGE_ID}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('\nTop-level keys:', Object.keys(data));
    
    // Check participants_stats
    if (data.participants_stats) {
      console.log('\n📊 Participants Stats found:', Array.isArray(data.participants_stats) ? data.participants_stats.length : typeof data.participants_stats);
      
      if (Array.isArray(data.participants_stats)) {
        console.log('First stat entry keys:', Object.keys(data.participants_stats[0] || {}));
        
        // Search for Kepa
        const kepa = data.participants_stats.find(s => {
          const name = (s.player?.name || s.name || s.player_name || '').toLowerCase();
          const team = (s.team?.name || s.team_name || s.participant?.name || '').toLowerCase();
          return (name.includes('kepa') || name.includes('arrizabalaga')) && team.includes('arsenal');
        });
        
        if (kepa) {
          console.log('\n✅ KEPA FOUND IN PARTICIPANTS_STATS:');
          console.log(JSON.stringify(kepa, null, 2));
        } else {
          console.log('\n❌ Kepa not in participants_stats');
          console.log('Sample entries (first 5):');
          data.participants_stats.slice(0, 5).forEach((s, i) => {
            const name = s.player?.name || s.name || s.player_name || 'Unknown';
            const team = s.team?.name || s.team_name || s.participant?.name || 'Unknown';
            console.log(`  ${i + 1}. ${name} (${team})`);
          });
        }
      } else if (typeof data.participants_stats === 'object') {
        console.log('Participants_stats is an object, keys:', Object.keys(data.participants_stats));
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

(async () => {
  await testTeamPageAPI();
  await testStageStatsAPI();
  console.log('\n✅ Detailed tests complete\n');
})();


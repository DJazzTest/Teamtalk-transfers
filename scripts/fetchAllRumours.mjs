// Script to fetch all rumours from all teams and assign them to clubs

const TEAM_IDS = {
  'Arsenal': '1205',
  'Aston Villa': '1215',
  'Bournemouth': '1124',
  'Brentford': '1276',
  'Brighton & Hove Albion': '1125',
  'Burnley': '1126',
  'Chelsea': '1317',
  'Crystal Palace': '1367',
  'Everton': '1408',
  'Fulham': '1431',
  'Leeds United': '1132',
  'Liverpool': '1548',
  'Manchester City': '1571',
  'Manchester United': '1143',
  'Newcastle United': '1599',
  'Nottingham Forest': '1136',
  'Sunderland': '1748',
  'Tottenham Hotspur': '1779',
  'West Ham United': '1811',
  'Wolverhampton Wanderers': '1837'
};

async function fetchRumoursForTeam(teamId, teamName) {
  try {
    const url = `https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=${teamId}&page=1&tournamentId=72602`;
    const response = await fetch(url);
    const data = await response.json();
    
    // Handle both structures: result.rumours.data (object with data array) or result.rumours (direct array)
    const rumoursArray = data.result?.rumours?.data || 
                        (Array.isArray(data.result?.rumours) ? data.result.rumours : []);
    
    if (rumoursArray && rumoursArray.length > 0) {
      const rumours = rumoursArray.map(rumour => {
        const toClub = (rumour.team?.nm || rumour.team_to?.nm || 'Unknown Club').trim();
        const fromClub = (rumour.team_from?.nm || 'Unknown Club').trim();
        const playerName = (rumour.player?.nm || 'Unknown Player').trim();
        const fee = rumour.prc ? rumour.prc.replace('€', '£').replace('Million', 'm') : undefined;
        
        return {
          player: playerName,
          fromClub: fromClub,
          toClub: toClub,
          fee: fee,
          date: rumour.article?.sdt || rumour.created_at || rumour.date || new Date().toISOString()
        };
      });
      
      return { teamName, teamId, rumours, count: rumours.length };
    }
    return { teamName, teamId, rumours: [], count: 0 };
  } catch (error) {
    console.error(`Error fetching rumours for ${teamName} (${teamId}):`, error.message);
    return { teamName, teamId, rumours: [], count: 0, error: error.message };
  }
}

async function main() {
  console.log('Fetching rumours from all teams...\n');
  
  const allRumours = {};
  let totalRumours = 0;
  
  for (const [teamName, teamId] of Object.entries(TEAM_IDS)) {
    console.log(`Fetching rumours for ${teamName}...`);
    const result = await fetchRumoursForTeam(teamId, teamName);
    allRumours[teamName] = result.rumours;
    totalRumours += result.count;
    console.log(`  Found ${result.count} rumours`);
    await new Promise(resolve => setTimeout(resolve, 300)); // Rate limiting
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Total rumours found: ${totalRumours}\n`);
  
  console.log('=== Rumours by Team ===');
  Object.entries(allRumours).forEach(([team, rumours]) => {
    if (rumours.length > 0) {
      console.log(`\n${team} (${rumours.length} rumours):`);
      rumours.forEach(r => {
        console.log(`  - ${r.player} (${r.fromClub} → ${r.toClub})${r.fee ? ` - ${r.fee}` : ''}`);
      });
    }
  });
  
  // Output as JSON for easy copy-paste
  console.log('\n\n=== JSON Output (for transferDataParser.ts) ===');
  const transferDataFormat = {};
  Object.entries(allRumours).forEach(([teamName, rumours]) => {
    if (rumours.length > 0) {
      transferDataFormat[teamName] = rumours.map(r => ({
        player: r.player,
        transferType: 'Transfer In',
        club: r.fromClub
      }));
    }
  });
  console.log(JSON.stringify(transferDataFormat, null, 2));
}

main().catch(console.error);


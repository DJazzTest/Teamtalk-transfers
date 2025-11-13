// Script to test staging APIs and identify which team each belongs to

const API_URLS = [
  'https://stagingapi.tt-apis.com/api/transfer-window-countdown?tournament_id=72602',
  'https://stagingapi.tt-apis.com/api/transfers/rumour-teams?seasonYear=2025/26&seasonName=Summer&tournamentId=72602',
  'https://stagingapi.tt-apis.com/api/transfers/top-transfers?seasonYear=2025/26&seasonName=Summer&tournamentId=72602',
  'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1205&page=1&tournamentId=72602',
  'https://stagingapi.tt-apis.com/api/transfers/done-deal-teams?seasonName=Summer&seasonYear=2025/26&tournamentId=72602',
  'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1215&page=1&tournamentId=72602',
  'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1124&page=1&tournamentId=72602',
  'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1276&page=1&tournamentId=72602',
  'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1125&page=1&tournamentId=72602',
  'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1126&page=1&tournamentId=72602',
  'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1317&page=1&tournamentId=72602',
  'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1367&page=1&tournamentId=72602',
  'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1408&page=1&tournamentId=72602',
  'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1431&page=1&tournamentId=72602',
  'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1132&page=1&tournamentId=72602',
  'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1548&page=1&tournamentId=72602',
  'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1571&page=1&tournamentId=72602',
  'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1143&page=1&tournamentId=72602',
  'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1599&page=1&tournamentId=72602',
  'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1136&page=1&tournamentId=72602',
  'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1748&page=1&tournamentId=72602',
  'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1779&page=1&tournamentId=72602',
  'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1811&page=1&tournamentId=72602',
  'https://stagingapi.tt-apis.com/api/transfers/get-rumours?seasonYear=2025/26&seasonName=Summer&team_id=1837&page=1&tournamentId=72602',
  'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1124',
  'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1125',
  'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1126',
  'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1132',
  'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1136',
  'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1143',
  'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1205',
  'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1215',
  'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1276',
  'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1317',
  'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1367',
  'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1408',
  'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1431',
  'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1548',
  'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1571',
  'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1599',
  'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1748',
  'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1779',
  'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1811',
  'https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=1837',
];

async function testApi(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // Extract team name from various possible response structures
    let teamName = null;
    let teamId = null;
    
    // Extract team_id from URL
    const teamIdMatch = url.match(/team_id=(\d+)/);
    if (teamIdMatch) {
      teamId = teamIdMatch[1];
    }
    
    // Try to find team name in response
    if (data.result) {
      // Check for team name in done_deals
      if (data.result.done_deals && Array.isArray(data.result.done_deals) && data.result.done_deals.length > 0) {
        const firstDeal = data.result.done_deals[0];
        if (firstDeal.team?.name) teamName = firstDeal.team.name;
        else if (firstDeal.team?.nm) teamName = firstDeal.team.nm;
        else if (firstDeal.toClub) teamName = firstDeal.toClub;
        else if (firstDeal.to) teamName = firstDeal.to;
      }
      
      // Check for team name in rumours
      if (data.result.rumours && Array.isArray(data.result.rumours) && data.result.rumours.length > 0) {
        const firstRumour = data.result.rumours[0];
        if (firstRumour.team?.name) teamName = firstRumour.team.name;
        else if (firstRumour.team?.nm) teamName = firstRumour.team.nm;
        else if (firstRumour.toClub) teamName = firstRumour.toClub;
        else if (firstRumour.to) teamName = firstRumour.to;
      }
      
      // Check for team name in teams array
      if (data.result.teams && Array.isArray(data.result.teams) && data.result.teams.length > 0) {
        const team = data.result.teams.find(t => t.id === parseInt(teamId) || t.team_id === parseInt(teamId));
        if (team) {
          teamName = team.name || team.nm || team.teamName;
        }
      }
    }
    
    // Check top level
    if (data.teams && Array.isArray(data.teams)) {
      const team = data.teams.find(t => t.id === parseInt(teamId) || t.team_id === parseInt(teamId));
      if (team) {
        teamName = team.name || team.nm || team.teamName;
      }
    }
    
    return {
      url,
      teamId,
      teamName,
      hasData: data.result && (
        (data.result.done_deals && data.result.done_deals.length > 0) ||
        (data.result.rumours && data.result.rumours.length > 0) ||
        (data.result.teams && data.result.teams.length > 0) ||
        (data.result.top_transfers && data.result.top_transfers.length > 0)
      ),
      dataCount: data.result ? (
        (data.result.done_deals?.length || 0) +
        (data.result.rumours?.length || 0) +
        (data.result.teams?.length || 0) +
        (data.result.top_transfers?.length || 0)
      ) : 0,
      status: response.status,
      message: data.message
    };
  } catch (error) {
    return {
      url,
      teamId,
      teamName: null,
      hasData: false,
      error: error.message
    };
  }
}

async function main() {
  console.log('Testing staging APIs...\n');
  
  const results = [];
  for (const url of API_URLS) {
    const result = await testApi(url);
    results.push(result);
    console.log(`Team ID: ${result.teamId || 'N/A'}, Team: ${result.teamName || 'Unknown'}, Has Data: ${result.hasData}, Count: ${result.dataCount || 0}`);
    await new Promise(resolve => setTimeout(resolve, 200)); // Rate limiting
  }
  
  // Group by team_id
  const byTeamId = {};
  results.forEach(r => {
    if (r.teamId) {
      if (!byTeamId[r.teamId]) {
        byTeamId[r.teamId] = [];
      }
      byTeamId[r.teamId].push(r);
    }
  });
  
  console.log('\n\n=== Team ID Mapping ===');
  Object.keys(byTeamId).sort().forEach(teamId => {
    const teamResults = byTeamId[teamId];
    const teamName = teamResults.find(r => r.teamName)?.teamName || 'Unknown';
    console.log(`Team ID ${teamId}: ${teamName}`);
  });
  
  // Group by API type
  console.log('\n\n=== APIs by Type ===');
  const countdown = results.filter(r => r.url.includes('countdown'));
  const rumourTeams = results.filter(r => r.url.includes('rumour-teams'));
  const topTransfers = results.filter(r => r.url.includes('top-transfers'));
  const doneDealTeams = results.filter(r => r.url.includes('done-deal-teams'));
  const getRumours = results.filter(r => r.url.includes('get-rumours'));
  const getDoneDeals = results.filter(r => r.url.includes('get-done-deals-by-team'));
  
  console.log(`Countdown: ${countdown.length}`);
  console.log(`Rumour Teams: ${rumourTeams.length}`);
  console.log(`Top Transfers: ${topTransfers.length}`);
  console.log(`Done Deal Teams: ${doneDealTeams.length}`);
  console.log(`Get Rumours (by team): ${getRumours.length}`);
  console.log(`Get Done Deals (by team): ${getDoneDeals.length}`);
}

main().catch(console.error);


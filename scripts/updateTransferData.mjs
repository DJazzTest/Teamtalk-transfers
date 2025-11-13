// Script to update transfer data with comprehensive list and fetch fees from API

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

async function fetchTransferFees(teamId) {
  try {
    const url = `https://stagingapi.tt-apis.com/api/transfers/get-done-deals-by-team?seasonName=Summer&seasonYear=2025/26&team_id=${teamId}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.result?.done_deals) {
      const feeMap = {};
      data.result.done_deals.forEach(deal => {
        const playerName = deal.player?.nm?.trim();
        const fee = deal.prc;
        if (playerName && fee) {
          feeMap[playerName] = fee.replace('€', '£').replace('Million', 'm');
        }
      });
      return feeMap;
    }
    return {};
  } catch (error) {
    console.error(`Error fetching fees for team ${teamId}:`, error);
    return {};
  }
}

async function main() {
  console.log('Fetching transfer fees from API...\n');
  
  const allFees = {};
  for (const [teamName, teamId] of Object.entries(TEAM_IDS)) {
    console.log(`Fetching fees for ${teamName}...`);
    const fees = await fetchTransferFees(teamId);
    allFees[teamName] = fees;
    await new Promise(resolve => setTimeout(resolve, 300)); // Rate limiting
  }
  
  console.log('\n=== Transfer Fees by Team ===');
  Object.entries(allFees).forEach(([team, fees]) => {
    if (Object.keys(fees).length > 0) {
      console.log(`\n${team}:`);
      Object.entries(fees).forEach(([player, fee]) => {
        console.log(`  ${player}: ${fee}`);
      });
    }
  });
  
  // Output as JSON for easy copy-paste
  console.log('\n\n=== JSON Output ===');
  console.log(JSON.stringify(allFees, null, 2));
}

main().catch(console.error);


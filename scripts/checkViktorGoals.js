/**
 * Quick script to check Viktor Gyökeres goals in recent Arsenal matches
 */

const ARSENAL_TEAM_ID = '1-1538'; // Correct Arsenal team ID from Sport365

async function fetchMatchDetails(matchId) {
  try {
    const url = `https://api.sport365.com/v1/en/match/soccer/full/${matchId}?boxscore=1&estats=1&tf=1&tlge=1&wh2h=1&wstats=1&wtops=1`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    return null;
  }
}

function findViktorGoals(matchData) {
  const variants = ['viktor', 'gyokeres', 'gyökeres', 'v. gyokeres', 'v. gyökeres'];
  const goalScorers = [];
  
  // Check events
  if (matchData.events && Array.isArray(matchData.events)) {
    for (const ev of matchData.events) {
      const isGoal = /goal/i.test(ev.type || ev.eventType || '');
      if (isGoal) {
        const playerName = (ev.player || ev.player_name || ev.scorer || ev.name || '').toLowerCase();
        if (variants.some(v => playerName.includes(v))) {
          goalScorers.push({
            name: ev.player || ev.player_name || ev.scorer || ev.name,
            minute: ev.minute || ev.time,
            team: ev.team || ev.team_name
          });
        }
      }
    }
  }
  
  // Check goals array
  if (Array.isArray(matchData.goals)) {
    for (const g of matchData.goals) {
      const playerName = (g.player || g.player_name || g.scorer || '').toLowerCase();
      if (variants.some(v => playerName.includes(v))) {
        goalScorers.push({
          name: g.player || g.player_name || g.scorer,
          minute: g.minute,
          team: g.team || g.team_name
        });
      }
    }
  }
  
  return goalScorers;
}

async function checkViktorGoals() {
  console.log('🔍 Checking Viktor Gyökeres goals for Arsenal...\n');
  
  // Get Arsenal team page to find recent matches
  const teamPageUrl = `https://api.sport365.com/v1/en/team/soccer/teampage/${ARSENAL_TEAM_ID}`;
  
  try {
    const teamPageResponse = await fetch(teamPageUrl);
    const teamPageData = await teamPageResponse.json();
    
    const results = teamPageData.results || [];
    console.log(`✅ Found ${results.length} Arsenal results\n`);
    
    if (results.length === 0) {
      console.log('❌ No results found');
      return;
    }
    
    let totalGoals = 0;
    const goalDetails = [];
    
    // Check first 10 matches
    const matchesToCheck = results.slice(0, 10);
    
    console.log(`📊 Checking ${matchesToCheck.length} matches...\n`);
    
    for (let i = 0; i < matchesToCheck.length; i++) {
      const match = matchesToCheck[i];
      const matchId = match.id;
      
      if (!matchId) continue;
      
      const homeTeam = match.home_name || match.teams?.[0]?.name || 'Unknown';
      const awayTeam = match.away_name || match.teams?.[1]?.name || 'Unknown';
      const score = match.ft_score ? `${match.ft_score[0]}-${match.ft_score[1]}` : 
                    match.score ? `${match.score[0]}-${match.score[1]}` : 'N/A';
      
      process.stdout.write(`  Match ${i + 1}/${matchesToCheck.length}: ${homeTeam} vs ${awayTeam}... `);
      
      const matchData = await fetchMatchDetails(matchId);
      
      if (!matchData) {
        console.log('❌ Could not fetch details');
        continue;
      }
      
      const viktorGoals = findViktorGoals(matchData);
      
      if (viktorGoals.length > 0) {
        totalGoals += viktorGoals.length;
        goalDetails.push({
          match: `${homeTeam} vs ${awayTeam}`,
          score: score,
          goals: viktorGoals
        });
        console.log(`✅ ${viktorGoals.length} goal(s)!`);
      } else {
        // Show all scorers for debugging
        const allScorers = [];
        if (matchData.events) {
          for (const ev of matchData.events) {
            if (/goal/i.test(ev.type || ev.eventType || '')) {
              allScorers.push(ev.player || ev.player_name || ev.scorer || ev.name);
            }
          }
        }
        console.log(`(${allScorers.length} goals: ${allScorers.slice(0, 3).join(', ')})`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log(`\n📈 SUMMARY: Viktor Gyökeres Goals for Arsenal`);
    console.log('='.repeat(60));
    console.log(`\n🎯 Total Goals: ${totalGoals}`);
    console.log(`📊 Matches Checked: ${matchesToCheck.length} of ${results.length}`);
    
    if (goalDetails.length > 0) {
      console.log(`\n📋 Goal Details:\n`);
      goalDetails.forEach((detail, idx) => {
        console.log(`  ${idx + 1}. ${detail.match} (${detail.score})`);
        detail.goals.forEach(goal => {
          console.log(`     ⚽ ${goal.name} ${goal.minute || ''}`.trim());
        });
      });
    } else {
      console.log('\n⚠️  No goals found for Viktor Gyökeres in checked matches');
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkViktorGoals();


/**
 * Script to count how many goals Viktor Gyökeres has scored for Arsenal
 * by checking all Arsenal matches in the Sport365 API
 */

const PLAYER_NAME_VARIANTS = [
  'Viktor Gyökeres',
  'Viktor Gyokeres',
  'Gyökeres',
  'Gyokeres',
  'V. Gyökeres',
  'V. Gyokeres',
  'Viktor',
  'Gyokeres Viktor'
];

async function fetchWithProxy(url) {
  const proxies = [
    url, // Try direct first
    `https://cors.isomorphic-git.org/${url}`,
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?${encodeURIComponent(url)}`
  ];

  let lastError = null;
  for (const proxyUrl of proxies) {
    try {
      const response = await fetch(proxyUrl, {
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        let text = await response.text();
        
        // Handle allorigins wrapper
        if (proxyUrl.includes('allorigins.win')) {
          const wrapped = JSON.parse(text);
          text = wrapped.contents;
        }
        
        return JSON.parse(text);
      } else {
        lastError = new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      lastError = error;
      continue;
    }
  }
  
  throw lastError || new Error('All proxies failed');
}

function normalizePlayerName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove special characters like ö
    .replace(/\s+/g, ' ');
}

function matchesPlayer(scorerName, playerVariants) {
  const normalizedScorer = normalizePlayerName(scorerName);
  
  for (const variant of playerVariants) {
    const normalizedVariant = normalizePlayerName(variant);
    
    // Check if last name matches (most reliable)
    const scorerParts = normalizedScorer.split(' ');
    const variantParts = normalizedVariant.split(' ');
    
    if (scorerParts.length > 0 && variantParts.length > 0) {
      const scorerLastName = scorerParts[scorerParts.length - 1];
      const variantLastName = variantParts[variantParts.length - 1];
      
      // Check if last names match (handling ö/o variations)
      if (scorerLastName === variantLastName || 
          scorerLastName.replace('o', 'ö') === variantLastName ||
          variantLastName.replace('o', 'ö') === scorerLastName ||
          scorerLastName.replace('ö', 'o') === variantLastName ||
          variantLastName.replace('ö', 'o') === scorerLastName) {
        return true;
      }
    }
    
    // Check if full name contains variant or vice versa
    if (normalizedScorer.includes(normalizedVariant) || 
        normalizedVariant.includes(normalizedScorer)) {
      return true;
    }
  }
  
  return false;
}

async function getArsenalMatches() {
  const now = new Date();
  const seasonStart = new Date(now.getFullYear(), 7, 1); // August 1
  if (now.getMonth() < 7) {
    seasonStart.setFullYear(seasonStart.getFullYear() - 1);
  }
  
  const fromDate = seasonStart.toISOString();
  const toDate = now.toISOString();
  
  const url = `https://api.sport365.com/v1/en/matches/soccer/from/${encodeURIComponent(fromDate)}/to/${encodeURIComponent(toDate)}`;
  
  console.log(`\n📅 Fetching Arsenal matches from ${fromDate} to ${toDate}...`);
  
  try {
    const data = await fetchWithProxy(url);
    
    // Handle different response structures
    let allMatches = [];
    
    if (Array.isArray(data)) {
      // Could be array of matches or array of competitions
      if (data[0]?.matches) {
        // Array of competitions, each with matches
        for (const comp of data) {
          if (comp.matches && Array.isArray(comp.matches)) {
            allMatches.push(...comp.matches);
          }
        }
      } else {
        // Direct array of matches
        allMatches = data;
      }
    } else if (data.matches) {
      allMatches = Array.isArray(data.matches) ? data.matches : [];
    }
    
    // Filter for Arsenal matches
    const arsenalMatches = allMatches.filter(match => {
      // Check teams array
      if (match.teams && Array.isArray(match.teams)) {
        return match.teams.some(team => 
          team.name && team.name.toLowerCase().includes('arsenal')
        );
      }
      
      // Check various team name fields
      const homeName = (match.home_name || match.homeTeam || match.hn || match.home?.name || '').toLowerCase();
      const awayName = (match.away_name || match.awayTeam || match.an || match.away?.name || '').toLowerCase();
      
      return homeName.includes('arsenal') || awayName.includes('arsenal');
    });
    
    console.log(`✅ Found ${arsenalMatches.length} Arsenal matches`);
    return arsenalMatches;
  } catch (error) {
    console.error('❌ Error fetching matches:', error.message);
    return [];
  }
}

async function getMatchGoalScorers(matchId) {
  try {
    const url = `https://api.sport365.com/v1/en/match/soccer/full/${matchId}?boxscore=1&estats=1&tf=1&tlge=1&wh2h=1&wstats=1&wtops=1`;
    const data = await fetchWithProxy(url);
    
    const goalScorers = [];
    
    // Try various structures for goals
    // Variant 1: events array
    if (data.events && Array.isArray(data.events)) {
      for (const ev of data.events) {
        const isGoal = /goal/i.test(ev.type || ev.eventType || '');
        if (isGoal && (ev.player || ev.player_name || ev.scorer || ev.name)) {
          goalScorers.push({
            name: ev.player || ev.player_name || ev.scorer || ev.name || 'Unknown',
            minute: ev.minute || ev.time,
            team: ev.team || ev.team_name,
            type: ev.detail || ev.subtype
          });
        }
      }
    }
    
    // Variant 2: goals array
    if (goalScorers.length === 0 && Array.isArray(data.goals)) {
      for (const g of data.goals) {
        if (g.player || g.player_name || g.scorer) {
          goalScorers.push({
            name: g.player || g.player_name || g.scorer || 'Unknown',
            minute: g.minute,
            team: g.team || g.team_name,
            type: g.type
          });
        }
      }
    }
    
    // Variant 3: timeline
    const timeline = data.timeline || data.match_timeline || [];
    if (goalScorers.length === 0 && Array.isArray(timeline)) {
      for (const ev of timeline) {
        const isGoal = /goal/i.test(ev.type || ev.event || '');
        if (isGoal && (ev.player || ev.player_name)) {
          goalScorers.push({
            name: ev.player || ev.player_name || 'Unknown',
            minute: ev.minute || ev.time,
            team: ev.team || ev.team_name,
            type: ev.detail
          });
        }
      }
    }
    
    return goalScorers;
  } catch (error) {
    return [];
  }
}

async function countViktorGoals() {
  console.log('🔍 Searching for Viktor Gyökeres goals for Arsenal...\n');
  
  try {
    // Get all Arsenal matches
    const matches = await getArsenalMatches();
    
    if (matches.length === 0) {
      console.log('❌ No Arsenal matches found');
      return;
    }
    
    let totalGoals = 0;
    const goalDetails = [];
    
    // Check each match for Viktor's goals
    console.log(`\n📊 Checking ${matches.length} matches for goal scorers...\n`);
    
    // Limit to first 15 matches for testing
    const matchesToCheck = matches.slice(0, 15);
    
    for (let i = 0; i < matchesToCheck.length; i++) {
      const match = matchesToCheck[i];
      const matchId = match.id || match.match_id;
      
      if (!matchId) {
        continue;
      }
      
      const homeTeam = match.teams?.[0]?.name || match.home_name || match.homeTeam || 'Unknown';
      const awayTeam = match.teams?.[1]?.name || match.away_name || match.awayTeam || 'Unknown';
      const score = match.score ? `${match.score[0]}-${match.score[1]}` : 
                    match.ft_score ? `${match.ft_score[0]}-${match.ft_score[1]}` : 
                    match.ft || 'N/A';
      
      process.stdout.write(`  🔍 Match ${i + 1}/${matchesToCheck.length}: ${homeTeam} vs ${awayTeam}... `);
      
      try {
        const scorers = await getMatchGoalScorers(matchId);
        
        // Check if Viktor scored
        const viktorGoals = scorers.filter(scorer => 
          matchesPlayer(scorer.name, PLAYER_NAME_VARIANTS) &&
          (scorer.team?.toLowerCase().includes('arsenal') || 
           homeTeam.toLowerCase().includes('arsenal') ||
           awayTeam.toLowerCase().includes('arsenal'))
        );
        
        if (viktorGoals.length > 0) {
          totalGoals += viktorGoals.length;
          goalDetails.push({
            match: `${homeTeam} vs ${awayTeam}`,
            score: score,
            goals: viktorGoals.map(g => `${g.name} ${g.minute || ''}`.trim())
          });
          console.log(`✅ Found ${viktorGoals.length} goal(s)!`);
        } else {
          console.log(`(${scorers.length} scorers found)`);
        }
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log(`\n📈 SUMMARY: Viktor Gyökeres Goals for Arsenal`);
    console.log('='.repeat(60));
    console.log(`\n🎯 Total Goals Found: ${totalGoals}`);
    console.log(`📊 Matches Checked: ${matchesToCheck.length} of ${matches.length}`);
    
    if (goalDetails.length > 0) {
      console.log(`\n📋 Goal Details:\n`);
      goalDetails.forEach((detail, idx) => {
        console.log(`  ${idx + 1}. ${detail.match} (${detail.score})`);
        detail.goals.forEach(goal => {
          console.log(`     ⚽ ${goal}`);
        });
      });
    } else {
      console.log('\n⚠️  No goals found for Viktor Gyökeres in checked matches');
      console.log('   (Note: Only checked first 15 matches due to API rate limits)');
      console.log('   All scorers found in matches:');
      // Show sample of all scorers to help debug
      if (matchesToCheck.length > 0) {
        try {
          const sampleMatch = matchesToCheck[0];
          const sampleScorers = await getMatchGoalScorers(sampleMatch.id || sampleMatch.match_id);
          if (sampleScorers.length > 0) {
            console.log(`   Sample from first match: ${sampleScorers.slice(0, 5).map(s => s.name).join(', ')}`);
          }
        } catch (e) {
          // Ignore
        }
      }
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

// Run the script
countViktorGoals();

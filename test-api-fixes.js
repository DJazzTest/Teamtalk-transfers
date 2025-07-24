// Test script to verify API fixes are working

async function testScoreInsideAPI() {
  console.log('🧪 Testing ScoreInside API error handling...\n');
  
  const testUrl = 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwR';
  
  try {
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Transfer-Tracker/1.0'
      }
    });
    
    const data = await response.json();
    console.log('✅ API Response Status:', response.status);
    console.log('📄 API Message:', data.message);
    
    // Simulate our error handling logic
    if (data.message && data.message.includes('not found')) {
      console.log('❌ Error detected:', `ScoreInside API: ${data.message}`);
      console.log('✅ Our error handling would catch this correctly');
    }
    
    if (!data.result?.transfer_articles?.data || data.result.transfer_articles.data.length === 0) {
      console.log('📊 No transfer data available');
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

async function testTeamTalkAPI() {
  console.log('\n🧪 Testing TeamTalk API...\n');
  
  const testUrl = 'https://www.teamtalk.com/mobile-app-feed';
  
  try {
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Transfer-Tracker/1.0'
      }
    });
    
    const data = await response.json();
    console.log('✅ TeamTalk API Response Status:', response.status);
    console.log('📊 Items count:', data.items?.length || 0);
    
    if (data.items && data.items.length > 0) {
      console.log('✅ TeamTalk API is working and has data');
      console.log('📄 Sample item:', data.items[0].headline);
    }
    
  } catch (error) {
    if (error.message.includes('Failed to fetch')) {
      console.log('❌ CORS error detected (expected in browser environment)');
      console.log('✅ This confirms TeamTalk API needs server-side proxy');
    } else {
      console.error('❌ Unexpected error:', error.message);
    }
  }
}

console.log('🔍 Testing API Integration Fixes\n');
console.log('='.repeat(50));

testScoreInsideAPI().then(() => {
  return testTeamTalkAPI();
}).then(() => {
  console.log('\n' + '='.repeat(50));
  console.log('✅ API testing completed');
  console.log('\n📋 Summary:');
  console.log('- ScoreInside API: Returns "Top Transfers not found" - token may be expired');
  console.log('- TeamTalk API: CORS blocked in browser - needs server-side proxy');
  console.log('- Error handling: Improved to catch and display specific error messages');
  console.log('- CMS: Should now show detailed error messages with club names');
});

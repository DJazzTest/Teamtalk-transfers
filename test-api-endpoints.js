// Test script to verify API endpoints are working
const testApis = async () => {
  console.log('🧪 Testing API Endpoints...\n');

  // Test TeamTalk API
  console.log('📰 Testing TeamTalk API...');
  try {
    const response = await fetch('https://www.teamtalk.com/mobile-app-feed');
    const data = await response.json();
    console.log(`✅ TeamTalk API: ${response.status} - ${data.articles?.length || 0} articles`);
  } catch (error) {
    console.log(`❌ TeamTalk API failed: ${error.message}`);
  }

  // Test a few ScoreInside APIs
  const testClubs = [
    { name: 'Arsenal', slug: 'arsenal' },
    { name: 'Liverpool', slug: 'liverpool' },
    { name: 'Manchester United', slug: 'manchester-united' },
    { name: 'Chelsea', slug: 'chelsea' }
  ];

  console.log('\n⚽ Testing ScoreInside APIs...');
  
  for (const club of testClubs) {
    try {
      const url = `https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=fDqpX1kEnCaKnCaWqRdJAP:APA91bEThSCAH7pP9HfDem3Jd5dTQ6BHCRY3u-P9vOZ7XvJy-Y9zKxCvLu2xJPM6JACUDLdRbuBcPYqtLJ24o5nUlcZeYRk&team_slug=${club.slug}`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Transfer-Tracker/1.0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const articles = data.result?.transfer_articles?.data || [];
        console.log(`✅ ${club.name}: ${response.status} - ${articles.length} transfers`);
      } else {
        console.log(`❌ ${club.name}: HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${club.name}: ${error.message}`);
    }
  }

  console.log('\n🏁 API testing complete!');
};

// Run the tests
testApis();

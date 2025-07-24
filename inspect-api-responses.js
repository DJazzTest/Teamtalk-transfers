// Detailed API response inspector to see what's actually being returned
const inspectApis = async () => {
  console.log('🔍 Inspecting API Responses in Detail...\n');

  // Test TeamTalk API
  console.log('📰 TeamTalk API Response:');
  try {
    const response = await fetch('https://www.teamtalk.com/mobile-app-feed');
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response structure:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
    console.log('Keys:', Object.keys(data));
    if (data.articles) {
      console.log('Articles count:', data.articles.length);
    }
  } catch (error) {
    console.log(`❌ TeamTalk API failed: ${error.message}`);
  }

  console.log('\n⚽ ScoreInside API Response (Arsenal):');
  try {
    const url = `https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=fDqpX1kEnCaKnCaWqRdJAP:APA91bEThSCAH7pP9HfDem3Jd5dTQ6BHCRY3u-P9vOZ7XvJy-Y9zKxCvLu2xJPM6JACUDLdRbuBcPYqtLJ24o5nUlcZeYRk&team_slug=arsenal`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Transfer-Tracker/1.0'
      }
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response structure:', JSON.stringify(data, null, 2).substring(0, 800) + '...');
    console.log('Keys:', Object.keys(data));
    
    if (data.result) {
      console.log('Result keys:', Object.keys(data.result));
      if (data.result.transfer_articles) {
        console.log('Transfer articles keys:', Object.keys(data.result.transfer_articles));
        console.log('Transfer articles data length:', data.result.transfer_articles.data?.length || 0);
      }
    }
  } catch (error) {
    console.log(`❌ ScoreInside API failed: ${error.message}`);
  }

  console.log('\n🏁 API inspection complete!');
};

// Run the inspection
inspectApis();

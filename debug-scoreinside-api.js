// Using built-in fetch in Node.js 18+

async function debugScoreInsideAPI() {
  console.log('🔍 Debugging ScoreInside API...\n');
  
  const testUrl = 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRaE:APA91bGgvQrKCgfJnOZXmKcfhKlGhCnJxwIGQVJsGdKpGgvQrKCgfJnOZXmKcfhKlGhCnJxwIGQVJsGdKpGgvQrKCgfJnOZXmKcfhKlGhCnJxwIGQVJsGdKp';
  
  try {
    console.log('📡 Making request to:', testUrl);
    console.log('');
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Transfer-Tracker/1.0',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('');
    
    const responseText = await response.text();
    console.log('📄 Raw Response:', responseText);
    console.log('');
    
    try {
      const data = JSON.parse(responseText);
      console.log('🔍 Parsed JSON Structure:');
      console.log('- Keys:', Object.keys(data));
      
      if (data.result) {
        console.log('- Result keys:', Object.keys(data.result));
        
        if (data.result.transfer_articles) {
          console.log('- Transfer articles keys:', Object.keys(data.result.transfer_articles));
          console.log('- Transfer articles data length:', data.result.transfer_articles.data?.length || 0);
        }
      }
      
      if (data.message) {
        console.log('- Message:', data.message);
      }
      
      if (data.error) {
        console.log('- Error:', data.error);
      }
      
    } catch (parseError) {
      console.log('❌ Failed to parse JSON:', parseError.message);
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

debugScoreInsideAPI();

// Simple API test
async function testAPI() {
  console.log('🔍 Testing TeamTalk API...');
  try {
    const response = await fetch('https://www.teamtalk.com/mobile-app-feed');
    const data = await response.json();
    console.log('✅ TeamTalk API responded');
    console.log('📊 Total articles:', data.items?.length || 0);
    
    // Check for Hugo Ekitike
    const ekitikeArticles = data.items?.filter(item => 
      item.headline?.toLowerCase().includes('hugo ekitike')
    ) || [];
    
    console.log('🎯 Hugo Ekitike articles:', ekitikeArticles.length);
    
    // Show most recent 3 articles
    console.log('\n📰 Most recent 3 articles:');
    const recent3 = data.items?.slice(0, 3) || [];
    recent3.forEach(article => {
      console.log(`  - ${article.headline} (${article.pub_date})`);
    });
    
  } catch (error) {
    console.log('❌ TeamTalk API error:', error.message);
  }
}

testAPI();

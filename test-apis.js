// Test script to check API data freshness
const https = require('https');

// Test TeamTalk API
async function testTeamTalkAPI() {
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
    if (ekitikeArticles.length > 0) {
      ekitikeArticles.forEach(article => {
        console.log(`  - ${article.headline} (${article.pub_date})`);
      });
    }
    
  } catch (error) {
    console.log('❌ TeamTalk API error:', error.message);
  }
}

// Test ScoreInside API for Liverpool
async function testScoreInsideAPI() {
  console.log('\n🔍 Testing ScoreInside API (Liverpool)...');
  const liverpoolUrl = 'https://api.scoreinside.com/v1/transfers/liverpool?fcm_token=test';
  
  try {
    const response = await fetch(liverpoolUrl);
    const data = await response.json();
    console.log('✅ ScoreInside API responded');
    console.log('📊 Transfer articles:', data.result?.transfer_articles?.data?.length || 0);
    
    // Look for Hugo Ekitike
    const articles = data.result?.transfer_articles?.data || [];
    const ekitikeArticles = articles.filter(article => 
      article.player?.nm?.toLowerCase().includes('hugo ekitike')
    );
    
    console.log('🎯 Hugo Ekitike articles:', ekitikeArticles.length);
    if (ekitikeArticles.length > 0) {
      ekitikeArticles.forEach(article => {
        console.log(`  - ${article.article.hdl} (${article.article.sdt})`);
      });
    }
    
  } catch (error) {
    console.log('❌ ScoreInside API error:', error.message);
  }
}

// Run tests
async function runTests() {
  await testTeamTalkAPI();
  await testScoreInsideAPI();
}

runTests();

// Comprehensive API test script
// Tests all APIs used in the application

const FCM_TOKEN = 'ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ';

const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

async function testApi(name, url, options = {}) {
  const startTime = Date.now();
  try {
    console.log(`\n🧪 Testing ${name}...`);
    console.log(`   URL: ${url.substring(0, 80)}...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TransferCentre/1.0',
        ...(options.headers || {})
      }
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const dataSize = JSON.stringify(data).length;
    
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   ⏱️  Response time: ${responseTime}ms`);
    console.log(`   📦 Data size: ${(dataSize / 1024).toFixed(2)} KB`);
    
    // Try to extract useful info
    if (data.items && Array.isArray(data.items)) {
      console.log(`   📰 Articles: ${data.items.length}`);
    } else if (data.result?.transfer_articles?.data) {
      console.log(`   📰 Transfers: ${data.result.transfer_articles.data.length}`);
    } else if (Array.isArray(data)) {
      console.log(`   📰 Items: ${data.length}`);
    } else if (data.data && Array.isArray(data.data)) {
      console.log(`   📰 Items: ${data.data.length}`);
    }
    
    testResults.passed.push({ name, responseTime, status: response.status });
    return { success: true, data, responseTime };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.log(`   ❌ Failed: ${error.message}`);
    testResults.failed.push({ name, error: error.message, responseTime });
    return { success: false, error: error.message, responseTime };
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive API tests...\n');
  console.log('='.repeat(80));
  
  // Test TeamTalk API
  await testApi(
    'TeamTalk Mobile Feed',
    'https://www.teamtalk.com/mobile-app-feed'
  );
  
  // Test TeamTalk Staging API
  await testApi(
    'TeamTalk Staging API',
    'https://stagingapi.tt-apis.com/api/transfer-articles?page=1&per_page=10'
  );
  
  // Test ScoreInside APIs
  const testClubs = [
    { name: 'Arsenal', slug: 'arsenal' },
    { name: 'Liverpool', slug: 'liverpool' },
    { name: 'Manchester United', slug: 'manchester-united' },
    { name: 'Chelsea', slug: 'chelsea' }
  ];
  
  for (const club of testClubs) {
    await testApi(
      `ScoreInside - ${club.name} Transfers`,
      `https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=${FCM_TOKEN}&team_slug=${club.slug}`
    );
    
    await testApi(
      `ScoreInside - ${club.name} News`,
      `https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=${FCM_TOKEN}&team_slug=${club.slug}`
    );
  }
  
  // Test Sport365 API (with base64 handling)
  const sport365Result = await testApi(
    'Sport365 News API',
    'https://news.sport365.com/api/v1/news/entries?sport=1&limit=25&language=1&base64=1'
  );
  
  // If it failed due to base64, try to decode it
  if (!sport365Result.success && sport365Result.error.includes('JSON')) {
    try {
      const response = await fetch('https://news.sport365.com/api/v1/news/entries?sport=1&limit=25&language=1&base64=1');
      const base64Text = await response.text();
      const decoded = Buffer.from(base64Text.trim(), 'base64').toString('utf-8');
      const data = JSON.parse(decoded);
      console.log(`   ✅ Base64 decoded successfully - ${Array.isArray(data) ? data.length : 'N/A'} items`);
      testResults.passed.push({ name: 'Sport365 News API (base64 decoded)', responseTime: sport365Result.responseTime, status: 200 });
      testResults.failed = testResults.failed.filter(t => t.name !== 'Sport365 News API');
    } catch (e) {
      console.log(`   ⚠️  Base64 decode also failed: ${e.message}`);
    }
  }
  
  await testApi(
    'Sport365 Today Matches',
    'https://api.sport365.com/v1/en/matches/soccer/today/0/utc'
  );
  
  // Test SB Live APIs
  await testApi(
    'SB Live Feed',
    'https://inframe.sportsdevhub.com/api/feed?offset=0&client=sblive&sport=soccer&locale=en&topic=general'
  );
  
  await testApi(
    'SB Live Banners',
    'https://inframe.sportsdevhub.com/api/feed/banners?sport=soccer&locale=en&client=sblive'
  );
  
  await testApi(
    'SB Live Pinned',
    'https://inframe.sportsdevhub.com/api/feed/pinned?locale=en&type=general&sport=soccer&matchid=&client=sblive'
  );
  
  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 TEST SUMMARY\n');
  console.log(`✅ Passed: ${testResults.passed.length}`);
  console.log(`❌ Failed: ${testResults.failed.length}`);
  console.log(`⚠️  Warnings: ${testResults.warnings.length}`);
  
  if (testResults.passed.length > 0) {
    console.log('\n✅ PASSED TESTS:');
    testResults.passed.forEach(test => {
      console.log(`   • ${test.name} (${test.responseTime}ms)`);
    });
  }
  
  if (testResults.failed.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.failed.forEach(test => {
      console.log(`   • ${test.name}: ${test.error}`);
    });
  }
  
  const successRate = (testResults.passed.length / (testResults.passed.length + testResults.failed.length) * 100).toFixed(1);
  console.log(`\n📈 Success Rate: ${successRate}%`);
  
  if (testResults.failed.length === 0) {
    console.log('\n🎉 All APIs are working correctly!');
  } else {
    console.log('\n⚠️  Some APIs failed. Please review the errors above.');
  }
}

// Run tests
runAllTests().catch(console.error);


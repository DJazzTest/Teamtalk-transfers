// Debug endpoint to test TikTok API and discover correct endpoint format
const RAPIDAPI_HOST = 'tiktok-api23.p.rapidapi.com';
const TIKTOK_USERNAME = 'rugbyfootballleague';

exports.handler = async (event, context) => {
  const rapidApiKey = process.env.RAPIDAPI_KEY;

  if (!rapidApiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'RAPIDAPI_KEY not set' })
    };
  }

  // Test a few key endpoints
  const testEndpoints = [
    `https://${RAPIDAPI_HOST}/userPosts?username=${TIKTOK_USERNAME}`,
    `https://${RAPIDAPI_HOST}/getUserPosts?username=${TIKTOK_USERNAME}`,
    `https://${RAPIDAPI_HOST}/user/posts?username=${TIKTOK_USERNAME}`,
  ];

  const results = [];

  for (const url of testEndpoints) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': RAPIDAPI_HOST
        }
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      results.push({
        endpoint: url,
        status: response.status,
        statusText: response.statusText,
        response: typeof responseData === 'string' ? responseData.substring(0, 500) : responseData
      });
    } catch (error) {
      results.push({
        endpoint: url,
        error: error.message
      });
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'TikTok API endpoint test results',
      results: results
    }, null, 2)
  };
};


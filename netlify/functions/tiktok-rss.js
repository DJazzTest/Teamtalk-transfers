// Using native fetch (available in Node.js 18+)

// TikTok username
const TIKTOK_USERNAME = 'rugbyfootballleague';
const RAPIDAPI_HOST = 'tiktok-api23.p.rapidapi.com';

/**
 * Try to get user info first to understand API structure
 */
async function getUserInfo(rapidApiKey) {
  const userInfoEndpoints = [
    `https://${RAPIDAPI_HOST}/userInfo?username=${TIKTOK_USERNAME}`,
    `https://${RAPIDAPI_HOST}/getUserInfo?username=${TIKTOK_USERNAME}`,
    `https://${RAPIDAPI_HOST}/user/info?username=${TIKTOK_USERNAME}`,
    `https://${RAPIDAPI_HOST}/user?username=${TIKTOK_USERNAME}`,
  ];

  for (const url of userInfoEndpoints) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': RAPIDAPI_HOST
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log(`Found user info endpoint: ${url}`);
        return data;
      }
    } catch (e) {
      // Continue trying
    }
  }
  return null;
}

/**
 * Fetch TikTok posts from RapidAPI
 */
async function fetchTikTokPosts(rapidApiKey) {
  if (!rapidApiKey) {
    throw new Error('RAPIDAPI_KEY is not set in environment variables');
  }

  // Try to get user info first - this might help us understand the API structure
  const userInfo = await getUserInfo(rapidApiKey);
  if (userInfo) {
    console.log('User info retrieved, API connection working');
  }

  // Try different possible endpoint formats - prioritizing most common RapidAPI TikTok patterns
  // Based on the API name "tiktok-api23" and common RapidAPI endpoint structures
  const endpoints = [
    // TikTok-specific endpoint names
    `https://${RAPIDAPI_HOST}/feed?username=${TIKTOK_USERNAME}`,
    `https://${RAPIDAPI_HOST}/timeline?username=${TIKTOK_USERNAME}`,
    `https://${RAPIDAPI_HOST}/aweme?username=${TIKTOK_USERNAME}`,
    `https://${RAPIDAPI_HOST}/userFeed?username=${TIKTOK_USERNAME}`,
    `https://${RAPIDAPI_HOST}/userTimeline?username=${TIKTOK_USERNAME}`,
    // Most likely formats for TikTok API23 on RapidAPI (camelCase)
    `https://${RAPIDAPI_HOST}/userPosts?username=${TIKTOK_USERNAME}`,
    `https://${RAPIDAPI_HOST}/userPostsByUsername?username=${TIKTOK_USERNAME}`,
    `https://${RAPIDAPI_HOST}/getUserPosts?username=${TIKTOK_USERNAME}`,
    `https://${RAPIDAPI_HOST}/getUserVideos?username=${TIKTOK_USERNAME}`,
    // snake_case variations
    `https://${RAPIDAPI_HOST}/user_posts?username=${TIKTOK_USERNAME}`,
    `https://${RAPIDAPI_HOST}/get_user_posts?username=${TIKTOK_USERNAME}`,
    `https://${RAPIDAPI_HOST}/user_posts_by_username?username=${TIKTOK_USERNAME}`,
    // kebab-case variations
    `https://${RAPIDAPI_HOST}/user-posts?username=${TIKTOK_USERNAME}`,
    `https://${RAPIDAPI_HOST}/get-user-posts?username=${TIKTOK_USERNAME}`,
    // Path-based formats
    `https://${RAPIDAPI_HOST}/user/posts?username=${TIKTOK_USERNAME}`,
    `https://${RAPIDAPI_HOST}/user/videos?username=${TIKTOK_USERNAME}`,
    // Alternative query parameter names
    `https://${RAPIDAPI_HOST}/posts?username=${TIKTOK_USERNAME}`,
    `https://${RAPIDAPI_HOST}/videos?username=${TIKTOK_USERNAME}`,
    `https://${RAPIDAPI_HOST}/userPosts?user=${TIKTOK_USERNAME}`,
    `https://${RAPIDAPI_HOST}/userPosts?user_id=${TIKTOK_USERNAME}`,
    // Path parameter formats
    `https://${RAPIDAPI_HOST}/user/${TIKTOK_USERNAME}/posts`,
    `https://${RAPIDAPI_HOST}/user/${TIKTOK_USERNAME}/videos`,
    // Versioned API formats
    `https://${RAPIDAPI_HOST}/api/user/posts?username=${TIKTOK_USERNAME}`,
    `https://${RAPIDAPI_HOST}/v1/user/posts?username=${TIKTOK_USERNAME}`,
    `https://${RAPIDAPI_HOST}/v2/user/posts?username=${TIKTOK_USERNAME}`,
    // Additional common patterns
    `https://${RAPIDAPI_HOST}/userPostsByUser?username=${TIKTOK_USERNAME}`,
    `https://${RAPIDAPI_HOST}/getPosts?username=${TIKTOK_USERNAME}`,
    `https://${RAPIDAPI_HOST}/getVideos?username=${TIKTOK_USERNAME}`,
  ];

  let lastError = null;
  let lastStatus = null;
  const triedEndpoints = [];

  for (const url of endpoints) {
    triedEndpoints.push(url);
    try {
      console.log(`Trying endpoint: ${url}`);
      
      // Try GET first
      let response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': RAPIDAPI_HOST
        }
      });

      // If GET fails with 405 (Method Not Allowed), try POST
      if (response.status === 405) {
        console.log(`GET not allowed, trying POST for: ${url}`);
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': RAPIDAPI_HOST,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username: TIKTOK_USERNAME })
        });
      }

      lastStatus = response.status;
      const responseText = await response.text();

      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          console.log(`✅ Success with endpoint: ${url}`);
          return data;
        } catch (parseError) {
          console.error('Failed to parse JSON response:', parseError);
          lastError = `Failed to parse response as JSON: ${parseError.message}`;
          continue;
        }
      } else if (response.status === 401) {
        lastError = `Unauthorized (401): Check your RapidAPI key. Response: ${responseText.substring(0, 200)}`;
        continue; // Try next endpoint
      } else if (response.status === 403) {
        lastError = `Forbidden (403): You may need to subscribe to the API plan on RapidAPI. Response: ${responseText.substring(0, 200)}`;
        // Don't continue - 403 usually means subscription issue, not endpoint issue
        break;
      } else if (response.status === 404) {
        // 404 means endpoint doesn't exist, try next one
        lastError = `Not Found (404): ${responseText.substring(0, 200)}`;
        continue;
      } else {
        lastError = `HTTP ${response.status}: ${responseText.substring(0, 200)}`;
        continue;
      }
    } catch (error) {
      lastError = `Network error: ${error.message}`;
      console.error(`Error with endpoint ${url}:`, error);
      continue;
    }
  }

  // Provide helpful error message with all tried endpoints
  if (lastStatus === 403) {
    throw new Error(`Forbidden (403): You need to subscribe to the TikTok API plan on RapidAPI. Go to https://rapidapi.com/Lundehund/api/tiktok-api23 and subscribe to a plan. Last error: ${lastError}`);
  }
  
  const endpointsList = triedEndpoints.map((ep, i) => `${i + 1}. ${ep}`).join('\n');
  throw new Error(`All API endpoints failed (tried ${triedEndpoints.length} endpoints).\n\nLast status: ${lastStatus}\nLast error: ${lastError || 'Unknown error'}\n\nTried endpoints:\n${endpointsList}\n\nPlease check the RapidAPI playground (https://rapidapi.com/Lundehund/api/tiktok-api23/playground) to find the correct endpoint format and share it with me.`);
}

/**
 * Convert TikTok posts to RSS format
 */
function generateRSS(posts) {
  const items = Array.isArray(posts) ? posts : (posts?.items || posts?.data || posts?.videos || []);
  
  const rssItems = items.map((post, index) => {
    const videoId = post.id || post.aweme_id || post.video_id || post.video?.id || `post-${index}`;
    const description = post.desc || post.description || post.caption || post.text || '';
    const videoUrl = post.video?.play_addr?.url_list?.[0] || 
                     post.video_url || 
                     post.video?.download_addr?.url_list?.[0] ||
                     `https://www.tiktok.com/@${TIKTOK_USERNAME}/video/${videoId}`;
    const thumbnail = post.video?.cover?.url_list?.[0] || 
                     post.video?.cover?.origin_cover?.url_list?.[0] ||
                     post.cover || 
                     post.thumbnail || 
                     post.video?.dynamic_cover?.url_list?.[0] || '';
    const createTime = post.create_time || post.timestamp || post.createTime || Date.now();
    const date = new Date(createTime * 1000 || createTime).toUTCString();
    
    // Clean description for XML
    const cleanDesc = description
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
    
    return `
    <item>
      <title><![CDATA[${description.substring(0, 100)}${description.length > 100 ? '...' : ''}]]></title>
      <link>https://www.tiktok.com/@${TIKTOK_USERNAME}/video/${videoId}</link>
      <guid isPermaLink="true">https://www.tiktok.com/@${TIKTOK_USERNAME}/video/${videoId}</guid>
      <description><![CDATA[
        ${thumbnail ? `<img src="${thumbnail}" alt="Video thumbnail" />` : ''}
        <p>${cleanDesc}</p>
        <p><a href="https://www.tiktok.com/@${TIKTOK_USERNAME}/video/${videoId}">Watch on TikTok</a></p>
      ]]></description>
      <pubDate>${date}</pubDate>
      ${videoUrl ? `<enclosure url="${videoUrl}" type="video/mp4" />` : ''}
    </item>`;
  }).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Rugby Football League - TikTok</title>
    <link>https://www.tiktok.com/@${TIKTOK_USERNAME}</link>
    <description>TikTok posts from @${TIKTOK_USERNAME}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <ttl>60</ttl>
    ${rssItems}
  </channel>
</rss>`;

  return rss;
}

exports.handler = async (event, context) => {
  const rapidApiKey = process.env.RAPIDAPI_KEY;

  if (!rapidApiKey) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/plain'
      },
      body: 'RAPIDAPI_KEY is not configured. Please set it in Netlify environment variables.'
    };
  }

  try {
    const posts = await fetchTikTokPosts(rapidApiKey);
    const rss = generateRSS(posts);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=900' // Cache for 15 minutes
      },
      body: rss
    };
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/plain'
      },
      body: `Error generating RSS feed: ${error.message}`
    };
  }
};




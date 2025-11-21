// Using native fetch (available in Node.js 18+)

// TikTok username
const TIKTOK_USERNAME = 'rugbyfootballleague';
const RAPIDAPI_HOST = 'tiktok-api23.p.rapidapi.com';

/**
 * Get user info to retrieve secUid
 */
async function getUserInfo(rapidApiKey) {
  const url = `https://${RAPIDAPI_HOST}/api/user/info?uniqueId=${TIKTOK_USERNAME}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get user info: HTTP ${response.status} - ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    
    // Extract secUid from the response
    const secUid = data?.userInfo?.user?.secUid;
    if (!secUid) {
      throw new Error('Could not find secUid in user info response');
    }

    console.log(`✅ Retrieved secUid for user: ${TIKTOK_USERNAME}`);
    return secUid;
  } catch (error) {
    throw new Error(`Error fetching user info: ${error.message}`);
  }
}

/**
 * Fetch TikTok posts from RapidAPI
 */
async function fetchTikTokPosts(rapidApiKey) {
  if (!rapidApiKey) {
    throw new Error('RAPIDAPI_KEY is not set in environment variables');
  }

  // Step 1: Get user info to retrieve secUid
  let secUid;
  try {
    secUid = await getUserInfo(rapidApiKey);
  } catch (error) {
    throw new Error(`Failed to get user info: ${error.message}`);
  }

  // Step 2: Get posts using secUid
  const url = `https://${RAPIDAPI_HOST}/api/user/posts?secUid=${encodeURIComponent(secUid)}`;
  
  try {
    console.log(`Fetching posts for secUid: ${secUid}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 403) {
        throw new Error(`Forbidden (403): You need to subscribe to the TikTok API plan on RapidAPI. Go to https://rapidapi.com/Lundehund/api/tiktok-api23 and subscribe to a plan. Response: ${errorText.substring(0, 200)}`);
      }
      throw new Error(`Failed to fetch posts: HTTP ${response.status} - ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    console.log(`✅ Successfully fetched posts`);
    return data;
  } catch (error) {
    throw new Error(`Error fetching posts: ${error.message}`);
  }
}

/**
 * Generate empty RSS feed when no items found
 */
function generateEmptyRSS() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Rugby Football League - TikTok</title>
    <link>https://www.tiktok.com/@${TIKTOK_USERNAME}</link>
    <description>TikTok posts from @${TIKTOK_USERNAME}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <ttl>60</ttl>
  </channel>
</rss>`;
}

/**
 * Convert TikTok posts to RSS format
 */
function generateRSS(posts) {
  // Extract items from various possible response structures
  const items = Array.isArray(posts) 
    ? posts 
    : (posts?.itemList || posts?.items || posts?.data?.itemList || posts?.data?.items || posts?.data || posts?.videos || []);
  
  if (!items || items.length === 0) {
    console.warn('No items found in response:', JSON.stringify(posts).substring(0, 500));
    return generateEmptyRSS();
  }
  
  const rssItems = items.map((post, index) => {
    const videoId = post.id || post.aweme_id || post.video_id || post.video?.id || `post-${index}`;
    const description = post.desc || post.description || post.caption || post.text || '';
    // Extract video URL from various possible structures
    let videoUrl = post.video?.playAddrStruct?.urlList?.[0] ||
                   post.video?.playAddrStruct?.UrlList?.[0] ||
                   post.video?.playAddr ||
                   post.video?.play_addr?.url_list?.[0] || 
                   post.video_url || 
                   post.video?.download_addr?.url_list?.[0] ||
                   `https://www.tiktok.com/@${TIKTOK_USERNAME}/video/${videoId}`;
    
    // Ensure videoUrl is a string
    if (Array.isArray(videoUrl)) {
      videoUrl = videoUrl[0] || `https://www.tiktok.com/@${TIKTOK_USERNAME}/video/${videoId}`;
    }
    const thumbnail = post.video?.cover || 
                     post.video?.originCover ||
                     post.video?.cover?.url_list?.[0] || 
                     post.video?.cover?.origin_cover?.url_list?.[0] ||
                     post.cover || 
                     post.thumbnail || 
                     post.video?.dynamicCover ||
                     post.video?.dynamic_cover?.url_list?.[0] || '';
    const createTime = post.createTime || post.create_time || post.timestamp || Date.now();
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




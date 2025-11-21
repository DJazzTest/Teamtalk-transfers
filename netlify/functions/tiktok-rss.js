// Using native fetch (available in Node.js 18+)

// TikTok username
const TIKTOK_USERNAME = 'rugbyfootballleague';
const RAPIDAPI_HOST = 'tiktok-api23.p.rapidapi.com';

/**
 * Fetch TikTok posts from RapidAPI
 */
async function fetchTikTokPosts(rapidApiKey) {
  if (!rapidApiKey) {
    throw new Error('RAPIDAPI_KEY is not set in environment variables');
  }

  // Try different possible endpoint formats
  const endpoints = [
    `https://${RAPIDAPI_HOST}/user/posts?username=${TIKTOK_USERNAME}`,
    `https://${RAPIDAPI_HOST}/user/${TIKTOK_USERNAME}/posts`,
    `https://${RAPIDAPI_HOST}/user/videos?username=${TIKTOK_USERNAME}`,
  ];

  for (const url of endpoints) {
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
        return data;
      } else if (response.status === 401) {
        throw new Error('Unauthorized: Check your RapidAPI key');
      } else if (response.status === 403) {
        throw new Error('Forbidden: You may need to subscribe to the API plan');
      } else {
        continue;
      }
    } catch (error) {
      if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
        throw error;
      }
      continue;
    }
  }

  throw new Error('All API endpoints failed. Check your RapidAPI key and subscription.');
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


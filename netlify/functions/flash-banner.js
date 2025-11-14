// Netlify serverless function to store and retrieve FlashBanner data
// This allows the banner to sync across all devices and networks
// Uses GitHub API to store data in the repository for persistence

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_REPO = process.env.GITHUB_REPO || 'DJazzTest/Teamtalk-transfers';
const GITHUB_FILE_PATH = 'flash-banner-data.json';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;

// In-memory cache (fallback if GitHub API is not configured)
let cachedBannerData = {
  enabled: false,
  text: '',
  url: '',
  imageDataUrl: '',
  labelType: '',
  backgroundColor: '#fbbf24',
  textColor: '#000000',
  fontSize: '16px',
  fontWeight: '600',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  padding: '12px 16px'
};

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // For GET requests, return the stored banner data
  if (event.httpMethod === 'GET') {
    try {
      let bannerData = { ...cachedBannerData };

      // Try to fetch from GitHub if token is configured
      if (GITHUB_TOKEN) {
        try {
          const response = await fetch(GITHUB_API_URL, {
            headers: {
              'Authorization': `token ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'Netlify-Function'
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.content) {
              const decoded = Buffer.from(data.content, 'base64').toString('utf-8');
              const parsed = JSON.parse(decoded);
              bannerData = { ...bannerData, ...parsed };
              cachedBannerData = bannerData; // Update cache
            }
          } else if (response.status === 404) {
            // File doesn't exist yet, use default
            console.log('Banner data file not found, using defaults');
          }
        } catch (error) {
          console.warn('GitHub fetch failed, using cached/default data:', error.message);
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(bannerData)
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to retrieve banner data' })
      };
    }
  }

  // For POST requests, save the banner data
  if (event.httpMethod === 'POST') {
    try {
      const bannerData = JSON.parse(event.body);

      // Validate the data structure
      if (!bannerData || typeof bannerData !== 'object') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid banner data' })
        };
      }

      // Update cache
      cachedBannerData = bannerData;

      // Try to save to GitHub if token is configured
      if (GITHUB_TOKEN) {
        try {
          // First, try to get the existing file to get its SHA (required for update)
          let sha = null;
          try {
            const getResponse = await fetch(GITHUB_API_URL, {
              headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Netlify-Function'
              }
            });
            if (getResponse.ok) {
              const existingData = await getResponse.json();
              sha = existingData.sha;
            }
          } catch (e) {
            // File doesn't exist, will create new
          }

          // Create or update the file
          const content = Buffer.from(JSON.stringify(bannerData, null, 2)).toString('base64');
          const putResponse = await fetch(GITHUB_API_URL, {
            method: 'PUT',
            headers: {
              'Authorization': `token ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
              'User-Agent': 'Netlify-Function'
            },
            body: JSON.stringify({
              message: 'Update flash banner data',
              content: content,
              sha: sha // Include SHA if updating existing file
            })
          });

          if (putResponse.ok) {
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({ 
                success: true, 
                message: 'Banner data saved to repository (synced across all devices)'
              })
            };
          } else {
            const errorData = await putResponse.json();
            console.error('GitHub save failed:', errorData);
            throw new Error('GitHub API error');
          }
        } catch (error) {
          console.warn('GitHub save failed, using cache only:', error.message);
          // Continue to return success with cache
        }
      }

      // If GitHub is not configured, just use cache (temporary)
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Banner data saved (temporary - configure GITHUB_TOKEN for cross-device sync)',
          warning: 'Data stored in cache only. Set GITHUB_TOKEN environment variable in Netlify for persistent cross-device storage.'
        })
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to save banner data: ' + error.message })
      };
    }
  }

  // Method not allowed
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};

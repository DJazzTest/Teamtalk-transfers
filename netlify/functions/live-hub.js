// Netlify serverless function to store and retrieve Live Hub (Chatter Box) entries
// Mirrors the flash-banner persistence pattern so Live Hub content stays in sync
// across every device and deployment (desktop, mobile, production, etc.)

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_REPO = process.env.GITHUB_REPO || 'DJazzTest/Teamtalk-transfers';
const GITHUB_FILE_PATH = 'live-hub-data.json';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;

// In-memory cache fallback (used if GitHub is not configured)
let cachedEntries = [];

const defaultHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

const normalizeEntries = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && Array.isArray(payload.entries)) {
    return payload.entries;
  }
  return [];
};

exports.handler = async (event) => {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: ''
    };
  }

  if (event.httpMethod === 'GET') {
    try {
      let entries = [...cachedEntries];

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
              entries = normalizeEntries(parsed);
              cachedEntries = entries;
            }
          } else if (response.status !== 404) {
            console.warn('Live Hub GitHub fetch failed with status:', response.status);
          }
        } catch (error) {
          console.warn('Live Hub GitHub fetch failed:', error.message);
        }
      }

      return {
        statusCode: 200,
        headers: defaultHeaders,
        body: JSON.stringify(entries)
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers: defaultHeaders,
        body: JSON.stringify({ error: 'Failed to retrieve Live Hub entries' })
      };
    }
  }

  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '[]');
      const entries = normalizeEntries(body);

      if (!Array.isArray(entries)) {
        return {
          statusCode: 400,
          headers: defaultHeaders,
          body: JSON.stringify({ error: 'Entries payload must be an array' })
        };
      }

      cachedEntries = entries;

      if (GITHUB_TOKEN) {
        try {
          let sha = null;
          try {
            const existing = await fetch(GITHUB_API_URL, {
              headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Netlify-Function'
              }
            });
            if (existing.ok) {
              const json = await existing.json();
              sha = json.sha;
            }
          } catch (error) {
            console.warn('Live Hub existing file fetch failed:', error.message);
          }

          const content = Buffer.from(JSON.stringify(entries, null, 2)).toString('base64');
          const saveResponse = await fetch(GITHUB_API_URL, {
            method: 'PUT',
            headers: {
              'Authorization': `token ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
              'User-Agent': 'Netlify-Function'
            },
            body: JSON.stringify({
              message: 'Update Live Hub entries',
              content,
              sha
            })
          });

          if (!saveResponse.ok) {
            const errorData = await saveResponse.json();
            console.error('Live Hub GitHub save failed:', errorData);
            throw new Error('GitHub API error');
          }
        } catch (error) {
          console.warn('Live Hub GitHub save failed, falling back to cache only:', error.message);
        }
      }

      return {
        statusCode: 200,
        headers: defaultHeaders,
        body: JSON.stringify({ success: true })
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers: defaultHeaders,
        body: JSON.stringify({ error: 'Failed to save Live Hub entries: ' + error.message })
      };
    }
  }

  return {
    statusCode: 405,
    headers: defaultHeaders,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};


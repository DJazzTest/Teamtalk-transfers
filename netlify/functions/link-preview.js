const { load } = require('cheerio');

const DEFAULT_HEADERS = {
  'User-Agent':
    'TEAMtalk-Transfers/1.0 (+https://teamtalk.com) Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8'
};

const respond = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  },
  body: JSON.stringify(body)
});

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return respond(200, { ok: true });
  }

  const targetUrl = event.queryStringParameters?.url;
  if (!targetUrl) {
    return respond(400, { error: 'Missing required "url" query parameter' });
  }

  try {
    const response = await fetch(targetUrl, { headers: DEFAULT_HEADERS });
    if (!response.ok) {
      throw new Error(`Upstream responded with ${response.status}`);
    }

    const html = await response.text();
    const $ = load(html);

    const getMeta = (selector) =>
      $(`meta[property="${selector}"]`).attr('content') ||
      $(`meta[name="${selector}"]`).attr('content') ||
      '';

    const absolutize = (value) => {
      if (!value) return '';
      try {
        return new URL(value, targetUrl).toString();
      } catch {
        return value;
      }
    };

    const title = getMeta('og:title') || $('title').text() || '';
    const description = getMeta('og:description') || getMeta('description') || '';
    const image = absolutize(getMeta('og:image') || getMeta('twitter:image'));

    return respond(200, {
      url: targetUrl,
      title,
      description,
      image
    });
  } catch (error) {
    console.error('[link-preview] Failed to fetch preview:', error);
    return respond(500, { error: 'Failed to fetch preview' });
  }
};


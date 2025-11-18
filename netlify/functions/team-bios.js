const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO; // e.g. user/repo
const GITHUB_FILE_PATH = 'team-bios-data.json';

let inMemoryCache = {};

const buildResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});

const loadFromGitHub = async () => {
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return inMemoryCache;
  }

  const [owner, repo] = GITHUB_REPO.split('/');
  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: GITHUB_FILE_PATH,
    });
    const decoded = Buffer.from(data.content, 'base64').toString('utf-8');
    inMemoryCache = JSON.parse(decoded || '{}');
    return inMemoryCache;
  } catch (error) {
    console.warn('team-bios: unable to load from GitHub, falling back to cache', error.message);
    return inMemoryCache;
  }
};

const saveToGitHub = async (payload) => {
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    inMemoryCache = payload;
    return {
      success: true,
      warning: 'Configure GITHUB_TOKEN and GITHUB_REPO to persist data between deploys.',
    };
  }

  const [owner, repo] = GITHUB_REPO.split('/');
  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  let sha;
  try {
    const existing = await octokit.repos.getContent({
      owner,
      repo,
      path: GITHUB_FILE_PATH,
    });
    sha = existing.data.sha;
  } catch (error) {
    sha = undefined;
  }

  const content = Buffer.from(JSON.stringify(payload, null, 2)).toString('base64');

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: GITHUB_FILE_PATH,
    message: 'Update team bios data',
    content,
    sha,
  });

  inMemoryCache = payload;
  return { success: true };
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod === 'GET') {
    try {
      const data = await loadFromGitHub();
      return buildResponse(200, data || {});
    } catch (error) {
      console.error('team-bios GET error:', error);
      return buildResponse(500, { error: 'Failed to retrieve team bios' });
    }
  }

  if (event.httpMethod === 'POST') {
    try {
      const payload = JSON.parse(event.body || '{}');
      if (!payload || typeof payload !== 'object') {
        return buildResponse(400, { error: 'Invalid payload' });
      }
      const result = await saveToGitHub(payload);
      return buildResponse(200, { success: true, ...result });
    } catch (error) {
      console.error('team-bios POST error:', error);
      return buildResponse(500, { error: 'Failed to save team bios' });
    }
  }

  return buildResponse(405, { error: 'Method not allowed' });
};


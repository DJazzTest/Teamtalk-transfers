import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import * as cheerio from 'cheerio';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'player-images', 'arsenal');
const SOURCE_URL = 'https://www.arsenal.com/men/players';

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/\u00f6/g, 'o')
    .replace(/\u00e9/g, 'e')
    .replace(/\u00e1/g, 'a')
    .replace(/\u00e8/g, 'e')
    .replace(/\u00ef/g, 'i')
    .replace(/\u00e7/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function downloadFile(fileUrl, destPath) {
  return new Promise((resolve) => {
    if (fs.existsSync(destPath)) {
      console.log(`Skip existing: ${path.basename(destPath)}`);
      resolve(true);
      return;
    }
    const client = fileUrl.startsWith('https') ? https : http;
    client
      .get(fileUrl, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          // follow redirect
          downloadFile(res.headers.location, destPath).then(resolve);
          return;
        }
        if (res.statusCode !== 200) {
          console.warn(`Failed ${res.statusCode} for ${fileUrl}`);
          resolve(false);
          return;
        }
        const out = fs.createWriteStream(destPath);
        res.pipe(out);
        out.on('finish', () => {
          out.close();
          resolve(true);
        });
      })
      .on('error', (err) => {
        console.error(`Error downloading ${fileUrl}:`, err.message);
        resolve(false);
      });
  });
}

async function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });
}

async function scrapeArsenal() {
  ensureDir(OUTPUT_DIR);
  console.log(`Fetching ${SOURCE_URL}`);
  const html = await fetchHtml(SOURCE_URL);
  const $ = cheerio.load(html);

  // Heuristic selectors: capture player cards and headshots
  const results = [];
  $('img').each((_, img) => {
    const alt = $(img).attr('alt') || '';
    const src = $(img).attr('src') || $(img).attr('data-src') || '';
    if (!src) return;
    // Look for headshot-like alt or filename patterns
    const looksLikeHeadshot = /headshot|men\/.+\/players|players\//i.test(alt + ' ' + src);
    const nameCandidate = alt.replace(/headshot.*$/i, '').trim() || $(img).attr('title') || '';
    // Only keep if there's a plausible player name
    if (looksLikeHeadshot && nameCandidate && /[a-zA-Z]/.test(nameCandidate)) {
      const cleanName = nameCandidate
        .replace(/\s+Headshot.*/i, '')
        .replace(/\s*sdi/i, '')
        .replace(/\s*xpl/i, '')
        .replace(/\s+2025.*$/i, '')
        .trim();
      results.push({ name: cleanName, url: src.startsWith('http') ? src : `https://www.arsenal.com${src}` });
    }
  });

  // Deduplicate by name
  const unique = new Map();
  for (const r of results) {
    if (!unique.has(r.name)) unique.set(r.name, r);
  }
  const players = Array.from(unique.values());
  console.log(`Found ${players.length} candidate headshots`);

  // Download
  let ok = 0;
  for (const p of players) {
    const slug = slugify(p.name);
    const extMatch = p.url.match(/\.(png|jpg|jpeg|webp)(?:\?|$)/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'png';
    const dest = path.join(OUTPUT_DIR, `${slug}.png`); // normalize to .png for our app paths
    const finalUrl = p.url;
    const success = await downloadFile(finalUrl, dest);
    if (success) ok += 1;
  }
  console.log(`Downloaded ${ok}/${players.length} headshots to ${OUTPUT_DIR}`);
}

scrapeArsenal().catch((e) => {
  console.error(e);
  process.exit(1);
});



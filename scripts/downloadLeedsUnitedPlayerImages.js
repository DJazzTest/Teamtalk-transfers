import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import * as cheerio from 'cheerio';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'player-images', 'leeds-united');
const SOURCE_URL = 'https://www.leedsunited.com/en/teams/mens';

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
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

async function scrapeLeeds() {
  ensureDir(OUTPUT_DIR);
  console.log(`Fetching ${SOURCE_URL}`);
  const html = await fetchHtml(SOURCE_URL);
  const $ = cheerio.load(html);

  const results = [];
  // Collect player cards/headshots; Leeds site uses figure/img for profiles
  $('img').each((_, img) => {
    const alt = ($(img).attr('alt') || '').trim();
    const src = $(img).attr('src') || $(img).attr('data-src') || '';
    if (!src) return;
    const text = ($(img).parent().text() || '').trim();
    // Heuristics: alt or sibling text contains a name; avoid logos/partners
    const isLogo = /logo|partner|sponsor|kit|adidas|red bull|premier league/i.test(alt + ' ' + text + ' ' + src);
    if (isLogo) return;
    // Name extraction preference: alt if looks like a name, else from text
    const looksLikeName = /[A-Za-z]+\s+[A-Za-z\-']+/.test(alt);
    let name = looksLikeName ? alt : '';
    if (!name) {
      const m = text.match(/([A-Z][a-zA-Z\-']+\s+[A-Z][a-zA-Z\-']+)/);
      if (m) name = m[1];
    }
    if (!name) return;
    // Filter common non-player terms
    if (/Profile|Picture|Captain|Goalkeeper|Defender|Midfielder|Forward|Staff/.test(name)) {
      // Sometimes alt like "Lucas Perri: Profile Picture" -> strip suffix
      name = name.replace(/:.*/, '').trim();
    }
    if (!/[A-Za-z]/.test(name)) return;
    const fullUrl = src.startsWith('http') ? src : `https://www.leedsunited.com${src}`;
    results.push({ name, url: fullUrl });
  });

  // Deduplicate by name
  const unique = new Map();
  for (const r of results) {
    if (!unique.has(r.name)) unique.set(r.name, r);
  }
  const players = Array.from(unique.values());
  console.log(`Found ${players.length} candidate headshots`);

  let ok = 0;
  for (const p of players) {
    const slug = slugify(p.name);
    const dest = path.join(OUTPUT_DIR, `${slug}.png`);
    const success = await downloadFile(p.url, dest);
    if (success) ok += 1;
  }
  console.log(`Downloaded ${ok}/${players.length} headshots to ${OUTPUT_DIR}`);
}

scrapeLeeds().catch((e) => {
  console.error(e);
  process.exit(1);
});









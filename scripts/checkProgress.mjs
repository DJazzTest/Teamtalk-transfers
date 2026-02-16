#!/usr/bin/env node

/**
 * Quick script to check progress of image extraction
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const playerImagesDir = path.join(__dirname, '../public/player-images');

function countImages() {
  let count = 0;
  
  if (!fs.existsSync(playerImagesDir)) {
    return 0;
  }
  
  const clubs = fs.readdirSync(playerImagesDir, { withFileTypes: true });
  
  for (const club of clubs) {
    if (club.isDirectory()) {
      const clubDir = path.join(playerImagesDir, club.name);
      const images = fs.readdirSync(clubDir).filter(f => 
        f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg')
      );
      count += images.length;
    }
  }
  
  return count;
}

const total = 190;
const extracted = countImages();
const remaining = total - extracted;
const progress = ((extracted / total) * 100).toFixed(1);

console.log('\n📊 Image Extraction Progress\n');
console.log(`✅ Extracted: ${extracted} images`);
console.log(`⏳ Remaining: ${remaining} players`);
console.log(`📈 Progress: ${progress}%\n`);

// Check if results file exists
const resultsPath = path.join(__dirname, 'image-extraction-results.json');
if (fs.existsSync(resultsPath)) {
  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
  console.log(`✅ Successful: ${results.success?.length || 0}`);
  console.log(`❌ Failed: ${results.failed?.length || 0}\n`);
}




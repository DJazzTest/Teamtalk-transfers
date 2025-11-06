import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create directory if it doesn't exist
const outputDir = join(__dirname, '../public/player-images/leeds-united');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Created directory: ${outputDir}`);
}

// Player image mapping - these are the file names from the image URLs you provided
const playerImages = [
  'illan-meslier.png',
  'kristoffer-klaesson.png',
  'robin-koch.png',
  'liam-cooper.png',
  'pascal-struijk.png',
  'junior-firpo.png',
  'rasmus-kristensen.png',
  'cody-drameh.png',
  'leo-hjelde.png',
  'tyler-adams.png',
  'marc-roca.png',
  'weston-mckennie.png',
  'brenden-aaronson.png',
  'jack-harrison.png',
  'luis-sinisterra.png',
  'crysencio-summerville.png',
  'sam-greenwood.png',
  'patrick-bamford.png',
  'rodrigo.png',
  'georginio-rutter.png',
  'joe-gelhardt.png',
  'wilfried-gnonto.png',
  'sonny-perkins.png',
  'darko-gyabi.png',
  'archie-gray.png'
];

// Create empty files as placeholders
playerImages.forEach(filename => {
  const filePath = join(outputDir, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '');
    console.log(`Created placeholder: ${filename}`);
  } else {
    console.log(`File exists: ${filename}`);
  }
});

console.log('\nTo complete the setup, please:');
console.log('1. Download the player images from the provided URLs');
console.log(`2. Save them in: ${outputDir}`);
console.log('3. Make sure the filenames match the ones listed above');
console.log('\nAfter adding the images, restart your development server to see the changes.');

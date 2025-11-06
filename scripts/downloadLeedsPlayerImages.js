import fs from 'fs';
import https from 'https';
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

// List of Leeds United players with their image names
const players = [
  'Illan Meslier', 'Kristoffer Klaesson', 'Robin Koch', 'Liam Cooper', 
  'Pascal Struijk', 'Junior Firpo', 'Rasmus Kristensen', 'Cody Drameh',
  'Leo Hjelde', 'Tyler Adams', 'Marc Roca', 'Weston McKennie',
  'Brenden Aaronson', 'Jack Harrison', 'Luis Sinisterra', 'Crysencio Summerville',
  'Sam Greenwood', 'Patrick Bamford', 'Rodrigo', 'Georginio Rutter',
  'Joe Gelhardt', 'Wilfried Gnonto', 'Sonny Perkins', 'Darko Gyabi', 'Archie Gray'
];

// Function to download image
function downloadImage(playerName) {
  const formattedName = playerName.toLowerCase().replace(/\s+/g, '-');
  const fileName = `${formattedName}.png`;
  const filePath = join(outputDir, fileName);
  
  // Skip if file already exists
  if (fs.existsSync(filePath)) {
    console.log(`Skipping ${playerName} - file exists`);
    return Promise.resolve();
  }

  // Create URL for player image (Premier League CDN format)
  const playerId = formattedName.replace(/-/g, '');
  const url = `https://resources.premierleague.com/premierleague/photos/players/250x250/p${playerId}.png`;
  
  console.log(`Downloading ${playerName} from ${url}`);
  
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filePath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`Downloaded ${playerName} image`);
          resolve();
        });
      } else {
        console.log(`Could not find image for ${playerName} (Status: ${response.statusCode})`);
        resolve(); // Resolve anyway to continue with next player
      }
    }).on('error', (err) => {
      console.error(`Error downloading ${playerName}: ${err.message}`);
      resolve(); // Resolve anyway to continue with next player
    });
  });
}

// Process all players with a small delay between downloads
async function downloadAllImages() {
  console.log('Starting image downloads...');
  
  for (const player of players) {
    await new Promise(resolve => setTimeout(resolve, 500)); // Add delay to avoid rate limiting
    await downloadImage(player);
  }
  
  console.log('All downloads completed!');
}

downloadAllImages().catch(console.error);

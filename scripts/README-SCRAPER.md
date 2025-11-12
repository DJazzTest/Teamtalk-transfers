# Automated SofaScore Player Data Scraper

## Overview

This script automatically processes **ALL players from ALL clubs** in your `squadWages.ts` file and extracts comprehensive data from SofaScore, including:

- ✅ **Matches & Appearances** - Total matches, appearances, minutes played
- ✅ **Player Positions** - Current and historical positions
- ✅ **National Team** - Country representation
- ✅ **Debut** - First professional appearance details
- ✅ **Goals & Assists** - Career and season statistics
- ✅ **Transfer History** - Complete transfer timeline
- ✅ **Person Bio** - Height, weight, nationality, date of birth, preferred foot
- ✅ **Average SofaScore Rating** - Performance ratings
- ✅ **Goalkeeping Stats** - Saves, clean sheets, goals conceded (for goalkeepers)
- ✅ **Attacking Stats** - Goals, shots, conversion rates
- ✅ **Passing Stats** - Accurate passes, key passes, assists
- ✅ **Defending Stats** - Tackles, interceptions, clearances
- ✅ **Other Stats** - Duels, dribbles, fouls
- ✅ **Cards** - Yellow and red cards

## Usage

### Run the scraper:

```bash
npm run scrape:all-players
```

### What it does:

1. **Parses** all players from `src/data/squadWages.ts`
2. **Searches** SofaScore for each player's ID
3. **Extracts** comprehensive data from SofaScore API
4. **Saves** progress incrementally (can resume if interrupted)
5. **Updates** `squadWages.ts` with extracted data
6. **Saves** full results to `src/data/players/all-players-comprehensive.json`

## Features

### ✅ Progress Tracking
- Saves progress to `scraper-progress.json`
- Can resume from where it left off if interrupted
- Skips already processed players

### ✅ Rate Limiting
- 2 seconds delay between player requests
- 5 seconds delay between clubs
- Prevents API blocking

### ✅ Error Handling
- Retries failed requests (up to 3 times)
- Continues processing even if individual players fail
- Logs all errors for review

### ✅ Data Extraction
- Uses SofaScore API for reliable data
- Falls back to HTML scraping if needed
- Extracts all required fields

## Output Files

1. **`scraper-progress.json`** - Progress tracking (can delete to restart)
2. **`src/data/players/all-players-comprehensive.json`** - Complete extracted data
3. **`src/data/squadWages.ts`** - Updated with new player data

## Time Estimate

- **Small test** (5-10 players): ~2-5 minutes
- **Single club** (20-30 players): ~10-15 minutes
- **All clubs** (200+ players): ~2-4 hours

## Notes

⚠️ **Important:**
- This is a **large operation** - be patient
- The script respects rate limits to avoid blocking
- You can stop and resume anytime (progress is saved)
- Some players may not be found on SofaScore (will be logged)

## Troubleshooting

### Script stops or errors:
- Check `scraper-progress.json` to see where it stopped
- Delete the progress file to restart from beginning
- Check network connection and SofaScore API availability

### Players not found:
- Some players may not exist on SofaScore
- The script will log these and continue
- You can manually add data for these players later

### Rate limiting issues:
- Increase delays in the script if you get blocked
- Run during off-peak hours
- Process clubs in smaller batches

## Manual Processing

If you want to process specific clubs or players only, you can modify the script to filter:

```javascript
// In main() function, add filter:
const clubsToProcess = ['Arsenal', 'Leeds United']; // Only these clubs
const clubs = Object.fromEntries(
  Object.entries(parsePlayersFromSquadFile())
    .filter(([name]) => clubsToProcess.includes(name))
);
```


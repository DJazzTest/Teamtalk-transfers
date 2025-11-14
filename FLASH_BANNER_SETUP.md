# Flash Banner Cross-Device Sync Setup

The FlashBanner component now supports cross-device synchronization! When you update the banner in the CMS on one device, it will appear on all devices and networks.

## How It Works

The banner data is stored via a Netlify serverless function that can sync data across all devices. Currently, it uses an in-memory cache (temporary) but can be configured for persistent storage.

## Setup for Persistent Cross-Device Storage

### Option 1: GitHub API (Recommended - Free)

1. Create a GitHub Personal Access Token:
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Give it a name like "Netlify Flash Banner"
   - Select scope: `repo` (full control of private repositories)
   - Generate and copy the token

2. Add to Netlify Environment Variables:
   - Go to your Netlify site dashboard
   - Navigate to Site settings → Environment variables
   - Add:
     - `GITHUB_TOKEN` = your GitHub token
     - `GITHUB_REPO` = `DJazzTest/Teamtalk-transfers` (or your repo name)

3. The banner data will be stored in `flash-banner-data.json` in your repository

### Option 2: JSONBin.io (Alternative - Free)

1. Sign up at https://jsonbin.io (free tier available)
2. Create a new bin and copy the Bin ID and API Key
3. Add to Netlify Environment Variables:
   - `JSONBIN_BIN_ID` = your bin ID
   - `JSONBIN_API_KEY` = your API key

## Current Behavior

- **Without setup**: Data is stored in function memory (temporary, lost on restart)
- **With GitHub setup**: Data is stored in your repository (persistent, synced across all devices)
- **With JSONBin setup**: Data is stored in cloud (persistent, synced across all devices)

## Testing

After setting up, test by:
1. Updating the banner in CMS on one device
2. Checking the banner on another device/network
3. The banner should appear on all devices


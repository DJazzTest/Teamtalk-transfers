# TikTok RSS Feed Setup

The TikTok RSS feed has been added to your Netlify site!

## RSS Feed URLs

Once deployed, your RSS feed will be available at:
- **https://teamtalk-transfers.netlify.app/feed.xml**
- **https://teamtalk-transfers.netlify.app/rss**

## Setup Steps

1. **Add RapidAPI Key to Netlify:**
   - Go to https://app.netlify.com
   - Select your `teamtalk-transfers` site
   - Go to **Site settings** → **Environment variables**
   - Click **Add variable**
   - Key: `RAPIDAPI_KEY`
   - Value: Your RapidAPI key from https://rapidapi.com/Lundehund/api/tiktok-api23
   - Click **Save**

2. **Deploy:**
   - Push your changes to Git:
     ```bash
     git add .
     git commit -m "Add TikTok RSS feed"
     git push
     ```
   - Netlify will auto-deploy, or manually trigger a deploy

3. **Test the Feed:**
   - Visit: https://teamtalk-transfers.netlify.app/feed.xml
   - Or test locally: `npm run dev` then visit `http://localhost:8888/.netlify/functions/tiktok-rss`

## Share with Colleague

Once deployed, share this URL:
```
https://teamtalk-transfers.netlify.app/feed.xml
```

This RSS feed will automatically update with new TikTok posts from @rugbyfootballleague.

## Troubleshooting

**Feed shows error about RAPIDAPI_KEY:**
- Make sure you've added the environment variable in Netlify
- Redeploy after adding the variable

**Feed is empty or shows errors:**
- Check your RapidAPI key is valid
- Ensure you're subscribed to the TikTok API on RapidAPI
- Check Netlify function logs for detailed error messages


# Manchester United - SofaScore Data Summary

## Team Statistics (from SofaScore API)
- **Total Players:** 28
- **Average Age:** 24.6 years
- **Foreign Players:** 19
- **National Team Players:** 13 (from API response structure)

## Players Found on SofaScore (28 players)
The script successfully fetched 28 players from SofaScore, all with images available.

### Players List:
1. Amad Diallo ✅ (image downloaded)
2. Benjamin Šeško ✅ (image downloaded)
3. Matheus Cunha ✅ (image downloaded)
4. Joshua Zirkzee ✅ (image downloaded)
5. Chido Obi-Martin ✅ (image downloaded)
6. Bruno Fernandes ✅ (image downloaded)
7. Casemiro ✅ (image downloaded)
8. Bryan Mbeumo ✅ (image downloaded)
9. Kobbie Mainoo ✅ (image downloaded)
10. Mason Mount ✅ (image downloaded)
11. Diogo Dalot ✅ (image downloaded)
12. Manuel Ugarte ✅ (image downloaded)
13. Patrick Dorgu ✅ (image downloaded)
14. Jack Fletcher ✅ (image downloaded)
15. Lisandro Martínez ✅ (image downloaded)
16. Noussair Mazraoui ✅ (image downloaded)
17. Matthijs de Ligt ✅ (image downloaded)
18. Harry Maguire ✅ (image downloaded)
19. Leny Yoro ✅ (image downloaded)
20. Luke Shaw ✅ (image downloaded)
21. Diego León ✅ (image downloaded)
22. Tyrell Malacia ✅ (image downloaded)
... (and 6 more)

## Transfers (Ins & Outs)
⚠️ **Note:** The SofaScore API endpoints for transfers returned 404 errors. The transfers data may need to be scraped from the web page directly:
- URL: https://www.sofascore.com/football/team/manchester-united/35#tab:details
- You may need to click "Show more" to see all Arrivals and Departures

## Next Steps

1. **Compare with our squad data:**
   - Check which of these 28 players are already in our `squadWages.ts`
   - Identify missing players that need to be added
   - Verify player names match (some may have slight variations)

2. **Import missing players:**
   - Use the player data from `manchester-united-data.json`
   - Import player images (already downloaded as base64)
   - Add to `squadWages.ts` or use the CMS to add them

3. **Verify transfers manually:**
   - Visit https://www.sofascore.com/football/team/manchester-united/35#tab:details
   - Check Arrivals and Departures sections
   - Update transfer records accordingly

## Files Generated
- `scripts/output/manchester-united-data.json` - Full data with player images
- `scripts/output/manchester-united-summary.json` - Summary statistics
- `scripts/output/manchester-united-report.html` - Visual HTML report


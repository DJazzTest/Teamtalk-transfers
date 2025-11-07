# Top Goal Scorer API Analysis

## Current Implementation

The application currently calculates top goal scorers **manually** by:
1. Fetching team results from Sport365 API
2. Getting match details for each match
3. Extracting goal scorers from match events/goals
4. Tallying goals per player

**Location**: `src/components/TeamTransferView.tsx` (lines 83-113)

## Available APIs Checked

### 1. Sport365 Stage Stats API
**Endpoint**: `https://api.sport365.com/v1/en/stage/part/stats/soccer/{stageId}`

**Result**: ❌ Returns `participants_stats` which contains **team-level stats only**, not individual player top scorers.

**Response Structure**:
```json
{
  "participants_stats": [
    {
      "id": "1-4611",
      "name": "Tottenham Hotspur",
      "team_stats": {
        "total_goals": 17,
        "assists": 0,
        ...
      }
    }
  ]
}
```

### 2. Sport365 Stage/League Table API
**Endpoint**: `https://api.sport365.com/v1/en/stage/lg/soccer/{stageId}`

**Result**: ❌ Returns league table data (teams, positions, points) but **no top scorers**.

### 3. Sport365 Match Full API
**Endpoint**: `https://api.sport365.com/v1/en/match/soccer/full/{matchId}?wtops=1`

**Result**: ⚠️ The `wtops=1` parameter exists but appears to be for match-specific top performers, not league-wide top scorers.

### 4. Current Manual Calculation
**Method**: Fetching match details and extracting goal scorers

**Pros**:
- ✅ Works and provides accurate data
- ✅ Can filter by team
- ✅ Shows actual goal counts

**Cons**:
- ❌ Requires multiple API calls (one per match)
- ❌ Slower performance
- ❌ Limited to recent matches (currently capped at 25 matches)

## Recommendations

### Option 1: Continue with Current Method (Recommended)
- Keep the manual calculation approach
- Optimize by caching results
- Increase match limit if needed
- Add error handling for failed match detail fetches

### Option 2: Look for Alternative APIs
Potential sources to investigate:
- **SofaScore API**: May have top scorers endpoints
- **ScoreInside API**: Check if they have top scorers data
- **TeamTalk API**: May provide top scorer data

### Option 3: Create a Service
Create a dedicated `TopScorersService` that:
- Fetches and caches top scorer data
- Updates periodically
- Provides both team-specific and league-wide top scorers

## Next Steps

1. ✅ Check Sport365 APIs - **No direct top scorers endpoint found**
2. ⏭️ Check ScoreInside API for top scorers
3. ⏭️ Check TeamTalk API for top scorers
4. ⏭️ Consider optimizing current manual calculation method


# SofaScore Data Extraction Guide

## From Iframe URLs

From iframe URLs like:
```
https://widgets.sofascore.com/en/embed/player/232422?widgetTheme=light
```

We can extract the **Player ID**: `232422`

## Available Data via SofaScore API

### 1. Basic Player Information
**Endpoint**: `https://api.sofascore.com/api/v1/player/{playerId}`

**Data Available**:
- Name, slug, shortName
- Current team (Arsenal)
- Position
- Age, date of birth
- Height, weight
- Nationality
- Preferred foot
- Jersey number
- Market value
- Contract information

### 2. Detailed Season Statistics
**Endpoint**: `https://api.sofascore.com/api/v1/player/{playerId}/unique-tournament/17/statistics/overall`

**Data Available** (Example from Kepa - Player ID 232422):

#### Goalkeeping Stats:
- `saves`: 97
- `savedShotsFromInsideTheBox`: 62
- `goalsConceded`: 39
- `goalsPrevented`: 2.1435
- `cleanSheet`: 8
- `penaltyFaced`: 4
- `penaltySave`: 0
- `errorLeadToGoal`: 1

#### Attacking Stats:
- `goals`: 0
- `expectedGoals`: 0.061
- `totalShots`: 1
- `shotsOnTarget`: 0
- `bigChancesMissed`: 0

#### Passing Stats:
- `accuratePasses`: 634
- `accuratePassesPercentage`: 70.37
- `accurateLongBalls`: 175
- `accurateLongBallsPercentage`: 40.14
- `keyPasses`: 1
- `expectedAssists`: 0.04625512
- `assists`: 0
- `bigChancesCreated`: 0

#### Defending Stats:
- `tackles`: 1
- `interceptions`: 0
- `blockedShots`: 0
- `dribbledPast`: 2

#### Other Stats:
- `aerialDuelsWon`: 8
- `successfulDribbles`: 1
- `minutesPlayed`: 2790
- `rating`: 7.14

#### Cards:
- `yellowCards`: (included)
- `redCards`: 0

### 3. Additional Endpoints to Try

- `/api/v1/player/{id}/career` - Career history
- `/api/v1/player/{id}/transfers` - Transfer history
- `/api/v1/player/{id}/events` - Match events
- `/api/v1/player/{id}/statistics/season` - Season-by-season stats

### 4. Widget HTML Data

The widget HTML (39,486 characters) may contain embedded JSON data that can be extracted for additional information.

## Implementation

We can create a scraper that:
1. Extracts player IDs from iframe URLs
2. Fetches data from the working API endpoints
3. Maps the data to our player data structure
4. Updates `squadWages.ts` with comprehensive stats

## Example Player ID: 232422 (Kepa Arrizabalaga)

This player ID successfully returns:
- ✅ Basic player info
- ✅ Detailed season statistics
- ✅ All goalkeeping, attacking, passing, defending stats


#!/usr/bin/env python3
import json
import sys
import urllib.request

def check_viktor_goals():
    # Get Arsenal team page
    team_url = "https://api.sport365.com/v1/en/team/soccer/teampage/1-1538"
    with urllib.request.urlopen(team_url) as response:
        team_data = json.loads(response.read())
    
    results = team_data.get('results', [])
    print(f"✅ Found {len(results)} Arsenal results\n")
    
    if not results:
        print("❌ No results found")
        return
    
    total_goals = 0
    goal_details = []
    
    # Check all matches
    matches_to_check = results
    print(f"📊 Checking {len(matches_to_check)} matches...\n")
    
    for i, match in enumerate(matches_to_check):
        match_id = match.get('id')
        if not match_id:
            continue
        
        home_team = match.get('home_name', 'Unknown')
        away_team = match.get('away_name', 'Unknown')
        score = match.get('ft_score', match.get('score', []))
        score_str = f"{score[0]}-{score[1]}" if isinstance(score, list) and len(score) >= 2 else "N/A"
        
        print(f"  Match {i+1}/{len(matches_to_check)}: {home_team} vs {away_team}... ", end="", flush=True)
        
        try:
            match_url = f"https://api.sport365.com/v1/en/match/soccer/full/{match_id}?boxscore=1&estats=1&tf=1&tlge=1&wh2h=1&wstats=1&wtops=1"
            with urllib.request.urlopen(match_url) as response:
                match_data = json.loads(response.read())
            
            # Parse incidents (incs) structure
            incs = match_data.get('incs', {})
            all_events = []
            
            # incs is a dict where keys are team IDs, values are dicts of minute -> events
            for team_id, team_incs in incs.items():
                if isinstance(team_incs, dict):
                    for minute, events in team_incs.items():
                        if isinstance(events, list):
                            for event in events:
                                event['team_id'] = team_id
                                event['minute'] = minute
                                all_events.append(event)
            
            # Find goals (type 1 is usually goal)
            goals = [e for e in all_events if e.get('type') == 1]
            
            # Check for Viktor
            viktor_goals = []
            for g in goals:
                player_name = (g.get('pl_name', '') or g.get('player_name', '')).lower()
                if 'viktor' in player_name or 'gyoekeres' in player_name or 'gyökeres' in player_name:
                    viktor_goals.append(g)
            
            if viktor_goals:
                total_goals += len(viktor_goals)
                goal_details.append({
                    'match': f"{home_team} vs {away_team}",
                    'score': score_str,
                    'goals': [f"{g.get('pl_name', 'Unknown')} ({g.get('min', g.get('minute', '?'))}')" for g in viktor_goals]
                })
                print(f"✅ {len(viktor_goals)} goal(s)!")
            else:
                print(f"({len(goals)} goals total)")
        
        except Exception as e:
            print(f"❌ Error: {e}")
    
    # Summary
    print("\n" + "=" * 60)
    print("\n📈 SUMMARY: Viktor Gyökeres Goals for Arsenal")
    print("=" * 60)
    print(f"\n🎯 Total Goals: {total_goals}")
    print(f"📊 Matches Checked: {len(matches_to_check)} of {len(results)}")
    
    if goal_details:
        print("\n📋 Goal Details:\n")
        for idx, detail in enumerate(goal_details, 1):
            print(f"  {idx}. {detail['match']} ({detail['score']})")
            for goal in detail['goals']:
                print(f"     ⚽ {goal}")
    else:
        print("\n⚠️  No goals found for Viktor Gyökeres in checked matches")
    
    print("\n" + "=" * 60 + "\n")

if __name__ == "__main__":
    check_viktor_goals()


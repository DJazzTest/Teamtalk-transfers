/* Service to scrape comprehensive player data from SofaScore */

export interface SofaScoreSeasonStats {
  competition: string;
  matches: number;
  minutes: number;
  goals?: number;
  assists?: number;
  cleanSheets?: number;
  goalsConceded?: number;
  yellowCards?: number;
  redCards?: number;
  rating?: number;
}

export interface SofaScoreCareerStats {
  season: string;
  team: string;
  competition: string;
  matches: number;
  minutes: number;
  goals?: number;
  assists?: number;
  cleanSheets?: number;
  goalsConceded?: number;
}

export interface SofaScorePlayerData {
  seasonStats: SofaScoreSeasonStats[];
  careerStats: SofaScoreCareerStats[];
  heatMapUrl?: string;
  totalMatches: number;
  totalMinutes: number;
  totalGoals?: number;
  totalAssists?: number;
  totalCleanSheets?: number;
  totalGoalsConceded?: number;
}

export class SofaScoreScraper {
  private static extractJsonData(html: string): any {
    try {
      // SofaScore often embeds data in script tags with __NEXT_DATA__ or similar
      const nextDataMatch = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
      if (nextDataMatch) {
        return JSON.parse(nextDataMatch[1]);
      }

      // Try to find JSON-LD or other JSON data
      const jsonLdMatch = html.match(/<script[^>]*type="application\/json"[^>]*>(.*?)<\/script>/s);
      if (jsonLdMatch) {
        return JSON.parse(jsonLdMatch[1]);
      }

      // Try to find window.__INITIAL_STATE__ or similar
      const initialStateMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({.*?});/s);
      if (initialStateMatch) {
        return JSON.parse(initialStateMatch[1]);
      }

      // Try to find any large JSON object
      const jsonMatches = html.match(/\{[\s\S]{100,}\}/g);
      if (jsonMatches) {
        for (const match of jsonMatches) {
          try {
            const parsed = JSON.parse(match);
            if (parsed && typeof parsed === 'object' && (parsed.player || parsed.season || parsed.stats)) {
              return parsed;
            }
          } catch {}
        }
      }
    } catch (error) {
      console.error('Error extracting JSON data:', error);
    }
    return null;
  }

  private static parseSeasonStats(html: string, jsonData: any): SofaScoreSeasonStats[] {
    const stats: SofaScoreSeasonStats[] = [];

    try {
      // Try to extract from JSON data
      if (jsonData) {
        // Navigate through common SofaScore data structures
        const playerData = jsonData.props?.pageProps?.player || 
                          jsonData.player || 
                          jsonData.data?.player ||
                          jsonData;

        if (playerData.seasonStats || playerData.stats) {
          const seasonData = playerData.seasonStats || playerData.stats || [];
          for (const season of seasonData) {
            stats.push({
              competition: season.competition || season.league || season.tournament || 'Unknown',
              matches: season.matches || season.appearances || 0,
              minutes: season.minutes || 0,
              goals: season.goals,
              assists: season.assists,
              cleanSheets: season.cleanSheets,
              goalsConceded: season.goalsConceded,
              yellowCards: season.yellowCards,
              redCards: season.redCards,
              rating: season.rating || season.avgRating
            });
          }
        }
      }

      // Fallback: Try to parse from HTML tables
      if (stats.length === 0) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Look for season stats table
        const tables = doc.querySelectorAll('table, [data-testid*="season"], [class*="season"]');
        for (const table of tables) {
          const rows = table.querySelectorAll('tr');
          for (const row of rows) {
            const cells = row.querySelectorAll('td, th');
            if (cells.length >= 3) {
              const competition = cells[0]?.textContent?.trim() || '';
              const matches = parseInt(cells[1]?.textContent?.trim() || '0');
              const minutes = parseInt(cells[2]?.textContent?.trim()?.replace(/,/g, '') || '0');
              
              if (competition && matches > 0) {
                stats.push({
                  competition,
                  matches,
                  minutes
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error parsing season stats:', error);
    }

    return stats;
  }

  private static parseCareerStats(html: string, jsonData: any): SofaScoreCareerStats[] {
    const stats: SofaScoreCareerStats[] = [];

    try {
      // Try to extract from JSON data
      if (jsonData) {
        const playerData = jsonData.props?.pageProps?.player || 
                          jsonData.player || 
                          jsonData.data?.player ||
                          jsonData;

        if (playerData.career || playerData.careerStats || playerData.history) {
          const careerData = playerData.career || playerData.careerStats || playerData.history || [];
          for (const entry of careerData) {
            stats.push({
              season: entry.season || entry.year || '',
              team: entry.team || entry.club || '',
              competition: entry.competition || entry.league || '',
              matches: entry.matches || entry.appearances || 0,
              minutes: entry.minutes || 0,
              goals: entry.goals,
              assists: entry.assists,
              cleanSheets: entry.cleanSheets,
              goalsConceded: entry.goalsConceded
            });
          }
        }
      }

      // Fallback: Try to parse from HTML
      if (stats.length === 0) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Look for career stats
        const careerSections = doc.querySelectorAll('[data-testid*="career"], [class*="career"]');
        for (const section of careerSections) {
          const rows = section.querySelectorAll('tr, [class*="row"]');
          for (const row of rows) {
            const cells = row.querySelectorAll('td, [class*="cell"]');
            if (cells.length >= 4) {
              stats.push({
                season: cells[0]?.textContent?.trim() || '',
                team: cells[1]?.textContent?.trim() || '',
                competition: cells[2]?.textContent?.trim() || '',
                matches: parseInt(cells[3]?.textContent?.trim() || '0'),
                minutes: parseInt(cells[4]?.textContent?.trim()?.replace(/,/g, '') || '0')
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error parsing career stats:', error);
    }

    return stats;
  }

  private static extractHeatMapUrl(html: string, jsonData: any): string | undefined {
    try {
      // Try to find heat map image URL
      if (jsonData) {
        const playerData = jsonData.props?.pageProps?.player || 
                          jsonData.player || 
                          jsonData.data?.player ||
                          jsonData;

        if (playerData.heatMap || playerData.heatmap || playerData.heatMapUrl) {
          return playerData.heatMap || playerData.heatmap || playerData.heatMapUrl;
        }
      }

      // Fallback: Look for heat map images in HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const heatMapImg = doc.querySelector('img[alt*="heat"], img[src*="heat"], [class*="heatmap"] img');
      if (heatMapImg) {
        const src = heatMapImg.getAttribute('src') || '';
        return src.startsWith('http') ? src : `https://www.sofascore.com${src}`;
      }
    } catch (error) {
      console.error('Error extracting heat map:', error);
    }
    return undefined;
  }

  static async scrapePlayerData(playerUrl: string): Promise<SofaScorePlayerData | null> {
    try {
      console.log('Fetching SofaScore data from:', playerUrl);
      
      // Try to extract player ID from URL first
      const playerIdMatch = playerUrl.match(/\/player\/[^/]+\/(\d+)/);
      const playerId = playerIdMatch ? playerIdMatch[1] : null;
      console.log('Extracted player ID:', playerId);
      
      // Try SofaScore API directly first (might work without CORS issues)
      if (playerId) {
        try {
          // SofaScore API endpoints
          const apiEndpoints = [
            `https://api.sofascore.com/api/v1/player/${playerId}`,
            `https://api.sofascore.com/api/v1/player/${playerId}/statistics/season`,
            `https://api.sofascore.com/api/v1/player/${playerId}/unique-tournament/17/season/52186/statistics/overall`, // Premier League example
          ];
          
          for (const apiUrl of apiEndpoints) {
            try {
              console.log('Trying API endpoint:', apiUrl);
              const apiResponse = await fetch(apiUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                  'Accept': 'application/json',
                }
              });
              
              if (apiResponse.ok) {
                const apiData = await apiResponse.json();
                console.log('API data received from:', apiUrl, apiData);
                
                // Process API data if it contains player stats
                if (apiData.player || apiData.statistics || apiData.season) {
                  return this.processApiData(apiData, playerId);
                }
              }
            } catch (apiError) {
              console.log('API endpoint failed:', apiUrl, apiError);
              continue;
            }
          }
        } catch (apiError) {
          console.log('All API endpoints failed, trying HTML scraping:', apiError);
        }
      }
      
      // Fallback: Try HTML scraping with multiple CORS proxies
      const corsProxies = [
        `https://cors.isomorphic-git.org/${playerUrl}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(playerUrl)}`,
        `https://corsproxy.io/?${encodeURIComponent(playerUrl)}`,
      ];
      
      let html = '';
      let lastError: Error | null = null;
      
      for (const proxyUrl of corsProxies) {
        try {
          console.log('Trying CORS proxy:', proxyUrl);
          const response = await fetch(proxyUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            }
          });
          
          console.log('Response status:', response.status);
          
          if (response.ok) {
            html = await response.text();
            console.log('HTML length:', html.length);
            break; // Success, exit loop
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } catch (error) {
          console.log('Proxy failed:', proxyUrl, error);
          lastError = error instanceof Error ? error : new Error(String(error));
          continue; // Try next proxy
        }
      }
      
      if (!html) {
        throw lastError || new Error('All CORS proxies failed. SofaScore may require JavaScript rendering.');
      }
      
      // Extract JSON data
      const jsonData = this.extractJsonData(html);
      console.log('Extracted JSON data:', jsonData ? 'Found' : 'Not found');

      // Parse season stats
      const seasonStats = this.parseSeasonStats(html, jsonData);
      console.log('Season stats found:', seasonStats.length);

      // Parse career stats
      const careerStats = this.parseCareerStats(html, jsonData);
      console.log('Career stats found:', careerStats.length);

      // Extract heat map URL
      const heatMapUrl = this.extractHeatMapUrl(html, jsonData);
      console.log('Heat map URL:', heatMapUrl || 'Not found');

      // If no data found from HTML, return empty result (we already tried API above)
      if (seasonStats.length === 0 && careerStats.length === 0) {
        console.log('No data found via HTML parsing');
      }

      // Calculate totals
      const totalMatches = seasonStats.reduce((sum, s) => sum + s.matches, 0);
      const totalMinutes = seasonStats.reduce((sum, s) => sum + s.minutes, 0);
      const totalGoals = seasonStats.reduce((sum, s) => sum + (s.goals || 0), 0);
      const totalAssists = seasonStats.reduce((sum, s) => sum + (s.assists || 0), 0);
      const totalCleanSheets = seasonStats.reduce((sum, s) => sum + (s.cleanSheets || 0), 0);
      const totalGoalsConceded = seasonStats.reduce((sum, s) => sum + (s.goalsConceded || 0), 0);

      const result = {
        seasonStats,
        careerStats,
        heatMapUrl,
        totalMatches,
        totalMinutes,
        totalGoals: totalGoals > 0 ? totalGoals : undefined,
        totalAssists: totalAssists > 0 ? totalAssists : undefined,
        totalCleanSheets: totalCleanSheets > 0 ? totalCleanSheets : undefined,
        totalGoalsConceded: totalGoalsConceded > 0 ? totalGoalsConceded : undefined
      };

      console.log('Final result:', result);
      return result;
    } catch (error) {
      console.error('Error scraping SofaScore data:', error);
      throw error; // Re-throw to show error in UI
    }
  }

  private static processApiData(apiData: any, playerId: string): SofaScorePlayerData {
    const seasonStats: SofaScoreSeasonStats[] = [];
    const careerStats: SofaScoreCareerStats[] = [];

    try {
      // Try to extract season statistics
      if (apiData.statistics && Array.isArray(apiData.statistics)) {
        for (const stat of apiData.statistics) {
          seasonStats.push({
            competition: stat.tournament?.name || stat.competition || 'Unknown',
            matches: stat.appearances || stat.matches || 0,
            minutes: stat.minutes || 0,
            goals: stat.goals,
            assists: stat.assists,
            cleanSheets: stat.cleanSheets,
            goalsConceded: stat.goalsConceded,
            yellowCards: stat.yellowCards,
            redCards: stat.redCards,
            rating: stat.rating
          });
        }
      }

      // Try to extract career/history data
      if (apiData.player?.career || apiData.career) {
        const career = apiData.player?.career || apiData.career || [];
        for (const entry of career) {
          careerStats.push({
            season: entry.season || entry.year || '',
            team: entry.team?.name || entry.team || '',
            competition: entry.tournament?.name || entry.competition || '',
            matches: entry.appearances || entry.matches || 0,
            minutes: entry.minutes || 0,
            goals: entry.goals,
            assists: entry.assists,
            cleanSheets: entry.cleanSheets,
            goalsConceded: entry.goalsConceded
          });
        }
      }

      // Calculate totals
      const totalMatches = seasonStats.reduce((sum, s) => sum + s.matches, 0);
      const totalMinutes = seasonStats.reduce((sum, s) => sum + s.minutes, 0);
      const totalGoals = seasonStats.reduce((sum, s) => sum + (s.goals || 0), 0);
      const totalAssists = seasonStats.reduce((sum, s) => sum + (s.assists || 0), 0);
      const totalCleanSheets = seasonStats.reduce((sum, s) => sum + (s.cleanSheets || 0), 0);
      const totalGoalsConceded = seasonStats.reduce((sum, s) => sum + (s.goalsConceded || 0), 0);

      return {
        seasonStats,
        careerStats,
        totalMatches,
        totalMinutes,
        totalGoals: totalGoals > 0 ? totalGoals : undefined,
        totalAssists: totalAssists > 0 ? totalAssists : undefined,
        totalCleanSheets: totalCleanSheets > 0 ? totalCleanSheets : undefined,
        totalGoalsConceded: totalGoalsConceded > 0 ? totalGoalsConceded : undefined
      };
    } catch (error) {
      console.error('Error processing API data:', error);
      // Return empty data structure
      return {
        seasonStats: [],
        careerStats: [],
        totalMatches: 0,
        totalMinutes: 0
      };
    }
  }
}


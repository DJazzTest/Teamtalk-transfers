import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PlayerImageUpload } from './PlayerImageUpload';
import { clubSquads, getSquad } from '@/data/squadWages';
import { Search, Save, X, Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ShirtNumberIcon } from './ShirtNumberIcon';
import { useTeamPlayerStats } from '@/hooks/usePlayerStats';

interface PlayerData {
  name: string;
  position: string;
  age?: number;
  shirtNumber?: number;
  imageUrl?: string;
  weeklyWage: number;
  yearlyWage: number;
  bio?: {
    height?: string;
    weight?: string;
    nationality?: string;
    dateOfBirth?: string;
    placeOfBirth?: string;
    preferredFoot?: string;
    description?: string;
  };
}

export const PlayerManagement: React.FC = () => {
  const { toast } = useToast();
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);
  const [editedPlayer, setEditedPlayer] = useState<PlayerData | null>(null);
  const [playerImageFile, setPlayerImageFile] = useState<File | null>(null);

  // Get all teams
  const teams = useMemo(() => Object.keys(clubSquads), []);

  // Get players for selected team
  const teamPlayers = useMemo(() => {
    if (!selectedTeam) return [];
    const squad = getSquad(selectedTeam);
    return squad.map(p => ({
      name: p.name,
      position: p.position || '',
      age: (p as any).age,
      shirtNumber: (p as any).shirtNumber,
      imageUrl: p.imageUrl,
      weeklyWage: p.weeklyWage,
      yearlyWage: p.yearlyWage,
      bio: (p as any).bio
    }));
  }, [selectedTeam]);

  // Get player names for selected team
  const teamPlayerNames = useMemo(() => {
    if (!selectedTeam) return [];
    return teamPlayers.map(p => p.name);
  }, [selectedTeam, teamPlayers]);

  // Get player positions map
  const playerPositions = useMemo(() => {
    const map = new Map<string, string>();
    teamPlayers.forEach(p => {
      if (p.position) {
        map.set(p.name, p.position);
      }
    });
    return map;
  }, [teamPlayers]);

  // Hook to fetch stats for all players in team
  const { 
    loading: loadingStats, 
    progress: statsProgress,
    fetchAllStats 
  } = useTeamPlayerStats(selectedTeam, teamPlayerNames, { enabled: !!selectedTeam, playerPositions });

  // Filter players by search query
  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return teamPlayers;
    const query = searchQuery.toLowerCase();
    return teamPlayers.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.position.toLowerCase().includes(query)
    );
  }, [teamPlayers, searchQuery]);

  // Handle player selection
  const handleSelectPlayer = (player: PlayerData) => {
    // Get saved data for this player
    const saved = getSavedPlayerData(player.name);
    
    setSelectedPlayer(player);
    setEditedPlayer({ 
      ...player,
      // Merge saved data
      position: saved?.position || player.position,
      age: saved?.age || player.age,
      shirtNumber: saved?.shirtNumber !== undefined ? saved.shirtNumber : player.shirtNumber,
      imageUrl: saved?.imageUrl || player.imageUrl,
      bio: saved?.bio || player.bio
    });
    setPlayerImageFile(null);
  };

  // Handle image upload
  const handleImageChange = (file: File | null) => {
    setPlayerImageFile(file);
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setEditedPlayer(prev => prev ? { ...prev, imageUrl } : null);
    }
  };

  // Save player changes
  const handleSave = async () => {
    if (!editedPlayer || !selectedTeam) {
      toast({
        title: 'Error',
        description: 'Please select a team and player first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      let finalImageUrl = editedPlayer.imageUrl;

      // Save image if uploaded
      if (playerImageFile) {
        // Generate filename from player name
        const filename = editedPlayer.name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '') + '.png';
        
        // Create image URL path
        const teamSlug = selectedTeam.toLowerCase().replace(/\s+/g, '-');
        finalImageUrl = `/player-images/${teamSlug}/${filename}`;
        
        // Convert file to base64 for localStorage (in production, upload to server)
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          const imageData = localStorage.getItem('playerImages') || '{}';
          const images = JSON.parse(imageData);
          if (!images[selectedTeam]) images[selectedTeam] = {};
          images[selectedTeam][editedPlayer.name] = base64String;
          localStorage.setItem('playerImages', JSON.stringify(images));
        };
        reader.readAsDataURL(playerImageFile);
      }

      // Save player data to localStorage
      const savedPlayers = JSON.parse(localStorage.getItem('playerEdits') || '{}');
      if (!savedPlayers[selectedTeam]) savedPlayers[selectedTeam] = {};
      
      // Preserve existing imageUrl if no new image was uploaded
      const existingData = savedPlayers[selectedTeam][editedPlayer.name] || {};
      if (!finalImageUrl && existingData.imageUrl) {
        finalImageUrl = existingData.imageUrl;
      }
      
      savedPlayers[selectedTeam][editedPlayer.name] = {
        position: editedPlayer.position || existingData.position,
        age: editedPlayer.age !== undefined ? editedPlayer.age : existingData.age,
        shirtNumber: editedPlayer.shirtNumber !== undefined ? editedPlayer.shirtNumber : existingData.shirtNumber,
        imageUrl: finalImageUrl || existingData.imageUrl,
        bio: editedPlayer.bio || existingData.bio
      };
      
      localStorage.setItem('playerEdits', JSON.stringify(savedPlayers));

      // Update the selected player state to reflect saved changes
      setSelectedPlayer({ ...editedPlayer, ...savedPlayers[selectedTeam][editedPlayer.name] });

      toast({
        title: 'Player updated',
        description: `${editedPlayer.name} has been saved successfully.`,
      });

      // Force re-render of player list
      const currentQuery = searchQuery;
      setSearchQuery('');
      setTimeout(() => setSearchQuery(currentQuery), 100);
      
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: `Failed to save player data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  // Import comprehensive player data from SofaScore URL
  const handleImportFromSofaScore = async (url: string) => {
    if (!url || !url.includes('sofascore.com')) {
      toast({
        title: 'Invalid URL',
        description: 'Please provide a valid SofaScore player URL',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedTeam || !editedPlayer) {
      toast({
        title: 'No player selected',
        description: 'Please select a team and player first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      toast({
        title: 'Importing...',
        description: 'Fetching comprehensive player data from SofaScore',
      });

      // Extract player ID from URL
      const playerIdMatch = url.match(/\/player\/[^/]+\/(\d+)/);
      const playerId = playerIdMatch ? playerIdMatch[1] : null;

      if (!playerId) {
        throw new Error('Could not extract player ID from URL');
      }

      console.log(`[SofaScore Import] Fetching data for player ID: ${playerId}`);

      // Use the SofaScore scraper service which handles API calls and HTML scraping
      const { SofaScoreScraper } = await import('@/services/sofascoreScraper');
      const scraperData = await SofaScoreScraper.scrapePlayerData(url);
      
      console.log(`[SofaScore Import] Scraper returned:`, scraperData);

      // Also try direct API calls for additional data
      const apiEndpoints = [
        `https://api.sofascore.com/api/v1/player/${playerId}`,
        `https://api.sofascore.com/api/v1/player/${playerId}/statistics/season`,
        `https://api.sofascore.com/api/v1/player/${playerId}/unique-tournament/17/season/52186/statistics/overall`, // Premier League
      ];

      let apiData = null;
      for (const endpoint of apiEndpoints) {
        try {
          const response = await fetch(endpoint, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'application/json',
              'Origin': 'https://www.sofascore.com',
              'Referer': 'https://www.sofascore.com/'
            }
          });
          
          if (response.ok) {
            apiData = await response.json();
            console.log(`[SofaScore Import] ✅ Got data from API: ${endpoint}`);
            break;
          }
        } catch (error) {
          console.log(`[SofaScore Import] API endpoint failed: ${endpoint}`);
          continue;
        }
      }

      const bio: any = {};
      let seasonStats: any = undefined;

      // Extract from scraper data first (most comprehensive)
      if (scraperData) {
        // Convert scraper season stats to our format
        if (scraperData.seasonStats && scraperData.seasonStats.length > 0) {
          const now = new Date();
          const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
          
          seasonStats = {
            season: `${year}-${(year + 1).toString().slice(-2)}`,
            competitions: scraperData.seasonStats.map((stat: any) => ({
              competition: stat.competition || 'Unknown',
              matches: stat.matches || 0,
              minutes: stat.minutes || 0,
              goals: stat.goals || 0,
              assists: stat.assists || 0,
              cleanSheets: stat.cleanSheets || 0,
              goalsConceded: stat.goalsConceded || 0
            }))
          };
        }
      }

      // Extract from API data (supplement scraper data)
      if (apiData) {
        // Extract player info
        if (apiData.player) {
          const p = apiData.player;
          if (p.height && !bio.height) bio.height = `${p.height} cm`;
          if (p.weight && !bio.weight) bio.weight = `${p.weight} kg`;
          if (p.country?.name && !bio.nationality) bio.nationality = p.country.name;
          if (p.dateOfBirth || p.birthDate) {
            const dob = p.dateOfBirth || p.birthDate;
            if (!bio.dateOfBirth) bio.dateOfBirth = dob;
            // Calculate age
            try {
              const dobDate = new Date(dob);
              if (!isNaN(dobDate.getTime())) {
                const today = new Date();
                let age = today.getFullYear() - dobDate.getFullYear();
                const monthDiff = today.getMonth() - dobDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
                  age--;
                }
                if (age > 16 && age < 50 && !editedPlayer?.age) {
                  setEditedPlayer(prev => prev ? { ...prev, age } : null);
                }
              }
            } catch {}
          }
          if ((p.placeOfBirth || p.birthPlace) && !bio.placeOfBirth) {
            bio.placeOfBirth = p.placeOfBirth || p.birthPlace;
          }
          if (p.preferredFoot && !bio.preferredFoot) bio.preferredFoot = p.preferredFoot;
          if (p.jerseyNumber || p.shirtNumber) {
            const shirtNum = parseInt(p.jerseyNumber || p.shirtNumber);
            if (!editedPlayer?.shirtNumber) {
              setEditedPlayer(prev => prev ? { ...prev, shirtNumber: shirtNum } : null);
            }
          }
        }

        // Extract season stats from API if scraper didn't provide them
        if (!seasonStats && apiData.statistics && Array.isArray(apiData.statistics)) {
          const now = new Date();
          const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
          
          seasonStats = {
            season: `${year}-${(year + 1).toString().slice(-2)}`,
            competitions: apiData.statistics.map((stat: any) => ({
              competition: stat.tournament?.name || stat.competition || 'Unknown',
              matches: stat.appearances || stat.matches || 0,
              minutes: stat.minutes || 0,
              goals: stat.goals || 0,
              assists: stat.assists || 0,
              cleanSheets: stat.cleanSheets || 0,
              goalsConceded: stat.goalsConceded || 0
            }))
          };
        }
      }

      // Fallback: HTML scraping for bio if API didn't provide it
      if (Object.keys(bio).length === 0) {
        try {
          const proxyUrl = `https://cors.isomorphic-git.org/${url}`;
          const response = await fetch(proxyUrl);
          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');

          const heightText = Array.from(doc.querySelectorAll('*')).find(el => {
            const text = el.textContent || '';
            return /height|cm|m\s*\d+/i.test(text) && (text.includes('cm') || text.includes('m'));
          })?.textContent || '';
          const heightMatch = heightText.match(/(\d+)\s*(?:cm|m)/i);
          if (heightMatch) {
            const height = parseInt(heightMatch[1]);
            bio.height = height > 100 ? `${height} cm` : `${height * 100} cm`;
          }

          const weightText = Array.from(doc.querySelectorAll('*')).find(el => {
            const text = el.textContent || '';
            return /weight|kg/i.test(text) && text.includes('kg');
          })?.textContent || '';
          const weightMatch = weightText.match(/(\d+)\s*kg/i);
          if (weightMatch) {
            bio.weight = `${weightMatch[1]} kg`;
          }

          const nationalityEl = doc.querySelector('[data-nationality], .nationality, [title*="flag"]');
          if (nationalityEl) {
            bio.nationality = nationalityEl.getAttribute('title') || nationalityEl.textContent?.trim() || '';
          }

          const dobMatch = html.match(/(?:born|dob|date of birth)[\s:]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
          if (dobMatch) {
            bio.dateOfBirth = dobMatch[1];
          }

          const pobMatch = html.match(/(?:born in|place of birth|from)[\s:]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
          if (pobMatch) {
            bio.placeOfBirth = pobMatch[1];
          }

          const footMatch = html.match(/(?:foot|preferred foot)[\s:]+(left|right|both)/i);
          if (footMatch) {
            bio.preferredFoot = footMatch[1].charAt(0).toUpperCase() + footMatch[1].slice(1);
          }
        } catch (htmlError) {
          console.warn('HTML parsing failed:', htmlError);
        }
      }

      // Update edited player with all imported data
      setEditedPlayer(prev => prev ? {
        ...prev,
        bio: { ...prev.bio, ...bio },
        seasonStats: seasonStats || prev.seasonStats
      } : null);

      // Save to localStorage immediately
      const savedPlayers = JSON.parse(localStorage.getItem('playerEdits') || '{}');
      if (!savedPlayers[selectedTeam]) savedPlayers[selectedTeam] = {};
      if (!savedPlayers[selectedTeam][editedPlayer.name]) {
        savedPlayers[selectedTeam][editedPlayer.name] = {};
      }
      
      savedPlayers[selectedTeam][editedPlayer.name] = {
        ...savedPlayers[selectedTeam][editedPlayer.name],
        bio: { ...savedPlayers[selectedTeam][editedPlayer.name].bio, ...bio },
        seasonStats: seasonStats || savedPlayers[selectedTeam][editedPlayer.name].seasonStats
      };
      
      localStorage.setItem('playerEdits', JSON.stringify(savedPlayers));
      
      // Dispatch event to update UI
      window.dispatchEvent(new CustomEvent('playerDataUpdated'));

      const importedFields = [
        ...(Object.keys(bio).length > 0 ? ['bio'] : []),
        ...(seasonStats ? ['season stats'] : [])
      ];

      toast({
        title: 'Data imported successfully',
        description: `Imported ${importedFields.join(', ')} from SofaScore${seasonStats ? ` (${seasonStats.competitions.length} competitions)` : ''}`,
      });
    } catch (error) {
      console.error('[SofaScore Import] Error:', error);
      toast({
        title: 'Import failed',
        description: `Could not fetch player data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  // Import player data from Premier League URL
  const handleImportFromPL = async (url: string) => {
    if (!url || !url.includes('premierleague.com')) {
      toast({
        title: 'Invalid URL',
        description: 'Please provide a valid Premier League player URL',
        variant: 'destructive',
      });
      return;
    }

    try {
      toast({
        title: 'Importing...',
        description: 'Fetching player data from Premier League',
      });

      // Use a CORS proxy to fetch the page
      const proxyUrl = `https://cors.isomorphic-git.org/${url}`;
      const response = await fetch(proxyUrl);
      const html = await response.text();

      // Parse HTML (basic parsing - in production, use a proper HTML parser)
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Extract player name
      const nameEl = doc.querySelector('h1, .playerName, [data-player-name]');
      const extractedName = nameEl?.textContent?.trim() || editedPlayer?.name;

      // Extract age - look for patterns in the HTML
      let extractedAge = editedPlayer?.age;
      const ageMatch = html.match(/(?:age|aged)[\s:]+(\d+)/i) || 
                       html.match(/(\d+)[\s]+(?:years?\s+old|yrs?)/i);
      if (ageMatch) extractedAge = parseInt(ageMatch[1]);

      // Extract position
      let extractedPosition = editedPlayer?.position;
      const positionText = doc.querySelector('.position, [data-position]')?.textContent?.toLowerCase() || '';
      if (positionText.includes('goalkeeper') || positionText.includes('gk')) extractedPosition = 'Goalkeeper';
      else if (positionText.includes('defender') || positionText.includes('def')) extractedPosition = 'Defender';
      else if (positionText.includes('midfielder') || positionText.includes('mid')) extractedPosition = 'Midfielder';
      else if (positionText.includes('forward') || positionText.includes('attacker') || positionText.includes('striker')) extractedPosition = 'Forward';

      // Extract image
      const imgEl = doc.querySelector('img.playerImage, .playerImage img, [data-player-image]') as HTMLImageElement;
      const extractedImageUrl = imgEl?.src || imgEl?.getAttribute('data-src') || null;

      // Update edited player with extracted data
      if (extractedAge || extractedPosition || extractedImageUrl) {
        setEditedPlayer(prev => prev ? {
          ...prev,
          age: extractedAge || prev.age,
          position: extractedPosition || prev.position,
          imageUrl: extractedImageUrl || prev.imageUrl
        } : null);

        toast({
          title: 'Data imported',
          description: `Imported ${extractedAge ? 'age' : ''} ${extractedPosition ? 'position' : ''} ${extractedImageUrl ? 'image' : ''} for ${extractedName}`,
        });
      } else {
        toast({
          title: 'Limited data found',
          description: 'Could not extract player data. Please use Quick Fill buttons or enter manually.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import failed',
        description: 'Premier League pages require JavaScript. Please use Quick Fill or enter data manually.',
        variant: 'destructive',
      });
    }
  };

  // Get saved player data
  const getSavedPlayerData = (playerName: string) => {
    if (!selectedTeam) return null;
    const savedPlayers = JSON.parse(localStorage.getItem('playerEdits') || '{}');
    const saved = savedPlayers[selectedTeam]?.[playerName];
    
    // Also check for base64 image in localStorage
    if (saved?.imageUrl?.startsWith('data:')) {
      return saved;
    }
    
    const imageData = localStorage.getItem('playerImages') || '{}';
    const images = JSON.parse(imageData);
    if (images[selectedTeam]?.[playerName]) {
      return {
        ...saved,
        imageUrl: images[selectedTeam][playerName]
      };
    }
    
    return saved;
  };

  return (
    <Card className="p-6 bg-slate-800/70 border-slate-700">
      <h2 className="text-2xl font-bold text-white mb-6">Player Management</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side: Team selection and player list */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="team-select" className="text-white mb-2 block">Select Team</Label>
            <Select value={selectedTeam} onValueChange={(value) => {
              setSelectedTeam(value);
              setSelectedPlayer(null);
              setSearchQuery('');
            }}>
              <SelectTrigger id="team-select" className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Choose a team..." />
              </SelectTrigger>
              <SelectContent>
                {teams.map(team => (
                  <SelectItem key={team} value={team}>{team}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTeam && (
            <>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="player-search" className="text-white mb-2 block">Search Players</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="player-search"
                      placeholder="Search by name or position..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    onClick={() => {
                      console.log('[PlayerManagement] Fetch Stats button clicked');
                      console.log('[PlayerManagement] Selected team:', selectedTeam);
                      console.log('[PlayerManagement] Player count:', teamPlayerNames.length);
                      if (!selectedTeam) {
                        toast({
                          title: 'No team selected',
                          description: 'Please select a team first.',
                          variant: 'destructive',
                        });
                        return;
                      }
                      if (teamPlayerNames.length === 0) {
                        toast({
                          title: 'No players found',
                          description: 'No players found for this team.',
                          variant: 'destructive',
                        });
                        return;
                      }
                      toast({
                        title: 'Fetching stats...',
                        description: `Fetching statistics for ${teamPlayerNames.length} players from ${selectedTeam}`,
                      });
                      fetchAllStats();
                    }}
                    disabled={loadingStats || !selectedTeam}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    title="Fetch player statistics from APIs and match data"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loadingStats ? 'animate-spin' : ''}`} />
                    {loadingStats ? `${statsProgress.current}/${statsProgress.total}` : 'Fetch Stats'}
                  </Button>
                </div>
              </div>
              {loadingStats && (
                <div className="text-sm text-blue-400">
                  Fetching stats: {statsProgress.current} / {statsProgress.total} players
                </div>
              )}
              {statsProgress.total > 0 && statsProgress.current === statsProgress.total && !loadingStats && (
                <div className="text-sm text-green-400">
                  ✅ Stats fetched for {statsProgress.current} players
                </div>
              )}

              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredPlayers.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No players found</p>
                ) : (
                  filteredPlayers.map((player, index) => {
                    const saved = getSavedPlayerData(player.name);
                    const displayPlayer = saved ? { ...player, ...saved } : player;
                    return (
                      <Card
                        key={index}
                        className={`p-3 cursor-pointer transition-colors ${
                          selectedPlayer?.name === player.name
                            ? 'bg-blue-600 border-blue-500'
                            : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                        }`}
                        onClick={() => handleSelectPlayer(player)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage 
                              src={displayPlayer.imageUrl || player.imageUrl} 
                              alt={player.name} 
                            />
                            <AvatarFallback>{player.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {displayPlayer.shirtNumber && (
                                <ShirtNumberIcon 
                                  number={displayPlayer.shirtNumber} 
                                  size="sm"
                                  className="text-blue-400"
                                />
                              )}
                              <p className="text-white font-medium">{player.name}</p>
                            </div>
                            <p className="text-gray-400 text-sm">
                              {displayPlayer.position || player.position}
                              {displayPlayer.age && ` • Age: ${displayPlayer.age}`}
                            </p>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* Right side: Player editor */}
        <div>
          {selectedPlayer && editedPlayer ? (
            <Card className="p-6 bg-slate-700 border-slate-600">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Edit Player</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedPlayer(null);
                    setEditedPlayer(null);
                    setPlayerImageFile(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-white mb-2 block">Player Name</Label>
                  <Input
                    value={editedPlayer.name}
                    disabled
                    className="bg-slate-600 border-slate-500 text-gray-300"
                  />
                </div>

                <div>
                  <Label htmlFor="position" className="text-white mb-2 block">Position</Label>
                  <Select
                    value={editedPlayer.position}
                    onValueChange={(value) => setEditedPlayer(prev => prev ? { ...prev, position: value } : null)}
                  >
                    <SelectTrigger id="position" className="bg-slate-600 border-slate-500 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
                      <SelectItem value="Defender">Defender</SelectItem>
                      <SelectItem value="Midfielder">Midfielder</SelectItem>
                      <SelectItem value="Forward">Forward</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="age" className="text-white mb-2 block">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min="16"
                    max="50"
                    value={editedPlayer.age || ''}
                    onChange={(e) => setEditedPlayer(prev => prev ? { 
                      ...prev, 
                      age: e.target.value ? parseInt(e.target.value) : undefined 
                    } : null)}
                    className="bg-slate-600 border-slate-500 text-white"
                    placeholder="Enter age"
                  />
                </div>

                <div>
                  <Label htmlFor="shirtNumber" className="text-white mb-2 block">Shirt Number</Label>
                  <Input
                    id="shirtNumber"
                    type="number"
                    min="1"
                    max="99"
                    value={editedPlayer.shirtNumber || ''}
                    onChange={(e) => setEditedPlayer(prev => prev ? { 
                      ...prev, 
                      shirtNumber: e.target.value ? parseInt(e.target.value) : undefined 
                    } : null)}
                    className="bg-slate-600 border-slate-500 text-white"
                    placeholder="Enter shirt number"
                  />
                </div>

                {/* Bio Information */}
                <div className="border-t border-slate-600 pt-4 mt-4">
                  <Label className="text-white mb-3 block text-lg font-semibold">Player Bio</Label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="height" className="text-white mb-1 block text-sm">Height</Label>
                      <Input
                        id="height"
                        value={editedPlayer.bio?.height || ''}
                        onChange={(e) => setEditedPlayer(prev => prev ? {
                          ...prev,
                          bio: { ...prev.bio, height: e.target.value }
                        } : null)}
                        className="bg-slate-600 border-slate-500 text-white text-sm"
                        placeholder="e.g., 188 cm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight" className="text-white mb-1 block text-sm">Weight</Label>
                      <Input
                        id="weight"
                        value={editedPlayer.bio?.weight || ''}
                        onChange={(e) => setEditedPlayer(prev => prev ? {
                          ...prev,
                          bio: { ...prev.bio, weight: e.target.value }
                        } : null)}
                        className="bg-slate-600 border-slate-500 text-white text-sm"
                        placeholder="e.g., 85 kg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nationality" className="text-white mb-1 block text-sm">Nationality</Label>
                      <Input
                        id="nationality"
                        value={editedPlayer.bio?.nationality || ''}
                        onChange={(e) => setEditedPlayer(prev => prev ? {
                          ...prev,
                          bio: { ...prev.bio, nationality: e.target.value }
                        } : null)}
                        className="bg-slate-600 border-slate-500 text-white text-sm"
                        placeholder="e.g., Spain"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dob" className="text-white mb-1 block text-sm">Date of Birth</Label>
                      <Input
                        id="dob"
                        value={editedPlayer.bio?.dateOfBirth || ''}
                        onChange={(e) => setEditedPlayer(prev => prev ? {
                          ...prev,
                          bio: { ...prev.bio, dateOfBirth: e.target.value }
                        } : null)}
                        className="bg-slate-600 border-slate-500 text-white text-sm"
                        placeholder="e.g., 15/09/1995"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pob" className="text-white mb-1 block text-sm">Place of Birth</Label>
                      <Input
                        id="pob"
                        value={editedPlayer.bio?.placeOfBirth || ''}
                        onChange={(e) => setEditedPlayer(prev => prev ? {
                          ...prev,
                          bio: { ...prev.bio, placeOfBirth: e.target.value }
                        } : null)}
                        className="bg-slate-600 border-slate-500 text-white text-sm"
                        placeholder="e.g., Barcelona, Spain"
                      />
                    </div>
                    <div>
                      <Label htmlFor="foot" className="text-white mb-1 block text-sm">Preferred Foot</Label>
                      <Select
                        value={editedPlayer.bio?.preferredFoot || ''}
                        onValueChange={(value) => setEditedPlayer(prev => prev ? {
                          ...prev,
                          bio: { ...prev.bio, preferredFoot: value }
                        } : null)}
                      >
                        <SelectTrigger id="foot" className="bg-slate-600 border-slate-500 text-white text-sm h-9">
                          <SelectValue placeholder="Select foot" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Left">Left</SelectItem>
                          <SelectItem value="Right">Right</SelectItem>
                          <SelectItem value="Both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <Label htmlFor="description" className="text-white mb-1 block text-sm">Description</Label>
                    <textarea
                      id="description"
                      value={editedPlayer.bio?.description || ''}
                      onChange={(e) => setEditedPlayer(prev => prev ? {
                        ...prev,
                        bio: { ...prev.bio, description: e.target.value }
                      } : null)}
                      className="w-full bg-slate-600 border-slate-500 text-white text-sm rounded-md p-2 min-h-[80px]"
                      placeholder="Player biography or description..."
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-2 block">Player Image</Label>
                  <PlayerImageUpload
                    playerImage={editedPlayer.imageUrl}
                    playerName={editedPlayer.name}
                    onImageChange={handleImageChange}
                  />
                </div>

                <div>
                  <Label className="text-white mb-2 block">Import from SofaScore</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="sofascore-url"
                      placeholder="Paste SofaScore player URL..."
                      className="bg-slate-600 border-slate-500 text-white flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleImportFromSofaScore((e.target as HTMLInputElement).value);
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        const input = document.getElementById('sofascore-url') as HTMLInputElement;
                        if (input?.value) handleImportFromSofaScore(input.value);
                      }}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-gray-400 text-xs mb-3">
                    Example: https://www.sofascore.com/football/player/david-raya/581310<br/>
                    Or: https://www.sofascore.com/football/player/kepa-arrizabalaga/232422
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (!editedPlayer) return;
                      
                      // Try to load from file first
                      const { loadPlayerDataFromFile, convertPlayerDataToInternal } = await import('@/utils/loadPlayerDataFromFile');
                      const fileData = await loadPlayerDataFromFile(editedPlayer.name);
                      
                      if (fileData) {
                        const converted = convertPlayerDataToInternal(fileData);
                        setEditedPlayer(prev => prev ? {
                          ...prev,
                          ...converted
                        } : null);
                        
                        toast({
                          title: 'Data loaded',
                          description: `Loaded ${editedPlayer.name} data from file`,
                        });
                      } else {
                        // Fallback to SofaScore URL for Kepa
                        const kepaUrl = 'https://www.sofascore.com/football/player/kepa-arrizabalaga/232422';
                        if (editedPlayer.name.toLowerCase().includes('kepa')) {
                          handleImportFromSofaScore(kepaUrl);
                        } else {
                          toast({
                            title: 'No file found',
                            description: `No saved data found for ${editedPlayer.name}. Use SofaScore import instead.`,
                            variant: 'destructive',
                          });
                        }
                      }
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white mb-2"
                  >
                    Load Saved Data
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!editedPlayer) return;
                      
                      // Arsenal player data (ages as of 2025)
                      const playerData: Record<string, { age: number; position: string }> = {
                        'david raya': { age: 30, position: 'Goalkeeper' },
                        'kepa arrizabalaga': { age: 31, position: 'Goalkeeper' },
                        'tommy setford': { age: 19, position: 'Goalkeeper' },
                        'alexei rojas': { age: 20, position: 'Goalkeeper' },
                        'william saliba': { age: 24, position: 'Defender' },
                        'cristhian mosquera': { age: 21, position: 'Defender' },
                        'ben white': { age: 28, position: 'Defender' },
                        'piero hincapie': { age: 23, position: 'Defender' },
                        'gabriel magalhães': { age: 27, position: 'Defender' },
                        'jurrien timber': { age: 24, position: 'Defender' },
                        'oleksandr zinchenko': { age: 29, position: 'Defender' },
                        'riccardo calafiori': { age: 23, position: 'Defender' },
                        'myles lewis-skelly': { age: 18, position: 'Defender' },
                        'martin ødegaard': { age: 27, position: 'Midfielder' },
                        'martin odegaard': { age: 27, position: 'Midfielder' },
                        'christian norgaard': { age: 31, position: 'Midfielder' },
                        'mikel merino': { age: 29, position: 'Midfielder' },
                        'martin zubimendi': { age: 26, position: 'Midfielder' },
                        'declan rice': { age: 27, position: 'Midfielder' },
                        'ethan nwaneri': { age: 17, position: 'Midfielder' },
                        'max dowman': { age: 18, position: 'Midfielder' },
                        'gabriel jesus': { age: 28, position: 'Forward' },
                        'viktor gyökeres': { age: 27, position: 'Forward' },
                        'viktor gyokeres': { age: 27, position: 'Forward' },
                        'leandro trossard': { age: 31, position: 'Forward' },
                        'reiss nelson': { age: 26, position: 'Forward' },
                        'kai havertz': { age: 26, position: 'Forward' },
                        'noni madueke': { age: 23, position: 'Forward' },
                        'eberechi eze': { age: 27, position: 'Forward' },
                        'gabriel martinelli': { age: 24, position: 'Forward' },
                        'bukayo saka': { age: 24, position: 'Forward' }
                      };

                      const playerNameLower = editedPlayer.name.toLowerCase();
                      const data = playerData[playerNameLower];

                      if (data) {
                        setEditedPlayer(prev => prev ? {
                          ...prev,
                          age: data.age,
                          position: data.position
                        } : null);
                        toast({
                          title: 'Quick filled',
                          description: `${editedPlayer.name}: Age ${data.age}, ${data.position}`,
                        });
                      } else {
                        toast({
                          title: 'No data found',
                          description: `No quick fill data for ${editedPlayer.name}. Please enter manually.`,
                          variant: 'destructive',
                        });
                      }
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Quick Fill Age & Position
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => {
                      // Trigger a custom event to refresh frontend
                      window.dispatchEvent(new CustomEvent('playerDataUpdated'));
                      toast({
                        title: 'Published',
                        description: 'Player changes are now live on the frontend.',
                      });
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Publish
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 bg-slate-700 border-slate-600">
              <p className="text-gray-400 text-center py-8">
                {selectedTeam 
                  ? 'Select a player to edit' 
                  : 'Select a team to view players'}
              </p>
            </Card>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PlayerManagement;


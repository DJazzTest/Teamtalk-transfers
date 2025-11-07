import React, { useMemo, useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeamResults } from '@/components/TeamResults';
import { TeamFixtures } from '@/components/TeamFixtures';
import { LeagueTable } from '@/components/LeagueTable';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getTeamConfig } from '@/data/teamApiConfig';
import { getTeamYoutubeUrl } from '@/utils/teamMapping';
import { clubSquads, getSquad } from '@/data/squadWages';
import { Separator } from '@/components/ui/separator';

interface TeamDetailPanelProps {
  slug: string;
  onClose?: () => void;
}

export const TeamDetailPanel: React.FC<TeamDetailPanelProps> = ({ slug, onClose }) => {
  const team = useMemo(() => getTeamConfig(slug) || getTeamConfig(slug.replace(/-/g, ' ')), [slug]);
  const teamName = team?.teamName || slug;
  const youtubeUrl = getTeamYoutubeUrl(teamName);
  const [squad, setSquad] = useState(() => getSquad(teamName));

  // Listen for player data updates from CMS
  useEffect(() => {
    const handlePlayerUpdate = () => {
      setSquad(getSquad(teamName));
    };
    
    window.addEventListener('playerDataUpdated', handlePlayerUpdate);
    return () => window.removeEventListener('playerDataUpdated', handlePlayerUpdate);
  }, [teamName]);

  const getClubBadge = (club: string): string => {
    const badgeMap: Record<string, string> = {
      'Arsenal': '/badges/arsenal-real.png',
      'Aston Villa': '/badges/astonvilla.png',
      'Bournemouth': '/badges/bournemouth-real.png',
      'Brentford': '/badges/brentford.png',
      'Brighton & Hove Albion': '/badges/brightonhovealbion.png',
      'Burnley': '/badges/burnley.png',
      'Chelsea': '/badges/chelsea-real.png',
      'Crystal Palace': '/badges/crystalpalace.png',
      'Everton': '/badges/everton.png',
      'Fulham': '/badges/fulham.png',
      'Leeds United': '/lovable-uploads/f1403919-509d-469c-8455-d3b11b3d5cb6.png',
      'Liverpool': '/badges/liverpool-real.png',
      'Manchester City': '/badges/manchestercity-real.png',
      'Manchester United': '/badges/manchesterunited-real.png',
      'Newcastle United': '/badges/newcastleunited.png',
      'Nottingham Forest': '/badges/nottinghamforest.png',
      'Sunderland': '/badges/sunderland.png',
      'Tottenham Hotspur': '/badges/tottenhamhotspur.png',
      'West Ham United': '/badges/westhamunited.png',
      'Wolverhampton Wanderers': '/badges/wolverhamptonwanderers.png'
    };
    return badgeMap[club] || '';
  };

  // 2025–26 season bounds (adjust as needed)
  const seasonStart = '2025-08-01T00:00:00';
  const seasonEnd = '2026-06-30T23:59:59';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getClubBadge(teamName) && (
            <img src={getClubBadge(teamName)} alt={`${teamName} badge`} className="h-8 w-8" />
          )}
          <div className="text-lg font-semibold">{teamName}</div>
        </div>
        {onClose && (
          <Button size="sm" variant="outline" onClick={onClose}>Close</Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Squad wages */}
        <Card className="p-4">
          <div className="font-semibold mb-2">{teamName} squad</div>
          <div className="text-sm text-gray-400 mb-2">weekly wage • yearly wage</div>
          <div className="space-y-1 text-sm max-h-64 overflow-auto">
            {squad.slice(0, 12).map(p => (
              <div key={p.name} className="flex justify-between">
                <span>{p.name}</span>
                <span>£{p.weeklyWage.toLocaleString()}/wk • £{p.yearlyWage.toFixed(2)}m/yr</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Mobile hub placeholder (wire to existing media hub if desired) */}
        <Card className="p-4">
          <div className="font-semibold mb-2">Mobile hub</div>
          <div className="text-sm text-gray-400">Latest videos, social and news widgets can be embedded here.</div>
        </Card>

        {/* Official YouTube */}
        <Card className="p-4">
          <div className="font-semibold mb-2">Official YouTube Channel</div>
          {youtubeUrl ? (
            <a className="underline text-blue-400 text-sm" href={youtubeUrl} target="_blank" rel="noreferrer">Open channel</a>
          ) : (
            <div className="text-sm text-gray-400">No channel configured.</div>
          )}
        </Card>
      </div>

      <Tabs defaultValue="results">
        <TabsList>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>

        <TabsContent value="results">
          <TeamResults teamName={teamName} seasonStart={seasonStart} seasonEnd={seasonEnd} />
        </TabsContent>

        <TabsContent value="fixtures">
          <TeamFixtures teamName={teamName} seasonStart={seasonStart} seasonEnd={seasonEnd} />
        </TabsContent>

        <TabsContent value="table">
          {team?.leagueTable?.tableApi ? (
            <LeagueTable 
              tableApiUrl={team.leagueTable.tableApi}
              selectedTeam={teamName}
              leagueName={team.leagueTable.leagueName}
            />
          ) : (
            <Card className="p-4 text-sm text-gray-400">No table configured.</Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

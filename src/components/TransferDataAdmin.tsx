import React, { useState, useMemo } from 'react';
import { useTransferDataStore } from '@/store/transferDataStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FileUpload from '@/components/ui/file-upload';
import PlayerStatsEditor from './PlayerStatsEditor';
import { Transfer } from '@/types/transfer';
import { arsenalTransfers } from '@/data/transfers/arsenal';
import { astonVillaTransfers } from '@/data/transfers/astonVilla';
import { bournemouthTransfers } from '@/data/transfers/bournemouth';
import { brentfordTransfers } from '@/data/transfers/brentford';
import { brightonTransfers } from '@/data/transfers/brighton';
import { chelseaTransfers } from '@/data/transfers/chelsea';
import { crystalPalaceTransfers } from '@/data/transfers/crystalPalace';
import { evertonTransfers } from '@/data/transfers/everton';
import { fulhamTransfers } from '@/data/transfers/fulham';
import { leedsTransfers } from '@/data/transfers/leeds';
import { liverpoolTransfers } from '@/data/transfers/liverpool';
import { manchesterCityTransfers } from '@/data/transfers/manchesterCity';
import { manchesterUnitedTransfers } from '@/data/transfers/manchesterUnited';
import { newcastleTransfers } from '@/data/transfers/newcastle';
import { nottinghamForestTransfers } from '@/data/transfers/nottinghamForest';
import { sunderlandTransfers } from '@/data/transfers/sunderland';
import { tottenhamTransfers } from '@/data/transfers/tottenham';
import { westHamTransfers } from '@/data/transfers/westHam';
import { wolvesTransfers } from '@/data/transfers/wolves';

// Utility to extract unique players with known info from all club transfers
const allTransfers = [
  ...arsenalTransfers,
  ...astonVillaTransfers,
  ...bournemouthTransfers,
  ...brentfordTransfers,
  ...brightonTransfers,
  ...chelseaTransfers,
  ...crystalPalaceTransfers,
  ...evertonTransfers,
  ...fulhamTransfers,
  ...leedsTransfers,
  ...liverpoolTransfers,
  ...manchesterCityTransfers,
  ...manchesterUnitedTransfers,
  ...newcastleTransfers,
  ...nottinghamForestTransfers,
  ...sunderlandTransfers,
  ...tottenhamTransfers,
  ...westHamTransfers,
  ...wolvesTransfers,
];

function getUniquePlayers(transfers: Transfer[]) {
  const playerMap = new Map<string, Partial<Transfer>>();
  for (const t of transfers) {
    if (!playerMap.has(t.playerName)) {
      playerMap.set(t.playerName, {
        playerName: t.playerName,
        country: t.country,
        dateOfBirth: t.dateOfBirth,
        age: t.age,
        // Add more fields as needed
      });
    }
  }
  return Array.from(playerMap.values());
}

const uniquePlayers = getUniquePlayers(allTransfers);


const premierLeagueClubs = [
  'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton & Hove Albion',
  'Burnley', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham',
  'Leeds United', 'Liverpool', 'Manchester City', 'Manchester United',
  'Newcastle United', 'Nottingham Forest', 'Sheffield United', 'Southampton', 'Sunderland', 'Tottenham Hotspur',
  'West Ham United', 'Wolverhampton Wanderers'
];

const defaultTransfer = {
  dateOfBirth: '',
  age: '',
  country: '',
  pastClubs: '', // comma-separated string for UI, will be split into array for export
  playerImage: '',
  playerName: '',
  fromClub: '',
  toClub: '',
  fee: '',
  date: '',
  source: '',
  status: 'confirmed',
};

export const TransferDataAdmin: React.FC = () => {
  const { overrideTransfers } = useTransferDataStore();
  const [transfer, setTransfer] = useState<any>({ ...defaultTransfer });
  const [club, setClub] = useState('Arsenal');
  const [copied, setCopied] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);
  const [bulkText, setBulkText] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // Helper to check for duplicates in allTransfers and current entries
  const isDuplicate = (playerName: string, toClub: string) => {
    const existsInAll = allTransfers.some(
      t => t.playerName.trim().toLowerCase() === playerName.trim().toLowerCase() &&
           t.toClub.trim().toLowerCase() === toClub.trim().toLowerCase()
    );
    const existsInEntries = entries.some(
      t => t.playerName.trim().toLowerCase() === playerName.trim().toLowerCase() &&
           t.toClub.trim().toLowerCase() === toClub.trim().toLowerCase()
    );
    return existsInAll || existsInEntries;
  };

  // --- Player Search/Autocomplete ---
  const [playerSearch, setPlayerSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const filteredPlayers = useMemo(() => {
    if (!playerSearch) return [];
    return uniquePlayers.filter(p =>
      (p.playerName || '').toLowerCase().includes(playerSearch.toLowerCase())
    );
  }, [playerSearch]);

  const handlePlayerSelect = (player: Partial<Transfer>) => {
    setTransfer((prev: any) => ({
      ...prev,
      playerName: player.playerName || '',
      country: player.country || '',
      dateOfBirth: player.dateOfBirth || '',
      age: player.age || '',
      // Add more fields as needed
    }));
    setPlayerSearch(player.playerName || '');
    setShowSuggestions(false);
  };


  // Enhanced parser for lines like:
// "Anthony Elanga – Nottingham Forest → Newcastle United – £55m"
// "Jonathan David – LOSC Lille → Juventus – Free transfer"
// "Morgan Gibbs-White – Forest → Tottenham"
// "Sean Longstaff has officially joined Leeds United from Newcastle"
// "Lukas Nmecha\tTransfer In\tWolfsburg" (tab-separated format)
// And also original "Raheem Sterling to Chelsea £45m rumored"
const parseBulkLine = (line: string) => {
  // Try tab-separated format first: Player\tTransfer In/Out\tClub
  if (line.includes('\t')) {
    const parts = line.split('\t').map(p => p.trim());
    if (parts.length >= 3) {
      const [playerName, transferType, club] = parts;
      const isTransferIn = transferType.toLowerCase().includes('in');
      const isTransferOut = transferType.toLowerCase().includes('out');
      
      // For Transfer In: player comes FROM the club TO the current team
      // For Transfer Out: player goes FROM current team TO the club
      return {
        playerName: playerName?.trim() || '',
        fromClub: isTransferIn ? club?.trim() || '' : '', // FROM club for Transfer In
        toClub: isTransferOut ? club?.trim() || '' : '', // TO club for Transfer Out
        fee: 'Undisclosed',
        date: '',
        source: '',
        status: 'confirmed',
      };
    }
  }

  // Try new format: Player – FromClub → ToClub – Fee
  const arrowRegex = /^(.*?)\s+[–-]\s+(.+?)\s+→\s+(.+?)(?:\s+[–-]\s+(.+))?$/;
  const matchArrow = line.match(arrowRegex);
  if (matchArrow) {
    const [, playerName, fromClub, toClub, fee] = matchArrow;
    // If fee is missing, treat as rumor
    return {
      playerName: playerName?.trim() || '',
      fromClub: fromClub?.trim() || '',
      toClub: toClub?.trim() || '',
      fee: fee?.trim() || '',
      date: '',
      source: '',
      status: fee ? 'confirmed' : 'rumored',
    };
  }

  // Try "joined/from" format: Player has officially joined ToClub from FromClub
  // Handles various fee formats: "for £X", "in a deal worth £X", "worth £X", etc.
  const joinedRegex = /^(.*?)\s+has\s+(?:officially\s+)?joined\s+(.+?)\s+from\s+(.+?)(?:\s+(?:for|in\s+a\s+deal\s+worth\s+(?:around\s+)?|worth\s+(?:around\s+)?)(.+?))?(?:[,.]\s*)?$/i;
  const matchJoined = line.match(joinedRegex);
  if (matchJoined) {
    const [, playerName, toClub, fromClub, fee] = matchJoined;
    return {
      playerName: playerName?.trim() || '',
      fromClub: fromClub?.trim() || '',
      toClub: toClub?.trim() || '',
      fee: fee?.trim() || '',
      date: '',
      source: '',
      status: 'confirmed', // "officially joined" implies confirmed
    };
  }

  // Fallback to original format: Player to Club £fee rumored
  const regex = /^(.*?)\s+to\s+([A-Za-z \&]+)\s+([£€$]?[\d\.]+[mMkK]?|Free|Free transfer|Undisclosed|Loan)?\s*(confirmed|rumored|pending|rejected)?/i;
  const match = line.match(regex);
  if (match) {
    const [, playerName, toClub, fee, status] = match;
    return {
      playerName: playerName?.trim() || '',
      fromClub: '',
      toClub: toClub?.trim() || '',
      fee: fee?.trim() || '',
      date: '',
      source: '',
      status: status?.trim() || (fee ? 'confirmed' : 'rumored'),
    };
  }
  return null;
};

  const handleBulkAdd = () => {
    setMessage(null);
    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean);
    let added = 0;
    let duplicateNames: string[] = [];
    let newEntries: any[] = [];
    for (const line of lines) {
      const parsed = parseBulkLine(line);
      if (parsed) {
        if (isDuplicate(parsed.playerName, parsed.toClub)) {
          duplicateNames.push(`${parsed.playerName} (${parsed.toClub})`);
        } else {
          newEntries.push(parsed);
          added++;
        }
      }
    }
    setEntries([...entries, ...newEntries]);
    if (duplicateNames.length > 0) {
      setMessage(`Duplicate(s) not added: ${duplicateNames.join(', ')}`);
    } else if (added > 0) {
      setMessage(`Added ${added} new entr${added === 1 ? 'y' : 'ies'}.`);
    } else {
      setMessage('No valid entries found.');
    }
    setBulkText('');
  };

  // ... original handlers ...
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setTransfer({ ...transfer, [e.target.name]: e.target.value });
  };

  const handleClubChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setClub(e.target.value);
  };

  const handleAdd = () => {
    if (isDuplicate(transfer.playerName, club)) {
      setMessage(`Duplicate not added: ${transfer.playerName} (${club})`);
      return;
    }
    // Prepare pastClubs as array for export
    const entry = {
      ...transfer,
      toClub: club,
      pastClubs: transfer.pastClubs
        ? transfer.pastClubs.split(',').map((c: string) => c.trim()).filter(Boolean)
        : undefined,
      age: transfer.age ? Number(transfer.age) : undefined,
      dateOfBirth: transfer.dateOfBirth || undefined,
      country: transfer.country || undefined,
      playerImage: transfer.playerImage || undefined,
    };
    setEntries([...entries, entry]);
    setTransfer({ ...defaultTransfer });
    setMessage(null);
  };

  const handleCopy = () => {
    const code = entries.map(entry => {
      const base = [
        `  {`,
        `    id: '${entry.toClub.toLowerCase().replace(/[^a-z0-9]/g, '')}-${entry.playerName.toLowerCase().replace(/[^a-z0-9]/g, '')}-2025',`,
        `    playerName: '${entry.playerName}',`,
        `    fromClub: '${entry.fromClub}',`,
        `    toClub: '${entry.toClub}',`,
        `    fee: '${entry.fee}',`,
        `    date: '${entry.date}',`,
        `    source: '${entry.source}',`,
        `    status: '${entry.status}',`
      ];
      if (entry.dateOfBirth) base.push(`    dateOfBirth: '${entry.dateOfBirth}',`);
      if (entry.age !== undefined && entry.age !== '') base.push(`    age: ${entry.age},`);
      if (entry.country) base.push(`    country: '${entry.country}',`);
      if (entry.pastClubs && Array.isArray(entry.pastClubs) && entry.pastClubs.length > 0) base.push(`    pastClubs: [${entry.pastClubs.map((c: string) => `'${c}'`).join(', ')}],`);
      if (entry.playerImage) base.push(`    playerImage: '${entry.playerImage}',`);
      base.push(`  },`);
      return base.join('\n');
    }).join('\n');
    navigator.clipboard.writeText(code);
  };

  return (
    <>

      <PlayerStatsEditor
        allTransfers={allTransfers}
        onSave={(updatedPlayer) => {
          // TODO: Implement save logic (e.g., update player in data store or show toast)
          alert('Player stats saved for: ' + updatedPlayer.playerName);
        }}
      />
      {/* Bulk Paste Section */}
      <Card className="bg-slate-800/70 border-slate-700 mt-8 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Bulk Paste Rumours/Transfers</h2>
        <textarea
          className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white mb-4"
          rows={10}
          value={bulkText}
          onChange={e => setBulkText(e.target.value)}
          placeholder={`Paste your updates here, e.g.\nArsenal\nViktor Gyokeres (Sporting Lisbon) – £63.5m bid in progress\n...`}
        />
        <Button
          className="bg-blue-700 hover:bg-blue-600 mb-4"
          onClick={() => {
            // Parse lines
            const lines = bulkText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
            let currentClub = '';
            const clubs: string[] = [];
            const parsed: any[] = [];
            const debugLines: string[] = [];
            for (const line of lines) {
              // If line is a club name (robust: allow 'United', 'Hotspur', etc.)
              if (/^[A-Za-z .&'\-]+(United|City|Hotspur|Albion|Forest|Villa|Wanderers|Palace|Bournemouth|Brentford|Chelsea|Everton|Fulham|Leeds|Liverpool|Manchester|Newcastle|Nottingham|Sheffield|Southampton|Sunderland|Tottenham|West Ham|Wolves)?$/i.test(line) && line.length < 40) {
                currentClub = line;
                clubs.push(currentClub);
                debugLines.push(`Detected club: ${currentClub}`);
                continue;
              }
              const parsedLine = parseBulkLine(line);
              if (parsedLine) {
                // If we have a parsed line, use it regardless of whether we have a currentClub
                // For complete transfers (like "joined/from" format), we don't need a separate club line
                const targetClub = parsedLine.toClub || currentClub;
                if (targetClub) {
                  parsed.push({
                    ...parsedLine,
                    toClub: targetClub,
                    status: parsedLine.status || 'rumored',
                    date: new Date().toISOString(),
                    source: 'Manual entry',
                    id: `manual-${parsedLine.playerName.replace(/[^a-zA-Z0-9]/g,'').toLowerCase().slice(0,18)}-${targetClub.replace(/[^a-zA-Z0-9]/g,'').toLowerCase().slice(0,12)}-${new Date().toISOString().slice(0,10)}`
                  });
                  debugLines.push(`Parsed: ${parsedLine.playerName} → ${targetClub} (${parsedLine.fee || 'No fee'})`);
                } else {
                  debugLines.push(`Skipped: ${line} (No target club found)`);
                }
              } else {
                debugLines.push(`Skipped: ${line} (Could not parse)`);
              }
            }
            setEntries(parsed);
            setMessage(null);
            setDebugInfo(debugLines);
            if (clubs.length === 0) {
              setMessage('No clubs detected. Please check your format (club name on its own line).');
            } else if (parsed.length === 0) {
              setMessage('No entries parsed. Please check your format.');
            }
          }}
        >Parse & Preview</Button>
        {debugInfo && debugInfo.length > 0 && (
          <div className="bg-slate-900 text-xs text-gray-400 p-2 mb-2 rounded max-h-40 overflow-y-auto">
            <strong>Debug info:</strong>
            <ul>
              {debugInfo.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </div>
        )}
        {entries.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2 text-white">Preview:</h3>
            <table className="w-full text-sm text-white mb-2">
              <thead>
                <tr>
                  <th className="border-b border-slate-600 p-2">Player</th>
                  <th className="border-b border-slate-600 p-2">From</th>
                  <th className="border-b border-slate-600 p-2">To</th>
                  <th className="border-b border-slate-600 p-2">Fee/Description</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, idx) => (
                  <tr key={idx}>
                    <td className="border-b border-slate-700 p-2">{e.playerName}</td>
                    <td className="border-b border-slate-700 p-2">{e.fromClub}</td>
                    <td className="border-b border-slate-700 p-2">{e.toClub}</td>
                    <td className="border-b border-slate-700 p-2">{e.fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button
              className="bg-green-700 hover:bg-green-600"
              onClick={async () => {
                // Update rumors file (backend)
                const res = await fetch('/api/admin/updateRumors', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ newRumors: entries })
                });
                if (res.ok) {
                  setMessage('Rumors updated! Refresh to see changes.');
                  setEntries([]);
                  setBulkText('');
                  // Update global transfer state for override
                  overrideTransfers(entries);
                } else {
                  setMessage('Failed to update rumors.');
                }
              }}
            >Apply</Button>
            {message && <div className="mt-2 text-green-400">{message}</div>}
          </div>
        )}
      </Card>
    </>
  );
};

export default TransferDataAdmin;

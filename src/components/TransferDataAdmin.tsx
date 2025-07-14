import React, { useState, useMemo } from 'react';
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
  const [transfer, setTransfer] = useState<any>({ ...defaultTransfer });
  const [club, setClub] = useState('Arsenal');
  const [copied, setCopied] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);
  const [bulkText, setBulkText] = useState('');
  const [message, setMessage] = useState<string | null>(null);

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
// And also original "Raheem Sterling to Chelsea £45m rumored"
const parseBulkLine = (line: string) => {
  // Try new format first: Player – FromClub → ToClub – Fee
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
  // Fallback to original format: Player to Club £fee rumored
  const regex = /^(.*?)\s+to\s+([A-Za-z \u0026]+)\s+([£€$]?[\d\.]+[mMkK]?|Free|Free transfer|Undisclosed|Loan)?\s*(confirmed|rumored|pending|rejected)?/i;
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
      <Card className="max-w-xl mx-auto mt-8 p-6 bg-slate-900 text-white border-slate-700">
        <h2 className="text-2xl font-bold mb-4">Manual Transfer Entry</h2>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Bulk Paste or Type Transfers (one per line):</label>
          <textarea
            value={bulkText}
            onChange={e => setBulkText(e.target.value)}
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 mb-2 text-white"
            rows={4}
            placeholder="e.g. Raheem Sterling to Chelsea £45m rumored"
          />
          <Button onClick={handleBulkAdd} className="w-full bg-green-700 hover:bg-green-600 mb-4">Add Bulk Entries</Button>
          {message && <div className="mb-2 text-yellow-400 text-sm">{message}</div>}
        </div>
      </Card>
      <Card className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 max-w-2xl mx-auto mt-6">
        <h2 className="text-2xl font-bold mb-4 text-white">Manual Transfer Entry</h2>
        {/* Player Search/Autocomplete */}
        <div className="mb-4">
          <label className="block text-white font-medium mb-1">Search Player</label>
          <input
            type="text"
            value={playerSearch}
            onChange={e => {
              setPlayerSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="w-full p-2 rounded bg-slate-800 border border-slate-700"
            placeholder="Start typing a player's name..."
          />
          {showSuggestions && filteredPlayers.length > 0 && (
            <ul className="bg-slate-900 border border-slate-700 mt-1 rounded shadow max-h-40 overflow-y-auto z-10 relative">
              {filteredPlayers.map((player, idx) => (
                <li
                  key={player.playerName + idx}
                  className="px-3 py-2 hover:bg-slate-700 cursor-pointer text-white"
                  onClick={() => handlePlayerSelect(player)}
                >
                  {player.playerName} {player.country ? <span className="text-gray-400 text-xs">({player.country})</span> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* ...rest of your form fields and buttons here, all properly closed... */}
        <label className="block text-white font-medium mb-1">To Club:</label>
        <select
          value={club}
          onChange={handleClubChange}
          className="w-full p-2 rounded bg-slate-800 border border-slate-700 mb-2 text-white"
        >
          <option value="Arsenal">Arsenal</option>
          <option value="Aston Villa">Aston Villa</option>
          <option value="Bournemouth">Bournemouth</option>
          <option value="Brentford">Brentford</option>
          <option value="Brighton & Hove Albion">Brighton & Hove Albion</option>
          <option value="Chelsea">Chelsea</option>
          <option value="Crystal Palace">Crystal Palace</option>
          <option value="Everton">Everton</option>
          <option value="Fulham">Fulham</option>
          <option value="Leeds United">Leeds United</option>
          <option value="Leicester City">Leicester City</option>
          <option value="Liverpool">Liverpool</option>
          <option value="Manchester City">Manchester City</option>
          <option value="Manchester United">Manchester United</option>
          <option value="Newcastle United">Newcastle United</option>
          <option value="Nottingham Forest">Nottingham Forest</option>
          <option value="Southampton">Southampton</option>
          <option value="Tottenham Hotspur">Tottenham Hotspur</option>
          <option value="West Ham United">West Ham United</option>
          <option value="Wolverhampton Wanderers">Wolverhampton Wanderers</option>
        </select>
        <label className="block text-white font-medium mb-1">Status:</label>
        <select
          value={transfer.status}
          onChange={handleChange}
          name="status"
          className="w-full p-2 rounded bg-slate-800 border border-slate-700 mb-2 text-white"
        >
          <option value="confirmed">Confirmed</option>
          <option value="rumored">Rumored</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
        <Button onClick={handleAdd} className="w-full bg-green-700 hover:bg-green-600 mb-4">Add Entry</Button>
        {entries.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-2">Entries:</h3>
            <ul>
              {entries.map((entry, idx) => (
                <li key={idx}>{entry.playerName} to {entry.toClub}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>
      <PlayerStatsEditor
        allTransfers={allTransfers}
        onSave={(updatedPlayer) => {
          // TODO: Implement save logic (e.g., update player in data store or show toast)
          alert('Player stats saved for: ' + updatedPlayer.playerName);
        }}
      />
    </>
  );
};

export default TransferDataAdmin;

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PlayerImageUpload from '@/components/PlayerImageUpload';
import { Transfer } from '@/types/transfer';

interface PlayerStatsEditorProps {
  allTransfers: Transfer[];
  onSave: (updatedPlayer: Partial<Transfer>) => void;
}

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
        ...t
      });
    }
  }
  return Array.from(playerMap.values());
}

export const PlayerStatsEditor: React.FC<PlayerStatsEditorProps> = ({ allTransfers, onSave }) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Partial<Transfer> | null>(null);
  const [edit, setEdit] = useState<Partial<Transfer> | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const players = useMemo(() => getUniquePlayers(allTransfers), [allTransfers]);
  const filtered = useMemo(() =>
    players.filter(p => p.playerName?.toLowerCase().includes(search.toLowerCase())),
    [players, search]
  );

  const handleSelect = (player: Partial<Transfer>) => {
    setSelected(player);
    setEdit({ ...player });
    setSearch(player.playerName || '');
    setShowSuggestions(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!edit) return;
    setEdit({ ...edit, [e.target.name]: e.target.value });
  };

  const handleImageChange = (file: File | null) => {
    if (!edit) return;
    if (file) {
      const url = URL.createObjectURL(file);
      setEdit({ ...edit, playerImage: url });
      // In a real app, you would upload the image and store the URL in the data source
    }
  };

  const handleSave = () => {
    if (edit) {
      onSave(edit);
    }
  };

  return (
    <Card className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 max-w-2xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4 text-white">Edit Player Stats</h2>
      <div className="mb-4">
        <label className="block text-white font-medium mb-1">Search Player</label>
        <Input
          type="text"
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          className="w-full p-2 rounded bg-slate-800 border border-slate-700"
          placeholder="Start typing a player's name..."
        />
        {showSuggestions && filtered.length > 0 && (
          <ul className="bg-slate-900 border border-slate-700 mt-1 rounded shadow max-h-40 overflow-y-auto z-10 relative">
            {filtered.map((player, idx) => (
              <li
                key={player.playerName + idx}
                className="px-3 py-2 hover:bg-slate-700 cursor-pointer text-white"
                onClick={() => handleSelect(player)}
              >
                {player.playerName} {player.country ? <span className="text-gray-400 text-xs">({player.country})</span> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
      {edit && (
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Player Details</TabsTrigger>
            <TabsTrigger value="image">Image Upload</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSave();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <label>
                  Name:
                  <Input name="playerName" value={edit.playerName || ''} onChange={handleChange} />
                </label>
                <label>
                  Country:
                  <Input name="country" value={edit.country || ''} onChange={handleChange} />
                </label>
                <label>
                  Date of Birth:
                  <Input name="dateOfBirth" value={edit.dateOfBirth || ''} onChange={handleChange} />
                </label>
                <label>
                  Age:
                  <Input name="age" value={edit.age || ''} onChange={handleChange} />
                </label>
                <label>
                  Height (cm):
                  <Input name="height" value={edit.height || ''} onChange={handleChange} />
                </label>
                <label>
                  Weight (kg):
                  <Input name="weight" value={edit.weight || ''} onChange={handleChange} />
                </label>
                <label>
                  Preferred Foot:
                  <Input name="preferredFoot" value={edit.preferredFoot || ''} onChange={handleChange} />
                </label>
                <label>
                  Position:
                  <Input name="position" value={edit.position || ''} onChange={handleChange} />
                </label>
                <label>
                  Shirt Number:
                  <Input name="shirtNumber" value={edit.shirtNumber || ''} onChange={handleChange} />
                </label>
                <label>
                  Captain:
                  <select name="captain" value={edit.captain || ''} onChange={handleChange} className="w-full mt-1 p-2 rounded bg-slate-800 border border-slate-700">
                    <option value="">Select...</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </label>
                <label>
                  Appearances:
                  <Input name="appearances" value={edit.appearances || ''} onChange={handleChange} />
                </label>
                <label>
                  Goals:
                  <Input name="goals" value={edit.goals || ''} onChange={handleChange} />
                </label>
                <label>
                  Assists:
                  <Input name="assists" value={edit.assists || ''} onChange={handleChange} />
                </label>
                {/* Add more fields as needed */}
              </div>
              <Button type="submit" className="bg-green-700 hover:bg-green-600 w-full">Save Changes</Button>
            </form>
          </TabsContent>
          <TabsContent value="image">
            <PlayerImageUpload
              playerImage={edit.playerImage as string}
              playerName={edit.playerName}
              onImageChange={handleImageChange}
            />
          </TabsContent>
        </Tabs>
      )}
    </Card>
  );
};

export default PlayerStatsEditor;

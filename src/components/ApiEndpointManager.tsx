import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';

interface ApiEndpoint {
  name: string;
  url: string;
  description: string;
}

const STORAGE_KEY = 'custom_transfer_apis';

export const ApiEndpointManager: React.FC = () => {
  const [apis, setApis] = useState<ApiEndpoint[]>([]);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setApis(JSON.parse(saved));
    }
  }, []);

  const saveApis = (newApis: ApiEndpoint[]) => {
    setApis(newApis);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newApis));
  };

  const handleAdd = () => {
    if (!name.trim() || !url.trim()) return;
    const newApi: ApiEndpoint = { name: name.trim(), url: url.trim(), description: description.trim() };
    const updated = [...apis, newApi];
    saveApis(updated);
    setName('');
    setUrl('');
    setDescription('');
  };

  const handleRemove = (idx: number) => {
    const updated = apis.filter((_, i) => i !== idx);
    saveApis(updated);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="API Name"
          className="bg-white/10 border-white/20 text-white"
        />
        <Input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="API URL"
          className="bg-white/10 border-white/20 text-white"
        />
        <Input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="bg-white/10 border-white/20 text-white"
        />
      </div>
      <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto">Add API</Button>
      <div className="mt-4">
        {apis.length === 0 ? (
          <div className="text-gray-400 text-sm">No APIs saved yet.</div>
        ) : (
          <ul className="divide-y divide-slate-700">
            {apis.map((api, idx) => (
              <li key={api.url + idx} className="flex items-center justify-between py-2">
                <div>
                  <div className="text-white font-semibold">{api.name}</div>
                  <div className="text-blue-300 text-xs break-all">{api.url}</div>
                  {api.description && <div className="text-gray-400 text-xs">{api.description}</div>}
                </div>
                <Button onClick={() => handleRemove(idx)} variant="ghost" className="text-red-400 hover:bg-red-900">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ApiEndpointManager;

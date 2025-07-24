import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { TransferParser } from '@/utils/transferParser';

const DEFAULT_URLS = [
  'https://www.skysports.com/transfer-centre',
  'https://www.football365.com/transfer-gossip',
  'https://www.teamtalk.com/transfer-news',
  'https://www.bbc.com/sport/football/transfers',
  'https://www.espn.com/soccer/transfers',
];

export const SourcesTab: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(() => FirecrawlService.getApiKey() || '');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [urls, setUrls] = useState<string[]>(() => {
    const saved = localStorage.getItem('transfer_sources');
    return saved ? JSON.parse(saved) : DEFAULT_URLS;
  });
  const [apiSources, setApiSources] = useState<string[]>(() => {
    const stored = localStorage.getItem('apiSources');
    return stored ? JSON.parse(stored) : [];
  });
  const [newApiSource, setNewApiSource] = useState('');
  const [apiPushStatus, setApiPushStatus] = useState<Record<string, string>>({});
  const [apiPreview, setApiPreview] = useState<Record<string, any>>({});
  const [newUrl, setNewUrl] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<Record<string, string>>({});
  const [fetchedContent, setFetchedContent] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [parsedTransfers, setParsedTransfers] = useState<Record<string, any[]>>({});
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  const handleAddUrl = () => {
    if (newUrl && !urls.includes(newUrl)) {
      const updated = [...urls, newUrl];
      setUrls(updated);
      localStorage.setItem('transfer_sources', JSON.stringify(updated));
      setNewUrl('');
    }
  };

  const handleRemoveUrl = (url: string) => {
    const updated = urls.filter(u => u !== url);
    setUrls(updated);
    localStorage.setItem('transfer_sources', JSON.stringify(updated));
  };

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      FirecrawlService.saveApiKey(apiKeyInput.trim());
      setApiKey(apiKeyInput.trim());
      setApiKeySaved(true);
      setApiKeyInput('');
      setApiKeyMissing(false);
      setTimeout(() => setApiKeySaved(false), 2000);
    }
  };

  const handleRefresh = async () => {
    const apiKey = FirecrawlService.getApiKey();
    if (!apiKey) {
      setApiKeyMissing(true);
      setFetchStatus({});
      setRefreshing(false);
      return;
    } else {
      setApiKeyMissing(false);
    }
    setRefreshing(true);
    setFetchStatus({});
    setFetchedContent({});
    for (const url of urls) {
      setFetchStatus(prev => ({ ...prev, [url]: 'Fetching...' }));
      try {
        const result = await FirecrawlService.testUrlScraping(url);
        if (result.success) {
          setFetchStatus(prev => ({ ...prev, [url]: 'Fetched!' }));
          // Try to extract markdown or content
          let content = '';
          if (result.data && (result.data.markdown || result.data.content)) {
            content = result.data.markdown || result.data.content;
          } else if (result.data && typeof result.data === 'string') {
            content = result.data;
          }
          setFetchedContent(prev => ({ ...prev, [url]: content }));
          // Parse transfers
          let transfers: any[] = [];
          try {
            transfers = TransferParser.parseTransfers(content, url);
          } catch (e) {
            transfers = [];
          }
          setParsedTransfers(prev => ({ ...prev, [url]: transfers }));
        } else {
          setFetchStatus(prev => ({ ...prev, [url]: `Failed (${result.error || 'Unknown'})` }));
          setFetchedContent(prev => ({ ...prev, [url]: '' }));
          setParsedTransfers(prev => ({ ...prev, [url]: [] }));
        }
      } catch (e) {
        setFetchStatus(prev => ({ ...prev, [url]: 'Failed (exception)' }));
        setFetchedContent(prev => ({ ...prev, [url]: '' }));
      }
    }
    setRefreshing(false);
  };

  // Handler to push content to main page (localStorage)
  function handlePushToMain(url: string) {
    if (fetchedContent[url]) {
      // Use a dedicated key for main page transfer data
      const mainKey = `main_transfer_data_${encodeURIComponent(url)}`;
      localStorage.setItem(mainKey, fetchedContent[url]);
      // Optionally, show a toast or confirmation
      alert('Pushed fetched data to main page!');
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* API Sources Management */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">API Sources</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newApiSource}
            onChange={e => setNewApiSource(e.target.value)}
            placeholder="https://api.example.com/transfers"
            className="flex-1 p-2 rounded bg-slate-900 border border-slate-700 text-white"
          />
          <Button className="bg-blue-700 hover:bg-blue-600" onClick={() => {
            if (newApiSource && !apiSources.includes(newApiSource)) {
              const updated = [...apiSources, newApiSource];
              setApiSources(updated);
              localStorage.setItem('apiSources', JSON.stringify(updated));
              setNewApiSource('');
            }
          }}>Add API</Button>
        </div>
        <ul className="mb-4">
          {apiSources.map((url, idx) => (
            <li key={url} className="flex items-center gap-2 mb-2">
              <span className="truncate flex-1 text-white">{url}</span>
              <Button className="bg-green-700 hover:bg-green-600 text-xs px-2 py-1" onClick={async () => {
                setApiPushStatus(s => ({ ...s, [url]: 'Fetching...' }));
                setApiPreview(p => ({ ...p, [url]: null }));
                try {
                  const res = await fetch(url);
                  const data = await res.json();
                  setApiPreview(p => ({ ...p, [url]: data }));
                  setApiPushStatus(s => ({ ...s, [url]: 'Pushing to site...' }));
                  const pushRes = await fetch('/api/admin/updateRumors', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ newRumors: Array.isArray(data) ? data : (data.rumors || data.transfers || []) })
                  });
                  if (pushRes.ok) {
                    setApiPushStatus(s => ({ ...s, [url]: 'Success! Data updated.' }));
                  } else {
                    setApiPushStatus(s => ({ ...s, [url]: 'Failed to update site.' }));
                  }
                } catch (e) {
                  setApiPushStatus(s => ({ ...s, [url]: 'Fetch or push failed.' }));
                }
              }}>
                Fetch & Push
              </Button>
              <Button className="bg-red-700 hover:bg-red-600 text-xs px-2 py-1" onClick={() => {
                const updated = apiSources.filter(s => s !== url);
                setApiSources(updated);
                localStorage.setItem('apiSources', JSON.stringify(updated));
                setApiPushStatus(s => { const copy = { ...s }; delete copy[url]; return copy; });
                setApiPreview(p => { const copy = { ...p }; delete copy[url]; return copy; });
              }}>Remove</Button>
              {apiPushStatus[url] && <span className="ml-2 text-xs text-white">{apiPushStatus[url]}</span>}
            </li>
          ))}
        </ul>
        {/* Preview fetched API data */}
        {Object.entries(apiPreview).map(([url, data]) => data && (
          <div key={url} className="bg-slate-900 text-xs text-gray-300 p-2 rounded max-h-60 overflow-y-auto mb-2">
            <strong>Preview from {url}:</strong>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        ))}
      </div>
      {/* Firecrawl API Key Management */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-white font-semibold mb-1">Firecrawl API Key:</label>
          <div className="flex items-center gap-2">
            <Input
              type="password"
              value={apiKey ? '************' : ''}
              readOnly
              className="w-48 bg-slate-900 text-slate-400"
              placeholder="No API key set"
            />
            <Input
              type="text"
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              className="w-64"
              placeholder="Enter new Firecrawl API key"
              autoComplete="new-password"
            />
            <Button onClick={handleSaveApiKey} disabled={!apiKeyInput}>Save Key</Button>
          </div>
          {apiKeySaved && <div className="text-green-400 text-xs mt-1">API key saved!</div>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Input
          value={newUrl}
          onChange={e => setNewUrl(e.target.value)}
          placeholder="Add new source URL..."
          className="flex-1"
        />
        <Button onClick={handleAddUrl} disabled={!newUrl}>Add URL</Button>
      </div>
      <div>
        <Button onClick={handleRefresh} disabled={refreshing} className="mb-4">
          {refreshing ? 'Refreshing...' : 'Pull to Refresh All'}
        </Button>
        {apiKeyMissing && (
          <div className="mb-4 text-red-500 text-sm">Firecrawl API key not set. Please add your API key in the API Config tab.</div>
        )}
        <ul className="space-y-2">
          {urls.map(url => (
            <li key={url} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="truncate flex-1">{url}</span>
                {fetchStatus[url] && (
                  <span className={`text-xs ${fetchStatus[url].startsWith('Fetched') ? 'text-green-500' : fetchStatus[url].startsWith('Failed') ? 'text-red-500' : 'text-yellow-500'}`}>{fetchStatus[url]}</span>
                )}
                <Button size="sm" variant="destructive" onClick={() => handleRemoveUrl(url)}>Remove</Button>
                {fetchStatus[url] === 'Fetched!' && (
                  <Button size="sm" variant="outline" onClick={() => setExpanded(prev => ({ ...prev, [url]: !prev[url] }))}>
                    {expanded[url] ? 'Hide Data' : 'Show Data'}
                  </Button>
                )}
                {fetchStatus[url] === 'Fetched!' && (
                  <Button size="sm" variant="secondary" onClick={() => handlePushToMain(url)}>
                    Push to Main Page
                  </Button>
                )}
              </div>
              {expanded[url] && fetchedContent[url] && (
                <div className="bg-slate-900 p-3 mt-1 rounded text-xs overflow-x-auto max-h-96 whitespace-pre-wrap border border-slate-700">
                  {/* Today's Confirmed Transfers */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-400 font-bold text-base">Today's Confirmed Transfers</span>
                      <span className="bg-green-700 text-white text-xs rounded px-2 py-0.5">CONFIRMED</span>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {(() => {
                        const today = new Date();
                        const todayStr = today.toISOString().slice(0, 10);
                        const confirmedToday = (parsedTransfers[url] || []).filter(tr => tr.status === 'confirmed' && tr.date && tr.date.slice(0, 10) === todayStr);
                        if (confirmedToday.length === 0) {
                          return <div className="text-gray-400">No confirmed transfers today.</div>;
                        }
                        return confirmedToday.map((tr, i) => (
                          <div key={i} className="min-w-[220px] max-w-xs bg-gradient-to-br from-green-50 to-green-100 border border-green-300 rounded shadow p-3 flex flex-col gap-1 hover:shadow-lg transition">
                            <span
                              className="font-semibold text-green-700 hover:underline cursor-pointer text-base truncate"
                              title={`View ${tr.toClub} transfers`}
                              onClick={() => {
                                // If you have a club navigation function, call it here
                                if (typeof window !== 'undefined' && window.dispatchEvent) {
                                  window.dispatchEvent(new CustomEvent('navigateToClub', { detail: { club: tr.toClub } }));
                                }
                              }}
                            >
                              {tr.playerName}
                            </span>
                            <div className="text-xs text-gray-600">
                              <span>{tr.fromClub}</span> → <span className="font-semibold text-gray-800">{tr.toClub}</span>
                            </div>
                            <div className="flex justify-between items-end gap-2">
                              <span className="text-green-700 font-bold">{tr.fee}</span>
                              <span className="text-xs text-gray-500">{tr.date ? new Date(tr.date).toLocaleDateString() : ''}</span>
                            </div>
                            <span className="text-xs text-gray-400 truncate">{tr.source}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                  {/* Push New Transfers Button (after latest main page date) */}
                  <div className="my-2">
                    {(() => {
                      // Get latest date from main page (localStorage)
                      let latestDate = localStorage.getItem('latest_transfer_date') || '';
                      const allNewTransfers = (parsedTransfers[url] || []).filter(tr => tr.date && tr.date.slice(0, 10) > latestDate);
                      return (
                        <button
                          className={`px-3 py-1 rounded font-semibold ${allNewTransfers.length ? 'bg-green-700 text-white hover:bg-green-800' : 'bg-gray-500 text-gray-300 cursor-not-allowed'}`}
                          disabled={!allNewTransfers.length}
                          title={allNewTransfers.length ? 'Push new transfers to the main project page' : 'No new transfers since last update'}
                          onClick={() => {
                            if (!allNewTransfers.length) return;
                            localStorage.setItem('new_transfers_to_push', JSON.stringify(allNewTransfers));
                            alert('New transfers have been pushed to the project page!');
                          }}
                        >
                          Push New Transfers to Project Page
                        </button>
                      );
                    })()}
                  </div>
                  <strong>Fetched Content:</strong>
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{fetchedContent[url]}</div>
                  {/* Parsed Transfers Table */}
                  <div className="mt-4">
                    <strong>Parsed Transfers:</strong>
                    {parsedTransfers[url] && parsedTransfers[url].length > 0 ? (
                      <table className="min-w-full text-xs border mt-2">
                        <thead>
                          <tr className="bg-slate-800">
                            <th className="px-2 py-1 border">Player</th>
                            <th className="px-2 py-1 border">From</th>
                            <th className="px-2 py-1 border">To</th>
                            <th className="px-2 py-1 border">Date</th>
                            <th className="px-2 py-1 border">Fee</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedTransfers[url]
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((tr, i) => (
                              <tr key={i}>
                                <td className="px-2 py-1 border">{tr.playerName}</td>
                                <td className="px-2 py-1 border">{tr.fromClub}</td>
                                <td className="px-2 py-1 border">{tr.toClub}</td>
                                <td className="px-2 py-1 border">{tr.date ? new Date(tr.date).toLocaleDateString() : ''}</td>
                                <td className="px-2 py-1 border">{tr.fee}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="mt-2 text-green-400">All content is up to date. (No new confirmed or rumored transfers detected in the latest fetch.)</div>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* Future: Option to add API endpoints */}

      {/* Push to Main Page handler */}
      {/* Save the fetched content for a URL to localStorage so main page can access */}
      {/* (This can be improved to use a backend or context, but for now localStorage is fine) */}
    </div>
  );
}

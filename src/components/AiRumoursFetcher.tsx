// AiRumoursFetcher.tsx - Deprecated. This component is no longer used.
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';

const RUMOUR_SYNONYMS = [
  'Rumour', 'Rumor', 'Hearsay', 'Scuttlebutt', 'Whispers', 'Buzz', 'Tattle', 'Dish',
  'Talk of the town', 'Word on the street', 'Speculation', 'Canard', 'Chatter', 'Noise',
  'Whispering campaign', 'Scandal', 'Tittle-tattle', 'Idle talk', 'Juicy variants',
  'Spicy whispers', 'Transfer tea', 'Locker room leaks', 'Back-page buzz', 'Sideline scoop',
  'Tunnel talk', 'Agent whispers', 'Boardroom banter', 'Deadline-day drama', 'Smoke without fire',
  'Gossipmonger', 'Rumormonger', 'Scandalmonger', 'Busybody', 'Blabbermouth', 'Tattler',
  'Newsmonger', 'Chatterbox'
];

const PROMPT = `Give me the latest football transfer rumours and gossip for the Premier League. Use any of the following words as context: ${RUMOUR_SYNONYMS.join(', ')}. Include:
- Top new rumours and gossip
- Players transferred in and out
- Most expensive player
- Total spending and confirmed signings
Format as bullet points or short paragraphs.`;

export const AiRumoursFetcher: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const fetchRumours = async () => {
    setLoading(true);
    setError('');
    setResult('');
    try {
      // Replace this with your backend endpoint or direct OpenAI/Claude API call
      const response = await fetch('/api/ai-rumours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: PROMPT })
      });
      if (!response.ok) throw new Error('Failed to fetch AI rumours');
      const data = await response.json();
      setResult(data.result || data.choices?.[0]?.text || 'No rumours found.');
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    }
    setLoading(false);
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700 p-6 mb-8">
      <div className="flex items-center gap-3 mb-3">
        <Sparkles className="w-6 h-6 text-yellow-400" />
        <h2 className="text-xl font-bold text-white">AI Rumours Fetch</h2>
      </div>
      <p className="text-gray-300 mb-4 text-sm">
        Click below to fetch the latest football transfer gossip and rumours from ChatGPT or another AI. Synonyms for "rumours" used: <span className="text-yellow-300">{RUMOUR_SYNONYMS.slice(0, 6).join(', ')}...</span>
      </p>
      <Button onClick={fetchRumours} disabled={loading} className="mb-4 bg-yellow-500 hover:bg-yellow-400 text-black">
        {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Fetching...</>) : 'Fetch latest football transfer gossip'}
      </Button>
      {error && <div className="text-red-400 font-semibold mb-2">{error}</div>}
      {result && (
        <div className="bg-slate-900/80 rounded p-4 text-white whitespace-pre-line mt-2 border border-yellow-400/20">
          {result}
        </div>
      )}
    </Card>
  );
};

export default AiRumoursFetcher;

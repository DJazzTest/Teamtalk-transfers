import React from 'react';
import { Card } from '@/components/ui/card';
import { Globe, ExternalLink } from 'lucide-react';

export const ReliableSources = () => {
  const reliableSources = [
    {
      name: 'Sky Sports',
      url: 'https://www.skysports.com/football/transfers',
      description: 'Breaking transfer news and rumors'
    },
    {
      name: 'Football365',
      url: 'https://www.football365.com/transfers',
      description: 'In-depth transfer analysis'
    },
    {
      name: 'BBC Sport',
      url: 'https://www.bbc.com/sport/football',
      description: 'Verified transfer updates'
    },
    {
      name: 'Transfermarkt',
      url: 'https://www.transfermarkt.com/premier-league/transfers/wettbewerb/GB1',
      description: 'Official transfer confirmations'
    }
  ];

  return (
    <Card className="mb-4 bg-white/95 backdrop-blur-md border-gray-200/50 shadow-lg">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Reliable Sources</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {reliableSources.map((source, index) => (
            <a
              key={index}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div>
                <h4 className="font-medium text-gray-800">{source.name}</h4>
                <p className="text-sm text-gray-600">{source.description}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-500" />
            </a>
          ))}
        </div>
      </div>
    </Card>
  );
};
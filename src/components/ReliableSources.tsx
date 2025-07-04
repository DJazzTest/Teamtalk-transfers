import React from 'react';
import { Card } from '@/components/ui/card';
import { Globe, ExternalLink } from 'lucide-react';

export const ReliableSources = () => {
  const reliableSources = [
    {
      name: 'Sky Sports',
      url: 'https://www.skysports.com/transfer-centre',
      description: 'Fast delivery & transparent fees',
      color: 'bg-blue-500'
    },
    {
      name: 'Football365',
      url: 'https://www.football365.com/transfer-gossip',
      description: 'In-depth analysis & FCA regulated',
      color: 'bg-green-500'
    },
    {
      name: 'TeamTalk',
      url: 'https://www.teamtalk.com/transfer-news',
      description: 'Latest gossip & wide coverage',
      color: 'bg-purple-500'
    },
    {
      name: 'BBC Sport',
      url: 'https://www.bbc.com/sport/football/transfers',
      description: 'Trusted source & instant updates',
      color: 'bg-red-500'
    },
    {
      name: 'ESPN',
      url: 'https://www.espn.com/soccer/transfers',
      description: 'Global coverage & expert analysis',
      color: 'bg-indigo-500'
    }
  ];

  return (
    <Card className="mb-4 bg-gradient-to-br from-white/95 to-blue-50/90 backdrop-blur-md border-gray-200/50 shadow-xl">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Globe className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Top 5 Reliable Transfer Sources</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reliableSources.map((source, index) => (
            <a
              key={index}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden bg-white hover:bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className={`absolute top-0 left-0 w-1 h-full ${source.color}`}></div>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{source.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{source.description}</p>
                </div>
                <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors ml-3" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </Card>
  );
};

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, CheckCircle, Calendar } from 'lucide-react';

interface Transfer {
  id: string;
  playerName: string;
  fromClub: string;
  toClub: string;
  fee: string;
  date: string;
  source: string;
  status: 'confirmed' | 'rumored' | 'pending';
}

interface CompletedTransfersProps {
  transfers: Transfer[];
}

const premierLeagueClubs = [
  'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton & Hove Albion',
  'Burnley', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Leeds United',
  'Liverpool', 'Manchester City', 'Manchester United', 'Newcastle United',
  'Nottingham Forest', 'Sunderland', 'Tottenham Hotspur', 'West Ham United',
  'Wolverhampton Wanderers'
];

export const CompletedTransfers: React.FC<CompletedTransfersProps> = ({ transfers }) => {
  const [filteredTransfers, setFilteredTransfers] = useState<Transfer[]>([]);
  const [selectedClub, setSelectedClub] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Only show confirmed transfers
  const completedTransfers = transfers.filter(transfer => transfer.status === 'confirmed');

  useEffect(() => {
    let filtered = completedTransfers;

    if (selectedClub !== 'all') {
      filtered = filtered.filter(transfer => transfer.toClub === selectedClub);
    }

    if (searchTerm) {
      filtered = filtered.filter(transfer =>
        transfer.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.fromClub.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.toClub.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredTransfers(filtered);
  }, [completedTransfers, selectedClub, searchTerm]);

  const groupTransfersByClub = () => {
    const grouped: { [key: string]: Transfer[] } = {};
    filteredTransfers.forEach(transfer => {
      if (!grouped[transfer.toClub]) {
        grouped[transfer.toClub] = [];
      }
      grouped[transfer.toClub].push(transfer);
    });
    return grouped;
  };

  const clubTransfers = groupTransfersByClub();

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
        <div className="p-4">
          <div className="flex gap-4 flex-wrap items-center">
            <div className="flex-1 min-w-48">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search completed transfers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                />
              </div>
            </div>
            <Select value={selectedClub} onValueChange={setSelectedClub}>
              <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Filter by club" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clubs</SelectItem>
                {premierLeagueClubs.map((club) => (
                  <SelectItem key={club} value={club}>
                    {club}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
          <div className="p-4 flex items-center gap-3">
            <div className="bg-green-500/20 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-white font-semibold">{filteredTransfers.length}</p>
              <p className="text-gray-300 text-sm">Completed Transfers</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
          <div className="p-4 flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-semibold">{Object.keys(clubTransfers).length}</p>
              <p className="text-gray-300 text-sm">Clubs Involved</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Completed Transfers Display */}
      <div className="space-y-4">
        {filteredTransfers.length === 0 ? (
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
            <div className="p-8 text-center">
              <p className="text-gray-400">No completed transfers found matching your criteria</p>
            </div>
          </Card>
        ) : selectedClub === 'all' ? (
          // Show by club when viewing all
          Object.entries(clubTransfers).map(([club, clubTransferList]) => (
            <Card key={club} className="bg-slate-800/50 backdrop-blur-md border-slate-700">
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-600 pb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  {club} ({clubTransferList.length} completed)
                </h3>
                <div className="space-y-3">
                  {clubTransferList.map((transfer) => (
                    <div key={transfer.id} className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700/70 transition-all duration-200">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-white">{transfer.playerName}</h4>
                            <Badge className="bg-green-500 text-white text-xs">
                              COMPLETED
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <span>{transfer.fromClub}</span>
                            <span>→</span>
                            <span className="font-semibold text-white">{transfer.toClub}</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-400">{transfer.fee}</p>
                          <p className="text-xs text-gray-300">{transfer.source}</p>
                          <p className="text-xs text-gray-400">{new Date(transfer.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))
        ) : (
          // Show individual transfers when a specific club is selected
          filteredTransfers.map((transfer) => (
            <Card key={transfer.id} className="bg-slate-800/50 backdrop-blur-md border-slate-700 hover:bg-slate-800/70 transition-all duration-200">
              <div className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{transfer.playerName}</h3>
                      <Badge className="bg-green-500 text-white text-xs">
                        COMPLETED
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <span>{transfer.fromClub}</span>
                      <span>→</span>
                      <span className="font-semibold text-white">{transfer.toClub}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-400">{transfer.fee}</p>
                    <p className="text-xs text-gray-300">{transfer.source}</p>
                    <p className="text-xs text-gray-400">{new Date(transfer.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

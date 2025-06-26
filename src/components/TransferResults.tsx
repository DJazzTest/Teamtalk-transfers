
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Users, TrendingUp } from 'lucide-react';

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

interface TransferResultsProps {
  lastUpdated: Date;
}

const premierLeagueClubs = [
  'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton & Hove Albion',
  'Burnley', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Leeds United',
  'Liverpool', 'Manchester City', 'Manchester United', 'Newcastle United',
  'Nottingham Forest', 'Sunderland', 'Tottenham Hotspur', 'West Ham United',
  'Wolverhampton Wanderers'
];

// Mock data for demonstration
const mockTransfers: Transfer[] = [
  {
    id: '1',
    playerName: 'Matheus Cunha',
    fromClub: 'Atletico Madrid',
    toClub: 'Manchester United',
    fee: '£45M',
    date: '2025-06-15',
    source: 'Sky Sports',
    status: 'confirmed'
  },
  {
    id: '2',
    playerName: 'Diego León',
    fromClub: 'Real Sociedad',
    toClub: 'Manchester United',
    fee: '£25M',
    date: '2025-06-20',
    source: 'BBC Sport',
    status: 'confirmed'
  },
  {
    id: '3',
    playerName: 'Tyler Fredricson',
    fromClub: 'Ajax',
    toClub: 'Arsenal',
    fee: '£35M',
    date: '2025-06-25',
    source: 'Goal.com',
    status: 'pending'
  }
];

export const TransferResults: React.FC<TransferResultsProps> = ({ lastUpdated }) => {
  const [transfers] = useState<Transfer[]>(mockTransfers);
  const [filteredTransfers, setFilteredTransfers] = useState<Transfer[]>(mockTransfers);
  const [selectedClub, setSelectedClub] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let filtered = transfers;

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

    setFilteredTransfers(filtered);
  }, [transfers, selectedClub, searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'rumored': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <div className="p-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-48">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                <Input
                  placeholder="Search players, clubs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60"
                />
              </div>
            </div>
            <Select value={selectedClub} onValueChange={setSelectedClub}>
              <SelectTrigger className="w-48 bg-white/20 border-white/30 text-white">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <div className="p-4 flex items-center gap-3">
            <div className="bg-green-500/20 p-2 rounded-lg">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-white font-semibold">{filteredTransfers.length}</p>
              <p className="text-blue-200 text-sm">Total Transfers</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <div className="p-4 flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-semibold">
                {filteredTransfers.filter(t => t.status === 'confirmed').length}
              </p>
              <p className="text-blue-200 text-sm">Confirmed</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <div className="p-4 flex items-center gap-3">
            <div className="bg-yellow-500/20 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-white font-semibold">
                {filteredTransfers.filter(t => t.status === 'pending').length}
              </p>
              <p className="text-blue-200 text-sm">Pending</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Transfer List */}
      <div className="space-y-4">
        {filteredTransfers.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <div className="p-8 text-center">
              <p className="text-white/60">No transfers found matching your criteria</p>
            </div>
          </Card>
        ) : (
          filteredTransfers.map((transfer) => (
            <Card key={transfer.id} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-200">
              <div className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{transfer.playerName}</h3>
                      <Badge className={`${getStatusColor(transfer.status)} text-white text-xs`}>
                        {transfer.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-200">
                      <span>{transfer.fromClub}</span>
                      <span>→</span>
                      <span className="font-semibold text-white">{transfer.toClub}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-400">{transfer.fee}</p>
                    <p className="text-xs text-blue-200">{transfer.source}</p>
                    <p className="text-xs text-white/60">{new Date(transfer.date).toLocaleDateString()}</p>
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

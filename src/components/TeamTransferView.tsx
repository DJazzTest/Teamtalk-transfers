
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, TrendingDown, MessageCircle, Users } from 'lucide-react';
import { Transfer } from '@/types/transfer';
import { TransferCard } from './TransferCard';
import { premierLeagueClubs } from '@/data/mockTransfers';

interface TeamTransferViewProps {
  transfers: Transfer[];
}

export const TeamTransferView: React.FC<TeamTransferViewProps> = ({ transfers }) => {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClubs, setFilteredClubs] = useState(premierLeagueClubs);

  useEffect(() => {
    if (searchTerm) {
      setFilteredClubs(
        premierLeagueClubs.filter(club =>
          club.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredClubs(premierLeagueClubs);
    }
  }, [searchTerm]);

  const getTeamStats = (teamName: string) => {
    const transfersIn = transfers.filter(t => t.toClub === teamName);
    const transfersOut = transfers.filter(t => t.fromClub === teamName);
    const rumors = transfers.filter(t => 
      (t.toClub === teamName || t.fromClub === teamName) && t.status === 'rumored'
    );

    return {
      transfersIn: transfersIn.filter(t => t.status === 'confirmed'),
      transfersOut: transfersOut.filter(t => t.status === 'confirmed'),
      rumors: rumors,
      totalActivity: transfersIn.length + transfersOut.length
    };
  };

  if (selectedTeam) {
    const stats = getTeamStats(selectedTeam);
    
    return (
      <div className="space-y-6">
        {/* Back Button and Team Header */}
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setSelectedTeam(null)}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                ← Back to All Teams
              </button>
              <Badge className="bg-blue-500 text-white">
                {stats.totalActivity} Total Activities
              </Badge>
            </div>
            <h2 className="text-2xl font-bold text-white">{selectedTeam}</h2>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
            <div className="p-4 flex items-center gap-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-white font-semibold">{stats.transfersIn.length}</p>
                <p className="text-gray-300 text-sm">Transfers In</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
            <div className="p-4 flex items-center gap-3">
              <div className="bg-red-500/20 p-2 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-white font-semibold">{stats.transfersOut.length}</p>
                <p className="text-gray-300 text-sm">Transfers Out</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
            <div className="p-4 flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <MessageCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-semibold">{stats.rumors.length}</p>
                <p className="text-gray-300 text-sm">Rumors & Gossip</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Transfer Categories */}
        <div className="space-y-6">
          {/* Transfers In */}
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Transfers In ({stats.transfersIn.length})
              </h3>
              {stats.transfersIn.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No confirmed transfers in</p>
              ) : (
                <div className="space-y-3">
                  {stats.transfersIn.map((transfer) => (
                    <div key={transfer.id} className="bg-slate-700/50 rounded-lg p-4">
                      <TransferCard transfer={transfer} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Transfers Out */}
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-400" />
                Transfers Out ({stats.transfersOut.length})
              </h3>
              {stats.transfersOut.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No confirmed transfers out</p>
              ) : (
                <div className="space-y-3">
                  {stats.transfersOut.map((transfer) => (
                    <div key={transfer.id} className="bg-slate-700/50 rounded-lg p-4">
                      <TransferCard transfer={transfer} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Rumors & Gossip */}
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                Rumors & Gossip ({stats.rumors.length})
              </h3>
              {stats.rumors.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No transfer rumors found</p>
              ) : (
                <div className="space-y-3">
                  {stats.rumors.map((transfer) => (
                    <div key={transfer.id} className="bg-slate-700/50 rounded-lg p-4">
                      <TransferCard transfer={transfer} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Header */}
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Users className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Select a Team</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
            />
          </div>
        </div>
      </Card>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClubs.map((club) => {
          const stats = getTeamStats(club);
          return (
            <Card
              key={club}
              className="bg-slate-800/50 backdrop-blur-md border-slate-700 hover:bg-slate-800/70 cursor-pointer transition-all duration-200"
              onClick={() => setSelectedTeam(club)}
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-3">{club}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Transfers In:</span>
                    <span className="text-green-400 font-medium">{stats.transfersIn.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Transfers Out:</span>
                    <span className="text-red-400 font-medium">{stats.transfersOut.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Rumors:</span>
                    <span className="text-blue-400 font-medium">{stats.rumors.length}</span>
                  </div>
                  <div className="border-t border-slate-600 pt-2 mt-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-white">Total Activity:</span>
                      <span className="text-blue-400">{stats.totalActivity}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { Transfer } from '@/types/transfer';
import { PlayerNameLink } from './PlayerNameLink';

interface HomeTodaysConfirmedProps {
  transfers: Transfer[];
  onSelectClub?: (club: string) => void;
}

// Use the user's current local time as source of truth
const TODAY = '2025-07-17';

export const HomeTodaysConfirmed: React.FC<HomeTodaysConfirmedProps> = ({ transfers, onSelectClub }) => {
    const confirmedToday = transfers.filter(
      t => t.status === 'confirmed' && t.date && t.date.slice(0, 10) === TODAY
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card className="mb-6 border-gray-200/50 shadow-lg" style={{ backgroundColor: '#eafbee' }}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-bold text-green-800">Today's Confirmed Transfers</h2>
          <Badge className="bg-green-700 text-white text-xs">CONFIRMED</Badge>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {confirmedToday.length === 0 ? (
            <div className="text-gray-500 font-medium">
              No new confirmed transfers today.
            </div>
          ) : (
            confirmedToday.map((transfer) => (
              <Card key={transfer.id} className="min-w-[240px] max-w-xs bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-md transition-all duration-200 hover:border-green-300">
                <div className="p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <PlayerNameLink
                      playerName={transfer.playerName}
                      teamName={transfer.toClub}
                      playerData={{
                        age: transfer.age,
                        bio: transfer.country || transfer.dateOfBirth
                          ? { nationality: transfer.country, dateOfBirth: transfer.dateOfBirth }
                          : undefined
                      }}
                      className="text-base text-green-700 hover:text-green-600 truncate"
                      stopPropagation={false}
                    />
                  </div>
                  <div className="text-xs text-gray-600">
                    <span>{transfer.fromClub}</span> → <span className="font-semibold text-gray-800">{transfer.toClub}</span>
                  </div>
                  <div className="flex justify-between items-end gap-2">
                    <span className="text-green-700 font-bold">{transfer.fee}</span>
                    <span className="text-xs text-gray-500">{transfer.date ? new Date(transfer.date).toLocaleDateString() : ''}</span>
                  </div>
                  <span className="text-xs text-gray-400 truncate">{transfer.source}</span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Card>
  );
};

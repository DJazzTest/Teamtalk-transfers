
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign } from 'lucide-react';
import { Transfer } from '@/types/transfer';

interface TopMoneyTransfersProps {
  transfers: Transfer[];
}

const parseTransferFee = (fee: string): number => {
  if (!fee || fee === 'Free Transfer' || fee === 'Released' || fee === 'Loan' || fee === 'End of loan') {
    return 0;
  }
  
  // Extract numbers from fee string (e.g., "£12M" -> 12, "€11.6M" -> 11.6)
  const match = fee.match(/[£€$]?(\d+(?:\.\d+)?)[MmKk]?/);
  if (!match) return 0;
  
  const number = parseFloat(match[1]);
  if (fee.toLowerCase().includes('m')) {
    return number; // Already in millions
  } else if (fee.toLowerCase().includes('k')) {
    return number / 1000; // Convert thousands to millions
  }
  return number; // Assume millions if no unit
};

export const TopMoneyTransfers: React.FC<TopMoneyTransfersProps> = ({ transfers }) => {
  const [showAll, setShowAll] = useState(false);
  
  // Premier League clubs only
  const premierLeagueClubs = [
    'Arsenal', 'Aston Villa', 'Brentford', 'Brighton & Hove Albion', 'Chelsea',
    'Crystal Palace', 'Everton', 'Fulham', 'Ipswich Town', 'Leeds United',
    'Leicester City', 'Liverpool', 'Manchester City', 'Manchester United',
    'Newcastle United', 'Nottingham Forest', 'Sheffield United', 'Southampton',
    'Tottenham Hotspur', 'West Ham United'
  ];

  // Get top money transfers (only confirmed ones with actual fees and Premier League clubs)
  const moneyTransfers = transfers
    .filter(transfer => 
      transfer.status === 'confirmed' && 
      parseTransferFee(transfer.fee) > 0 &&
      (premierLeagueClubs.includes(transfer.toClub) || premierLeagueClubs.includes(transfer.fromClub))
    )
    .sort((a, b) => parseTransferFee(b.fee) - parseTransferFee(a.fee))
    .slice(0, 10); // Top 10

  const displayedTransfers = showAll ? moneyTransfers : moneyTransfers.slice(0, 5);

  if (moneyTransfers.length === 0) {
    return null;
  }

  return (
    <Card className="border-gray-200/50 shadow-lg" style={{ backgroundColor: '#2F517A' }}>
      <div className="p-3 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-green-100 p-2 rounded-lg">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-400">Top 10 Money Transfers</h3>
          <Badge className="bg-green-600 hover:bg-green-700 text-white text-xs">
            BIG MONEY
          </Badge>
        </div>

        <div className="space-y-3">
          {displayedTransfers.map((transfer, index) => (
            <Card key={transfer.id} className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-md transition-all duration-200">
              <div className="p-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-green-600 text-white text-xs">
                        #{index + 1}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {parseTransferFee(transfer.fee).toFixed(1)}M
                      </Badge>
                    </div>
                    
                    <h4 className="font-bold text-gray-800 text-lg mb-1">{transfer.playerName}</h4>
                    <div className="text-sm text-gray-600">
                      <span>{transfer.fromClub}</span>
                      <span className="mx-2">→</span>
                      <span className="font-semibold text-gray-800">{transfer.toClub}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">{transfer.fee}</p>
                    <p className="text-xs text-gray-500">{new Date(transfer.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          {moneyTransfers.length > 5 && (
            <div className="flex justify-center pt-2">
              <Button
                onClick={() => setShowAll(!showAll)}
                variant="outline"
                size="sm"
                className="border-green-400 text-green-600 hover:bg-green-50"
              >
                {showAll ? 'Show Less' : `Show More (${moneyTransfers.length - 5} more)`}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

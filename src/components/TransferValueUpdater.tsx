import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { TransferValueSearcher } from '@/services/transferValueSearcher';
import { Transfer } from '@/types/transfer';

// Import all transfer data
import { arsenalTransfers } from '@/data/transfers/arsenal';
import { chelseaTransfers } from '@/data/transfers/chelsea';
import { liverpoolTransfers } from '@/data/transfers/liverpool';
import { manchesterCityTransfers } from '@/data/transfers/manchesterCity';
import { manchesterUnitedTransfers } from '@/data/transfers/manchesterUnited';
import { astonVillaTransfers } from '@/data/transfers/astonVilla';
import { bournemouthTransfers } from '@/data/transfers/bournemouth';
import { brentfordTransfers } from '@/data/transfers/brentford';
import { brightonTransfers } from '@/data/transfers/brighton';
import { crystalPalaceTransfers } from '@/data/transfers/crystalPalace';
import { evertonTransfers } from '@/data/transfers/everton';
import { fulhamTransfers } from '@/data/transfers/fulham';
import { leedsTransfers } from '@/data/transfers/leeds';
import { newcastleTransfers } from '@/data/transfers/newcastle';
import { nottinghamForestTransfers } from '@/data/transfers/nottinghamForest';
import { sunderlandTransfers } from '@/data/transfers/sunderland';
import { tottenhamTransfers } from '@/data/transfers/tottenham';
import { westHamTransfers } from '@/data/transfers/westHam';
import { wolvesTransfers } from '@/data/transfers/wolves';

interface ClubTransfers {
  [key: string]: {
    transfers: Transfer[];
    fileName: string;
  };
}

const allClubTransfers: ClubTransfers = {
  'Arsenal': { transfers: arsenalTransfers, fileName: 'arsenal.ts' },
  'Chelsea': { transfers: chelseaTransfers, fileName: 'chelsea.ts' },
  'Liverpool': { transfers: liverpoolTransfers, fileName: 'liverpool.ts' },
  'Manchester City': { transfers: manchesterCityTransfers, fileName: 'manchesterCity.ts' },
  'Manchester United': { transfers: manchesterUnitedTransfers, fileName: 'manchesterUnited.ts' },
  'Aston Villa': { transfers: astonVillaTransfers, fileName: 'astonVilla.ts' },
  'Bournemouth': { transfers: bournemouthTransfers, fileName: 'bournemouth.ts' },
  'Brentford': { transfers: brentfordTransfers, fileName: 'brentford.ts' },
  'Brighton': { transfers: brightonTransfers, fileName: 'brighton.ts' },
  'Crystal Palace': { transfers: crystalPalaceTransfers, fileName: 'crystalPalace.ts' },
  'Everton': { transfers: evertonTransfers, fileName: 'everton.ts' },
  'Fulham': { transfers: fulhamTransfers, fileName: 'fulham.ts' },
  'Leeds United': { transfers: leedsTransfers, fileName: 'leeds.ts' },
  'Newcastle United': { transfers: newcastleTransfers, fileName: 'newcastle.ts' },
  'Nottingham Forest': { transfers: nottinghamForestTransfers, fileName: 'nottinghamForest.ts' },
  'Sunderland': { transfers: sunderlandTransfers, fileName: 'sunderland.ts' },
  'Tottenham Hotspur': { transfers: tottenhamTransfers, fileName: 'tottenham.ts' },
  'West Ham United': { transfers: westHamTransfers, fileName: 'westHam.ts' },
  'Wolverhampton Wanderers': { transfers: wolvesTransfers, fileName: 'wolves.ts' },
};

export const TransferValueUpdater = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentClub, setCurrentClub] = useState('');
  const [updatedTransfers, setUpdatedTransfers] = useState<any>({});

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      TransferValueSearcher.saveApiKey(apiKey.trim());
      toast({
        title: "Success",
        description: "Perplexity API key saved successfully",
        duration: 3000,
      });
    }
  };

  const updateAllTransferValues = async () => {
    const savedApiKey = TransferValueSearcher.getApiKey();
    if (!savedApiKey) {
      toast({
        title: "Error",
        description: "Please set your Perplexity API key first",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsUpdating(true);
    setProgress(0);
    setUpdatedTransfers({});

    const clubNames = Object.keys(allClubTransfers);
    const totalClubs = clubNames.length;

    for (let i = 0; i < clubNames.length; i++) {
      const clubName = clubNames[i];
      const clubData = allClubTransfers[clubName];
      
      setCurrentClub(clubName);
      console.log(`Updating ${clubName} transfers...`);

      try {
        const updatedClubTransfers = await TransferValueSearcher.batchUpdateTransferValues(clubData.transfers);
        
        setUpdatedTransfers(prev => ({
          ...prev,
          [clubName]: updatedClubTransfers
        }));

        toast({
          title: "Progress",
          description: `Updated ${clubName} transfers`,
          duration: 2000,
        });
      } catch (error) {
        console.error(`Error updating ${clubName}:`, error);
        toast({
          title: "Error",
          description: `Failed to update ${clubName}`,
          variant: "destructive",
          duration: 3000,
        });
      }

      setProgress(((i + 1) / totalClubs) * 100);
    }

    setIsUpdating(false);
    setCurrentClub('');
    
    toast({
      title: "Complete",
      description: "All transfer values updated successfully",
      duration: 5000,
    });
  };

  const needsApiKey = !TransferValueSearcher.getApiKey();

  return (
    <Card className="w-full max-w-2xl mx-auto p-6 backdrop-blur-sm bg-white/30 dark:bg-black/30 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Transfer Value AI Updater
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Uses Perplexity AI to find real transfer fees for ALL players across ALL clubs
          </p>
        </div>

        {needsApiKey && (
          <form onSubmit={handleApiKeySubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="apiKey" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Perplexity API Key
              </label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full"
                placeholder="Enter your Perplexity API key"
                required
              />
              <p className="text-xs text-gray-500">
                Get your API key from{' '}
                <a 
                  href="https://www.perplexity.ai/settings/api" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  perplexity.ai/settings/api
                </a>
              </p>
            </div>
            <Button type="submit" className="w-full">
              Save API Key
            </Button>
          </form>
        )}

        {!needsApiKey && (
          <div className="space-y-4">
            <Button
              onClick={updateAllTransferValues}
              disabled={isUpdating}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {isUpdating ? "Updating Transfer Values..." : "Update All Transfer Values"}
            </Button>

            {isUpdating && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Progress: {Math.round(progress)}%</span>
                  <span>Current: {currentClub}</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {Object.keys(updatedTransfers).length > 0 && (
              <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Updated Clubs:</h3>
                <div className="space-y-1 text-sm">
                  {Object.keys(updatedTransfers).map(club => (
                    <div key={club} className="flex justify-between">
                      <span>{club}</span>
                      <span className="text-green-600">
                        {updatedTransfers[club].length} transfers
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-center text-xs text-gray-500">
          <p>This will search for real transfer values and update all club files</p>
          <p>Rate limited to prevent API abuse - may take several minutes</p>
        </div>
      </div>
    </Card>
  );
};
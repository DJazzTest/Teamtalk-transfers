import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Transfer } from '@/types/transfer';
import { allClubTransfers } from '@/data/transfers';
import { teamTalkApi } from '@/services/teamtalkApi';
import { scoreInsideApi } from '@/services/scoreinsideApi';

interface TransferDataStore {
  transfers: Transfer[];
  teamTalkTransfers: Transfer[];
  scoreInsideTransfers: Transfer[];
  teamSpecificTransfers: Map<string, Transfer[]>;
  allTransfers: Transfer[];
  lastUpdated: string;
  teamTalkLastUpdated: string | null;
  scoreInsideLastUpdated: string | null;
  overrideTransfers: (newTransfers: Transfer[]) => void;
  refreshTeamTalkFeed: () => Promise<void>;
  refreshScoreInsideFeed: () => Promise<void>;
  refreshAllData: () => Promise<void>;
  refreshTeamData: (teamSlug: string) => Promise<void>;
  getTeamTransfers: (teamSlug: string) => Transfer[];
  teamTalkLoading: boolean;
  teamTalkError: string | null;
  scoreInsideLoading: boolean;
  scoreInsideError: string | null;
}

const TransferDataContext = createContext<TransferDataStore | undefined>(undefined);

export const TransferDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transfers, setTransfers] = useState<Transfer[]>(allClubTransfers);
  const [teamTalkTransfers, setTeamTalkTransfers] = useState<Transfer[]>([]);
  const [scoreInsideTransfers, setScoreInsideTransfers] = useState<Transfer[]>([]);
  const [teamSpecificTransfers, setTeamSpecificTransfers] = useState<Map<string, Transfer[]>>(new Map());
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [teamTalkLastUpdated, setTeamTalkLastUpdated] = useState<string | null>(null);
  const [scoreInsideLastUpdated, setScoreInsideLastUpdated] = useState<string | null>(null);
  const [teamTalkLoading, setTeamTalkLoading] = useState(false);
  const [teamTalkError, setTeamTalkError] = useState<string | null>(null);
  const [scoreInsideLoading, setScoreInsideLoading] = useState(false);
  const [scoreInsideError, setScoreInsideError] = useState<string | null>(null);

  // Merge transfers from all sources, avoiding duplicates
  const allTransfers = React.useMemo(() => {
    const merged = [...transfers];
    const existingKeys = new Set<string>();
    
    // Create keys for existing transfers to avoid duplicates
    transfers.forEach(t => {
      const key = `${t.playerName.toLowerCase()}-${t.fromClub.toLowerCase()}-${t.toClub.toLowerCase()}`;
      existingKeys.add(key);
      existingKeys.add(t.id);
    });
    
    // Add TeamTalk transfers that don't already exist
    teamTalkTransfers.forEach(ttTransfer => {
      const key = `${ttTransfer.playerName.toLowerCase()}-${ttTransfer.fromClub.toLowerCase()}-${ttTransfer.toClub.toLowerCase()}`;
      if (!existingKeys.has(ttTransfer.id) && !existingKeys.has(key)) {
        merged.push(ttTransfer);
        existingKeys.add(ttTransfer.id);
        existingKeys.add(key);
      }
    });
    
    // Add ScoreInside transfers that don't already exist
    scoreInsideTransfers.forEach(siTransfer => {
      const key = `${siTransfer.playerName.toLowerCase()}-${siTransfer.fromClub.toLowerCase()}-${siTransfer.toClub.toLowerCase()}`;
      if (!existingKeys.has(siTransfer.id) && !existingKeys.has(key)) {
        merged.push(siTransfer);
        existingKeys.add(siTransfer.id);
        existingKeys.add(key);
      }
    });
    
    // Sort by date (newest first)
    return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transfers, teamTalkTransfers, scoreInsideTransfers]);

  const overrideTransfers = (newTransfers: Transfer[]) => {
    setTransfers(newTransfers);
    setLastUpdated(new Date().toISOString());
  };

  const refreshTeamTalkFeed = async () => {
    setTeamTalkLoading(true);
    setTeamTalkError(null);
    
    try {
      const ttTransfers = await teamTalkApi.getTransfers();
      setTeamTalkTransfers(ttTransfers);
      setTeamTalkLastUpdated(new Date().toISOString());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch TeamTalk data';
      setTeamTalkError(errorMessage);
      console.error('TeamTalk feed error:', error);
    } finally {
      setTeamTalkLoading(false);
    }
  };

  const refreshScoreInsideFeed = async () => {
    setScoreInsideLoading(true);
    setScoreInsideError(null);
    
    try {
      const [allTeamsData, flatTransfers] = await Promise.all([
        scoreInsideApi.getAllTeamsTransfers(),
        scoreInsideApi.getAllTransfers()
      ]);
      
      setTeamSpecificTransfers(allTeamsData);
      setScoreInsideTransfers(flatTransfers);
      setScoreInsideLastUpdated(new Date().toISOString());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch ScoreInside data';
      setScoreInsideError(errorMessage);
      console.error('ScoreInside feed error:', error);
    } finally {
      setScoreInsideLoading(false);
    }
  };

  const refreshTeamData = async (teamSlug: string) => {
    try {
      // Clear cache and fetch fresh data for specific team
      scoreInsideApi.clearCache(teamSlug);
      const teamData = await scoreInsideApi.getTeamTransfers(teamSlug);
      
      // Update team-specific data
      setTeamSpecificTransfers(prev => {
        const updated = new Map(prev);
        updated.set(teamSlug, teamData);
        return updated;
      });
      
      // Refresh all ScoreInside transfers
      const updatedAllTransfers = await scoreInsideApi.getAllTransfers();
      setScoreInsideTransfers(updatedAllTransfers);
      
      setScoreInsideLastUpdated(new Date().toISOString());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to refresh ${teamSlug} data`;
      setScoreInsideError(errorMessage);
      console.error(`Team refresh error for ${teamSlug}:`, error);
    }
  };

  const refreshAllData = async () => {
    await Promise.all([
      refreshTeamTalkFeed(),
      refreshScoreInsideFeed()
    ]);
  };

  const getTeamTransfers = (teamSlug: string): Transfer[] => {
    // Get transfers from ScoreInside for the specific team
    const scoreInsideTeamTransfers = teamSpecificTransfers.get(teamSlug) || [];
    
    // Also include any transfers from static data that match the team
    const staticTeamTransfers = transfers.filter(t => 
      t.fromClub.toLowerCase().includes(teamSlug.replace('-', ' ')) ||
      t.toClub.toLowerCase().includes(teamSlug.replace('-', ' '))
    );
    
    // Merge and deduplicate
    const combined = [...scoreInsideTeamTransfers, ...staticTeamTransfers];
    const uniqueTransfers = combined.filter((transfer, index, arr) => {
      const key = `${transfer.playerName.toLowerCase()}-${transfer.fromClub.toLowerCase()}-${transfer.toClub.toLowerCase()}`;
      return arr.findIndex(t => 
        `${t.playerName.toLowerCase()}-${t.fromClub.toLowerCase()}-${t.toClub.toLowerCase()}` === key
      ) === index;
    });
    
    return uniqueTransfers.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Auto-fetch data on mount
  useEffect(() => {
    refreshTeamTalkFeed();
    refreshScoreInsideFeed();
  }, []);

  // Auto-refresh data at different intervals
  useEffect(() => {
    const teamTalkInterval = setInterval(refreshTeamTalkFeed, 10 * 60 * 1000); // 10 minutes
    const scoreInsideInterval = setInterval(refreshScoreInsideFeed, 15 * 60 * 1000); // 15 minutes
    
    return () => {
      clearInterval(teamTalkInterval);
      clearInterval(scoreInsideInterval);
    };
  }, []);

  const store: TransferDataStore = {
    transfers,
    teamTalkTransfers,
    scoreInsideTransfers,
    teamSpecificTransfers,
    allTransfers,
    lastUpdated,
    teamTalkLastUpdated,
    scoreInsideLastUpdated,
    overrideTransfers,
    refreshTeamTalkFeed,
    refreshScoreInsideFeed,
    refreshAllData,
    refreshTeamData,
    getTeamTransfers,
    teamTalkLoading,
    teamTalkError,
    scoreInsideLoading,
    scoreInsideError
  };

  return (
    <TransferDataContext.Provider value={store}>
      {children}
    </TransferDataContext.Provider>
  );
};

export const useTransferDataStore = (): TransferDataStore => {
  const context = useContext(TransferDataContext);
  if (!context) {
    throw new Error('useTransferDataStore must be used within a TransferDataProvider');
  }
  return context;
};

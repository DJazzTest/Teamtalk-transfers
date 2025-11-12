import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Player, clubSquads, getSquad } from '@/data/squadWages';
import { PlayerDetailModal } from '@/components/PlayerDetailModal';

interface OpenPlayerModalOptions {
  teamName?: string;
  playerData?: Partial<Player>;
}

interface PlayerModalContextValue {
  openPlayerModal: (playerName: string, options?: OpenPlayerModalOptions) => void;
  closePlayerModal: () => void;
}

const PlayerModalContext = createContext<PlayerModalContextValue | undefined>(undefined);

const createFallbackPlayer = (playerName: string, playerData?: Partial<Player>): Player => {
  if (!playerName || typeof playerName !== 'string') {
    console.error('createFallbackPlayer called with invalid playerName:', playerName);
    return {
      name: 'Unknown Player',
      weeklyWage: 0,
      yearlyWage: 0
    };
  }
  return {
    name: playerName.trim(),
    weeklyWage: playerData?.weeklyWage ?? 0,
    yearlyWage: playerData?.yearlyWage ?? 0,
    position: playerData?.position,
    imageUrl: playerData?.imageUrl,
    age: playerData?.age,
    shirtNumber: playerData?.shirtNumber,
    seasonStats: playerData?.seasonStats,
    bio: playerData?.bio,
    transferHistory: playerData?.transferHistory,
    previousMatches: playerData?.previousMatches
  };
};

export const PlayerModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [player, setPlayer] = useState<Player | null>(null);
  const [teamName, setTeamName] = useState<string>('');

  const resolvePlayerData = useCallback((playerName: string, options?: OpenPlayerModalOptions) => {
    const normalizedName = playerName.trim().toLowerCase();
    const preferredTeam = options?.teamName?.trim();

    const searchSquad = (club: string): Player | null => {
      try {
        const squad = getSquad(club);
        return squad.find(p => p.name.toLowerCase() === normalizedName) || null;
      } catch {
        return null;
      }
    };

    if (preferredTeam) {
      const playerFromPreferredTeam = searchSquad(preferredTeam);
      if (playerFromPreferredTeam) {
        return { player: playerFromPreferredTeam, team: preferredTeam };
      }
    }

    for (const club of Object.keys(clubSquads)) {
      const match = searchSquad(club);
      if (match) {
        return { player: match, team: club };
      }
    }

    return {
      player: createFallbackPlayer(playerName, options?.playerData),
      team: preferredTeam || ''
    };
  }, []);

  const openPlayerModal = useCallback(
    (playerName: string, options?: OpenPlayerModalOptions) => {
      if (!playerName) {
        console.warn('openPlayerModal called without playerName');
        return;
      }
      try {
        const { player: resolvedPlayer, team } = resolvePlayerData(playerName, options);
        if (!resolvedPlayer) {
          console.warn('No player data resolved for:', playerName);
          return;
        }
        // Ensure player has at least a name
        if (!resolvedPlayer.name) {
          console.error('Resolved player missing name:', resolvedPlayer);
          return;
        }
        setPlayer(resolvedPlayer);
        setTeamName(team || options?.teamName || '');
        setIsOpen(true);
      } catch (error) {
        console.error('Error opening player modal:', error);
      }
    },
    [resolvePlayerData]
  );

  const closePlayerModal = useCallback(() => {
    setIsOpen(false);
    setPlayer(null);
    setTeamName('');
  }, []);

  return (
    <PlayerModalContext.Provider value={{ openPlayerModal, closePlayerModal }}>
      {children}
      <PlayerDetailModal
        player={player}
        teamName={teamName}
        isOpen={isOpen}
        onClose={closePlayerModal}
      />
    </PlayerModalContext.Provider>
  );
};

export const usePlayerModal = (): PlayerModalContextValue => {
  const context = useContext(PlayerModalContext);
  if (!context) {
    throw new Error('usePlayerModal must be used within a PlayerModalProvider');
  }
  return context;
};


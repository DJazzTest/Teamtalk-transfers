import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DEFAULT_TEAM_BIOS } from '@/data/teamBios';
import { useClubBadge } from '@/hooks/useClubBadge';

type ClubBioAction = 'overview' | 'compare' | 'squad';

interface ClubBioContextValue {
  openClubBio: (club: string) => void;
  closeClubBio: () => void;
}

interface ClubBioProviderProps {
  children: ReactNode;
}

const ClubBioContext = createContext<ClubBioContextValue | undefined>(undefined);

const dispatchClubAction = (action: ClubBioAction, club: string) => {
  window.dispatchEvent(
    new CustomEvent('clubbio:navigate', {
      detail: { action, club },
    }),
  );
};

export const ClubBioProvider: React.FC<ClubBioProviderProps> = ({ children }) => {
  const [activeClub, setActiveClub] = useState<string | null>(null);
  const { badgeSrc } = useClubBadge(activeClub);

  const value = useMemo(
    () => ({
      openClubBio: (club: string) => setActiveClub(club),
      closeClubBio: () => setActiveClub(null),
    }),
    [],
  );

  const clubBio = activeClub ? DEFAULT_TEAM_BIOS[activeClub] : null;

  const parsedHonours = useMemo(() => {
    if (!clubBio?.honours?.length) return [];
    return clubBio.honours.map((entry) => {
      const [labelPart, valuePart] = entry.split(':');
      const countMatch = valuePart?.match(/\d+/);
      const count = countMatch ? parseInt(countMatch[0], 10) : 0;
      const detail =
        valuePart?.replace(countMatch?.[0] || '', '').replace(/[:]/g, '').trim() || '';
      return {
        label: labelPart?.trim() || 'Honour',
        count,
        detail,
        original: entry,
        displayValue: valuePart?.trim() || '',
      };
    });
  }, [clubBio]);

  const maxHonourCount = useMemo(
    () => Math.max(...parsedHonours.map((h) => h.count || 0), 1),
    [parsedHonours],
  );

  return (
    <ClubBioContext.Provider value={value}>
      {children}
      <Dialog open={!!activeClub} onOpenChange={(open) => !open && setActiveClub(null)}>
        <DialogContent className="max-w-lg">
          {activeClub && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                    {badgeSrc ? (
                      <img src={badgeSrc} alt={`${activeClub} badge`} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-sm font-semibold">{activeClub[0]}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Club Bio</p>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{activeClub}</h3>
                  </div>
                </DialogTitle>
              </DialogHeader>

              {clubBio ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-700 dark:text-gray-200">{clubBio.intro}</p>
                  {clubBio.facts && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {clubBio.facts.map((fact) => (
                        <div key={`${fact.label}-${fact.value}`} className="rounded-lg border border-gray-200 dark:border-slate-700 p-3">
                          <p className="text-xs uppercase text-gray-500 dark:text-gray-400">{fact.label}</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{fact.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {parsedHonours.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        {clubBio.honoursHeading || 'Major Honours'}
                      </p>
                      <div className="space-y-2">
                        {parsedHonours.map((honour) => {
                          const percentage = honour.count > 0 ? Math.min(100, (honour.count / maxHonourCount) * 100) : 0;
                          return (
                            <div key={honour.original} className="space-y-1">
                              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                                <span className="font-medium">{honour.label}</span>
                                <span className="font-semibold text-gray-700 dark:text-gray-100">
                                  {honour.count > 0 ? honour.count : honour.displayValue}
                                </span>
                              </div>
                              {honour.count > 0 && (
                                <div className="h-1.5 rounded-full bg-gray-200 dark:bg-slate-800 overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${percentage}%`,
                                      backgroundColor: '#6b7280',
                                    }}
                                  />
                                </div>
                              )}
                              {honour.detail && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">{honour.detail}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-300">No biography available yet for this club.</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-4">
                <Button
                  variant="outline"
                  className="justify-center"
                  onClick={() => {
                    if (activeClub) {
                      // Dispatch the event first
                      dispatchClubAction('overview', activeClub);
                      // Close the dialog after a small delay to ensure event is processed
                      setTimeout(() => {
                        setActiveClub(null);
                      }, 100);
                    }
                  }}
                >
                  View Club Overview
                </Button>
                <Button variant="secondary" className="justify-center" onClick={() => setActiveClub(null)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </ClubBioContext.Provider>
  );
};

export const useClubBio = () => {
  const context = useContext(ClubBioContext);
  if (!context) {
    throw new Error('useClubBio must be used within a ClubBioProvider');
  }
  return context;
};


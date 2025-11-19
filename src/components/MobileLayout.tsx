import React from 'react';
import { Card } from '@/components/ui/card';
import { TransferCountdown } from '@/components/TransferCountdown';
import { FlashBanner } from '@/components/FlashBanner';
import { ClubSpendingChart2025 } from '@/components/ClubSpendingChart2025';
import { ClubTransfersList } from '@/components/ClubTransfersList';
import { ConfirmedTransfersTab } from '@/components/ConfirmedTransfersTab';
import { NewsCarousel } from '@/components/NewsCarousel';
import { ChatterBoxDisplay } from '@/components/ChatterBoxDisplay';
import { Top10ExpensiveVertical } from '@/components/Top10ExpensiveVertical';
import { VideoTab } from '@/components/VideoTab';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, MessageSquare, Newspaper, TrendingUp, Video } from 'lucide-react';
import { Transfer } from '@/types/transfer';
import { PlanetSportFooter } from '@/components/PlanetSportFooter';

interface MobileLayoutProps {
  countdownTarget: string;
  newsView: 'confirmed' | 'news' | 'chatter' | 'top10' | 'video';
  setNewsView: (view: 'confirmed' | 'news' | 'chatter' | 'top10' | 'video') => void;
  allTransfers: Transfer[];
  premierLeagueClubs: string[];
  availableSeasons: string[];
  transferSelectionIns: string | undefined;
  setTransferSelectionIns: (value: string | undefined) => void;
  transferSelectionOuts: string | undefined;
  setTransferSelectionOuts: (value: string | undefined) => void;
  onSelectClub: (club: string, playerName?: string) => void;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  countdownTarget,
  newsView,
  setNewsView,
  allTransfers,
  premierLeagueClubs,
  availableSeasons,
  transferSelectionIns,
  setTransferSelectionIns,
  transferSelectionOuts,
  setTransferSelectionOuts,
  onSelectClub,
}) => {
  return (
    <div className="w-full max-w-full px-2 sm:px-4 py-2 space-y-4">
      {/* Transfer Window Countdown */}
      <Card className="bg-white dark:bg-slate-800/50 backdrop-blur-md border-gray-200 dark:border-slate-700 shadow-lg">
        <div className="p-3">
          <TransferCountdown targetDate={countdownTarget} />
        </div>
      </Card>

      {/* Flash Banner */}
      <FlashBanner />

      {/* Club Spending Chart */}
      <Card className="bg-white dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 shadow-md">
        <div className="p-3">
          <ClubSpendingChart2025 onSelectClub={onSelectClub} />
        </div>
      </Card>

      {/* Transfers In */}
      <Card className="bg-white dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 shadow-md">
        <div className="p-3">
          <div className="mb-3">
            <Select value={transferSelectionIns} onValueChange={setTransferSelectionIns}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Transfer season" />
              </SelectTrigger>
              <SelectContent>
                {availableSeasons.map((season) => (
                  <SelectItem key={`ins-${season}`} value={`ins-${season}`}>
                    Summer Ins {season}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="border-b-2 border-blue-600 dark:border-blue-400 mb-3"></div>
          <div className="max-h-96 overflow-y-auto">
            <ClubTransfersList
              transfers={allTransfers}
              clubs={premierLeagueClubs}
              type="in"
              window="summer"
              season={transferSelectionIns ? transferSelectionIns.split('-')[1] : undefined}
              onSelectClub={onSelectClub}
            />
          </div>
        </div>
      </Card>

      {/* News Tabs */}
      <Card className="bg-white dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 shadow-md">
        <div className="p-3">
          {/* Tab Buttons */}
          <div className="flex items-center justify-center mb-3 border-b-2 border-gray-200 dark:border-slate-700 pb-2">
            <div className="flex items-center gap-2 overflow-x-auto w-full justify-center flex-wrap">
              <button
                onClick={() => setNewsView('confirmed')}
                className={`flex items-center gap-1 text-xs sm:text-sm font-semibold transition-colors px-2 py-1 rounded ${
                  newsView === 'confirmed'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Confirmed</span>
              </button>
              <button
                onClick={() => setNewsView('news')}
                className={`flex items-center gap-1 text-xs sm:text-sm font-semibold transition-colors px-2 py-1 rounded ${
                  newsView === 'news'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <Newspaper className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>News</span>
              </button>
              <button
                onClick={() => setNewsView('chatter')}
                className={`flex items-center gap-1 text-xs sm:text-sm font-semibold transition-colors px-2 py-1 rounded ${
                  newsView === 'chatter'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Live hub</span>
                <span className="live-dot w-2 h-2 rounded-full bg-green-500" />
              </button>
              <button
                onClick={() => setNewsView('top10')}
                className={`flex items-center gap-1 text-xs sm:text-sm font-semibold transition-colors px-2 py-1 rounded ${
                  newsView === 'top10'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Top 10</span>
              </button>
              <button
                onClick={() => setNewsView('video')}
                className={`flex items-center gap-1 text-xs sm:text-sm font-semibold transition-colors px-2 py-1 rounded ${
                  newsView === 'video'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <Video className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Video</span>
              </button>
            </div>
          </div>
          <style>{`
            .live-dot {
              animation: livePulse 1.5s ease-in-out infinite;
              box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
            }
            @keyframes livePulse {
              0% {
                opacity: 1;
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
              }
              50% {
                opacity: 0.8;
                transform: scale(1.1);
                box-shadow: 0 0 0 4px rgba(34, 197, 94, 0);
              }
              100% {
                opacity: 1;
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
              }
            }
          `}</style>
          {/* Tab Content */}
          <div className="max-h-96 overflow-y-auto">
            {newsView === 'confirmed' ? (
              <ConfirmedTransfersTab transfers={allTransfers} onSelectClub={onSelectClub} />
            ) : newsView === 'news' ? (
              <NewsCarousel maxItems={5} />
            ) : newsView === 'chatter' ? (
              <ChatterBoxDisplay />
            ) : newsView === 'video' ? (
              <VideoTab />
            ) : (
              <Top10ExpensiveVertical transfers={allTransfers} onSelectClub={onSelectClub} />
            )}
          </div>
        </div>
      </Card>

      {/* Transfers Out */}
      <Card className="bg-white dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 shadow-md">
        <div className="p-3">
          <div className="mb-3">
            <Select value={transferSelectionOuts} onValueChange={setTransferSelectionOuts}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Transfer season" />
              </SelectTrigger>
              <SelectContent>
                {availableSeasons.map((season) => (
                  <SelectItem key={`outs-${season}`} value={`outs-${season}`}>
                    Summer Outs {season}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="border-b-2 border-red-600 dark:border-red-400 mb-3"></div>
          <div className="max-h-96 overflow-y-auto">
            <ClubTransfersList
              transfers={allTransfers}
              clubs={premierLeagueClubs}
              type="out"
              window="summer"
              season={transferSelectionOuts ? transferSelectionOuts.split('-')[1] : undefined}
              onSelectClub={onSelectClub}
            />
          </div>
        </div>
      </Card>

      {/* Blue Divider Bar */}
      <div className="w-full h-1 bg-blue-600 dark:bg-blue-500 my-2"></div>

      {/* Planet Sport Network Footer */}
      <PlanetSportFooter />
    </div>
  );
};


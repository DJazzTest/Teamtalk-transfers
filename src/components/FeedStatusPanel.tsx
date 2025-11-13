import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTransferDataStore } from '@/store/transferDataStore';

export const FeedStatusPanel: React.FC = () => {
  const {
    feedErrors,
    teamTalkError,
    scoreInsideError,
    teamTalkTransfers,
    scoreInsideAllTransfers,
    teamTalkLoading,
    scoreInsideLoading,
    refreshTeamTalkFeed,
    refreshScoreInsideFeed,
    lastUpdated
  } = useTransferDataStore();

  const getFeedStatus = (feedName: string, error: string | null, transfers: any[], loading: boolean) => {
    if (loading) {
      return { status: 'checking', message: 'Checking...', color: 'bg-yellow-500/20 text-yellow-400' };
    }
    if (error) {
      return { status: 'error', message: error, color: 'bg-red-500/20 text-red-400' };
    }
    if (transfers.length === 0) {
      return { status: 'no-results', message: 'No results returned', color: 'bg-orange-500/20 text-orange-400' };
    }
    return { status: 'ok', message: `${transfers.length} items`, color: 'bg-green-500/20 text-green-400' };
  };

  const teamTalkStatus = getFeedStatus('TeamTalk', teamTalkError, teamTalkTransfers, teamTalkLoading);
  const scoreInsideStatus = getFeedStatus('ScoreInside', scoreInsideError, scoreInsideAllTransfers, scoreInsideLoading);

  return (
    <Card className="bg-slate-800/80 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-white">Feed Status</CardTitle>
          {lastUpdated && (
            <span className="text-xs text-slate-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* TeamTalk Feed Status */}
        <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600">
          <div className="flex items-center gap-3">
            {teamTalkStatus.status === 'ok' ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <div>
              <div className="font-medium text-white">TeamTalk Feed</div>
              <div className="text-sm text-slate-400">
                {teamTalkStatus.status === 'checking' ? 'Checking status...' : 
                 teamTalkStatus.status === 'error' ? teamTalkStatus.message :
                 teamTalkStatus.status === 'no-results' ? 'Feed returned no results' :
                 `Working - ${teamTalkStatus.message}`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={teamTalkStatus.color}>
              {teamTalkStatus.status === 'ok' ? 'Online' :
               teamTalkStatus.status === 'checking' ? 'Checking' :
               teamTalkStatus.status === 'error' ? 'Error' : 'No Results'}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={refreshTeamTalkFeed}
              disabled={teamTalkLoading}
              className="border-slate-600 hover:bg-slate-600"
            >
              <RefreshCw className={`w-4 h-4 ${teamTalkLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* ScoreInside Feed Status */}
        <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600">
          <div className="flex items-center gap-3">
            {scoreInsideStatus.status === 'ok' ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <div>
              <div className="font-medium text-white">ScoreInside Feed</div>
              <div className="text-sm text-slate-400">
                {scoreInsideStatus.status === 'checking' ? 'Checking status...' : 
                 scoreInsideStatus.status === 'error' ? scoreInsideStatus.message :
                 scoreInsideStatus.status === 'no-results' ? 'Feed returned no results' :
                 `Working - ${scoreInsideStatus.message}`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={scoreInsideStatus.color}>
              {scoreInsideStatus.status === 'ok' ? 'Online' :
               scoreInsideStatus.status === 'checking' ? 'Checking' :
               scoreInsideStatus.status === 'error' ? 'Error' : 'No Results'}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={refreshScoreInsideFeed}
              disabled={scoreInsideLoading}
              className="border-slate-600 hover:bg-slate-600"
            >
              <RefreshCw className={`w-4 h-4 ${scoreInsideLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Summary */}
        {feedErrors.length > 0 && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-red-400 mb-2">Active Feed Issues</div>
                <ul className="space-y-1">
                  {feedErrors.map((error, idx) => (
                    <li key={idx} className="text-sm text-red-300">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {feedErrors.length === 0 && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div className="text-sm text-green-300">All feeds are operating normally</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


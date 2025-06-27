
import React from 'react';
import { CrawlStatus } from '@/types/transfer';

interface ScrapeControlsProps {
  crawlProgress: { completed: number; total: number; currentUrl: string } | null;
}

export const ScrapeControls: React.FC<ScrapeControlsProps> = ({ crawlProgress }) => {
  if (!crawlProgress) return null;

  return (
    <div className="mt-4 space-y-2">
      <div className="flex justify-between text-sm text-blue-200">
        <span>Progress: {crawlProgress.completed}/{crawlProgress.total}</span>
        <span>{Math.round((crawlProgress.completed / crawlProgress.total) * 100)}%</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(crawlProgress.completed / crawlProgress.total) * 100}%` }}
        ></div>
      </div>
      <p className="text-xs text-slate-300 truncate">
        Current: {crawlProgress.currentUrl}
      </p>
    </div>
  );
};

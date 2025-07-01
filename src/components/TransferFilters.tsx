
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Globe } from 'lucide-react';

interface TransferFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedClub: string;
  setSelectedClub: (club: string) => void;
  viewMode: 'list' | 'clubs' | 'lanes';
  setViewMode: (mode: 'list' | 'clubs' | 'lanes') => void;
  onScrapeUrls: () => void;
  isScraping: boolean;
  availableClubs: string[];
}

export const TransferFilters: React.FC<TransferFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedClub,
  setSelectedClub,
  viewMode,
  setViewMode,
  onScrapeUrls,
  isScraping,
  availableClubs
}) => {
  return (
    <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
      <div className="p-4">
        <div className="flex gap-4 flex-wrap items-center">
          <div className="flex-1 min-w-48">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search players, clubs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
              />
            </div>
          </div>
          <Select value={selectedClub} onValueChange={setSelectedClub}>
            <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Filter by club" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clubs</SelectItem>
              {availableClubs.map((club) => (
                <SelectItem key={club} value={club}>
                  {club}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={viewMode} onValueChange={(value: 'list' | 'clubs' | 'lanes') => setViewMode(value)}>
            <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lanes">Lanes</SelectItem>
              <SelectItem value="clubs">By Club</SelectItem>
              <SelectItem value="list">List View</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={onScrapeUrls}
            disabled={isScraping}
            className="bg-slate-600 hover:bg-slate-700 text-white"
          >
            <Globe className="w-4 h-4 mr-2" />
            {isScraping ? 'Scraping...' : 'Scrape URLs'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

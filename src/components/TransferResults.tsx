import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Users, TrendingUp, CheckCircle, Clock, Globe, MessageCircle, Verified, AlertCircle, X } from 'lucide-react';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { useToast } from '@/hooks/use-toast';

interface Transfer {
  id: string;
  playerName: string;
  fromClub: string;
  toClub: string;
  fee: string;
  date: string;
  source: string;
  status: 'confirmed' | 'rumored' | 'pending' | 'rejected';
  rejectionReason?: string;
}

interface TransferResultsProps {
  lastUpdated: Date;
}

interface CrawlStatus {
  url: string;
  status: 'success' | 'error' | 'pending';
  error?: string;
}

// Updated mock data with rejected transfers
const mockTransfers: Transfer[] = [
  {
    id: '1',
    playerName: 'Matheus Cunha',
    fromClub: 'Atletico Madrid',
    toClub: 'Manchester United',
    fee: '£45M',
    date: '2025-06-15',
    source: 'Sky Sports',
    status: 'confirmed'
  },
  {
    id: '2',
    playerName: 'Diego León',
    fromClub: 'Real Sociedad',
    toClub: 'Manchester United',
    fee: '£25M',
    date: '2025-06-20',
    source: 'BBC Sport',
    status: 'confirmed'
  },
  {
    id: '3',
    playerName: 'Chido Obi',
    fromClub: 'Crystal Palace',
    toClub: 'Manchester United',
    fee: '£18M',
    date: '2025-06-12',
    source: 'Manchester Evening News',
    status: 'confirmed'
  },
  {
    id: '4',
    playerName: 'Tyler Fredricson',
    fromClub: 'Ajax',
    toClub: 'Manchester United',
    fee: '£35M',
    date: '2025-06-25',
    source: 'Goal.com',
    status: 'pending'
  },
  {
    id: '5',
    playerName: 'Marcus Rashford',
    fromClub: 'PSG',
    toClub: 'Manchester United',
    fee: '£60M',
    date: '2025-06-08',
    source: 'The Guardian',
    status: 'confirmed'
  },
  {
    id: '6',
    playerName: 'Antony',
    fromClub: 'Real Madrid',
    toClub: 'Manchester United',
    fee: '£40M',
    date: '2025-06-18',
    source: 'ESPN',
    status: 'confirmed'
  },
  {
    id: '7',
    playerName: 'Tyrell Malacia',
    fromClub: 'AC Milan',
    toClub: 'Manchester United',
    fee: '£22M',
    date: '2025-06-22',
    source: 'Sky Sports',
    status: 'confirmed'
  },
  {
    id: '8',
    playerName: 'Marcus Silva',
    fromClub: 'Porto',
    toClub: 'Arsenal',
    fee: '£28M',
    date: '2025-06-22',
    source: 'ESPN',
    status: 'confirmed'
  },
  {
    id: '9',
    playerName: 'João Santos',
    fromClub: 'Benfica',
    toClub: 'Chelsea',
    fee: '£42M',
    date: '2025-06-18',
    source: 'The Guardian',
    status: 'confirmed'
  },
  {
    id: '10',
    playerName: 'Alex Thompson',
    fromClub: 'Brighton',
    toClub: 'Liverpool',
    fee: '£15M',
    date: '2025-06-21',
    source: 'Liverpool Echo',
    status: 'pending'
  },
  {
    id: '11',
    playerName: 'Georginio Rutter',
    fromClub: 'Hoffenheim',
    toClub: 'Leeds United',
    fee: '£32M',
    date: '2025-06-10',
    source: 'Leeds Live',
    status: 'confirmed'
  },
  {
    id: '12',
    playerName: 'Wilfried Gnonto',
    fromClub: 'FC Zurich',
    toClub: 'Leeds United',
    fee: '£4.5M',
    date: '2025-06-14',
    source: 'Yorkshire Evening Post',
    status: 'confirmed'
  },
  {
    id: '13',
    playerName: 'Kylian Mbappé',
    fromClub: 'PSG',
    toClub: 'Liverpool',
    fee: '£150M',
    date: '2025-06-28',
    source: 'The Sun',
    status: 'rumored'
  },
  {
    id: '14',
    playerName: 'Pedri',
    fromClub: 'Barcelona',
    toClub: 'Chelsea',
    fee: '£80M',
    date: '2025-06-30',
    source: 'Daily Mail',
    status: 'rumored'
  },
  {
    id: '15',
    playerName: 'Neymar Jr',
    fromClub: 'Al-Hilal',
    toClub: 'Manchester United',
    fee: '£25M',
    date: '2025-06-20',
    source: 'Sky Sports',
    status: 'rejected',
    rejectionReason: 'Failed medical - knee injury concerns'
  },
  {
    id: '16',
    playerName: 'Paulo Dybala',
    fromClub: 'AS Roma',
    toClub: 'Arsenal',
    fee: '£30M',
    date: '2025-06-18',
    source: 'BBC Sport',
    status: 'rejected',
    rejectionReason: 'Personal terms disagreement'
  },
  {
    id: '17',
    playerName: 'Ivan Toney',
    fromClub: 'Brentford',
    toClub: 'Newcastle United',
    fee: '£40M',
    date: '2025-06-22',
    source: 'The Guardian',
    status: 'rejected',
    rejectionReason: 'Club pulled out due to high wage demands'
  },
  {
    id: '18',
    playerName: 'Moussa Diaby',
    fromClub: 'Aston Villa',
    toClub: 'Chelsea',
    fee: '£50M',
    date: '2025-06-25',
    source: 'ESPN',
    status: 'rejected',
    rejectionReason: 'Work permit issues'
  }
];

const premierLeagueClubs = [
  'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton & Hove Albion',
  'Burnley', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Leeds United',
  'Liverpool', 'Manchester City', 'Manchester United', 'Newcastle United',
  'Nottingham Forest', 'Sunderland', 'Tottenham Hotspur', 'West Ham United',
  'Wolverhampton Wanderers'
];

export const TransferResults: React.FC<TransferResultsProps> = ({ lastUpdated }) => {
  const [transfers] = useState<Transfer[]>(mockTransfers);
  const [filteredTransfers, setFilteredTransfers] = useState<Transfer[]>(mockTransfers);
  const [selectedClub, setSelectedClub] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'clubs' | 'lanes'>('lanes');
  const [isScraping, setIsScraping] = useState(false);
  const [crawlStatuses, setCrawlStatuses] = useState<CrawlStatus[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    let filtered = transfers;

    if (selectedClub !== 'all') {
      filtered = filtered.filter(transfer => transfer.toClub === selectedClub);
    }

    if (searchTerm) {
      filtered = filtered.filter(transfer =>
        transfer.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.fromClub.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.toClub.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTransfers(filtered);
  }, [transfers, selectedClub, searchTerm]);

  // Dispatch crawl status updates to other components
  useEffect(() => {
    const event = new CustomEvent('crawlStatusUpdate', { detail: crawlStatuses });
    window.dispatchEvent(event);
  }, [crawlStatuses]);

  const handleScrapeUrls = async () => {
    const apiKey = FirecrawlService.getApiKey();
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your Firecrawl API key in the API Config tab first.",
        variant: "destructive",
      });
      return;
    }

    const savedUrls = localStorage.getItem('transfer_urls');
    if (!savedUrls) {
      toast({
        title: "No URLs Found",
        description: "Please add URLs to scrape in the Sources tab first.",
        variant: "destructive",
      });
      return;
    }

    const urls = JSON.parse(savedUrls);
    setIsScraping(true);
    
    // Initialize crawl statuses
    const initialStatuses: CrawlStatus[] = urls.map((url: string) => ({
      url,
      status: 'pending' as const
    }));
    setCrawlStatuses(initialStatuses);

    try {
      toast({
        title: "Scraping Started",
        description: `Starting to scrape ${urls.length} URLs for transfer data...`,
      });

      const result = await FirecrawlService.crawlTransferSources(urls);
      
      if (result.success && result.data) {
        console.log('Successfully scraped URLs:', result.data);
        
        // Update crawl statuses based on results
        const updatedStatuses: CrawlStatus[] = urls.map((url: string) => {
          const crawlResult = result.data.find((r: any) => r.url === url);
          if (crawlResult) {
            return {
              url,
              status: crawlResult.success ? 'success' : 'error',
              error: crawlResult.error
            };
          }
          return {
            url,
            status: 'error',
            error: 'No result returned'
          };
        });
        setCrawlStatuses(updatedStatuses);
        
        const successCount = updatedStatuses.filter(s => s.status === 'success').length;
        const errorCount = updatedStatuses.filter(s => s.status === 'error').length;
        
        toast({
          title: "Scraping Complete",
          description: `${successCount} successful, ${errorCount} failed. Check the status indicators below.`,
        });
      } else {
        console.error('Failed to scrape URLs:', result.error);
        
        // Mark all as failed
        const failedStatuses: CrawlStatus[] = urls.map((url: string) => ({
          url,
          status: 'error',
          error: result.error || 'Unknown error'
        }));
        setCrawlStatuses(failedStatuses);
        
        toast({
          title: "Scraping Error",
          description: result.error || "Failed to scrape URLs.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error during scraping:', error);
      
      // Mark all as failed
      const failedStatuses: CrawlStatus[] = urls.map((url: string) => ({
        url,
        status: 'error',
        error: 'Network or system error'
      }));
      setCrawlStatuses(failedStatuses);
      
      toast({
        title: "Scraping Error",
        description: "An error occurred while scraping URLs.",
        variant: "destructive",
      });
    } finally {
      setIsScraping(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'rumored': return 'bg-blue-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <Verified className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rumored': return <MessageCircle className="w-4 h-4" />;
      case 'rejected': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const groupTransfersByClub = () => {
    const grouped: { [key: string]: Transfer[] } = {};
    filteredTransfers.forEach(transfer => {
      if (!grouped[transfer.toClub]) {
        grouped[transfer.toClub] = [];
      }
      grouped[transfer.toClub].push(transfer);
    });
    return grouped;
  };

  const groupTransfersByStatus = () => {
    const grouped: { [key: string]: Transfer[] } = {
      confirmed: [],
      rumored: [],
      pending: [],
      rejected: []
    };
    
    filteredTransfers.forEach(transfer => {
      grouped[transfer.status].push(transfer);
    });
    
    return grouped;
  };

  const clubTransfers = groupTransfersByClub();
  const statusTransfers = groupTransfersByStatus();

  const getLaneTitle = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmed Transfers';
      case 'rumored': return 'Transfer Gossip';
      case 'pending': return 'Pending Deals';
      case 'rejected': return 'Rejected Deals';
      default: return status;
    }
  };

  const getLaneIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'rumored': return <MessageCircle className="w-5 h-5 text-blue-400" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'rejected': return <X className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
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
                {premierLeagueClubs.map((club) => (
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
              onClick={handleScrapeUrls}
              disabled={isScraping}
              className="bg-slate-600 hover:bg-slate-700 text-white"
            >
              <Globe className="w-4 h-4 mr-2" />
              {isScraping ? 'Scraping...' : 'Scrape URLs'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Crawl Status Display */}
      {crawlStatuses.length > 0 && (
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              URL Crawl Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
              {crawlStatuses.map((status, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-slate-700/50 rounded-lg p-3"
                >
                  <div className="flex-shrink-0">
                    {status.status === 'success' && (
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    )}
                    {status.status === 'error' && (
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    )}
                    {status.status === 'pending' && (
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{status.url}</p>
                    {status.error && (
                      <p className="text-red-400 text-xs truncate" title={status.error}>
                        {status.error}
                      </p>
                    )}
                  </div>
                  {status.status === 'success' && (
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  )}
                  {status.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
          <div className="p-4 flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-semibold">{filteredTransfers.length}</p>
              <p className="text-gray-300 text-sm">Total Transfers</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
          <div className="p-4 flex items-center gap-3">
            <div className="bg-green-500/20 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-white font-semibold">
                {filteredTransfers.filter(t => t.status === 'confirmed').length}
              </p>
              <p className="text-gray-300 text-sm">Confirmed</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
          <div className="p-4 flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <MessageCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-semibold">
                {filteredTransfers.filter(t => t.status === 'rumored').length}
              </p>
              <p className="text-gray-300 text-sm">Gossip</p>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
          <div className="p-4 flex items-center gap-3">
            <div className="bg-red-500/20 p-2 rounded-lg">
              <X className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-white font-semibold">
                {filteredTransfers.filter(t => t.status === 'rejected').length}
              </p>
              <p className="text-gray-300 text-sm">Rejected</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Transfer Display */}
      <div className="space-y-4">
        {filteredTransfers.length === 0 ? (
          <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
            <div className="p-8 text-center">
              <p className="text-gray-400">No transfers found matching your criteria</p>
            </div>
          </Card>
        ) : viewMode === 'lanes' ? (
          // Lanes View
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {Object.entries(statusTransfers).map(([status, statusTransferList]) => (
              <div key={status} className="space-y-4">
                <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
                  <div className="p-4 border-b border-slate-600">
                    <div className="flex items-center gap-3">
                      {getLaneIcon(status)}
                      <h3 className="text-lg font-bold text-white">
                        {getLaneTitle(status)}
                      </h3>
                      <Badge className={`${getStatusColor(status)} text-white text-xs`}>
                        {statusTransferList.length}
                      </Badge>
                    </div>
                  </div>
                </Card>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {statusTransferList.map((transfer) => (
                    <Card key={transfer.id} className="bg-slate-800/50 backdrop-blur-md border-slate-700 hover:bg-slate-800/70 transition-all duration-200">
                      <div className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(transfer.status)}
                            <h4 className="font-semibold text-white text-sm">{transfer.playerName}</h4>
                          </div>
                          
                          <div className="text-xs text-gray-300">
                            <div className="flex items-center gap-1 mb-1">
                              <span>{transfer.fromClub}</span>
                              <span>→</span>
                              <span className="font-semibold text-white">{transfer.toClub}</span>
                            </div>
                          </div>
                          
                          {transfer.rejectionReason && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
                              <p className="text-red-400 text-xs">{transfer.rejectionReason}</p>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-sm font-bold text-green-400">{transfer.fee}</p>
                              <p className="text-xs text-gray-300">{new Date(transfer.date).toLocaleDateString()}</p>
                            </div>
                            <p className="text-xs text-gray-300">{transfer.source}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : viewMode === 'clubs' ? (
          // Club View
          Object.entries(clubTransfers).map(([club, clubTransferList]) => (
            <Card key={club} className="bg-slate-800/50 backdrop-blur-md border-slate-700">
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-600 pb-2">
                  {club} ({clubTransferList.length} transfers)
                </h3>
                <div className="space-y-3">
                  {clubTransferList.map((transfer) => (
                    <div key={transfer.id} className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700/70 transition-all duration-200">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-white">{transfer.playerName}</h4>
                            <Badge className={`${getStatusColor(transfer.status)} text-white text-xs`}>
                              {transfer.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <span>{transfer.fromClub}</span>
                            <span>→</span>
                            <span className="font-semibold text-white">{transfer.toClub}</span>
                          </div>
                          {transfer.rejectionReason && (
                            <div className="mt-2 bg-red-500/10 border border-red-500/20 rounded p-2">
                              <p className="text-red-400 text-sm">{transfer.rejectionReason}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-400">{transfer.fee}</p>
                          <p className="text-xs text-gray-300">{transfer.source}</p>
                          <p className="text-xs text-gray-400">{new Date(transfer.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))
        ) : (
          // List View
          filteredTransfers.map((transfer) => (
            <Card key={transfer.id} className="bg-slate-800/50 backdrop-blur-md border-slate-700 hover:bg-slate-800/70 transition-all duration-200">
              <div className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{transfer.playerName}</h3>
                      <Badge className={`${getStatusColor(transfer.status)} text-white text-xs`}>
                        {transfer.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <span>{transfer.fromClub}</span>
                      <span>→</span>
                      <span className="font-semibold text-white">{transfer.toClub}</span>
                    </div>
                    {transfer.rejectionReason && (
                      <div className="mt-2 bg-red-500/10 border border-red-500/20 rounded p-2">
                        <p className="text-red-400 text-sm">{transfer.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-400">{transfer.fee}</p>
                    <p className="text-xs text-gray-300">{transfer.source}</p>
                    <p className="text-xs text-gray-400">{new Date(transfer.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

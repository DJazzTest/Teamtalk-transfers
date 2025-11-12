import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, Trash2, Edit, Plus, TestTube } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ApiEndpoint {
  id: string;
  name: string;
  url: string;
  description: string;
  status: 'online' | 'offline' | 'checking' | 'untested';
  lastChecked?: Date;
  responseTime?: number;
  error?: string;
}

const DEFAULT_APIS: ApiEndpoint[] = [
  {
    id: 'teamtalk-feed',
    name: 'TeamTalk Feed',
    url: 'https://www.teamtalk.com/mobile-app-feed',
    description: 'Primary news and article feed',
    status: 'untested'
  },
  {
    id: 'scoreinside-news',
    name: 'ScoreInside News',
    url: 'https://liveapi.scoreinside.com/api/user/favourite/teams/news?page=1&per_page=10&fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    description: 'Transfer news and updates',
    status: 'untested'
  },
  {
    id: 'scoreinside-transfers',
    name: 'ScoreInside Transfers',
    url: 'https://liveapi.scoreinside.com/api/user/favourite/team-top-transfers?fcm_token=ftDpqcK1kEhKnCaKaNwRoJ:APA91bE19THSCAH7gP9HDem38JSdtO6BRHCRY3u-P9vOZ7XvJy_z-Y9zkCwluk2xizPW8iACUDLdRbuB-PYqLUZ40aBnUBczeY8Ku923Q2MXcUog5gTDAZQ',
    description: 'Live transfer data',
    status: 'untested'
  }
];

const STORAGE_KEY = 'api_endpoints';

const deserializeApi = (raw: any): ApiEndpoint | null => {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    url: String(raw.url ?? ''),
    description: String(raw.description ?? ''),
    status: (raw.status === 'online' || raw.status === 'offline' || raw.status === 'checking' || raw.status === 'untested')
      ? raw.status
      : 'untested',
    lastChecked: raw.lastChecked ? new Date(raw.lastChecked) : undefined,
    responseTime: typeof raw.responseTime === 'number' ? raw.responseTime : undefined,
    error: raw.error ? String(raw.error) : undefined,
  };
};

export const ApiManagementPanel: React.FC = () => {
  const [apis, setApis] = useState<ApiEndpoint[]>(DEFAULT_APIS);
  const [editingApi, setEditingApi] = useState<ApiEndpoint | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [testingApis, setTestingApis] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Form state
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const normalized = parsed
            .map(deserializeApi)
            .filter((api): api is ApiEndpoint => !!api);

          if (normalized.length > 0) {
            setApis(normalized);
            return;
          }
        }
        setApis(DEFAULT_APIS);
      } catch {
        setApis(DEFAULT_APIS);
      }
    }
  }, []);

  const saveApis = (newApis: ApiEndpoint[]) => {
    setApis(newApis);
    const serializable = newApis.map(api => ({
      ...api,
      lastChecked: api.lastChecked ? api.lastChecked.toISOString() : undefined
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  };

  const testApiEndpoint = async (api: ApiEndpoint): Promise<ApiEndpoint> => {
    const startTime = Date.now();
    
    try {
      // Try different approaches for different API types
      let response: Response;
      let useCorsProxy = false;
      
      if (api.url.includes('teamtalk.com')) {
        // TeamTalk API works with CORS, try direct first
        try {
          response = await fetch(api.url, {
            method: 'GET',
            mode: 'cors',
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache'
            },
            cache: 'no-store'
          });
          // Check if response is ok before proceeding
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (corsError) {
          // If CORS fails or response not ok, try with proxy (like the service does)
          useCorsProxy = true;
          const proxyUrl = `https://cors.isomorphic-git.org/${api.url}`;
          response = await fetch(proxyUrl, {
            method: 'GET',
            mode: 'cors',
            headers: {
              'Accept': 'application/json'
            }
          });
        }
      } else {
        // Other APIs with standard approach
        response = await fetch(api.url, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'TransferCentre/1.0'
          }
        });
      }
      
      const responseTime = Date.now() - startTime;
      
      if (!response.ok) {
        return {
          ...api,
          status: 'offline',
          lastChecked: new Date(),
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
      
      // Try to read and parse the response to verify it's valid
      try {
        const text = await response.text();
        
        if (!text || text.length === 0) {
          return {
            ...api,
            status: 'offline',
            lastChecked: new Date(),
            responseTime,
            error: 'Empty response received'
          };
        }
        
        // Try to parse as JSON to verify it's valid
        try {
          const json = JSON.parse(text);
          
          // For TeamTalk API, check for expected structure
          if (api.url.includes('teamtalk.com')) {
            const isValid = json.status === 200 && json.message === 'success' && Array.isArray(json.items);
            return {
              ...api,
              status: isValid ? 'online' : 'offline',
              lastChecked: new Date(),
              responseTime,
              error: isValid ? undefined : `Unexpected response structure. Expected status: 200, message: success, items array. Got: ${JSON.stringify({ status: json.status, message: json.message, hasItems: Array.isArray(json.items) })}`
            };
          }
          
          // For other APIs, just check if it's valid JSON
          return {
            ...api,
            status: 'online',
            lastChecked: new Date(),
            responseTime,
            error: undefined
          };
        } catch (parseError) {
          // Not JSON, but has content - might be HTML or other format
          return {
            ...api,
            status: 'online',
            lastChecked: new Date(),
            responseTime,
            error: useCorsProxy ? 'Response received (via proxy) but not JSON format' : undefined
          };
        }
      } catch (readError) {
        // Can't read response (CORS issue)
        return {
          ...api,
          status: 'offline',
          lastChecked: new Date(),
          responseTime,
          error: 'Cannot read response. CORS policy may be blocking access. API may still be working.'
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const responseTime = Date.now() - startTime;
      
      // Provide more specific error messages
      let detailedError = errorMessage;
      if (errorMessage.includes('CORS') || errorMessage.includes('cors')) {
        detailedError = 'CORS policy blocks this request. API may still be working but inaccessible from browser.';
      } else if (errorMessage.includes('Failed to fetch')) {
        detailedError = 'Network error or API is down. Check URL and network connectivity.';
      }
      
      return {
        ...api,
        status: 'offline',
        lastChecked: new Date(),
        responseTime,
        error: detailedError
      };
    }
  };

  const handleTestApi = async (apiId: string) => {
    setTestingApis(prev => new Set(prev).add(apiId));
    
    const api = apis.find(a => a.id === apiId);
    if (!api) return;

    const updatedApi = await testApiEndpoint(api);
    
    const newApis = apis.map(a => a.id === apiId ? updatedApi : a);
    saveApis(newApis);
    
    setTestingApis(prev => {
      const next = new Set(prev);
      next.delete(apiId);
      return next;
    });

    toast({
      title: `API Test Result`,
      description: `${api.name}: ${updatedApi.status === 'online' ? 'Online' : 'Offline'}`,
      variant: updatedApi.status === 'online' ? 'default' : 'destructive'
    });
  };

  const handleTestAllApis = async () => {
    toast({
      title: "Testing all APIs",
      description: "This may take a few moments..."
    });

    const testPromises = apis.map(api => testApiEndpoint(api));
    const results = await Promise.all(testPromises);
    saveApis(results);

    const onlineCount = results.filter(api => api.status === 'online').length;
    toast({
      title: "API Tests Complete",
      description: `${onlineCount} of ${apis.length} APIs are online`
    });
  };

  const handleAddApi = () => {
    if (!name.trim() || !url.trim()) {
      toast({
        title: "Missing required fields",
        description: "Name and URL are required",
        variant: "destructive"
      });
      return;
    }

    const newApi: ApiEndpoint = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      url: url.trim(),
      description: description.trim(),
      status: 'untested'
    };

    saveApis([...apis, newApi]);
    setName('');
    setUrl('');
    setDescription('');
    setIsAddDialogOpen(false);

    toast({
      title: "API Added",
      description: `${newApi.name} has been added successfully`
    });
  };

  const handleEditApi = () => {
    if (!editingApi || !name.trim() || !url.trim()) return;

    const updatedApi: ApiEndpoint = {
      ...editingApi,
      name: name.trim(),
      url: url.trim(),
      description: description.trim(),
      status: 'untested' // Reset status when edited
    };

    const newApis = apis.map(api => api.id === editingApi.id ? updatedApi : api);
    saveApis(newApis);
    
    setEditingApi(null);
    setName('');
    setUrl('');
    setDescription('');

    toast({
      title: "API Updated",
      description: `${updatedApi.name} has been updated successfully`
    });
  };

  const handleRemoveApi = (apiId: string) => {
    const api = apis.find(a => a.id === apiId);
    if (!api) return;

    const newApis = apis.filter(a => a.id !== apiId);
    saveApis(newApis);

    toast({
      title: "API Removed",
      description: `${api.name} has been removed`
    });
  };

  const openEditDialog = (api: ApiEndpoint) => {
    setEditingApi(api);
    setName(api.name);
    setUrl(api.url);
    setDescription(api.description);
  };

  const getStatusIcon = (status: string, isLoading: boolean) => {
    if (isLoading) return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
    
    switch (status) {
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'offline':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-red-500';
      case 'untested':
        return 'bg-gray-500';
      default:
        return 'bg-yellow-500';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">API Management</h3>
        <div className="flex gap-2">
          <Button onClick={handleTestAllApis} variant="outline" size="sm">
            <TestTube className="w-4 h-4 mr-2" />
            Test All APIs
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add API
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New API Endpoint</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="API Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <Input
                  placeholder="API URL"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                />
                <Input
                  placeholder="Description (optional)"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
                <Button onClick={handleAddApi} className="w-full">
                  Add API
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        {apis.map((api) => {
          const isLoading = testingApis.has(api.id);
          
          return (
            <div key={api.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(api.status, isLoading)}
                    <h4 className="font-semibold">{api.name}</h4>
                    <Badge className={`${getStatusColor(api.status)} text-white text-xs`}>
                      {isLoading ? 'Testing...' : api.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2 break-all">
                    {api.url}
                  </div>
                  
                  {api.description && (
                    <div className="text-sm text-gray-500 mb-2">
                      {api.description}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {api.lastChecked && (
                      <span>Last checked: {api.lastChecked.toLocaleTimeString()}</span>
                    )}
                    {api.responseTime && (
                      <span>Response: {api.responseTime}ms</span>
                    )}
                  </div>

                  {api.error && (
                    <div className="text-xs text-red-500 mt-2 p-2 bg-red-50 rounded">
                      Error: {api.error}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    onClick={() => handleTestApi(api.id)}
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                  >
                    <TestTube className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    onClick={() => openEditDialog(api)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    onClick={() => handleRemoveApi(api.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingApi} onOpenChange={() => setEditingApi(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit API Endpoint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="API Name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <Input
              placeholder="API URL"
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
            <Input
              placeholder="Description (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <Button onClick={handleEditApi} className="w-full">
              Update API
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
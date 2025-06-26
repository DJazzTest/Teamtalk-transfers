
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, Play, Pause } from 'lucide-react';

interface RefreshControlProps {
  refreshRate: number;
  setRefreshRate: (rate: number) => void;
  isAutoRefresh: boolean;
  setIsAutoRefresh: (auto: boolean) => void;
  onManualRefresh: () => void;
}

export const RefreshControl: React.FC<RefreshControlProps> = ({
  refreshRate,
  setRefreshRate,
  isAutoRefresh,
  setIsAutoRefresh,
  onManualRefresh
}) => {
  const refreshOptions = [
    { value: 60000, label: '1 minute' },
    { value: 300000, label: '5 minutes' },
    { value: 600000, label: '10 minutes' },
    { value: 1800000, label: '30 minutes' },
    { value: 3600000, label: '1 hour' }
  ];

  return (
    <Card className="bg-white/70 backdrop-blur-md border-gray-200/50 shadow-lg">
      <div className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={isAutoRefresh}
                onCheckedChange={setIsAutoRefresh}
              />
              <span className="text-gray-700 text-sm">
                {isAutoRefresh ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </span>
              <span className="text-gray-700 text-sm">Auto Refresh</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-700 text-sm">Every:</span>
              <Select
                value={refreshRate.toString()}
                onValueChange={(value) => setRefreshRate(Number(value))}
              >
                <SelectTrigger className="w-32 bg-white border-gray-300 text-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {refreshOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={onManualRefresh}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Now
          </Button>
        </div>
      </div>
    </Card>
  );
};


import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, Play, Pause, Clock } from 'lucide-react';

interface DataRefreshSectionProps {
  refreshRate: number;
  setRefreshRate: (rate: number) => void;
  isAutoRefresh: boolean;
  setIsAutoRefresh: (auto: boolean) => void;
  onManualRefresh: () => void;
}

export const DataRefreshSection: React.FC<DataRefreshSectionProps> = ({
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

  const handleRefreshClick = () => {
    console.log('Refresh Now button clicked');
    onManualRefresh();
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <RefreshCw className="w-4 h-4" />
        Data Refresh
      </h3>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <Switch
            checked={isAutoRefresh}
            onCheckedChange={setIsAutoRefresh}
          />
          <span className="text-gray-700 text-sm">
            {isAutoRefresh ? <Play className="w-4 h-4 text-green-600" /> : <Pause className="w-4 h-4 text-red-500" />}
          </span>
          <span className="text-gray-700 text-sm">Auto Refresh</span>
          {isAutoRefresh && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <Clock className="w-3 h-3" />
              <span>Active</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-gray-700 text-sm whitespace-nowrap">Every:</span>
          <Select
            value={refreshRate.toString()}
            onValueChange={(value) => setRefreshRate(Number(value))}
          >
            <SelectTrigger className="w-full sm:w-32 bg-white border-gray-300 text-gray-700 text-sm">
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
        
        <Button
          onClick={handleRefreshClick}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm w-full sm:w-auto"
          size="sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Now
        </Button>
      </div>
    </div>
  );
};

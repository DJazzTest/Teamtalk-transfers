
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CountdownSettingsProps {
  targetDate: string;
  onDateChange: (date: string) => void;
}

export const CountdownSettings: React.FC<CountdownSettingsProps> = ({ 
  targetDate, 
  onDateChange 
}) => {
  const [localDate, setLocalDate] = useState(targetDate);
  const [localTime, setLocalTime] = useState('23:59');
  const { toast } = useToast();

  const handleSave = () => {
    const combinedDateTime = `${localDate}T${localTime}:00`;
    onDateChange(combinedDateTime);
    toast({
      title: "Countdown Settings Updated",
      description: `Transfer window countdown set to ${new Date(combinedDateTime).toLocaleString()}`,
    });
  };

  const currentDate = new Date(targetDate);
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatTimeForInput = (date: Date) => {
    return date.toTimeString().slice(0, 5);
  };

  React.useEffect(() => {
    setLocalDate(formatDateForInput(currentDate));
    setLocalTime(formatTimeForInput(currentDate));
  }, [targetDate]);

  return (
    <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">Transfer Window Countdown Settings</h3>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="countdown-date" className="text-white">
                Target Date
              </Label>
              <Input
                id="countdown-date"
                type="date"
                value={localDate}
                onChange={(e) => setLocalDate(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="countdown-time" className="text-white">
                Target Time
              </Label>
              <Input
                id="countdown-time"
                type="time"
                value={localTime}
                onChange={(e) => setLocalTime(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <div className="space-y-4">
              <div>
                <Label className="text-white text-sm font-medium">Current Countdown Target</Label>
                <p className="text-gray-300 text-sm mt-1">
                  {currentDate.toLocaleDateString()} at {currentDate.toLocaleTimeString()}
                </p>
              </div>

              <Button 
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Countdown Settings
              </Button>
            </div>
          </div>

          <div className="bg-slate-700/50 p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Quick Presets</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const summerEnd = new Date();
                  summerEnd.setMonth(8, 1); // September 1st
                  summerEnd.setHours(23, 59, 0, 0);
                  if (summerEnd < new Date()) {
                    summerEnd.setFullYear(summerEnd.getFullYear() + 1);
                  }
                  setLocalDate(formatDateForInput(summerEnd));
                  setLocalTime('23:59');
                }}
                className="text-gray-300 border-slate-600 hover:bg-slate-600"
              >
                Summer Window End
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const winterEnd = new Date();
                  winterEnd.setMonth(1, 1); // February 1st
                  winterEnd.setHours(23, 59, 0, 0);
                  if (winterEnd < new Date()) {
                    winterEnd.setFullYear(winterEnd.getFullYear() + 1);
                  }
                  setLocalDate(formatDateForInput(winterEnd));
                  setLocalTime('23:59');
                }}
                className="text-gray-300 border-slate-600 hover:bg-slate-600"
              >
                Winter Window End
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

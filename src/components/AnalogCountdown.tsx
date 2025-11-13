import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface AnalogCountdownProps {
  targetDate: string;
  onRevert: () => void;
}

export const AnalogCountdown: React.FC<AnalogCountdownProps> = ({ targetDate, onRevert }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const target = new Date(targetDate);
    
    const updateTimer = () => {
      const now = new Date();
      const difference = target.getTime() - now.getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const target = new Date(targetDate);
  const isExpired = target.getTime() < new Date().getTime();

  // Format numbers with leading zeros
  const formatNumber = (num: number, digits: number = 2) => {
    return String(num).padStart(digits, '0');
  };

  return (
    <div className="space-y-3">
      <div className="text-center bg-blue-50 dark:bg-[#1d3b5f] rounded-lg p-4 transition-colors border border-blue-100 dark:border-[#335b8c] shadow">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400">Transfer Window Opens</h2>
        </div>
        
        {isExpired ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 sm:p-4 max-w-md mx-auto shadow-inner">
            <p className="text-green-600 dark:text-green-400 text-sm sm:text-base font-bold">Transfer Window is Now Open!</p>
            <p className="text-gray-600 dark:text-gray-300 text-xs mt-1">The winter transfer window has begun</p>
          </div>
        ) : (
          <div className="w-full">
            {/* Digital Countdown Display */}
            <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 max-w-4xl mx-auto">
              {/* Days */}
              <div className="flex flex-col items-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-mono font-extrabold leading-none h-8 sm:h-10 md:h-12 flex items-center justify-center text-green-600 dark:text-[#4dff4d] min-w-[2.5rem] sm:min-w-[3rem] md:min-w-[3.5rem]">
                  {timeLeft.days}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 font-semibold">Days</div>
              </div>

              {/* Separator */}
              <div className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold leading-none h-8 sm:h-10 md:h-12 flex items-center justify-center text-green-600 dark:text-[#4dff4d] min-w-[1rem] sm:min-w-[1.5rem] md:min-w-[2rem] translate-y-[2px]">
                :
              </div>

              {/* Hours */}
              <div className="flex flex-col items-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold leading-none h-8 sm:h-10 md:h-12 flex items-center justify-center text-green-600 dark:text-[#4dff4d] min-w-[2.5rem] sm:min-w-[3rem] md:min-w-[3.5rem]">
                  {formatNumber(timeLeft.hours, 2)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 font-semibold">Hours</div>
              </div>

              {/* Separator */}
              <div className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold leading-none h-8 sm:h-10 md:h-12 flex items-center justify-center text-green-600 dark:text-[#4dff4d] min-w-[1rem] sm:min-w-[1.5rem] md:min-w-[2rem] translate-y-[2px]">
                :
              </div>

              {/* Minutes */}
              <div className="flex flex-col items-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold leading-none h-8 sm:h-10 md:h-12 flex items-center justify-center text-green-600 dark:text-[#4dff4d] min-w-[2.5rem] sm:min-w-[3rem] md:min-w-[3.5rem]">
                  {formatNumber(timeLeft.minutes, 2)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 font-semibold">Minutes</div>
              </div>

              {/* Separator */}
              <div className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold leading-none h-8 sm:h-10 md:h-12 flex items-center justify-center text-green-600 dark:text-[#4dff4d] min-w-[1rem] sm:min-w-[1.5rem] md:min-w-[2rem] translate-y-[2px]">
                :
              </div>

              {/* Seconds */}
              <div className="flex flex-col items-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold leading-none h-8 sm:h-10 md:h-12 flex items-center justify-center text-green-600 dark:text-[#4dff4d] min-w-[2.5rem] sm:min-w-[3rem] md:min-w-[3.5rem]">
                  {formatNumber(timeLeft.seconds, 2)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 font-semibold">Seconds</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

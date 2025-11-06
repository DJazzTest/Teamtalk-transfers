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

  // Calculate rotation angles for analog display
  const secondsAngle = (timeLeft.seconds / 60) * 360;
  const minutesAngle = (timeLeft.minutes / 60) * 360;
  const hoursAngle = ((timeLeft.hours % 12) / 12) * 360;
  const daysAngle = (timeLeft.days / 365) * 360; // Assuming max 365 days

  const AnalogClock = ({ value, maxValue, label, color, angle }: {
    value: number;
    maxValue: number;
    label: string;
    color: string;
    angle: number;
  }) => (
    <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 flex-shrink-0">
      {/* 3D Base */}
      <div 
        className="absolute inset-0 rounded-full shadow-2xl"
        style={{
          background: `linear-gradient(145deg, #f0f0f0, #d0d0d0)`,
          transform: 'perspective(100px) rotateX(10deg)',
        }}
      />
      
      {/* Clock Face */}
      <div 
        className="absolute inset-2 rounded-full border-4 flex items-center justify-center"
        style={{
          background: `radial-gradient(circle, white, #f8f9fa)`,
          borderColor: color,
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        {/* Hour markers */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-3 bg-gray-400"
            style={{
              top: '8px',
              left: '50%',
              transformOrigin: '50% 32px',
              transform: `translateX(-50%) rotate(${i * 30}deg)`,
            }}
          />
        ))}
        
        {/* Hand */}
        <div
          className="absolute w-1 bg-red-500 rounded-full shadow-lg transition-transform duration-1000 ease-in-out"
          style={{
            height: '28px',
            top: '50%',
            left: '50%',
            transformOrigin: '50% 100%',
            transform: `translateX(-50%) translateY(-100%) rotate(${angle}deg)`,
            background: `linear-gradient(to top, ${color}, #ff6b6b)`,
          }}
        />
        
        {/* Center dot */}
        <div 
          className="absolute w-2 h-2 rounded-full"
          style={{ background: color }}
        />
      </div>
      
      {/* Digital display with label beside - responsive sizing */}
      <div 
        className="absolute -bottom-6 sm:-bottom-8 left-1/2 transform -translate-x-1/2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-sm sm:text-lg font-bold text-white shadow-lg flex items-center gap-1 sm:gap-2"
        style={{ backgroundColor: color }}
      >
        <span className="text-lg sm:text-2xl">{value}</span>
        <span className="text-xs sm:text-sm font-semibold">{label}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center" style={{ backgroundColor: '#2F517A', borderRadius: '0.5rem', padding: '1rem sm:2rem' }}>
        <div className="flex items-center justify-center gap-4 mb-4">
          <h2 className="text-lg sm:text-2xl font-bold text-blue-400">Transfer Window Opens</h2>
        </div>
        
        {isExpired ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-8 max-w-md mx-auto">
            <p className="text-green-600 text-lg sm:text-xl font-bold">Transfer Window is Now Open!</p>
            <p className="text-gray-600 text-xs sm:text-sm mt-2">The winter transfer window has begun</p>
          </div>
        ) : (
          <div className="w-full">
            {/* Mobile: Horizontal Carousel, Desktop: Centered Layout */}
            <div className="block sm:hidden">
              {/* Mobile Carousel */}
              <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className="flex gap-4 min-w-max px-4" style={{ paddingBottom: '40px' }}>
                  <AnalogClock
                    value={timeLeft.days}
                    maxValue={365}
                    label="Days"
                    color="#3b82f6"
                    angle={daysAngle}
                  />
                  <AnalogClock
                    value={timeLeft.hours}
                    maxValue={24}
                    label="Hours"
                    color="#10b981"
                    angle={hoursAngle}
                  />
                  <AnalogClock
                    value={timeLeft.minutes}
                    maxValue={60}
                    label="Minutes"
                    color="#f59e0b"
                    angle={minutesAngle}
                  />
                  <AnalogClock
                    value={timeLeft.seconds}
                    maxValue={60}
                    label="Seconds"
                    color="#ef4444"
                    angle={secondsAngle}
                  />
                </div>
              </div>
              {/* Mobile Instructions */}
              <div className="text-center text-blue-200 mb-4">
                <p className="text-xs">← Swipe to view all timers →</p>
              </div>
            </div>
            
            {/* Desktop: Original Layout */}
            <div className="hidden sm:block">
              <div className="flex flex-wrap justify-center gap-8 sm:gap-12 max-w-4xl mx-auto pb-16">
                <AnalogClock
                  value={timeLeft.days}
                  maxValue={365}
                  label="Days"
                  color="#3b82f6"
                  angle={daysAngle}
                />
                <AnalogClock
                  value={timeLeft.hours}
                  maxValue={24}
                  label="Hours"
                  color="#10b981"
                  angle={hoursAngle}
                />
                <AnalogClock
                  value={timeLeft.minutes}
                  maxValue={60}
                  label="Minutes"
                  color="#f59e0b"
                  angle={minutesAngle}
                />
                <AnalogClock
                  value={timeLeft.seconds}
                  maxValue={60}
                  label="Seconds"
                  color="#ef4444"
                  angle={secondsAngle}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

export const TransferCountdown = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date('2025-09-01T00:00:00');
    
    const updateTimer = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
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
  }, []);

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-white mb-2">Transfer Window Countdown</h2>
      <p className="text-blue-200 mb-6">June 1, 2025 - September 1, 2025</p>
      
      <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
          <div className="text-3xl font-bold text-white">{timeLeft.days}</div>
          <div className="text-sm text-blue-200">Days</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
          <div className="text-3xl font-bold text-white">{timeLeft.hours}</div>
          <div className="text-sm text-blue-200">Hours</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
          <div className="text-3xl font-bold text-white">{timeLeft.minutes}</div>
          <div className="text-sm text-blue-200">Minutes</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
          <div className="text-3xl font-bold text-white">{timeLeft.seconds}</div>
          <div className="text-sm text-blue-200">Seconds</div>
        </div>
      </div>
    </div>
  );
};

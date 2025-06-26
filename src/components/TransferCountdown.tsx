
import React, { useState, useEffect } from 'react';

interface TransferCountdownProps {
  targetDate: string;
}

export const TransferCountdown: React.FC<TransferCountdownProps> = ({ targetDate }) => {
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

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-white mb-2">Transfer Window Countdown</h2>
      <p className="text-gray-300 mb-6">
        {isExpired ? 'Transfer Window Closed' : `Countdown to ${target.toLocaleDateString()}`}
      </p>
      
      {isExpired ? (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-8 max-w-md mx-auto">
          <p className="text-red-400 text-xl font-bold">Transfer Window Closed</p>
          <p className="text-gray-300 text-sm mt-2">Configure a new date in the Settings tab</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-3xl font-bold text-blue-400">{timeLeft.days}</div>
            <div className="text-sm text-gray-300">Days</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-3xl font-bold text-blue-400">{timeLeft.hours}</div>
            <div className="text-sm text-gray-300">Hours</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-3xl font-bold text-blue-400">{timeLeft.minutes}</div>
            <div className="text-sm text-gray-300">Minutes</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-3xl font-bold text-blue-400">{timeLeft.seconds}</div>
            <div className="text-sm text-gray-300">Seconds</div>
          </div>
        </div>
      )}
    </div>
  );
};


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
    <div className="text-center" style={{ backgroundColor: '#2F517A', borderRadius: '0.5rem', padding: '2rem' }}>
      <h2 className="text-2xl font-bold text-blue-400 mb-2">Transfer Window Countdown</h2>
      
      {isExpired ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
          <p className="text-red-600 text-xl font-bold">Transfer Window Closed</p>
          <p className="text-gray-600 text-sm mt-2">Configure a new date in the Settings tab</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-4 shadow-lg">
            <div className="text-3xl font-bold text-white drop-shadow-lg">{timeLeft.days}</div>
            <div className="text-sm text-blue-100">Days</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg p-4 shadow-lg">
            <div className="text-3xl font-bold text-white drop-shadow-lg">{timeLeft.hours}</div>
            <div className="text-sm text-emerald-100">Hours</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg p-4 shadow-lg">
            <div className="text-3xl font-bold text-white drop-shadow-lg">{timeLeft.minutes}</div>
            <div className="text-sm text-purple-100">Minutes</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg p-4 shadow-lg">
            <div className="text-3xl font-bold text-white drop-shadow-lg">{timeLeft.seconds}</div>
            <div className="text-sm text-orange-100">Seconds</div>
          </div>
        </div>
      )}
    </div>
  );
};

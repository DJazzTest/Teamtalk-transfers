import React, { useState, useEffect } from 'react';

const CLOSED_HEADLINE_KEY = 'transfer_window_closed_headline';
const CLOSED_SUBTEXT_KEY = 'transfer_window_closed_subtext';
// We now just show the \"opens\" message as the main line
const DEFAULT_CLOSED_HEADLINE = 'Transfer window opens mid June';
const DEFAULT_CLOSED_SUBTEXT = '';

interface AnalogCountdownProps {
  targetDate: string;
}

export const AnalogCountdown: React.FC<AnalogCountdownProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [closedHeadline, setClosedHeadline] = useState(DEFAULT_CLOSED_HEADLINE);
  const [closedSubtext, setClosedSubtext] = useState(DEFAULT_CLOSED_SUBTEXT);

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

  // Load CMS-configured closed-state messaging
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedHeadline = localStorage.getItem(CLOSED_HEADLINE_KEY);
    const storedSubtext = localStorage.getItem(CLOSED_SUBTEXT_KEY);
    if (storedHeadline) setClosedHeadline(storedHeadline);
    if (storedSubtext) setClosedSubtext(storedSubtext);
  }, []);

  const target = new Date(targetDate);
  const isExpired = target.getTime() < new Date().getTime();

  // Format numbers with leading zeros
  const formatNumber = (num: number, digits: number = 2) => {
    return String(num).padStart(digits, '0');
  };

  return (
    <div className="space-y-3">
      <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-[#1a2f4a] dark:to-[#1d3b5f] rounded-xl p-6 transition-colors border-2 border-blue-200 dark:border-[#335b8c] shadow-lg">
        {isExpired ? (
          <div className="relative bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl p-6 max-w-md mx-auto shadow-inner overflow-hidden">
            {/* Simple football-style background animation */}
            <style>
              {`
              @keyframes footballFloat {
                0% { transform: translate3d(-10%, -10%, 0) rotate(0deg); opacity: 0.25; }
                50% { transform: translate3d(10%, 10%, 0) rotate(8deg); opacity: 0.4; }
                100% { transform: translate3d(-10%, -10%, 0) rotate(0deg); opacity: 0.25; }
              }
            `}
            </style>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 -top-6 w-24 h-24 rounded-full border-4 border-white/70 bg-gradient-to-br from-green-500/40 to-blue-500/40"
              style={{ animation: 'footballFloat 7s ease-in-out infinite' }}
            />
            <p className="text-green-700 dark:text-green-400 text-lg font-bold relative z-10">
              {closedHeadline}
            </p>
            {closedSubtext ? (
              <p className="text-gray-700 dark:text-gray-300 text-sm mt-2 relative z-10">
                {closedSubtext}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="w-full">
            {/* Digital Countdown Display */}
            <div className="flex justify-center items-baseline gap-3 max-w-4xl mx-auto">
              {/* Days */}
              <div className="flex flex-col items-center">
                <div className="bg-white dark:bg-slate-800 rounded-lg px-4 py-3 shadow-md border-2 border-blue-200 dark:border-blue-600 min-w-[80px]">
                  <div className="text-4xl font-mono font-extrabold text-blue-700 dark:text-blue-300 leading-none tabular-nums text-center">
                    {formatNumber(timeLeft.days, 2)}
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-semibold uppercase tracking-wide">Days</div>
              </div>

              {/* Separator */}
              <div className="text-3xl font-mono font-bold text-blue-600 dark:text-blue-400 pb-8">
                :
              </div>

              {/* Hours */}
              <div className="flex flex-col items-center">
                <div className="bg-white dark:bg-slate-800 rounded-lg px-4 py-3 shadow-md border-2 border-blue-200 dark:border-blue-600 min-w-[80px]">
                  <div className="text-4xl font-mono font-extrabold text-blue-700 dark:text-blue-300 leading-none tabular-nums text-center">
                    {formatNumber(timeLeft.hours, 2)}
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-semibold uppercase tracking-wide">Hours</div>
              </div>

              {/* Separator */}
              <div className="text-3xl font-mono font-bold text-blue-600 dark:text-blue-400 pb-8">
                :
              </div>

              {/* Minutes */}
              <div className="flex flex-col items-center">
                <div className="bg-white dark:bg-slate-800 rounded-lg px-4 py-3 shadow-md border-2 border-blue-200 dark:border-blue-600 min-w-[80px]">
                  <div className="text-4xl font-mono font-extrabold text-blue-700 dark:text-blue-300 leading-none tabular-nums text-center">
                    {formatNumber(timeLeft.minutes, 2)}
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-semibold uppercase tracking-wide">Minutes</div>
              </div>

              {/* Separator */}
              <div className="text-3xl font-mono font-bold text-blue-600 dark:text-blue-400 pb-8">
                :
              </div>

              {/* Seconds */}
              <div className="flex flex-col items-center">
                <div className="bg-white dark:bg-slate-800 rounded-lg px-4 py-3 shadow-md border-2 border-blue-200 dark:border-blue-600 min-w-[80px]">
                  <div className="text-4xl font-mono font-extrabold text-blue-700 dark:text-blue-300 leading-none tabular-nums text-center">
                    {formatNumber(timeLeft.seconds, 2)}
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-semibold uppercase tracking-wide">Seconds</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

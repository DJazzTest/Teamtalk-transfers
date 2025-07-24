import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';

const STORAGE_KEY = 'transfer_window_close';
const DEFAULT_CLOSE = '2025-09-01T18:00'; // ISO local (no Z)

function getStoredCloseTime() {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_CLOSE;
}

function setStoredCloseTime(val: string) {
  localStorage.setItem(STORAGE_KEY, val);
}

function getTimeLeft(target: string) {
  const now = new Date();
  const targetDate = new Date(target);
  const diff = targetDate.getTime() - now.getTime();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  return { days, hours, mins, secs };
}

export const TransferWindowCountdownSetting: React.FC = () => {
  const [closeTime, setCloseTime] = useState<string>(() => getStoredCloseTime());
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft>>(getTimeLeft(closeTime));

  useEffect(() => {
    setStoredCloseTime(closeTime);
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(closeTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [closeTime]);

  return (
    <div className="mb-8 p-4 bg-slate-800/60 rounded-lg flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <label className="block text-white font-semibold text-lg">Transfer Window Closes:</label>
        <Input
          type="datetime-local"
          value={closeTime}
          onChange={e => setCloseTime(e.target.value)}
          className="w-64"
        />
      </div>
      <div className="text-blue-200 text-md font-mono">
        {timeLeft
          ? `Countdown: ${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.mins}m ${timeLeft.secs}s`
          : 'Transfer window is closed.'}
      </div>
    </div>
  );
};

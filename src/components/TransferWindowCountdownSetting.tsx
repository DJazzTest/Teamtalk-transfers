import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';

const STORAGE_KEY = 'transfer_window_open';
const DEFAULT_OPEN = '2025-12-31T23:00'; // fallback

function getStoredOpenTime() {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_OPEN;
}

function setStoredOpenTime(val: string) {
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

function toLocalInput(dt: string) {
  // Expecting "YYYY-MM-DD HH:mm:ss" -> convert to "YYYY-MM-DDTHH:mm"
  try {
    const d = new Date(dt.replace(' ', 'T'));
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  } catch {
    return DEFAULT_OPEN;
  }
}

export const TransferWindowCountdownSetting: React.FC = () => {
  const [openTime, setOpenTime] = useState<string>(() => getStoredOpenTime());
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft>>(getTimeLeft(openTime));

  // Fetch default from staging countdown once on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('https://stagingapi.tt-apis.com/api/transfer-window-countdown?tournament_id=72602', {
          headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) return;
        const json = await res.json();
        const endDate = json?.result?.end_date as string | undefined;
        if (endDate) {
          const local = toLocalInput(endDate);
          if (!cancelled) {
            setOpenTime(local);
            setStoredOpenTime(local);
          }
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setStoredOpenTime(openTime);
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(openTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [openTime]);

  return (
    <div className="mb-8 p-4 bg-slate-800/60 rounded-lg flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <label className="block text-white font-semibold text-lg">Transfer Window Opens:</label>
        <Input
          type="datetime-local"
          value={openTime}
          onChange={e => setOpenTime(e.target.value)}
          className="w-64"
        />
      </div>
      <div className="text-blue-200 text-md font-mono">
        {timeLeft
          ? `Countdown: ${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.mins}m ${timeLeft.secs}s`
          : 'Transfer window is now open!'}
      </div>
    </div>
  );
};

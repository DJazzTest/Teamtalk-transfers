
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PollingStatusIndicator } from './PollingStatusIndicator';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface AppHeaderProps {
  lastUpdated: Date;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ lastUpdated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isAdminSection = location.pathname.startsWith('/admin') || location.pathname.startsWith('/cms');

  const handleMainClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/');
  };

      return (
        <header className="sticky top-0 z-50 shadow-lg bg-white dark:bg-[#0f1115] border-b border-gray-200 dark:border-black/60">
      <div className="bg-gray-50 dark:bg-[#1a1d24] border-b border-gray-200 dark:border-black/30">
        <div style={{ width: '1200px', margin: '0 auto', padding: '4px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12px', color: 'rgb(75 85 99)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
          <img
            src="https://www.teamtalk.com/content/themes/teamtalk2/img/png/logo/planet-sport-brand.png"
            alt="PlanetSport"
            style={{ height: '16px', width: 'auto' }}
            loading="lazy"
          />
          <span style={{ letterSpacing: '0.2em' }}>Part of the PlanetSport network</span>
        </div>
      </div>
      <div className="bg-white dark:bg-[#0f1115] border-b border-gray-200 dark:border-black/60">
        <div style={{ width: '1200px', margin: '0 auto', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
            <div style={{ flex: '1', textAlign: 'left' }}>
              <Link to="/" className="inline-block">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-start' }}>
                  <img
                    src="https://www.teamtalk.com/content/themes/teamtalk2/img/png/logo/teamtalk-mobile.png"
                    alt="TEAMtalk"
                    width="30"
                    height="27"
                    style={{ height: '32px', width: 'auto', flexShrink: 0 }}
                    loading="lazy"
                  />
                  <h1
                    className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
                    style={{
                      letterSpacing: '0.5px',
                      fontWeight: 700
                    }}
                  >
                    <span className="text-gray-600 dark:text-gray-400 uppercase">TEAMTALK</span>
                    <span className="text-gray-600 dark:text-gray-400">-Transfers</span>
                  </h1>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 uppercase tracking-[0.3em]">
                  Premier League Transfers &amp; Rumours
                </p>
              </Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px' }}>
              <PollingStatusIndicator compact={true} />
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-700 dark:bg-slate-800 hover:bg-slate-600 dark:hover:bg-slate-700 transition-colors border border-slate-600 dark:border-slate-700"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-blue-300" />
                )}
              </button>
              {isAdminSection && (
                <button
                  onClick={handleMainClick}
                  className="inline-block px-4 py-2 rounded bg-[#d32f2f] text-white font-semibold shadow hover:bg-[#b71c1c] transition-colors text-sm"
                >
                  Main
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

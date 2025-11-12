
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PollingStatusIndicator } from './PollingStatusIndicator';

interface AppHeaderProps {
  lastUpdated: Date;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ lastUpdated }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminSection = location.pathname.startsWith('/admin') || location.pathname.startsWith('/cms');

  const handleMainClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 shadow-lg">
      <div className="bg-[#1a1d24] border-b border-black/30">
        <div className="container mx-auto px-2 sm:px-4 py-1 flex items-center justify-center gap-2 text-[10px] sm:text-xs text-gray-300 tracking-[0.25em] uppercase">
          <img
            src="https://www.teamtalk.com/content/themes/teamtalk2/img/png/logo/planet-sport-brand.png"
            alt="PlanetSport"
            className="h-3 sm:h-4 w-auto"
            loading="lazy"
          />
          <span className="tracking-[0.2em]">Part of the PlanetSport network</span>
        </div>
      </div>
      <div className="bg-[#0f1115] border-b border-black/60">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
            <div className="flex-1 text-center sm:text-left">
              <Link to="/" className="inline-block">
                <h1
                  className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white"
                  style={{
                    letterSpacing: '0.5px',
                    fontWeight: 700
                  }}
                >
                  <span className="text-gray-400">TEAM</span>
                  <span className="text-[#d32f2f]">talk</span>
                  <span className="text-gray-400">-Transfers</span>
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-gray-400 uppercase tracking-[0.3em]">
                  Premier League Transfers &amp; Rumours
                </p>
              </Link>
            </div>
            <div className="flex items-center justify-center sm:justify-end gap-3 sm:gap-4">
              <PollingStatusIndicator compact={true} />
              {isAdminSection ? (
                <button
                  onClick={handleMainClick}
                  className="inline-block px-4 py-2 rounded bg-[#d32f2f] text-white font-semibold shadow hover:bg-[#b71c1c] transition-colors text-xs sm:text-sm"
                >
                  Main
                </button>
              ) : (
                <button
                  onClick={() => {
                    localStorage.removeItem('parsed_transfers');
                    window.location.reload();
                  }}
                  className="inline-block px-3 py-2 rounded bg-[#1f2329] text-gray-200 font-semibold shadow hover:bg-[#272c33] transition-colors text-xs sm:text-sm border border-gray-700"
                  title="Refresh transfer data"
                >
                  Refresh
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

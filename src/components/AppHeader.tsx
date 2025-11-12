
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
    <header className="bg-white border-b border-gray-300 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight"
                style={{
                  letterSpacing: '0.5px',
                  fontWeight: 700
                }}>
              <span className="text-[#1a1a1a]">TEAM</span><span className="text-[#d32f2f]">talk</span><span className="text-[#1a1a1a]">-Transfers</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 ml-2">
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
                className="inline-block px-3 py-2 rounded bg-gray-100 text-gray-800 font-semibold shadow hover:bg-gray-200 transition-colors text-xs sm:text-sm border border-gray-300"
                title="Refresh transfer data"
              >
                Refresh
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

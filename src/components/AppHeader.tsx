
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
    <header className="bg-white/70 backdrop-blur-lg border-b border-gray-200/30 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-lg"
                style={{
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3), 0px 0px 8px rgba(59,130,246,0.5)',
                  transform: 'perspective(200px) rotateX(5deg)',
                  letterSpacing: '1px'
                }}>
              Teamtalk-Transfers
            </h1>
          </div>
          <div className="flex items-center gap-4 ml-2">
            <PollingStatusIndicator compact={true} />
            {isAdminSection ? (
              <button
                onClick={handleMainClick}
                className="inline-block px-4 py-2 rounded bg-blue-700 text-white font-semibold shadow hover:bg-blue-800 transition-colors text-xs sm:text-sm"
              >
                Main
              </button>
            ) : (
              <button
                onClick={() => {
                  localStorage.removeItem('parsed_transfers');
                  window.location.reload();
                }}
                className="inline-block px-3 py-2 rounded bg-gray-200 text-gray-700 font-semibold shadow hover:bg-gray-300 transition-colors text-xs sm:text-sm"
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


import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PasswordModal from './ui/password-modal';

interface AppHeaderProps {
  lastUpdated: Date;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ lastUpdated }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const [pendingNav, setPendingNav] = useState(false);

  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setModalOpen(true);
  };

  const handleSuccess = () => {
    setPendingNav(true);
    navigate('/admin');
  };

  return (
    <header className="bg-white/70 backdrop-blur-lg border-b border-gray-200/30 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate drop-shadow-md">
              Teamtalk-Transfers Page
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm drop-shadow-sm">Live Transfer Tracking</p>
          </div>
          <div className="flex items-center gap-4 ml-2">
            <div className="text-right">
              <p className="text-xs sm:text-sm text-gray-500">Last Updated</p>
              <p className="text-xs font-medium text-gray-700">{lastUpdated.toLocaleTimeString()}</p>
            </div>
            <button
              onClick={handleAdminClick}
              className="inline-block px-4 py-2 rounded bg-blue-700 text-white font-semibold shadow hover:bg-blue-800 transition-colors text-xs sm:text-sm"
            >
              Admin
            </button>
            <PasswordModal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              onSuccess={handleSuccess}
              correctPassword="teamtalk2025"
            />
          </div>
        </div>
      </div>
    </header>
  );
};


import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { Settings, Home } from 'lucide-react';

export const AdminNavigation: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  return (
    <div className="fixed top-4 right-4 z-50">
      {isAdmin ? (
        <Link to="/">
          <Button
            variant="outline"
            size="sm"
            className="bg-blue-600/20 border-blue-400/50 text-blue-300 hover:bg-blue-600/30"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Website
          </Button>
        </Link>
      ) : (
        <Link to="/admin">
          <Button
            variant="outline"
            size="sm"
            className="bg-slate-600/20 border-slate-400/50 text-slate-300 hover:bg-slate-600/30"
          >
            <Settings className="w-4 h-4 mr-2" />
            Admin Dashboard
          </Button>
        </Link>
      )}
    </div>
  );
};

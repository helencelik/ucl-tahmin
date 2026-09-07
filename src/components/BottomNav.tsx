import React from 'react';
import { useAuth } from '../context/AuthContext';
import { isUserAdmin } from '../services/api';
import { Home, Calendar, Trophy, Shield } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: 'home' | 'matches' | 'leaderboard' | 'admin') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <nav className="bottom-nav">
      <button
        className={`bottom-nav-item ${currentTab === 'home' ? 'active' : ''}`}
        onClick={() => onSelectTab('home')}
      >
        <Home size={20} />
        <span>Ana Ekran</span>
      </button>

      <button
        className={`bottom-nav-item ${currentTab === 'matches' ? 'active' : ''}`}
        onClick={() => onSelectTab('matches')}
      >
        <Calendar size={20} />
        <span>Tahminlerim</span>
      </button>

      <button
        className={`bottom-nav-item ${currentTab === 'leaderboard' ? 'active' : ''}`}
        onClick={() => onSelectTab('leaderboard')}
      >
        <Trophy size={20} />
        <span>Lider Tablosu</span>
      </button>

      {isUserAdmin(user) && (
        <button
          className={`bottom-nav-item admin-item ${currentTab === 'admin' ? 'active' : ''}`}
          onClick={() => onSelectTab('admin')}
        >
          <Shield size={20} />
          <span>Admin</span>
        </button>
      )}
    </nav>
  );
};

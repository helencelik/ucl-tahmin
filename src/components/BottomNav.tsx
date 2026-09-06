import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Trophy, Shield, User as UserIcon } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <nav className="bottom-nav">
      <button
        className={`bottom-nav-item ${currentTab === 'matches' ? 'active' : ''}`}
        onClick={() => onSelectTab('matches')}
      >
        <Calendar size={20} />
        <span>Tahminler</span>
      </button>

      <button
        className={`bottom-nav-item ${currentTab === 'leaderboard' ? 'active' : ''}`}
        onClick={() => onSelectTab('leaderboard')}
      >
        <Trophy size={20} />
        <span>Liderlik</span>
      </button>

      {user.role?.toLowerCase() === 'admin' ? (
        <button
          className={`bottom-nav-item admin-item ${currentTab === 'admin' ? 'active' : ''}`}
          onClick={() => onSelectTab('admin')}
        >
          <Shield size={20} />
          <span>Admin</span>
        </button>
      ) : (
        <button
          className={`bottom-nav-item ${currentTab === 'profile' ? 'active' : ''}`}
          onClick={() => onSelectTab('leaderboard')}
        >
          <UserIcon size={20} />
          <span>Profil</span>
        </button>
      )}
    </nav>
  );
};

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Trophy, Shield, User as UserIcon, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const { user, logout, isDemo } = useAuth();

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo & Brand */}
        <div className="navbar-brand" onClick={() => onSelectTab('matches')}>
          <div className="brand-logo-glow">
            <img src="/champions-league.svg" alt="UCL Logo" className="brand-logo" />
          </div>
          <div className="brand-info">
            <div className="brand-title">
              CHAMPIONS <span className="brand-highlight">LEAGUE</span>
            </div>
            <div className="brand-subtitle">Skor Tahmin Ligi</div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav">
          <button
            className={`nav-link ${currentTab === 'matches' ? 'active' : ''}`}
            onClick={() => onSelectTab('matches')}
          >
            Maçlar & Tahminler
          </button>
          <button
            className={`nav-link ${currentTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => onSelectTab('leaderboard')}
          >
            <Trophy size={16} className="nav-icon" />
            Liderlik Tablosu
          </button>
          {isAdmin && (
            <button
              className={`nav-link admin-link ${currentTab === 'admin' ? 'active' : ''}`}
              onClick={() => onSelectTab('admin')}
            >
              <Shield size={16} className="nav-icon text-accent" />
              Admin Paneli
            </button>
          )}
        </nav>

        {/* User Info & Actions */}
        {user && (
          <div className="navbar-user-actions">
            {/* Points Badge */}
            <div className="user-points-pill" title="Toplam Puanınız">
              <Sparkles size={14} className="points-sparkle" />
              <span className="points-number">{user.total_points}</span>
              <span className="points-label">PUAN</span>
            </div>

            {/* Profile Dropdown / Card */}
            <div className="user-profile-badge">
              <div className="user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={16} />}
              </div>
              <div className="user-text-info">
                <span className="user-name">{user.name}</span>
                <span className={`user-role-tag ${isAdmin ? 'admin' : 'user'}`}>
                  {isAdmin ? 'YÖNETİCİ' : 'KATILIMCI'}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              className="logout-btn"
              onClick={() => logout()}
              title="Güvenli Çıkış Yap"
              aria-label="Çıkış Yap"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Demo Warning Banner if Supabase not configured */}
      {isDemo && (
        <div className="demo-notice-bar">
          <span>
            ℹ️ <strong>Demo Modu Aktif:</strong> Supabase API anahtarları henüz girilmedi. Veriler yerel hafızada simüle edilmektedir.
          </span>
        </div>
      )}
    </header>
  );
};

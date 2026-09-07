import React from 'react';
import { useAuth } from '../context/AuthContext';
import { isUserAdmin } from '../services/api';
import { LogOut, Trophy, Shield, Sparkles, User, Home, Calendar } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: 'home' | 'matches' | 'leaderboard' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const { user, logout, isDemo } = useAuth();

  const isAdmin = isUserAdmin(user);

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo & Brand */}
        <div className="navbar-brand" onClick={() => onSelectTab('home')}>
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

        {/* Desktop Navigation Links (3 Ana Ekran) */}
        <nav className="desktop-nav">
          <button
            className={`nav-link ${currentTab === 'home' ? 'active' : ''}`}
            onClick={() => onSelectTab('home')}
          >
            <Home size={16} className="nav-icon" />
            Ana Ekran
          </button>
          <button
            className={`nav-link ${currentTab === 'matches' ? 'active' : ''}`}
            onClick={() => onSelectTab('matches')}
          >
            <Calendar size={16} className="nav-icon" />
            Tahminlerim
          </button>
          <button
            className={`nav-link ${currentTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => onSelectTab('leaderboard')}
          >
            <Trophy size={16} className="nav-icon" />
            Lider Tablosu
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
            {/* Giriş Yapan Kullanıcının İsmi (public.users tablosundaki name) */}
            <div className="navbar-user-badge" title="Giriş Yapan Katılımcı">
              <User size={15} className="user-badge-icon" />
              <span className="user-display-name-text">{user.name}</span>
              {isAdmin && <span className="user-admin-tag">Yönetici</span>}
            </div>

            {/* Points Badge */}
            <div className="user-points-pill" title="Toplam Puanınız">
              <Sparkles size={14} className="points-sparkle" />
              <span className="points-number">{user.total_points}</span>
              <span className="points-label">PUAN</span>
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

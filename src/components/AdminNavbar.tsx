import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, Sparkles } from 'lucide-react';

export const AdminNavbar: React.FC = () => {
  const { user, logout, isDemo } = useAuth();

  return (
    <header className="admin-navbar">
      <div className="admin-navbar-container">
        {/* Logo & Admin Brand */}
        <div className="admin-navbar-brand">
          <div className="brand-logo-glow admin">
            <img src="/champions-league.svg" alt="UCL Logo" className="brand-logo" />
          </div>
          <div className="admin-brand-info">
            <div className="admin-brand-title">
              CHAMPIONS <span className="brand-highlight">LEAGUE</span>
              <span className="admin-panel-tag">
                <Shield size={12} /> YÖNETİM
              </span>
            </div>
            <div className="admin-brand-sub">Yönetici Kontrol Merkezi</div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="admin-navbar-actions">
          {/* Admin user name badge */}
          {user && (
            <div className="admin-profile-badge">
              <div className="admin-avatar-icon">
                <Shield size={14} />
              </div>
              <span className="admin-name">{user.name}</span>
              <span className="admin-pill-tag">Admin</span>
            </div>
          )}

          {/* Logout */}
          <button
            type="button"
            className="admin-logout-btn"
            onClick={() => logout()}
            title="Yönetici Oturumunu Kapat"
            aria-label="Çıkış Yap"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {isDemo && (
        <div className="admin-demo-banner">
          <Sparkles size={14} />
          <span>Demo Modu Aktif: Girdiğiniz maç skorları yerel simülasyon ile anında puanlanacaktır.</span>
        </div>
      )}
    </header>
  );
};

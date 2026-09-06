import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  onNavigateLogin: () => void;
  onNavigateHome: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  onNavigateLogin,
  onNavigateHome
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-starball">
          <img src="/champions-league.svg" alt="Loading UCL" className="spinning-ball" />
        </div>
        <p className="loading-text">Şampiyonlar Ligi Yükleniyor...</p>
      </div>
    );
  }

  if (!user) {
    onNavigateLogin();
    return null;
  }

  const isAdmin = user.role?.toLowerCase() === 'admin';
  if (requireAdmin && !isAdmin) {
    return (
      <div className="unauthorized-screen">
        <div className="unauthorized-card">
          <ShieldAlert size={48} className="text-danger" />
          <h2>Yetkisiz Erişim</h2>
          <p>Bu sayfaya yalnızca Lig Yöneticisi (Admin) yetkisine sahip kullanıcılar erişebilir.</p>
          <button className="btn-primary" onClick={onNavigateHome}>
            Tahminler Sayfasına Dön
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

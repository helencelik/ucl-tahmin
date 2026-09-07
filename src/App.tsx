import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AdminNavbar } from './components/AdminNavbar';
import { BottomNav } from './components/BottomNav';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { PredictionsPage } from './pages/PredictionsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { AdminPage } from './pages/AdminPage';
import { isUserAdmin } from './services/api';

// Import CSS
import './styles/index.css';
import './styles/auth.css';
import './styles/home.css';
import './styles/matches.css';
import './styles/leaderboard.css';
import './styles/admin.css';

export type ActiveTab = 'home' | 'matches' | 'leaderboard' | 'admin';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<ActiveTab>('home');

  // Rol kontrolü: Admin kontrolü merkezi yardımcı fonksiyon ile sağlanır
  const isAdmin = isUserAdmin(user);

  // Tarayıcı URL yönlendirmesini senkronize etme (Vercel & SPA uyumlu)
  useEffect(() => {
    const syncFromPath = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/lider-tablosu' || path === '/liderlik') {
        setCurrentTab('leaderboard');
      } else if (path === '/tahminlerim' || path === '/tahminler') {
        setCurrentTab('matches');
      } else {
        setCurrentTab('home');
      }
    };

    syncFromPath();
    window.addEventListener('popstate', syncFromPath);
    return () => window.removeEventListener('popstate', syncFromPath);
  }, []);

  const handleSelectTab = (tab: ActiveTab) => {
    setCurrentTab(tab);

    let targetPath = '/';
    if (tab === 'admin') targetPath = '/admin';
    else if (tab === 'leaderboard') targetPath = '/lider-tablosu';
    else if (tab === 'matches') targetPath = '/tahminlerim';
    else targetPath = '/';

    window.history.pushState(null, '', targetPath);
  };

  const handleLoginSuccess = () => {
    handleSelectTab('home');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-starball">
          <img src="/champions-league.svg" alt="Loading" className="spinning-ball" />
        </div>
        <p className="loading-text">Şampiyonlar Ligi Yükleniyor...</p>
      </div>
    );
  }

  // Kullanıcı giriş yapmamışsa sadece /login ekranı gösterilir
  if (!user) {
    return <LoginPage onSuccessLogin={handleLoginSuccess} />;
  }

  // EĞER KULLANICI ADMİN İSE:
  // Tamamen yöneticiye özel tasarlanmış Ayrı Admin Paneli açılır (Normal kullanıcı ekranına geçiş yoktur)
  if (isAdmin) {
    return (
      <div className="app-layout admin-mode-layout">
        {/* Özel Admin Üst Menüsü */}
        <AdminNavbar />

        {/* Özel Admin İçeriği (Hafta hafta maç listesi, skor girişleri, otomatik puanlama) */}
        <main className="main-content admin-main-content">
          <AdminPage />
        </main>
      </div>
    );
  }

  // NORMAL KATILIMCILAR İÇİN 3 ANA EKRAN
  return (
    <div className="app-layout">
      {/* Üst Menü (3 Ana Ekran: Ana Ekran, Tahminlerim, Lider Tablosu) */}
      <Navbar currentTab={currentTab} onSelectTab={handleSelectTab} />

      {/* Sayfa İçeriği */}
      <main className="main-content">
        {currentTab === 'home' && <HomePage onNavigate={handleSelectTab} />}

        {currentTab === 'matches' && <PredictionsPage />}

        {currentTab === 'leaderboard' && <LeaderboardPage />}
      </main>

      {/* Mobil Alt Menü */}
      <BottomNav currentTab={currentTab} onSelectTab={handleSelectTab} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;


import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { PredictionsPage } from './pages/PredictionsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { AdminPage } from './pages/AdminPage';

// Import CSS
import './styles/index.css';
import './styles/auth.css';
import './styles/matches.css';
import './styles/leaderboard.css';
import './styles/admin.css';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<'matches' | 'leaderboard' | 'admin'>('matches');

  // Tarayıcı URL yönlendirmesini senkronize etme (Vercel & SPA uyumlu)
  useEffect(() => {
    const syncFromPath = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/admin') {
        setCurrentTab('admin');
      } else if (path === '/liderlik') {
        setCurrentTab('leaderboard');
      } else if (path === '/tahminler' || path === '/') {
        setCurrentTab('matches');
      } else {
        setCurrentTab('matches');
      }
    };

    syncFromPath();
    window.addEventListener('popstate', syncFromPath);
    return () => window.removeEventListener('popstate', syncFromPath);
  }, []);

  const handleSelectTab = (tab: string) => {
    const validTab = tab as 'matches' | 'leaderboard' | 'admin';
    setCurrentTab(validTab);

    // URL güncelleme (/tahminler, /liderlik, /admin)
    let targetPath = '/tahminler';
    if (validTab === 'admin') targetPath = '/admin';
    else if (validTab === 'leaderboard') targetPath = '/liderlik';
    else targetPath = '/tahminler';

    window.history.pushState(null, '', targetPath);
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
    return <LoginPage onSuccessLogin={() => handleSelectTab('matches')} />;
  }

  return (
    <div className="app-layout">
      {/* Üst Menü */}
      <Navbar currentTab={currentTab} onSelectTab={handleSelectTab} />

      {/* Sayfa İçeriği */}
      <main className="main-content">
        {currentTab === 'matches' && <PredictionsPage />}

        {currentTab === 'leaderboard' && <LeaderboardPage />}

        {currentTab === 'admin' && (
          <ProtectedRoute
            requireAdmin={true}
            onNavigateLogin={() => {}}
            onNavigateHome={() => handleSelectTab('matches')}
          >
            <AdminPage />
          </ProtectedRoute>
        )}
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

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMatches, getUserPredictions, saveUserPrediction } from '../services/api';
import { Match, Prediction } from '../types';
import { MatchCard } from '../components/MatchCard';
import {
  Calendar,
  Target,
  CheckCircle2,
  Sparkles,
  Trophy,
  User,
  RefreshCw,
  Layers
} from 'lucide-react';

interface HomePageProps {
  onNavigate?: (tab: 'home' | 'matches' | 'leaderboard' | 'admin') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate: _onNavigate }) => {
  const { user, refreshProfile } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [matchesData, predsData] = await Promise.all([
        getMatches(),
        user ? getUserPredictions(user.id) : Promise.resolve({})
      ]);

      setMatches(matchesData);
      setPredictions(predsData);
    } catch (err) {
      console.error('Ana ekran verileri yüklenirken hata:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSavePrediction = async (matchId: string, homeScore: number, awayScore: number) => {
    if (!user) return;
    const saved = await saveUserPrediction(user.id, matchId, homeScore, awayScore);
    setPredictions((prev) => ({
      ...prev,
      [matchId]: saved
    }));
    await refreshProfile();
  };

  // 1. Toplam maç sayısı
  const totalMatches = matches.length;

  // 2. Yapılan tahmin sayısı
  const userPredictionsCount = Object.keys(predictions).length;

  // 3. Doğru tahmin sayısı (points_earned > 0 olan tahminler)
  const userPredList = Object.values(predictions);
  const correctPredictionsCount = userPredList.filter(
    (p) => (p.points_earned || 0) > 0
  ).length;

  // 4. Toplam puan
  const totalPoints = user?.total_points ?? 0;

  // Hafta listesi (Lig Aşaması 8 Hafta)
  const matchweeksList = [1, 2, 3, 4, 5, 6, 7, 8];

  // Seçili haftaya göre filtrelenmiş maçlar
  const filteredMatches = matches.filter((m) => {
    if (selectedWeek !== 'all') {
      return (m.matchweek || 1) === selectedWeek;
    }
    return true;
  });

  // Tüm Haftalar seçildiğinde hafta hafta gruplama
  const groupedByWeek: Record<number, Match[]> = {};
  matchweeksList.forEach((w) => {
    groupedByWeek[w] = [];
  });
  filteredMatches.forEach((m) => {
    const w = m.matchweek || 1;
    if (!groupedByWeek[w]) groupedByWeek[w] = [];
    groupedByWeek[w].push(m);
  });

  return (
    <div className="home-page">
      {/* 1. SADE VE KOMPAKT BAŞLIK ALANI */}
      <section className="home-hero-card">
        <div className="home-hero-bg-glow" />
        <div className="home-hero-content">
          <div className="home-hero-top-row">
            <div className="home-league-tag">
              <Sparkles size={13} />
              <span>UEFA CHAMPIONS LEAGUE 2026</span>
            </div>

            {user && (
              <div className="home-user-tag" title="Giriş Yapan Katılımcı">
                <User size={14} className="home-user-tag-icon" />
                <span>
                  Katılımcı: <strong>{user.name}</strong>
                </span>
              </div>
            )}
          </div>

          <h1 className="home-hero-title">Şampiyonlar Ligi 2026 Tahmin Ligi</h1>
        </div>
      </section>

      {/* 2. DÜZGÜN ESNEK 4 ADET İSTATİSTİK KARTI (TELEFON GENİŞLİĞİNE TAM OTURAN YAPI) */}
      <section className="home-stats-section">
        <div className="stats-grid">
          {/* 1) Toplam Maç */}
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Toplam Maç</span>
              <div className="stat-icon-wrapper blue">
                <Calendar size={17} />
              </div>
            </div>
            <div className="stat-number">
              {loading ? '-' : totalMatches}
            </div>
            <span className="stat-sub">Fikstürdeki maçlar</span>
          </div>

          {/* 2) Yapılan Tahmin */}
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Yapılan Tahmin</span>
              <div className="stat-icon-wrapper cyan">
                <Target size={17} />
              </div>
            </div>
            <div className="stat-number cyan">
              {loading ? '-' : userPredictionsCount}
            </div>
            <span className="stat-sub">
              {totalMatches > 0
                ? `${Math.round((userPredictionsCount / totalMatches) * 100)}% tamamlandı`
                : 'Kayıtlı tahminler'}
            </span>
          </div>

          {/* 3) Doğru Tahmin */}
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Doğru Tahmin</span>
              <div className="stat-icon-wrapper green">
                <CheckCircle2 size={17} />
              </div>
            </div>
            <div className="stat-number green">
              {loading ? '-' : correctPredictionsCount}
            </div>
            <span className="stat-sub">Puan getiren tahminler</span>
          </div>

          {/* 4) Toplam Puan */}
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Toplam Puan</span>
              <div className="stat-icon-wrapper gold">
                <Sparkles size={17} />
              </div>
            </div>
            <div className="stat-number gold">
              {loading ? '-' : totalPoints}
            </div>
            <span className="stat-sub">Kazanılan toplam puan</span>
          </div>
        </div>
      </section>

      {/* 3. HAFTA SEÇİCİSİ (1 - 8 HAFTA & TÜMÜ) VE YENİLEME BUTONU */}
      <div className="matchweeks-bar-wrapper">
        <div className="matchweeks-scroll">
          {matchweeksList.map((weekNum) => (
            <button
              key={weekNum}
              type="button"
              className={`week-pill-btn ${selectedWeek === weekNum ? 'active' : ''}`}
              onClick={() => setSelectedWeek(weekNum)}
            >
              <span>{weekNum}. Hafta</span>
            </button>
          ))}
          <button
            type="button"
            className={`week-pill-btn ${selectedWeek === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedWeek('all')}
          >
            <Layers size={13} />
            <span>Tüm Haftalar</span>
          </button>
        </div>

        <button
          type="button"
          className={`btn-refresh-data ${refreshing ? 'spinning' : ''}`}
          onClick={() => loadData(true)}
          title="Verileri Yenile"
          aria-label="Verileri Yenile"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* 4. SADE MAÇ LİSTESİ VE SKOR GİRİŞLERİ */}
      <section className="home-matches-section">
        {loading ? (
          <div className="matches-skeleton-list">
            <div className="match-card-skeleton" />
            <div className="match-card-skeleton" />
            <div className="match-card-skeleton" />
          </div>
        ) : selectedWeek === 'all' ? (
          <div className="matchweeks-grouped-list">
            {matchweeksList.map((weekNum) => {
              const weekMatches = groupedByWeek[weekNum];
              if (!weekMatches || weekMatches.length === 0) return null;

              return (
                <div key={weekNum} className="matchweek-group-block">
                  <div className="matchweek-group-header">
                    <div className="matchweek-header-left">
                      <Trophy size={16} className="matchweek-header-icon" />
                      <h3 className="matchweek-header-title">{weekNum}. Hafta Maçları</h3>
                    </div>
                    <span className="matchweek-header-pill">{weekMatches.length} Maç</span>
                  </div>

                  <div className="matches-grid">
                    {weekMatches.map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        userPrediction={predictions[match.id]}
                        onSavePrediction={handleSavePrediction}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="empty-matches-state">
            <p>Bu haftaya ait maç bulunamadı.</p>
          </div>
        ) : (
          <div className="matches-grid">
            {filteredMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                userPrediction={predictions[match.id]}
                onSavePrediction={handleSavePrediction}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

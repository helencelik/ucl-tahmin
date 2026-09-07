import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Match, Prediction } from '../types';
import { getMatches, getUserPredictions, saveUserPrediction } from '../services/api';
import { MatchCard } from '../components/MatchCard';
import {
  RefreshCw,
  Target,
  Trophy,
  Layers,
  Calendar,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const PredictionsPage: React.FC = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});

  // Hafta filtresi: 1. Hafta varsayılan olarak açılır
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (isSilent = false) => {
    // Sadece ilk yüklemede ve maçlar henüz yoksa tam sayfa yükleniyor durumuna al
    if (!isSilent && matches.length === 0) setLoading(true);
    else setRefreshing(true);

    try {
      const [matchesData, predsData] = await Promise.all([
        getMatches(),
        user?.id ? getUserPredictions(user.id) : Promise.resolve({})
      ]);

      setMatches(matchesData);
      setPredictions(predsData);
    } catch (err) {
      console.error('Veriler yüklenirken hata:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleSavePrediction = useCallback(async (matchId: string, homeScore: number, awayScore: number) => {
    if (!user?.id) return;
    const saved = await saveUserPrediction(user.id, matchId, homeScore, awayScore);
    if (saved) {
      setPredictions((prev) => {
        const current = prev[matchId];
        if (
          current &&
          current.predicted_home_score === saved.predicted_home_score &&
          current.predicted_away_score === saved.predicted_away_score
        ) {
          return prev;
        }
        return {
          ...prev,
          [matchId]: saved
        };
      });
    }
  }, [user?.id]);

  // Seçili haftaya göre filtrelenmiş maçlar
  const filteredMatches = matches.filter((m) => {
    if (selectedWeek !== 'all') {
      return (m.matchweek || 1) === selectedWeek;
    }
    return true;
  });

  // Hafta listesi (Lig Aşaması 8 Hafta)
  const matchweeksList = [1, 2, 3, 4, 5, 6, 7, 8];

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

  // Toplam yapılan tahmin sayısı
  const totalPredictionsCount = Object.keys(predictions).length;

  // Doğru tahmin sayısı (points_earned > 0)
  const userPredList = Object.values(predictions);
  const correctPredictionsCount = userPredList.filter(
    (p) => (p.points_earned || 0) > 0
  ).length;

  return (
    <div className="predictions-page">
      {/* 1. SADE VE ŞIK BAŞLIK ALANI */}
      <div className="predictions-page-header">
        <div className="predictions-header-title-wrap">
          <div className="predictions-header-badge">
            <Target size={14} />
            <span>UEFA CHAMPIONS LEAGUE 2026</span>
          </div>
          <h1 className="predictions-page-title">Tahminlerim</h1>
          <p className="predictions-page-subtitle">
            {totalPredictionsCount > 0 ? (
              <span>Toplam <strong>{totalPredictionsCount}</strong> kayıtlı tahmininiz var.</span>
            ) : (
              <span>Skor tahminlerinizi girin, otomatik kaydedilir.</span>
            )}
          </p>
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

      {/* 2. 4 TEMEL İSTATİSTİK KARTI */}
      <section className="home-stats-section" style={{ marginBottom: 4 }}>
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
              {loading ? '-' : matches.length}
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
              {loading ? '-' : totalPredictionsCount}
            </div>
            <span className="stat-sub">
              {matches.length > 0
                ? `${Math.round((totalPredictionsCount / matches.length) * 100)}% tamamlandı`
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
              {loading ? '-' : (user?.total_points ?? 0)}
            </div>
            <span className="stat-sub">Kazanılan toplam puan</span>
          </div>
        </div>
      </section>

      {/* 2. HAFTA SEÇİCİSİ (1 - 8 HAFTA & TÜMÜ) */}
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
      </div>

      {/* 3. MAÇLAR LİSTESİ */}
      {loading ? (
        <div className="matches-skeleton-list">
          <div className="match-card-skeleton" />
          <div className="match-card-skeleton" />
          <div className="match-card-skeleton" />
        </div>
      ) : selectedWeek === 'all' ? (
        /* Tüm Haftalar Modu: Hafta hafta bloklar halinde */
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
      ) : (
        /* Tek Hafta Seçili: Doğrudan o haftanın maçları */
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
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Match, Prediction } from '../types';
import { getMatches, getUserPredictions, saveUserPrediction } from '../services/api';
import { MatchCard } from '../components/MatchCard';
import {
  RefreshCw,
  Target,
  Trophy,
  Layers
} from 'lucide-react';

export const PredictionsPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});

  // Hafta filtresi: 1. Hafta varsayılan olarak açılır
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
      console.error('Veriler yüklenirken hata:', err);
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
            Skor tahminlerinizi girin; her iki taraf yazıldığında arka planda otomatik olarak kaydedilir.
            {totalPredictionsCount > 0 && (
              <span className="total-preds-highlight"> (Toplam {totalPredictionsCount} kayıtlı tahmininiz var)</span>
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

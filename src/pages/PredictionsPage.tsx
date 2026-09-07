import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Match, Prediction, TournamentStage } from '../types';
import { getMatches, getUserPredictions, saveUserPrediction } from '../services/api';
import { MatchCard } from '../components/MatchCard';
import {
  CheckCircle2,
  RefreshCw,
  Target,
  Trophy,
  Shield,
  Layers,
  Plus
} from 'lucide-react';

interface StageConfig {
  id: TournamentStage;
  name: string;
}

const TOURNAMENT_STAGES: StageConfig[] = [
  { id: 'league', name: 'Lig Aşaması' },
  { id: 'round_of_32', name: 'Son 32' },
  { id: 'round_of_16', name: 'Son 16' },
  { id: 'quarter_finals', name: 'Çeyrek Final' },
  { id: 'semi_finals', name: 'Yarı Final' },
  { id: 'final', name: 'Final' }
];

export const PredictionsPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});

  // Görünüm modu: 'predictions' (Sadece kullanıcının tahminleri) | 'fixture' (Fikstürden yeni tahmin ekle)
  const [viewMode, setViewMode] = useState<'predictions' | 'fixture'>('predictions');

  // Fikstür modunda turnuva aşaması ve hafta seçimi
  const [activeStage, setActiveStage] = useState<TournamentStage>('league');
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>('all');

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

  // 1. SADECE KULLANICININ DAHA ÖNCE YAPTIĞI TAHMİNLER
  const userPredictedMatches = matches
    .filter((m) => Boolean(predictions[m.id]))
    .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime());

  // Kazanılan toplam puan ve tamamlanan maç sayısı
  const totalEarnedPoints = userPredictedMatches.reduce((acc, m) => {
    const p = predictions[m.id];
    return acc + (p?.points_earned || 0);
  }, 0);

  const completedPredictionsCount = userPredictedMatches.filter(
    (m) => m.status === 'finished' || new Date(m.match_date).getTime() <= Date.now()
  ).length;

  // 2. FİKSTÜR MODU İÇİN MAÇ LİSTESİ VE HAFTALIK GRUPLAMA
  const stageMatches = matches.filter((m) => {
    const stage = m.stage || 'league';
    return stage === activeStage;
  });

  const fixtureFilteredMatches = stageMatches.filter((m) => {
    if (activeStage === 'league' && selectedWeek !== 'all') {
      return m.matchweek === selectedWeek;
    }
    return true;
  });

  const matchweeksList = [1, 2, 3, 4, 5, 6, 7, 8];
  const groupedByWeek: Record<number, Match[]> = {};
  matchweeksList.forEach((w) => {
    groupedByWeek[w] = [];
  });
  fixtureFilteredMatches.forEach((m) => {
    const w = m.matchweek || 1;
    if (!groupedByWeek[w]) groupedByWeek[w] = [];
    groupedByWeek[w].push(m);
  });

  return (
    <div className="predictions-page">
      {/* 1. SADE VE ŞIK BAŞLIK ALANI */}
      <div className="predictions-page-header">
        <div className="predictions-header-title-wrap">
          <div className="predictions-header-badge">
            <Target size={14} />
            <span>Kullanıcı Tahmin Paneli</span>
          </div>
          <h1 className="predictions-page-title">
            {viewMode === 'predictions' ? 'Tahminlerim' : 'Fikstür & Yeni Tahmin'}
          </h1>
          <p className="predictions-page-subtitle">
            {viewMode === 'predictions'
              ? 'Daha önce yaptığınız maç tahminleri, maç bilgileri ve kazandığınız puanlar.'
              : '8 haftalık lig maçlarını inceleyin ve skor tahminlerinizi kaydedin.'}
          </p>
        </div>

        <div className="predictions-header-controls">
          {/* Görünüm Geçiş Butonları: Tahminlerim & Fikstür */}
          <div className="view-mode-tabs">
            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'predictions' ? 'active' : ''}`}
              onClick={() => setViewMode('predictions')}
            >
              <CheckCircle2 size={15} />
              <span>Tahminlerim ({userPredictedMatches.length})</span>
            </button>

            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'fixture' ? 'active' : ''}`}
              onClick={() => setViewMode('fixture')}
            >
              <Plus size={15} />
              <span>Yeni Tahmin Ekle</span>
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
      </div>

      {/* 2. TAHMİNLERİM GÖRÜNÜMÜ: SADECE KULLANICININ YAPTIĞI TAHMİNLER */}
      {viewMode === 'predictions' ? (
        loading ? (
          <div className="matches-skeleton-list">
            <div className="match-card-skeleton" />
            <div className="match-card-skeleton" />
          </div>
        ) : userPredictedMatches.length === 0 ? (
          /* Henüz tahmin yapılmamışsa şık ve sade boş durum */
          <div className="empty-predictions-state">
            <div className="empty-state-icon-box">
              <Target size={44} className="text-cyan" />
            </div>
            <h3 className="empty-state-title">Henüz Kayıtlı Bir Tahmininiz Yok</h3>
            <p className="empty-state-desc">
              UEFA Şampiyonlar Ligi fikstüründen dilediğiniz maçları seçip skor tahmininizi girerek puan yarışına hemen katılın!
            </p>
            <button
              type="button"
              className="btn-go-to-fixture"
              onClick={() => setViewMode('fixture')}
            >
              <Plus size={16} />
              <span>Fikstüre Git ve Tahmin Yap</span>
            </button>
          </div>
        ) : (
          /* Kullanıcının daha önce yaptığı tahminlerin sade listesi */
          <div className="my-predictions-container">
            <div className="predictions-meta-strip">
              <div className="strip-item">
                <span className="strip-label">Kayıtlı Tahmin</span>
                <span className="strip-value highlight">{userPredictedMatches.length} Maç</span>
              </div>
              <div className="strip-divider" />
              <div className="strip-item">
                <span className="strip-label">Tamamlanan</span>
                <span className="strip-value">{completedPredictionsCount} Maç</span>
              </div>
              <div className="strip-divider" />
              <div className="strip-item">
                <span className="strip-label">Kazanılan Puan</span>
                <span className="strip-value gold">+{totalEarnedPoints} Puan</span>
              </div>
            </div>

            <div className="matches-grid">
              {userPredictedMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  userPrediction={predictions[match.id]}
                  onSavePrediction={handleSavePrediction}
                />
              ))}
            </div>
          </div>
        )
      ) : (
        /* 3. FİKSTÜR & YENİ TAHMİN MODU */
        <div className="fixture-mode-wrapper">
          {/* Turnuva Turları Navigasyonu */}
          <div className="tournament-stages-wrapper">
            <div className="tournament-stages-scroll">
              {TOURNAMENT_STAGES.map((stage) => {
                const isSelected = activeStage === stage.id;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    className={`stage-tab-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => setActiveStage(stage.id)}
                  >
                    {stage.id === 'final' ? <Trophy size={15} /> : <Shield size={14} />}
                    <span>{stage.name}</span>
                    {stage.id === 'league' && <span className="stage-badge-dot" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lig Aşaması Hafta Seçici */}
          {activeStage === 'league' && (
            <div className="matchweeks-bar-wrapper">
              <div className="matchweeks-scroll">
                <button
                  type="button"
                  className={`week-pill-btn ${selectedWeek === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedWeek('all')}
                >
                  <Layers size={13} />
                  <span>Tüm Haftalar</span>
                </button>
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
              </div>
            </div>
          )}

          {/* Maç Listesi */}
          {activeStage !== 'league' ? (
            <div className="stage-placeholder-card">
              <div className="stage-placeholder-icon">
                {activeStage === 'final' ? <Trophy size={44} className="text-gold" /> : <Shield size={44} className="text-cyan" />}
              </div>
              <h3 className="stage-placeholder-title">
                {TOURNAMENT_STAGES.find((s) => s.id === activeStage)?.name} Eşleşmeleri
              </h3>
              <p className="stage-placeholder-desc">
                Bu turun maçları ve eşleşmeleri, 8 haftalık Lig Aşaması tamamlandıktan sonra UEFA kura çekimi ile belirlenecektir.
              </p>
              <button
                type="button"
                className="btn-back-to-league"
                onClick={() => {
                  setActiveStage('league');
                  setSelectedWeek('all');
                }}
              >
                Lig Aşaması Maçlarına Dön
              </button>
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
          ) : (
            <div className="matches-grid">
              {fixtureFilteredMatches.map((match) => (
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
      )}
    </div>
  );
};

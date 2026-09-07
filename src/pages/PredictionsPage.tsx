import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Match, Prediction, TournamentStage } from '../types';
import { getMatches, getUserPredictions, saveUserPrediction } from '../services/api';
import { MatchCard } from '../components/MatchCard';
import {
  Calendar,
  CheckCircle,
  RefreshCw,
  Flame,
  Award,
  Target,
  Sparkles,
  AlertCircle,
  Trophy,
  Shield,
  Layers
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
  
  // Turnuva Aşaması (Varsayılan: Lig Aşaması)
  const [activeStage, setActiveStage] = useState<TournamentStage>('league');
  // Lig Aşaması Hafta Filtresi (1 - 8 veya 'all')
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>('all');
  
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'finished'>('all');
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

  // Zaman filtresi için şimdiki an
  const now = Date.now();

  // 1. Aşamaya göre filtreleme
  const stageMatches = matches.filter((m) => {
    const stage = m.stage || 'league';
    return stage === activeStage;
  });

  // 2. Hafta ve Duruma (upcoming / finished / all) göre filtreleme
  const filteredMatches = stageMatches.filter((m) => {
    const isFinished = m.status === 'finished';
    const isPast = new Date(m.match_date).getTime() <= now;

    // Hafta kontrolü (Lig aşamasında)
    if (activeStage === 'league' && selectedWeek !== 'all') {
      if (m.matchweek !== selectedWeek) return false;
    }

    // Durum kontrolü
    if (statusFilter === 'upcoming') {
      return !isFinished && !isPast;
    }
    if (statusFilter === 'finished') {
      return isFinished || isPast;
    }
    return true;
  });

  // Lig aşamasında hafta hafta gruplandırılmış maçlar (Tüm Haftalar modu için)
  const matchweeksList = [1, 2, 3, 4, 5, 6, 7, 8];
  const groupedByWeek: Record<number, Match[]> = {};
  matchweeksList.forEach((w) => {
    groupedByWeek[w] = [];
  });

  filteredMatches.forEach((m) => {
    const w = m.matchweek || 1;
    if (!groupedByWeek[w]) groupedByWeek[w] = [];
    groupedByWeek[w].push(m);
  });

  // Kullanıcının yaptığı toplam tahmin sayısı
  const totalPredictedCount = Object.keys(predictions).length;

  return (
    <div className="predictions-page">
      {/* Top Banner & Rules */}
      <div className="rules-hero-card">
        <div className="rules-hero-content">
          <div className="rules-badge">
            <Flame size={16} className="text-warning" />
            <span>Puanlama Sistemi & Kurallar</span>
          </div>
          <h2 className="rules-hero-title">Skorunu Tahmin Et, Puanları Topla!</h2>
          
          <div className="rules-chips-row">
            <div className="rule-chip gold" title="Tam Skor Bildimi">
              <Award size={14} />
              <span className="chip-score">+4 PUAN</span>
              <span className="chip-desc">Tam Skor</span>
            </div>
            <div className="rule-chip purple" title="Skor / Gol Farkı Bildimi">
              <Target size={14} />
              <span className="chip-score">+3 PUAN</span>
              <span className="chip-desc">Gol Farkı</span>
            </div>
            <div className="rule-chip blue" title="Maçın Kazananı / Beraberlik">
              <Sparkles size={14} />
              <span className="chip-score">+2 PUAN</span>
              <span className="chip-desc">Doğru Sonuç</span>
            </div>
            <div className="rule-chip zero" title="Yanlış Tahmin veya Yapılmamışsa">
              <span className="chip-score">0 PUAN</span>
              <span className="chip-desc">Yanlış / Boş</span>
            </div>
          </div>

          <div className="rules-timing-alert">
            <AlertCircle size={15} className="rules-timing-icon" />
            <span className="rules-timing-text">
              "Tahminlerinizi maç başlamadan yapın; maç başladıktan sonra tahmin girişi veya değişikliği yapılamaz."
            </span>
          </div>
        </div>
      </div>

      {/* 1. TURNUVA TURLARI NAVİGASYONU (MOBİL UYUMLU YATAY MENÜ) */}
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

      {/* 2. LİG AŞAMASI HAFTA SEÇİCİSİ (8 HAFTA) */}
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

      {/* 3. DURUM FİLTRELERİ VE YENİLE BUTONU */}
      {activeStage === 'league' && (
        <div className="page-toolbar">
          <div className="filter-pill-group">
            <button
              className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              <span>Tüm Maçlar ({stageMatches.length})</span>
            </button>

            <button
              className={`filter-pill ${statusFilter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setStatusFilter('upcoming')}
            >
              <Calendar size={14} />
              <span>Yaklaşanlar</span>
              <span className="count-pill">
                {stageMatches.filter((m) => m.status !== 'finished' && new Date(m.match_date).getTime() > now).length}
              </span>
            </button>

            <button
              className={`filter-pill ${statusFilter === 'finished' ? 'active' : ''}`}
              onClick={() => setStatusFilter('finished')}
            >
              <CheckCircle size={14} />
              <span>Tamamlananlar</span>
              <span className="count-pill">
                {stageMatches.filter((m) => m.status === 'finished' || new Date(m.match_date).getTime() <= now).length}
              </span>
            </button>
          </div>

          <button
            className={`btn-refresh-data ${refreshing ? 'spinning' : ''}`}
            onClick={() => loadData(true)}
            title="Verileri Yenile"
            aria-label="Verileri Yenile"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      )}

      {/* 4. TURNUVA AŞAMASI İÇERİĞİ */}
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
      ) : loading ? (
        <div className="matches-skeleton-list">
          <div className="match-card-skeleton"></div>
          <div className="match-card-skeleton"></div>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="empty-matches-state">
          <Calendar size={48} className="empty-icon" />
          <h3>Bu filtrede maç bulunamadı</h3>
          <p>
            {statusFilter === 'upcoming'
              ? 'Şu anda bu haftada yaklaşan maç bulunmuyor.'
              : statusFilter === 'finished'
              ? 'Bu haftada henüz tamamlanmış maç kaydı bulunmuyor.'
              : 'Seçili haftada maç bulunmamaktadır.'}
          </p>
        </div>
      ) : selectedWeek === 'all' ? (
        /* Tüm Haftalar Modu: Hafta Hafta Gruplandırılmış Liste */
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
        /* Tek Hafta Seçili Modu */
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

      {/* Mini Bottom Summary */}
      {!loading && activeStage === 'league' && (
        <div className="predictions-meta-footer">
          <span>Toplam yapılan tahmin: <strong>{totalPredictedCount}</strong> maç</span>
        </div>
      )}
    </div>
  );
};

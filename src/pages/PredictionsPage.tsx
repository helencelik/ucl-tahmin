import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Match, Prediction } from '../types';
import { getMatches, getUserPredictions, saveUserPrediction } from '../services/api';
import { MatchCard } from '../components/MatchCard';
import { Calendar, CheckCircle, RefreshCw, Info, Flame } from 'lucide-react';

export const PredictionsPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [filter, setFilter] = useState<'upcoming' | 'finished' | 'all'>('upcoming');
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

  // Filtreleme
  const now = Date.now();
  const filteredMatches = matches.filter((m) => {
    const isFinished = m.status === 'finished';
    const isPast = new Date(m.match_date).getTime() <= now;

    if (filter === 'upcoming') {
      return !isFinished && !isPast;
    }
    if (filter === 'finished') {
      return isFinished || isPast;
    }
    return true;
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
            <span>Puanlama Sistemi</span>
          </div>
          <h2 className="rules-hero-title">Skorunu Tahmin Et, Puanları Topla!</h2>
          <div className="rules-chips-row">
            <div className="rule-chip gold">
              <span className="chip-score">3 PUAN</span>
              <span className="chip-desc">Tam Skor Tahmini</span>
            </div>
            <div className="rule-chip blue">
              <span className="chip-score">1 PUAN</span>
              <span className="chip-desc">Kazananı / Beraberliği Bilme</span>
            </div>
            <div className="rule-chip lock">
              <Info size={13} />
              <span>Maç başlangıç düdüğüne kadar tahmin değiştirilebilir</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Refresh */}
      <div className="page-toolbar">
        <div className="filter-pill-group">
          <button
            className={`filter-pill ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            <Calendar size={15} />
            <span>Gelecek Maçlar</span>
            <span className="count-pill">
              {matches.filter((m) => m.status !== 'finished' && new Date(m.match_date).getTime() > now).length}
            </span>
          </button>

          <button
            className={`filter-pill ${filter === 'finished' ? 'active' : ''}`}
            onClick={() => setFilter('finished')}
          >
            <CheckCircle size={15} />
            <span>Tamamlananlar</span>
            <span className="count-pill">
              {matches.filter((m) => m.status === 'finished' || new Date(m.match_date).getTime() <= now).length}
            </span>
          </button>

          <button
            className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <span>Tümü ({matches.length})</span>
          </button>
        </div>

        <button
          className={`btn-refresh-data ${refreshing ? 'spinning' : ''}`}
          onClick={() => loadData(true)}
          title="Verileri Yenile"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Matches List */}
      {loading ? (
        <div className="matches-skeleton-list">
          <div className="match-card-skeleton"></div>
          <div className="match-card-skeleton"></div>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="empty-matches-state">
          <Calendar size={48} className="empty-icon" />
          <h3>Bu kategoride maç bulunamadı</h3>
          <p>
            {filter === 'upcoming'
              ? 'Şu anda yaklaşan maç bulunmuyor. Yönetici yeni maç eklediğinde burada listelenecektir.'
              : 'Henüz tamamlanmış maç kaydı bulunmamaktadır.'}
          </p>
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

      {/* Mini Bottom Summary */}
      {!loading && (
        <div className="predictions-meta-footer">
          <span>Toplam yapılan tahmin: <strong>{totalPredictedCount}</strong> maç</span>
        </div>
      )}
    </div>
  );
};

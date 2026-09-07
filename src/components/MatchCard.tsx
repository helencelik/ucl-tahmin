import React, { useState, useEffect } from 'react';
import { Match, Prediction } from '../types';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Award,
  Sparkles,
  Target,
  ChevronDown,
  ChevronUp,
  MapPin,
  RefreshCw,
  Save,
  Lock,
  Check
} from 'lucide-react';
import { getMatchPredictions } from '../services/api';

interface MatchCardProps {
  match: Match;
  userPrediction?: Prediction;
  onSavePrediction: (matchId: string, homeScore: number, awayScore: number) => Promise<void>;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  userPrediction,
  onSavePrediction
}) => {
  const [homeScore, setHomeScore] = useState<number>(userPrediction?.predicted_home_score ?? 0);
  const [awayScore, setAwayScore] = useState<number>(userPrediction?.predicted_away_score ?? 0);
  
  // Kayıt durumu: 'idle' | 'saving' | 'saved' | 'error'
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveFeedbackMsg, setSaveFeedbackMsg] = useState('');
  
  const [showAllPredictions, setShowAllPredictions] = useState(false);
  const [allPredictions, setAllPredictions] = useState<Prediction[]>([]);
  const [loadingPredictions, setLoadingPredictions] = useState(false);

  const matchDate = new Date(match.match_date);
  const isPast = matchDate.getTime() <= Date.now();
  const isFinished = match.status === 'finished';
  const isLocked = isPast || isFinished;

  // Dışarıdan gelen tahmin değiştiğinde senkronize et
  useEffect(() => {
    if (userPrediction) {
      setHomeScore(userPrediction.predicted_home_score);
      setAwayScore(userPrediction.predicted_away_score);
    }
  }, [userPrediction]);

  // Skorlarda değişiklik var mı kontrolü
  const hasExisting = userPrediction !== undefined && userPrediction !== null;
  const isScoreChanged = !hasExisting ||
    userPrediction.predicted_home_score !== homeScore ||
    userPrediction.predicted_away_score !== awayScore;

  // Manuel "Tahmini Kaydet" Butonu Tetikleyicisi
  const handleSavePredictionClick = async () => {
    if (isLocked) return;

    setSaveStatus('saving');
    setSaveFeedbackMsg('');

    try {
      await onSavePrediction(match.id, homeScore, awayScore);
      setSaveStatus('saved');
      setSaveFeedbackMsg('Tahmin başarıyla kaydedildi!');

      // 3 saniye sonra 'saved' durumunu normale çevir
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveFeedbackMsg('');
      }, 3000);
    } catch (err: any) {
      console.error('Tahmin kayıt hatası:', err);
      setSaveStatus('error');
      setSaveFeedbackMsg(err?.message || 'Tahmin kaydedilemedi. Lütfen tekrar deneyin.');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 4000);
    }
  };

  const handleToggleAllPredictions = async () => {
    if (!showAllPredictions && allPredictions.length === 0) {
      setLoadingPredictions(true);
      const preds = await getMatchPredictions(match.id);
      setAllPredictions(preds);
      setLoadingPredictions(false);
    }
    setShowAllPredictions(!showAllPredictions);
  };

  // Tarih biçimlendirme (Türkçe)
  const formattedDate = matchDate.toLocaleDateString('tr-TR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
  const formattedTime = matchDate.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`match-card ${isFinished ? 'finished' : isPast ? 'live-locked' : 'upcoming'}`}>
      {/* 1. Header Info (Aşama, Hafta ve Durum rozeti) */}
      <div className="match-card-header">
        <span className="match-stage-badge">
          {match.stage === 'league' ? 'Lig Aşaması' : 'UEFA Şampiyonlar Ligi'}
          {match.matchweek ? ` • ${match.matchweek}. Hafta` : ''}
        </span>

        <div className="card-header-right">
          {hasExisting && !isFinished && (
            <span className="saved-indicator-badge" title="Bu maça kayıtlı tahmininiz var">
              <Check size={12} /> Kayıtlı: {userPrediction?.predicted_home_score} - {userPrediction?.predicted_away_score}
            </span>
          )}
          <span className={`status-pill ${isFinished ? 'finished' : isPast ? 'live' : 'upcoming'}`}>
            {isFinished ? 'Bitti' : isPast ? 'Canlı / Kilitli' : 'Bekliyor'}
          </span>
        </div>
      </div>

      {/* 2. Teams and Center Scores Arena */}
      <div className="match-teams-grid">
        {/* Home Team */}
        <div className="team-column home">
          <div className="team-logo-wrap">
            {match.home_team_logo ? (
              <img
                src={match.home_team_logo}
                alt={match.home_team}
                className="team-logo"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="team-logo-fallback">{match.home_team.substring(0, 3).toUpperCase()}</div>
            )}
          </div>
          <span className="team-name">{match.home_team}</span>
        </div>

        {/* Center Arena: Tahmin Giriş Alanı VEYA Gerçek Maç Skoru */}
        <div className="match-center-arena">
          {isFinished ? (
            <div className="real-score-board">
              <span className="score-label">Maç Sonucu</span>
              <div className="real-score-values">
                <span className="real-score-num">{match.real_home_score ?? 0}</span>
                <span className="real-score-divider">-</span>
                <span className="real-score-num">{match.real_away_score ?? 0}</span>
              </div>
              <div className="center-prediction-badge">
                <span className="pred-prefix">Tahmin:</span>
                <strong>
                  {userPrediction
                    ? `${userPrediction.predicted_home_score} - ${userPrediction.predicted_away_score}`
                    : 'Girilmedi'}
                </strong>
              </div>
            </div>
          ) : (
            <div className="prediction-inputs-box">
              <div className="prediction-box-header">
                <span className="prediction-box-label">Tahmininiz</span>
              </div>

              {isLocked ? (
                <div className="locked-badge">
                  <Lock size={13} />
                  <span>Kilitlendi: {homeScore} - {awayScore}</span>
                </div>
              ) : (
                <div className="score-inputs-row">
                  {/* Home Score Counter */}
                  <div className="counter-col">
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
                      disabled={isLocked || homeScore <= 0}
                      aria-label="Ev Sahibi Skoru Azalt"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      className="score-input"
                      value={homeScore}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setHomeScore(isNaN(val) ? 0 : Math.max(0, Math.min(20, val)));
                      }}
                      disabled={isLocked}
                      aria-label="Ev Sahibi Skor Tahmini"
                    />
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => setHomeScore(Math.min(20, homeScore + 1))}
                      disabled={isLocked}
                      aria-label="Ev Sahibi Skoru Artır"
                    >
                      +
                    </button>
                  </div>

                  <span className="inputs-divider">:</span>

                  {/* Away Score Counter */}
                  <div className="counter-col">
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
                      disabled={isLocked || awayScore <= 0}
                      aria-label="Deplasman Skoru Azalt"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      className="score-input"
                      value={awayScore}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setAwayScore(isNaN(val) ? 0 : Math.max(0, Math.min(20, val)));
                      }}
                      disabled={isLocked}
                      aria-label="Deplasman Skor Tahmini"
                    />
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => setAwayScore(Math.min(20, awayScore + 1))}
                      disabled={isLocked}
                      aria-label="Deplasman Skoru Artır"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="team-column away">
          <div className="team-logo-wrap">
            {match.away_team_logo ? (
              <img
                src={match.away_team_logo}
                alt={match.away_team}
                className="team-logo"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="team-logo-fallback">{match.away_team.substring(0, 3).toUpperCase()}</div>
            )}
          </div>
          <span className="team-name">{match.away_team}</span>
        </div>
      </div>

      {/* 3. ŞIK VE NET "TAHMİNİ KAYDET" BUTONU VE BİLDİRİM ALANI */}
      {!isFinished && !isLocked && (
        <div className="match-save-action-bar">
          <button
            type="button"
            className={`btn-save-prediction ${
              saveStatus === 'saved'
                ? 'saved'
                : saveStatus === 'saving'
                ? 'saving'
                : isScoreChanged
                ? 'active-glow'
                : 'synced'
            }`}
            onClick={handleSavePredictionClick}
            disabled={saveStatus === 'saving'}
            title={hasExisting ? 'Mevcut tahmini güncelle' : 'Skor tahminini kaydet'}
          >
            {saveStatus === 'saving' ? (
              <>
                <RefreshCw size={15} className="spinning" />
                <span>Kaydediliyor...</span>
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <CheckCircle2 size={16} />
                <span>Tahmin Kaydedildi!</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>
                  {hasExisting
                    ? isScoreChanged
                      ? 'Tahmini Güncelle'
                      : 'Tahmin Kayıtlı (Yeniden Kaydet)'
                    : 'Tahmini Kaydet'}
                </span>
              </>
            )}
          </button>

          {/* Toast / Bildirim Rozeti */}
          {saveFeedbackMsg && (
            <div className={`save-feedback-toast ${saveStatus === 'saved' ? 'success' : 'error'}`}>
              {saveStatus === 'saved' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
              <span>{saveFeedbackMsg}</span>
            </div>
          )}
        </div>
      )}

      {/* Kilitli Maç Uyarısı */}
      {!isFinished && isLocked && (
        <div className="match-locked-notice">
          <Lock size={14} />
          <span>Bu maçın başlama saati geçtiği için tahmin girişi kapanmıştır.</span>
        </div>
      )}

      {/* 4. Biten Maçta Kazanılan Puan Rozeti */}
      {isFinished && (
        <div className="finished-points-banner">
          {userPrediction ? (
            <div className="points-status-row">
              {userPrediction.points_earned === 4 && (
                <span className="points-badge exact" title="Tam İsabet! Tam Skor Bildimi">
                  <Award size={15} /> +4 PUAN (Tam Skor)
                </span>
              )}
              {userPrediction.points_earned === 3 && (
                <span className="points-badge diff" title="Gol Farkını Doğru Bildiniz">
                  <Target size={15} /> +3 PUAN (Gol Farkı)
                </span>
              )}
              {userPrediction.points_earned === 2 && (
                <span className="points-badge winner" title="Kazananı / Beraberliği Doğru Bildiniz">
                  <Sparkles size={15} /> +2 PUAN (Doğru Sonuç)
                </span>
              )}
              {userPrediction.points_earned === 0 && (
                <span className="points-badge zero" title="Puan Alamadınız">
                  0 Puan (Yanlış Tahmin)
                </span>
              )}
            </div>
          ) : (
            <span className="no-prediction-text">
              <AlertCircle size={14} /> Bu maç için tahmin girmediniz (0 Puan)
            </span>
          )}
        </div>
      )}

      {/* 5. Sol Altta Tarih/Saat, Sağ Altta Stadyum Bilgisi */}
      <div className="match-card-meta-bottom">
        <div className="meta-item-left" title="Maç Tarihi ve Saati (İstanbul Saati)">
          <Calendar size={13} className="meta-icon" />
          <span>{formattedDate}, {formattedTime}</span>
        </div>

        <div className="meta-item-right" title="Maçın Oynandığı Stadyum">
          <MapPin size={13} className="meta-icon" />
          <span>{match.stadium || 'UEFA Stadyumu'}</span>
        </div>
      </div>

      {/* 6. Biten veya kilitli maçta diğer katılımcıların tahminlerini açıp kapama */}
      {(isFinished || isPast) && (
        <div className="all-predictions-accordion">
          <button
            type="button"
            className="btn-toggle-accordion"
            onClick={handleToggleAllPredictions}
          >
            <span>Diğer Katılımcıların Tahminleri</span>
            {showAllPredictions ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {showAllPredictions && (
            <div className="accordion-content">
              {loadingPredictions ? (
                <div className="mini-loader">Yükleniyor...</div>
              ) : allPredictions.length === 0 ? (
                <div className="no-data-hint">Henüz tahmin kaydı yok veya demo modundasınız.</div>
              ) : (
                <div className="preds-mini-list">
                  {allPredictions.map((p) => (
                    <div key={p.id} className="pred-mini-item">
                      <span className="pred-user-name">{p.user?.name || 'Katılımcı'}</span>
                      <span className="pred-user-score">
                        {p.predicted_home_score} - {p.predicted_away_score}
                      </span>
                      {isFinished && (
                        <span className={`pred-user-points p-${p.points_earned}`}>
                          {p.points_earned > 0 ? `+${p.points_earned}p` : '0p'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

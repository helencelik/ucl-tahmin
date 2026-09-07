import React, { useState, useEffect } from 'react';
import { Match, Prediction } from '../types';
import {
  Calendar,
  AlertCircle,
  Award,
  Sparkles,
  Target,
  ChevronDown,
  ChevronUp,
  MapPin,
  RefreshCw,
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
  // Skorlar: Kullanıcı rahatça silip yazabilsin diye string olarak tutulur
  const [homeScore, setHomeScore] = useState<string>(
    userPrediction !== undefined && userPrediction !== null
      ? String(userPrediction.predicted_home_score)
      : ''
  );
  const [awayScore, setAwayScore] = useState<string>(
    userPrediction !== undefined && userPrediction !== null
      ? String(userPrediction.predicted_away_score)
      : ''
  );

  // Otomatik kayıt durumu: 'idle' | 'saving' | 'saved' | 'error'
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

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
      setHomeScore(String(userPrediction.predicted_home_score));
      setAwayScore(String(userPrediction.predicted_away_score));
    }
  }, [userPrediction?.predicted_home_score, userPrediction?.predicted_away_score]);

  // OTOMATİK KAYDETME (AUTO-SAVE) MANTIĞI:
  // Kullanıcı hem ev sahibi hem deplasman skorunu girdiğinde arka planda otomatik kaydeder
  useEffect(() => {
    if (isLocked) return;
    if (homeScore === '' || awayScore === '') return;

    const h = parseInt(homeScore, 10);
    const a = parseInt(awayScore, 10);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return;

    // Eğer zaten kaydedilmiş tahminle birebir aynıysa tekrar kaydetme
    if (
      userPrediction &&
      userPrediction.predicted_home_score === h &&
      userPrediction.predicted_away_score === a
    ) {
      return;
    }

    setSaveStatus('saving');
    const timer = setTimeout(async () => {
      try {
        await onSavePrediction(match.id, h, a);
        setSaveStatus('saved');
        setTimeout(() => {
          setSaveStatus('idle');
        }, 2200);
      } catch (err) {
        console.error('Otomatik kayıt hatası:', err);
        setSaveStatus('error');
        setTimeout(() => {
          setSaveStatus('idle');
        }, 3000);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [homeScore, awayScore, isLocked, match.id]);

  const handleToggleAllPredictions = async () => {
    if (!showAllPredictions && allPredictions.length === 0) {
      setLoadingPredictions(true);
      const preds = await getMatchPredictions(match.id);
      setAllPredictions(preds);
      setLoadingPredictions(false);
    }
    setShowAllPredictions(!showAllPredictions);
  };

  // Sadece rakam kabul eden tuş kontrolü
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }
    // Rakam harici girişleri (e, +, -, nokta, virgül vb.) engelle
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Sadece rakam filtreleme
  const handleHomeScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    if (digits === '') {
      setHomeScore('');
    } else {
      const num = parseInt(digits, 10);
      setHomeScore(String(Math.min(20, num)));
    }
  };

  const handleAwayScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    if (digits === '') {
      setAwayScore('');
    } else {
      const num = parseInt(digits, 10);
      setAwayScore(String(Math.min(20, num)));
    }
  };

  const hasExisting = userPrediction !== undefined && userPrediction !== null;

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
                  <span>Kilitlendi: {homeScore || '0'} - {awayScore || '0'}</span>
                </div>
              ) : (
                <>
                  {/* Sadece Rakam Kabul Eden Number Input Bileşenleri */}
                  <div className="score-number-inputs-wrap">
                    <input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      min="0"
                      max="20"
                      className={`score-box-input ${saveStatus === 'saved' ? 'saved-pulse' : ''}`}
                      placeholder="-"
                      value={homeScore}
                      onChange={handleHomeScoreChange}
                      onKeyDown={handleKeyDown}
                      disabled={isLocked}
                      aria-label={`${match.home_team} Skor Tahmini`}
                    />

                    <span className="score-box-separator">:</span>

                    <input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      min="0"
                      max="20"
                      className={`score-box-input ${saveStatus === 'saved' ? 'saved-pulse' : ''}`}
                      placeholder="-"
                      value={awayScore}
                      onChange={handleAwayScoreChange}
                      onKeyDown={handleKeyDown}
                      disabled={isLocked}
                      aria-label={`${match.away_team} Skor Tahmini`}
                    />
                  </div>

                  {/* Arka Planda Otomatik Kaydetme Durum Göstergesi */}
                  <div className="auto-save-status-indicator">
                    {saveStatus === 'saving' && (
                      <span className="auto-save-text saving">
                        <RefreshCw size={11} className="spinning" />
                        Kaydediliyor...
                      </span>
                    )}
                    {saveStatus === 'saved' && (
                      <span className="auto-save-text saved">
                        <Check size={11} />
                        Otomatik Kaydedildi
                      </span>
                    )}
                    {saveStatus === 'error' && (
                      <span className="auto-save-text error">
                        <AlertCircle size={11} />
                        Kayıt hatası
                      </span>
                    )}
                    {saveStatus === 'idle' && hasExisting && (
                      <span className="auto-save-text synced">
                        <Check size={11} />
                        Kayıtlı Tahmin
                      </span>
                    )}
                    {saveStatus === 'idle' && !hasExisting && (homeScore === '' || awayScore === '') && (
                      <span className="auto-save-text hint">
                        Skorları girin (otomatik kaydeder)
                      </span>
                    )}
                  </div>
                </>
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

      {/* Kilitli Maç Uyarısı */}
      {!isFinished && isLocked && (
        <div className="match-locked-notice">
          <Lock size={14} />
          <span>Bu maçın başlama saati geçtiği için tahmin girişi kapanmıştır.</span>
        </div>
      )}

      {/* 3. Biten Maçta Kazanılan Puan Rozeti */}
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

      {/* 4. Sol Altta Tarih/Saat, Sağ Altta Stadyum Bilgisi */}
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

      {/* 5. Biten veya kilitli maçta diğer katılımcıların tahminlerini açıp kapama */}
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

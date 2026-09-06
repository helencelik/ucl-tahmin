import React, { useState, useEffect } from 'react';
import { Match, Prediction } from '../types';
import { Clock, CheckCircle2, AlertCircle, Award, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showAllPredictions, setShowAllPredictions] = useState(false);
  const [allPredictions, setAllPredictions] = useState<Prediction[]>([]);
  const [loadingPredictions, setLoadingPredictions] = useState(false);

  useEffect(() => {
    if (userPrediction) {
      setHomeScore(userPrediction.predicted_home_score);
      setAwayScore(userPrediction.predicted_away_score);
    }
  }, [userPrediction]);

  const matchDate = new Date(match.match_date);
  const isPast = matchDate.getTime() <= Date.now();
  const isFinished = match.status === 'finished';
  const isLocked = isPast || isFinished;

  const handleSave = async () => {
    if (isLocked || isSaving) return;
    setIsSaving(true);
    setSaveError('');
    try {
      await onSavePrediction(match.id, homeScore, awayScore);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setSaveError(err?.message || 'Tahmin kaydedilemedi. Lütfen tekrar deneyiniz.');
      setTimeout(() => setSaveError(''), 4000);
    } finally {
      setIsSaving(false);
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
      {/* Header Info */}
      <div className="match-card-header">
        <span className="match-stage-badge">UEFA Şampiyonlar Ligi</span>
        <div className="match-time-badge">
          <Clock size={13} />
          <span>{isFinished ? 'Bitti' : `${formattedDate}, ${formattedTime}`}</span>
        </div>
      </div>

      {/* Teams and Scores Arena */}
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

        {/* Center Arena: Score Inputs or Real Score */}
        <div className="match-center-arena">
          {isFinished ? (
            <div className="real-score-board">
              <span className="real-score">{match.real_home_score ?? 0}</span>
              <span className="score-divider">-</span>
              <span className="real-score">{match.real_away_score ?? 0}</span>
              <span className="score-label">Gerçek Skor</span>
            </div>
          ) : (
            <div className="prediction-inputs-box">
              {isLocked ? (
                <div className="locked-badge">
                  <span>Kilitlendi</span>
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
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      className="score-input"
                      value={homeScore}
                      onChange={(e) => setHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                      disabled={isLocked}
                    />
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => setHomeScore(homeScore + 1)}
                      disabled={isLocked}
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
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      className="score-input"
                      value={awayScore}
                      onChange={(e) => setAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                      disabled={isLocked}
                    />
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => setAwayScore(awayScore + 1)}
                      disabled={isLocked}
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

      {/* Footer / Status / Actions */}
      <div className="match-card-footer">
        {isFinished ? (
          <div className="finished-prediction-status">
            {userPrediction ? (
              <div className="prediction-summary-row">
                <span className="your-pred-tag">
                  Tahmininiz: <strong>{userPrediction.predicted_home_score} - {userPrediction.predicted_away_score}</strong>
                </span>

                {userPrediction.points_earned === 3 && (
                  <span className="points-badge exact" title="Tam İsabet!">
                    <Award size={14} /> +3 PUAN (Tam Skor)
                  </span>
                )}
                {userPrediction.points_earned === 1 && (
                  <span className="points-badge winner" title="Kazananı Doğru Bildiniz">
                    <Sparkles size={14} /> +1 PUAN (Doğru Sonuç)
                  </span>
                )}
                {userPrediction.points_earned === 0 && (
                  <span className="points-badge zero">
                    0 Puan
                  </span>
                )}
              </div>
            ) : (
              <span className="no-prediction-text">
                <AlertCircle size={14} /> Bu maç için tahmin girmediniz
              </span>
            )}
          </div>
        ) : isPast ? (
          <div className="match-locked-notice">
            <AlertCircle size={14} /> Maç saati geçtiği için tahmin kilitlenmiştir.
            {userPrediction && (
              <span className="locked-pred-info">
                (Tahmininiz: {userPrediction.predicted_home_score} - {userPrediction.predicted_away_score})
              </span>
            )}
          </div>
        ) : (
          <div className="save-action-row">
            {saveError && (
              <span className="save-error-hint" style={{ color: '#ef4444', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={14} /> {saveError}
              </span>
            )}
            {userPrediction && !saveError && (
              <span className="saved-info">
                Kayıtlı Tahmin: <strong>{userPrediction.predicted_home_score} - {userPrediction.predicted_away_score}</strong>
              </span>
            )}
            <button
              type="button"
              className={`btn-save-prediction ${saveSuccess ? 'success' : ''}`}
              onClick={handleSave}
              disabled={isSaving || isLocked}
            >
              {isSaving ? (
                'Kaydediliyor...'
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 size={16} /> Kaydedildi!
                </>
              ) : userPrediction ? (
                'Tahmini Güncelle'
              ) : (
                'Tahmini Kaydet'
              )}
            </button>
          </div>
        )}

        {/* Biten veya kilitli maçta diğer katılımcıların tahminlerini açıp kapama */}
        {(isFinished || isPast) && (
          <div className="all-predictions-accordion">
            <button
              type="button"
              className="btn-toggle-accordion"
              onClick={handleToggleAllPredictions}
            >
              <span>Diğer Katılımcıların Tahminleri</span>
              {showAllPredictions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
                            +{p.points_earned}p
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
    </div>
  );
};

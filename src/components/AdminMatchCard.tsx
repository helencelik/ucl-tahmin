import React, { useState } from 'react';
import { Match } from '../types';
import { updateMatchResult, deleteMatch } from '../services/api';
import { CheckCircle2, Clock, Trash2, Check, AlertTriangle } from 'lucide-react';

interface AdminMatchCardProps {
  match: Match;
  onRefresh: () => void;
}

export const AdminMatchCard: React.FC<AdminMatchCardProps> = ({ match, onRefresh }) => {
  const [homeScore, setHomeScore] = useState<number>(match.real_home_score ?? 0);
  const [awayScore, setAwayScore] = useState<number>(match.real_away_score ?? 0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const matchDate = new Date(match.match_date);
  const formattedDate = matchDate.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleSaveResult = async () => {
    setIsUpdating(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await updateMatchResult(match.id, homeScore, awayScore);
      setSuccessMsg('Skor kaydedildi ve puanlar otomatik hesaplandı!');
      setTimeout(() => setSuccessMsg(''), 4000);
      onRefresh();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Skor kaydedilirken bir hata oluştu.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`${match.home_team} vs ${match.away_team} maçını silmek istediğinize emin misiniz?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteMatch(match.id);
      onRefresh();
    } catch (err: any) {
      console.error(err);
      alert('Maç silinirken hata: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`admin-match-card ${match.status === 'finished' ? 'status-finished' : 'status-pending'}`}>
      {/* Top Header */}
      <div className="admin-card-header">
        <div className="admin-match-date">
          <Clock size={14} />
          <span>{formattedDate}</span>
        </div>

        <div className="admin-status-group">
          <span className={`admin-status-pill ${match.status}`}>
            {match.status === 'finished' ? 'Sonuçlandı' : 'Beklemede'}
          </span>
          <button
            className="btn-delete-match"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Maçı Sil"
            aria-label="Maçı Sil"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Teams Grid & Real Score Entry */}
      <div className="admin-teams-row">
        {/* Home */}
        <div className="admin-team-item home">
          {match.home_team_logo && (
            <img src={match.home_team_logo} alt={match.home_team} className="admin-team-logo" />
          )}
          <span className="admin-team-title">{match.home_team}</span>
        </div>

        {/* Score Inputs */}
        <div className="admin-score-inputs">
          <input
            type="number"
            min="0"
            max="20"
            className="admin-score-field"
            value={homeScore}
            onChange={(e) => setHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
          />
          <span className="admin-colon">-</span>
          <input
            type="number"
            min="0"
            max="20"
            className="admin-score-field"
            value={awayScore}
            onChange={(e) => setAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
          />
        </div>

        {/* Away */}
        <div className="admin-team-item away">
          {match.away_team_logo && (
            <img src={match.away_team_logo} alt={match.away_team} className="admin-team-logo" />
          )}
          <span className="admin-team-title">{match.away_team}</span>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="admin-alert success">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="admin-alert error">
          <AlertTriangle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Action Footer */}
      <div className="admin-card-footer">
        <button
          type="button"
          className="btn-admin-finalize"
          onClick={handleSaveResult}
          disabled={isUpdating}
        >
          {isUpdating ? (
            'Hesaplanıyor...'
          ) : (
            <>
              <Check size={16} />
              {match.status === 'finished' ? 'Skoru Güncelle & Tekrar Hesapla' : 'Sonucu Gir & Puanları Dağıt'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

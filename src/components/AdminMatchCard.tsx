import React, { useState } from 'react';
import { Match } from '../types';
import { updateMatchResult, deleteMatch } from '../services/api';
import {
  Calendar,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Save,
  Check,
  Trash2,
  RefreshCw
} from 'lucide-react';

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

  const isFinished = match.status === 'finished';

  const handleSaveResult = async () => {
    setIsUpdating(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await updateMatchResult(match.id, homeScore, awayScore);
      setSuccessMsg(`Skor kaydedildi: ${homeScore} - ${awayScore} (Puanlar hesaplandı)`);
      setTimeout(() => setSuccessMsg(''), 3500);
      onRefresh();
    } catch (err: any) {
      console.error('Skor kaydetme hatası:', err);
      setErrorMsg(err?.message || 'Skor kaydedilirken bir hata oluştu.');
      setTimeout(() => setErrorMsg(''), 5000);
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
    <div className={`admin-match-card ${isFinished ? 'status-finished' : 'status-pending'}`}>
      {/* 1. Üst İnce Bilgi Çubuğu: Hafta, Tarih, Stadyum, Durum Rozeti ve Silme */}
      <div className="card-top-bar">
        <div className="card-meta-left">
          {match.matchweek && (
            <span className="badge-week">{match.matchweek}. Hafta</span>
          )}
          <span className="badge-date">
            <Calendar size={12} />
            <span>{formattedDate}</span>
          </span>
          {match.stadium && (
            <span className="badge-stadium">
              <MapPin size={12} />
              <span>{match.stadium}</span>
            </span>
          )}
        </div>

        <div className="card-meta-right">
          <span className={`badge-status ${isFinished ? 'finished' : 'pending'}`}>
            {isFinished ? `Sonuç: ${match.real_home_score} - ${match.real_away_score}` : 'Skor Bekliyor'}
          </span>
          <button
            type="button"
            className="btn-trash-mini"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Maçı Sistemden Sil"
            aria-label="Sil"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* 2. Ana Maç Alanı: Sol Logo, Ortada Skor Kutuları & Kaydet, Sağ Logo */}
      <div className="match-fixture-arena">
        {/* Sol Logo ve Ev Sahibi */}
        <div className="team-cell home">
          <div className="team-logo-frame">
            {match.home_team_logo ? (
              <img src={match.home_team_logo} alt={match.home_team} className="team-logo-img" />
            ) : (
              <span className="logo-placeholder">{match.home_team.substring(0, 3).toUpperCase()}</span>
            )}
          </div>
          <span className="team-title">{match.home_team}</span>
        </div>

        {/* Ortada Yan Yana Skor Kutuları ve Minimalist Kaydet Butonu */}
        <div className="score-center-dock">
          {/* Ev Sahibi Skor Kutusu */}
          <div className="score-input-unit">
            <button
              type="button"
              className="btn-stepper minus"
              onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
              disabled={isUpdating}
              title="Azalt"
            >
              -
            </button>
            <input
              type="number"
              min="0"
              max="25"
              value={homeScore}
              onChange={(e) => setHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
              className="score-num-field"
              disabled={isUpdating}
              aria-label="Ev Sahibi Skor"
            />
            <button
              type="button"
              className="btn-stepper plus"
              onClick={() => setHomeScore(homeScore + 1)}
              disabled={isUpdating}
              title="Artır"
            >
              +
            </button>
          </div>

          <span className="score-colon">:</span>

          {/* Deplasman Skor Kutusu */}
          <div className="score-input-unit">
            <button
              type="button"
              className="btn-stepper minus"
              onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
              disabled={isUpdating}
              title="Azalt"
            >
              -
            </button>
            <input
              type="number"
              min="0"
              max="25"
              value={awayScore}
              onChange={(e) => setAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
              className="score-num-field"
              disabled={isUpdating}
              aria-label="Deplasman Skor"
            />
            <button
              type="button"
              className="btn-stepper plus"
              onClick={() => setAwayScore(awayScore + 1)}
              disabled={isUpdating}
              title="Artır"
            >
              +
            </button>
          </div>

          {/* Minimalist ve Şık Kaydet Butonu */}
          <button
            type="button"
            className={`btn-minimal-save ${isFinished ? 'saved' : 'pending'} ${isUpdating ? 'loading' : ''}`}
            onClick={handleSaveResult}
            disabled={isUpdating}
            title="Gerçek Maç Skorunu Kaydet ve Puanları Hesapla"
          >
            {isUpdating ? (
              <>
                <RefreshCw size={13} className="spinning" />
                <span>Kaydediliyor...</span>
              </>
            ) : isFinished ? (
              <>
                <Check size={13} />
                <span>Güncelle</span>
              </>
            ) : (
              <>
                <Save size={13} />
                <span>Kaydet</span>
              </>
            )}
          </button>
        </div>

        {/* Sağ Logo ve Deplasman */}
        <div className="team-cell away">
          <span className="team-title">{match.away_team}</span>
          <div className="team-logo-frame">
            {match.away_team_logo ? (
              <img src={match.away_team_logo} alt={match.away_team} className="team-logo-img" />
            ) : (
              <span className="logo-placeholder">{match.away_team.substring(0, 3).toUpperCase()}</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Durum Bildirimleri (Hata veya Başarı) */}
      {successMsg && (
        <div className="card-alert success">
          <CheckCircle2 size={13} />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="card-alert error">
          <AlertTriangle size={13} />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};

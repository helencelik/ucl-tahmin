import React, { useState } from 'react';
import { createMatch } from '../services/api';
import { X, Plus, Calendar, AlertCircle } from 'lucide-react';

interface NewMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const COMMON_TEAMS = [
  { name: 'Real Madrid', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8633.png' },
  { name: 'Manchester City', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8456.png' },
  { name: 'Bayern Munich', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9823.png' },
  { name: 'Arsenal', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9825.png' },
  { name: 'Paris Saint-Germain', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9847.png' },
  { name: 'Barcelona', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8634.png' },
  { name: 'Inter', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8636.png' },
  { name: 'Atletico Madrid', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9906.png' },
  { name: 'Borussia Dortmund', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9789.png' },
  { name: 'Liverpool', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8650.png' },
  { name: 'Juventus', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9885.png' },
  { name: 'Milan', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8564.png' },
  { name: 'Bayer Leverkusen', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8178.png' },
  { name: 'Benfica', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9772.png' }
];

export const NewMatchModal: React.FC<NewMatchModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [homeLogo, setHomeLogo] = useState('');
  const [awayLogo, setAwayLogo] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSelectHome = (teamName: string) => {
    setHomeTeam(teamName);
    const found = COMMON_TEAMS.find((t) => t.name === teamName);
    if (found) setHomeLogo(found.logo);
  };

  const handleSelectAway = (teamName: string) => {
    setAwayTeam(teamName);
    const found = COMMON_TEAMS.find((t) => t.name === teamName);
    if (found) setAwayLogo(found.logo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeam || !awayTeam || !matchDate) {
      setErrorMsg('Lütfen ev sahibi, deplasman ve maç tarihini eksiksiz girin.');
      return;
    }

    if (homeTeam === awayTeam) {
      setErrorMsg('Ev sahibi ve deplasman takımları aynı olamaz.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await createMatch({
        home_team: homeTeam,
        away_team: awayTeam,
        home_team_logo: homeLogo || undefined,
        away_team_logo: awayLogo || undefined,
        match_date: new Date(matchDate).toISOString()
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Maç eklenirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-title-row">
            <Plus size={20} className="text-accent" />
            <h3>Yeni Şampiyonlar Ligi Maçı Ekle</h3>
          </div>
          <button className="btn-close-modal" onClick={onClose} aria-label="Kapat">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {errorMsg && (
            <div className="modal-alert error">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Home Team */}
          <div className="form-group">
            <label className="form-label">Ev Sahibi Takım</label>
            <div className="input-with-datalist">
              <input
                type="text"
                list="home-teams-list"
                placeholder="Örn: Real Madrid"
                value={homeTeam}
                onChange={(e) => handleSelectHome(e.target.value)}
                className="form-input"
                required
              />
              <datalist id="home-teams-list">
                {COMMON_TEAMS.map((t) => (
                  <option key={t.name} value={t.name} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Away Team */}
          <div className="form-group">
            <label className="form-label">Deplasman Takımı</label>
            <div className="input-with-datalist">
              <input
                type="text"
                list="away-teams-list"
                placeholder="Örn: Manchester City"
                value={awayTeam}
                onChange={(e) => handleSelectAway(e.target.value)}
                className="form-input"
                required
              />
              <datalist id="away-teams-list">
                {COMMON_TEAMS.map((t) => (
                  <option key={t.name} value={t.name} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Match Date & Time */}
          <div className="form-group">
            <label className="form-label">
              <Calendar size={14} /> Maç Tarihi ve Saati
            </label>
            <input
              type="datetime-local"
              value={matchDate}
              onChange={(e) => setMatchDate(e.target.value)}
              className="form-input date-input"
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Vazgeç
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Ekleniyor...' : 'Maçı Yayınla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

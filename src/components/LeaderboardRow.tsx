import React from 'react';
import { LeaderboardUser } from '../types';
import { Crown, Medal, User as UserIcon, Award, Target, Sparkles } from 'lucide-react';

interface LeaderboardRowProps {
  user: LeaderboardUser;
  rank: number;
  isCurrentUser: boolean;
  maxPoints?: number;
}

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  user,
  rank,
  isCurrentUser,
  maxPoints = 25
}) => {
  const pointsPercent = Math.min(100, Math.round(((user.total_points || 0) / Math.max(1, maxPoints)) * 100));

  const getRankBadge = () => {
    if (rank === 1) {
      return (
        <div className="rank-badge gold" title="1. Sıra - Lider (Altın)">
          <Crown size={20} className="crown-icon" />
          <span className="rank-num">1</span>
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="rank-badge silver" title="2. Sıra (Gümüş)">
          <Medal size={18} />
          <span className="rank-num">2</span>
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="rank-badge bronze" title="3. Sıra (Bronz)">
          <Medal size={18} />
          <span className="rank-num">3</span>
        </div>
      );
    }
    return (
      <div className="rank-badge default">
        <span className="rank-num">{rank}</span>
      </div>
    );
  };

  const displayName = user.display_name || user.name || 'Katılımcı';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className={`leaderboard-card-row ${isCurrentUser ? 'current-user-card' : ''} tier-rank-${rank}`}>
      {/* 1. Sıralama Sütunu */}
      <div className="row-rank-area">
        {getRankBadge()}
      </div>

      {/* 2. Kullanıcı Avatar & Bilgileri */}
      <div className="row-user-area">
        <div className={`user-avatar-wrap ${rank <= 3 ? `top-${rank}` : ''} ${isCurrentUser ? 'current' : ''}`}>
          {initial ? <span className="avatar-initial">{initial}</span> : <UserIcon size={16} />}
          {rank === 1 && <span className="gold-star-dot">★</span>}
        </div>

        <div className="user-text-details">
          <div className="user-primary-line">
            <span className="user-name-title">{displayName}</span>
            {isCurrentUser && <span className="badge-you">Siz</span>}
          </div>

          <div className="user-stats-chips-row">
            {user.username && (
              <span className="user-handle-chip">@{user.username}</span>
            )}
            
            <span className="stat-chip exact" title="4 Puanlık Tam Skor Tahmin Sayısı">
              <Award size={12} />
              <span>{user.exact_scores_count || 0} Tam</span>
            </span>

            {(user.diff_scores_count !== undefined && user.diff_scores_count > 0) && (
              <span className="stat-chip diff" title="3 Puanlık Gol Farkı Bildimi Sayısı">
                <Target size={11} />
                <span>{user.diff_scores_count} Fark</span>
              </span>
            )}

            {(user.result_scores_count !== undefined && user.result_scores_count > 0) && (
              <span className="stat-chip result" title="2 Puanlık Maç Sonucu Bildimi Sayısı">
                <Sparkles size={11} />
                <span>{user.result_scores_count} Sonuç</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Puan ve Görsel İlerleme Çubuğu */}
      <div className="row-points-area">
        <div className="points-display-box">
          <span className="points-big-num">{user.total_points}</span>
          <span className="points-label">PUAN</span>
        </div>

        {/* Lidere Göre Oran Çubuğu */}
        <div className="points-mini-progress" title={`Liderin puanına oranı: %${pointsPercent}`}>
          <div
            className={`progress-fill ${rank === 1 ? 'fill-gold' : rank === 2 ? 'fill-silver' : rank === 3 ? 'fill-bronze' : 'fill-cyan'}`}
            style={{ width: `${Math.max(8, pointsPercent)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

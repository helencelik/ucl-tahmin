import React from 'react';
import { LeaderboardUser } from '../types';
import { Crown, Medal, User as UserIcon, Award } from 'lucide-react';

interface LeaderboardRowProps {
  user: LeaderboardUser;
  rank: number;
  isCurrentUser: boolean;
}

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  user,
  rank,
  isCurrentUser
}) => {
  const getRankBadge = () => {
    if (rank === 1) {
      return (
        <div className="rank-badge gold" title="Lider - 1. Sıra">
          <Crown size={20} className="crown-icon" />
          <span>1</span>
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="rank-badge silver" title="2. Sıra">
          <Medal size={18} />
          <span>2</span>
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="rank-badge bronze" title="3. Sıra">
          <Medal size={18} />
          <span>3</span>
        </div>
      );
    }
    return (
      <div className="rank-badge default">
        <span>{rank}</span>
      </div>
    );
  };

  return (
    <div className={`leaderboard-row ${isCurrentUser ? 'current-user-row' : ''} rank-${rank}`}>
      {/* Rank Indicator */}
      <div className="rank-col">
        {getRankBadge()}
      </div>

      {/* User Info */}
      <div className="user-col">
        <div className="user-avatar-circle">
          {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={16} />}
        </div>
        <div className="user-details">
          <div className="name-and-tag">
            <span className="user-display-name">{user.name}</span>
            {isCurrentUser && <span className="you-tag">Siz</span>}
            {user.role?.toLowerCase() === 'admin' && <span className="admin-tag">Admin</span>}
          </div>
          <div className="user-sub-stats">
            <span className="exact-score-stat" title="Bilinmiş Tam Skor Sayısı">
              <Award size={12} /> {user.exact_scores_count || 0} Tam Skor
            </span>
          </div>
        </div>
      </div>

      {/* Total Points */}
      <div className="points-col">
        <div className="points-badge-box">
          <span className="points-val">{user.total_points}</span>
          <span className="points-unit">Puan</span>
        </div>
      </div>
    </div>
  );
};

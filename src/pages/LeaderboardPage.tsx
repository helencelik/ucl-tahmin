import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LeaderboardUser } from '../types';
import { getLeaderboard, isUserAdmin } from '../services/api';
import { LeaderboardRow } from '../components/LeaderboardRow';
import {
  Trophy,
  Crown,
  Medal,
  Sparkles,
  Award,
  Search
} from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      const data = await getLeaderboard();
      // Admin kullanıcıların sıralamada yer almadığından emin ol
      setLeaderboard(data.filter((u) => !isUserAdmin(u)));
    } catch (err) {
      console.error('Liderlik verisi alınamadı:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  // Filtreleme (Adminler kesinlikle liderlik tablosunda yer almaz + Arama)
  const filteredUsers = leaderboard
    .filter((u) => !isUserAdmin(u))
    .filter((u) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const nameStr = (u.display_name || u.name || '').toLowerCase();
      const usernameStr = (u.username || '').toLowerCase();
      return nameStr.includes(q) || usernameStr.includes(q);
    });

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];
  const highestPoints = top1?.total_points || 25;

  return (
    <div className="leaderboard-page">
      {/* 1. Header Banner */}
      <div className="leaderboard-hero">
        <div className="hero-trophy-glow">
          <Trophy size={42} className="trophy-icon" />
        </div>
        <h1 className="hero-title">ŞAMPİYONLAR LİGİ PUAN SIRALAMASI</h1>
      </div>

      {loading ? (
        <div className="leaderboard-loader">
          <div className="mini-spinner"></div>
          <span>Puanlar Yükleniyor...</span>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="empty-leaderboard">
          <Trophy size={48} className="empty-icon" />
          <p>Henüz puan tablosunda kullanıcı bulunmuyor.</p>
        </div>
      ) : (
        <>
          {/* 3. Top 3 3D Podyum Alanı */}
          {top1 && !searchQuery.trim() && (
            <div className="podium-container">
              {/* 2nd Place (Gümüş) */}
              {top2 && (
                <div className="podium-card rank-2">
                  <div className="podium-medal silver">
                    <Medal size={22} />
                  </div>
                  <div className="podium-avatar silver-ring">
                    {(top2.display_name || top2.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="podium-name">{top2.display_name || top2.name}</span>
                  <div className="podium-points silver-points">
                    <strong>{top2.total_points}</strong> PUAN
                  </div>
                  {top2.exact_scores_count ? (
                    <span className="podium-exact-badge">
                      <Award size={10} /> {top2.exact_scores_count} Tam
                    </span>
                  ) : null}
                  <div className="podium-pedestal p2">
                    <span className="pedestal-number">2</span>
                  </div>
                </div>
              )}

              {/* 1st Place (Altın / Kazanan) */}
              <div className="podium-card rank-1">
                <div className="podium-crown gold">
                  <Crown size={30} />
                </div>
                <div className="podium-avatar winner-avatar gold-ring">
                  {(top1.display_name || top1.name || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="podium-name winner-name">{top1.display_name || top1.name}</span>
                <div className="podium-points winner-points">
                  <Sparkles size={14} />
                  <strong>{top1.total_points}</strong> PUAN
                </div>
                {top1.exact_scores_count ? (
                  <span className="podium-exact-badge gold">
                    <Award size={10} /> {top1.exact_scores_count} Tam Skor
                  </span>
                ) : null}
                <div className="podium-pedestal p1">
                  <span className="pedestal-number">1</span>
                </div>
              </div>

              {/* 3rd Place (Bronz) */}
              {top3 && (
                <div className="podium-card rank-3">
                  <div className="podium-medal bronze">
                    <Medal size={20} />
                  </div>
                  <div className="podium-avatar bronze-ring">
                    {(top3.display_name || top3.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="podium-name">{top3.display_name || top3.name}</span>
                  <div className="podium-points bronze-points">
                    <strong>{top3.total_points}</strong> PUAN
                  </div>
                  {top3.exact_scores_count ? (
                    <span className="podium-exact-badge">
                      <Award size={10} /> {top3.exact_scores_count} Tam
                    </span>
                  ) : null}
                  <div className="podium-pedestal p3">
                    <span className="pedestal-number">3</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. Katılımcı Arama ve Kontrol Barı */}
          <div className="leaderboard-controls-bar">
            <div className="search-input-box">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                className="search-input-field"
                placeholder="Katılımcı adı veya kullanıcı adı ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                >
                  ×
                </button>
              )}
            </div>

            <div className="table-count-indicator">
              <span>Toplam <strong>{leaderboard.length}</strong> Katılımcı</span>
            </div>
          </div>

          {/* 5. Modern Sıralama Kartları Listesi */}
          <div className="leaderboard-cards-container">
            {filteredUsers.length === 0 ? (
              <div className="no-search-results">
                <Search size={24} />
                <p>"{searchQuery}" aramasına uygun katılımcı bulunamadı.</p>
              </div>
            ) : (
              filteredUsers.map((item, index) => (
                <LeaderboardRow
                  key={item.id}
                  user={item}
                  rank={item.rank || index + 1}
                  isCurrentUser={Boolean(user?.id === item.id || (user?.username && item.username === user.username))}
                  maxPoints={highestPoints}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LeaderboardUser } from '../types';
import { getLeaderboard } from '../services/api';
import { LeaderboardRow } from '../components/LeaderboardRow';
import {
  Trophy,
  Crown,
  Medal,
  RefreshCw,
  Sparkles,
  Award,
  Target,
  AlertCircle,
  Search,
  Flame,
  ShieldAlert
} from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLeaderboardData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const data = await getLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      console.error('Liderlik verisi alınamadı:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  // Filtreleme (Arama)
  const filteredUsers = leaderboard.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const nameStr = (u.display_name || u.name || '').toLowerCase();
    const usernameStr = (u.username || '').toLowerCase();
    return nameStr.includes(q) || usernameStr.includes(q);
  });

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  // Aktif kullanıcının tablodaki sırası
  const currentUserEntry = leaderboard.find((u) => u.id === user?.id || (user?.username && u.username === user.username));
  const currentUserRank = currentUserEntry?.rank || leaderboard.findIndex((u) => u.id === user?.id) + 1;

  // En çok tam skor bilen katılımcı
  const maxExactUser = [...leaderboard].sort((a, b) => (b.exact_scores_count || 0) - (a.exact_scores_count || 0))[0];
  const highestPoints = top1?.total_points || 25;

  return (
    <div className="leaderboard-page">
      {/* 1. Header Banner */}
      <div className="leaderboard-hero">
        <div className="hero-trophy-glow">
          <Trophy size={42} className="trophy-icon" />
        </div>
        <h1 className="hero-title">ŞAMPİYONLAR LİGİ PUAN SIRALAMASI</h1>
        <p className="hero-subtitle">
          Tam Skor: <strong>4 Puan</strong> • Gol Farkı: <strong>3 Puan</strong> • Doğru Sonuç: <strong>2 Puan</strong>
        </p>

        <button
          className={`btn-refresh-leaderboard ${refreshing ? 'spinning' : ''}`}
          onClick={() => fetchLeaderboardData(true)}
          title="Tabloyu Yenile"
        >
          <RefreshCw size={15} />
          <span>Yenile</span>
        </button>
      </div>

      {/* 2. Hızlı Özet KPI Kartları (Zirve, En Çok Tam Skor, Kendi Sıranız) */}
      {!loading && leaderboard.length > 0 && (
        <section className="leaderboard-kpi-row">
          {/* Lider Kartı */}
          <div className="lead-kpi-card gold-border">
            <div className="kpi-icon-pill gold">
              <Crown size={18} />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Zirvedeki Lider</span>
              <span className="kpi-value-name">{top1?.display_name || top1?.name || '-'}</span>
              <span className="kpi-sub">{top1?.total_points || 0} Puan</span>
            </div>
          </div>

          {/* En Çok Tam Skor */}
          <div className="lead-kpi-card purple-border">
            <div className="kpi-icon-pill purple">
              <Award size={18} />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Tam Skor Lideri</span>
              <span className="kpi-value-name">{maxExactUser?.display_name || maxExactUser?.name || '-'}</span>
              <span className="kpi-sub">{maxExactUser?.exact_scores_count || 0} Tam Skor (4p)</span>
            </div>
          </div>

          {/* Kendi Durumunuz */}
          <div className="lead-kpi-card cyan-border">
            <div className="kpi-icon-pill cyan">
              <Flame size={18} />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Sizin Sıranız</span>
              <span className="kpi-value-name">
                {currentUserRank > 0 ? `${currentUserRank}. Sıradasınız` : 'Sıralamada Yok'}
              </span>
              <span className="kpi-sub">{currentUserEntry ? `${currentUserEntry.total_points} Puan` : '0 Puan'}</span>
            </div>
          </div>
        </section>
      )}

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

          {/* 6. Puanlama Kuralları ve Zaman Uyarısı Kartı */}
          <div className="scoring-rules-footer-card">
            <div className="rules-card-header">
              <Trophy size={18} className="rules-trophy-icon" />
              <h4>Puan Sistemi ve Kurallar</h4>
            </div>

            <div className="rules-timing-alert">
              <AlertCircle size={16} className="rules-timing-icon" />
              <span className="rules-timing-text">
                "Tahminlerinizi maç başlamadan yapın; maç başladıktan sonra tahmin girişi veya değişikliği yapılamaz."
              </span>
            </div>

            <div className="rules-grid-badges">
              <div className="rule-badge-item rule-exact">
                <div className="badge-icon-area gold">
                  <Award size={18} />
                </div>
                <div className="badge-text-area">
                  <div className="badge-title">Tam Skor (4 Puan)</div>
                  <div className="badge-desc">Maç skoru tam olarak bilinirse (Örn: Maç 3-1, Tahmin 3-1).</div>
                </div>
              </div>

              <div className="rule-badge-item rule-diff">
                <div className="badge-icon-area purple">
                  <Target size={18} />
                </div>
                <div className="badge-text-area">
                  <div className="badge-title">Gol Farkı (3 Puan)</div>
                  <div className="badge-desc">Skor tam bilinmese bile fark doğruysa (Örn: Maç 4-2, Tahmin 2-0).</div>
                </div>
              </div>

              <div className="rule-badge-item rule-result">
                <div className="badge-icon-area cyan">
                  <Sparkles size={18} />
                </div>
                <div className="badge-text-area">
                  <div className="badge-title">Doğru Sonuç (2 Puan)</div>
                  <div className="badge-desc">Yalnızca kazanan veya beraberlik bilinirse (Örn: Maç 2-0, Tahmin 3-2).</div>
                </div>
              </div>

              <div className="rule-badge-item rule-zero">
                <div className="badge-icon-area muted">
                  <ShieldAlert size={18} />
                </div>
                <div className="badge-text-area">
                  <div className="badge-title">Yanlış / Boş (0 Puan)</div>
                  <div className="badge-desc">Yanlış tahmin veya maç saatine kadar tahmin yapılmamışsa.</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

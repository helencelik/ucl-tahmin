import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LeaderboardUser } from '../types';
import { getLeaderboard } from '../services/api';
import { LeaderboardRow } from '../components/LeaderboardRow';
import { Trophy, Crown, Medal, RefreshCw, Sparkles, Award } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  return (
    <div className="leaderboard-page">
      {/* Header Banner */}
      <div className="leaderboard-hero">
        <div className="hero-trophy-glow">
          <Trophy size={42} className="trophy-icon" />
        </div>
        <h1 className="hero-title">ŞAMPİYONLAR LİGİ PUAN TABLOSU</h1>
        <p className="hero-subtitle">
          Her tam skor için <strong>3 Puan</strong>, doğru sonuç için <strong>1 Puan</strong>
        </p>

        <button
          className={`btn-refresh-leaderboard ${refreshing ? 'spinning' : ''}`}
          onClick={() => fetchLeaderboardData(true)}
          title="Tabloyu Yenile"
        >
          <RefreshCw size={16} />
          <span>Yenile</span>
        </button>
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
          {/* Top 3 Podium (Görsel Podyum) */}
          {top1 && (
            <div className="podium-container">
              {/* 2nd Place */}
              {top2 && (
                <div className="podium-card rank-2">
                  <div className="podium-medal silver">
                    <Medal size={22} />
                  </div>
                  <div className="podium-avatar">
                    {(top2.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="podium-name">{top2.name || 'Katılımcı'}</span>
                  <div className="podium-points">
                    <strong>{top2.total_points}</strong> PUAN
                  </div>
                  <div className="podium-pedestal p2">
                    <span className="pedestal-number">2</span>
                  </div>
                </div>
              )}

              {/* 1st Place (Winner) */}
              <div className="podium-card rank-1">
                <div className="podium-crown gold">
                  <Crown size={28} />
                </div>
                <div className="podium-avatar winner-avatar">
                  {(top1.name || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="podium-name">{top1.name || 'Katılımcı'}</span>
                <div className="podium-points winner-points">
                  <Sparkles size={14} />
                  <strong>{top1.total_points}</strong> PUAN
                </div>
                <div className="podium-pedestal p1">
                  <span className="pedestal-number">1</span>
                </div>
              </div>

              {/* 3rd Place */}
              {top3 && (
                <div className="podium-card rank-3">
                  <div className="podium-medal bronze">
                    <Medal size={20} />
                  </div>
                  <div className="podium-avatar">
                    {(top3.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="podium-name">{top3.name || 'Katılımcı'}</span>
                  <div className="podium-points">
                    <strong>{top3.total_points}</strong> PUAN
                  </div>
                  <div className="podium-pedestal p3">
                    <span className="pedestal-number">3</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full Table */}
          <div className="leaderboard-table-card">
            <div className="table-header-row">
              <span className="th-rank">Sıra</span>
              <span className="th-user">Katılımcı</span>
              <span className="th-points">Toplam Puan</span>
            </div>

            <div className="table-body-rows">
              {leaderboard.map((item, index) => (
                <LeaderboardRow
                  key={item.id}
                  user={item}
                  rank={index + 1}
                  isCurrentUser={user?.id === item.id}
                />
              ))}
            </div>
          </div>

          {/* Scoring Legend Card */}
          <div className="scoring-rules-footer-card">
            <h4>Puanlama Nasıl Yapılır?</h4>
            <ul>
              <li>
                <Award size={16} className="text-gold" />
                <span><strong>3 Puan:</strong> Maçın gerçek skorunu tam olarak doğru tahmin etmek (Örn: 2-1 biten maça 2-1 tahmini).</span>
              </li>
              <li>
                <Award size={16} className="text-blue" />
                <span><strong>1 Puan:</strong> Kazanan takımı veya beraberliği doğru bilmek ama skoru tam tutturamamak (Örn: 2-1 biten maça 1-0 tahmini).</span>
              </li>
              <li>
                <Award size={16} className="text-muted" />
                <span><strong>0 Puan:</strong> Yanlış maç sonucu tahmini (Örn: 2-1 biten maça beraberlik veya deplasman tahmini).</span>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

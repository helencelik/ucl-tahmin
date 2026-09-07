import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMatches, getUserPredictions, getLeaderboard } from '../services/api';
import { Match, Prediction, LeaderboardUser } from '../types';
import {
  Calendar,
  Target,
  CheckCircle2,
  Sparkles,
  Trophy,
  User,
  ArrowRight,
  TrendingUp,
  Clock,
  Award,
  BookOpen,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (tab: 'home' | 'matches' | 'leaderboard' | 'admin') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [matchesData, predsData, leaderboardData] = await Promise.all([
          getMatches(),
          user ? getUserPredictions(user.id) : Promise.resolve({}),
          getLeaderboard()
        ]);

        setMatches(matchesData);
        setPredictions(predsData);
        setLeaderboard(leaderboardData);
      } catch (err) {
        console.error('Ana ekran verileri yüklenirken hata:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // 1. Toplam maç sayısı
  const totalMatches = matches.length;

  // 2. Yapılan tahmin sayısı
  const userPredictionsCount = Object.keys(predictions).length;

  // 3. Doğru tahmin sayısı (points_earned > 0 olan tahminler)
  const userPredList = Object.values(predictions);
  const correctPredictionsCount = userPredList.filter(
    (p) => (p.points_earned || 0) > 0
  ).length;
  const exactScoresCount = userPredList.filter(
    (p) => (p.points_earned || 0) === 4
  ).length;

  // 4. Toplam puan
  const totalPoints = user?.total_points ?? 0;

  // 5. Genel sıralamadaki yeri (kaçıncı sırada olduğu)
  let userRank: number | null = null;
  if (user) {
    const idx = leaderboard.findIndex(
      (u) =>
        u.id === user.id ||
        (user.username && u.username && u.username.toLowerCase() === user.username.toLowerCase()) ||
        (user.email && u.email && u.email.toLowerCase() === user.email.toLowerCase()) ||
        u.name === user.name
    );
    if (idx !== -1) {
      userRank = idx + 1;
    }
  }

  // Yaklaşan maçlar (en yakın 2 maç)
  const now = Date.now();
  const upcomingMatches = matches
    .filter((m) => m.status === 'pending' && new Date(m.match_date).getTime() > now)
    .slice(0, 2);

  return (
    <div className="home-page">
      {/* 1. DİKKAT ÇEKİCİ BAŞLIK VE KULLANICI BİLGİSİ */}
      <section className="home-hero-card">
        <div className="home-hero-bg-glow"></div>
        <div className="home-hero-content">
          <div className="home-hero-top-row">
            <div className="home-league-tag">
              <Sparkles size={14} />
              <span>UEFA CHAMPIONS LEAGUE 2026</span>
            </div>

            {/* Ekranın köşesinde giriş yapan kullanıcının public.users tablosundaki ismi */}
            {user && (
              <div className="home-user-tag" title="Giriş Yapan Katılımcı">
                <User size={15} className="home-user-tag-icon" />
                <span>
                  Katılımcı: <strong>{user.name}</strong>
                </span>
              </div>
            )}
          </div>

          <h1 className="home-hero-title">Şampiyonlar Ligi 2026 Tahmin Ligi</h1>
          <p className="home-hero-subtext">
            Avrupa'nın en prestijli turnuvasında maç skorlarını tahmin edin; tam skorla <strong>4 puan</strong>, gol farkıyla <strong>3 puan</strong>, maç sonucuyla <strong>2 puan</strong> toplayıp zirveye yerleşin!
          </p>
        </div>
      </section>

      {/* 2. TAHMİNLERİM / ÖZET ALANI (İSTATİSTİKLER) */}
      <section className="home-summary-section">
        <div className="section-header">
          <div className="section-title-wrap">
            <TrendingUp size={22} className="section-title-icon" />
            <h2 className="section-title">Tahminlerim / Özet</h2>
          </div>
          <span className="section-subtitle">2026 Sezonu Performans Raporunuz</span>
        </div>

        {/* 5 Temel İstatistik Kartı */}
        <div className="stats-grid">
          {/* A) Toplam Maç Sayısı */}
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Toplam Maç</span>
              <div className="stat-icon-wrapper blue">
                <Calendar size={20} />
              </div>
            </div>
            <div className="stat-number">
              {loading ? '-' : totalMatches}
            </div>
            <span className="stat-sub">Fikstürdeki maçlar</span>
          </div>

          {/* B) Yapılan Tahmin Sayısı */}
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Yapılan Tahmin</span>
              <div className="stat-icon-wrapper cyan">
                <Target size={20} />
              </div>
            </div>
            <div className="stat-number cyan">
              {loading ? '-' : userPredictionsCount}
            </div>
            <span className="stat-sub">
              {totalMatches > 0
                ? `${Math.round((userPredictionsCount / totalMatches) * 100)}% tamamlandı`
                : 'Kayıtlı tahminler'}
            </span>
          </div>

          {/* C) Doğru Tahmin Sayısı */}
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Doğru Tahmin</span>
              <div className="stat-icon-wrapper green">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div className="stat-number">
              {loading ? '-' : correctPredictionsCount}
            </div>
            <span className="stat-sub">
              {exactScoresCount > 0 ? `${exactScoresCount} Tam İsabet` : 'Puan getiren tahminler'}
            </span>
          </div>

          {/* D) Toplam Puan */}
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Toplam Puan</span>
              <div className="stat-icon-wrapper gold">
                <Sparkles size={20} />
              </div>
            </div>
            <div className="stat-number gold">
              {loading ? '-' : totalPoints}
            </div>
            <span className="stat-sub">Kazanılan toplam puan</span>
          </div>

          {/* E) Genel Sıralamadaki Yeri */}
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">Genel Sıralama</span>
              <div className="stat-icon-wrapper amber">
                <Trophy size={20} />
              </div>
            </div>
            <div className="stat-number gold">
              {loading ? '-' : userRank ? `${userRank}. Sıra` : '-'}
            </div>
            <span className="stat-sub">
              {leaderboard.length > 0 ? `${leaderboard.length} kişi arasında` : 'Sıralama'}
            </span>
          </div>
        </div>
      </section>

      {/* 3. DİĞER ANA EKRANLARA HIZLI GEÇİŞ KARTLARI */}
      <section className="home-action-cards">
        <div className="action-card matches" onClick={() => onNavigate('matches')}>
          <div className="action-card-left">
            <div className="action-card-icon">
              <Calendar size={24} />
            </div>
            <div>
              <div className="action-card-title">Tahminlerim</div>
              <div className="action-card-desc">
                Yeni maçlara tahmin yapın veya kayıtlı tahminlerinizi düzenleyin
              </div>
            </div>
          </div>
          <ArrowRight size={20} className="action-card-arrow" />
        </div>

        <div className="action-card leaderboard" onClick={() => onNavigate('leaderboard')}>
          <div className="action-card-left">
            <div className="action-card-icon">
              <Trophy size={24} />
            </div>
            <div>
              <div className="action-card-title">Lider Tablosu</div>
              <div className="action-card-desc">
                Tüm katılımcıların güncel puanlarını ve podyumu görüntüleyin
              </div>
            </div>
          </div>
          <ArrowRight size={20} className="action-card-arrow" />
        </div>
      </section>

      {/* 4. PUANLAMA SİSTEMİ VE LİG KURALLARI BÖLÜMÜ */}
      <section className="home-rules-section" id="kurallar">
        <div className="section-header">
          <div className="section-title-wrap">
            <BookOpen size={22} className="section-title-icon text-cyan" />
            <h2 className="section-title">Puan Sistemi & Lig Kuralları</h2>
          </div>
          <span className="section-subtitle">UEFA Champions League 2026 Tahmin Kuralları</span>
        </div>

        {/* ÖNEMLİ ZAMANLAMA KURALI BANNERI */}
        <div className="rules-important-banner">
          <div className="rules-important-icon-box">
            <AlertCircle size={24} />
          </div>
          <div className="rules-important-body">
            <span className="rules-important-label">ÖNEMLİ KURALLAR:</span>
            <p className="rules-important-quote">
              "Tahminlerinizi maç başlamadan yapın; maç başladıktan sonra tahmin girişi veya değişikliği yapılamaz."
            </p>
          </div>
        </div>

        {/* 4 KADEMELİ PUAN SİSTEMİ KARTLARI */}
        <div className="rules-grid">
          {/* Kural 1: Tam Skor Bildimi (4 Puan) */}
          <div className="rule-card tier-4">
            <div className="rule-card-top">
              <div className="rule-points-pill gold">
                <Award size={16} />
                <span>+4 PUAN</span>
              </div>
              <span className="rule-tier-name">Tam İsabet</span>
            </div>
            <h3 className="rule-title">Tam Skor Bildimi</h3>
            <p className="rule-desc">
              Maçın skoru tam olarak bilinirse <strong>4 puan</strong> verilir.
            </p>
            <div className="rule-example">
              <span className="example-tag">Örnek:</span>
              <span className="example-text">Gerçek Skor: <strong>3 - 1</strong> ➔ Tahmininiz: <strong>3 - 1</strong> (+4 Puan)</span>
            </div>
          </div>

          {/* Kural 2: Skor / Gol Farkı Bildimi (3 Puan) */}
          <div className="rule-card tier-3">
            <div className="rule-card-top">
              <div className="rule-points-pill purple">
                <Target size={16} />
                <span>+3 PUAN</span>
              </div>
              <span className="rule-tier-name">Gol Farkı İsabeti</span>
            </div>
            <h3 className="rule-title">Skor / Gol Farkı Bildimi</h3>
            <p className="rule-desc">
              Maçın skoru tam bilinmese bile gol farkı doğru bilinirse (Örn: Gerçek maç 4-2 bitti, tahmin 2-0 - farklar tutuyor) <strong>3 puan</strong> verilir.
            </p>
            <div className="rule-example">
              <span className="example-tag">Örnek:</span>
              <span className="example-text">Gerçek: <strong>4 - 2</strong> (+2 Fark) ➔ Tahmin: <strong>2 - 0</strong> (+2 Fark) (+3 Puan)</span>
            </div>
          </div>

          {/* Kural 3: Maçın Kazananı / Kaybedeni (Sonuç) (2 Puan) */}
          <div className="rule-card tier-2">
            <div className="rule-card-top">
              <div className="rule-points-pill cyan">
                <Sparkles size={16} />
                <span>+2 PUAN</span>
              </div>
              <span className="rule-tier-name">Doğru Sonuç</span>
            </div>
            <h3 className="rule-title">Maçın Kazananı / Kaybedeni (Sonuç)</h3>
            <p className="rule-desc">
              Sadece maçın kazananı veya beraberlik durumu doğru tahmin edildiyse <strong>2 puan</strong> verilir.
            </p>
            <div className="rule-example">
              <span className="example-tag">Örnek:</span>
              <span className="example-text">Gerçek: <strong>2 - 0</strong> (Ev Sahibi) ➔ Tahmin: <strong>3 - 2</strong> (+2 Puan)</span>
            </div>
          </div>

          {/* Kural 4: Yanlış Tahmin veya Tahmin Yapılmamışsa (0 Puan) */}
          <div className="rule-card tier-0">
            <div className="rule-card-top">
              <div className="rule-points-pill muted">
                <HelpCircle size={16} />
                <span>0 PUAN</span>
              </div>
              <span className="rule-tier-name">Puan Yok</span>
            </div>
            <h3 className="rule-title">Yanlış Tahmin veya Boş</h3>
            <p className="rule-desc">
              Yanlış tahmin veya tahmin yapılmamışsa <strong>0 puan</strong> verilir.
            </p>
            <div className="rule-example">
              <span className="example-tag">Örnek:</span>
              <span className="example-text">Gerçek: <strong>1 - 1</strong> (Beraberlik) ➔ Tahmin: <strong>2 - 0</strong> (0 Puan)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. YAKLAŞAN MAÇLAR ÖNİZLEMESİ (OPSİYONEL HIZLI BAKIŞ) */}
      {upcomingMatches.length > 0 && (
        <section className="home-matches-preview-card">
          <div className="preview-header">
            <div className="preview-title">
              <Clock size={16} className="text-neon" />
              <span>Sıradaki Maçlar</span>
            </div>
            <button
              type="button"
              className="btn-view-all-matches"
              onClick={() => onNavigate('matches')}
            >
              <span>Tümünü Gör</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="preview-matches-list">
            {upcomingMatches.map((match) => (
              <div key={match.id} className="preview-match-item">
                <div className="preview-teams">
                  <span>{match.home_team}</span>
                  <span className="preview-vs">vs</span>
                  <span>{match.away_team}</span>
                </div>
                <span className="preview-date">
                  {new Date(match.match_date).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

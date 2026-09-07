import React, { useState, useEffect } from 'react';
import { Match } from '../types';
import { getMatches } from '../services/api';
import { AdminMatchCard } from '../components/AdminMatchCard';
import { NewMatchModal } from '../components/NewMatchModal';
import {
  Shield,
  Plus,
  RefreshCw,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  Trophy,
  CalendarDays,
  X
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtreler
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'finished'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMatchesList = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const data = await getMatches();
      setMatches(data);
    } catch (err) {
      console.error('Admin maçları yüklenemedi:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMatchesList();
  }, []);

  // İstatistikler
  const totalMatches = matches.length;
  const finishedMatches = matches.filter((m) => m.status === 'finished');
  const pendingMatches = matches.filter((m) => m.status === 'pending');

  // Filtrelenmiş maçlar
  const filteredMatches = matches.filter((m) => {
    // 1. Hafta filtresi
    if (selectedWeek !== 'all' && m.matchweek !== selectedWeek) {
      return false;
    }

    // 2. Durum filtresi
    if (statusFilter === 'pending' && m.status !== 'pending') {
      return false;
    }
    if (statusFilter === 'finished' && m.status !== 'finished') {
      return false;
    }

    // 3. Arama filtresi
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTeams = `${m.home_team} ${m.away_team} ${m.stadium || ''}`.toLowerCase();
      if (!matchTeams.includes(q)) return false;
    }

    return true;
  });

  // Hafta gruplandırması için 8 hafta listesi
  const matchweeksList = [1, 2, 3, 4, 5, 6, 7, 8];
  const groupedByWeek: Record<number, Match[]> = {};
  matchweeksList.forEach((w) => {
    groupedByWeek[w] = [];
  });

  filteredMatches.forEach((m) => {
    const w = m.matchweek || 1;
    if (!groupedByWeek[w]) groupedByWeek[w] = [];
    groupedByWeek[w].push(m);
  });

  return (
    <div className="admin-dashboard-layout">
      {/* 1. ÜST BAŞLIK VE KONTROL MERKEZİ */}
      <header className="admin-header-row">
        <div className="admin-header-text">
          <div className="admin-header-pill">
            <Shield size={14} />
            <span>Yönetici Paneli</span>
          </div>
          <h1 className="admin-main-heading">Lig Aşaması Maç & Skor Kontrolü</h1>
          <p className="admin-sub-text">
            Gerçek maç skorlarını girin; sistem tüm katılımcıların puanlarını otomatik hesaplar.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="btn-create-match"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            <span>Yeni Maç Ekle</span>
          </button>

          <button
            type="button"
            className={`btn-icon-refresh ${refreshing ? 'spinning' : ''}`}
            onClick={() => fetchMatchesList(true)}
            title="Listeyi Yenile"
            aria-label="Yenile"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

      {/* 2. MODERN, RENKLİ VE ŞIK KPI ÖZET KARTLARI */}
      <section className="admin-kpi-summary-grid">
        {/* Toplam Maç (Mor/İndigo) */}
        <div className="kpi-card card-purple">
          <div className="kpi-icon-orbit">
            <Trophy size={22} />
          </div>
          <div className="kpi-details">
            <span className="kpi-title">Toplam Maç</span>
            <div className="kpi-figure">{loading ? '...' : totalMatches}</div>
            <span className="kpi-hint">Lig Aşaması Fikstürü</span>
          </div>
        </div>

        {/* Oynanan / Tamamlanan Maçlar (Zümrüt Yeşil) */}
        <div className="kpi-card card-emerald">
          <div className="kpi-icon-orbit">
            <CheckCircle2 size={22} />
          </div>
          <div className="kpi-details">
            <span className="kpi-title">Oynanan Maçlar</span>
            <div className="kpi-figure text-emerald">{loading ? '...' : finishedMatches.length}</div>
            <span className="kpi-hint">Skoru Girildi & Puanlandı</span>
          </div>
        </div>

        {/* Skor Bekleyen Maçlar (Altın/Amber) */}
        <div className="kpi-card card-amber">
          <div className="kpi-icon-orbit">
            <Clock size={22} />
          </div>
          <div className="kpi-details">
            <span className="kpi-title">Skor Bekleyen</span>
            <div className="kpi-figure text-amber">{loading ? '...' : pendingMatches.length}</div>
            <span className="kpi-hint">Giriş Yapılması Gereken</span>
          </div>
        </div>

        {/* Otomatik Puanlama Sistemi (Elektrik Camgöbeği) */}
        <div className="kpi-card card-cyan">
          <div className="kpi-icon-orbit">
            <Sparkles size={22} />
          </div>
          <div className="kpi-details">
            <span className="kpi-title">Puanlama Motoru</span>
            <div className="kpi-figure text-cyan">4 - 3 - 2 - 0</div>
            <span className="kpi-hint">Otomatik Puan Dağıtımı Aktif</span>
          </div>
        </div>
      </section>

      {/* 3. HAFTA SEÇİMLERİ (ÜSTTE YATAY KAYDIRILABİLİR ŞIK SEKME BUTONLARI) */}
      <section className="admin-filter-control-panel">
        <div className="weeks-horizontal-scroller">
          <button
            type="button"
            className={`btn-week-tab ${selectedWeek === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedWeek('all')}
          >
            <Layers size={14} />
            <span>Tüm Haftalar</span>
            <span className="week-count-badge">{matches.length}</span>
          </button>

          {matchweeksList.map((wNum) => {
            const count = matches.filter((m) => m.matchweek === wNum).length;
            return (
              <button
                key={wNum}
                type="button"
                className={`btn-week-tab ${selectedWeek === wNum ? 'active' : ''}`}
                onClick={() => setSelectedWeek(wNum)}
              >
                <CalendarDays size={14} />
                <span>{wNum}. Hafta</span>
                {count > 0 && <span className="week-count-badge">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Alt Filtre Barı: Durumlar ve Arama */}
        <div className="admin-subfilter-row">
          <div className="status-pill-switcher">
            <button
              type="button"
              className={`pill-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              <span>Tümü ({matches.length})</span>
            </button>
            <button
              type="button"
              className={`pill-btn ${statusFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setStatusFilter('pending')}
            >
              <span>Skor Bekleyenler ({pendingMatches.length})</span>
            </button>
            <button
              type="button"
              className={`pill-btn ${statusFilter === 'finished' ? 'active' : ''}`}
              onClick={() => setStatusFilter('finished')}
            >
              <span>Sonuçlananlar ({finishedMatches.length})</span>
            </button>
          </div>

          <div className="admin-search-wrap">
            <Search size={14} className="search-ico" />
            <input
              type="text"
              placeholder="Takım veya stadyum ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-field"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                title="Aramayı Temizle"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 4. MAÇ LİSTESİ (TEMİZ KARTLAR HALİNDE) */}
      <section className="admin-matches-stage">
        {loading ? (
          <div className="admin-loading-state">
            <div className="loading-orbit-spinner"></div>
            <p>Maç fikstürü yükleniyor...</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="admin-empty-card">
            <AlertCircle size={40} className="empty-svg" />
            <h3>Seçilen kriterlere uygun maç bulunamadı</h3>
            <p>Filtre seçimini değiştirebilir veya sağ üstten yeni maç ekleyebilirsiniz.</p>
          </div>
        ) : selectedWeek === 'all' && !searchQuery.trim() ? (
          /* Tüm Haftalar Seçili İse: Hafta Gruplu Görünüm */
          <div className="week-grouped-grid">
            {matchweeksList.map((wNum) => {
              const weekMatches = groupedByWeek[wNum];
              if (!weekMatches || weekMatches.length === 0) return null;

              return (
                <div key={wNum} className="week-cluster">
                  <div className="cluster-header">
                    <div className="cluster-title">
                      <Trophy size={16} className="cluster-trophy-icon" />
                      <h2>{wNum}. Hafta Karşılaşmaları</h2>
                    </div>
                    <span className="cluster-counter">{weekMatches.length} Maç</span>
                  </div>

                  <div className="cluster-cards-list">
                    {weekMatches.map((m) => (
                      <AdminMatchCard
                        key={m.id}
                        match={m}
                        onRefresh={() => fetchMatchesList(true)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Belirli Bir Hafta Veya Arama Sonuçları */
          <div className="single-week-cards-list">
            {filteredMatches.map((m) => (
              <AdminMatchCard
                key={m.id}
                match={m}
                onRefresh={() => fetchMatchesList(true)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Yeni Maç Ekleme Modalı */}
      <NewMatchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchMatchesList(true)}
      />
    </div>
  );
};

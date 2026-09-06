import React, { useState, useEffect } from 'react';
import { Match } from '../types';
import { getMatches } from '../services/api';
import { AdminMatchCard } from '../components/AdminMatchCard';
import { NewMatchModal } from '../components/NewMatchModal';
import { Shield, Plus, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'finished'>('pending');

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

  const pendingMatches = matches.filter((m) => m.status === 'pending');
  const finishedMatches = matches.filter((m) => m.status === 'finished');

  return (
    <div className="admin-page">
      {/* Top Header */}
      <div className="admin-hero">
        <div className="admin-hero-info">
          <div className="admin-badge">
            <Shield size={16} />
            <span>Yönetici Kontrol Merkezi</span>
          </div>
          <h1 className="admin-title">Maç Yönetimi ve Skor Dağıtımı</h1>
          <p className="admin-desc">
            Burada biten maçların gerçek skorlarını girebilirsiniz. Skor kaydedildiğinde sistem yapılan tüm tahminleri
            otomatik kontrol eder, tam skora <strong>3 puan</strong>, doğru sonuca <strong>1 puan</strong> verir ve
            katılımcıların toplam puanlarını anında günceller.
          </p>
        </div>

        <div className="admin-hero-actions">
          <button
            className="btn-new-match"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={18} />
            <span>Yeni Maç Ekle</span>
          </button>

          <button
            className={`btn-refresh-admin ${refreshing ? 'spinning' : ''}`}
            onClick={() => fetchMatchesList(true)}
            title="Yenile"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Info Highlight Box */}
      <div className="scoring-automation-card">
        <Sparkles size={20} className="text-warning" />
        <div className="scoring-auto-text">
          <strong>Otomatik Puanlama Aktif:</strong> Bir maçın gerçek skorunu girip "Sonucu Gir & Puanları Dağıt"
          butonuna bastığınızda veritabanındaki tetikleyici (Trigger) tüm kullanıcı tahminlerini atomik olarak puanlar.
        </div>
      </div>

      {/* Tabs for Pending vs Finished */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <span>Sonuç Bekleyen Maçlar</span>
          <span className="tab-count-pill">{pendingMatches.length}</span>
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'finished' ? 'active' : ''}`}
          onClick={() => setActiveTab('finished')}
        >
          <span>Tamamlanmış Maçlar</span>
          <span className="tab-count-pill">{finishedMatches.length}</span>
        </button>
      </div>

      {/* Matches Grid */}
      {loading ? (
        <div className="admin-loading">
          <div className="mini-spinner"></div>
          <span>Maçlar yükleniyor...</span>
        </div>
      ) : activeTab === 'pending' ? (
        pendingMatches.length === 0 ? (
          <div className="admin-empty-state">
            <AlertCircle size={40} className="empty-icon" />
            <p>Sonuç girilmeyi bekleyen maç bulunmuyor.</p>
            <button className="btn-secondary" onClick={() => setIsModalOpen(true)}>
              Hemen Yeni Maç Ekle
            </button>
          </div>
        ) : (
          <div className="admin-matches-grid">
            {pendingMatches.map((m) => (
              <AdminMatchCard key={m.id} match={m} onRefresh={() => fetchMatchesList(true)} />
            ))}
          </div>
        )
      ) : finishedMatches.length === 0 ? (
        <div className="admin-empty-state">
          <AlertCircle size={40} className="empty-icon" />
          <p>Henüz tamamlanmış maç bulunmuyor.</p>
        </div>
      ) : (
        <div className="admin-matches-grid">
          {finishedMatches.map((m) => (
            <AdminMatchCard key={m.id} match={m} onRefresh={() => fetchMatchesList(true)} />
          ))}
        </div>
      )}

      {/* New Match Modal */}
      <NewMatchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchMatchesList(true)}
      />
    </div>
  );
};

# 🏆 UCL Tahmin Ligi (Champions League Predictor)

Arkadaş grubu arasında **UEFA Şampiyonlar Ligi** maçlarının skorlarını tahmin etmek, puanları toplamak ve tatlı bir rekabet ortamı yaratmak amacıyla geliştirilmiş samimi bir hobi projesidir.

---

## 📌 Proje Hakkında

Bu uygulama, arkadaş grubumuzla birlikte maç günlerinin heyecanını artırmak için tasarlandı. Katılımcılar her hafta Şampiyonlar Ligi maçlarının skorlarını tahmin eder, maçlar bittiğinde sistem otomatik olarak puanları hesaplar ve anlık liderlik tablosunu günceller.

---

## 🏗️ Yüksek Seviye Mimari (Architecture)

Uygulama, bakım maliyeti minimum ve performansı maksimum olacak modern bir **Sunucusuz (Serverless)** mimari üzerine kuruludur:

```
┌─────────────────────────────────────────────────────────┐
│              Kullanıcı Arayüzü (Frontend)               │
│   React 18 + TypeScript + Vite + Mobile-First CSS       │
└────────────────────────────┬────────────────────────────┘
                             │
                             │ Supabase JS Client (REST & Auth)
                             ▼
┌─────────────────────────────────────────────────────────┐
│            Backend & Servisler (Supabase)               │
│  - PostgreSQL: İlişkisel veritabanı                     │
│  - Auth: Kullanıcı kimlik doğrulama & oturum yönetimi   │
│  - Triggers & Functions: Otomatik 4-3-2-0 puanlama      │
│  - Row Level Security (RLS): Kurşungeçirmez veri güvenliği│
└────────────────────────────┬────────────────────────────┘
                             │
                             │ Sürekli Dağıtım (CI/CD)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                  Barındırma (Hosting)                   │
│         Vercel (Edge Network & SPA Routing)             │
└─────────────────────────────────────────────────────────┘
```

### Kullanılan Teknolojiler:
- **Frontend**: `React 18`, `TypeScript`, `Vite`, `Lucide React`
- **Tasarım / Stil**: Özel Vanilla CSS (UCL temalı renk paleti, Glassmorphism, modern tipografi ve mobil uyumlu BottomNav navigasyonu)
- **Backend / Veritabanı**: `Supabase` (PostgreSQL, Row Level Security, PL/pgSQL fonksiyon ve tetikleyicileri)
- **Dağıtım (Deployment)**: `Vercel` (`vercel.json` SPA yönlendirme desteğiyle)

---

## ⚽ Puanlama Kuralları (4 - 3 - 2 - 0 Sistemi)

| Puan | Kriter | Açıklama |
| :---: | :--- | :--- |
| **4 Puan** | **Tam Skor** | Maçın skorunu birebir doğru tahmin etme (Örn: Tahmin `2-1`, Gerçek `2-1`) |
| **3 Puan** | **Gol Farkı** | Skor tam tutmasa bile gol farkını doğru bilme (Örn: Tahmin `2-0`, Gerçek `4-2`) |
| **2 Puan** | **Sonuç / Kazanan** | Sadece kazananı veya beraberliği doğru tahmin etme |
| **0 Puan** | **Yanlış Tahmin** | Sonucun yanlış bilinmesi veya tahmin yapılmaması |

> ⏱️ **Kural**: Tahminler yalnızca maçın başlama saatine kadar girilebilir veya güncellenebilir. Maç başladığında tahminler kilitlenir.

---

## ✨ Öne Çıkan Özellikler

- 📅 **144 UCL Maçı**: 2026/27 sezonunun 8 haftalık lig aşaması fikstürü hazır tanımlıdır.
- 📱 **Mobil Öncelikli Deneyim**: Masaüstünde ve mobilde uygulama (PWA) hissi veren ergonomik alt menü (BottomNav).
- ⚡ **Otomatik Skor & Puanlama**: Yönetici maç skorunu girdiğinde saniyeler içinde tüm kullanıcıların puanları hesaplanır.
- 📊 **Canlı Liderlik Tablosu**: Toplam puanlar, doğru tahmin istatistikleri ve anlık sıralamalar.
- 🛡️ **Yönetici Paneli**: Lig yöneticisine özel maç ekleme, silme ve skor güncelleme ekranı.

---

## 🚀 Hızlı Başlangıç

### 1. Depoyu Klonlayın ve Bağımlılıkları Yükleyin:
```bash
git clone https://github.com/helencelik/ucl-tahmin.git
cd ucl-tahmin
npm install
```

### 2. Ortam Değişkenlerini Ayarlayın:
Kök dizinde bir `.env` dosyası oluşturun (`.env.example` dosyasını referans alabilirsiniz):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Veritabanını Hazırlayın:
Supabase Dashboard -> **SQL Editor** bölümünden sırasıyla şu iki dosyayı çalıştırın:
1. `supabase_schema.sql` *(Tüm tabloları, trigger'ları ve güvenlik kurallarını kurar)*
2. `insert_ucl_2026_fixtures.sql` *(144 adet lig maçı fikstürünü yükler)*

### 4. Uygulamayı Başlatın:
```bash
npm run dev
```

---

## 📄 Lisans

Bu proje kişisel eğlence ve hobi amaçlı hazırlanmıştır. Dilediğiniz gibi çatallayabilir (fork) ve arkadaşlarınızla kendi liginizi kurabilirsiniz!

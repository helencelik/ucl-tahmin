const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sqakhwqvvwxjutttsaxf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxYWtod3F2dnd4anV0dHRzYXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2OTI5MzIsImV4cCI6MjEwNDI2ODkzMn0.Px-ReU_rvBCF7eJZcRJFfhrcja4VpEWejmubaCYPkO8';

async function setup() {
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  console.log('Admin olarak giriş yapılıyor...');
  const { data: auth, error: aErr } = await sb.auth.signInWithPassword({
    email: 'admin@gmail.com',
    password: 'admin'
  });
  if (aErr) {
    console.error('Admin giriş hatası:', aErr.message);
    process.exit(1);
  }
  console.log('Giriş başarılı:', auth.user.email);

  // 1. Galatasaray - Fenerbahçe maçını ve tüm eski test tahminlerini temizle
  console.log('1. Galatasaray - Fenerbahçe maçı ve tahminler siliniyor...');
  await sb.from('predictions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await sb.from('matches').delete().eq('id', '815bf507-5baf-4c61-a1dd-3c3f5fc945ad');
  await sb.from('matches').delete().or('home_team.eq.Galatasaray,away_team.eq.Galatasaray').eq('match_date', '2026-09-07T18:00:00+00:00');
  console.log('✅ Galatasaray - Fenerbahçe maçı ve tahminler temizlendi.');

  // 2. Tüm kullanıcıların puanlarını sıfırla
  console.log('2. Kullanıcı puanları sıfırlanıyor...');
  await sb.from('users').update({ total_points: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('✅ Kullanıcı puanları 0 olarak sıfırlandı.');

  // 3. Bugün için 4 adet yeni canlı test maçı ekle (Bugün akşam 21:00 - 21:45)
  console.log('3. 4 Yeni Canlı Test Maçı ekleniyor...');
  const testMatches = [
    {
      id: 'd0002026-0000-0000-0001-000000000001',
      home_team: 'Arsenal',
      away_team: 'Chelsea',
      home_team_logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9825.png',
      away_team_logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8455.png',
      match_date: '2026-09-07T18:00:00.000Z', // 21:00 TSİ
      status: 'pending',
      real_home_score: null,
      real_away_score: null
    },
    {
      id: 'd0002026-0000-0000-0001-000000000002',
      home_team: 'Barcelona',
      away_team: 'Paris Saint-Germain',
      home_team_logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8634.png',
      away_team_logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9847.png',
      match_date: '2026-09-07T18:15:00.000Z', // 21:15 TSİ
      status: 'pending',
      real_home_score: null,
      real_away_score: null
    },
    {
      id: 'd0002026-0000-0000-0001-000000000003',
      home_team: 'Real Madrid',
      away_team: 'Manchester City',
      home_team_logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8633.png',
      away_team_logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8456.png',
      match_date: '2026-09-07T18:30:00.000Z', // 21:30 TSİ
      status: 'pending',
      real_home_score: null,
      real_away_score: null
    },
    {
      id: 'd0002026-0000-0000-0001-000000000004',
      home_team: 'Liverpool',
      away_team: 'Bayern Munich',
      home_team_logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8650.png',
      away_team_logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9823.png',
      match_date: '2026-09-07T18:45:00.000Z', // 21:45 TSİ
      status: 'pending',
      real_home_score: null,
      real_away_score: null
    }
  ];

  const { data: inserted, error: insErr } = await sb.from('matches').upsert(testMatches, { onConflict: 'id' }).select();
  if (insErr) {
    console.error('Test maçları eklenirken hata:', insErr.message);
  } else {
    console.log(`✅ ${inserted.length} adet canlı test maçı başarıyla eklendi:`);
    inserted.forEach((m, idx) => {
      console.log(`  ${idx + 1}. ${m.home_team} vs ${m.away_team} (Durum: ${m.status}, Tarih: ${m.match_date})`);
    });
  }

  // 4. Doğrulama
  const { data: currentUsers } = await sb.from('users').select('name, email, total_points').order('total_points', { ascending: false });
  console.log('Kullanıcıların güncel durumu:', currentUsers.map(u => `${u.name} (${u.email}): ${u.total_points} puan`));
}

setup().catch(console.error);

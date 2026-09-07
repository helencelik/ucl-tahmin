const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://sqakhwqvvwxjutttsaxf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxYWtod3F2dnd4anV0dHRzYXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2OTI5MzIsImV4cCI6MjEwNDI2ODkzMn0.Px-ReU_rvBCF7eJZcRJFfhrcja4VpEWejmubaCYPkO8';

async function seed() {
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

  // 1. Test Maçını Oluştur veya Güncelle (Bugün 21:00 - Pending)
  // 2026-09-07T21:00:00+03:00 = 2026-09-07T18:00:00.000Z
  const testMatch = {
    id: '815bf507-5baf-4c61-a1dd-3c3f5fc945ad',
    home_team: 'Galatasaray',
    away_team: 'Fenerbahçe',
    home_team_logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8637.png',
    away_team_logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8695.png',
    match_date: '2026-09-07T18:00:00.000Z',
    status: 'pending',
    real_home_score: null,
    real_away_score: null
  };

  const { data: tmData, error: tmErr } = await sb.from('matches').upsert([testMatch], { onConflict: 'id' }).select();
  if (tmErr) {
    console.error('Test maçı eklenirken hata:', tmErr.message);
  } else {
    console.log('✅ Test Maçı eklendi/güncellendi:', tmData[0].home_team, 'vs', tmData[0].away_team, 'Tarih:', tmData[0].match_date, 'Durum:', tmData[0].status);
  }

  // 2. fixtures_2026_27.json dosyasını oku ve 144 UCL maçını hazırla
  const fixturesPath = path.join(__dirname, '..', 'fixtures_2026_27.json');
  if (fs.existsSync(fixturesPath)) {
    const rawData = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));
    const TEAM_LOGOS = {
      'AEK Athens': 'https://images.fotmob.com/image_resources/logo/teamlogo/8563.png',
      'Arsenal': 'https://images.fotmob.com/image_resources/logo/teamlogo/9825.png',
      'Aston Villa': 'https://images.fotmob.com/image_resources/logo/teamlogo/10252.png',
      'Atlético Madrid': 'https://images.fotmob.com/image_resources/logo/teamlogo/9906.png',
      'Barcelona': 'https://images.fotmob.com/image_resources/logo/teamlogo/8634.png',
      'Bayern Munich': 'https://images.fotmob.com/image_resources/logo/teamlogo/9823.png',
      'Bodø/Glimt': 'https://images.fotmob.com/image_resources/logo/teamlogo/8411.png',
      'Borussia Dortmund': 'https://images.fotmob.com/image_resources/logo/teamlogo/9789.png',
      'Club Brugge': 'https://images.fotmob.com/image_resources/logo/teamlogo/8342.png',
      'Como': 'https://images.fotmob.com/image_resources/logo/teamlogo/8534.png',
      'FC Porto': 'https://images.fotmob.com/image_resources/logo/teamlogo/9773.png',
      'Fenerbahçe': 'https://images.fotmob.com/image_resources/logo/teamlogo/8695.png',
      'Feyenoord': 'https://images.fotmob.com/image_resources/logo/teamlogo/10235.png',
      'Galatasaray': 'https://images.fotmob.com/image_resources/logo/teamlogo/8637.png',
      'Inter': 'https://images.fotmob.com/image_resources/logo/teamlogo/8636.png',
      'LASK Linz': 'https://images.fotmob.com/image_resources/logo/teamlogo/8254.png',
      'Lens': 'https://images.fotmob.com/image_resources/logo/teamlogo/8586.png',
      'Lille': 'https://images.fotmob.com/image_resources/logo/teamlogo/8639.png',
      'Liverpool': 'https://images.fotmob.com/image_resources/logo/teamlogo/8650.png',
      'Manchester City': 'https://images.fotmob.com/image_resources/logo/teamlogo/8456.png',
      'Manchester United': 'https://images.fotmob.com/image_resources/logo/teamlogo/10260.png',
      'Napoli': 'https://images.fotmob.com/image_resources/logo/teamlogo/9875.png',
      'PSV': 'https://images.fotmob.com/image_resources/logo/teamlogo/8640.png',
      'Paris Saint-Germain': 'https://images.fotmob.com/image_resources/logo/teamlogo/9847.png',
      'RB Leipzig': 'https://images.fotmob.com/image_resources/logo/teamlogo/178475.png',
      'Real Betis': 'https://images.fotmob.com/image_resources/logo/teamlogo/8603.png',
      'Real Madrid': 'https://images.fotmob.com/image_resources/logo/teamlogo/8633.png',
      'Roma': 'https://images.fotmob.com/image_resources/logo/teamlogo/8686.png',
      'Sabah': 'https://images.fotmob.com/image_resources/logo/teamlogo/937076.png',
      'Shakhtar Donetsk': 'https://images.fotmob.com/image_resources/logo/teamlogo/10145.png',
      'Slavia Prague': 'https://images.fotmob.com/image_resources/logo/teamlogo/8497.png',
      'Slovan Bratislava': 'https://images.fotmob.com/image_resources/logo/teamlogo/8575.png',
      'Sporting CP': 'https://images.fotmob.com/image_resources/logo/teamlogo/9768.png',
      'Stuttgart': 'https://images.fotmob.com/image_resources/logo/teamlogo/10269.png',
      'Viking': 'https://images.fotmob.com/image_resources/logo/teamlogo/8414.png',
      'Villarreal': 'https://images.fotmob.com/image_resources/logo/teamlogo/10205.png'
    };

    const matchesToInsert = [];
    for (const day of rawData.matchdays) {
      const weekNum = day.matchday;
      let matchIdx = 1;
      for (const m of day.matches) {
        const id = `c0002026-0000-0000-${String(weekNum).padStart(4, '0')}-${String(matchIdx).padStart(12, '0')}`;
        // Vienna saati (CEST = UTC+2) -> Istanbul saati (UTC+3)
        // 18:45 Vienna = 16:45 UTC = 19:45 Istanbul
        // 21:00 Vienna = 19:00 UTC = 22:00 Istanbul
        const utcHour = m.time === '18:45' ? '16:45:00.000Z' : '19:00:00.000Z';
        const utcDateStr = `${m.date}T${utcHour}`;

        matchesToInsert.push({
          id,
          home_team: m.home,
          away_team: m.away,
          home_team_logo: TEAM_LOGOS[m.home] || '',
          away_team_logo: TEAM_LOGOS[m.away] || '',
          match_date: utcDateStr,
          status: 'pending',
          real_home_score: null,
          real_away_score: null
        });
        matchIdx++;
      }
    }

    console.log(`144 UCL Maçı Supabase'e yükleniyor (toplam: ${matchesToInsert.length})...`);
    const chunkSize = 25;
    let uploaded = 0;
    for (let i = 0; i < matchesToInsert.length; i += chunkSize) {
      const chunk = matchesToInsert.slice(i, i + chunkSize);
      const { error: chunkErr } = await sb.from('matches').upsert(chunk, { onConflict: 'id' });
      if (chunkErr) {
        console.error(`Grup ${i / chunkSize + 1} yükleme hatası:`, chunkErr.message);
      } else {
        uploaded += chunk.length;
      }
    }
    console.log(`✅ ${uploaded} adet UCL maçı Supabase veritabanına başarıyla yüklendi!`);
  }

  // 3. Test tahminini ve kullanıcı puanlarını temizle / sıfırla
  console.log('Eski test tahminleri temizleniyor...');
  await sb.from('predictions').delete().eq('match_id', testMatch.id);
  // Kullanıcıların puanlarını 0 olarak sıfırla
  await sb.from('users').update({ total_points: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('✅ Puanlar ve tahminler sıfırlandı, canlı teste hazır!');
}

seed().catch(console.error);

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 36 UCL Takımı Logo Eşleştirmesi (Fotmob CDN)
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

// Vienna saatini Istanbul saatine (+03:00) dönüştürücü
function viennaToIstanbul(dateStr, timeStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [h, min] = timeStr.split(':').map(Number);

  const testDate = new Date(Date.UTC(y, m - 1, d, h, min));
  const viennaFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Vienna',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });

  const parts = viennaFormatter.formatToParts(testDate);
  const vYear = parseInt(parts.find(p => p.type === 'year').value);
  const vMonth = parseInt(parts.find(p => p.type === 'month').value);
  const vDay = parseInt(parts.find(p => p.type === 'day').value);
  const vHour = parseInt(parts.find(p => p.type === 'hour').value);
  const vMin = parseInt(parts.find(p => p.type === 'minute').value);

  const viennaAsUtc = Date.UTC(vYear, vMonth - 1, vDay, vHour, vMin);
  const offsetMs = viennaAsUtc - testDate.getTime();
  const targetUtcMs = Date.UTC(y, m - 1, d, h, min) - offsetMs;

  // Istanbul UTC+3
  const istDate = new Date(targetUtcMs + 3 * 60 * 60 * 1000);
  const istYear = istDate.getUTCFullYear();
  const istMonth = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const istDay = String(istDate.getUTCDate()).padStart(2, '0');
  const istHour = String(istDate.getUTCHours()).padStart(2, '0');
  const istMinutes = String(istDate.getUTCMinutes()).padStart(2, '0');

  const formattedPg = `${istYear}-${istMonth}-${istDay} ${istHour}:${istMinutes}:00+03`;
  const formattedIso = `${istYear}-${istMonth}-${istDay}T${istHour}:${istMinutes}:00+03:00`;
  const utcIso = new Date(targetUtcMs).toISOString();

  return {
    pgTimestamp: formattedPg,
    isoIstanbul: formattedIso,
    utcIso: utcIso
  };
}

async function run() {
  const jsonPath = path.join(__dirname, '..', 'fixtures_2026_27.json');
  const raw = fs.readFileSync(jsonPath, 'utf8');
  const fixtureData = JSON.parse(raw);

  const allMatches = [];
  let matchIndex = 1;

  for (const md of fixtureData.matchdays) {
    const weekNum = md.matchday;
    for (let i = 0; i < md.matches.length; i++) {
      const m = md.matches[i];
      // Geçerli UUID formatı (8-4-4-4-12 hex formatı): c0002026-0000-0000-000w-00000000000m
      const matchId = `c0002026-0000-0000-${String(weekNum).padStart(4, '0')}-${String(i + 1).padStart(12, '0')}`;
      const tzRes = viennaToIstanbul(m.date, m.time);
      const homeLogo = TEAM_LOGOS[m.home] || '';
      const awayLogo = TEAM_LOGOS[m.away] || '';

      allMatches.push({
        id: matchId,
        home_team: m.home,
        away_team: m.away,
        home_team_logo: homeLogo,
        away_team_logo: awayLogo,
        match_date: tzRes.isoIstanbul,
        pg_date: tzRes.pgTimestamp,
        utc_date: tzRes.utcIso,
        status: 'pending',
        real_home_score: null,
        real_away_score: null,
        stage: 'league',
        matchweek: weekNum,
        stadium: m.stadium
      });
      matchIndex++;
    }
  }

  console.log(`Parsed ${allMatches.length} matches from 2026/27 UCL fixtures.`);

  // 1. SQL BETİĞİNİ OLUŞTUR (insert_ucl_2026_fixtures.sql)
  let sqlContent = `-- ==============================================================================
-- 2026/27 UEFA CHAMPIONS LEAGUE LEAGUE PHASE FIXTURES (144 MAÇ)
-- Zaman Dilimi: Europe/Istanbul (+03:00)
-- ==============================================================================

-- 1. Tablo şemasını güvenceye al (stage, matchweek, stadium sütunları)
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'league';
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS matchweek INTEGER DEFAULT 1;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS stadium TEXT;

-- 2. Eski/Örnek maçları ve tahminlerini temizle
DELETE FROM public.predictions;
DELETE FROM public.matches;

-- 3. 144 Lig Aşaması Maçını Ekle (8 Hafta)
INSERT INTO public.matches (
    id, home_team, away_team, home_team_logo, away_team_logo,
    match_date, status, real_home_score, real_away_score, stage, matchweek, stadium
)
VALUES
`;

  const valueRows = allMatches.map(m => {
    const safeHome = m.home_team.replace(/'/g, "''");
    const safeAway = m.away_team.replace(/'/g, "''");
    const safeStadium = (m.stadium || '').replace(/'/g, "''");
    return `    ('${m.id}'::uuid, '${safeHome}', '${safeAway}', '${m.home_team_logo}', '${m.away_team_logo}', '${m.pg_date}', 'pending', NULL, NULL, 'league', ${m.matchweek}, '${safeStadium}')`;
  });

  sqlContent += valueRows.join(',\n') + ';\n\n';

  const sqlPath = path.join(__dirname, '..', 'insert_ucl_2026_fixtures.sql');
  fs.writeFileSync(sqlPath, sqlContent, 'utf8');
  console.log(`Generated SQL file at: ${sqlPath}`);

  // 2. SUPABASE LIVE DATABASE'E DOĞRUDAN EKLEME (Eğer .env varsa)
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/);
    const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

    if (urlMatch && keyMatch) {
      const supabaseUrl = urlMatch[1].trim();
      const supabaseKey = keyMatch[1].trim();

      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        console.log(`Connecting to Supabase at ${supabaseUrl}...`);
        const supabase = createClient(supabaseUrl, supabaseKey);

        try {
          // Eski maçları temizle (UUID uyumlu sorgu)
          const { error: delErr } = await supabase.from('matches').delete().neq('home_team', '___dummy_placeholder___');
          if (delErr) {
            console.warn('Matches delete warning (may be restricted by RLS if anon):', delErr.message);
          } else {
            console.log('Old matches cleared in Supabase.');
          }

          // Parçalar halinde ekle (25'erli gruplar)
          const recordsToInsert = allMatches.map(m => ({
            id: m.id,
            home_team: m.home_team,
            away_team: m.away_team,
            home_team_logo: m.home_team_logo,
            away_team_logo: m.away_team_logo,
            match_date: m.match_date,
            status: 'pending',
            real_home_score: null,
            real_away_score: null,
            stage: 'league',
            matchweek: m.matchweek,
            stadium: m.stadium
          }));

          const chunkSize = 25;
          let insertedCount = 0;
          for (let i = 0; i < recordsToInsert.length; i += chunkSize) {
            const chunk = recordsToInsert.slice(i, i + chunkSize);
            const { data, error: insErr } = await supabase.from('matches').upsert(chunk, { onConflict: 'id' });
            if (insErr) {
              console.error(`Error inserting chunk ${i / chunkSize + 1}:`, insErr.message);
            } else {
              insertedCount += chunk.length;
            }
          }
          console.log(`Successfully uploaded ${insertedCount} matches directly to Supabase!`);
        } catch (supabaseErr) {
          console.error('Supabase direct insert error:', supabaseErr);
        }
      }
    }
  }

  // 3. FRONTEND api.ts DEMO_MATCHES DİZİSİNİ GÜNCELLE
  // Böylece Supabase çevrimdışı olsa dahi veya demo modunda 144 maçın tamamı listelenir
  const apiPath = path.join(__dirname, '..', 'src', 'services', 'api.ts');
  if (fs.existsSync(apiPath)) {
    let apiCode = fs.readFileSync(apiPath, 'utf8');

    const demoMatchesJson = JSON.stringify(allMatches.map(m => ({
      id: m.id,
      home_team: m.home_team,
      away_team: m.away_team,
      home_team_logo: m.home_team_logo,
      away_team_logo: m.away_team_logo,
      match_date: m.match_date,
      status: 'pending',
      real_home_score: null,
      real_away_score: null,
      stage: 'league',
      matchweek: m.matchweek,
      stadium: m.stadium
    })), null, 2);

    // DEMO_MATCHES tanımını bul ve değiştir
    const demoMatchesRegex = /const DEMO_MATCHES: Match\[\] = \[[\s\S]*?\n\];/;
    if (demoMatchesRegex.test(apiCode)) {
      apiCode = apiCode.replace(demoMatchesRegex, `const DEMO_MATCHES: Match[] = ${demoMatchesJson};`);
      fs.writeFileSync(apiPath, apiCode, 'utf8');
      console.log('Successfully updated DEMO_MATCHES in src/services/api.ts with all 144 fixtures.');
    } else {
      console.warn('Could not locate DEMO_MATCHES regex in api.ts');
    }
  }
}

run().catch(console.error);

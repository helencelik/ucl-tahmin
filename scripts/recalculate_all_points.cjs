const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sqakhwqvvwxjutttsaxf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxYWtod3F2dnd4anV0dHRzYXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2OTI5MzIsImV4cCI6MjEwNDI2ODkzMn0.Px-ReU_rvBCF7eJZcRJFfhrcja4VpEWejmubaCYPkO8';

function calculatePredictionPoints(predHome, predAway, realHome, realAway) {
  if (
    predHome === null || predHome === undefined || predHome === '' ||
    predAway === null || predAway === undefined || predAway === '' ||
    realHome === null || realHome === undefined || realHome === '' ||
    realAway === null || realAway === undefined || realAway === ''
  ) {
    return 0;
  }

  const pH = Number(predHome);
  const pA = Number(predAway);
  const rH = Number(realHome);
  const rA = Number(realAway);

  if (isNaN(pH) || isNaN(pA) || isNaN(rH) || isNaN(rA)) return 0;

  // 1. Tam Skor -> 4 Puan
  if (pH === rH && pA === rA) return 4;

  // 2. Gol Farkı -> 3 Puan
  const predDiff = pH - pA;
  const realDiff = rH - rA;
  if (predDiff === realDiff) return 3;

  // 3. Kazanan / Beraberlik -> 2 Puan
  if (Math.sign(predDiff) === Math.sign(realDiff)) return 2;

  // 4. Yanlış -> 0 Puan
  return 0;
}

async function recalculate() {
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data: auth, error: aErr } = await sb.auth.signInWithPassword({
    email: 'admin@gmail.com',
    password: 'admin'
  });
  if (aErr) {
    console.error('Admin login error:', aErr.message);
    return;
  }

  // 1. Biten maçları çek
  const { data: matches } = await sb
    .from('matches')
    .select('id, home_team, away_team, real_home_score, real_away_score, status')
    .eq('status', 'finished');

  const matchMap = {};
  (matches || []).forEach(m => {
    if (m.real_home_score !== null && m.real_away_score !== null) {
      matchMap[m.id] = m;
    }
  });

  // 2. Tüm tahminleri çek
  const { data: preds } = await sb.from('predictions').select('*');

  const userTotals = {};
  const userBreakdown = {};

  (preds || []).forEach(p => {
    const m = matchMap[p.match_id];
    if (m) {
      const pts = calculatePredictionPoints(
        p.predicted_home_score,
        p.predicted_away_score,
        m.real_home_score,
        m.real_away_score
      );
      userTotals[p.user_id] = (userTotals[p.user_id] || 0) + pts;
      if (!userBreakdown[p.user_id]) {
        userBreakdown[p.user_id] = { exact: 0, diff: 0, winner: 0, wrong: 0, total: 0, list: [] };
      }
      userBreakdown[p.user_id].total += pts;
      if (pts === 4) userBreakdown[p.user_id].exact++;
      else if (pts === 3) userBreakdown[p.user_id].diff++;
      else if (pts === 2) userBreakdown[p.user_id].winner++;
      else userBreakdown[p.user_id].wrong++;

      userBreakdown[p.user_id].list.push({
        match: `${m.home_team} vs ${m.away_team}`,
        pred: `${p.predicted_home_score}-${p.predicted_away_score}`,
        real: `${m.real_home_score}-${m.real_away_score}`,
        pts
      });
    }
  });

  console.log('--- RECALCULATION DETAILS ---');
  console.log(JSON.stringify(userBreakdown, null, 2));

  // 3. Kullanıcıların total_points değerini güncelle
  const { data: allUsers } = await sb.from('users').select('id, email, total_points');
  for (const u of (allUsers || [])) {
    const calculated = userTotals[u.id] || 0;
    console.log(`User ${u.email}: old points = ${u.total_points}, new points = ${calculated}`);
    await sb.from('users').update({ total_points: calculated }).eq('id', u.id);
  }

  console.log('✅ Tüm kullanıcı puanları 4-3-2-0 kuralına göre başarıyla güncellendi.');
}

recalculate();

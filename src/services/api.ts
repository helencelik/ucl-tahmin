import { supabase, isSupabaseConfigured } from './supabase';
import { Match, Prediction, LeaderboardUser } from '../types';

// ==========================================
// YÖNETİCİ KONTROL YARDIMCISI (IS ADMIN)
// ==========================================
export function isUserAdmin(user: {
  role?: string;
  username?: string;
  email?: string;
  name?: string;
  display_name?: string;
} | null | undefined): boolean {
  if (!user) return false;
  const role = String(user.role || '').toLowerCase().trim();
  const username = String(user.username || '').toLowerCase().trim();
  const email = String(user.email || '').toLowerCase().trim();
  const name = String(user.name || '').toLowerCase().trim();
  const displayName = String(user.display_name || '').toLowerCase().trim();

  return (
    role === 'admin' ||
    username === 'admin' ||
    email.startsWith('admin@') ||
    email === 'admin@gmail.com' ||
    email === 'admin@ucl.com' ||
    name === 'admin' ||
    name.includes('yönetici') ||
    displayName === 'admin' ||
    displayName.includes('yönetici')
  );
}

// Hafta belirleme yardımcısı (Eğer veritabanında matchweek sütunu boşsa tarihten tahmin eder)
function inferMatchweek(dateStr: string): number {
  if (!dateStr) return 1;
  const d = dateStr.slice(0, 10);
  if (d <= '2026-09-15') return 1;
  if (d <= '2026-10-15') return 2;
  if (d <= '2026-10-25') return 3;
  if (d <= '2026-11-10') return 4;
  if (d <= '2026-11-30') return 5;
  if (d <= '2026-12-15') return 6;
  if (d <= '2027-01-22') return 7;
  return 8;
}

// ==========================================
// MAÇ İŞLEMLERİ (MATCHES)
// ==========================================
export async function getMatches(): Promise<Match[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('match_date', { ascending: true });

    if (error) {
      console.error('Maçlar alınırken hata:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((m) => ({
      ...m,
      stage: m.stage || 'league',
      matchweek: m.matchweek || inferMatchweek(m.match_date),
      stadium: m.stadium || (m.home_team === 'Galatasaray' ? 'RAMS Park' : '')
    }));
  } catch (err) {
    console.error('Maçlar yüklenirken beklenmeyen hata:', err);
    return [];
  }
}

// ==========================================
// PUANLAMA KURALLARI (4 - 3 - 2 - 0 SİSTEMİ)
// ==========================================
/**
 * 4 - 3 - 2 - 0 Puanlama Kuralı (Sıralı Öncelik Mantığı):
 * 1. ÖNCELİK: Tam Skor (Exact Match) -> 4 PUAN
 * 2. ÖNCELİK: Skor / Gol Farkı İsabeti (Goal Difference Match) -> 3 PUAN
 * 3. ÖNCELİK: Maçın Kazananı / Beraberlik (Outcome Match) -> 2 PUAN
 * 4. ÖNCELİK: Yanlış Tahmin -> 0 PUAN
 */
export function calculatePredictionPoints(
  predHome: number | string | null | undefined,
  predAway: number | string | null | undefined,
  realHome: number | string | null | undefined,
  realAway: number | string | null | undefined
): number {
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

  if (isNaN(pH) || isNaN(pA) || isNaN(rH) || isNaN(rA)) {
    return 0;
  }

  // 1. ÖNCELİK: Tam Skor Bildimi (Exact Match) -> 4 PUAN
  if (pH === rH && pA === rA) {
    return 4;
  }

  // 2. ÖNCELİK: Skor / Gol Farkı İsabeti (Goal Difference Match) -> 3 PUAN
  const predDiff = pH - pA;
  const realDiff = rH - rA;
  if (predDiff === realDiff) {
    return 3;
  }

  // 3. ÖNCELİK: Maçın Kazananı veya Beraberlik Durumu (Outcome Match) -> 2 PUAN
  if (Math.sign(predDiff) === Math.sign(realDiff)) {
    return 2;
  }

  // 4. Yanlış Tahmin -> 0 PUAN
  return 0;
}

// ==========================================
// TAHMİN İŞLEMLERİ (PREDICTIONS)
// ==========================================
export async function getUserPredictions(userId: string): Promise<Record<string, Prediction>> {
  if (!userId || !isSupabaseConfigured()) {
    return {};
  }

  try {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('[getUserPredictions] Supabase sorgu hatası:', error.message);
      return {};
    }

    const predictionMap: Record<string, Prediction> = {};
    (data || []).forEach((pred) => {
      predictionMap[pred.match_id] = pred;
    });

    return predictionMap;
  } catch (err) {
    console.error('[getUserPredictions] Tahminler çekilirken hata:', err);
    return {};
  }
}

export async function saveUserPrediction(
  userId: string,
  matchId: string,
  homeScore: number,
  awayScore: number
): Promise<Prediction> {
  if (!userId || !matchId) {
    throw new Error('Geçersiz kullanıcı veya maç ID.');
  }

  if (!isSupabaseConfigured()) {
    throw new Error('Veritabanı bağlantısı yapılandırılmamış.');
  }

  const { data, error } = await supabase
    .from('predictions')
    .upsert(
      {
        user_id: userId,
        match_id: matchId,
        predicted_home_score: homeScore,
        predicted_away_score: awayScore,
        updated_at: new Date().toISOString()
      },
      {
        onConflict: 'user_id,match_id'
      }
    )
    .select()
    .single();

  if (error) {
    console.error('[saveUserPrediction] Supabase kayıt hatası:', error.message);
    throw error;
  }

  return data;
}

// Biten maçın diğer kullanıcı tahminlerini görüntüleme (Şeffaflık)
export async function getMatchPredictions(matchId: string): Promise<Prediction[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('predictions')
    .select('*, user:users(id, name, username, display_name, total_points)')
    .eq('match_id', matchId);

  if (error) {
    console.error('Maç tahminleri alınırken hata:', error);
    return [];
  }

  return data || [];
}

// ==========================================
// LİDERLİK TABLOSU (LEADERBOARD)
// ==========================================
export async function getLeaderboard(): Promise<LeaderboardUser[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    // 1. Sadece Supabase public.users tablosundaki gerçek kullanıcıları çek
    const { data: usersData, error } = await supabase
      .from('users')
      .select('*')
      .order('total_points', { ascending: false });

    if (error) {
      console.error('Liderlik tablosu Supabase sorgu hatası:', error.message);
      return [];
    }

    if (!usersData || usersData.length === 0) {
      return [];
    }

    // 2. Kullanıcıların tahmin istatistiklerini çekme
    const { data: allPreds } = await supabase
      .from('predictions')
      .select('user_id, points_earned');

    const exactCountMap: Record<string, number> = {};
    const diffCountMap: Record<string, number> = {};
    const resultCountMap: Record<string, number> = {};
    const totalCountMap: Record<string, number> = {};

    (allPreds || []).forEach((item) => {
      totalCountMap[item.user_id] = (totalCountMap[item.user_id] || 0) + 1;
      if (item.points_earned === 4) exactCountMap[item.user_id] = (exactCountMap[item.user_id] || 0) + 1;
      else if (item.points_earned === 3) diffCountMap[item.user_id] = (diffCountMap[item.user_id] || 0) + 1;
      else if (item.points_earned === 2) resultCountMap[item.user_id] = (resultCountMap[item.user_id] || 0) + 1;
    });

    const mappedUsers: LeaderboardUser[] = usersData.map((user) => {
      const exact = exactCountMap[user.id] || 0;
      const diff = diffCountMap[user.id] || 0;
      const result = resultCountMap[user.id] || 0;
      const totalPreds = totalCountMap[user.id] || 0;

      const rawName = user.name || user.display_name || 'Katılımcı';
      const cleanUsername = user.username || (user.email ? user.email.split('@')[0] : rawName.toLowerCase().replace(/[^a-z0-9]/g, ''));

      return {
        id: user.id,
        name: rawName,
        display_name: rawName,
        username: cleanUsername,
        email: user.email,
        role: user.role || 'user',
        total_points: user.total_points || 0,
        exact_scores_count: exact,
        diff_scores_count: diff,
        result_scores_count: result,
        predictions_count: totalPreds,
        created_at: user.created_at || ''
      };
    });

    // Admin (yönetici) hesaplarını liderlik sıralamasından KESİNLİKLE hariç tut
    const participantUsers = mappedUsers.filter((u) => !isUserAdmin(u));

    // Puan yüksekten düşüğe, eşitlikte tam skor sayısına göre sırala
    participantUsers.sort((a, b) => {
      if (b.total_points !== a.total_points) {
        return b.total_points - a.total_points;
      }
      return (b.exact_scores_count || 0) - (a.exact_scores_count || 0);
    });

    return participantUsers.map((u, idx) => ({
      ...u,
      rank: idx + 1
    }));
  } catch (err) {
    console.error('Liderlik tablosu çekilemedi:', err);
    return [];
  }
}

// ==========================================
// YÖNETİCİ İŞLEMLERİ (ADMIN)
// ==========================================
export async function updateMatchResult(
  matchId: string,
  realHomeScore: number,
  realAwayScore: number
): Promise<void> {
  if (!matchId || typeof matchId !== 'string' || matchId.trim() === '') {
    throw new Error('Geçersiz maç ID: Güncellenecek maçın kimlik bilgisi (id) eksik.');
  }

  const cleanMatchId = matchId.trim();

  if (!isSupabaseConfigured()) {
    throw new Error('Veritabanı bağlantısı yapılandırılmamış.');
  }

  // Supabase matches tablosunu güncelle (WHERE id = cleanMatchId)
  const { error } = await supabase
    .from('matches')
    .update({
      real_home_score: realHomeScore,
      real_away_score: realAwayScore,
      status: 'finished'
    })
    .eq('id', cleanMatchId);

  if (error) {
    console.error('Maç skoru güncellenirken hata:', error);
    throw error;
  }
}

export async function createMatch(matchData: {
  home_team: string;
  away_team: string;
  home_team_logo?: string;
  away_team_logo?: string;
  match_date: string;
  stage?: string;
  matchweek?: number;
  stadium?: string;
}): Promise<Match> {
  if (!isSupabaseConfigured()) {
    throw new Error('Veritabanı bağlantısı yapılandırılmamış.');
  }

  const { data, error } = await supabase
    .from('matches')
    .insert([
      {
        ...matchData,
        status: 'pending'
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Maç eklenirken hata:', error);
    throw error;
  }

  return data;
}

export async function deleteMatch(matchId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Veritabanı bağlantısı yapılandırılmamış.');
  }

  const { error } = await supabase.from('matches').delete().eq('id', matchId);
  if (error) {
    console.error('Maç silinirken hata:', error);
    throw error;
  }
}

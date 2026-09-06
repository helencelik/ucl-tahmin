import { supabase, isSupabaseConfigured } from './supabase';
import { Match, Prediction, LeaderboardUser } from '../types';

// ==========================================
// DEMO / YEDEK VERİLER (Supabase bağlanana kadar)
// ==========================================
const DEMO_MATCHES: Match[] = [
  {
    id: 'demo-match-1',
    home_team: 'Real Madrid',
    away_team: 'Manchester City',
    home_team_logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8633.png',
    away_team_logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8456.png',
    match_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    status: 'pending',
    real_home_score: null,
    real_away_score: null
  },
  {
    id: 'demo-match-2',
    home_team: 'Bayern Munich',
    away_team: 'Arsenal',
    home_team_logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9823.png',
    away_team_logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9825.png',
    match_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    status: 'pending',
    real_home_score: null,
    real_away_score: null
  },
  {
    id: 'demo-match-3',
    home_team: 'Paris Saint-Germain',
    away_team: 'Barcelona',
    home_team_logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9847.png',
    away_team_logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8634.png',
    match_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    status: 'pending',
    real_home_score: null,
    real_away_score: null
  },
  {
    id: 'demo-match-4',
    home_team: 'Borussia Dortmund',
    away_team: 'Liverpool',
    home_team_logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9789.png',
    away_team_logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8650.png',
    match_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    status: 'finished',
    real_home_score: 2,
    real_away_score: 1
  }
];

const DEMO_LEADERBOARD: LeaderboardUser[] = [
  { id: 'u1', name: 'Ahmet Yılmaz', role: 'user', total_points: 12, exact_scores_count: 3, created_at: '' },
  { id: 'u2', name: 'Mehmet Demir', role: 'user', total_points: 9, exact_scores_count: 2, created_at: '' },
  { id: 'u3', name: 'Zeynep Kaya', role: 'user', total_points: 7, exact_scores_count: 1, created_at: '' },
  { id: 'u4', name: 'Canberk Öz', role: 'user', total_points: 4, exact_scores_count: 0, created_at: '' },
  { id: 'u5', name: 'Elif Şahin', role: 'user', total_points: 3, exact_scores_count: 0, created_at: '' },
  { id: 'admin-id', name: 'Lig Yöneticisi (Admin)', role: 'admin', total_points: 0, exact_scores_count: 0, created_at: '' }
];

// LocalStorage anahtarları (Demo modunda çalışabilmek için)
const LS_PREDICTIONS_KEY = 'ucl_demo_predictions';
const LS_MATCHES_KEY = 'ucl_demo_matches';

// ==========================================
// MAÇ İŞLEMLERİ (MATCHES)
// ==========================================
export async function getMatches(): Promise<Match[]> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem(LS_MATCHES_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Hata durumunda DEMO_MATCHES dön
      }
    }
    return DEMO_MATCHES;
  }

  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true });

  if (error) {
    console.error('Maçlar alınırken hata:', error);
    throw error;
  }

  return data || [];
}

// ==========================================
// TAHMİN İŞLEMLERİ (PREDICTIONS)
// ==========================================
export async function getUserPredictions(userId: string): Promise<Record<string, Prediction>> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem(LS_PREDICTIONS_KEY);
    const all = saved ? JSON.parse(saved) : {};
    return all[userId] || {};
  }

  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Kullanıcı tahminleri alınırken hata:', error);
    throw error;
  }

  const predictionMap: Record<string, Prediction> = {};
  (data || []).forEach((pred) => {
    predictionMap[pred.match_id] = pred;
  });

  return predictionMap;
}

export async function saveUserPrediction(
  userId: string,
  matchId: string,
  homeScore: number,
  awayScore: number
): Promise<Prediction> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem(LS_PREDICTIONS_KEY);
    const all = saved ? JSON.parse(saved) : {};
    if (!all[userId]) all[userId] = {};

    const existing = all[userId][matchId];
    const newPred: Prediction = {
      id: existing?.id || 'demo-pred-' + Date.now(),
      user_id: userId,
      match_id: matchId,
      predicted_home_score: homeScore,
      predicted_away_score: awayScore,
      points_earned: 0,
      updated_at: new Date().toISOString()
    };
    all[userId][matchId] = newPred;
    localStorage.setItem(LS_PREDICTIONS_KEY, JSON.stringify(all));
    return newPred;
  }

  // Supabase upsert (unique user_id + match_id)
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
    console.error('Tahmin kaydedilirken hata:', error);
    throw error;
  }

  return data;
}

// Biten maçın diğer kullanıcı tahminlerini görüntüleme (Şeffaflık)
export async function getMatchPredictions(matchId: string): Promise<Prediction[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('predictions')
    .select('*, user:users(id, name, total_points)')
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
    return DEMO_LEADERBOARD;
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, name, role, total_points, created_at')
    .order('total_points', { ascending: false });

  if (error) {
    console.error('Liderlik tablosu alınırken hata:', error);
    throw error;
  }

  // Kullanıcıların bildiği tam skor sayısını çekme (Opsiyonel istatistik)
  const { data: exactScores } = await supabase
    .from('predictions')
    .select('user_id')
    .eq('points_earned', 3);

  const exactCountMap: Record<string, number> = {};
  (exactScores || []).forEach((item) => {
    exactCountMap[item.user_id] = (exactCountMap[item.user_id] || 0) + 1;
  });

  return (data || []).map((user, idx) => ({
    ...user,
    rank: idx + 1,
    exact_scores_count: exactCountMap[user.id] || 0
  }));
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
    const saved = localStorage.getItem(LS_MATCHES_KEY);
    const matches: Match[] = saved ? JSON.parse(saved) : [...DEMO_MATCHES];
    const matchIndex = matches.findIndex((m) => m.id === cleanMatchId);
    if (matchIndex !== -1) {
      matches[matchIndex] = {
        ...matches[matchIndex],
        real_home_score: realHomeScore,
        real_away_score: realAwayScore,
        status: 'finished'
      };
      localStorage.setItem(LS_MATCHES_KEY, JSON.stringify(matches));
    }
    return;
  }

  // Supabase matches tablosunu güncelle (WHERE id = cleanMatchId)
  // Veritabanındaki trigger (trg_calculate_match_points) otomatik olarak puanları hesaplar
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
}): Promise<Match> {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem(LS_MATCHES_KEY);
    const matches: Match[] = saved ? JSON.parse(saved) : [...DEMO_MATCHES];
    const newMatch: Match = {
      id: 'demo-match-' + Date.now(),
      ...matchData,
      status: 'pending',
      real_home_score: null,
      real_away_score: null
    };
    matches.push(newMatch);
    localStorage.setItem(LS_MATCHES_KEY, JSON.stringify(matches));
    return newMatch;
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
    const saved = localStorage.getItem(LS_MATCHES_KEY);
    const matches: Match[] = saved ? JSON.parse(saved) : [...DEMO_MATCHES];
    const filtered = matches.filter((m) => m.id !== matchId);
    localStorage.setItem(LS_MATCHES_KEY, JSON.stringify(filtered));
    return;
  }

  const { error } = await supabase.from('matches').delete().eq('id', matchId);
  if (error) {
    console.error('Maç silinirken hata:', error);
    throw error;
  }
}

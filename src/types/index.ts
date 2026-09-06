export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  email?: string;
  name: string;
  role: UserRole;
  total_points: number;
  created_at: string;
}

export type MatchStatus = 'pending' | 'finished';

export interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_team_logo?: string;
  away_team_logo?: string;
  match_date: string;
  status: MatchStatus;
  real_home_score?: number | null;
  real_away_score?: number | null;
  created_at?: string;
}

export interface Prediction {
  id: string;
  user_id: string;
  match_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  points_earned: number;
  created_at?: string;
  updated_at?: string;
  user?: UserProfile;
  match?: Match;
}

export interface LeaderboardUser extends UserProfile {
  exact_scores_count?: number;
  rank?: number;
}

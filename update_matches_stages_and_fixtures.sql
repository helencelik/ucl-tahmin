-- ==============================================================================
-- ŞAMPİYONLAR LİGİ 2025/2026 8 HAFTALIK LİG AŞAMASI VE STADYUM ŞEMASI
-- ==============================================================================
-- Bu betiği Supabase Dashboard -> SQL Editor alanına yapıştırıp "Run" ile çalıştırınız.

-- 1. Tabloya yeni sütunları ekleme
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'league';
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS matchweek INTEGER;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS stadium TEXT;

-- 2. Mevcut maçların lig aşaması değerlerini güncelleme
UPDATE public.matches
SET stage = 'league'
WHERE stage IS NULL;

-- 3. 8 Haftalık Gerçekçi UEFA Şampiyonlar Ligi Lig Aşaması Fikstürü
DELETE FROM public.predictions WHERE match_id LIKE 'ucl-2025-%';
DELETE FROM public.matches WHERE id LIKE 'ucl-2025-%';

-- 1. HAFTA MAÇLARI
INSERT INTO public.matches (id, home_team, away_team, home_team_logo, away_team_logo, match_date, status, real_home_score, real_away_score, stage, matchweek, stadium)
VALUES
  ('ucl-2025-w1-m1', 'Real Madrid', 'VfB Stuttgart', 'https://images.fotmob.com/image_resources/logo/teamlogo/8633.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/10269.png', '2025-09-16 19:00:00+00', 'finished', 3, 1, 'league', 1, 'Santiago Bernabéu'),
  ('ucl-2025-w1-m2', 'AC Milan', 'Liverpool', 'https://images.fotmob.com/image_resources/logo/teamlogo/8564.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/8650.png', '2025-09-16 19:00:00+00', 'finished', 1, 3, 'league', 1, 'San Siro'),
  ('ucl-2025-w1-m3', 'Bayern München', 'Dinamo Zagreb', 'https://images.fotmob.com/image_resources/logo/teamlogo/9823.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/8567.png', '2025-09-17 19:00:00+00', 'finished', 9, 2, 'league', 1, 'Allianz Arena'),
  ('ucl-2025-w1-m4', 'Manchester City', 'Inter Milan', 'https://images.fotmob.com/image_resources/logo/teamlogo/8456.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/8636.png', '2025-09-18 19:00:00+00', 'finished', 0, 0, 'league', 1, 'Etihad Stadium')
ON CONFLICT (id) DO UPDATE SET
  home_team = EXCLUDED.home_team,
  away_team = EXCLUDED.away_team,
  home_team_logo = EXCLUDED.home_team_logo,
  away_team_logo = EXCLUDED.away_team_logo,
  match_date = EXCLUDED.match_date,
  status = EXCLUDED.status,
  real_home_score = EXCLUDED.real_home_score,
  real_away_score = EXCLUDED.real_away_score,
  stage = EXCLUDED.stage,
  matchweek = EXCLUDED.matchweek,
  stadium = EXCLUDED.stadium;

-- 2. HAFTA MAÇLARI
INSERT INTO public.matches (id, home_team, away_team, home_team_logo, away_team_logo, match_date, status, real_home_score, real_away_score, stage, matchweek, stadium)
VALUES
  ('ucl-2025-w2-m1', 'Arsenal', 'Paris Saint-Germain', 'https://images.fotmob.com/image_resources/logo/teamlogo/9825.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/9847.png', '2025-10-01 19:00:00+00', 'finished', 2, 0, 'league', 2, 'Emirates Stadium'),
  ('ucl-2025-w2-m2', 'Bayer Leverkusen', 'AC Milan', 'https://images.fotmob.com/image_resources/logo/teamlogo/8178.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/8564.png', '2025-10-01 19:00:00+00', 'finished', 1, 0, 'league', 2, 'BayArena'),
  ('ucl-2025-w2-m3', 'Aston Villa', 'Bayern München', 'https://images.fotmob.com/image_resources/logo/teamlogo/10252.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/9823.png', '2025-10-02 19:00:00+00', 'finished', 1, 0, 'league', 2, 'Villa Park'),
  ('ucl-2025-w2-m4', 'RB Leipzig', 'Juventus', 'https://images.fotmob.com/image_resources/logo/teamlogo/178475.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/9885.png', '2025-10-02 19:00:00+00', 'finished', 2, 3, 'league', 2, 'Red Bull Arena')
ON CONFLICT (id) DO UPDATE SET
  stage = EXCLUDED.stage,
  matchweek = EXCLUDED.matchweek,
  stadium = EXCLUDED.stadium;

-- 3. HAFTA MAÇLARI
INSERT INTO public.matches (id, home_team, away_team, home_team_logo, away_team_logo, match_date, status, real_home_score, real_away_score, stage, matchweek, stadium)
VALUES
  ('ucl-2025-w3-m1', 'Real Madrid', 'Borussia Dortmund', 'https://images.fotmob.com/image_resources/logo/teamlogo/8633.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/9789.png', '2025-10-22 19:00:00+00', 'finished', 5, 2, 'league', 3, 'Santiago Bernabéu'),
  ('ucl-2025-w3-m2', 'Barcelona', 'Bayern München', 'https://images.fotmob.com/image_resources/logo/teamlogo/8634.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/9823.png', '2025-10-23 19:00:00+00', 'finished', 4, 1, 'league', 3, 'Estadi Olímpic Lluís Companys'),
  ('ucl-2025-w3-m3', 'RB Leipzig', 'Liverpool', 'https://images.fotmob.com/image_resources/logo/teamlogo/178475.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/8650.png', '2025-10-23 19:00:00+00', 'finished', 0, 1, 'league', 3, 'Red Bull Arena'),
  ('ucl-2025-w3-m4', 'Manchester City', 'Sparta Prag', 'https://images.fotmob.com/image_resources/logo/teamlogo/8456.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/8505.png', '2025-10-23 19:00:00+00', 'finished', 5, 0, 'league', 3, 'Etihad Stadium')
ON CONFLICT (id) DO UPDATE SET
  stage = EXCLUDED.stage,
  matchweek = EXCLUDED.matchweek,
  stadium = EXCLUDED.stadium;

-- 4. HAFTA MAÇLARI
INSERT INTO public.matches (id, home_team, away_team, home_team_logo, away_team_logo, match_date, status, real_home_score, real_away_score, stage, matchweek, stadium)
VALUES
  ('ucl-2025-w4-m1', 'Real Madrid', 'AC Milan', 'https://images.fotmob.com/image_resources/logo/teamlogo/8633.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/8564.png', '2025-11-05 20:00:00+00', 'finished', 1, 3, 'league', 4, 'Santiago Bernabéu'),
  ('ucl-2025-w4-m2', 'Liverpool', 'Bayer Leverkusen', 'https://images.fotmob.com/image_resources/logo/teamlogo/8650.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/8178.png', '2025-11-05 20:00:00+00', 'finished', 4, 0, 'league', 4, 'Anfield'),
  ('ucl-2025-w4-m3', 'Inter Milan', 'Arsenal', 'https://images.fotmob.com/image_resources/logo/teamlogo/8636.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/9825.png', '2025-11-06 20:00:00+00', 'finished', 1, 0, 'league', 4, 'San Siro'),
  ('ucl-2025-w4-m4', 'Paris Saint-Germain', 'Atletico Madrid', 'https://images.fotmob.com/image_resources/logo/teamlogo/9847.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/9906.png', '2025-11-06 20:00:00+00', 'finished', 1, 2, 'league', 4, 'Parc des Princes')
ON CONFLICT (id) DO UPDATE SET
  stage = EXCLUDED.stage,
  matchweek = EXCLUDED.matchweek,
  stadium = EXCLUDED.stadium;

-- 5. HAFTA MAÇLARI
INSERT INTO public.matches (id, home_team, away_team, home_team_logo, away_team_logo, match_date, status, real_home_score, real_away_score, stage, matchweek, stadium)
VALUES
  ('ucl-2025-w5-m1', 'Bayern München', 'Paris Saint-Germain', 'https://images.fotmob.com/image_resources/logo/teamlogo/9823.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/9847.png', '2025-11-26 20:00:00+00', 'finished', 1, 0, 'league', 5, 'Allianz Arena'),
  ('ucl-2025-w5-m2', 'Liverpool', 'Real Madrid', 'https://images.fotmob.com/image_resources/logo/teamlogo/8650.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/8633.png', '2025-11-27 20:00:00+00', 'finished', 2, 0, 'league', 5, 'Anfield'),
  ('ucl-2025-w5-m3', 'Aston Villa', 'Juventus', 'https://images.fotmob.com/image_resources/logo/teamlogo/10252.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/9885.png', '2025-11-27 20:00:00+00', 'finished', 0, 0, 'league', 5, 'Villa Park'),
  ('ucl-2025-w5-m4', 'Sporting CP', 'Arsenal', 'https://images.fotmob.com/image_resources/logo/teamlogo/9768.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/9825.png', '2025-11-26 20:00:00+00', 'finished', 1, 5, 'league', 5, 'Estádio José Alvalade')
ON CONFLICT (id) DO UPDATE SET
  stage = EXCLUDED.stage,
  matchweek = EXCLUDED.matchweek,
  stadium = EXCLUDED.stadium;

-- 6. HAFTA MAÇLARI
INSERT INTO public.matches (id, home_team, away_team, home_team_logo, away_team_logo, match_date, status, real_home_score, real_away_score, stage, matchweek, stadium)
VALUES
  ('ucl-2025-w6-m1', 'Atalanta', 'Real Madrid', 'https://images.fotmob.com/image_resources/logo/teamlogo/8524.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/8633.png', '2025-12-10 20:00:00+00', 'finished', 2, 3, 'league', 6, 'Gewiss Stadium'),
  ('ucl-2025-w6-m2', 'Bayer Leverkusen', 'Inter Milan', 'https://images.fotmob.com/image_resources/logo/teamlogo/8178.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/8636.png', '2025-12-10 20:00:00+00', 'finished', 1, 0, 'league', 6, 'BayArena'),
  ('ucl-2025-w6-m3', 'Borussia Dortmund', 'Barcelona', 'https://images.fotmob.com/image_resources/logo/teamlogo/9789.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/8634.png', '2025-12-11 20:00:00+00', 'finished', 2, 3, 'league', 6, 'Signal Iduna Park'),
  ('ucl-2025-w6-m4', 'Juventus', 'Manchester City', 'https://images.fotmob.com/image_resources/logo/teamlogo/9885.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/8456.png', '2025-12-11 20:00:00+00', 'finished', 2, 0, 'league', 6, 'Allianz Stadium')
ON CONFLICT (id) DO UPDATE SET
  stage = EXCLUDED.stage,
  matchweek = EXCLUDED.matchweek,
  stadium = EXCLUDED.stadium;

-- 7. HAFTA MAÇLARI (GELECEK MAÇLAR - PENDING)
INSERT INTO public.matches (id, home_team, away_team, home_team_logo, away_team_logo, match_date, status, real_home_score, real_away_score, stage, matchweek, stadium)
VALUES
  ('ucl-2025-w7-m1', 'Paris Saint-Germain', 'Manchester City', 'https://images.fotmob.com/image_resources/logo/teamlogo/9847.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/8456.png', '2026-01-22 20:00:00+00', 'pending', NULL, NULL, 'league', 7, 'Parc des Princes'),
  ('ucl-2025-w7-m2', 'Real Madrid', 'FC Salzburg', 'https://images.fotmob.com/image_resources/logo/teamlogo/8633.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/9911.png', '2026-01-22 20:00:00+00', 'pending', NULL, NULL, 'league', 7, 'Santiago Bernabéu'),
  ('ucl-2025-w7-m3', 'Arsenal', 'Dinamo Zagreb', 'https://images.fotmob.com/image_resources/logo/teamlogo/9825.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/8567.png', '2026-01-22 20:00:00+00', 'pending', NULL, NULL, 'league', 7, 'Emirates Stadium'),
  ('ucl-2025-w7-m4', 'AC Milan', 'Girona', 'https://images.fotmob.com/image_resources/logo/teamlogo/8564.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/9860.png', '2026-01-22 20:00:00+00', 'pending', NULL, NULL, 'league', 7, 'San Siro')
ON CONFLICT (id) DO UPDATE SET
  stage = EXCLUDED.stage,
  matchweek = EXCLUDED.matchweek,
  stadium = EXCLUDED.stadium;

-- 8. HAFTA MAÇLARI (GELECEK MAÇLAR - PENDING)
INSERT INTO public.matches (id, home_team, away_team, home_team_logo, away_team_logo, match_date, status, real_home_score, real_away_score, stage, matchweek, stadium)
VALUES
  ('ucl-2025-w8-m1', 'Barcelona', 'Atalanta', 'https://images.fotmob.com/image_resources/logo/teamlogo/8634.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/8524.png', '2026-01-29 20:00:00+00', 'pending', NULL, NULL, 'league', 8, 'Estadi Olímpic Lluís Companys'),
  ('ucl-2025-w8-m2', 'Manchester City', 'Club Brugge', 'https://images.fotmob.com/image_resources/logo/teamlogo/8456.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/8342.png', '2026-01-29 20:00:00+00', 'pending', NULL, NULL, 'league', 8, 'Etihad Stadium'),
  ('ucl-2025-w8-m3', 'Inter Milan', 'AS Monaco', 'https://images.fotmob.com/image_resources/logo/teamlogo/8636.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/9829.png', '2026-01-29 20:00:00+00', 'pending', NULL, NULL, 'league', 8, 'San Siro'),
  ('ucl-2025-w8-m4', 'Bayern München', 'Slovan Bratislava', 'https://images.fotmob.com/image_resources/logo/teamlogo/9823.png', 'https://images.fotmob.com/image_resources/logo/teamlogo/8575.png', '2026-01-29 20:00:00+00', 'pending', NULL, NULL, 'league', 8, 'Allianz Arena')
ON CONFLICT (id) DO UPDATE SET
  stage = EXCLUDED.stage,
  matchweek = EXCLUDED.matchweek,
  stadium = EXCLUDED.stadium;

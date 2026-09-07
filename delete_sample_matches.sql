-- ==============================================================================
-- ÖRNEK TEST MAÇLARINI TEMİZLEME BETİĞİ
-- ==============================================================================
-- Bu betik, Liverpool - Borussia Dortmund ve Inter - Real Madrid maçlarını
-- ve bu maçlara ait tüm tahminleri veritabanından kalıcı olarak siler.

-- 1. İlgili maçlara ait tahminleri sil
DELETE FROM public.predictions
WHERE match_id IN (
    SELECT id FROM public.matches 
    WHERE (LOWER(TRIM(home_team)) LIKE '%liverpool%' AND LOWER(TRIM(away_team)) LIKE '%dortmund%')
       OR (LOWER(TRIM(home_team)) LIKE '%dortmund%' AND LOWER(TRIM(away_team)) LIKE '%liverpool%')
       OR (LOWER(TRIM(home_team)) LIKE '%inter%' AND LOWER(TRIM(away_team)) LIKE '%real madrid%')
       OR (LOWER(TRIM(home_team)) LIKE '%real madrid%' AND LOWER(TRIM(away_team)) LIKE '%inter%')
);

-- 2. Maçları sil
DELETE FROM public.matches
WHERE (LOWER(TRIM(home_team)) LIKE '%liverpool%' AND LOWER(TRIM(away_team)) LIKE '%dortmund%')
   OR (LOWER(TRIM(home_team)) LIKE '%dortmund%' AND LOWER(TRIM(away_team)) LIKE '%liverpool%')
   OR (LOWER(TRIM(home_team)) LIKE '%inter%' AND LOWER(TRIM(away_team)) LIKE '%real madrid%')
   OR (LOWER(TRIM(home_team)) LIKE '%real madrid%' AND LOWER(TRIM(away_team)) LIKE '%inter%');

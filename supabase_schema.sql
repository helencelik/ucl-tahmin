-- ==============================================================================
-- UEFA ŞAMPİYONLAR LİGİ SKOR TAHMİN UYGULAMASI - GÜNCELLENMİŞ VE HATASIZ SQL
-- ==============================================================================
-- Bu betik, Supabase üzerinde var olabilecek eski/eksik tabloları temizleyip
-- tüm tabloları, ilişkileri, RLS güvenlik kurallarını ve otomatik puanlama
-- sistemini eksiksiz olarak baştan kurar.
-- ==============================================================================

-- 1. GEREKLİ EKLENTİLER
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ESKİ TRİGGER VE TABLOLARI TEMİZLEME (Temiz ve Çakışmasız Kurulum)
DROP TRIGGER IF EXISTS trg_calculate_match_points ON public.matches;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.calculate_match_points();
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS public.predictions CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 3. TABLOLARI OLUŞTURMA
-- ------------------------------------------------------------------------------
-- A) USERS TABLOSU (auth.users ile entegre profil tablosu)
-- ------------------------------------------------------------------------------
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    total_points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Her ihtimale karşı sütunların varlığını garanti altına alma
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_points INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- ------------------------------------------------------------------------------
-- B) MATCHES TABLOSU
-- ------------------------------------------------------------------------------
CREATE TABLE public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    home_team_logo TEXT,
    away_team_logo TEXT,
    match_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'finished')),
    real_home_score INTEGER,
    real_away_score INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- C) PREDICTIONS TABLOSU
-- ------------------------------------------------------------------------------
CREATE TABLE public.predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    predicted_home_score INTEGER NOT NULL,
    predicted_away_score INTEGER NOT NULL,
    points_earned INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_match_prediction UNIQUE (user_id, match_id)
);

-- İndeksler (Sorgu performansı için)
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON public.predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match_id ON public.predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_users_total_points ON public.users(total_points DESC);

-- ------------------------------------------------------------------------------
-- 4. OTOMATİK PUAN HESAPLAMA FONKSİYONU VE TRİGGER'I
-- ------------------------------------------------------------------------------
-- Puanlama Kuralı:
-- Tam Skor: 3 Puan
-- Doğru Kazanan veya Beraberlik (farklı skor): 1 Puan
-- Yanlış: 0 Puan
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.calculate_match_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    pred RECORD;
    v_points INTEGER;
BEGIN
    -- Yalnızca maç durumu 'finished' ise ve gerçek skorlar girilmişse çalışır
    IF NEW.status = 'finished' AND NEW.real_home_score IS NOT NULL AND NEW.real_away_score IS NOT NULL THEN
        
        -- Bu maça yapılmış tüm tahminleri değerlendir
        FOR pred IN SELECT * FROM public.predictions WHERE match_id = NEW.id LOOP
            v_points := 0;

            -- 1. Tam skor bildiyse 3 Puan
            IF pred.predicted_home_score = NEW.real_home_score AND pred.predicted_away_score = NEW.real_away_score THEN
                v_points := 3;
            -- 2. Kazananı veya beraberliği doğru bildiyse 1 Puan
            ELSIF SIGN(pred.predicted_home_score - pred.predicted_away_score) = SIGN(NEW.real_home_score - NEW.real_away_score) THEN
                v_points := 1;
            ELSE
                v_points := 0;
            END IF;

            -- Tahmini güncelle
            UPDATE public.predictions
            SET points_earned = v_points,
                updated_at = timezone('utc'::text, now())
            WHERE id = pred.id;
        END LOOP;

        -- Kullanıcıların toplam puanlarını otomatik olarak yeniden hesaplayıp güncelle (safeupdate için WHERE eklendi)
        UPDATE public.users u
        SET total_points = COALESCE((
            SELECT SUM(p.points_earned)
            FROM public.predictions p
            WHERE p.user_id = u.id
        ), 0)
        WHERE u.id IS NOT NULL;

    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_calculate_match_points
    AFTER UPDATE OF status, real_home_score, real_away_score
    ON public.matches
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_match_points();


-- ------------------------------------------------------------------------------
-- 5. AUTH.USERS KAYDI OLUŞTUĞUNDA PUBLIC.USERS'A OTOMATİK AKTARMA TRİGGER'I
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role, total_points)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        0
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, public.users.name);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Önceden auth.users'ta oluşturulmuş fakat public.users'ta kaydı olmayan kullanıcıları senkronize etme:
INSERT INTO public.users (id, email, name, role, total_points)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
    COALESCE(raw_user_meta_data->>'role', 'user'),
    0
FROM auth.users
ON CONFLICT (id) DO NOTHING;


-- ------------------------------------------------------------------------------
-- 6. GÜVENLİ ADMIN FONKSİYONU VE ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- ------------------------------------------------------------------------------

-- RLS recursion hatasını önleyen ve büyük/küçük harf duyarsız admin kontrolü
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND LOWER(TRIM(role)) = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- A) USERS TABLOSU POLİTİKALARI
DROP POLICY IF EXISTS "Users are viewable by authenticated users" ON public.users;
DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
CREATE POLICY "Users can view all profiles"
    ON public.users FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile"
    ON public.users FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

-- B) MATCHES TABLOSU POLİTİKALARI
DROP POLICY IF EXISTS "Matches viewable by authenticated users" ON public.matches;
DROP POLICY IF EXISTS "Matches viewable by everyone" ON public.matches;
CREATE POLICY "Matches viewable by everyone"
    ON public.matches FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Admin can insert matches" ON public.matches;
CREATE POLICY "Admin can insert matches"
    ON public.matches FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can update matches" ON public.matches;
CREATE POLICY "Admin can update matches"
    ON public.matches FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete matches" ON public.matches;
CREATE POLICY "Admin can delete matches"
    ON public.matches FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- C) PREDICTIONS TABLOSU POLİTİKALARI
DROP POLICY IF EXISTS "Users can view predictions" ON public.predictions;
CREATE POLICY "Users can view predictions"
    ON public.predictions FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id 
        OR public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.matches m 
            WHERE m.id = match_id 
            AND (m.status = 'finished' OR m.match_date <= timezone('utc'::text, now()))
        )
    );

DROP POLICY IF EXISTS "Users can insert predictions before match starts" ON public.predictions;
CREATE POLICY "Users can insert predictions before match starts"
    ON public.predictions FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        AND (
            public.is_admin()
            OR EXISTS (
                SELECT 1 FROM public.matches m
                WHERE m.id = match_id
                AND m.status = 'pending'
                AND m.match_date > timezone('utc'::text, now())
            )
        )
    );

DROP POLICY IF EXISTS "Users can update predictions before match starts" ON public.predictions;
CREATE POLICY "Users can update predictions before match starts"
    ON public.predictions FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = user_id
        AND (
            public.is_admin()
            OR EXISTS (
                SELECT 1 FROM public.matches m
                WHERE m.id = match_id
                AND m.status = 'pending'
                AND m.match_date > timezone('utc'::text, now())
            )
        )
    );

-- D) ROL VE TABLO İZİNLERİ (GRANTS)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ------------------------------------------------------------------------------
-- 7. ÖRNEK ŞAMPİYONLAR LİGİ MAÇLARI (SEED DATA)
-- ------------------------------------------------------------------------------
INSERT INTO public.matches (home_team, away_team, home_team_logo, away_team_logo, match_date, status, real_home_score, real_away_score)
VALUES 
    (
        'Real Madrid', 
        'Manchester City', 
        'https://images.fotmob.com/image_resources/logo/teamlogo/8633.png', 
        'https://images.fotmob.com/image_resources/logo/teamlogo/8456.png', 
        timezone('utc'::text, now() + interval '2 days 4 hours'), 
        'pending', 
        NULL, 
        NULL
    ),
    (
        'Bayern Munich', 
        'Arsenal', 
        'https://images.fotmob.com/image_resources/logo/teamlogo/9823.png', 
        'https://images.fotmob.com/image_resources/logo/teamlogo/9825.png', 
        timezone('utc'::text, now() + interval '3 days 1 hour'), 
        'pending', 
        NULL, 
        NULL
    ),
    (
        'Paris Saint-Germain', 
        'Barcelona', 
        'https://images.fotmob.com/image_resources/logo/teamlogo/9847.png', 
        'https://images.fotmob.com/image_resources/logo/teamlogo/8634.png', 
        timezone('utc'::text, now() + interval '5 days 6 hours'), 
        'pending', 
        NULL, 
        NULL
    ),
    (
        'Inter', 
        'Atletico Madrid', 
        'https://images.fotmob.com/image_resources/logo/teamlogo/8636.png', 
        'https://images.fotmob.com/image_resources/logo/teamlogo/9906.png', 
        timezone('utc'::text, now() + interval '6 days 3 hours'), 
        'pending', 
        NULL, 
        NULL
    ),
    (
        'Borussia Dortmund', 
        'Liverpool', 
        'https://images.fotmob.com/image_resources/logo/teamlogo/9789.png', 
        'https://images.fotmob.com/image_resources/logo/teamlogo/8650.png', 
        timezone('utc'::text, now() - interval '2 days'), 
        'finished', 
        2, 
        1
    );

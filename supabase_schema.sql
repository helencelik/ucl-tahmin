-- ==============================================================================
-- UEFA ŞAMPİYONLAR LİGİ SKOR TAHMİN UYGULAMASI - EKSİKSİZ MASTER VERİTABANI ŞEMASI
-- ==============================================================================
-- Bu betik, projenin tüm veritabanı altyapısını sıfırdan ve hatasız olarak kurar.
-- İçerik:
-- 1. Tablolar (users, matches, predictions) ve indeksler
-- 2. 4 - 3 - 2 - 0 otomatik puan hesaplama motoru ve tetikleyicisi (Trigger)
-- 3. Otomatik kullanıcı profili senkronizasyonu (auth.users -> public.users)
-- 4. Çok katmanlı admin doğrulama fonksiyonu (is_admin)
-- 5. Row Level Security (RLS) güvenlik politikaları ve yetkilendirmeler (Grants)
-- ==============================================================================

-- 1. GEREKLİ EKLENTİLER
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ESKİ NESNELERİ TEMİZLEME (Temiz ve Çakışmasız Kurulum)
DROP TRIGGER IF EXISTS trg_calculate_match_points ON public.matches;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.calculate_match_points();
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS public.predictions CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ------------------------------------------------------------------------------
-- 3. TABLOLARI OLUŞTURMA
-- ------------------------------------------------------------------------------

-- A) USERS TABLOSU (auth.users ile entegre profil tablosu)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    username TEXT,
    display_name TEXT,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    total_points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Kullanıcı adı için benzersiz küçük harf indeksi
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower ON public.users(LOWER(username));
CREATE INDEX IF NOT EXISTS idx_users_total_points ON public.users(total_points DESC);

-- B) MATCHES TABLOSU (Şampiyonlar Ligi Maçları)
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
    stage TEXT DEFAULT 'league',
    matchweek INTEGER DEFAULT 1,
    stadium TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_match_date ON public.matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_matchweek ON public.matches(matchweek);

-- C) PREDICTIONS TABLOSU (Kullanıcı Tahminleri)
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

CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON public.predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match_id ON public.predictions(match_id);

-- ------------------------------------------------------------------------------
-- 4. OTOMATİK PUAN HESAPLAMA MOTORU (4 - 3 - 2 - 0 SİSTEMİ)
-- ------------------------------------------------------------------------------
-- Kurallar:
-- 1. Tam Skor Bildimi: 4 Puan
-- 2. Skor / Gol Farkı Bildimi: 3 Puan (Örn: Gerçek 4-2, Tahmin 2-0)
-- 3. Maçın Kazananı / Beraberlik: 2 Puan (Sonuç doğru, skor ve fark farklı)
-- 4. Yanlış Tahmin: 0 Puan
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.calculate_match_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
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

            -- 1. Tam skor bildiyse 4 Puan
            IF pred.predicted_home_score = NEW.real_home_score AND pred.predicted_away_score = NEW.real_away_score THEN
                v_points := 4;
            -- 2. Skor / Gol farkını doğru bildiyse 3 Puan (Örn: Gerçek 4-2, tahmin 2-0)
            ELSIF (pred.predicted_home_score - pred.predicted_away_score) = (NEW.real_home_score - NEW.real_away_score) THEN
                v_points := 3;
            -- 3. Maçın kazananını veya beraberliği doğru bildiyse 2 Puan
            ELSIF SIGN(pred.predicted_home_score - pred.predicted_away_score) = SIGN(NEW.real_home_score - NEW.real_away_score) THEN
                v_points := 2;
            ELSE
                v_points := 0;
            END IF;

            -- Tahmini güncelle
            UPDATE public.predictions
            SET points_earned = v_points,
                updated_at = timezone('utc'::text, now())
            WHERE id = pred.id;
        END LOOP;

        -- Kullanıcıların toplam puanlarını otomatik olarak yeniden hesaplayıp güncelle
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
-- 5. AUTH.USERS KAYDI OLUŞTUĞUNDA PUBLIC.USERS'A AKTARMA TRİGGER'I
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_username TEXT;
    v_display_name TEXT;
    v_role TEXT;
BEGIN
    v_username := LOWER(TRIM(COALESCE(
        NEW.raw_user_meta_data->>'username',
        split_part(NEW.email, '@', 1)
    )));
    
    v_display_name := TRIM(COALESCE(
        NEW.raw_user_meta_data->>'display_name',
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        v_username
    ));

    v_role := LOWER(TRIM(COALESCE(
        NEW.raw_user_meta_data->>'role',
        CASE WHEN v_username = 'admin' OR NEW.email LIKE 'admin@%' THEN 'admin' ELSE 'user' END
    )));

    INSERT INTO public.users (id, email, username, display_name, name, role, total_points)
    VALUES (
        NEW.id,
        NEW.email,
        v_username,
        v_display_name,
        v_display_name,
        v_role,
        0
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        username = COALESCE(EXCLUDED.username, public.users.username),
        display_name = COALESCE(EXCLUDED.display_name, public.users.display_name),
        name = COALESCE(EXCLUDED.name, public.users.name),
        role = CASE WHEN public.users.role = 'admin' THEN 'admin' ELSE EXCLUDED.role END;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 6. GÜVENLİ VE ÇOK KATMANLI ADMIN KONTROL FONKSİYONU
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
DECLARE
  v_uid UUID;
  v_email TEXT;
  v_app_role TEXT;
  v_user_role TEXT;
BEGIN
  v_uid := auth.uid();
  v_email := LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', '')));
  v_app_role := LOWER(TRIM(COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '')));
  v_user_role := LOWER(TRIM(COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '')));

  IF v_uid IS NULL AND v_email = '' THEN
    RETURN FALSE;
  END IF;

  -- 1. Token metadata kontrolü
  IF v_app_role = 'admin' OR v_user_role = 'admin' THEN
    RETURN TRUE;
  END IF;

  -- 2. Admin e-posta veya adı kontrolü
  IF v_email LIKE 'admin@%' OR v_email LIKE '%admin%' THEN
    RETURN TRUE;
  END IF;

  -- 3. public.users tablosu kontrolü
  IF EXISTS (
    SELECT 1 FROM public.users
    WHERE (id = v_uid OR LOWER(TRIM(email)) = v_email)
      AND (
        LOWER(TRIM(role)) = 'admin' 
        OR LOWER(TRIM(username)) = 'admin'
        OR LOWER(TRIM(name)) LIKE '%yönetici%'
      )
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- ------------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- A) USERS TABLOSU POLİTİKALARI
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

-- Admin maç sildiğinde veya kullanıcı tahminini sildiğinde cascade izin politikası
DROP POLICY IF EXISTS "Allow delete predictions on cascade or admin" ON public.predictions;
CREATE POLICY "Allow delete predictions on cascade or admin"
    ON public.predictions FOR DELETE
    TO authenticated
    USING (
        auth.uid() = user_id 
        OR public.is_admin() 
        OR NOT EXISTS (SELECT 1 FROM public.matches m WHERE m.id = match_id)
    );

-- D) ROL VE TABLO İZİNLERİ (GRANTS)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ==============================================================================
-- BİLGİLENDİRME:
-- Şampiyonlar Ligi 2026/27 sezonunun 144 lig aşaması maç fikstürünü veritabanına
-- yüklemek için lütfen 'insert_ucl_2026_fixtures.sql' dosyasını çalıştırınız.
-- ==============================================================================

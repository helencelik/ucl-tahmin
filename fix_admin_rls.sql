-- ==============================================================================
-- SUPABASE ADMIN MAÇ EKLEME, SİLME VE RLS YETKİ GÜNCELLEMESİ
-- ==============================================================================
-- Bu SQL betiğini Supabase Dashboard -> SQL Editor alanına yapıştırıp
-- "Run" (veya Ctrl+Enter) ile çalıştırınız.
--
-- Bu betik:
-- 1. `public.is_admin()` fonksiyonunu hem `auth.uid()`, hem `auth.jwt() ->> 'email'`,
--    hem de auth metadata'yı (`app_metadata.role`, `user_metadata.role`) kontrol
--    edecek şekilde çok katmanlı ve kurşungeçirmez hale getirir.
-- 2. `public.users` ile `auth.users` arasındaki ID veya email uyuşmazlıklarını senkronize eder.
-- 3. `matches` tablosuna yöneticinin maç ekleme (INSERT) ve silme (DELETE) izinlerini tam tanımlar.
-- 4. `predictions` tablosuna maç silindiğinde cascade tetiklenmesinin RLS tarafından
--    engellenmesini önleyen DELETE politikasını ekler (Maç silinememe hatasının ana çözümü).
-- 5. Tablo ve şema izinlerini (GRANT) authenticated ve anon rolleri için eksiksiz açar.
-- ==============================================================================

-- 1. ÇOK KATMANLI VE GÜVENLİ IS_ADMIN FONKSİYONU (SECURITY DEFINER)
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
  -- Caller'ın auth ID ve e-postasını al
  v_uid := auth.uid();
  v_email := LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', '')));
  v_app_role := LOWER(TRIM(COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '')));
  v_user_role := LOWER(TRIM(COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '')));

  -- Kullanıcı oturum açmamışsa doğrudan FALSE
  IF v_uid IS NULL AND v_email = '' THEN
    RETURN FALSE;
  END IF;

  -- 1. Kontrol: Supabase Auth metadata içinde admin rolü
  IF v_app_role = 'admin' 
     OR v_user_role = 'admin' 
     OR (auth.jwt() -> 'app_metadata' ->> 'claims_admin')::boolean IS TRUE 
  THEN
    RETURN TRUE;
  END IF;

  -- 2. Kontrol: public.users tablosunda auth.uid() eşleşmesi ve role = 'admin'
  IF v_uid IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = v_uid AND LOWER(TRIM(role)) = 'admin'
  ) THEN
    RETURN TRUE;
  END IF;

  -- 3. Kontrol: public.users tablosunda email eşleşmesi ve role = 'admin' (ID farklı girilmiş olsa dahi)
  IF v_email <> '' AND EXISTS (
    SELECT 1 FROM public.users
    WHERE LOWER(TRIM(email)) = v_email AND LOWER(TRIM(role)) = 'admin'
  ) THEN
    RETURN TRUE;
  END IF;

  -- 4. Kontrol: Ön tanımlı admin e-posta adresleri veya kullanıcı adı
  IF v_email IN ('admin@gmail.com', 'admin@ucl.com') 
     OR LOWER(TRIM(COALESCE(auth.jwt() -> 'user_metadata' ->> 'username', ''))) = 'admin'
  THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

-- Fonksiyon yetkisini ver
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;


-- 2. VERİTABANI KULLANICI SENKRONİZASYONU VE TEMİZLİK
-- A) Mevcut rollerdeki olası 'Admin', 'ADMIN' veya boşlukları küçük harf 'admin' yap
UPDATE public.users 
SET role = LOWER(TRIM(role)) 
WHERE role IS NOT NULL;

-- B) Eğer auth.users ile public.users arasında email eşleştiği halde ID farklıysa ID'yi senkronize et
UPDATE public.users pu
SET id = au.id
FROM auth.users au
WHERE LOWER(TRIM(pu.email)) = LOWER(TRIM(au.email))
  AND pu.id <> au.id;

-- C) auth.users metadata'sında admin olanları public.users tablosuna da admin olarak yansıt
UPDATE public.users pu
SET role = 'admin'
FROM auth.users au
WHERE (pu.id = au.id OR LOWER(TRIM(pu.email)) = LOWER(TRIM(au.email)))
  AND (
    LOWER(TRIM(COALESCE(au.raw_app_meta_data->>'role', ''))) = 'admin'
    OR LOWER(TRIM(COALESCE(au.raw_user_meta_data->>'role', ''))) = 'admin'
  );

-- D) Kullanıcı adı 'admin' veya e-postası 'admin@...' olanları doğrudan admin yap
UPDATE public.users
SET role = 'admin'
WHERE LOWER(TRIM(username)) = 'admin'
   OR LOWER(TRIM(email)) IN ('admin@gmail.com', 'admin@ucl.com');


-- 3. USERS TABLOSU RLS POLİTİKALARI
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

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


-- 4. MATCHES TABLOSU RLS POLİTİKALARI (MAÇ EKLEME, SİLME VE GÜNCELLEME)
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Maçları herkes (anonim ve giriş yapmış kullanıcılar) görebilir
DROP POLICY IF EXISTS "Matches viewable by authenticated users" ON public.matches;
DROP POLICY IF EXISTS "Matches viewable by everyone" ON public.matches;
CREATE POLICY "Matches viewable by everyone"
    ON public.matches FOR SELECT
    TO anon, authenticated
    USING (true);

-- Yalnızca Admin maç ekleyebilir
DROP POLICY IF EXISTS "Admin can insert matches" ON public.matches;
CREATE POLICY "Admin can insert matches"
    ON public.matches FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

-- Yalnızca Admin maç güncelleyebilir (skor girebilir)
DROP POLICY IF EXISTS "Admin can update matches" ON public.matches;
CREATE POLICY "Admin can update matches"
    ON public.matches FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Yalnızca Admin maç silebilir
DROP POLICY IF EXISTS "Admin can delete matches" ON public.matches;
CREATE POLICY "Admin can delete matches"
    ON public.matches FOR DELETE
    TO authenticated
    USING (public.is_admin());


-- 5. PREDICTIONS TABLOSU RLS POLİTİKALARI (VE KRİTİK DELETE POLİTİKASI)
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- Tahminleri görüntüleme
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

-- Tahmin ekleme
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

-- Tahmin güncelleme
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

-- KRİTİK: Maç silindiğinde CASCADE olarak veya admin doğrudan silerken tahminlerin silinmesine izin ver
DROP POLICY IF EXISTS "Admin can delete predictions" ON public.predictions;
DROP POLICY IF EXISTS "Users can delete predictions" ON public.predictions;
CREATE POLICY "Admin can delete predictions"
    ON public.predictions FOR DELETE
    TO authenticated
    USING (public.is_admin() OR auth.uid() = user_id);


-- 6. TABLO VE ŞEMA İZİNLERİNİ (GRANT) YENİLEME
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;


-- 7. OTOMATİK PUAN HESAPLAMA TRİGGER'I ("UPDATE requires a WHERE clause" HATASININ KÖKTEN ÇÖZÜMÜ)
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

            -- 1. Tam skor bildiyse 3 Puan
            IF pred.predicted_home_score = NEW.real_home_score AND pred.predicted_away_score = NEW.real_away_score THEN
                v_points := 3;
            -- 2. Kazananı veya beraberliği doğru bildiyse 1 Puan
            ELSIF SIGN(pred.predicted_home_score - pred.predicted_away_score) = SIGN(NEW.real_home_score - NEW.real_away_score) THEN
                v_points := 1;
            ELSE
                v_points := 0;
            END IF;

            -- Tahmini güncelle (WHERE id = pred.id)
            UPDATE public.predictions
            SET points_earned = v_points,
                updated_at = timezone('utc'::text, now())
            WHERE id = pred.id;
        END LOOP;

        -- Kullanıcıların toplam puanlarını otomatik olarak yeniden hesaplayıp güncelle
        -- (safeupdate 'UPDATE requires a WHERE clause' hatasını önlemek için WHERE u.id IS NOT NULL eklendi)
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

DROP TRIGGER IF EXISTS trg_calculate_match_points ON public.matches;
CREATE TRIGGER trg_calculate_match_points
    AFTER UPDATE OF status, real_home_score, real_away_score
    ON public.matches
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_match_points();


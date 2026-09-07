-- ==============================================================================
-- KULLANICI ADI (USERNAME) VE 10 KİŞİLİK KATILIMCI GÜNCELLEMESİ
-- ==============================================================================
-- Bu SQL betiğini Supabase Dashboard -> SQL Editor alanına yapıştırıp
-- "Run" (veya Ctrl+Enter) ile çalıştırınız.
--
-- Bu betik:
-- 1. `public.users` tablosuna `username` ve `display_name` sütunlarını ekler.
-- 2. `username` alanına benzersiz (LOWER) indeks oluşturur.
-- 3. Mevcut 6 kullanıcıyı (A, B, C, D, E, F) kullanıcı adlarıyla (a, b, c, d, e, f) günceller.
-- 4. Katılımcı sayısını 10 kişiye çıkaracak şekilde yeni 4 katılımcıyı (G, H, I, J) ekler.
-- 5. Yeni kullanıcı kayıt trigger'ını (`handle_new_user`) username ve display_name'i otomatik kaydedecek şekilde günceller.
-- 6. `is_admin()` fonksiyonunu güncelleyerek username 'admin' veya 'a' olan kullanıcıları da yetkilendirir.
-- ==============================================================================

-- 1. SÜTUNLARI EKLEME
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS display_name TEXT;

-- 2. MEVCUT KULLANICILARI GÜNCELLEME (A, B, C, D, E, F)
UPDATE public.users SET 
  username = 'a',
  display_name = 'A (Lig Yöneticisi)',
  name = 'A (Lig Yöneticisi)',
  role = 'admin'
WHERE LOWER(TRIM(name)) = 'a' OR LOWER(TRIM(email)) = '-@gmail.com';

UPDATE public.users SET 
  username = 'b',
  display_name = 'B',
  name = 'B'
WHERE LOWER(TRIM(name)) = 'b' OR LOWER(TRIM(email)) = '--@gmail.com';

UPDATE public.users SET 
  username = 'c',
  display_name = 'C',
  name = 'C'
WHERE LOWER(TRIM(name)) = 'c' OR LOWER(TRIM(email)) = '---@gmail.com';

UPDATE public.users SET 
  username = 'd',
  display_name = 'D',
  name = 'D'
WHERE LOWER(TRIM(name)) = 'd' OR LOWER(TRIM(email)) = '----@gmail.com';

UPDATE public.users SET 
  username = 'e',
  display_name = 'E',
  name = 'E'
WHERE LOWER(TRIM(name)) = 'e' OR LOWER(TRIM(email)) = '-----@gmail.com';

UPDATE public.users SET 
  username = 'f',
  display_name = 'F',
  name = 'F'
WHERE LOWER(TRIM(name)) = 'f' OR LOWER(TRIM(email)) = '------@gmail.com';

-- Diğer olası kullanıcılara otomatik kullanıcı adı ve görünen isim atama
UPDATE public.users 
SET username = LOWER(TRIM(COALESCE(username, split_part(email, '@', 1), name, 'user_' || SUBSTRING(id::text, 1, 6))))
WHERE username IS NULL OR username = '';

UPDATE public.users
SET display_name = COALESCE(display_name, name, username)
WHERE display_name IS NULL OR display_name = '';

-- 3. BENZERSİZ KULLANICI ADI İNDEKSİ
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower ON public.users(LOWER(username));

-- 4. KATILIMCI SAYISINI 10 KİŞİYE TAMAMLAMA (G, H, I, J)
INSERT INTO public.users (id, email, username, display_name, name, role, total_points)
SELECT gen_random_uuid(), 'g@gmail.com', 'g', 'G', 'G', 'user', 0
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE LOWER(username) = 'g' OR LOWER(name) = 'g');

INSERT INTO public.users (id, email, username, display_name, name, role, total_points)
SELECT gen_random_uuid(), 'h@gmail.com', 'h', 'H', 'H', 'user', 0
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE LOWER(username) = 'h' OR LOWER(name) = 'h');

INSERT INTO public.users (id, email, username, display_name, name, role, total_points)
SELECT gen_random_uuid(), 'i@gmail.com', 'i', 'I', 'I', 'user', 0
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE LOWER(username) = 'i' OR LOWER(name) = 'i');

INSERT INTO public.users (id, email, username, display_name, name, role, total_points)
SELECT gen_random_uuid(), 'j@gmail.com', 'j', 'J', 'J', 'user', 0
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE LOWER(username) = 'j' OR LOWER(name) = 'j');


-- 5. AUTH.USERS YENİ KAYIT TRİGGER'INI GÜNCELLEME
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_username TEXT;
  v_display_name TEXT;
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

  INSERT INTO public.users (id, email, username, display_name, name, role, total_points)
  VALUES (
    NEW.id,
    NEW.email,
    v_username,
    v_display_name,
    v_display_name,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    0
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      username = COALESCE(EXCLUDED.username, public.users.username),
      display_name = COALESCE(EXCLUDED.display_name, public.users.display_name),
      name = COALESCE(EXCLUDED.name, public.users.name);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- 6. GÜÇLENDİRİLMİŞ IS_ADMIN FONKSİYONU
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

  -- 1. Metadata kontrolü
  IF v_app_role = 'admin' 
     OR v_user_role = 'admin' 
     OR (auth.jwt() -> 'app_metadata' ->> 'claims_admin')::boolean IS TRUE 
  THEN
    RETURN TRUE;
  END IF;

  -- 2. public.users tablosunda auth.uid() eşleşmesi ve role = 'admin'
  IF v_uid IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = v_uid AND LOWER(TRIM(role)) = 'admin'
  ) THEN
    RETURN TRUE;
  END IF;

  -- 3. Username 'admin' veya 'a' olan kullanıcılar
  IF v_uid IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = v_uid AND (LOWER(TRIM(username)) IN ('admin', 'a') OR LOWER(TRIM(name)) = 'admin')
  ) THEN
    RETURN TRUE;
  END IF;

  -- 4. E-posta eşleşmesi
  IF v_email <> '' AND EXISTS (
    SELECT 1 FROM public.users
    WHERE LOWER(TRIM(email)) = v_email AND LOWER(TRIM(role)) = 'admin'
  ) THEN
    RETURN TRUE;
  END IF;

  IF v_email IN ('admin@ucl.com', 'admin@ucl.app', '-@gmail.com') THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- 7. TABLO VE ŞEMA İZİNLERİNİ TAZELEME
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

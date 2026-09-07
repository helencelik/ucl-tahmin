-- ==============================================================================
-- PUAN SİSTEMİ VE KURALLARI GÜNCELLEMESİ (4 - 3 - 2 - 0 SİSTEMİ)
-- ==============================================================================
-- Bu SQL betiğini Supabase Dashboard -> SQL Editor alanına yapıştırıp
-- "Run" (veya Ctrl+Enter) ile çalıştırınız.
--
-- Puanlama Kuralları:
-- 1. Tam Skor Bildimi: 4 Puan (Maçın skoru tam olarak bilinirse)
-- 2. Skor / Gol Farkı Bildimi: 3 Puan (Skor tam bilinmese bile fark tutarsa, Örn: Gerçek 4-2, Tahmin 2-0)
-- 3. Maçın Kazananı / Kaybedeni (Sonuç): 2 Puan (Sadece kazanan takım veya beraberlik bilinirse)
-- 4. Yanlış Tahmin veya Tahmin Yapılmamışsa: 0 Puan
--
-- "Tahminlerinizi maç başlamadan yapın; maç başladıktan sonra tahmin girişi veya değişikliği yapılamaz."
-- ==============================================================================

-- 1. PUAN HESAPLAMA TRİGGER FONKSİYONUNU YENİ KURALLARA GÖRE GÜNCELLEME
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
            -- 2. Skor / Gol farkını doğru bildiyse 3 Puan (Örn: Gerçek 4-2 bitti, tahmin 2-0)
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

DROP TRIGGER IF EXISTS trg_calculate_match_points ON public.matches;
CREATE TRIGGER trg_calculate_match_points
    AFTER UPDATE OF status, real_home_score, real_away_score
    ON public.matches
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_match_points();


-- 2. MEVCUT BİTMİŞ MAÇLAR VE TAHMİNLER VARSA YENİ SİSTEME GÖRE GERİYE DÖNÜK YENİDEN HESAPLAMA
DO $$
DECLARE
    m RECORD;
    pred RECORD;
    v_points INTEGER;
BEGIN
    FOR m IN SELECT * FROM public.matches WHERE status = 'finished' AND real_home_score IS NOT NULL AND real_away_score IS NOT NULL LOOP
        FOR pred IN SELECT * FROM public.predictions WHERE match_id = m.id LOOP
            v_points := 0;
            IF pred.predicted_home_score = m.real_home_score AND pred.predicted_away_score = m.real_away_score THEN
                v_points := 4;
            ELSIF (pred.predicted_home_score - pred.predicted_away_score) = (m.real_home_score - m.real_away_score) THEN
                v_points := 3;
            ELSIF SIGN(pred.predicted_home_score - pred.predicted_away_score) = SIGN(m.real_home_score - m.real_away_score) THEN
                v_points := 2;
            ELSE
                v_points := 0;
            END IF;

            UPDATE public.predictions
            SET points_earned = v_points,
                updated_at = timezone('utc'::text, now())
            WHERE id = pred.id;
        END LOOP;
    END LOOP;

    -- Kullanıcıların toplam puanlarını yenile
    UPDATE public.users u
    SET total_points = COALESCE((
        SELECT SUM(p.points_earned)
        FROM public.predictions p
        WHERE p.user_id = u.id
    ), 0)
    WHERE u.id IS NOT NULL;
END;
$$;

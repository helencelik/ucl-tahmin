import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isDemo: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, displayName: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Supabase henüz yapılandırılmamışsa veya test/demo amaçlı kullanılacak 10 kişilik hesaplar
const DEMO_ACCOUNTS: Record<string, UserProfile> = {
  admin: {
    id: 'bc4b67a1-a8e0-41b4-8604-04f0585ab7f6',
    username: 'admin',
    display_name: 'Administrator',
    name: 'Administrator',
    email: 'admin@gmail.com',
    role: 'admin',
    total_points: 0,
    created_at: new Date().toISOString()
  },
  abdullah: {
    id: 'a342f20f-7591-453e-8afd-98d72a46bba2',
    username: 'abdullah',
    display_name: 'Abdullah Çelik',
    name: 'Abdullah Çelik',
    email: 'abdullah@gmail.com',
    role: 'user',
    total_points: 0,
    created_at: new Date().toISOString()
  },
  enes: {
    id: '1fbec0eb-bdb4-4a8e-b139-c4c1a6136f1c',
    username: 'enes',
    display_name: 'Enes Can Özdemir',
    name: 'Enes Can Özdemir',
    email: 'enes@gmail.com',
    role: 'user',
    total_points: 0,
    created_at: new Date().toISOString()
  },
  onur: {
    id: '37a07a28-fe10-4b2a-befd-9823122cd1dc',
    username: 'onur',
    display_name: 'Onur Can Tarakçı',
    name: 'Onur Can Tarakçı',
    email: 'onur@gmail.com',
    role: 'user',
    total_points: 0,
    created_at: new Date().toISOString()
  },
  emrullah: {
    id: '87ac18c8-96bb-42ec-ac90-fca694bf176e',
    username: 'emrullah',
    display_name: 'Mete Emrullah Akyüz',
    name: 'Mete Emrullah Akyüz',
    email: 'emrullah@gmail.com',
    role: 'user',
    total_points: 0,
    created_at: new Date().toISOString()
  },
  oguzhan: {
    id: 'b3186800-09eb-4f8f-9593-3815dd05a38d',
    username: 'oguzhan',
    display_name: 'Oğuzhan Yeşilkaya',
    name: 'Oğuzhan Yeşilkaya',
    email: 'oguzhan@gmail.com',
    role: 'user',
    total_points: 0,
    created_at: new Date().toISOString()
  },
  yasin: {
    id: 'caaeebcf-2e31-4d0b-b2b4-398b81a6a1a6',
    username: 'yasin',
    display_name: 'Yasin Başoğlu',
    name: 'Yasin Başoğlu',
    email: 'yasin@gmail.com',
    role: 'user',
    total_points: 0,
    created_at: new Date().toISOString()
  },
  nurullah: {
    id: 'e503e16f-117d-405b-9ebf-ac006899e4ab',
    username: 'nurullah',
    display_name: 'Nurullah Karabağ',
    name: 'Nurullah Karabağ',
    email: 'nurullah@gmail.com',
    role: 'user',
    total_points: 0,
    created_at: new Date().toISOString()
  },
  ismail: {
    id: 'f3b527a2-0b31-4be0-aac2-a2fcb8a50bd7',
    username: 'ismail',
    display_name: 'İsmail Berat Çelik',
    name: 'İsmail Berat Çelik',
    email: 'ismail@gmail.com',
    role: 'user',
    total_points: 0,
    created_at: new Date().toISOString()
  },
  ahmetcan: {
    id: 'f4f4f428-fe49-413d-b240-7773698ef33b',
    username: 'ahmetcan',
    display_name: 'Ahmet Can Güllüce',
    name: 'Ahmet Can Güllüce',
    email: 'ahmetcan@gmail.com',
    role: 'user',
    total_points: 0,
    created_at: new Date().toISOString()
  },
  test: {
    id: '56cac67a-ebbb-42ce-b50c-ef9d789eef7b',
    username: 'test',
    display_name: 'test',
    name: 'test',
    email: 'test@gmail.com',
    role: 'user',
    total_points: 0,
    created_at: new Date().toISOString()
  }
};

// Hızlı takma adlar
DEMO_ACCOUNTS['a'] = DEMO_ACCOUNTS['admin'];
DEMO_ACCOUNTS['b'] = DEMO_ACCOUNTS['abdullah'];
DEMO_ACCOUNTS['c'] = DEMO_ACCOUNTS['enes'];
DEMO_ACCOUNTS['d'] = DEMO_ACCOUNTS['onur'];
DEMO_ACCOUNTS['e'] = DEMO_ACCOUNTS['emrullah'];
DEMO_ACCOUNTS['f'] = DEMO_ACCOUNTS['oguzhan'];
DEMO_ACCOUNTS['g'] = DEMO_ACCOUNTS['yasin'];
DEMO_ACCOUNTS['h'] = DEMO_ACCOUNTS['nurullah'];
DEMO_ACCOUNTS['i'] = DEMO_ACCOUNTS['ismail'];
DEMO_ACCOUNTS['j'] = DEMO_ACCOUNTS['ahmetcan'];

const LS_AUTH_KEY = 'ucl_demo_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemo = !isSupabaseConfigured();

  const normalizeRole = (role?: any): 'admin' | 'user' => {
    if (!role) return 'user';
    const cleaned = String(role).trim().toLowerCase();
    return cleaned === 'admin' ? 'admin' : 'user';
  };

  const fetchProfile = async (
    userOrId: string | { id: string; email?: string; user_metadata?: Record<string, any>; app_metadata?: Record<string, any> }
  ): Promise<UserProfile | null> => {
    try {
      const userId = typeof userOrId === 'string' ? userOrId : userOrId.id;
      let authUser = typeof userOrId === 'object' ? userOrId : null;

      // 1. Veritabanından mevcut profili sorgula (Öncelikle auth id ile)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[AuthContext] public.users tablosundan profil okunurken hata:', error);
      }

      if (data) {
        let detectedRole = normalizeRole(data.role);
        const resolvedUsername = data.username || (data.email ? data.email.split('@')[0] : '');
        const exactName = data.name || data.display_name || resolvedUsername;

        // KRİTİK GÜVENCE: Kullanıcı adı veya e-postası 'admin' olan hesaplar her halükarda admin yapılır
        if (
          resolvedUsername.toLowerCase() === 'admin' ||
          (data.email && (data.email.toLowerCase().startsWith('admin@') || data.email.toLowerCase() === 'admin@gmail.com' || data.email.toLowerCase() === 'admin@ucl.com')) ||
          String(data.role).toLowerCase().trim() === 'admin'
        ) {
          detectedRole = 'admin';
        }

        return {
          ...data,
          username: resolvedUsername,
          display_name: data.display_name || data.name || resolvedUsername,
          name: exactName,
          role: detectedRole
        } as UserProfile;
      }

      // 2. Profil id ile doğrudan bulunamadıysa, auth bilgilerini toparla
      if (!authUser) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user && userData.user.id === userId) {
          authUser = userData.user;
        }
      }

      const rawEmail = authUser?.email || '';
      const normalizedEmail = rawEmail.toLowerCase();
      const meta = authUser?.user_metadata || {};
      const appMeta = authUser?.app_metadata || {};

      // 3. ID ile bulunamadıysa E-posta veya Username ile veritabanında ara
      if (rawEmail) {
        const { data: emailData, error: emailErr } = await supabase
          .from('users')
          .select('*')
          .ilike('email', rawEmail)
          .maybeSingle();

        if (emailErr) {
          console.warn('[AuthContext] E-posta ile kullanıcı profili aranırken hata:', emailErr);
        }

        if (emailData) {
          let detectedRole = normalizeRole(emailData.role);
          const resolvedUsername = emailData.username || meta.username || rawEmail.split('@')[0];
          const resolvedDisplayName = emailData.display_name || emailData.name || meta.display_name || resolvedUsername;

          if (
            resolvedUsername.toLowerCase() === 'admin' ||
            normalizedEmail.startsWith('admin@') ||
            normalizedEmail === 'admin@gmail.com' ||
            normalizedEmail === 'admin@ucl.com' ||
            String(emailData.role).toLowerCase().trim() === 'admin'
          ) {
            detectedRole = 'admin';
          }

          // Eğer veritabanındaki id ile auth id farklıysa, id'yi senkronize et
          if (emailData.id !== userId) {
            await supabase
              .from('users')
              .update({ id: userId, role: detectedRole, username: resolvedUsername, display_name: resolvedDisplayName })
              .eq('id', emailData.id);
          }

          return {
            ...emailData,
            id: userId,
            username: resolvedUsername,
            display_name: resolvedDisplayName,
            name: resolvedDisplayName,
            role: detectedRole
          } as UserProfile;
        }
      }

      // 4. Profil public.users'ta kesinlikle yoksa türet:
      const derivedUsername = meta.username || (rawEmail ? rawEmail.split('@')[0] : 'kullanici');
      const derivedDisplayName = meta.display_name || meta.name || meta.full_name || derivedUsername;

      // Rolü belirle: Auth metadata, app_metadata veya admin e-postası / kullanıcı adı
      const isMetaAdmin =
        normalizeRole(meta.role) === 'admin' ||
        normalizeRole(appMeta.role) === 'admin' ||
        appMeta.claims_admin === true ||
        derivedUsername.toLowerCase() === 'admin' ||
        normalizedEmail === 'admin@ucl.com' ||
        normalizedEmail === 'admin@gmail.com' ||
        normalizedEmail.startsWith('admin@');

      const derivedRole: 'admin' | 'user' = isMetaAdmin ? 'admin' : 'user';

      const newRecord = {
        id: userId,
        email: rawEmail || `${derivedUsername}@gmail.com`,
        username: derivedUsername,
        display_name: derivedDisplayName,
        name: derivedDisplayName,
        role: derivedRole,
        total_points: 0
      };

      // 5. Yeni profili güvenli şekilde ekle
      const { data: inserted, error: insertErr } = await supabase
        .from('users')
        .insert([newRecord])
        .select()
        .maybeSingle();

      if (inserted) {
        return {
          ...inserted,
          username: inserted.username || derivedUsername,
          display_name: inserted.display_name || derivedDisplayName,
          name: inserted.name || derivedDisplayName,
          role: normalizeRole(inserted.role)
        } as UserProfile;
      }

      if (insertErr) {
        console.warn('[AuthContext] Otomatik profil oluşturma uyarısı:', insertErr);
        const { data: retryData } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (retryData) {
          return {
            ...retryData,
            username: retryData.username || derivedUsername,
            display_name: retryData.display_name || derivedDisplayName,
            name: retryData.name || derivedDisplayName,
            role: normalizeRole(retryData.role)
          } as UserProfile;
        }
      }

      return {
        id: userId,
        email: rawEmail || `${derivedUsername}@ucl.app`,
        username: derivedUsername,
        display_name: derivedDisplayName,
        name: derivedDisplayName,
        role: derivedRole,
        total_points: 0,
        created_at: new Date().toISOString()
      };
    } catch (err) {
      console.error('[AuthContext] fetchProfile beklenmeyen hata:', err);
      const id = typeof userOrId === 'string' ? userOrId : userOrId.id;
      return {
        id,
        email: '',
        username: 'kullanici',
        display_name: 'Kullanıcı',
        name: 'Kullanıcı',
        role: 'user',
        total_points: 0,
        created_at: new Date().toISOString()
      };
    }
  };

  const refreshProfile = async () => {
    if (isDemo) {
      const saved = localStorage.getItem(LS_AUTH_KEY);
      if (saved) setUser(JSON.parse(saved));
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const profile = await fetchProfile(session.user);
      if (profile) setUser(profile);
    }
  };

  useEffect(() => {
    if (isDemo) {
      const saved = localStorage.getItem(LS_AUTH_KEY);
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch {
          setUser(DEMO_ACCOUNTS['abdullah']);
        }
      } else {
        setUser(DEMO_ACCOUNTS['abdullah']);
        localStorage.setItem(LS_AUTH_KEY, JSON.stringify(DEMO_ACCOUNTS['abdullah']));
      }
      setLoading(false);
      return;
    }

    // Gerçek Supabase Auth oturum kontrolü
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await fetchProfile(session.user);
          setUser(profile);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Supabase Auth durum değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isDemo]);

  // KULLANICI ADI (VEYA E-POSTA) VE ŞİFRE İLE GİRİŞ YAPMA
  const login = async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const clean = identifier.trim();
    if (!clean) {
      return { success: false, error: 'Lütfen kullanıcı adınızı giriniz.' };
    }

    if (!password) {
      return { success: false, error: 'Lütfen şifrenizi giriniz.' };
    }

    if (isDemo) {
      const lower = clean.toLowerCase();
      if (lower === 'admin' || lower === 'a' || lower === 'admin@ucl.com' || lower.includes('admin')) {
        const adminAcc = DEMO_ACCOUNTS['admin'];
        setUser(adminAcc);
        localStorage.setItem(LS_AUTH_KEY, JSON.stringify(adminAcc));
        return { success: true };
      }

      const matched = DEMO_ACCOUNTS[lower] || Object.values(DEMO_ACCOUNTS).find(
        (acc) => acc.username?.toLowerCase() === lower || acc.name.toLowerCase() === lower || acc.email?.toLowerCase() === lower
      ) || {
        id: 'demo-user-' + lower.replace(/[^a-z0-9]/g, ''),
        email: `${lower}@ucl.app`,
        username: lower,
        name: clean,
        display_name: clean,
        role: 'user' as const,
        total_points: 0,
        created_at: new Date().toISOString()
      };

      setUser(matched);
      localStorage.setItem(LS_AUTH_KEY, JSON.stringify(matched));
      return { success: true };
    }

    try {
      let targetEmail = clean;

      // Kullanıcı sadece username girdiğinde arka planda otomatik olarak @gmail.com formatına dönüştür
      if (!clean.includes('@')) {
        targetEmail = `${clean.toLowerCase()}@gmail.com`;

        // Eğer veritabanında bu username veya name için önceden tanımlanmış özel bir email varsa onu kullan
        const { data: userRecord, error: userLookupErr } = await supabase
          .from('users')
          .select('id, email, username, name')
          .or(`username.ilike.${clean},name.ilike.${clean}`)
          .maybeSingle();

        if (userLookupErr) {
          console.warn('[AuthContext] Kullanıcı sorgulama uyarısı:', userLookupErr);
        }

        if (userRecord?.email) {
          targetEmail = userRecord.email;
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password
      });

      if (error) {
        return { success: false, error: 'Giriş yapılamadı. Kullanıcı adı veya şifre hatalı.' };
      }

      if (data.user) {
        const profile = await fetchProfile(data.user);
        if (!profile) {
          return { success: false, error: 'Kullanıcı profili veritabanında bulunamadı.' };
        }
        setUser(profile);
        return { success: true };
      }

      return { success: false, error: 'Giriş yapılamadı.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Bilinmeyen bir hata oluştu.' };
    }
  };

  // KULLANICI ADI, GÖRÜNEN İSİM VE ŞİFRE İLE KAYIT OLMA (E-POSTA ZORUNLULUĞU YOK)
  const register = async (username: string, displayName: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const cleanDisplayName = displayName.trim() || cleanUsername;

    if (!cleanUsername) {
      return { success: false, error: 'Lütfen geçerli bir kullanıcı adı giriniz (harf, rakam veya alt çizgi).' };
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'Şifreniz en az 6 karakter uzunluğunda olmalıdır.' };
    }

    if (isDemo) {
      const newAcc: UserProfile = {
        id: 'demo-user-' + cleanUsername,
        username: cleanUsername,
        display_name: cleanDisplayName,
        name: cleanDisplayName,
        email: `${cleanUsername}@ucl.app`,
        role: 'user',
        total_points: 0,
        created_at: new Date().toISOString()
      };
      DEMO_ACCOUNTS[cleanUsername] = newAcc;
      setUser(newAcc);
      localStorage.setItem(LS_AUTH_KEY, JSON.stringify(newAcc));
      return { success: true };
    }

    try {
      // 1. Kullanıcı adının önceden alınıp alınmadığını kontrol et
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, username')
        .or(`username.ilike.${cleanUsername},name.ilike.${cleanUsername}`)
        .maybeSingle();

      if (existingUser) {
        return { success: false, error: `"${cleanUsername}" kullanıcı adı zaten kullanımda. Farklı bir kullanıcı adı seçiniz.` };
      }

      // 2. Supabase auth signUp çağrısı (arka planda username@gmail.com formatı ile)
      const internalEmail = cleanUsername.includes('@') ? cleanUsername.toLowerCase() : `${cleanUsername}@gmail.com`;
      const { data, error } = await supabase.auth.signUp({
        email: internalEmail,
        password,
        options: {
          data: {
            username: cleanUsername,
            display_name: cleanDisplayName,
            name: cleanDisplayName,
            role: 'user'
          }
        }
      });

      if (error) {
        return { success: false, error: error.message || 'Kayıt işlemi gerçekleştirilemedi.' };
      }

      if (data.user) {
        // 3. public.users tablosuna da doğrudan kaydet
        await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email: internalEmail,
            username: cleanUsername,
            display_name: cleanDisplayName,
            name: cleanDisplayName,
            role: 'user',
            total_points: 0
          }, { onConflict: 'id' });

        const profile = await fetchProfile(data.user);
        if (profile) setUser(profile);
        return { success: true };
      }

      return { success: false, error: 'Kayıt oluşturulamadı.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Kayıt sırasında bir hata oluştu.' };
    }
  };

  const logout = async () => {
    if (isDemo) {
      localStorage.removeItem(LS_AUTH_KEY);
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isDemo, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

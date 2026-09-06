import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Supabase henüz yapılandırılmamışsa veya demo amaçlı kullanılacak ön tanımlı hesaplar
const DEMO_ACCOUNTS: Record<string, UserProfile> = {
  'admin@ucl.com': {
    id: 'admin-id',
    email: 'admin@ucl.com',
    name: 'Lig Yöneticisi',
    role: 'admin',
    total_points: 0,
    created_at: new Date().toISOString()
  },
  'user1@ucl.com': {
    id: 'u1',
    email: 'user1@ucl.com',
    name: 'Ahmet Yılmaz',
    role: 'user',
    total_points: 12,
    created_at: new Date().toISOString()
  },
  'user2@ucl.com': {
    id: 'u2',
    email: 'user2@ucl.com',
    name: 'Mehmet Demir',
    role: 'user',
    total_points: 9,
    created_at: new Date().toISOString()
  }
};

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
        console.error('[AuthContext] public.users tablosundan profil okunurken hata (RLS izinlerini kontrol ediniz):', error);
      }

      if (data) {
        const detectedRole = normalizeRole(data.role);
        console.log(`[AuthContext] Kullanıcı profili veritabanından başarıyla okundu. Rol: ${detectedRole} (Ham veritabanı değeri: "${data.role}")`);
        return {
          ...data,
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

      // 3. ID ile bulunamadıysa E-posta ile veritabanında ara (kullanıcı manuel satır eklediyse veya id farklıysa)
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
          const detectedRole = normalizeRole(emailData.role);
          console.log(`[AuthContext] Kullanıcı e-posta (${rawEmail}) ile veritabanında bulundu. Rol: ${detectedRole}`);

          // Eğer veritabanındaki id ile auth id farklıysa, id'yi senkronize et
          if (emailData.id !== userId) {
            await supabase
              .from('users')
              .update({ id: userId, role: detectedRole })
              .eq('id', emailData.id);
          }

          return {
            ...emailData,
            id: userId,
            role: detectedRole
          } as UserProfile;
        }
      }

      // 4. Profil public.users'ta kesinlikle yoksa:
      const derivedName =
        meta.name ||
        meta.full_name ||
        (rawEmail ? rawEmail.split('@')[0] : 'Kullanıcı');

      // Rolü belirle: Auth metadata, app_metadata veya admin e-postası
      const isMetaAdmin =
        normalizeRole(meta.role) === 'admin' ||
        normalizeRole(appMeta.role) === 'admin' ||
        appMeta.claims_admin === true ||
        normalizedEmail === 'admin@ucl.com' ||
        normalizedEmail.includes('admin');

      const derivedRole: 'admin' | 'user' = isMetaAdmin ? 'admin' : 'user';

      const newRecord = {
        id: userId,
        email: rawEmail,
        name: derivedName,
        role: derivedRole,
        total_points: 0
      };

      // 5. Yeni profili güvenli şekilde ekle (Var olan admin yetkisini ezmemek için sadece insert)
      const { data: inserted, error: insertErr } = await supabase
        .from('users')
        .insert([newRecord])
        .select()
        .maybeSingle();

      if (inserted) {
        return {
          ...inserted,
          role: normalizeRole(inserted.role)
        } as UserProfile;
      }

      if (insertErr) {
        console.warn('[AuthContext] Otomatik profil oluşturma uyarısı (kayıt zaten var olabilir):', insertErr);
        // Hata durumunda (örneğin kayıt zaten varsa) tekrar okumayı dene
        const { data: retryData } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (retryData) {
          return {
            ...retryData,
            role: normalizeRole(retryData.role)
          } as UserProfile;
        }
      }

      // Veritabanına anlık yazılamasa bile arayüzün kilitlenmesini önle
      return {
        id: userId,
        email: rawEmail,
        name: derivedName,
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
      // Demo modunda localStorage'dan aktif hesabı oku (varsayılan Ahmet Yılmaz)
      const saved = localStorage.getItem(LS_AUTH_KEY);
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch {
          setUser(DEMO_ACCOUNTS['user1@ucl.com']);
        }
      } else {
        setUser(DEMO_ACCOUNTS['user1@ucl.com']);
        localStorage.setItem(LS_AUTH_KEY, JSON.stringify(DEMO_ACCOUNTS['user1@ucl.com']));
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

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (isDemo) {
      const normalizedEmail = email.trim().toLowerCase();
      // Demo modunda admin veya kullanıcı girişi
      if (normalizedEmail.includes('admin') || normalizedEmail === 'admin@ucl.com') {
        const adminAcc = DEMO_ACCOUNTS['admin@ucl.com'];
        setUser(adminAcc);
        localStorage.setItem(LS_AUTH_KEY, JSON.stringify(adminAcc));
        return { success: true };
      } else {
        const matched = DEMO_ACCOUNTS[normalizedEmail] || {
          id: 'demo-user-' + normalizedEmail.replace(/[^a-z0-9]/g, ''),
          email: normalizedEmail,
          name: normalizedEmail.split('@')[0],
          role: 'user' as const,
          total_points: 0,
          created_at: new Date().toISOString()
        };
        setUser(matched);
        localStorage.setItem(LS_AUTH_KEY, JSON.stringify(matched));
        return { success: true };
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        return { success: false, error: error.message };
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
    <AuthContext.Provider value={{ user, loading, isDemo, login, logout, refreshProfile }}>
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

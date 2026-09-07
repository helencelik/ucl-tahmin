import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onSuccessLogin: (role?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccessLogin }) => {
  const { login, isDemo } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUsername = username.trim();

    if (!cleanUsername) {
      setErrorMsg('Lütfen kullanıcı adınızı giriniz.');
      return;
    }

    if (!password) {
      setErrorMsg('Lütfen şifrenizi giriniz.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(cleanUsername, password);
      if (res.success) {
        onSuccessLogin(cleanUsername === 'admin' ? 'admin' : 'user');
      } else {
        setErrorMsg(res.error || 'Giriş yapılamadı. Kullanıcı adı veya şifrenizi kontrol ediniz.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Bir hata oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo hızlı test doldurma
  const fillDemoCredentials = (userKey: string) => {
    if (userKey === 'admin') {
      setUsername('admin');
      setPassword('admin1234');
    } else {
      setUsername(userKey);
      setPassword('user1234');
    }
    setErrorMsg('');
  };

  return (
    <div className="login-page">
      <div className="login-background-glow"></div>

      <div className="login-card">
        {/* UCL Header Logo */}
        <div className="login-header">
          <div className="starball-badge">
            <img src="/champions-league.svg" alt="UEFA Champions League" className="login-starball" />
          </div>
          <h1 className="login-title">CHAMPIONS LEAGUE</h1>
          <p className="login-subtitle">Skor Tahmin Ligi Giriş</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="login-alert-error">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Username Field */}
          <div className="login-field-group">
            <label className="field-label">Kullanıcı Adı</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                type="text"
                className="login-input"
                placeholder="Kullanıcı Adı"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                autoComplete="username"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="login-field-group">
            <label className="field-label">Şifre</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                className="login-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-login-submit" disabled={isLoading}>
            {isLoading ? (
              <span className="btn-loading-text">Giriş Yapılıyor...</span>
            ) : (
              <>
                <span>Giriş Yap</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Logins (Sadece demo modunda görünür) */}
        {isDemo && (
          <div className="demo-credentials-helper">
            <span className="helper-label">Hızlı Giriş:</span>
            <div className="quick-fill-buttons">
              <button
                type="button"
                className="btn-quick-fill admin"
                onClick={() => fillDemoCredentials('admin')}
              >
                Admin
              </button>
              <button
                type="button"
                className="btn-quick-fill user"
                onClick={() => fillDemoCredentials('abdullah')}
              >
                Abdullah
              </button>
              <button
                type="button"
                className="btn-quick-fill user"
                onClick={() => fillDemoCredentials('enes')}
              >
                Enes
              </button>
              <button
                type="button"
                className="btn-quick-fill user"
                onClick={() => fillDemoCredentials('onur')}
              >
                Onur
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

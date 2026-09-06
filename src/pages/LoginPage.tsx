import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginPageProps {
  onSuccessLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccessLogin }) => {
  const { login, isDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Lütfen e-posta ve şifrenizi giriniz.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await login(email, password);
      if (res.success) {
        onSuccessLogin();
      } else {
        setErrorMsg(res.error || 'Giriş yapılamadı. Bilgilerinizi kontrol ediniz.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Giriş sırasında bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo hızlı doldurma
  const fillDemoCredentials = (role: 'admin' | 'user') => {
    if (role === 'admin') {
      setEmail('admin@ucl.com');
      setPassword('admin1234');
    } else {
      setEmail('user1@ucl.com');
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
          <p className="login-subtitle">Skor Tahmin Ligi Giriş Ekranı</p>
        </div>

        {/* Info Pill */}
        <div className="private-league-notice">
          <ShieldCheck size={16} />
          <span>Bu lig özel bir davet ligidir. Dışarıdan yeni kayıt kabul edilmemektedir.</span>
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
          <div className="login-field-group">
            <label className="field-label">E-Posta Adresi</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                className="login-input"
                placeholder="ornek@ucl.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

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

        {/* Demo Fast Logins (when in demo or testing) */}
        {isDemo && (
          <div className="demo-credentials-helper">
            <span className="helper-label">Hızlı Test Girişi:</span>
            <div className="quick-fill-buttons">
              <button
                type="button"
                className="btn-quick-fill admin"
                onClick={() => fillDemoCredentials('admin')}
              >
                Admin Hesabı
              </button>
              <button
                type="button"
                className="btn-quick-fill user"
                onClick={() => fillDemoCredentials('user')}
              >
                Kullanıcı Hesabı
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

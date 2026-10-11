import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth, OFFICIAL_ADMIN_ID } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

interface LoginPageProps {
  onLoginSuccess: (isAdmin: boolean) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const { settings } = useSettings();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Mohon lengkapi email dan kata sandi Anda.');
      return;
    }

    setIsLoading(true);
    const { error, data, isAdmin } = await signInWithEmail(email, password);
    setIsLoading(false);

    if (error) {
      const msg = error.message.toLowerCase();
      if (
        msg.includes('invalid login credentials') ||
        msg.includes('invalid grant') ||
        msg.includes('user not found')
      ) {
        setErrorMsg('Email atau kata sandi salah. Silakan periksa kembali akun Supabase Anda.');
      } else if (msg.includes('email not confirmed')) {
        setErrorMsg('Email belum dikonfirmasi. Silakan verifikasi email Anda di Supabase.');
      } else {
        setErrorMsg(error.message || 'Gagal masuk ke sistem Supabase.');
      }
      return;
    }

    // Logic Pengecekan Admin & Redireksi Setelah Login
    const loggedInUser = data?.user;
    const isOfficialAdmin =
      isAdmin ||
      loggedInUser?.id === OFFICIAL_ADMIN_ID ||
      loggedInUser?.app_metadata?.role === 'admin' ||
      loggedInUser?.user_metadata?.role === 'admin';

    if (isOfficialAdmin) {
      setSuccessMsg('Autentikasi Administrator Berhasil! Mengalihkan ke Portal Admin...');
    } else {
      setSuccessMsg('Autentikasi Berhasil! Mengalihkan ke Dashboard Pasien...');
    }

    setTimeout(() => {
      onLoginSuccess(isOfficialAdmin);
    }, 600);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName || !email || !password) {
      setErrorMsg('Semua data pendaftaran wajib diisi.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.');
      return;
    }

    setIsLoading(true);
    const { error, data } = await signUpWithEmail(email, password, fullName);
    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Pendaftaran akun gagal. Silakan coba lagi.');
      return;
    }

    const newUser = data?.user;
    const isOfficialAdmin =
      newUser?.id === OFFICIAL_ADMIN_ID ||
      newUser?.app_metadata?.role === 'admin' ||
      newUser?.user_metadata?.role === 'admin';

    setSuccessMsg('Akun berhasil didaftarkan di Supabase Auth! Mengalihkan...');

    setTimeout(() => {
      onLoginSuccess(isOfficialAdmin);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-mesh flex flex-col justify-center items-center px-4 py-8 relative selection:bg-[#FF5C50] selection:text-white">
      {/* Background Decorative Ambient Watermark */}
      <div className="fixed inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden z-0 opacity-[0.03]">
        <span className="text-[18vw] font-black uppercase tracking-tighter text-slate-900 leading-none">
          {settings.brandName || 'PARU-PARU'}
        </span>
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/10 mb-2">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.3"
              viewBox="0 0 24 24"
            >
              <path d="M2 12h3l3-7 4 14 3-7h4" />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {settings.brandName || 'PARU-PARU'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xs mx-auto">
            Portal Masuk &amp; Autentikasi Sistem Pemeriksaan Paru-Paru
          </p>
        </div>

        {/* Main Authentication Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/90">
          {/* Tab Switcher: [Masuk Akun] vs [Daftar Akun Baru] */}
          <div className="flex bg-slate-100/80 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Masuk Akun
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Daftar Akun Baru
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: FORM MASUK AKUN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Akun Supabase
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    autoComplete="email"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/90 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5C50] focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/90 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5C50] focus:border-transparent transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#FF5C50] to-[#FF7368] hover:from-[#E0483C] hover:to-[#FF5C50] text-white font-bold text-sm tracking-wide shadow-lg shadow-rose-500/20 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Akun Supabase...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Sistem</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: FORM DAFTAR AKUN BARU */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nama Lengkap Anda"
                    autoComplete="name"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/90 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5C50] focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    autoComplete="email"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/90 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5C50] focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kata Sandi (Min. 6 Karakter)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    autoComplete="new-password"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/90 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5C50] focus:border-transparent transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#FF5C50] to-[#FF7368] hover:from-[#E0483C] hover:to-[#FF5C50] text-white font-bold text-sm tracking-wide shadow-lg shadow-rose-500/20 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mendaftarkan ke Supabase...</span>
                  </>
                ) : (
                  <>
                    <span>Daftar &amp; Masuk</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

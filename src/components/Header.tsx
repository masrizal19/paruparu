import React, { useState } from 'react';
import {
  Activity,
  ChevronDown,
  Menu,
  X,
  HeartPulse,
  LogOut,
  LogIn,
  UserPlus,
  ShieldCheck,
  User as UserIcon,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { ScreenType } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { AuthModal } from './AuthModal';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentScreen, onNavigate }) => {
  const { user, signOutUser, isAdmin } = useAuth();
  const { settings, setAdminModalOpen } = useSettings();
  const [userDropdown, setUserDropdown] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const getStatusBadge = () => {
    switch (currentScreen) {
      case 'landing':
        return {
          text: 'Platform Diagnosis Pulmonologi AI',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
          dot: 'bg-emerald-500',
        };
      case 'questionnaire':
        return {
          text: 'Modul Kuesioner Klinis V2.4 Aktif',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
          dot: 'bg-emerald-500',
        };
      case 'diagnosis':
        return {
          text: 'Hasil Terverifikasi Metode BIOS',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
          dot: 'bg-emerald-500',
        };
      case 'admin':
        return {
          text: 'Portal Administrator Supabase Aktif',
          color: 'bg-purple-50 text-purple-800 border-purple-200/80',
          dot: 'bg-purple-600',
        };
      default:
        return {
          text: 'Platform Diagnosis Pulmonologi AI',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
          dot: 'bg-emerald-500',
        };
    }
  };

  const badge = getStatusBadge();

  // User details (Clean, dynamic)
  const displayName =
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split('@')[0] : 'Pengguna');
  const userSub =
    user?.email || 'admin@gmail.com';

  const handleSignOut = async () => {
    await signOutUser();
    setUserDropdown(false);
  };

  const openAuth = (tab: 'login' | 'register') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
    setUserDropdown(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/60 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand / Logo */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center space-x-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-coral rounded-xl p-1 cursor-pointer"
          >
            {settings.logoUrl ? (
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-1 shadow-sm transition-transform group-hover:scale-105">
                <img
                  src={settings.logoUrl}
                  alt={settings.brandName || 'Logo'}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <path d="M2 12h3l3-7 4 14 3-7h4" />
                </svg>
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-slate-900 leading-none">
                {settings.brandName || 'PARU-PARU'}
              </span>
              <span className="text-[11px] font-semibold text-[#FF5C50] uppercase tracking-wider mt-0.5">
                {settings.brandSubtitle || 'Metode BIOS'}
              </span>
            </div>
          </button>

          {/* Dynamic Navigation Menu */}
          <nav className="hidden lg:flex items-center space-x-1 bg-white/70 backdrop-blur-md p-1.5 rounded-full border border-slate-200/60 shadow-xs">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                currentScreen === 'landing'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {settings.navMenu?.home || 'Beranda'}
            </button>
            <button
              onClick={() => onNavigate('questionnaire')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                currentScreen === 'questionnaire'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {settings.navMenu?.questionnaire || 'Kuesioner Klinis'}
            </button>
            <button
              onClick={() => onNavigate('diagnosis')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                currentScreen === 'diagnosis'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {settings.navMenu?.results || 'Hasil Analisis'}
            </button>
          </nav>

          {/* Center Clinical Status Badge */}
          <div
            className={`hidden md:flex lg:hidden items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold ${badge.color}`}
          >
            <span className={`w-2 h-2 rounded-full ${badge.dot} animate-pulse`} />
            <span>{badge.text}</span>
          </div>

          {/* Right Section: Admin CMS Button & User Profile */}
          <div className="flex items-center space-x-3 sm:space-x-4 relative">
            {/* Admin Portal & CMS Triggers (Visible for Admin) */}
            {isAdmin && (
              <div className="hidden sm:flex items-center space-x-2">
                <button
                  onClick={() => onNavigate('admin')}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Portal Admin</span>
                </button>
              </div>
            )}

            {/* User Profile Pill (Top Right) */}
            <div className="relative">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center bg-white/80 backdrop-blur-md border border-white/90 rounded-full py-1.5 pl-1.5 pr-3.5 shadow-sm hover:bg-white transition-all cursor-pointer focus:outline-none ring-1 ring-slate-200/50"
              >
                <div
                  className={`w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center ring-2 ring-white uppercase ${
                    isAdmin
                      ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-sm'
                      : 'bg-gradient-to-tr from-[#FF5C50] to-rose-400'
                  }`}
                >
                  {displayName.charAt(0)}
                </div>
                <div className="ml-2.5 text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                    <span>{displayName}</span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isAdmin ? 'bg-purple-600' : 'bg-emerald-500'
                      }`}
                    />
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium truncate max-w-[130px]">
                    {user?.email || 'admin@gmail.com'}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 ml-2" />
              </button>

              {/* Profile Dropdown Menu */}
              {userDropdown && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Account Header */}
                  <div className="px-3.5 py-3 bg-slate-50 rounded-xl mb-1.5 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-slate-900 leading-tight truncate">
                        {displayName}
                      </p>
                      {isAdmin && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold uppercase">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {userSub}
                    </p>
                  </div>

                  {/* Account Actions */}
                  <div className="space-y-1">
                    {/* Admin Portal & CMS Options */}
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => {
                            onNavigate('admin');
                            setUserDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2.5 text-xs font-bold text-purple-700 hover:bg-purple-50 rounded-xl flex items-center space-x-2.5 transition cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          <span>Buka Portal Admin</span>
                        </button>
                      </>
                    )}

                    {/* Sign Out option */}
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center space-x-2.5 transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>Sign Out</span>
                    </button>

                    {/* Ganti Akun / Masuk Akun Lain */}
                    <button
                      onClick={() => openAuth('login')}
                      className="w-full text-left px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#FF5C50] rounded-xl flex items-center space-x-2.5 transition cursor-pointer"
                    >
                      <LogIn className="w-4 h-4 text-[#FF5C50]" />
                      <span>Masuk Akun Lain</span>
                    </button>

                    {/* Daftar Akun Baru */}
                    <button
                      onClick={() => openAuth('register')}
                      className="w-full text-left px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl flex items-center space-x-2.5 transition cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 text-emerald-600" />
                      <span>Daftar Akun Baru</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </>
  );
};

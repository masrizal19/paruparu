import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Activity,
  HeartPulse,
  Wind,
  Stethoscope,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Clock,
  Award,
  Sliders,
} from 'lucide-react';
import { LungsVisual } from './LungsVisual';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onStartAssessment: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartAssessment,
}) => {
  const { settings, setAdminModalOpen } = useSettings();
  const { isAdmin } = useAuth();

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-16">
        {/* Left Column: Headline & Call To Action */}
        <div className="lg:col-span-7 space-y-6 text-left">
          {/* Clinical Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200/70 text-[#FF5C50] text-xs font-bold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-[#FF5C50] animate-ping" />
            <span>{settings.heroBadge || 'Skrining Klinis Mandiri • Metode BIOS v2.4'}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
            {settings.heroTitle}{' '}
            <span className="text-[#FF5C50]">{settings.heroTitleHighlight}</span> Anda
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
            {settings.heroDescription}
          </p>

          {/* Key Bullet Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {(settings.features || []).map((feat, idx) => (
              <div key={idx} className="flex items-center space-x-2.5 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {/* Primary Action Button (Only "Cek Kesehatan" / custom cta as requested) */}
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <button
              onClick={onStartAssessment}
              className="py-4 px-8 rounded-full bg-gradient-to-r from-[#FF5C50] to-[#FF7368] hover:from-[#E0483C] hover:to-[#FF5C50] text-white font-bold text-base tracking-wide shadow-[0_10px_25px_-5px_rgba(255,92,80,0.4)] transition-all duration-200 flex items-center justify-center space-x-2.5 group cursor-pointer"
            >
              <span>{settings.ctaButtonText || 'Cek Kesehatan'}</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>

          {/* Medical Privacy & Certification Tag */}
          <div className="pt-3 flex items-center space-x-4 text-xs text-slate-500">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Privasi Terenkripsi Medis</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-blue-600" />
              <span>Metode BIOS</span>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Showcase Preview */}
        <div className="lg:col-span-5 relative">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-white/90">
            {/* Top Bar on Preview Card */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/60">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Model Resonansi Paru Real-Time
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                Kondisi Prima (98%)
              </span>
            </div>

            {/* Central Glass Lungs */}
            <LungsVisual interactive={true} score={98} />

            {/* Mini Quick Telemetry Strip */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-200/60 text-center">
              <div className="p-2.5 rounded-2xl bg-white/70 border border-white">
                <p className="text-[10px] text-slate-500 font-medium">Kapasitas FVC</p>
                <p className="text-xs font-bold text-slate-900 mt-0.5">4.8 L (99%)</p>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/70 border border-white">
                <p className="text-[10px] text-slate-500 font-medium">Rasio FEV1</p>
                <p className="text-xs font-bold text-slate-900 mt-0.5">86%</p>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/70 border border-white">
                <p className="text-[10px] text-slate-500 font-medium">Saturasi SpO2</p>
                <p className="text-xs font-bold text-slate-900 mt-0.5">99%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Steps Workflow Strip */}
      <section className="mb-16">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF5C50]">
            Alur Penilaian Klinis
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Hanya 3 Langkah Mudah Menuju Analisis Lengkap
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 shadow-glass relative hover:border-[#FF5C50]/30 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm mb-4 shadow-sm">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Pengisian Kuesioner BIOS</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Jawab 14 parameter terukur meliputi kebiasaan merokok (Brinkman), aktivitas fisik, keluhan batuk, serta paparan lingkungan.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 shadow-glass relative hover:border-[#FF5C50]/30 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5C50] text-white font-bold flex items-center justify-center text-sm mb-4 shadow-sm">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Kalkulasi Risiko Real-Time</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Engine BIOS secara dinamis menghitung Normalized Cumulative Clinical Weight (NCCW) dan mensimulasikan indeks beban risiko.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 shadow-glass relative hover:border-[#FF5C50]/30 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mb-4 shadow-sm">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Diagnosis &amp; Unduh Laporan</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dapatkan visualisasi 3D paru-paru, kurva tidal spirometri, klasifikasi risiko klinis, serta dokumen laporan medis PDF.
            </p>
          </div>
        </div>
      </section>

      {/* 6 Clinical Domains of BIOS */}
      <section className="mb-12">
        <div className="glass-panel rounded-3xl p-6 sm:p-10 shadow-glass border border-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200/60 gap-4 mb-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#FF5C50] mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Metodologi Ilmiah</span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                6 Pilar Evaluasi Metode BIOS
              </h3>
            </div>
            <button
              onClick={onStartAssessment}
              className="py-2.5 px-5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center space-x-2 self-start md:self-auto cursor-pointer"
            >
              <span>Mulai Kuesioner Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80">
              <span className="text-[11px] font-mono font-bold text-[#FF5C50] block mb-1">01. Demografi</span>
              <h4 className="text-sm font-bold text-slate-900">Baseline Biometrik</h4>
              <p className="text-xs text-slate-500 mt-1">Normalisasi kapasitas vital paru berdasarkan faktor usia dan jenis kelamin biologis.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80">
              <span className="text-[11px] font-mono font-bold text-[#FF5C50] block mb-1">02. Inhalasi</span>
              <h4 className="text-sm font-bold text-slate-900">Indeks Brinkman &amp; Asap</h4>
              <p className="text-xs text-slate-500 mt-1">Pengukuran kumulatif Pack-Years rokok primer dan paparan secondhand smoke pasif.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80">
              <span className="text-[11px] font-mono font-bold text-[#FF5C50] block mb-1">03. Kardiorespirasi</span>
              <h4 className="text-sm font-bold text-slate-900">Ketahanan &amp; Aktivitas</h4>
              <p className="text-xs text-slate-500 mt-1">Uji ambang lelah diafragma saat menaiki tangga dan kecepatan pemulihan laju napas.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80">
              <span className="text-[11px] font-mono font-bold text-[#FF5C50] block mb-1">04. Simptomatologi</span>
              <h4 className="text-sm font-bold text-slate-900">Skrining Wheezing &amp; Batuk</h4>
              <p className="text-xs text-slate-500 mt-1">Identifikasi red-flags seperti hemoptisis, bunyi mengi malam hari, dan nyeri pleura.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80">
              <span className="text-[11px] font-mono font-bold text-[#FF5C50] block mb-1">05. Lingkungan</span>
              <h4 className="text-sm font-bold text-slate-900">Paparan Polutan PM2.5</h4>
              <p className="text-xs text-slate-500 mt-1">Evaluasi paparan debu industri, polusi knalpot jalan raya, dan kedisiplinan masker.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80">
              <span className="text-[11px] font-mono font-bold text-[#FF5C50] block mb-1">06. Riwayat Klinis</span>
              <h4 className="text-sm font-bold text-slate-900">Genetik &amp; Riwayat Infeksi</h4>
              <p className="text-xs text-slate-500 mt-1">Predisposisi hipereaktivitas bronkus (asma atopi), TBC paru, dan riwayat keluarga.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

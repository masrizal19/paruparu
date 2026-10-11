import React, { useState } from 'react';
import {
  X,
  Sliders,
  Sparkles,
  Type,
  Image as ImageIcon,
  Palette,
  CheckCircle2,
  Database,
  RotateCcw,
  Save,
  Key,
  ShieldCheck,
  Layers,
  Wind,
  Check,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useAuth, OFFICIAL_ADMIN_ID } from '../context/AuthContext';
import { LungIconType, BackgroundThemeType } from '../types';

export const AdminPanelModal: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetSettings,
    isSaving,
    adminModalOpen,
    setAdminModalOpen,
  } = useSettings();

  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'text' | 'lungs' | 'background' | 'admin'>('text');
  const [successToast, setSuccessToast] = useState(false);

  // Form states initialized with current settings
  const [brandName, setBrandName] = useState(settings.brandName);
  const [brandSubtitle, setBrandSubtitle] = useState(settings.brandSubtitle);
  const [heroBadge, setHeroBadge] = useState(settings.heroBadge);
  const [heroTitle, setHeroTitle] = useState(settings.heroTitle);
  const [heroTitleHighlight, setHeroTitleHighlight] = useState(settings.heroTitleHighlight);
  const [heroDescription, setHeroDescription] = useState(settings.heroDescription);
  const [ctaButtonText, setCtaButtonText] = useState(settings.ctaButtonText);
  const [footerText, setFooterText] = useState(settings.footerText);

  // Feature bullets (comma or newline separated)
  const [featuresText, setFeaturesText] = useState(settings.features.join('\n'));

  // Lungs Visual
  const [lungIconType, setLungIconType] = useState<LungIconType>(settings.lungIconType);
  const [customLungIconUrl, setCustomLungIconUrl] = useState(settings.customLungIconUrl);

  // Background
  const [bgTheme, setBgTheme] = useState<BackgroundThemeType>(settings.bgTheme);
  const [customBgUrl, setCustomBgUrl] = useState(settings.customBgUrl);

  // Admin ID
  const [adminIdInput, setAdminIdInput] = useState(OFFICIAL_ADMIN_ID);

  if (!adminModalOpen) return null;

  const handleSave = async () => {
    const featuresList = featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const ok = await updateSettings({
      brandName,
      brandSubtitle,
      heroBadge,
      heroTitle,
      heroTitleHighlight,
      heroDescription,
      ctaButtonText,
      footerText,
      features: featuresList.length > 0 ? featuresList : settings.features,
      lungIconType,
      customLungIconUrl,
      bgTheme,
      customBgUrl,
      adminId: OFFICIAL_ADMIN_ID,
    });

    if (ok) {
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 2500);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset seluruh teks, icon, dan background ke setelan standar medis?')) {
      await resetSettings();
      setBrandName('PARU-PARU');
      setBrandSubtitle('Metode BIOS');
      setHeroBadge('Skrining Klinis Mandiri • Metode BIOS v2.4');
      setHeroTitle('Deteksi Dini & Analisis Kesehatan');
      setHeroTitleHighlight('Paru-Paru');
      setHeroDescription(
        'Platform pemeriksaan kesehatan sistem pernapasan cerdas mengintegrasikan 6 domain klinis metode BIOS, perhitungan indeks Brinkman, dan analisis parameter spirometri FVC secara akurat, cepat, dan terstandarisasi.'
      );
      setCtaButtonText('Cek Kesehatan');
      setFeaturesText(
        '14 Parameter Fisiologis & Gaya Hidup\nKalkulasi Otomatis Indeks Brinkman\nSkrining Obstruksi & Wheezing AI\nHasil Diagnosis & Laporan Medis PDF'
      );
      setFooterText(
        'PARU-PARU Pulmonology Engine • Algoritma BIOS & Analisis Real-Time • Terstandarisasi Internasional & Terintegrasi Database Supabase'
      );
      setLungIconType('neon-bios');
      setCustomLungIconUrl('');
      setBgTheme('mesh-soft');
      setCustomBgUrl('');
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  Panel Administrator Supabase (CMS)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-400/20 text-purple-300 border border-purple-400/30 text-[10px] font-bold uppercase">
                  Kontrol Penuh
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Ubah teks dashboard, menu utama, ganti icon paru, &amp; tema background tersimpan ke Supabase
              </p>
            </div>
          </div>
          <button
            onClick={() => setAdminModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-100 bg-slate-50/80 px-6 pt-3 overflow-x-auto no-scrollbar gap-2">
          <button
            onClick={() => setActiveTab('text')}
            className={`pb-3 px-3 text-xs font-bold flex items-center space-x-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'text'
                ? 'border-[#FF5C50] text-[#FF5C50]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Teks &amp; Deskripsi Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('lungs')}
            className={`pb-3 px-3 text-xs font-bold flex items-center space-x-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'lungs'
                ? 'border-[#FF5C50] text-[#FF5C50]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wind className="w-4 h-4" />
            <span>Ganti Icon Paru-Paru</span>
          </button>

          <button
            onClick={() => setActiveTab('background')}
            className={`pb-3 px-3 text-xs font-bold flex items-center space-x-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'background'
                ? 'border-[#FF5C50] text-[#FF5C50]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Ganti Background</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`pb-3 px-3 text-xs font-bold flex items-center space-x-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'admin'
                ? 'border-[#FF5C50] text-[#FF5C50]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>ID Admin Supabase</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-800">
          {successToast && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Perubahan berhasil disimpan dan diterapkan secara real-time!</span>
            </div>
          )}

          {/* TAB 1: TEKS DASHBOARD & MENU */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nama Brand (Header)
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF5C50]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Sub-Brand (Header)
                  </label>
                  <input
                    type="text"
                    value={brandSubtitle}
                    onChange={(e) => setBrandSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF5C50]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Teks Badge Atas Dashboard
                </label>
                <input
                  type="text"
                  value={heroBadge}
                  onChange={(e) => setHeroBadge(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF5C50]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Judul Utama Dashboard (Headline)
                  </label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF5C50]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Kata Disorot (Warna Merah/Coral)
                  </label>
                  <input
                    type="text"
                    value={heroTitleHighlight}
                    onChange={(e) => setHeroTitleHighlight(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF5C50]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Deskripsi Teks Dashboard / Penjelasan
                </label>
                <textarea
                  rows={3}
                  value={heroDescription}
                  onChange={(e) => setHeroDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#FF5C50]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Teks Tombol Aksi Utama (Cek Kesehatan)
                  </label>
                  <input
                    type="text"
                    value={ctaButtonText}
                    onChange={(e) => setCtaButtonText(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-[#FF5C50] focus:outline-none focus:ring-2 focus:ring-[#FF5C50]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Teks Catatan Footer
                  </label>
                  <input
                    type="text"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5C50]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Poin Keunggulan / Fitur (Satu baris per poin)
                </label>
                <textarea
                  rows={4}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="14 Parameter Fisiologis&#10;Kalkulasi Otomatis Indeks Brinkman"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#FF5C50]"
                />
              </div>
            </div>
          )}

          {/* TAB 2: GANTI ICON PARU */}
          {activeTab === 'lungs' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Pilih Preset Gaya Visual Paru-Paru
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  Pilih desain ikon paru-paru yang akan ditampilkan di card preview dashboard.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: 'neon-bios' as LungIconType,
                      name: 'Neon BIOS Anatomis',
                      desc: 'Desain anatomi glassmorphism dengan glow lobus & saluran bronkial',
                      tag: 'Default',
                    },
                    {
                      id: 'cyber-cyan' as LungIconType,
                      name: 'Cyber Cyan Hologram',
                      desc: 'Gaya visual biru cyan sci-fi dengan denyut resonansi elektrik',
                      tag: 'Futuristik',
                    },
                    {
                      id: 'minimal-outline' as LungIconType,
                      name: 'Minimalist Vector Line',
                      desc: 'Garis vektor stetoskop & paru-paru minimalis elegan',
                      tag: 'Clean Minimal',
                    },
                    {
                      id: 'hologram-pulse' as LungIconType,
                      name: 'Holographic Bio-Impedance',
                      desc: 'Visual inti bio-impedance dengan aura frekuensi dinamis',
                      tag: 'High-Tech',
                    },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setLungIconType(preset.id)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        lungIconType === preset.id
                          ? 'border-[#FF5C50] bg-rose-50/50 ring-2 ring-[#FF5C50]/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-slate-900">
                          {preset.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-600">
                          {preset.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        {preset.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Image Lung Icon Option */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4 text-[#FF5C50]" />
                    <span className="text-xs font-bold text-slate-900">
                      Atau Gunakan Gambar / Icon Paru Kustom (URL Link)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLungIconType('custom-image')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                      lungIconType === 'custom-image'
                        ? 'bg-[#FF5C50] text-white'
                        : 'bg-white border border-slate-200 text-slate-700'
                    }`}
                  >
                    Aktifkan Kustom
                  </button>
                </div>

                {lungIconType === 'custom-image' && (
                  <div className="space-y-2 animate-in fade-in">
                    <input
                      type="url"
                      value={customLungIconUrl}
                      onChange={(e) => setCustomLungIconUrl(e.target.value)}
                      placeholder="https://example.com/gambar-paru-paru.png"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF5C50]"
                    />
                    <p className="text-[11px] text-slate-500">
                      Masukkan tautan URL gambar (PNG transparan / SVG disarankan).
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: GANTI BACKGROUND */}
          {activeTab === 'background' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Pilih Tema Background Web
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  Ganti tema visual latar belakang seluruh aplikasi.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: 'mesh-soft' as BackgroundThemeType,
                      name: 'Soft Rose & Slate Mesh',
                      desc: 'Radial gradient hangat khas BIOS klinis asli',
                      color: 'bg-gradient-to-r from-rose-100 to-slate-100',
                    },
                    {
                      id: 'clinical-white' as BackgroundThemeType,
                      name: 'Pure Clinical White & Teal',
                      desc: 'Nuansa laboratorium medis ultra bersih & tenang',
                      color: 'bg-gradient-to-r from-teal-50 to-white',
                    },
                    {
                      id: 'deep-navy' as BackgroundThemeType,
                      name: 'Deep Medical Navy Glass',
                      desc: 'Gradasi biru navy medis elegan dengan kontras tajam',
                      color: 'bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white',
                    },
                    {
                      id: 'cyber-dark' as BackgroundThemeType,
                      name: 'Dark Cyber BIOS Grid',
                      desc: 'Nuansa dark mode futuristik dengan aksen neon coral',
                      color: 'bg-gradient-to-r from-zinc-950 via-slate-900 to-zinc-900 text-white',
                    },
                    {
                      id: 'emerald-glass' as BackgroundThemeType,
                      name: 'Emerald Health Mint',
                      desc: 'Sentuhan warna hijau daun mint melambangkan paru sehat',
                      color: 'bg-gradient-to-r from-emerald-100 to-teal-50',
                    },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setBgTheme(theme.id)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        bgTheme === theme.id
                          ? 'border-[#FF5C50] ring-2 ring-[#FF5C50]/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-slate-900">
                          {theme.name}
                        </span>
                        <div className={`w-6 h-6 rounded-lg border border-slate-300 ${theme.color}`} />
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        {theme.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Image Background URL */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4 text-[#FF5C50]" />
                    <span className="text-xs font-bold text-slate-900">
                      Atau Gunakan Wallpaper Background Kustom (URL Link)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBgTheme('custom-url')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                      bgTheme === 'custom-url'
                        ? 'bg-[#FF5C50] text-white'
                        : 'bg-white border border-slate-200 text-slate-700'
                    }`}
                  >
                    Aktifkan Kustom
                  </button>
                </div>

                {bgTheme === 'custom-url' && (
                  <div className="space-y-2 animate-in fade-in">
                    <input
                      type="url"
                      value={customBgUrl}
                      onChange={(e) => setCustomBgUrl(e.target.value)}
                      placeholder="https://example.com/wallpaper-medis.jpg"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF5C50]"
                    />
                    <p className="text-[11px] text-slate-500">
                      Latar belakang akan dimuat langsung dari URL gambar yang Anda tentukan.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ID ADMIN SUPABASE */}
          {activeTab === 'admin' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200/80 space-y-3">
                <div className="flex items-center space-x-2 text-purple-900 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                  <span>Koneksi Hak Akses Admin Supabase</span>
                </div>
                <p className="text-xs text-purple-800 leading-relaxed">
                  ID Admin ini digunakan untuk memvalidasi pengguna yang memiliki wewenang untuk mengatur tampilan web, teks dashboard, icon, dan background.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Supabase Admin User ID (UUID / Identifier)
                  </label>
                  <input
                    type="text"
                    value={adminIdInput}
                    onChange={(e) => setAdminIdInput(e.target.value)}
                    placeholder="Contoh: 8bf1290a-xxxx-xxxx-xxxx"
                    className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    ID ini akan dicocokkan otomatis setiap kali akun masuk melalui sistem autentikasi Supabase.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Tabel Supabase: <code>app_settings</code>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Setelan otomatis tersinkronisasi dan disimpan aman di Supabase.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  Siap Simpan
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold text-xs transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ke Default</span>
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAdminModalOpen(false)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
            >
              Tutup
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5C50] to-[#FF7368] hover:from-[#E0483C] hover:to-[#FF5C50] text-white font-bold text-xs shadow-md shadow-rose-500/20 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan ke Supabase'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

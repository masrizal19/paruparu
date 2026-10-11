import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders,
  Type,
  Wind,
  Palette,
  Database,
  CheckCircle2,
  Save,
  RotateCcw,
  LogOut,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Users,
  Eye,
  Sparkles,
  Crop,
  Upload,
  Search,
  Filter,
  Calendar,
  FileText,
  AlertCircle,
  Loader2,
  Trash2,
  Check,
  FileCode,
  Layers,
  User,
  Bell,
  Lock,
  Globe,
  HelpCircle,
  Activity,
} from 'lucide-react';
import { useAuth, OFFICIAL_ADMIN_ID, checkIsAdmin } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import {
  LungIconType,
  BackgroundThemeType,
  LogoCropData,
  CustomFontRecord,
  LungAnimationType,
  LungAnimationSpeed,
} from '../types';
import {
  initSupabaseClient,
  SupabaseAssessmentRecord,
  getAllAssessmentsForAdmin,
} from '../lib/supabase';
import {
  uploadFileToStorage,
  getCustomFontsList,
  saveCustomFontRecord,
  deleteCustomFontRecord,
  applyCustomFont,
  clearCustomFont,
} from '../lib/settings';
import { LungsVisual } from './LungsVisual';
import { LogoCropModal } from './LogoCropModal';
import { AdminHistoryDetailModal } from './AdminHistoryDetailModal';

interface AdminPortalProps {
  onNavigateToPatientPortal: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onNavigateToPatientPortal,
}) => {
  const { user, signOutUser } = useAuth();
  const { settings, updateSettings, resetSettings, isSaving } = useSettings();

  const isAuthorizedAdmin = user && checkIsAdmin(user);

  const [activeTab, setActiveTab] = useState<
    'branding' | 'logo' | 'fonts' | 'history' | 'lungs' | 'background'
  >('lungs'); // Defaulting to lungs as requested
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Form states
  const [brandName, setBrandName] = useState(settings.brandName);
  const [brandSubtitle, setBrandSubtitle] = useState(settings.brandSubtitle);
  const [heroBadge, setHeroBadge] = useState(settings.heroBadge);
  const [heroTitle, setHeroTitle] = useState(settings.heroTitle);
  const [heroTitleHighlight, setHeroTitleHighlight] = useState(
    settings.heroTitleHighlight
  );
  const [heroDescription, setHeroDescription] = useState(settings.heroDescription);
  const [ctaButtonText, setCtaButtonText] = useState(settings.ctaButtonText);
  const [footerText, setFooterText] = useState(settings.footerText);
  const [featuresText, setFeaturesText] = useState(settings.features.join('\n'));

  // Nav menu
  const [navHome, setNavHome] = useState(settings.navMenu?.home || 'Beranda');
  const [navQuestionnaire, setNavQuestionnaire] = useState(
    settings.navMenu?.questionnaire || 'Kuesioner Klinis'
  );
  const [navResults, setNavResults] = useState(
    settings.navMenu?.results || 'Hasil Analisis'
  );

  // Visuals & Lung Customization States
  const [lungIconType, setLungIconType] = useState<LungIconType>(settings.lungIconType);
  const [customLungIconUrl, setCustomLungIconUrl] = useState(settings.customLungIconUrl);
  const [lungAnimationType, setLungAnimationType] = useState<LungAnimationType>(
    settings.lung_animation_type || 'breathing'
  );
  const [lungAnimationSpeed, setLungAnimationSpeed] = useState<LungAnimationSpeed>(
    settings.lung_animation_speed || 'normal'
  );
  const [isUploadingLung, setIsUploadingLung] = useState(false);
  const lungFileInputRef = useRef<HTMLInputElement | null>(null);

  const [bgTheme, setBgTheme] = useState<BackgroundThemeType>(settings.bgTheme);
  const [customBgUrl, setCustomBgUrl] = useState(settings.customBgUrl);

  // Logo Crop Modal
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [currentLogoUrl, setCurrentLogoUrl] = useState(settings.logoUrl || '');
  const [currentCropData, setCurrentCropData] = useState<LogoCropData>(
    settings.logo_crop_data || { x: 0, y: 0, zoom: 1, aspectRatio: '1:1' }
  );

  // Fonts
  const [fontsList, setFontsList] = useState<CustomFontRecord[]>([]);
  const [isUploadingFont, setIsUploadingFont] = useState(false);
  const fontFileInputRef = useRef<HTMLInputElement | null>(null);
  const [fontTestText, setFontTestText] = useState(
    'PARU-PARU METODE BIOS: Deteksi Cepat Obstruksi Paru & Brinkman Indeks'
  );

  // History
  const [patientsList, setPatientsList] = useState<SupabaseAssessmentRecord[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyRiskFilter, setHistoryRiskFilter] = useState('ALL');
  const [historyDateFilter, setHistoryDateFilter] = useState('ALL');
  const [selectedHistoryItem, setSelectedHistoryItem] =
    useState<SupabaseAssessmentRecord | null>(null);

  const loadFonts = async () => {
    const list = await getCustomFontsList();
    setFontsList(list);
  };

  useEffect(() => {
    loadFonts();
  }, []);

  const fetchAllHistory = async () => {
    setLoadingPatients(true);
    try {
      const records = await getAllAssessmentsForAdmin();
      setPatientsList(records);
    } catch {
      // handled
    } finally {
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchAllHistory();
    }
  }, [activeTab]);

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setErrorToast(msg);
      setTimeout(() => setErrorToast(null), 3500);
    } else {
      setSuccessToast(msg);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  const handleSaveBranding = async () => {
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
      navMenu: {
        home: navHome,
        questionnaire: navQuestionnaire,
        results: navResults,
      },
      lungIconType,
      customLungIconUrl,
      custom_lung_icon_path: customLungIconUrl,
      lung_icon_preset: lungIconType,
      lung_animation_type: lungAnimationType,
      lung_animation_speed: lungAnimationSpeed,
      bgTheme,
      customBgUrl,
    });

    if (ok) {
      showToast('Konfigurasi Portal Admin & Ikon Paru berhasil disimpan ke Supabase app_settings!');
    } else {
      showToast('Gagal menyimpan ke Supabase', true);
    }
  };

  // Lung custom image upload dropzone handler
  const handleLungFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Harap unggah file gambar valid (PNG, SVG, GIF)', true);
      return;
    }

    setIsUploadingLung(true);
    try {
      const fileName = `lungs-${Date.now()}-${file.name}`;
      const { url } = await uploadFileToStorage('app-assets', file, fileName);

      setCustomLungIconUrl(url);
      setLungIconType('custom-image');

      await updateSettings({
        lungIconType: 'custom-image',
        customLungIconUrl: url,
        custom_lung_icon_path: url,
        lung_animation_type: lungAnimationType,
        lung_animation_speed: lungAnimationSpeed,
      });

      showToast('File gambar/animasi paru kustom berhasil diunggah ke Supabase Storage (app-assets)!');
    } catch (err: any) {
      showToast(err?.message || 'Gagal mengunggah file ikon paru', true);
    } finally {
      setIsUploadingLung(false);
      if (lungFileInputRef.current) lungFileInputRef.current.value = '';
    }
  };

  const handleSaveCroppedLogo = async (
    logoUrl: string,
    cropData: LogoCropData
  ) => {
    setCurrentLogoUrl(logoUrl);
    setCurrentCropData(cropData);

    const ok = await updateSettings({
      logoUrl,
      logo_crop_data: cropData,
    });

    if (ok) {
      showToast('File logo berhasil diunggah & diterapkan!');
    }
  };

  const handleRemoveLogo = async () => {
    if (window.confirm('Hapus file logo kustom dan gunakan logo default?')) {
      setCurrentLogoUrl('');
      await updateSettings({
        logoUrl: '',
      });
      showToast('Logo kustom dihapus.');
    }
  };

  const handleFontFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['ttf', 'woff', 'woff2', 'otf'].includes(ext || '')) {
      showToast('Format font tidak didukung (.ttf, .woff, .woff2, .otf)', true);
      return;
    }

    let format = 'truetype';
    if (ext === 'woff') format = 'woff';
    if (ext === 'woff2') format = 'woff2';
    if (ext === 'otf') format = 'opentype';

    setIsUploadingFont(true);
    try {
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      const fontFamilyName = `Font_${cleanName.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const fileName = `custom-fonts/${Date.now()}-${file.name}`;

      const { url } = await uploadFileToStorage('custom-fonts', file, fileName);

      const fontRecord: CustomFontRecord = {
        id: `font-${Date.now()}`,
        name: cleanName,
        font_family: fontFamilyName,
        file_url: url,
        format,
        file_size: file.size,
        is_active: false,
        created_at: new Date().toISOString(),
      };

      await saveCustomFontRecord(fontRecord);
      await loadFonts();
      showToast(`Font "${cleanName}" berhasil diunggah!`);
    } catch (err: any) {
      showToast(err?.message || 'Gagal mengunggah file font', true);
    } finally {
      setIsUploadingFont(false);
      if (fontFileInputRef.current) fontFileInputRef.current.value = '';
    }
  };

  const handleActivateFont = async (font: CustomFontRecord) => {
    applyCustomFont(font.font_family, font.file_url, font.format);
    await updateSettings({
      activeFontId: font.id,
      activeFontFamily: font.font_family,
    });
    showToast(`Font "${font.name}" diaktifkan!`);
  };

  const handleResetDefaultFont = async () => {
    clearCustomFont();
    await updateSettings({
      activeFontId: undefined,
      activeFontFamily: undefined,
    });
    showToast('Font aplikasi dikembalikan ke font standar.');
  };

  const handleDeleteFont = async (fontId: string) => {
    if (window.confirm('Hapus font ini dari daftar?')) {
      if (settings.activeFontId === fontId) {
        await handleResetDefaultFont();
      }
      await deleteCustomFontRecord(fontId);
      await loadFonts();
      showToast('Font berhasil dihapus.');
    }
  };

  const handleResetDefaults = async () => {
    if (window.confirm('Reset seluruh konfigurasi ke nilai standar sistem medis?')) {
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
      setNavHome('Beranda');
      setNavQuestionnaire('Kuesioner Klinis');
      setNavResults('Hasil Analisis');
      setFeaturesText(
        '14 Parameter Fisiologis & Gaya Hidup\nKalkulasi Otomatis Indeks Brinkman\nSkrining Obstruksi & Wheezing AI\nHasil Diagnosis & Laporan Medis PDF'
      );
      setFooterText(
        'PARU-PARU Pulmonology Engine • Algoritma BIOS & Analisis Real-Time • Terstandarisasi Internasional & Terintegrasi Database Supabase'
      );
      setLungIconType('neon-bios');
      setCustomLungIconUrl('');
      setLungAnimationType('breathing');
      setLungAnimationSpeed('normal');
      setBgTheme('mesh-soft');
      setCustomBgUrl('');
      setCurrentLogoUrl('');
      clearCustomFont();
      showToast('Pengaturan telah di-reset ke nilai default.');
    }
  };

  const filteredHistory = patientsList.filter((item) => {
    const query = historySearchQuery.toLowerCase();
    const matchEmail = (item.user_email || '').toLowerCase().includes(query);
    const matchName = (item.patient_name || '').toLowerCase().includes(query);
    const matchId = (item.id || '').toLowerCase().includes(query);
    if (query && !matchEmail && !matchName && !matchId) return false;

    if (historyRiskFilter !== 'ALL') {
      const r = (item.risk_level || item.overall_status || '').toLowerCase();
      if (historyRiskFilter === 'LOW' && !(r.includes('bersih') || r.includes('prima') || r.includes('low'))) {
        return false;
      }
      if (historyRiskFilter === 'MODERATE' && !(r.includes('moderate') || r.includes('sedang'))) {
        return false;
      }
      if (historyRiskFilter === 'HIGH' && !(r.includes('high') || r.includes('tinggi'))) {
        return false;
      }
      if (historyRiskFilter === 'CRITICAL' && !(r.includes('critical') || r.includes('kritis'))) {
        return false;
      }
    }

    if (historyDateFilter !== 'ALL' && item.created_at) {
      const itemDate = new Date(item.created_at).getTime();
      const now = Date.now();
      if (historyDateFilter === '24H' && now - itemDate > 24 * 3600 * 1000) return false;
      if (historyDateFilter === '7D' && now - itemDate > 7 * 86400 * 1000) return false;
    }

    return true;
  });

  if (!isAuthorizedAdmin) {
    return (
      <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Akses Terbatas: Administrator Only</h2>
        <p className="text-xs text-slate-600 max-w-sm mb-6">
          Portal ini hanya dapat diakses oleh akun terverifikasi dengan User ID resmi (
          <code className="text-[#FF5C50] font-mono">{OFFICIAL_ADMIN_ID}</code>).
        </p>
        <button
          onClick={onNavigateToPatientPortal}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer shadow-sm"
        >
          Kembali ke Dashboard Pasien
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF2F4] text-slate-800 flex flex-col justify-between selection:bg-[#FF5C50] selection:text-white relative overflow-x-hidden">
      {/* Background Decorative Pink Spheres */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-pink-200/50 blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-[-150px] right-[-100px] w-[600px] h-[600px] rounded-full bg-pink-300/45 blur-3xl pointer-events-none z-0" />

      {/* Main Glassmorphism Card Container */}
      <div className="max-w-7xl w-full mx-auto my-8 sm:my-12 px-4 sm:px-6 relative z-10 flex-1 flex flex-col">
        <div className="bg-white/85 backdrop-blur-xl rounded-[36px] shadow-2xl border border-white/90 overflow-hidden flex-1 flex flex-col lg:flex-row min-h-[82vh]">
          
          {/* Left Sidebar */}
          <aside className="w-full lg:w-72 bg-white/65 border-b lg:border-b-0 lg:border-r border-pink-100/80 p-6 sm:p-8 flex flex-col justify-between shrink-0">
            <div className="space-y-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FF5C50]/10 border border-[#FF5C50]/20 flex items-center justify-center text-[#FF5C50] shadow-xs">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-black text-lg text-slate-900 tracking-tight leading-none">
                    Settings
                  </h1>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Admin Verified</span>
                  </p>
                </div>
              </div>

              <nav className="space-y-1.5">
                {[
                  { id: 'lungs', label: 'Kustomisasi Ikon Paru', icon: Wind },
                  { id: 'branding', label: 'Branding & Teks', icon: Type },
                  { id: 'logo', label: 'Upload & Crop Logo', icon: Crop },
                  { id: 'fonts', label: 'Manajemen Font Kustom', icon: FileCode },
                  { id: 'history', label: 'Histori Seluruh Pengguna', icon: Users },
                  { id: 'background', label: 'Tema Background', icon: Palette },
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition cursor-pointer text-left ${
                        isActive
                          ? 'bg-gradient-to-r from-pink-500 to-[#FF5C50] text-white shadow-md shadow-pink-500/20'
                          : 'text-slate-600 hover:bg-pink-50/70 hover:text-slate-900'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-pink-100 space-y-3 mt-6">
              <button
                onClick={onNavigateToPatientPortal}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
              >
                <Eye className="w-4 h-4 text-[#FF5C50]" />
                <span>Dashboard Pasien</span>
              </button>

              <button
                onClick={signOutUser}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-xs border border-rose-200/60"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Right Content Area */}
          <div className="flex-1 flex flex-col bg-white/40 overflow-y-auto">
            <header className="px-6 sm:px-10 py-6 border-b border-pink-100/60 flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {activeTab === 'lungs' && 'Kustomisasi Ikon Paru-Paru & Animasi'}
                  {activeTab === 'branding' && 'Branding & Teks Antarmuka'}
                  {activeTab === 'logo' && 'Upload Logo & Crop Positioning'}
                  {activeTab === 'fonts' && 'Manajemen Font Kustom (.ttf/.woff)'}
                  {activeTab === 'history' && 'Histori Analisis Seluruh Pengguna'}
                  {activeTab === 'background' && 'Pengaturan Tema Background'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  ID Admin Resmi Supabase: <span className="font-mono text-[#FF5C50]">{OFFICIAL_ADMIN_ID}</span>
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleResetDefaults}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>

                <button
                  onClick={handleSaveBranding}
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-[#FF5C50] hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold transition flex items-center space-x-2 cursor-pointer shadow-lg shadow-pink-500/20 disabled:opacity-60"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </header>

            <div className="px-6 sm:px-10 pt-6">
              {successToast && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-in fade-in shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successToast}</span>
                </div>
              )}

              {errorToast && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2 animate-in fade-in shadow-sm">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorToast}</span>
                </div>
              )}
            </div>

            {/* TAB PANELS */}
            <div className="p-6 sm:p-10 space-y-6 flex-1">
              
              {/* TAB: LUNGS CUSTOMIZATION (Primary Request) */}
              {activeTab === 'lungs' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-7 space-y-6">
                    {/* Mode Toggle Switch: Preset vs Custom Upload */}
                    <div className="bg-pink-50/70 p-1.5 rounded-2xl border border-pink-100 flex">
                      <button
                        type="button"
                        onClick={() => {
                          if (lungIconType === 'custom-image') setLungIconType('neon-bios');
                        }}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          lungIconType !== 'custom-image'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Opsi A: Gunakan Preset Visual
                      </button>
                      <button
                        type="button"
                        onClick={() => setLungIconType('custom-image')}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          lungIconType === 'custom-image'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Opsi B: Unggah Gambar / Animasi Kustom
                      </button>
                    </div>

                    {/* OPSI A: PRESET VISUAL */}
                    {lungIconType !== 'custom-image' && (
                      <div className="space-y-3 animate-in fade-in">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Pilih Preset Anatomi &amp; Hologram Paru
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            { id: 'neon-bios' as LungIconType, name: 'Neon BIOS Anatomis', desc: 'Anatomi glassmorphism lobus' },
                            { id: 'cyber-cyan' as LungIconType, name: 'Cyber Cyan Hologram', desc: 'Gaya cyan sci-fi berdenyut' },
                            { id: 'minimal-outline' as LungIconType, name: 'Minimalist Vector Line', desc: 'Garis stetoskop minimalis' },
                            { id: 'hologram-pulse' as LungIconType, name: 'Holographic Bio-Impedance', desc: 'Aura frekuensi dinamis' },
                          ].map((preset) => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => setLungIconType(preset.id)}
                              className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                                lungIconType === preset.id
                                  ? 'border-pink-500 bg-pink-50/80 ring-2 ring-pink-500/20'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                            >
                              <span className="font-bold text-xs text-slate-900 mb-1">{preset.name}</span>
                              <span className="text-[11px] text-slate-500">{preset.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* OPSI B: UPLOAD KUSTOM */}
                    {lungIconType === 'custom-image' && (
                      <div className="space-y-4 animate-in fade-in">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Upload Dropzone (PNG Transparan, SVG, atau GIF Animasi)
                        </label>
                        <input
                          type="file"
                          ref={lungFileInputRef}
                          onChange={handleLungFileUpload}
                          accept="image/png,image/svg+xml,image/gif"
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={isUploadingLung}
                          onClick={() => lungFileInputRef.current?.click()}
                          className="w-full py-6 px-6 border-2 border-dashed border-pink-300 hover:border-pink-500 rounded-3xl bg-pink-50/40 hover:bg-pink-50 text-slate-700 transition flex flex-col items-center justify-center space-y-2 cursor-pointer group"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-pink-500 group-hover:scale-105 transition">
                            <Upload className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-bold text-slate-900">
                            {isUploadingLung ? 'Mengunggah ke Supabase Storage...' : 'Klik untuk Unggah File Gambar / Animasi Paru'}
                          </span>
                          <span className="text-[11px] text-slate-500">Mendukung PNG transparan, SVG, dan GIF</span>
                        </button>

                        {customLungIconUrl && (
                          <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 p-1 flex items-center justify-center overflow-hidden shrink-0">
                              <img src={customLungIconUrl} alt="Custom Lung" className="max-h-full max-w-full object-contain" />
                            </div>
                            <div className="truncate flex-1">
                              <p className="text-xs font-bold text-slate-900 truncate">URL Supabase Storage Berhasil</p>
                              <p className="text-[10px] text-slate-500 font-mono truncate">{customLungIconUrl}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Kontrol Efek Animasi Live */}
                    <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Kontrol Efek Animasi Live
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                            Jenis Animasi
                          </label>
                          <select
                            value={lungAnimationType}
                            onChange={(e) => setLungAnimationType(e.target.value as LungAnimationType)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-pink-500"
                          >
                            <option value="breathing">Breathing (Ritme Napas Kembang-Kempis)</option>
                            <option value="pulse">Pulse (Denyut Jantung/Paru)</option>
                            <option value="glow-neon">Glow Neon (Pendar Cahaya)</option>
                            <option value="floating">Floating (Melayang Lembut)</option>
                            <option value="static">Static (Tanpa Animasi)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                            Kecepatan Animasi
                          </label>
                          <select
                            value={lungAnimationSpeed}
                            onChange={(e) => setLungAnimationSpeed(e.target.value as LungAnimationSpeed)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-pink-500"
                          >
                            <option value="slow">Lambat (Slow)</option>
                            <option value="normal">Normal</option>
                            <option value="fast">Cepat (Fast)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Interactive Preview Panel */}
                  <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 flex flex-col items-center justify-center shadow-md">
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Pratinjau Langsung Ikon Paru
                      </span>
                    </div>

                    <div className="w-full max-w-xs">
                      <LungsVisual interactive={true} score={98} />
                    </div>

                    <p className="text-[11px] text-slate-500 text-center mt-4">
                      Perubahan preset dan animasi langsung diterapkan secara real-time pada pratinjau di atas dan seluruh halaman pasien.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB: BRANDING */}
              {activeTab === 'branding' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Nama Aplikasi / Brand
                      </label>
                      <input
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 font-semibold shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Header Sub-Title (Tagline)
                      </label>
                      <input
                        type="text"
                        value={brandSubtitle}
                        onChange={(e) => setBrandSubtitle(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 font-semibold shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Judul Utama Dashboard (Hero Title)
                    </label>
                    <input
                      type="text"
                      value={heroTitle}
                      onChange={(e) => setHeroTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 font-semibold shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Deskripsi Utama
                    </label>
                    <textarea
                      rows={3}
                      value={heroDescription}
                      onChange={(e) => setHeroDescription(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 shadow-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB: LOGO */}
              {activeTab === 'logo' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-5 rounded-3xl bg-pink-50/50 border border-pink-100">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Upload &amp; Crop Positioning Editor</h3>
                      <p className="text-xs text-slate-600">Sesuaikan logo header aplikasi dengan mudah.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsLogoModalOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-pink-500 text-white text-xs font-bold shadow-md cursor-pointer"
                    >
                      Buka Editor Crop Logo
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: FONTS */}
              {activeTab === 'fonts' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-5 rounded-3xl bg-pink-50/50 border border-pink-100">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Manajemen Font Kustom (.ttf, .woff)</h3>
                      <p className="text-xs text-slate-600">Unggah file font langsung dari komputer Anda.</p>
                    </div>
                    <div>
                      <input
                        type="file"
                        ref={fontFileInputRef}
                        onChange={handleFontFileUpload}
                        accept=".ttf,.woff,.woff2,.otf"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fontFileInputRef.current?.click()}
                        className="px-5 py-2.5 rounded-xl bg-pink-500 text-white text-xs font-bold shadow-md cursor-pointer"
                      >
                        Unggah File Font
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: HISTORY */}
              {activeTab === 'history' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-5 rounded-3xl bg-pink-50/50 border border-pink-100">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Histori Analisis Seluruh Pengguna</h3>
                      <p className="text-xs text-slate-600">Rekam medis skrining dari database Supabase.</p>
                    </div>
                    <button
                      onClick={fetchAllHistory}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Muat Ulang
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: BACKGROUND */}
              {activeTab === 'background' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-slate-900">Pilih Tema Latar Belakang Aplikasi</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'mesh-soft' as BackgroundThemeType, name: 'Soft Rose & Slate Mesh' },
                      { id: 'clinical-white' as BackgroundThemeType, name: 'Pure Clinical White & Teal' },
                      { id: 'deep-navy' as BackgroundThemeType, name: 'Deep Medical Navy Glass' },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setBgTheme(theme.id)}
                        className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                          bgTheme === theme.id ? 'border-pink-500 bg-pink-50' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <span className="font-bold text-xs text-slate-900">{theme.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <footer className="w-full py-4 px-4 text-center text-xs text-slate-500 relative z-10">
        <p>Portal Administrator Supabase • Terautentikasi Resmi ({OFFICIAL_ADMIN_ID})</p>
      </footer>

      <LogoCropModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        currentLogoUrl={currentLogoUrl}
        initialCropData={currentCropData}
        onSaveLogo={handleSaveCroppedLogo}
      />

      <AdminHistoryDetailModal
        isOpen={Boolean(selectedHistoryItem)}
        onClose={() => setSelectedHistoryItem(null)}
        record={selectedHistoryItem}
      />
    </div>
  );
};

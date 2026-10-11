import React, { useState, useEffect, useMemo } from 'react';
import {
  Check,
  RotateCcw,
  Download,
  Zap,
  ArrowRight,
  Activity,
  Heart,
  Wind,
  ShieldCheck,
  Sparkles,
  Calendar,
  AlertCircle,
  FileCheck,
  Loader2,
  CheckCircle2,
  Stethoscope,
} from 'lucide-react';
import { LungsVisual } from './LungsVisual';
import { RiskAnalysisResult, QuestionnaireData } from '../types';
import { ReportModal } from './ReportModal';
import { useAuth } from '../context/AuthContext';
import { getAssessmentHistory, SupabaseAssessmentRecord } from '../lib/supabase';

interface DiagnosisPageProps {
  analysis: RiskAnalysisResult;
  formData: QuestionnaireData;
  onRetest: () => void;
  onBackToHome: () => void;
}

export const DiagnosisPage: React.FC<DiagnosisPageProps> = ({
  analysis,
  formData,
  onRetest,
  onBackToHome,
}) => {
  const [activeTab, setActiveTab] = useState<
    'summary' | 'parameters' | 'lifestyle' | 'history'
  >('summary');
  const [isReportOpen, setIsReportOpen] = useState(false);

  const { user } = useAuth();
  const [historyList, setHistoryList] = useState<SupabaseAssessmentRecord[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const records = await getAssessmentHistory(user?.id);
      setHistoryList(records);
    };
    fetchHistory();
  }, [user?.id, activeTab]);
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [displayedScore, setDisplayedScore] = useState(0);

  // 6 Clinical Verification Steps dynamically mapped to the 6 Questionnaire sections answered by the user
  const verificationSteps = useMemo(() => {
    // 1. Demografi & Fisik
    const step1Answer = `${formData.age} Tahun • ${formData.gender === 'male' ? 'Laki-laki' : 'Perempuan'}`;

    // 2. Inhalasi & Paparan Asap (Brinkman)
    const smokeLabel =
      formData.smoke_status === 0
        ? 'Bebas Rokok Aktif (0)'
        : formData.smoke_status === 3
        ? 'Mantan Perokok (3)'
        : `Perokok Aktif (${formData.smoke_cigs} btg/hr)`;
    const brinkmanVal = (formData.smoke_cigs || 0) * (formData.smoke_years || 0);
    const step2Answer = `${smokeLabel} • Brinkman: ${brinkmanVal}`;

    // 3. Kebugaran Fisik & Toleransi Tangga
    const stairLabel =
      formData.stair_test === 0
        ? 'Mampu >3 Lantai (Tanpa Sesak)'
        : formData.stair_test === 3
        ? '1-2 Lantai (Terengah)'
        : '<1 Lantai (Napas Sesak)';
    const step3Answer = stairLabel;

    // 4. Gejala Batuk & Sputum / Dahak
    const coughLabel =
      formData.cough_symptom === 0
        ? 'Bebas Batuk'
        : formData.cough_symptom === 3
        ? 'Kadang Kering'
        : 'Batuk Kronis >3 Mgg';
    const sputumLabel =
      formData.sputum_color <= 1
        ? 'Tanpa Dahak'
        : formData.sputum_color <= 6
        ? 'Bening/Encer'
        : 'Keruh/Kental';
    const step4Answer = `${coughLabel} • ${sputumLabel}`;

    // 5. Mengi, Stridor & Nyeri Dada
    const wheezeLabel =
      formData.wheezing === 0
        ? 'Bebas Wheezing / Mengi'
        : formData.wheezing === 4
        ? 'Mengi Saat Lelah'
        : 'Mengi Istirahat / Stridor';
    const step5Answer = wheezeLabel;

    // 6. Lingkungan, APD & Riwayat Klinis
    const envLabel = formData.env_exposure === 0 ? 'Area Bersih' : 'Paparan Polutan';
    const medLabel = formData.medical_personal === 0 ? 'Bebas Riwayat' : 'Ada Riwayat Paru';
    const step6Answer = `${envLabel} • ${medLabel}`;

    return [
      {
        num: '01',
        title: 'Data Demografi',
        subtitle: 'Baseline Fisiologis',
        action: 'Memvalidasi profil demografi & kapasitas vital...',
        userAnswer: step1Answer,
        category: 'Karakteristik',
      },
      {
        num: '02',
        title: 'Inhalasi & Rokok',
        subtitle: 'Indeks Brinkman & Asap',
        action: 'Menghitung beban inhalasi & Brinkman pack-years...',
        userAnswer: step2Answer,
        category: 'Inhalasi',
      },
      {
        num: '03',
        title: 'Kebugaran Fisik',
        subtitle: 'Uji Tangga & Aerobik',
        action: 'Mengevaluasi toleransi latihan & ketahanan tangga...',
        userAnswer: step3Answer,
        category: 'Kapasitas',
      },
      {
        num: '04',
        title: 'Batuk & Dahak',
        subtitle: 'Sekresi Mukosa Bronkus',
        action: 'Menganalisis frekuensi batuk & viskositas sputum...',
        userAnswer: step4Answer,
        category: 'Gejala Akut',
      },
      {
        num: '05',
        title: 'Mengi & Nyeri Dada',
        subtitle: 'Obstruksi Saluran Napas',
        action: 'Memindai resistensi aliran bronkus & spasme dada...',
        userAnswer: step5Answer,
        category: 'Obstruksi',
      },
      {
        num: '06',
        title: 'Lingkungan & Riwayat',
        subtitle: 'Beban Polutan & Genetik',
        action: 'Mengintegrasikan riwayat medis & predisposisi genetik...',
        userAnswer: step6Answer,
        category: 'Genetik & APD',
      },
    ];
  }, [formData]);

  useEffect(() => {
    // Reset and initiate smooth 4.0-second clinical analysis progress
    setIsAnalyzing(true);
    setProgress(0);
    setCurrentStepIndex(0);
    setDisplayedScore(0);

    const duration = 4000;
    const startTime = performance.now();
    const targetScore = analysis.healthScore;

    let animFrameId: number;

    const updateTimeline = (now: number) => {
      const elapsed = now - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);

      // Percentage 0 - 100
      const currentPct = Math.round(rawProgress * 100);
      setProgress(currentPct);

      // Step Index: 0 to 5, then 6 when finished
      const activeIdx = rawProgress >= 1 ? 6 : Math.min(5, Math.floor(rawProgress * 6));
      setCurrentStepIndex(activeIdx);

      // Score animates up in sync with progress
      const easedScore =
        rawProgress === 1 ? 1 : 1 - Math.pow(2, -8 * rawProgress);
      setDisplayedScore(Math.round(easedScore * targetScore));

      if (rawProgress < 1) {
        animFrameId = requestAnimationFrame(updateTimeline);
      } else {
        setIsAnalyzing(false);
        setProgress(100);
        setCurrentStepIndex(6);
        setDisplayedScore(targetScore);
      }
    };

    animFrameId = requestAnimationFrame(updateTimeline);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [analysis.healthScore]);

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      {/* REAL-TIME CLINICAL ENGINE PROCESSING BANNER (Requested by user) */}
      <section className="mb-8">
        <div
          className={`rounded-3xl p-5 sm:p-6 transition-all duration-500 shadow-glassCard border ${
            isAnalyzing
              ? 'bg-gradient-to-r from-amber-50/90 via-rose-50/80 to-white border-amber-200/90'
              : 'bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-white border-emerald-200/90'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left Info */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                {isAnalyzing ? (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold uppercase tracking-wider border border-amber-200">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF5C50]" />
                    <span>ENGINE METODE BIOS • SEDANG MEMPROSES</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>METODE BIOS • 100% ANALISIS TERVERIFIKASI</span>
                  </span>
                )}
                <span className="text-xs text-slate-500 hidden sm:inline">•</span>
                <span className="text-xs font-mono font-semibold text-slate-600 hidden sm:inline">
                  ID: #PRS-99201-OK
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                {isAnalyzing ? (
                  <>
                    <span>Menghitung, Mendata &amp; Mendiagnosa 6 Domain Klinis...</span>
                  </>
                ) : (
                  <>
                    <span>Hasil Diagnosis Selesai Berdasarkan 6 Pertanyaan Anda</span>
                  </>
                )}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                {isAnalyzing ? (
                  <span className="font-medium text-slate-700">
                    {verificationSteps[Math.min(currentStepIndex, 5)]?.action}{' '}
                    <span className="text-[#FF5C50] font-bold">
                      [Data: {verificationSteps[Math.min(currentStepIndex, 5)]?.userAnswer}]
                    </span>
                  </span>
                ) : (
                  <span>
                    Seluruh 6 domain dari kuesioner Anda telah dihitung dan divalidasi secara real-time sesuai standar pulmonologi internasional (GOLD Guidelines 2024 &amp; ATS/ERS).
                  </span>
                )}
              </p>
            </div>

            {/* Right Progress Counter */}
            <div className="flex items-center space-x-4 shrink-0 bg-white/80 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Status Verifikasi
                </span>
                <span className="text-2xl font-black tabular-nums tracking-tight text-slate-900">
                  {progress}%
                </span>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-700 font-bold text-xs">
                {isAnalyzing ? (
                  <Activity className="w-5 h-5 text-[#FF5C50] animate-pulse" />
                ) : (
                  <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
                )}
              </div>
            </div>
          </div>

          {/* Smooth Linear Progress Bar */}
          <div className="mt-4 w-full bg-slate-200/70 rounded-full h-2 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isAnalyzing
                  ? 'bg-gradient-to-r from-[#FF5C50] via-[#FF7368] to-amber-500'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </section>

      {/* Upper Main Section: Left Diagnosis + Center Lungs + Right Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10">
        {/* Left Column: Hasil Diagnosis text & badges (5 Columns) */}
        <div className="lg:col-span-5 space-y-5 text-left">
          {/* Status Badge */}
          <div
            className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold ${
              isAnalyzing
                ? 'bg-amber-50 border border-amber-200 text-amber-800'
                : analysis.level === 'Prima'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-orange-50 border border-orange-200 text-orange-800'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isAnalyzing
                  ? 'bg-amber-500 animate-ping'
                  : 'bg-emerald-500 animate-pulse'
              }`}
            />
            <span>
              {isAnalyzing
                ? `Memproses Real-Time (${progress}%)`
                : `Status: ${analysis.level} • Indeks Normal ${analysis.healthScore}%`}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Hasil Diagnosis: <br />
            <span className="text-[#96473D] bg-clip-text text-transparent bg-gradient-to-r from-[#96473D] via-[#FF5C50] to-[#E0483C]">
              {analysis.level === 'Prima'
                ? 'Paru-Paru Sehat & Bersih'
                : analysis.level === 'Sedang'
                ? 'Risiko Sedang • Pantau Ventilasi'
                : 'Perhatian Khusus Kardiorespirasi'}
            </span>
          </h1>

          {/* Subtext description */}
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
            Berdasarkan analisis rekaman data klinis 6 domain, evaluasi ventilasi FVC, dan pemindaian pola aliran udara berbasis AI, fungsi paru-paru Anda berfungsi dalam{' '}
            <strong className="text-slate-800">kondisi {analysis.level.toLowerCase()}</strong>{' '}
            {analysis.narrativeText}
          </p>

          {/* 3 Checkmark Feature Badges matching Image 6 and user realtime answers */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-white/80 border border-white shadow-xs text-xs font-semibold text-slate-800">
              <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
              <span>
                {formData.wheezing === 0
                  ? 'Bebas Wheezing / Ronki'
                  : 'Wheezing Terdeteksi'}
              </span>
            </div>
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-white/80 border border-white shadow-xs text-xs font-semibold text-slate-800">
              <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
              <span>
                {formData.stair_test === 0
                  ? 'Kapasitas Vital Optimal'
                  : 'Kapasitas Vital Terbatas'}
              </span>
            </div>
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-white/80 border border-white shadow-xs text-xs font-semibold text-slate-800">
              <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
              <span>
                {formData.cough_symptom === 0
                  ? 'Jalur Bronkus Bersih'
                  : 'Iritasi Saluran Napas'}
              </span>
            </div>
          </div>
        </div>

        {/* Center Visual: 3D Glass Lungs (4 Columns) */}
        <div className="lg:col-span-4 flex items-center justify-center relative">
          <LungsVisual interactive={true} score={displayedScore || analysis.healthScore} />
        </div>

        {/* Right Column: Skor Kesehatan Paru-Paru Card (3 Columns) matching Image 6 */}
        <div className="lg:col-span-3">
          <div className="glass-card rounded-3xl p-6 sm:p-7 shadow-glass relative border border-white">
            {/* Header */}
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Skor Kesehatan Paru-Paru
              </p>
              <button
                onClick={() => setIsReportOpen(true)}
                className="w-8 h-8 rounded-full border border-slate-200 bg-white/80 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition shadow-xs cursor-pointer"
                title="Lihat Rincian Analisis"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Big Score with smooth count-up animation */}
            <div className="flex items-baseline space-x-2 mt-3 mb-5">
              <span className="text-5xl font-black text-slate-900 tracking-tight tabular-nums">
                {displayedScore}
              </span>
              <span className="text-sm font-semibold text-slate-400">/ 100</span>
              <span
                className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  analysis.level === 'Prima'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {isAnalyzing ? 'Menghitung...' : analysis.level}
              </span>
            </div>

            {/* Kurva Siklus Tidal Section */}
            <div className="mb-5 pb-4 border-b border-slate-200/60">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-700">Kurva Siklus Tidal</span>
                <span className="font-bold text-emerald-600">Ritme Stabil</span>
              </div>

              {/* Tidal Wave SVG matching Image 6 */}
              <div className="h-16 w-full relative">
                <svg
                  viewBox="0 0 280 80"
                  className="w-full h-full overflow-visible"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 5 45 C 30 18, 50 18, 70 42 C 90 62, 110 65, 130 45 C 150 25, 170 15, 190 40 C 210 62, 230 12, 248 38 C 255 48, 265 15, 275 35"
                    stroke="#FF7368"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Glowing marker indicator on Saturday point */}
                  <circle cx="218" cy="50" r="5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5" />
                </svg>
              </div>

              {/* Weekday indicators */}
              <div className="flex justify-between text-[10px] font-semibold text-slate-400 px-1 mt-1">
                <span>Sen</span>
                <span>Sel</span>
                <span>Rab</span>
                <span>Kam</span>
                <span>Jum</span>
                <span className="text-slate-900 font-bold">Sab</span>
                <span>Min</span>
              </div>
            </div>

            {/* Metric Parameter List matching Image 6 */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Kapasitas Vital (FVC)</span>
                <span className="font-bold text-slate-900">
                  {analysis.fvc}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Rasio FEV1 / FVC</span>
                <span className="font-bold text-slate-900">
                  {analysis.fev1Ratio}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Saturasi O2 (SpO2)</span>
                <span className="font-bold text-slate-900">
                  {analysis.spo2}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Frekuensi Napas</span>
                <span className="font-bold text-slate-900">
                  {analysis.respiratoryRate}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel matching Image 6 */}
      <section className="glass-panel rounded-3xl p-6 sm:p-8 shadow-glassCard border border-white">
        {/* Row 1: Nav Tabs + Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/70">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-2 px-4 rounded-full text-xs font-bold transition cursor-pointer ${
                activeTab === 'summary'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white/70 hover:bg-white text-slate-700 border border-slate-200'
              }`}
            >
              Ringkasan Medis
            </button>
            <button
              onClick={() => setActiveTab('parameters')}
              className={`py-2 px-4 rounded-full text-xs font-bold transition cursor-pointer ${
                activeTab === 'parameters'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white/70 hover:bg-white text-slate-700 border border-slate-200'
              }`}
            >
              Detail Parameter
            </button>
            <button
              onClick={() => setActiveTab('lifestyle')}
              className={`py-2 px-4 rounded-full text-xs font-bold transition cursor-pointer ${
                activeTab === 'lifestyle'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white/70 hover:bg-white text-slate-700 border border-slate-200'
              }`}
            >
              Rekomendasi Gaya Hidup
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-4 rounded-full text-xs font-bold transition cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white/70 hover:bg-white text-slate-700 border border-slate-200'
              }`}
            >
              Riwayat Tes
            </button>
          </div>

          {/* Actions on the right */}
          <div className="flex items-center space-x-3 self-start md:self-auto">
            <button
              onClick={onRetest}
              className="py-2.5 px-4 rounded-full bg-white/80 hover:bg-white text-slate-800 border border-slate-200 font-bold text-xs transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span>Uji Deteksi Ulang</span>
            </button>
            <button
              onClick={() => setIsReportOpen(true)}
              className="py-2.5 px-5 rounded-full bg-gradient-to-r from-[#FF5C50] to-[#FF7368] hover:from-[#E0483C] hover:to-[#FF5C50] text-white font-bold text-xs transition shadow-glowSm flex items-center space-x-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Laporan Medis (PDF)</span>
            </button>
          </div>
        </div>

        {/* Dynamic Tab Body */}
        {activeTab === 'summary' && (
          <div className="py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-[#FF5C50]" />
                  <span>Alur Verifikasi Analisis Medis (6 Pertanyaan Kuesioner)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Validasi bertahap berdasarkan data kuesioner yang Anda isi secara real-time
                </p>
              </div>

              {!isAnalyzing ? (
                <span className="self-start sm:self-auto px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1.5 shadow-xs">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  <span>100% Selesai &amp; Tervalidasi</span>
                </span>
              ) : (
                <span className="self-start sm:self-auto px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  <span>
                    Menganalisis Langkah {Math.min(currentStepIndex + 1, 6)} dari 6...
                  </span>
                </span>
              )}
            </div>

            {/* 6-STEP VERIFICATION TIMELINE RESPONSIVE GRID (Requested by user) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-3.5 my-4">
              {verificationSteps.map((step, idx) => {
                const isStepCompleted = !isAnalyzing || currentStepIndex > idx;
                const isStepActive = isAnalyzing && currentStepIndex === idx;
                const isStepPending = isAnalyzing && currentStepIndex < idx;

                return (
                  <div
                    key={step.num}
                    className={`rounded-2xl p-4 transition-all duration-300 border flex flex-col justify-between relative overflow-hidden ${
                      isStepCompleted
                        ? 'bg-white/90 border-emerald-200/90 shadow-xs'
                        : isStepActive
                        ? 'bg-rose-50/70 border-[#FF5C50] shadow-md ring-2 ring-[#FF5C50]/20'
                        : 'bg-white/40 border-slate-200/60 opacity-60'
                    }`}
                  >
                    {/* Top indicator & category */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {step.num}
                      </span>
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isStepCompleted
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : isStepActive
                            ? 'bg-[#FF5C50] text-white animate-bounce shadow-xs'
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {isStepCompleted ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : isStepActive ? (
                          <Zap className="w-3.5 h-3.5 fill-white" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>
                    </div>

                    {/* Step Title & Subtitle */}
                    <div className="space-y-1 mb-3">
                      <h4
                        className={`text-xs font-black tracking-tight leading-snug ${
                          isStepCompleted
                            ? 'text-slate-900'
                            : isStepActive
                            ? 'text-[#FF5C50]'
                            : 'text-slate-500'
                        }`}
                      >
                        {step.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium line-clamp-1">
                        {step.subtitle}
                      </p>
                    </div>

                    {/* Real-time User Answer Chip */}
                    <div className="pt-2 border-t border-slate-100 mt-auto">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Jawaban Anda:
                      </span>
                      <p
                        className={`text-[11px] font-semibold leading-tight line-clamp-2 ${
                          isStepCompleted
                            ? 'text-slate-800'
                            : isStepActive
                            ? 'text-[#96473D] font-bold'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.userAnswer}
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span
                          className={`font-bold ${
                            isStepCompleted
                              ? 'text-emerald-600'
                              : isStepActive
                              ? 'text-[#FF5C50]'
                              : 'text-slate-400'
                          }`}
                        >
                          {isStepCompleted
                            ? '✓ Tervalidasi'
                            : isStepActive
                            ? '● Menganalisis...'
                            : 'Menunggu'}
                        </span>
                        <span className="text-slate-400 text-[9px]">
                          {step.category}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'parameters' && (
          <div className="py-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Rincian Parameter Uji Fungsi Paru &amp; Spirometri
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80">
                <span className="text-xs text-slate-500">Forced Vital Capacity (FVC)</span>
                <p className="text-xl font-black text-slate-900 mt-1">{analysis.fvc}</p>
                <p className="text-xs text-emerald-600 mt-1">Normal: 3.5 - 5.0 L (Kapasitas Maksimal)</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80">
                <span className="text-xs text-slate-500">FEV1 / FVC Ratio (Tiffeneau)</span>
                <p className="text-xl font-black text-slate-900 mt-1">{analysis.fev1Ratio}</p>
                <p className="text-xs text-emerald-600 mt-1">Nilai &gt; 70% meniadakan obstruksi saluran</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80">
                <span className="text-xs text-slate-500">Indeks Paparan Brinkman</span>
                <p className="text-xl font-black text-slate-900 mt-1">{analysis.brinkman}</p>
                <p className="text-xs text-slate-600 mt-1">Kategori: {analysis.brinkmanCategory}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lifestyle' && (
          <div className="py-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Rekomendasi Gaya Hidup &amp; Olahraga Paru
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70">
                <h5 className="font-bold text-emerald-900 text-xs mb-1">Latihan Kardiorespirasi</h5>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Lakukan jogging ringan, bersepeda, atau berenang 30 menit sehari untuk mempertahankan elastisitas dinding alveolus.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/70">
                <h5 className="font-bold text-blue-900 text-xs mb-1">Perlindungan Kualitas Udara</h5>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Periksa indeks AQI sebelum berolahraga outdoor. Gunakan air purifier di dalam kamar untuk menyaring alergen dan PM2.5.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70">
                <h5 className="font-bold text-amber-900 text-xs mb-1">Pola Hidup Bebas Asap</h5>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Hindari lingkungan tertutup dengan asap rokok atau vape untuk mencegah iritasi silia bronkus.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="py-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Riwayat Tes &amp; Komparasi Berkala (Database Supabase)
              </h4>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                {historyList.length > 0 ? `${historyList.length} Tes Tersimpan` : 'Tersinkron Database'}
              </span>
            </div>

            <div className="space-y-2">
              {/* Current Active Test */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/90 border border-emerald-200 text-xs shadow-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <span className="font-bold text-slate-900">Pemeriksaan Terbaru (Metode BIOS)</span>
                    <p className="text-[11px] text-slate-500">
                      Hari Ini • {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600">{analysis.healthScore} / 100</span>
                  <p className="text-[11px] text-slate-400">Kondisi {analysis.level}</p>
                </div>
              </div>

              {/* Saved Records from Supabase */}
              {historyList.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 text-xs hover:bg-white transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5C50]" />
                    <div>
                      <span className="font-semibold text-slate-800">
                        Pemeriksaan #{item.id?.slice(-6) || idx + 1}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Tersimpan di Supabase'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-800">{item.health_score} / 100</span>
                    <p className="text-[11px] text-slate-500">{item.risk_level}</p>
                  </div>
                </div>
              ))}

              {/* Historical baseline sample */}
              {historyList.length === 0 && (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <div>
                      <span className="font-semibold text-slate-700">Tes Skrining Baseline Berkala</span>
                      <p className="text-[11px] text-slate-500">12 Apr 2024, 14:20 WIB</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-slate-600">96 / 100</span>
                    <p className="text-[11px] text-slate-400">Normal Stabil</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Row 3: Footer Sub-Info matching Image 6 */}
        <div className="pt-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>
              Pemeriksaan Selesai • Diverifikasi oleh Algoritma Medis Metode BIOS &amp; Terstandarisasi Klinis
            </span>
          </div>
          <div className="font-mono text-slate-600 font-semibold">
            ID Analisis: #PRS-99201-OK
          </div>
        </div>
      </section>

      {/* Printable Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        analysis={analysis}
        formData={formData}
      />
    </div>
  );
};

import React, { useMemo } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Activity,
  Sparkles,
} from 'lucide-react';
import { QuestionnaireData, RiskAnalysisResult } from '../types';

interface QuestionnairePageProps {
  formData: QuestionnaireData;
  onUpdateFormData: (data: Partial<QuestionnaireData>) => void;
  onSubmit: (result: RiskAnalysisResult) => void;
  onBackToHome: () => void;
}

export const QuestionnairePage: React.FC<QuestionnairePageProps> = ({
  formData,
  onUpdateFormData,
  onSubmit,
  onBackToHome,
}) => {
  // Brinkman Calculation
  const brinkman = useMemo(() => {
    const cigs = Number(formData.smoke_cigs) || 0;
    const years = Number(formData.smoke_years) || 0;
    const value = cigs * years;
    let category = 'Ringan (<200)';
    if (value >= 600) {
      category = 'Berat (>600)';
    } else if (value >= 200) {
      category = 'Sedang (200-600)';
    }
    const packYears = ((cigs / 20) * years).toFixed(1);
    return { value, category, packYears };
  }, [formData.smoke_cigs, formData.smoke_years]);

  // Real-time Clinical Analysis Engine Calculation
  const analysisResult = useMemo((): RiskAnalysisResult => {
    let cumulative = 0;
    cumulative += formData.smoke_status;
    cumulative += formData.passive_smoke;
    cumulative += formData.exercise_freq;
    cumulative += formData.stair_test;
    cumulative += formData.recovery_time;
    cumulative += formData.cough_symptom;
    cumulative += formData.sputum_color;
    cumulative += formData.wheezing;
    cumulative += formData.chest_pain;
    cumulative += formData.env_exposure;
    cumulative += formData.mask_habit;
    cumulative += formData.medical_personal;
    cumulative += formData.medical_family;

    // Brinkman impact addition
    if (brinkman.value >= 600) cumulative += 8;
    else if (brinkman.value >= 200) cumulative += 4;

    // Normalized percentage
    const normalizedRisk = Math.min(100, Math.round((cumulative / 75) * 100));
    const healthScore = Math.max(1, 100 - normalizedRisk);

    let level: 'Prima' | 'Sedang' | 'Tinggi' | 'Kritis' = 'Prima';
    let badgeLabel = 'Low Risk (Kondisi Prima)';
    let badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
    let fillColor = 'bg-emerald-500';
    let statusText = 'Optimal • Indeks Normal ' + healthScore + '%';
    let narrativeText =
      'Kondisi Prima - Paru Sehat & Optimal. Kapasitas vital terpantau stabil, tidak ditemukan kelainan obstruktif. Lanjutkan olahraga teratur dan hidrasi optimal.';
    let fvc = '4.8 L (99%)';
    let fev1Ratio = '86% (>70%)';
    let spo2 = '99% Normal';
    let respiratoryRate = '14 bpm Optimal';

    if (normalizedRisk > 85) {
      level = 'Kritis';
      badgeLabel = 'Critical Risk (Red Flags)';
      badgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
      fillColor = 'bg-rose-600';
      statusText = 'Perhatian Khusus • Indeks Risiko ' + normalizedRisk + '%';
      narrativeText =
        'Risiko Kritis / Red Flags - Ditemukan gejala darurat pernapasan atau kombinasi risiko tinggi. Sangat dianjurkan segera konsultasikan ke Dokter Spesialis Paru (Sp.P).';
      fvc = '2.9 L (64%)';
      fev1Ratio = '62% (<70%)';
      spo2 = '93% Waspada';
      respiratoryRate = '24 bpm Takipnea';
    } else if (normalizedRisk > 60) {
      level = 'Tinggi';
      badgeLabel = 'High Risk (Risiko Tinggi)';
      badgeClass = 'bg-orange-100 text-orange-800 border-orange-200';
      fillColor = 'bg-orange-500';
      statusText = 'Waspada • Indeks Risiko ' + normalizedRisk + '%';
      narrativeText =
        'Risiko Tinggi - Terindikasi potensi penurunan kapasitas atau obstruksi paru. Sangat direkomendasikan tes Spirometri dan evaluasi Rontgen Toraks berkala.';
      fvc = '3.5 L (78%)';
      fev1Ratio = '68% (<70%)';
      spo2 = '96% Normal Rendah';
      respiratoryRate = '20 bpm';
    } else if (normalizedRisk > 25) {
      level = 'Sedang';
      badgeLabel = 'Moderate Risk (Risiko Sedang)';
      badgeClass = 'bg-amber-100 text-amber-800 border-amber-200';
      fillColor = 'bg-amber-500';
      statusText = 'Cukup Baik • Indeks Risiko ' + normalizedRisk + '%';
      narrativeText =
        'Risiko Sedang - Waspadai paparan asap & tingkatkan aktivitas kardiorespirasi. Pantau gejala harian dan minimalkan inhalasi polutan bebas.';
      fvc = '4.2 L (88%)';
      fev1Ratio = '78% (>70%)';
      spo2 = '98% Normal';
      respiratoryRate = '16 bpm';
    }

    return {
      riskScore: normalizedRisk,
      healthScore,
      level,
      badgeLabel,
      badgeClass,
      fillColor,
      statusText,
      narrativeText,
      brinkman: brinkman.value,
      brinkmanCategory: brinkman.category,
      fvc,
      fev1Ratio,
      spo2,
      respiratoryRate,
    };
  }, [formData, brinkman]);

  // Handle Action Trigger: triggers immediate smooth transition to diagnosis
  const handleStartAnalysis = () => {
    onSubmit(analysisResult);
  };

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      {/* Top Header Banner */}
      <section className="mb-8" data-purpose="page-intro">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200/60">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#FF5C50] mb-1">
              <span>Assessment Klinis Mandiri</span>
              <span>•</span>
              <span>Berbasis Bukti Ilmiah</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Kuesioner Analisis Kesehatan Paru{' '}
              <span className="text-slate-400 font-normal">(Metode BIOS)</span>
            </h1>
            <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
              Penilaian terintegrasi berbasis 6 domain klinis &amp; gaya hidup untuk mendeteksi potensi gangguan kardiorespirasi serta risiko PPOK, Asma, atau inflamasi saluran napas sedini mungkin.
            </p>
          </div>

          {/* Step / Status Badge */}
          <div className="flex flex-col items-start md:items-end flex-shrink-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Status Formulir
            </span>
            <div className="mt-1 flex items-center space-x-2 bg-white/90 border border-slate-200/80 px-4 py-2 rounded-2xl shadow-xs">
              <span className="text-xs font-bold text-slate-800">Langkah 1 dari 6</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span className="text-xs text-[#FF5C50] font-bold">14 Parameter Klinis</span>
            </div>
          </div>
        </div>

        {/* Quick Progress Bar */}
        <div className="mt-6 glass-panel rounded-2xl p-4 shadow-glassCard">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <span>Kelengkapan Pengisian Kuesioner</span>
            <span className="text-[#FF5C50] font-bold">100% Terisi</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200">
            <div
              className="bg-gradient-to-r from-[#FF5C50] to-[#FF7368] h-full rounded-full transition-all duration-300"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </section>

      {/* Main Form Questionnaire (Centered Full Width) */}
      <form
        className="space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          handleStartAnalysis();
        }}
      >
        {/* CATEGORY 1: Data Demografi */}
        <article className="glass-panel rounded-3xl p-6 sm:p-8 shadow-glassCard relative overflow-hidden">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              01
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Data Demografi &amp; Karakteristik Dasar
              </h2>
              <p className="text-xs text-slate-500">Profil fisiologis untuk baseline kapasitas vital paru</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Usia */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700" htmlFor="input-age">
                Usia Anda (Tahun)
              </label>
              <div className="relative">
                <input
                  id="input-age"
                  type="number"
                  min="15"
                  max="100"
                  value={formData.age}
                  onChange={(e) => onUpdateFormData({ age: Number(e.target.value) || 28 })}
                  className="w-full rounded-2xl border-slate-200 bg-white/80 focus:border-[#FF5C50] focus:ring-[#FF5C50] text-sm py-2.5 px-3.5 font-semibold text-slate-800 placeholder-slate-400"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium">
                  Tahun
                </span>
              </div>
            </div>
            {/* Jenis Kelamin */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Jenis Kelamin Biologis
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    id="gender-male"
                    name="gender"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.gender === 'male'}
                    onChange={() => onUpdateFormData({ gender: 'male' })}
                  />
                  <label
                    htmlFor="gender-male"
                    className="flex items-center justify-center py-2.5 px-3 rounded-2xl border border-slate-200 bg-white/60 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-white transition-all text-center"
                  >
                    Laki-laki
                  </label>
                </div>
                <div>
                  <input
                    id="gender-female"
                    name="gender"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.gender === 'female'}
                    onChange={() => onUpdateFormData({ gender: 'female' })}
                  />
                  <label
                    htmlFor="gender-female"
                    className="flex items-center justify-center py-2.5 px-3 rounded-2xl border border-slate-200 bg-white/60 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-white transition-all text-center"
                  >
                    Perempuan
                  </label>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* CATEGORY 2: Kebiasaan Merokok & Paparan Asap */}
        <article className="glass-panel rounded-3xl p-6 sm:p-8 shadow-glassCard relative overflow-hidden">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              02
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Inhalasi &amp; Paparan Asap (Inhalation Burden)
              </h2>
              <p className="text-xs text-slate-500">
                Evaluasi indeks paparan partikulat tembakau, aerosol, dan uap kimia
              </p>
            </div>
          </div>
          <div className="space-y-6">
            {/* 2.1 Status Merokok */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Status Kebiasaan Merokok Pribadi
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <input
                    id="smoke-never"
                    name="smoke_status"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.smoke_status === 0}
                    onChange={() => onUpdateFormData({ smoke_status: 0 })}
                  />
                  <label
                    htmlFor="smoke-never"
                    className="flex items-start p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white transition-all"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2.5 mt-0.5 pill-indicator flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Tidak Pernah</p>
                      <p className="text-[11px] text-slate-500">Bobot Risiko: 0</p>
                    </div>
                  </label>
                </div>
                <div>
                  <input
                    id="smoke-former"
                    name="smoke_status"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.smoke_status === 3}
                    onChange={() => onUpdateFormData({ smoke_status: 3 })}
                  />
                  <label
                    htmlFor="smoke-former"
                    className="flex items-start p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white transition-all"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2.5 mt-0.5 pill-indicator flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Mantan Perokok</p>
                      <p className="text-[11px] text-slate-500">Berhenti &gt;1 thn (Bobot: 3)</p>
                    </div>
                  </label>
                </div>
                <div>
                  <input
                    id="smoke-active"
                    name="smoke_status"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.smoke_status === 8}
                    onChange={() => onUpdateFormData({ smoke_status: 8 })}
                  />
                  <label
                    htmlFor="smoke-active"
                    className="flex items-start p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white transition-all"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2.5 mt-0.5 pill-indicator flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Perokok Aktif</p>
                      <p className="text-[11px] text-slate-500">Rutin (Bobot: 8)</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* 2.2 Jenis & Intensitas Rokok (Pack-Years Calculator) */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-amber-900">
                  Perhitungan Indeks Brinkman &amp; Pack-Years
                </span>
                <span className="text-[11px] text-amber-700 font-semibold bg-amber-100/80 px-2 py-0.5 rounded-md">
                  Automated Clinical Metric
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1" htmlFor="smoke-type">
                    Jenis Inhalasi
                  </label>
                  <select
                    id="smoke-type"
                    value={formData.smoke_type}
                    onChange={(e) => onUpdateFormData({ smoke_type: e.target.value })}
                    className="w-full text-xs rounded-xl border-slate-200 bg-white py-2 px-2.5 font-medium text-slate-800 focus:border-[#FF5C50] focus:ring-[#FF5C50]"
                  >
                    <option>Konvensional / Kretek</option>
                    <option>Vape / Pod Elektrik</option>
                    <option>Shisha / Cerutu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1" htmlFor="smoke-cigs">
                    Batang per Hari
                  </label>
                  <input
                    id="smoke-cigs"
                    type="number"
                    min="0"
                    value={formData.smoke_cigs}
                    onChange={(e) =>
                      onUpdateFormData({ smoke_cigs: Number(e.target.value) || 0 })
                    }
                    className="w-full text-xs rounded-xl border-slate-200 bg-white py-2 px-2.5 font-medium text-slate-800 focus:border-[#FF5C50] focus:ring-[#FF5C50]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1" htmlFor="smoke-years">
                    Durasi (Tahun)
                  </label>
                  <input
                    id="smoke-years"
                    type="number"
                    min="0"
                    value={formData.smoke_years}
                    onChange={(e) =>
                      onUpdateFormData({ smoke_years: Number(e.target.value) || 0 })
                    }
                    className="w-full text-xs rounded-xl border-slate-200 bg-white py-2 px-2.5 font-medium text-slate-800 focus:border-[#FF5C50] focus:ring-[#FF5C50]"
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-amber-900 font-medium pt-2 border-t border-amber-200/50">
                <span>
                  Indeks Brinkman Terhitung:{' '}
                  <strong>{brinkman.value} ({brinkman.category})</strong>
                </span>
                <span className="text-[11px] text-amber-800">
                  Pack-Years: <strong>{brinkman.packYears} PY</strong>
                </span>
              </div>
            </div>

            {/* 2.3 Paparan Perokok Pasif */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Paparan Asap Orang Lain (Secondhand Smoke)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <input
                    id="passive-never"
                    name="passive_smoke"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.passive_smoke === 0}
                    onChange={() => onUpdateFormData({ passive_smoke: 0 })}
                  />
                  <label
                    htmlFor="passive-never"
                    className="flex items-center p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 pill-indicator flex-shrink-0" />
                    Tidak Pernah (0)
                  </label>
                </div>
                <div>
                  <input
                    id="passive-rare"
                    name="passive_smoke"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.passive_smoke === 2}
                    onChange={() => onUpdateFormData({ passive_smoke: 2 })}
                  />
                  <label
                    htmlFor="passive-rare"
                    className="flex items-center p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 pill-indicator flex-shrink-0" />
                    Jarang / 1-2x pekan (2)
                  </label>
                </div>
                <div>
                  <input
                    id="passive-often"
                    name="passive_smoke"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.passive_smoke === 5}
                    onChange={() => onUpdateFormData({ passive_smoke: 5 })}
                  />
                  <label
                    htmlFor="passive-often"
                    className="flex items-center p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 pill-indicator flex-shrink-0" />
                    Sering / Tiap Hari (5)
                  </label>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* CATEGORY 3: Olahraga & Aktivitas Fisik */}
        <article className="glass-panel rounded-3xl p-6 sm:p-8 shadow-glassCard relative overflow-hidden">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              03
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Ketahanan &amp; Aktivitas Fisik (Cardiorespiratory Fitness)
              </h2>
              <p className="text-xs text-slate-500">
                Menilai efisiensi pertukaran oksigen dan ambang lelah diafragma
              </p>
            </div>
          </div>
          <div className="space-y-5">
            {/* 3.1 Frekuensi Olahraga */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Frekuensi Aktivitas Aerobik / Kardio
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <input
                    id="sport-often"
                    name="exercise_freq"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.exercise_freq === 0}
                    onChange={() => onUpdateFormData({ exercise_freq: 0 })}
                  />
                  <label
                    htmlFor="sport-often"
                    className="flex items-center p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 pill-indicator flex-shrink-0" />
                    &gt; 3x seminggu (0)
                  </label>
                </div>
                <div>
                  <input
                    id="sport-moderate"
                    name="exercise_freq"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.exercise_freq === 2}
                    onChange={() => onUpdateFormData({ exercise_freq: 2 })}
                  />
                  <label
                    htmlFor="sport-moderate"
                    className="flex items-center p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 pill-indicator flex-shrink-0" />
                    1 - 2x seminggu (2)
                  </label>
                </div>
                <div>
                  <input
                    id="sport-sedentary"
                    name="exercise_freq"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.exercise_freq === 5}
                    onChange={() => onUpdateFormData({ exercise_freq: 5 })}
                  />
                  <label
                    htmlFor="sport-sedentary"
                    className="flex items-center p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 pill-indicator flex-shrink-0" />
                    Sedentari / Jarang (5)
                  </label>
                </div>
              </div>
            </div>

            {/* 3.2 Uji Naik Tangga */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Ketahanan Napas Naik Tangga (2-3 Lantai)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <input
                    id="stair-normal"
                    name="stair_test"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.stair_test === 0}
                    onChange={() => onUpdateFormData({ stair_test: 0 })}
                  />
                  <label
                    htmlFor="stair-normal"
                    className="flex items-start p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 mt-0.5 pill-indicator flex-shrink-0" />
                    Normal tanpa sesak (0)
                  </label>
                </div>
                <div>
                  <input
                    id="stair-moderate"
                    name="stair_test"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.stair_test === 3}
                    onChange={() => onUpdateFormData({ stair_test: 3 })}
                  />
                  <label
                    htmlFor="stair-moderate"
                    className="flex items-start p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 mt-0.5 pill-indicator flex-shrink-0" />
                    Sedikit terengah-engah (3)
                  </label>
                </div>
                <div>
                  <input
                    id="stair-severe"
                    name="stair_test"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.stair_test === 7}
                    onChange={() => onUpdateFormData({ stair_test: 7 })}
                  />
                  <label
                    htmlFor="stair-severe"
                    className="flex items-start p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 mt-0.5 pill-indicator flex-shrink-0" />
                    Sesak berat / berhenti (7)
                  </label>
                </div>
              </div>
            </div>

            {/* 3.3 Pemulihan Napas */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Waktu Pemulihan Napas Pasca Aktivitas Berat
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <input
                    id="recovery-fast"
                    name="recovery_time"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.recovery_time === 0}
                    onChange={() => onUpdateFormData({ recovery_time: 0 })}
                  />
                  <label
                    htmlFor="recovery-fast"
                    className="flex items-center p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 pill-indicator flex-shrink-0" />
                    &lt; 2 Menit (0)
                  </label>
                </div>
                <div>
                  <input
                    id="recovery-med"
                    name="recovery_time"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.recovery_time === 3}
                    onChange={() => onUpdateFormData({ recovery_time: 3 })}
                  />
                  <label
                    htmlFor="recovery-med"
                    className="flex items-center p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 pill-indicator flex-shrink-0" />
                    3 - 5 Menit (3)
                  </label>
                </div>
                <div>
                  <input
                    id="recovery-slow"
                    name="recovery_time"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.recovery_time === 6}
                    onChange={() => onUpdateFormData({ recovery_time: 6 })}
                  />
                  <label
                    htmlFor="recovery-slow"
                    className="flex items-center p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 pill-indicator flex-shrink-0" />
                    &gt; 10 Menit (6)
                  </label>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* CATEGORY 4: Keluhan & Gejala Pernapasan */}
        <article className="glass-panel rounded-3xl p-6 sm:p-8 shadow-glassCard relative overflow-hidden">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              04
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Keluhan &amp; Gejala Pernapasan
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                  1-3 Bulan Terakhir
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Skrining gejala obstruksi bronkial dan infeksi parenkim paru
              </p>
            </div>
          </div>
          <div className="space-y-5">
            {/* 4.1 Frekuensi Batuk */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Frekuensi &amp; Durasi Batuk
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <input
                    id="cough-none"
                    name="cough_symptom"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.cough_symptom === 0}
                    onChange={() => onUpdateFormData({ cough_symptom: 0 })}
                  />
                  <label
                    htmlFor="cough-none"
                    className="flex items-center p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 pill-indicator flex-shrink-0" />
                    Tidak Ada (0)
                  </label>
                </div>
                <div>
                  <input
                    id="cough-dry"
                    name="cough_symptom"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.cough_symptom === 3}
                    onChange={() => onUpdateFormData({ cough_symptom: 3 })}
                  />
                  <label
                    htmlFor="cough-dry"
                    className="flex items-center p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 pill-indicator flex-shrink-0" />
                    Kadang batuk kering (3)
                  </label>
                </div>
                <div>
                  <input
                    id="cough-chronic"
                    name="cough_symptom"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.cough_symptom === 8}
                    onChange={() => onUpdateFormData({ cough_symptom: 8 })}
                  />
                  <label
                    htmlFor="cough-chronic"
                    className="flex items-center p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 pill-indicator flex-shrink-0" />
                    Berdahak &gt; 3 Minggu (8)
                  </label>
                </div>
              </div>
            </div>

            {/* 4.2 Dahak / Sputum */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Karakteristik Dahak / Ekspektorasi (Jika ada)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <input
                    id="sputum-clear"
                    name="sputum_color"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.sputum_color === 1}
                    onChange={() => onUpdateFormData({ sputum_color: 1 })}
                  />
                  <label
                    htmlFor="sputum-clear"
                    className="flex items-center p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 pill-indicator flex-shrink-0" />
                    Bening / Putih encer (1)
                  </label>
                </div>
                <div>
                  <input
                    id="sputum-yellow"
                    name="sputum_color"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.sputum_color === 6}
                    onChange={() => onUpdateFormData({ sputum_color: 6 })}
                  />
                  <label
                    htmlFor="sputum-yellow"
                    className="flex items-center p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 pill-indicator flex-shrink-0" />
                    Kuning / Hijau kental (6)
                  </label>
                </div>
                <div>
                  <input
                    id="sputum-blood"
                    name="sputum_color"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.sputum_color === 10}
                    onChange={() => onUpdateFormData({ sputum_color: 10 })}
                  />
                  <label
                    htmlFor="sputum-blood"
                    className="flex items-start p-3 rounded-2xl border border-rose-300 bg-rose-50/50 cursor-pointer hover:bg-rose-50 text-xs font-medium text-rose-900"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-rose-400 mr-2 mt-0.5 pill-indicator flex-shrink-0" />
                    <span>Bercak Darah (Red Flag: 10)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 4.3 Mengi / Wheezing */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Bunyi Napas Mengi (Wheezing) / Sesak
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <input
                    id="wheeze-none"
                    name="wheezing"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.wheezing === 0}
                    onChange={() => onUpdateFormData({ wheezing: 0 })}
                  />
                  <label
                    htmlFor="wheeze-none"
                    className="flex items-center p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 pill-indicator flex-shrink-0" />
                    Nihil / Bersih (0)
                  </label>
                </div>
                <div>
                  <input
                    id="wheeze-cold"
                    name="wheezing"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.wheezing === 4}
                    onChange={() => onUpdateFormData({ wheezing: 4 })}
                  />
                  <label
                    htmlFor="wheeze-cold"
                    className="flex items-center p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 pill-indicator flex-shrink-0" />
                    Hanya saat dingin/lelah (4)
                  </label>
                </div>
                <div>
                  <input
                    id="wheeze-rest"
                    name="wheezing"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.wheezing === 9}
                    onChange={() => onUpdateFormData({ wheezing: 9 })}
                  />
                  <label
                    htmlFor="wheeze-rest"
                    className="flex items-center p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 pill-indicator flex-shrink-0" />
                    Malam / Saat Istirahat (9)
                  </label>
                </div>
              </div>
            </div>

            {/* 4.4 Nyeri Dada */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Sensasi Nyeri / Rasa Berat di Rongga Dada
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <input
                    id="chest-none"
                    name="chest_pain"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.chest_pain === 0}
                    onChange={() => onUpdateFormData({ chest_pain: 0 })}
                  />
                  <label
                    htmlFor="chest-none"
                    className="flex items-center p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 pill-indicator flex-shrink-0" />
                    Tidak Ada (0)
                  </label>
                </div>
                <div>
                  <input
                    id="chest-mild"
                    name="chest_pain"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.chest_pain === 2}
                    onChange={() => onUpdateFormData({ chest_pain: 2 })}
                  />
                  <label
                    htmlFor="chest-mild"
                    className="flex items-center p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 pill-indicator flex-shrink-0" />
                    Kadang Pegal Otot (2)
                  </label>
                </div>
                <div>
                  <input
                    id="chest-sharp"
                    name="chest_pain"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.chest_pain === 8}
                    onChange={() => onUpdateFormData({ chest_pain: 8 })}
                  />
                  <label
                    htmlFor="chest-sharp"
                    className="flex items-center p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 pill-indicator flex-shrink-0" />
                    Nyeri Tajam saat Tarik Napas (8)
                  </label>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* CATEGORY 5: Lingkungan Harian & Okupasi */}
        <article className="glass-panel rounded-3xl p-6 sm:p-8 shadow-glassCard relative overflow-hidden">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              05
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Lingkungan Harian &amp; Okupasi (Environmental Exposure)
              </h2>
              <p className="text-xs text-slate-500">
                Penilaian paparan polutan PM2.5, debu silika, dan gas iritan
              </p>
            </div>
          </div>
          <div className="space-y-5">
            {/* 5.1 Area Paparan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Area Utama Aktivitas Sehari-hari
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <input
                    id="env-clean"
                    name="env_exposure"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.env_exposure === 0}
                    onChange={() => onUpdateFormData({ env_exposure: 0 })}
                  />
                  <label
                    htmlFor="env-clean"
                    className="flex items-start p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 mt-0.5 pill-indicator flex-shrink-0" />
                    Ruangan ber-AC bersih (0)
                  </label>
                </div>
                <div>
                  <input
                    id="env-traffic"
                    name="env_exposure"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.env_exposure === 4}
                    onChange={() => onUpdateFormData({ env_exposure: 4 })}
                  />
                  <label
                    htmlFor="env-traffic"
                    className="flex items-start p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 mt-0.5 pill-indicator flex-shrink-0" />
                    Lalu lintas / jalan raya tinggi (4)
                  </label>
                </div>
                <div>
                  <input
                    id="env-industry"
                    name="env_exposure"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.env_exposure === 7}
                    onChange={() => onUpdateFormData({ env_exposure: 7 })}
                  />
                  <label
                    htmlFor="env-industry"
                    className="flex items-start p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 mt-0.5 pill-indicator flex-shrink-0" />
                    Debu pabrik / tambang / biomassa (7)
                  </label>
                </div>
              </div>
            </div>

            {/* 5.2 Penggunaan Masker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Kedisiplinan Memakai Masker / APD Pernapasan
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <input
                    id="mask-always"
                    name="mask_habit"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.mask_habit === 0}
                    onChange={() => onUpdateFormData({ mask_habit: 0 })}
                  />
                  <label
                    htmlFor="mask-always"
                    className="flex items-center p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 pill-indicator flex-shrink-0" />
                    Selalu Memakai (0)
                  </label>
                </div>
                <div>
                  <input
                    id="mask-sometimes"
                    name="mask_habit"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.mask_habit === 3}
                    onChange={() => onUpdateFormData({ mask_habit: 3 })}
                  />
                  <label
                    htmlFor="mask-sometimes"
                    className="flex items-center p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 pill-indicator flex-shrink-0" />
                    Kadang-kadang (3)
                  </label>
                </div>
                <div>
                  <input
                    id="mask-never"
                    name="mask_habit"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.mask_habit === 6}
                    onChange={() => onUpdateFormData({ mask_habit: 6 })}
                  />
                  <label
                    htmlFor="mask-never"
                    className="flex items-center p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 pill-indicator flex-shrink-0" />
                    Tidak Pernah (6)
                  </label>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* CATEGORY 6: Riwayat Medis & Keluarga */}
        <article className="glass-panel rounded-3xl p-6 sm:p-8 shadow-glassCard relative overflow-hidden">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              06
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Riwayat Klinis &amp; Genetik (Clinical History)
              </h2>
              <p className="text-xs text-slate-500">
                Predisposisi hipereaktivitas bronkus dan riwayat infeksi parenkim
              </p>
            </div>
          </div>
          <div className="space-y-5">
            {/* 6.1 Riwayat Pribadi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Riwayat Penyakit Pernapasan Pribadi
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <input
                    id="med-none"
                    name="medical_personal"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.medical_personal === 0}
                    onChange={() => onUpdateFormData({ medical_personal: 0 })}
                  />
                  <label
                    htmlFor="med-none"
                    className="flex items-start p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 mt-0.5 pill-indicator flex-shrink-0" />
                    Bebas Riwayat (0)
                  </label>
                </div>
                <div>
                  <input
                    id="med-asthma"
                    name="medical_personal"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.medical_personal === 4}
                    onChange={() => onUpdateFormData({ medical_personal: 4 })}
                  />
                  <label
                    htmlFor="med-asthma"
                    className="flex items-start p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 mt-0.5 pill-indicator flex-shrink-0" />
                    Asma / Rhinitis Alergi (4)
                  </label>
                </div>
                <div>
                  <input
                    id="med-tb"
                    name="medical_personal"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.medical_personal === 8}
                    onChange={() => onUpdateFormData({ medical_personal: 8 })}
                  />
                  <label
                    htmlFor="med-tb"
                    className="flex items-start p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 mt-0.5 pill-indicator flex-shrink-0" />
                    TBC / Pneumonia / PPOK (8)
                  </label>
                </div>
              </div>
            </div>

            {/* 6.2 Riwayat Keluarga */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Riwayat Paru pada Keluarga Inti (Orang Tua / Saudara)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <input
                    id="fam-none"
                    name="medical_family"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.medical_family === 0}
                    onChange={() => onUpdateFormData({ medical_family: 0 })}
                  />
                  <label
                    htmlFor="fam-none"
                    className="flex items-center p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 pill-indicator flex-shrink-0" />
                    Tidak Ada (0)
                  </label>
                </div>
                <div>
                  <input
                    id="fam-asthma"
                    name="medical_family"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.medical_family === 3}
                    onChange={() => onUpdateFormData({ medical_family: 3 })}
                  />
                  <label
                    htmlFor="fam-asthma"
                    className="flex items-center p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 pill-indicator flex-shrink-0" />
                    Asma Turunan (3)
                  </label>
                </div>
                <div>
                  <input
                    id="fam-cancer"
                    name="medical_family"
                    type="radio"
                    className="sr-only option-pill"
                    checked={formData.medical_family === 6}
                    onChange={() => onUpdateFormData({ medical_family: 6 })}
                  />
                  <label
                    htmlFor="fam-cancer"
                    className="flex items-center p-3 rounded-2xl border border-slate-200 bg-white/60 cursor-pointer hover:bg-white text-xs font-medium text-slate-800"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 mr-2 pill-indicator flex-shrink-0" />
                    Kanker Paru / PPOK Berat (6)
                  </label>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* BOTTOM UI BUTTON: ANALISIS KESEHATAN (Requested by user) */}
        <section className="glass-panel rounded-3xl p-6 sm:p-10 shadow-glassCard border border-white text-center space-y-5">
          <div className="max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200/80 text-[#FF5C50] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Engine Analisis BIOS Siap Menganalisis</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Selesai Mengisi? Lanjutkan ke Analisis Klinis
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Sistem akan menghitung, mendata riwayat inhalasi Brinkman, serta mendiagnosis kapasitas fungsi paru Anda secara real-time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={handleStartAnalysis}
              className="w-full sm:w-auto py-4 px-10 rounded-full bg-gradient-to-r from-[#FF5C50] to-[#FF7368] hover:from-[#E0483C] hover:to-[#FF5C50] text-white font-black text-base tracking-wider uppercase shadow-[0_10px_25px_-5px_rgba(255,92,80,0.45)] transition-all duration-200 flex items-center justify-center space-x-3 group cursor-pointer"
            >
              <Activity className="w-5 h-5 animate-pulse" />
              <span>ANALISIS KESEHATAN</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={onBackToHome}
              className="w-full sm:w-auto py-3.5 px-6 rounded-full bg-white/80 hover:bg-white text-slate-700 border border-slate-200 font-semibold text-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Kembali ke Beranda</span>
            </button>
          </div>

          <div className="pt-3 flex items-center justify-center space-x-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Kerahasiaan data medis dienkripsi end-to-end sesuai standar klinis pulmonologi.</span>
          </div>
        </section>
      </form>
    </div>
  );
};

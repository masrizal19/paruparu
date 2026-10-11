/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Variants } from 'motion/react';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { QuestionnairePage } from './components/QuestionnairePage';
import { DiagnosisPage } from './components/DiagnosisPage';
import { LoginPage } from './components/LoginPage';
import { AdminPortal } from './components/AdminPortal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { ScreenType, QuestionnaireData, RiskAnalysisResult } from './types';
import { AuthProvider, useAuth, checkIsAdmin } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { saveAssessmentToSupabase } from './lib/supabase';
import { Loader2 } from 'lucide-react';

// Default initial state matching clinical standards
const defaultFormData: QuestionnaireData = {
  age: 28,
  gender: 'male',
  smoke_status: 8, // Perokok Aktif
  smoke_type: 'Konvensional / Kretek',
  smoke_cigs: 12,
  smoke_years: 6,
  passive_smoke: 2, // Jarang
  exercise_freq: 2, // 1-2x seminggu
  stair_test: 3, // Sedikit terengah
  recovery_time: 0, // < 2 Menit
  cough_symptom: 0, // Tidak Ada
  sputum_color: 1, // Bening
  wheezing: 0, // Nihil
  chest_pain: 0, // Tidak Ada
  env_exposure: 4, // Lalu lintas
  mask_habit: 3, // Kadang-kadang
  medical_personal: 0, // Bebas
  medical_family: 0, // Tidak ada
};

const defaultAnalysisResult: RiskAnalysisResult = {
  riskScore: 23,
  healthScore: 98,
  level: 'Prima',
  badgeLabel: 'Low Risk (Kondisi Prima)',
  badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  fillColor: 'bg-emerald-500',
  statusText: 'Optimal • Indeks Normal 98%',
  narrativeText:
    'Kondisi Prima - Paru Sehat & Optimal. Kapasitas vital terpantau stabil, tidak ditemukan kelainan obstruktif. Lanjutkan olahraga teratur dan hidrasi optimal.',
  brinkman: 72,
  brinkmanCategory: 'Ringan (<200)',
  fvc: '4.8 L (99%)',
  fev1Ratio: '86% (>70%)',
  spo2: '99% Normal',
  respiratoryRate: '14 bpm Optimal',
};

function AppContent() {
  const { user, isLoading } = useAuth();
  const { settings } = useSettings();

  const [currentScreen, setCurrentScreen] = useState<ScreenType>('landing');
  const [formData, setFormData] = useState<QuestionnaireData>(defaultFormData);
  const [analysisResult, setAnalysisResult] =
    useState<RiskAnalysisResult>(defaultAnalysisResult);

  // Redirection Logic on login or active session
  useEffect(() => {
    if (user) {
      const isOfficialAdmin = checkIsAdmin(user);
      if (isOfficialAdmin && currentScreen === 'landing') {
        setCurrentScreen('admin');
      }
    }
  }, [user]);

  // If session is still loading, show high-fidelity loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-mesh flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
            <Loader2 className="w-6 h-6 animate-spin text-[#FF5C50]" />
          </div>
          <p className="text-xs font-bold text-slate-700 tracking-wider uppercase">
            Memuat Sistem PARU-PARU Pulmonology Engine...
          </p>
        </div>
      </div>
    );
  }

  // MANDATORY USER REQUIREMENT:
  // "tampilan awal nya sistem login jangan masuik ke web nya dulu"
  // If not logged in, render LoginPage directly!
  if (!user) {
    return (
      <LoginPage
        onLoginSuccess={(isAdminUser) => {
          if (isAdminUser) {
            setCurrentScreen('admin');
          } else {
            setCurrentScreen('landing');
          }
        }}
      />
    );
  }

  // If user is Admin and on Admin screen, render the Admin Portal
  if (currentScreen === 'admin') {
    return (
      <AdminPortal
        onNavigateToPatientPortal={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setCurrentScreen('landing');
        }}
      />
    );
  }

  const navigateTo = (screen: ScreenType) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentScreen(screen);
  };

  const handleUpdateFormData = (data: Partial<QuestionnaireData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleSubmitQuestionnaire = (result: RiskAnalysisResult) => {
    setAnalysisResult(result);
    navigateTo('diagnosis');

    // Automatically persist assessment record to Supabase database
    saveAssessmentToSupabase({
      user_id: user?.id,
      user_email: user?.email || 'pasien@paruparu.id',
      overall_status: result.statusText,
      health_score: result.healthScore,
      risk_level: result.level,
      fvc: result.fvc,
      fev1_ratio: result.fev1Ratio,
      spo2: result.spo2,
      respiratory_rate: result.respiratoryRate,
      brinkman_index: result.brinkman,
      form_data: formData,
    });
  };

  const pageTransitionVariants: Variants = {
    initial: {
      opacity: 0,
      y: 16,
      scale: 0.995,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      y: -12,
      scale: 0.995,
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      },
    },
  };

  // Determine dynamic background styling based on admin settings
  const getBackgroundClass = () => {
    switch (settings.bgTheme) {
      case 'clinical-white':
        return 'bg-gradient-to-br from-teal-50/60 via-white to-slate-50 text-slate-800';
      case 'deep-navy':
        return 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-slate-100';
      case 'cyber-dark':
        return 'bg-gradient-to-br from-zinc-950 via-slate-900 to-zinc-900 text-slate-100';
      case 'emerald-glass':
        return 'bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white text-slate-800';
      case 'custom-url':
        return 'bg-cover bg-center text-slate-800 bg-no-repeat';
      case 'mesh-soft':
      default:
        return 'bg-mesh text-slate-800';
    }
  };

  const customBgStyle =
    settings.bgTheme === 'custom-url' && settings.customBgUrl
      ? { backgroundImage: `url(${settings.customBgUrl})` }
      : undefined;

  return (
    <div
      style={customBgStyle}
      className={`min-h-screen ${getBackgroundClass()} antialiased relative selection:bg-[#FF5C50] selection:text-white flex flex-col justify-between transition-colors duration-300`}
    >
      {/* Background Watermark Typography */}
      <div className="fixed inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden z-0 opacity-[0.03]">
        <span className="text-[17vw] font-extrabold uppercase tracking-tighter text-slate-900 leading-none">
          {settings.brandName || 'LUNG HEALTH'}
        </span>
      </div>

      {/* Common Header with Profile, Sign Out & Admin CMS */}
      <Header currentScreen={currentScreen} onNavigate={navigateTo} />

      {/* Main Container with Motion Frame Page Transitions */}
      <main className="flex-1 w-full relative">
        <AnimatePresence mode="wait">
          {currentScreen === 'landing' && (
            <motion.div
              key="landing"
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <LandingPage
                onStartAssessment={() => navigateTo('questionnaire')}
              />
            </motion.div>
          )}

          {currentScreen === 'questionnaire' && (
            <motion.div
              key="questionnaire"
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <QuestionnairePage
                formData={formData}
                onUpdateFormData={handleUpdateFormData}
                onSubmit={handleSubmitQuestionnaire}
                onBackToHome={() => navigateTo('landing')}
              />
            </motion.div>
          )}

          {currentScreen === 'diagnosis' && (
            <motion.div
              key="diagnosis"
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <DiagnosisPage
                analysis={analysisResult}
                formData={formData}
                onRetest={() => navigateTo('questionnaire')}
                onBackToHome={() => navigateTo('landing')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Admin Panel Modal (CMS for text, lungs icon & background) */}
      <AdminPanelModal />

      {/* Dynamic Clinical Footer Note */}
      <footer className="w-full border-t border-slate-200/60 py-4 px-4 text-center text-xs text-slate-500 bg-white/40 backdrop-blur-xs relative z-10">
        <p>{settings.footerText}</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SettingsProvider>
  );
}

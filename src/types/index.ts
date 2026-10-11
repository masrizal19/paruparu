export type ScreenType = 'landing' | 'questionnaire' | 'diagnosis' | 'admin';

export interface QuestionnaireData {
  age: number;
  gender: 'male' | 'female';
  smoke_status: number; // 0, 3, 8
  smoke_type: string;
  smoke_cigs: number;
  smoke_years: number;
  passive_smoke: number; // 0, 2, 5
  exercise_freq: number; // 0, 2, 5
  stair_test: number; // 0, 3, 7
  recovery_time: number; // 0, 3, 6
  cough_symptom: number; // 0, 3, 8
  sputum_color: number; // 1, 6, 10
  wheezing: number; // 0, 4, 9
  chest_pain: number; // 0, 2, 8
  env_exposure: number; // 0, 4, 7
  mask_habit: number; // 0, 3, 6
  medical_personal: number; // 0, 4, 8
  medical_family: number; // 0, 3, 6
}

export interface RiskAnalysisResult {
  riskScore: number; // 0 - 100
  healthScore: number; // 100 - riskScore (e.g. 98)
  level: 'Prima' | 'Sedang' | 'Tinggi' | 'Kritis';
  badgeLabel: string;
  badgeClass: string;
  fillColor: string;
  statusText: string;
  narrativeText: string;
  brinkman: number;
  brinkmanCategory: string;
  fvc: string;
  fev1Ratio: string;
  spo2: string;
  respiratoryRate: string;
}

export type LungIconType =
  | 'neon-bios'
  | 'cyber-cyan'
  | 'minimal-outline'
  | 'hologram-pulse'
  | 'custom-image';

export type BackgroundThemeType =
  | 'mesh-soft'
  | 'clinical-white'
  | 'deep-navy'
  | 'cyber-dark'
  | 'emerald-glass'
  | 'custom-url';

export interface LogoCropData {
  x: number;
  y: number;
  zoom: number;
  aspectRatio: '1:1' | '16:9' | 'custom';
}

export interface NavMenuItem {
  id: string;
  label: string;
  targetScreen: ScreenType;
  enabled: boolean;
}

export interface CustomFontRecord {
  id: string;
  name: string;
  font_family: string;
  file_url: string;
  format: string; // 'truetype' | 'woff' | 'woff2' | 'opentype'
  file_size: number;
  is_active: boolean;
  created_at: string;
}

export type LungAnimationType = 'breathing' | 'pulse' | 'glow-neon' | 'floating' | 'static';
export type LungAnimationSpeed = 'slow' | 'normal' | 'fast';

export interface SiteSettings {
  brandName: string;
  brandSubtitle: string;
  heroBadge: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroDescription: string;
  ctaButtonText: string;
  features: string[];
  footerText: string;
  lungIconType: LungIconType;
  customLungIconUrl: string;
  custom_lung_icon_path?: string;
  lung_icon_preset?: string;
  lung_animation_type?: LungAnimationType;
  lung_animation_speed?: LungAnimationSpeed;
  bgTheme: BackgroundThemeType;
  customBgUrl: string;
  adminId?: string;
  logoUrl?: string;
  logo_crop_data?: LogoCropData;
  activeFontId?: string;
  activeFontFamily?: string;
  navMenu?: {
    home: string;
    questionnaire: string;
    results: string;
  };
}

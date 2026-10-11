import { SiteSettings, CustomFontRecord, LogoCropData } from '../types';
import { initSupabaseClient, getSupabaseConfig } from './supabase';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  brandName: 'PARU-PARU',
  brandSubtitle: 'Metode BIOS',
  heroBadge: 'Skrining Klinis Mandiri • Metode BIOS v2.4',
  heroTitle: 'Deteksi Dini & Analisis Kesehatan',
  heroTitleHighlight: 'Paru-Paru',
  heroDescription:
    'Platform pemeriksaan kesehatan sistem pernapasan cerdas mengintegrasikan 6 domain klinis metode BIOS, perhitungan indeks Brinkman, dan analisis parameter spirometri FVC secara akurat, cepat, dan terstandarisasi.',
  ctaButtonText: 'Cek Kesehatan',
  features: [
    '14 Parameter Fisiologis & Gaya Hidup',
    'Kalkulasi Otomatis Indeks Brinkman',
    'Skrining Obstruksi & Wheezing AI',
    'Hasil Diagnosis & Laporan Medis PDF',
  ],
  footerText:
    'PARU-PARU Pulmonology Engine • Algoritma BIOS & Analisis Real-Time • Terstandarisasi Internasional & Terintegrasi Database Supabase',
  lungIconType: 'neon-bios',
  customLungIconUrl: '',
  custom_lung_icon_path: '',
  lung_icon_preset: 'neon-bios',
  lung_animation_type: 'breathing',
  lung_animation_speed: 'normal',
  bgTheme: 'mesh-soft',
  customBgUrl: '',
  adminId: 'admin-supabase-id',
  logoUrl: '',
  logo_crop_data: {
    x: 0,
    y: 0,
    zoom: 1,
    aspectRatio: '1:1',
  },
  navMenu: {
    home: 'Beranda',
    questionnaire: 'Kuesioner Klinis',
    results: 'Hasil Analisis',
  },
};

const SETTINGS_STORAGE_KEY = 'paruparu_app_settings';
const FONTS_STORAGE_KEY = 'paruparu_custom_fonts';

export const getLocalSettings = (): SiteSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SITE_SETTINGS,
        ...parsed,
        navMenu: {
          ...DEFAULT_SITE_SETTINGS.navMenu,
          ...(parsed.navMenu || {}),
        },
        logo_crop_data: {
          ...DEFAULT_SITE_SETTINGS.logo_crop_data,
          ...(parsed.logo_crop_data || {}),
        },
      };
    }
  } catch (err) {
    console.warn('Failed to parse local site settings:', err);
  }
  return DEFAULT_SITE_SETTINGS;
};

export const saveLocalSettings = (settings: SiteSettings) => {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
};

// Supabase sync: Save settings to table 'app_settings'
export const saveSettingsToSupabase = async (
  settings: SiteSettings
): Promise<{ success: boolean; error?: string }> => {
  // Always update local storage first for zero-latency UI updates
  saveLocalSettings(settings);

  const { isReal } = getSupabaseConfig();
  if (!isReal) {
    return { success: true };
  }

  try {
    const client = initSupabaseClient();
    const payload = {
      key: 'global_theme_settings',
      content: settings,
      logo_crop_data: settings.logo_crop_data,
      updated_at: new Date().toISOString(),
    };

    const { error } = await client
      .from('app_settings')
      .upsert(payload, { onConflict: 'key' });

    if (error) {
      console.warn('Supabase app_settings table sync notice:', error.message);
      return { success: true, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn('Supabase app_settings sync error:', err);
    return { success: true, error: err?.message || 'Sync error' };
  }
};

// Supabase sync: Fetch latest settings from table 'app_settings'
export const fetchSettingsFromSupabase = async (): Promise<SiteSettings> => {
  const local = getLocalSettings();
  const { isReal } = getSupabaseConfig();
  if (!isReal) return local;

  try {
    const client = initSupabaseClient();
    const { data, error } = await client
      .from('app_settings')
      .select('content, logo_crop_data')
      .eq('key', 'global_theme_settings')
      .single();

    if (!error && data?.content) {
      const merged: SiteSettings = {
        ...DEFAULT_SITE_SETTINGS,
        ...data.content,
        logo_crop_data: data.logo_crop_data || data.content.logo_crop_data || DEFAULT_SITE_SETTINGS.logo_crop_data,
      };
      saveLocalSettings(merged);
      return merged;
    }
  } catch (err) {
    console.warn('Failed to fetch app_settings from Supabase:', err);
  }
  return local;
};

// --- DYNAMIC FONT MANAGEMENT & INJECTION ---

export const getCustomFontsList = async (): Promise<CustomFontRecord[]> => {
  const local = JSON.parse(localStorage.getItem(FONTS_STORAGE_KEY) || '[]');
  const { isReal } = getSupabaseConfig();
  if (!isReal) return local;

  try {
    const client = initSupabaseClient();
    const { data, error } = await client
      .from('custom_fonts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      localStorage.setItem(FONTS_STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('Custom fonts query fallback to local:', err);
  }
  return local;
};

export const saveCustomFontRecord = async (
  font: CustomFontRecord
): Promise<boolean> => {
  const existing = await getCustomFontsList();
  const updated = [font, ...existing.filter((f) => f.id !== font.id)];
  localStorage.setItem(FONTS_STORAGE_KEY, JSON.stringify(updated));

  const { isReal } = getSupabaseConfig();
  if (isReal) {
    try {
      const client = initSupabaseClient();
      await client.from('custom_fonts').upsert([font]);
    } catch (err) {
      console.warn('Supabase custom_fonts upsert error:', err);
    }
  }
  return true;
};

export const deleteCustomFontRecord = async (fontId: string): Promise<boolean> => {
  const existing = await getCustomFontsList();
  const updated = existing.filter((f) => f.id !== fontId);
  localStorage.setItem(FONTS_STORAGE_KEY, JSON.stringify(updated));

  const { isReal } = getSupabaseConfig();
  if (isReal) {
    try {
      const client = initSupabaseClient();
      await client.from('custom_fonts').delete().eq('id', fontId);
    } catch (err) {
      console.warn('Supabase custom_fonts delete error:', err);
    }
  }
  return true;
};

export const applyCustomFont = (
  fontFamily: string,
  fontUrl: string,
  format: string = 'truetype'
) => {
  const styleId = 'custom-dynamic-font-style';
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    @font-face {
      font-family: '${fontFamily}';
      src: url('${fontUrl}') format('${format}');
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
    }
    :root, body, html, input, button, select, textarea, p, h1, h2, h3, h4, h5, h6, span, div, a {
      font-family: '${fontFamily}', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    }
  `;
};

export const clearCustomFont = () => {
  const styleEl = document.getElementById('custom-dynamic-font-style');
  if (styleEl) {
    styleEl.remove();
  }
};

// --- FILE UPLOAD TO SUPABASE STORAGE HELPER WITH SAFE FALLBACK ---

export const uploadFileToStorage = async (
  bucket: 'app-assets' | 'custom-fonts',
  file: File | Blob,
  fileName: string
): Promise<{ url: string; error?: string }> => {
  const { isReal } = getSupabaseConfig();

  // If real Supabase client is available, attempt storage bucket upload
  if (isReal) {
    try {
      const client = initSupabaseClient();
      const { data, error } = await client.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicData } = client.storage
          .from(bucket)
          .getPublicUrl(fileName);
        if (publicData?.publicUrl) {
          return { url: publicData.publicUrl };
        }
      } else if (error) {
        console.warn(`Supabase Storage (${bucket}) notice:`, error.message);
      }
    } catch (err: any) {
      console.warn(`Storage upload exception in bucket ${bucket}:`, err);
    }
  }

  // Robust fallback: Convert to DataURL / Object URL so it functions instantaneously
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({ url: reader.result as string });
    };
    reader.onerror = () => {
      resolve({ url: URL.createObjectURL(file), error: 'FileReader fallback' });
    };
    reader.readAsDataURL(file);
  });
};

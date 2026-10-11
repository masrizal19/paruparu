import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

// Get default configuration from Vite environment variables
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// LocalStorage keys for dynamic configuration fallback
const STORAGE_URL_KEY = 'paruparu_supabase_url';
const STORAGE_KEY_KEY = 'paruparu_supabase_anon_key';

export const getSupabaseConfig = () => {
  const customUrl = localStorage.getItem(STORAGE_URL_KEY);
  const customKey = localStorage.getItem(STORAGE_KEY_KEY);

  const url = customUrl || envUrl || 'https://sample-project.supabase.co';
  const anonKey = customKey || envAnonKey || 'sample-anon-key';

  const isReal = Boolean(
    (customUrl && customKey) ||
    (envUrl && envAnonKey && !envUrl.includes('your-project') && !envUrl.includes('sample-project'))
  );

  return { url, anonKey, isReal };
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  if (url) localStorage.setItem(STORAGE_URL_KEY, url.trim());
  if (anonKey) localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  initSupabaseClient();
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem(STORAGE_URL_KEY);
  localStorage.removeItem(STORAGE_KEY_KEY);
  initSupabaseClient();
};

// Singleton Client Instance to prevent multiple GoTrueClient warnings
let clientInstance: SupabaseClient | null = null;

export const initSupabaseClient = (): SupabaseClient => {
  if (clientInstance) {
    return clientInstance;
  }

  const { url, anonKey } = getSupabaseConfig();
  try {
    clientInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (error) {
    console.warn('Supabase client singleton initialization warning:', error);
    clientInstance = createClient('https://sample-project.supabase.co', 'sample-anon-key', {
      auth: { persistSession: true },
    });
  }
  return clientInstance;
};

export const supabase = initSupabaseClient();

export interface SupabaseAssessmentRecord {
  id?: string;
  user_id?: string;
  user_email?: string;
  patient_name?: string;
  overall_status: string;
  health_score: number;
  risk_level: 'Bersih' | 'Moderate' | 'High' | 'Critical' | 'Prima' | 'Sedang' | 'Tinggi' | 'Kritis' | string;
  fvc: string;
  fev1_ratio: string;
  spo2: string;
  respiratory_rate: string;
  brinkman_index: number;
  acoustic_sound?: string;
  recommendations?: string[];
  form_data: Record<string, any>;
  created_at?: string;
}

const DEFAULT_SAMPLE_HISTORY: SupabaseAssessmentRecord[] = [
  {
    id: 'rec-001',
    user_id: 'usr-101',
    user_email: 'ahmad.fauzi@gmail.com',
    patient_name: 'Ahmad Fauzi',
    overall_status: 'Prima',
    health_score: 98,
    risk_level: 'Bersih',
    fvc: '4.9 L (101%)',
    fev1_ratio: '88% (>70%)',
    spo2: '99% Normal',
    respiratory_rate: '14 bpm Optimal',
    brinkman_index: 0,
    acoustic_sound: 'Vesikuler Murni • Nihil Wheezing/Stridor',
    recommendations: [
      'Pertahankan aktivitas kardiovaskular 150 menit/minggu',
      'Hindari paparan asap pasif di lingkungan tertutup',
      'Pemeriksaan spirometri berkala tiap 12 bulan',
    ],
    form_data: {
      age: 29,
      gender: 'male',
      smoke_status: 0,
      stair_test: 0,
      cough_symptom: 0,
      wheezing: 0,
    },
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'rec-002',
    user_id: 'usr-102',
    user_email: 'dewi.lestari@outlook.com',
    patient_name: 'Dewi Lestari',
    overall_status: 'Sedang',
    health_score: 74,
    risk_level: 'Moderate',
    fvc: '3.6 L (84%)',
    fev1_ratio: '72% (>70%)',
    spo2: '96% Normal Rendah',
    respiratory_rate: '19 bpm Meningkat',
    brinkman_index: 180,
    acoustic_sound: 'Ekspirasi Memanjang • Ronki Kering Minimal',
    recommendations: [
      'Konsultasi dokter spesialis paru untuk tes reversibilitas bronkodilator',
      'Latihan pernapasan pursed-lip breathing 2x sehari',
    ],
    form_data: {
      age: 42,
      gender: 'female',
      smoke_status: 3,
      stair_test: 3,
      cough_symptom: 3,
      wheezing: 4,
    },
    created_at: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
  },
];

export const getLocalStoredHistory = (): SupabaseAssessmentRecord[] => {
  try {
    const raw = localStorage.getItem('paruparu_local_history');
    if (!raw) {
      localStorage.setItem('paruparu_local_history', JSON.stringify(DEFAULT_SAMPLE_HISTORY));
      return DEFAULT_SAMPLE_HISTORY;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem('paruparu_local_history', JSON.stringify(DEFAULT_SAMPLE_HISTORY));
      return DEFAULT_SAMPLE_HISTORY;
    }
    return parsed;
  } catch {
    return DEFAULT_SAMPLE_HISTORY;
  }
};

export const saveAssessmentToSupabase = async (
  record: Omit<SupabaseAssessmentRecord, 'id' | 'created_at'>
) => {
  const existing = getLocalStoredHistory();
  const newEntry: SupabaseAssessmentRecord = {
    ...record,
    id: `rec-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  localStorage.setItem('paruparu_local_history', JSON.stringify([newEntry, ...existing]));

  const { isReal } = getSupabaseConfig();
  const client = initSupabaseClient();
  if (!isReal || !client) {
    return { data: newEntry, error: null };
  }

  try {
    const { data, error } = await client
      .from('analysis_history')
      .insert([record])
      .select()
      .single();

    if (error) {
      const { data: data2 } = await client
        .from('pulmonary_assessments')
        .insert([record])
        .select()
        .single();
      if (data2) return { data: data2, error: null };
    } else if (data) {
      return { data, error: null };
    }

    return { data: newEntry, error: null };
  } catch (err: any) {
    console.error('Failed to save assessment to Supabase:', err);
    return { data: newEntry, error: null };
  }
};

export const getAssessmentHistory = async (userId?: string) => {
  const localHistory = getLocalStoredHistory();
  const { isReal } = getSupabaseConfig();
  const client = initSupabaseClient();

  if (!isReal || !client || !userId) {
    return localHistory;
  }

  try {
    const { data } = await client
      .from('analysis_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data && data.length > 0) return data;

    const { data: data2 } = await client
      .from('pulmonary_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data2 && data2.length > 0) return data2;
    return localHistory;
  } catch (err) {
    console.error('Error fetching assessments from Supabase:', err);
    return localHistory;
  }
};

export const getAllAssessmentsForAdmin = async (): Promise<SupabaseAssessmentRecord[]> => {
  const localHistory = getLocalStoredHistory();
  const { isReal } = getSupabaseConfig();
  const client = initSupabaseClient();

  if (!isReal || !client) {
    return localHistory;
  }

  try {
    const { data, error } = await client
      .from('analysis_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data && data.length > 0) {
      return data;
    }

    const { data: data2, error: error2 } = await client
      .from('pulmonary_assessments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error2 && data2 && data2.length > 0) {
      return data2;
    }

    return localHistory;
  } catch (err) {
    console.warn('Fetch all assessments fallback to local:', err);
    return localHistory;
  }
};

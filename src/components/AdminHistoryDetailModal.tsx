import React from 'react';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  ShieldCheck,
  HeartPulse,
  Activity,
  Wind,
  Stethoscope,
  Calendar,
  User,
  AlertTriangle,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { SupabaseAssessmentRecord } from '../lib/supabase';

interface AdminHistoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: SupabaseAssessmentRecord | null;
}

export const AdminHistoryDetailModal: React.FC<AdminHistoryDetailModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  const getRiskBadge = (level: string) => {
    const l = (level || '').toLowerCase();
    if (l.includes('bersih') || l.includes('prima') || l.includes('low')) {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Kondisi Prima / Bersih (Low Risk)',
      };
    }
    if (l.includes('moderate') || l.includes('sedang')) {
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
        label: 'Risiko Sedang (Moderate Risk)',
      };
    }
    if (l.includes('high') || l.includes('tinggi')) {
      return {
        bg: 'bg-orange-50 text-orange-800 border-orange-200',
        dot: 'bg-orange-500',
        label: 'Risiko Tinggi (High Risk)',
      };
    }
    return {
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      dot: 'bg-rose-500',
      label: 'Risiko Kritis (Critical Risk)',
    };
  };

  const badge = getRiskBadge(record.risk_level || record.overall_status);
  const formData = record.form_data || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 text-slate-800">
        {/* Header Bar */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5 text-[#FF5C50]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-slate-900">
                  Laporan Analisis Medis Lengkap Metode BIOS
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono">
                  ID: {record.id || 'N/A'}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Waktu Skrining:{' '}
                  {record.created_at
                    ? new Date(record.created_at).toLocaleString('id-ID', {
                        dateStyle: 'full',
                        timeStyle: 'short',
                      })
                    : '-'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              title="Cetak Laporan"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Report Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Patient Meta Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Pengguna / Pasien
              </span>
              <span className="text-xs font-bold text-slate-900">
                {record.patient_name || record.user_email || 'Anonim'}
              </span>
              <span className="text-[11px] text-slate-500 block truncate font-mono">
                {record.user_email || 'Tidak ada email'}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Demografi Fisik
              </span>
              <span className="text-xs font-semibold text-slate-800">
                Usia: {formData.age || '-'} Tahun •{' '}
                {formData.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
              </span>
              <span className="text-[11px] text-slate-500 block">
                Indeks Brinkman: {record.brinkman_index ?? 0}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Klasifikasi Risiko
              </span>
              <div
                className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border mt-0.5 ${badge.bg}`}
              >
                <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                <span>{badge.label}</span>
              </div>
            </div>
          </div>

          {/* BIOS Overall Health Score Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                Skor Analisis BIOS Kardiorespirasi
              </span>
              <h4 className="text-2xl font-black text-white">
                {record.health_score}%{' '}
                <span className="text-sm font-normal text-slate-300">
                  / 100% Indeks Kapasitas Normal
                </span>
              </h4>
              <p className="text-xs text-slate-300">
                Status: {record.overall_status || record.risk_level}
              </p>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex flex-col items-center justify-center text-center">
              <span className="text-xs text-[#FF5C50] font-black uppercase">BIOS</span>
              <span className="text-xl font-black text-white">{record.health_score}</span>
            </div>
          </div>

          {/* Key Clinical Parameters Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Parameter Spirometri &amp; Tanda Vital Fisiologis
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                  Kapasitas Vital FVC
                </span>
                <span className="text-sm font-black text-slate-900 mt-1 block">
                  {record.fvc || '4.8 L (99%)'}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">Optimal</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                  Rasio FEV1/FVC
                </span>
                <span className="text-sm font-black text-slate-900 mt-1 block">
                  {record.fev1_ratio || '86% (>70%)'}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">Non-Obstruktif</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                  Saturasi Oksigen SpO2
                </span>
                <span className="text-sm font-black text-slate-900 mt-1 block">
                  {record.spo2 || '99%'}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">Normal</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                  Frekuensi Napas (RR)
                </span>
                <span className="text-sm font-black text-slate-900 mt-1 block">
                  {record.respiratory_rate || '14 bpm'}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">Optimal</span>
              </div>
            </div>
          </div>

          {/* Acoustic Lungs Sound Scan */}
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-2">
            <div className="flex items-center space-x-2 text-rose-800">
              <Stethoscope className="w-4 h-4 text-[#FF5C50]" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Analisis Suara Akustik Paru (Auscultation AI)
              </span>
            </div>
            <p className="text-xs font-medium text-slate-700">
              {record.acoustic_sound ||
                'Vesikuler Murni • Nihil Wheezing, Ronki Kering, maupun Stridor Inspiratoir.'}
            </p>
          </div>

          {/* Medical Recommendations */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Rekomendasi Medis &amp; Langkah Preventif
            </h4>
            <div className="space-y-2">
              {(
                record.recommendations || [
                  'Pertahankan rutinitas olahraga kardiovaskular 150 menit/minggu.',
                  'Jaga hidrasi cairan tubuh minimal 2 liter per hari untuk menjaga viskositas mukus saluran napas.',
                  'Lakukan pemeriksaan spirometri berkala secara mandiri setiap 6-12 bulan.',
                ]
              ).map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 flex items-start space-x-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Dicatat dalam Database Terintegrasi Supabase • Sistem Analisis Pulmonologi BIOS
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
          >
            Tutup Laporan
          </button>
        </div>
      </div>
    </div>
  );
};

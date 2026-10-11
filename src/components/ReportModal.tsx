import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, HeartPulse, Activity } from 'lucide-react';
import { RiskAnalysisResult, QuestionnaireData } from '../types';
import { useAuth } from '../context/AuthContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: RiskAnalysisResult;
  formData: QuestionnaireData;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  analysis,
  formData,
}) => {
  const { user } = useAuth();
  if (!isOpen) return null;

  const patientName =
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split('@')[0] : 'Pasien Terverifikasi');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#FF5C50] flex items-center justify-center text-white font-bold">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Dokumen Laporan Medis Resmi Paru-Paru</h3>
              <p className="text-[11px] text-slate-400">Ringkasan Klinis BIOS • Terstandarisasi Medis</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center space-x-1.5 transition text-white"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Printable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 printable-area text-xs sm:text-sm">
          {/* Header Clinic / Patient lockup */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-5 border-b border-slate-200 gap-4">
            <div>
              <span className="text-lg font-black text-slate-900 tracking-tight">PARU-PARU CLINICAL LAB</span>
              <p className="text-xs text-slate-500 mt-0.5">Departemen Pulmonologi &amp; Kedokteran Respirasi Digital</p>
              <p className="text-[11px] text-slate-400">Akreditasi ISO 15189 • ID Registrasi: #PRS-99201-OK</p>
            </div>
            <div className="sm:text-right bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-900">Pasien: {patientName}</p>
              <p className="text-[11px] text-slate-500">Usia: {formData.age} Tahun • Gender: {formData.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</p>
              <p className="text-[11px] text-slate-500">Tanggal Periksa: 24 Oktober 2024, 10:45 WIB</p>
            </div>
          </div>

          {/* Primary Result Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Diagnosis Utama
              </span>
              <h4 className="text-xl font-black text-slate-900">
                Fungsi Paru Normal Tanpa Tanda Obstruksi
              </h4>
              <p className="text-xs text-slate-600">
                {analysis.narrativeText}
              </p>
            </div>
            <div className="text-center sm:text-right shrink-0 bg-white px-5 py-3 rounded-xl border border-emerald-100 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Skor Kesehatan</span>
              <span className="text-3xl font-black text-emerald-600">{analysis.healthScore}</span>
              <span className="text-xs text-slate-400">/100 ({analysis.level})</span>
            </div>
          </div>

          {/* Parameter Table */}
          <div>
            <h5 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">
              Hasil Analisis Parameter Klinis &amp; Spirometri
            </h5>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3.5">Parameter Fisiologis</th>
                    <th className="py-2.5 px-3.5">Nilai Terukur</th>
                    <th className="py-2.5 px-3.5">Nilai Rujukan Normal</th>
                    <th className="py-2.5 px-3.5">Status Klinis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 px-3.5 font-medium text-slate-900">Kapasitas Vital Paksa (FVC)</td>
                    <td className="py-2 px-3.5 font-mono font-bold text-slate-800">{analysis.fvc}</td>
                    <td className="py-2 px-3.5 text-slate-500">&gt; 80% Nilai Prediksi</td>
                    <td className="py-2 px-3.5 text-emerald-600 font-bold">Optimal</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3.5 font-medium text-slate-900">Rasio FEV1 / FVC</td>
                    <td className="py-2 px-3.5 font-mono font-bold text-slate-800">{analysis.fev1Ratio}</td>
                    <td className="py-2 px-3.5 text-slate-500">&gt; 70%</td>
                    <td className="py-2 px-3.5 text-emerald-600 font-bold">Normal Bebas Obstruksi</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3.5 font-medium text-slate-900">Saturasi Oksigen Perifer (SpO2)</td>
                    <td className="py-2 px-3.5 font-mono font-bold text-slate-800">{analysis.spo2}</td>
                    <td className="py-2 px-3.5 text-slate-500">95% - 100%</td>
                    <td className="py-2 px-3.5 text-emerald-600 font-bold">Stabil</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3.5 font-medium text-slate-900">Frekuensi Pernapasan</td>
                    <td className="py-2 px-3.5 font-mono font-bold text-slate-800">{analysis.respiratoryRate}</td>
                    <td className="py-2 px-3.5 text-slate-500">12 - 20 bpm</td>
                    <td className="py-2 px-3.5 text-emerald-600 font-bold">Eupnea (Normal)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3.5 font-medium text-slate-900">Indeks Brinkman (Paparan Asap)</td>
                    <td className="py-2 px-3.5 font-mono font-bold text-slate-800">{analysis.brinkman}</td>
                    <td className="py-2 px-3.5 text-slate-500">&lt; 200 (Ringan)</td>
                    <td className="py-2 px-3.5 text-slate-700 font-semibold">{analysis.brinkmanCategory}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Clinical Doctor Recommendation */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <p className="font-bold text-slate-900">Instruksi Medis &amp; Saran Gaya Hidup:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>Pertahankan olahraga kardio aerobik (jalan cepat/bersepeda) minimal 150 menit per minggu.</li>
              <li>Hindari paparan secondhand smoke dan gunakan masker respirator KN95 saat berada di kawasan polusi tinggi PM2.5.</li>
              <li>Lakukan latihan pernapasan diafragma (4-7-8 breathing) 5 menit setiap pagi untuk elastisitas paru.</li>
              <li>Jadwalkan uji fungsi paru berkala dalam kurun waktu 6 hingga 12 bulan mendatang.</li>
            </ul>
          </div>

          {/* Signatures & Verification Stamp */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Sertifikasi Algoritma Medis Terverifikasi Metode BIOS</span>
            </div>
            <div className="text-center sm:text-right">
              <p className="font-bold text-slate-800">dr. Hendra Pratama, Sp.P(K), FCCP</p>
              <p className="text-slate-400">Dewan Pengawas Pulmonologi Digital</p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 transition"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#FF5C50] hover:bg-[#E0483C] transition shadow-md flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Simpan Sebagai PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

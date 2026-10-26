import React, { useState } from 'react';
import { X, Check, Save, RotateCcw, PenTool, Calendar, UserCheck, Shield } from 'lucide-react';
import type { SignatureSettings } from '../types/attendance';

interface SignatureConfigModalProps {
  isOpen: boolean;
  settings?: SignatureSettings;
  defaultLocation?: string;
  defaultDate?: string;
  onSave: (newSettings: SignatureSettings) => void;
  onClose: () => void;
}

export const SignatureConfigModal: React.FC<SignatureConfigModalProps> = ({
  isOpen,
  settings,
  defaultLocation = 'Di tempat',
  defaultDate = '',
  onSave,
  onClose,
}) => {
  const [tempatTanggal, setTempatTanggal] = useState(
    settings?.tempatTanggal || `${defaultLocation}, ${defaultDate || new Date().toLocaleDateString('id-ID')}`
  );

  // Kiri (Penanggung Jawab)
  const [judulKiri, setJudulKiri] = useState(settings?.judulKiri || 'Mengetahui,');
  const [jabatanKiri, setJabatanKiri] = useState(settings?.jabatanKiri || 'Penanggung Jawab Acara,');
  const [namaKiri, setNamaKiri] = useState(settings?.namaKiri || '');
  const [nipKiri, setNipKiri] = useState(settings?.nipKiri || '');

  // Kanan (Panitia Pelaksana)
  const [jabatanKanan, setJabatanKanan] = useState(settings?.jabatanKanan || 'Panitia Pelaksana Kegiatan,');
  const [namaKanan, setNamaKanan] = useState(settings?.namaKanan || '');
  const [nipKanan, setNipKanan] = useState(settings?.nipKanan || '');

  React.useEffect(() => {
    if (isOpen) {
      setTempatTanggal(
        settings?.tempatTanggal || `${defaultLocation}, ${defaultDate || new Date().toLocaleDateString('id-ID')}`
      );
      setJudulKiri(settings?.judulKiri || 'Mengetahui,');
      setJabatanKiri(settings?.jabatanKiri || 'Penanggung Jawab Acara,');
      setNamaKiri(settings?.namaKiri || '');
      setNipKiri(settings?.nipKiri || '');
      setJabatanKanan(settings?.jabatanKanan || 'Panitia Pelaksana Kegiatan,');
      setNamaKanan(settings?.namaKanan || '');
      setNipKanan(settings?.nipKanan || '');
    }
  }, [isOpen, settings, defaultLocation, defaultDate]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      tempatTanggal: tempatTanggal.trim(),
      judulKiri: judulKiri.trim(),
      jabatanKiri: jabatanKiri.trim(),
      namaKiri: namaKiri.trim(),
      nipKiri: nipKiri.trim(),
      jabatanKanan: jabatanKanan.trim(),
      namaKanan: namaKanan.trim(),
      nipKanan: nipKanan.trim(),
    });
    onClose();
  };

  const handleResetToBlank = () => {
    setNamaKiri('');
    setNipKiri('');
    setNamaKanan('');
    setNipKanan('');
    setJudulKiri('Mengetahui,');
    setJabatanKiri('Penanggung Jawab Acara,');
    setJabatanKanan('Panitia Pelaksana Kegiatan,');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Pengaturan Penanggung Jawab & Panitia
              </h3>
              <p className="text-xs text-slate-500">
                Atur nama, NIP, jabatan, dan tempat tanggal pengesahan untuk file Excel & lembar cetak
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Tempat dan Tanggal */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Tempat & Tanggal Pengesahan
            </label>
            <p className="text-[11px] text-slate-500">
              Teks ini akan tampil di bagian kanan atas area tanda tangan (misal: <em>Jakarta, 24 Oktober 2026</em> atau <em>Bandung, 10 November 2026</em>).
            </p>
            <input
              type="text"
              required
              value={tempatTanggal}
              onChange={(e) => setTempatTanggal(e.target.value)}
              placeholder="Contoh: Jakarta, 24 Oktober 2026"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Grid 2 Kolom Penandatangan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kolom Kiri: Penanggung Jawab */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 pb-2 border-b border-slate-100">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Pihak Kiri (Penanggung Jawab)</span>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Teks Atas</label>
                <input
                  type="text"
                  value={judulKiri}
                  onChange={(e) => setJudulKiri(e.target.value)}
                  placeholder="Mengetahui,"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Jabatan / Instansi</label>
                <input
                  type="text"
                  value={jabatanKiri}
                  onChange={(e) => setJabatanKiri(e.target.value)}
                  placeholder="Contoh: Penanggung Jawab Acara / Kepala Dinas"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">
                  Nama Lengkap (beserta gelar)
                </label>
                <input
                  type="text"
                  value={namaKiri}
                  onChange={(e) => setNamaKiri(e.target.value)}
                  placeholder="Kosongkan jika tanda tangan manual"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">NIP (Opsional)</label>
                <input
                  type="text"
                  value={nipKiri}
                  onChange={(e) => setNipKiri(e.target.value)}
                  placeholder="Contoh: 19750101 200003 1 002"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Kolom Kanan: Panitia Pelaksana */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 pb-2 border-b border-slate-100">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Pihak Kanan (Panitia Pelaksana)</span>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Jabatan Panitia</label>
                <input
                  type="text"
                  value={jabatanKanan}
                  onChange={(e) => setJabatanKanan(e.target.value)}
                  placeholder="Contoh: Panitia Pelaksana Kegiatan / Ketua Panitia"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">
                  Nama Lengkap (beserta gelar)
                </label>
                <input
                  type="text"
                  value={namaKanan}
                  onChange={(e) => setNamaKanan(e.target.value)}
                  placeholder="Kosongkan jika tanda tangan manual"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">NIP (Opsional)</label>
                <input
                  type="text"
                  value={nipKanan}
                  onChange={(e) => setNipKanan(e.target.value)}
                  placeholder="Contoh: 19820512 200502 1 001"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="pt-2 text-[11px] text-slate-400 italic">
                * Jika nama dikosongkan, sistem akan otomatis mencetak titik-titik ( .................... ) untuk ditulis tangan.
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetToBlank}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Titik-Titik
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                Simpan Pengaturan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

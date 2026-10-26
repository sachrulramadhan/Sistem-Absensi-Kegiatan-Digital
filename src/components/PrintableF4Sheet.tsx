import React, { useState } from 'react';
import { Printer, Download, X, FileSpreadsheet, Settings } from 'lucide-react';
import type { AttendanceRecord, Kegiatan, SignatureSettings } from '../types/attendance';
import { exportAttendanceToExcel } from '../services/excelExport';
import { SignatureConfigModal } from './SignatureConfigModal';

interface PrintableF4SheetProps {
  isOpen: boolean;
  kegiatan?: Kegiatan;
  records: AttendanceRecord[];
  signatureSettings?: SignatureSettings;
  onUpdateSignatureSettings?: (newSettings: SignatureSettings) => void;
  onClose: () => void;
}

export const PrintableF4Sheet: React.FC<PrintableF4SheetProps> = ({
  isOpen,
  kegiatan,
  records,
  signatureSettings,
  onUpdateSignatureSettings,
  onClose,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const now = new Date();
  const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(
    now.getMonth() + 1
  ).padStart(2, '0')}/${now.getFullYear()}`;

  const eventName = kegiatan ? kegiatan.nama : 'KEGIATAN KOORDINASI & PELATIHAN';
  const eventDate = kegiatan?.tanggal || records[0]?.tanggal || dateFormatted;
  const eventLocation = kegiatan?.lokasi || 'Aula Pertemuan';

  // Local state for instant feedback if updated within modal
  const [localSettings, setLocalSettings] = useState<SignatureSettings>(() =>
    signatureSettings || {
      tempatTanggal: `${eventLocation.split(' ')[0] || 'Di tempat'}, ${eventDate}`,
      judulKiri: 'Mengetahui,',
      jabatanKiri: 'Penanggung Jawab Acara,',
      namaKiri: '',
      nipKiri: '',
      jabatanKanan: 'Panitia Pelaksana Kegiatan,',
      namaKanan: '',
      nipKanan: '',
    }
  );

  React.useEffect(() => {
    if (signatureSettings) {
      setLocalSettings(signatureSettings);
    }
  }, [signatureSettings]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadExcel = async () => {
    setIsExporting(true);
    try {
      await exportAttendanceToExcel({
        kegiatan,
        records,
        signatureSettings: localSettings,
      });
    } catch (err) {
      console.error('Download excel error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveSettings = (newSettings: SignatureSettings) => {
    setLocalSettings(newSettings);
    if (onUpdateSignatureSettings) {
      onUpdateSignatureSettings(newSettings);
    }
  };

  // Add blank lines at the bottom for walk-in participants
  const blankRowsCount = Math.max(3, 10 - records.length);
  const blankRows = Array.from({ length: blankRowsCount }, (_, i) => records.length + i + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col my-auto max-h-[96vh]">
        {/* Top Control Bar (Hidden when printed) */}
        <div className="p-4 bg-slate-800 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                Lembar Absensi / Daftar Hadir
              </h3>
              <p className="text-xs text-slate-300">
                Kolom Tanda Tangan Zig-Zag Siap Pulpen
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Configure Signers button */}
            <button
              onClick={() => setIsConfigOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs border border-slate-600"
              title="Atur Nama Penanggung Jawab, Panitia, NIP, dan Tempat Tanggal"
            >
              <Settings className="w-4 h-4 text-emerald-400" />
              <span>Atur Penandatangan</span>
            </button>

            {/* Download Excel Button */}
            <button
              onClick={handleDownloadExcel}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-500 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'Menyiapkan...' : 'Download Excel (.xlsx)'}</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak (Print)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Container Preview (Formatted for F4 330mm x 215mm Landscape) */}
        <div className="p-6 sm:p-10 overflow-y-auto bg-slate-100/50 flex-1 print:p-0 print:bg-white print:overflow-visible">
          <div
            id="printable-f4-document"
            className="bg-white border border-slate-300 p-8 sm:p-10 rounded-xl shadow-md mx-auto max-w-5xl text-slate-900 print:border-none print:shadow-none print:p-0 print:max-w-none print:w-full font-serif"
          >
            {/* Kop & Document Header */}
            <div className="text-center pb-3 border-b-2 border-slate-900 mb-4">
              <h2 className="text-lg sm:text-xl font-bold tracking-wider uppercase font-sans">
                DAFTAR HADIR PESERTA
              </h2>
              <h3 className="text-base sm:text-lg font-extrabold text-emerald-800 uppercase mt-0.5 font-sans">
                {eventName}
              </h3>
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full border-collapse border border-slate-900 text-xs font-sans">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold uppercase text-center border-b border-slate-900">
                    <th className="border border-slate-900 py-2 px-1 w-8">NO</th>
                    <th className="border border-slate-900 py-2 px-2 text-left">NAMA LENGKAP</th>
                    <th className="border border-slate-900 py-2 px-2 text-left">NO. TELEPON / WA</th>
                    <th className="border border-slate-900 py-2 px-2 text-left">NOMOR REKENING / BANK</th>
                    <th className="border border-slate-900 py-2 px-2 text-left">INSTANSI / ASAL</th>
                    <th className="border border-slate-900 py-2 px-2 text-left">JABATAN</th>
                    <th className="border border-slate-900 py-2 px-2 w-32" colSpan={2}>
                      TANDA TANGAN MANUAL
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, index) => {
                    const no = index + 1;
                    const isOdd = no % 2 !== 0;

                    return (
                      <tr key={r.id} className="border-b border-slate-900 h-10">
                        {/* No */}
                        <td className="border border-slate-900 text-center font-bold">{no}</td>

                        {/* Nama */}
                        <td className="border border-slate-900 px-2 font-semibold">
                          {r.nama}
                        </td>

                        {/* Nomor Telepon / WA */}
                        <td className="border border-slate-900 px-2 font-mono text-[11px]">
                          {r.noTelepon || '-'}
                        </td>

                        {/* Rekening */}
                        <td className="border border-slate-900 px-2 font-mono text-[11px]">
                          {r.noRekening}
                        </td>

                        {/* Instansi */}
                        <td className="border border-slate-900 px-2">{r.instansi}</td>

                        {/* Jabatan */}
                        <td className="border border-slate-900 px-2">{r.jabatan}</td>

                        {/* Zig Zag Tanda Tangan: Col Ganjil */}
                        <td className="border border-slate-900 px-2 w-28 align-middle text-left font-mono text-[11px]">
                          {isOdd ? `${no}. .................` : ''}
                        </td>

                        {/* Zig Zag Tanda Tangan: Col Genap */}
                        <td className="border border-slate-900 px-2 w-28 align-middle text-left font-mono text-[11px]">
                          {!isOdd ? `${no}. .................` : ''}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Blank rows for walk-ins */}
                  {blankRows.map((no) => {
                    const isOdd = no % 2 !== 0;
                    return (
                      <tr key={`blank-${no}`} className="border-b border-slate-900 h-10">
                        <td className="border border-slate-900 text-center text-slate-500">{no}</td>
                        <td className="border border-slate-900 px-2"></td>
                        <td className="border border-slate-900 px-2"></td>
                        <td className="border border-slate-900 px-2"></td>
                        <td className="border border-slate-900 px-2"></td>
                        <td className="border border-slate-900 px-2"></td>
                        <td className="border border-slate-900 px-2 text-left font-mono text-[11px]">
                          {isOdd ? `${no}. .................` : ''}
                        </td>
                        <td className="border border-slate-900 px-2 text-left font-mono text-[11px]">
                          {!isOdd ? `${no}. .................` : ''}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Document Footer: Committee Approval Signatures */}
            <div className="mt-8 pt-4 grid grid-cols-2 gap-8 text-xs font-sans break-inside-avoid">
              {/* Pihak Kiri (Penanggung Jawab) */}
              <div className="text-left pl-6">
                <p>{localSettings.judulKiri || 'Mengetahui,'}</p>
                <p className="font-bold">{localSettings.jabatanKiri || 'Penanggung Jawab Acara,'}</p>
                <div className="h-16"></div>
                <p className="font-bold">
                  {localSettings.namaKiri?.trim()
                    ? `( ${localSettings.namaKiri.trim()} )`
                    : '( .................................................... )'}
                </p>
                <p className="text-slate-600 font-mono">
                  {localSettings.nipKiri?.trim() ? `NIP. ${localSettings.nipKiri.trim()}` : 'NIP. '}
                </p>
              </div>

              {/* Pihak Kanan (Panitia Pelaksana) */}
              <div className="text-left pl-12">
                <p>{localSettings.tempatTanggal || `${eventLocation.split(' ')[0] || 'Tempat'}, ${dateFormatted}`}</p>
                <p className="font-bold">{localSettings.jabatanKanan || 'Panitia Pelaksana Kegiatan,'}</p>
                <div className="h-16"></div>
                <p className="font-bold">
                  {localSettings.namaKanan?.trim()
                    ? `( ${localSettings.namaKanan.trim()} )`
                    : '( .................................................... )'}
                </p>
                <p className="text-slate-600 font-mono">
                  {localSettings.nipKanan?.trim() ? `NIP. ${localSettings.nipKanan.trim()}` : 'NIP. '}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 print:hidden text-xs text-slate-500">
          <span>
            💡 Klik <strong>"Atur Penandatangan"</strong> untuk menyesuaikan nama, jabatan, NIP, serta tanggal pengesahan.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>

      {/* Signature Configuration Modal */}
      {isConfigOpen && (
        <SignatureConfigModal
          isOpen={isConfigOpen}
          settings={localSettings}
          defaultLocation={eventLocation.split(' ')[0] || 'Di tempat'}
          defaultDate={eventDate}
          onSave={handleSaveSettings}
          onClose={() => setIsConfigOpen(false)}
        />
      )}
    </div>
  );
};

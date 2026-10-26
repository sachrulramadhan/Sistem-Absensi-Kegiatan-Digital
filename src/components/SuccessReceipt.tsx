import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import {
  CheckCircle2,
  Printer,
  PlusCircle,
  FileSpreadsheet,
  HardDrive,
  Calendar,
  Clock,
  Building,
  Briefcase,
  CreditCard,
  User,
  ShieldCheck,
  Phone,
} from 'lucide-react';
import type { AttendanceRecord } from '../types/attendance';

interface SuccessReceiptProps {
  record: AttendanceRecord;
  onNewAttendance: () => void;
}

export const SuccessReceipt: React.FC<SuccessReceiptProps> = ({ record, onNewAttendance }) => {
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Fire celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }

    // Render verification QR Code
    if (qrCanvasRef.current) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        `VALID-ABSENSI|${record.id}|${record.nama}|${record.tanggal}|${record.namaKegiatan}`,
        {
          width: 90,
          margin: 1,
          color: { dark: '#1e293b', light: '#ffffff' },
        }
      );
    }
  }, [record]);

  const handlePrint = () => {
    window.print();
  };

  // Mask bank account for privacy: e.g. "1240009876543 (Bank Mandiri)" -> "•••• •••• 6543 (Bank Mandiri)"
  const maskAccount = (acc: string) => {
    if (!acc) return '-';
    const match = acc.match(/(\d+)/);
    if (!match) return acc;
    const digits = match[1];
    if (digits.length <= 4) return acc;
    const maskedDigits = '•••• ' + digits.slice(-4);
    return acc.replace(digits, maskedDigits);
  };

  return (
    <div className="max-w-xl mx-auto py-6 px-4 sm:px-0">
      {/* Success banner */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs border border-emerald-100">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Absensi Berhasil Disimpan</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Terima kasih telah melakukan konfirmasi kehadiran secara digital.
        </p>

        <div className="inline-flex items-center gap-1.5 mt-2.5 text-xs text-emerald-700 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Data kehadiran tersinkronisasi ke Google Sheets</span>
        </div>
      </div>

      {/* Official Receipt Card */}
      <div
        id="attendance-receipt"
        className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden relative"
      >
        {/* Receipt Header */}
        <div className="bg-slate-900 text-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-emerald-400 block mb-1">
                Bukti Kehadiran Digital
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {record.namaKegiatan}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Sistem Absensi Digital</p>
            </div>
            <div className="bg-white p-1.5 rounded-xl shadow-xs shrink-0">
              <canvas ref={qrCanvasRef} className="block" />
            </div>
          </div>
        </div>

        {/* Attendance ID Bar */}
        <div className="bg-slate-50 border-y border-slate-200/80 px-6 py-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              Nomor Registrasi / ID
            </span>
            <span className="text-sm sm:text-base font-mono font-bold text-slate-900 tracking-wider">
              {record.id}
            </span>
          </div>
          <div className="text-right">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                record.status === 'Tepat Waktu'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              {record.status}
            </span>
          </div>
        </div>

        {/* Details grid */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2.5">
              <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-slate-500 block">Nama Peserta</span>
                <span className="font-semibold text-slate-900">{record.nama}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-slate-500 block">No. Telepon / WhatsApp</span>
                <span className="font-mono text-slate-800">{record.noTelepon || '-'}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CreditCard className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-slate-500 block">Nomor Rekening</span>
                <span className="font-mono text-slate-800">{maskAccount(record.noRekening)}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Building className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-slate-500 block">Instansi</span>
                <span className="font-medium text-slate-800">{record.instansi}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Briefcase className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-slate-500 block">Jabatan</span>
                <span className="font-medium text-slate-800">{record.jabatan}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-slate-500 block">Tanggal Kegiatan</span>
                <span className="font-medium text-slate-800">{record.tanggal}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-slate-500 block">Waktu Tercatat</span>
                <span className="font-mono text-slate-800">{record.jam} WIB</span>
              </div>
            </div>
          </div>

          {/* Notice: Manual signature on F4 printed sheet */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-auto flex items-start gap-2.5 bg-emerald-50/80 p-3 rounded-xl border border-emerald-200">
              <span className="text-xl">✍️</span>
              <div className="text-xs">
                <span className="font-bold text-emerald-950 block">Tanda Tangan Manual</span>
                <span className="text-emerald-800">
                  Data Anda telah tercatat. Silakan bubuhkan tanda tangan fisik pada lembar daftar hadir di meja panitia.
                </span>
              </div>
            </div>

            <div className="w-full sm:w-auto text-xs text-slate-500 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Sheet: ABSENSI (Tercatat)
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {record.timestamp}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handlePrint}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-all"
        >
          <Printer className="w-4 h-4" />
          Cetak / Simpan PDF Slip
        </button>

        <button
          type="button"
          onClick={onNewAttendance}
          className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Isi Absensi Baru
        </button>
      </div>
    </div>
  );
};

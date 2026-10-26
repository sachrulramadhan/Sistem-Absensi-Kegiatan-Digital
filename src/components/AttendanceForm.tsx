import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  User,
  CreditCard,
  Building,
  Briefcase,
  AlertCircle,
  FileText,
  Send,
  Loader2,
  Sparkles,
  PenLine,
  FileSpreadsheet,
  Phone,
  Search,
  X,
} from 'lucide-react';
import type { AttendanceRecord, Kegiatan, Instansi } from '../types/attendance';
import {
  generateAttendanceId,
  getCurrentDateTimeFormatted,
  determineAttendanceStatus,
  checkDuplicateAttendance,
  getAppConfig,
} from '../services/storageService';
import { appendAttendanceToSheet } from '../services/googleWorkspace';
import { getAccessToken } from '../services/googleAuth';

interface AttendanceFormProps {
  kegiatanList: Kegiatan[];
  instansiList: Instansi[];
  initialKegiatanId?: string;
  onSuccess: (record: AttendanceRecord) => void;
}

const INDONESIAN_BANKS = [
  'Bank Mandiri',
  'Bank BCA',
  'Bank BRI',
  'Bank BNI',
  'Bank Syariah Indonesia (BSI)',
  'Bank DKI',
  'Bank BJB',
  'Bank Jateng',
  'Bank Jatim',
  'Bank Sumut',
  'Bank Kalbar',
  'Bank Sulselbar',
  'Bank CIMB Niaga',
  'Bank Permata',
  'Bank Danamon',
  'Bank Tabungan Negara (BTN)',
  'Lainnya',
];

export const AttendanceForm: React.FC<AttendanceFormProps> = ({
  kegiatanList,
  instansiList,
  initialKegiatanId,
  onSuccess,
}) => {
  // Form State
  const [selectedKegiatanId, setSelectedKegiatanId] = useState<string>('');
  const [nama, setNama] = useState('');
  const [noTelepon, setNoTelepon] = useState('');
  const [selectedBank, setSelectedBank] = useState('Bank Mandiri');
  const [customBank, setCustomBank] = useState('');
  const [nomorRekening, setNomorRekening] = useState('');
  const [selectedInstansi, setSelectedInstansi] = useState('');
  const [customInstansi, setCustomInstansi] = useState('');
  const [instansiSearch, setInstansiSearch] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [keterangan, setKeterangan] = useState('Hadir Langsung');

  // Status & Validation State
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState<string>('');

  // Auto-select initial kegiatan from URL param if available
  useEffect(() => {
    if (initialKegiatanId && kegiatanList.some((k) => k.id === initialKegiatanId)) {
      setSelectedKegiatanId(initialKegiatanId);
    } else if (kegiatanList.length > 0 && !selectedKegiatanId) {
      // Default to first active event
      const firstActive = kegiatanList.find((k) => k.status === 'Aktif') || kegiatanList[0];
      setSelectedKegiatanId(firstActive.id);
    }
  }, [initialKegiatanId, kegiatanList, selectedKegiatanId]);

  // Set default instansi if available
  useEffect(() => {
    if (!selectedInstansi && instansiList.length > 0) {
      setSelectedInstansi(instansiList[0].nama);
    }
  }, [instansiList, selectedInstansi]);

  // Categorize instansi into clean thematic groups (pure institution names)
  const getCategoryForInstansi = (name: string): string => {
    if (name.startsWith('RS') || name.startsWith('RSU') || name.startsWith('RSIA')) return 'Rumah Sakit';
    if (name.startsWith('Kecamatan')) return 'Pemerintah Kecamatan';
    if (name.startsWith('Kelurahan')) return 'Pemerintah Kelurahan';
    if (name.startsWith('TP. PKK')) return 'TP. PKK Kecamatan';
    if (name.startsWith('Bidang') || name.startsWith('Puskesmas') || name.includes('Kluster')) return 'Bidang & Faskes';
    if (
      ['Gizi', 'Promkes', 'Rujukan', 'Pelayanan Primer', 'P2', 'Surveilans', 'Kesling', 'Farmasi', 'Keuangan', 'Perencanaan'].includes(name)
    ) return 'Program & Unit Kerja';
    if (name.includes('IBI') || name.includes('Tim Kerja')) return 'Organisasi Profesi & Tim Kerja';
    return 'OPD & Instansi Vertikal';
  };

  // Filter instansi based on search query
  const filteredInstansiList = useMemo(() => {
    if (!instansiSearch.trim()) return instansiList;
    const q = instansiSearch.toLowerCase();
    return instansiList.filter((item) => item.nama.toLowerCase().includes(q));
  }, [instansiList, instansiSearch]);

  // Group filtered instansi list
  const groupedInstansi = useMemo(() => {
    const groups: Record<string, Instansi[]> = {};
    filteredInstansiList.forEach((item) => {
      const cat = getCategoryForInstansi(item.nama);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [filteredInstansiList]);

  // Handle instansi change
  const handleInstansiChange = (val: string) => {
    setSelectedInstansi(val);
  };

  const activeKegiatan = kegiatanList.find((k) => k.id === selectedKegiatanId);
  const isEventClosed = activeKegiatan?.status === 'Ditutup';
  const isEventScheduled = activeKegiatan?.status === 'Terjadwal';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Validation
    if (!selectedKegiatanId || !activeKegiatan) {
      setErrorMsg('Pilih kegiatan terlebih dahulu.');
      return;
    }

    if (isEventClosed) {
      setErrorMsg('Absensi untuk kegiatan ini telah ditutup oleh panitia.');
      return;
    }

    if (!nama.trim()) {
      setErrorMsg('Nama lengkap wajib diisi.');
      return;
    }

    if (!noTelepon.trim()) {
      setErrorMsg('Nomor telepon / WhatsApp wajib diisi.');
      return;
    }

    if (!nomorRekening.trim()) {
      setErrorMsg('Nomor rekening wajib diisi untuk keperluan administrasi.');
      return;
    }

    const finalInstansi =
      selectedInstansi === 'Lainnya' ? customInstansi.trim() : selectedInstansi;
    if (!finalInstansi) {
      setErrorMsg('Instansi wajib dipilih atau diisi.');
      return;
    }

    if (!jabatan.trim()) {
      setErrorMsg('Jabatan wajib diisi.');
      return;
    }

    const bankName = selectedBank === 'Lainnya' ? customBank.trim() || 'Bank Lain' : selectedBank;
    const formattedRekening = `${nomorRekening.trim()} (${bankName})`;

    const { timestamp, tanggal, jam } = getCurrentDateTimeFormatted();

    // 2. Duplicate Check
    const existing = checkDuplicateAttendance(
      nama,
      formattedRekening,
      activeKegiatan.id,
      tanggal
    );

    if (existing) {
      setErrorMsg(
        `Anda sudah tercatat melakukan absensi pada kegiatan "${activeKegiatan.nama}" pada ${existing.tanggal} pukul ${existing.jam} dengan Nomor ID: ${existing.id}.`
      );
      return;
    }

    // 3. Generate ID & Determine punctuality status
    const attendanceId = generateAttendanceId();
    const status = determineAttendanceStatus(activeKegiatan);

    setIsSubmitting(true);
    setSubmitProgress('Menyimpan data kehadiran...');

    try {
      const config = getAppConfig();
      const token = await getAccessToken();

      // Record object - manual signature on paper
      const record: AttendanceRecord = {
        id: attendanceId,
        timestamp,
        nama: nama.trim(),
        noTelepon: noTelepon.trim(),
        noRekening: formattedRekening,
        namaBank: bankName,
        instansi: finalInstansi,
        jabatan: jabatan.trim(),
        kegiatanId: activeKegiatan.id,
        namaKegiatan: activeKegiatan.nama,
        tanggal,
        jam,
        keterangan: keterangan || 'Hadir Langsung',
        tandaTanganUrl: 'Tanda Tangan Manual',
        status,
        syncedToGoogleSheets: false,
      };

      // If Google Auth & Spreadsheet ID is active, sync to Google Sheets immediately
      if (token && config.spreadsheetId) {
        try {
          setSubmitProgress('Menyimpan ke Google Sheets...');
          await appendAttendanceToSheet(config.spreadsheetId, record);
          record.syncedToGoogleSheets = true;
        } catch (sheetErr) {
          console.warn('Sheet append error (will be stored locally for sync):', sheetErr);
        }
      }

      setSubmitProgress('Selesai!');
      onSuccess(record);
    } catch (err: any) {
      console.error('Submit error:', err);
      setErrorMsg(
        err.message || 'Terjadi gangguan saat menyimpan data. Silakan coba kembali.'
      );
    } finally {
      setIsSubmitting(false);
      setSubmitProgress('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 sm:px-0">
      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden">
        {/* Modern Header */}
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Konfirmasi Kehadiran Digital</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Formulir Absensi Kegiatan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Lengkapi identitas Anda untuk pencatatan daftar hadir dan administrasi kegiatan.
          </p>
        </div>

        {/* Notice for Manual Physical Signature */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-3.5 flex items-start gap-3">
          <PenLine className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-800">Tanda Tangan Fisik: </span>
            Data Anda akan direkap secara digital. Tanda tangan basah manual dilakukan pada lembar daftar hadir di meja registrasi.
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm leading-relaxed">
              <strong className="font-semibold block">Perhatian:</strong>
              {errorMsg}
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* 1. SELEKSI KEGIATAN */}
          <div className="space-y-3 pb-6 border-b border-slate-100">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Kegiatan yang Diikuti <span className="text-red-500">*</span>
            </label>

            <select
              value={selectedKegiatanId}
              onChange={(e) => setSelectedKegiatanId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
            >
              {kegiatanList.map((k) => (
                <option key={k.id} value={k.id}>
                  [{k.id}] {k.nama} ({k.status})
                </option>
              ))}
            </select>

            {/* Event Summary Card */}
            {activeKegiatan && (
              <div
                className={`p-4 rounded-xl border transition-all text-sm ${
                  isEventClosed
                    ? 'bg-red-50/60 border-red-200 text-red-950'
                    : isEventScheduled
                    ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                    : 'bg-slate-50 border-slate-200/90 text-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 block mb-0.5">
                      {activeKegiatan.id}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base leading-snug text-slate-900">
                      {activeKegiatan.nama}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      activeKegiatan.status === 'Aktif'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : activeKegiatan.status === 'Ditutup'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {activeKegiatan.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 mt-3 pt-3 border-t border-slate-200/60 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{activeKegiatan.tanggal}</span>
                  </div>
                  {activeKegiatan.jamMulai && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {activeKegiatan.jamMulai} - {activeKegiatan.jamSelesai || 'Selesai'} WIB
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate max-w-[260px]">{activeKegiatan.lokasi}</span>
                  </div>
                </div>

                {isEventClosed && (
                  <div className="mt-3 p-2.5 bg-red-100/70 border border-red-200 rounded-lg text-xs font-semibold text-red-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    Absensi untuk kegiatan ini telah ditutup oleh panitia pelaksana.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. INFORMASI PESERTA */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Identitas Peserta
            </h2>

            {/* Nama Lengkap */}
            <div>
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                Nama Lengkap (beserta gelar jika ada) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isEventClosed}
                placeholder="Contoh: Budi Santoso, S.Kom, M.M."
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-900"
              />
            </div>

            {/* Nomor Telepon / WhatsApp */}
            <div>
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                Nomor Telepon / WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                disabled={isEventClosed}
                placeholder="Contoh: 081234567890"
                value={noTelepon}
                onChange={(e) => setNoTelepon(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-900"
              />
            </div>

            {/* Nomor Rekening & Bank */}
            <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-start justify-between">
                <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  Nomor Rekening & Nama Bank <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  Untuk Administrasi / Honor
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Diperlukan untuk keperluan transfer honorarium, akomodasi, atau uang transport kegiatan.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    Nama Bank / Dompet
                  </label>
                  <select
                    disabled={isEventClosed}
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                  >
                    {INDONESIAN_BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    Nomor Rekening
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isEventClosed}
                    placeholder="Contoh: 1240009876543"
                    value={nomorRekening}
                    onChange={(e) => setNomorRekening(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>

              {selectedBank === 'Lainnya' && (
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    Tulis Nama Bank Lainnya
                  </label>
                  <input
                    type="text"
                    disabled={isEventClosed}
                    placeholder="Contoh: Bank Danamon / Bank Muamalat"
                    value={customBank}
                    onChange={(e) => setCustomBank(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                  />
                </div>
              )}
            </div>

            {/* Instansi & Jabatan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-emerald-600" />
                    Instansi / Asal <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {filteredInstansiList.length} opsi
                  </span>
                </div>

                {/* Quick filter input for 62+ instansi */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    disabled={isEventClosed}
                    placeholder="Ketik cari: RSU Undata, Palu Selatan, Petobo, Gizi..."
                    value={instansiSearch}
                    onChange={(e) => setInstansiSearch(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 text-slate-900 transition-all"
                  />
                  {instansiSearch && (
                    <button
                      type="button"
                      onClick={() => setInstansiSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      title="Hapus pencarian"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Categorized Dropdown */}
                <select
                  disabled={isEventClosed}
                  value={selectedInstansi}
                  onChange={(e) => handleInstansiChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 outline-none text-slate-900"
                >
                  {Object.entries(groupedInstansi).map(([groupName, items]) => (
                    <optgroup key={groupName} label={`▼ ${groupName} (${items.length})`}>
                      {items.map((ins) => (
                        <option key={ins.id} value={ins.nama}>
                          {ins.nama}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  <optgroup label="▼ Lainnya">
                    <option value="Lainnya">+ Instansi Lainnya (Ketik Manual)</option>
                  </optgroup>
                </select>

                {selectedInstansi === 'Lainnya' && (
                  <input
                    type="text"
                    required
                    disabled={isEventClosed}
                    placeholder="Ketik nama instansi / unit kerja Anda..."
                    value={customInstansi}
                    onChange={(e) => setCustomInstansi(e.target.value)}
                    className="w-full mt-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                  Jabatan / Posisi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={isEventClosed}
                  placeholder="Contoh: Direktur / Camat / Lurah / Staf"
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 outline-none text-slate-900"
                />

                {/* Quick Chips for Ketua, Kepala, Direktur, Camat, Lurah, etc. */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mr-0.5">
                    Pilihan Cepat:
                  </span>
                  {[
                    'Ketua',
                    'Kepala',
                    'Direktur',
                    'Camat',
                    'Lurah',
                    'Koordinator',
                    'Sekretaris',
                    'Staf',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      disabled={isEventClosed}
                      onClick={() => setJabatan(chip)}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border transition-all ${
                        jabatan === chip
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-slate-700 border-slate-200'
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Keterangan Kehadiran */}
            <div>
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                Keterangan Kehadiran
              </label>
              <select
                disabled={isEventClosed}
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 outline-none text-slate-900"
              >
                <option value="Hadir Langsung">Hadir Langsung di Lokasi</option>
                <option value="Hadir Daring (Zoom / Meet)">Hadir Daring (Virtual)</option>
                <option value="Penugasan Khusus">Penugasan Khusus / Panitia</option>
                <option value="Delegasi Perwakilan">Delegasi Perwakilan Instansi</option>
              </select>
            </div>
          </div>

          {/* 3. SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isEventClosed}
              className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm shadow-xs transition-all ${
                isEventClosed
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-sm active:scale-[0.99] focus:ring-4 focus:ring-emerald-500/20'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{submitProgress || 'Menyimpan Absensi...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Konfirmasi Kehadiran</span>
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-2">
              Sistem akan otomatis mencatat timestamp kehadiran dan membuat bukti registrasi digital.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

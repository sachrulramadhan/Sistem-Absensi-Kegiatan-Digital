import React, { useState } from 'react';
import {
  Users,
  CalendarCheck,
  Building2,
  CalendarDays,
  FileSpreadsheet,
  HardDrive,
  Settings,
  Lock,
  Unlock,
  KeyRound,
  ExternalLink,
  RefreshCw,
  LogOut,
  Sparkles,
  PenTool,
  Check,
  RotateCcw,
  Save,
  Shield,
  UserCheck,
  Calendar,
  Radio,
} from 'lucide-react';
import type { AttendanceRecord, Kegiatan, Instansi, AppConfig, SignatureSettings } from '../types/attendance';
import { AttendanceTable } from './AttendanceTable';
import { EventsManager } from './EventsManager';
import { InstansiManager } from './InstansiManager';
import { GoogleIntegrationModal } from './GoogleIntegrationModal';
import { SignatureConfigModal } from './SignatureConfigModal';
import type { User } from 'firebase/auth';

interface AdminDashboardProps {
  currentUser: User | null;
  config: AppConfig;
  records: AttendanceRecord[];
  kegiatanList: Kegiatan[];
  instansiList: Instansi[];
  onUpdateConfig: (cfg: AppConfig) => void;
  onSaveKegiatan: (k: Kegiatan) => Promise<void>;
  onDeleteKegiatan: (id: string) => Promise<void>;
  onSaveInstansi: (ins: Instansi) => Promise<void>;
  onDeleteInstansi: (id: string) => Promise<void>;
  onDeleteRecord: (id: string) => Promise<void>;
  onRefreshData: () => Promise<void>;
  onSelectEventForAttendance: (id: string) => void;
  onOpenLiveScreen?: (id?: string) => void;
  onResetInstansiDefaults?: () => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  config,
  records,
  kegiatanList,
  instansiList,
  onUpdateConfig,
  onSaveKegiatan,
  onDeleteKegiatan,
  onSaveInstansi,
  onDeleteInstansi,
  onDeleteRecord,
  onRefreshData,
  onSelectEventForAttendance,
  onOpenLiveScreen,
  onResetInstansiDefaults,
}) => {
  // PIN protection: unlocked if PIN verified or currentUser is logged in
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [inputPin, setInputPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Sub-tabs
  const [activeTab, setActiveTab] = useState<'absensi' | 'kegiatan' | 'instansi' | 'penandatangan'>('absensi');
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  // Signature settings form state
  const [sigForm, setSigForm] = useState<SignatureSettings>(
    config.signatureSettings || {
      tempatTanggal: 'Jakarta, 24 Oktober 2026',
      judulKiri: 'Mengetahui,',
      jabatanKiri: 'Penanggung Jawab Acara,',
      namaKiri: '',
      nipKiri: '',
      jabatanKanan: 'Ketua Panitia Pelaksana,',
      namaKanan: '',
      nipKanan: '',
    }
  );
  const [sigSavedNotice, setSigSavedNotice] = useState(false);

  // Keep sigForm updated if config changes from outside
  React.useEffect(() => {
    if (config.signatureSettings) {
      setSigForm(config.signatureSettings);
    }
  }, [config.signatureSettings]);

  // Calculations for Stats Cards
  const totalPeserta = records.length;

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).replace(/\//g, '/');

  const hadirHariIni = records.filter((r) => {
    // Check if record date matches today
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    const target = `${d}/${m}/${y}`;
    return r.tanggal === target;
  }).length;

  const totalInstansi = instansiList.length;
  const kegiatanAktif = kegiatanList.filter((k) => k.status === 'Aktif').length;

  // Handle PIN unlock
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPin === config.adminPin || inputPin === '1234') {
      setIsUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // If locked, render PIN Gate
  if (!isUnlocked && !currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-2xl shadow-xl border border-slate-200">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Akses Panel Admin</h2>
          <p className="text-xs text-slate-500 mt-1">
            Untuk melindungi data privasi nomor rekening dan administrasi kegiatan, masukkan PIN Admin.
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              PIN Admin (Default: 1234)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                maxLength={6}
                value={inputPin}
                onChange={(e) => {
                  setInputPin(e.target.value);
                  setPinError(false);
                }}
                placeholder="Masukkan 4-6 digit PIN"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-center text-lg font-mono tracking-widest focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            {pinError && (
              <p className="text-xs text-red-600 mt-1 text-center font-medium">
                PIN yang Anda masukkan salah. Coba: 1234
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <Unlock className="w-4 h-4" />
            Buka Panel Admin
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Atau gunakan tombol login Google di pojok kanan atas untuk akses terintegrasi.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome & Integration Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-xs text-emerald-400 font-semibold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>Panel Manajemen Absensi</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Dashboard Pengelolaan Absensi
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Pantau kehadiran peserta secara langsung, kelola kegiatan, dan sinkronkan data ke Google Sheets & Drive.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenLiveScreen && (
              <button
                type="button"
                onClick={() => onOpenLiveScreen()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors shadow-xs"
                title="Buka Layar Siaran Langsung (QR Code & Tabel Kehadiran Real-time)"
              >
                <Radio className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
                <span>Layar Live Proyektor</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsSignatureModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              title="Atur Nama Penanggung Jawab, Panitia, NIP, dan Tempat Tanggal"
            >
              <PenTool className="w-3.5 h-3.5 text-emerald-400" />
              <span>Atur TTD & Panitia</span>
            </button>

            <button
              type="button"
              onClick={() => setIsIntegrationModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Koneksi Google</span>
            </button>

            {config.spreadsheetId && (
              <a
                href={`https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-medium border border-slate-700 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Sheet</span>
              </a>
            )}
          </div>
        </div>

        {/* Integration Status Strip (Clean Unboxed Metadata) */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                config.spreadsheetId ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span>
              Google Sheets: <strong className="text-white font-medium">{config.spreadsheetId ? 'Tersambung' : 'Belum Dikonfigurasi'}</strong>
            </span>
          </div>

          <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>

          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                config.driveFolderId ? 'bg-emerald-400' : 'bg-slate-600'
              }`}
            />
            <span>
              Folder Drive: <strong className="text-white font-medium">{config.driveFolderName || 'Absensi'}</strong>
            </span>
          </div>

          <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>

          <div className="flex items-center gap-1.5">
            <span>
              Admin: <strong className="text-emerald-300 font-medium">{currentUser?.email || config.adminEmail}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Peserta */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Peserta
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              {totalPeserta}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Hadir Hari Ini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Hadir Hari Ini
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              {hadirHariIni}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Total Instansi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Instansi
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              {totalInstansi}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Kegiatan Aktif */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Kegiatan Aktif
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              {kegiatanAktif}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('absensi')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'absensi'
              ? 'border-emerald-600 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-600" />
          <span>Data Absensi Peserta</span>
          <span className="text-xs font-mono text-slate-500">
            ({records.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('kegiatan')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'kegiatan'
              ? 'border-emerald-600 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarDays className="w-4 h-4 text-emerald-600" />
          <span>Kelola Kegiatan</span>
          <span className="text-xs font-mono text-slate-500">
            ({kegiatanList.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('instansi')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'instansi'
              ? 'border-emerald-600 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4 text-emerald-600" />
          <span>Master Instansi</span>
          <span className="text-xs font-mono text-slate-500">
            ({instansiList.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('penandatangan')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'penandatangan'
              ? 'border-emerald-600 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PenTool className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan Penandatangan (TTD)</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'absensi' && (
        <AttendanceTable
          records={records}
          kegiatanList={kegiatanList}
          instansiList={instansiList}
          onDeleteRecord={onDeleteRecord}
          signatureSettings={config.signatureSettings}
          onUpdateSignatureSettings={(newSettings) => {
            onUpdateConfig({ ...config, signatureSettings: newSettings });
            setSigForm(newSettings);
          }}
        />
      )}

      {activeTab === 'kegiatan' && (
        <EventsManager
          kegiatanList={kegiatanList}
          onSaveKegiatan={onSaveKegiatan}
          onDeleteKegiatan={onDeleteKegiatan}
          onSelectEventForAttendance={onSelectEventForAttendance}
          onOpenLiveScreen={onOpenLiveScreen}
        />
      )}

      {activeTab === 'instansi' && (
        <InstansiManager
          instansiList={instansiList}
          onSaveInstansi={onSaveInstansi}
          onDeleteInstansi={onDeleteInstansi}
          onResetDefaults={onResetInstansiDefaults}
        />
      )}

      {/* Tab Panel: Pengaturan Penandatangan */}
      {activeTab === 'penandatangan' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-6">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <PenTool className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  Pengaturan Penanggung Jawab, Panitia & Tempat Tanggal
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Pengaturan nama, NIP, jabatan, dan tempat tanggal pengesahan yang akan tercantum di bagian bawah lembar absensi dan file Microsoft Excel (.xlsx).
              </p>
            </div>

            {sigSavedNotice && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Pengaturan berhasil disimpan!</span>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onUpdateConfig({ ...config, signatureSettings: sigForm });
              setSigSavedNotice(true);
              setTimeout(() => setSigSavedNotice(false), 3000);
            }}
            className="p-6 pt-0 space-y-6"
          >
            {/* Tempat & Tanggal Input */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Tempat & Tanggal Pengesahan
              </label>
              <p className="text-[11px] text-slate-500">
                Akan tercantum di atas kolom tanda tangan sebelah kanan (contoh: <em>Jakarta, 24 Oktober 2026</em> atau <em>Bandung, 15 November 2026</em>).
              </p>
              <input
                type="text"
                required
                value={sigForm.tempatTanggal}
                onChange={(e) => setSigForm({ ...sigForm, tempatTanggal: e.target.value })}
                placeholder="Contoh: Jakarta, 24 Oktober 2026"
                className="w-full max-w-md px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Dua Kolom Form Penandatangan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pihak Kiri (Penanggung Jawab / Kepala Dinas) */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
                <div className="flex items-center gap-2 font-bold text-slate-900 pb-3 border-b border-slate-100">
                  <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm">Pihak Kiri (Penanggung Jawab / Pimpinan)</h3>
                    <p className="text-[11px] text-slate-500 font-normal">
                      Posisi di sebelah kiri lembar pengesahan
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Teks Pengantar Atas
                  </label>
                  <input
                    type="text"
                    value={sigForm.judulKiri}
                    onChange={(e) => setSigForm({ ...sigForm, judulKiri: e.target.value })}
                    placeholder="Mengetahui,"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Jabatan / Instansi
                  </label>
                  <input
                    type="text"
                    value={sigForm.jabatanKiri}
                    onChange={(e) => setSigForm({ ...sigForm, jabatanKiri: e.target.value })}
                    placeholder="Contoh: Penanggung Jawab Acara / Kepala Dinas"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Nama Lengkap & Gelar
                  </label>
                  <input
                    type="text"
                    value={sigForm.namaKiri}
                    onChange={(e) => setSigForm({ ...sigForm, namaKiri: e.target.value })}
                    placeholder="Kosongkan jika tanda tangan nama manual"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Nomor Induk Pegawai (NIP)
                  </label>
                  <input
                    type="text"
                    value={sigForm.nipKiri}
                    onChange={(e) => setSigForm({ ...sigForm, nipKiri: e.target.value })}
                    placeholder="Contoh: 19750101 200003 1 002 (Opsional)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Pihak Kanan (Panitia Pelaksana Kegiatan) */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
                <div className="flex items-center gap-2 font-bold text-slate-900 pb-3 border-b border-slate-100">
                  <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm">Pihak Kanan (Panitia Pelaksana Kegiatan)</h3>
                    <p className="text-[11px] text-slate-500 font-normal">
                      Posisi di sebelah kanan lembar pengesahan
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Jabatan Panitia
                  </label>
                  <input
                    type="text"
                    value={sigForm.jabatanKanan}
                    onChange={(e) => setSigForm({ ...sigForm, jabatanKanan: e.target.value })}
                    placeholder="Contoh: Ketua Panitia Pelaksana / Panitia Pelaksana Kegiatan,"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Nama Lengkap & Gelar
                  </label>
                  <input
                    type="text"
                    value={sigForm.namaKanan}
                    onChange={(e) => setSigForm({ ...sigForm, namaKanan: e.target.value })}
                    placeholder="Kosongkan jika tanda tangan nama manual"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Nomor Induk Pegawai (NIP)
                  </label>
                  <input
                    type="text"
                    value={sigForm.nipKanan}
                    onChange={(e) => setSigForm({ ...sigForm, nipKanan: e.target.value })}
                    placeholder="Contoh: 19820512 200502 1 001 (Opsional)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500">
                  💡 <em>Catatan:</em> Jika nama dikosongkan, sistem otomatis membuat titik-titik ( .................................... ) yang siap ditandatangani dan ditulis tangan langsung.
                </div>
              </div>
            </div>

            {/* Live Signature Box Preview */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-emerald-600" />
                  Pratinjau Tampilan Footer Pengesahan di Excel & Cetak
                </span>
                <span className="text-[11px] text-slate-400">Preview Real-time</span>
              </div>

              <div className="bg-white border border-slate-300 rounded-xl p-6 font-serif text-slate-900 shadow-xs">
                <div className="flex justify-between items-start text-xs pt-2">
                  {/* Left block */}
                  <div className="text-center w-64 space-y-1">
                    <p className="font-semibold text-slate-800">{sigForm.judulKiri || 'Mengetahui,'}</p>
                    <p className="font-semibold text-slate-800">{sigForm.jabatanKiri || 'Penanggung Jawab Acara,'}</p>
                    <div className="h-20" />
                    <p className="font-bold underline text-slate-900">
                      {sigForm.namaKiri || '( .................................................... )'}
                    </p>
                    <p className="text-[11px] text-slate-600 font-sans">
                      {sigForm.nipKiri ? `NIP. ${sigForm.nipKiri}` : 'NIP. .................................................'}
                    </p>
                  </div>

                  {/* Right block */}
                  <div className="text-center w-64 space-y-1">
                    <p className="text-slate-800">
                      {sigForm.tempatTanggal || 'Jakarta, 24 Oktober 2026'}
                    </p>
                    <p className="font-semibold text-slate-800">
                      {sigForm.jabatanKanan || 'Panitia Pelaksana Kegiatan,'}
                    </p>
                    <div className="h-20" />
                    <p className="font-bold underline text-slate-900">
                      {sigForm.namaKanan || '( .................................................... )'}
                    </p>
                    <p className="text-[11px] text-slate-600 font-sans">
                      {sigForm.nipKanan ? `NIP. ${sigForm.nipKanan}` : 'NIP. .................................................'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSigForm({
                    tempatTanggal: 'Jakarta, 24 Oktober 2026',
                    judulKiri: 'Mengetahui,',
                    jabatanKiri: 'Penanggung Jawab Acara,',
                    namaKiri: '',
                    nipKiri: '',
                    jabatanKanan: 'Ketua Panitia Pelaksana,',
                    namaKanan: '',
                    nipKanan: '',
                  });
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>Reset ke Titik-Titik Manual</span>
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan Penandatangan</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Google Integration Modal */}
      {isIntegrationModalOpen && (
        <GoogleIntegrationModal
          isOpen={isIntegrationModalOpen}
          currentUser={currentUser}
          config={config}
          records={records}
          onClose={() => setIsIntegrationModalOpen(false)}
          onUpdateConfig={onUpdateConfig}
          onRefreshData={onRefreshData}
        />
      )}

      {/* Quick Signature Config Modal */}
      {isSignatureModalOpen && (
        <SignatureConfigModal
          isOpen={isSignatureModalOpen}
          settings={config.signatureSettings}
          onSave={(newSettings) => {
            onUpdateConfig({ ...config, signatureSettings: newSettings });
            setSigForm(newSettings);
          }}
          onClose={() => setIsSignatureModalOpen(false)}
        />
      )}
    </div>
  );
};

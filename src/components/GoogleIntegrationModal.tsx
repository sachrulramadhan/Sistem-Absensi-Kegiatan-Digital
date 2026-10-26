import React, { useState } from 'react';
import {
  FileSpreadsheet,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Plus,
  Link2,
  Copy,
  Check,
  Code,
  ShieldCheck,
  X,
  LogIn,
  LogOut,
} from 'lucide-react';
import type { AppConfig, AttendanceRecord } from '../types/attendance';
import {
  createAttendanceSpreadsheet,
  getOrCreateDriveFolder,
  syncBatchAttendanceToSheet,
} from '../services/googleWorkspace';
import { googleSignIn, logoutGoogle } from '../services/googleAuth';
import type { User } from 'firebase/auth';

interface GoogleIntegrationModalProps {
  isOpen: boolean;
  currentUser: User | null;
  config: AppConfig;
  records: AttendanceRecord[];
  onClose: () => void;
  onUpdateConfig: (cfg: AppConfig) => void;
  onRefreshData: () => Promise<void>;
}

export const GoogleIntegrationModal: React.FC<GoogleIntegrationModalProps> = ({
  isOpen,
  currentUser,
  config,
  records,
  onClose,
  onUpdateConfig,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'setup' | 'script'>('status');
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [manualSheetId, setManualSheetId] = useState(config.spreadsheetId || '');
  const [copiedScript, setCopiedScript] = useState(false);

  if (!isOpen) return null;

  const unsyncedCount = records.filter((r) => !r.syncedToGoogleSheets).length;

  const handleCreateAutoSpreadsheet = async () => {
    setIsCreatingSheet(true);
    setSyncStatusMsg('Membuat spreadsheet baru dan folder tanda tangan di Google Drive...');
    try {
      // 1. Create Spreadsheet
      const sheetResult = await createAttendanceSpreadsheet('ABSENSI KEGIATAN DIGITAL');

      // 2. Create Drive Folder for signatures
      const driveResult = await getOrCreateDriveFolder('Absensi - Arsip Tanda Tangan');

      const updated: AppConfig = {
        ...config,
        spreadsheetId: sheetResult.spreadsheetId,
        spreadsheetName: 'ABSENSI KEGIATAN DIGITAL',
        driveFolderId: driveResult.folderId,
        driveFolderName: 'Absensi - Arsip Tanda Tangan',
      };
      onUpdateConfig(updated);

      // 3. Sync existing local records if any
      if (records.length > 0) {
        await syncBatchAttendanceToSheet(sheetResult.spreadsheetId, records);
      }

      setSyncStatusMsg('Spreadsheet & Folder Drive berhasil dibuat dan dikonfigurasi!');
      await onRefreshData();
    } catch (err: any) {
      console.error(err);
      setSyncStatusMsg(`Gagal: ${err.message || 'Terjadi kesalahan'}`);
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const handleConnectManual = () => {
    let cleanId = manualSheetId.trim();
    // Support pasting full URL
    const match = cleanId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
      cleanId = match[1];
    }

    if (!cleanId) return;

    const updated: AppConfig = {
      ...config,
      spreadsheetId: cleanId,
    };
    onUpdateConfig(updated);
    setSyncStatusMsg(`Spreadsheet ID berhasil dihubungkan: ${cleanId}`);
  };

  const handleSyncAll = async () => {
    if (!config.spreadsheetId) {
      setSyncStatusMsg('Hubungkan atau buat Google Spreadsheet terlebih dahulu.');
      return;
    }

    setIsSyncing(true);
    setSyncStatusMsg('Sedang menyinkronkan data absensi ke Google Sheets...');
    try {
      await syncBatchAttendanceToSheet(config.spreadsheetId, records);
      setSyncStatusMsg(`Berhasil menyinkronkan ${records.length} data absensi ke Google Sheets!`);
      await onRefreshData();
    } catch (err: any) {
      console.error(err);
      setSyncStatusMsg(`Gagal sinkronisasi: ${err.message || 'Periksa koneksi'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const APPS_SCRIPT_CODE = `/**
 * Google Apps Script Web App untuk Absensi Kegiatan Digital
 * Pasang di Google Sheets: Extensions > Apps Script > Deploy > New deployment > Web App
 * Execute as: Me | Who has access: Anyone
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ABSENSI");
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      data.id,
      data.timestamp,
      data.nama,
      data.noRekening,
      data.instansi,
      data.jabatan,
      data.namaKegiatan,
      data.tanggal,
      data.jam,
      data.keterangan || "-",
      data.tandaTanganUrl || "-",
      data.status || "Tepat Waktu"
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "SUCCESS",
      message: "Absensi berhasil dicatat"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "ERROR",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Integrasi Google Sheets & Google Drive
              </h3>
              <p className="text-xs text-slate-500">
                Pusat sinkronisasi database absensi dan arsip tanda tangan cloud
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 px-6 pt-2 text-xs font-semibold gap-4">
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-2.5 border-b-2 transition-colors ${
              activeTab === 'status'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Status Koneksi
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`pb-2.5 border-b-2 transition-colors ${
              activeTab === 'setup'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Setup Spreadsheet
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`pb-2.5 border-b-2 transition-colors ${
              activeTab === 'script'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Panduan Apps Script (Opsional)
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Status Alert Banner */}
          {syncStatusMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center justify-between">
              <span>{syncStatusMsg}</span>
              <button
                onClick={() => setSyncStatusMsg(null)}
                className="text-emerald-700 hover:text-emerald-900 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB 1: STATUS KONEKSI */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              {/* Account Status Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                    {currentUser?.displayName ? currentUser.displayName.charAt(0) : 'G'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">
                      {currentUser ? currentUser.displayName || currentUser.email : 'Akun Google Terhubung'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {currentUser?.email || config.adminEmail}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {currentUser ? (
                    <button
                      onClick={logoutGoogle}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout
                    </button>
                  ) : (
                    <button
                      onClick={googleSignIn}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Login Google
                    </button>
                  )}
                </div>
              </div>

              {/* Resource Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Google Sheets Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      GOOGLE SHEETS
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        config.spreadsheetId
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {config.spreadsheetId ? 'Terhubung' : 'Belum Terhubung'}
                    </span>
                  </div>

                  {config.spreadsheetId ? (
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        {config.spreadsheetName || 'ABSENSI KEGIATAN DIGITAL'}
                      </p>
                      <p className="font-mono text-[11px] text-slate-400 truncate">
                        ID: {config.spreadsheetId}
                      </p>
                      <a
                        href={`https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/edit`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-semibold mt-2"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Buka Spreadsheet
                      </a>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-slate-500">
                        Spreadsheet belum terhubung. Buat otomatis atau masukkan ID.
                      </p>
                      <button
                        onClick={() => setActiveTab('setup')}
                        className="text-xs text-emerald-600 hover:underline font-semibold mt-2 block"
                      >
                        + Hubungkan sekarang
                      </button>
                    </div>
                  )}
                </div>

                {/* Google Drive Folder Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                      <HardDrive className="w-4 h-4 text-emerald-600" />
                      GOOGLE DRIVE
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        config.driveFolderId
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {config.driveFolderId ? 'Folder Siap' : 'Otomatis'}
                    </span>
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900 text-sm">
                      {config.driveFolderName || 'Absensi - Arsip Tanda Tangan'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Menyimpan file gambar PNG tanda tangan digital peserta.
                    </p>
                    {config.driveFolderId && (
                      <a
                        href={`https://drive.google.com/drive/folders/${config.driveFolderId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-semibold mt-2"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Buka Folder Drive
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Sync Actions Bar */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-800 text-xs">Status Data Sinkronisasi</div>
                  <div className="text-xs text-slate-500">
                    Total data tercatat: <strong>{records.length}</strong> (Belum sync:{' '}
                    <strong className="text-amber-600">{unsyncedCount}</strong>)
                  </div>
                </div>

                <button
                  onClick={handleSyncAll}
                  disabled={isSyncing || !config.spreadsheetId}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SETUP SPREADSHEET */}
          {activeTab === 'setup' && (
            <div className="space-y-6">
              {/* Option A: Auto Create */}
              <div className="p-5 rounded-2xl border-2 border-emerald-300 bg-emerald-50/50 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <Plus className="w-5 h-5 text-emerald-600" />
                  Pilihan 1: Buat Spreadsheet Baru Otomatis (Rekomendasi)
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sistem akan membuat Google Spreadsheet resmi dengan 4 sheet sesuai PRD:
                  <br />
                  <strong>1. ABSENSI</strong> (Data kehadiran & link tanda tangan)
                  <br />
                  <strong>2. KEGIATAN</strong> (Master kegiatan & jam batas terlambat)
                  <br />
                  <strong>3. INSTANSI</strong> (Master instansi untuk dropdown)
                  <br />
                  <strong>4. CONFIG</strong> (Konfigurasi aplikasi)
                </p>

                <button
                  onClick={handleCreateAutoSpreadsheet}
                  disabled={isCreatingSheet}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  {isCreatingSheet ? 'Sedang Membuat Spreadsheet...' : 'Buat Spreadsheet Baru Sekarang'}
                </button>
              </div>

              {/* Option B: Connect Existing */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <Link2 className="w-5 h-5 text-slate-600" />
                  Pilihan 2: Hubungkan Spreadsheet yang Sudah Ada
                </div>
                <p className="text-xs text-slate-500">
                  Masukkan ID Google Spreadsheet atau URL lengkapnya jika Anda sudah memiliki spreadsheet sendiri:
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualSheetId}
                    onChange={(e) => setManualSheetId(e.target.value)}
                    placeholder="Contoh: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms atau paste URL"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                  <button
                    onClick={handleConnectManual}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition-colors"
                  >
                    Hubungkan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: APPS SCRIPT CODE */}
          {activeTab === 'script' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                <strong className="block text-slate-800 font-semibold mb-1">
                  Arsitektur Web App & Apps Script (PRD Section 3 & 28)
                </strong>
                Anda dapat memasang script ini di Google Sheets agar form absensi dapat menerima data secara langsung dari browser mana pun tanpa memerlukan login Google peserta.
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-60 leading-relaxed">
                  {APPS_SCRIPT_CODE}
                </pre>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
                    setCopiedScript(true);
                    setTimeout(() => setCopiedScript(false), 2000);
                  }}
                  className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-medium border border-slate-700 transition-colors"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedScript ? 'Tersalin!' : 'Salin Script'}
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">Langkah Pasang:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                  <li>Buka Google Spreadsheet &rarr; Menu <strong>Extensions (Ekstensi)</strong> &rarr; <strong>Apps Script</strong>.</li>
                  <li>Hapus kode yang ada, lalu tempel kode script di atas &rarr; Simpan (Ctrl+S).</li>
                  <li>Klik <strong>Deploy (Terapkan)</strong> &rarr; <strong>New deployment (Penerapan baru)</strong>.</li>
                  <li>Pilih jenis <strong>Web App</strong>. Set "Execute as: Me" dan "Who has access: Anyone".</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

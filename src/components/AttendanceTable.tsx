import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  EyeOff,
  Trash2,
  Calendar,
  Building,
  CheckCircle,
  Clock,
  Printer,
  PenLine,
  X,
  FileSpreadsheet,
  Settings,
} from 'lucide-react';
import type { AttendanceRecord, Kegiatan, Instansi, SignatureSettings } from '../types/attendance';
import { exportAttendanceToExcel } from '../services/excelExport';
import { ConfirmModal } from './ConfirmModal';
import { PrintableF4Sheet } from './PrintableF4Sheet';
import { SignatureConfigModal } from './SignatureConfigModal';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  kegiatanList: Kegiatan[];
  instansiList: Instansi[];
  onDeleteRecord: (id: string) => Promise<void>;
  signatureSettings?: SignatureSettings;
  onUpdateSignatureSettings?: (newSettings: SignatureSettings) => void;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records,
  kegiatanList,
  instansiList,
  onDeleteRecord,
  signatureSettings,
  onUpdateSignatureSettings,
}) => {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKegiatan, setFilterKegiatan] = useState('ALL');
  const [filterInstansi, setFilterInstansi] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [showMaskedAccounts, setShowMaskedAccounts] = useState(true);

  // Modals
  const [recordToDelete, setRecordToDelete] = useState<AttendanceRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isF4PreviewOpen, setIsF4PreviewOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  // Filter logic
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Search
      const search = searchTerm.toLowerCase().trim();
      const matchSearch =
        !search ||
        r.nama.toLowerCase().includes(search) ||
        (r.noTelepon && r.noTelepon.toLowerCase().includes(search)) ||
        r.noRekening.toLowerCase().includes(search) ||
        r.instansi.toLowerCase().includes(search) ||
        r.jabatan.toLowerCase().includes(search) ||
        r.id.toLowerCase().includes(search) ||
        r.namaKegiatan.toLowerCase().includes(search);

      if (!matchSearch) return false;

      // Kegiatan
      if (filterKegiatan !== 'ALL' && r.kegiatanId !== filterKegiatan && r.namaKegiatan !== filterKegiatan) {
        return false;
      }

      // Instansi
      if (filterInstansi !== 'ALL' && r.instansi !== filterInstansi) {
        return false;
      }

      // Status
      if (filterStatus !== 'ALL' && r.status !== filterStatus) {
        return false;
      }

      // Date range (parse DD/MM/YYYY to YYYY-MM-DD for comparison)
      if (filterDateFrom || filterDateTo) {
        const parts = r.tanggal.split('/');
        if (parts.length === 3) {
          const recDateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          if (filterDateFrom && recDateStr < filterDateFrom) return false;
          if (filterDateTo && recDateStr > filterDateTo) return false;
        }
      }

      return true;
    });
  }, [records, searchTerm, filterKegiatan, filterInstansi, filterStatus, filterDateFrom, filterDateTo]);

  const [isExporting, setIsExporting] = useState(false);
  const activeSelectedKegiatan = kegiatanList.find((k) => k.id === filterKegiatan);

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await exportAttendanceToExcel({
        kegiatan: activeSelectedKegiatan,
        records: filteredRecords,
        signatureSettings: signatureSettings,
      });
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteRecord(recordToDelete.id);
      setRecordToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const maskAccount = (acc: string) => {
    if (!showMaskedAccounts) return acc;
    if (!acc) return '-';
    const match = acc.match(/(\d+)/);
    if (!match) return acc;
    const digits = match[1];
    if (digits.length <= 4) return acc;
    const maskedDigits = '•••• ' + digits.slice(-4);
    return acc.replace(digits, maskedDigits);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama peserta, rekening, instansi, jabatan, atau ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Account Privacy Toggle */}
            <button
              type="button"
              onClick={() => setShowMaskedAccounts(!showMaskedAccounts)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition-colors ${
                showMaskedAccounts
                  ? 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}
              title="Toggle sensor nomor rekening untuk privasi"
            >
              {showMaskedAccounts ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showMaskedAccounts ? 'Sensor Rekening: ON' : 'Sensor Rekening: OFF'}</span>
            </button>

            {/* Pengaturan Penandatangan Button */}
            <button
              type="button"
              onClick={() => setIsSignatureModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors border border-slate-600"
              title="Atur Nama Penanggung Jawab, Panitia, NIP, dan Tempat Tanggal"
            >
              <Settings className="w-3.5 h-3.5 text-emerald-400" />
              <span>Atur TTD & Panitia</span>
            </button>

            {/* Preview & Print Button */}
            <button
              type="button"
              onClick={() => setIsF4PreviewOpen(true)}
              disabled={filteredRecords.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Pratinjau / Cetak</span>
            </button>

            {/* Export Excel Button */}
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={filteredRecords.length === 0 || isExporting}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
            >
              <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'Menyiapkan Excel...' : 'Download Excel (.xlsx)'}</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Kegiatan */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Filter Kegiatan
            </label>
            <select
              value={filterKegiatan}
              onChange={(e) => setFilterKegiatan(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none"
            >
              <option value="ALL">Semua Kegiatan ({records.length})</option>
              {kegiatanList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Instansi */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Filter Instansi
            </label>
            <select
              value={filterInstansi}
              onChange={(e) => setFilterInstansi(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none"
            >
              <option value="ALL">Semua Instansi</option>
              {instansiList.map((ins) => (
                <option key={ins.id} value={ins.nama}>
                  {ins.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Status Kehadiran */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Filter Status Kehadiran
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="Tepat Waktu">Tepat Waktu</option>
              <option value="Terlambat">Terlambat</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Filter Rentang Tanggal
            </label>
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-800 outline-none"
              />
              <span className="text-slate-400">-</span>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-800 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Filter Summary & Notice */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 pt-1 gap-1">
          <div>
            Menampilkan <strong className="text-slate-900">{filteredRecords.length}</strong> peserta.{' '}
            <span className="text-emerald-700 font-medium">
              Format lembar absen cetak otomatis siap diunduh.
            </span>
          </div>
          {(searchTerm || filterKegiatan !== 'ALL' || filterInstansi !== 'ALL' || filterStatus !== 'ALL' || filterDateFrom || filterDateTo) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterKegiatan('ALL');
                setFilterInstansi('ALL');
                setFilterStatus('ALL');
                setFilterDateFrom('');
                setFilterDateTo('');
              }}
              className="text-emerald-600 hover:text-emerald-700 font-semibold self-start sm:self-auto"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/90 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200 tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-20">No & ID</th>
                <th className="py-3.5 px-4">Nama Peserta</th>
                <th className="py-3.5 px-4">No. Telepon / WA</th>
                <th className="py-3.5 px-4">Nomor Rekening</th>
                <th className="py-3.5 px-4">Instansi & Jabatan</th>
                <th className="py-3.5 px-4">Kegiatan</th>
                <th className="py-3.5 px-4 text-center">Jam Datang</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Tanda Tangan</th>
                <th className="py-3.5 px-4 text-right w-16">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-14 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <FileSpreadsheet className="w-10 h-10 text-slate-300 mb-2 stroke-1" />
                      <p className="font-semibold text-slate-700">Tidak ada data absensi ditemukan</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Sesuaikan kata kunci pencarian atau filter di atas
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* ID */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 text-xs">#{idx + 1}</div>
                      <div className="font-mono text-[11px] text-slate-500">{r.id}</div>
                    </td>

                    {/* Nama */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 leading-snug">{r.nama}</div>
                      {r.keterangan && (
                        <div className="text-[11px] text-slate-400 italic">{r.keterangan}</div>
                      )}
                    </td>

                    {/* Nomor Telepon / WA */}
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-800">
                      {r.noTelepon ? (
                        <a
                          href={`https://wa.me/${r.noTelepon.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1 font-medium"
                          title="Hubungi via WhatsApp"
                        >
                          {r.noTelepon}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* Rekening */}
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                      {maskAccount(r.noRekening)}
                    </td>

                    {/* Instansi & Jabatan */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 text-xs">{r.instansi}</div>
                      <div className="text-[11px] text-slate-500">{r.jabatan}</div>
                    </td>

                    {/* Kegiatan */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="text-xs text-slate-800 font-medium truncate" title={r.namaKegiatan}>
                        {r.namaKegiatan}
                      </div>
                      <div className="text-[11px] text-slate-400">{r.tanggal}</div>
                    </td>

                    {/* Waktu */}
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-700 text-center">
                      {r.jam} WIB
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          r.status === 'Tepat Waktu'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>

                    {/* Tanda Tangan Manual Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                        <PenLine className="w-3.5 h-3.5 text-slate-500" />
                        <span>Kolom #{idx + 1}</span>
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setRecordToDelete(r)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Hapus data absensi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable F4 Sheet Modal */}
      {isF4PreviewOpen && (
        <PrintableF4Sheet
          isOpen={isF4PreviewOpen}
          kegiatan={activeSelectedKegiatan}
          records={filteredRecords}
          signatureSettings={signatureSettings}
          onUpdateSignatureSettings={onUpdateSignatureSettings}
          onClose={() => setIsF4PreviewOpen(false)}
        />
      )}

      {/* Signature & Penanggung Jawab Config Modal */}
      {isSignatureModalOpen && (
        <SignatureConfigModal
          isOpen={isSignatureModalOpen}
          settings={signatureSettings}
          defaultLocation={activeSelectedKegiatan?.lokasi}
          defaultDate={activeSelectedKegiatan?.tanggal}
          onSave={(newSettings) => {
            if (onUpdateSignatureSettings) {
              onUpdateSignatureSettings(newSettings);
            }
          }}
          onClose={() => setIsSignatureModalOpen(false)}
        />
      )}

      {/* Delete Confirmation Modal (Google Workspace safe requirement) */}
      <ConfirmModal
        isOpen={!!recordToDelete}
        title="Hapus Data Absensi Peserta?"
        description={
          recordToDelete
            ? `Apakah Anda yakin ingin menghapus catatan absensi untuk "${recordToDelete.nama}" (${recordToDelete.id})? Data yang dihapus tidak dapat dipulihkan.`
            : ''
        }
        confirmLabel="Hapus Data"
        cancelLabel="Batal"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setRecordToDelete(null)}
      />
    </div>
  );
};

import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  QrCode,
  Edit2,
  Trash2,
  Clock,
  MapPin,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  Radio,
} from 'lucide-react';
import type { Kegiatan, EventStatus } from '../types/attendance';
import { QRCodeModal } from './QRCodeModal';
import { ConfirmModal } from './ConfirmModal';

interface EventsManagerProps {
  kegiatanList: Kegiatan[];
  onSaveKegiatan: (kegiatan: Kegiatan) => Promise<void>;
  onDeleteKegiatan: (id: string) => Promise<void>;
  onSelectEventForAttendance: (id: string) => void;
  onOpenLiveScreen?: (id: string) => void;
}

export const EventsManager: React.FC<EventsManagerProps> = ({
  kegiatanList,
  onSaveKegiatan,
  onDeleteKegiatan,
  onSelectEventForAttendance,
  onOpenLiveScreen,
}) => {
  const [selectedQrKegiatan, setSelectedQrKegiatan] = useState<Kegiatan | null>(null);
  const [editingKegiatan, setEditingKegiatan] = useState<Kegiatan | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [kegiatanToDelete, setKegiatanToDelete] = useState<Kegiatan | null>(null);

  // Form State
  const [formId, setFormId] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formTanggal, setFormTanggal] = useState('');
  const [formLokasi, setFormLokasi] = useState('');
  const [formJamMulai, setFormJamMulai] = useState('08:00');
  const [formJamSelesai, setFormJamSelesai] = useState('16:00');
  const [formBatasTerlambat, setFormBatasTerlambat] = useState('08:30');
  const [formStatus, setFormStatus] = useState<EventStatus>('Aktif');
  const [formDeskripsi, setFormDeskripsi] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const openAddModal = () => {
    const nextNum = kegiatanList.length + 1;
    const newId = `KGT${String(nextNum).padStart(3, '0')}`;
    setFormId(newId);
    setFormNama('');
    setFormTanggal(new Date().toISOString().split('T')[0]);
    setFormLokasi('');
    setFormJamMulai('08:00');
    setFormJamSelesai('16:00');
    setFormBatasTerlambat('08:30');
    setFormStatus('Aktif');
    setFormDeskripsi('');
    setEditingKegiatan(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (k: Kegiatan) => {
    setFormId(k.id);
    setFormNama(k.nama);
    setFormTanggal(k.tanggal);
    setFormLokasi(k.lokasi);
    setFormJamMulai(k.jamMulai || '08:00');
    setFormJamSelesai(k.jamSelesai || '16:00');
    setFormBatasTerlambat(k.batasTerlambat || '08:30');
    setFormStatus(k.status);
    setFormDeskripsi(k.deskripsi || '');
    setEditingKegiatan(k);
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formLokasi.trim()) return;

    setIsSaving(true);
    try {
      const item: Kegiatan = {
        id: formId,
        nama: formNama.trim(),
        tanggal: formTanggal,
        lokasi: formLokasi.trim(),
        jamMulai: formJamMulai,
        jamSelesai: formJamSelesai,
        batasTerlambat: formBatasTerlambat,
        status: formStatus,
        deskripsi: formDeskripsi.trim(),
      };
      await onSaveKegiatan(item);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Kelola Daftar Kegiatan</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin dapat menambah kegiatan baru, mengatur batas waktu, status buka/tutup, dan membuat QR Code.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Kegiatan Baru
        </button>
      </div>

      {/* Grid of Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kegiatanList.map((k) => (
          <div
            key={k.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all p-5 flex flex-col justify-between"
          >
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {k.id}
                </span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    k.status === 'Aktif'
                      ? 'bg-emerald-100 text-emerald-800'
                      : k.status === 'Ditutup'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {k.status}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-bold text-slate-900 text-sm line-clamp-2 mb-2 leading-snug">
                {k.nama}
              </h3>

              {k.deskripsi && (
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{k.deskripsi}</p>
              )}

              {/* Info Rows */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{k.tanggal}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{k.lokasi}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {k.jamMulai || '08:00'} - {k.jamSelesai || '16:00'} WIB (Batas: {k.batasTerlambat || '08:30'})
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedQrKegiatan(k)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold transition-colors"
                  title="Lihat / Download QR Code Absensi"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR Code</span>
                </button>

                {onOpenLiveScreen && (
                  <button
                    onClick={() => onOpenLiveScreen(k.id)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-900 text-emerald-400 hover:bg-slate-800 font-semibold transition-colors"
                    title="Buka Layar Siaran Langsung (QR + Tabel Kehadiran Live)"
                  >
                    <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>Live</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(k)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Edit data kegiatan"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onSelectEventForAttendance(k.id)}
                  className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="Buka Form Absensi Kegiatan ini"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setKegiatanToDelete(k)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Hapus kegiatan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingKegiatan ? 'Edit Data Kegiatan' : 'Tambah Kegiatan Baru'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    ID Kegiatan
                  </label>
                  <input
                    type="text"
                    required
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Status Kegiatan
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as EventStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Aktif">Aktif (Bisa Absen)</option>
                    <option value="Ditutup">Ditutup (Absensi Dikunci)</option>
                    <option value="Terjadwal">Terjadwal (Belum Dibuka)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nama Kegiatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pelatihan Pelayanan Kesehatan Digital"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Tanggal Pelaksanaan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Lokasi / Ruangan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Aula Utama Lt. 3"
                    value={formLokasi}
                    onChange={(e) => setFormLokasi(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    value={formJamMulai}
                    onChange={(e) => setFormJamMulai(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    value={formJamSelesai}
                    onChange={(e) => setFormJamSelesai(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Batas Tepat Waktu
                  </label>
                  <input
                    type="time"
                    value={formBatasTerlambat}
                    onChange={(e) => setFormBatasTerlambat(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Deskripsi / Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan singkat materi atau instruksi bagi peserta..."
                  value={formDeskripsi}
                  onChange={(e) => setFormDeskripsi(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Kegiatan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={!!selectedQrKegiatan}
        kegiatan={selectedQrKegiatan}
        onClose={() => setSelectedQrKegiatan(null)}
        onOpenLiveScreen={onOpenLiveScreen}
      />

      {/* Delete Confirmation Modal (Google Workspace safe requirement) */}
      <ConfirmModal
        isOpen={!!kegiatanToDelete}
        title="Hapus Kegiatan?"
        description={
          kegiatanToDelete
            ? `Apakah Anda yakin ingin menghapus kegiatan "${kegiatanToDelete.nama}" (${kegiatanToDelete.id})? Peserta tidak akan bisa lagi memilih kegiatan ini.`
            : ''
        }
        confirmLabel="Hapus Kegiatan"
        isDestructive={true}
        onConfirm={async () => {
          if (kegiatanToDelete) {
            await onDeleteKegiatan(kegiatanToDelete.id);
            setKegiatanToDelete(null);
          }
        }}
        onCancel={() => setKegiatanToDelete(null)}
      />
    </div>
  );
};

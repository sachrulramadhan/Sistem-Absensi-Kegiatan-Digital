import React, { useState, useMemo } from 'react';
import {
  Building,
  Plus,
  Trash2,
  Edit2,
  X,
  CheckCircle,
  XCircle,
  Search,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import type { Instansi } from '../types/attendance';
import { ConfirmModal } from './ConfirmModal';

interface InstansiManagerProps {
  instansiList: Instansi[];
  onSaveInstansi: (item: Instansi) => Promise<void>;
  onDeleteInstansi: (id: string) => Promise<void>;
  onResetDefaults?: () => Promise<void>;
}

const getCategory = (name: string): string => {
  if (name.startsWith('RS') || name.startsWith('RSU') || name.startsWith('RSIA')) return 'Rumah Sakit';
  if (name.startsWith('Kecamatan')) return 'Kecamatan';
  if (name.startsWith('Kelurahan')) return 'Kelurahan';
  if (name.startsWith('TP. PKK')) return 'TP. PKK';
  if (name.startsWith('Bidang') || name.startsWith('Puskesmas') || name.includes('Kluster')) return 'Bidang & Faskes';
  if (
    ['Gizi', 'Promkes', 'Rujukan', 'Pelayanan Primer', 'P2', 'Surveilans', 'Kesling', 'Farmasi', 'Keuangan', 'Perencanaan'].includes(name)
  ) return 'Program & Unit';
  return 'OPD & Lembaga';
};

export const InstansiManager: React.FC<InstansiManagerProps> = ({
  instansiList,
  onSaveInstansi,
  onDeleteInstansi,
  onResetDefaults,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Instansi | null>(null);
  const [instansiToDelete, setInstansiToDelete] = useState<Instansi | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Search & Category Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const [formId, setFormId] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [isSaving, setIsSaving] = useState(false);

  const categories = [
    'Semua',
    'Rumah Sakit',
    'Kecamatan',
    'Kelurahan',
    'TP. PKK',
    'Bidang & Faskes',
    'Program & Unit',
    'OPD & Lembaga',
  ];

  const filteredList = useMemo(() => {
    return instansiList.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());
      const cat = getCategory(item.nama);
      const matchCategory = selectedCategory === 'Semua' || cat === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [instansiList, searchQuery, selectedCategory]);

  const openAdd = () => {
    const nextNum = instansiList.length + 1;
    setFormId(`INS${String(nextNum).padStart(3, '0')}`);
    setFormNama('');
    setFormStatus('Aktif');
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: Instansi) => {
    setFormId(item.id);
    setFormNama(item.nama);
    setFormStatus(item.status);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) return;

    setIsSaving(true);
    try {
      await onSaveInstansi({
        id: formId,
        nama: formNama.trim(),
        status: formStatus,
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmReset = async () => {
    if (onResetDefaults) {
      await onResetDefaults();
      setIsResetConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Master Data Instansi & Jabatan</h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {instansiList.length} Terdaftar
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar 62 instansi, rumah sakit, kecamatan, kelurahan, dan jabatan resmi se-Kota Palu untuk pilihan absensi digital.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onResetDefaults && (
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0"
              title="Reset ke daftar 62 instansi resmi"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Resmi (62)</span>
            </button>
          )}
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0 ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4" />
            Tambah Instansi
          </button>
        </div>
      </div>

      {/* Search & Category Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama instansi (RSU Undata, Kecamatan, Kelurahan, dsb)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {categories.map((cat) => {
            const count =
              cat === 'Semua'
                ? instansiList.length
                : instansiList.filter((i) => getCategory(i.nama) === cat).length;
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Instansi List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Menampilkan <strong className="text-slate-900">{filteredList.length}</strong> dari{' '}
            {instansiList.length} instansi
          </span>
          {searchQuery && (
            <span>
              Filter: &ldquo;<strong>{searchQuery}</strong>&rdquo;
            </span>
          )}
        </div>

        {filteredList.length === 0 ? (
          <div className="p-8 text-center">
            <Building className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Tidak ada instansi yang cocok</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Coba sesuaikan kata kunci pencarian atau kategori filter
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto">
            {filteredList.map((ins, idx) => {
              const cat = getCategory(ins.nama);

              return (
                <div
                  key={ins.id}
                  className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900 text-sm truncate">{ins.nama}</h3>
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                          {ins.id}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60 shrink-0">
                          {cat}
                        </span>
                      </div>
                      <span
                        className={`inline-block text-[10px] font-semibold mt-0.5 ${
                          ins.status === 'Aktif' ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      >
                        ● {ins.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(ins)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit instansi"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setInstansiToDelete(ins)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus instansi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm Reset Defaults Modal */}
      {isResetConfirmOpen && (
        <ConfirmModal
          isOpen={isResetConfirmOpen}
          title="Reset ke Daftar Resmi Kota Palu?"
          description="Tindakan ini akan mengembalikan seluruh daftar instansi ke 62 daftar resmi Pemerintah Kota Palu (Direktur Rumah Sakit, Camat, Lurah, Ketua TP. PKK, Kepala Bidang, Koordinator, dsb)."
          confirmLabel="Ya, Reset Daftar"
          cancelLabel="Batal"
          onConfirm={handleConfirmReset}
          onCancel={() => setIsResetConfirmOpen(false)}
        />
      )}

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingItem ? 'Edit Data Instansi' : 'Tambah Instansi Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  ID Instansi
                </label>
                <input
                  type="text"
                  required
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nama Instansi / Dinas / Puskesmas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dinas Kesehatan Provinsi"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  <option value="Aktif">Aktif (Tampil di Dropdown)</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Instansi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!instansiToDelete}
        title="Hapus Instansi?"
        description={
          instansiToDelete
            ? `Apakah Anda yakin ingin menghapus "${instansiToDelete.nama}" (${instansiToDelete.id}) dari master data?`
            : ''
        }
        confirmLabel="Hapus Instansi"
        isDestructive={true}
        onConfirm={async () => {
          if (instansiToDelete) {
            await onDeleteInstansi(instansiToDelete.id);
            setInstansiToDelete(null);
          }
        }}
        onCancel={() => setInstansiToDelete(null)}
      />
    </div>
  );
};

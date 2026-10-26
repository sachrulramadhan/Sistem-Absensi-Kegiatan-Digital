import type { AttendanceRecord, Kegiatan, Instansi, AppConfig, AttendanceStatus } from '../types/attendance';

const STORAGE_KEYS = {
  ATTENDANCE: 'absensi_records_v2',
  KEGIATAN: 'absensi_kegiatan_v2',
  INSTANSI: 'absensi_instansi_v4',
  CONFIG: 'absensi_config_v2',
};

const DEFAULT_CONFIG: AppConfig = {
  namaAplikasi: 'Sistem Absensi Kegiatan Digital',
  spreadsheetId: '',
  spreadsheetName: 'ABSENSI KEGIATAN DIGITAL',
  driveFolderId: '',
  driveFolderName: 'Absensi - Arsip Tanda Tangan',
  adminEmail: 'porto.projectcreative@gmail.com',
  statusSistem: 'Aktif',
  adminPin: '1234',
  signatureSettings: {
    tempatTanggal: 'Jakarta, 24 Oktober 2026',
    judulKiri: 'Mengetahui,',
    jabatanKiri: 'Penanggung Jawab Acara,',
    namaKiri: '',
    nipKiri: '',
    jabatanKanan: 'Ketua Panitia Pelaksana,',
    namaKanan: '',
    nipKanan: '',
  },
};

const DEFAULT_KEGIATAN: Kegiatan[] = [
  {
    id: 'KGT001',
    nama: 'Pelatihan Program Pelayanan Kesehatan Digital',
    tanggal: '2026-10-24',
    lokasi: 'Aula Utama Dinas Lt. 3',
    jamMulai: '08:00',
    jamSelesai: '12:00',
    batasTerlambat: '08:30',
    status: 'Aktif',
    deskripsi: 'Pelatihan teknis pencatatan data dan rekapitulasi kesehatan berbasis digital.',
  },
  {
    id: 'KGT002',
    nama: 'Rapat Koordinasi Evaluasi Wilayah & Akuntabilitas',
    tanggal: '2026-10-25',
    lokasi: 'Ruang Rapat Melati Gedung B',
    jamMulai: '09:00',
    jamSelesai: '14:00',
    batasTerlambat: '09:30',
    status: 'Aktif',
    deskripsi: 'Evaluasi berkala capaian program triwulan dan serapan anggaran.',
  },
  {
    id: 'KGT003',
    nama: 'Workshop Transformasi Tata Kelola Administrasi',
    tanggal: '2026-10-26',
    lokasi: 'Ballroom Grand Hotel & Convention',
    jamMulai: '08:30',
    jamSelesai: '16:00',
    batasTerlambat: '09:00',
    status: 'Terjadwal',
    deskripsi: 'Peningkatan kapasitas aparatur sipil dalam transformasi tata kelola modern.',
  },
];

export const OFFICIAL_INSTANSI_NAMES: string[] = [
  // 1. Organisasi Perangkat Daerah & Instansi Vertikal
  'Bappeda',
  'Dinas Pendidikan dan Pengajaran Kota Palu',
  'Dinas Kependudukan dan Kelurga Berencana Kota Palu',
  'BPJS',
  'Kementerian Agama Kota Palu',

  // 2. Rumah Sakit (Hanya Nama Instansi)
  'RSU. Undata',
  'RSU. Anutapura',
  'RSU. Madani',
  'RS. Samaritan',
  'RS. Budi Agung',
  'RS. Wood Ward',
  'RS. Bhayangkara',
  'RS. Sindhu Trisnu',
  'RS. Alkhairat',
  'RSIA. Nasanapura',
  'RSIA. Care She',
  'RSIA. Tinatapura',
  'RS. Universitas Tadulako',

  // 3. Pemerintah Kecamatan (Hanya Nama Instansi)
  'Kecamatan Palu Selatan',
  'Kecamatan Palu Timur',
  'Kecamatan Palu Barat',
  'Kecamatan Palu Utara',
  'Kecamatan Mantikulore',
  'Kecamatan Tawaeli',
  'Kecamatan Ulujadi',
  'Kecamatan Tatanga',

  // 4. TP. PKK Kecamatan (Hanya Nama Lembaga/Organisasi)
  'TP. PKK Kecamatan Palu Selatan',
  'TP. PKK Kecamatan Palu Timur',
  'TP. PKK Kecamatan Palu Barat',
  'TP. PKK Kecamatan Palu Utara',
  'TP. PKK Kecamatan Mantikulore',
  'TP. PKK Kecamatan Tawaeli',
  'TP. PKK Kecamatan Ulujadi',
  'TP. PKK Kecamatan Tatanga',

  // 5. Bidang & Puskesmas (Hanya Nama Unit / Faskes)
  'Bidang Pelayanan Kesehatan',
  'Bidang SDMK',
  'Bidang P2',
  'Puskesmas se-Kota Palu',
  'Kluster 2 / KIA Puskesmas',

  // 6. Program & Unit Kerja
  'Gizi',
  'Promkes',
  'Rujukan',
  'Pelayanan Primer',
  'P2',
  'Surveilans',
  'Kesling',
  'Farmasi',
  'Keuangan',
  'Perencanaan',

  // 7. Pemerintah Kelurahan (Hanya Nama Instansi)
  'Kelurahan Duyu',
  'Kelurahan Nunu',
  'Kelurahan Kabonena',
  'Kelurahan Silae',
  'Kelurahan Buluri',
  'Kelurahan Donggala Kodi',
  'Kelurahan Petobo',
  'Kelurahan Balaroa',
  'Kelurahan Tondo',
  'Kelurahan Tatura Selatan',
  'Kelurahan Tatura Utara',

  // 8. Organisasi Profesi & Tim Kerja
  'IBI Kota Palu',
  'Tim Kerja Kesehatan Keluarga',
];

export const DEFAULT_INSTANSI: Instansi[] = OFFICIAL_INSTANSI_NAMES.map((nama, idx) => ({
  id: `INS${String(idx + 1).padStart(3, '0')}`,
  nama,
  status: 'Aktif',
}));

// Seed sample attendance for immediate rich demo
const SAMPLE_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'ABS-20261024-0001',
    timestamp: '24/10/2026 07:54:12',
    nama: 'Dr. Hendra Wijaya, M.Kes',
    noTelepon: '081234567890',
    noRekening: '1240009876543 (Bank Mandiri)',
    namaBank: 'Bank Mandiri',
    instansi: 'Dinas Kesehatan Provinsi',
    jabatan: 'Kepala Bidang Pelayanan Kesehatan',
    kegiatanId: 'KGT001',
    namaKegiatan: 'Pelatihan Program Pelayanan Kesehatan Digital',
    tanggal: '24/10/2026',
    jam: '07:54:12',
    keterangan: 'Hadir Tepat Waktu',
    tandaTanganUrl: '',
    status: 'Tepat Waktu',
    syncedToGoogleSheets: false,
  },
  {
    id: 'ABS-20261024-0002',
    timestamp: '24/10/2026 08:08:45',
    nama: 'Siti Rahmawati, S.Tr.Keb',
    noTelepon: '085712345678',
    noRekening: '5320198821 (BCA)',
    namaBank: 'BCA',
    instansi: 'Puskesmas Kecamatan Gambir',
    jabatan: 'Koordinator KIA & KB',
    kegiatanId: 'KGT001',
    namaKegiatan: 'Pelatihan Program Pelayanan Kesehatan Digital',
    tanggal: '24/10/2026',
    jam: '08:08:45',
    keterangan: 'Hadir Tepat Waktu',
    tandaTanganUrl: '',
    status: 'Tepat Waktu',
    syncedToGoogleSheets: false,
  },
  {
    id: 'ABS-20261024-0003',
    timestamp: '24/10/2026 08:38:19',
    nama: 'Bambang Prasetyo, S.Kom',
    noTelepon: '081398765432',
    noRekening: '028391823719001 (BRI)',
    namaBank: 'BRI',
    instansi: 'Bappeda / Litbang',
    jabatan: 'Analis Sistem Informasi',
    kegiatanId: 'KGT001',
    namaKegiatan: 'Pelatihan Program Pelayanan Kesehatan Digital',
    tanggal: '24/10/2026',
    jam: '08:38:19',
    keterangan: 'Terlambat (Tugas luar persiapan)',
    tandaTanganUrl: '',
    status: 'Terlambat',
    syncedToGoogleSheets: false,
  },
];

export function getAppConfig(): AppConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
      return DEFAULT_CONFIG;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      signatureSettings: {
        ...DEFAULT_CONFIG.signatureSettings!,
        ...(parsed.signatureSettings || {}),
      },
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveAppConfig(cfg: AppConfig): void {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(cfg));
}

export function getKegiatanList(): Kegiatan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.KEGIATAN);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.KEGIATAN, JSON.stringify(DEFAULT_KEGIATAN));
      return DEFAULT_KEGIATAN;
    }
    const list = JSON.parse(raw);
    return Array.isArray(list) && list.length > 0 ? list : DEFAULT_KEGIATAN;
  } catch {
    return DEFAULT_KEGIATAN;
  }
}

export function saveKegiatanList(list: Kegiatan[]): void {
  localStorage.setItem(STORAGE_KEYS.KEGIATAN, JSON.stringify(list));
}

export function getInstansiList(): Instansi[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INSTANSI);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INSTANSI, JSON.stringify(DEFAULT_INSTANSI));
      return DEFAULT_INSTANSI;
    }
    const list = JSON.parse(raw);
    if (
      !Array.isArray(list) ||
      list.length < 20 ||
      list.some(
        (i: Instansi) =>
          typeof i?.nama === 'string' &&
          (i.nama.startsWith('Direktur ') ||
            i.nama.startsWith('Camat ') ||
            i.nama.startsWith('Lurah ') ||
            i.nama.startsWith('Koordinator '))
      )
    ) {
      // Auto-upgrade to clean pure institution names
      localStorage.setItem(STORAGE_KEYS.INSTANSI, JSON.stringify(DEFAULT_INSTANSI));
      return DEFAULT_INSTANSI;
    }
    return list;
  } catch {
    return DEFAULT_INSTANSI;
  }
}

export function resetToDefaultInstansi(): Instansi[] {
  localStorage.setItem(STORAGE_KEYS.INSTANSI, JSON.stringify(DEFAULT_INSTANSI));
  return DEFAULT_INSTANSI;
}

export function saveInstansiList(list: Instansi[]): void {
  localStorage.setItem(STORAGE_KEYS.INSTANSI, JSON.stringify(list));
}

export function getAttendanceRecords(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(SAMPLE_ATTENDANCE));
      return SAMPLE_ATTENDANCE;
    }
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

// BroadcastChannel instance for real-time cross-tab synchronization
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('absensi_live_broadcast_v2');
  }
} catch (e) {
  console.warn('BroadcastChannel not supported in this environment', e);
}

export function subscribeToAttendance(callback: (records: AttendanceRecord[]) => void): () => void {
  const handleLocal = (e: Event) => {
    const custom = e as CustomEvent<AttendanceRecord[]>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getAttendanceRecords());
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEYS.ATTENDANCE) {
      callback(getAttendanceRecords());
    }
  };

  const handleBroadcast = (e: MessageEvent) => {
    if (e.data && e.data.type === 'ATTENDANCE_UPDATED') {
      callback(e.data.records || getAttendanceRecords());
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('absensi_local_update', handleLocal);
    window.addEventListener('storage', handleStorage);
  }

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('absensi_local_update', handleLocal);
      window.removeEventListener('storage', handleStorage);
    }
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
  };
}

/**
 * Synthesizes a soft, pleasant notification chime for new arrivals using Web Audio API
 */
export function playArrivalChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.45);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.1); // A5
    gain2.gain.setValueAtTime(0.15, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.7);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

export function saveAttendanceRecords(records: AttendanceRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }

  // Notify current window
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('absensi_local_update', { detail: records })
    );
  }

  // Notify other tabs/windows
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({
        type: 'ATTENDANCE_UPDATED',
        records,
      });
    } catch (e) {
      console.warn('Broadcast channel postMessage error:', e);
    }
  }
}


/**
 * Checks for duplicate attendance:
 * Nama (case-insensitive) + No Rekening (clean digits) + Kegiatan ID + Tanggal
 */
export function checkDuplicateAttendance(
  nama: string,
  noRekening: string,
  kegiatanId: string,
  tanggal: string
): AttendanceRecord | null {
  const records = getAttendanceRecords();
  const cleanNama = nama.trim().toLowerCase();
  const cleanRek = noRekening.replace(/\D/g, '');

  const found = records.find((r) => {
    const rNama = r.nama.trim().toLowerCase();
    const rRek = r.noRekening.replace(/\D/g, '');
    const isSameKegiatan = r.kegiatanId === kegiatanId || r.namaKegiatan.toLowerCase().includes(kegiatanId.toLowerCase());
    const isSameDate = r.tanggal === tanggal;

    // Matches if both name and account match for this event on this date
    if (cleanRek && rRek) {
      return (rNama === cleanNama || rRek === cleanRek) && isSameKegiatan && isSameDate;
    }
    return rNama === cleanNama && isSameKegiatan && isSameDate;
  });

  return found || null;
}

/**
 * Generates an automatic Attendance ID:
 * Format: ABS-YYYYMMDD-XXXX (e.g. ABS-20261024-0004)
 */
export function generateAttendanceId(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const records = getAttendanceRecords();
  const prefix = `ABS-${dateStr}-`;
  const todayCount = records.filter((r) => r.id.startsWith(prefix)).length + 1;
  const seq = String(todayCount).padStart(4, '0');

  return `${prefix}${seq}`;
}

/**
 * Formats current date and time
 */
export function getCurrentDateTimeFormatted(): {
  timestamp: string;
  tanggal: string;
  jam: string;
} {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');

  return {
    timestamp: `${d}/${m}/${y} ${hh}:${mm}:${ss}`,
    tanggal: `${d}/${m}/${y}`,
    jam: `${hh}:${mm}:${ss}`,
  };
}

/**
 * Calculates whether attendee is on time or late based on event schedule
 */
export function determineAttendanceStatus(
  kegiatan?: Kegiatan,
  currentDate: Date = new Date()
): AttendanceStatus {
  if (!kegiatan || !kegiatan.batasTerlambat) {
    return 'Tepat Waktu';
  }

  try {
    const [tHour, tMin] = kegiatan.batasTerlambat.split(':').map(Number);
    const limitMinutes = tHour * 60 + (tMin || 0);

    const curMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();
    if (curMinutes > limitMinutes) {
      return 'Terlambat';
    }
    return 'Tepat Waktu';
  } catch {
    return 'Tepat Waktu';
  }
}

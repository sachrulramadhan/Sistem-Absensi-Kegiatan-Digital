export type AttendanceStatus = 'Tepat Waktu' | 'Terlambat' | 'Izin' | 'Tugas Luar';

export interface AttendanceRecord {
  id: string; // e.g. ABS-20261024-0001
  timestamp: string; // e.g. 24/10/2026 08:14:32
  nama: string;
  noTelepon: string;
  noRekening: string;
  namaBank?: string;
  instansi: string;
  jabatan: string;
  kegiatanId: string;
  namaKegiatan: string;
  tanggal: string; // e.g. 24/10/2026
  jam: string; // e.g. 08:14:32
  keterangan: string;
  tandaTanganUrl?: string; // Optional / manual signature on printed F4 sheet
  driveFileId?: string;
  status: AttendanceStatus;
  syncedToGoogleSheets?: boolean;
}

export type EventStatus = 'Aktif' | 'Ditutup' | 'Terjadwal';

export interface Kegiatan {
  id: string; // e.g. KGT001
  nama: string;
  tanggal: string; // e.g. 2026-10-24
  lokasi: string;
  jamMulai?: string; // e.g. 08:00
  jamSelesai?: string; // e.g. 12:00
  batasTerlambat?: string; // e.g. 08:30
  status: EventStatus;
  deskripsi?: string;
}

export interface Instansi {
  id: string; // e.g. INS001
  nama: string;
  status: 'Aktif' | 'Nonaktif';
}

export interface SignatureSettings {
  tempatTanggal: string; // e.g. "Jakarta, 24 Oktober 2026"
  // Penanggung Jawab (Kiri)
  judulKiri: string; // e.g. "Mengetahui,"
  jabatanKiri: string; // e.g. "Penanggung Jawab Acara,"
  namaKiri: string; // e.g. "Dr. Hendra Wijaya, M.Kes"
  nipKiri: string; // e.g. "19750101 200003 1 002"

  // Panitia Pelaksana (Kanan)
  jabatanKanan: string; // e.g. "Ketua Panitia Pelaksana,"
  namaKanan: string; // e.g. "Budi Santoso, S.Kom, M.M."
  nipKanan: string; // e.g. "19820512 200502 1 001"
}

export interface AppConfig {
  namaAplikasi: string;
  spreadsheetId: string;
  spreadsheetName?: string;
  driveFolderId: string;
  driveFolderName?: string;
  adminEmail: string;
  statusSistem: 'Aktif' | 'Maintenance';
  adminPin: string; // default e.g. "1234"
  signatureSettings?: SignatureSettings;
}

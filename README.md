# Sistem Absensi Digital & Live Monitoring Kegiatan

Aplikasi presensi digital modern berbasis web untuk kegiatan pemerintahan, seminar, pelatihan, dan rapat dinas. Dilengkapi dengan **Layar Live Monitoring real-time (proyektor/videotron)**, pencatatan otomatis, master data 62 instansi/faskes Kota Palu, integrasi Google Workspace (Sheets & Drive), dan ekspor cetak lembar tanda tangan ukuran F4 (Folio).

---

## ✨ Fitur Utama

1. **Layar Live Monitoring (Mode Proyektor / Videotron)**:
   - Tampilan bersih, putih, dan modern (*clean white theme*).
   - Sisi Kiri: Barcode QR Kegiatan dinamis + info lokasi/waktu + ringkasan kehadiran (Total Hadir, Tepat Waktu, Terlambat) + preview peserta terakhir tiba.
   - Sisi Kanan: Tabel absensi *real-time* (No, Nama, Instansi/Asal, Jam Datang, Status Kehadiran).
   - Efek animasi sorot hijau lembut dan bunyi *chime* otomatis saat ada peserta baru masuk.
   - Tombol pembesar Barcode QR layar penuh untuk aula besar / auditorium.

2. **Formulir Presensi Peserta Cepat**:
   - Pindai barcode menggunakan kamera ponsel tanpa perlu instalasi aplikasi tambahan.
   - Input lengkap: Nama + Gelar, No. WhatsApp, Rekening & Bank (untuk transport/honorarium), Instansi/Asal, Jabatan, Keterangan Kehadiran.
   - Master data 62 instansi terkelompok rapi (Rumah Sakit, Kecamatan, Kelurahan, TP. PKK, Bidang, Puskesmas, dsb) dengan filter pencarian instan.
   - Bukti resi kehadiran digital yang dapat disimpan atau diunduh.

3. **Panel Admin & Manajemen**:
   - Proteksi keamanan menggunakan PIN Admin (default: `1234`).
   - Manajemen Kegiatan (Tambah, edit, tutup, atau jadwalkan kegiatan).
   - Manajemen Master Data Instansi & Jabatan (Dilengkapi tombol *Reset Resmi 62 Instansi*).
   - Cetak lembar tanda tangan manual ukuran kertas F4 / Folio standar kedinasan dengan konfigurasi penandatangan (Pihak Penanggung Jawab & Panitia Pelaksana).
   - Unduh rekapitulasi file Microsoft Excel (`.xlsx`).

4. **Integrasi Google Workspace**:
   - Sinkronisasi otomatis ke Google Sheets.
   - Pembuatan folder Google Drive otomatis untuk arsip.

---

## 🚀 Panduan Instalasi & Menjalankan Lokal

### Prasyarat
- [Node.js](https://nodejs.org/) versi 18 ke atas
- `npm` atau `bun`

### Langkah Menjalankan:
```bash
# 1. Clone repositori ini
git clone <URL_REPOSITORI_ANDA>
cd <NAMA_FOLDER>

# 2. Pasang dependensi
npm install

# 3. Jalankan server pengembangan lokal
npm run dev
```
Buka browser di `http://localhost:3000` (atau port yang ditampilkan di terminal).

---

## 🛠️ Build untuk Produksi

```bash
# Build aplikasi untuk deployment
npm run build

# Menjalankan preview hasil build produksi
npm run preview
```

Hasil build akan berada di direktori `dist/` dan siap di-deploy ke Cloudflare Pages, Vercel, Netlify, Firebase Hosting, atau VPS Anda.

---

## 📄 Lisensi
Hak Cipta © 2026 - Dikembangkan untuk efisiensi dan transparansi kegiatan digital.

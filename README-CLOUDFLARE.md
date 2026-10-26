# Panduan Deployment ke Cloudflare Pages

Aplikasi Absensi & Cetak Format F4 ini berbasis **React 19 + Vite** (Single Page Application / Static Site). Format ini sangat cocok dan 100% didukung secara native oleh **Cloudflare Pages** (gratis, cepat, dan otomatis HTTPS).

---

## Konfigurasi yang Sudah Disiapkan:
1. `public/_redirects`: Memastikan routing SPA berjalan lancar (`/* /index.html 200`) sehingga jika halaman direfresh tidak muncul error 404.
2. `public/_headers`: Header keamanan (`X-Frame-Options`, `Permissions-Policy: camera=*` untuk scanner QR).
3. `wrangler.toml`: Konfigurasi resmi Cloudflare Pages untuk deployment via CLI.
4. Perintah `npm run build`: Menghasilkan folder statis `dist/`.

---

## Cara 1: Menghubungkan lewat GitHub / GitLab (Paling Direkomendasikan)
Jika kode aplikasi Anda diupload ke GitHub:

1. Buka dashboard Cloudflare: [dash.cloudflare.com](https://dash.cloudflare.com/)
2. Masuk ke menu **Workers & Pages** > klik **Create application** > pilih tab **Pages** > klik **Connect to Git**.
3. Pilih repository GitHub Anda.
4. Pada bagian **Build settings**, masukkan konfigurasi berikut:
   - **Framework preset**: `Vite` (atau `None`)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. (Opsional) Pada bagian **Environment variables**:
   - Jika Anda menggunakan Google Sheets Sync / Firebase, tambahkan variabel lingkungan yang relevan (seperti `VITE_GOOGLE_API_KEY`, `VITE_SPREADSHEET_ID`, dll).
6. Klik **Save and Deploy**.
7. Selesai! Setiap kali Anda melakukan `git push`, Cloudflare Pages akan otomatis meng-update web Anda.

---

## Cara 2: Deploy Langsung via Terminal (Wrangler CLI)
Jika Anda ingin deploy langsung dari laptop/komputer tanpa menghubungkan GitHub:

1. Pastikan Anda sudah login ke Cloudflare di terminal:
   ```bash
   npx wrangler login
   ```
2. Jalankan perintah build & deploy:
   ```bash
   npm run deploy
   ```
   *(Atau secara manual: `npm run build` lalu `npx wrangler pages deploy dist`)*
3. Masukkan nama project (misal: `absen-f4`), pilih akun Cloudflare Anda.
4. Cloudflare akan mengunggah folder `dist` dan langsung memberikan link URL website aktif (misal `https://absen-f4.pages.dev`).

---

## Catatan Fitur:
- **Izin Kamera (Scanner QR)**: Cloudflare Pages otomatis menyediakan sertifikat SSL/HTTPS, sehingga izin kamera (`navigator.mediaDevices.getUserMedia`) untuk scan QR Code absensi dapat langsung berjalan lancar di browser HP maupun Laptop.
- **Ekspor Excel & Cetak F4**: Berjalan 100% di sisi browser pengguna (*client-side* via ExcelJS), tidak membutuhkan server backend khusus.

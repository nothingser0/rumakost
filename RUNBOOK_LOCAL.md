# Menjalankan RumaKost secara lokal

## Prasyarat

- Windows, macOS, atau Linux.
- Node.js 24.x dan npm. Catat versi lokal dengan `node -v` dan `npm -v`; `package.json` menetapkan Node 24.x sesuai FSD.
- Git untuk clone dan pembaruan repository.

Untuk halaman login, siapkan variabel Auth dan secret cookie SDK pada `.env.local` sebelum menjalankan aplikasi. Database dan storage tetap dibutuhkan pada task integrasinya.

## Instalasi dan startup

Dari folder repository:

```powershell
npm install
npm run dev
```

Script `dev` memakai Webpack (`next dev --webpack`). Server lokal tersedia di `http://localhost:3000`; biarkan terminal berjalan dan hentikan dengan Ctrl+C. Jika port 3000 sedang terpakai, jalankan `npm run dev -- --port 3001`.

Pada Windows yang dipakai saat scaffold, binary SWC native gagal dimuat dan Next.js memakai WASM. Webpack tetap menyiapkan server; peringatan SWC dapat muncul di terminal. Jangan mengubah konfigurasi provider atau menambahkan dependency untuk mengatasinya tanpa task/keputusan terkait.

## Environment dan secret

Modul `src/lib/env.ts` memvalidasi environment server saat diimpor. Siapkan `.env.local` untuk branch Neon yang dipakai dan jangan membuat resource berbayar; gunakan project/branch demo yang disetujui Owner.

| Variabel | Cara mendapat/menetapkan nilai | Catatan |
|---|---|---|
| `DATABASE_URL` | Di Neon Console pilih project dan branch, buka **Connect**, lalu salin connection string dengan **Pooled connection** aktif. | URL pooled untuk runtime server. |
| `DIRECT_URL` | Salin connection string dari **Connect** yang sama dengan **Pooled connection** tidak aktif. | URL direct untuk migrasi Prisma; server-only. |
| `NEON_AUTH_BASE_URL` | Aktifkan Neon Auth pada branch yang dipakai; ambil Auth URL dari pengaturan branch. Neon CLI `neon env pull` juga dapat menarik variabel branch ke `.env.local` setelah project di-link. | URL berbeda per branch. Jangan memakai URL branch lain. |
| `NEON_AUTH_COOKIE_SECRET` | Buat sendiri di terminal: `node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('base64url'))"`; tulis output langsung ke `.env.local`. | Secret penandatangan cache sesi server SDK, bukan secret Auth milik Neon; minimal 32 karakter. Jangan kirim ke chat atau commit. |
| `NEON_STORAGE_ENDPOINT`, `NEON_STORAGE_ACCESS_KEY`, `NEON_STORAGE_SECRET_KEY` | Buat private bucket pada branch Neon sesuai FSD. Setelah storage diprovisi, CLI menulis `AWS_ENDPOINT_URL_S3`, `AWS_ACCESS_KEY_ID`, dan `AWS_SECRET_ACCESS_KEY` ke `.env.local`; salin nilai masing-masing ke variabel aplikasi dengan nama di kolom kiri. | Jangan kirim nilai ke chat atau commit. |
| `APP_ORIGIN` | Tetapkan sendiri: `http://localhost:3000` untuk pengembangan lokal; gunakan origin HTTPS deployment pada environment live. | Dipakai untuk pemeriksaan origin/redirect sesuai FSD. |
| `CRON_SECRET` | Buat secret baru di komputer sendiri dengan Node.js: `node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('base64url'))"`. Simpan output langsung ke `.env.local`. | Minimal 16 karakter acak; jangan gunakan ulang password atau memasukkan output ke chat. |

Salin `.env.example` menjadi `.env.local` dan isi file itu langsung di mesin sendiri atau secret manager. `.env.local` diabaikan Git. Jangan commit, tempel secret ke chat, atau membaca nilainya untuk verifikasi. Prisma CLI memuat `.env.local` melalui konfigurasi root `prisma.config.ts` dan memakai `DIRECT_URL` untuk migrasi.

Di Neon Console, nonaktifkan pendaftaran publik untuk Auth branch ini; pembuatan akun dilakukan Owner melalui alur manajemen akun. Aplikasi hanya meneruskan pembacaan sesi dan menangani masuk/keluar lewat server. Endpoint signup, reset sandi, OTP, dan 2FA tidak termasuk scope.

## Command yang tersedia

| Command | Fungsi |
|---|---|
| `npm run dev` | Server pengembangan dengan Webpack |
| `npm run lint` | ESLint |
| `npm run typecheck` | Pemeriksaan TypeScript tanpa output build |
| `npm run test -- auth` | Test policy dan validasi task autentikasi |
| `npm run build` | Build Next.js |
| `npm run start` | Menjalankan hasil build produksi lokal |

Command migrasi, seed, dan test belum dikonfigurasi. Jalankan command hanya setelah task TODO terkait menambah dan mendokumentasikannya.

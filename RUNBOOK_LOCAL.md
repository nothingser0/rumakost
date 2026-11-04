# Menjalankan RumaKost secara lokal

RumaKost menggunakan Better Auth yang menyimpan identitas dan sesi di Neon PostgreSQL melalui Prisma. Pendaftaran publik tidak tersedia. Email aktivasi dan reset memakai adapter server; pengirim email belum dipilih, jadi alur email live belum siap.

## Prasyarat

- Windows, macOS, atau Linux.
- Node.js 24.x dan npm. Catat versi lokal dengan `node -v` dan `npm -v`; `package.json` menetapkan Node 24.x.
- Git untuk clone dan pembaruan repository.

## Instalasi dan startup

Dari folder repository:

```powershell
npm install
npm run dev
```

Script `dev` lebih dahulu menjalankan `prisma generate` tanpa koneksi database, lalu memakai Webpack (`next dev --webpack`). Server lokal tersedia di `http://localhost:3000`; biarkan terminal berjalan dan hentikan dengan Ctrl+C. Jika port 3000 sedang terpakai, jalankan `npm run dev -- --port 3001` dan samakan `APP_ORIGIN` serta `BETTER_AUTH_URL`.

Pada Windows yang dipakai saat scaffold, binary SWC native gagal dimuat dan Next.js memakai WASM. Webpack tetap menyiapkan server; peringatan SWC dapat muncul di terminal. Jangan mengubah konfigurasi provider atau menambahkan dependency untuk mengatasinya tanpa task/keputusan terkait.

## Environment dan secret

Salin `.env.example` menjadi `.env.local`, lalu isi file itu langsung di mesin sendiri atau secret manager. Jangan kirim nilainya ke chat atau commit. `.env.local` diabaikan Git.

| Variabel | Cara mendapat/menetapkan nilai | Catatan |
|---|---|---|
| `DATABASE_URL` | Di Neon Console pilih project dan branch, buka **Connect**, lalu salin connection string dengan **Pooled connection** aktif. | URL pooled untuk runtime server. Gunakan branch yang memang dipilih untuk pengembangan. |
| `DIRECT_URL` | Salin connection string dari **Connect** yang sama dengan **Pooled connection** tidak aktif. | URL direct untuk migrasi Prisma; server-only. |
| `BETTER_AUTH_URL` | Tetapkan ke origin aplikasi: `http://localhost:3000` untuk lokal atau origin HTTPS aplikasi untuk live. | Harus sama dengan origin `APP_ORIGIN`; jangan menambahkan path. |
| `BETTER_AUTH_SECRET` | Buat di terminal dengan `node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('base64url'))"`. | Secret minimal 32 karakter; simpan hanya di `.env.local`/secret provider. Bukan secret yang didapat dari Neon. |
| `NEON_STORAGE_ENDPOINT`, `NEON_STORAGE_REGION`, `NEON_STORAGE_BUCKET`, `NEON_STORAGE_ACCESS_KEY`, `NEON_STORAGE_SECRET_KEY` | Buat bucket privat pada branch Neon yang sama. Petakan `AWS_ENDPOINT_URL_S3`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, dan `AWS_SECRET_ACCESS_KEY` dari Neon. Isi nama bucket privat pada `NEON_STORAGE_BUCKET`. | Tiga nilai kredensial bersifat rahasia; jangan kirim atau commit. |
| `APP_ORIGIN` | Tetapkan `http://localhost:3000` untuk lokal atau origin HTTPS deployment untuk live. | Harus sama dengan `BETTER_AUTH_URL`; dipakai untuk pemeriksaan origin. |
| `CRON_SECRET` | Buat secret acak lokal dengan perintah Node di atas. | Minimal 16 karakter; jangan gunakan ulang password. |

Auth dan database tetap server-only. Jangan gunakan kredensial atau fixture akun nyata untuk demo; gunakan data sintetis.

## Migrasi dan akun

Verifier M06-AUTH-05 membuat branch Neon schema-only dan database kosong, menerapkan seluruh migration Prisma, menjalankan suite `auth-provider`, lalu menghapus branch tersebut. Jalankan dengan project ID dan branch induk yang tepat:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-auth-provider-disposable.ps1 -ProjectId <project-id> -ParentBranch dev
```

Verifier menolak jika variabel koneksi/auth sudah ada di environment proses, tidak memuat `.env.local`, dan tidak mencetak connection string atau secret. Jangan jalankan `npm run db:migrate` untuk branch aktif sebagai bagian dari verifikasi ini. Perintah migrasi biasa memakai `DIRECT_URL` dari `.env.local` dan mengubah database pada branch yang dituju; perubahan ke branch aktif memerlukan task dan arahan Owner tersendiri.

`npm run db:bootstrap-owner` hanya menyiapkan identitas Owner berstatus belum terverifikasi dan tanpa kredensial. Akun itu belum dapat login. Jangan jalankan sampai alur aktivasi akun serta pengiriman email diselesaikan pada task lanjutan dan target database dipastikan.

Untuk membuat tiga akun awal demo di Neon branch `dev`, pastikan Neon CLI sudah login dan URL pada `.env.local` menunjuk ke branch tersebut. Perintah berikut membandingkan project/branch dengan `DATABASE_URL` pooled dan `DIRECT_URL`; script berhenti bila target tidak cocok:

```powershell
npm run db:bootstrap-demo -- --project-id floral-wind-91503829 --branch dev
```

Script membuat satu Owner demo, satu Staff, dan satu Penghuni dengan alamat sintetis `.test`, menandai hanya akun awal demo itu sebagai terverifikasi, lalu menguji login dan mencabut session uji. Password acak ditulis ke variabel `RUMAKOST_DEMO_*_PASSWORD` di `.env.local`; email login ada di variabel `RUMAKOST_DEMO_*_EMAIL`. Buka `.env.local` di mesin sendiri untuk melihatnya. Jangan salin nilai password ke chat atau commit file tersebut.

Akun yang dibuat Owner/Staff melalui aplikasi tetap belum terverifikasi sampai penerima menyelesaikan aktivasi lewat email. Scope MVP memiliki satu Owner: Owner dapat membuat Staff dan Penghuni, sedangkan Staff dapat membuat Penghuni. Pengiriman email live belum dikonfigurasi sampai M07. Signup publik tetap nonaktif.

## Command yang tersedia

| Command | Fungsi |
|---|---|
| `npm run dev` | Server pengembangan dengan Webpack |
| `npm run db:generate` | Membuat Prisma Client dari schema lokal tanpa menghubungi database |
| `npm run lint` | ESLint |
| `npm run typecheck` | Pemeriksaan TypeScript tanpa output build |
| `npm run test -- auth` | Test validasi input login |
| `npm run test -- auth-provider` | Suite integrasi; hanya jalankan melalui verifier disposable di atas |
| `npm run db:migrate` | Menerapkan migration ke database pada `DIRECT_URL`; hanya setelah target branch dipastikan |
| `npm run db:bootstrap-owner` | Menyiapkan identitas Owner pending; tunggu alur aktivasi dan arahan task lanjutan |
| `npm run db:bootstrap-demo -- --project-id <project-id> --branch dev` | Membuat akun login sintetis awal pada Neon development branch; password hanya ke `.env.local` |
| `npm run build` | Build Next.js |
| `npm run start` | Menjalankan hasil build produksi lokal |

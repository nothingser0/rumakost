# Verifikasi Lokal RumaKost

Status: scaffold tersedia; fitur domain, provider, route MVP, dan rangkaian test belum diimplementasikan. Jangan menafsirkan startup halaman starter sebagai acceptance test produk.

## Identitas sesi verifikasi

Catat tanggal, Node/npm, perubahan working tree, command, exit code, dan output mentah pada task TODO yang diverifikasi. Working tree saat ini dapat berisi perubahan dokumen dan scaffold; jangan menganggap hash commit mewakili perubahan yang diuji.

## Startup scaffold

```powershell
npm run dev
```

Kriteria saat ini: output menunjukkan Next.js siap dan alamat lokal dapat dibuka pada `http://localhost:3000`. `dev` memakai Webpack karena native SWC Windows gagal dimuat di mesin scaffold; rekam peringatan itu jika masih muncul. Pemeriksaan ini hanya membuktikan server starter berjalan.

## Script yang tersedia

| Command | Kriteria | Status |
|---|---|---|
| `npm run lint` | ESLint selesai dengan exit code 0 | Belum dijalankan untuk task ini |
| `npm run build` | Build Next.js selesai dengan exit code 0 | Belum dijalankan untuk task ini |
| `npm run dev` | Server siap dan tetap berjalan sampai dihentikan | Sudah mencapai Ready pada 2026-10-31; lihat Evidence M06-SETUP-01 |

Belum ada script test, typecheck, migrasi, seed, atau route smoke. Jangan mencatat hasil atau status lulus untuk command yang belum tersedia/dijalankan.

## Verifikasi fitur setelah implementasi

Untuk tiap task M06, gunakan `Verify` dari baris task tersebut dan simpan output mentahnya. Route yang ditetapkan Sitemap aktif perlu probe langsung dengan status yang diharapkan; 404 pada route aktif adalah blocker. Verifikasi akses harus mencakup kasus yang ditolak untuk role lain dan kepemilikan Tenant. Enam walkthrough penerimaan berada di `docs/design/SCENARIOS_E2E_WALKTHROUGH.md`; pelaksanaannya menunggu task test M06.

## Privasi dan rendering

- Gunakan data sintetis; jangan capture atau commit data pengguna nyata.
- Periksa browser console untuk error runtime dan hydration saat route produk tersedia. Atribut dari ekstensi browser harus dibedakan dari mismatch yang berasal dari aplikasi.
- Periksa tampilan mobile/desktop, keyboard/focus, state loading/empty/error/success, dan kesesuaian dengan `DESIGN.md` sesuai task terkait.

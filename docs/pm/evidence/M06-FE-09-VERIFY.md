# M06-FE-09 — Topbar dan Navigasi Role (Verify Evidence)

## Informasi Task
- **Task ID**: `M06-FE-09`
- **Komponen**: `CMP-08: Topbar Navigation Shell` (`M06-UI-TOPBAR`)
- **File Utama**: `src/components/layout/topbar.tsx`, `src/components/layout/topbar.module.css`
- **Test File**: `tests/topbar/topbar.test.mjs`
- **Prasyarat**: `M06-FE-02–05` (Button, Input, Badge, PopoverSelect)
- **Sumber Spesifikasi**: `docs/specs/COMPONENT_REQUIREMENTS.md` (CMP-08), `docs/design/SITEMAP.md` §1, `docs/specs/DESIGN_SPEC.md`, `DESIGN.md` §1 & §4

---

## Ringkasan Implementasi

1. **Struktur Navigasi Desktop (Estify Horizontal Pill Navbar)**:
   - Floating rounded shell: `max-width: 1440px`, `height: 70px`, `border-radius: var(--radius-2xl, 24px)`, `box-shadow: 0 4px 20px rgba(0,0,0,0.04)`, `position: sticky; top: 20px; z-index: var(--z-sticky-nav, 10);`.
   - Brand Group: Ikon SVG Kunci Rumah 34×34 (`#FF7A00`) + Wordmark `RumaKost` (font Poppins 700 18px).
   - Capsule Pill Container: Latar `var(--bg-canvas, #F7F8FA)`, border `var(--border-subtle, #ECEEF2)`, pill aktif berlatar solid `#111111` dengan teks putih (18.72:1 WCAG AAA), pill inaktif teks `#71717A` dengan hover `#111111`.

2. **Refleksi Izin Server 3 Peran (Zero Client Simulator Exploits)**:
   - **Pemilik (Owner)**:
     - 7 Pil Navigasi Desktop: `Dashboard` (`/dashboard`), `Kamar` (`/kamar`), `Penghuni` (`/penghuni`), `Tagihan` (`/tagihan`), `Pembayaran` (`/pembayaran`), `Laporan` (`/laporan`), `Tiket` (`/tiket`).
     - Menu Avatar: `/profil` (Profil & Ganti Sandi), `/pengaturan/akun` (Kelola Pengguna), `/aktivitas` (Audit Trail), tombol/form `Keluar Akun`.
     - Mobile Bottom Bar (Maks 5 Tombol Jempol): `Beranda`, `Kamar`, `Tagihan`, `Tiket`, `Lainnya` (membuka menu popup untuk rute sekunder).
   - **Staf Operasional (Staff)**:
     - 5 Pil Navigasi Desktop: `Dashboard` (`/dashboard`), `Kamar` (`/kamar`), `Penghuni` (`/penghuni`), `Tagihan` (`/tagihan`), `Tiket` (`/tiket`).
     - Tampilan Bersih: Tanpa badge role redundan pada bilah utama topbar.
     - Isolasi Otorisasi: Rute finansial sensitif `/laporan` **dihilangkan secara mutlak** (Zero Self-Approval).
     - Menu Avatar: `/profil` (Profil & Ganti Sandi), `/pengaturan/akun` (Kelola Penghuni), `Keluar Akun`.
     - Mobile Bottom Bar: `Beranda`, `Kamar`, `Catat Bayar`, `Tiket`, `Profil Staf`.
   - **Penghuni Kost (Tenant)**:
     - 3 Pil Navigasi Desktop: `Beranda Kamar` (`/portal`), `Tagihan Saya` (`/portal/tagihan`), `Tiket Kerusakan` (`/portal/tiket`).
     - Brand target: Otomatis mengarah ke `/portal` (bukan `/dashboard`).
     - Tampilan Bersih: Tanpa badge role redundan pada bilah utama topbar.
     - Isolasi Otorisasi: Seluruh rute manajemen kost (`/dashboard`, `/kamar`, `/penghuni`, `/laporan`, dll.) **dihilangkan secara mutlak**.
     - Menu Avatar: `/portal`, `/portal/tagihan`, `/portal/tiket`, `/portal/profil`, `Keluar Akun`.
     - Mobile Bottom Bar: `Kamar Saya`, `Tagihan`, `Lapor Rusak`, `Akun Saya`.

3. **Utilitas Kanan & Aksesibilitas**:
   - Slide-to-Left Search Box yang melebar halus (240px) dengan keyboard support (Enter submit, Escape close).
   - Notification Bell button dengan unread dot merah dan popover menu notifikasi.
   - User profile dropdown dengan inisial avatar dinamis, nama, email, subtext peran, dan navigasi keyboard.
   - Mobile Bottom Navigation Bar ergonomis dengan target sentuh jempol minimum 44×44 piksel (`DESIGN.md` §4.1).
   - Dukungan Dark Mode otomatis melalui CSS variables (`[data-theme="dark"]`).
   - Kepatuhan Zero-Emoji mutlak: 100% menggunakan SVG geometris Lucide dengan `aria-hidden="true"`, `focusable="false"`.

---

## Verifikasi & Output Mentah

Perintah verifikasi yang dijalankan sesuai `TODO.md`:
```bash
npm run test -- topbar
```

Output mentah:
```text
> rumakost@0.1.0 test
> node scripts/run-tests.mjs topbar

(node:3908) ExperimentalWarning: `--experimental-loader` may be removed in the future; instead use `register()`:
--import 'data:text/javascript,import { register } from "node:module"; import { pathToFileURL } from "node:url"; register("file%3A///D%3A/Workspace/RumaKost/tests/ui-loader.mjs", pathToFileURL("./")); register("file%3A///D%3A/Workspace/RumaKost/tests/ui-loader.mjs", pathToFileURL("./"));'
(Use `node --trace-warnings ...` to show where the warning was created)
✔ normalizes roles safely and case-insensitively (1.2047ms)
✔ extracts clean avatar initials from various user names (0.3047ms)
✔ renders desktop topbar with brand and logo pointing to /dashboard for OWNER (15.4074ms)
✔ renders exactly 7 navigation pills for OWNER and marks active path (4.1594ms)
✔ renders exactly 5 navigation pills for STAFF without role badge (3.6342ms)
✔ STAFF navigation strictly excludes sensitive financial reports (/laporan) (2.5244ms)
✔ renders exactly 3 navigation pills for TENANT and targets /portal for brand (2.5853ms)
✔ TENANT navigation strictly excludes management routes (2.4925ms)
✔ renders right utility items: search, notification bell with unread dot, and user profile (2.4812ms)
✔ renders mobile bottom navigation bar with role-specific items and min 44px targets (4.4003ms)
✔ NavigationShell wraps Topbar and children properly (2.3448ms)
✔ satisfies zero-emoji constraint across all rendered markup (6.6464ms)
ℹ tests 12
ℹ suites 0
ℹ pass 12
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 781.9495
```

---

## File yang Dibuat & Dimodifikasi

1. `src/components/layout/topbar.tsx` (Baru: Komponen `Topbar`, `BottomNav`, `NavigationShell`, helper peran dan utilitas)
2. `src/components/layout/topbar.module.css` (Baru: Gaya CSS modular Estify, responsive mobile, dark mode)
3. `tests/topbar/topbar.test.mjs` (Baru: 12 skenario pengujian unit & integrasi navigasi)
4. `tests/ui-loader.mjs` (Disesuaikan: Resolusi pemetaan `next/link` pada Node ESM loader)
5. `src/app/components/page.tsx` (Disesuaikan: Penambahan bagian showcase interaktif CMP-08 Topbar & Navigasi 3 Peran)
6. `docs/pm/evidence/M06-FE-09-VERIFY.md` (Dokumen evidence ini)

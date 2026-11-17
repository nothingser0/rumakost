# M06-FE-12 — Double Bar Chart (Verify Evidence)

## Informasi Task
- **Task ID**: `M06-FE-12`
- **Komponen**: `CMP-11: Double Bar Chart Widget` (`M06-UI-CHART`)
- **File Utama**: `src/components/dashboard/cashflow-chart.tsx`, `src/components/dashboard/cashflow-chart.module.css`
- **Test File**: `tests/cashflow-chart/cashflow-chart.test.mjs`
- **Prasyarat**: `M06-FE-01` (Token dan fondasi gaya bersama)
- **Sumber Spesifikasi**: `docs/specs/COMPONENT_REQUIREMENTS.md` (CMP-11), `docs/design/screens/WF-02-dashboard.html`, `docs/specs/DESIGN_SPEC.md`, `DESIGN.md` §1 & §4

---

## Ringkasan Implementasi

1. **Konstruksi Grafik Batang Ganda (Estify Double Bar Chart)**:
   - Kartu kontainer: Radius `24px` (`--radius-2xl`), padding `24px`, bayangan halus ambient `0 4px 20px rgba(0,0,0,0.04)`, border `1px solid var(--border-subtle, #ECEEF2)`.
   - Header: Judul kartu ("Arus Kas & Operasional") bersanding dengan legenda status:
     - Dot oranye (`#FF7A00`) untuk **Pemasukan**.
     - Dot hitam/gelap (`#111111`) untuk **Pengeluaran**.
   - Kontrol Header:
     - Popover trigger kapsul pemilih tahun (`Tahun 2026 (Berjalan)`, `Tahun 2025 (Arsip)`, dll.) dengan keyboard accessibility dan dismiss saat klik di luar.
     - Tombol panah melingkar 32px (`.pillArrowBtn`) dengan ikon `arrow-up-right` menuju `/laporan` (`WF-07`).

2. **Dinamika Batang Kapsul & Skala Sumbu Y**:
   - Skala sumbu Y dinamis (`calculateChartScale`) yang menghitung kelipatan interval bulat (misal: 20 Jt, 16 Jt, 12 Jt, 8 Jt, 4 Jt, 0) dengan 5 garis grid putus-putus horizontal (`.chartGridLine`).
   - Batang kapsul membulat penuh (`border-radius: 9999px`) per pasangan bulan dengan tinggi proporsional dan batas minimum 4px untuk visibilitas data positif.
   - Pembedaan bulan berjalan/aktif (`isOrangeActive` & `isDarkActive` dengan bayangan bercahaya lembut).
   - Indikator target pemasukan opsional (`targetIncome`): garis horizontal putus-putus oranye dengan badge nilai kompak (misal: `Pagu Target: Rp 18,00 Jt`).

3. **Interaktivitas Tooltip & Navigasi Keyboard**:
   - Tooltip melayang halus (`.barHoverTooltip`) muncul di atas batang tertinggi kolom saat di-hover kursor atau difokus via keyboard (`tabIndex={0}`, Enter / Space untuk toggle).
   - Isi tooltip: Nama bulan lengkap, rincian Pemasukan (`formatCompactRupiah`), Pengeluaran, dan kalkulasi otomatis Surplus Bersih operasional (hijau jika surplus, merah jika defisit).

4. **Aksesibilitas & Kepatuhan Standar (WCAG 2.2 AA)**:
   - Tabel tersembunyi untuk pembaca layar (`.srOnly` table dengan `<caption>`, `<thead>`, `<tbody>`) menyediakan pembacaan data tabular lengkap (Bulan, Pemasukan, Pengeluaran, Surplus) tanpa bergantung pada visual grafis.
   - Dukungan `prefers-reduced-motion` untuk meniadakan transisi/animasi bagi pengguna sensitif gerak.
   - Dark mode otomatis menggunakan selector `[data-theme="dark"]`.
   - Zero-Emoji: 100% menggunakan SVG geometris murni Lucide (`aria-hidden="true"`).

5. **Penanganan State Lengkap (Default, Empty, Error, Loading)**:
   - **Default State**: 6 bulan historis transaksi (Mei – Okt).
   - **Empty State**: Kotak status ramah dengan ikon BarChart2 saat data kosong (`data.length === 0`).
   - **Error State**: Kotak peringatan bernada merah lembut dengan pesan error spesifik dan tombol interaktif "Coba Lagi".
   - **Loading State**: Shimmer skeleton bars yang mensimulasikan pemuatan data grafik.

---

## Verifikasi & Output Mentah

Perintah verifikasi yang dijalankan sesuai `TODO.md`:
```bash
npm run test -- cashflow-chart
```

Output mentah:
```text
> rumakost@0.1.0 test
> node scripts/run-tests.mjs cashflow-chart

(node:13768) ExperimentalWarning: `--experimental-loader` may be removed in the future; instead use `register()`:
--import 'data:text/javascript,import { register } from "node:module"; import { pathToFileURL } from "node:url"; register("file%3A///D%3A/Workspace/RumaKost/tests/ui-loader.mjs", pathToFileURL("./")); register("file%3A///D%3A/Workspace/RumaKost/tests/ui-loader.mjs", pathToFileURL("./"));'
(Use `node --trace-warnings ...` to show where the warning was created)
✔ formatCompactRupiah formats Indonesian numbers accurately (28.1108ms)
✔ formatAxisLabel formats Y-axis intervals cleanly (0.4492ms)
✔ calculateChartScale computes round stepMax and 6 tick lines (0.8715ms)
✔ CashflowChart renders complete default widget with 6 month columns (21.0531ms)
✔ CashflowChart provides accessible sr-only table for screen readers (9.8786ms)
✔ CashflowChart renders target income line when provided (15.3986ms)
✔ CashflowChart renders empty state when data is empty (2.7853ms)
✔ CashflowChart renders error state and retry action (13.6131ms)
✔ CashflowChart renders skeleton loading state (4.4244ms)
✔ CashflowChart strictly satisfies zero-emoji constraint across all states (46.2137ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1005.0983
```

---

## File yang Dibuat & Dimodifikasi

1. `src/components/dashboard/cashflow-chart.tsx` (Baru: Komponen `CashflowChart`, kalkulasi skala dinamis, formatting Rupiah, aksesibilitas sr-only table)
2. `src/components/dashboard/cashflow-chart.module.css` (Baru: Gaya CSS modular Estify, tooltip melayang, garis grid sumbu Y, empty/error/skeleton states, dark mode)
3. `tests/cashflow-chart/cashflow-chart.test.mjs` (Baru: 10 skenario pengujian unit & integrasi)
4. `src/app/components/page.tsx` (Disesuaikan: Penambahan bagian showcase interaktif CMP-11 dengan mode switcher Default/Target/Empty/Error/Loading)
5. `TODO.md` (Disesuaikan: Menandai `M06-FE-09` sebagai approved oleh Owner dan mencatat bukti verifikasi `M06-FE-12` menanti review Owner)
6. `docs/pm/evidence/M06-FE-12-VERIFY.md` (Dokumen evidence ini)

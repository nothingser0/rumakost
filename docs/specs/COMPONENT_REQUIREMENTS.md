# Component Requirements & Design System Specification: Rumakost

Dokumen spesifikasi ini mendefinisikan seluruh inventaris komponen antarmuka pengguna (UI) untuk Rumakost Multi-Property PMS. Seluruh komponen dirancang dengan mematuhi standar aksesibilitas WCAG 2.2 Level AA, prinsip pertahanan anti-slop, dan kontrak porting komponen signature dari benchmark Estify dengan penomoran sekuensial permanen `CMP-01` sampai `CMP-26`.

---

## Primitives

Komponen tingkat dasar (primitives) bertindak sebagai blok pembangun atomik antarmuka yang membungkus elemen dasar HTML dengan standar aksesibilitas, fokus keyboard terlihat, dan mikro-interaksi taktil.

### 3.1 Primitives (Atomic Components)

| CMP ID | Component Name | Variants | Interactive States | Usage Justification |
|:------:|:---------------|:---------|:-------------------|:--------------------|
| `CMP-01` | `Button` | primary, secondary, destructive, ghost, solid-dark | default, hover (150ms), active (`scale-[0.98]`), focus (`ring-2`), disabled, loading | Aksi formulir, trigger dialog, dan submission transaksi |
| `CMP-02` | `Input` | text, tel, password, search | default, hover, focus (`ring-2`), error, disabled | Input data entry teks di seluruh formulir; font 16px mencegah iOS auto-zoom |
| `CMP-03` | `Textarea` | standard | default, hover, focus, error, disabled | Catatan handover kamar, deskripsi tiket SLA, instruksi khusus |
| `CMP-04` | `Select / PopoverMenu` | custom styled floating popover (zero raw native select) | closed, open, focused, selected, disabled | Pemilihan cabang properti, filter lantai; kontainer rounded-2xl & shadow-dropdown |
| `CMP-05` | `Badge` | neutral, success, warning, destructive, info | default (read-only), hover (khusus interactive/dismissible) | Flag status tagihan (Lunas), kamar (Siap Huni), dan tiket SLA |
| `CMP-06` | `Checkbox / Switch` | custom checkbox, custom radio, toggle switch | unchecked, checked, indeterminate, disabled | Notifikasi WA outbox, auto-billing cron toggle, pilihan metode bayar |
| `CMP-07` | `LoadingSpinner`| sm (16px), md (24px), lg (32px) | animated spin | Indikator proses async pada tombol submit form |
| `CMP-08` | `Icon` | Lucide SVG (stroke-1.75 / 2.0) | default | Petunjuk visual semantik pendamping teks (zero unicode emoji) |
| `CMP-09` | `Avatar` | sm (32px), md (40px), lg (52px), counter badge | default, with image, with initials | Foto profil staf, avatar penghuni di chat thread, counter +N |

- **SubmitButton Rule**: Tombol submit formulir **TIDAK PERNAH** dinonaktifkan dalam kondisi awal (pristine). Tombol tetap dapat diklik untuk memicu validasi instan dan memfokuskan kursor ke input pertama yang bermasalah. Ketika formulir sedang dalam status pengiriman (`isSubmitting`), tombol menampilkan indikator pemuatan spinner berputar dengan debounce untuk mencegah submit ganda.

---

## Composites

Komponen komposit menggabungkan beberapa komponen primitif menjadi pola interaksi yang kaya, reusable, dan siap pakai untuk berbagai alur operasional properti.

### 3.2 Standard Composites

| CMP ID | Component Name | Composition Structure | Usage Justification |
|:------:|:---------------|:----------------------|:--------------------|
| `CMP-10` | `FormField` | Label + Input/Select/Textarea + Error Message (≥13px) + Hint | Wrapper formulir standar terhubung atribut aria-describedby & aria-invalid |
| `CMP-11` | `Card` | CardHeader + CardTitle + CardContent + CardFooter | Kontainer konten kartu ber-radius 24px (`--radius-card`) dan ambient shadow lembut |
| `CMP-12` | `Table` | TableHeader + TableBody + TableRow + TableCell + MobileReflow | Tabel data tabular kamar & invoice; reflow otomatis jadi tumpukan kartu pada <640px |
| `CMP-13` | `Modal` | DialogBackdrop (z-40) + DialogContent (z-50) + DialogClose | Overlay dialog fokus keyboard (focus-trap), tombol ESC, dan backdrop blur |
| `CMP-14` | `ConfirmDialog`| Modal + Icon + Title + Description + Cancel/Confirm Action | Dialog konfirmasi destruktif permanen (wajib ketik HAPUS & isi alasan audit) |
| `CMP-15` | `Toast` | ToastContainer (z-60) + ToastItem + CloseAction | Notifikasi umpan balik; toast error dan mode offline TIDAK PERNAH auto-dismiss |
| `CMP-16` | `EmptyState` | Icon / Illustration + Heading + Description + ActionButton | Tampilan data kosong informatif saat koleksi data belum ada atau filter 0 hasil |
| `CMP-17` | `SearchInput` | Input + SearchIcon + ClearButton | Kolom pencarian unit kamar dan direktori penghuni dengan border rounded-pill |
| `CMP-18` | `PermissionGate` | Role/Permission wrapper | Proteksi visual per-komponen berbasis peran 6-role RBAC |
| `CMP-19` | `SupervisorOverrideModal` | Dialog + PIN/Auth + Reason Textarea | Otorisasi pemilik untuk void transaksi kas atau penghapusan piutang macet |
| `CMP-20` | `AuditActionBadge` | Badge + Tooltip (Author, Timestamp, IP) | Menampilkan identitas staf dan timestamp keabadian audit trail (UU PDP) |

---

## Benchmark Signature Organisms & Domain Composites

Berikut adalah 6 organisme visual signature dan domain composites yang diadaptasi langsung dari benchmark Estify (`01-dashboard-flat.png`, `03-mobile-view.png`, dan `05-logo-style.png`):

### 3.3 Benchmark Organisms & Domain Composites

| CMP ID | Component Name | Source / Benchmark Organism | Composition Structure & Interaction |
|:------:|:---------------|:----------------------------|:------------------------------------|
| `CMP-21` | `HeroOrangePropertyCard` | `notes.md` §4 Organism 2 (`01-dashboard-flat.png`) | Kartu hero gradien oranye (`#FF8A24`–`#F97316`) + foto gedung arsitektur asli + statistik okupansi + circle arrow `↗` |
| `CMP-22` | `RadialTachometerGauge` | `notes.md` §4 Organism 1 (`01-dashboard-flat.png`) | Gauge setengah lingkaran 25 garis jarum memancar (*radial ray ticks*) + pill persentase di tengah (`+12%`, `+15%`, `+40%`) |
| `CMP-23` | `PillNavGroup` | `notes.md` §4 Organism 3 (`01-dashboard-flat.png`) | Topbar navigation pills melayang dengan active dark solid pill Carbon (`#111827`) ber-radius penuh (`9999px`) |
| `CMP-24` | `MediaPropertyCard` | `notes.md` §4 Organism 7 (`01-dashboard-flat.png`) | Kartu kamar berfoto arsitektur asli 16:10 + floating circle arrow button `↗` + status badge + harga sewa IDR |
| `CMP-25` | `BuildingConditionMeters` | `notes.md` §4 Organism 5 (`01-dashboard-flat.png`) | 3 progress bar horizontal bertahap pemantauan kondisi fasilitas + tombol pil hitam solid `[ Maintenance Details ]` |
| `CMP-26` | `CurrencyInput` | Domain-Specific Coliving | Input mata uang Rupiah berbasis `inputmode="numeric"` dengan pemisah ribuan titik tanpa spinner float browser |

---

## WCAG / Accessibility

Standar aksesibilitas Rumakost mematuhi pedoman WCAG 2.2 Level AA secara ketat untuk menjamin keterbacaan, kemudahan navigasi, dan kenyamanan seluruh pengguna sistem termasuk staf lapangan dan lansia.

### 1. Rasio Kontras Warna
- **Teks Utama (Body & Judul)**: Rasio kontras minimal 7.0:1 terhadap latar belakang (Carbon Black `#111827` pada White `#FFFFFF` menghasilkan rasio kontras 17.2:1).
- **Teks Sekunder, Placeholder & Status**: Rasio kontras minimal 4.5:1 terhadap latar belakangnya masing-masing.
- **Border Komponen & Elemen Antarmuka Non-Teks**: Rasio kontras minimal 3.0:1 terhadap latar belakang yang berdampingan (Slate 300 `#CBD5E1` pada White menghasilkan kontras 3.2:1).

### 2. Navigasi Keyboard & Indikator Fokus
- Seluruh elemen interaktif dapat dijangkau dan dioperasikan sepenuhnya melalui navigasi tombol Tab dan Enter/Space.
- Dilarang menghilangkan garis fokus tanpa pengganti (`outline: none` dilarang keras). Semua tombol dan input menggunakan cincin fokus kontras tinggi `focus-visible:ring-2 ring-primary ring-offset-2`.

### 3. Target Sentuh & Viewport Seluler
- Target sentuh minimum berukuran 44px x 44px pada layar sentuh.
- `scroll-padding-bottom` minimal 96px diterapkan pada kontainer halaman formulir agar elemen input yang sedang fokus tidak tertutup oleh keyboard virtual perangkat seluler.
- Dukungan media query `@media (prefers-reduced-motion: reduce)` diterapkan untuk menonaktifkan seluruh animasi transisi bagi pengguna dengan sensitivitas vestibular.

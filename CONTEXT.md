# Konteks Proyek RumaKost

## Tujuan

RumaKost adalah aplikasi web responsif untuk membantu pengelola satu properti kost mengelola kamar, penghuni, kontrak, tagihan, pembayaran, pengeluaran, laporan, dan tiket kerusakan. Proyek ini merupakan portfolio non-komersial. Ukuran keberhasilan adalah enam walkthrough utama dapat diselesaikan dengan akun demo dan data sintetis, tanpa edit database manual.

## Scope MVP

Scope beku terdiri dari tujuh kelompok P0: akses dan peran; manajemen kamar; penghuni dan siklus kontrak; tagihan berulang; pembayaran parsial dan riwayat; pengeluaran dan laporan pemasukan/okupansi; ticketing kerusakan dari penghuni.

Hanya kemampuan yang disetujui dalam `docs/pm/SCOPE_STATEMENT.md` dan `docs/specs/FSD.md` boleh dibuat. Daftar route aktif dan pengecualian yang sudah disetujui dicatat di `TODO.md`. Jika sumber beku bertentangan atau suatu perilaku belum diputuskan, hentikan task terkait dan minta keputusan Owner.

Di luar MVP: banyak properti, marketplace, aplikasi native terpisah, payment gateway atau integrasi bank, WhatsApp/email otomatis, akuntansi/pajak formal, fitur P1/P2, data identitas/rekening/bukti transfer, serta route yang ditandai deferred pada `TODO.md`.

## Peran

| Peran | Batas utama |
|---|---|
| Owner | Mengelola satu properti, akun, data operasional, laporan, serta verifikasi/koreksi pembayaran. |
| Staff | Menangani data operasional yang diizinkan; dapat mencatat pembayaran pending tetapi tidak memverifikasi pembayaran atau melihat laporan finansial. |
| Tenant | Melihat data miliknya, mengajukan check-out, dan mengelola tiket sesuai status lease. Akses pascakontrak bersifat read-only. |

Semua otorisasi dan kepemilikan diperiksa di server. Staff tidak boleh menyetujui pembayaran yang dicatatnya sendiri.

## Data dan privasi

Gunakan fixture sintetis saja. Jangan memasukkan data penghuni/responden nyata, NIK, foto identitas, detail rekening, atau bukti transfer. Jangan mencetak secret, token sesi, signed URL, konten unggahan, atau komentar internal ke log.

## Istilah domain

- **Lease**: kontrak satu Tenant untuk satu kamar dalam satu properti.
- **Invoice**: tagihan dari Lease; komponen sewa dan deposit dibedakan.
- **Deposit escrow**: dana jaminan yang saldonya diturunkan dari ledger, terpisah dari pendapatan sewa.
- **Payment pending**: klaim pembayaran yang belum mengubah saldo sampai diverifikasi Owner.
- **Reversal**: koreksi append-only atas transaksi terverifikasi; transaksi asal tidak dihapus atau ditimpa.
- **Idempotency**: pengulangan operasi yang sama tidak menggandakan efek bisnis.

## Sumber keputusan

Scope dan urutannya: `docs/pm/SCOPE_STATEMENT.md` → `docs/specs/PRD.md` → `docs/specs/FSD.md` → `docs/specs/SITEMAP.md`, `docs/specs/DESIGN_SPEC.md`, `docs/specs/COMPONENT_REQUIREMENTS.md` → `docs/architecture/M05-DATA-API-SPEC-DRAFT.md`. Keputusan teknis tercatat di `docs/architecture/M05-TECHNICAL-SPEC-DRAFT.md`. Artefak M04 yang disetujui ada di `DESIGN.md` dan `docs/design/`.

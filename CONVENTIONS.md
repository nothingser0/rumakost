# Konvensi Pengembangan

## TypeScript dan Next.js

- Pertahankan `strict: true`; jangan melemahkan pemeriksaan tipe atau memakai `any`, type suppression, maupun cast ganda.
- Ikuti API Next.js dari versi yang benar-benar terpasang. Sebelum mengubah kode Next.js, baca panduan relevan di `node_modules/next/dist/docs/` dan perhatikan deprecation.
- Server-first: baca data di server; gunakan Client Component hanya pada leaf yang memerlukan interaksi browser. Hindari nilai nondeterministik saat render awal.
- Gunakan `@/*` untuk alias `src/`. Ikuti pola file dan batas modul di arsitektur serta FSD.
- CSS dan komponen visual mengikuti prototipe M04 dan `DESIGN.md`; stack yang dikunci tidak memakai Tailwind.

## Domain dan integritas

- Gunakan istilah domain di FSD dan `CONTEXT.md`; setiap halaman/aksi harus terlacak ke scope P0 serta task TODO.
- Validasi seluruh input di server. UI bukan kontrol akses; setiap Server Action dan Route Handler mengautentikasi sesi dan memeriksa role serta kepemilikan.
- Gunakan Decimal/NUMERIC untuk uang. Operasi saldo, invoice, lease, deposit, reversal, dan audit mengikuti transaksi, constraint, serta idempotency pada FSD.
- Riwayat finansial/audit bersifat append-only. Koreksi memakai reversal atau event baru, bukan menghapus/mengubah histori.
- Data demo sintetis saja; minimalkan data pribadi dan jangan log secret, token, signed URL, media, atau komentar internal.

## UI dan teks

- Port layar dari prototype M04 dan gunakan token serta komponen bersama dari `DESIGN.md` dan `docs/specs/COMPONENT_REQUIREMENTS.md`.
- Semua tombol/tautan punya aksi nyata; dropdown memakai popover bergaya proyek, bukan `<select>` native tanpa styling.
- Gunakan fokus terlihat, state interaksi dan target sentuh yang memenuhi spesifikasi desain. Hormati `prefers-reduced-motion`.
- Teks produk memakai bahasa Indonesia dan kosakata domain. Jangan tampilkan nama teknologi, kode spec/task, emoji, atau copy placeholder di UI.

## Perubahan dan verifikasi

- Kerjakan satu task TODO per giliran. Jalankan hanya `Verify` task tersebut, simpan output mentah pada Evidence, lalu berhenti untuk review Owner.
- Jangan menambah dependency, route, data model, atau fitur di luar scope tanpa keputusan tercatat.
- Script yang tersedia sekarang tercantum di `package.json`; typecheck, test, migrasi, dan seed baru menjadi command setelah task terkait menambahkannya.

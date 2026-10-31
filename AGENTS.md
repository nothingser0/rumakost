<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Panduan Agen RumaKost

## Urutan kerja

- Gunakan `TODO.md` sebagai antrean. Kerjakan satu task per giliran, jalankan hanya `Verify` task tersebut, catat output mentah sebagai Evidence, lalu berhenti untuk review Owner.
- Jangan menandai task `[x]` atau mengisi persetujuan atas nama Owner. Catat `Approved: <tanggal> by <nama>` hanya setelah Owner menyetujui.
- Jika requirement atau spesifikasi beku saling bertentangan, atau keputusan domain belum ada, berhenti pada task itu dan minta keputusan Owner.

## Sumber dan konteks

- Sebelum mengubah aplikasi, baca bagian relevan `docs/specs/FSD.md`, `docs/specs/PRD.md`, `docs/specs/SITEMAP.md`, `docs/specs/DESIGN_SPEC.md`, `docs/specs/COMPONENT_REQUIREMENTS.md`, serta `CONTEXT.md`, `ARCHITECTURE.md`, dan `DESIGN.md`.
- Scope beku di `docs/pm/SCOPE_STATEMENT.md` dan spesifikasi yang disetujui menjadi batas implementasi. Route deferred dan pengecualian tercatat di `TODO.md`; jangan membuatnya.
- Sebelum menulis kode Next.js, ikuti panduan lokal di `node_modules/next/dist/docs/` sesuai API yang dipakai dan versi terpasang.
- Cocokkan teks produk dengan bahasa Indonesia dan istilah domain. Kode, identifier, nama API/schema, serta command memakai konvensi teknis standar.

## Implementasi

- Server memegang validasi, autentikasi, otorisasi role, kepemilikan resource, serta keputusan state bisnis. UI bukan kontrol keamanan.
- Gunakan hanya fixture sintetis. Secret disimpan pemilik di `.env.local` atau secret provider; jangan meminta, menampilkan, membaca, atau mencatat nilainya.
- Pertahankan TypeScript strict. Hindari `any`, type suppression, `console.log`/`console.debug`, komentar naratif, dead button/link, placeholder content, emoji, dan fitur di luar scope.
- Gunakan komponen serta token visual yang disetujui di M04. Jangan menambah dependency atau mengubah keputusan stack di luar task dan persetujuan tercatat.

# M06-DB-57 Verify — Limiter login per akun

Tanggal: 2026-11-03
Scope: hanya M06-DB-57. Database yang dipakai selama Verify adalah PGlite in-memory dengan fixture sintetis. Tidak ada koneksi Neon, apply migration ke branch proyek, atau pembacaan `.env.local`.

## Prisma validate

Node: `v24.22.2`
`DIRECT_URL` saat validasi: URL PostgreSQL sintetis `localhost:5432/synthetic`.

```text
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.
The schema at prisma\schema.prisma is valid 🚀
```

Exit code: `0`.

## Migration dan perilaku fungsi pada PGlite disposable

Script `node scripts/verify-auth-login-rate-limit.mjs` menerapkan migration dasar `AppUser` dan migration limiter ke database PGlite baru, lalu menjalankan fixture `AppUser` sintetis.

```text
ATOMIC_ROW_LOCKING_SQL_PRESENT=PASS
SLIDING_WINDOW_5_ALLOWED_6TH_DENIED=PASS
EXPIRED_TIMESTAMPS_PRUNED_AND_SLOT_REOPENED=PASS
PROGRESSIVE_DELAY_INCREASES_AND_BLOCKS=PASS
INVALID_DELAY_PARAMETERS_REJECTED=PASS
SUCCESS_RESETS_FAILURE_ESCALATION=PASS
UNKNOWN_APP_USER_FK_REJECTED=PASS
MAX_5_TIMESTAMPS_AND_NO_PII_COLUMNS=PASS
PARALLEL_RESERVATION_CAP=PASS (single disposable PGlite connection)
AUTH_LOGIN_RATE_LIMIT_DB_VERIFY=PASS
```

Exit code: `0`. Uji parallel di atas memakai satu koneksi PGlite, sehingga bukan uji kompetisi antar-sesi PostgreSQL; fungsi memakai `SELECT ... FOR UPDATE` untuk mengunci row akun sebelum memeriksa dan memperbarui jendela.

## Pemeriksaan perubahan

`git diff --check` tidak dapat memeriksa perubahan karena object lama pada `.git` rusak. Output mentah:

```text
warning: in the working copy of 'TODO.md', LF will be replaced by CRLF the next time Git touches it
error: inflate: data stream error (incorrect header check)
error: unable to unpack 6d291c3235e5fa5e25f00ca5c455681fb99633c9 header
error: inflate: data stream error (incorrect header check)
error: unable to unpack 6d291c3235e5fa5e25f00ca5c455681fb99633c9 header
fatal: unable to read 6d291c3235e5fa5e25f00ca5c455681fb99633c9
GIT_DIFF_CHECK_EXIT=128
```

Diagnostik read-only `git fsck --full --no-reflogs` juga exit `1` dengan banyak object blob hilang/rusak. Tidak ada upaya memperbaiki atau mengubah object Git. Pemeriksaan teks tambahan pada `TODO.md`, M05 Data API, schema, migration, dan script Verify menghasilkan `TEXT_WHITESPACE_CHECK=PASS`; ini tidak menggantikan `git diff --check`.

## Hasil

### Follow-up metadata Git (2026-11-03)

Kegagalan `git diff --check` yang dicatat di atas terjadi pada metadata Git lama. `dev` dan `origin/dev` menunjuk commit yang sama, `8cf95b698a4d1e2540944bd832fc137d80580088`. Metadata pengganti berasal dari clone bersih pada commit tersebut; perubahan worktree tetap terlihat setelah index dibangun ulang. Metadata lama dipertahankan di `D:\Workspace\.RumaKost-git-corrupt-backup-20261103-133445`.

Pemeriksaan sesudah pemulihan:

```text
GIT_DIFF_CHECK_EXIT=0
GIT_FSCK_EXIT=0
```

Ini memperbaiki prasyarat Git yang gagal pada Verify awal; schema, migration, dan hasil uji DB-57 tidak berubah. Task tetap menunggu review Owner dan belum diterapkan ke Neon.

Prisma schema, migration, constraint, reservation lima percobaan/60 detik, progressive delay, reset setelah login berhasil, dan relasi akun lulus pada PGlite disposable. Kegagalan awal `git diff --check` sudah diperbaiki; pemeriksaan sesudah pemulihan `git diff --check` dan `git fsck` lulus. Owner menyetujui M06-DB-57 pada 2026-11-03; migration belum diterapkan ke Neon.

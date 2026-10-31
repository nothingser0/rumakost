# Laporan Resolusi Keselarasan M04?M05 ? RumaKost

- **Tanggal:** 2026-10-30
- **Cakupan:** 613 skenario WF-01 sampai WF-12, enam acceptance walkthrough E2E, Frozen Scope M02, PRD, FSD, dan draft ERD/API M05.
- **Metode:** review konsistensi dokumen; tidak menjalankan aplikasi atau mengklaim hasil runtime.
- **Hasil:** temuan benturan scope yang tercatat telah diterapkan ke crosswalk dan spesifikasi. Acceptance walkthrough telah diselaraskan dengan tujuh kelompok P0. Technical sign-off manusia tetap terbuka.

## Rekonsiliasi inventaris

| Runbook | Skenario |
|---|---:|
| WF-01 | 64 |
| WF-02 | 75 |
| WF-03 | 57 |
| WF-04 | 40 |
| WF-05 | 61 |
| WF-06 | 55 |
| WF-07 | 50 |
| WF-08 | 68 |
| WF-09 | 90 |
| WF-10 | 26 |
| WF-11 | 13 |
| WF-12 | 14 |
| **Total** | **613, tanpa ID hilang/duplikat** |

Hasil klasifikasi yang kini tercatat di `SCENARIO_EVALUATION.md`: **498 kandidat P0** dan **115 backlog/out-of-scope**. Angka ini adalah pemetaan scope; bukan pernyataan bahwa semua skenario kompatibel sebagai satu fitur atau telah diuji.

## Perbaikan yang diterapkan

- **Pembayaran:** ditolak jika melebihi saldo invoice terbuka; tidak ada credit balance, refund surplus, transfer ganda sebagai kredit, atau carry-over tunggakan. Reversal Owner tetap P0. Alokasi terverifikasi tetap rent-first lalu deposit.
- **Kontrak dan kamar:** satu Tenant per Lease dan satu kamar per kontrak; roommate, multi-kamar, mutasi kamar, capacity/gender/amenity dinamis, dan kredit karena downgrade diletakkan di backlog.
- **Konfigurasi:** detail rekening bank, builder tata tertib, profil properti editable, dan permission Staff granular diletakkan di backlog/out-of-scope. Role P0 tetap tiga role dengan matriks tetap.
- **Akses Tenant:** setelah kontrak berakhir, histori sendiri tetap dapat dibaca; semua mutasi dan upload baru, termasuk klaim pembayaran, ditolak. Ambang H-3/H+5 dan suspensi karena tunggakan bukan kebijakan P0.
- **Ticketing dan expense:** hanya Tenant pada lease aktif membuat tiket; Owner/Staff mengelola. Expense berdiri sendiri tanpa relasi Ticket. Akun Teknisi, biaya servis tertaut, rating, garansi, dan kebijakan biaya Tenant bukan P0.
- **E2E:** enam alur ditulis ulang mencakup kamar/kontrak/invoice, tagihan parsial, tiket/media, expense/laporan, checkout/deposit/turnover, dan reversal. Bukti transfer/PDF, submeter/biaya tambahan, rekening, Teknisi, multi-kamar, dan klaim biaya otomatis sudah dilepas dari acceptance P0.
- **Status bukti:** seluruh E2E kini berstatus belum dieksekusi. Klaim PASS pada prototipe/runbook M04 tidak diperlakukan sebagai bukti implementasi atau runtime.

## Batas yang harus dipertahankan

M02 tetap sumber scope. Penambahan fitur dari backlog memerlukan perubahan scope yang disetujui pemilik. Enam E2E menjadi acceptance criteria untuk M07 setelah implementasi; belum ada hasil test aplikasi. Stack Opsi A dan keputusan domain yang sebelumnya disetujui tetap tercatat. M05 hanya dapat ditutup setelah review teknis dan sign-off manusia dicatat oleh pemilik.

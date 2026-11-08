"use client";

import { useState } from "react";
import {
  Badge,
  PaymentStatusBadge,
  RoomStatusBadge,
  TicketStatusBadge,
} from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PopoverSelect } from "@/components/ui/popover-select";
import {
  Checkbox,
  CurrencyInput,
  DatePicker,
  Input,
  Radio,
  RadioCard,
  Select,
  Switch,
  Textarea,
} from "@/components/ui/input";

function LockIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="15">
      <rect height="11" rx="2" ry="2" width="18" x="3" y="11" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24" width="15">
      <line x1="12" x2="12" y1="5" y2="19" />
      <line x1="5" x2="19" y1="12" y2="12" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="15">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" x2="16.65" y1="21" y2="16.65" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="15">
      <rect height="16" rx="2" width="20" x="2" y="4" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24" width="14">
      <line x1="7" x2="17" y1="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="14">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="14">
      <line x1="4" x2="4" y1="21" y2="14" />
      <line x1="4" x2="4" y1="10" y2="3" />
      <line x1="12" x2="12" y1="21" y2="12" />
      <line x1="12" x2="12" y1="8" y2="3" />
      <line x1="20" x2="20" y1="21" y2="16" />
      <line x1="20" x2="20" y1="12" y2="3" />
      <line x1="1" x2="7" y1="14" y2="14" />
      <line x1="9" x2="15" y1="8" y2="8" />
      <line x1="17" x2="23" y1="16" y2="16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="12">
      <line x1="18" x2="6" y1="6" y2="18" />
      <line x1="6" x2="18" y1="6" y2="18" />
    </svg>
  );
}

export default function ComponentsShowcasePage() {
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [demoAmount, setDemoAmount] = useState("0");
  const [selectedMethod, setSelectedMethod] = useState("bca");
  const [exportType, setExportType] = useState("pdf");
  const [autoRenew, setAutoRenew] = useState(true);
  const [currencyDemo, setCurrencyDemo] = useState<number | string>(1500000);
  const [selectedFloor, setSelectedFloor] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("current");
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>(["deluxe", "vip"]);

  const toggleDark = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
        padding: "36px 24px",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        {/* Header Bar */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
            paddingBottom: 20,
            borderBottom: "1.5px solid var(--border)",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: "-0.3px" }}>
                RumaKost Component Preview
              </h1>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  backgroundColor: "var(--color-primary-soft, #fff7ed)",
                  color: "var(--color-primary-dark, #c25e00)",
                  padding: "2px 8px",
                  borderRadius: 9999,
                  border: "1px solid var(--brand-primary-border, #ffedd5)",
                }}
              >
                DEV ONLY
              </span>
            </div>
            <p
              style={{
                margin: "4px 0 0",
                color: "var(--muted-foreground)",
                fontSize: 12.5,
              }}
            >
              Pratinjau visual komponen React Next.js langsung dari codebase (akan dihapus sebelum rilis produksi).
            </p>
          </div>

          <Button onClick={toggleDark} size="sm" variant="secondary-ghost">
            {isDark ? "Mode Terang" : "Mode Gelap"}
          </Button>
        </header>

        {/* SECTION 1: BUTTONS */}
        <section
          style={{
            backgroundColor: "var(--surface)",
            border: "1.5px solid var(--border)",
            borderRadius: 18,
            padding: 22,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  margin: "0 0 3px",
                  letterSpacing: "-0.2px",
                }}
              >
                CMP-01: Button Primitive (`src/components/ui/button.tsx`)
              </h2>
              <p style={{ margin: 0, color: "var(--muted-foreground)", fontSize: 12.5 }}>
                Tombol interaktif dengan 6 varian peran, tipografi Poppins 600, dan tactile feedback.
              </p>
            </div>
            <Button
              onClick={() => setIsLoading((prev) => !prev)}
              size="xs"
              variant={isLoading ? "primary-orange" : "secondary-ghost"}
            >
              {isLoading ? "Loading Aktif (Klik untuk Matikan)" : "Uji Status Loading"}
            </Button>
          </div>

          {/* Varian */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "var(--muted-foreground)",
                marginBottom: 12,
              }}
            >
              1. Varian Peran (Semantics & Micro-interactions)
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
              <Button leftIcon={<PlusIcon />} loading={isLoading} variant="primary-black">
                Simpan Data
              </Button>
              <Button leftIcon={<PlusIcon />} loading={isLoading} variant="primary-orange">
                Catat Setoran
              </Button>
              <Button leftIcon={<SlidersIcon />} loading={isLoading} variant="secondary-ghost">
                Filter Periode
              </Button>
              <Button leftIcon={<TrashIcon />} loading={isLoading} variant="subtle-danger">
                Hapus Tiket
              </Button>
              <Button
                aria-label="Cari kamar"
                loading={isLoading}
                size="icon"
                title="Pencarian"
                variant="icon-circle"
              >
                <SearchIcon />
              </Button>
              <Button
                aria-label="Pesan masuk"
                loading={isLoading}
                size="icon"
                title="Pesan"
                variant="icon-circle"
              >
                <MailIcon />
              </Button>

              {/* White Pill Arrow Button (Flips to black on hover) */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Pill Arrow:</span>
                <Button
                  aria-label="Lihat laporan lengkap"
                  loading={isLoading}
                  title="Lihat Laporan Lengkap"
                  variant="pill-arrow"
                >
                  <ArrowUpRightIcon />
                </Button>
              </div>

              {/* Translucent Arrow Button (on Dark/Orange context) */}
              <div
                style={{
                  backgroundColor: "var(--color-primary, #ff7a00)",
                  padding: "5px 12px 5px 14px",
                  borderRadius: 9999,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ color: "#ffffff", fontSize: 12, fontWeight: 600 }}>
                  Highlight Card
                </span>
                <Button
                  aria-label="Detail kamar"
                  loading={isLoading}
                  title="Detail Kamar"
                  variant="translucent-arrow"
                >
                  <ArrowUpRightIcon />
                </Button>
              </div>
            </div>
          </div>

          {/* Sizing */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "var(--muted-foreground)",
                marginBottom: 12,
              }}
            >
              2. Skala Ukuran (Sizing Tiers)
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
              <Button size="lg" variant="primary-orange">
                Large 44px (Hero / Login)
              </Button>
              <Button size="md" variant="primary-orange">
                Medium 40px (Default CTA)
              </Button>
              <Button size="sm" variant="primary-orange">
                Small 34px (Sub-bar CTA)
              </Button>
              <Button size="xs" variant="primary-orange">
                Extra Small 28px (Micro CTA)
              </Button>
            </div>
          </div>

          {/* Shapes & States */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "var(--muted-foreground)",
                marginBottom: 12,
              }}
            >
              3. Bentuk & Status Disabled
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
              <Button shape="pill" variant="primary-black">
                Pill Shape (Default)
              </Button>
              <Button shape="rounded" variant="primary-black">
                Rounded Shape (12px)
              </Button>
              <Button disabled variant="primary-orange">
                Disabled Orange
              </Button>
              <Button disabled variant="secondary-ghost">
                Disabled Ghost
              </Button>
            </div>
          </div>
        </section>

        {/* SECTION 2: INPUTS & FORM CONTROLS */}
        <section
          style={{
            backgroundColor: "var(--surface)",
            border: "1.5px solid var(--border)",
            borderRadius: 18,
            padding: 22,
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              margin: "0 0 3px",
              letterSpacing: "-0.2px",
            }}
          >
            CMP-02: Input & Form Controls (`src/components/ui/input.tsx`)
          </h2>
          <p
            style={{
              margin: "0 0 20px",
              color: "var(--muted-foreground)",
              fontSize: 12.5,
            }}
          >
            Field masukan data baku 44px Estify dengan border 1.5px, label 12px semi-bold, hint, alert error WCAG 2.2 AA, dan password toggle.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
              marginBottom: 24,
            }}
          >
            {/* Input 1: Email */}
            <Input
              defaultValue="budi.santoso@rumakost.id"
              hint="Gunakan email aktif yang didaftarkan pengelola kost."
              id="showcase-email"
              label="Alamat Email Terdaftar"
              leftIcon={<MailIcon />}
              placeholder="nama@domain.com"
              required
              type="email"
            />

            {/* Input 2: Password with Eye Toggle */}
            <Input
              defaultValue="Password#2026"
              hint="Klik ikon mata untuk menampilkan/menyembunyikan sandi."
              id="showcase-password"
              label="Kata Sandi Akun"
              leftIcon={<LockIcon />}
              placeholder="Minimal 8 karakter"
              required
              type="password"
            />

            {/* Input 3: Capsule Search */}
            <Input
              id="showcase-search"
              label="Pencarian Kapsul Toolbar (Pill 40px)"
              leftIcon={<SearchIcon />}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Cari kamar (A-01, B-03, dll)..."
              rightIcon={
                searchValue ? (
                  <button
                    aria-label="Hapus kata kunci pencarian"
                    onClick={() => setSearchValue("")}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      color: "var(--muted-foreground)",
                    }}
                    type="button"
                  >
                    <CloseIcon />
                  </button>
                ) : null
              }
              value={searchValue}
              variant="capsule"
            />

            {/* Input 4: Select Dropdown (Custom Floating Popover) */}
            <Select
              defaultValue="A-02"
              hint="Custom floating popover dengan visual item Estify, hover peach, dan checkmark."
              id="showcase-room"
              label="Unit Kamar & Penyewa (Custom Popover)"
              options={[
                { value: "", label: "-- Pilih Unit Kamar --" },
                { value: "A-02", label: "A-02 · Dimas Setiawan (Menunggak 2 Hari)" },
                { value: "A-05", label: "A-05 · Maya Puspita (Jatuh Tempo Hari Ini)" },
                { value: "B-03", label: "B-03 · Reza Rahadian (Tagihan Baru)" },
                { value: "B-04", label: "B-04 · Tari Utami (Sewa Bulanan)" },
              ]}
              required
            />

            {/* Input 5: Error State */}
            <Input
              error={
                Number(demoAmount) <= 0
                  ? "Nominal pembayaran harus lebih besar dari Rp 0."
                  : undefined
              }
              hint="Ubah angka 0 untuk menguji validasi interaktif."
              id="showcase-nominal"
              label="Nominal Pembayaran (Simulasi Error)"
              onChange={(e) => setDemoAmount(e.target.value)}
              required
              type="number"
              value={demoAmount}
            />

            {/* Input 6: Disabled State */}
            <Input
              defaultValue="TERISI (Kontrak Berjalan s/d 2027)"
              disabled
              hint="Data sewa aktif dikunci oleh sistem."
              id="showcase-disabled"
              label="Status Kamar (Disabled)"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 24 }}>
            {/* Textarea */}
            <Textarea
              defaultValue="AC kamar A-102 meneteskan air sejak kemarin malam, mohon teknisi cek bagian pembuangan."
              hint="Textarea dengan tinggi minimum 84px dan border radius 12px."
              id="showcase-notes"
              label="Catatan Kerusakan Tiket (Textarea)"
              rows={3}
            />

            {/* Checkbox Group */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>
                Pilihan Tambahan (Checkbox)
              </span>
              <Checkbox
                defaultChecked
                hint="Simpan token sesi autentikasi selama 30 hari."
                id="showcase-remember"
                label="Ingat saya di perangkat ini"
              />
              <Checkbox
                id="showcase-wa-notif"
                label="Kirim salinan tanda terima ke WhatsApp penyewa"
              />
              <Checkbox
                disabled
                id="showcase-disabled-chk"
                label="Auto-debet mutasi rekening (Segera Hadir)"
              />
            </div>
          </div>

          {/* Specialized Domain Inputs (DESIGN.md §3.3, §7.2, & Screen Prototypes) */}
          <div style={{ borderTop: "1.5px solid var(--border)", paddingTop: 24, marginTop: 12 }}>
            <h3 style={{ fontSize: 13.5, fontWeight: 600, margin: "0 0 16px", color: "var(--foreground)" }}>
              Kontrol Khusus Domain (DESIGN.md §3.3 / §7.2 / Screen Prototypes)
            </h3>

            {/* Currency & Date Inputs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18, marginBottom: 24 }}>
              <CurrencyInput
                hint="DESIGN.md §3.3: Dilarang input[type=number]. Format ribuan otomatis dengan numeric inputmode."
                id="showcase-currency"
                label="Tarif Kamar Bulanan (CurrencyInput)"
                onValueChange={(val) => setCurrencyDemo(val)}
                value={currencyDemo}
              />

              <DatePicker
                defaultValue="2026-11-05"
                hint="DESIGN.md §7.2: Tinggi 42px/44px dengan ikon Lucide Calendar di sisi kiri."
                id="showcase-date"
                label="Tanggal Mulai Sewa (DatePicker)"
              />
            </div>

            {/* Switch & Radio Buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 24 }}>
              {/* Switch / Toggle */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>
                  Toggle Switch (WF-04 / WF-05)
                </span>
                <Switch
                  checked={autoRenew}
                  hint="Sistem otomatis membuat draft tagihan 7 hari sebelum kontrak jatuh tempo."
                  id="showcase-switch"
                  label="Perpanjangan Kontrak Otomatis"
                  onChange={(e) => setAutoRenew(e.target.checked)}
                />
                <Switch
                  disabled
                  hint="Fitur ditutup selama masa audit sewa."
                  id="showcase-switch-disabled"
                  label="Notifikasi WhatsApp Staff (Terkunci)"
                />
              </div>

              {/* Standard Radio Group */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>
                  Format Ekspor Laporan (Radio Lingkaran - WF-08)
                </span>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <Radio
                    checked={exportType === "pdf"}
                    id="radio-pdf"
                    label="Dokumen PDF"
                    name="exportGroup"
                    onChange={() => setExportType("pdf")}
                  />
                  <Radio
                    checked={exportType === "xlsx"}
                    id="radio-xlsx"
                    label="Spreadsheet Excel"
                    name="exportGroup"
                    onChange={() => setExportType("xlsx")}
                  />
                  <Radio
                    disabled
                    id="radio-csv"
                    label="CSV (Nonaktif)"
                    name="exportGroup"
                  />
                </div>
              </div>
            </div>

            {/* Method Radio Card (from WF-02, WF-05, WF-06, WF-07) */}
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", display: "block", marginBottom: 10 }}>
                Metode Pembayaran (RadioCard .method-radio-box - WF-02 / WF-05 / WF-06)
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <RadioCard
                  badge="Instan"
                  checked={selectedMethod === "bca"}
                  description="Verifikasi otomatis via mutasi"
                  id="card-bca"
                  label="BCA Virtual Account"
                  name="paymentMethodGroup"
                  onChange={() => setSelectedMethod("bca")}
                />
                <RadioCard
                  badge="Scan QR"
                  checked={selectedMethod === "qris"}
                  description="Bebas biaya admin perbankan"
                  id="card-qris"
                  label="QRIS Statis Kost"
                  name="paymentMethodGroup"
                  onChange={() => setSelectedMethod("qris")}
                />
                <RadioCard
                  checked={selectedMethod === "cash"}
                  description="Serah terima langsung ke pengelola"
                  id="card-cash"
                  label="Kas Tunai / Cash"
                  name="paymentMethodGroup"
                  onChange={() => setSelectedMethod("cash")}
                />
                <RadioCard
                  checked={selectedMethod === "deposit"}
                  description="Potong dari saldo uang jaminan"
                  id="card-deposit"
                  label="Potong Deposit"
                  name="paymentMethodGroup"
                  onChange={() => setSelectedMethod("deposit")}
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: STATUS BADGE & PILL */}
        <section
          style={{
            backgroundColor: "var(--surface)",
            border: "1.5px solid var(--border)",
            borderRadius: 18,
            padding: 22,
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                margin: "0 0 3px",
                letterSpacing: "-0.2px",
              }}
            >
              CMP-03: Status Badge & Pill (`src/components/ui/badge.tsx`)
            </h2>
            <p style={{ margin: 0, color: "var(--muted-foreground)", fontSize: 12.5 }}>
              Label visual status semantik dengan ikon Lucide murni (Zero-Emoji), WCAG AA contrast, dan token Estify.
            </p>
          </div>

          {/* 1. Varian Semantik Baku */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "var(--muted-foreground)",
                marginBottom: 10,
              }}
            >
              1. Varian Semantik Baku (CMP-03 & DESIGN.md §7.4)
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
              <Badge showDefaultIcon variant="success">
                Lunas · Terverifikasi
              </Badge>
              <Badge showDefaultIcon variant="warning">
                Jatuh Tempo (7 Hari)
              </Badge>
              <Badge showDefaultIcon variant="danger">
                Tagihan Terlambat
              </Badge>
              <Badge showDefaultIcon variant="brand">
                Kamar Unggulan
              </Badge>
              <Badge showDefaultIcon variant="info">
                Sedang Dikerjakan
              </Badge>
              <Badge showDefaultIcon variant="neutral">
                Kamar Kosong
              </Badge>
              <Badge showDefaultIcon variant="dark">
                Owner Access
              </Badge>
            </div>
          </div>

          {/* 2. Ukuran & Bentuk */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "var(--muted-foreground)",
                marginBottom: 10,
              }}
            >
              2. Skala Ukuran (Tiers) & Bentuk (Shapes)
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <Badge shape="pill" showDefaultIcon size="lg" variant="success">
                Large 28px (Hero / Rekap)
              </Badge>
              <Badge shape="pill" showDefaultIcon size="md" variant="success">
                Regular 24px (Default)
              </Badge>
              <Badge shape="pill" showDefaultIcon size="sm" variant="success">
                Micro 20px (Tabel)
              </Badge>
              <Badge shape="rounded" showDefaultIcon size="md" variant="brand">
                Rounded 6px (Urgency Tag)
              </Badge>
              <Badge shape="rounded" showDefaultIcon size="sm" variant="danger">
                Urgent · High
              </Badge>
            </div>
          </div>

          {/* 3. Indikator Dot, Pulsing, Counter & Interaktif */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "var(--muted-foreground)",
                marginBottom: 10,
              }}
            >
              3. Indikator Dot, Animasi Berkedip, Counter & Interaktif
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <Badge dot variant="neutral">
                Dot Statis
              </Badge>
              <Badge dot pulsing variant="danger">
                Menunggak (Pulsing)
              </Badge>
              <Badge dot pulsing variant="warning">
                Verifikasi Berjalan
              </Badge>
              <Badge count={8} variant="brand">
                Unit Tersedia
              </Badge>
              <Badge count={3} variant="dark">
                Tiket Tertunda
              </Badge>
              <Badge
                onClick={() => alert("Filter status diklik!")}
                showDefaultIcon
                variant="info"
              >
                Klik untuk Filter (Interaktif)
              </Badge>
            </div>
          </div>

          {/* 4. Domain Status Helpers (RumaKost Specific) */}
          <div style={{ borderTop: "1.5px solid var(--border)", paddingTop: 18 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "var(--muted-foreground)",
                marginBottom: 12,
              }}
            >
              4. Domain Status Helpers (Terstandarisasi untuk Kamar, Pembayaran, Tiket)
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
              {/* Kamar */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>
                  Status Kamar (`RoomStatusBadge`):
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <RoomStatusBadge status="terisi" />
                  <RoomStatusBadge status="kosong" />
                  <RoomStatusBadge status="pemeliharaan" />
                  <RoomStatusBadge status="menunggubayar" />
                </div>
              </div>

              {/* Tagihan / Pembayaran */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>
                  Status Pembayaran (`PaymentStatusBadge`):
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <PaymentStatusBadge status="LUNAS" />
                  <PaymentStatusBadge status="PENDING" />
                  <PaymentStatusBadge status="SEBAGIAN" />
                  <PaymentStatusBadge status="JATUH_TEMPO" />
                  <PaymentStatusBadge status="TERLAMBAT" />
                  <PaymentStatusBadge status="DITOLAK" />
                </div>
              </div>

              {/* Tiket */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>
                  Status Tiket (`TicketStatusBadge`):
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <TicketStatusBadge status="DRAFT" />
                  <TicketStatusBadge status="SUBMITTED" />
                  <TicketStatusBadge status="IN_PROGRESS" />
                  <TicketStatusBadge status="RESOLVED" />
                  <TicketStatusBadge status="CANCELLED" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: POPOVER DROPDOWN (CMP-04) */}
        <section
          style={{
            backgroundColor: "var(--surface)",
            border: "1.5px solid var(--border)",
            borderRadius: 20,
            padding: "24px 28px",
            marginBottom: 24,
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                margin: "0 0 4px",
                letterSpacing: "-0.2px",
              }}
            >
              CMP-04: Custom Popover Dropdown (`src/components/ui/popover-select.tsx`)
            </h2>
            <p style={{ margin: 0, color: "var(--muted-foreground)", fontSize: 12.5 }}>
              Trigger kapsul (pill) melayang pengganti elemen select bawaan untuk filter lantai, periode, dan tipe kamar (Zero Native Select).
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
              alignItems: "start",
            }}
          >
            {/* Dropdown 1: Filter Periode (Pill) */}
            <div>
              <PopoverSelect
                hint="Filter ringkasan dasbor dan laporan finansial."
                id="showcase-period-select"
                label="Filter Periode (Pill Trigger)"
                onChange={(val) => setSelectedPeriod(val as string)}
                options={[
                  { value: "current", label: "Bulan Ini (November 2026)" },
                  { value: "prev1", label: "Oktober 2026" },
                  { value: "prev2", label: "September 2026" },
                  { value: "q4", label: "Kuartal 4 2026" },
                  { value: "year", label: "Tahun Berjalan (2026)" },
                ]}
                value={selectedPeriod}
              />
            </div>

            {/* Dropdown 2: Filter Lantai (Pill dengan Deskripsi) */}
            <div>
              <PopoverSelect
                hint="Katalog 15 unit kamar per lantai."
                id="showcase-floor-select"
                label="Filter Lantai (dengan Deskripsi Sub)"
                onChange={(val) => setSelectedFloor(val as string)}
                options={[
                  { value: "all", label: "Semua Lantai" },
                  { value: "lt1", label: "Lantai 1", description: "5 Unit Kamar (A-01 s/d A-05)" },
                  { value: "lt2", label: "Lantai 2", description: "5 Unit Kamar (B-01 s/d B-05)" },
                  { value: "lt3", label: "Lantai 3", description: "5 Unit Kamar (C-01 s/d C-05)" },
                ]}
                value={selectedFloor}
              />
            </div>

            {/* Dropdown 3: Tipe Kamar (Searchable & Multi-Select) */}
            <div>
              <PopoverSelect
                hint="Dapat memilih beberapa tipe kamar sekaligus."
                id="showcase-type-select"
                label="Tipe Kamar (Multi-Select & Searchable)"
                multiple
                onChange={(val) => setSelectedRoomTypes(val as string[])}
                options={[
                  { value: "standard", label: "Tipe Standard", description: "3x4m, Kamar Mandi Luar" },
                  { value: "deluxe", label: "Tipe Deluxe", description: "4x4m, KM Dalam, AC" },
                  { value: "vip", label: "Tipe VIP", description: "4x5m, Water Heater, Smart TV" },
                  { value: "suite", label: "Tipe Suite", description: "Balkon Pribadi, Kitchenette" },
                ]}
                placeholder="Pilih tipe kamar..."
                searchPlaceholder="Cari tipe kamar..."
                searchable
                value={selectedRoomTypes}
              />
            </div>

            {/* Dropdown 4: Rounded Shape & Disabled */}
            <div>
              <PopoverSelect
                disabled
                hint="Trigger terkunci oleh sistem peran."
                id="showcase-disabled-select"
                label="Properti Kost (Terkunci / Disabled)"
                options={[{ value: "kost1", label: "Kost Budi Makmur (Unit Utama)" }]}
                triggerVariant="rounded"
                value="kost1"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

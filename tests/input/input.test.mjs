import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
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
} from "../../src/components/ui/input.tsx";

test("associates label with input using htmlFor and id", () => {
  const html = renderToStaticMarkup(
    React.createElement(Input, { id: "user-email", label: "Email Penghuni" }),
  );
  assert.match(html, /<label [^>]*for="user-email"[^>]*>Email Penghuni<\/label>/);
  assert.match(html, /<input [^>]*id="user-email"/);
});

test("associates hint with input using aria-describedby", () => {
  const html = renderToStaticMarkup(
    React.createElement(Input, {
      id: "room-code",
      label: "Nomor Kamar",
      hint: "Contoh: A-101",
    }),
  );
  assert.match(html, /aria-describedby="room-code-hint"/);
  assert.match(html, /<p [^>]*id="room-code-hint"[^>]*>Contoh: A-101<\/p>/);
});

test("associates error with input and enforces accessible error state", () => {
  const html = renderToStaticMarkup(
    React.createElement(Input, {
      id: "payment-amount",
      label: "Nominal Bayar",
      error: "Nominal harus lebih dari 0",
    }),
  );
  assert.match(html, /aria-describedby="payment-amount-error"/);
  assert.match(html, /aria-errormessage="payment-amount-error"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /invalid/);
  assert.match(html, /role="alert"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /id="payment-amount-error"/);
  assert.match(html, />Nominal harus lebih dari 0<\/p>/);
});

test("combines error and hint in aria-describedby when both present", () => {
  const html = renderToStaticMarkup(
    React.createElement(Input, {
      id: "deposit-val",
      hint: "Batas 50%",
      error: "Melebihi batas sewa",
    }),
  );
  assert.match(html, /aria-describedby="deposit-val-error deposit-val-hint"/);
});

test("renders required indicator and marks aria-required", () => {
  const html = renderToStaticMarkup(
    React.createElement(Input, {
      id: "tenant-name",
      label: "Nama Lengkap",
      required: true,
    }),
  );
  assert.match(html, /aria-required="true"/);
  assert.match(html, /required=""/);
  assert.match(html, /\*<\/span>/);
});

test("renders disabled state with appropriate attributes", () => {
  const html = renderToStaticMarkup(
    React.createElement(Input, {
      id: "room-status",
      disabled: true,
    }),
  );
  assert.match(html, /disabled=""/);
  assert.match(html, /aria-disabled="true"/);
});

test("renders leftIcon and rightIcon slots with modifier classes", () => {
  const searchIcon = React.createElement("span", { id: "search-icon" }, "🔍");
  const clearIcon = React.createElement("button", { id: "clear-btn" }, "✕");

  const html = renderToStaticMarkup(
    React.createElement(Input, {
      leftIcon: searchIcon,
      rightIcon: clearIcon,
    }),
  );

  assert.match(html, /hasLeftIcon/);
  assert.match(html, /hasRightIcon/);
  assert.match(html, /id="search-icon"/);
  assert.match(html, /id="clear-btn"/);
});

test("supports capsule search variant", () => {
  const html = renderToStaticMarkup(
    React.createElement(Input, {
      variant: "capsule",
      placeholder: "Cari kamar...",
    }),
  );
  assert.match(html, /variant-capsule/);
  assert.match(html, /placeholder="Cari kamar\.\.\."/);
});

test("forwards standard HTML input attributes", () => {
  const html = renderToStaticMarkup(
    React.createElement(Input, {
      type: "tel",
      name: "phone",
      placeholder: "08123456789",
      maxLength: 16,
      autoComplete: "tel",
    }),
  );
  assert.match(html, /type="tel"/);
  assert.match(html, /name="phone"/);
  assert.match(html, /placeholder="08123456789"/);
  assert.match(html, /maxlength="16"/i);
  assert.match(html, /autocomplete="tel"/i);
});

test("Textarea renders with label, hint, error, and textarea-specific attributes", () => {
  const html = renderToStaticMarkup(
    React.createElement(Textarea, {
      id: "ticket-desc",
      label: "Deskripsi Kerusakan",
      hint: "Jelaskan lokasi dan kronologi",
      error: "Deskripsi wajib diisi",
      rows: 4,
      required: true,
    }),
  );

  assert.match(html, /<label [^>]*for="ticket-desc"/);
  assert.match(html, /<textarea [^>]*id="ticket-desc"/);
  assert.match(html, /aria-describedby="ticket-desc-error ticket-desc-hint"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-required="true"/);
  assert.match(html, /rows="4"/);
  assert.match(html, /role="alert"/);
  assert.match(html, /Deskripsi wajib diisi/);
});

test("renders password input with built-in toggle button", () => {
  const html = renderToStaticMarkup(
    React.createElement(Input, {
      id: "user-password",
      type: "password",
      label: "Kata Sandi",
    }),
  );
  assert.match(html, /type="password"/);
  assert.match(html, /aria-label="Tampilkan kata sandi"/);
  assert.match(html, /hasRightIcon/);
});

test("Checkbox renders semantic accessible checkbox with label and hints", () => {
  const html = renderToStaticMarkup(
    React.createElement(Checkbox, {
      id: "remember-me",
      label: "Ingat saya di perangkat ini",
      hint: "Simpan sesi login selama 30 hari",
      defaultChecked: true,
    }),
  );
  assert.match(html, /<input [^>]*type="checkbox"/);
  assert.match(html, /id="remember-me"/);
  assert.match(html, /checked=""/);
  assert.match(html, /Ingat saya di perangkat ini/);
  assert.match(html, /aria-describedby="remember-me-hint"/);
  assert.match(html, /Simpan sesi login selama 30 hari/);
});

test("Select renders accessible styled select dropdown with options", () => {
  const options = [
    React.createElement("option", { key: "all", value: "" }, "-- Semua Lantai --"),
    React.createElement("option", { key: "l1", value: "1" }, "Lantai 1"),
    React.createElement("option", { key: "l2", value: "2" }, "Lantai 2"),
  ];

  const html = renderToStaticMarkup(
    React.createElement(
      Select,
      {
        id: "filter-floor",
        label: "Filter Lantai",
        required: true,
      },
      options,
    ),
  );

  assert.match(html, /<select [^>]*id="filter-floor"/);
  assert.match(html, /<label [^>]*for="filter-floor"/);
  assert.match(html, /-- Semua Lantai --/);
  assert.match(html, /Lantai 1/);
});

test("CurrencyInput renders with Rp prefix, numeric inputMode, and thousand separators", () => {
  const html = renderToStaticMarkup(
    React.createElement(CurrencyInput, {
      id: "deposit-amount",
      label: "Nominal Deposit",
      value: 1500000,
    }),
  );
  assert.match(html, /inputmode="numeric"/i);
  assert.match(html, /value="1\.500\.000"/);
  assert.match(html, />Rp<\/span>/);
  assert.match(html, /Nominal Deposit/);
});

test("DatePicker renders custom floating datepicker with formatted date and calendar icon", () => {
  const html = renderToStaticMarkup(
    React.createElement(DatePicker, {
      id: "lease-start-date",
      label: "Tanggal Mulai Sewa",
      defaultValue: "2026-11-05",
    }),
  );
  assert.match(html, /type="hidden"/);
  assert.match(html, /value="2026-11-05"/);
  assert.match(html, /5 November 2026/);
  assert.match(html, /aria-haspopup="dialog"/);
  assert.match(html, /<svg [^>]*height="15"/);
  assert.match(html, /Tanggal Mulai Sewa/);
});

test("Radio renders accessible radio element with label and hint", () => {
  const html = renderToStaticMarkup(
    React.createElement(Radio, {
      id: "export-pdf",
      name: "exportFormat",
      label: "Dokumen PDF Resmi",
      hint: "Format cetak kwitansi",
      defaultChecked: true,
    }),
  );
  assert.match(html, /<input [^>]*type="radio"/);
  assert.match(html, /name="exportFormat"/);
  assert.match(html, /checked=""/);
  assert.match(html, /Dokumen PDF Resmi/);
  assert.match(html, /Format cetak kwitansi/);
});

test("RadioCard renders method selector box with active state, icon, and badge", () => {
  const html = renderToStaticMarkup(
    React.createElement(RadioCard, {
      id: "method-bca",
      name: "paymentMethod",
      label: "BCA Transfer",
      description: "Verifikasi otomatis 24 jam",
      badge: "Instan",
      defaultChecked: true,
    }),
  );
  assert.match(html, /<input [^>]*type="radio"/);
  assert.match(html, /BCA Transfer/);
  assert.match(html, /Verifikasi otomatis 24 jam/);
  assert.match(html, /Instan/);
  assert.match(html, /radioCardChecked/);
});

test("Switch renders semantic toggle switch with role='switch' and aria-checked", () => {
  const html = renderToStaticMarkup(
    React.createElement(Switch, {
      id: "auto-renew",
      label: "Perpanjang Otomatis",
      hint: "Terbitkan tagihan baru 7 hari sebelum masa sewa berakhir",
      defaultChecked: true,
    }),
  );
  assert.match(html, /role="switch"/);
  assert.match(html, /aria-checked="true"/);
  assert.match(html, /type="checkbox"/);
  assert.match(html, /Perpanjang Otomatis/);
  assert.match(html, /switchTrackChecked/);
});


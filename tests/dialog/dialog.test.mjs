import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
  ConfirmDialog,
} from "../../src/components/ui/dialog.tsx";

test("does not render when open is false", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Dialog,
      { onOpenChange: () => {}, open: false },
      React.createElement(DialogTitle, null, "Modal Tertutup"),
    ),
  );

  assert.equal(html, "");
});

test("renders accessible attributes when open is true", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Dialog,
      { onOpenChange: () => {}, open: true },
      React.createElement(
        DialogHeader,
        null,
        React.createElement(DialogTitle, null, "Tambah Kamar Baru"),
        React.createElement(DialogDescription, null, "Isi detail unit kamar kost baru."),
      ),
      React.createElement(DialogBody, null, "Konten Formulir"),
      React.createElement(
        DialogFooter,
        null,
        React.createElement(DialogClose, null, "Batal"),
      ),
    ),
  );

  assert.match(html, /role="dialog"/);
  assert.match(html, /aria-modal="true"/);
  assert.match(html, /aria-labelledby=".*-title"/);
  assert.match(html, /aria-describedby=".*-desc"/);
  assert.match(html, /Tambah Kamar Baru/);
  assert.match(html, /Isi detail unit kamar kost baru\./);
  assert.match(html, /Konten Formulir/);
  assert.match(html, /aria-label="Tutup dialog"/);
});

test("supports modal sizing tiers (sm, md, lg, xl)", () => {
  const sizes = ["sm", "md", "lg", "xl"];

  for (const size of sizes) {
    const html = renderToStaticMarkup(
      React.createElement(
        Dialog,
        { onOpenChange: () => {}, open: true, size },
        React.createElement(DialogTitle, null, `Modal ${size}`),
      ),
    );
    assert.match(html, new RegExp(`size-${size}`));
  }
});

test("DialogHeader can hide close button when showCloseButton is false", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Dialog,
      { onOpenChange: () => {}, open: true },
      React.createElement(
        DialogHeader,
        { showCloseButton: false },
        React.createElement(DialogTitle, null, "Tanpa Tombol Close"),
      ),
    ),
  );

  assert.doesNotMatch(html, /aria-label="Tutup dialog"/);
});

test("DialogClose renders Button with secondary-ghost variant", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Dialog,
      { onOpenChange: () => {}, open: true },
      React.createElement(
        DialogFooter,
        null,
        React.createElement(DialogClose, null, "Kembali"),
      ),
    ),
  );

  assert.match(html, /variant-secondary-ghost/);
  assert.match(html, /Kembali/);
});

test("ConfirmDialog renders title, description, and action buttons", () => {
  const html = renderToStaticMarkup(
    React.createElement(ConfirmDialog, {
      cancelText: "Batalkan",
      confirmText: "Hapus Unit",
      description: "Data unit kamar akan dihapus permanen.",
      onConfirm: () => {},
      onOpenChange: () => {},
      open: true,
      title: "Konfirmasi Hapus Kamar",
      variant: "danger",
    }),
  );

  assert.match(html, /Konfirmasi Hapus Kamar/);
  assert.match(html, /Data unit kamar akan dihapus permanen\./);
  assert.match(html, /Batalkan/);
  assert.match(html, /Hapus Unit/);
  assert.match(html, /variant-subtle-danger/);
});

test("ConfirmDialog supports primary-black and primary-orange variants", () => {
  const blackHtml = renderToStaticMarkup(
    React.createElement(ConfirmDialog, {
      confirmText: "Simpan",
      onConfirm: () => {},
      onOpenChange: () => {},
      open: true,
      title: "Konfirmasi Simpan",
      variant: "primary-black",
    }),
  );
  assert.match(blackHtml, /variant-primary-black/);

  const orangeHtml = renderToStaticMarkup(
    React.createElement(ConfirmDialog, {
      confirmText: "Publikasikan",
      onConfirm: () => {},
      onOpenChange: () => {},
      open: true,
      title: "Konfirmasi Publikasi",
      variant: "primary-orange",
    }),
  );
  assert.match(orangeHtml, /variant-primary-orange/);
});

test("ConfirmDialog passes loading and disabled states", () => {
  const html = renderToStaticMarkup(
    React.createElement(ConfirmDialog, {
      isLoading: true,
      onConfirm: () => {},
      onOpenChange: () => {},
      open: true,
      title: "Sedang Menyimpan",
    }),
  );

  assert.match(html, /disabled/);
  assert.match(html, /loading/);
  assert.match(html, /spinner/);
});

test("satisfies zero-emoji constraint across dialog components", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Dialog,
      { onOpenChange: () => {}, open: true },
      React.createElement(
        DialogHeader,
        null,
        React.createElement(DialogTitle, null, "Modal Standar Aksesibel"),
        React.createElement(DialogDescription, null, "Deskripsi modal bersih."),
      ),
      React.createElement(DialogBody, null, "Isi modal."),
      React.createElement(
        DialogFooter,
        null,
        React.createElement(DialogClose, null, "Tutup"),
      ),
    ),
  );

  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  assert.equal(emojiRegex.test(html), false);
});

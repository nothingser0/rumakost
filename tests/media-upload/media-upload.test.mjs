import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  MediaUpload,
  validateCandidateFile,
  formatFileSize,
  isPhotoMimeType,
  isVideoMimeType,
  isSupportedMimeType,
  hasMetMinimumRequirement,
  DEFAULT_MAX_PHOTO_BYTES,
  DEFAULT_MAX_VIDEO_BYTES,
  DEFAULT_MAX_PHOTOS,
  DEFAULT_MAX_VIDEOS,
  DEFAULT_MAX_TOTAL_BYTES,
} from "../../src/components/tickets/media-upload.tsx";

test("MIME type validation strictly allows photos and videos specified in FSD", () => {
  assert.equal(isPhotoMimeType("image/jpeg"), true);
  assert.equal(isPhotoMimeType("image/png"), true);
  assert.equal(isPhotoMimeType("image/webp"), true);
  assert.equal(isPhotoMimeType("image/gif"), false);

  assert.equal(isVideoMimeType("video/mp4"), true);
  assert.equal(isVideoMimeType("video/quicktime"), true);
  assert.equal(isVideoMimeType("video/webm"), false);

  assert.equal(isSupportedMimeType("image/jpeg"), true);
  assert.equal(isSupportedMimeType("video/mp4"), true);
  assert.equal(isSupportedMimeType("application/pdf"), false);
  assert.equal(isSupportedMimeType("application/zip"), false);
});

test("formatFileSize formats bytes correctly across units", () => {
  assert.equal(formatFileSize(0), "0 B");
  assert.equal(formatFileSize(500), "500 B");
  assert.equal(formatFileSize(1024), "1.0 KB");
  assert.equal(formatFileSize(4 * 1024 * 1024), "4.0 MB");
  assert.equal(formatFileSize(12.5 * 1024 * 1024), "12.5 MB");
});

test("validateCandidateFile enforces per-file limits for photo (4MB) and video (12MB)", () => {
  const emptyList = [];

  // Photo within 4MB
  const validPhoto = { name: "foto1.jpg", size: DEFAULT_MAX_PHOTO_BYTES, type: "image/jpeg" };
  assert.equal(validateCandidateFile(validPhoto, emptyList).valid, true);

  // Photo exceeds 4MB
  const oversizedPhoto = { name: "foto_besar.jpg", size: DEFAULT_MAX_PHOTO_BYTES + 1, type: "image/jpeg" };
  const photoRes = validateCandidateFile(oversizedPhoto, emptyList);
  assert.equal(photoRes.valid, false);
  assert.equal(photoRes.code, "PHOTO_TOO_LARGE");

  // Video within 12MB
  const validVideo = { name: "video1.mp4", size: DEFAULT_MAX_VIDEO_BYTES, type: "video/mp4" };
  assert.equal(validateCandidateFile(validVideo, emptyList).valid, true);

  // Video exceeds 12MB
  const oversizedVideo = { name: "video_besar.mp4", size: DEFAULT_MAX_VIDEO_BYTES + 1, type: "video/mp4" };
  const videoRes = validateCandidateFile(oversizedVideo, emptyList);
  assert.equal(videoRes.valid, false);
  assert.equal(videoRes.code, "VIDEO_TOO_LARGE");

  // Unsupported format rejected
  const pdfFile = { name: "dokumen.pdf", size: 5000, type: "application/pdf" };
  const pdfRes = validateCandidateFile(pdfFile, emptyList);
  assert.equal(pdfRes.valid, false);
  assert.equal(pdfRes.code, "INVALID_MIME");
});

test("validateCandidateFile enforces maximum counts: 4 photos and 1 video", () => {
  const currentItems = [
    { id: "1", fileName: "f1.jpg", fileSize: 1000, mimeType: "image/jpeg", status: "available" },
    { id: "2", fileName: "f2.jpg", fileSize: 1000, mimeType: "image/jpeg", status: "available" },
    { id: "3", fileName: "f3.jpg", fileSize: 1000, mimeType: "image/jpeg", status: "available" },
    { id: "4", fileName: "f4.jpg", fileSize: 1000, mimeType: "image/jpeg", status: "available" },
  ];

  // 5th photo rejected
  const fifthPhoto = { name: "f5.jpg", size: 1000, type: "image/jpeg" };
  const photoRes = validateCandidateFile(fifthPhoto, currentItems);
  assert.equal(photoRes.valid, false);
  assert.equal(photoRes.code, "MAX_PHOTOS_REACHED");

  // Video can still be added when 4 photos exist
  const firstVideo = { name: "v1.mp4", size: 5000, type: "video/mp4" };
  assert.equal(validateCandidateFile(firstVideo, currentItems).valid, true);

  // 2nd video rejected when 1 video already exists
  const itemsWithVideo = [...currentItems, { id: "5", fileName: "v1.mp4", fileSize: 5000, mimeType: "video/mp4", status: "available" }];
  const secondVideo = { name: "v2.mp4", size: 5000, type: "video/mp4" };
  const videoRes = validateCandidateFile(secondVideo, itemsWithVideo);
  assert.equal(videoRes.valid, false);
  assert.equal(videoRes.code, "MAX_VIDEOS_REACHED");
});

test("validateCandidateFile enforces total aggregate ticket limit of 40MB", () => {
  const currentItems = [
    { id: "1", fileName: "f1.jpg", fileSize: 35 * 1024 * 1024, mimeType: "image/jpeg", status: "available" },
  ];

  // File of 6MB would exceed 40MB limit (35 + 6 = 41MB)
  const addingFile = { name: "v1.mp4", size: 6 * 1024 * 1024, type: "video/mp4" };
  const res = validateCandidateFile(addingFile, currentItems);
  assert.equal(res.valid, false);
  assert.equal(res.code, "TOTAL_TOO_LARGE");
});

test("hasMetMinimumRequirement verifies F-07 mandatory media rule", () => {
  assert.equal(hasMetMinimumRequirement([], true), false);
  assert.equal(hasMetMinimumRequirement([{ id: "1", fileName: "f.jpg", fileSize: 100, mimeType: "image/jpeg", status: "error" }], true), false);
  assert.equal(hasMetMinimumRequirement([{ id: "1", fileName: "f.jpg", fileSize: 100, mimeType: "image/jpeg", status: "available" }], true), true);
  assert.equal(hasMetMinimumRequirement([], false), true);
});

test("renders empty upload zone with required badge, counter, and instructions", () => {
  const html = renderToStaticMarkup(
    React.createElement(MediaUpload, {
      items: [],
      required: true,
      label: "Lampiran Bukti Foto / Video",
    }),
  );

  assert.match(html, /Lampiran Bukti Foto \/ Video/);
  assert.match(html, /Wajib Minimal 1/);
  assert.match(html, /Foto: 0\/4/);
  assert.match(html, /Video: 0\/1/);
  assert.match(html, /Total: 0 B\/40\.0 MB/);
  assert.match(html, /Unggah Foto atau Video Kerusakan/);
  assert.match(html, /Pilih Berkas/);
  assert.match(html, /Belum ada berkas terlampir/);
});

test("renders populated upload zone with preview items and fulfilled badge", () => {
  const items = [
    {
      id: "media-1",
      fileName: "bukti_rusak.jpg",
      fileSize: 3.2 * 1024 * 1024,
      mimeType: "image/jpeg",
      status: "available",
      previewUrl: "blob:http://localhost/demo",
    },
    {
      id: "media-2",
      fileName: "video_bocor.mp4",
      fileSize: 8.5 * 1024 * 1024,
      mimeType: "video/mp4",
      status: "uploading",
    },
  ];

  const html = renderToStaticMarkup(
    React.createElement(MediaUpload, {
      items,
      required: true,
    }),
  );

  assert.match(html, /Syarat Minimal Terpenuhi/);
  assert.match(html, /Foto: 1\/4/);
  assert.match(html, /Video: 1\/1/);
  assert.match(html, /bukti_rusak\.jpg/);
  assert.match(html, /3\.2 MB/);
  assert.match(html, /Tersedia/);
  assert.match(html, /video_bocor\.mp4/);
  assert.match(html, /8\.5 MB/);
  assert.match(html, /Mengunggah\.\.\./);
  assert.match(html, /Hapus berkas bukti_rusak\.jpg/);
});

test("renders error alert when error prop is provided", () => {
  const html = renderToStaticMarkup(
    React.createElement(MediaUpload, {
      items: [],
      error: "Koneksi terputus saat mengunggah berkas.",
    }),
  );

  assert.match(html, /role="alert"/);
  assert.match(html, /Koneksi terputus saat mengunggah berkas\./);
});

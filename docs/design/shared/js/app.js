/**
 * RumaKost Interactive Application Engine
 * Accessible, WCAG AA Compliant UI Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
  initModals();
  initToasts();
  initInputMasks();
  initSteppers();
  initPasswordToggles();
  initSearchClears();
  initLiveValidation();
  initForms();
  initDatepickers();
  initSelects();
  initPopoverMenus();
  initBadges();
  initBooleanControls();

  // CMP-01 & CMP-07 Debounced Loading Button Demos
  document.querySelectorAll('[data-loading-demo]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('is-loading')) return;
      const origContent = btn.innerHTML;
      const loadingText = btn.getAttribute('data-loading-text') || 'Memproses...';
      const spinnerTheme = btn.classList.contains('btn-secondary') ? 'spinner-brand' : 'spinner-white';
      btn.classList.add('is-loading');
      btn.setAttribute('aria-busy', 'true');
      btn.innerHTML = `<span class="spinner spinner-sm ${spinnerTheme}" aria-hidden="true"></span><span>${loadingText}</span>`;
      setTimeout(() => {
        btn.classList.remove('is-loading');
        btn.removeAttribute('aria-busy');
        btn.innerHTML = origContent;
      }, 2000);
    });
  });

  const btnDemoLoading = document.getElementById('btn-demo-loading');
  if (btnDemoLoading) {
    btnDemoLoading.addEventListener('click', () => {
      if (btnDemoLoading.classList.contains('is-loading')) return;
      const origContent = btnDemoLoading.innerHTML;
      btnDemoLoading.classList.add('is-loading');
      btnDemoLoading.setAttribute('aria-busy', 'true');
      btnDemoLoading.innerHTML = '<span class="spinner spinner-sm spinner-brand" aria-hidden="true"></span><span>Menyimpan Kontrak...</span>';
      setTimeout(() => {
        btnDemoLoading.classList.remove('is-loading');
        btnDemoLoading.removeAttribute('aria-busy');
        btnDemoLoading.innerHTML = origContent;
        if (window.showToast) {
          window.showToast('Data kontrak sewa berhasil disimpan! (Async 2s Selesai)', 'brand', false);
        }
      }, 2000);
    });
  }

  // CMP-14 ConfirmDialog Destructive Guard (Wajib ketik HAPUS & isi alasan audit)
  initConfirmDialog();

  // CMP-17 SearchInput Live Filter Demo
  initSearchDemo();

  // CMP-18 PermissionGate RBAC Switcher Demo
  initPermissionGateDemo();

  // CMP-19 SupervisorOverrideModal Demo
  initSupervisorOverride();

  // CMP-02 Keyboard & Drag-and-Drop Uploads
  initCompactUploads();
  initDropzones();

  // CMP-11 Selectable Card Group, Segmented Arc Gauge & Hero Branch Carousel
  initCardSelectGroups();
  initSegmentedArcGauges();
  initHeroBranchCarousels();
});

function initSegmentedArcGauges() {
  const svgNs = 'http://www.w3.org/2000/svg';
  const tonePalette = {
    brand: ['#F46812', '#EF5E12', '#EA580C'],
    dark: ['#000000'],
    error: ['#B91C1C']
  };

  document.querySelectorAll('[data-arc-gauge]').forEach(container => {
    const svg = container.querySelector('svg');
    if (!svg) return;

    const rawPct = Number(container.getAttribute('data-arc-gauge') || 0);
    const pct = Math.max(0, Math.min(100, rawPct));
    const segments = Math.max(4, Number(container.getAttribute('data-arc-segments') || 12));
    const tone = container.getAttribute('data-arc-tone') || 'brand';
    const colors = tonePalette[tone] || tonePalette.brand;

    let activeCount = Math.round((pct / 100) * segments);
    if (pct > 0 && activeCount === 0) activeCount = 1;

    const cx = 66;
    const cy = 60;
    const rIn = 40.5;
    const rOut = 54.5;
    const slotDeg = 180 / segments;
    const gapDeg = 5.4;
    const segDeg = slotDeg - gapDeg;
    const toRad = deg => (deg * Math.PI) / 180;

    svg.textContent = '';

    for (let i = 0; i < segments; i++) {
      const a0 = 180 - (i * slotDeg + gapDeg / 2);
      const a1 = a0 - segDeg;

      const x0o = (cx + rOut * Math.cos(toRad(a0))).toFixed(2);
      const y0o = (cy - rOut * Math.sin(toRad(a0))).toFixed(2);
      const x1o = (cx + rOut * Math.cos(toRad(a1))).toFixed(2);
      const y1o = (cy - rOut * Math.sin(toRad(a1))).toFixed(2);
      const x1i = (cx + rIn * Math.cos(toRad(a1))).toFixed(2);
      const y1i = (cy - rIn * Math.sin(toRad(a1))).toFixed(2);
      const x0i = (cx + rIn * Math.cos(toRad(a0))).toFixed(2);
      const y0i = (cy - rIn * Math.sin(toRad(a0))).toFixed(2);

      const isActive = i < activeCount;
      const colorIdx = colors.length > 1
        ? Math.min(colors.length - 1, Math.floor((i / Math.max(1, activeCount - 1)) * colors.length))
        : 0;
      const fillColor = isActive ? colors[colorIdx] : '#E2E8F0';

      const path = document.createElementNS(svgNs, 'path');
      path.setAttribute('d', `M ${x0o} ${y0o} A ${rOut} ${rOut} 0 0 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${rIn} ${rIn} 0 0 0 ${x0i} ${y0i} Z`);
      path.setAttribute('fill', fillColor);
      path.setAttribute('stroke', fillColor);
      path.setAttribute('stroke-width', '2.5');
      path.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(path);
    }
  });
}

function initCardSelectGroups() {
  document.querySelectorAll('[data-card-select-group]').forEach(card => {
    card.addEventListener('click', () => {
      const groupName = card.getAttribute('data-card-select-group');
      if (!groupName) return;
      document.querySelectorAll(`[data-card-select-group="${groupName}"]`).forEach(sibling => {
        const isCurrent = sibling === card;
        sibling.classList.toggle('is-selected', isCurrent);
        sibling.setAttribute('aria-pressed', String(isCurrent));
        const iconBox = sibling.querySelector('.icon-box');
        if (iconBox) {
          iconBox.classList.toggle('icon-box-brand', isCurrent);
          iconBox.classList.toggle('icon-box-neutral', !isCurrent);
        }
        const badge = sibling.querySelector('.badge[data-select-badge]');
        if (badge) {
          badge.classList.toggle('badge-brand', isCurrent);
          badge.classList.toggle('badge-neutral', !isCurrent);
          badge.textContent = isCurrent ? 'Terpilih' : 'Interaktif';
        }
      });
    });
  });
}

function formatWithDigitCaret(input, formatFn) {
  const raw = input.value;
  const caret = input.selectionStart ?? raw.length;
  const atEnd = caret >= raw.length;
  const digitsBefore = raw.slice(0, caret).replace(/[^0-9]/g, '').length;
  const formatted = formatFn(raw);
  if (raw === formatted) return;
  input.value = formatted;
  if (document.activeElement === input && typeof input.setSelectionRange === 'function') {
    if (atEnd) {
      input.setSelectionRange(formatted.length, formatted.length);
      return;
    }
    let pos = 0;
    let seen = 0;
    while (pos < formatted.length && seen < digitsBefore) {
      if (/[0-9]/.test(formatted[pos])) seen++;
      pos++;
    }
    input.setSelectionRange(pos, pos);
  }
}

function initInputMasks() {
  document.querySelectorAll('[data-currency-input]').forEach(input => {
    const maxDigits = parseInt(input.getAttribute('data-max-digits') || '13', 10);
    const formatCurrency = (raw) => {
      const digits = raw.replace(/[^0-9]/g, '').slice(0, maxDigits);
      if (!digits) return '';
      const normalized = digits.replace(/^0+(?=\d)/, '');
      return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };
    input.addEventListener('input', () => formatWithDigitCaret(input, formatCurrency));
  });

  document.querySelectorAll('[data-phone-id]').forEach(input => {
    const formatPhone = (raw) => {
      let digits = raw.replace(/[^0-9]/g, '');
      if (digits.startsWith('62') && (raw.trim().startsWith('+62') || digits.startsWith('628'))) {
        digits = digits.slice(2);
      }
      digits = digits.replace(/^0+/, '').slice(0, 12);
      if (!digits) return '';
      return digits.replace(/(\d{1,3})(\d{0,4})(\d{0,5})/, (_, a, b, c) => a + (b ? '-' + b : '') + (c ? '-' + c : ''));
    };
    input.addEventListener('input', () => formatWithDigitCaret(input, formatPhone));
  });
}

function initSteppers() {
  document.querySelectorAll('[data-stepper]').forEach(stepper => {
    const decBtn = stepper.querySelector('[data-stepper-dec]');
    const incBtn = stepper.querySelector('[data-stepper-inc]');
    const valEl = stepper.querySelector('[data-stepper-val]');
    const hiddenInput = stepper.querySelector('[data-stepper-input]');
    if (!decBtn || !incBtn || !valEl) return;

    const min = parseInt(stepper.getAttribute('data-min') || '1', 10);
    const max = parseInt(stepper.getAttribute('data-max') || '3', 10);

    const sync = (nextVal) => {
      const clamped = Math.max(min, Math.min(max, nextVal));
      valEl.textContent = String(clamped);
      if (hiddenInput) hiddenInput.value = String(clamped);
      decBtn.disabled = clamped <= min;
      incBtn.disabled = clamped >= max;
    };

    sync(parseInt(valEl.textContent, 10) || min);
    decBtn.addEventListener('click', () => sync((parseInt(valEl.textContent, 10) || min) - 1));
    incBtn.addEventListener('click', () => sync((parseInt(valEl.textContent, 10) || min) + 1));
  });
}

function initPasswordToggles() {
  const eyeOpenSvg = '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  const eyeClosedSvg = '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

  document.querySelectorAll('[data-password-toggle]').forEach(btn => {
    const target = document.getElementById(btn.getAttribute('data-password-toggle'));
    if (!target) return;
    btn.addEventListener('click', () => {
      const showText = target.type === 'password';
      target.type = showText ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(showText));
      btn.setAttribute('aria-label', showText ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');
      btn.innerHTML = showText ? eyeClosedSvg : eyeOpenSvg;
    });
  });
}

function initSearchClears() {
  document.querySelectorAll('[data-search-clear]').forEach(btn => {
    const input = document.getElementById(btn.getAttribute('data-search-clear'));
    if (!input) return;
    const syncVisibility = () => {
      btn.style.display = input.value ? 'inline-flex' : 'none';
    };
    syncVisibility();
    input.addEventListener('input', syncVisibility);
    btn.addEventListener('click', () => {
      input.value = '';
      syncVisibility();
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.focus();
    });
  });
}

function validateUploadFile(file, maxMb = 5) {
  if (!file) return { valid: false, message: 'Tidak ada berkas yang dipilih.' };
  const allowedTypes = ['image/jpeg', 'image/png'];
  const hasValidMime = allowedTypes.includes(file.type);
  const hasValidExt = /\.(jpe?g|png)$/i.test(file.name);
  if (!hasValidMime && !(file.type === '' && hasValidExt)) {
    return { valid: false, message: 'Format berkas harus JPG atau PNG.' };
  }
  if (file.size > maxMb * 1024 * 1024) {
    return { valid: false, message: `Ukuran berkas melebihi batas maksimal ${maxMb} MB.` };
  }
  return { valid: true };
}

function formatUploadSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function setErrorMessageContent(errEl, message) {
  if (!errEl || !message) return;
  let textSpan = errEl.querySelector('.error-message-text');
  if (!textSpan) {
    const svg = errEl.querySelector('svg');
    Array.from(errEl.childNodes).forEach(node => {
      if (node !== svg) node.remove();
    });
    textSpan = document.createElement('span');
    textSpan.className = 'error-message-text';
    errEl.appendChild(textSpan);
  }
  textSpan.textContent = message;
}

function prependDescribedById(targetEl, id) {
  if (!targetEl || !id) return;
  const prev = (targetEl.getAttribute('aria-describedby') || '')
    .split(/\s+/)
    .filter(token => token && token !== id);
  prev.unshift(id);
  targetEl.setAttribute('aria-describedby', prev.join(' '));
}

function renderFieldError(wrapper, targetEl, message, isStatic = false) {
  if (!wrapper) return;
  wrapper.classList.add('has-error');
  if (targetEl) {
    targetEl.classList.add('has-error');
    const pillBox = targetEl.closest('.pill-input-box');
    if (pillBox) pillBox.classList.add('has-error');
    targetEl.setAttribute('aria-invalid', 'true');
  }
  const existingStatic = wrapper.querySelector('.error-message[data-static-error="true"]');
  if (isStatic && existingStatic) {
    if (message) setErrorMessageContent(existingStatic, message);
    existingStatic.style.display = 'flex';
    if (targetEl && existingStatic.id) prependDescribedById(targetEl, existingStatic.id);
    return;
  }
  const existingGen = wrapper.querySelector('.error-message[data-generated-error="true"]');
  if (existingGen) existingGen.remove();

  const err = document.createElement('span');
  err.className = 'error-message';
  if (targetEl && targetEl.type === 'checkbox') {
    err.classList.add('is-flush');
  }
  err.setAttribute('data-generated-error', 'true');
  err.setAttribute('role', 'alert');
  const errId = `${(targetEl && targetEl.id) || 'field'}-err`;
  err.id = errId;
  err.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  const textNode = document.createElement('span');
  textNode.className = 'error-message-text';
  textNode.textContent = message;
  err.appendChild(textNode);

  if (targetEl) prependDescribedById(targetEl, errId);

  const hintEl = Array.from(wrapper.children).find(el => el.classList.contains('input-hint'));
  if (hintEl) {
    wrapper.insertBefore(err, hintEl);
  } else {
    wrapper.appendChild(err);
  }
}

function clearFieldError(wrapper, targetEl) {
  const staticIds = [];
  if (wrapper) {
    wrapper.classList.remove('has-error');
    wrapper.querySelectorAll('.error-message[data-generated-error="true"]').forEach(gen => gen.remove());
    wrapper.querySelectorAll('.error-message[data-static-error="true"]').forEach(st => {
      if (st.id) staticIds.push(st.id);
      st.style.display = 'none';
    });
  }
  if (targetEl) {
    targetEl.classList.remove('has-error');
    const pillBox = targetEl.closest('.pill-input-box');
    if (pillBox) pillBox.classList.remove('has-error');
    targetEl.removeAttribute('aria-invalid');
    const removeIds = new Set(staticIds);
    if (targetEl.id) removeIds.add(`${targetEl.id}-err`);
    else removeIds.add('field-err');
    const described = (targetEl.getAttribute('aria-describedby') || '')
      .split(/\s+/)
      .filter(id => id && !removeIds.has(id));
    if (described.length) targetEl.setAttribute('aria-describedby', described.join(' '));
    else targetEl.removeAttribute('aria-describedby');
  }
}

function initCompactUploads() {
  document.querySelectorAll('[data-compact-upload]').forEach(box => {
    const fileInput = box.querySelector('input[type="file"]');
    const nameEl = box.querySelector('[data-upload-filename]');
    if (!fileInput || !nameEl) return;

    const maxMb = parseInt(box.getAttribute('data-max-mb') || '5', 10);
    const wrapper = box.closest('.input-wrapper');

    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) {
        nameEl.textContent = 'Belum ada berkas terpilih';
        box.classList.remove('has-error');
        clearFieldError(wrapper, fileInput);
        return;
      }
      const check = validateUploadFile(file, maxMb);
      if (!check.valid) {
        fileInput.value = '';
        nameEl.textContent = 'Berkas ditolak';
        box.classList.add('has-error');
        renderFieldError(wrapper, fileInput, check.message);
        if (window.showToast) window.showToast(check.message, 'error', true);
        return;
      }
      box.classList.remove('has-error');
      clearFieldError(wrapper, fileInput);
      nameEl.textContent = `${file.name} (${formatUploadSize(file.size)})`;
      if (window.showToast) {
        window.showToast(`Berkas "${file.name}" siap diunggah.`, 'success', false);
      }
    });
  });
}

function initDropzones() {
  document.querySelectorAll('[data-dropzone]').forEach(zone => {
    const inputId = zone.getAttribute('data-dropzone');
    const fileInput = document.getElementById(inputId);
    const statusEl = zone.querySelector('[data-dropzone-status]');
    if (!fileInput) return;

    const maxMb = parseInt(zone.getAttribute('data-max-mb') || '5', 10);
    const wrapper = zone.closest('.input-wrapper');

    const handleSelectedFile = (file) => {
      if (!file) return;
      const check = validateUploadFile(file, maxMb);
      if (!check.valid) {
        fileInput.value = '';
        zone.classList.add('has-error');
        if (statusEl) {
          statusEl.textContent = 'Unggah ulang foto berformat JPG atau PNG maksimal 5 MB.';
        }
        renderFieldError(wrapper, zone, check.message);
        if (window.showToast) window.showToast(check.message, 'error', true);
        return;
      }
      zone.classList.remove('has-error');
      clearFieldError(wrapper, zone);
      if (statusEl) {
        statusEl.textContent = `Berkas terpilih: ${file.name} (${formatUploadSize(file.size)})`;
      }
      if (window.showToast) {
        window.showToast(`Berkas "${file.name}" siap diunggah.`, 'success', false);
      }
    };

    const isDisabled = () => zone.classList.contains('is-disabled') || fileInput.disabled;

    zone.addEventListener('click', (e) => {
      if (isDisabled()) return;
      if (e.target !== fileInput) fileInput.click();
    });

    zone.addEventListener('keydown', (e) => {
      if (isDisabled()) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
      }
    });

    zone.addEventListener('dragenter', (e) => {
      if (isDisabled()) return;
      e.preventDefault();
      e.stopPropagation();
      zone.classList.add('is-dragover');
    });

    zone.addEventListener('dragover', (e) => {
      if (isDisabled()) return;
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
      zone.classList.add('is-dragover');
    });

    zone.addEventListener('dragleave', (e) => {
      e.stopPropagation();
      if (!e.relatedTarget || !zone.contains(e.relatedTarget)) {
        zone.classList.remove('is-dragover');
      }
    });

    zone.addEventListener('drop', (e) => {
      if (isDisabled()) return;
      e.preventDefault();
      e.stopPropagation();
      zone.classList.remove('is-dragover');
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (!file) return;
      try {
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInput.files = dt.files;
      } catch (_) {
        // Fallback for environments where DataTransfer constructor is restricted
      }
      handleSelectedFile(file);
    });

    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      handleSelectedFile(file);
    });
  });
}

function initSearchDemo() {
  const input = document.getElementById('cmp17-search-input');
  const clearBtn = document.getElementById('cmp17-clear-btn');
  const rows = document.querySelectorAll('[data-search-item]');
  const emptyBox = document.getElementById('cmp17-empty');
  if (!input || !clearBtn) return;

  function applyFilter() {
    const q = input.value.trim().toLowerCase();
    clearBtn.style.display = q ? 'inline-flex' : 'none';
    let visible = 0;
    rows.forEach(row => {
      const text = row.getAttribute('data-search-item').toLowerCase();
      const match = !q || text.includes(q);
      row.style.display = match ? 'flex' : 'none';
      if (match) visible++;
    });
    if (emptyBox) emptyBox.style.display = visible === 0 ? 'block' : 'none';
  }

  input.addEventListener('input', applyFilter);
  clearBtn.addEventListener('click', () => {
    input.value = '';
    applyFilter();
    input.focus();
  });
}

function initPermissionGateDemo() {
  const buttons = document.querySelectorAll('[data-role-switch]');
  const protectedArea = document.getElementById('rbac-protected-actions');
  const lockedNotice = document.getElementById('rbac-locked-notice');
  const roleBadge = document.getElementById('rbac-active-role');
  if (!buttons.length || !protectedArea || !lockedNotice) return;

  const allowedRoles = ['owner', 'finance'];
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const role = btn.getAttribute('data-role-switch');
      if (roleBadge) roleBadge.textContent = btn.textContent.trim();
      const canAccess = allowedRoles.includes(role);
      protectedArea.style.display = canAccess ? 'flex' : 'none';
      lockedNotice.style.display = canAccess ? 'none' : 'flex';
    });
  });
}

function initSupervisorOverride() {
  const pinInput = document.getElementById('override-pin-input');
  const reasonInput = document.getElementById('override-reason-input');
  const submitBtn = document.getElementById('override-submit-btn');
  const errorBox = document.getElementById('override-error-msg');
  if (!pinInput || !reasonInput || !submitBtn) return;

  submitBtn.addEventListener('click', () => {
    const pin = pinInput.value.trim();
    const reason = reasonInput.value.trim();
    if (!/^\d{6}$/.test(pin)) {
      if (errorBox) {
        errorBox.textContent = 'PIN Otorisasi Owner harus 6 digit angka (contoh demo: 123456).';
        errorBox.style.display = 'flex';
      }
      pinInput.focus();
      return;
    }
    if (reason.length < 5) {
      if (errorBox) {
        errorBox.textContent = 'Alasan otorisasi wajib diisi minimal 5 karakter.';
        errorBox.style.display = 'flex';
      }
      reasonInput.focus();
      return;
    }
    if (errorBox) errorBox.style.display = 'none';
    const modal = submitBtn.closest('.modal-backdrop');
    if (modal) modal.classList.remove('is-open');
    pinInput.value = '';
    reasonInput.value = '';
    if (window.showToast) {
      window.showToast('Otorisasi Supervisor disetujui dan tercatat di audit trail.', 'brand', false);
    }
  });
}

function initConfirmDialog() {
  const keywordInput = document.getElementById('confirm-keyword-input');
  const reasonInput = document.getElementById('confirm-reason-input');
  const submitBtn = document.getElementById('confirm-destructive-btn');
  if (!keywordInput || !reasonInput || !submitBtn) return;

  function syncConfirmState() {
    const keywordOk = keywordInput.value.trim() === 'HAPUS';
    const reasonOk = reasonInput.value.trim().length >= 5;
    submitBtn.disabled = !(keywordOk && reasonOk);
  }

  keywordInput.addEventListener('input', syncConfirmState);
  reasonInput.addEventListener('input', syncConfirmState);

  submitBtn.addEventListener('click', () => {
    const modal = submitBtn.closest('.modal-backdrop');
    if (modal) modal.classList.remove('is-open');
    keywordInput.value = '';
    reasonInput.value = '';
    syncConfirmState();
    if (window.showToast) {
      window.showToast('Transaksi #INV-2026-089 berhasil di-void dan dicatat ke audit trail.', 'brand', false);
    }
  });
}

function initModals() {
  const openButtons = document.querySelectorAll('[data-modal-open]');
  const closeButtons = document.querySelectorAll('[data-modal-close]');
  let lastFocusedElement = null;

  openButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-modal-open');
      const modal = document.getElementById(modalId);
      if (!modal) return;

      lastFocusedElement = document.activeElement;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');

      const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length > 0) focusable[0].focus();
    });
  });

  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-backdrop');
      if (!modal) return;
      closeModal(modal);
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (document.querySelector('.datepicker-container.is-open, .custom-select-wrapper.is-open, .popover-menu-wrapper.is-open')) {
        return;
      }
      const openModal = document.querySelector('.modal-backdrop.is-open');
      if (openModal) closeModal(openModal);
    }
  });

  function closeModal(modal) {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    if (lastFocusedElement) lastFocusedElement.focus();
  }
}

function initToasts() {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
  }

  window.showToast = function(message, type = 'info', persistent = false) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div style="flex:1">
        <div style="font-weight:600;font-size:0.875rem;margin-bottom:0.25rem">${type.toUpperCase()}</div>
        <div style="font-size:0.8125rem;color:var(--color-text-secondary)">${message}</div>
      </div>
      <button class="btn btn-ghost btn-sm" aria-label="Tutup notifikasi" style="min-height:auto;padding:0.25rem">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    `;

    const closeBtn = toast.querySelector('button');
    closeBtn.addEventListener('click', () => toast.remove());

    container.appendChild(toast);

    if (!persistent && type !== 'error') {
      setTimeout(() => {
        toast.style.transition = 'opacity 200ms ease';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 200);
      }, 4500);
    }
  };
}

function isEmailValid(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

function initLiveValidation() {
  document.querySelectorAll('[data-char-counter]').forEach(field => {
    const counter = document.getElementById(field.getAttribute('data-char-counter'));
    if (!counter) return;
    const maxLen = parseInt(field.getAttribute('maxlength') || '250', 10);
    const syncCount = () => {
      const len = field.value.length;
      counter.textContent = `${len} / ${maxLen} karakter`;
      counter.classList.toggle('input-counter-warning', maxLen > 0 && len >= Math.floor(maxLen * 0.9));
    };
    syncCount();
    field.addEventListener('input', syncCount);
  });

  document.querySelectorAll('[data-validate-email]').forEach(input => {
    const errorEl = document.getElementById(input.getAttribute('data-error-target') || '');
    const container = input.closest('.pill-input-box') || input;
    const wrapper = input.closest('.input-wrapper');
    const defaultFormatMsg = errorEl ? errorEl.textContent.trim() : "Format email tidak valid; wajib memuat '@' dan domain (contoh: .com).";
    const requiredMsg = input.getAttribute('data-error-msg') || 'Alamat email wajib diisi.';
    const syncEmail = () => {
      const trimmed = input.value.trim();
      const ok = Boolean(trimmed) && isEmailValid(trimmed);
      container.classList.toggle('has-error', !ok);
      if (wrapper) wrapper.classList.toggle('has-error', !ok);
      if (ok) {
        input.removeAttribute('aria-invalid');
        if (errorEl) errorEl.style.display = 'none';
      } else {
        input.setAttribute('aria-invalid', 'true');
        if (errorEl) {
          setErrorMessageContent(errorEl, !trimmed && input.hasAttribute('required') ? requiredMsg : defaultFormatMsg);
          errorEl.style.display = 'flex';
        }
      }
    };
    input.addEventListener('input', syncEmail);
  });

  document.querySelectorAll('[data-min-length]').forEach(field => {
    const minLen = parseInt(field.getAttribute('data-min-length') || '1', 10);
    const errorEl = document.getElementById(field.getAttribute('data-error-target') || '');
    const wrapper = field.closest('.input-wrapper');
    const syncLength = () => {
      const ok = field.value.trim().length >= minLen;
      field.classList.toggle('has-error', !ok);
      if (wrapper) wrapper.classList.toggle('has-error', !ok);
      if (ok) field.removeAttribute('aria-invalid');
      else field.setAttribute('aria-invalid', 'true');
      if (errorEl) errorEl.style.display = ok ? 'none' : 'flex';
    };
    field.addEventListener('input', syncLength);
  });
}

function getFormFieldTarget(input) {
  const selectWrapper = input.closest('.custom-select-wrapper');
  if (selectWrapper) {
    return selectWrapper.querySelector('.select-trigger') || input;
  }
  const dateWrapper = input.closest('.datepicker-container');
  if (dateWrapper) {
    return dateWrapper.querySelector('.datepicker-trigger') || input;
  }
  return input;
}

function validateRequiredField(input) {
  if (input.disabled || input.closest('.is-disabled')) return null;

  const wrapper = input.closest('.input-wrapper');
  const focusTarget = getFormFieldTarget(input);

  let isEmpty = false;
  if (input.type === 'checkbox') {
    isEmpty = !input.checked;
  } else if (input.type === 'radio') {
    const scope = input.form || document;
    isEmpty = !scope.querySelector(`input[type="radio"][name="${input.name}"]:checked`);
  } else {
    isEmpty = !input.value.trim();
  }

  const emailInvalid = input.type === 'email' && !isEmpty && !isEmailValid(input.value);

  if (isEmpty || emailInvalid) {
    const hasStatic = Boolean(wrapper && wrapper.querySelector('.error-message[data-static-error="true"]'));
    const msg = emailInvalid
      ? (input.getAttribute('data-email-error-msg') || "Format email tidak valid; wajib memuat '@' dan domain (contoh: .com).")
      : (input.getAttribute('data-error-msg') || 'Bidang ini wajib diisi.');
    renderFieldError(wrapper, focusTarget, msg, hasStatic);
    return focusTarget;
  }

  clearFieldError(wrapper, focusTarget);
  return null;
}

function syncFormErrorSummary(form) {
  const summary = form.querySelector('[data-form-error-summary]');
  if (!summary) return;
  const invalidCount = form.querySelectorAll('.input-wrapper.has-error').length;
  const textEl = summary.querySelector('[data-form-error-summary-text]');
  if (invalidCount > 0) {
    if (textEl) {
      textEl.textContent = `Harap periksa ${invalidCount} kolom yang ditandai merah sebelum menyimpan data.`;
    }
    summary.classList.add('is-visible');
  } else {
    summary.classList.remove('is-visible');
  }
}

function initForms() {
  const forms = document.querySelectorAll('form[data-validate]');

  forms.forEach(form => {
    form.querySelectorAll('[required], input[type="email"]').forEach(input => {
      const eventName = (input.type === 'hidden' || input.type === 'checkbox' || input.type === 'radio')
        ? 'change'
        : 'input';

      input.addEventListener(eventName, () => {
        input.dataset.ffTouched = 'true';
        const wrapper = input.closest('.input-wrapper');
        const focusTarget = getFormFieldTarget(input);
        if (
          (wrapper && wrapper.classList.contains('has-error')) ||
          (focusTarget && focusTarget.classList.contains('has-error'))
        ) {
          validateRequiredField(input);
          syncFormErrorSummary(form);
        }
      });

      if (input.type !== 'hidden' && input.type !== 'checkbox' && input.type !== 'radio') {
        input.addEventListener('blur', () => {
          const val = input.value.trim();
          const malformedEmail = input.type === 'email' && Boolean(val) && !isEmailValid(val);
          if (malformedEmail || input.dataset.ffTouched === 'true') {
            validateRequiredField(input);
            syncFormErrorSummary(form);
          }
        });
      }
    });

    form.addEventListener('reset', () => {
      setTimeout(() => {
        form.querySelectorAll('.input-wrapper').forEach(w => {
          const ctrl = w.querySelector('input:not([type="hidden"]), textarea, .select-trigger, .datepicker-trigger');
          clearFieldError(w, ctrl);
          const pillBox = w.querySelector('.pill-input-box');
          if (pillBox) pillBox.classList.remove('has-error');
        });
        form.querySelectorAll('[data-ff-touched]').forEach(el => delete el.dataset.ffTouched);

        form.querySelectorAll('.custom-select-wrapper').forEach(selectWrap => {
          const hiddenInput = selectWrap.querySelector('.select-value');
          const displayInput = selectWrap.querySelector('.select-display');
          const trigger = selectWrap.querySelector('.select-trigger');
          const options = selectWrap.querySelectorAll('.select-option');
          if (hiddenInput) hiddenInput.value = '';
          if (displayInput) displayInput.value = '';
          selectWrap.classList.remove('has-value', 'is-open');
          if (trigger) {
            trigger.classList.remove('has-value', 'has-error');
            trigger.setAttribute('aria-expanded', 'false');
          }
          options.forEach(opt => {
            opt.classList.remove('is-selected');
            opt.setAttribute('aria-selected', 'false');
          });
        });

        form.querySelectorAll('[data-char-counter]').forEach(field => {
          const counter = document.getElementById(field.getAttribute('data-char-counter'));
          if (counter) {
            const maxLen = field.getAttribute('maxlength') || '250';
            counter.textContent = `${field.value.length} / ${maxLen} karakter`;
            counter.classList.remove('input-counter-warning');
          }
        });

        syncFormErrorSummary(form);
      }, 0);
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('[type="submit"]') || form.querySelector('[data-submit-btn]');
      if (submitBtn && submitBtn.classList.contains('is-loading')) return;

      const requiredInputs = form.querySelectorAll('[required]');
      let firstInvalid = null;

      form.querySelectorAll('.input-wrapper').forEach(w => {
        if (!w.querySelector('[data-static-error="true"]')) {
          w.classList.remove('has-error');
        }
      });
      form.querySelectorAll('.error-message[data-generated-error="true"]').forEach(m => m.remove());

      requiredInputs.forEach(input => {
        const invalidTarget = validateRequiredField(input);
        if (invalidTarget && !firstInvalid) {
          firstInvalid = invalidTarget;
        }
      });

      syncFormErrorSummary(form);

      if (firstInvalid) {
        firstInvalid.focus();
        if (window.showToast) {
          window.showToast('Harap periksa kolom yang ditandai merah.', 'error', true);
        }
        return;
      }

      if (submitBtn) {
        const origHtml = submitBtn.innerHTML;
        submitBtn.classList.add('is-loading');
        submitBtn.setAttribute('aria-busy', 'true');
        submitBtn.innerHTML = '<span class="spinner spinner-sm spinner-white" aria-hidden="true"></span><span>Menyimpan...</span>';
        setTimeout(() => {
          submitBtn.classList.remove('is-loading');
          submitBtn.removeAttribute('aria-busy');
          submitBtn.innerHTML = origHtml;
          if (window.showToast) {
            window.showToast('Data penghuni berhasil disimpan ke sistem.', 'success', false);
          }
        }, 1200);
      }
    });
  });
}

// 4. Interactive Custom Datepicker Engine (CMP-02 / Estify Signature)
function initDatepickers() {
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const monthShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  const dayNames = [
    'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
  ];

  function formatDisplayDate(date) {
    const dayName = dayNames[date.getDay()];
    const dayNum = date.getDate();
    const month = monthShort[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName}, ${dayNum} ${month} ${year}`;
  }

  function formatIsoDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const containers = document.querySelectorAll('.datepicker-container');
  containers.forEach(container => {
    const displayInput = container.querySelector('.datepicker-display');
    const hiddenInput = container.querySelector('.datepicker-value');
    const popover = container.querySelector('.datepicker-popover');
    if (!displayInput || !popover) return;

    let initialIso = hiddenInput ? hiddenInput.value : '2026-11-25';
    let selectedDate = initialIso ? new Date(initialIso + 'T00:00:00') : new Date(2026, 10, 25);
    let viewYear = selectedDate.getFullYear();
    let viewMonth = selectedDate.getMonth();

    const titleEl = popover.querySelector('.datepicker-title');
    const daysEl = popover.querySelector('.datepicker-days');
    const prevBtn = popover.querySelector('.prev-month');
    const nextBtn = popover.querySelector('.next-month');
    const todayBtn = popover.querySelector('.datepicker-today-btn');
    const clearBtn = popover.querySelector('.datepicker-clear-btn');
    const trigger = container.querySelector('.datepicker-trigger');

    function renderCalendar() {
      if (titleEl) {
        titleEl.textContent = `${monthNames[viewMonth]} ${viewYear}`;
      }
      if (!daysEl) return;
      daysEl.innerHTML = '';

      const firstDay = new Date(viewYear, viewMonth, 1).getDay();
      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
      const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

      const today = new Date();
      const isTodayCurrentMonth = today.getFullYear() === viewYear && today.getMonth() === viewMonth;
      const todayDate = today.getDate();

      // Leading padding days from previous month
      for (let i = firstDay - 1; i >= 0; i--) {
        const dayNum = daysInPrevMonth - i;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'datepicker-day is-outside';
        btn.textContent = dayNum;
        btn.setAttribute('aria-label', `${dayNum} ${monthNames[(viewMonth + 11) % 12]}`);
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          viewMonth--;
          if (viewMonth < 0) {
            viewMonth = 11;
            viewYear--;
          }
          selectDate(new Date(viewYear, viewMonth, dayNum));
        });
        daysEl.appendChild(btn);
      }

      // Days of current month
      for (let d = 1; d <= daysInMonth; d++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'datepicker-day';
        btn.textContent = d;
        btn.setAttribute('aria-label', `${d} ${monthNames[viewMonth]} ${viewYear}`);

        const isSelected = selectedDate &&
          selectedDate.getFullYear() === viewYear &&
          selectedDate.getMonth() === viewMonth &&
          selectedDate.getDate() === d;

        if (isSelected) {
          btn.classList.add('is-selected');
        } else if (isTodayCurrentMonth && d === todayDate) {
          btn.classList.add('is-today');
        }

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          selectDate(new Date(viewYear, viewMonth, d));
        });
        daysEl.appendChild(btn);
      }

      // Trailing padding days to fill 35 or 42 slots
      const totalCells = firstDay + daysInMonth;
      const remainingCells = (totalCells > 35 ? 42 : 35) - totalCells;
      for (let j = 1; j <= remainingCells; j++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'datepicker-day is-outside';
        btn.textContent = j;
        btn.setAttribute('aria-label', `${j} ${monthNames[(viewMonth + 1) % 12]}`);
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          viewMonth++;
          if (viewMonth > 11) {
            viewMonth = 0;
            viewYear++;
          }
          selectDate(new Date(viewYear, viewMonth, j));
        });
        daysEl.appendChild(btn);
      }
    }

    const srValueEl = trigger ? trigger.querySelector('.datepicker-sr-value') : null;

    function syncSrValue(text) {
      if (srValueEl) srValueEl.textContent = text || 'Belum dipilih';
    }

    if (displayInput.value) {
      syncSrValue(displayInput.value);
    }

    function selectDate(date) {
      selectedDate = date;
      viewYear = date.getFullYear();
      viewMonth = date.getMonth();
      const formatted = formatDisplayDate(date);
      displayInput.value = formatted;
      syncSrValue(formatted);
      if (hiddenInput) {
        hiddenInput.value = formatIsoDate(date);
        hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      displayInput.dispatchEvent(new Event('input', { bubbles: true }));
      if (trigger) {
        trigger.classList.remove('has-error');
        clearFieldError(container.closest('.input-wrapper'), trigger);
      }
      renderCalendar();
      closePicker(true);
    }

    function clearDate() {
      selectedDate = null;
      displayInput.value = '';
      syncSrValue('');
      if (hiddenInput) {
        hiddenInput.value = '';
        hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      displayInput.dispatchEvent(new Event('input', { bubbles: true }));
      renderCalendar();
      closePicker(true);
    }

    function openPicker(focusCalendar = false) {
      closeOtherFloatingMenus(container);
      container.classList.add('is-open');
      if (trigger) trigger.setAttribute('aria-expanded', 'true');
      renderCalendar();
      if (focusCalendar && daysEl) {
        const focusTarget =
          daysEl.querySelector('.datepicker-day.is-selected') ||
          daysEl.querySelector('.datepicker-day:not(.is-outside)');
        if (focusTarget) focusTarget.focus();
      }
    }

    function closePicker(restoreFocus = false) {
      container.classList.remove('is-open');
      if (trigger) {
        trigger.setAttribute('aria-expanded', 'false');
        if (restoreFocus) trigger.focus();
      }
    }

    function togglePicker(viaKeyboard = false) {
      if (container.classList.contains('is-open')) {
        closePicker(viaKeyboard);
      } else {
        openPicker(viaKeyboard);
      }
    }

    if (trigger) {
      const label = container.closest('.input-wrapper')?.querySelector('label');
      if (label) {
        label.addEventListener('click', (e) => {
          e.preventDefault();
          trigger.focus();
        });
      }
      trigger.addEventListener('click', () => {
        togglePicker(false);
      });
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          togglePicker(true);
        }
      });
    }

    if (daysEl) {
      daysEl.addEventListener('keydown', (e) => {
        const dayBtn = e.target.closest('.datepicker-day');
        if (!dayBtn) return;
        const buttons = Array.from(daysEl.querySelectorAll('.datepicker-day'));
        const idx = buttons.indexOf(dayBtn);
        let nextIdx = -1;
        if (e.key === 'ArrowRight') nextIdx = Math.min(buttons.length - 1, idx + 1);
        else if (e.key === 'ArrowLeft') nextIdx = Math.max(0, idx - 1);
        else if (e.key === 'ArrowDown') nextIdx = Math.min(buttons.length - 1, idx + 7);
        else if (e.key === 'ArrowUp') nextIdx = Math.max(0, idx - 7);
        else if (e.key === 'Escape') {
          e.preventDefault();
          closePicker(true);
          return;
        }
        if (nextIdx >= 0 && buttons[nextIdx]) {
          e.preventDefault();
          buttons[nextIdx].focus();
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        viewMonth--;
        if (viewMonth < 0) {
          viewMonth = 11;
          viewYear--;
        }
        renderCalendar();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        viewMonth++;
        if (viewMonth > 11) {
          viewMonth = 0;
          viewYear++;
        }
        renderCalendar();
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const now = new Date();
        selectDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearDate();
      });
    }

    container.addEventListener('focusout', (e) => {
      if (container.classList.contains('is-open') && e.relatedTarget && !container.contains(e.relatedTarget)) {
        closePicker(false);
      }
    });

    renderCalendar();
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.datepicker-container')) {
      document.querySelectorAll('.datepicker-container.is-open').forEach(c => {
        c.classList.remove('is-open');
        const trigger = c.querySelector('.datepicker-trigger');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      });
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.datepicker-container.is-open').forEach(c => {
        const hasFocusInside = c.contains(document.activeElement);
        c.classList.remove('is-open');
        const trigger = c.querySelector('.datepicker-trigger');
        if (trigger) {
          trigger.setAttribute('aria-expanded', 'false');
          if (hasFocusInside) trigger.focus();
        }
      });
    }
  });
}

// 6. Custom Select / PopoverMenu Engine (CMP-04 — Zero Raw Native Select, 100% Borderless)
let selectAutoIdCounter = 0;

function applyPopoverPlacement(trigger, popover, wrapper) {
  wrapper.classList.remove('is-open-up', 'is-flip-right', 'is-flip-left');
  const triggerRect = trigger.getBoundingClientRect();
  const popHeight = Math.min(popover.scrollHeight || 240, 320);
  const spaceBelow = window.innerHeight - triggerRect.bottom;
  const spaceAbove = triggerRect.top;
  if (spaceBelow < popHeight + 12 && spaceAbove > spaceBelow) {
    wrapper.classList.add('is-open-up');
  }

  const vw = document.documentElement.clientWidth || window.innerWidth;
  const popRect = popover.getBoundingClientRect();
  const alignRight = wrapper.classList.contains('is-align-right');
  if (!alignRight && popRect.right > vw - 12 && triggerRect.right > vw - triggerRect.left) {
    wrapper.classList.add('is-flip-right');
  } else if (alignRight && popRect.left < 12 && (vw - triggerRect.left) > triggerRect.right) {
    wrapper.classList.add('is-flip-left');
  }
}

function closeOtherFloatingMenus(excludeWrapper) {
  document.querySelectorAll('.custom-select-wrapper.is-open').forEach(w => {
    if (w !== excludeWrapper) {
      if (typeof w._closeSelect === 'function') {
        w._closeSelect(false);
      } else {
        w.classList.remove('is-open', 'is-open-up', 'is-flip-right', 'is-flip-left');
        const t = w.querySelector('.select-trigger');
        if (t) {
          t.setAttribute('aria-expanded', 'false');
          t.removeAttribute('aria-activedescendant');
        }
      }
    }
  });
  document.querySelectorAll('.popover-menu-wrapper.is-open').forEach(m => {
    if (m !== excludeWrapper) {
      if (typeof m._closeMenu === 'function') {
        m._closeMenu(false);
      } else {
        m.classList.remove('is-open', 'is-open-up', 'is-flip-right', 'is-flip-left');
        const t = m.querySelector('[data-popover-menu-trigger]');
        if (t) t.setAttribute('aria-expanded', 'false');
      }
    }
  });
  document.querySelectorAll('.datepicker-container.is-open').forEach(d => {
    if (d !== excludeWrapper) {
      d.classList.remove('is-open');
      const t = d.querySelector('.datepicker-trigger');
      if (t) t.setAttribute('aria-expanded', 'false');
    }
  });
}

function initSelects() {
  const wrappers = document.querySelectorAll('.custom-select-wrapper:not([data-initialized])');
  wrappers.forEach(wrapper => {
    wrapper.setAttribute('data-initialized', 'true');
    const trigger = wrapper.querySelector('.select-trigger');
    const popover = wrapper.querySelector('.select-popover');
    const hiddenInput = wrapper.querySelector('.select-value');
    const displayInput = wrapper.querySelector('.select-display');
    const labelDisplay = wrapper.querySelector('.select-label-text');
    const options = Array.from(wrapper.querySelectorAll('.select-option'));
    const inputWrapper = wrapper.closest('.input-wrapper');
    if (!trigger || !popover) return;

    selectAutoIdCounter += 1;
    if (!popover.id) {
      popover.id = `${wrapper.id || `select-${selectAutoIdCounter}`}-listbox`;
    }
    if (!trigger.hasAttribute('aria-controls')) {
      trigger.setAttribute('aria-controls', popover.id);
    }

    options.forEach((opt, idx) => {
      if (!opt.id) {
        opt.id = `${popover.id}-opt-${idx}`;
      }
    });

    function isSelectDisabled() {
      return (
        trigger.hasAttribute('disabled') ||
        trigger.classList.contains('is-disabled') ||
        trigger.getAttribute('aria-disabled') === 'true' ||
        Boolean(displayInput && displayInput.hasAttribute('disabled'))
      );
    }

    function isOptionDisabled(opt) {
      return !opt || opt.classList.contains('is-disabled') || opt.getAttribute('aria-disabled') === 'true';
    }

    function getEnabledIndices() {
      return options.reduce((acc, opt, idx) => {
        if (!isOptionDisabled(opt)) acc.push(idx);
        return acc;
      }, []);
    }

    // Initial check for pre-selected value
    const hasInitialVal = Boolean(
      (hiddenInput && hiddenInput.value && hiddenInput.value.trim() !== '') ||
      (displayInput && displayInput.value && displayInput.value.trim() !== '') ||
      (labelDisplay && labelDisplay.textContent && labelDisplay.textContent.trim() !== '')
    );
    if (hasInitialVal && !isSelectDisabled()) {
      trigger.classList.add('has-value');
      wrapper.classList.add('has-value');
      const prefixIcon = trigger.querySelector('.select-prefix-icon');
      if (prefixIcon) prefixIcon.classList.remove('text-muted');
    }

    const label = inputWrapper?.querySelector('label');
    if (label) {
      label.addEventListener('click', (e) => {
        e.preventDefault();
        if (!isSelectDisabled()) trigger.focus();
      });
    }

    let highlightedIndex = -1;

    function updateHighlight() {
      options.forEach((opt, idx) => {
        if (idx === highlightedIndex && !isOptionDisabled(opt)) {
          opt.classList.add('is-highlighted');
          trigger.setAttribute('aria-activedescendant', opt.id);
          opt.scrollIntoView({ block: 'nearest' });
        } else {
          opt.classList.remove('is-highlighted');
        }
      });
      if (highlightedIndex < 0 || highlightedIndex >= options.length || isOptionDisabled(options[highlightedIndex])) {
        trigger.removeAttribute('aria-activedescendant');
      }
    }

    function closeSelect(restoreFocus = false) {
      wrapper.classList.remove('is-open', 'is-open-up', 'is-flip-right', 'is-flip-left');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.removeAttribute('aria-activedescendant');
      options.forEach(o => o.classList.remove('is-highlighted'));
      highlightedIndex = -1;
      if (restoreFocus && !isSelectDisabled()) {
        trigger.focus();
      }
    }

    wrapper._closeSelect = closeSelect;

    function openSelect(direction = 'down') {
      if (isSelectDisabled()) return;

      closeOtherFloatingMenus(wrapper);

      wrapper.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      applyPopoverPlacement(trigger, popover, wrapper);

      const enabled = getEnabledIndices();
      if (!enabled.length) {
        highlightedIndex = -1;
      } else {
        const selectedIdx = enabled.find(i => options[i].classList.contains('is-selected'));
        if (selectedIdx !== undefined) {
          highlightedIndex = selectedIdx;
        } else {
          highlightedIndex = direction === 'up' ? enabled[enabled.length - 1] : enabled[0];
        }
      }
      updateHighlight();
    }

    function toggleSelect() {
      if (isSelectDisabled()) return;
      if (wrapper.classList.contains('is-open')) {
        closeSelect(false);
      } else {
        openSelect('down');
      }
    }

    function clearFieldErrorUI() {
      trigger.classList.remove('has-error');
      clearFieldError(inputWrapper, trigger);
      if (!inputWrapper) return;

      const staticIds = [];
      inputWrapper.querySelectorAll('.error-message[data-static-error="true"]').forEach(err => {
        if (err.id) staticIds.push(err.id);
        err.style.display = 'none';
      });

      if (staticIds.length && trigger.hasAttribute('aria-describedby')) {
        const remaining = trigger
          .getAttribute('aria-describedby')
          .split(/\s+/)
          .filter(id => id && !staticIds.includes(id));
        if (remaining.length) trigger.setAttribute('aria-describedby', remaining.join(' '));
        else trigger.removeAttribute('aria-describedby');
      }
    }

    function selectOption(opt) {
      if (!opt || isOptionDisabled(opt)) return;
      const rawVal = opt.getAttribute('data-value');
      const val = rawVal !== null ? rawVal : opt.textContent.trim();
      const titleSpan = opt.querySelector('.option-title');
      const text = titleSpan ? titleSpan.textContent.trim() : opt.textContent.trim();

      if (displayInput) {
        displayInput.value = text;
        displayInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (labelDisplay) {
        const prefix = labelDisplay.getAttribute('data-label-prefix') || '';
        labelDisplay.textContent = prefix ? `${prefix}${text}` : text;
        labelDisplay.classList.remove('text-muted');
      }

      const prefixIcon = trigger.querySelector('.select-prefix-icon');
      if (val) {
        clearFieldErrorUI();
        trigger.classList.add('has-value');
        wrapper.classList.add('has-value');
        if (prefixIcon) prefixIcon.classList.remove('text-muted');
      } else {
        trigger.classList.remove('has-value');
        wrapper.classList.remove('has-value');
        if (prefixIcon) prefixIcon.classList.add('text-muted');
      }

      options.forEach(o => {
        o.classList.remove('is-selected');
        o.setAttribute('aria-selected', 'false');
      });
      opt.classList.add('is-selected');
      opt.setAttribute('aria-selected', 'true');

      if (hiddenInput) {
        hiddenInput.value = val;
        hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
      }

      closeSelect(true);
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSelect();
    });

    trigger.addEventListener('keydown', (e) => {
      if (isSelectDisabled()) return;
      const isOpen = wrapper.classList.contains('is-open');
      const enabled = getEnabledIndices();

      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          openSelect(e.key === 'ArrowUp' ? 'up' : 'down');
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!enabled.length) return;
        const pos = enabled.indexOf(highlightedIndex);
        highlightedIndex = enabled[(pos + 1) % enabled.length];
        updateHighlight();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!enabled.length) return;
        const pos = enabled.indexOf(highlightedIndex);
        highlightedIndex = pos <= 0 ? enabled[enabled.length - 1] : enabled[pos - 1];
        updateHighlight();
      } else if (e.key === 'Home') {
        e.preventDefault();
        if (!enabled.length) return;
        highlightedIndex = enabled[0];
        updateHighlight();
      } else if (e.key === 'End') {
        e.preventDefault();
        if (!enabled.length) return;
        highlightedIndex = enabled[enabled.length - 1];
        updateHighlight();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length && !isOptionDisabled(options[highlightedIndex])) {
          selectOption(options[highlightedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeSelect(true);
      } else if (e.key === 'Tab') {
        closeSelect(false);
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const needle = e.key.toLowerCase();
        if (!enabled.length) return;
        const startPos = Math.max(0, enabled.indexOf(highlightedIndex) + 1);
        const rotated = enabled.slice(startPos).concat(enabled.slice(0, startPos));
        const matchIdx = rotated.find(idx => {
          const titleSpan = options[idx].querySelector('.option-title');
          const labelText = (titleSpan ? titleSpan.textContent : options[idx].textContent).trim().toLowerCase();
          return labelText.startsWith(needle);
        });
        if (matchIdx !== undefined) {
          e.preventDefault();
          highlightedIndex = matchIdx;
          updateHighlight();
        }
      }
    });

    options.forEach((opt, idx) => {
      opt.addEventListener('mouseenter', () => {
        if (isOptionDisabled(opt)) return;
        highlightedIndex = idx;
        updateHighlight();
      });

      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isOptionDisabled(opt)) return;
        selectOption(opt);
      });
    });

    wrapper.addEventListener('focusout', (e) => {
      if (wrapper.classList.contains('is-open') && e.relatedTarget && !wrapper.contains(e.relatedTarget)) {
        closeSelect(false);
      }
    });
  });

  // Interactive anatomy preview listbox inside CMP-04 showcase
  document.querySelectorAll('.select-popover-preview:not([data-initialized])').forEach(preview => {
    preview.setAttribute('data-initialized', 'true');
    const previewOptions = Array.from(preview.querySelectorAll('.select-option'));
    previewOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        if (opt.classList.contains('is-disabled') || opt.getAttribute('aria-disabled') === 'true') return;
        previewOptions.forEach(o => {
          o.classList.remove('is-selected');
          o.setAttribute('aria-selected', 'false');
        });
        opt.classList.add('is-selected');
        opt.setAttribute('aria-selected', 'true');
      });
    });
  });

  if (!initSelects._boundGlobal) {
    initSelects._boundGlobal = true;

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.custom-select-wrapper')) {
        document.querySelectorAll('.custom-select-wrapper.is-open').forEach(w => {
          if (typeof w._closeSelect === 'function') {
            w._closeSelect(false);
          } else {
            w.classList.remove('is-open', 'is-open-up', 'is-flip-right', 'is-flip-left');
            const trigger = w.querySelector('.select-trigger');
            if (trigger) {
              trigger.setAttribute('aria-expanded', 'false');
              trigger.removeAttribute('aria-activedescendant');
            }
          }
        });
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.custom-select-wrapper.is-open').forEach(w => {
          const hasFocusInside = w.contains(document.activeElement);
          if (typeof w._closeSelect === 'function') {
            w._closeSelect(hasFocusInside);
          } else {
            w.classList.remove('is-open', 'is-open-up', 'is-flip-right', 'is-flip-left');
            const trigger = w.querySelector('.select-trigger');
            if (trigger) {
              trigger.setAttribute('aria-expanded', 'false');
              trigger.removeAttribute('aria-activedescendant');
              if (hasFocusInside) trigger.focus();
            }
          }
        });
      }
    });

    window.addEventListener('resize', () => {
      document.querySelectorAll('.custom-select-wrapper.is-open').forEach(w => {
        const trigger = w.querySelector('.select-trigger');
        const popover = w.querySelector('.select-popover');
        if (trigger && popover) applyPopoverPlacement(trigger, popover, w);
      });
      document.querySelectorAll('.popover-menu-wrapper.is-open').forEach(m => {
        const trigger = m.querySelector('[data-popover-menu-trigger]');
        const menu = m.querySelector('.popover-menu');
        if (trigger && menu) applyPopoverPlacement(trigger, menu, m);
      });
    });
  }
}

// 7. Action PopoverMenu Engine (CMP-04 — WAI-ARIA Menu Button, 100% Borderless)
function initPopoverMenus() {
  const wrappers = document.querySelectorAll('.popover-menu-wrapper:not([data-initialized])');
  wrappers.forEach(wrapper => {
    wrapper.setAttribute('data-initialized', 'true');
    const trigger = wrapper.querySelector('[data-popover-menu-trigger]');
    const menu = wrapper.querySelector('.popover-menu');
    const items = Array.from(wrapper.querySelectorAll('.popover-menu-item'));
    if (!trigger || !menu) return;

    function isItemDisabled(item) {
      return !item || item.disabled || item.getAttribute('aria-disabled') === 'true';
    }

    function getEnabledItems() {
      return items.filter(item => !isItemDisabled(item));
    }

    function closeMenu(restoreFocus = false) {
      wrapper.classList.remove('is-open', 'is-open-up', 'is-flip-right', 'is-flip-left');
      trigger.setAttribute('aria-expanded', 'false');
      if (restoreFocus && !trigger.disabled) {
        trigger.focus();
      }
    }

    wrapper._closeMenu = closeMenu;

    function openMenu(focusTarget = 'none') {
      if (trigger.disabled) return;
      closeOtherFloatingMenus(wrapper);
      wrapper.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      applyPopoverPlacement(trigger, menu, wrapper);

      const enabled = getEnabledItems();
      if (enabled.length && focusTarget === 'first') {
        enabled[0].focus();
      } else if (enabled.length && focusTarget === 'last') {
        enabled[enabled.length - 1].focus();
      }
    }

    function activateItem(item) {
      if (isItemDisabled(item)) return;
      const msg = item.getAttribute('data-menu-toast');
      const tone = item.getAttribute('data-menu-tone') || (item.classList.contains('is-destructive') ? 'error' : 'neutral');
      closeMenu(true);
      if (msg && window.showToast) {
        window.showToast(msg, tone, tone === 'error');
      }
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (wrapper.classList.contains('is-open')) {
        closeMenu(false);
      } else {
        openMenu('none');
      }
    });

    trigger.addEventListener('keydown', (e) => {
      const isOpen = wrapper.classList.contains('is-open');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (isOpen) {
          const enabled = getEnabledItems();
          if (enabled.length) enabled[0].focus();
        } else {
          openMenu('first');
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (isOpen) {
          const enabled = getEnabledItems();
          if (enabled.length) enabled[enabled.length - 1].focus();
        } else {
          openMenu('last');
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (isOpen) {
          closeMenu(true);
        } else {
          openMenu('first');
        }
      } else if (e.key === 'Tab' && isOpen) {
        closeMenu(false);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        e.stopPropagation();
        closeMenu(true);
      }
    });

    items.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        activateItem(item);
      });

      item.addEventListener('keydown', (e) => {
        const enabled = getEnabledItems();
        if (!enabled.length) return;
        const idx = enabled.indexOf(item);

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          enabled[(idx + 1) % enabled.length].focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          enabled[(idx - 1 + enabled.length) % enabled.length].focus();
        } else if (e.key === 'Home') {
          e.preventDefault();
          enabled[0].focus();
        } else if (e.key === 'End') {
          e.preventDefault();
          enabled[enabled.length - 1].focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activateItem(item);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          closeMenu(true);
        } else if (e.key === 'Tab') {
          closeMenu(false);
        } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const needle = e.key.toLowerCase();
          const rotated = enabled.slice(idx + 1).concat(enabled.slice(0, idx + 1));
          const match = rotated.find(el => el.textContent.trim().toLowerCase().startsWith(needle));
          if (match) {
            e.preventDefault();
            match.focus();
          }
        }
      });
    });

    wrapper.addEventListener('focusout', (e) => {
      if (wrapper.classList.contains('is-open') && e.relatedTarget && !wrapper.contains(e.relatedTarget)) {
        closeMenu(false);
      }
    });
  });

  if (!initPopoverMenus._boundGlobal) {
    initPopoverMenus._boundGlobal = true;

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.popover-menu-wrapper')) {
        document.querySelectorAll('.popover-menu-wrapper.is-open').forEach(m => {
          if (typeof m._closeMenu === 'function') m._closeMenu(false);
        });
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.popover-menu-wrapper.is-open').forEach(m => {
          const hasFocusInside = m.contains(document.activeElement);
          if (typeof m._closeMenu === 'function') m._closeMenu(hasFocusInside);
        });
      }
    });
  }
}

// 7. Operational Badges Dismissible & Keyboard Focus Handoff (CMP-05)
function initBadges() {
  document.querySelectorAll('[data-badge-dismiss]').forEach(btn => {
    const tag = btn.closest('[data-dismissible-badge]');
    const row = btn.closest('#cmp05-tag-row') || (tag && tag.parentElement);
    if (!tag || !row) return;

    btn.addEventListener('click', () => {
      const label = btn.getAttribute('data-badge-dismiss') || 'Filter';
      const restoreBtn = row.querySelector('[data-badge-restore]');
      tag.style.display = 'none';

      const remainingVisibleDismissBtns = Array.from(row.querySelectorAll('[data-dismissible-badge]'))
        .filter(el => el.style.display !== 'none')
        .map(el => el.querySelector('.badge-close-btn'))
        .filter(Boolean);

      if (restoreBtn) {
        restoreBtn.style.display = 'inline-flex';
      }

      if (remainingVisibleDismissBtns.length > 0) {
        remainingVisibleDismissBtns[0].focus();
      } else if (restoreBtn) {
        restoreBtn.focus();
      } else {
        const nextInteractive = row.querySelector('button.badge, a.badge');
        if (nextInteractive) nextInteractive.focus();
      }

      if (window.showToast) {
        window.showToast(`Tag filter "${label}" dihapus.`, 'neutral', false);
      }
    });
  });

  document.querySelectorAll('[data-badge-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const nextPressed = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(nextPressed));
      btn.classList.toggle('badge-brand', nextPressed);
      btn.classList.toggle('badge-neutral', !nextPressed);
      if (window.showToast) {
        window.showToast(
          nextPressed ? 'Filter cepat "Unit Tersedia" diaktifkan.' : 'Filter cepat "Unit Tersedia" dinonaktifkan.',
          nextPressed ? 'brand' : 'neutral',
          false
        );
      }
    });
  });

  document.querySelectorAll('[data-badge-restore]').forEach(restoreBtn => {
    restoreBtn.addEventListener('click', () => {
      const targetId = restoreBtn.getAttribute('data-badge-restore');
      const row = document.getElementById(targetId) || restoreBtn.parentElement;
      if (!row) return;
      const tags = Array.from(row.querySelectorAll('[data-dismissible-badge]'));
      tags.forEach(t => {
        t.style.display = 'inline-flex';
      });
      restoreBtn.style.display = 'none';
      const firstClose = tags[0] && tags[0].querySelector('.badge-close-btn');
      if (firstClose) firstClose.focus();
      if (window.showToast) {
        window.showToast('Tag filter dipulihkan.', 'brand', false);
      }
    });
  });
}

// 8. Boolean Controls System (CMP-06: Indeterminate Demo & Required Consent Error Recovery)
function initBooleanControls() {
  const indetChk = document.getElementById('chk-indeterminate-demo');
  const indetLabel = document.getElementById('chk-indeterminate-label');
  const resetIndetBtn = document.getElementById('btn-reset-indeterminate');

  if (indetChk) {
    const applyIndeterminateState = () => {
      indetChk.checked = false;
      indetChk.indeterminate = true;
      indetChk.setAttribute('aria-checked', 'mixed');
      if (indetLabel) indetLabel.textContent = 'Pilih Semua Kamar Terisi (8 dari 12 Terpilih)';
      if (resetIndetBtn) resetIndetBtn.style.display = 'none';
    };

    applyIndeterminateState();

    indetChk.addEventListener('change', () => {
      indetChk.indeterminate = false;
      indetChk.setAttribute('aria-checked', String(indetChk.checked));
      if (indetLabel) {
        indetLabel.textContent = indetChk.checked
          ? 'Pilih Semua Kamar Terisi (12 dari 12 Terpilih)'
          : 'Pilih Semua Kamar Terisi (0 dari 12 Terpilih)';
      }
      if (resetIndetBtn) {
        resetIndetBtn.style.display = 'inline-flex';
      }
    });

    if (resetIndetBtn) {
      resetIndetBtn.addEventListener('click', () => {
        applyIndeterminateState();
        indetChk.focus();
      });
    }
  }

  const consentChk = document.getElementById('chk-consent-error');
  const consentLabel = document.getElementById('chk-consent-label');
  const consentWrapper = document.getElementById('chk-consent-wrapper');
  const consentErrMsg = document.getElementById('chk-consent-err-msg');

  if (consentChk && consentLabel && consentWrapper && consentErrMsg) {
    consentChk.addEventListener('change', () => {
      const isValid = consentChk.checked;
      consentChk.setAttribute('aria-invalid', String(!isValid));
      consentLabel.classList.toggle('has-error', !isValid);
      consentWrapper.classList.toggle('has-error', !isValid);
      consentErrMsg.style.display = isValid ? 'none' : 'flex';
    });
  }

  const electricWrapper = document.getElementById('radio-electric-wrapper');
  const electricErrMsg = document.getElementById('radio-electric-err-msg');
  const electricLabels = Array.from(document.querySelectorAll('[data-electric-radio-label]'));
  const electricRadios = electricLabels.map(l => l.querySelector('input[type="radio"]')).filter(Boolean);

  if (electricWrapper && electricErrMsg && electricRadios.length > 0) {
    electricRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        const hasSelection = electricRadios.some(r => r.checked);
        electricWrapper.classList.toggle('has-error', !hasSelection);
        electricErrMsg.style.display = hasSelection ? 'none' : 'flex';
        electricLabels.forEach(lbl => lbl.classList.toggle('has-error', !hasSelection));
        electricRadios.forEach(r => r.setAttribute('aria-invalid', String(!hasSelection)));
      });
    });
  }
}

function initHeroBranchCarousels() {
  const branches = [
    {
      name: 'Rumakost Cilandak Executive',
      location: 'Cilandak, Jakarta Selatan',
      occupancyBadge: 'Okupansi 96%',
      titleLine1: 'Rumakost Cilandak',
      titleLine2: 'Executive',
      occupiedStrong: '23 / 24',
      roomSub: 'Kamar Terisi • Tipe Deluxe',
      revenueLabel: 'Pendapatan Nov',
      revenueVal: 'Rp 52,8 Jt',
      revenueTrend: '+8,4% vs Okt',
      tenantCounter: '+20',
      tenantSummary: '23 penghuni aktif • 1 unit kosong'
    },
    {
      name: 'Rumakost Kemang Residence',
      location: 'Kemang Timur, Jakarta Selatan',
      occupancyBadge: 'Okupansi 92%',
      titleLine1: 'Rumakost Kemang',
      titleLine2: 'Residence',
      occupiedStrong: '22 / 24',
      roomSub: 'Kamar Terisi • Tipe Suite',
      revenueLabel: 'Pendapatan Nov',
      revenueVal: 'Rp 49,4 Jt',
      revenueTrend: '+6,2% vs Okt',
      tenantCounter: '+19',
      tenantSummary: '22 penghuni aktif • 2 unit kosong'
    },
    {
      name: 'Rumakost Tebet Signature',
      location: 'Tebet Barat, Jakarta Selatan',
      occupancyBadge: 'Okupansi 100%',
      titleLine1: 'Rumakost Tebet',
      titleLine2: 'Signature',
      occupiedStrong: '18 / 18',
      roomSub: 'Kamar Terisi • Tipe Eksekutif',
      revenueLabel: 'Pendapatan Nov',
      revenueVal: 'Rp 41,2 Jt',
      revenueTrend: '+11,5% vs Okt',
      tenantCounter: '+15',
      tenantSummary: '18 penghuni aktif • Penuh terisi'
    }
  ];

  document.querySelectorAll('[data-hero-carousel]').forEach(card => {
    const dots = Array.from(card.querySelectorAll('[data-hero-slide]'));
    const ctaBtn = card.querySelector('[data-hero-cta]');
    if (!dots.length) return;

    let activeIndex = 0;

    const setField = (key, value) => {
      const el = card.querySelector(`[data-hero-field="${key}"]`);
      if (el) el.textContent = value;
    };

    const activateSlide = (index, moveFocus = false) => {
      const safeIndex = ((index % branches.length) + branches.length) % branches.length;
      activeIndex = safeIndex;
      const item = branches[safeIndex];
      if (!item) return;

      setField('location', item.location);
      setField('occupancyBadge', item.occupancyBadge);
      setField('titleLine1', item.titleLine1);
      setField('titleLine2', item.titleLine2);
      setField('occupiedStrong', item.occupiedStrong);
      setField('roomSub', item.roomSub);
      setField('revenueLabel', item.revenueLabel);
      setField('revenueVal', item.revenueVal);
      setField('revenueTrend', item.revenueTrend);
      setField('tenantCounter', item.tenantCounter);
      setField('tenantSummary', item.tenantSummary);

      dots.forEach((dot, idx) => {
        const isActive = idx === safeIndex;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-selected', String(isActive));
        dot.setAttribute('tabindex', isActive ? '0' : '-1');
        if (isActive && moveFocus) {
          dot.focus();
        }
      });
    };

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = Number(dot.getAttribute('data-hero-slide'));
        if (!Number.isNaN(idx)) activateSlide(idx, false);
      });

      dot.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          activateSlide(activeIndex + 1, true);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          activateSlide(activeIndex - 1, true);
        } else if (e.key === 'Home') {
          e.preventDefault();
          activateSlide(0, true);
        } else if (e.key === 'End') {
          e.preventDefault();
          activateSlide(branches.length - 1, true);
        }
      });
    });

    if (ctaBtn) {
      ctaBtn.addEventListener('click', () => {
        const current = branches[activeIndex];
        if (current && window.showToast) {
          window.showToast(`Membuka detail cabang ${current.name}.`, 'brand', false);
        }
      });
    }
  });
}

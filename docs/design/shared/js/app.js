/**
 * RumaKost Interactive Application Engine
 * Accessible, WCAG AA Compliant UI Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
  initModals();
  initToasts();
  initForms();
  initDropdowns();
  initDatepickers();
  initSelects();
  
  // CMP-06 Indeterminate Checkbox Demo Initialization
  const indetChk = document.getElementById('chk-indeterminate-demo');
  if (indetChk) indetChk.indeterminate = true;

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
      const origContent = btnDemoLoading.innerHTML;
      btnDemoLoading.classList.add('is-loading');
      btnDemoLoading.setAttribute('aria-busy', 'true');
      btnDemoLoading.innerHTML = '<span class="spinner spinner-sm spinner-brand" style="margin-right:0.5rem"></span> Menyimpan Kontrak...';
      setTimeout(() => {
        btnDemoLoading.classList.remove('is-loading');
        btnDemoLoading.removeAttribute('aria-busy');
        btnDemoLoading.innerHTML = origContent;
        if (window.showToast) {
          window.showToast('Data kontrak sewa berhasil disimpan! (Async 2s Selesai)', 'success', false);
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

  // CMP-02 Keyboard-accessible Dropzone
  initDropzones();
});

function initDropzones() {
  document.querySelectorAll('[data-dropzone]').forEach(zone => {
    const inputId = zone.getAttribute('data-dropzone');
    const fileInput = document.getElementById(inputId);
    const statusEl = zone.querySelector('[data-dropzone-status]');
    if (!fileInput) return;

    zone.addEventListener('click', (e) => {
      if (e.target !== fileInput) fileInput.click();
    });

    zone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
      }
    });

    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      if (statusEl) {
        statusEl.textContent = `Berkas terpilih: ${file.name}`;
      }
      if (window.showToast) {
        window.showToast(`Berkas "${file.name}" siap diunggah.`, 'success', false);
      }
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

function initForms() {
  const forms = document.querySelectorAll('form[data-validate]');

  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const requiredInputs = form.querySelectorAll('[required]');
      let firstInvalid = null;

      form.querySelectorAll('.input-wrapper').forEach(w => w.classList.remove('has-error'));
      form.querySelectorAll('.error-message').forEach(m => m.remove());

      requiredInputs.forEach(input => {
        if (!input.value.trim()) {
          const wrapper = input.closest('.input-wrapper');
          if (wrapper) {
            wrapper.classList.add('has-error');
            const err = document.createElement('span');
            err.className = 'error-message';
            err.textContent = input.getAttribute('data-error-msg') || 'Bidang ini wajib diisi';
            wrapper.appendChild(err);
          }
          if (!firstInvalid) firstInvalid = input;
        }
      });

      if (firstInvalid) {
        firstInvalid.focus();
        if (window.showToast) {
          window.showToast('Harap periksa kolom yang ditandai merah.', 'error', false);
        }
        return;
      }

      const submitBtn = form.querySelector('[type="submit"]') || form.querySelector('[data-submit-btn]');
      if (submitBtn) {
        submitBtn.classList.add('is-loading');
        setTimeout(() => {
          submitBtn.classList.remove('is-loading');
          if (window.showToast) {
            window.showToast('Data berhasil disimpan ke sistem.', 'success', false);
          }
        }, 1200);
      }
    });
  });
}

// 4. Interactive Dropdown Popover Engine (Keyboard & ARIA Compliant)
function initDropdowns() {
  function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-wrapper.is-open').forEach(d => {
      d.classList.remove('is-open');
      const t = d.querySelector('[data-dropdown-toggle]');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  }

  function openDropdown(wrapper, focusFirst = false) {
    closeAllDropdowns();
    document.querySelectorAll('.custom-select-wrapper.is-open').forEach(w => {
      w.classList.remove('is-open');
      const t = w.querySelector('.select-trigger');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
    document.querySelectorAll('.datepicker-container.is-open').forEach(d => {
      d.classList.remove('is-open');
      const t = d.querySelector('.datepicker-trigger');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
    wrapper.classList.add('is-open');
    const trigger = wrapper.querySelector('[data-dropdown-toggle]');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    if (focusFirst) {
      const activeItem = wrapper.querySelector('.dropdown-item.active') || wrapper.querySelector('.dropdown-item');
      if (activeItem) activeItem.focus();
    }
  }

  function selectDropdownItem(item) {
    const wrapper = item.closest('.dropdown-wrapper');
    const label = wrapper.querySelector('.dropdown-label');
    if (label) label.textContent = item.textContent.trim();
    wrapper.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    wrapper.classList.remove('is-open');
    const trigger = wrapper.querySelector('[data-dropdown-toggle]');
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
      trigger.focus();
    }
  }

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-dropdown-toggle]');
    if (trigger) {
      const wrapper = trigger.closest('.dropdown-wrapper');
      const wasOpen = wrapper.classList.contains('is-open');
      if (wasOpen) {
        closeAllDropdowns();
      } else {
        openDropdown(wrapper, false);
      }
      return;
    }

    const item = e.target.closest('.dropdown-item');
    if (item) {
      selectDropdownItem(item);
      return;
    }

    if (!e.target.closest('.dropdown-menu-floating')) {
      closeAllDropdowns();
    }
  });

  document.addEventListener('keydown', (e) => {
    const trigger = e.target.closest('[data-dropdown-toggle]');
    if (trigger) {
      const wrapper = trigger.closest('.dropdown-wrapper');
      const isOpen = wrapper.classList.contains('is-open');
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        openDropdown(wrapper, true);
      } else if ((e.key === 'Enter' || e.key === ' ') && !isOpen) {
        e.preventDefault();
        openDropdown(wrapper, true);
      }
      return;
    }

    const item = e.target.closest('.dropdown-item');
    if (item) {
      const wrapper = item.closest('.dropdown-wrapper');
      const items = Array.from(wrapper.querySelectorAll('.dropdown-item'));
      const idx = items.indexOf(item);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        items[(idx + 1) % items.length].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        items[(idx - 1 + items.length) % items.length].focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectDropdownItem(item);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeAllDropdowns();
        const t = wrapper.querySelector('[data-dropdown-toggle]');
        if (t) t.focus();
      } else if (e.key === 'Tab') {
        closeAllDropdowns();
      }
      return;
    }

    if (e.key === 'Escape') {
      closeAllDropdowns();
    }
  });
}

// 5. Interactive Custom Datepicker Engine (CMP-02 / Estify Signature)
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

    function selectDate(date) {
      selectedDate = date;
      viewYear = date.getFullYear();
      viewMonth = date.getMonth();
      displayInput.value = formatDisplayDate(date);
      if (hiddenInput) {
        hiddenInput.value = formatIsoDate(date);
        hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      displayInput.dispatchEvent(new Event('input', { bubbles: true }));
      renderCalendar();
      closePicker();
    }

    function openPicker() {
      document.querySelectorAll('.datepicker-container.is-open').forEach(c => {
        if (c !== container) c.classList.remove('is-open');
      });
      document.querySelectorAll('.dropdown-wrapper.is-open').forEach(d => d.classList.remove('is-open'));
      container.classList.add('is-open');
      if (trigger) trigger.setAttribute('aria-expanded', 'true');
      renderCalendar();
    }

    function closePicker() {
      container.classList.remove('is-open');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    }

    function togglePicker() {
      if (container.classList.contains('is-open')) {
        closePicker();
      } else {
        openPicker();
      }
    }

    if (trigger) {
      trigger.addEventListener('click', () => {
        togglePicker();
      });
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          togglePicker();
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
        selectDate(new Date(2026, 10, 25)); // Target Context: 25 Nov 2026
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectDate(new Date(2026, 10, 25)); // Reset to initial default
      });
    }

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
        c.classList.remove('is-open');
        const trigger = c.querySelector('.datepicker-trigger');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      });
    }
  });
}

// 6. Custom Select / PopoverMenu Engine (CMP-04 — Zero Raw Native Select)
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
    if (!trigger || !popover) return;

    // Initial check for pre-selected value
    const hasInitialVal = Boolean(
      (hiddenInput && hiddenInput.value && hiddenInput.value.trim() !== '') ||
      (displayInput && displayInput.value && displayInput.value.trim() !== '')
    );
    if (hasInitialVal && !trigger.classList.contains('is-disabled') && !trigger.hasAttribute('disabled')) {
      trigger.classList.add('has-value');
      wrapper.classList.add('has-value');
      const prefixIcon = trigger.querySelector('.select-prefix-icon');
      if (prefixIcon) prefixIcon.classList.remove('text-muted');
    }

    let highlightedIndex = -1;

    function updateHighlight() {
      options.forEach((opt, idx) => {
        if (idx === highlightedIndex) {
          opt.classList.add('is-highlighted');
          opt.scrollIntoView({ block: 'nearest' });
        } else {
          opt.classList.remove('is-highlighted');
        }
      });
    }

    function openSelect() {
      document.querySelectorAll('.custom-select-wrapper.is-open').forEach(w => {
        if (w !== wrapper) {
          w.classList.remove('is-open');
          const t = w.querySelector('.select-trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
      });
      document.querySelectorAll('.datepicker-container.is-open').forEach(d => {
        d.classList.remove('is-open');
        const t = d.querySelector('.datepicker-trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
      document.querySelectorAll('.dropdown-wrapper.is-open').forEach(d => d.classList.remove('is-open'));

      wrapper.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');

      // Set initial keyboard highlight to current selected option or first option
      const selectedIdx = options.findIndex(o => o.classList.contains('is-selected'));
      highlightedIndex = selectedIdx >= 0 ? selectedIdx : 0;
      updateHighlight();
    }

    function closeSelect() {
      wrapper.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      options.forEach(o => o.classList.remove('is-highlighted'));
      highlightedIndex = -1;
    }

    function toggleSelect() {
      if (trigger.hasAttribute('disabled') || trigger.classList.contains('is-disabled') || (displayInput && displayInput.hasAttribute('disabled'))) return;
      if (wrapper.classList.contains('is-open')) {
        closeSelect();
      } else {
        openSelect();
      }
    }

    function selectOption(opt) {
      if (!opt) return;
      const val = opt.getAttribute('data-value') || opt.textContent.trim();
      const titleSpan = opt.querySelector('.option-title');
      const text = titleSpan ? titleSpan.textContent.trim() : opt.textContent.trim();

      if (hiddenInput) {
        hiddenInput.value = val;
        hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (displayInput) {
        displayInput.value = text;
        displayInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (labelDisplay) {
        labelDisplay.textContent = text;
        labelDisplay.classList.remove('text-muted');
      }

      // Clear has-error styling and update has-value on trigger upon valid selection
      const prefixIcon = trigger.querySelector('.select-prefix-icon');
      if (val) {
        trigger.classList.remove('has-error');
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

      closeSelect();
      trigger.focus();
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSelect();
    });

    trigger.addEventListener('keydown', (e) => {
      if (trigger.hasAttribute('disabled') || trigger.classList.contains('is-disabled') || (displayInput && displayInput.hasAttribute('disabled'))) return;
      const isOpen = wrapper.classList.contains('is-open');

      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          openSelect();
        }
      } else {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          highlightedIndex = (highlightedIndex + 1) % options.length;
          updateHighlight();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          highlightedIndex = (highlightedIndex - 1 + options.length) % options.length;
          updateHighlight();
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < options.length) {
            selectOption(options[highlightedIndex]);
          }
        } else if (e.key === 'Escape' || e.key === 'Tab') {
          closeSelect();
        }
      }
    });

    options.forEach((opt, idx) => {
      opt.addEventListener('mouseenter', () => {
        highlightedIndex = idx;
        updateHighlight();
      });

      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        selectOption(opt);
      });
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-select-wrapper')) {
      document.querySelectorAll('.custom-select-wrapper.is-open').forEach(w => {
        w.classList.remove('is-open');
        const trigger = w.querySelector('.select-trigger');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      });
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.custom-select-wrapper.is-open').forEach(w => {
        w.classList.remove('is-open');
        const trigger = w.querySelector('.select-trigger');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      });
    }
  });
}

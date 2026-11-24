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
});

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

// 4. Interactive Dropdown Popover Engine
function initDropdowns() {
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-dropdown-toggle]');
    const openDropdowns = document.querySelectorAll('.dropdown-wrapper.is-open');

    if (trigger) {
      const wrapper = trigger.closest('.dropdown-wrapper');
      const wasOpen = wrapper.classList.contains('is-open');
      openDropdowns.forEach(d => d.classList.remove('is-open'));
      if (!wasOpen) wrapper.classList.add('is-open');
    } else if (!e.target.closest('.dropdown-menu-floating')) {
      openDropdowns.forEach(d => d.classList.remove('is-open'));
    }

    const item = e.target.closest('.dropdown-item');
    if (item) {
      const wrapper = item.closest('.dropdown-wrapper');
      const label = wrapper.querySelector('.dropdown-label');
      if (label) label.textContent = item.textContent.trim();
      wrapper.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      wrapper.classList.remove('is-open');
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.dropdown-wrapper.is-open').forEach(d => d.classList.remove('is-open'));
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

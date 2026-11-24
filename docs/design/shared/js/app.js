/**
 * RumaKost Interactive Application Engine
 * Accessible, WCAG AA Compliant UI Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
  initModals();
  initToasts();
  initForms();
  initDropdowns();
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

/**
 * RumaKost Shared Component Engine
 * Provides reusable topbar rendering across 3 ROLES (Owner, Staff, Tenant),
 * modal management, toast notifications, and icon initialization.
 */

(function () {
  'use strict';

  // Navigation Items Registry for 3 Roles
  const NAV_CONFIG = {
    owner: [
      { id: 'dashboard', label: 'Dashboard', href: 'WF-02-dashboard.html' },
      { id: 'kamar', label: 'Kamar', href: 'WF-03-kamar.html' },
      { id: 'penghuni', label: 'Penghuni', href: 'WF-04-penghuni.html' },
      { id: 'tagihan', label: 'Tagihan', href: 'WF-05-tagihan.html' },
      { id: 'pembayaran', label: 'Pembayaran', href: 'WF-06-pembayaran.html' },
      { id: 'laporan', label: 'Laporan', href: 'WF-07-laporan.html' },
      { id: 'tiket', label: 'Tiket', href: 'WF-08-tiket.html' }
    ],
    staff: [
      { id: 'dashboard', label: 'Dashboard Operasional', href: 'WF-02-staf-dashboard.html' },
      { id: 'kamar', label: 'Kamar', href: 'WF-03-kamar.html?role=staf' },
      { id: 'penghuni', label: 'Penghuni', href: 'WF-04-penghuni.html?role=staf' },
      { id: 'tagihan', label: 'Tagihan & Catat Bayar', href: 'WF-05-tagihan.html?role=staf' },
      { id: 'tiket', label: 'Tiket Perbaikan', href: 'WF-08-tiket.html?role=staf' }
    ],
    tenant: [
      { id: 'beranda', label: 'Beranda Kamar', href: 'WF-10-portal-dashboard.html' },
      { id: 'tagihan', label: 'Tagihan Saya', href: 'WF-10-portal-tagihan.html' },
      { id: 'tiket', label: 'Tiket Kerusakan', href: 'WF-10-portal-tiket.html' }
    ]
  };

  /**
   * Determine current role from URL or default
   */
  function getCurrentRole() {
    const urlParams = new URLSearchParams(window.location.search);
    const paramRole = urlParams.get('role');
    if (paramRole === 'staf' || paramRole === 'staff') return 'staff';
    if (paramRole === 'penghuni' || paramRole === 'tenant') return 'tenant';
    if (window.location.pathname.includes('portal')) return 'tenant';
    return 'owner';
  }
  window.getCurrentRole = getCurrentRole;

  /**
   * Render Topbar Component with 3-Role Support
   * @param {string} activeId - ID of active nav pill
   * @param {string} explicitRole - Optional override role ('owner'|'staff'|'tenant')
   */
  window.renderTopbar = function (activeId, explicitRole) {
    const topbarElem = document.getElementById('mainTopbar');
    if (!topbarElem) return;

    // Auto-inject top canopy overlay if not already present in DOM
    if (!document.querySelector('.top-canopy-overlay')) {
      const canopy = document.createElement('div');
      canopy.className = 'top-canopy-overlay';
      canopy.setAttribute('aria-hidden', 'true');
      document.body.prepend(canopy);
    }

    const role = explicitRole || getCurrentRole();

    // Guardrail RBAC: Jika Penghuni membuka dasbor utama manajemen atau master kamar/penghuni, redirect paksa ke portal penghuni (SK-20)
    const isManagementScreen = (
      window.location.pathname.includes('WF-02-dashboard') ||
      window.location.pathname.includes('WF-03-kamar') ||
      window.location.pathname.includes('WF-04-penghuni') ||
      window.location.pathname.includes('WF-05-tagihan') ||
      window.location.pathname.includes('WF-06-pembayaran') ||
      window.location.pathname.includes('WF-07-laporan') ||
      window.location.pathname.includes('WF-08-tiket') ||
      window.location.pathname.includes('WF-09-pengaturan')
    );
    if (role === 'tenant' && isManagementScreen) {
      window.location.replace('WF-10-portal-dashboard.html');
      return;
    }

    // Guardrail RBAC: Jika Staf membuka dasbor eksekutif pemilik, arahkan ke dasbor operasional staf
    if (role === 'staff' && window.location.pathname.includes('WF-02-dashboard.html') && !window.location.pathname.includes('staf')) {
      window.location.replace('WF-02-staf-dashboard.html');
      return;
    }
    const navItems = NAV_CONFIG[role] || NAV_CONFIG.owner;

    const navPillsHtml = navItems.map(item => {
      const isActive = item.id === activeId ? 'active' : '';
      return `<a href="${item.href}" class="nav-pill ${isActive}">${item.label}</a>`;
    }).join('\n      ');

    let rightSectionHtml = '';
    let brandTarget = 'WF-02-dashboard.html';

    if (role === 'tenant') {
      brandTarget = 'WF-10-portal-dashboard.html';
      rightSectionHtml = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="badge-status badge-brand" style="font-size: 11px;">
            <i data-lucide="door-closed" style="width: 12px; height: 12px;"></i>
            Kamar A-04
          </span>
          <div class="user-dropdown-wrap" id="userDropdownWrap">
            <button type="button" class="user-profile-btn" onclick="toggleUserDropdown(event)" title="Menu Penghuni">
              <div class="user-avatar" style="background: #111111; color: #FFFFFF;">BS</div>
              <div style="font-size: 12px; font-weight: 600;">Budi S. <span style="font-size: 10px; color: var(--text-muted);">(Penghuni)</span></div>
              <i data-lucide="chevron-down" style="width: 14px; height: 14px; color: var(--text-muted); margin-left: 2px;"></i>
            </button>
            <div class="user-dropdown-menu" id="userDropdownMenu">
              <div class="dropdown-user-header">
                <div class="dropdown-user-name">Budi Santoso</div>
                <div class="dropdown-user-email">Kamar A-04 (Lantai 1)</div>
                <div style="margin-top: 4px;">
                  <span class="badge-status badge-brand" style="font-size: 10px; padding: 2px 8px;">Penghuni Aktif</span>
                </div>
              </div>
              <a href="WF-10-portal-dashboard.html" class="dropdown-menu-item">
                <i data-lucide="home" style="width: 15px; height: 15px;"></i>
                Beranda Kamar
              </a>
              <a href="WF-10-portal-tagihan.html" class="dropdown-menu-item">
                <i data-lucide="receipt" style="width: 15px; height: 15px;"></i>
                Tagihan Saya
              </a>
              <a href="WF-10-portal-tiket.html" class="dropdown-menu-item">
                <i data-lucide="wrench" style="width: 15px; height: 15px;"></i>
                Tiket Kerusakan
              </a>
              <div class="dropdown-divider"></div>
              <a href="WF-01-login.html" onclick="handleLogout(event)" class="dropdown-menu-item danger">
                <i data-lucide="log-out" style="width: 15px; height: 15px;"></i>
                Keluar Akun
              </a>
            </div>
          </div>
        </div>
      `;
    } else if (role === 'staff') {
      brandTarget = 'WF-02-dashboard.html?role=staf';
      rightSectionHtml = `
        <span class="badge-status badge-warning" style="font-size: 11px;">
          <i data-lucide="user" style="width: 12px; height: 12px;"></i>
          Staf Operasional
        </span>
        <button class="icon-circle-btn" title="Cari data" onclick="RumaUI.showToast('Pencarian operasional dibuka')">
          <i data-lucide="search" style="width: 16px; height: 16px;"></i>
        </button>
        <button class="icon-circle-btn" title="Notifikasi" onclick="RumaUI.showToast('Belum ada tugas baru')">
          <i data-lucide="bell" style="width: 16px; height: 16px;"></i>
        </button>
        <div class="user-dropdown-wrap" id="userDropdownWrap">
          <button type="button" class="user-profile-btn" onclick="toggleUserDropdown(event)" title="Menu Staf">
            <div class="user-avatar" style="background: #111111; color: #FFFFFF;">RS</div>
            <div style="font-size: 12px; font-weight: 600;">Rini S.</div>
            <i data-lucide="chevron-down" style="width: 14px; height: 14px; color: var(--text-muted); margin-left: 2px;"></i>
          </button>
          <div class="user-dropdown-menu" id="userDropdownMenu">
            <div class="dropdown-user-header">
              <div class="dropdown-user-name">Rini Setiawati</div>
              <div class="dropdown-user-email">staf.operasional@kostmakmur.com</div>
              <div style="margin-top: 4px;">
                <span class="badge-status badge-warning" style="font-size: 10px; padding: 2px 8px;">Staf Operasional</span>
              </div>
            </div>
            <a href="WF-08-tiket.html?role=staf" class="dropdown-menu-item">
              <i data-lucide="wrench" style="width: 15px; height: 15px;"></i>
              Tiket Perbaikan Ditugaskan
            </a>
            <a href="WF-05-tagihan.html?role=staf" class="dropdown-menu-item">
              <i data-lucide="receipt" style="width: 15px; height: 15px;"></i>
              Catat Bayar Penyewa
            </a>
            <div class="dropdown-divider"></div>
            <a href="WF-01-login.html" onclick="handleLogout(event)" class="dropdown-menu-item danger">
              <i data-lucide="log-out" style="width: 15px; height: 15px;"></i>
              Keluar Akun
            </a>
          </div>
        </div>
      `;
    } else {
      // Owner (Superadmin) — Estify Alignment
      rightSectionHtml = `
        <!-- Search Box (Glitch-Free Slide-to-Left) -->
        <div class="search-slide-box" id="topbarSearchContainer">
          <input 
            type="text" 
            class="search-slide-field" 
            id="topbarSearchInput" 
            placeholder="Cari kamar, penghuni, tagihan..." 
            onkeydown="handleSlideSearchKey(event)"
          >
          <button type="button" class="search-slide-trigger" onclick="toggleSlideSearch()" title="Cari data">
            <i data-lucide="search" style="width: 16px; height: 16px;"></i>
          </button>
        </div>

        <!-- Notification Dropdown -->
        <div class="notification-dropdown-wrap" id="notifDropdownWrap">
          <button type="button" class="icon-circle-btn" id="notifBellBtn" style="position: relative;" onclick="toggleNotifDropdown(event)" title="Notifikasi Sistem">
            <i data-lucide="bell" style="width: 16px; height: 16px;"></i>
            <span class="unread-dot" id="notifUnreadDot"></span>
          </button>

          <div class="notification-dropdown-menu" id="notifDropdownMenu">
            <div class="notif-header">
              <div class="notif-header-title">
                Notifikasi
                <span class="notif-badge-count" id="notifBadgeCount">3 Baru</span>
              </div>
              <button type="button" class="notif-mark-read-btn" onclick="markAllNotifsRead(event)">Tandai dibaca</button>
            </div>

            <div class="notif-list">
              <!-- Item 0: Tagihan Terlambat (Danger Overdue - Skenario 07) -->
              <div class="notif-item unread" onclick="RumaUI.showToast('Membuka tagihan terlambat Kamar A-02...', 'info'); location.href='WF-05-tagihan.html?id=INV-202610-02';">
                <div class="notif-icon-circle" style="background:#FEE2E2; color:#DC2626;">
                  <i data-lucide="alert-circle" style="width: 17px; height: 17px;"></i>
                </div>
                <div class="notif-body">
                  <div class="notif-item-header">
                    <span class="notif-title">Sewa Terlambat Kritis</span>
                    <span class="notif-micro-badge" style="background:#FEE2E2; color:#DC2626; border:1px solid #FECACA;">H+5 Overdue</span>
                  </div>
                  <div class="notif-desc">Dimas Prasetyo (Kamar A-02) telah melewati tempo 5 hari (Rp 1.200.000).</div>
                  <div class="notif-time">10 menit yang lalu</div>
                </div>
              </div>
              <!-- Item 1: Tagihan Jatuh Tempo (Warning) -->
              <div class="notif-item unread" onclick="RumaUI.showToast('Membuka daftar tagihan jatuh tempo...', 'info'); location.href='WF-05-tagihan.html';">
                <div class="notif-icon-circle warning">
                  <i data-lucide="clock" style="width: 17px; height: 17px;"></i>
                </div>
                <div class="notif-body">
                  <div class="notif-item-header">
                    <span class="notif-title">Tagihan Sewa Jatuh Tempo</span>
                    <span class="notif-micro-badge badge-warning">H-3 Tempo</span>
                  </div>
                  <div class="notif-desc">3 kamar (A-01, A-04, B-03) jatuh tempo dalam 3 hari ke depan.</div>
                  <div class="notif-time">25 menit yang lalu</div>
                </div>
              </div>

              <!-- Item 2: Tiket Kerusakan Baru (Brand Primary) -->
              <div class="notif-item unread" onclick="RumaUI.showToast('Membuka tiket perbaikan...', 'info'); location.href='WF-08-tiket.html';">
                <div class="notif-icon-circle brand">
                  <i data-lucide="wrench" style="width: 17px; height: 17px;"></i>
                </div>
                <div class="notif-body">
                  <div class="notif-item-header">
                    <span class="notif-title">Laporan Kerusakan Baru</span>
                    <span class="notif-micro-badge badge-brand">Tiket Baru</span>
                  </div>
                  <div class="notif-desc">Siti Aminah melaporkan wastafel bocor di Kamar B-02.</div>
                  <div class="notif-time">1 jam yang lalu</div>
                </div>
              </div>

              <!-- Item 3: Pembayaran Lunas (Dark / Success) -->
              <div class="notif-item" onclick="RumaUI.showToast('Membuka riwayat pembayaran...', 'info'); location.href='WF-06-pembayaran.html';">
                <div class="notif-icon-circle dark">
                  <i data-lucide="check-circle-2" style="width: 17px; height: 17px; color: #16A34A;"></i>
                </div>
                <div class="notif-body">
                  <div class="notif-item-header">
                    <span class="notif-title">Pembayaran Dikonfirmasi</span>
                    <span class="notif-micro-badge badge-dark" style="color: #16A34A;">Lunas</span>
                  </div>
                  <div class="notif-desc">Budi Santoso (A-04) telah melunasi sewa bulan ini (Rp 1.500.000).</div>
                  <div class="notif-time">3 jam yang lalu</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Profile Dropdown (Budi S) -->
        <div class="user-dropdown-wrap" id="userDropdownWrap">
          <button type="button" class="user-profile-btn" onclick="toggleUserDropdown(event)" title="Menu Akun & Profil">
            <div class="user-avatar">BS</div>
            <div style="font-size: 12px; font-weight: 600; color: ${activeId === 'pengaturan' ? '#FF7A00' : 'inherit'};">
              Budi S. <span style="font-size: 10px; color: var(--brand-primary); font-weight: 500;">(Pemilik)</span>
            </div>
            <i data-lucide="chevron-down" style="width: 14px; height: 14px; color: var(--text-muted); margin-left: 2px;"></i>
          </button>

          <div class="user-dropdown-menu" id="userDropdownMenu">
            <div class="dropdown-user-header">
              <div class="dropdown-user-name">Budi Santoso</div>
              <div class="dropdown-user-email">budi.santoso@kostmakmur.com</div>
            </div>
            
            <a href="WF-09-pengaturan.html" class="dropdown-menu-item">
              <i data-lucide="settings" style="width: 15px; height: 15px;"></i>
              Pengaturan
            </a>
            
            <div class="dropdown-divider"></div>

            <a href="WF-01-login.html" onclick="handleLogout(event)" class="dropdown-menu-item danger">
              <i data-lucide="log-out" style="width: 15px; height: 15px;"></i>
              Keluar Akun
            </a>
          </div>
        </div>
      `;
    }

    topbarElem.innerHTML = `
      <a href="${brandTarget}" class="brand-group" title="RumaKost · Sistem Manajemen Kost Mandiri">
        <svg width="34" height="34" viewBox="0 0 52 52" fill="none">
          <rect width="52" height="52" rx="13" fill="#FF7A00"/>
          <polygon points="14,32 14,16 20,10 26,5 32,10 38,16 38,32" fill="white"/>
          <circle cx="26" cy="21" r="6.5" fill="#FF7A00"/>
          <rect x="23" y="31" width="6" height="16" fill="white" rx="1.5"/>
          <rect x="29" y="37" width="5" height="4" fill="white" rx="1"/>
          <rect x="29" y="44" width="3" height="3" fill="white" rx="1"/>
        </svg>
        <span class="brand-name">Ruma<span>Kost</span></span>
      </a>

      <nav class="nav-pill-container">
        ${navPillsHtml}
      </nav>

      <div class="topbar-right">
        ${rightSectionHtml}
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }
  };

  /**
   * Slide Search Bar Logic
   */
  window.toggleSlideSearch = function () {
    const container = document.getElementById('topbarSearchContainer');
    const input = document.getElementById('topbarSearchInput');
    if (!container || !input) return;

    const willBeActive = !container.classList.contains('active');
    container.classList.toggle('active');
    if (willBeActive) {
      setTimeout(() => input.focus(), 80);
    } else {
      input.value = '';
      input.blur();
    }
  };

  window.handleSlideSearchKey = function (e) {
    if (e.key === 'Enter') {
      const val = e.target.value.trim();
      if (val) {
        RumaUI.showToast(`Mencari data untuk: "${val}"`, 'info', 'Pencarian Global');
      }
    } else if (e.key === 'Escape') {
      const container = document.getElementById('topbarSearchContainer');
      if (container) {
        container.classList.remove('active');
        const input = document.getElementById('topbarSearchInput');
        if (input) input.blur();
      }
    }
  };

  /**
   * Notification Dropdown Logic
   */
  window.toggleNotifDropdown = function (e) {
    if (e) e.stopPropagation();
    const notifWrap = document.getElementById('notifDropdownWrap');
    const userWrap = document.getElementById('userDropdownWrap');
    if (userWrap) userWrap.classList.remove('open');

    if (!notifWrap) return;
    notifWrap.classList.toggle('open');
  };

  window.markAllNotifsRead = function (e) {
    if (e) e.stopPropagation();
    const unreadDot = document.getElementById('notifUnreadDot');
    if (unreadDot) unreadDot.style.display = 'none';

    const countBadge = document.getElementById('notifBadgeCount');
    if (countBadge) {
      countBadge.textContent = '0 Baru';
      countBadge.style.background = '#F3F4F6';
      countBadge.style.color = '#9CA3AF';
      countBadge.style.borderColor = 'transparent';
    }

    document.querySelectorAll('.notif-item.unread').forEach(item => {
      item.classList.remove('unread');
    });

    RumaUI.showToast('Semua notifikasi telah ditandai sudah dibaca', 'success');
  };

  /**
   * User Profile Dropdown Logic
   */
  window.toggleUserDropdown = function (e) {
    if (e) e.stopPropagation();
    const userWrap = document.getElementById('userDropdownWrap');
    const notifWrap = document.getElementById('notifDropdownWrap');
    if (notifWrap) notifWrap.classList.remove('open');

    if (!userWrap) return;
    userWrap.classList.toggle('open');
  };

  /**
   * Safe Session Termination (Logout) & State Cleanup
   */
  window.handleLogout = function (e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      sessionStorage.clear();
      localStorage.removeItem('ruma_auth_token');
      localStorage.removeItem('ruma_user_session');
      localStorage.removeItem('ruma_user_role');
    } catch (err) {}
    if (window.RumaUI && window.RumaUI.showToast) {
      window.RumaUI.showToast('Sesi telah diakhiri. Mengalihkan ke portal login...', 'info', 'Logout');
    }
    setTimeout(function () {
      window.location.replace('WF-01-login.html');
    }, 250);
  };

  // Close dropdowns and slide search bar on click outside
  document.addEventListener('click', function (e) {
    // User Dropdown close
    const dropdownWrap = document.getElementById('userDropdownWrap');
    if (dropdownWrap && dropdownWrap.classList.contains('open')) {
      if (!dropdownWrap.contains(e.target)) {
        dropdownWrap.classList.remove('open');
      }
    }

    // Notification Dropdown close
    const notifWrap = document.getElementById('notifDropdownWrap');
    if (notifWrap && notifWrap.classList.contains('open')) {
      if (!notifWrap.contains(e.target)) {
        notifWrap.classList.remove('open');
      }
    }

    // Search bar close
    const container = document.getElementById('topbarSearchContainer');
    if (container && container.classList.contains('active')) {
      if (!container.contains(e.target)) {
        container.classList.remove('active');
        const input = document.getElementById('topbarSearchInput');
        if (input) input.blur();
      }
    }
  });

  // Close dropdowns on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const dropdownWrap = document.getElementById('userDropdownWrap');
      if (dropdownWrap) dropdownWrap.classList.remove('open');

      const notifWrap = document.getElementById('notifDropdownWrap');
      if (notifWrap) notifWrap.classList.remove('open');
    }
  });

  /**
   * RumaUI Utility Object
   */
  window.RumaUI = {
    /**
     * Show elegant non-blocking card-style toast (Sonner/Linear high-readability standard)
     * @param {string} message - Message text
     * @param {string} type - 'info' | 'success' | 'error' | 'danger'
     * @param {string} [customTitle] - Optional heading
     */
    showToast: function (message, type = 'info', customTitle) {
      let toast = document.getElementById('rumaToast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'rumaToast';
        toast.className = 'ruma-toast';
        document.body.appendChild(toast);
      }

      const isError = type === 'error' || type === 'danger';
      const iconName = type === 'success' ? 'check-circle-2' : isError ? 'alert-triangle' : 'info';
      const toastTitle = customTitle || (type === 'success' ? 'Berhasil' : isError ? 'Pemberitahuan' : 'Informasi');
      const iconBoxClass = isError ? 'ruma-toast-icon-box danger' : `ruma-toast-icon-box ${type}`;

      toast.className = 'ruma-toast';
      toast.innerHTML = `
        <div class="${iconBoxClass}">
          <i data-lucide="${iconName}" style="width: 18px; height: 18px;"></i>
        </div>
        <div class="ruma-toast-body">
          <div class="ruma-toast-title"></div>
          <div class="ruma-toast-message"></div>
        </div>
        <button type="button" class="ruma-toast-close" onclick="document.getElementById('rumaToast').classList.remove('show')" title="Tutup">
          <i data-lucide="x" style="width: 14px; height: 14px;"></i>
        </button>
      `;

      // Safe text node assignment to prevent DOM-based XSS injection
      const titleElem = toast.querySelector('.ruma-toast-title');
      const msgElem = toast.querySelector('.ruma-toast-message');
      if (titleElem) titleElem.textContent = toastTitle;
      if (msgElem) msgElem.textContent = message;

      if (window.lucide) {
        window.lucide.createIcons({ root: toast });
      }

      // Trigger enter animation
      requestAnimationFrame(() => {
        toast.classList.add('show');
      });

      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => {
        toast.classList.remove('show');
      }, 3500);
    },

    openModal: function (modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('open');
      }
    },

    closeModal: function (modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove('open');
      }
    }
  };

  // Close modals on Escape key - unless marked data-non-dismissible="true"
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open:not([data-non-dismissible="true"])').forEach(modal => {
        modal.classList.remove('open');
      });
    }
  });

  // Auto initialize Lucide when document is ready
  document.addEventListener('DOMContentLoaded', function () {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });


  /**
   * RumaDatePicker Component Engine (CMP-20 · Estify Zero-Native Custom Calendar)
   * Provides floating interactive calendar popover for date inputs.
   */
  window.RumaDatePicker = {
    instances: {},

    MONTH_NAMES: [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ],

    MONTH_SHORT: [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ],

    DAY_NAMES: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],

    init: function (wrapId, inputId, initialDateStr) {
      const wrap = document.getElementById(wrapId);
      const input = document.getElementById(inputId);
      if (!wrap || !input) return;

      let date = initialDateStr ? new Date(initialDateStr) : new Date(input.value || Date.now());
      if (isNaN(date.getTime())) date = new Date();

      this.instances[wrapId] = {
        wrapId: wrapId,
        inputId: inputId,
        selectedDate: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        viewDate: new Date(date.getFullYear(), date.getMonth(), 1)
      };

      this.updateDisplay(wrapId);
      this.renderPopover(wrapId);
    },

    toggle: function (wrapId, inputId) {
      const wrap = document.getElementById(wrapId);
      if (!wrap) return;

      if (!this.instances[wrapId]) {
        this.init(wrapId, inputId);
      }

      const isOpen = wrap.classList.contains('open');
      this.closeAll();

      if (!isOpen) {
        wrap.classList.add('open');
        this.renderPopover(wrapId);
      }
    },

    closeAll: function () {
      document.querySelectorAll('.ruma-datepicker-wrap.open').forEach(w => {
        w.classList.remove('open');
      });
    },

    prevMonth: function (wrapId, e) {
      if (e) e.stopPropagation();
      const inst = this.instances[wrapId];
      if (!inst) return;
      inst.viewDate.setMonth(inst.viewDate.getMonth() - 1);
      this.renderPopover(wrapId);
    },

    nextMonth: function (wrapId, e) {
      if (e) e.stopPropagation();
      const inst = this.instances[wrapId];
      if (!inst) return;
      inst.viewDate.setMonth(inst.viewDate.getMonth() + 1);
      this.renderPopover(wrapId);
    },

    selectDate: function (wrapId, year, month, day, e) {
      if (e) e.stopPropagation();
      const inst = this.instances[wrapId];
      if (!inst) return;

      inst.selectedDate = new Date(year, month, day);
      const input = document.getElementById(inst.inputId);
      if (input) {
        const yStr = year;
        const mStr = String(month + 1).padStart(2, '0');
        const dStr = String(day).padStart(2, '0');
        input.value = `${yStr}-${mStr}-${dStr}`;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }

      this.updateDisplay(wrapId);
      this.closeAll();
      if (window.RumaUI) {
        const dateFormatted = `${day} ${this.MONTH_NAMES[month]} ${year}`;
        RumaUI.showToast(`Tanggal mulai sewa dipilih: ${dateFormatted}`, 'info');
      }
    },

    selectPreset: function (wrapId, presetKey, e) {
      if (e) e.stopPropagation();
      const inst = this.instances[wrapId];
      if (!inst) return;

      const now = new Date();
      let target;
      if (presetKey === 'today') {
        target = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (presetKey === 'next_month') {
        target = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      } else if (presetKey === 'curr_month') {
        target = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      if (target) {
        inst.viewDate = new Date(target.getFullYear(), target.getMonth(), 1);
        this.selectDate(wrapId, target.getFullYear(), target.getMonth(), target.getDate(), e);
      }
    },

    updateDisplay: function (wrapId) {
      const inst = this.instances[wrapId];
      if (!inst) return;
      const wrap = document.getElementById(wrapId);
      if (!wrap) return;

      const valTxt = wrap.querySelector('.ruma-datepicker-val-txt');
      if (valTxt && inst.selectedDate) {
        const d = inst.selectedDate.getDate();
        const m = this.MONTH_NAMES[inst.selectedDate.getMonth()];
        const y = inst.selectedDate.getFullYear();
        valTxt.textContent = `${d} ${m} ${y}`;
      }
    },

    renderPopover: function (wrapId) {
      const inst = this.instances[wrapId];
      if (!inst) return;
      const wrap = document.getElementById(wrapId);
      if (!wrap) return;

      let popover = wrap.querySelector('.ruma-datepicker-popover');
      if (!popover) {
        popover = document.createElement('div');
        popover.className = 'ruma-datepicker-popover';
        wrap.appendChild(popover);
      }

      const viewYear = inst.viewDate.getFullYear();
      const viewMonth = inst.viewDate.getMonth();
      const monthTitle = `${this.MONTH_NAMES[viewMonth]} ${viewYear}`;

      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
      const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday
      const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

      const today = new Date();
      const isCurrentMonthView = today.getFullYear() === viewYear && today.getMonth() === viewMonth;
      const todayDate = today.getDate();

      const selYear = inst.selectedDate ? inst.selectedDate.getFullYear() : null;
      const selMonth = inst.selectedDate ? inst.selectedDate.getMonth() : null;
      const selDate = inst.selectedDate ? inst.selectedDate.getDate() : null;

      let daysHtml = '';

      // Prev month filler days
      for (let i = firstDayIndex - 1; i >= 0; i--) {
        const prevDay = daysInPrevMonth - i;
        daysHtml += `<button type="button" class="rdp-day-btn other-month" tabindex="-1">${prevDay}</button>`;
      }

      // Current month days
      for (let day = 1; day <= daysInMonth; day++) {
        const isToday = isCurrentMonthView && day === todayDate ? 'is-today' : '';
        const isSelected = selYear === viewYear && selMonth === viewMonth && selDate === day ? 'is-selected' : '';
        daysHtml += `<button type="button" class="rdp-day-btn ${isToday} ${isSelected}" onclick="RumaDatePicker.selectDate('${wrapId}', ${viewYear}, ${viewMonth}, ${day}, event)">${day}</button>`;
      }

      // Next month filler days to complete grid
      const totalRendered = firstDayIndex + daysInMonth;
      const nextMonthCells = (totalRendered <= 35 ? 35 : 42) - totalRendered;
      for (let day = 1; day <= nextMonthCells; day++) {
        daysHtml += `<button type="button" class="rdp-day-btn other-month" tabindex="-1">${day}</button>`;
      }

      popover.innerHTML = `
        <div class="rdp-head-row">
          <button type="button" class="rdp-nav-btn" onclick="RumaDatePicker.prevMonth('${wrapId}', event)" title="Bulan Sebelumnya">
            <i data-lucide="chevron-left" style="width: 15px; height: 15px;"></i>
          </button>
          <div class="rdp-title-cluster">
            <span class="rdp-month-title">${monthTitle}</span>
          </div>
          <button type="button" class="rdp-nav-btn" onclick="RumaDatePicker.nextMonth('${wrapId}', event)" title="Bulan Berikutnya">
            <i data-lucide="chevron-right" style="width: 15px; height: 15px;"></i>
          </button>
        </div>

        <div class="rdp-weekdays-row">
          ${this.DAY_NAMES.map(d => `<span>${d}</span>`).join('')}
        </div>

        <div class="rdp-days-grid">
          ${daysHtml}
        </div>

        <div class="rdp-footer-row">
          <div style="display: flex; gap: 6px;">
            <button type="button" class="rdp-preset-btn" onclick="RumaDatePicker.selectPreset('${wrapId}', 'today', event)">Hari Ini</button>
            <button type="button" class="rdp-preset-btn" onclick="RumaDatePicker.selectPreset('${wrapId}', 'next_month', event)">Awal Bln Depan</button>
          </div>
          <span class="rdp-note-txt">${selDate ? `${selDate} ${this.MONTH_SHORT[selMonth]} ${selYear}` : ''}</span>
        </div>
      `;

      if (window.lucide) {
        window.lucide.createIcons({ root: popover });
      }
    }
  };

  // Close DatePickers on click outside or Escape
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.ruma-datepicker-wrap')) {
      if (window.RumaDatePicker) window.RumaDatePicker.closeAll();
    }
  });

})();

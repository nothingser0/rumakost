"use client";

import Link from "next/link";
import {
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./topbar.module.css";

export type UserRole = "OWNER" | "STAFF" | "TENANT";

export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export interface MobileNavItem extends NavItem {
  iconType: "home" | "bed" | "receipt" | "wrench" | "user" | "more";
}

export interface TopbarUser {
  name: string;
  email?: string;
  role: UserRole;
  roomName?: string;
  avatarInitials?: string;
}

export interface TopbarProps {
  user?: Partial<TopbarUser> & { role?: string };
  role?: string;
  currentPath?: string;
  activeId?: string;
  unreadNotifications?: number;
  onSearch?: (query: string) => void;
  onLogout?: () => void;
  logoutAction?: () => void | Promise<void>;
  showMobileBottomNav?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface BottomNavProps {
  role: UserRole;
  currentPath?: string;
  activeId?: string;
  onLogout?: () => void;
  logoutAction?: () => void | Promise<void>;
  className?: string;
  style?: React.CSSProperties;
  inline?: boolean;
}

/* ==========================================================================
   Navigation Registry by Role (SITEMAP §1 · Strict Server-Reflected Access)
   ========================================================================== */
export const OWNER_NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard" },
  { id: "kamar", label: "Kamar", href: "/kamar" },
  { id: "penghuni", label: "Penghuni", href: "/penghuni" },
  { id: "tagihan", label: "Tagihan", href: "/tagihan" },
  { id: "pembayaran", label: "Pembayaran", href: "/pembayaran" },
  { id: "laporan", label: "Laporan", href: "/laporan" },
  { id: "tiket", label: "Tiket", href: "/tiket" },
];

export const STAFF_NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard" },
  { id: "kamar", label: "Kamar", href: "/kamar" },
  { id: "penghuni", label: "Penghuni", href: "/penghuni" },
  { id: "tagihan", label: "Tagihan", href: "/tagihan" },
  { id: "tiket", label: "Tiket", href: "/tiket" },
];

export const TENANT_NAV_ITEMS: NavItem[] = [
  { id: "beranda", label: "Beranda Kamar", href: "/portal" },
  { id: "tagihan", label: "Tagihan Saya", href: "/portal/tagihan" },
  { id: "tiket", label: "Tiket Kerusakan", href: "/portal/tiket" },
];

export function getNavItemsForRole(role: UserRole): NavItem[] {
  switch (role) {
    case "STAFF":
      return STAFF_NAV_ITEMS;
    case "TENANT":
      return TENANT_NAV_ITEMS;
    case "OWNER":
    default:
      return OWNER_NAV_ITEMS;
  }
}

export function getMobileNavItemsForRole(role: UserRole): MobileNavItem[] {
  switch (role) {
    case "STAFF":
      return [
        { id: "dashboard", label: "Beranda", href: "/dashboard", iconType: "home" },
        { id: "kamar", label: "Kamar", href: "/kamar", iconType: "bed" },
        { id: "catat-bayar", label: "Catat Bayar", href: "/tagihan", iconType: "receipt" },
        { id: "tiket", label: "Tiket", href: "/tiket", iconType: "wrench" },
        { id: "profil", label: "Profil Staf", href: "/profil", iconType: "user" },
      ];
    case "TENANT":
      return [
        { id: "beranda", label: "Kamar Saya", href: "/portal", iconType: "home" },
        { id: "tagihan", label: "Tagihan", href: "/portal/tagihan", iconType: "receipt" },
        { id: "tiket", label: "Lapor Rusak", href: "/portal/tiket", iconType: "wrench" },
        { id: "profil", label: "Akun Saya", href: "/portal/profil", iconType: "user" },
      ];
    case "OWNER":
    default:
      return [
        { id: "dashboard", label: "Beranda", href: "/dashboard", iconType: "home" },
        { id: "kamar", label: "Kamar", href: "/kamar", iconType: "bed" },
        { id: "tagihan", label: "Tagihan", href: "/tagihan", iconType: "receipt" },
        { id: "tiket", label: "Tiket", href: "/tiket", iconType: "wrench" },
        { id: "lainnya", label: "Lainnya", href: "#", iconType: "more" },
      ];
  }
}

export function normalizeRole(roleInput?: string): UserRole {
  const upper = roleInput?.trim().toUpperCase();
  if (upper === "STAFF" || upper === "STAF") return "STAFF";
  if (upper === "TENANT" || upper === "PENGHUNI") return "TENANT";
  return "OWNER";
}

export function getAvatarInitials(name?: string): string {
  if (!name || !name.trim()) return "RK";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function isPathActive(itemHref: string, currentPath?: string, activeId?: string, itemId?: string): boolean {
  if (activeId && itemId && activeId === itemId) return true;
  if (!currentPath) return false;
  if (currentPath === itemHref) return true;
  if (itemHref !== "/" && itemHref !== "/portal" && itemHref !== "/dashboard") {
    if (currentPath.startsWith(`${itemHref}/`)) return true;
  }
  return false;
}

/* ==========================================================================
   Lucide Geometric Inline SVGs (Zero-Emoji Compliance)
   ========================================================================== */
function BrandHouseKeyIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="34"
      height="34"
      viewBox="0 0 52 52"
      fill="none"
      className={styles.brandIcon}
    >
      <rect width="52" height="52" rx="13" fill="#FF7A00" />
      <polygon points="14,32 14,16 20,10 26,5 32,10 38,16 38,32" fill="white" />
      <circle cx="26" cy="21" r="6.5" fill="#FF7A00" />
      <rect x="23" y="31" width="6" height="16" fill="white" rx="1.5" />
      <rect x="29" y="37" width="5" height="4" fill="white" rx="1" />
      <rect x="29" y="44" width="3" height="3" fill="white" rx="1" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function ChevronDownIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${styles.chevronIcon} ${isOpen ? styles.chevronOpen : ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function DoorClosedIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14" />
      <path d="M2 20h20" />
      <path d="M14 12v.01" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function BedIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 4v16" />
      <path d="M2 8h18a2 2 0 0 1 2 2v10" />
      <path d="M2 17h20" />
      <path d="M6 8v9" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 6v2" />
      <path d="M12 16v2" />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MoreHorizontalIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function renderMobileIcon(type: MobileNavItem["iconType"]) {
  switch (type) {
    case "home":
      return <HomeIcon />;
    case "bed":
      return <BedIcon />;
    case "receipt":
      return <ReceiptIcon />;
    case "wrench":
      return <WrenchIcon />;
    case "user":
      return <UserIcon />;
    case "more":
      return <MoreHorizontalIcon />;
  }
}

/* ==========================================================================
   Mobile Bottom Navigation Bar Component
   ========================================================================== */
export function BottomNav({
  role,
  currentPath,
  activeId,
  onLogout,
  logoutAction,
  className,
  style,
  inline,
}: BottomNavProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const items = getMobileNavItemsForRole(role);

  const toggleMore = () => setIsMoreOpen((prev) => !prev);
  const closeMore = () => setIsMoreOpen(false);

  return (
    <>
      {isMoreOpen && (
        <div
          className={styles.menuBackdrop}
          onClick={closeMore}
          aria-hidden="true"
        />
      )}

      {isMoreOpen && (
        <div
          className={styles.mobileMoreMenu}
          role="menu"
          aria-label="Menu Tambahan"
        >
          {role === "OWNER" && (
            <>
              <Link
                href="/pembayaran"
                className={styles.dropdownMenuItem}
                role="menuitem"
                onClick={closeMore}
              >
                <ReceiptIcon />
                <span>Pembayaran</span>
              </Link>
              <Link
                href="/laporan"
                className={styles.dropdownMenuItem}
                role="menuitem"
                onClick={closeMore}
              >
                <ActivityIcon />
                <span>Laporan Finansial</span>
              </Link>
              <Link
                href="/pengaturan/akun"
                className={styles.dropdownMenuItem}
                role="menuitem"
                onClick={closeMore}
              >
                <SettingsIcon />
                <span>Kelola Pengguna</span>
              </Link>
              <Link
                href="/aktivitas"
                className={styles.dropdownMenuItem}
                role="menuitem"
                onClick={closeMore}
              >
                <ActivityIcon />
                <span>Audit Trail</span>
              </Link>
              <Link
                href="/profil"
                className={styles.dropdownMenuItem}
                role="menuitem"
                onClick={closeMore}
              >
                <UserIcon />
                <span>Profil & Ganti Sandi</span>
              </Link>
              <div className={styles.dropdownDivider} />
            </>
          )}

          {logoutAction ? (
            <form action={logoutAction} onSubmit={onLogout}>
              <button
                type="submit"
                className={`${styles.dropdownMenuItem} ${styles.dropdownMenuDanger}`}
                role="menuitem"
              >
                <LogOutIcon />
                <span>Keluar Akun</span>
              </button>
            </form>
          ) : (
            <button
              type="button"
              className={`${styles.dropdownMenuItem} ${styles.dropdownMenuDanger}`}
              role="menuitem"
              onClick={() => {
                closeMore();
                onLogout?.();
              }}
            >
              <LogOutIcon />
              <span>Keluar Akun</span>
            </button>
          )}
        </div>
      )}

      <nav
        className={`${styles.bottomNavShell} ${inline ? styles.bottomNavInline : ""} ${className ?? ""}`}
        style={style}
        aria-label="Navigasi Bawah"
      >
        {items.map((item) => {
          if (item.id === "lainnya") {
            return (
              <button
                key={item.id}
                type="button"
                className={`${styles.bottomNavItem} ${isMoreOpen ? styles.bottomNavItemActive : ""}`}
                aria-expanded={isMoreOpen}
                aria-haspopup="menu"
                onClick={toggleMore}
              >
                {renderMobileIcon(item.iconType)}
                <span>{item.label}</span>
              </button>
            );
          }

          const active = isPathActive(item.href, currentPath, activeId, item.id);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`${styles.bottomNavItem} ${active ? styles.bottomNavItemActive : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {renderMobileIcon(item.iconType)}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

/* ==========================================================================
   Main Topbar Component (CMP-08)
   ========================================================================== */
export function Topbar({
  user: userProp,
  role: roleProp,
  currentPath,
  activeId,
  unreadNotifications = 0,
  onSearch,
  onLogout,
  logoutAction,
  showMobileBottomNav = true,
  className,
  style,
}: TopbarProps) {
  const role = normalizeRole(userProp?.role ?? roleProp ?? "OWNER");

  const userName =
    userProp?.name?.trim() ||
    (role === "TENANT"
      ? "Penghuni Kost"
      : role === "STAFF"
        ? "Staf Lapangan"
        : "Pemilik Kost");

  const userEmail =
    userProp?.email ||
    (role === "TENANT"
      ? "penghuni@rumakost.id"
      : role === "STAFF"
        ? "staf.operasional@rumakost.id"
        : "pemilik@rumakost.id");

  const roomName = userProp?.roomName || (role === "TENANT" ? "Kamar A-04" : undefined);
  const initials = userProp?.avatarInitials || getAvatarInitials(userName);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const desktopNavItems = getNavItemsForRole(role);
  const brandHref = role === "TENANT" ? "/portal" : "/dashboard";

  // Toggle user dropdown
  const toggleUserMenu = (e?: MouseEvent) => {
    e?.stopPropagation();
    setIsNotifOpen(false);
    setIsUserMenuOpen((prev) => !prev);
  };

  // Toggle notification popover
  const toggleNotif = (e?: MouseEvent) => {
    e?.stopPropagation();
    setIsUserMenuOpen(false);
    setIsNotifOpen((prev) => !prev);
  };

  // Toggle slide search
  const toggleSearch = () => {
    setIsSearchActive((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => searchInputRef.current?.focus(), 80);
      } else {
        setSearchQuery("");
      }
      return next;
    });
  };

  const handleSearchSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    const query = searchQuery.trim();
    if (query && onSearch) {
      onSearch(query);
    }
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    } else if (e.key === "Escape") {
      setIsSearchActive(false);
      searchInputRef.current?.blur();
    }
  };

  // Close menus on click outside or Escape key
  const closeAllMenus = useCallback(() => {
    setIsUserMenuOpen(false);
    setIsNotifOpen(false);
  }, []);

  useEffect(() => {
    const handleDocumentClick = (e: globalThis.MouseEvent) => {
      const target = e.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setIsNotifOpen(false);
      }
    };

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        closeAllMenus();
        setIsSearchActive(false);
      }
    };

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeAllMenus]);

  return (
    <>
      <header
        className={`${styles.topbarShell} ${className ?? ""}`}
        style={style}
        role="banner"
      >
        {/* Brand Group */}
        <Link
          href={brandHref}
          className={styles.brandGroup}
          title="RumaKost · Sistem Manajemen Kost Mandiri"
        >
          <BrandHouseKeyIcon />
          <span className={styles.brandName}>
            Ruma<span className={styles.brandNameAccent}>Kost</span>
          </span>
        </Link>

        {/* Desktop Navigation Pills */}
        <nav
          className={styles.desktopNav}
          aria-label="Navigasi Utama"
        >
          <ul className={styles.navPillContainer}>
            {desktopNavItems.map((item) => {
              const active = isPathActive(item.href, currentPath, activeId, item.id);
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`${styles.navPill} ${active ? styles.navPillActive : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right Utility Section */}
        <div className={styles.rightSection}>
          {/* Search Box */}
          <div
            className={`${styles.searchSlideBox} ${isSearchActive ? styles.searchSlideBoxActive : ""}`}
          >
            <form onSubmit={handleSearchSubmit}>
              <input
                ref={searchInputRef}
                type="text"
                className={styles.searchSlideField}
                placeholder="Cari kamar, penghuni, tagihan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                aria-label="Cari data operasional"
              />
              <button
                type="button"
                className={styles.searchSlideTrigger}
                onClick={toggleSearch}
                aria-label={isSearchActive ? "Tutup pencarian" : "Buka pencarian"}
                title="Cari data"
              >
                <SearchIcon />
              </button>
            </form>
          </div>

          {/* Notification Button */}
          <div className={styles.userDropdownWrap} ref={notifRef}>
            <button
              type="button"
              className={styles.iconCircleBtn}
              onClick={toggleNotif}
              aria-label={
                unreadNotifications > 0
                  ? `Notifikasi: ${unreadNotifications} belum dibaca`
                  : "Notifikasi"
              }
              aria-expanded={isNotifOpen}
              aria-haspopup="menu"
              title="Notifikasi"
            >
              <BellIcon />
              {unreadNotifications > 0 && (
                <span className={styles.unreadDot} aria-hidden="true" />
              )}
            </button>

            {isNotifOpen && (
              <div
                className={styles.notifDropdownMenu}
                role="menu"
                aria-label="Daftar Notifikasi"
              >
                <div className={styles.notifHeader}>
                  <div className={styles.notifTitle}>
                    <span>Notifikasi</span>
                    {unreadNotifications > 0 && (
                      <span className={styles.notifBadgeCount}>
                        {unreadNotifications} Baru
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.notifEmptyState}>
                  {unreadNotifications > 0
                    ? `${unreadNotifications} notifikasi aktif membutuhkan perhatian.`
                    : "Tidak ada notifikasi baru saat ini."}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu Dropdown */}
          <div className={styles.userDropdownWrap} ref={userMenuRef}>
            <button
              type="button"
              className={styles.userProfileBtn}
              onClick={toggleUserMenu}
              aria-expanded={isUserMenuOpen}
              aria-haspopup="menu"
              aria-label={`Menu Akun: ${userName}`}
              title="Menu Akun & Profil"
            >
              <div className={styles.userAvatar} aria-hidden="true">
                {initials}
              </div>
              <span className={styles.userNameText}>{userName}</span>
              <ChevronDownIcon isOpen={isUserMenuOpen} />
            </button>

            {isUserMenuOpen && (
              <div
                className={styles.dropdownMenu}
                role="menu"
                aria-label="Menu Pengguna"
              >
                <div className={styles.dropdownHeader}>
                  <div className={styles.dropdownUserName}>{userName}</div>
                  <div className={styles.dropdownUserEmail}>{userEmail}</div>
                </div>

                {role === "OWNER" && (
                  <>
                    <Link
                      href="/profil"
                      className={styles.dropdownMenuItem}
                      role="menuitem"
                      onClick={closeAllMenus}
                    >
                      <UserIcon />
                      <span>Profil & Ganti Sandi</span>
                    </Link>
                    <Link
                      href="/pengaturan/akun"
                      className={styles.dropdownMenuItem}
                      role="menuitem"
                      onClick={closeAllMenus}
                    >
                      <SettingsIcon />
                      <span>Kelola Pengguna</span>
                    </Link>
                    <Link
                      href="/aktivitas"
                      className={styles.dropdownMenuItem}
                      role="menuitem"
                      onClick={closeAllMenus}
                    >
                      <ActivityIcon />
                      <span>Audit Trail</span>
                    </Link>
                  </>
                )}

                {role === "STAFF" && (
                  <>
                    <Link
                      href="/profil"
                      className={styles.dropdownMenuItem}
                      role="menuitem"
                      onClick={closeAllMenus}
                    >
                      <UserIcon />
                      <span>Profil & Ganti Sandi</span>
                    </Link>
                    <Link
                      href="/pengaturan/akun"
                      className={styles.dropdownMenuItem}
                      role="menuitem"
                      onClick={closeAllMenus}
                    >
                      <SettingsIcon />
                      <span>Kelola Penghuni</span>
                    </Link>
                  </>
                )}

                {role === "TENANT" && (
                  <>
                    <Link
                      href="/portal"
                      className={styles.dropdownMenuItem}
                      role="menuitem"
                      onClick={closeAllMenus}
                    >
                      <HomeIcon />
                      <span>Beranda Kamar</span>
                    </Link>
                    <Link
                      href="/portal/tagihan"
                      className={styles.dropdownMenuItem}
                      role="menuitem"
                      onClick={closeAllMenus}
                    >
                      <ReceiptIcon />
                      <span>Tagihan Saya</span>
                    </Link>
                    <Link
                      href="/portal/tiket"
                      className={styles.dropdownMenuItem}
                      role="menuitem"
                      onClick={closeAllMenus}
                    >
                      <WrenchIcon />
                      <span>Tiket Kerusakan</span>
                    </Link>
                    <Link
                      href="/portal/profil"
                      className={styles.dropdownMenuItem}
                      role="menuitem"
                      onClick={closeAllMenus}
                    >
                      <UserIcon />
                      <span>Profil & Ganti Sandi</span>
                    </Link>
                  </>
                )}

                <div className={styles.dropdownDivider} />

                {logoutAction ? (
                  <form action={logoutAction} onSubmit={onLogout}>
                    <button
                      type="submit"
                      className={`${styles.dropdownMenuItem} ${styles.dropdownMenuDanger}`}
                      role="menuitem"
                    >
                      <LogOutIcon />
                      <span>Keluar Akun</span>
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    className={`${styles.dropdownMenuItem} ${styles.dropdownMenuDanger}`}
                    role="menuitem"
                    onClick={() => {
                      closeAllMenus();
                      onLogout?.();
                    }}
                  >
                    <LogOutIcon />
                    <span>Keluar Akun</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Ergonomic Bottom Navigation Bar */}
      {showMobileBottomNav && (
        <BottomNav
          role={role}
          currentPath={currentPath}
          activeId={activeId}
          onLogout={onLogout}
          logoutAction={logoutAction}
        />
      )}
    </>
  );
}

/* ==========================================================================
   NavigationShell Layout Wrapper
   ========================================================================== */
export interface NavigationShellProps extends TopbarProps {
  children?: ReactNode;
}

export function NavigationShell({
  children,
  ...topbarProps
}: NavigationShellProps) {
  return (
    <>
      <Topbar {...topbarProps} />
      <main>{children}</main>
    </>
  );
}

export default Topbar;

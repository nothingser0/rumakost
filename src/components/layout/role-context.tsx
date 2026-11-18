"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import styles from "./role-switcher.module.css";

/* ==========================================================================
   Types & Domain Definitions (CMP-19 / FSD §4 / FSD §7)
   ========================================================================== */

export type UserRole = "OWNER" | "STAFF" | "TENANT";

export const VALID_ROLES = ["OWNER", "STAFF", "TENANT"] as const;

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
}

export interface RoleContextValue {
  user: SessionUser | null;
  role: UserRole | null;
  isOwner: boolean;
  isStaff: boolean;
  isTenant: boolean;
  isAuthenticated: boolean;
  canAccessRoute: (pathname: string) => boolean;
}

/* ==========================================================================
   Pure Security Functions (Server-Bound Authorization Invariants)
   ========================================================================== */

/**
 * Validates whether a given input is strictly a recognized UserRole.
 * Rejects invalid strings, injection attempts, and non-string inputs.
 */
export function sanitizeRole(roleInput: unknown): UserRole | null {
  if (typeof roleInput !== "string") return null;
  const upper = roleInput.trim().toUpperCase();
  if (upper === "OWNER") return "OWNER";
  if (upper === "STAFF" || upper === "STAF") return "STAFF";
  if (upper === "TENANT" || upper === "PENGHUNI") return "TENANT";
  return null;
}

/**
 * Resolves the effective role for authorization.
 * CRUCIAL SECURITY REQUIREMENT (FSD §7 & M06-FE-20):
 * Role is strictly derived from the verified server session.
 * Client state, query strings (?role=owner), and local storage are
 * explicitly ignored/rejected to prevent client-side privilege escalation.
 */
export function resolveEffectiveRole(
  serverRole: string | undefined | null,
  clientAttempt?: unknown,
): UserRole | null {
  // If clientAttempt is provided, we intentionally discard it for authorization
  if (clientAttempt !== undefined && clientAttempt !== null) {
    // Client-side role spoofing attempt ignored
  }
  return sanitizeRole(serverRole);
}

/**
 * Evaluates whether a role is authorized to view a given route pathname.
 * Implements the server-boundary role matrix from FSD §4 and SITEMAP §4.
 */
export function canRoleAccessRoute(
  role: UserRole | null,
  pathname: string,
): boolean {
  if (!pathname) return false;
  const cleanPath = pathname.split("?")[0].replace(/\/+$/, "") || "/";

  // Public routes (accessible to anyone)
  const publicRoutes = [
    "/login",
    "/lupa-sandi",
    "/reset-sandi",
    "/403",
    "/404",
    "/components",
  ];
  if (publicRoutes.includes(cleanPath)) return true;

  // Unauthenticated users cannot access protected routes
  if (!role) return false;

  // Portal routes (Tenant territory)
  if (cleanPath.startsWith("/portal")) {
    // Only TENANT has access to portal
    return role === "TENANT";
  }

  // Management routes (Owner & Staff territory)
  if (role === "TENANT") {
    // Tenant cannot access any management route
    return false;
  }

  // Owner-only routes (FSD §4 & CR-2026-001)
  const ownerOnlyRoutes = [
    "/laporan", // Financial reports (pemasukan/pengeluaran/okupansi) & pagu
    "/aktivitas", // System audit trail
  ];
  if (ownerOnlyRoutes.includes(cleanPath)) {
    return role === "OWNER";
  }

  // Shared Owner & Staff routes
  const managementRoutes = [
    "/dashboard",
    "/kamar",
    "/penghuni",
    "/kontrak",
    "/tagihan",
    "/pembayaran",
    "/pengeluaran",
    "/tiket",
    "/profil",
    "/pengaturan/akun",
  ];

  return managementRoutes.some((route) => cleanPath === route || cleanPath.startsWith(`${route}/`));
}

/* ==========================================================================
   React Context & Provider (Immutable Server Session)
   ========================================================================== */

const RoleContext = createContext<RoleContextValue | null>(null);

export interface RoleProviderProps {
  serverUser: SessionUser | null;
  children: ReactNode;
}

export function RoleProvider({ serverUser, children }: RoleProviderProps) {
  // Role is locked directly to serverUser - NO setRole client mutator
  const effectiveRole = resolveEffectiveRole(serverUser?.role);

  const value = useMemo<RoleContextValue>(() => {
    const isOwner = effectiveRole === "OWNER";
    const isStaff = effectiveRole === "STAFF";
    const isTenant = effectiveRole === "TENANT";
    const isAuthenticated = effectiveRole !== null;

    return {
      user: serverUser,
      role: effectiveRole,
      isOwner,
      isStaff,
      isTenant,
      isAuthenticated,
      canAccessRoute: (pathname: string) => canRoleAccessRoute(effectiveRole, pathname),
    };
  }, [serverUser, effectiveRole]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const context = useContext(RoleContext);
  if (!context) {
    // Fallback safe guest state if rendered outside RoleProvider
    return {
      user: null,
      role: null,
      isOwner: false,
      isStaff: false,
      isTenant: false,
      isAuthenticated: false,
      canAccessRoute: (pathname: string) => canRoleAccessRoute(null, pathname),
    };
  }
  return context;
}

/* ==========================================================================
   CMP-19: Role Switcher Pill Bar (UI Presentation / Preview)
   ========================================================================== */

function ShieldCheckIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="14"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
      viewBox="0 0 24 24"
      width="14"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="14"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
      viewBox="0 0 24 24"
      width="14"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="14"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
      viewBox="0 0 24 24"
      width="14"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export interface RoleSwitcherItem {
  value: UserRole;
  label: string;
  icon: typeof ShieldCheckIcon;
}

export const ROLE_SWITCHER_ITEMS: readonly RoleSwitcherItem[] = [
  { value: "OWNER", label: "Pemilik", icon: ShieldCheckIcon },
  { value: "STAFF", label: "Staf Pengelola", icon: UserIcon },
  { value: "TENANT", label: "Penghuni", icon: HomeIcon },
] as const;

export interface RoleSwitcherPillBarProps {
  selectedRole?: UserRole;
  onChange?: (role: UserRole) => void;
  disabled?: boolean;
  className?: string;
  readOnly?: boolean;
}

export function RoleSwitcherPillBar({
  selectedRole = "OWNER",
  onChange,
  disabled = false,
  className = "",
  readOnly = false,
}: RoleSwitcherPillBarProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Pilih peran pengguna"
      className={`${styles.pillBar} ${className}`.trim()}
    >
      {ROLE_SWITCHER_ITEMS.map((item) => {
        const isActive = selectedRole === item.value;
        const IconComponent = item.icon;

        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={disabled || (readOnly && !isActive)}
            className={`${styles.pillItem} ${isActive ? styles.pillItemActive : ""}`.trim()}
            onClick={() => {
              if (!disabled && !readOnly) {
                onChange?.(item.value);
              }
            }}
          >
            <IconComponent />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default RoleProvider;

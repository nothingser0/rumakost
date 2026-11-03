import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/aktivasi-sandi/:path*",
    "/dashboard/:path*",
    "/kamar/:path*",
    "/penghuni/:path*",
    "/kontrak/:path*",
    "/tagihan/:path*",
    "/pembayaran/:path*",
    "/pengeluaran/:path*",
    "/laporan/:path*",
    "/tiket/:path*",
    "/aktivitas/:path*",
    "/pengaturan/:path*",
    "/profil/:path*",
    "/portal/:path*",
  ],
};

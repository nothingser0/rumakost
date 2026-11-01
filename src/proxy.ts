import { auth } from "@/lib/auth/server";

export const proxy = auth.middleware({ loginUrl: "/login" });

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

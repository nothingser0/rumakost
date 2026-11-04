import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "RumaKost",
  description: "Sistem Manajemen Kost Mandiri",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html className={poppins.variable} lang="id">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";
import CartDrawer from "@/components/CartDrawer";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Compass — Premium Footwear",
  description:
    "Walk with purpose. Step with passion. Discover Compass — curated premium footwear for those who know where they're going.",
  keywords: ["sepatu premium", "footwear", "compass shoes", "sneakers"],
  openGraph: {
    title: "Compass — Premium Footwear",
    description: "Walk with purpose. Step with passion.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0d0303]`}
      >
        <LenisProvider>
          {children}
          {/* Global cart drawer — available on all pages */}
          <CartDrawer />
        </LenisProvider>
      </body>
    </html>
  );
}

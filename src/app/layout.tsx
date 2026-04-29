import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import SWRegister from "@/components/sw-register";
import OfflinePrecache from "@/components/offline-precache";
import PWAInstallPrompt from "@/components/pwa-install-prompt";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Nick AI",
  description: "Cook with your favorite chef.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nick AI",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0F0F0F",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-[#0F0F0F] text-[#F5F0E8] antialiased`}>
        <div className="mx-auto min-h-dvh max-w-[480px] bg-[#0F0F0F]">
          {children}
        </div>
        <Toaster position="top-center" richColors theme="dark" />
        <SWRegister />
        <OfflinePrecache />
        <PWAInstallPrompt />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import SWRegister from "@/components/sw-register";
import OfflinePrecache from "@/components/offline-precache";
import PWAInstallPrompt from "@/components/pwa-install-prompt";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
  themeColor: "#1A1A1A",
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
      <body className={`${inter.className} bg-[#FAFAF7] text-[#111111] antialiased`}>
        <div className="mx-auto min-h-dvh max-w-[480px] bg-white">
          {children}
        </div>
        <Toaster position="top-center" richColors />
        <SWRegister />
        <OfflinePrecache />
        <PWAInstallPrompt />
      </body>
    </html>
  );
}

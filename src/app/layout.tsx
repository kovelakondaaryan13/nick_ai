import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nick AI",
  description: "Cook with your favorite chef.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#FAFAF7] text-[#111111] antialiased`}>
        <div className="mx-auto min-h-dvh max-w-[480px] bg-white">
          {children}
        </div>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}

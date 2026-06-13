import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coral Lookout — AI-Powered Reef Conservation",
  description:
    "Monitor coral reef health, detect bleaching, and build the world's largest student-driven conservation network — powered by AI and marine science.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased overflow-x-clip`}
    >
      <body className="min-h-full flex flex-col text-slate-100 overflow-x-clip bg-slate-950">
        <Providers>
          <header className="fixed top-0 left-0 right-0 z-50">
            <Navbar />
          </header>
          <main className="flex-1 min-w-0 pb-safe pt-14">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

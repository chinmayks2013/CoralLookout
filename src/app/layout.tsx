import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/providers/Providers";
import { HackathonBanner } from "@/components/hackathon/HackathonBanner";
import { isHackathonMode } from "@/lib/hackathon/config";
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
  title: "Coral Lookout — Student-Driven Reef Conservation",
  description:
    "Using AI and student innovation to help protect coral reefs worldwide. Monitor health, detect bleaching, learn, and compete globally.",
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
  const hackathon = isHackathonMode();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased overflow-x-clip ${hackathon ? "hackathon-mode" : ""}`}
    >
      <body
        className={`min-h-full flex flex-col text-slate-100 overflow-x-clip ${hackathon ? "hackathon-mode bg-transparent" : "bg-slate-950"}`}
      >
        <Providers>
          <header className="fixed top-0 left-0 right-0 z-50">
            <Navbar />
            {hackathon && <HackathonBanner />}
          </header>
          <main
            className={`flex-1 min-w-0 pb-safe ${hackathon ? "pt-[5.75rem]" : "pt-14"}`}
          >
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

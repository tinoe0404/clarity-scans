import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Space_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import dynamic from "next/dynamic";
import { InstallPromptBanner } from "@/components/shared/InstallPromptBanner";
import "./globals.css";

const DynamicWebVitals = dynamic(
  () => import("@/components/shared/WebVitals").then((mod) => mod.WebVitals),
  { ssr: false }
);

const jakarta = Plus_Jakarta_Sans({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const space = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "ClarityScans",
  description: "Understand your CT Scan",
  manifest: "/manifest.json",
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ClarityScans",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0f1e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${space.variable}`}>
      <body className="bg-surface-base text-white antialiased">
        <div className="app-shell relative mx-auto min-h-screen w-full md:max-w-2xl lg:max-w-4xl xl:max-w-5xl overflow-x-hidden bg-surface-card shadow-2xl">
          {children}
          <InstallPromptBanner />
        </div>
        <Analytics />
        <DynamicWebVitals />
      </body>
    </html>
  );
}

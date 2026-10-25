import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shared/Providers";
import { LakoSplashPreloader } from "@/components/brand/LakoSplashPreloader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#FF7A1A",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "LAKO — Marketplace & Delivery",
    template: "%s | LAKO",
  },
  description:
    "Lokal na Paninda at Mabilis na Delivery. Fresh local market seafood, native delicacies, and everyday pantry essentials delivered with guaranteed Cash on Delivery.",
  applicationName: "LAKO",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/brand/favicon.ico", sizes: "any" },
      { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/brand/favicon.ico"],
    apple: [
      { url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LAKO",
  },
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: "/",
    siteName: "LAKO",
    title: "LAKO — Marketplace & Delivery",
    description:
      "Lokal na Paninda at Mabilis na Delivery. Fresh local market seafood, native delicacies, and everyday pantry essentials with guaranteed Cash on Delivery.",
    images: [
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "LAKO - Marketplace & Delivery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LAKO — Marketplace & Delivery",
    description:
      "Lokal na Paninda at Mabilis na Delivery. Fresh local market seafood, native delicacies, and everyday essentials delivered with Cash on Delivery.",
    images: ["/brand/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900 font-sans">
        <LakoSplashPreloader />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shared/Providers";
import { getCurrentSession, getAllDemoUsers } from "@/lib/auth/session";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Movli — Your Local Marketplace in Lingayen, Pangasinan",
  description:
    "Shop authentic Lingayen delicacies, groceries, and essentials delivered in 30-60 mins by trusted local riders. Cash on Delivery (COD) available.",
  keywords: ["Lingayen delivery", "Pangasinan marketplace", "Movli", "local food delivery", "Lingayen bagoong", "COD"],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentSession = await getCurrentSession();
  const allUsers = await getAllDemoUsers();

  return (
    <html lang="en" className={`${jakarta.variable} ${outfit.variable} h-full`}>
      <body className="min-h-full font-sans antialiased bg-[#FBFBF9] text-[#1A202C] flex flex-col">
        <Providers currentSession={currentSession} allUsers={allUsers}>
          {children}
        </Providers>
      </body>
    </html>
  );
}

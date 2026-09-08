import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/components/ui/ThemeContext";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Jakhu Fitness — Unlock The Best Version",
  description:
    "Jakhu Fitness is a Delhi-based fitness equipment dealership offering treadmills, spin bikes, cross trainers, rowers and specialty equipment for home, studio and commercial gyms.",
  keywords: [
    "Jakhu Fitness",
    "gym equipment Delhi",
    "treadmill dealer Delhi",
    "spin bike Delhi",
    "commercial gym equipment",
  ],
};

import { prisma } from "@/lib/prisma";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const phoneSetting = await prisma.siteSetting.findUnique({
    where: { key: "site.phone" }
  });
  const phone = phoneSetting?.value || "+91 93110 37556";

  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${outfit.variable} ${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-theme-bg text-theme-text antialiased transition-colors duration-300">
        <ThemeProvider>
          <ToastProvider>
            <Navbar phone={phone} />
            <main className="flex-1">{children}</main>
            <Footer />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

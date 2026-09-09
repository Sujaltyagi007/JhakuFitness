import "../globals.css";
import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/components/AuthProvider";
import { PreferencesProvider } from "@/components/admin/PreferencesProvider";
import LiveNotificationListener from "@/components/LiveNotificationListener";
import { NotificationProvider } from "@/components/NotificationContext";

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
    description: "Jakhu Fitness is a Delhi-based fitness equipment dealership offering treadmills, spin bikes, cross trainers, rowers and specialty equipment for home, studio and commercial gyms.",
    keywords: [
        "Jakhu Fitness",
        "gym equipment Delhi",
        "treadmill dealer Delhi",
        "spin bike Delhi",
        "commercial gym equipment",
    ],
};




export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" data-scroll-behavior="smooth" className={`${outfit.variable} ${inter.variable} h-full`}>
            <body className="h-full bg-[#f8f8f6] text-ink antialiased overflow-hidden">
                <NotificationProvider>
                    <AuthProvider>
                        <PreferencesProvider>
                            <ToastProvider>
                                <main className="h-full">{children}</main>
                                <LiveNotificationListener />
                            </ToastProvider>
                        </PreferencesProvider>
                    </AuthProvider>
                </NotificationProvider>
            </body>
        </html>
    );
}

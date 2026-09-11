import { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import NotFoundHero from "@/components/layout/NotFoundHero";
import { ThemeProvider } from "@/components/ui/ThemeContext";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "404: Page Not Found | Jakhu Fitness",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <div className={`${outfit.variable} antialiased`}>
      <ThemeProvider>
        <NotFoundHero />
      </ThemeProvider>
    </div>
  );
}

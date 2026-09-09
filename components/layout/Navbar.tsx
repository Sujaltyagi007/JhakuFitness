"use client";
import Link from "next/link";
import { categories } from "@/lib/products";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { motion, AnimatePresence } from "motion/react";
import { Container, Button } from "@/components/ui/Primitives";

const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar({ phone = "+91 93110 37556" }: { phone?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  const isHome = pathname === "/";
  const solid = scrolled || !isHome || open;

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${solid ? "bg-theme-surface border-b border-theme-border shadow-lg backdrop-blur-md" : "bg-transparent"}`}>
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className={`font-display text-xl font-bold tracking-tight ${solid ? "text-theme-text" : "text-white"}`}>
              Jakhu Fitness
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-8 md:flex pl-8 ">
          <div className="relative" onMouseEnter={() => setMegaOpen(true)} onMouseLeave={() => setMegaOpen(false)}>
            <Link href="/products" className={`text-sm font-medium hover:text-gold transition-colors ${solid ? "text-theme-text/90" : "text-white"}`}>
              Products
            </Link>
            <AnimatePresence>
              {megaOpen && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.18 }} className="absolute left-1/2 top-full w-140 -translate-x-1/2 pt-4">
                  <div className="grid grid-cols-2 gap-2 rounded-2xl border border-theme-border bg-theme-surface p-4 shadow-2xl backdrop-blur-xl">
                    {categories.map((c) => (
                      <Link key={c.id} href="/products" className="rounded-xl p-3 transition-colors hover:bg-theme-surface-hover">
                        <p className="font-display text-sm font-semibold text-theme-text">{c.name}</p>
                        <p className="mt-1 text-xs leading-relaxed text-theme-muted">{c.blurb}</p>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {NAV_LINKS.slice(1).map((link) => (
            <Link key={link.href} href={link.href} className={`text-sm font-medium hover:text-gold transition-colors ${solid ? "text-theme-text/90" : "text-white"}`}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <a href={`tel:${phone.replace(/\\D/g, "")}`} className={`flex items-center gap-2 text-sm font-medium hover:text-gold transition-colors ${solid ? "text-theme-text" : "text-white"}`}>
            <Phone size={15} className="text-gold" />
            {phone}
          </a>
          <Button href="/products" className="px-5! py-2! text-white ">
            Explore range
          </Button>
          <ThemeToggle />
        </div>

        <button className={`md:hidden ${solid ? "text-theme-text" : "text-white"}`} onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </Container>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-theme-border bg-theme-surface md:hidden"          >
            <Container className="flex flex-col gap-1 py-4">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-lg px-3 py-3 text-base font-medium text-theme-text hover:bg-theme-surface-hover" >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-1 border-t border-theme-border pt-3">
                {categories.map((c) => (
                  <Link key={c.id} href="/products" className="rounded-lg px-3 py-2 text-sm text-theme-muted hover:bg-theme-surface-hover hover:text-theme-text" >
                    {c.name}
                  </Link>
                ))}
              </div>
              <a href={`tel:${phone.replace(/\\D/g, "")}`} className="mt-3 flex items-center gap-2 px-3 text-sm font-medium text-theme-text" >
                <Phone size={15} /> {phone}
              </a>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

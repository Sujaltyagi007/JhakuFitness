"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Phone } from "lucide-react";
import { categories } from "@/lib/products";
import { Container, Button } from "@/components/ui/Primitives";

const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
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

  // Close the mobile menu whenever the route changes, without a
  // synchronous setState-in-effect (React's "adjust state during
  // render" pattern rather than useEffect).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  const isHome = pathname === "/";
  const solid = scrolled || !isHome || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${solid ? "bg-paper/95 shadow-sm backdrop-blur" : "bg-transparent"
        }`}
    >
      <Container className="flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span
            className={`font-display text-xl font-semibold tracking-tight transition-colors ${solid ? "text-ink" : "text-white"
              }`}
          >
            Jakhu Fitness
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          <div
            className="relative"
            onMouseEnter={() => setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
          >
            <Link
              href="/products"
              className={`text-sm font-medium transition-colors ${solid ? "text-ink hover:text-gold-deep" : "text-white/90 hover:text-white"
                }`}
            >
              Products
            </Link>
            <AnimatePresence>
              {megaOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-1/2 top-full w-140 -translate-x-1/2 pt-4"
                >
                  <div className="grid grid-cols-2 gap-1 rounded-2xl border border-ink/10 bg-white p-4 shadow-xl">
                    {categories.map((c) => (
                      <Link
                        key={c.id}
                        href="/products"
                        className="rounded-xl p-3 transition-colors hover:bg-paper"
                      >
                        <p className="font-display text-sm font-semibold text-ink">
                          {c.name}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-steel">
                          {c.blurb}
                        </p>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {NAV_LINKS.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${solid ? "text-ink hover:text-gold-deep" : "text-white/90 hover:text-white"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <a
            href="tel:9311037556"
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${solid ? "text-ink" : "text-white"
              }`}
          >
            <Phone size={15} />
            93110 37556
          </a>
          <Button href="/products" className="px-5! py-2.5!">
            Explore range
          </Button>
        </div>

        <button
          className={`md:hidden ${solid ? "text-ink" : "text-white"}`}
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </Container>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-ink/10 bg-paper md:hidden"
          >
            <Container className="flex flex-col gap-1 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-3 text-base font-medium text-ink hover:bg-white"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-1 border-t border-ink/10 pt-3">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href="/products"
                    className="rounded-lg px-3 py-2 text-sm text-steel hover:bg-white hover:text-ink"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
              <a
                href="tel:9311037556"
                className="mt-3 flex items-center gap-2 px-3 text-sm font-medium text-ink"
              >
                <Phone size={15} /> 93110 37556
              </a>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

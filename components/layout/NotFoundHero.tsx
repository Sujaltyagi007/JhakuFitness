"use client";

import { Fragment, useEffect, useState } from "react";
import { Button } from "@/components/ui/Primitives";
import { useTheme } from "@/components/ui/ThemeContext";

const IMAGES = {
  light: { web: "/images/404-web-light.png", mob: "/images/404-mob-light.png" },
  dark: { web: "/images/404-web-dark.png", mob: "/images/404-mob-dark.png" },
};

export default function NotFoundHero() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? theme : "dark";
  const { web, mob } = IMAGES[currentTheme];

  return (
    <Fragment>
      <section className="flex min-h-screen w-full flex-col justify-center gap-4 bg-theme-bg py-10 sm:hidden">
        <div className="px-6" >
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-theme-border bg-theme-card px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-gold">Error 404</span>
          <h1 className="mt-4 font-display text-4xl font-extrabold uppercase tracking-tight text-theme-text">Page not found</h1>
        </div>
        <div className="relative w-full overflow-hidden flex items-center justify-center">
          {mounted && (
            <img src={mob} alt="404 Graphic" className="h-full w-full object-contain" fetchPriority="high"
              decoding="async" style={{
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 10%, black 25%, black 85%, transparent 100%)',
                maskImage: 'linear-gradient(to bottom, transparent 10%, black 25%, black 85%, transparent 100%)'
              }}
            />
          )}
        </div>
        <div className="px-6">
          <p className="text-base font-semibold leading-relaxed mt-4 text-theme-muted">Looks like this page needs a little adjustment. The page you&apos;re after may have been moved or never existed.</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button href="/">Back to home</Button>
            <Button href="/products" variant="ghost">Browse products</Button>
          </div>
        </div>
      </section>
      <section className="relative hidden min-h-screen w-full items-center overflow-hidden bg-theme-bg sm:flex">
        {mounted && (
          <div className="absolute inset-0 z-0">
            <img src={web} alt="404 Graphic" className="h-full w-full object-cover" fetchPriority="high" decoding="async" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 z-10" style={{ background: "linear-gradient(100deg, var(--bg-main) 0%, color-mix(in srgb, var(--bg-main) 78%, transparent) 40%, transparent 68%)" }} />
        <div className="relative z-20 w-full px-8 py-16 lg:px-12">
          <div className="mx-auto w-full max-w-7xl">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-theme-border bg-theme-card px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-gold backdrop-blur-sm">
                Error 404
              </span>
              <h1 className="mt- font-display text-6xl font-extrabold md:font-bold uppercase tracking-tight text-theme-text lg:text-7xl">
                Page not found
              </h1>
              <p className="mt-2 max-w-lg text-lg leading-relaxed text-theme-muted">
                Looks like this page needs a little adjustment. The page you&apos;re after may have been moved or never existed.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button href="/">Back to home</Button>
                <Button href="/products" variant="ghost" className="backdrop-blur-sm border-theme-border bg-theme-surface/30">
                  Browse products
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Fragment>
  );
}

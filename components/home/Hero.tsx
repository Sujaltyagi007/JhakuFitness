"use client";

import { useState, useEffect } from "react";
import HeroSceneClient from "./HeroSceneClient";
import { Button } from "@/components/ui/Primitives";
import { motion, type Variants } from "motion/react";
import { MapPin, Zap, ChevronDown, Activity, Timer, type LucideIcon } from "lucide-react";

/* ─────────────── animation variants ─────────────── */
const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

const lineVariant: Variants = {
  hidden: { y: "110%", opacity: 0 },
  show: (i: number) => ({
    y: "0%",
    opacity: 1,
    transition: { duration: 0.9, ease: easeOut, delay: 0.2 + i * 0.15 },
  }),
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOut, delay },
  }),
};

/* ─────────────── animated stat counter ─────────────── */
function StatTicker({
  label,
  value,
  unit,
  icon: Icon,
  delay = 0,
}: {
  label: string;
  value: number;
  unit: string;
  icon: LucideIcon;
  delay?: number;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let start = 0;
      const step = value / 60;
      const interval = setInterval(() => {
        start = Math.min(start + step, value);
        setCurrent(Math.round(start));
        if (start >= value) clearInterval(interval);
      }, 16);
      return () => clearInterval(interval);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="flex flex-1 items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 px-2.5 py-2 sm:px-5 sm:py-3 backdrop-blur-md min-w-0"
    >
      <Icon size={14} className="shrink-0 text-gold sm:h-4 sm:w-4" />
      <div className="min-w-0">
        <p className="text-[8px] sm:text-[10px] font-medium uppercase tracking-wider sm:tracking-widest text-white/40 truncate">
          {label}
        </p>
        <p className="font-display text-sm sm:text-lg font-semibold text-white leading-none mt-0.5">
          {current}
          <span className="ml-0.5 text-[10px] sm:text-xs font-normal text-white/50">{unit}</span>
        </p>
      </div>
    </motion.div>
  );
}

/* ─────────────── scroll indicator ─────────────── */
function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2, duration: 0.8 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2"
    >
      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">
        Scroll
      </span>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown size={16} className="text-white/30" />
      </motion.div>
    </motion.div>
  );
}

/* ─────────────── main hero ─────────────── */

interface HeroProps {
  headline: string;
  subtext: string;
  locationBadge: string;
}

export default function Hero({ headline, subtext, locationBadge }: HeroProps) {
  const headlineLines = headline.split("\n");
  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-ink">

      {/* ── Full-screen 3D treadmill background ── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <HeroSceneClient fullscreen />
      </div>

      {/* ── Depth gradient overlays ── */}
      {/* Mobile bottom panel scrim: creates a dedicated dark stage at bottom for text, leaving top 50% completely open for 3D treadmill */}
      <div
        className="pointer-events-none absolute inset-0 z-10 md:hidden"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, transparent 28%, rgba(11,11,13,0.5) 44%, rgba(11,11,13,0.92) 60%, #0b0b0d 100%)",
        }}
      />
      {/* Desktop horizontal left fade */}
      <div
        className="pointer-events-none absolute inset-0 z-10 hidden md:block"
        style={{
          background:
            "linear-gradient(100deg, rgba(11,11,13,0.92) 0%, rgba(11,11,13,0.72) 38%, rgba(11,11,13,0.12) 65%, transparent 100%)",
        }}
      />
      {/* bottom fade */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-16 sm:h-20"
        style={{
          background:
            "linear-gradient(to top, rgba(11,11,13,0.85) 0%, transparent 100%)",
        }}
      />
      {/* subtle top vignette */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-24 sm:h-32"
        style={{
          background: "linear-gradient(to bottom, rgba(11,11,13,0.55) 0%, transparent 100%)",
        }}
      />

      {/* ── Main content: On mobile, all text is anchored at the bottom; on desktop, vertically centered on left ── */}
      <div className="relative z-20 flex min-h-dvh flex-1 flex-col justify-end sm:justify-center px-5 pt-20 pb-6 sm:px-8 sm:py-28 lg:px-16 xl:px-24">
        <div className="max-w-xl">
          {/* location badge */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease: easeOut }}
            className="mb-2 sm:mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-1 sm:px-4 sm:py-1.5 text-[11px] sm:text-xs font-medium text-white/65 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
            </span>
            <MapPin size={11} className="text-gold" />
            {locationBadge}
          </motion.div>

          {/* headline */}
          <h1 className="font-display text-[1.75rem] leading-[1.12] font-semibold tracking-tight text-white sm:text-3xl md:text-[2.25rem] lg:text-[2.5rem] xl:text-[2.75rem] sm:leading-[1.12]">
            {headlineLines.map((word, i) => (
              <span key={word} className="block overflow-hidden">
                <motion.span
                  custom={i}
                  variants={lineVariant}
                  initial="hidden"
                  animate="show"
                  className="inline-block"
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>

          {/* gold accent line */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.65, ease: easeOut }}
            style={{ originX: 0 }}
            className="mt-2.5 sm:mt-4 h-0.75 w-14 sm:w-16 rounded-full bg-linear-to-r from-gold to-gold-bright"
          />

          {/* sub-headline */}
          <motion.p
            custom={0.9}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-2.5 sm:mt-5 max-w-sm sm:max-w-md text-xs leading-relaxed text-white/60 sm:text-sm md:text-[0.75rem]"
          >
            {subtext}
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            custom={1.1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-4 sm:mt-6 flex flex-row items-center gap-2.5 sm:gap-4 max-w-sm sm:max-w-none"
          >
            <Button
              href="/products"
              className="flex-1 sm:flex-initial px-4! py-2.5! sm:px-6! sm:py-3! text-xs sm:text-sm font-medium shadow-lg shadow-gold/10"
            >
              <Zap size={13} className="shrink-0" />
              Explore our range
            </Button>
            <Button
              href="/contact"
              variant="ghost"
              className="flex-1 sm:flex-initial px-4! py-2.5! sm:px-6! sm:py-3! text-xs sm:text-sm border-white/18! text-white! hover:border-white/45! hover:bg-white/5!"
            >
              Get a quote
            </Button>
          </motion.div>

          {/* ── live stats bar: single horizontal 3-column row on mobile ── */}
          <div className="mt-3.5 sm:mt-6 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3 max-w-md sm:max-w-none">
            <StatTicker label="Speed" value={12} unit=" km/h" icon={Activity} delay={1.4} />
            <StatTicker label="Incline" value={8} unit="%" icon={Zap} delay={1.6} />
            <StatTicker label="Time" value={32} unit=" min" icon={Timer} delay={1.8} />
          </div>
        </div>
      </div>

      {/* ── scroll cue (hidden on mobile to prevent clutter) ── */}
      <ScrollIndicator />

      {/* ── Gold accent glow on the right edge ── */}
      <div
        className="pointer-events-none absolute right-0 top-1/3 z-10 h-96 w-2 blur-xl"
        style={{ background: "linear-gradient(to bottom, transparent, #c9a54e44, transparent)" }}
      />
    </section>
  );
}

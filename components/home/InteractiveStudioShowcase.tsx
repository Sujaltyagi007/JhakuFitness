"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Container } from "@/components/ui/Primitives";
import { Shield, Sparkles, Layers, ArrowRight, Activity } from "lucide-react";
import HeroSceneClient from "./HeroSceneClient";

interface SpecHotspot {
  id: string;
  x: number; // percentage
  y: number; // percentage
  label: string;
  detail: string;
}

const SHOWCASE_TABS = [
  {
    id: "pin-loaded",
    name: "Pin Loaded Series",
    tagline: "Selectorized Precision Strength",
    description: "Biometrically isolated motion paths with smooth weight selectorization for safety & performance.",
    hotspots: [
      { id: "h1", x: 35, y: 30, label: "Solid Steel Stack", detail: "Machined cold-rolled steel plates with low-friction nylon bushings." },
      { id: "h2", x: 65, y: 50, label: "Aircraft Cable", detail: "7x19 strand aircraft-grade cable rated for 2,200+ lbs tensile pull." },
      { id: "h3", x: 50, y: 75, label: "Ergonomic Cushion", detail: "High-density molded foam wrapped in industrial anti-microbial vinyl." },
    ],
  },
  {
    id: "hammer",
    name: "Hammer Plate Loaded",
    tagline: "Iso-Lateral Leverage Builds",
    description: "Natural converging/diverging movement arcs engineered for heavy powerlifters and commercial gyms.",
    hotspots: [
      { id: "h1", x: 30, y: 40, label: "Dual Horn Pegs", detail: "Stainless steel weight horns capable of holding up to 8x 25kg bumper plates." },
      { id: "h2", x: 70, y: 35, label: "Pillow Block Bearings", detail: "Sealed commercial bearings ensure zero frame play under max load." },
    ],
  },
  {
    id: "benches-utilities",
    name: "Benches & Utility Racks",
    tagline: "Commercial Structural Anchor",
    description: "Laser-cut 11-gauge steel frames with multi-angle quick pop-pin adjustments.",
    hotspots: [
      { id: "h1", x: 45, y: 45, label: "Pop-Pin Lock", detail: "Hardened steel spring-loaded locking pin for fast tilt changes." },
      { id: "h2", x: 55, y: 80, label: "Rubber Feet Caps", detail: "Heavy non-skid rubber base pads protect flooring and stabilize lifting." },
    ],
  },
];

export default function InteractiveStudioShowcase() {
  const [activeTabId, setActiveTabId] = useState("pin-loaded");
  const [activeHotspot, setActiveHotspot] = useState<SpecHotspot | null>(null);

  const currentTab = SHOWCASE_TABS.find((t) => t.id === activeTabId) ?? SHOWCASE_TABS[0];

  return (
    <section className="relative overflow-hidden bg-theme-surface py-24 sm:py-32 border-t border-theme-border">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-[120px]" />

      <Container>
        <div className="flex flex-col gap-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-xs font-semibold text-gold">
              <Sparkles size={13} />
              <span>3D Equipment Studio</span>
            </div>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-theme-surface-text sm:text-4xl lg:text-5xl">
              Engineered for Extreme Load
            </h2>
            <p className="mt-3 text-base text-theme-surface-muted">
              Inspect our commercial build standards up close. Every joint, cable, and bearing is stress-tested in our Delhi facility.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="-mx-5 flex overflow-x-auto px-5 pb-2 sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0 scrollbar-hide">
            <div className="flex w-max shrink-0 gap-2 rounded-2xl border border-theme-border bg-theme-bg p-1.5 backdrop-blur-md">
              {SHOWCASE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTabId(tab.id);
                    setActiveHotspot(null);
                  }}
                  className={`rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium transition-all ${
                    activeTabId === tab.id
                      ? "bg-gold text-ink font-semibold shadow-lg shadow-gold/20"
                      : "text-theme-surface-muted hover:text-theme-surface-text hover:bg-theme-surface-hover"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Showcase Stage */}
        <div className="mt-8 lg:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* 3D Canvas Container */}
          <div className="relative lg:col-span-8 h-100 sm:h-125 lg:h-150 rounded-3xl border border-theme-border bg-theme-bg p-4 backdrop-blur-xl overflow-hidden group">
            <div className="absolute inset-0 z-0">
              <HeroSceneClient fullscreen />
            </div>

            {/* Overlay Glass Badge */}
            <div className="absolute top-6 left-6 z-10 rounded-2xl border border-theme-border bg-theme-surface px-4 py-2.5 backdrop-blur-md">
              <p className="text-xs font-medium text-gold">{currentTab.tagline}</p>
              <p className="text-sm font-semibold text-theme-surface-text mt-0.5">{currentTab.name}</p>
            </div>

            {/* Interactive Hotspots */}
            {currentTab.hotspots.map((spot) => (
              <div
                key={spot.id}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
              >
                <button
                  onClick={() => setActiveHotspot(activeHotspot?.id === spot.id ? null : spot)}
                  className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gold/90 text-ink shadow-lg shadow-gold/40 transition-transform hover:scale-125"
                >
                  <span className="absolute inset-0 animate-ping rounded-full bg-gold opacity-60" />
                  <Activity size={15} className="relative z-10" />
                </button>

                {/* Hotspot Tooltip */}
                <AnimatePresence>
                  {activeHotspot?.id === spot.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      className="absolute bottom-12 left-1/2 z-30 w-56 -translate-x-1/2 rounded-2xl border border-gold/40 bg-theme-surface p-4 shadow-2xl backdrop-blur-xl pointer-events-none"
                    >
                      <p className="text-xs font-bold text-gold">{spot.label}</p>
                      <p className="mt-1 text-xs text-theme-surface-muted leading-relaxed">{spot.detail}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Side Info Panel */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="rounded-3xl border border-theme-border bg-theme-bg p-6 lg:p-8 backdrop-blur-md">
              <h3 className="text-xl font-bold text-theme-surface-text">{currentTab.name} Specs</h3>
              <p className="mt-2 text-sm text-theme-surface-muted leading-relaxed">{currentTab.description}</p>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold border border-gold/20">
                    <Shield size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-theme-surface-muted">Frame Guarantee</h4>
                    <p className="text-sm font-semibold text-theme-surface-text mt-0.5">10-Year Commercial Structural Warranty</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold border border-gold/20">
                    <Layers size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-theme-surface-muted">Customization</h4>
                    <p className="text-sm font-semibold text-theme-surface-text mt-0.5">Custom Frame & Upholstery Colors</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

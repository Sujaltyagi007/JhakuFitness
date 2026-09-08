"use client";
import { motion } from "motion/react";
import { Shield, Cpu, Sparkles, Award, Truck, Wrench, CheckCircle2 } from "lucide-react";

const MARQUEE_ITEMS = [
  { icon: Shield, text: "11-Gauge Heavy Duty Steel" },
  { icon: Sparkles, text: "Electrostatic Powder Coating Finish" },
  { icon: Award, text: "Direct Manufacturer Pricing" },
  { icon: Truck, text: "Delhi NCR On-Site Delivery" },
  { icon: Wrench, text: "Professional Turnkey Gym Setup" },
  { icon: Cpu, text: "Biometrically Engineered Motion Paths" },
  { icon: CheckCircle2, text: "Alipur Live Showroom Experience" },
];

export default function BrandMarquee() {
  return (
    <div className="relative overflow-hidden border-y border-theme-border bg-theme-surface py-3 backdrop-blur-md">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-theme-surface to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-theme-surface to-transparent" />
      <motion.div animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="flex w-max items-center gap-8 whitespace-nowrap"      >
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/10 text-gold border border-gold/20">
                <Icon size={14} />
              </span>
              <span className="text-xs sm:text-sm font-medium tracking-wide text-theme-surface-text">
                {item.text}
              </span>
              <span className="ml-4 h-1.5 w-1.5 rounded-full bg-gold/40" />
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

"use client";

import { motion } from "motion/react";

const STEPS = [
  {
    year: "Phase 01",
    title: "Alipur Workshop Foundation",
    description:
      "Jakhu Fitness opened its specialized engineering factory in Alipur, Delhi, crafting custom squat racks and basic heavy cardio units.",
  },
  {
    year: "Phase 02",
    title: "Boutique Studio Expansion",
    description:
      "Word of mouth spread across North Delhi. Expanded into multi-jungle cable crossovers, spin bikes, rowers, and plate-loaded hammer lines.",
  },
  {
    year: "Phase 03",
    title: "Full Commercial Fit-Outs",
    description:
      "Partnered with major Delhi commercial gyms, supplying 11-gauge steel pin-loaded series with direct factory installation teams.",
  },
  {
    year: "Today",
    title: "Premier Equipment Hub",
    description:
      "Jakhu Fitness now serves 350+ commercial floors, boutique athletic studios, and luxury home gyms across Delhi NCR.",
  },
];

export default function Timeline() {
  return (
    <div className="relative mt-8">
      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-linear-to-b from-gold via-gold/40 to-transparent" />
      <div className="space-y-12">
        {STEPS.map((step, i) => (
          <motion.div key={step.title}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative flex gap-6 pl-12 group">
            <span className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-ink border-2 border-gold text-xs font-bold text-gold shadow-lg shadow-gold/20 group-hover:scale-110 transition-transform">
              0{i + 1}
            </span>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all group-hover:border-gold/40 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-gold">{step.year}</span>
              <h3 className="mt-1 font-display text-lg font-bold text-white">{step.title}</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-white/85 font-medium">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { motion } from "motion/react";
import { Container } from "@/components/ui/Primitives";
import { MessageSquare, Cpu, Wrench, ShieldCheck } from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "Layout & Load Consultation",
    desc: "We analyze your gym floor dimensions, user capacity, and budget to select the exact machinery mix.",
    icon: MessageSquare,
  },
  {
    step: "02",
    title: "Precision Manufacturing",
    desc: "Heavy 11-gauge steel tubes are laser-cut, robot-welded, and electrostatic powder coated in Alipur.",
    icon: Cpu,
  },
  {
    step: "03",
    title: "On-Site Assembly & Rigging",
    desc: "Our senior technicians deliver, align cables, anchor racks, and test every weight stack on location.",
    icon: Wrench,
  },
  {
    step: "04",
    title: "Lifetime Calibration & Warranty",
    desc: "Direct factory support, quick spare parts replacement, and annual maintenance checks.",
    icon: ShieldCheck,
  },
];

export default function ProcessTimeline() {
  return (
    <section className="bg-theme-surface py-24 sm:py-32 border-t border-theme-border">
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold">Turnkey Execution</span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-theme-surface-text">
            From Blueprint to First Lift
          </h2>
          <p className="mt-3 text-sm text-theme-surface-muted">
            How we outfit commercial floors and private athletic studios across Delhi NCR with zero hassle.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative rounded-2xl border border-theme-border bg-theme-bg p-6 backdrop-blur-md flex flex-col justify-between group hover:border-gold/50 transition-colors">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-2xl font-bold text-gold/60 group-hover:text-gold transition-colors">
                      {s.step}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold border border-gold/20">
                      <Icon size={18} />
                    </div>
                  </div>
                  <h3 className="mt-6 font-display text-lg font-semibold text-theme-surface-text">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-theme-surface-muted leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-6 h-0.5 w-full bg-linear-to-r from-gold/30 to-transparent rounded-full" />
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

"use client";

import { motion } from "motion/react";

const STEPS = [
  {
    year: "Year 1",
    title: "Started as a local dealership",
    description:
      "Jakhu Fitness opened its doors in Alipur, Delhi, supplying treadmills and basic cardio equipment to nearby homes.",
  },
  {
    year: "Year 2–3",
    title: "Expanded into studios",
    description:
      "Word of mouth brought in boutique spin and training studios, pushing the catalog into spin bikes, rowers and cross trainers.",
  },
  {
    year: "Year 4–5",
    title: "Commercial gym partnerships",
    description:
      "Added commercial-grade decks and specialty equipment to serve full gym floors, backed by an in-house installation team.",
  },
  {
    year: "Today",
    title: "A full-range dealership",
    description:
      "Jakhu Fitness now carries treadmills, spin bikes, cross trainers, rowers and specialty equipment for every kind of training space.",
  },
];

export default function Timeline() {
  return (
    <div className="relative mt-4">
      <div className="absolute left-3.75 top-2 bottom-2 w-px bg-ink/10" />
      <div className="space-y-10">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="relative flex gap-6 pl-10"
          >
            <span className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-semibold text-gold">
              {i + 1}
            </span>
            <div>
              <p className="text-xs font-medium text-gold-deep">{step.year}</p>
              <h3 className="mt-1 font-display text-base font-semibold text-ink">
                {step.title}
              </h3>
              <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-steel">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

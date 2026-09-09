"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Container } from "@/components/ui/Primitives";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQS = [
  {
    q: "Can I visit the Jakhu Fitness showroom in Delhi to test equipment?",
    a: "Yes! Our live showroom in Alipur, Delhi displays our full Pin Loaded, Hammer Strength, Benches, and Custom Racks. You can test deck cushioning, pulley smoothness, and frame rigidity in person before placing an order.",
  }, {
    q: "What warranty and service guarantees do you offer for commercial gyms?",
    a: "We provide a 10-year structural warranty on 11-gauge steel frames, 2 years on weight stack plates and guide rods, and 1 year on cables, pulleys, and upholstery. Replacement parts are dispatched locally from our Alipur factory.",
  }, {
    q: "Do you offer custom powder coating and upholstery colorways?",
    a: "Absolutely. You can choose custom frame powder coating (Matte Black, Textured Graphite, Gloss Yellow, Crimson) and custom stitched upholstery to match your gym brand identity.",
  }, {
    q: "How fast is delivery and installation in Delhi NCR?",
    a: "For in-stock catalog products, delivery and technician assembly take 24–48 hours across Delhi NCR. Custom full-gym manufacturing builds take 7–14 days.",
  },
];

export default function InteractiveFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="bg-theme-surface py-24 sm:py-32 border-t border-theme-border">
      <Container>
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-xs font-semibold text-gold">
              <HelpCircle size={13} />
              <span>Frequently Asked Questions</span>
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold text-theme-surface-text sm:text-4xl">
              Everything You Need to Know
            </h2>
            <p className="mt-2 text-sm text-theme-surface-muted">
              Clear answers about showroom visits, manufacturing specs, and Delhi delivery timelines.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div key={idx} className="rounded-2xl border border-theme-border bg-theme-bg backdrop-blur-md overflow-hidden transition-colors hover:border-gold/40" >
                  <button onClick={() => setOpenIdx(isOpen ? null : idx)} className="flex w-full items-center justify-between p-6 text-left">
                    <span className="font-display text-base font-semibold text-theme-surface-text pr-4">
                      {faq.q}
                    </span>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-theme-border text-gold transition-transform duration-300 ${isOpen ? "rotate-180 bg-gold text-ink" : ""}`}>
                      <ChevronDown size={16} />
                    </span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} >
                        <div className="px-6 pb-6 text-sm text-theme-surface-muted leading-relaxed border-t border-theme-border pt-4">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}

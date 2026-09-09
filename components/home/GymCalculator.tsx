"use client";
import { useState } from "react";
import { Container } from "@/components/ui/Primitives";
import { Calculator, Check, MessageSquare, Sparkles, SlidersHorizontal } from "lucide-react";

const SETUP_TYPES = [
  { id: "commercial", label: "Commercial Gym", baseCostPerSqft: 450, recommended: "Pin Loaded + Hammer Series + Racks" },
  { id: "studio", label: "Boutique Studio", baseCostPerSqft: 380, recommended: "Multi-Jungle + Utility Benches" },
  { id: "home", label: "Luxury Home Gym", baseCostPerSqft: 520, recommended: "Power Rack + Adjustable Bench + Dumbbell Set" },
];

export default function GymCalculator({ phone = "+91 93110 37556" }: { phone?: string }) {
  const [selectedType, setSelectedType] = useState(SETUP_TYPES[0].id);
  const [sqft, setSqft] = useState(1500);

  const currentType = SETUP_TYPES.find((t) => t.id === selectedType) ?? SETUP_TYPES[0];

  const estimatedTotal = Math.round((sqft * currentType.baseCostPerSqft) / 1000) * 1000;
  const formattedEstimate = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(estimatedTotal);

  const whatsappMessage = encodeURIComponent(
    `Hello Jakhu Fitness Team! I used your online estimator for a ${currentType.label} (~${sqft} sq ft). My estimated equipment budget is ${formattedEstimate}. I would like to get a detailed quotation.`
  );

  return (
    <section className="relative overflow-hidden bg-theme-surface py-24 sm:py-32 border-t border-theme-border">
      <Container>
        <div className="mx-auto max-w-4xl rounded-3xl border border-theme-border bg-theme-bg p-8 sm:p-12 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-theme-border">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                <Calculator size={13} />
                <span>Instant Estimator</span>
              </div>
              <h2 className="mt-3 font-display text-2xl sm:text-3xl font-bold text-theme-text">
                Gym Setup & Budget Planner
              </h2>
              <p className="mt-1 text-sm text-theme-muted">
                Plan your equipment package instantly according to your floor space in Delhi NCR.
              </p>
            </div>

            <div className="rounded-2xl border border-gold/40 bg-gold/10 p-4 text-right">
              <span className="text-xs uppercase tracking-wider font-medium text-gold">Estimated Equipment Package</span>
              <p className="text-2xl sm:text-3xl font-bold text-theme-text mt-1">{formattedEstimate}</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-theme-muted mb-3">
                  1. Select Setup Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {SETUP_TYPES.map((type) => (
                    <button key={type.id} onClick={() => setSelectedType(type.id)} className={`rounded-xl border p-3 text-left transition-all ${selectedType === type.id ? "border-gold bg-gold/15 text-theme-text shadow-md shadow-gold/10" : "border-theme-border bg-theme-surface text-theme-muted hover:border-gold/50"}`}  >
                      <p className="text-xs font-semibold">{type.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-theme-muted">
                    2. Floor Area (Sq Ft)
                  </label>
                  <span className="text-sm font-bold text-gold">{sqft} sq ft</span>
                </div>
                <input type="range" min="200" max="5000" step="50" value={sqft} onChange={(e) => setSqft(Number(e.target.value))} className="w-full h-2 rounded-lg bg-theme-border appearance-none cursor-pointer accent-gold" />
                <div className="flex justify-between text-[10px] text-theme-muted mt-1">
                  <span>200 sq ft (Compact Studio)</span>
                  <span>5,000 sq ft (Mega Commercial)</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-theme-border bg-theme-surface p-6 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gold flex items-center gap-1.5">
                  <Sparkles size={14} /> Recommended Layout Mix
                </h4>
                <p className="text-sm font-medium text-theme-text mt-2 leading-relaxed">
                  {currentType.recommended}
                </p>

                <ul className="mt-4 space-y-2 text-xs text-theme-muted">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-gold" /> Free 3D Floor Layout & CAD Plan
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-gold" /> Includes On-Site Assembly & Rigging
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-gold" /> Delhi Direct Manufacturer Warranty
                  </li>
                </ul>
              </div>

              <a href={`https://wa.me/${phone.replace(/\\D/g, "")}?text=${whatsappMessage}`} target="_blank" rel="noreferrer" className="mt-6 flex items-center justify-center gap-2.5 rounded-xl bg-gold px-6 py-3.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.02] shadow-lg shadow-gold/20" >
                <MessageSquare size={16} />
                Get Itemized Quote on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

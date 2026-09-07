"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { ModelIcon } from "@/components/ui/CategoryIcons";
import { ModelKind } from "@/lib/types";

export interface CardProduct {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  specialFeature: string;
  modelKind?: ModelKind;
  featured?: boolean;
  colorwayBody?: string;
  colorwayAccent?: string;
  colorway?: {
    body: string;
    accent: string;
  };
  imageUrl?: string | null;
}

export default function ProductCard({ product }: { product: CardProduct }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const bodyColor = product.colorwayBody ?? product.colorway?.body ?? "#1c1c1f";
  const accentColor = product.colorwayAccent ?? product.colorway?.accent ?? "#e2b13c";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -6, y: px * 8 });
  };

  const reset = () => setTilt({ x: 0, y: 0 });

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={reset}
        animate={{ rotateX: tilt.x, rotateY: tilt.y, y: tilt.x !== 0 || tilt.y !== 0 ? -4 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        style={{ transformStyle: "preserve-3d", perspective: 800 }}
        className="overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-sm transition-shadow duration-300 group-hover:shadow-xl"
      >
        <div
          className="relative flex aspect-4/3 items-center justify-center overflow-hidden"
          style={{
            background: `radial-gradient(120% 120% at 30% 20%, ${accentColor}22, transparent 60%), linear-gradient(160deg, ${bodyColor}, #2c2c2f)`,
          }}
        >
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <ModelIcon
              kind={product.modelKind}
              className="h-24 w-24 text-white/90 transition-transform duration-500 group-hover:scale-110"
            />
          )}
          {product.featured && (
            <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-[11px] font-medium text-ink">
              Featured
            </span>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-semibold text-ink">{product.name}</h3>
              <p className="mt-1 text-sm text-steel">{product.tagline}</p>
            </div>
            <ArrowUpRight size={18} className="mt-1 shrink-0 text-steel transition-colors group-hover:text-gold-deep" />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-ink/8 pt-3 text-xs text-steel">
            <span>{product.specialFeature}</span>
            <span className="font-medium text-ink">View details</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

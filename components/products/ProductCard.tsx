"use client";
import clsx from "clsx";
import Link from "next/link";
import { useRef } from "react";
import { ModelKind } from "@/lib/types";
import { ArrowUpRight } from "lucide-react";
import { ModelIcon } from "@/components/ui/CategoryIcons";
import { motion, useMotionValue, useSpring, useTransform, type Transition } from "motion/react";

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

interface ProductCardProps {
  product: CardProduct;
  view?: "grid" | "list";
}

const layoutTransition: Transition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.35,
};

export default function ProductCard({ product, view = "grid" }: ProductCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), { stiffness: 260, damping: 20 });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-7, 7]), { stiffness: 260, damping: 20 });
  const lift = useSpring(0, { stiffness: 260, damping: 20 });
  const bodyColor = product.colorwayBody ?? product.colorway?.body ?? "#1c1c1f";
  const accentColor = product.colorwayAccent ?? product.colorway?.accent ?? "#e2b13c";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
    lift.set(-4);
  };

  const reset = () => { px.set(0); py.set(0); lift.set(0); };

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <motion.div ref={ref} layout transition={layoutTransition} onMouseMove={handleMouseMove} onMouseLeave={reset} style={{ transformStyle: "preserve-3d", perspective: 800, rotateX, rotateY, y: lift }}
        className={clsx("overflow-hidden rounded-xl border border-theme-border bg-theme-card backdrop-blur-md shadow-lg transition-[border-color,box-shadow] duration-300 group-hover:border-gold/50 group-hover:shadow-2xl group-hover:shadow-gold/10", view === "list" && "flex")}>
        <motion.div layout transition={layoutTransition} className={clsx("relative flex items-center justify-center overflow-hidden", view === "list" ? "aspect-square w-36 shrink-0 sm:w-48" : "aspect-4/3")} style={{ background: `radial-gradient(120% 120% at 30% 20%, ${accentColor}33, transparent 60%), linear-gradient(160deg, ${bodyColor}, #121215)` }}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className={clsx("text-white/90 transition-transform duration-500 group-hover:scale-110", view === "list" ? "h-14 w-14" : "h-24 w-24")}>
              <ModelIcon kind={product.modelKind} className="w-full h-full" />
            </div>
          )}
          {product.featured && (
            <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-[11px] font-medium text-ink">
              Featured
            </span>
          )}
        </motion.div>

        <motion.div layout transition={layoutTransition} className={clsx("flex flex-col", view === "list" ? "flex-1 justify-between p-5" : "min-h-44 p-5")} >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-bold text-theme-text group-hover:text-gold transition-colors">{product.name}</h3>
              <p className={clsx("mt-1 text-xs text-theme-muted", view === "grid" && "line-clamp-2")}>{product.tagline}</p>
            </div>
            <ArrowUpRight size={18} className="mt-1 shrink-0 text-theme-muted transition-colors group-hover:text-gold" />
          </div>
          <div className={clsx("flex items-center justify-between border-t border-theme-border pt-3 text-xs text-theme-muted", view === "list" ? "mt-3" : "mt-auto")}>
            <span className="truncate pr-2">{product.specialFeature}</span>
            <span className="font-semibold text-gold shrink-0">View details</span>
          </div>
        </motion.div>
      </motion.div>
    </Link>
  );
}

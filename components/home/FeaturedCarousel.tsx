"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container, SectionHeading, Button } from "@/components/ui/Primitives";
import ProductCard, { type CardProduct } from "@/components/products/ProductCard";

interface FeaturedCarouselProps {
  products: CardProduct[];
}

export default function FeaturedCarousel({ products }: FeaturedCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => scrollerRef.current?.scrollBy({ left: dir * 340, behavior: "smooth" });

  if (products.length === 0) return null;

  return (
    <section className="border-y border-ink/8 bg-white py-20 sm:py-24">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Featured this month"
            title="Our most requested equipment"
            description="A shortlist pulled from what studios and home gyms across Delhi are asking for right now."
          />
          <div className="flex gap-2">
            <button onClick={() => scroll(-1)} aria-label="Scroll left"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink/40">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => scroll(1)} aria-label="Scroll right"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink/40">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <motion.div ref={scrollerRef} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
          {products.map((product) => (
            <div key={product.id} className="w-75 shrink-0 snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </motion.div>

        <div className="mt-10 text-center">
          <Button href="/products" variant="ghost">View the full catalog</Button>
        </div>
      </Container>
    </section>
  );
}

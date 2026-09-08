"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { CategoryIcon } from "@/components/ui/CategoryIcons";
import { Container } from "@/components/ui/Primitives";

interface DbCategory {
  id: string;
  name: string;
  blurb: string;
}

interface CategoryNavProps {
  categories: DbCategory[];
}

export default function CategoryNav({ categories }: CategoryNavProps) {
  return (
    <section className="relative bg-theme-surface py-24 sm:py-28 border-t border-theme-border">
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-gold">Equipment Series</span>
            <h2 className="mt-2 font-display text-3xl font-bold text-theme-surface-text sm:text-4xl">
              Browse by Specialty Category
            </h2>
          </div>
          <p className="max-w-md text-sm text-theme-surface-muted">
            From heavy selectorized pin-loaded stacks to plate-loaded hammer lines and custom power racks.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link
                href="/products"
                className="group relative flex h-full flex-col justify-between rounded-2xl border border-theme-border bg-theme-bg p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:bg-theme-surface-hover hover:shadow-xl hover:shadow-gold/10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold border border-gold/20 transition-transform group-hover:scale-110">
                    <CategoryIcon category={c.id} className="h-6 w-6" />
                  </div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-theme-border text-theme-muted transition-colors group-hover:bg-gold group-hover:text-ink">
                    <ArrowUpRight size={16} />
                  </span>
                </div>
                <div className="mt-8">
                  <p className="font-display text-lg font-bold text-theme-surface-text group-hover:text-gold transition-colors">{c.name}</p>
                  <p className="mt-2 text-xs leading-relaxed text-theme-surface-muted line-clamp-3">{c.blurb}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

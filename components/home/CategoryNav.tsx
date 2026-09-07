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
    <section className="py-20 sm:py-24">
      <Container>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <Link
                href="/products"
                className="group flex h-full flex-col justify-between rounded-2xl border border-ink/8 bg-white p-6 transition-colors hover:border-gold/50"
              >
                <div className="flex items-center justify-between">
                  <CategoryIcon category={c.id} className="h-8 w-8 text-ink transition-colors group-hover:text-gold-deep" />
                  <ArrowUpRight size={16} className="text-steel/50 transition-colors group-hover:text-gold-deep" />
                </div>
                <div className="mt-8">
                  <p className="font-display text-base font-semibold text-ink">{c.name}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-steel">{c.blurb}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
